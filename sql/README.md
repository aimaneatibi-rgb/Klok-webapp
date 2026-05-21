# SQL migrations

Database-schema en wijzigingen voor de Klok-webapp Supabase database.

## Conventie

- Bestanden zijn genummerd: `NNNN_doel.sql`
- Lager nummer eerst runnen
- Migrations zijn **forward-only** — geen rollback-scripts; nieuwe wijzigingen krijgen een nieuw nummer
- Elk bestand is **idempotent waar mogelijk** (gebruik `IF NOT EXISTS`, `CREATE OR REPLACE`)

## Hoe runnen in Supabase

1. Open je Supabase project → **SQL Editor** → **New query**
2. Plak de inhoud van het migration-bestand
3. Klik **Run**
4. Bij succes: de query is in de migration-history van je editor opgeslagen

## Migration-overzicht

| Bestand | Wat |
|---|---|
| `0000_baseline.sql` (TODO) | Snapshot van het huidige schema. Maak dit met `supabase db dump --schema public` of via Dashboard → Database → Backups |
| `0001_crm.sql` | CRM-laag: notes, activities, prospects, funnel-stadium, next-action, UTM-velden |

## Baseline genereren (eenmalig, voor productiehygiëne)

Op dit moment leeft het schema alleen in Supabase. Om het onder versiecontrole te zetten:

**Optie A — Supabase CLI (aanbevolen):**
```bash
npm install -g supabase
supabase login
supabase link --project-ref <jouw-project-ref>
supabase db dump --schema public > sql/0000_baseline.sql
```

**Optie B — Dashboard:**
1. Supabase Dashboard → **Database** → **Backups** of **Schema visualizer**
2. Export schema (zonder data) als `.sql`
3. Plaats in `sql/0000_baseline.sql`

Commit dit bestand en breid `sql/` aan met nieuwe migrations voor elke volgende wijziging.
