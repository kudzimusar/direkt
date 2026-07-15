import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { PoolClient } from 'pg';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { DatabaseService } from '../platform/database/database.service';
import type {
  AssignVerificationCaseDto,
  ConfirmEvidenceDto,
  CreateDecisionDto,
  CreateFieldVisitDto,
  CreateRecommendationDto,
  CreateUploadSessionDto,
  CreateVerificationCaseDto,
} from './verification-evidence.dto';
import type {
  EvidenceStatus,
  EvidenceView,
  EvidenceVersionView,
  SafeClaimCard,
  VerificationCaseStatus,
  VerificationCaseView,
  VerificationCheckFamily,
  VerificationQueueItem,
} from './verification-evidence.types';

interface RequirementRow {
  requirement_id: string;
  requirement_key: string;
  requirement_label: string;
  category_id: string;
  category_key: string;
  requirement_version_id: string;
}

interface UploadSessionRow {
  id: string;
  provider_id: string;
  requirement_id: string;
  created_by_identity_id: string;
  replacement_for_evidence_id: string | null;
  evidence_class: EvidenceVersionView['evidenceClass'];
  document_type: string;
  object_key: string;
  expected_content_type: string;
  max_bytes: string;
  status: string;
  expires_at: Date;
}

interface EvidenceRow {
  id: string;
  provider_id: string;
  requirement_key: string;
  requirement_label: string;
  status: EvidenceStatus;
  retention_class: EvidenceView['retentionClass'];
  created_at: Date;
  updated_at: Date;
  version_id: string | null;
  version_number: number | null;
  evidence_class: EvidenceVersionView['evidenceClass'] | null;
  document_type: string | null;
  content_type: string | null;
  size_bytes: string | null;
  sha256: string | null;
  issuing_authority: string | null;
  issued_at: string | null;
  valid_from: string | null;
  expires_at: Date | null;
  processing_status: EvidenceVersionView['processingStatus'] | null;
  version_created_at: Date | null;
}

