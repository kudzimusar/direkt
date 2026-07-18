SELECT json_build_object(
  'project_ref', 'aeeuscifrxcjmnswqwnq',
  'public_table_count', (
    SELECT count(*)
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name <> 'spatial_ref_sys'
  ),
  'migration_count', (SELECT count(*) FROM public.direkt_schema_migrations),
  'postgis_version', PostGIS_Version(),
  'storage_object_count', (SELECT count(*) FROM storage.objects),
  'private_bucket_count', (
    SELECT count(*)
    FROM storage.buckets
    WHERE id IN (
      'provider-evidence',
      'provider-media-private',
      'provider-media-public',
      'system-exports'
    )
      AND public = false
  )
);
