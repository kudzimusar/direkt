import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { PoolClient } from 'pg';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { DatabaseService } from '../platform/database/database.service';
import type {
  CreateOperationsIncidentDto,
  ResolveOperationsIncidentDto,
} from './operations-reporting.dto';
import type {
  OperationsExpiryItem,
  OperationsIncidentView,
  OperationsMetricsSnapshot,
} from './operations-reporting.types';

interface IncidentRow {
  incident_id: string;
  record_type: OperationsIncidentView['recordType'];
  provider_id: string;
  provider_display_name: string;
  case_id: string | null;
  evidence_linked: boolean;
  category_code: string;
  severity: OperationsIncidentView['severity'];
  summary: string;
  status: OperationsIncidentView['status'];
  owner_identity_id: string;
  due_at: Date;
  policy_version: string;
  resolution_code: string | null;
  resolution_summary: string | null;
  resolved_at: Date | null;
  created_at: Date;
  source: 'operations_internal';
  reported_by_identity_id: string;
}

interface ExpiryRow {
  record_type: OperationsExpiryItem['recordType'];
  provider_id: string;
  provider_display_name: string;
  record_id: string;
  record_key: string;
  record_label: string;
  status: string;
  expires_at: Date;
  days_remaining: number;
  action_state: OperationsExpiryItem['actionState'];
}

interface MetricsRow {
  generated_at: Date;
  triage_total: number;
  triage_overdue: number;
  triage_breached: number;
  decisions_last_30_days: number;
  corrections_last_30_days: number;
  field_work_active: number;
  field_work_completed_last_30_days: number;
  escalations_active: number;
  incidents_active: number;
  evidence_due: number;
  claims_due: number;
}

@Injectable()
export class OperationsReportingRepository {
  constructor(private readonly database: DatabaseService) {}

