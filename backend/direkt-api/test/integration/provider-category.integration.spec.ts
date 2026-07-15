import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../scripts/migration-lib';
import { databaseUrl } from '../../scripts/runtime-config';

describe('Phase 3 provider and category schema', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 2 });

  beforeAll(async () => {
    await runMigrations(url);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates provider, category and non-public directory contracts', async () => {
    const result = await pool.query<{
      organizations: string | null;
      profiles: string | null;
      categories: string | null;
      versions: string | null;
      public_directory: string | null;
    }>(`
      SELECT
        to_regclass('provider.organizations')::text AS organizations,
        to_regclass('provider.profiles')::text AS profiles,
        to_regclass('catalog.service_categories')::text AS categories,
        to_regclass('catalog.requirement_versions')::text AS versions,
        to_regclass('provider.public_directory')::text AS public_directory
    `);

    expect(result.rows[0]).toEqual({
      organizations: 'provider.organizations',
      profiles: 'provider.profiles',
      categories: 'catalog.service_categories',
      versions: 'catalog.requirement_versions',
      public_directory: 'provider.public_directory',
    });
    const publicCount = await pool.query<{ count: string }>(
      'SELECT count(*)::text AS count FROM provider.public_directory',
    );
    expect(publicCount.rows[0]?.count).toBe('0');
  });

  it('rejects a pathway profile without its required basis', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const identityId = randomUUID();
      const providerId = randomUUID();
      await client.query('INSERT INTO account.identities (id) VALUES ($1)', [identityId]);
      await client.query(
        `INSERT INTO provider.organizations (id, pathway, created_by_identity_id)
         VALUES ($1, 'qualified_individual', $2)`,
        [providerId, identityId],
      );

      await expect(
        client.query(
          `INSERT INTO provider.profiles (
             provider_id,
             display_name,
             operating_model,
             service_area_summary
           ) VALUES ($1, 'Synthetic electrician', 'mobile', 'Lusaka District')`,
          [providerId],
        ),
      ).rejects.toThrow(/requires a qualification summary/i);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });

  it('rejects public discovery and invalid provider state transitions', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const identityId = randomUUID();
      const providerId = randomUUID();
      await client.query('INSERT INTO account.identities (id) VALUES ($1)', [identityId]);
      await client.query(
        `INSERT INTO provider.organizations (id, pathway, created_by_identity_id)
         VALUES ($1, 'experienced_informal', $2)`,
        [providerId, identityId],
      );
      await client.query(
        `INSERT INTO provider.profiles (
           provider_id,
           display_name,
           operating_model,
           service_area_summary,
           experience_summary
         ) VALUES ($1, 'Synthetic mobile mechanic', 'mobile', 'Lusaka District',
                   'Synthetic experience summary for contract testing')`,
        [providerId],
      );

      await expect(
        client.query(
          `UPDATE provider.organizations
           SET status = 'suspended'
           WHERE id = $1`,
          [providerId],
        ),
      ).rejects.toThrow(/invalid provider status transition/i);
      await expect(
        client.query(
          `UPDATE provider.organizations
           SET discoverable = true
           WHERE id = $1`,
          [providerId],
        ),
      ).rejects.toThrow(/phase 3 cannot make a provider discoverable|not_discoverable/i);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });

  it('prevents silent rewrites of active category requirements', async () => {
    const activeVersion = await pool.query<{ id: string }>(
      `SELECT id
       FROM catalog.requirement_versions
       WHERE status = 'active'
       ORDER BY created_at
       LIMIT 1`,
    );
    const versionId = activeVersion.rows[0]?.id;
    expect(versionId).toBeDefined();

    await expect(
      pool.query(
        `UPDATE catalog.requirements
         SET guidance = 'Silently rewritten guidance'
         WHERE requirement_version_id = $1`,
        [versionId],
      ),
    ).rejects.toThrow(/immutable/i);
  });

  it('writes immutable provider audit events', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const identityId = randomUUID();
      const providerId = randomUUID();
      await client.query('INSERT INTO account.identities (id) VALUES ($1)', [identityId]);
      await client.query(
        `INSERT INTO provider.organizations (id, pathway, created_by_identity_id)
         VALUES ($1, 'registered_business', $2)`,
        [providerId, identityId],
      );
      const audit = await client.query<{ action: string; provider_id: string }>(
        `SELECT action, provider_id
         FROM platform.audit_events
         WHERE resource_type = 'provider_organization' AND resource_id = $1`,
        [providerId],
      );
      expect(audit.rows[0]).toEqual({
        action: 'provider_organization_created',
        provider_id: providerId,
      });
      await expect(
        client.query(
          `UPDATE platform.audit_events
           SET outcome = 'failed'
           WHERE resource_type = 'provider_organization' AND resource_id = $1`,
          [providerId],
        ),
      ).rejects.toThrow(/append-only/i);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});