interface CaseRow {
  id: string;
  provider_id: string;
  category_key: string;
  requirement_key: string;
  requirement_label: string;
  check_key: string;
  check_family: VerificationCheckFamily;
  status: VerificationCaseStatus;
  high_risk: boolean;
  policy_version: string;
  assigned_reviewer_identity_id: string | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class VerificationEvidenceRepository {
  constructor(private readonly database: DatabaseService) {}

  async resolveRequirement(providerId: string, requirementKey: string): Promise<RequirementRow> {
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
         AND requirements.requirement_key = $2
       ORDER BY categories.category_key
       LIMIT 2`,
      [providerId, requirementKey],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('Selected provider requirement was not found.');
    }
    if (result.rows.length > 1) {
      throw new ConflictException(
        'Requirement key is ambiguous across selected provider categories.',
      );
    }
    return result.rows[0] as RequirementRow;
  }

  async createUploadSession(input: {
    actor: AuthenticatedActor;
    providerId: string;
    dto: CreateUploadSessionDto;
    requirement: RequirementRow;
    uploadSessionId: string;
    objectKey: string;
    expiresAt: Date;
    requestId?: string | undefined;
  }): Promise<void> {
    await this.database.transaction(async (client) => {
      await client.query(
        `INSERT INTO evidence.upload_sessions (
           id,
           provider_id,
           requirement_id,
           created_by_identity_id,
           replacement_for_evidence_id,
           evidence_class,
           document_type,
           object_key,
           expected_content_type,
           max_bytes,
           consent_confirmed,
           expires_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          input.uploadSessionId,
          input.providerId,
          input.requirement.requirement_id,
          input.actor.identityId,
          input.dto.replacementForEvidenceId ?? null,
          input.dto.evidenceClass,
          input.dto.documentType,
          input.objectKey,
          input.dto.contentType,
          input.dto.maxBytes,
          input.dto.consentConfirmed,
          input.expiresAt,
        ],
      );
      await this.insertAudit(client, {
        actor: input.actor,
        providerId: input.providerId,
        requestId: input.requestId,
        action: 'evidence_upload_session_created',
        resourceType: 'evidence_upload_session',
        resourceId: input.uploadSessionId,
        metadata: {
          evidenceClass: input.dto.evidenceClass,
          documentType: input.dto.documentType,
          replacement: Boolean(input.dto.replacementForEvidenceId),
          objectKeyExposed: false,
        },
      });
    });
  }

  async uploadSession(providerId: string, uploadSessionId: string): Promise<UploadSessionRow> {
    const result = await this.database.query<UploadSessionRow>(
      `SELECT
         id,
         provider_id,
         requirement_id,
         created_by_identity_id,
         replacement_for_evidence_id,
         evidence_class,
         document_type,
         object_key,
         expected_content_type,
         max_bytes::text,
         status,
         expires_at
       FROM evidence.upload_sessions
       WHERE id = $1 AND provider_id = $2`,
      [uploadSessionId, providerId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Private evidence upload session was not found.');
    }
    return row;
  }

  async confirmEvidence(input: {
    actor: AuthenticatedActor;
    providerId: string;
    dto: ConfirmEvidenceDto;
    requestId?: string | undefined;
  }): Promise<EvidenceView> {
    return this.database.transaction(async (client) => {
      const sessionResult = await client.query<UploadSessionRow>(
        `SELECT
           id,
           provider_id,
           requirement_id,
           created_by_identity_id,
           replacement_for_evidence_id,
           evidence_class,
           document_type,
           object_key,
           expected_content_type,
           max_bytes::text,
           status,
           expires_at
         FROM evidence.upload_sessions
         WHERE id = $1 AND provider_id = $2
         FOR UPDATE`,
        [input.dto.uploadSessionId, input.providerId],
      );
      const session = sessionResult.rows[0];
      if (!session) {
        throw new NotFoundException('Private evidence upload session was not found.');
      }
      if (session.status !== 'requested' || session.expires_at.getTime() <= Date.now()) {
        throw new ConflictException('Private evidence upload session is not completable.');
      }
      if (session.created_by_identity_id !== input.actor.identityId) {
        throw new ConflictException('Only the upload-session creator may confirm this evidence.');
      }
      if (input.dto.sizeBytes > Number(session.max_bytes)) {
        throw new ConflictException('Confirmed evidence exceeds the authorized size.');
      }

      let evidenceId = session.replacement_for_evidence_id;
      if (evidenceId) {
        await client.query(
          `UPDATE evidence.items
           SET status = 'processing', retention_class = $2
           WHERE id = $1 AND provider_id = $3`,
          [evidenceId, input.dto.retentionClass, input.providerId],
        );
      } else {
        const evidenceResult = await client.query<{ id: string }>(
          `INSERT INTO evidence.items (
             provider_id,
             requirement_id,
             submitted_by_identity_id,
             status,
             retention_class
           ) VALUES ($1, $2, $3, 'processing', $4)
           RETURNING id`,
          [
            input.providerId,
            session.requirement_id,
            input.actor.identityId,
            input.dto.retentionClass,
          ],
        );
        evidenceId = evidenceResult.rows[0]?.id ?? null;
      }
      if (!evidenceId) {
        throw new Error('Evidence creation returned no identifier.');
      }

      const previousResult = await client.query<{
        current_version_id: string | null;
        current_version_number: number;
      }>(
        `SELECT
           items.current_version_id,
           COALESCE(max(versions.version_number), 0)::int AS current_version_number
         FROM evidence.items AS items
         LEFT JOIN evidence.versions AS versions ON versions.evidence_id = items.id
         WHERE items.id = $1
         GROUP BY items.current_version_id`,
        [evidenceId],
      );
      const previous = previousResult.rows[0];
      if (!previous) {
        throw new Error('Evidence version lookup returned no row.');
      }

      const versionResult = await client.query<{ id: string }>(
        `INSERT INTO evidence.versions (
           evidence_id,
           version_number,
           upload_session_id,
           supersedes_version_id,
           object_key,
           evidence_class,
           document_type,
           content_type,
           size_bytes,
           sha256,
           issuing_authority,
           issued_at,
           valid_from,
           expires_at,
           processing_status,
           submitted_by_identity_id
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'clean', $15
         )
         RETURNING id`,
        [
          evidenceId,
          previous.current_version_number + 1,
          session.id,
          previous.current_version_id,
          session.object_key,
          session.evidence_class,
          session.document_type,
          session.expected_content_type,
          input.dto.sizeBytes,
          input.dto.sha256,
          input.dto.issuingAuthority ?? null,
          input.dto.issuedAt ?? null,
          input.dto.validFrom ?? null,
          input.dto.expiresAt ?? null,
          input.actor.identityId,
        ],
      );
      const versionId = versionResult.rows[0]?.id;
      if (!versionId) {
        throw new Error('Evidence version creation returned no identifier.');
      }

      await client.query(
        `UPDATE evidence.items
         SET current_version_id = $2, status = 'ready_for_review'
         WHERE id = $1`,
        [evidenceId, versionId],
      );
      await client.query(
        `UPDATE evidence.upload_sessions
         SET status = 'completed', completed_at = now()
         WHERE id = $1`,
        [session.id],
      );

      if (input.dto.caseId) {
        await client.query(
          `INSERT INTO verification.case_evidence (
             case_id,
             evidence_id,
             linked_by_identity_id
           ) VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [input.dto.caseId, evidenceId, input.actor.identityId],
        );
        await client.query(
          `UPDATE verification.cases
           SET status = 'ready_for_review'
           WHERE id = $1
             AND status IN ('awaiting_evidence', 'correction_required')`,
          [input.dto.caseId],
        );
      }

      await this.insertAudit(client, {
        actor: input.actor,
        providerId: input.providerId,
        requestId: input.requestId,
        action: previous.current_version_number === 0 ? 'evidence_confirmed' : 'evidence_replaced',
        resourceType: 'evidence_item',
        resourceId: evidenceId,
        metadata: {
          version: previous.current_version_number + 1,
          checksumRecorded: true,
          evidenceBytesStoredInDatabase: false,
        },
      });

      return this.loadEvidence(client, evidenceId);
    });
  }

  async listEvidence(providerId: string): Promise<EvidenceView[]> {
    const result = await this.database.query<EvidenceRow>(
      this.evidenceQuery('items.provider_id = $1'),
      [providerId],
    );
    return result.rows.map((row) => this.mapEvidence(row));
  }

  async evidence(providerId: string, evidenceId: string): Promise<EvidenceView> {
    const result = await this.database.query<EvidenceRow>(
      this.evidenceQuery('items.provider_id = $1 AND items.id = $2'),
      [providerId, evidenceId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Private evidence metadata was not found.');
    }
    return this.mapEvidence(row);
  }

  async evidenceObjectForAssignedCase(
    caseId: string,
    evidenceId: string,
    actorIdentityId: string,
  ): Promise<{ objectKey: string; providerId: string }> {
    const result = await this.database.query<{ object_key: string; provider_id: string }>(
      `SELECT versions.object_key, cases.provider_id
       FROM verification.cases AS cases
       JOIN verification.assignments AS assignments
         ON assignments.case_id = cases.id
        AND assignments.assignee_identity_id = $3
        AND assignments.status = 'active'
        AND assignments.assignment_kind IN ('reviewer', 'supervisor')
       JOIN verification.case_evidence AS links ON links.case_id = cases.id
       JOIN evidence.items AS items ON items.id = links.evidence_id
       JOIN evidence.versions AS versions ON versions.id = items.current_version_id
       WHERE cases.id = $1 AND items.id = $2`,
      [caseId, evidenceId, actorIdentityId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Assigned private evidence access was not found.');
    }
    return { objectKey: row.object_key, providerId: row.provider_id };
  }

  async createCase(input: {
    actor: AuthenticatedActor;
    providerId: string;
    dto: CreateVerificationCaseDto;
    requestId?: string | undefined;
  }): Promise<VerificationCaseView> {
    return this.database.transaction(async (client) => {
      const requirementResult = await client.query<RequirementRow>(
        `SELECT
           requirements.id AS requirement_id,
           requirements.requirement_key,
           requirements.label AS requirement_label,
           categories.id AS category_id,
           categories.category_key,
           versions.id AS requirement_version_id
         FROM provider.category_selections AS selections
         JOIN catalog.service_categories AS categories ON categories.id = selections.category_id
         JOIN catalog.requirement_versions AS versions ON versions.id = selections.requirement_version_id
         JOIN catalog.requirements AS requirements ON requirements.requirement_version_id = versions.id
         WHERE selections.provider_id = $1
           AND selections.status = 'selected'
           AND categories.category_key = $2
           AND requirements.requirement_key = $3`,
        [input.providerId, input.dto.categoryKey, input.dto.requirementKey],
      );
      const requirement = requirementResult.rows[0];
      if (!requirement) {
        throw new NotFoundException('Selected category requirement was not found.');
      }

      const caseResult = await client.query<{ id: string }>(
        `INSERT INTO verification.cases (
           provider_id,
           category_id,
           requirement_version_id,
           requirement_id,
           check_key,
           check_family,
           high_risk,
           policy_version,
           created_by_identity_id
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          input.providerId,
          requirement.category_id,
          requirement.requirement_version_id,
          requirement.requirement_id,
          input.dto.checkKey,
          input.dto.checkFamily,
          input.dto.highRisk,
          input.dto.policyVersion,
          input.actor.identityId,
        ],
      );
      const caseId = caseResult.rows[0]?.id;
      if (!caseId) {
        throw new Error('Verification case creation returned no identifier.');
      }
      await client.query(
        `UPDATE verification.cases SET status = 'awaiting_evidence' WHERE id = $1`,
        [caseId],
      );
      await this.insertAudit(client, {
        actor: input.actor,
        providerId: input.providerId,
        requestId: input.requestId,
        action: 'verification_case_created',
        resourceType: 'verification_case',
        resourceId: caseId,
        metadata: {
          checkKey: input.dto.checkKey,
          checkFamily: input.dto.checkFamily,
          highRisk: input.dto.highRisk,
          policyVersion: input.dto.policyVersion,
        },
      });
      return this.loadCase(client, caseId);
    });
  }

  async listCases(providerId: string): Promise<VerificationCaseView[]> {
    const result = await this.database.query<CaseRow>(this.caseQuery('cases.provider_id = $1'), [
      providerId,
    ]);
    const cases: VerificationCaseView[] = [];
    for (const row of result.rows) {
      cases.push(await this.loadCaseByRow(row));
    }
    return cases;
  }

  async caseForActor(caseId: string, actorIdentityId: string): Promise<VerificationCaseView> {
    const result = await this.database.query<CaseRow>(
      this.caseQuery(
        `cases.id = $1 AND EXISTS (
           SELECT 1 FROM verification.assignments
           WHERE assignments.case_id = cases.id
             AND assignments.assignee_identity_id = $2
             AND assignments.status = 'active'
         )`,
      ),
      [caseId, actorIdentityId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Assigned verification case was not found.');
    }
    return this.loadCaseByRow(row);
  }

  async assignCase(input: {
    actor: AuthenticatedActor;
    caseId: string;
    dto: AssignVerificationCaseDto;
    requestId?: string | undefined;
  }): Promise<VerificationCaseView> {
    return this.database.transaction(async (client) => {
      const providerResult = await client.query<{ provider_id: string }>(
        'SELECT provider_id FROM verification.cases WHERE id = $1 FOR UPDATE',
        [input.caseId],
      );
      const providerId = providerResult.rows[0]?.provider_id;
      if (!providerId) {
        throw new NotFoundException('Verification case was not found.');
      }
      await client.query(
        `INSERT INTO verification.assignments (
           case_id,
           assignee_identity_id,
           assignment_kind,
           assigned_by_identity_id,
           reason
         ) VALUES ($1, $2, $3, $4, $5)`,
        [
          input.caseId,
          input.dto.assigneeIdentityId,
          input.dto.assignmentKind,
          input.actor.identityId,
          input.dto.reason,
        ],
      );
      if (input.dto.assignmentKind !== 'field_agent') {
        await client.query(
          `UPDATE verification.cases
           SET status = 'assigned'
           WHERE id = $1 AND status IN ('ready_for_review', 'appealed')`,
          [input.caseId],
        );
      }
      await this.insertAudit(client, {
        actor: input.actor,
        providerId,
        requestId: input.requestId,
        action: 'verification_case_assigned',
        resourceType: 'verification_case',
        resourceId: input.caseId,
        metadata: {
          assigneeIdentityId: input.dto.assigneeIdentityId,
          assignmentKind: input.dto.assignmentKind,
        },
      });
      return this.loadCase(client, input.caseId);
    });
  }

  async recommend(input: {
    actor: AuthenticatedActor;
    caseId: string;
    dto: CreateRecommendationDto;
    requestId?: string | undefined;
  }): Promise<{ recommendationId: string }> {
    return this.database.transaction(async (client) => {
      const providerResult = await client.query<{ provider_id: string }>(
        'SELECT provider_id FROM verification.cases WHERE id = $1 FOR UPDATE',
        [input.caseId],
      );
      const providerId = providerResult.rows[0]?.provider_id;
      if (!providerId) {
        throw new NotFoundException('Verification case was not found.');
      }
      await client.query(
        `UPDATE verification.cases
         SET status = 'in_review'
         WHERE id = $1 AND status = 'assigned'`,
        [input.caseId],
      );
      const result = await client.query<{ id: string }>(
        `INSERT INTO verification.recommendations (
           case_id,
           reviewer_identity_id,
           result,
           reason_code,
           rationale,
           limitation,
           recommended_valid_until
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          input.caseId,
          input.actor.identityId,
          input.dto.result,
          input.dto.reasonCode,
          input.dto.rationale,
          input.dto.limitation ?? null,
          input.dto.recommendedValidUntil ?? null,
        ],
      );
      const recommendationId = result.rows[0]?.id;
      if (!recommendationId) {
        throw new Error('Verification recommendation returned no identifier.');
      }
      await this.insertAudit(client, {
        actor: input.actor,
        providerId,
        requestId: input.requestId,
        action: 'verification_recommendation_recorded',
        resourceType: 'verification_recommendation',
        resourceId: recommendationId,
        metadata: { result: input.dto.result, reasonCode: input.dto.reasonCode },
      });
      return { recommendationId };
    });
  }

  async decide(input: {
    actor: AuthenticatedActor;
    caseId: string;
    dto: CreateDecisionDto;
    requestId?: string | undefined;
  }): Promise<{ decisionId: string; case: VerificationCaseView; claims: SafeClaimCard[] }> {
    return this.database.transaction(async (client) => {
      const result = await client.query<{ decision_id: string }>(
        `SELECT verification.record_decision(
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
         ) AS decision_id`,
        [
          input.caseId,
          input.actor.identityId,
          input.dto.result,
          input.dto.reasonCode,
          input.dto.rationale,
          input.dto.claimKey ?? null,
          input.dto.claimStatement ?? null,
          input.dto.limitation ?? null,
          input.dto.validUntil ?? null,
          input.dto.policyVersion,
        ],
      );
      const decisionId = result.rows[0]?.decision_id;
      if (!decisionId) {
        throw new Error('Verification decision returned no identifier.');
      }
      const verificationCase = await this.loadCase(client, input.caseId);
      const claims = await this.claimsWithClient(client, verificationCase.providerId);
      return { decisionId, case: verificationCase, claims };
    });
  }

  async recordFieldVisit(input: {
    actor: AuthenticatedActor;
    caseId: string;
    dto: CreateFieldVisitDto;
    requestId?: string | undefined;
  }): Promise<{ fieldVisitId: string }> {
    return this.database.transaction(async (client) => {
      const providerResult = await client.query<{ provider_id: string }>(
        'SELECT provider_id FROM verification.cases WHERE id = $1',
        [input.caseId],
      );
      const providerId = providerResult.rows[0]?.provider_id;
      if (!providerId) {
        throw new NotFoundException('Verification case was not found.');
      }
      const result = await client.query<{ id: string }>(
        `INSERT INTO verification.field_visits (
           case_id,
           assignment_id,
           field_agent_identity_id,
           outcome,
           checklist_version,
           public_safe_summary,
           private_notes,
           occurred_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          input.caseId,
          input.dto.assignmentId,
          input.actor.identityId,
          input.dto.outcome,
          input.dto.checklistVersion,
          input.dto.publicSafeSummary,
          input.dto.privateNotes ?? null,
          input.dto.occurredAt,
        ],
      );
      const fieldVisitId = result.rows[0]?.id;
      if (!fieldVisitId) {
        throw new Error('Field visit returned no identifier.');
      }
      await this.insertAudit(client, {
        actor: input.actor,
        providerId,
        requestId: input.requestId,
        action: 'verification_field_visit_recorded',
        resourceType: 'verification_field_visit',
        resourceId: fieldVisitId,
        metadata: { outcome: input.dto.outcome, checklistVersion: input.dto.checklistVersion },
      });
      return { fieldVisitId };
    });
  }

  async revokeEvidence(input: {
    actor: AuthenticatedActor;
    providerId: string;
    evidenceId: string;
    reason: string;
    requestId?: string | undefined;
  }): Promise<{ evidence: EvidenceView; affectedClaims: number }> {
    return this.database.transaction(async (client) => {
      const result = await client.query<{ id: string }>(
        `UPDATE evidence.items
         SET status = 'revoked', revocation_reason = $3
         WHERE id = $1 AND provider_id = $2
         RETURNING id`,
        [input.evidenceId, input.providerId, input.reason],
      );
      if (!result.rows[0]) {
        throw new NotFoundException('Private evidence metadata was not found.');
      }
      const expiryResult = await client.query<{ affected: number }>(
        'SELECT verification.degrade_expired_claims(now()) AS affected',
      );
      await this.insertAudit(client, {
        actor: input.actor,
        providerId: input.providerId,
        requestId: input.requestId,
        action: 'evidence_revoked',
        resourceType: 'evidence_item',
        resourceId: input.evidenceId,
        metadata: { reason: input.reason },
      });
      return {
        evidence: await this.loadEvidence(client, input.evidenceId),
        affectedClaims: Number(expiryResult.rows[0]?.affected ?? 0),
      };
    });
  }

  async expireClaims(asOf: Date): Promise<number> {
    const result = await this.database.query<{ affected: number }>(
      'SELECT verification.degrade_expired_claims($1) AS affected',
      [asOf],
    );
    return Number(result.rows[0]?.affected ?? 0);
  }

  async queue(): Promise<VerificationQueueItem[]> {
    const result = await this.database.query<{
      case_id: string;
      provider_id: string;
      provider_display_name: string;
      check_key: string;
      check_family: VerificationCheckFamily;
      status: VerificationCaseStatus;
      high_risk: boolean;
      assigned_reviewer_identity_id: string | null;
      updated_at: Date;
    }>(
      `SELECT
         cases.id AS case_id,
         cases.provider_id,
         profiles.display_name AS provider_display_name,
         cases.check_key,
         cases.check_family,
         cases.status,
         cases.high_risk,
         reviewer.assignee_identity_id AS assigned_reviewer_identity_id,
         cases.updated_at
       FROM verification.cases AS cases
       JOIN provider.profiles AS profiles ON profiles.provider_id = cases.provider_id
       LEFT JOIN LATERAL (
         SELECT assignee_identity_id
         FROM verification.assignments
         WHERE case_id = cases.id
           AND assignment_kind IN ('reviewer', 'supervisor')
           AND status = 'active'
         ORDER BY assigned_at DESC
         LIMIT 1
       ) AS reviewer ON true
       WHERE cases.status IN (
         'ready_for_review', 'assigned', 'in_review', 'correction_required', 'appealed'
       )
       ORDER BY cases.high_risk DESC, cases.updated_at
       LIMIT 100`,
    );
    return result.rows.map((row) => ({
      caseId: row.case_id,
      providerId: row.provider_id,
      providerDisplayName: row.provider_display_name,
      checkKey: row.check_key,
      checkFamily: row.check_family,
      status: row.status,
      highRisk: row.high_risk,
      assignedReviewerIdentityId: row.assigned_reviewer_identity_id,
      updatedAt: row.updated_at.toISOString(),
      synthetic: true,
    }));
  }

  async claims(providerId: string): Promise<SafeClaimCard[]> {
    return this.database.transaction((client) => this.claimsWithClient(client, providerId));
  }

  async auditEvidenceAccess(input: {
    actor: AuthenticatedActor;
    providerId: string;
    evidenceId: string;
    caseId: string;
    requestId?: string | undefined;
  }): Promise<void> {
    await this.database.transaction((client) =>
      this.insertAudit(client, {
        actor: input.actor,
        providerId: input.providerId,
        requestId: input.requestId,
        action: 'private_evidence_access_granted',
        resourceType: 'evidence_item',
        resourceId: input.evidenceId,
        metadata: { caseId: input.caseId, accessUrlStored: false, evidenceBytesLogged: false },
      }),
    );
  }

  private evidenceQuery(where: string): string {
    return `SELECT
       items.id,
       items.provider_id,
       requirements.requirement_key,
       requirements.label AS requirement_label,
       items.status,
       items.retention_class,
       items.created_at,
       items.updated_at,
       versions.id AS version_id,
       versions.version_number,
       versions.evidence_class,
       versions.document_type,
       versions.content_type,
       versions.size_bytes::text,
       versions.sha256,
       versions.issuing_authority,
       versions.issued_at::text,
       versions.valid_from::text,
       versions.expires_at,
       versions.processing_status,
       versions.created_at AS version_created_at
     FROM evidence.items AS items
     JOIN catalog.requirements AS requirements ON requirements.id = items.requirement_id
     LEFT JOIN evidence.versions AS versions ON versions.id = items.current_version_id
     WHERE ${where}
     ORDER BY items.created_at DESC`;
  }

  private caseQuery(where: string): string {
    return `SELECT
       cases.id,
       cases.provider_id,
       categories.category_key,
       requirements.requirement_key,
       requirements.label AS requirement_label,
       cases.check_key,
       cases.check_family,
       cases.status,
       cases.high_risk,
       cases.policy_version,
       reviewer.assignee_identity_id AS assigned_reviewer_identity_id,
       cases.created_at,
       cases.updated_at
     FROM verification.cases AS cases
     JOIN catalog.service_categories AS categories ON categories.id = cases.category_id
     JOIN catalog.requirements AS requirements ON requirements.id = cases.requirement_id
     LEFT JOIN LATERAL (
       SELECT assignee_identity_id
       FROM verification.assignments
       WHERE case_id = cases.id
         AND assignment_kind IN ('reviewer', 'supervisor')
         AND status = 'active'
       ORDER BY assigned_at DESC
       LIMIT 1
     ) AS reviewer ON true
     WHERE ${where}
     ORDER BY cases.created_at DESC`;
  }

  private async loadEvidence(client: PoolClient, evidenceId: string): Promise<EvidenceView> {
    const result = await client.query<EvidenceRow>(this.evidenceQuery('items.id = $1'), [
      evidenceId,
    ]);
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Private evidence metadata was not found.');
    }
    return this.mapEvidence(row);
  }

  private mapEvidence(row: EvidenceRow): EvidenceView {
    const currentVersion: EvidenceVersionView | null = row.version_id
      ? {
          id: row.version_id,
          version: row.version_number ?? 1,
          evidenceClass: row.evidence_class as EvidenceVersionView['evidenceClass'],
          documentType: row.document_type ?? 'unknown',
          contentType: row.content_type ?? 'application/octet-stream',
          sizeBytes: Number(row.size_bytes ?? 0),
          sha256: row.sha256 ?? '',
          issuingAuthority: row.issuing_authority,
          issuedAt: row.issued_at,
          validFrom: row.valid_from,
          expiresAt: row.expires_at?.toISOString() ?? null,
          processingStatus: row.processing_status ?? 'pending_scan',
          createdAt: row.version_created_at?.toISOString() ?? row.created_at.toISOString(),
        }
      : null;
    return {
      id: row.id,
      providerId: row.provider_id,
      requirementKey: row.requirement_key,
      requirementLabel: row.requirement_label,
      status: row.status,
      retentionClass: row.retention_class,
      currentVersion,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      synthetic: true,
    };
  }

  private async loadCase(client: PoolClient, caseId: string): Promise<VerificationCaseView> {
    const result = await client.query<CaseRow>(this.caseQuery('cases.id = $1'), [caseId]);
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Verification case was not found.');
    }
    return this.loadCaseByRow(row, client);
  }

  private async loadCaseByRow(row: CaseRow, client?: PoolClient): Promise<VerificationCaseView> {
    const query = client
      ? client.query<EvidenceRow>(
          `${this.evidenceQuery(
            `EXISTS (
               SELECT 1 FROM verification.case_evidence
               WHERE case_evidence.case_id = $1 AND case_evidence.evidence_id = items.id
             )`,
          )}`,
          [row.id],
        )
      : this.database.query<EvidenceRow>(
          `${this.evidenceQuery(
            `EXISTS (
               SELECT 1 FROM verification.case_evidence
               WHERE case_evidence.case_id = $1 AND case_evidence.evidence_id = items.id
             )`,
          )}`,
          [row.id],
        );
    const evidenceResult = await query;
    return {
      id: row.id,
      providerId: row.provider_id,
      categoryKey: row.category_key,
      requirementKey: row.requirement_key,
      requirementLabel: row.requirement_label,
      checkKey: row.check_key,
      checkFamily: row.check_family,
      status: row.status,
      highRisk: row.high_risk,
      policyVersion: row.policy_version,
      assignedReviewerIdentityId: row.assigned_reviewer_identity_id,
      evidence: evidenceResult.rows.map((evidence) => this.mapEvidence(evidence)),
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      synthetic: true,
    };
  }

  private async claimsWithClient(client: PoolClient, providerId: string): Promise<SafeClaimCard[]> {
    const result = await client.query<{
      provider_id: string;
      claim_key: string;
      claim_statement: string;
      limitation: string;
      evidence_class: VerificationCheckFamily;
      checked_at: Date;
      valid_until: Date;
      status: SafeClaimCard['status'];
      policy_version: string;
    }>(
      `SELECT
         provider_id,
         claim_key,
         claim_statement,
         limitation,
         evidence_class,
         checked_at,
         valid_until,
         status,
         policy_version
       FROM verification.safe_claim_cards
       WHERE provider_id = $1
       ORDER BY claim_key, checked_at DESC`,
      [providerId],
    );
    return result.rows.map((row) => ({
      providerId: row.provider_id,
      claimKey: row.claim_key,
      statement: row.claim_statement,
      limitation: row.limitation,
      evidenceClass: row.evidence_class,
      checkedAt: row.checked_at.toISOString(),
      validUntil: row.valid_until.toISOString(),
      status: row.status,
      policyVersion: row.policy_version,
    }));
  }

  private async insertAudit(
    client: PoolClient,
    input: {
      actor: AuthenticatedActor;
      providerId: string;
      requestId?: string | undefined;
      action: string;
      resourceType: string;
      resourceId: string;
      metadata: Record<string, unknown>;
    },
  ): Promise<void> {
    await client.query(
      `INSERT INTO platform.audit_events (
         request_id,
         actor_type,
         actor_id,
         provider_id,
         action,
         resource_type,
         resource_id,
         outcome,
         metadata
       ) VALUES ($1, 'identity', $2, $3, $4, $5, $6, 'success', $7::jsonb)`,
      [
        input.requestId ?? null,
        input.actor.identityId,
        input.providerId,
        input.action,
        input.resourceType,
        input.resourceId,
        JSON.stringify(input.metadata),
      ],
    );
  }
}
