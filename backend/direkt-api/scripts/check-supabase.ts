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
  anon_spatial_ref_sys_access: boolean;
  authenticated_spatial_ref_sys_access: boolean;
  anon_estimatedextent_execute: boolean;
  authenticated_estimatedextent_execute: boolean;
  anon_migration_ledger_access: boolean;
  authenticated_migration_ledger_access: boolean;
}

const REQUIRED_BUCKETS = [
  'provider-evidence',
  'provider-media-private',
  'provider-media-public',
  'system-exports',
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
    const database = await pool.query<DatabaseCheck>(`
      SELECT
        current_database() AS database,
        PostGIS_Version() AS postgis_version,
        (SELECT count(*)::text FROM public.direkt_schema_migrations) AS migration_count,
        (
          has_table_privilege('anon', 'public.spatial_ref_sys', 'SELECT') OR
          has_table_privilege('anon', 'public.spatial_ref_sys', 'INSERT') OR
          has_table_privilege('anon', 'public.spatial_ref_sys', 'UPDATE') OR
          has_table_privilege('anon', 'public.spatial_ref_sys', 'DELETE')
        ) AS anon_spatial_ref_sys_access,
        (
          has_table_privilege('authenticated', 'public.spatial_ref_sys', 'SELECT') OR
          has_table_privilege('authenticated', 'public.spatial_ref_sys', 'INSERT') OR
          has_table_privilege('authenticated', 'public.spatial_ref_sys', 'UPDATE') OR
          has_table_privilege('authenticated', 'public.spatial_ref_sys', 'DELETE')
        ) AS authenticated_spatial_ref_sys_access,
        (
          has_function_privilege('anon', 'public.st_estimatedextent(text,text)', 'EXECUTE') OR
          has_function_privilege('anon', 'public.st_estimatedextent(text,text,text)', 'EXECUTE') OR
          has_function_privilege('anon', 'public.st_estimatedextent(text,text,text,boolean)', 'EXECUTE')
        ) AS anon_estimatedextent_execute,
        (
          has_function_privilege('authenticated', 'public.st_estimatedextent(text,text)', 'EXECUTE') OR
          has_function_privilege('authenticated', 'public.st_estimatedextent(text,text,text)', 'EXECUTE') OR
          has_function_privilege('authenticated', 'public.st_estimatedextent(text,text,text,boolean)', 'EXECUTE')
        ) AS authenticated_estimatedextent_execute,
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
      ['anon spatial_ref_sys', databaseState.anon_spatial_ref_sys_access],
      ['authenticated spatial_ref_sys', databaseState.authenticated_spatial_ref_sys_access],
      ['anon st_estimatedextent', databaseState.anon_estimatedextent_execute],
      ['authenticated st_estimatedextent', databaseState.authenticated_estimatedextent_execute],
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

    const headers: Record<string, string> = { apikey: serverKey };
    if (!serverKey.startsWith('sb_secret_')) {
      headers.authorization = `Bearer ${serverKey}`;
    }
    const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, { headers });
    if (!response.ok) {
      throw new Error(`Supabase bucket inspection failed with HTTP ${response.status}.`);
    }

    const buckets = (await response.json()) as StorageBucket[];
    const byName = new Map(buckets.map((bucket) => [bucket.name, bucket]));
    const missing = REQUIRED_BUCKETS.filter((name) => !byName.has(name));
    const unexpectedlyPublic = REQUIRED_BUCKETS.filter((name) => byName.get(name)?.public === true);

    if (missing.length > 0) {
      throw new Error(`Required private buckets are missing: ${missing.join(', ')}.`);
    }
    if (unexpectedlyPublic.length > 0) {
      throw new Error(`Buckets must remain private: ${unexpectedlyPublic.join(', ')}.`);
    }

    const projectRef = new URL(supabaseUrl).hostname.split('.')[0] ?? 'unknown';
    process.stdout.write(
      `${JSON.stringify(
        {
          event: 'supabase_integration_check_passed',
          projectRef,
          database: databaseState,
          privateBuckets: [...REQUIRED_BUCKETS],
          browserDatabaseSurface: 'revoked',
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
