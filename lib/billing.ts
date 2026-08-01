// ============================================================
// Billing-engine (server-only) — maandelijkse vacature-facturatie
//
// Werking per werkgever:
//  1. Zoek vacatures waarvan de volgende factuurdatum verstreken is
//     (proefperiode voorbij, status open/paused, niet gestopt).
//  2. Bepaal het staffeltarief over ALLE betalende actieve vacatures.
//  3. Maak één factuur voor alle verschuldigde vacatures samen.
//  4. Betaalwijze 'incasso' → Mollie-incasso op het mandaat
//     (webhook zet de factuur daarna op betaald).
//     Betaalwijze 'factuur' → factuur met 14 dagen betaaltermijn.
//  5. Schuif de maandcyclus van elke vacature één maand op.
//
// Vacature offline (archived) => billing_status 'stopped' => nooit
// meer meegenomen. Extra vacature => eigen proefperiode => daarna
// automatisch in de eerstvolgende run geïncasseerd/gefactureerd.
//
// Triggers: lazy bij dashboard-bezoek (facturen-pagina) + het
// beveiligde cron-endpoint POST /api/billing/run.
// ============================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  INVOICE_TERM_DAYS,
  eur,
  feePerVacancyCents,
  vatCents,
} from "./pricing";
import { createRecurringPayment, mollieEnabled } from "./mollie";

type BillableVacancy = {
  id: string;
  title: string;
  status: string;
  billing_status: string;
  trial_ends_at: string | null;
  next_charge_at: string | null;
};

type EmployerBillingRow = {
  id: string;
  company_name: string;
  billing_method: "incasso" | "factuur" | null;
  mollie_customer_id: string | null;
  mollie_mandate_status: string;
};

export type BillingRunResult = {
  employerId: string;
  invoiceId?: string;
  invoiceNumber?: string;
  chargedVacancies: number;
  totalCents: number;
  method: "incasso" | "factuur";
  simulated: boolean;
  skipped?: string;
};

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.klokworks.nl";
}

/** Volgende maandcyclus: zelfde dag volgende maand, doorgeschoven tot in de toekomst. */
function advanceOneMonth(fromIso: string): Date {
  const d = new Date(fromIso);
  do {
    d.setMonth(d.getMonth() + 1);
  } while (d <= new Date());
  return d;
}

/**
 * Draai de facturatie voor één werkgever. Geen verschuldigde
 * vacatures = no-op. Idempotent per cyclus: elke vacature wordt pas
 * opnieuw gefactureerd als haar next_charge_at weer verstreken is.
 */
