-- Harden the Supabase/Postgres application-schema boundary after the Phase 12 integration audit.
--
-- PostgreSQL grants EXECUTE on newly created functions to PUBLIC by default. DIREKT does not
-- expose its application schemas through Supabase browser roles, but retaining PUBLIC EXECUTE
-- would turn a future accidental schema-USAGE grant into a much larger callable surface.
-- Runtime/migration owners retain their owner privileges; this does not grant any new access.

DO $$
DECLARE
  target_schema text;
  browser_role text;
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
      EXECUTE format(
        'ALTER DEFAULT PRIVILEGES IN SCHEMA %I REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC',
        target_schema
      );

      -- Supabase creates anon/authenticated roles; local CI Postgres intentionally does not.
      -- Apply the explicit browser-role revocations only when those provider roles exist.
      FOREACH browser_role IN ARRAY ARRAY['anon', 'authenticated']
      LOOP
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = browser_role) THEN
          EXECUTE format(
            'REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA %I FROM %I',
            target_schema,
            browser_role
          );
          EXECUTE format('REVOKE USAGE ON SCHEMA %I FROM %I', target_schema, browser_role);
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE public.direkt_schema_migrations FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE public.direkt_schema_migrations FROM authenticated;
  END IF;
END;
$$;
