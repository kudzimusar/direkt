import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Pool, type PoolClient } from 'pg';

const MIGRATION_LOCK_KEY = 947_201_826;
const MIGRATION_DIRECTORY = resolve(__dirname, '../../../database/migrations');
const MIGRATION_PATTERN = /^\d{12,}_[a-z0-9_]+\.sql$/;

export interface MigrationResult {
  applied: string[];
  alreadyApplied: string[];
}

interface AppliedMigration {
  version: string;
  checksum: string;
}

export async function runMigrations(databaseUrl: string): Promise<MigrationResult> {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  const client = await pool.connect();

  try {
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_KEY]);
    await ensureMigrationTable(client);

    const appliedRows = await client.query<AppliedMigration>(
      'SELECT version, checksum FROM public.direkt_schema_migrations ORDER BY version',
    );
    const applied = new Map(appliedRows.rows.map((row) => [row.version, row.checksum]));
    const files = (await readdir(MIGRATION_DIRECTORY))
      .filter((file) => MIGRATION_PATTERN.test(file))
      .sort();

    const result: MigrationResult = { applied: [], alreadyApplied: [] };

    for (const file of files) {
      const sql = await readFile(resolve(MIGRATION_DIRECTORY, file), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const previousChecksum = applied.get(file);

      if (previousChecksum) {
        if (previousChecksum !== checksum) {
          throw new Error(`Applied migration ${file} has been modified.`);
        }
        result.alreadyApplied.push(file);
        continue;
      }

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          `INSERT INTO public.direkt_schema_migrations (version, checksum)
           VALUES ($1, $2)`,
          [file, checksum],
        );
        await client.query('COMMIT');
        result.applied.push(file);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    return result;
  } finally {
    await client
      .query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_KEY])
      .catch(() => undefined);
    client.release();
    await pool.end();
  }
}

async function ensureMigrationTable(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.direkt_schema_migrations (
      version text PRIMARY KEY,
      checksum character(64) NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}
