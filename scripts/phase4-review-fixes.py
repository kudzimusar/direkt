from pathlib import Path

migration = Path("database/migrations/202607151210_phase4_review_controls.sql")
if migration.exists():
    print("Phase 4 review fixes are already present.")
    raise SystemExit(0)


dto_path = Path("backend/direkt-api/src/verification-evidence/verification-evidence.dto.ts")
dto = dto_path.read_text()
marker = "export class CreateUploadSessionDto {\n  @ApiProperty({ example: 'identity' })"
replacement = """export class CreateUploadSessionDto {
  @ApiPropertyOptional({ example: 'plumbing' })
  @IsOptional()
  @Matches(/^[a-z][a-z0-9_]{2,63}$/)
  categoryKey?: string;

  @ApiProperty({ example: 'identity' })"""
if marker not in dto:
    raise SystemExit("DTO insertion marker not found")
dto_path.write_text(dto.replace(marker, replacement, 1))


service_path = Path("backend/direkt-api/src/verification-evidence/verification-evidence.service.ts")
service = service_path.read_text()
old = "const requirement = await this.repository.resolveRequirement(providerId, dto.requirementKey);"
new = """const requirement = await this.repository.resolveRequirement(
        providerId,
        dto.categoryKey,
        dto.requirementKey,
      );"""
if old not in service:
    raise SystemExit("Service requirement lookup marker not found")
service_path.write_text(service.replace(old, new, 1))


repository_path = Path(
    "backend/direkt-api/src/verification-evidence/verification-evidence.repository.ts"
)
repository = repository_path.read_text()
start = repository.index("  async resolveRequirement(")
end = repository.index("\n\n  async createUploadSession", start)
method = """  async resolveRequirement(providerId: string, requirementKey: string): Promise<RequirementRow>;
  async resolveRequirement(
    providerId: string,
    categoryKey: string | undefined,
    requirementKey: string,
  ): Promise<RequirementRow>;
  async resolveRequirement(
    providerId: string,
    categoryKeyOrRequirementKey: string | undefined,
    maybeRequirementKey?: string,
  ): Promise<RequirementRow> {
    const categoryKey = maybeRequirementKey ? categoryKeyOrRequirementKey : undefined;
    const requirementKey = maybeRequirementKey ?? categoryKeyOrRequirementKey;
    if (!requirementKey) {
      throw new NotFoundException('Selected provider requirement was not found.');
    }

    const result = await this.database.query<RequirementRow>(
      `SELECT
         requirements.id AS requirement_id,
         requirements.requirement_key,
         requirements.label AS requirement_label,
         categories.id AS category_id,
         categories.category_key,
         versions.id AS requirement_version_id
       FROM provider.category_selections AS selections
       JOIN catalog.service_categories AS categories ON categories.id = selections.category_id
       JOIN catalog.requirement_versions AS versions
         ON versions.id = selections.requirement_version_id
       JOIN catalog.requirements AS requirements
         ON requirements.requirement_version_id = versions.id
       WHERE selections.provider_id = $1
         AND selections.status = 'selected'
         AND ($2::text IS NULL OR categories.category_key = $2)
         AND requirements.requirement_key = $3
       ORDER BY categories.category_key
       LIMIT 2`,
      [providerId, categoryKey ?? null, requirementKey],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('Selected provider requirement was not found.');
    }
    if (result.rows.length > 1) {
      throw new ConflictException(
        'Category key is required when a requirement exists in more than one selected category.',
      );
    }
    return result.rows[0] as RequirementRow;
  }"""
repository = repository[:start] + method + repository[end:]
repository = repository.replace(
    "evidenceClass: input.dto.evidenceClass,\n          documentType: input.dto.documentType,",
    "categoryKey: input.requirement.category_key,\n          evidenceClass: input.dto.evidenceClass,\n          documentType: input.dto.documentType,",
    1,
)
repository_path.write_text(repository)


migration.write_text(
    """CREATE FUNCTION verification.validate_reason_semantics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  expected_outcome text;
  submitted_outcome text;
BEGIN
  SELECT outcome INTO expected_outcome
  FROM verification.reason_codes
  WHERE code = NEW.reason_code
    AND active = true;

  IF expected_outcome IS NULL THEN
    RAISE EXCEPTION 'Verification reason code is inactive or unknown';
  END IF;

  submitted_outcome := CASE
    WHEN TG_TABLE_NAME = 'recommendations' THEN
      CASE NEW.result
        WHEN 'approve' THEN 'approve'
        WHEN 'reject' THEN 'reject'
        WHEN 'correction_required' THEN 'correction'
        ELSE 'revoke'
      END
    ELSE
      CASE NEW.result
        WHEN 'approved' THEN 'approve'
        WHEN 'rejected' THEN 'reject'
        WHEN 'correction_required' THEN 'correction'
        ELSE 'revoke'
      END
  END;

  IF submitted_outcome IS DISTINCT FROM expected_outcome THEN
    RAISE EXCEPTION 'Reason code outcome % does not match submitted result %',
      expected_outcome,
      NEW.result;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER verification_recommendations_reason_semantics
BEFORE INSERT ON verification.recommendations
FOR EACH ROW
EXECUTE FUNCTION verification.validate_reason_semantics();

CREATE TRIGGER verification_decisions_reason_semantics
BEFORE INSERT ON verification.decisions
FOR EACH ROW
EXECUTE FUNCTION verification.validate_reason_semantics();

CREATE FUNCTION verification.validate_decision_lifecycle()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  current_case_status text;
BEGIN
  SELECT status INTO current_case_status
  FROM verification.cases
  WHERE id = NEW.case_id
  FOR UPDATE;

  IF current_case_status IS NULL THEN
    RAISE EXCEPTION 'Unknown verification case';
  END IF;

  IF current_case_status <> 'in_review' THEN
    RAISE EXCEPTION 'Final decisions require a verification case in in_review state';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER verification_decisions_lifecycle
BEFORE INSERT ON verification.decisions
FOR EACH ROW
EXECUTE FUNCTION verification.validate_decision_lifecycle();

COMMENT ON FUNCTION verification.validate_reason_semantics() IS
  'Prevents recommendation and decision outcomes from contradicting their immutable reason code.';
COMMENT ON FUNCTION verification.validate_decision_lifecycle() IS
  'Allows one final decision only while a case is actively in review; appeals or renewals must re-enter review explicitly.';
"""
)


regression = Path(
    "backend/direkt-api/test/integration/verification-review-regressions.integration.spec.ts"
)
regression.write_text(
    """import { Test, type TestingModule } from '@nestjs/testing';
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

    await pool.query('INSERT INTO account.identities (id) VALUES ($1), ($2)', [ownerId, reviewerId]);
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
    const scopedRequirement = await repository.resolveRequirement(providerId, 'plumbing', 'identity');
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
"""
)

print("Phase 4 review fixes staged.")
