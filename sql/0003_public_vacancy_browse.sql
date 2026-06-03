-- ============================================================================
-- 0003_public_vacancy_browse.sql
-- Sta anonieme + ingelogde users toe om OPEN vacatures te lezen voor de
-- publieke browse-pagina (/vacatures). Alleen SELECT, alleen status=open.
-- Vacatures zijn marketing-content, bedoeld om publiek te tonen.
-- ============================================================================

DROP POLICY IF EXISTS vacancies_public_browse ON vacancies;
CREATE POLICY vacancies_public_browse ON vacancies
  FOR SELECT
  USING (status = 'open');

-- Ook employers lezen voor de vacature-detail (bedrijfsnaam, sector, about)
-- Beperkt tot de kolommen die in vacancies join — RLS werkt op rij, dus de
-- hele row is leesbaar als deze policy matcht. Daarom: alleen employers
-- waar minimaal 1 open vacature aan hangt.

DROP POLICY IF EXISTS employers_public_browse ON employers;
CREATE POLICY employers_public_browse ON employers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vacancies v
      WHERE v.employer_id = employers.id
        AND v.status = 'open'
    )
  );
