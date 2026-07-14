import { Pool } from 'pg';
import { runMigrations } from './migration-lib';
import { databaseUrl } from './runtime-config';

const SYNTHETIC_IDENTITY_ID = '00000000-0000-4000-8000-000000000101';
const SYNTHETIC_CONTACT_ID = '00000000-0000-4000-8000-000000000102';
const SYNTHETIC_POLICY_ID = '00000000-0000-4000-8000-000000000103';

async function main(): Promise<void> {
  const url = databaseUrl();
  await runMigrations(url);

  const pool = new Pool({ connectionString: url, max: 1 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO account.identities (id)
       VALUES ($1)
       ON CONFLICT (id) DO NOTHING`,
      [SYNTHETIC_IDENTITY_ID],
    );
    await client.query(
      `INSERT INTO account.contacts (
         id,
         identity_id,
         channel,
         value_hash,
         display_hint,
         verified_at
       ) VALUES ($1, $2, 'email', $3, 'o***@example.invalid', now())
       ON CONFLICT (channel, value_hash) DO NOTHING`,
      [SYNTHETIC_CONTACT_ID, SYNTHETIC_IDENTITY_ID, '1'.repeat(64)],
    );
    await client.query(
      `INSERT INTO account.policy_versions (
         id,
         policy_key,
         version,
         document_hash,
         published_at,
         effective_at
       ) VALUES ($1, 'privacy-notice', 'synthetic-1', $2, now(), now())
       ON CONFLICT (policy_key, version) DO NOTHING`,
      [SYNTHETIC_POLICY_ID, '2'.repeat(64)],
    );
    await client.query(
      `INSERT INTO account.consents (
         identity_id,
         policy_version_id,
         status,
         source
       )
       SELECT $1, $2, 'accepted', 'synthetic-local-seed'
       WHERE NOT EXISTS (
         SELECT 1 FROM account.consents
         WHERE identity_id = $1 AND policy_version_id = $2
       )`,
      [SYNTHETIC_IDENTITY_ID, SYNTHETIC_POLICY_ID],
    );
    await client.query(
      `INSERT INTO authz.role_assignments (
         identity_id,
         role_id,
         scope_type,
         reason
       )
       SELECT $1, id, 'global', 'Synthetic local customer fixture'
       FROM authz.roles
       WHERE role_key = 'customer'
       ON CONFLICT DO NOTHING`,
      [SYNTHETIC_IDENTITY_ID],
    );
    await client.query(
      `INSERT INTO platform.audit_events (
         actor_type,
         actor_id,
         action,
         resource_type,
         resource_id,
         outcome,
         metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [
        'system',
        SYNTHETIC_IDENTITY_ID,
        'synthetic_seed_created',
        'identity_foundation',
        SYNTHETIC_IDENTITY_ID,
        'success',
        JSON.stringify({
          synthetic: true,
          purpose: 'local development only',
          containsPersonalData: false,
          rawContactStored: false,
        }),
      ],
    );
    await client.query('COMMIT');

    process.stdout.write(
      `${JSON.stringify({ event: 'synthetic_seed_completed', personalData: false })}\n`,
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown seed failure';
  process.stderr.write(`${JSON.stringify({ event: 'synthetic_seed_failed', message })}\n`);
  process.exitCode = 1;
});
