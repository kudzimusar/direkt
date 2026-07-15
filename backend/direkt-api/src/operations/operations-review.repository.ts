import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PoolClient } from 'pg';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { DatabaseService } from '../platform/database/database.service';
import type {
  OperationsReviewEvidenceItem,
  OperationsReviewWorkspace,
  RevokedVerificationAssignment,
} from './operations-review.types';

interface AssignmentContextRow {
  assignment_id: string;
  assignment_kind: 'reviewer' | 'supervisor';
  assigned_at: Date;
}

interface WorkspaceRow {
  case_id: string;
  provider_id: string;
  provider_display_name: string;
  category_key: string;
  category_name: string;
  requirement_key: string;
  requirement_label: string;
  check_key: string;
  check_family: OperationsReviewWorkspace['checkFamily'];
  status: OperationsReviewWorkspace['status'];
  high_risk: boolean;
  policy_version: string;
  recommendation_count: string;
  decision_recorded: boolean;
}

interface EvidenceRow {
  evidence_id: string;
  status: OperationsReviewEvidenceItem['status'];
  retention_class: OperationsReviewEvidenceItem['retentionClass'];
  requirement_key: string;
  requirement_label: string;
  created_at: Date;
  updated_at: Date;
  version_id: string;
  version_number: number;
  evidence_class: OperationsReviewEvidenceItem['currentVersion']['evidenceClass'];
  document_type: string;
  content_type: string;
  size_bytes: string;
  issuing_authority: string | null;
  issued_at: string | null;
  valid_from: string | null;
  expires_at: Date | null;
  processing_status: OperationsReviewEvidenceItem['currentVersion']['processingStatus'];
  version_created_at: Date;
}

interface GrantIssueContextRow {
  assignment_id: string;
  evidence_version_id: string;
  provider_id: string;
}

interface GrantRedemptionRow {
  grant_id: string;
  case_id: string;
  evidence_id: string;
  evidence_version_id: string;
  assignment_id: string;
  provider_id: string;
  object_key: string;
  expires_at: Date;
}

interface GrantRow {
  grant_id: string;
  case_id: string;
  evidence_id: string;
  provider_id: string;
  grantee_identity_id: string;
  status: 'active' | 'revoked';
  expires_at: Date;
}

@Injectable()
export class OperationsReviewRepository {
  constructor(private readonly database: DatabaseService) {}

  workspace(caseId: string, actorIdentityId: string): Promise<OperationsReviewWorkspace> {
    return this.database.transaction(async (client) => {
      const assignment = await this.activeReviewAssignment(client, caseId, actorIdentityId);
      const workspaceResult = await client.query<WorkspaceRow>(
        `SELECT
           cases.id AS case_id,
           cases.provider_id,
           profiles.display_name AS provider_display_name,
           categories.category_key,
           categories.name AS category_name,
           requirements.requirement_key,
           requirements.label AS requirement_label,
           cases.check_key,
           cases.check_family,
           cases.status,
           cases.high_risk,
           cases.policy_version,
           (
             SELECT count(*)
             FROM verification.recommendations
             WHERE recommendations.case_id = cases.id
           )::text AS recommendation_count,
           EXISTS (
             SELECT 1
             FROM verification.decisions
             WHERE decisions.case_id = cases.id
           ) AS decision_recorded
         FROM verification.cases AS cases
         JOIN provider.profiles AS profiles ON profiles.provider_id = cases.provider_id
         JOIN catalog.service_categories AS categories ON categories.id = cases.category_id
         JOIN catalog.requirements AS requirements ON requirements.id = cases.requirement_id
         WHERE cases.id = $1
           AND cases.status IN ('assigned', 'in_review', 'appealed')`,
        [caseId],
      );
      const row = workspaceResult.rows[0];
      if (!row) {
        throw new NotFoundException('Assigned evidence review workspace was not found.');
      }

      const evidenceResult = await client.query<EvidenceRow>(
        `SELECT
           items.id AS evidence_id,
           items.status,
           items.retention_class,
           requirements.requirement_key,
           requirements.label AS requirement_label,
           items.created_at,
           items.updated_at,
           versions.id AS version_id,
           versions.version_number,
           versions.evidence_class,
           versions.document_type,
           versions.content_type,
           versions.size_bytes::text,
           versions.issuing_authority,
           versions.issued_at::text,
           versions.valid_from::text,
           versions.expires_at,
           versions.processing_status,
           versions.created_at AS version_created_at
         FROM verification.case_evidence AS links
         JOIN evidence.items AS items ON items.id = links.evidence_id
         JOIN evidence.versions AS versions ON versions.id = items.current_version_id
         JOIN catalog.requirements AS requirements ON requirements.id = items.requirement_id
         WHERE links.case_id = $1
           AND items.status NOT IN ('draft', 'revoked', 'expired')
         ORDER BY items.created_at, items.id`,
        [caseId],
      );

      return {
        caseId: row.case_id,
        providerId: row.provider_id,
        providerDisplayName: row.provider_display_name,
        categoryKey: row.category_key,
        categoryName: row.category_name,
        requirementKey: row.requirement_key,
        requirementLabel: row.requirement_label,
        checkKey: row.check_key,
        checkFamily: row.check_family,
        status: row.status,
        highRisk: row.high_risk,
        policyVersion: row.policy_version,
        assignment: {
          assignmentId: assignment.assignment_id,
          assignmentKind: assignment.assignment_kind,
          assignedAt: assignment.assigned_at.toISOString(),
        },
        evidence: evidenceResult.rows.map((evidence) => this.mapEvidence(evidence)),
        recommendationCount: Number(row.recommendation_count),
        decisionRecorded: row.decision_recorded,
        privateRationaleIncluded: false,
        reviewerNotesIncluded: false,
        privateCoordinatesIncluded: false,
        synthetic: true,
      };
    });
  }

