import { Pool } from 'pg';
import { runMigrations } from './migration-lib';
import { databaseUrl } from './runtime-config';

const SYNTHETIC_IDENTITY_ID = '00000000-0000-4000-8000-000000000101';
const SYNTHETIC_CONTACT_ID = '00000000-0000-4000-8000-000000000102';
const SYNTHETIC_POLICY_ID = '00000000-0000-4000-8000-000000000103';
const SYNTHETIC_PROVIDER_ID = '00000000-0000-4000-8000-000000000201';
const PLUMBING_CATEGORY_ID = '00000000-0000-4000-8000-000000003001';
const PLUMBING_REQUIREMENT_VERSION_ID = '00000000-0000-4000-8000-000000003101';

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
      `INSERT INTO account.customer_profiles (identity_id, display_name)
       VALUES ($1, 'Synthetic provider owner')
       ON CONFLICT (identity_id) DO UPDATE
         SET display_name = EXCLUDED.display_name,
             updated_at = now()`,
      [SYNTHETIC_IDENTITY_ID],
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
      `INSERT INTO provider.organizations (
         id,
         pathway,
         created_by_identity_id
       ) VALUES ($1, 'registered_business', $2)
       ON CONFLICT (id) DO NOTHING`,
      [SYNTHETIC_PROVIDER_ID, SYNTHETIC_IDENTITY_ID],
    );
    await client.query(
      `INSERT INTO provider.profiles (
         provider_id,
         display_name,
         operating_model,
         locality_summary,
         service_area_summary,
         registered_business_name
       ) VALUES (
         $1,
         'Synthetic Copperbelt Repairs',
         'fixed_premises',
         'Woodlands, Lusaka',
         'Woodlands and nearby Lusaka neighbourhoods',
         'Synthetic Copperbelt Repairs Limited'
       )
       ON CONFLICT (provider_id) DO NOTHING`,
      [SYNTHETIC_PROVIDER_ID],
    );
    await client.query(
      `INSERT INTO authz.role_assignments (
         identity_id,
         role_id,
         scope_type,
         provider_id,
         assigned_by_identity_id,
         reason
       )
       SELECT $1, id, 'provider', $2, $1, 'Synthetic provider owner fixture'
       FROM authz.roles
       WHERE role_key = 'provider_owner'
       ON CONFLICT DO NOTHING`,
      [SYNTHETIC_IDENTITY_ID, SYNTHETIC_PROVIDER_ID],
    );
    await client.query(
      `INSERT INTO provider.category_selections (
         provider_id,
         category_id,
         requirement_version_id,
         status
       ) VALUES ($1, $2, $3, 'selected')
       ON CONFLICT (provider_id, category_id) DO NOTHING`,
      [SYNTHETIC_PROVIDER_ID, PLUMBING_CATEGORY_ID, PLUMBING_REQUIREMENT_VERSION_ID],
    );
    await client.query(
      `INSERT INTO platform.audit_events (
         actor_type,
         actor_id,
         provider_id,
         action,
         resource_type,
         resource_id,
         outcome,
         metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
      [
        'system',
        SYNTHETIC_IDENTITY_ID,
        SYNTHETIC_PROVIDER_ID,
        'synthetic_seed_created',
        'phase_3_provider_foundation',
        SYNTHETIC_PROVIDER_ID,
        'success',
        JSON.stringify({
          synthetic: true,
          purpose: 'local development only',
          containsPersonalData: false,
          rawContactStored: false,
          discoverable: false,
        }),
      ],
    );
    await client.query('COMMIT');

    process.stdout.write(
      `${JSON.stringify({ event: 'synthetic_seed_completed', personalData: false, providerDiscoverable: false })}\n`,
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
