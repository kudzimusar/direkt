import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../scripts/migration-lib';
import { databaseUrl } from '../../scripts/runtime-config';

describe('Phase 3 provider review regressions', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 1 });

  beforeAll(async () => {
    await runMigrations(url);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('rejects requirement inserts into an active version', async () => {
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
        `INSERT INTO catalog.requirements (
           requirement_version_id,
           requirement_key,
           label,
           requirement_kind,
           required,
           guidance
         ) VALUES (
           $1,
           'late_requirement',
           'Late requirement',
           'experience',
           true,
           'This insert must be rejected for an active requirement version.'
         )`,
        [versionId],
      ),
    ).rejects.toThrow(/activated version are immutable/i);
  });
});
