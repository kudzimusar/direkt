import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { PoolClient } from 'pg';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { DatabaseService } from '../platform/database/database.service';
import type {
  EvidenceAccessGrantState,
  EvidenceClass,
  EvidenceStatus,
  EvidenceVersionView,
  ReviewWorkspaceEvidenceView,
  ReviewWorkspaceView,
  VerificationCheckFamily,
} from './verification-evidence.types';

interface ReviewContextRow {
  case_id: string;
  provider_id: string;
  provider_display_name: string;
  category_key: string;
  requirement_key: string;
  requirement_label: string;
  check_key: string;
  check_family: VerificationCheckFamily;
  status: 'assigned' | 'in_review';
  high_risk: boolean;
  policy_version: string;
  assignment_id: string;
  assignment_kind: 'reviewer' | 'supervisor';
  assigned_at: Date;
}

interface ReviewEvidenceRow {
  evidence_id: string;
  evidence_version_id: string;
  requirement_key: string;
  requirement_label: string;
  status: EvidenceStatus;
  version_number: number;
  evidence_class: EvidenceClass;
  document_type: string;
  content_type: string;
  size_bytes: string;
  issuing_authority: string | null;
  issued_at: string | null;
  valid_from: string | null;
  expires_at: Date | null;
  processing_status: EvidenceVersionView['processingStatus'];
  created_at: Date;
}

interface EvidenceGrantContextRow {
  provider_id: string;
  assignment_id: string;
  evidence_version_id: string;
  object_key: string;
}

interface EvidenceGrantRow extends EvidenceGrantContextRow {
  grant_id: string;
  evidence_id: string;
  expires_at: Date;
}

interface EvidenceGrantStateRow {
  grant_id: string;
  status: EvidenceAccessGrantState['status'];
  expires_at: Date;
  ended_at: Date | null;
}

@Injectable()
export class EvidenceReviewRepository {
  constructor(private readonly database: DatabaseService) {}

  async reviewWorkspace(
    caseId: string,
    actorIdentityId: string,
  ): Promise<ReviewWorkspaceView> {
    const contextResult = await this.database.query<ReviewContextRow>(
      `SELECT
         cases.id AS case_id,
         cases.provider_id,
         profiles.display_name AS provider_display_name,
         categories.category_key,
         requirements.requirement_key,
         requirements.label AS requirement_label,
         cases.check_key,
         cases.check_family,
         cases.status,
         cases.high_risk,
         cases.policy_version,
         assignments.id AS assignment_id,
         assignments.assignment_kind,
         assignments.assigned_at
       FROM verification.cases AS cases
       JOIN provider.profiles AS profiles ON profiles.provider_id = cases.provider_id
       JOIN catalog.service_categories AS categories ON categories.id = cases.category_id
       JOIN catalog.requirements AS requirements ON requirements.id = cases.requirement_id
       JOIN verification.assignments AS assignments
         ON assignments.case_id = cases.id
        AND assignments.assignee_identity_id = $2
        AND assignments.assignment_kind IN ('reviewer', 'supervisor')
        AND assignments.status = 'active'
       WHERE cases.id = $1
         AND cases.status IN ('assigned', 'in_review')
         AND NOT EXISTS (
           SELECT 1
           FROM verification.case_evidence AS links
           JOIN evidence.items AS items ON items.id = links.evidence_id
           WHERE links.case_id = cases.id
             AND items.submitted_by_identity_id = $2
         )`,
      [caseId, actorIdentityId],
    );
    const context = contextResult.rows[0];
    if (!context) {
      throw new NotFoundException('Assigned evidence review workspace was not found.');
    }

    const evidenceResult = await this.database.query<ReviewEvidenceRow>(
      `SELECT
         items.id AS evidence_id,
         versions.id AS evidence_version_id,
         requirements.requirement_key,
         requirements.label AS requirement_label,
         items.status,
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
         versions.created_at
       FROM verification.case_evidence AS links
       JOIN evidence.items AS items ON items.id = links.evidence_id
       JOIN evidence.versions AS versions ON versions.id = items.current_version_id
       JOIN catalog.requirements AS requirements ON requirements.id = items.requirement_id
       WHERE links.case_id = $1
       ORDER BY requirements.requirement_key, items.id`,
      [caseId],
    );

    return {
      caseId: context.case_id,
      providerId: context.provider_id,
      providerDisplayName: context.provider_display_name,
      categoryKey: context.category_key,
      requirementKey: context.requirement_key,
      requirementLabel: context.requirement_label,
      checkKey: context.check_key,
      checkFamily: context.check_family,
      status: context.status,
      highRisk: context.high_risk,
      policyVersion: context.policy_version,
      assignment: {
        id: context.assignment_id,
        kind: context.assignment_kind,
        assignedAt: context.assigned_at.toISOString(),
      },
      evidence: evidenceResult.rows.map((row) => this.mapReviewEvidence(row)),
      accessPolicy: {
        lifetimeSeconds: 300,
        freshGrantRequired: true,
        assignmentRecheckedOnRedemption: true,
      },
      reviewerNotesIncluded: false,
      privateCoordinatesIncluded: false,
      synthetic: true,
    };
  }

