import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const databaseUrl = process.env.DATABASE_URL;
const describeDatabase = databaseUrl ? describe : describe.skip;

describeDatabase('Phase 3 provider/category migration', () => {
  const pool = new Pool({ connectionString: databaseUrl! });
  let identityId: string;
  let providerId: string;
  let categoryId: string;
  let requirementVersionId: string;

  beforeAll(async () => {
    identityId = randomUUID();
    await pool.query(`INSERT INTO account.identities (id) VALUES ($1)`, [identityId]);
    const provider = await pool.query<{ id: string }>(
      `INSERT INTO provider.organizations (pathway, created_by_identity_id)
       VALUES ('qualified_individual', $1)
       RETURNING id`,
      [identityId],
    );
    providerId = provider.rows[0]!.id;
    await pool.query(
      `INSERT INTO provider.profiles (
         provider_id, display_name, operating_model, service_area_label, updated_by_identity_id
       ) VALUES ($1, 'Synthetic provider', 'mobile', 'Lusaka Central', $2)`,
      [providerId, identityId],
    );
    const category = await pool.query<{ id: string; requirement_version_id: string }>(
      `SELECT c.id, rv.id AS requirement_version_id
         FROM catalog.categories c
         JOIN catalog.category_requirement_versions rv
           ON rv.category_id = c.id AND rv.status = 'active'
        WHERE c.category_key = 'plumbing'`,
    );
    categoryId = category.rows[0]!.id;
    requirementVersionId = category.rows[0]!.requirement_version_id;
  });

  afterAll(async () => {
    await pool.end();
  });

  it('cannot create a discoverable Phase 3 provider profile', async () => {
    await expect(
      pool.query(
        `UPDATE provider.profiles SET discoverability_state = 'public' WHERE provider_id = $1`,
        [providerId],
      ),
    ).rejects.toThrow();
  });

  it('enforces operating-model requirements', async () => {
    const otherProvider = await pool.query<{ id: string }>(
      `INSERT INTO provider.organizations (pathway, created_by_identity_id)
       VALUES ('experienced_informal', $1) RETURNING id`,
      [identityId],
    );
    await expect(
      pool.query(
        `INSERT INTO provider.profiles (
           provider_id, display_name, operating_model, updated_by_identity_id
         ) VALUES ($1, 'Invalid mobile provider', 'mobile', $2)`,
        [otherProvider.rows[0]!.id, identityId],
      ),
    ).rejects.toThrow();
  });

  it('rejects invalid state transitions at the database boundary', async () => {
    await pool.query(
      `UPDATE provider.profiles SET profile_state = 'archived', updated_by_identity_id = $2
        WHERE provider_id = $1`,
      [providerId, identityId],
    );
    await expect(
      pool.query(
        `UPDATE provider.profiles SET profile_state = 'draft', updated_by_identity_id = $2
          WHERE provider_id = $1`,
        [providerId, identityId],
      ),
    ).rejects.toThrow(/Invalid provider profile transition/);
  });

  it('keeps activated category requirement definitions immutable', async () => {
    await expect(
      pool.query(
        `UPDATE catalog.category_requirement_versions
            SET requirements = '[]'::jsonb
          WHERE id = $1`,
        [requirementVersionId],
      ),
    ).rejects.toThrow(/immutable/);
  });

  it('enforces matching category and requirement version', async () => {
    const other = await pool.query<{ id: string }>(
      `SELECT id FROM catalog.categories WHERE id <> $1 ORDER BY category_key LIMIT 1`,
      [categoryId],
    );
    await expect(
      pool.query(
        `INSERT INTO provider.profile_categories (
           provider_id, category_id, requirement_version_id, selected_by_identity_id
         ) VALUES ($1, $2, $3, $4)`,
        [providerId, other.rows[0]!.id, requirementVersionId, identityId],
      ),
    ).rejects.toThrow();
  });

  it('writes immutable profile audit events', async () => {
    const audit = await pool.query<{ count: string }>(
      `SELECT count(*)::text AS count
         FROM platform.audit_events
        WHERE resource_type = 'provider_profile' AND resource_id = $1`,
      [providerId],
    );
    expect(Number(audit.rows[0]!.count)).toBeGreaterThanOrEqual(2);
  });
});
