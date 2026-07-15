import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../platform/database/database.service';
import type {
  VerificationAssignmentKind,
  VerificationCaseStatus,
  VerificationCheckFamily,
} from '../verification-evidence/verification-evidence.types';
import type { OperationsTriageQueryDto } from './operations-triage.dto';
import type {
  OperationsTriageItem,
  OperationsTriageOwnership,
  OperationsTriageScope,
  OperationsTriageSlaState,
} from './operations-triage.types';

interface OperationsTriageRow {
  case_id: string;
  provider_id: string;
  provider_display_name: string;
  category_key: string;
  category_name: string;
  requirement_key: string;
  requirement_label: string;
  check_key: string;
  check_family: VerificationCheckFamily;
  status: VerificationCaseStatus;
  high_risk: boolean;
  case_policy_version: string;
  triage_policy_version: string;
  age_minutes: number;
  waiting_minutes: number;
  review_due_at: Date;
  escalation_due_at: Date;
  sla_state: OperationsTriageSlaState;
  active_assignment_id: string | null;
  assignee_identity_id: string | null;
  assignment_kind: VerificationAssignmentKind | null;
  assignment_state: 'assigned' | 'unassigned';
  evidence_count: number;
  ready_evidence_count: number;
  correction_evidence_count: number;
  priority_score: number;
  escalation_required: boolean;
}

interface OperationsTriageListInput {
  actorIdentityId: string;
  scope: OperationsTriageScope;
  query: OperationsTriageQueryDto;
}

@Injectable()
export class OperationsTriageRepository {
  constructor(private readonly database: DatabaseService) {}

  async list(input: OperationsTriageListInput): Promise<OperationsTriageItem[]> {
    const highRisk = this.optionalBoolean(input.query.highRisk);
    const escalationRequired = this.optionalBoolean(input.query.escalationRequired);
    const result = await this.database.query<OperationsTriageRow>(
      `SELECT
         queue.case_id,
         queue.provider_id,
         queue.provider_display_name,
         queue.category_key,
         queue.category_name,
         queue.requirement_key,
         queue.requirement_label,
         queue.check_key,
         queue.check_family,
         queue.status,
         queue.high_risk,
         queue.case_policy_version,
         queue.triage_policy_version,
         queue.age_minutes,
         queue.waiting_minutes,
         queue.review_due_at,
         queue.escalation_due_at,
         queue.sla_state,
         queue.active_assignment_id,
         queue.assignee_identity_id,
         queue.assignment_kind,
         queue.assignment_state,
         queue.evidence_count,
         queue.ready_evidence_count,
         queue.correction_evidence_count,
         queue.priority_score,
         queue.escalation_required
       FROM operations.verification_triage_queue AS queue
       WHERE (
           $2::text = 'all_cases'
           OR queue.assignee_identity_id IS NULL
           OR queue.assignee_identity_id = $1::uuid
         )
         AND ($3::uuid IS NULL OR queue.provider_id = $3)
         AND ($4::text IS NULL OR queue.status = $4)
         AND ($5::text IS NULL OR queue.sla_state = $5)
         AND (
           $6::text IS NULL
           OR CASE
             WHEN queue.assignee_identity_id = $1::uuid THEN 'mine'
             WHEN queue.assignee_identity_id IS NULL THEN 'unassigned'
             ELSE 'other'
           END = $6
         )
         AND ($7::text IS NULL OR queue.check_family = $7)
         AND ($8::boolean IS NULL OR queue.high_risk = $8)
         AND ($9::boolean IS NULL OR queue.escalation_required = $9)
       ORDER BY
         queue.priority_score DESC,
         queue.review_due_at,
         queue.case_id
       LIMIT $10`,
      [
        input.actorIdentityId,
        input.scope,
        input.query.providerId ?? null,
        input.query.status ?? null,
        input.query.slaState ?? null,
        input.query.ownership ?? null,
        input.query.checkFamily ?? null,
        highRisk,
        escalationRequired,
        input.query.limit,
      ],
    );

    return result.rows.map((row) => {
      const ownership: OperationsTriageOwnership =
        row.assignee_identity_id === input.actorIdentityId
          ? 'mine'
          : row.assignee_identity_id === null
            ? 'unassigned'
            : 'other';
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
        casePolicyVersion: row.case_policy_version,
        triagePolicyVersion: row.triage_policy_version,
        ageMinutes: Number(row.age_minutes),
        waitingMinutes: Number(row.waiting_minutes),
        reviewDueAt: row.review_due_at.toISOString(),
        escalationDueAt: row.escalation_due_at.toISOString(),
        slaState: row.sla_state,
        assignmentId: row.active_assignment_id,
        assigneeIdentityId: row.assignee_identity_id,
        assignmentKind: row.assignment_kind,
        assignmentState: row.assignment_state,
        ownership,
        evidenceCount: Number(row.evidence_count),
        readyEvidenceCount: Number(row.ready_evidence_count),
        correctionEvidenceCount: Number(row.correction_evidence_count),
        priorityScore: Number(row.priority_score),
        priorityBand: this.priorityBand(
          Number(row.priority_score),
          row.sla_state,
          row.high_risk,
        ),
        escalationRequired: row.escalation_required,
        privateEvidenceIncluded: false,
        reviewerNotesIncluded: false,
        privateCoordinatesIncluded: false,
        synthetic: true,
      };
    });
  }

  private optionalBoolean(value: 'true' | 'false' | undefined): boolean | null {
    if (value === undefined) {
      return null;
    }
    return value === 'true';
  }

  private priorityBand(
    score: number,
    slaState: OperationsTriageSlaState,
    highRisk: boolean,
  ): OperationsTriageItem['priorityBand'] {
    if (slaState === 'breached' || (highRisk && slaState === 'overdue')) {
      return 'critical';
    }
    if (score >= 700) {
      return 'urgent';
    }
    if (score >= 450) {
      return 'high';
    }
    return 'normal';
  }
}
