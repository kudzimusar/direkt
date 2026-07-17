DO $direkt_storage$
BEGIN
  IF to_regclass('storage.buckets') IS NULL THEN
    RAISE NOTICE 'Supabase storage schema is unavailable; private bucket provisioning skipped.';
    RETURN;
  END IF;

  INSERT INTO storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
  )
  VALUES
    (
      'provider-evidence',
      'provider-evidence',
      false,
      20971520,
      ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']::text[]
    ),
    (
      'provider-media-private',
      'provider-media-private',
      false,
      10485760,
      ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
    ),
    (
      'provider-media-public',
      'provider-media-public',
      false,
      10485760,
      ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
    ),
    (
      'system-exports',
      'system-exports',
      false,
      104857600,
      ARRAY['application/json', 'text/csv', 'application/pdf', 'application/zip']::text[]
    )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types,
    updated_at = now();
END
$direkt_storage$;
