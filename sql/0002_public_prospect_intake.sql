-- ============================================================================
-- 0002_public_prospect_intake.sql
-- Sta anonieme inserts toe op crm_prospects, ALLEEN vanuit publieke
-- intake-formulieren (demo-aanvraag werkgevers, contact-form).
-- Veilig: enkel INSERT, geen SELECT/UPDATE/DELETE; status forced 'new';
-- source whitelisted.
-- ============================================================================

DROP POLICY IF EXISTS crm_prospects_public_insert ON crm_prospects;
CREATE POLICY crm_prospects_public_insert ON crm_prospects
  FOR INSERT
  WITH CHECK (
    -- Alleen anonieme sessions (geen ingelogde users) — om misbruik vanuit
    -- bestaande accounts te voorkomen
    auth.uid() IS NULL
    AND status = 'new'
    AND source IN ('website-demo', 'website-contact', 'website-werknemer')
    -- Verplicht: contact_name + ten minste email of telefoon
    AND contact_name IS NOT NULL
    AND length(contact_name) > 0
    AND (email IS NOT NULL OR phone IS NOT NULL)
    -- Geen converted velden bij intake
    AND converted_employer_id IS NULL
    AND converted_employee_id IS NULL
    AND converted_at IS NULL
  );
