-- Quarantine Supabase PostgREST away from DIREKT application and extension schemas.
--
-- DIREKT uses direct PostgreSQL from the backend plus the separate Supabase
-- Storage API. It does not use PostgREST/GraphQL database endpoints. Keep a
-- deliberately empty schema available as the only PostgREST exposed schema.

CREATE SCHEMA IF NOT EXISTS direkt_api_disabled;

REVOKE ALL ON SCHEMA direkt_api_disabled FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON SCHEMA direkt_api_disabled FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON SCHEMA direkt_api_disabled FROM authenticated;
  END IF;
END;
$$;

COMMENT ON SCHEMA direkt_api_disabled IS
  'Intentionally empty schema used to quarantine the unused Supabase Data API from DIREKT application and PostGIS schemas.';
