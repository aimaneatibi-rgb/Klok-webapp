# Vacature-billing — Mollie-incasso, factuur & staffel

> Status: **GEBOUWD (2026-08-01)** — Mollie-ready; draait in demo-mode
> (gesimuleerde incasso) tot `MOLLIE_API_KEY` gezet is.

## Het model

- **14 dagen gratis proefperiode per vacature** (`TRIAL_DAYS` in
  [`lib/pricing.ts`](../lib/pricing.ts)). Offline vóór het einde = € 0.
- Daarna **maandelijks, ex btw, met staffel over ál je actieve vacatures**:
  | Actieve vacatures | Tarief p/vacature p/mnd |
  |---|---|
  | 1 | € 195 |
  | 2–3 | € 175 |
  | 4+ | € 149 |
- **Betaalwijze per werkgever**: `incasso` (Mollie-mandaat) of `factuur`
  (14 dagen betaaltermijn). Keuze in Dashboard → Betaalmethodes.
- **Eigen maandcyclus per vacature** (anker = einde proefperiode). Een extra
  vacature krijgt haar eigen proefperiode en wordt daarna automatisch
  meegenomen in de eerstvolgende run — direct geïncasseerd of gefactureerd.
- **Offline halen (archiveren) stopt de betaling** — `billing_status:
  'stopped'`, geen nieuwe maand. Geen restitutie voor een al gestarte maand.

## Architectuur

| Onderdeel | Bestand |
|---|---|
| Prijzen/staffel/trial | `lib/pricing.ts` |
| Mollie-client (fetch, dependency-vrij) | `lib/mollie.ts` |
| Billing-engine | `lib/billing.ts` |
| Betaalwijze kiezen + mandaatflow | `POST /api/billing/method` |
| Mollie-webhook (mandaat + incasso) | `POST /api/billing/webhook` |
| Facturatie-run (cron, dagelijks 06:00 via vercel.json) | `GET/POST /api/billing/run` |
| Service-role client | `lib/supabase/admin.ts` |
| Migratie | `sql/0004_billing.sql` |

Flow incasso: werkgever kiest "Automatische incasso" → Mollie customer +
first payment € 0,01 (hosted checkout) → webhook zet mandaat op `valid` →
elke run maakt per werkgever één verzamelfactuur en int via
`sequenceType: recurring`; de webhook zet de factuur op `paid` (stornering →
`overdue`, werkgever kan alsnog handmatig betalen).

Flow factuur: run maakt dezelfde verzamelfactuur met `due_date` +14 dagen;
betalen via de bestaande facturen-pagina.

Triggers: **lazy run** bij bezoek aan Dashboard → Facturen (direct actueel) +
**dagelijkse cron** als vangnet. Beide zijn idempotent: een vacature wordt
pas opnieuw gefactureerd als haar `next_charge_at` weer verstreken is.

## Livegang-checklist

1. `sql/0004_billing.sql` draaien in de Supabase SQL Editor.
2. Env vars in Vercel: `MOLLIE_API_KEY` (eerst test_), `SUPABASE_SERVICE_ROLE_KEY`,
   `BILLING_RUN_SECRET` (of `CRON_SECRET`), `NEXT_PUBLIC_SITE_URL`.
3. Testbetaling: betaalwijze → incasso → € 0,01 via test-iDEAL → mandaat
   `valid` in employers-tabel → vacature met verlopen `next_charge_at` →
   facturen-pagina openen → factuur + gesimuleerde/echte incasso.
4. Samenwerkingsovereenkomst is v1.1 (nieuw prijsmodel) — **juridische
   hercheck aanbevolen** (v1.0 was goedgekeurd 2026-05-22).
5. Later: Moneybird-koppeling voor de boekhouding (facturen zitten nu in de
   eigen `invoices`-tabel; PDF/boekhoudexport is een vervolg).