  async issueAccessGrant(input: {
    actor: AuthenticatedActor;
    caseId: string;
    evidenceId: string;
    purpose: string;
    requestId?: string | undefined;
  }): Promise<EvidenceGrantRow> {
    return this.database.transaction(async (client) => {
      const contextResult = await client.query<EvidenceGrantContextRow>(
        `SELECT
           cases.provider_id,
           assignments.id AS assignment_id,
           versions.id AS evidence_version_id,
           versions.object_key
         FROM verification.cases AS cases
         JOIN verification.assignments AS assignments
           ON assignments.case_id = cases.id
          AND assignments.assignee_identity_id = $3
          AND assignments.assignment_kind IN ('reviewer', 'supervisor')
          AND assignments.status = 'active'
         JOIN verification.case_evidence AS links
           ON links.case_id = cases.id
          AND links.evidence_id = $2
         JOIN evidence.items AS items
           ON items.id = links.evidence_id
          AND items.status IN ('ready_for_review', 'approved')
          AND items.submitted_by_identity_id <> $3
         JOIN evidence.versions AS versions ON versions.id = items.current_version_id
         JOIN provider.organizations AS organizations ON organizations.id = cases.provider_id
         WHERE cases.id = $1
           AND cases.status IN ('assigned', 'in_review')
           AND organizations.created_by_identity_id <> $3
         FOR UPDATE OF assignments, items`,
        [input.caseId, input.evidenceId, input.actor.identityId],
      );
      const context = contextResult.rows[0];
      if (!context) {
        throw new NotFoundException('Assigned private evidence access was not found.');
      }

      await client.query(
        `UPDATE operations.evidence_access_grants
         SET status = 'expired',
             ended_at = now(),
             end_reason = 'Evidence access authorization expired before renewal'
         WHERE grantee_identity_id = $1
           AND status = 'active'
           AND expires_at <= now()`,
        [input.actor.identityId],
      );
      await client.query(
        `UPDATE operations.evidence_access_grants
         SET status = 'revoked',
             ended_at = now(),
             ended_by_identity_id = $4,
             end_reason = 'Superseded by a fresh evidence access authorization'
         WHERE case_id = $1
           AND evidence_id = $2
           AND grantee_identity_id = $3
           AND status = 'active'`,
        [input.caseId, input.evidenceId, input.actor.identityId, input.actor.identityId],
      );

      const grantResult = await client.query<{
        grant_id: string;
        expires_at: Date;
      }>(
        `INSERT INTO operations.evidence_access_grants (
           case_id,
           evidence_id,
           evidence_version_id,
           assignment_id,
           grantee_identity_id,
           granted_by_identity_id,
           purpose,
           expires_at
         ) VALUES ($1, $2, $3, $4, $5, $5, $6, now() + interval '5 minutes')
         RETURNING id AS grant_id, expires_at`,
        [
          input.caseId,
          input.evidenceId,
          context.evidence_version_id,
          context.assignment_id,
          input.actor.identityId,
          input.purpose,
        ],
      );
      const grant = grantResult.rows[0];
      if (!grant) {
        throw new Error('Evidence access authorization returned no identifier.');
      }

      await this.insertAudit(client, {
        actor: input.actor,
        providerId: context.provider_id,
        requestId: input.requestId,
        action: 'private_evidence_access_granted',
        resourceType: 'evidence_item',
        resourceId: input.evidenceId,
        metadata: {
          grantId: grant.grant_id,
          caseId: input.caseId,
          assignmentId: context.assignment_id,
          evidenceVersionId: context.evidence_version_id,
          accessUrlStored: false,
          objectKeyStored: false,
          evidenceBytesLogged: false,
        },
      });

      return {
        grant_id: grant.grant_id,
        evidence_id: input.evidenceId,
        provider_id: context.provider_id,
        assignment_id: context.assignment_id,
        evidence_version_id: context.evidence_version_id,
        object_key: context.object_key,
        expires_at: grant.expires_at,
      };
    });
  }

