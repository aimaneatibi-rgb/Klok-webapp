-- ============================================================================
-- 0001_crm.sql
-- CRM-laag op de admin: notities, activity-timeline, prospects (leads zonder
-- account), funnel-stadium per klant/werknemer, next-action, UTM-attributie.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Funnel-stadium + sales-velden op employers + employees
-- ---------------------------------------------------------------------------

-- Toegestane funnel-waardes:
--   prospect   = lead, nog niet actief op het platform
--   onboarding = account aangemaakt, in opstartfase
--   active     = heeft minimaal één shift/vacature gedaan
--   dormant    = >30 dagen geen activiteit
--   churned    = account verwijderd of inactief gemarkeerd
-- We gebruiken TEXT met CHECK constraint i.p.v. ENUM — makkelijker uitbreiden.

ALTER TABLE employers
  ADD COLUMN IF NOT EXISTS funnel_stage TEXT
    DEFAULT 'onboarding'
    CHECK (funnel_stage IN ('prospect', 'onboarding', 'active', 'dormant', 'churned')),
  ADD COLUMN IF NOT EXISTS next_action TEXT,
  ADD COLUMN IF NOT EXISTS next_action_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS funnel_stage TEXT
    DEFAULT 'onboarding'
    CHECK (funnel_stage IN ('prospect', 'onboarding', 'active', 'dormant', 'churned')),
  ADD COLUMN IF NOT EXISTS next_action TEXT,
  ADD COLUMN IF NOT EXISTS next_action_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

CREATE INDEX IF NOT EXISTS employers_funnel_stage_idx ON employers (funnel_stage);
CREATE INDEX IF NOT EXISTS employers_next_action_due_idx ON employers (next_action_due_at)
  WHERE next_action_due_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS employees_funnel_stage_idx ON employees (funnel_stage);
CREATE INDEX IF NOT EXISTS employees_next_action_due_idx ON employees (next_action_due_at)
  WHERE next_action_due_at IS NOT NULL;


-- ---------------------------------------------------------------------------
-- 2. crm_notes — vrije notities per klant/werknemer/prospect
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS crm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('employer', 'employee', 'prospect')),
  target_id UUID NOT NULL,
  body TEXT NOT NULL,
  author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crm_notes_target_idx ON crm_notes (target_type, target_id, created_at DESC);


-- ---------------------------------------------------------------------------
-- 3. crm_activities — timeline events per klant/werknemer/prospect
-- ---------------------------------------------------------------------------
-- 'kind' beschrijft het soort event. Vrij uitbreidbaar; lijst hieronder is
-- een startset, maar niet enforced — we gebruiken bewust geen CHECK constraint
-- omdat nieuwe event-types makkelijk toegevoegd moeten kunnen worden.
--
-- Startset:
--   note            — handmatige notitie (gekoppeld aan crm_notes.id via metadata)
--   call_out        — uitgaand telefoongesprek (admin → klant)
--   call_in         — inkomend telefoongesprek (klant → admin)
--   email_out       — uitgaande mail
--   email_in        — inkomende mail
--   meeting         — meeting / videocall
--   signup          — account aangemaakt (auto)
--   shift_posted    — eerste shift geplaatst (auto)
--   vacancy_posted  — eerste vacature geplaatst (auto)
--   invoice_sent    — factuur verstuurd (auto)
--   invoice_paid    — factuur betaald (auto)
--   support_ticket  — ticket ingediend (auto)
--   stage_change    — funnel_stage gewijzigd (auto)
--   custom          — vrije category

CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('employer', 'employee', 'prospect')),
  target_id UUID NOT NULL,
  kind TEXT NOT NULL,
  summary TEXT NOT NULL,
  details TEXT,
  metadata JSONB,
  author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crm_activities_target_idx ON crm_activities (target_type, target_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS crm_activities_kind_idx ON crm_activities (kind, occurred_at DESC);


-- ---------------------------------------------------------------------------
-- 4. crm_prospects — leads die nog géén account hebben
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS crm_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'employer'
    CHECK (type IN ('employer', 'employee')),
  company_name TEXT,
  contact_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  sector TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'unresponsive', 'dead')),
  source TEXT,
  notes TEXT,
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  last_contact_at TIMESTAMPTZ,
  converted_employer_id UUID REFERENCES employers(id) ON DELETE SET NULL,
  converted_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crm_prospects_status_idx ON crm_prospects (status, created_at DESC);
CREATE INDEX IF NOT EXISTS crm_prospects_owner_idx ON crm_prospects (owner_user_id);
CREATE INDEX IF NOT EXISTS crm_prospects_email_idx ON crm_prospects (lower(email));


-- ---------------------------------------------------------------------------
-- 5. updated_at trigger op crm_notes en crm_prospects
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS crm_notes_set_updated_at ON crm_notes;
CREATE TRIGGER crm_notes_set_updated_at
  BEFORE UPDATE ON crm_notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS crm_prospects_set_updated_at ON crm_prospects;
CREATE TRIGGER crm_prospects_set_updated_at
  BEFORE UPDATE ON crm_prospects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ---------------------------------------------------------------------------
-- 6. Row Level Security — CRM-tabellen zijn admin-only
-- ---------------------------------------------------------------------------

ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_prospects ENABLE ROW LEVEL SECURITY;

-- Helper: is current user an admin?
-- (Past goed in een centrale helper later. Voor nu: inline.)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND user_type = 'admin'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- crm_notes: alleen admins
DROP POLICY IF EXISTS crm_notes_admin_all ON crm_notes;
CREATE POLICY crm_notes_admin_all ON crm_notes
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- crm_activities: alleen admins (auto-inserts gaan via SECURITY DEFINER triggers later)
DROP POLICY IF EXISTS crm_activities_admin_all ON crm_activities;
CREATE POLICY crm_activities_admin_all ON crm_activities
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- crm_prospects: alleen admins
DROP POLICY IF EXISTS crm_prospects_admin_all ON crm_prospects;
CREATE POLICY crm_prospects_admin_all ON crm_prospects
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
