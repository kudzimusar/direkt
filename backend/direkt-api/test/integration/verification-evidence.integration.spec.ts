import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../scripts/migration-lib';
import { databaseUrl } from '../../scripts/runtime-config';

interface Fixture {
  providerId: string;
  ownerId: string;
  reviewerId: string;
  requirementId: string;
  requirementVersionId: string;
  categoryId: string;
  evidenceId: string;
  versionId: string;
  caseId: string;
}

async function createFixture(client: PoolClient): Promise<Fixture> {
  const providerId = randomUUID();
  const ownerId = randomUUID();
  const reviewerId = randomUUID();
  const uploadSessionId = randomUUID();
  const evidenceId = randomUUID();
  const versionId = randomUUID();
  const caseId = randomUUID();
  const categoryId = '00000000-0000-4000-8000-000000003001';
  const requirementVersionId = '00000000-0000-4000-8000-000000003101';
  const requirementResult = await client.query<{ id: string }>(
    `SELECT id FROM catalog.requirements
     WHERE requirement_version_id = $1 AND requirement_key = 'identity'`,
    [requirementVersionId],
  );
  const requirementId = requirementResult.rows[0]?.id;
  if (!requirementId) {
    throw new Error('Synthetic identity requirement is missing.');
  }

  await client.query('INSERT INTO account.identities (id) VALUES ($1), ($2)', [
    ownerId,
    reviewerId,
  ]);
  await client.query(
    `INSERT INTO provider.organizations (
       id, pathway, created_by_identity_id, status
     ) VALUES ($1, 'registered_business', $2, 'ready_for_verification')`,
    [providerId, ownerId],
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
       'Synthetic Phase 4 Provider',
       'fixed_premises',
       'Woodlands, Lusaka',
       'Lusaka District',
       'Synthetic Phase 4 Provider Limited'
     )`,
    [providerId],
  );
  await client.query(
    `INSERT INTO provider.category_selections (
       provider_id, category_id, requirement_version_id, status
     ) VALUES ($1, $2, $3, 'selected')`,
    [providerId, categoryId, requirementVersionId],
  );
  await client.query(
    `INSERT INTO authz.role_assignments (
       identity_id, role_id, scope_type, assigned_by_identity_id, reason
     )
     SELECT $1, id, 'global', $1, 'Synthetic reviewer role for Phase 4 database test'
     FROM authz.roles WHERE role_key = 'reviewer'`,
    [reviewerId],
  );
  await client.query(
    `INSERT INTO verification.cases (
       id,
       provider_id,
       category_id,
       requirement_version_id,
       requirement_id,
       check_key,
       check_family,
       policy_version,
       created_by_identity_id
     ) VALUES (
       $1, $2, $3, $4, $5,
       'representative_identity_check',
       'representative_identity',
       'phase4-v1',
       $6
     )`,
    [caseId, providerId, categoryId, requirementVersionId, requirementId, ownerId],
  );
  await client.query(`UPDATE verification.cases SET status = 'awaiting_evidence' WHERE id = $1`, [
    caseId,
  ]);
  await client.query(
    `INSERT INTO evidence.items (
       id, provider_id, requirement_id, submitted_by_identity_id, status, retention_class
     ) VALUES ($1, $2, $3, $4, 'processing', 'regulated')`,
    [evidenceId, providerId, requirementId, ownerId],
  );
  const objectKey = `private/${providerId}/${uploadSessionId}/${randomUUID()}`;
  await client.query(
    `INSERT INTO evidence.upload_sessions (
       id,
       provider_id,
       requirement_id,
       created_by_identity_id,
       evidence_class,
       document_type,
       object_key,
       expected_content_type,
       max_bytes,
       consent_confirmed,
       status,
       expires_at,
       completed_at
     ) VALUES (
       $1, $2, $3, $4,
       'identity',
       'national_identity_document',
       $5,
       'application/pdf',
       1048576,
       true,
       'completed',
       now() + interval '10 minutes',
       now()
     )`,
    [uploadSessionId, providerId, requirementId, ownerId, objectKey],
  );
  await client.query(
    `INSERT INTO evidence.versions (
       id,
       evidence_id,
       version_number,
       upload_session_id,
       object_key,
       evidence_class,
       document_type,
       content_type,
       size_bytes,
       sha256,
       issuing_authority,
       expires_at,
       processing_status,
       submitted_by_identity_id
     ) VALUES (
       $1, $2, 1, $3, $4,
       'identity',
       'national_identity_document',
       'application/pdf',
       2048,
       $5,
       'Synthetic Authority',
       now() + interval '1 day',
       'clean',
       $6
     )`,
    [versionId, evidenceId, uploadSessionId, objectKey, 'a'.repeat(64), ownerId],
  );
  await client.query(
    `UPDATE evidence.items
     SET current_version_id = $2, status = 'ready_for_review'
     WHERE id = $1`,
    [evidenceId, versionId],
  );
  await client.query(
    `INSERT INTO verification.case_evidence (case_id, evidence_id, linked_by_identity_id)
     VALUES ($1, $2, $3)`,
    [caseId, evidenceId, ownerId],
  );
  await client.query(`UPDATE verification.cases SET status = 'ready_for_review' WHERE id = $1`, [
    caseId,
  ]);
  await client.query(
    `INSERT INTO verification.assignments (
       case_id,
       assignee_identity_id,
       assignment_kind,
       assigned_by_identity_id,
       reason
     ) VALUES ($1, $2, 'reviewer', $2, 'Synthetic assigned reviewer for Phase 4 database test')`,
    [caseId, reviewerId],
  );
  await client.query(`UPDATE verification.cases SET status = 'assigned' WHERE id = $1`, [caseId]);
  await client.query(`UPDATE verification.cases SET status = 'in_review' WHERE id = $1`, [caseId]);

  return {
    providerId,
    ownerId,
    reviewerId,
    requirementId,
    requirementVersionId,
    categoryId,
    evidenceId,
    versionId,
    caseId,
  };
}

describe('Phase 4 verification and evidence schema', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 2 });

  beforeAll(async () => {
    await runMigrations(url);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates private evidence, verification and safe claim-card boundaries', async () => {
    const result = await pool.query<{
      evidence_items: string | null;
      evidence_versions: string | null;
      cases: string | null;
      claims: string | null;
      safe_claim_cards: string | null;
    }>(`
      SELECT
        to_regclass('evidence.items')::text AS evidence_items,
        to_regclass('evidence.versions')::text AS evidence_versions,
        to_regclass('verification.cases')::text AS cases,
        to_regclass('verification.claims')::text AS claims,
        to_regclass('verification.safe_claim_cards')::text AS safe_claim_cards
    `);
    expect(result.rows[0]).toEqual({
      evidence_items: 'evidence.items',
      evidence_versions: 'evidence.versions',
      cases: 'verification.cases',
      claims: 'verification.claims',
      safe_claim_cards: 'verification.safe_claim_cards',
    });

    const columns = await pool.query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'verification' AND table_name = 'safe_claim_cards'`,
    );
    const names = columns.rows.map((row) => row.column_name);
    expect(names).not.toContain('object_key');
    expect(names).not.toContain('sha256');
    expect(names).not.toContain('reviewer_identity_id');
    expect(names).not.toContain('private_notes');
  });

  it('keeps evidence versions and decisions append-only and blocks direct claims', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const fixture = await createFixture(client);

      await client.query('SAVEPOINT immutable_version');
      await expect(
        client.query(`UPDATE evidence.versions SET size_bytes = 4096 WHERE id = $1`, [
          fixture.versionId,
        ]),
      ).rejects.toThrow(/append-only/i);
      await client.query('ROLLBACK TO SAVEPOINT immutable_version');

      await client.query('SAVEPOINT direct_claim');
      await expect(
        client.query(
          `INSERT INTO verification.claims (
             provider_id,
             case_id,
             created_by_decision_id,
             claim_key,
             claim_statement,
             limitation,
             evidence_class,
             checked_at,
             valid_until,
             policy_version
           ) VALUES (
             $1, $2, $3,
             'direct_database_claim',
             'Direct database claim',
             'This insert must be rejected.',
             'representative_identity',
             now(),
             now() + interval '1 day',
             'phase4-v1'
           )`,
          [fixture.providerId, fixture.caseId, randomUUID()],
        ),
      ).rejects.toThrow(/validated decision/i);
      await client.query('ROLLBACK TO SAVEPOINT direct_claim');
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });

  it('rejects provider self-review and finance-only assignments', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const fixture = await createFixture(client);
      const financeId = randomUUID();
      await client.query('INSERT INTO account.identities (id) VALUES ($1)', [financeId]);
      await client.query(
        `INSERT INTO authz.role_assignments (
           identity_id, role_id, scope_type, assigned_by_identity_id, reason
         )
         SELECT $1, id, 'global', $1, 'Synthetic finance role for Phase 4 database test'
         FROM authz.roles WHERE role_key = 'finance'`,
        [financeId],
      );

      await client.query('SAVEPOINT owner_assignment');
      await expect(
        client.query(
          `INSERT INTO verification.assignments (
             case_id, assignee_identity_id, assignment_kind, assigned_by_identity_id, reason
           ) VALUES ($1, $2, 'reviewer', $2, 'Owner must not review their own provider evidence')`,
          [fixture.caseId, fixture.ownerId],
        ),
      ).rejects.toThrow(/own provider/i);
      await client.query('ROLLBACK TO SAVEPOINT owner_assignment');

      await client.query('SAVEPOINT finance_assignment');
      await expect(
        client.query(
          `INSERT INTO verification.assignments (
             case_id, assignee_identity_id, assignment_kind, assigned_by_identity_id, reason
           ) VALUES ($1, $2, 'reviewer', $2, 'Finance must not receive verification decision scope')`,
          [fixture.caseId, financeId],
        ),
      ).rejects.toThrow(/required active verification role/i);
      await client.query('ROLLBACK TO SAVEPOINT finance_assignment');
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });

  it('derives a scoped claim only from a valid decision and expires it deterministically', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const fixture = await createFixture(client);
      await client.query(
        `INSERT INTO verification.recommendations (
           case_id,
           reviewer_identity_id,
           result,
           reason_code,
           rationale,
           limitation,
           recommended_valid_until
         ) VALUES (
           $1,
           $2,
           'approve',
           'CHECK_PASSED',
           'The synthetic private evidence satisfies the scoped identity checklist.',
           'This check does not verify qualifications, safety or future workmanship.',
           now() + interval '1 day'
         )`,
        [fixture.caseId, fixture.reviewerId],
      );
      const decision = await client.query<{ decision_id: string }>(
        `SELECT verification.record_decision(
           $1,
           $2,
           'approved',
           'CHECK_PASSED',
           'The scoped synthetic representative identity check passed after assigned review.',
           'representative_identity_checked',
           'Representative identity checked',
           'This does not verify qualifications, safety or future workmanship.',
           now() + interval '1 day',
           'phase4-v1'
         ) AS decision_id`,
        [fixture.caseId, fixture.reviewerId],
      );
      expect(decision.rows[0]?.decision_id).toBeDefined();

      const activeClaim = await client.query<{
        claim_statement: string;
        status: string;
      }>(
        `SELECT claim_statement, status
         FROM verification.safe_claim_cards
         WHERE provider_id = $1`,
        [fixture.providerId],
      );
      expect(activeClaim.rows[0]).toEqual({
        claim_statement: 'Representative identity checked',
        status: 'active',
      });

      const expiry = await client.query<{ affected: number }>(
        `SELECT verification.degrade_expired_claims(now() + interval '2 days') AS affected`,
      );
      expect(Number(expiry.rows[0]?.affected ?? 0)).toBe(1);

      const expiredClaim = await client.query<{ status: string }>(
        `SELECT status FROM verification.safe_claim_cards WHERE provider_id = $1`,
        [fixture.providerId],
      );
      expect(expiredClaim.rows[0]?.status).toBe('expired');
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});
