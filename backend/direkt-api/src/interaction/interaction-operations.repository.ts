import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../platform/database/database.service';
import type {
  OperationsInteractionListView,
  OperationsInteractionView,
} from './interaction-operations.types';

interface OperationsInteractionRow {
  interaction_id: string;
  enquiry_id: string;
  public_provider_id: string;
  provider_display_name: string;
  category_key: string;
  category_name: string;
  status: OperationsInteractionView['status'];
  revision: number;
  started_at: Date;
  completed_at: Date | null;
  cancelled_at: Date | null;
  review_eligible_from: Date | null;
  review_eligible_until: Date | null;
  review_moderation_status: OperationsInteractionView['reviewModerationStatus'];
  event_count: string;
  handoff_count: string;
  complaint_count: string;
  last_event_type: string | null;
  last_event_at: Date | null;
}

@Injectable()
export class InteractionOperationsRepository {
  constructor(private readonly database: DatabaseService) {}

  async list(): Promise<OperationsInteractionListView> {
    const result = await this.database.query<OperationsInteractionRow>(
      `SELECT
         tracked.id AS interaction_id,
         tracked.enquiry_id,
         publications.id AS public_provider_id,
         profiles.display_name AS provider_display_name,
         categories.category_key,
         categories.name AS category_name,
         tracked.status,
         tracked.revision,
         tracked.started_at,
         tracked.completed_at,
         tracked.cancelled_at,
         tracked.review_eligible_from,
         tracked.review_eligible_until,
         reviews.moderation_status AS review_moderation_status,
         (SELECT count(*)::text
          FROM interaction.interaction_events AS events
          WHERE events.interaction_id = tracked.id) AS event_count,
         (SELECT count(*)::text
          FROM interaction.contact_handoffs AS handoffs
          WHERE handoffs.interaction_id = tracked.id) AS handoff_count,
         (SELECT count(*)::text
          FROM interaction.complaints AS complaints
          WHERE complaints.interaction_id = tracked.id) AS complaint_count,
         last_event.event_type AS last_event_type,
         last_event.occurred_at AS last_event_at
       FROM interaction.tracked_interactions AS tracked
       JOIN discovery.publications AS publications ON publications.id = tracked.publication_id
       JOIN provider.profiles AS profiles ON profiles.provider_id = tracked.provider_id
       JOIN catalog.service_categories AS categories ON categories.id = tracked.category_id
       LEFT JOIN interaction.reviews AS reviews ON reviews.interaction_id = tracked.id
       LEFT JOIN LATERAL (
         SELECT events.event_type, events.occurred_at
         FROM interaction.interaction_events AS events
         WHERE events.interaction_id = tracked.id
         ORDER BY events.sequence DESC
         LIMIT 1
       ) AS last_event ON true
       ORDER BY tracked.updated_at DESC, tracked.id DESC
       LIMIT 200`,
    );

    return {
      items: result.rows.map((row) => ({
        interactionId: row.interaction_id,
        enquiryId: row.enquiry_id,
        publicProviderId: row.public_provider_id,
        providerDisplayName: row.provider_display_name,
        categoryKey: row.category_key,
        categoryName: row.category_name,
        status: row.status,
        revision: row.revision,
        startedAt: row.started_at.toISOString(),
        completedAt: row.completed_at?.toISOString() ?? null,
        cancelledAt: row.cancelled_at?.toISOString() ?? null,
        reviewEligibleFrom: row.review_eligible_from?.toISOString() ?? null,
        reviewEligibleUntil: row.review_eligible_until?.toISOString() ?? null,
        reviewModerationStatus: row.review_moderation_status,
        eventCount: Number(row.event_count),
        handoffCount: Number(row.handoff_count),
        complaintCount: Number(row.complaint_count),
        lastEventType: row.last_event_type,
        lastEventAt: row.last_event_at?.toISOString() ?? null,
        customerIdentityExposed: false,
        contactIncluded: false,
        privateEvidenceIncluded: false,
        internalModerationRationaleIncluded: false,
        trustOrRankingMutation: false,
        synthetic: true,
      })),
      interactionScope: 'privacy_safe',
    };
  }
}