export async function runBillingForEmployer(
  admin: SupabaseClient,
  employer: EmployerBillingRow
): Promise<BillingRunResult> {
  const nowIso = new Date().toISOString();
  const method: "incasso" | "factuur" = employer.billing_method ?? "factuur";

  // 1) Alle actieve (niet-gestopte) vacatures van deze werkgever
  const { data: actives, error: activesErr } = await admin
    .from("vacancies")
    .select("id, title, status, billing_status, trial_ends_at, next_charge_at")
    .eq("employer_id", employer.id)
    .in("status", ["open", "paused"])
    .neq("billing_status", "stopped");

  if (activesErr) throw new Error(`vacatures ophalen: ${activesErr.message}`);

  const all = (actives ?? []) as BillableVacancy[];
  const due = all.filter(
    (v) => v.next_charge_at !== null && v.next_charge_at <= nowIso
  );
  if (due.length === 0) {
    return {
      employerId: employer.id,
      chargedVacancies: 0,
      totalCents: 0,
      method,
      simulated: false,
      skipped: "niets verschuldigd",
    };
  }

  // 2) Staffel over alle BETALENDE actieve vacatures (proefperiode voorbij)
  const payingCount = all.filter(
    (v) => v.trial_ends_at !== null && v.trial_ends_at <= nowIso
  ).length;
  const fee = feePerVacancyCents(Math.max(payingCount, due.length));

  const subtotal = fee * due.length;
  const vat = vatCents(subtotal);
  const total = subtotal + vat;

  // 3) Factuurnummer + factuur aanmaken
  const { data: numData, error: numErr } = await admin.rpc(
    "next_invoice_number"
  );
  if (numErr) throw new Error(`factuurnummer: ${numErr.message}`);
  const invoiceNumber = numData as string;

  const dueDate = new Date();
  if (method === "factuur") {
    dueDate.setDate(dueDate.getDate() + INVOICE_TERM_DAYS);
  }

  const lines = due.map((v) => ({
    vacancy_id: v.id,
    title: v.title,
    fee_cents: fee,
    period_start: v.next_charge_at,
  }));

  const { data: invoice, error: invErr } = await admin
    .from("invoices")
    .insert({
      employer_id: employer.id,
      invoice_number: invoiceNumber,
      period_month: new Date().toISOString().slice(0, 8) + "01",
      subtotal_cents: subtotal,
      vat_cents: vat,
      total_cents: total,
      status: "sent",
      due_date: dueDate.toISOString(),
      type: method,
      lines,
      description: `${due.length} vacature${due.length === 1 ? "" : "s"} · ${eur(
        fee
      )}/mnd per vacature (staffel over ${Math.max(payingCount, due.length)})`,
    })
    .select("id")
    .single();

  if (invErr) throw new Error(`factuur aanmaken: ${invErr.message}`);

  let simulated = false;

  // 4) Incasso via Mollie (of simulatie zonder API-key)
  if (method === "incasso") {
    if (
      mollieEnabled() &&
      employer.mollie_customer_id &&
      employer.mollie_mandate_status === "valid"
    ) {
      const payment = await createRecurringPayment({
        customerId: employer.mollie_customer_id,
        amountCents: total,
        description: `KLOK ${invoiceNumber} — ${due.length} vacature${due.length === 1 ? "" : "s"}`,
        webhookUrl: `${siteUrl()}/api/billing/webhook`,
        metadata: { invoice_id: invoice.id, kind: "incasso" },
      });
      await admin
        .from("invoices")
        .update({ mollie_payment_id: payment.id })
        .eq("id", invoice.id);
      // Webhook zet 'm op paid zodra Mollie bevestigt.
    } else {
      // Demo/simulatie: markeer direct als betaald zodat de flow klopt.
      simulated = true;
      await admin
        .from("invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          paid_via: "sepa_dd",
        })
        .eq("id", invoice.id);
    }
  }

  // 5) Cyclus doorschuiven per gefactureerde vacature
  for (const v of due) {
    await admin
      .from("vacancies")
      .update({
        billing_status: "active",
        monthly_fee_cents: fee,
        next_charge_at: advanceOneMonth(v.next_charge_at!).toISOString(),
      })
      .eq("id", v.id);
  }

  return {
    employerId: employer.id,
    invoiceId: invoice.id,
    invoiceNumber,
    chargedVacancies: due.length,
    totalCents: total,
    method,
    simulated,
  };
}

/** Draai billing voor alle werkgevers met verschuldigde vacatures. */
export async function runBillingForAll(
  admin: SupabaseClient
): Promise<BillingRunResult[]> {
  const nowIso = new Date().toISOString();

  const { data: dueVacs, error } = await admin
    .from("vacancies")
    .select("employer_id")
    .in("status", ["open", "paused"])
    .neq("billing_status", "stopped")
    .lte("next_charge_at", nowIso);

  if (error) throw new Error(`due-scan: ${error.message}`);

  const employerIds = [...new Set((dueVacs ?? []).map((v) => v.employer_id))];
  if (employerIds.length === 0) return [];

  const { data: employers, error: empErr } = await admin
    .from("employers")
    .select(
      "id, company_name, billing_method, mollie_customer_id, mollie_mandate_status"
    )
    .in("id", employerIds);

  if (empErr) throw new Error(`werkgevers ophalen: ${empErr.message}`);

  const results: BillingRunResult[] = [];
  for (const emp of (employers ?? []) as EmployerBillingRow[]) {
    try {
      results.push(await runBillingForEmployer(admin, emp));
    } catch (e) {
      results.push({
        employerId: emp.id,
        chargedVacancies: 0,
        totalCents: 0,
        method: emp.billing_method ?? "factuur",
        simulated: false,
        skipped: `fout: ${e instanceof Error ? e.message : String(e)}`,
      });
    }
  }
  return results;
}

/**
 * Lazy-trigger: draai billing voor één werkgever als er iets
 * verschuldigd is. Faalt stil (bv. zonder service-key lokaal) —
 * het cron-endpoint is de betrouwbare route in productie.
 */
export async function lazyRunBilling(employerId: string): Promise<void> {
  try {
    const { createAdminClient } = await import("./supabase/admin");
    const admin = createAdminClient();
    const { data: employer } = await admin
      .from("employers")
      .select(
        "id, company_name, billing_method, mollie_customer_id, mollie_mandate_status"
      )
      .eq("id", employerId)
      .single();
    if (employer) {
      await runBillingForEmployer(admin, employer as EmployerBillingRow);
    }
  } catch {
    // Geen service-key of tijdelijke fout — cron pakt het op.
  }
}
