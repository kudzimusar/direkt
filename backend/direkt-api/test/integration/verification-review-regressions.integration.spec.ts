import { Test, type TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../scripts/migration-lib';
import { databaseUrl } from '../../scripts/runtime-config';
import { AppModule } from '../../src/app.module';
import { VerificationEvidenceRepository } from '../../src/verification-evidence/verification-evidence.repository';

describe('Phase 4 automated review regressions', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 2 });
  let moduleRef: TestingModule;
  let repository: VerificationEvidenceRepository;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    repository = moduleRef.get(VerificationEvidenceRepository);
  });

  afterAll(async () => {
    await moduleRef.close();
    await pool.end();
  });

  it('enforces category scope, decision lifecycle and reason semantics', async () => {
    const ownerId = randomUUID();
    const reviewerId = randomUUID();
    const providerId = randomUUID();
    const caseId = randomUUID();

    await pool.query('INSERT INTO account.identities (id) VALUES ($1), ($2)', [
      ownerId,
      reviewerId,
    ]);
    await pool.query(
      `INSERT INTO provider.organizations (
         id, pathway, created_by_identity_id, status
       ) VALUES ($1, 'registered_business', $2, 'ready_for_verification')`,
      [providerId, ownerId],
    );
    await pool.query(
      `INSERT INTO provider.profiles (
         provider_id,
         display_name,
         operating_model,
         locality_summary,
         service_area_summary,
         registered_business_name
       ) VALUES ($1, $2, 'fixed_premises', $3, $4, $5)`,
      [
        providerId,
        'Synthetic Review Regression Provider',
        'Woodlands, Lusaka',
        'Lusaka District synthetic review area',
        'Synthetic Review Regression Limited',
      ],
    );
    await pool.query(
      `INSERT INTO provider.category_selections (
         provider_id, category_id, requirement_version_id
       ) VALUES
         ($1, '00000000-0000-4000-8000-000000003001', '00000000-0000-4000-8000-000000003101'),
         ($1, '00000000-0000-4000-8000-000000003002', '00000000-0000-4000-8000-000000003102')`,
      [providerId],
    );

    await expect(repository.resolveRequirement(providerId, undefined, 'identity')).rejects.toThrow(
      /Category key is required/,
    );
    const scopedRequirement = await repository.resolveRequirement(
      providerId,
      'plumbing',
      'identity',
    );
    expect(scopedRequirement.category_key).toBe('plumbing');

    const requirement = await pool.query<{
      category_id: string;
      requirement_id: string;
      requirement_version_id: string;
    }>(
      `SELECT
         categories.id AS category_id,
         requirements.id AS requirement_id,
         versions.id AS requirement_version_id
       FROM catalog.service_categories AS categories
       JOIN catalog.requirement_versions AS versions ON versions.category_id = categories.id
       JOIN catalog.requirements AS requirements ON requirements.requirement_version_id = versions.id
       WHERE categories.category_key = 'plumbing'
         AND versions.status = 'active'
         AND requirements.requirement_key = 'identity'`,
    );
    const requirementRow = requirement.rows[0];
    if (!requirementRow) {
      throw new Error('Synthetic plumbing identity requirement was not found.');
    }

    await pool.query(
      `INSERT INTO verification.cases (
         id,
         provider_id,
         category_id,
         requirement_version_id,
         requirement_id,
         check_key,
         check_family,
         status,
         policy_version,
         created_by_identity_id
       ) VALUES ($1, $2, $3, $4, $5, 'representative_identity_check',
         'representative_identity', 'in_review', 'phase4-v1', $6)`,
      [
        caseId,
        providerId,
        requirementRow.category_id,
        requirementRow.requirement_version_id,
        requirementRow.requirement_id,
        ownerId,
      ],
    );
    await pool.query(
      `INSERT INTO authz.role_assignments (
         identity_id, role_id, scope_type, assigned_by_identity_id, reason
       )
       SELECT $1, id, 'global', $1, $2
       FROM authz.roles
       WHERE role_key = 'reviewer'`,
      [reviewerId, 'Synthetic reviewer role for Phase 4 regression coverage'],
    );
    await pool.query(
      `INSERT INTO verification.assignments (
         case_id,
         assignee_identity_id,
         assignment_kind,
         assigned_by_identity_id,
         reason
       ) VALUES ($1, $2, 'reviewer', $2, $3)`,
      [caseId, reviewerId, 'Independent synthetic reviewer assignment for regression coverage'],
    );

    await expect(
      pool.query(
        `INSERT INTO verification.recommendations (
           case_id, reviewer_identity_id, result, reason_code, rationale
         ) VALUES ($1, $2, 'approve', 'EXPIRED_EVIDENCE', $3)`,
        [caseId, reviewerId, 'This deliberately mismatched recommendation must be rejected.'],
      ),
    ).rejects.toThrow(/does not match submitted result/);

    await expect(
      pool.query(
        `SELECT verification.record_decision(
           $1, $2, 'approved', 'EXPIRED_EVIDENCE', $3,
           'representative_identity_checked', 'Representative identity checked',
           'This does not verify qualifications, safety or future workmanship.',
           now() + interval '1 year', 'phase4-v1'
         )`,
        [caseId, reviewerId, 'This deliberately mismatched decision must be rejected.'],
      ),
    ).rejects.toThrow(/does not match submitted result/);

    await pool.query(
      `SELECT verification.record_decision(
         $1, $2, 'approved', 'CHECK_PASSED', $3,
         'representative_identity_checked', 'Representative identity checked',
         'This does not verify qualifications, safety or future workmanship.',
         now() + interval '1 year', 'phase4-v1'
       )`,
      [caseId, reviewerId, 'The scoped synthetic check passed its independent review.'],
    );

    await expect(
      pool.query(
        `SELECT verification.record_decision(
           $1, $2, 'approved', 'CHECK_PASSED', $3,
           'representative_identity_checked', 'Representative identity checked',
           'This does not verify qualifications, safety or future workmanship.',
           now() + interval '1 year', 'phase4-v1'
         )`,
        [caseId, reviewerId, 'A repeat final decision on a closed lifecycle must be rejected.'],
      ),
    ).rejects.toThrow(/in_review state/);
  });
});
