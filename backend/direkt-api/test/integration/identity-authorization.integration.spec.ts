import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../scripts/migration-lib';
import { databaseUrl } from '../../scripts/runtime-config';

describe('Phase 2C identity and authorization schema', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 2 });

  beforeAll(async () => {
    await runMigrations(url);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates account, session, consent and authorization contracts', async () => {
    const result = await pool.query<{
      identities: string | null;
      contacts: string | null;
      challenges: string | null;
      sessions: string | null;
      consents: string | null;
      roles: string | null;
      assignments: string | null;
    }>(`
      SELECT
        to_regclass('account.identities')::text AS identities,
        to_regclass('account.contacts')::text AS contacts,
        to_regclass('account.authentication_challenges')::text AS challenges,
        to_regclass('account.sessions')::text AS sessions,
        to_regclass('account.consents')::text AS consents,
        to_regclass('authz.roles')::text AS roles,
        to_regclass('authz.role_assignments')::text AS assignments
    `);

    expect(result.rows[0]).toEqual({
      identities: 'account.identities',
      contacts: 'account.contacts',
      challenges: 'account.authentication_challenges',
      sessions: 'account.sessions',
      consents: 'account.consents',
      roles: 'authz.roles',
      assignments: 'authz.role_assignments',
    });
  });

  it('rejects a provider-scoped role assigned globally', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const identityId = randomUUID();
      await client.query('INSERT INTO account.identities (id) VALUES ($1)', [identityId]);
      await expect(
        client.query(
          `INSERT INTO authz.role_assignments (
             identity_id,
             role_id,
             scope_type,
             reason
           )
           SELECT $1, id, 'global', 'Invalid cross-scope integration test'
           FROM authz.roles
           WHERE role_key = 'provider_owner'`,
          [identityId],
        ),
      ).rejects.toThrow(/does not permit global assignment/i);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });

  it('rejects raw or malformed refresh-token storage', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const identityId = randomUUID();
      await client.query('INSERT INTO account.identities (id) VALUES ($1)', [identityId]);
      await expect(
        client.query(
          `INSERT INTO account.sessions (
             identity_id,
             family_id,
             refresh_token_hash,
             expires_at
           ) VALUES ($1, $2, 'raw-refresh-token', now() + interval '1 day')`,
          [identityId, randomUUID()],
        ),
      ).rejects.toThrow(/sessions_refresh_hash_format/i);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });

  it('writes an immutable audit event for role assignment', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const identityId = randomUUID();
      await client.query('INSERT INTO account.identities (id) VALUES ($1)', [identityId]);
      const assignment = await client.query<{ id: string }>(
        `INSERT INTO authz.role_assignments (
           identity_id,
           role_id,
           scope_type,
           reason
         )
         SELECT $1, id, 'global', 'Synthetic privileged assignment test'
         FROM authz.roles
         WHERE role_key = 'admin'
         RETURNING id`,
        [identityId],
      );
      const assignmentId = assignment.rows[0]?.id;
      const audit = await client.query<{ action: string; resource_id: string }>(
        `SELECT action, resource_id
         FROM platform.audit_events
         WHERE resource_type = 'role_assignment' AND resource_id = $1`,
        [assignmentId],
      );

      expect(audit.rows[0]).toEqual({
        action: 'role_assignment_created',
        resource_id: assignmentId,
      });
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});
