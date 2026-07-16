import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { DatabaseService } from '../platform/database/database.service';
import type {
  CancelOperationsFieldWorkDto,
  CreateOperationsFieldWorkDto,
  ReassignOperationsFieldWorkDto,
  SubmitOperationsFieldInspectionDto,
  TransitionOperationsFieldWorkDto,
} from './operations-field.dto';
import type {
  OperationsFieldObservation,
  OperationsFieldOutcome,
  OperationsFieldSubmissionView,
  OperationsFieldWorkItem,
  OperationsFieldWorkState,
} from './operations-field.types';

interface FieldScopeRow {
  provider_id: string;
  category_id: string;
  requirement_id: string;
  template_id: string;
}

interface FieldWorkRow {
  work_item_id: string;
  case_id: string;
  provider_id: string;
  provider_display_name: string;
  category_key: string;
  category_name: string;
  requirement_key: string;
  requirement_label: string;
  check_key: string;
  check_family: string;
  verification_assignment_id: string;
  field_agent_identity_id: string;
  template_id: string;
  template_key: string;
  template_version: number;
  template_title: string;
  template_policy_version: string;
  state: OperationsFieldWorkState;
  scheduled_for: Date;
  due_at: Date;
  assignment_reason: string;
  policy_version: string;
  accepted_at: Date | null;
  started_at: Date | null;
  ended_at: Date | null;
  terminal_reason: string | null;
  replaced_by_work_item_id: string | null;
}

interface FieldSubmissionRow {
  submission_id: string;
  work_item_id: string;
  case_id: string;
  outcome: OperationsFieldOutcome;
  checklist_version: string;
  public_safe_summary: string;
  observations: OperationsFieldObservation[];
  evidence_reference_count: string;
  policy_version: string;
  occurred_at: Date;
  recorded_at: Date;
}

@Injectable()
export class OperationsFieldRepository {
  constructor(private readonly database: DatabaseService) {}

