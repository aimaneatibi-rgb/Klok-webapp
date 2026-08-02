-- ============================================================================
-- 0006_signup_rollback.sql
-- Atomaire signup: als stap 2 (employers/employees-rij) faalt, roept de
-- client deze functie aan om het zojuist aangemaakte auth-account weer te
-- verwijderen. Zo bestaat er nooit een half account (auth zonder profiel).
--
-- Veiligheid: de functie weigert zodra er WEL een profielrij bestaat —
-- een gewone ingelogde gebruiker kan hiermee dus nooit een account met
-- data verwijderen, alleen zijn eigen incomplete registratie.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rollback_incomplete_signup()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Niet ingelogd';
  END IF;

  IF EXISTS (SELECT 1 FROM public.employers WHERE user_id = uid)
     OR EXISTS (SELECT 1 FROM public.employees WHERE user_id = uid) THEN
    RAISE EXCEPTION 'Account heeft al profieldata; rollback geweigerd';
  END IF;

  DELETE FROM public.users WHERE id = uid;
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.rollback_incomplete_signup() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rollback_incomplete_signup() TO authenticated;
