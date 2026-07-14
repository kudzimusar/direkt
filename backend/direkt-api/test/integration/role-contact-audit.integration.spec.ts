import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../scripts/migration-lib';
import { databaseUrl } from '../../scripts/runtime-config';

describe('Phase 2C role lifecycle and contact audit regressions', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 2 });

  beforeAll(async () => {
    await runMigrations(url);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('permits a new role grant after the prior bounded grant has expired', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const identityId = randomUUID();
      await client.query('INSERT INTO account.identities (id) VALUES ($1)', [identityId]);
      await client.query(
        `INSERT INTO authz.role_assignments (
           identity_id,
           role_id,
           scope_type,
           starts_at,
           ends_at,
           reason
         )
         SELECT $1, id, 'global', now() - interval '2 days', now() - interval '1 day',
                'Expired synthetic customer assignment'
         FROM authz.roles
         WHERE role_key = 'customer'`,
        [identityId],
      );
      await client.query(
        `INSERT INTO authz.role_assignments (
           identity_id,
           role_id,
           scope_type,
           starts_at,
           reason
         )
         SELECT $1, id, 'global', now(), 'Renewed synthetic customer assignment'
         FROM authz.roles
         WHERE role_key = 'customer'`,
        [identityId],
      );
      const count = await client.query<{ count: string }>(
        `SELECT count(*)::text AS count
         FROM authz.role_assignments
         WHERE identity_id = $1`,
        [identityId],
      );

      expect(count.rows[0]?.count).toBe('2');
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });

  it('records contact verification when a verified contact is first inserted', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const identityId = randomUUID();
      const contactId = randomUUID();
      await client.query('INSERT INTO account.identities (id) VALUES ($1)', [identityId]);
      await client.query(
        `INSERT INTO account.contacts (
           id,
           identity_id,
           channel,
           value_hash,
           display_hint,
           verified_at
         ) VALUES ($1, $2, 'email', $3, 'n***@example.invalid', now())`,
        [contactId, identityId, randomUUID().replaceAll('-', '').padEnd(64, '0')],
      );
      const audit = await client.query<{ action: string; resource_id: string }>(
        `SELECT action, resource_id
         FROM platform.audit_events
         WHERE resource_type = 'contact' AND resource_id = $1`,
        [contactId],
      );

      expect(audit.rows[0]).toEqual({
        action: 'contact_verified',
        resource_id: contactId,
      });
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});
