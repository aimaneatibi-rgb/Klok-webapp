import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runBillingForAll } from "@/lib/billing";

/**
 * POST /api/billing/run — maandelijkse facturatie-run (cron).
 *
 * Beveiligd met BILLING_RUN_SECRET (header `x-billing-secret` of
 * `authorization: Bearer <secret>` voor Vercel Cron).
 *
 * Idempotent: vacatures worden pas opnieuw gefactureerd wanneer hun
 * next_charge_at weer verstreken is — dubbel draaien kan geen kwaad.
 * Aanrader: dagelijkse Vercel Cron, dan loopt elke vacature-cyclus
 * maximaal één dag achter.
 */
// Vercel Cron roept GET aan (met `authorization: Bearer $CRON_SECRET`);
// handmatig/extern triggeren kan via POST met dezelfde secret.
export async function GET(req: Request) {
  return POST(req);
}

export async function POST(req: Request) {
  const secret =
    process.env.BILLING_RUN_SECRET ?? process.env.CRON_SECRET;
  const given =
    req.headers.get("x-billing-secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!secret || given !== secret) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const results = await runBillingForAll(admin);
    const charged = results.filter((r) => r.chargedVacancies > 0);
    return NextResponse.json({
      ok: true,
      employersProcessed: results.length,
      invoicesCreated: charged.length,
      totalCents: charged.reduce((s, r) => s + r.totalCents, 0),
      results,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Onbekende fout" },
      { status: 500 }
    );
  }
}
