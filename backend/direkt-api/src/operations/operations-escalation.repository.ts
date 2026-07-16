import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { PoolClient } from 'pg';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { DatabaseService } from '../platform/database/database.service';
import type {
  ApproveOperationsOverrideDto,
  CreateOperationsEscalationDto,
  CreateOperationsOverrideDto,
  ResolveOperationsEscalationDto,
} from './operations-escalation.dto';
import type {
  OperationsEscalationView,
  OperationsOverrideApprovalView,
  OperationsOverrideRequestView,
} from './operations-escalation.types';

interface EscalationRow {
  escalation_id: string;
  case_id: string;
  provider_id: string;
  provider_display_name: string;
  check_key: string;
  severity: OperationsEscalationView['severity'];
  reason_code: string;
  summary: string;
  owner_identity_id: string;
  due_at: Date;
  status: OperationsEscalationView['status'];
  policy_version: string;
  resolution_code: string | null;
  resolution_summary: string | null;
  resolved_at: Date | null;
  created_at: Date;
}

interface OverrideRow {
  override_request_id: string;
  case_id: string;
  provider_id: string;
  provider_display_name: string;
  check_key: string;
  requested_by_identity_id: string;
  requested_result: OperationsOverrideRequestView['requestedResult'];
  reason_code: string;
  rationale: string;
  evidence_version_count: string;
  status: OperationsOverrideRequestView['status'];
  due_at: Date;
  policy_version: string;
  created_at: Date;
  resolved_at: Date | null;
}

interface ApprovalRow {
  approval_id: string;
  approver_identity_id: string;
  decision: 'approve' | 'reject';
  rationale: string;
  policy_version: string;
  created_at: Date;
}

@Injectable()
export class OperationsEscalationRepository {
  constructor(private readonly database: DatabaseService) {}

