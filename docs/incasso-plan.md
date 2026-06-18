# SEPA automatische incasso — implementatieplan

> Status: **plan, nog niet gebouwd.** De €195-incasso staat overal correct als
> tekst/UX, maar er wordt nog geen geld geïncasseerd. Dit document beschrijft
> hoe we dat werkend maken.

## Doel

Maandelijkse SEPA-incasso van **€195 ex btw per actieve vacature**, via
automatische incasso. De **eerste 50 dagen na launch zijn gratis** (geen
incasso) — zie `CLIENT_BILLING_STARTS_AT` en `isClientBillingActive()` in
[`lib/feature-flags.ts`](../lib/feature-flags.ts).

## Gekozen route: Mollie recurring + Moneybird

- **Mollie** doet het incasseren (mandaat online afgeven + maandelijkse SEPA
  Direct Debit + retries bij stornering + webhooks). Zit al half in het project.
- **Moneybird** doet de administratie (facturen, btw 21%, boekhouding). Mollie
  ↔ Moneybird-koppeling bestaat.

Reden boven boekhoud-only incasso: we willen een strakke self-service flow waar
de opdrachtgever bij plaatsen online een mandaat afgeeft, niet een batchgewijs
pain.008-bestand dat handmatig bij de bank moet.

## Flow

1. **Mandaat vastleggen** (eenmalig, bij eerste plaatsing of bij aanmelden):
   Mollie vereist een *first payment* (`sequenceType: first`, bv. via iDEAL,
   eventueel €0,01 verificatie) om een geldig mandaat voor recurring SEPA te
   krijgen. Resultaat: `mollie_customer_id` + `mollie_mandate_id`.
2. **Abonnement per vacature**: elke vacature = één Mollie *subscription* van
   €195/maand, `startDate = max(CLIENT_BILLING_STARTS_AT, plaatsingsdatum)`.
   Zo respecteert de incasso automatisch de 50-dagen-gratis-periode.
3. **Maandelijkse incasso**: Mollie int automatisch; stuurt webhook per betaling.
4. **Opzeggen**: vacature verwijderen → bijbehorende subscription cancellen.
5. **Boekhouding**: per betaalde incasso een factuur in Moneybird (btw 21%).

## Datamodel (nieuwe migratie, bv. `sql/0004_billing.sql`)

- `employers`: `mollie_customer_id`, `mollie_mandate_id`, `mandate_status`
- `vacancies`: `mollie_subscription_id`, `billing_status`
  (`free` | `active` | `past_due` | `cancelled`)
- nieuw `payments`: `id`, `employer_id`, `vacancy_id`, `mollie_payment_id`,
  `amount_cents`, `status`, `period_start`, `period_end`, `moneybird_invoice_id`

## API-routes (nieuw onder `app/api/payments/`)

- `POST /api/payments/mandate` — maak Mollie customer + first payment, redirect
  naar Mollie checkout.
- `POST /api/payments/subscription` — maak/cancel subscription per vacature.
- `POST /api/payments/webhook` — Mollie webhook: betaling betaald/mislukt →
  update `payments` + `vacancies.billing_status` + factuur in Moneybird.

Inhaken in [`new-vacancy-form.tsx`](../app/dashboard/vacatures/new/new-vacancy-form.tsx):
tijdens gratis-periode alleen vacature aanmaken (modal toont al "gratis"); zodra
billing actief is of bij eerste betaalde plaatsing → mandaat-flow starten.

## Env / secrets (nog nodig van jou)

- `MOLLIE_API_KEY` (test eerst, dan live)
- `MONEYBIRD_API_TOKEN` + `MONEYBIRD_ADMINISTRATION_ID`

Webhook-verificatie bij Mollie: niet via secret maar door het betaal-id opnieuw
op te halen bij Mollie in de webhook-handler.

## Btw & juridisch

- €195 **ex** btw → factuur met 21% btw (= €235,95 incl.). Moneybird rekent btw.
- SEPA-mandaat vereist. Standaard **CORE** (8 weken terugboekrecht) is het
  eenvoudigst; **B2B** (geen terugboekrecht) kan voor zakelijke opdrachtgevers
  maar vereist mandaatregistratie bij de bank. Mollie gebruikt standaard CORE.
- Machtigingstekst staat al deels in de samenwerkingsovereenkomst
  ([`sign-form.tsx`](../app/dashboard/overeenkomst/sign-form.tsx)); juridisch
  laten checken vóór live.

## Wat ik nodig heb om te bouwen

1. Mollie **test** API-key.
2. Moneybird token + administration-id (mag later; Mollie eerst).
3. Akkoord op bovenstaand datamodel.

Daarna bouw ik het in deze volgorde: migratie → mandaat-flow → subscription per
vacature → webhook + statusupdate → Moneybird-facturen.
