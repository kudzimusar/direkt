-- Harden the DIREKT-owned migration ledger exposed through Supabase PostgREST.
-- Trusted DIREKT database connections use the postgres migration/runtime role;
-- browser-facing anon and authenticated roles must not reach this table.
--
-- public.spatial_ref_sys is owned by Supabase's managed supabase_admin role.
-- Repository migrations must not attempt to alter that platform-owned PostGIS
-- table. Its public-schema advisor finding is tracked as a managed-platform
-- exception pending a supported PostGIS relocation or Supabase support action.

ALTER TABLE public.direkt_schema_migrations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL PRIVILEGES ON TABLE public.direkt_schema_migrations FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL PRIVILEGES ON TABLE public.direkt_schema_migrations FROM authenticated;
  END IF;
END;
$$;
