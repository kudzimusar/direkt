import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { PoolClient } from 'pg';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { DatabaseService } from '../platform/database/database.service';
import type { CreateContactHandoffDto } from './interaction-handoff.dto';
import type {
  ContactHandoffChannel,
  ContactHandoffView,
  ProviderInteractionListView,
  ReviewEligibilityView,
  TrackedInteractionEventView,
  TrackedInteractionStatus,
  TrackedInteractionView,
} from './interaction-handoff.types';

interface HandoffRow {
  handoff_id: string;
  interaction_id: string;
  enquiry_id: string;
  channel: ContactHandoffChannel;
  contact_display_hint: string;
  stored_status: 'active' | 'revoked';
  consented_at: Date;
  expires_at: Date;
  revoked_at: Date | null;
  policy_version: string;
}

interface InteractionRow {
  interaction_id: string;
  enquiry_id: string;
  public_provider_id: string;
  provider_display_name: string;
  category_key: string;
  category_name: string;
  status: TrackedInteractionStatus;
  revision: number;
  started_at: Date;
  completed_at: Date | null;
  cancelled_at: Date | null;
  review_eligible_from: Date | null;
  review_eligible_until: Date | null;
  review_exists: boolean;
}

interface EventRow {
  id: string;
  sequence: number;
  event_type: TrackedInteractionEventView['eventType'];
  actor_kind: TrackedInteractionEventView['actorKind'];
  reason: string;
  policy_version: string;
  occurred_at: Date;
}

@Injectable()
export class InteractionHandoffRepository {
  constructor(private readonly database: DatabaseService) {}

