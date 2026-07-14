import { Pool } from 'pg';
import { runMigrations } from './migration-lib';
import { databaseUrl } from './runtime-config';

async function main(): Promise<void> {
  const url = databaseUrl();
  await runMigrations(url);

  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    await pool.query(
      `INSERT INTO platform.audit_events (
         actor_type,
         action,
         resource_type,
         outcome,
         metadata
       ) VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [
        'system',
        'synthetic_seed_created',
        'platform_foundation',
        'success',
        JSON.stringify({
          synthetic: true,
          purpose: 'local development only',
          containsPersonalData: false,
        }),
      ],
    );

    process.stdout.write(
      `${JSON.stringify({ event: 'synthetic_seed_completed', personalData: false })}\n`,
    );
  } finally {
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown seed failure';
  process.stderr.write(`${JSON.stringify({ event: 'synthetic_seed_failed', message })}\n`);
  process.exitCode = 1;
});