  async resolveAccessGrant(input: {
    actor: AuthenticatedActor;
    grantId: string;
    requestId?: string | undefined;
  }): Promise<EvidenceGrantRow> {
    return this.database.transaction(async (client) => {
      await client.query(
        `UPDATE operations.evidence_access_grants
         SET status = 'expired',
             ended_at = now(),
             end_reason = 'Evidence access authorization expired before redemption'
         WHERE id = $1
           AND grantee_identity_id = $2
           AND status = 'active'
           AND expires_at <= now()`,
        [input.grantId, input.actor.identityId],
      );

      const result = await client.query<EvidenceGrantRow>(
        `SELECT
           grants.id AS grant_id,
           grants.evidence_id,
           cases.provider_id,
           grants.assignment_id,
           grants.evidence_version_id,
           versions.object_key,
           grants.expires_at
         FROM operations.evidence_access_grants AS grants
         JOIN verification.assignments AS assignments
           ON assignments.id = grants.assignment_id
          AND assignments.case_id = grants.case_id
          AND assignments.assignee_identity_id = grants.grantee_identity_id
          AND assignments.assignment_kind IN ('reviewer', 'supervisor')
          AND assignments.status = 'active'
         JOIN verification.cases AS cases
           ON cases.id = grants.case_id
          AND cases.status IN ('assigned', 'in_review')
         JOIN verification.case_evidence AS links
           ON links.case_id = grants.case_id
          AND links.evidence_id = grants.evidence_id
         JOIN evidence.items AS items
           ON items.id = grants.evidence_id
          AND items.current_version_id = grants.evidence_version_id
          AND items.status IN ('ready_for_review', 'approved')
         JOIN evidence.versions AS versions ON versions.id = grants.evidence_version_id
         WHERE grants.id = $1
           AND grants.grantee_identity_id = $2
           AND grants.status = 'active'
           AND grants.expires_at > now()
         FOR UPDATE OF grants`,
        [input.grantId, input.actor.identityId],
      );
      const grant = result.rows[0];
      if (!grant) {
        throw new NotFoundException('Private evidence authorization is no longer active.');
      }

      await this.insertAudit(client, {
        actor: input.actor,
        providerId: grant.provider_id,
        requestId: input.requestId,
        action: 'private_evidence_access_redeemed',
        resourceType: 'evidence_access_grant',
        resourceId: grant.grant_id,
        metadata: {
          evidenceId: grant.evidence_id,
          evidenceVersionId: grant.evidence_version_id,
          assignmentId: grant.assignment_id,
          accessUrlStored: false,
          objectKeyStored: false,
          evidenceBytesLogged: false,
        },
      });
      return grant;
    });
  }

  async revokeAccessGrant(input: {
    actor: AuthenticatedActor;
    grantId: string;
    reason: string;
  }): Promise<EvidenceAccessGrantState> {
    return this.database.transaction(async (client) => {
      const grantResult = await client.query<{
        grant_id: string;
        grantee_identity_id: string;
        status: EvidenceAccessGrantState['status'];
        expires_at: Date;
        ended_at: Date | null;
        can_override: boolean;
      }>(
        `SELECT
           grants.id AS grant_id,
           grants.grantee_identity_id,
           grants.status,
           grants.expires_at,
           grants.ended_at,
           EXISTS (
             SELECT 1
             FROM authz.role_assignments AS role_assignments
             JOIN authz.roles AS roles ON roles.id = role_assignments.role_id
             WHERE role_assignments.identity_id = $2
               AND role_assignments.scope_type = 'global'
               AND role_assignments.revoked_at IS NULL
               AND role_assignments.starts_at <= now()
               AND (role_assignments.ends_at IS NULL OR role_assignments.ends_at > now())
               AND roles.role_key IN ('trust_supervisor', 'admin')
           ) AS can_override
         FROM operations.evidence_access_grants AS grants
         WHERE grants.id = $1
         FOR UPDATE`,
        [input.grantId, input.actor.identityId],
      );
      const grant = grantResult.rows[0];
      if (
        !grant ||
        (grant.grantee_identity_id !== input.actor.identityId && !grant.can_override)
      ) {
        throw new NotFoundException('Private evidence authorization was not found.');
      }
      if (grant.status !== 'active') {
        throw new ConflictException('Private evidence authorization is already closed.');
      }

      const updated = await client.query<EvidenceGrantStateRow>(
        `UPDATE operations.evidence_access_grants
         SET status = 'revoked',
             ended_at = now(),
             ended_by_identity_id = $2,
             end_reason = $3
         WHERE id = $1
         RETURNING
           id AS grant_id,
           status,
           expires_at,
           ended_at`,
        [input.grantId, input.actor.identityId, input.reason],
      );
      const state = updated.rows[0];
      if (!state) {
        throw new Error('Evidence access revocation returned no record.');
      }
      return this.mapGrantState(state);
    });
  }

  private mapReviewEvidence(row: ReviewEvidenceRow): ReviewWorkspaceEvidenceView {
    return {
      evidenceId: row.evidence_id,
      evidenceVersionId: row.evidence_version_id,
      requirementKey: row.requirement_key,
      requirementLabel: row.requirement_label,
      status: row.status,
      version: row.version_number,
      evidenceClass: row.evidence_class,
      documentType: row.document_type,
      contentType: row.content_type,
      sizeBytes: Number(row.size_bytes),
      issuingAuthority: row.issuing_authority,
      issuedAt: row.issued_at,
      validFrom: row.valid_from,
      expiresAt: row.expires_at?.toISOString() ?? null,
      processingStatus: row.processing_status,
      createdAt: row.created_at.toISOString(),
      accessGrantRequired: true,
      checksumIncluded: false,
      submitterIdentityIncluded: false,
      storageReferenceIncluded: false,
    };
  }

  private mapGrantState(row: EvidenceGrantStateRow): EvidenceAccessGrantState {
    return {
      grantId: row.grant_id,
      status: row.status,
      expiresAt: row.expires_at.toISOString(),
      endedAt: row.ended_at?.toISOString() ?? null,
      synthetic: true,
    };
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
