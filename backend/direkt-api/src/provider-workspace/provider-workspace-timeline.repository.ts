import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../platform/database/database.service';
import type { ProviderWorkspaceTimelineEventView } from './provider-workspace.types';

interface TimelineRow {
  event_id: string;
  case_id: string;
  category_key: string;
  category_name: string;
  requirement_key: string;
  requirement_label: string;
  check_key: string;
  event_type: ProviderWorkspaceTimelineEventView['eventType'];
  case_status: ProviderWorkspaceTimelineEventView['caseStatus'];
  evidence_status: ProviderWorkspaceTimelineEventView['evidenceStatus'];
  evidence_class: ProviderWorkspaceTimelineEventView['evidenceClass'];
  reason_code: string | null;
  decision_result: string | null;
  claim_status: string | null;
  limitation: string | null;
  valid_until: Date | null;
  occurred_at: Date;
}

@Injectable()
export class ProviderWorkspaceTimelineRepository {
  constructor(private readonly database: DatabaseService) {}

  async timeline(providerId: string): Promise<ProviderWorkspaceTimelineEventView[]> {
    const result = await this.database.query<TimelineRow>(
      `WITH provider_cases AS (
         SELECT
           cases.id,
           cases.provider_id,
           cases.category_id,
           cases.requirement_id,
           cases.check_key,
           cases.status,
           cases.created_at
         FROM verification.cases AS cases
         WHERE cases.provider_id = $1
       ),
       timeline AS (
         SELECT
           'case:' || cases.id::text AS event_id,
           cases.id AS case_id,
           'case_created'::text AS event_type,
           cases.status AS case_status,
           NULL::text AS evidence_status,
           NULL::text AS evidence_class,
           NULL::text AS reason_code,
           NULL::text AS decision_result,
           NULL::text AS claim_status,
           NULL::text AS limitation,
           NULL::timestamptz AS valid_until,
           cases.created_at AS occurred_at
         FROM provider_cases AS cases

         UNION ALL

         SELECT
           'evidence:' || items.id::text AS event_id,
           links.case_id,
           CASE
             WHEN items.status = 'ready_for_review' THEN 'evidence_submitted'
             ELSE 'evidence_status'
           END AS event_type,
           cases.status AS case_status,
           items.status AS evidence_status,
           items.evidence_class,
           NULL::text AS reason_code,
           NULL::text AS decision_result,
           NULL::text AS claim_status,
           NULL::text AS limitation,
           items.expires_at AS valid_until,
           items.created_at AS occurred_at
         FROM provider_cases AS cases
         JOIN verification.case_evidence AS links ON links.case_id = cases.id
         JOIN evidence.items AS items ON items.id = links.evidence_id

         UNION ALL

         SELECT
           'decision:' || decisions.id::text AS event_id,
           decisions.case_id,
           'decision'::text AS event_type,
           cases.status AS case_status,
           NULL::text AS evidence_status,
           NULL::text AS evidence_class,
           decisions.reason_code,
           decisions.result AS decision_result,
           NULL::text AS claim_status,
           decisions.limitation,
           decisions.valid_until,
           decisions.created_at AS occurred_at
         FROM provider_cases AS cases
         JOIN verification.decisions AS decisions ON decisions.case_id = cases.id

         UNION ALL

         SELECT
           'claim:' || claims.id::text AS event_id,
           claims.case_id,
           'claim_status'::text AS event_type,
           cases.status AS case_status,
           NULL::text AS evidence_status,
           claims.evidence_class,
           NULL::text AS reason_code,
           NULL::text AS decision_result,
           claims.status AS claim_status,
           claims.limitation,
           claims.valid_until,
           claims.created_at AS occurred_at
         FROM provider_cases AS cases
         JOIN verification.claims AS claims ON claims.case_id = cases.id
       )
       SELECT
         timeline.event_id,
         timeline.case_id,
         categories.category_key,
         categories.name AS category_name,
         requirements.requirement_key,
         requirements.label AS requirement_label,
         cases.check_key,
         timeline.event_type,
         timeline.case_status,
         timeline.evidence_status,
         timeline.evidence_class,
         timeline.reason_code,
         timeline.decision_result,
         timeline.claim_status,
         timeline.limitation,
         timeline.valid_until,
         timeline.occurred_at
       FROM timeline
       JOIN provider_cases AS cases ON cases.id = timeline.case_id
       JOIN catalog.service_categories AS categories ON categories.id = cases.category_id
       JOIN catalog.requirements AS requirements ON requirements.id = cases.requirement_id
       ORDER BY timeline.occurred_at DESC, timeline.event_id DESC`,
      [providerId],
    );

    return result.rows.map((row) => ({
      eventId: row.event_id,
      caseId: row.case_id,
      categoryKey: row.category_key,
      categoryName: row.category_name,
      requirementKey: row.requirement_key,
      requirementLabel: row.requirement_label,
      checkKey: row.check_key,
      eventType: row.event_type,
      caseStatus: row.case_status,
      evidenceStatus: row.evidence_status,
      evidenceClass: row.evidence_class,
      reasonCode: row.reason_code,
      message: this.safeMessage(row),
      limitation: row.limitation,
      validUntil: row.valid_until?.toISOString() ?? null,
      occurredAt: row.occurred_at.toISOString(),
      reviewerIdentityExposed: false,
      privateRationaleExposed: false,
      privateObjectKeyExposed: false,
      synthetic: true,
    }));
  }

  private safeMessage(row: TimelineRow): string {
    if (row.event_type === 'case_created') {
      return 'Verification check created.';
    }
    if (row.event_type === 'evidence_submitted') {
      return 'Evidence submitted for private review.';
    }
    if (row.event_type === 'evidence_status') {
      const messages: Record<string, string> = {
        correction_required: 'Evidence correction required.',
        expired: 'Evidence expired and requires renewal.',
        revoked: 'Evidence was withdrawn from verification use.',
        accepted: 'Evidence accepted for the scoped verification check.',
      };
      return messages[row.evidence_status ?? ''] ?? 'Evidence status updated.';
    }
    if (row.event_type === 'decision') {
      const messages: Record<string, string> = {
        approved: 'Scoped verification check approved.',
        rejected: 'Scoped verification check rejected.',
        correction_required: 'Correction required before verification can continue.',
        revoked: 'Scoped verification decision revoked.',
      };
      return messages[row.decision_result ?? ''] ?? 'Verification decision recorded.';
    }
    const messages: Record<string, string> = {
      active: 'Scoped claim is current.',
      degraded: 'Scoped claim requires attention.',
      revoked: 'Scoped claim was revoked.',
      expired: 'Scoped claim expired and requires renewal.',
      superseded: 'Scoped claim was superseded by a newer decision.',
    };
    return messages[row.claim_status ?? ''] ?? 'Scoped claim status updated.';
  }
}
