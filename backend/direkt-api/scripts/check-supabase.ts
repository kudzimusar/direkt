import { Pool } from 'pg';
import { directDatabaseUrl } from './runtime-config';

interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
}

const REQUIRED_BUCKETS = [
  'provider-evidence',
  'provider-media-private',
  'provider-media-public',
  'system-exports',
] as const;

async function main(): Promise<void> {
  const supabaseUrl = requiredEnvironment('SUPABASE_URL').replace(/\/$/, '');
  const serviceRoleKey = requiredEnvironment('SUPABASE_SERVICE_ROLE_KEY');
  const pool = new Pool({ connectionString: directDatabaseUrl(), max: 1 });

  try {
    const database = await pool.query<{
      database: string;
      postgis_version: string;
      migration_count: string;
    }>(`
      SELECT
        current_database() AS database,
        PostGIS_Version() AS postgis_version,
        (SELECT count(*)::text FROM public.direkt_schema_migrations) AS migration_count
    `);

    const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
      },
    });
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
          database: database.rows[0],
          privateBuckets: [...REQUIRED_BUCKETS],
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
