-- ============================================================
-- 0004_billing.sql — direct betalen (Mollie) + staffel + trial
--
-- Model:
--  * Elke vacature: 14 dagen gratis proefperiode, daarna maandelijks
--    gefactureerd op de eigen cyclus (anker = einde proefperiode).
--  * Werkgever kiest betaalwijze: 'incasso' (Mollie-mandaat) of
--    'factuur' (14 dagen betaaltermijn).
--  * Staffel over het totaal aantal actieve vacatures wordt op het
--    moment van factureren berekend (lib/pricing.ts is de bron).
--  * Vacature offline (status 'archived') => geen nieuwe charges.
--
-- Idempotent — veilig om opnieuw te draaien.
-- ============================================================

-- ---------- employers: betaalwijze + Mollie-koppeling ----------
alter table if exists public.employers
  add column if not exists billing_method text
    check (billing_method in ('incasso', 'factuur')),
  add column if not exists mollie_customer_id text,
  add column if not exists mollie_mandate_status text not null default 'none'
    check (mollie_mandate_status in ('none', 'pending', 'valid', 'failed', 'revoked'));

-- ---------- vacancies: trial + maandcyclus ----------
alter table if exists public.vacancies
  add column if not exists trial_ends_at timestamptz,
  add column if not exists next_charge_at timestamptz,
  add column if not exists billing_status text not null default 'trial'
    check (billing_status in ('trial', 'active', 'past_due', 'stopped'));

-- Backfill bestaande vacatures: proefperiode vanaf plaatsingsdatum.
update public.vacancies
set
  trial_ends_at = coalesce(listing_started_at, created_at) + interval '14 days',
  next_charge_at = greatest(
    coalesce(listing_started_at, created_at) + interval '14 days',
    now()
  )
where trial_ends_at is null;

-- Gearchiveerde vacatures factureren nooit meer.
update public.vacancies
set billing_status = 'stopped'
where status = 'archived' and billing_status <> 'stopped';

-- ---------- invoices: incasso-metadata + regelspecificatie ----------
-- (tabel bestaat al; alleen kolommen toevoegen)
alter table if exists public.invoices
  add column if not exists type text not null default 'factuur'
    check (type in ('incasso', 'factuur')),
  add column if not exists mollie_payment_id text,
  add column if not exists lines jsonb,
  add column if not exists description text;

create index if not exists invoices_mollie_payment_idx
  on public.invoices (mollie_payment_id)
  where mollie_payment_id is not null;

create index if not exists vacancies_next_charge_idx
  on public.vacancies (next_charge_at)
  where billing_status in ('trial', 'active', 'past_due');

-- ---------- factuurnummer-reeks ----------
-- Doorlopende nummering KLOK-2026-00001 — via sequence, race-vrij.
create sequence if not exists public.invoice_number_seq;

create or replace function public.next_invoice_number()
returns text
language sql
volatile
as $$
  select 'KLOK-' || to_char(now(), 'YYYY') || '-' ||
         lpad(nextval('public.invoice_number_seq')::text, 5, '0');
$$;
