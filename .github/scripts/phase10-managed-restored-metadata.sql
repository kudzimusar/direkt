WITH app_schemas(schema_name) AS (
  VALUES
    ('platform'),
    ('account'),
    ('authz'),
    ('provider'),
    ('catalog'),
    ('evidence'),
    ('verification'),
    ('discovery'),
    ('provider_workspace'),
    ('operations'),
    ('interaction'),
    ('commercial'),
    ('security')
)
SELECT json_build_object(
  'application_table_count', (
    SELECT count(*)
    FROM information_schema.tables
    WHERE table_schema IN (SELECT schema_name FROM app_schemas)
      AND table_type = 'BASE TABLE'
  ),
  'application_schema_count', (
    SELECT count(DISTINCT table_schema)
    FROM information_schema.tables
    WHERE table_schema IN (SELECT schema_name FROM app_schemas)
      AND table_type = 'BASE TABLE'
  ),
  'migration_count', (SELECT count(*) FROM public.direkt_schema_migrations),
  'postgis_version', PostGIS_Version(),
  'seed_state', json_build_object(
    'roles', (SELECT count(*) FROM authz.roles),
    'permissions', (SELECT count(*) FROM authz.permissions),
    'role_permissions', (SELECT count(*) FROM authz.role_permissions),
    'service_categories', (SELECT count(*) FROM catalog.service_categories),
    'requirement_versions', (SELECT count(*) FROM catalog.requirement_versions),
    'requirements', (SELECT count(*) FROM catalog.requirements),
    'products', (SELECT count(*) FROM commercial.products),
    'prices', (SELECT count(*) FROM commercial.prices),
    'product_entitlements', (SELECT count(*) FROM commercial.product_entitlements)
  )
);