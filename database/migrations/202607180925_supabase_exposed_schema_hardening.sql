-- Harden internal public-schema tables that Supabase exposes through PostgREST.
-- Trusted DIREKT database connections use the postgres migration/runtime role;
-- browser-facing anon and authenticated roles must not reach these tables.

ALTER TABLE public.direkt_schema_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL PRIVILEGES ON TABLE public.direkt_schema_migrations FROM anon;
    REVOKE ALL PRIVILEGES ON TABLE public.spatial_ref_sys FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL PRIVILEGES ON TABLE public.direkt_schema_migrations FROM authenticated;
    REVOKE ALL PRIVILEGES ON TABLE public.spatial_ref_sys FROM authenticated;
  END IF;
END;
$$;
