import { Pool } from 'pg';
import { directDatabaseUrl } from './runtime-config';

interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
}

interface DatabaseCheck {
  database: string;
  postgis_version: string;
  migration_count: string;
  anon_application_schema_usage: boolean;
  authenticated_application_schema_usage: boolean;
  anon_quarantine_schema_usage: boolean;
  authenticated_quarantine_schema_usage: boolean;
  quarantine_schema_object_count: string;
  anon_migration_ledger_access: boolean;
  authenticated_migration_ledger_access: boolean;
}

const REQUIRED_BUCKETS = [
  'provider-evidence',
  'provider-media-private',
  'provider-media-public',
  'system-exports',
] as const;

const APPLICATION_SCHEMAS = [
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
  'security',
] as const;

async function main(): Promise<void> {
  const supabaseUrl = requiredEnvironment('SUPABASE_URL').replace(/\/$/, '');
  const serverKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ?? process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';
  if (!serverKey) {
    throw new Error(
      'SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY is required for the Supabase integration check.',
    );
  }
  const pool = new Pool({ connectionString: directDatabaseUrl(), max: 1 });

  try {
    const schemaList = APPLICATION_SCHEMAS.map((schema) => `'${schema}'`).join(', ');
    const database = await pool.query<DatabaseCheck>(`
      SELECT
        current_database() AS database,
        PostGIS_Version() AS postgis_version,
        (SELECT count(*)::text FROM public.direkt_schema_migrations) AS migration_count,
        EXISTS (
          SELECT 1
          FROM pg_namespace
          WHERE nspname IN (${schemaList})
            AND has_schema_privilege('anon', oid, 'USAGE')
        ) AS anon_application_schema_usage,
        EXISTS (
          SELECT 1
          FROM pg_namespace
          WHERE nspname IN (${schemaList})
            AND has_schema_privilege('authenticated', oid, 'USAGE')
        ) AS authenticated_application_schema_usage,
        has_schema_privilege('anon', 'direkt_api_disabled', 'USAGE') AS anon_quarantine_schema_usage,
        has_schema_privilege('authenticated', 'direkt_api_disabled', 'USAGE') AS authenticated_quarantine_schema_usage,
        (
          SELECT count(*)::text
          FROM information_schema.tables
          WHERE table_schema = 'direkt_api_disabled'
        ) AS quarantine_schema_object_count,
        (
          has_table_privilege('anon', 'public.direkt_schema_migrations', 'SELECT') OR
          has_table_privilege('anon', 'public.direkt_schema_migrations', 'INSERT') OR
          has_table_privilege('anon', 'public.direkt_schema_migrations', 'UPDATE') OR
          has_table_privilege('anon', 'public.direkt_schema_migrations', 'DELETE')
        ) AS anon_migration_ledger_access,
        (
          has_table_privilege('authenticated', 'public.direkt_schema_migrations', 'SELECT') OR
          has_table_privilege('authenticated', 'public.direkt_schema_migrations', 'INSERT') OR
          has_table_privilege('authenticated', 'public.direkt_schema_migrations', 'UPDATE') OR
          has_table_privilege('authenticated', 'public.direkt_schema_migrations', 'DELETE')
        ) AS authenticated_migration_ledger_access
    `);

    const databaseState = database.rows[0];
    if (!databaseState) {
      throw new Error('Supabase database inspection returned no result.');
    }

    const exposedDatabaseSurfaces = [
      ['anon application schema usage', databaseState.anon_application_schema_usage],
      [
        'authenticated application schema usage',
        databaseState.authenticated_application_schema_usage,
      ],
      ['anon quarantine schema usage', databaseState.anon_quarantine_schema_usage],
      [
        'authenticated quarantine schema usage',
        databaseState.authenticated_quarantine_schema_usage,
      ],
      ['anon migration ledger', databaseState.anon_migration_ledger_access],
      ['authenticated migration ledger', databaseState.authenticated_migration_ledger_access],
    ]
      .filter(([, exposed]) => exposed)
      .map(([name]) => name);

    if (exposedDatabaseSurfaces.length > 0) {
      throw new Error(
        `Browser-facing Supabase database privileges must remain revoked: ${exposedDatabaseSurfaces.join(', ')}.`,
      );
    }

    if (databaseState.quarantine_schema_object_count !== '0') {
      throw new Error(
        `The Supabase Data API quarantine schema must remain empty; found ${databaseState.quarantine_schema_object_count} table(s).`,
      );
    }

    const headers: Record<string, string> = { apikey: serverKey };
    if (!serverKey.startsWith('sb_secret_')) {
      headers.authorization = `Bearer ${serverKey}`;
    }

    const storageResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, { headers });
    if (!storageResponse.ok) {
      throw new Error(`Supabase bucket inspection failed with HTTP ${storageResponse.status}.`);
    }

    const buckets = (await storageResponse.json()) as StorageBucket[];
    const byName = new Map(buckets.map((bucket) => [bucket.name, bucket]));
    const missing = REQUIRED_BUCKETS.filter((name) => !byName.has(name));
    const unexpectedlyPublic = REQUIRED_BUCKETS.filter((name) => byName.get(name)?.public === true);

    if (missing.length > 0) {
      throw new Error(`Required private buckets are missing: ${missing.join(', ')}.`);
    }
    if (unexpectedlyPublic.length > 0) {
      throw new Error(`Buckets must remain private: ${unexpectedlyPublic.join(', ')}.`);
    }

    const postgisDataApiProbe = await fetch(
      `${supabaseUrl}/rest/v1/spatial_ref_sys?select=srid&limit=1`,
      { headers },
    );
    if (postgisDataApiProbe.ok) {
      throw new Error(
        'Supabase Data API still exposes public.spatial_ref_sys. Quarantine PostgREST before Phase 10 promotion.',
      );
    }

    const projectRef = new URL(supabaseUrl).hostname.split('.')[0] ?? 'unknown';
    process.stdout.write(
      `${JSON.stringify(
        {
          event: 'supabase_integration_check_passed',
          projectRef,
          database: databaseState,
          privateBuckets: [...REQUIRED_BUCKETS],
          applicationSchemas: [...APPLICATION_SCHEMAS],
          browserDatabaseSurface: 'application schemas and migration ledger private',
          dataApiQuarantineSchema: 'direkt_api_disabled',
          publicPostgisDataApiProbeStatus: postgisDataApiProbe.status,
          serverKeyType: serverKey.startsWith('sb_secret_') ? 'secret' : 'legacy_service_role',
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    await pool.end();
  }
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for the Supabase integration check.`);
  }
  return value;
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown Supabase integration failure';
  process.stderr.write(
    `${JSON.stringify({ event: 'supabase_integration_check_failed', message })}\n`,
  );
  process.exitCode = 1;
});