  createHandoff(
    actor: AuthenticatedActor,
    enquiryId: string,
    dto: CreateContactHandoffDto,
    keyHash: string,
    fingerprint: string,
    requestId?: string,
  ): Promise<ContactHandoffView> {
    return this.database
      .transaction(async (client) => {
        await client.query(`SELECT pg_advisory_xact_lock(hashtextextended($1 || ':' || $2, 0))`, [
          actor.identityId,
          keyHash,
        ]);
        const replay = await client.query<{
          handoff_id: string;
          request_fingerprint: string;
        }>(
          `SELECT handoffs.id AS handoff_id, consents.request_fingerprint
         FROM interaction.contact_consents AS consents
         JOIN interaction.contact_handoffs AS handoffs ON handoffs.consent_id = consents.id
         WHERE consents.customer_identity_id = $1 AND consents.idempotency_key_hash = $2
         FOR UPDATE OF consents, handoffs`,
          [actor.identityId, keyHash],
        );
        const existing = replay.rows[0];
        if (existing) {
          if (existing.request_fingerprint !== fingerprint) {
            throw new ConflictException(
              'The idempotency key already exists with a different handoff request.',
            );
          }
          return this.loadHandoff(client, existing.handoff_id, 'customer', actor.identityId);
        }

        const scope = await client.query<{
          interaction_id: string;
          customer_identity_id: string;
          provider_id: string;
          contact_display_hint: string;
        }>(
          `SELECT tracked.id AS interaction_id,
                enquiries.customer_identity_id,
                enquiries.provider_id,
                contacts.display_hint AS contact_display_hint
         FROM interaction.enquiries AS enquiries
         JOIN interaction.tracked_interactions AS tracked ON tracked.enquiry_id = enquiries.id
         JOIN account.contacts AS contacts ON contacts.id = $3
         WHERE enquiries.id = $1
           AND enquiries.customer_identity_id = $2
           AND enquiries.status = 'accepted'
           AND tracked.status = 'active'
           AND contacts.identity_id = enquiries.customer_identity_id
           AND contacts.channel = 'phone'
           AND contacts.verified_at IS NOT NULL
         FOR UPDATE OF enquiries, tracked, contacts`,
          [enquiryId, actor.identityId, dto.contactId],
        );
        const row = scope.rows[0];
        if (!row) {
          throw new NotFoundException(
            'An accepted owned enquiry with an active interaction and verified phone contact was not found.',
          );
        }

        const consent = await client.query<{ id: string; expires_at: Date }>(
          `INSERT INTO interaction.contact_consents (
           interaction_id, enquiry_id, customer_identity_id, provider_id,
           contact_id, channel, contact_display_hint, policy_version,
           idempotency_key_hash, request_fingerprint, expires_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now() + interval '24 hours')
         RETURNING id, expires_at`,
          [
            row.interaction_id,
            enquiryId,
            actor.identityId,
            row.provider_id,
            dto.contactId,
            dto.channel,
            row.contact_display_hint,
            dto.policyVersion.trim(),
            keyHash,
            fingerprint,
          ],
        );
        const consentRow = consent.rows[0];
        if (!consentRow) throw new Error('Contact consent creation returned no identifier.');

        const handoff = await client.query<{ id: string }>(
          `INSERT INTO interaction.contact_handoffs (
           consent_id, interaction_id, enquiry_id, customer_identity_id,
           provider_id, channel, contact_display_hint, expires_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
          [
            consentRow.id,
            row.interaction_id,
            enquiryId,
            actor.identityId,
            row.provider_id,
            dto.channel,
            row.contact_display_hint,
            consentRow.expires_at,
          ],
        );
        const handoffId = handoff.rows[0]?.id;
        if (!handoffId) throw new Error('Contact handoff creation returned no identifier.');

        await client.query(
          `SELECT interaction.append_interaction_event(
           $1, 'handoff_created', 'customer', $2,
           'Customer granted a time-limited channel-specific contact handoff.',
           $3, jsonb_build_object('channel', $4, 'rawContactIncluded', false, 'externalDeliveryAttempted', false)
         )`,
          [row.interaction_id, actor.identityId, dto.policyVersion.trim(), dto.channel],
        );
        await this.audit(
          client,
          actor,
          row.provider_id,
          requestId,
          'interaction_contact_handoff_created',
          handoffId,
          {
            interactionId: row.interaction_id,
            channel: dto.channel,
            rawContactIncluded: false,
            externalDeliveryAttempted: false,
            trustOrPublicationMutation: false,
          },
        );
        return this.loadHandoff(client, handoffId, 'customer', actor.identityId);
      })
      .catch((error: unknown) => {
        const code = (error as { code?: string }).code;
        if (code === '23P01') {
          throw new ConflictException(
            'A current contact handoff already exists for this interaction and channel.',
          );
        }
        throw error;
      });
  }

  listCustomerHandoffs(
    actor: AuthenticatedActor,
    enquiryId: string,
  ): Promise<ContactHandoffView[]> {
    return this.database.transaction(async (client) => {
      const rows = await client.query<{ id: string }>(
        `SELECT id FROM interaction.contact_handoffs
         WHERE enquiry_id = $1 AND customer_identity_id = $2
         ORDER BY created_at DESC`,
        [enquiryId, actor.identityId],
      );
      return Promise.all(
        rows.rows.map((row) => this.loadHandoff(client, row.id, 'customer', actor.identityId)),
      );
    });
  }

  providerHandoff(actor: AuthenticatedActor, enquiryId: string): Promise<ContactHandoffView> {
    return this.database.transaction(async (client) => {
      const providerId = await this.providerContext(client, actor.identityId);
      const row = await client.query<{ id: string }>(
        `SELECT id FROM interaction.contact_handoffs
         WHERE enquiry_id = $1 AND provider_id = $2
           AND status = 'active' AND expires_at > now()
         ORDER BY created_at DESC LIMIT 1`,
        [enquiryId, providerId],
      );
      const id = row.rows[0]?.id;
      if (!id) throw new NotFoundException('No current consent-scoped handoff was found.');
      return this.loadHandoff(client, id, 'provider', providerId);
    });
  }

  revokeHandoff(
    actor: AuthenticatedActor,
    enquiryId: string,
    handoffId: string,
    reason: string,
    policyVersion: string,
    requestId?: string,
  ): Promise<ContactHandoffView> {
    return this.database.transaction(async (client) => {
      const scope = await client.query<{ provider_id: string }>(
        `SELECT provider_id FROM interaction.contact_handoffs
         WHERE id = $1 AND enquiry_id = $2 AND customer_identity_id = $3`,
        [handoffId, enquiryId, actor.identityId],
      );
      const providerId = scope.rows[0]?.provider_id;
      if (!providerId) throw new NotFoundException('Contact handoff was not found.');
      await client.query(`SELECT (interaction.revoke_contact_handoff($1, $2, $3, $4)).id`, [
        handoffId,
        actor.identityId,
        reason.trim(),
        policyVersion.trim(),
      ]);
      await this.audit(
        client,
        actor,
        providerId,
        requestId,
        'interaction_contact_handoff_revoked',
        handoffId,
        {
          enquiryId,
          rawContactIncluded: false,
        },
      );
      return this.loadHandoff(client, handoffId, 'customer', actor.identityId);
    });
  }

  listCustomerInteractions(actor: AuthenticatedActor): Promise<TrackedInteractionView[]> {
    return this.database.transaction(async (client) => {
      const rows = await client.query<{ id: string }>(
        `SELECT id FROM interaction.tracked_interactions
         WHERE customer_identity_id = $1 ORDER BY updated_at DESC, id DESC`,
        [actor.identityId],
      );
      return Promise.all(
        rows.rows.map((row) => this.loadInteraction(client, row.id, 'customer', actor.identityId)),
      );
    });
  }

  customerInteraction(
    actor: AuthenticatedActor,
    interactionId: string,
  ): Promise<TrackedInteractionView> {
    return this.database.transaction((client) =>
      this.loadInteraction(client, interactionId, 'customer', actor.identityId),
    );
  }

  providerInteractions(actor: AuthenticatedActor): Promise<ProviderInteractionListView> {
    return this.database.transaction(async (client) => {
      const providerId = await this.providerContext(client, actor.identityId);
      const rows = await client.query<{ id: string }>(
        `SELECT id FROM interaction.tracked_interactions
         WHERE provider_id = $1 ORDER BY updated_at DESC, id DESC`,
        [providerId],
      );
      return {
        providerScope: 'actor_resolved',
        items: await Promise.all(
          rows.rows.map((row) => this.loadInteraction(client, row.id, 'provider', providerId)),
        ),
      };
    });
  }

  reviewEligibility(
    actor: AuthenticatedActor,
    interactionId: string,
  ): Promise<ReviewEligibilityView> {
    return this.database.transaction(async (client) => {
      const view = await this.loadInteraction(client, interactionId, 'customer', actor.identityId);
      return view.reviewEligibility;
    });
  }

  private async loadHandoff(
    client: PoolClient,
    handoffId: string,
    scope: 'customer' | 'provider',
    scopeId: string,
  ): Promise<ContactHandoffView> {
    const result = await client.query<HandoffRow>(
      `SELECT handoffs.id AS handoff_id,
              handoffs.interaction_id,
              handoffs.enquiry_id,
              handoffs.channel,
              handoffs.contact_display_hint,
              handoffs.status AS stored_status,
              consents.consented_at,
              handoffs.expires_at,
              handoffs.revoked_at,
              consents.policy_version
       FROM interaction.contact_handoffs AS handoffs
       JOIN interaction.contact_consents AS consents ON consents.id = handoffs.consent_id
       WHERE handoffs.id = $1
         AND ${scope === 'customer' ? 'handoffs.customer_identity_id' : 'handoffs.provider_id'} = $2`,
      [handoffId, scopeId],
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('Contact handoff was not found in the authenticated scope.');
    const status =
      row.stored_status === 'revoked'
        ? 'revoked'
        : row.expires_at <= new Date()
          ? 'expired'
          : 'active';
    return {
      handoffId: row.handoff_id,
      interactionId: row.interaction_id,
      enquiryId: row.enquiry_id,
      channel: row.channel,
      contactDisplayHint: row.contact_display_hint,
      status,
      consentedAt: row.consented_at.toISOString(),
      expiresAt: row.expires_at.toISOString(),
      revokedAt: row.revoked_at?.toISOString() ?? null,
      policyVersion: row.policy_version,
      deliveryState: 'disabled',
      externalDeliveryAttempted: false,
      rawContactIncluded: false,
      synthetic: true,
    };
  }

  private async loadInteraction(
    client: PoolClient,
    interactionId: string,
    scope: 'customer' | 'provider',
    scopeId: string,
  ): Promise<TrackedInteractionView> {
    const result = await client.query<InteractionRow>(
      `SELECT tracked.id AS interaction_id,
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
              EXISTS (SELECT 1 FROM interaction.reviews WHERE interaction_id = tracked.id) AS review_exists
       FROM interaction.tracked_interactions AS tracked
       JOIN discovery.publications AS publications ON publications.id = tracked.publication_id
       JOIN provider.profiles AS profiles ON profiles.provider_id = tracked.provider_id
       JOIN catalog.service_categories AS categories ON categories.id = tracked.category_id
       WHERE tracked.id = $1
         AND ${scope === 'customer' ? 'tracked.customer_identity_id' : 'tracked.provider_id'} = $2`,
      [interactionId, scopeId],
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('Tracked interaction was not found in the authenticated scope.');
    const [events, handoffs] = await Promise.all([
      client.query<EventRow>(
        `SELECT id, sequence, event_type, actor_kind, reason, policy_version, occurred_at
         FROM interaction.interaction_events WHERE interaction_id = $1 ORDER BY sequence`,
        [interactionId],
      ),
      client.query<{ id: string }>(
        `SELECT id FROM interaction.contact_handoffs
         WHERE interaction_id = $1 ORDER BY created_at`,
        [interactionId],
      ),
    ]);
    return {
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
      reviewEligibility: this.eligibility(row),
      handoffs: await Promise.all(
        handoffs.rows.map((handoff) => this.loadHandoff(client, handoff.id, scope, scopeId)),
      ),
      events: events.rows.map((event): TrackedInteractionEventView => ({
        eventId: event.id,
        sequence: event.sequence,
        eventType: event.event_type,
        actorKind: event.actor_kind,
        reason: event.reason,
        policyVersion: event.policy_version,
        occurredAt: event.occurred_at.toISOString(),
        actorIdentityExposed: false,
        privateMetadataIncluded: false,
      })),
      customerContactIncluded: false,
      privateEvidenceIncluded: false,
      internalModerationIncluded: false,
      synthetic: true,
    };
  }

  private eligibility(row: InteractionRow): ReviewEligibilityView {
    if (row.review_exists) {
      return {
        eligible: false,
        reasonCode: 'ALREADY_REVIEWED',
        eligibleFrom: row.review_eligible_from?.toISOString() ?? null,
        eligibleUntil: row.review_eligible_until?.toISOString() ?? null,
      };
    }
    if (row.status === 'active') {
      return {
        eligible: false,
        reasonCode: 'INTERACTION_ACTIVE',
        eligibleFrom: null,
        eligibleUntil: null,
      };
    }
    if (row.status === 'cancelled') {
      return {
        eligible: false,
        reasonCode: 'INTERACTION_CANCELLED',
        eligibleFrom: null,
        eligibleUntil: null,
      };
    }
    const now = Date.now();
    const from = row.review_eligible_from?.getTime() ?? Number.POSITIVE_INFINITY;
    const until = row.review_eligible_until?.getTime() ?? Number.NEGATIVE_INFINITY;
    return {
      eligible: now >= from && now < until,
      reasonCode: now < from ? 'WINDOW_NOT_OPEN' : now >= until ? 'WINDOW_EXPIRED' : 'ELIGIBLE',
      eligibleFrom: row.review_eligible_from?.toISOString() ?? null,
      eligibleUntil: row.review_eligible_until?.toISOString() ?? null,
    };
  }

  private async providerContext(client: PoolClient, identityId: string): Promise<string> {
    const result = await client.query<{ provider_id: string }>(
      `SELECT DISTINCT assignments.provider_id
       FROM authz.role_assignments AS assignments
       JOIN authz.roles AS roles ON roles.id = assignments.role_id
       WHERE assignments.identity_id = $1
         AND assignments.scope_type = 'provider'
         AND assignments.provider_id IS NOT NULL
         AND assignments.revoked_at IS NULL
         AND assignments.starts_at <= now()
         AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
         AND roles.role_key IN ('provider_owner', 'provider_member', 'provider_responder')
       ORDER BY assignments.provider_id LIMIT 2`,
      [identityId],
    );
    if (result.rows.length === 0)
      throw new NotFoundException('No active provider workspace was found.');
    if (result.rows.length > 1)
      throw new ConflictException('A server-owned provider workspace context is required.');
    return (result.rows[0] as { provider_id: string }).provider_id;
  }

  private async audit(
    client: PoolClient,
    actor: AuthenticatedActor,
    providerId: string,
    requestId: string | undefined,
    action: string,
    resourceId: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    await client.query(
      `INSERT INTO platform.audit_events (
         request_id, actor_type, actor_id, provider_id, action,
         resource_type, resource_id, outcome, metadata
       ) VALUES ($1, 'identity', $2, $3, $4, 'tracked_interaction', $5, 'success', $6::jsonb)`,
      [
        requestId ?? null,
        actor.identityId,
        providerId,
        action,
        resourceId,
        JSON.stringify(metadata),
      ],
    );
  }
}
