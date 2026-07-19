-- Harden the Supabase/Postgres application-schema boundary after the Phase 12 integration audit.
--
-- PostgreSQL grants EXECUTE on newly created functions to PUBLIC by default. DIREKT does not
-- expose its application schemas through Supabase browser roles, but retaining PUBLIC EXECUTE
-- would turn a future accidental schema-USAGE grant into a much larger callable surface.
-- Runtime/migration owners retain their owner privileges; this does not grant any new access.

DO $$
DECLARE
  target_schema text;
BEGIN
  FOREACH target_schema IN ARRAY ARRAY[
    'platform',
    'account',
    'authz',
    'provider',
    'catalog',
    'evidence',
    'verification',
    'discovery',
    'provider_workspace',
    'operations',
    'interaction',
    'commercial',
    'security'
  ]
  LOOP
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = target_schema) THEN
      EXECUTE format('REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA %I FROM PUBLIC', target_schema);
      EXECUTE format('REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA %I FROM anon, authenticated', target_schema);
      EXECUTE format('REVOKE USAGE ON SCHEMA %I FROM anon, authenticated', target_schema);
      EXECUTE format(
        'ALTER DEFAULT PRIVILEGES IN SCHEMA %I REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC',
        target_schema
      );
    END IF;
  END LOOP;
END;
$$;

-- Keep the migration ledger browser-inaccessible even though RLS is enabled without policies.
REVOKE ALL ON TABLE public.direkt_schema_migrations FROM anon, authenticated;