  create(
    actor: AuthenticatedActor,
    dto: CreateOperationsFieldWorkDto,
    requestId?: string,
  ): Promise<OperationsFieldWorkItem> {
    return this.database.transaction(async (client) => {
      const scope = await this.resolveScope(
        client,
        dto.caseId,
        dto.fieldAgentIdentityId,
        dto.templateKey,
        dto.templateVersion,
      );
      const assignmentResult = await client.query<{ id: string }>(
        `INSERT INTO verification.assignments (
           case_id,
           assignee_identity_id,
           assignment_kind,
           assigned_by_identity_id,
           reason
         ) VALUES ($1, $2, 'field_agent', $3, $4)
         RETURNING id`,
        [dto.caseId, dto.fieldAgentIdentityId, actor.identityId, dto.reason.trim()],
      );
      const assignmentId = assignmentResult.rows[0]?.id;
      if (!assignmentId) {
        throw new Error('Field-agent assignment creation returned no identifier.');
      }
      const workResult = await client.query<{ id: string }>(
        `INSERT INTO operations.field_work_items (
           case_id,
           verification_assignment_id,
           provider_id,
           category_id,
           requirement_id,
           field_agent_identity_id,
           template_id,
           scheduled_for,
           due_at,
           assignment_reason,
           policy_version,
           assigned_by_identity_id
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          dto.caseId,
          assignmentId,
          scope.provider_id,
          scope.category_id,
          scope.requirement_id,
          dto.fieldAgentIdentityId,
          scope.template_id,
          dto.scheduledFor,
          dto.dueAt,
          dto.reason.trim(),
          dto.policyVersion,
          actor.identityId,
        ],
      );
      const workItemId = workResult.rows[0]?.id;
      if (!workItemId) {
        throw new Error('Field work creation returned no identifier.');
      }
      await this.audit(client, {
        actor,
        providerId: scope.provider_id,
        requestId,
        action: 'operations_field_work_created',
        resourceType: 'field_work_item',
        resourceId: workItemId,
        metadata: {
          caseId: dto.caseId,
          assignmentId,
          fieldAgentIdentityId: dto.fieldAgentIdentityId,
          templateKey: dto.templateKey,
          templateVersion: dto.templateVersion,
          policyVersion: dto.policyVersion,
          privateCoordinatesIncluded: false,
        },
      });
      return this.load(client, workItemId, actor.identityId, true);
    });
  }

  list(actorIdentityId: string, allWork: boolean): Promise<OperationsFieldWorkItem[]> {
    return this.database.transaction(async (client) => {
      const rows = await client.query<FieldWorkRow>(
        `${this.workQuery()}
         WHERE ($2::boolean = true OR work.field_agent_identity_id = $1)
         ORDER BY
           CASE WHEN work.state IN ('scheduled', 'accepted', 'in_progress') THEN 0 ELSE 1 END,
           work.due_at,
           work.created_at,
           work.id`,
        [actorIdentityId, allWork],
      );
      const items: OperationsFieldWorkItem[] = [];
      for (const row of rows.rows) {
        items.push(await this.mapWork(client, row));
      }
      return items;
    });
  }

  detail(
    workItemId: string,
    actorIdentityId: string,
    allWork: boolean,
  ): Promise<OperationsFieldWorkItem> {
    return this.database.transaction((client) =>
      this.load(client, workItemId, actorIdentityId, allWork),
    );
  }

  transition(
    actor: AuthenticatedActor,
    workItemId: string,
    dto: TransitionOperationsFieldWorkDto,
    requestId?: string,
  ): Promise<OperationsFieldWorkItem> {
    return this.database.transaction(async (client) => {
      const current = await this.lockOwnedWork(client, workItemId, actor.identityId);
      await client.query(
        `UPDATE operations.field_work_items
         SET state = $2
         WHERE id = $1`,
        [workItemId, dto.targetState],
      );
      await this.audit(client, {
        actor,
        providerId: current.provider_id,
        requestId,
        action: 'operations_field_work_transitioned',
        resourceType: 'field_work_item',
        resourceId: workItemId,
        metadata: {
          from: current.state,
          to: dto.targetState,
          reason: dto.reason.trim(),
          advisoryOnly: true,
        },
      });
      return this.load(client, workItemId, actor.identityId, false);
    });
  }

  cancel(
    actor: AuthenticatedActor,
    workItemId: string,
    dto: CancelOperationsFieldWorkDto,
    requestId?: string,
  ): Promise<OperationsFieldWorkItem> {
    return this.database.transaction(async (client) => {
      const current = await this.lockWork(client, workItemId);
      if (!['scheduled', 'accepted', 'in_progress'].includes(current.state)) {
        throw new ConflictException('Only active field work can be cancelled.');
      }
      await client.query(
        `UPDATE verification.assignments
         SET status = 'revoked', ended_at = now()
         WHERE id = $1 AND status = 'active'`,
        [current.verification_assignment_id],
      );
      await client.query(
        `UPDATE operations.field_work_items
         SET state = 'cancelled', terminal_reason = $2
         WHERE id = $1`,
        [workItemId, dto.reason.trim()],
      );
      await this.audit(client, {
        actor,
        providerId: current.provider_id,
        requestId,
        action: 'operations_field_work_cancelled',
        resourceType: 'field_work_item',
        resourceId: workItemId,
        metadata: { reason: dto.reason.trim(), advisoryOnly: true },
      });
      return this.load(client, workItemId, actor.identityId, true);
    });
  }

  reassign(
    actor: AuthenticatedActor,
    workItemId: string,
    dto: ReassignOperationsFieldWorkDto,
    requestId?: string,
  ): Promise<OperationsFieldWorkItem> {
    return this.database.transaction(async (client) => {
      const current = await this.lockWork(client, workItemId);
      if (!['scheduled', 'accepted'].includes(current.state)) {
        throw new ConflictException('Only scheduled or accepted field work can be reassigned.');
      }
      await this.assertFieldAgent(client, dto.fieldAgentIdentityId);
      const replacementAssignmentId = randomUUID();
      const replacementWorkItemId = randomUUID();

      await client.query(
        `UPDATE verification.assignments
         SET status = 'revoked', ended_at = now()
         WHERE id = $1 AND status = 'active'`,
        [current.verification_assignment_id],
      );
      await client.query(
        `UPDATE operations.field_work_items
         SET state = 'reassigned',
             terminal_reason = $2,
             replaced_by_work_item_id = $3
         WHERE id = $1`,
        [workItemId, dto.reason.trim(), replacementWorkItemId],
      );
      await client.query(
        `INSERT INTO verification.assignments (
           id,
           case_id,
           assignee_identity_id,
           assignment_kind,
           assigned_by_identity_id,
           reason
         ) VALUES ($1, $2, $3, 'field_agent', $4, $5)`,
        [
          replacementAssignmentId,
          current.case_id,
          dto.fieldAgentIdentityId,
          actor.identityId,
          dto.reason.trim(),
        ],
      );
      await client.query(
        `INSERT INTO operations.field_work_items (
           id,
           case_id,
           verification_assignment_id,
           provider_id,
           category_id,
           requirement_id,
           field_agent_identity_id,
           template_id,
           scheduled_for,
           due_at,
           assignment_reason,
           policy_version,
           assigned_by_identity_id
         ) SELECT
           $1,
           work.case_id,
           $2,
           work.provider_id,
           work.category_id,
           work.requirement_id,
           $3,
           work.template_id,
           $4,
           $5,
           $6,
           $7,
           $8
         FROM operations.field_work_items AS work
         WHERE work.id = $9`,
        [
          replacementWorkItemId,
          replacementAssignmentId,
          dto.fieldAgentIdentityId,
          dto.scheduledFor,
          dto.dueAt,
          dto.reason.trim(),
          dto.policyVersion,
          actor.identityId,
          workItemId,
        ],
      );
      await this.audit(client, {
        actor,
        providerId: current.provider_id,
        requestId,
        action: 'operations_field_work_reassigned',
        resourceType: 'field_work_item',
        resourceId: replacementWorkItemId,
        metadata: {
          replacedWorkItemId: workItemId,
          replacementAssignmentId,
          fieldAgentIdentityId: dto.fieldAgentIdentityId,
          reason: dto.reason.trim(),
          policyVersion: dto.policyVersion,
        },
      });
      return this.load(client, replacementWorkItemId, actor.identityId, true);
    });
  }

  submit(
    actor: AuthenticatedActor,
    workItemId: string,
    dto: SubmitOperationsFieldInspectionDto,
    payloadHash: string,
    requestId?: string,
  ): Promise<OperationsFieldWorkItem> {
    return this.database.transaction(async (client) => {
      const current = await this.lockOwnedWork(client, workItemId, actor.identityId);
      const existing = await client.query<{ payload_hash: string }>(
        `SELECT payload_hash
         FROM operations.field_inspection_submissions
         WHERE work_item_id = $1 AND client_submission_key = $2`,
        [workItemId, dto.clientSubmissionKey],
      );
      const existingHash = existing.rows[0]?.payload_hash;
      if (existingHash) {
        if (existingHash !== payloadHash) {
          throw new ConflictException(
            'The client submission key already exists with a different inspection payload.',
          );
        }
        return this.load(client, workItemId, actor.identityId, false);
      }
      if (!['accepted', 'in_progress'].includes(current.state)) {
        throw new ConflictException(
          'Field work must be accepted before an inspection is submitted.',
        );
      }

      const visitOutcome = this.visitOutcome(dto.outcome);
      const visit = await client.query<{ id: string }>(
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
          current.case_id,
          current.verification_assignment_id,
          actor.identityId,
          visitOutcome,
          dto.checklistVersion,
          dto.publicSafeSummary.trim(),
          dto.privateNotes?.trim() ?? null,
          dto.occurredAt,
        ],
      );
      const fieldVisitId = visit.rows[0]?.id;
      if (!fieldVisitId) {
        throw new Error('Structured field visit creation returned no identifier.');
      }
      await client.query(
        `INSERT INTO operations.field_inspection_submissions (
           work_item_id,
           case_id,
           assignment_id,
           field_visit_id,
           submitted_by_identity_id,
           client_submission_key,
           payload_hash,
           outcome,
           checklist_version,
           public_safe_summary,
           private_notes,
           observations,
           evidence_references,
           policy_version,
           occurred_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14, $15
         )`,
        [
          workItemId,
          current.case_id,
          current.verification_assignment_id,
          fieldVisitId,
          actor.identityId,
          dto.clientSubmissionKey,
          payloadHash,
          dto.outcome,
          dto.checklistVersion,
          dto.publicSafeSummary.trim(),
          dto.privateNotes?.trim() ?? null,
          JSON.stringify(
            dto.observations.map((observation) => ({
              key: observation.key,
              result: observation.result,
              note: observation.note?.trim() ?? null,
            })),
          ),
          JSON.stringify(dto.evidenceReferences ?? []),
          dto.policyVersion,
          dto.occurredAt,
        ],
      );
      await client.query(
        `UPDATE operations.field_work_items
         SET state = $2, terminal_reason = $3
         WHERE id = $1`,
        [workItemId, this.terminalState(dto.outcome), dto.publicSafeSummary.trim()],
      );
      await client.query(
        `UPDATE verification.assignments
         SET status = 'completed', ended_at = now()
         WHERE id = $1 AND status = 'active'`,
        [current.verification_assignment_id],
      );
      await this.audit(client, {
        actor,
        providerId: current.provider_id,
        requestId,
        action: 'operations_field_inspection_submitted',
        resourceType: 'field_work_item',
        resourceId: workItemId,
        metadata: {
          fieldVisitId,
          outcome: dto.outcome,
          checklistVersion: dto.checklistVersion,
          policyVersion: dto.policyVersion,
          observationCount: dto.observations.length,
          evidenceReferenceCount: dto.evidenceReferences?.length ?? 0,
          advisoryOnly: true,
          privateCoordinatesIncluded: false,
        },
      });
      return this.load(client, workItemId, actor.identityId, false);
    });
  }

  private async resolveScope(
    client: PoolClient,
    caseId: string,
    fieldAgentIdentityId: string,
    templateKey: string,
    templateVersion: number,
  ): Promise<FieldScopeRow> {
    await this.assertFieldAgent(client, fieldAgentIdentityId);
    const result = await client.query<FieldScopeRow>(
      `SELECT
         cases.provider_id,
         cases.category_id,
         cases.requirement_id,
         templates.id AS template_id
       FROM verification.cases AS cases
       JOIN operations.field_inspection_templates AS templates
         ON templates.template_key = $3
        AND templates.version = $4
        AND templates.effective_from <= now()
        AND (templates.effective_until IS NULL OR templates.effective_until > now())
        AND templates.check_family IN ('field_visit', cases.check_family)
       WHERE cases.id = $1
         AND cases.status NOT IN ('approved', 'rejected', 'revoked', 'expired', 'cancelled', 'closed')
         AND $2::uuid IS NOT NULL`,
      [caseId, fieldAgentIdentityId, templateKey, templateVersion],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('A scoped field-work case and template were not found.');
    }
    return row;
  }

  private async assertFieldAgent(client: PoolClient, identityId: string): Promise<void> {
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
           AND roles.role_key = 'field_agent'
       ) AS permitted`,
      [identityId],
    );
    if (!result.rows[0]?.permitted) {
      throw new NotFoundException('An active field-agent identity was not found.');
    }
  }

  private async lockOwnedWork(
    client: PoolClient,
    workItemId: string,
    actorIdentityId: string,
  ): Promise<FieldWorkRow> {
    const result = await client.query<FieldWorkRow>(
      `${this.workQuery()}
       WHERE work.id = $1 AND work.field_agent_identity_id = $2
       FOR UPDATE OF work`,
      [workItemId, actorIdentityId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Assigned field work was not found.');
    }
    return row;
  }

  private async lockWork(client: PoolClient, workItemId: string): Promise<FieldWorkRow> {
    const result = await client.query<FieldWorkRow>(
      `${this.workQuery()} WHERE work.id = $1 FOR UPDATE OF work`,
      [workItemId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Field work was not found.');
    }
    return row;
  }

  private async load(
    client: PoolClient,
    workItemId: string,
    actorIdentityId: string,
    allWork: boolean,
  ): Promise<OperationsFieldWorkItem> {
    const result = await client.query<FieldWorkRow>(
      `${this.workQuery()}
       WHERE work.id = $1
         AND ($3::boolean = true OR work.field_agent_identity_id = $2)`,
      [workItemId, actorIdentityId, allWork],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Field work was not found.');
    }
    return this.mapWork(client, row);
  }

  private async mapWork(client: PoolClient, row: FieldWorkRow): Promise<OperationsFieldWorkItem> {
    const submissionResult = await client.query<FieldSubmissionRow>(
      `SELECT
         submissions.id AS submission_id,
         submissions.work_item_id,
         submissions.case_id,
         submissions.outcome,
         submissions.checklist_version,
         submissions.public_safe_summary,
         submissions.observations,
         jsonb_array_length(submissions.evidence_references)::text AS evidence_reference_count,
         submissions.policy_version,
         submissions.occurred_at,
         submissions.recorded_at
       FROM operations.field_inspection_submissions AS submissions
       WHERE submissions.work_item_id = $1`,
      [row.work_item_id],
    );
    const submission = submissionResult.rows[0];
    return {
      workItemId: row.work_item_id,
      caseId: row.case_id,
      providerId: row.provider_id,
      providerDisplayName: row.provider_display_name,
      categoryKey: row.category_key,
      categoryName: row.category_name,
      requirementKey: row.requirement_key,
      requirementLabel: row.requirement_label,
      checkKey: row.check_key,
      checkFamily: row.check_family,
      verificationAssignmentId: row.verification_assignment_id,
      fieldAgentIdentityId: row.field_agent_identity_id,
      template: {
        templateKey: row.template_key,
        version: row.template_version,
        title: row.template_title,
        policyVersion: row.template_policy_version,
      },
      state: row.state,
      scheduledFor: row.scheduled_for.toISOString(),
      dueAt: row.due_at.toISOString(),
      assignmentReason: row.assignment_reason,
      policyVersion: row.policy_version,
      acceptedAt: row.accepted_at?.toISOString() ?? null,
      startedAt: row.started_at?.toISOString() ?? null,
      endedAt: row.ended_at?.toISOString() ?? null,
      terminalReason: row.terminal_reason,
      replacedByWorkItemId: row.replaced_by_work_item_id,
      submission: submission ? this.mapSubmission(submission) : null,
      advisoryOnly: true,
      privateNotesIncluded: false,
      privateCoordinatesIncluded: false,
      evidenceIdentifiersIncluded: false,
      synthetic: true,
    };
  }

  private mapSubmission(row: FieldSubmissionRow): OperationsFieldSubmissionView {
    return {
      submissionId: row.submission_id,
      workItemId: row.work_item_id,
      caseId: row.case_id,
      outcome: row.outcome,
      checklistVersion: row.checklist_version,
      publicSafeSummary: row.public_safe_summary,
      observations: row.observations,
      evidenceReferenceCount: Number(row.evidence_reference_count),
      policyVersion: row.policy_version,
      occurredAt: row.occurred_at.toISOString(),
      recordedAt: row.recorded_at.toISOString(),
      advisoryOnly: true,
      privateNotesIncluded: false,
      evidenceIdentifiersIncluded: false,
      privateCoordinatesIncluded: false,
      synthetic: true,
    };
  }

  private workQuery(): string {
    return `SELECT
       work.id AS work_item_id,
       work.case_id,
       work.provider_id,
       profiles.display_name AS provider_display_name,
       categories.category_key,
       categories.name AS category_name,
       requirements.requirement_key,
       requirements.label AS requirement_label,
       cases.check_key,
       cases.check_family,
       work.verification_assignment_id,
       work.field_agent_identity_id,
       work.template_id,
       templates.template_key,
       templates.version AS template_version,
       templates.title AS template_title,
       templates.policy_version AS template_policy_version,
       work.state,
       work.scheduled_for,
       work.due_at,
       work.assignment_reason,
       work.policy_version,
       work.accepted_at,
       work.started_at,
       work.ended_at,
       work.terminal_reason,
       work.replaced_by_work_item_id
     FROM operations.field_work_items AS work
     JOIN verification.cases AS cases ON cases.id = work.case_id
     JOIN provider.profiles AS profiles ON profiles.provider_id = work.provider_id
     JOIN catalog.service_categories AS categories ON categories.id = work.category_id
     JOIN catalog.requirements AS requirements ON requirements.id = work.requirement_id
     JOIN operations.field_inspection_templates AS templates ON templates.id = work.template_id`;
  }

  private terminalState(outcome: OperationsFieldOutcome): OperationsFieldWorkState {
    if (outcome === 'safety_abort') return 'safety_abort';
    if (outcome === 'missed') return 'missed';
    if (outcome === 'unable_to_access' || outcome === 'unable_to_verify') {
      return 'unable_to_verify';
    }
    return 'submitted';
  }

  private visitOutcome(
    outcome: OperationsFieldOutcome,
  ): 'completed' | 'inconclusive' | 'unable_to_access' | 'safety_abort' {
    if (outcome === 'missed') return 'unable_to_access';
    if (outcome === 'unable_to_verify') return 'inconclusive';
    return outcome;
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
