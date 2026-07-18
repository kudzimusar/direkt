SELECT json_build_object(
  'public_table_count', (
    SELECT count(*)
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name <> 'spatial_ref_sys'
  ),
  'migration_count', (SELECT count(*) FROM public.direkt_schema_migrations),
  'postgis_version', PostGIS_Version()
);
