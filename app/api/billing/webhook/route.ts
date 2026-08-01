import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPayment, hasValidMandate, mollieEnabled } from "@/lib/mollie";

/**
 * POST /api/billing/webhook — Mollie webhook.
 *
 * Mollie stuurt alleen een payment-id; verificatie = het payment
 * opnieuw ophalen bij Mollie zelf (aanbevolen werkwijze).
 *
 *  metadata.kind = "mandaat"  → verificatiebetaling: mandaatstatus bijwerken
 *  metadata.kind = "incasso"  → maandincasso: factuurstatus bijwerken
 *
 * Altijd 200 teruggeven zodat Mollie niet oneindig blijft retryen;
 * fouten loggen we server-side.
 */
export async function POST(req: Request) {
  if (!mollieEnabled()) {
    return NextResponse.json({ ok: true, demo: true });
  }

  let paymentId: string | null = null;
  try {
    const form = await req.formData();
    paymentId = (form.get("id") as string) ?? null;
  } catch {
    // geen form-body
  }
  if (!paymentId) return NextResponse.json({ ok: true });

  try {
    const payment = await getPayment(paymentId);
    const admin = createAdminClient();
    const kind = payment.metadata?.kind;

    if (kind === "mandaat") {
      const employerId = payment.metadata?.employer_id;
      if (!employerId) return NextResponse.json({ ok: true });

      let status = "pending";
      if (payment.status === "paid" && payment.customerId) {
        const valid = await hasValidMandate(payment.customerId);
        status = valid ? "valid" : "pending";
      } else if (
        payment.status === "failed" ||
        payment.status === "canceled" ||
        payment.status === "expired"
      ) {
        status = "failed";
      }

      await admin
        .from("employers")
        .update({ mollie_mandate_status: status })
        .eq("id", employerId);
    }

    if (kind === "incasso") {
      const invoiceId = payment.metadata?.invoice_id;
      if (!invoiceId) return NextResponse.json({ ok: true });

      if (payment.status === "paid") {
        await admin
          .from("invoices")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            paid_via: "sepa_dd",
          })
          .eq("id", invoiceId);
      } else if (
        payment.status === "failed" ||
        payment.status === "canceled" ||
        payment.status === "expired"
      ) {
        // Incasso mislukt/gestorneerd → factuur open laten staan als
        // 'overdue' zodat de werkgever 'm alsnog handmatig kan betalen.
        await admin
          .from("invoices")
          .update({ status: "overdue" })
          .eq("id", invoiceId)
          .neq("status", "paid");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[billing/webhook]", e);
    return NextResponse.json({ ok: true });
  }
}