  createIncident(
    actor: AuthenticatedActor,
    dto: CreateOperationsIncidentDto,
    requestId?: string,
  ): Promise<OperationsIncidentView> {
    return this.database.transaction(async (client) => {
      const provider = await client.query<{ id: string }>(
        'SELECT id FROM provider.organizations WHERE id = $1 AND status <> \'archived\'',
        [dto.providerId],
      );
      if (!provider.rows[0]) {
        throw new NotFoundException('Active provider was not found for the operations record.');
      }
      const result = await client.query<{ id: string }>(
        `INSERT INTO operations.incident_records (
           record_type,
           provider_id,
           case_id,
           evidence_id,
           category_code,
           severity,
           summary,
           private_details,
           reported_by_identity_id,
           owner_identity_id,
           due_at,
           policy_version
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          dto.recordType,
          dto.providerId,
          dto.caseId ?? null,
          dto.evidenceId ?? null,
          dto.categoryCode,
          dto.severity,
          dto.summary.trim(),
          dto.privateDetails?.trim() ?? null,
          actor.identityId,
          dto.ownerIdentityId,
          dto.dueAt,
          dto.policyVersion,
        ],
      );
      const incidentId = result.rows[0]?.id;
      if (!incidentId) throw new Error('Operations incident creation returned no identifier.');
      await this.audit(client, actor, dto.providerId, requestId, {
        action: 'operations_incident_created',
        resourceType: 'operations_incident',
        resourceId: incidentId,
        metadata: {
          recordType: dto.recordType,
          caseId: dto.caseId ?? null,
          evidenceLinked: Boolean(dto.evidenceId),
          categoryCode: dto.categoryCode,
          severity: dto.severity,
          ownerIdentityId: dto.ownerIdentityId,
          policyVersion: dto.policyVersion,
          customerInteractionIncluded: false,
          privateDetailsLogged: false,
        },
      });
      return this.loadIncident(client, incidentId);
    });
  }

  listIncidents(
    actorIdentityId: string,
    allAccess: boolean,
  ): Promise<OperationsIncidentView[]> {
    return this.database.query<IncidentRow>(
      `${this.incidentQuery()}
       WHERE $2::boolean = true
          OR incidents.owner_identity_id = $1
          OR incidents.reported_by_identity_id = $1
       ORDER BY
         CASE incidents.severity
           WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3
         END,
         incidents.due_at,
         incidents.created_at`,
      [actorIdentityId, allAccess],
    ).then((result) => result.rows.map((row) => this.mapIncident(row)));
  }

  startIncident(
    actor: AuthenticatedActor,
    incidentId: string,
    reason: string,
    requestId?: string,
  ): Promise<OperationsIncidentView> {
    return this.database.transaction(async (client) => {
      const current = await this.lockIncident(client, incidentId);
      if (current.status !== 'open') {
        throw new ConflictException('Only an open operations incident can be started.');
      }
      if (current.owner_identity_id !== actor.identityId) {
        throw new NotFoundException('Owned operations incident was not found.');
      }
      await client.query(
        `UPDATE operations.incident_records
         SET status = 'investigating'
         WHERE id = $1`,
        [incidentId],
      );
      await this.audit(client, actor, current.provider_id, requestId, {
        action: 'operations_incident_started',
        resourceType: 'operations_incident',
        resourceId: incidentId,
        metadata: { reason: reason.trim(), caseId: current.case_id },
      });
      return this.loadIncident(client, incidentId);
    });
  }

  resolveIncident(
    actor: AuthenticatedActor,
    incidentId: string,
    dto: ResolveOperationsIncidentDto,
    requestId?: string,
  ): Promise<OperationsIncidentView> {
    return this.database.transaction(async (client) => {
      const current = await this.lockIncident(client, incidentId);
      if (!['open', 'investigating'].includes(current.status)) {
        throw new ConflictException('Only an active operations incident can be resolved.');
      }
      await client.query(
        `UPDATE operations.incident_records
         SET status = $2,
             resolution_code = $3,
             resolution_summary = $4,
             resolved_by_identity_id = $5,
             resolved_at = now()
         WHERE id = $1`,
        [
          incidentId,
          dto.targetStatus,
          dto.resolutionCode,
          dto.resolutionSummary.trim(),
          actor.identityId,
        ],
      );
      await this.audit(client, actor, current.provider_id, requestId, {
        action: 'operations_incident_resolved',
        resourceType: 'operations_incident',
        resourceId: incidentId,
        metadata: {
          caseId: current.case_id,
          targetStatus: dto.targetStatus,
          resolutionCode: dto.resolutionCode,
        },
      });
      return this.loadIncident(client, incidentId);
    });
  }

  expiry(): Promise<OperationsExpiryItem[]> {
    return this.database.query<ExpiryRow>(
      `SELECT
         record_type,
         provider_id,
         provider_display_name,
         record_id,
         record_key,
         record_label,
         status,
         expires_at,
         days_remaining,
         action_state
       FROM operations.expiry_renewal_dashboard
       ORDER BY
         CASE action_state WHEN 'renew_now' THEN 0 WHEN 'due_soon' THEN 1 ELSE 2 END,
         expires_at,
         provider_display_name,
         record_type,
         record_key`,
    ).then((result) => result.rows.map((row) => this.mapExpiry(row)));
  }

  async metrics(): Promise<OperationsMetricsSnapshot> {
    const result = await this.database.query<MetricsRow>(
      'SELECT * FROM operations.operational_metrics_snapshot',
    );
    const row = result.rows[0];
    if (!row) throw new Error('Operations metrics projection returned no row.');
    return {
      generatedAt: row.generated_at.toISOString(),
      triageTotal: Number(row.triage_total),
      triageOverdue: Number(row.triage_overdue),
      triageBreached: Number(row.triage_breached),
      decisionsLast30Days: Number(row.decisions_last_30_days),
      correctionsLast30Days: Number(row.corrections_last_30_days),
      fieldWorkActive: Number(row.field_work_active),
      fieldWorkCompletedLast30Days: Number(row.field_work_completed_last_30_days),
      escalationsActive: Number(row.escalations_active),
      incidentsActive: Number(row.incidents_active),
      evidenceDue: Number(row.evidence_due),
      claimsDue: Number(row.claims_due),
      aggregateOnly: true,
      privateIdentifiersIncluded: false,
      synthetic: true,
    };
  }

  private async loadIncident(
    client: PoolClient,
    incidentId: string,
  ): Promise<OperationsIncidentView> {
    const result = await client.query<IncidentRow>(
      `${this.incidentQuery()} WHERE incidents.id = $1`,
      [incidentId],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Operations incident was not found.');
    return this.mapIncident(row);
  }

  private async lockIncident(client: PoolClient, incidentId: string): Promise<IncidentRow> {
    const result = await client.query<IncidentRow>(
      `${this.incidentQuery()} WHERE incidents.id = $1 FOR UPDATE OF incidents`,
      [incidentId],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Operations incident was not found.');
    return row;
  }

  private incidentQuery(): string {
    return `SELECT
       incidents.id AS incident_id,
       incidents.record_type,
       incidents.provider_id,
       profiles.display_name AS provider_display_name,
       incidents.case_id,
       (incidents.evidence_id IS NOT NULL) AS evidence_linked,
       incidents.category_code,
       incidents.severity,
       incidents.summary,
       incidents.status,
       incidents.owner_identity_id,
       incidents.due_at,
       incidents.policy_version,
       incidents.resolution_code,
       incidents.resolution_summary,
       incidents.resolved_at,
       incidents.created_at,
       incidents.source,
       incidents.reported_by_identity_id
     FROM operations.incident_records AS incidents
     JOIN provider.profiles AS profiles ON profiles.provider_id = incidents.provider_id`;
  }

  private mapIncident(row: IncidentRow): OperationsIncidentView {
    return {
      incidentId: row.incident_id,
      recordType: row.record_type,
      providerId: row.provider_id,
      providerDisplayName: row.provider_display_name,
      caseId: row.case_id,
      evidenceLinked: row.evidence_linked,
      categoryCode: row.category_code,
      severity: row.severity,
      summary: row.summary,
      status: row.status,
      ownerIdentityId: row.owner_identity_id,
      dueAt: row.due_at.toISOString(),
      policyVersion: row.policy_version,
      resolutionCode: row.resolution_code,
      resolutionSummary: row.resolution_summary,
      resolvedAt: row.resolved_at?.toISOString() ?? null,
      createdAt: row.created_at.toISOString(),
      source: row.source,
      privateDetailsIncluded: false,
      customerInteractionIncluded: false,
      privateEvidenceIncluded: false,
      privateCoordinatesIncluded: false,
      synthetic: true,
    };
  }

  private mapExpiry(row: ExpiryRow): OperationsExpiryItem {
    return {
      recordType: row.record_type,
      providerId: row.provider_id,
      providerDisplayName: row.provider_display_name,
      recordId: row.record_id,
      recordKey: row.record_key,
      recordLabel: row.record_label,
      status: row.status,
      expiresAt: row.expires_at.toISOString(),
      daysRemaining: Number(row.days_remaining),
      actionState: row.action_state,
      documentContentIncluded: false,
      objectKeyIncluded: false,
      privateCoordinatesIncluded: false,
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
