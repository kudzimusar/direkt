REVOKE ALL ON FUNCTION platform.protect_push_token_classification() FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION platform.protect_push_token_classification() FROM anon';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION platform.protect_push_token_classification() FROM authenticated';
  END IF;
END;
$$;

COMMENT ON FUNCTION platform.protect_push_token_classification() IS
  'RC4 server-only trigger guard. Browser roles have no EXECUTE privilege; the trigger prevents controlled-pilot push tokens from being reclassified as synthetic.';
