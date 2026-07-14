import { Pool } from 'pg';
import { runMigrations } from './migration-lib';
import { databaseUrl } from './runtime-config';

async function main(): Promise<void> {
  const url = databaseUrl();
  const first = await runMigrations(url);
  const second = await runMigrations(url);

  if (second.applied.length !== 0) {
    throw new Error('A second migration run unexpectedly applied migrations.');
  }

  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    const verification = await pool.query<{
      postgis_version: string;
      migration_count: string;
      audit_table: string | null;
      outbox_table: string | null;
      idempotency_table: string | null;
    }>(`
      SELECT
        PostGIS_Version() AS postgis_version,
        (SELECT count(*)::text FROM public.direkt_schema_migrations) AS migration_count,
        to_regclass('platform.audit_events')::text AS audit_table,
        to_regclass('platform.outbox_events')::text AS outbox_table,
        to_regclass('platform.idempotency_keys')::text AS idempotency_table
    `);

    const row = verification.rows[0];
    if (!row || !row.audit_table || !row.outbox_table || !row.idempotency_table) {
      throw new Error('Required platform tables are missing after migration.');
    }

    process.stdout.write(
      `${JSON.stringify(
        {
          event: 'migration_check_passed',
          first,
          second,
          database: row,
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown migration check failure';
  process.stderr.write(`${JSON.stringify({ event: 'migration_check_failed', message })}\n`);
  process.exitCode = 1;
});
