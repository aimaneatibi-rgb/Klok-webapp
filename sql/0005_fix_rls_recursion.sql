-- ============================================================================
-- 0005_fix_rls_recursion.sql
-- Fix: "infinite recursion detected in policy for relation employers"
--
-- Oorzaak: employers_public_browse (0003) doet een subquery op vacancies.
-- Binnen een policy wordt op die subquery óók RLS toegepast, en de
-- vacancies-policies verwijzen terug naar employers (eigenaar-check).
-- employers → vacancies → employers = oneindige lus. De signup raakt dit
-- omdat de insert met .select("id") de SELECT-policies van employers
-- evalueert, inclusief de browse-policy.
--
-- Fix: breek één kant van de cirkel. De open-vacature-check gaat in een
-- SECURITY DEFINER-functie die vacancies leest ZONDER RLS. De functie
-- lekt niets: hij geeft alleen ja/nee terug of een werkgever minstens
-- één open vacature heeft — precies wat de browse-pagina publiek toont.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.employer_has_open_vacancy(emp_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM vacancies v
    WHERE v.employer_id = emp_id
      AND v.status = 'open'
  );
$$;

-- Aanroepbaar voor anon (publieke browse) en ingelogde users
GRANT EXECUTE ON FUNCTION public.employer_has_open_vacancy(UUID) TO anon, authenticated;

DROP POLICY IF EXISTS employers_public_browse ON employers;
CREATE POLICY employers_public_browse ON employers
  FOR SELECT
  USING (public.employer_has_open_vacancy(employers.id));
