import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../scripts/migration-lib';
import { databaseUrl } from '../../scripts/runtime-config';

describe('PostgreSQL/PostGIS foundation', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 2 });

  beforeAll(async () => {
    await runMigrations(url);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('has PostGIS and required platform tables', async () => {
    const result = await pool.query<{
      postgis_version: string;
      audit_table: string | null;
      outbox_table: string | null;
      idempotency_table: string | null;
    }>(`
      SELECT
        PostGIS_Version() AS postgis_version,
        to_regclass('platform.audit_events')::text AS audit_table,
        to_regclass('platform.outbox_events')::text AS outbox_table,
        to_regclass('platform.idempotency_keys')::text AS idempotency_table
    `);

    expect(result.rows[0]).toMatchObject({
      audit_table: 'platform.audit_events',
      outbox_table: 'platform.outbox_events',
      idempotency_table: 'platform.idempotency_keys',
    });
    expect(result.rows[0]?.postgis_version).toMatch(/^3\.6/);
  });

  it('performs an SRID-correct Lusaka point operation', async () => {
    const result = await pool.query<{ point: string; srid: number }>(`
      SELECT
        ST_AsText(ST_SetSRID(ST_MakePoint(28.3228, -15.3875), 4326)) AS point,
        ST_SRID(ST_SetSRID(ST_MakePoint(28.3228, -15.3875), 4326)) AS srid
    `);

    expect(result.rows[0]).toEqual({
      point: 'POINT(28.3228 -15.3875)',
      srid: 4326,
    });
  });

  it('rejects mutation of append-only audit events', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const inserted = await client.query<{ id: string }>(`
        INSERT INTO platform.audit_events (
          actor_type,
          action,
          resource_type,
          outcome,
          metadata
        ) VALUES ('system', 'integration_test', 'platform_foundation', 'success', '{"synthetic":true}')
        RETURNING id
      `);

      const id = inserted.rows[0]?.id;
      expect(id).toBeTruthy();
      await expect(
        client.query('UPDATE platform.audit_events SET outcome = $1 WHERE id = $2', ['failed', id]),
      ).rejects.toThrow(/append-only/);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});