  createEscalation(
    actor: AuthenticatedActor,
    dto: CreateOperationsEscalationDto,
    requestId?: string,
  ): Promise<OperationsEscalationView> {
    return this.database.transaction(async (client) => {
      const provider = await client.query<{ provider_id: string }>(
        'SELECT provider_id FROM verification.cases WHERE id = $1',
        [dto.caseId],
      );
      const providerId = provider.rows[0]?.provider_id;
      if (!providerId) {
        throw new NotFoundException('Verification case was not found.');
      }
      const result = await client.query<{ id: string }>(
        `INSERT INTO operations.case_escalations (
           case_id,
           severity,
           reason_code,
           summary,
           owner_identity_id,
           due_at,
           policy_version,
           created_by_identity_id
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          dto.caseId,
          dto.severity,
          dto.reasonCode,
          dto.summary.trim(),
          dto.ownerIdentityId,
          dto.dueAt,
          dto.policyVersion,
          actor.identityId,
        ],
      );
      const escalationId = result.rows[0]?.id;
      if (!escalationId) throw new Error('Escalation creation returned no identifier.');
      await this.audit(client, actor, providerId, requestId, {
        action: 'operations_escalation_created',
        resourceType: 'case_escalation',
        resourceId: escalationId,
        metadata: {
          caseId: dto.caseId,
          severity: dto.severity,
          reasonCode: dto.reasonCode,
          ownerIdentityId: dto.ownerIdentityId,
          dueAt: dto.dueAt,
          policyVersion: dto.policyVersion,
        },
      });
      return this.loadEscalation(client, escalationId);
    });
  }

  listEscalations(
    actorIdentityId: string,
    allAccess: boolean,
  ): Promise<OperationsEscalationView[]> {
    return this.database
      .query<EscalationRow>(
        `${this.escalationQuery()}
       WHERE $2::boolean = true
          OR escalations.owner_identity_id = $1
          OR EXISTS (
            SELECT 1 FROM verification.assignments
            WHERE assignments.case_id = escalations.case_id
              AND assignments.assignee_identity_id = $1
              AND assignments.status = 'active'
              AND assignments.assignment_kind IN ('reviewer', 'supervisor')
          )
       ORDER BY
         CASE escalations.severity
           WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3
         END,
         escalations.due_at,
         escalations.created_at`,
        [actorIdentityId, allAccess],
      )
      .then((result) => result.rows.map((row) => this.mapEscalation(row)));
  }

  startEscalation(
    actor: AuthenticatedActor,
    escalationId: string,
    reason: string,
    requestId?: string,
  ): Promise<OperationsEscalationView> {
    return this.database.transaction(async (client) => {
      const current = await this.lockEscalation(client, escalationId);
      if (current.status !== 'open') {
        throw new ConflictException('Only an open escalation can be started.');
      }
      if (current.owner_identity_id !== actor.identityId) {
        throw new NotFoundException('Owned escalation was not found.');
      }
      await client.query(
        `UPDATE operations.case_escalations SET status = 'in_progress' WHERE id = $1`,
        [escalationId],
      );
      await this.audit(client, actor, current.provider_id, requestId, {
        action: 'operations_escalation_started',
        resourceType: 'case_escalation',
        resourceId: escalationId,
        metadata: { caseId: current.case_id, reason: reason.trim() },
      });
      return this.loadEscalation(client, escalationId);
    });
  }

  resolveEscalation(
    actor: AuthenticatedActor,
    escalationId: string,
    dto: ResolveOperationsEscalationDto,
    requestId?: string,
  ): Promise<OperationsEscalationView> {
    return this.database.transaction(async (client) => {
      const current = await this.lockEscalation(client, escalationId);
      if (!['open', 'in_progress'].includes(current.status)) {
        throw new ConflictException('Only an active escalation can be resolved.');
      }
      await client.query(
        `UPDATE operations.case_escalations
         SET status = $2,
             resolution_code = $3,
             resolution_summary = $4,
             resolved_by_identity_id = $5,
             resolved_at = now()
         WHERE id = $1`,
        [
          escalationId,
          dto.targetStatus,
          dto.resolutionCode,
          dto.resolutionSummary.trim(),
          actor.identityId,
        ],
      );
      await this.audit(client, actor, current.provider_id, requestId, {
        action: 'operations_escalation_resolved',
        resourceType: 'case_escalation',
        resourceId: escalationId,
        metadata: {
          caseId: current.case_id,
          targetStatus: dto.targetStatus,
          resolutionCode: dto.resolutionCode,
        },
      });
      return this.loadEscalation(client, escalationId);
    });
  }

  createOverride(
    actor: AuthenticatedActor,
    dto: CreateOperationsOverrideDto,
    requestId?: string,
  ): Promise<OperationsOverrideRequestView> {
    return this.database.transaction(async (client) => {
      const context = await client.query<{
        provider_id: string;
        evidence_version_ids: string[];
      }>(
        `SELECT
           cases.provider_id,
           COALESCE(array_agg(DISTINCT versions.id) FILTER (WHERE versions.id IS NOT NULL), '{}') AS evidence_version_ids
         FROM verification.cases AS cases
         JOIN catalog.requirements AS requirements
           ON requirements.requirement_version_id = cases.requirement_version_id
          AND requirements.required = true
         LEFT JOIN evidence.items AS items
           ON items.provider_id = cases.provider_id
          AND items.requirement_id = requirements.id
          AND items.status IN ('ready_for_review', 'approved')
         LEFT JOIN evidence.versions AS versions
           ON versions.id = items.current_version_id
          AND versions.processing_status = 'clean'
          AND (versions.expires_at IS NULL OR versions.expires_at > now())
         WHERE cases.id = $1
         GROUP BY cases.provider_id`,
        [dto.caseId],
      );
      const row = context.rows[0];
      if (!row) throw new NotFoundException('High-risk verification case was not found.');
      const insert = await client.query<{ id: string }>(
        `INSERT INTO operations.high_risk_override_requests (
           case_id,
           requested_by_identity_id,
           requested_result,
           reason_code,
           rationale,
           evidence_version_ids,
           due_at,
           policy_version
         ) VALUES ($1, $2, $3, $4, $5, $6::uuid[], $7, $8)
         RETURNING id`,
        [
          dto.caseId,
          actor.identityId,
          dto.requestedResult,
          dto.reasonCode,
          dto.rationale.trim(),
          row.evidence_version_ids,
          dto.dueAt,
          dto.policyVersion,
        ],
      );
      const overrideRequestId = insert.rows[0]?.id;
      if (!overrideRequestId) throw new Error('Override request returned no identifier.');
      await this.audit(client, actor, row.provider_id, requestId, {
        action: 'operations_high_risk_override_requested',
        resourceType: 'high_risk_override_request',
        resourceId: overrideRequestId,
        metadata: {
          caseId: dto.caseId,
          requestedResult: dto.requestedResult,
          reasonCode: dto.reasonCode,
          evidenceVersionCount: row.evidence_version_ids.length,
          policyVersion: dto.policyVersion,
          createsDecision: false,
          createsClaim: false,
          changesPublication: false,
        },
      });
      return this.loadOverride(client, overrideRequestId);
    });
  }

  approveOverride(
    actor: AuthenticatedActor,
    overrideRequestId: string,
    dto: ApproveOperationsOverrideDto,
    requestId?: string,
  ): Promise<OperationsOverrideRequestView> {
    return this.database.transaction(async (client) => {
      const provider = await client.query<{ provider_id: string; case_id: string }>(
        `SELECT cases.provider_id, requests.case_id
         FROM operations.high_risk_override_requests AS requests
         JOIN verification.cases AS cases ON cases.id = requests.case_id
         WHERE requests.id = $1`,
        [overrideRequestId],
      );
      const context = provider.rows[0];
      if (!context) throw new NotFoundException('Override request was not found.');
      const approval = await client.query<{ id: string }>(
        `INSERT INTO operations.high_risk_override_approvals (
           override_request_id,
           approver_identity_id,
           decision,
           rationale,
           policy_version
         ) VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          overrideRequestId,
          actor.identityId,
          dto.decision,
          dto.rationale.trim(),
          dto.policyVersion,
        ],
      );
      const approvalId = approval.rows[0]?.id;
      if (!approvalId) throw new Error('Override approval returned no identifier.');
      await this.audit(client, actor, context.provider_id, requestId, {
        action: 'operations_high_risk_override_reviewed',
        resourceType: 'high_risk_override_approval',
        resourceId: approvalId,
        metadata: {
          overrideRequestId,
          caseId: context.case_id,
          decision: dto.decision,
          policyVersion: dto.policyVersion,
        },
      });
      return this.loadOverride(client, overrideRequestId);
    });
  }

  listOverrides(
    actorIdentityId: string,
    allAccess: boolean,
  ): Promise<OperationsOverrideRequestView[]> {
    return this.database.transaction(async (client) => {
      const result = await client.query<OverrideRow>(
        `${this.overrideQuery()}
         WHERE $2::boolean = true
            OR requests.requested_by_identity_id = $1
            OR EXISTS (
              SELECT 1 FROM verification.assignments
              WHERE assignments.case_id = requests.case_id
                AND assignments.assignee_identity_id = $1
                AND assignments.status = 'active'
                AND assignments.assignment_kind IN ('reviewer', 'supervisor')
            )
         ORDER BY requests.status, requests.due_at, requests.created_at`,
        [actorIdentityId, allAccess],
      );
      const views: OperationsOverrideRequestView[] = [];
      for (const row of result.rows) views.push(await this.mapOverride(client, row));
      return views;
    });
  }

  private async loadEscalation(
    client: PoolClient,
    escalationId: string,
  ): Promise<OperationsEscalationView> {
    const result = await client.query<EscalationRow>(
      `${this.escalationQuery()} WHERE escalations.id = $1`,
      [escalationId],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Escalation was not found.');
    return this.mapEscalation(row);
  }

  private async lockEscalation(client: PoolClient, escalationId: string): Promise<EscalationRow> {
    const result = await client.query<EscalationRow>(
      `${this.escalationQuery()} WHERE escalations.id = $1 FOR UPDATE OF escalations`,
      [escalationId],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Escalation was not found.');
    return row;
  }

  private escalationQuery(): string {
    return `SELECT
       escalations.id AS escalation_id,
       escalations.case_id,
       cases.provider_id,
       profiles.display_name AS provider_display_name,
       cases.check_key,
       escalations.severity,
       escalations.reason_code,
       escalations.summary,
       escalations.owner_identity_id,
       escalations.due_at,
       escalations.status,
       escalations.policy_version,
       escalations.resolution_code,
       escalations.resolution_summary,
       escalations.resolved_at,
       escalations.created_at
     FROM operations.case_escalations AS escalations
     JOIN verification.cases AS cases ON cases.id = escalations.case_id
     JOIN provider.profiles AS profiles ON profiles.provider_id = cases.provider_id`;
  }

  private mapEscalation(row: EscalationRow): OperationsEscalationView {
    return {
      escalationId: row.escalation_id,
      caseId: row.case_id,
      providerId: row.provider_id,
      providerDisplayName: row.provider_display_name,
      checkKey: row.check_key,
      severity: row.severity,
      reasonCode: row.reason_code,
      summary: row.summary,
      ownerIdentityId: row.owner_identity_id,
      dueAt: row.due_at.toISOString(),
      status: row.status,
      policyVersion: row.policy_version,
      resolutionCode: row.resolution_code,
      resolutionSummary: row.resolution_summary,
      resolvedAt: row.resolved_at?.toISOString() ?? null,
      createdAt: row.created_at.toISOString(),
      privateEvidenceIncluded: false,
      reviewerNotesIncluded: false,
      synthetic: true,
    };
  }

  private async loadOverride(
    client: PoolClient,
    overrideRequestId: string,
  ): Promise<OperationsOverrideRequestView> {
    const result = await client.query<OverrideRow>(
      `${this.overrideQuery()} WHERE requests.id = $1`,
      [overrideRequestId],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Override request was not found.');
    return this.mapOverride(client, row);
  }

  private overrideQuery(): string {
    return `SELECT
       requests.id AS override_request_id,
       requests.case_id,
       cases.provider_id,
       profiles.display_name AS provider_display_name,
       cases.check_key,
       requests.requested_by_identity_id,
       requests.requested_result,
       requests.reason_code,
       requests.rationale,
       cardinality(requests.evidence_version_ids)::text AS evidence_version_count,
       requests.status,
       requests.due_at,
       requests.policy_version,
       requests.created_at,
       requests.resolved_at
     FROM operations.high_risk_override_requests AS requests
     JOIN verification.cases AS cases ON cases.id = requests.case_id
     JOIN provider.profiles AS profiles ON profiles.provider_id = cases.provider_id`;
  }

  private async mapOverride(
    client: PoolClient,
    row: OverrideRow,
  ): Promise<OperationsOverrideRequestView> {
    const approvals = await client.query<ApprovalRow>(
      `SELECT
         id AS approval_id,
         approver_identity_id,
         decision,
         rationale,
         policy_version,
         created_at
       FROM operations.high_risk_override_approvals
       WHERE override_request_id = $1
       ORDER BY created_at, id`,
      [row.override_request_id],
    );
    const mapped: OperationsOverrideApprovalView[] = approvals.rows.map((approval) => ({
      approvalId: approval.approval_id,
      approverIdentityId: approval.approver_identity_id,
      decision: approval.decision,
      rationale: approval.rationale,
      policyVersion: approval.policy_version,
      createdAt: approval.created_at.toISOString(),
    }));
    return {
      overrideRequestId: row.override_request_id,
      caseId: row.case_id,
      providerId: row.provider_id,
      providerDisplayName: row.provider_display_name,
      checkKey: row.check_key,
      requestedByIdentityId: row.requested_by_identity_id,
      requestedResult: row.requested_result,
      reasonCode: row.reason_code,
      rationale: row.rationale,
      evidenceVersionCount: Number(row.evidence_version_count),
      status: row.status,
      dueAt: row.due_at.toISOString(),
      policyVersion: row.policy_version,
      approvals: mapped,
      approvalCount: mapped.filter((approval) => approval.decision === 'approve').length,
      distinctApproversRequired: 2,
      createsDecision: false,
      createsClaim: false,
      changesPublication: false,
      createdAt: row.created_at.toISOString(),
      resolvedAt: row.resolved_at?.toISOString() ?? null,
      synthetic: true,
    };
  }

  private async audit(
    client: PoolClient,
    actor: AuthenticatedActor,
    providerId: string,
    requestId: string | undefined,
    event: {
      action: string;
      resourceType: string;
      resourceId: string;
      metadata: Record<string, unknown>;
    },
  ): Promise<void> {
    await client.query(
      `INSERT INTO platform.audit_events (
         request_id, actor_type, actor_id, provider_id,
         action, resource_type, resource_id, outcome, metadata
       ) VALUES ($1, 'identity', $2, $3, $4, $5, $6, 'success', $7::jsonb)`,
      [
        requestId ?? null,
        actor.identityId,
        providerId,
        event.action,
        event.resourceType,
        event.resourceId,
        JSON.stringify(event.metadata),
      ],
    );
  }
}