  issueGrant(input: {
    actor: AuthenticatedActor;
    caseId: string;
    evidenceId: string;
    tokenHash: string;
    expiresAt: Date;
    requestId?: string;
  }): Promise<{
    grantId: string;
    assignmentId: string;
    evidenceVersionId: string;
    providerId: string;
  }> {
    return this.database.transaction(async (client) => {
      const contextResult = await client.query<GrantIssueContextRow>(
        `SELECT
           assignments.id AS assignment_id,
           items.current_version_id AS evidence_version_id,
           cases.provider_id
         FROM verification.cases AS cases
         JOIN verification.assignments AS assignments
           ON assignments.case_id = cases.id
          AND assignments.assignee_identity_id = $3
          AND assignments.status = 'active'
          AND assignments.assignment_kind IN ('reviewer', 'supervisor')
         JOIN verification.case_evidence AS links ON links.case_id = cases.id
         JOIN evidence.items AS items ON items.id = links.evidence_id
         WHERE cases.id = $1
           AND items.id = $2
           AND cases.status IN ('assigned', 'in_review', 'appealed')
           AND items.status NOT IN ('draft', 'revoked', 'expired')`,
        [input.caseId, input.evidenceId, input.actor.identityId],
      );
      if (contextResult.rows.length !== 1) {
        throw new NotFoundException('Assigned reviewable evidence was not found.');
      }
      const context = contextResult.rows[0] as GrantIssueContextRow;

      await client.query(
        `UPDATE operations.evidence_review_grants
         SET status = 'revoked',
             revoked_at = now(),
             revoked_by_identity_id = $3,
             revoke_reason = 'REPLACED_BY_NEW_GRANT'
         WHERE assignment_id = $1
           AND evidence_id = $2
           AND grantee_identity_id = $3
           AND status = 'active'`,
        [context.assignment_id, input.evidenceId, input.actor.identityId],
      );

      const insert = await client.query<{ id: string }>(
        `INSERT INTO operations.evidence_review_grants (
           token_hash,
           case_id,
           evidence_id,
           evidence_version_id,
           assignment_id,
           grantee_identity_id,
           expires_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          input.tokenHash,
          input.caseId,
          input.evidenceId,
          context.evidence_version_id,
          context.assignment_id,
          input.actor.identityId,
          input.expiresAt,
        ],
      );
      const grantId = insert.rows[0]?.id;
      if (!grantId) {
        throw new Error('Evidence review grant creation returned no identifier.');
      }

      await this.audit(client, {
        actor: input.actor,
        providerId: context.provider_id,
        requestId: input.requestId,
        action: 'private_evidence_review_grant_created',
        resourceType: 'evidence_review_grant',
        resourceId: grantId,
        metadata: {
          caseId: input.caseId,
          evidenceId: input.evidenceId,
          evidenceVersionId: context.evidence_version_id,
          assignmentId: context.assignment_id,
          expiresAt: input.expiresAt.toISOString(),
          rawTokenStored: false,
          objectKeyExposed: false,
        },
      });
      return {
        grantId,
        assignmentId: context.assignment_id,
        evidenceVersionId: context.evidence_version_id,
        providerId: context.provider_id,
      };
    });
  }

  redemption(actorIdentityId: string, tokenHash: string): Promise<GrantRedemptionRow> {
    return this.database
      .query<GrantRedemptionRow>(
        `SELECT
         grants.id AS grant_id,
         grants.case_id,
         grants.evidence_id,
         grants.evidence_version_id,
         grants.assignment_id,
         cases.provider_id,
         versions.object_key,
         grants.expires_at
       FROM operations.evidence_review_grants AS grants
       JOIN verification.assignments AS assignments
         ON assignments.id = grants.assignment_id
        AND assignments.case_id = grants.case_id
        AND assignments.assignee_identity_id = grants.grantee_identity_id
        AND assignments.status = 'active'
        AND assignments.assignment_kind IN ('reviewer', 'supervisor')
       JOIN verification.cases AS cases
         ON cases.id = grants.case_id
        AND cases.status IN ('assigned', 'in_review', 'appealed')
       JOIN verification.case_evidence AS links
         ON links.case_id = grants.case_id
        AND links.evidence_id = grants.evidence_id
       JOIN evidence.items AS items
         ON items.id = grants.evidence_id
        AND items.current_version_id = grants.evidence_version_id
        AND items.status NOT IN ('draft', 'revoked', 'expired')
       JOIN evidence.versions AS versions ON versions.id = grants.evidence_version_id
       WHERE grants.token_hash = $1
         AND grants.grantee_identity_id = $2
         AND grants.status = 'active'
         AND grants.expires_at > now()`,
        [tokenHash, actorIdentityId],
      )
      .then((result) => {
        const row = result.rows[0];
        if (!row) {
          throw new NotFoundException('Active private evidence review grant was not found.');
        }
        return row;
      });
  }

  revokeGrant(input: {
    actor: AuthenticatedActor;
    grantId: string;
    reason: string;
    requestId?: string;
  }): Promise<{ grantId: string; revoked: true }> {
    return this.database.transaction(async (client) => {
      const result = await client.query<GrantRow>(
        `SELECT
           grants.id AS grant_id,
           grants.case_id,
           grants.evidence_id,
           cases.provider_id,
           grants.grantee_identity_id,
           grants.status,
           grants.expires_at
         FROM operations.evidence_review_grants AS grants
         JOIN verification.cases AS cases ON cases.id = grants.case_id
         WHERE grants.id = $1
         FOR UPDATE OF grants`,
        [input.grantId],
      );
      const grant = result.rows[0];
      if (!grant) {
        throw new NotFoundException('Evidence review grant was not found.');
      }
      const elevated = await this.hasGlobalRole(client, input.actor.identityId, [
        'trust_supervisor',
        'admin',
      ]);
      if (grant.grantee_identity_id !== input.actor.identityId && !elevated) {
        throw new ForbiddenException('The evidence review grant cannot be revoked by this actor.');
      }
      if (grant.status === 'active') {
        await client.query(
          `UPDATE operations.evidence_review_grants
           SET status = 'revoked',
               revoked_at = now(),
               revoked_by_identity_id = $2,
               revoke_reason = $3
           WHERE id = $1`,
          [input.grantId, input.actor.identityId, input.reason.trim()],
        );
      }
      await this.audit(client, {
        actor: input.actor,
        providerId: grant.provider_id,
        requestId: input.requestId,
        action: 'private_evidence_review_grant_revoked',
        resourceType: 'evidence_review_grant',
        resourceId: input.grantId,
        metadata: {
          caseId: grant.case_id,
          evidenceId: grant.evidence_id,
          reason: input.reason.trim(),
        },
      });
      return { grantId: input.grantId, revoked: true };
    });
  }

  revokeAssignment(input: {
    actor: AuthenticatedActor;
    caseId: string;
    assignmentId: string;
    reason: string;
    requestId?: string;
  }): Promise<RevokedVerificationAssignment> {
    return this.database.transaction(async (client) => {
      const result = await client.query<{
        provider_id: string;
        status: 'active' | 'completed' | 'revoked';
        ended_at: Date | null;
      }>(
        `SELECT cases.provider_id, assignments.status, assignments.ended_at
         FROM verification.assignments AS assignments
         JOIN verification.cases AS cases ON cases.id = assignments.case_id
         WHERE assignments.id = $1
           AND assignments.case_id = $2
           AND assignments.assignment_kind IN ('reviewer', 'supervisor')
         FOR UPDATE OF assignments`,
        [input.assignmentId, input.caseId],
      );
      const assignment = result.rows[0];
      if (!assignment) {
        throw new NotFoundException('Active review assignment was not found.');
      }
      if (assignment.status === 'completed') {
        throw new ConflictException('Completed review assignments cannot be revoked.');
      }

      let endedAt = assignment.ended_at;
      if (assignment.status === 'active') {
        const updated = await client.query<{ ended_at: Date }>(
          `UPDATE verification.assignments
           SET status = 'revoked', ended_at = now()
           WHERE id = $1
           RETURNING ended_at`,
          [input.assignmentId],
        );
        endedAt = updated.rows[0]?.ended_at ?? null;
        await client.query(
          `UPDATE verification.cases
           SET status = 'ready_for_review'
           WHERE id = $1
             AND status = 'assigned'
             AND NOT EXISTS (
               SELECT 1
               FROM verification.assignments
               WHERE assignments.case_id = $1
                 AND assignments.status = 'active'
                 AND assignments.assignment_kind IN ('reviewer', 'supervisor')
             )`,
          [input.caseId],
        );
      }
      if (!endedAt) {
        throw new Error('Review assignment revocation returned no end timestamp.');
      }

      const revokedGrants = await client.query<{ count: string }>(
        `SELECT count(*)::text AS count
         FROM operations.evidence_review_grants
         WHERE assignment_id = $1 AND status = 'revoked'`,
        [input.assignmentId],
      );
      await this.audit(client, {
        actor: input.actor,
        providerId: assignment.provider_id,
        requestId: input.requestId,
        action: 'verification_review_assignment_revoked',
        resourceType: 'verification_assignment',
        resourceId: input.assignmentId,
        metadata: {
          caseId: input.caseId,
          reason: input.reason.trim(),
          grantsRevoked: Number(revokedGrants.rows[0]?.count ?? 0),
        },
      });
      return {
        assignmentId: input.assignmentId,
        caseId: input.caseId,
        status: 'revoked',
        endedAt: endedAt.toISOString(),
        grantsRevoked: Number(revokedGrants.rows[0]?.count ?? 0),
        synthetic: true,
      };
    });
  }

  private async activeReviewAssignment(
    client: PoolClient,
    caseId: string,
    actorIdentityId: string,
  ): Promise<AssignmentContextRow> {
    const result = await client.query<AssignmentContextRow>(
      `SELECT
         assignments.id AS assignment_id,
         assignments.assignment_kind,
         assignments.assigned_at
       FROM verification.assignments AS assignments
       WHERE assignments.case_id = $1
         AND assignments.assignee_identity_id = $2
         AND assignments.status = 'active'
         AND assignments.assignment_kind IN ('reviewer', 'supervisor')
       ORDER BY assignments.assigned_at DESC, assignments.id
       LIMIT 2`,
      [caseId, actorIdentityId],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('Active assigned review context was not found.');
    }
    if (result.rows.length > 1) {
      throw new ConflictException(
        'The actor has more than one active review context for this case.',
      );
    }
    return result.rows[0] as AssignmentContextRow;
  }

  private mapEvidence(row: EvidenceRow): OperationsReviewEvidenceItem {
    return {
      evidenceId: row.evidence_id,
      status: row.status,
      retentionClass: row.retention_class,
      requirementKey: row.requirement_key,
      requirementLabel: row.requirement_label,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      currentVersion: {
        versionId: row.version_id,
        versionNumber: row.version_number,
        evidenceClass: row.evidence_class,
        documentType: row.document_type,
        contentType: row.content_type,
        sizeBytes: Number(row.size_bytes),
        issuingAuthority: row.issuing_authority,
        issuedAt: row.issued_at,
        validFrom: row.valid_from,
        expiresAt: row.expires_at?.toISOString() ?? null,
        processingStatus: row.processing_status,
        createdAt: row.version_created_at.toISOString(),
      },
      checksumIncluded: false,
      objectKeyIncluded: false,
      submitterIdentityIncluded: false,
      synthetic: true,
    };
  }

  private async hasGlobalRole(
    client: PoolClient,
    identityId: string,
    roleKeys: string[],
  ): Promise<boolean> {
    const result = await client.query<{ permitted: boolean }>(
      `SELECT EXISTS (
         SELECT 1
         FROM authz.role_assignments AS assignments
         JOIN authz.roles AS roles ON roles.id = assignments.role_id
         WHERE assignments.identity_id = $1
           AND assignments.scope_type = 'global'
           AND assignments.revoked_at IS NULL
           AND assignments.starts_at <= now()
           AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
           AND roles.role_key = ANY($2::text[])
       ) AS permitted`,
      [identityId, roleKeys],
    );
    return result.rows[0]?.permitted ?? false;
  }

  private async audit(
    client: PoolClient,
    input: {
      actor: AuthenticatedActor;
      providerId: string;
      requestId?: string;
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
