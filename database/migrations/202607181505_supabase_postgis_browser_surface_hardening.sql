-- Harden the browser-facing surface of Supabase-managed PostGIS objects.
--
-- public.spatial_ref_sys and the st_estimatedextent functions are owned by the
-- managed PostGIS extension. DIREKT must not change extension ownership, move
-- the extension, or enable RLS on extension-owned objects through application
-- migrations. We can and must, however, remove direct browser-role privileges
-- that are not required by the DIREKT architecture.

REVOKE ALL PRIVILEGES ON TABLE public.spatial_ref_sys FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL PRIVILEGES ON TABLE public.spatial_ref_sys FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL PRIVILEGES ON TABLE public.spatial_ref_sys FROM authenticated;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text, text, boolean) FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text) FROM anon;
    REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text, text) FROM anon;
    REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text, text, boolean) FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text) FROM authenticated;
    REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text, text) FROM authenticated;
    REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text, text, boolean) FROM authenticated;
  END IF;
END;
$$;
