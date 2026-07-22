REVOKE ALL ON FUNCTION platform.protect_push_token_classification() FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.protect_push_token_classification() FROM anon;
REVOKE ALL ON FUNCTION platform.protect_push_token_classification() FROM authenticated;

COMMENT ON FUNCTION platform.protect_push_token_classification() IS
  'RC4 server-only trigger guard. Browser roles have no EXECUTE privilege; the trigger prevents controlled-pilot push tokens from being reclassified as synthetic.';
