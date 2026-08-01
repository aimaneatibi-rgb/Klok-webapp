import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createCustomer,
  createFirstPayment,
  mollieEnabled,
} from "@/lib/mollie";

/**
 * POST /api/billing/method — betaalwijze kiezen (ingelogde werkgever).
 *
 * body { action: "factuur" }        → betaalwijze = op factuur
 * body { action: "incasso" }        → betaalwijze = automatische incasso:
 *   met Mollie-key: maak customer + first payment (€ 0,01 verificatie)
 *   en geef de checkout-URL terug; de webhook zet het mandaat op 'valid'.
 *   zonder key (demo): mandaat direct op 'valid'.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { data: employer } = await supabase
    .from("employers")
    .select("id, company_name, mollie_customer_id")
    .eq("user_id", user.id)
    .single();
  if (!employer) {
    return NextResponse.json({ error: "Geen werkgever" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { action?: string };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.klokworks.nl";

  if (body.action === "factuur") {
    const { error } = await supabase
      .from("employers")
      .update({ billing_method: "factuur" })
      .eq("id", employer.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, method: "factuur" });
  }

  if (body.action === "incasso") {
    // Demo zonder Mollie-key: mandaat direct geldig.
    if (!mollieEnabled()) {
      const { error } = await supabase
        .from("employers")
        .update({
          billing_method: "incasso",
          mollie_mandate_status: "valid",
        })
        .eq("id", employer.id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, method: "incasso", demo: true });
    }

    // Echte Mollie-flow — schrijven via service-role (RLS-onafhankelijk).
    try {
      const admin = createAdminClient();

      let customerId = employer.mollie_customer_id;
      if (!customerId) {
        const customer = await createCustomer({
          name: employer.company_name,
          email: user.email ?? "",
          employerId: employer.id,
        });
        customerId = customer.id;
      }

      const payment = await createFirstPayment({
        customerId,
        amountCents: 1, // € 0,01 verificatiebetaling legt het mandaat vast
        description: "KLOK Works — machtiging automatische incasso",
        redirectUrl: `${siteUrl}/dashboard/betaalmethodes?mandaat=terug`,
        webhookUrl: `${siteUrl}/api/billing/webhook`,
        metadata: { kind: "mandaat", employer_id: employer.id },
      });

      await admin
        .from("employers")
        .update({
          billing_method: "incasso",
          mollie_customer_id: customerId,
          mollie_mandate_status: "pending",
        })
        .eq("id", employer.id);

      return NextResponse.json({
        ok: true,
        method: "incasso",
        checkoutUrl: payment._links?.checkout?.href ?? null,
      });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Mollie-fout" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Onbekende actie" }, { status: 400 });
}
