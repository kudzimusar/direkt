import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../scripts/migration-lib';
import { databaseUrl } from '../../scripts/runtime-config';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retry_after_seconds: number;
  current_count: number;
}

const url = databaseUrl();
const pool = new Pool({ connectionString: url });
const subjectHash = 'a'.repeat(64);

async function consume(observedAt: string): Promise<RateLimitResult> {
  const result = await pool.query<RateLimitResult>(
    `SELECT allowed, remaining, retry_after_seconds, current_count
     FROM security.consume_rate_limit($1, $2::character(64), $3, $4, $5)`,
    ['phase10_concurrency_test', subjectHash, 300, 5, observedAt],
  );
  const row = result.rows[0];
  if (!row) throw new Error('Rate-limit integration function returned no row.');
  return row;
}

beforeAll(async () => {
  await runMigrations(url);
  await pool.query(
    `DELETE FROM security.rate_limit_buckets
     WHERE policy_key = 'phase10_concurrency_test' AND subject_hash = $1`,
    [subjectHash],
  );
});

afterAll(async () => {
  await pool.query(
    `DELETE FROM security.rate_limit_buckets
     WHERE policy_key = 'phase10_concurrency_test' AND subject_hash = $1`,
    [subjectHash],
  );
  await pool.end();
});

describe('Phase 10 distributed abuse controls', () => {
  it('allows exactly five concurrent requests and rejects the sixth', async () => {
    const outcomes = await Promise.all(
      Array.from({ length: 6 }, () => consume('2026-07-17T09:01:00.000Z')),
    );

    expect(outcomes.filter((outcome) => outcome.allowed)).toHaveLength(5);
    expect(outcomes.filter((outcome) => !outcome.allowed)).toHaveLength(1);
    expect(outcomes.map((outcome) => outcome.current_count).sort((a, b) => a - b)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(outcomes.every((outcome) => outcome.retry_after_seconds === 240)).toBe(true);
  });

  it('opens a separate allowance in the next fixed window', async () => {
    const outcome = await consume('2026-07-17T09:06:00.000Z');

    expect(outcome).toMatchObject({
      allowed: true,
      remaining: 4,
      current_count: 1,
      retry_after_seconds: 240,
    });
  });

  it('prunes only expired counters outside the bounded retention interval', async () => {
    const result = await pool.query<{ deleted: number }>(
      `SELECT security.prune_expired_rate_limits(
         '2026-07-17T11:00:00.000Z'::timestamptz,
         interval '1 hour'
       ) AS deleted`,
    );

    expect(result.rows[0]?.deleted).toBeGreaterThanOrEqual(2);
    const remaining = await pool.query<{ count: string }>(
      `SELECT count(*)::text AS count
       FROM security.rate_limit_buckets
       WHERE policy_key = 'phase10_concurrency_test' AND subject_hash = $1`,
      [subjectHash],
    );
    expect(remaining.rows[0]?.count).toBe('0');
  });
});
