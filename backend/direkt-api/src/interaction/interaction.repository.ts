import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PoolClient } from 'pg';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { DatabaseService } from '../platform/database/database.service';
import type { CreateEnquiryDto } from './interaction.dto';
import type {
  EnquiryEventView,
  EnquiryPreferredChannel,
  EnquiryStatus,
  EnquiryTiming,
  EnquiryView,
  ProviderEnquiryListView,
} from './interaction.types';

interface PublicationScopeRow {
  publication_id: string;
  provider_id: string;
  category_id: string;
  requirement_version_id: string;
}

interface EnquiryRow {
  enquiry_id: string;
  customer_identity_id: string;
  public_provider_id: string;
  provider_display_name: string;
  category_key: string;
  category_name: string;
  service_summary: string;
  timing: EnquiryTiming;
  requested_for: Date | null;
  locality_summary: string;
  preferred_channel: EnquiryPreferredChannel;
  status: EnquiryStatus;
  revision: number;
  created_at: Date;
  updated_at: Date;
  terminal_at: Date | null;
}

interface EnquiryEventRow {
  id: string;
  sequence: number;
  event_type: 'created' | 'status_changed';
  from_status: EnquiryStatus | null;
  to_status: EnquiryStatus;
  actor_kind: 'customer' | 'provider' | 'system';
  reason: string;
  policy_version: string;
  occurred_at: Date;
}

interface ProviderContextRow {
  provider_id: string;
}

@Injectable()
export class InteractionRepository {
  constructor(private readonly database: DatabaseService) {}

  createEnquiry(
    actor: AuthenticatedActor,
    dto: CreateEnquiryDto,
    keyHash: string,
    requestFingerprint: string,
    requestId?: string,
  ): Promise<EnquiryView> {
    return this.database.transaction(async (client) => {
      const existing = await client.query<{
        enquiry_id: string;
        request_fingerprint: string;
      }>(
        `SELECT id AS enquiry_id, request_fingerprint
         FROM interaction.enquiries
         WHERE customer_identity_id = $1 AND idempotency_key_hash = $2
         FOR UPDATE`,
        [actor.identityId, keyHash],
      );
      const replay = existing.rows[0];
      if (replay) {
        if (replay.request_fingerprint !== requestFingerprint) {
          throw new ConflictException(
            'The idempotency key already exists with a different enquiry payload.',
          );
        }
        return this.loadCustomer(client, replay.enquiry_id, actor.identityId);
      }

      this.assertTiming(dto);
      const publication = await this.resolvePublication(client, dto.publicProviderId);
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO interaction.enquiries (
           customer_identity_id,
           publication_id,
           provider_id,
           category_id,
           requirement_version_id,
           service_summary,
           timing,
           requested_for,
           locality_summary,
           preferred_channel,
           policy_version,
           idempotency_key_hash,
           request_fingerprint
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id`,
        [
          actor.identityId,
          publication.publication_id,
          publication.provider_id,
          publication.category_id,
          publication.requirement_version_id,
          dto.serviceSummary.trim(),
          dto.timing,
          dto.requestedFor ?? null,
          dto.localitySummary.trim(),
          dto.preferredChannel,
          dto.policyVersion.trim(),
          keyHash,
          requestFingerprint,
        ],
      );
      const enquiryId = inserted.rows[0]?.id;
      if (!enquiryId) {
        throw new Error('Enquiry creation returned no identifier.');
      }
      await this.audit(client, {
        actorIdentityId: actor.identityId,
        providerId: publication.provider_id,
        requestId,
        action: 'interaction_enquiry_created',
        resourceId: enquiryId,
        metadata: {
          publicationId: publication.publication_id,
          preferredChannel: dto.preferredChannel,
          timing: dto.timing,
          structuredBrief: true,
          contactDataIncluded: false,
          trustOrPublicationMutation: false,
        },
      });
      return this.loadCustomer(client, enquiryId, actor.identityId);
    });
  }

  listCustomer(actor: AuthenticatedActor): Promise<EnquiryView[]> {
    return this.database.transaction(async (client) => {
      const ids = await client.query<{ id: string }>(
        `SELECT id
         FROM interaction.enquiries
         WHERE customer_identity_id = $1
         ORDER BY updated_at DESC, id DESC
         LIMIT 100`,
        [actor.identityId],
      );
      return Promise.all(
        ids.rows.map((row) => this.loadCustomer(client, row.id, actor.identityId)),
      );
    });
  }

  detailCustomer(actor: AuthenticatedActor, enquiryId: string): Promise<EnquiryView> {
    return this.database.transaction((client) =>
      this.loadCustomer(client, enquiryId, actor.identityId),
    );
  }

  listProvider(actor: AuthenticatedActor): Promise<ProviderEnquiryListView> {
    return this.database.transaction(async (client) => {
      const providerId = await this.resolveProviderContext(client, actor.identityId);
      const ids = await client.query<{ id: string }>(
        `SELECT id
         FROM interaction.enquiries
         WHERE provider_id = $1
         ORDER BY
           CASE status
             WHEN 'received' THEN 1
             WHEN 'needs_information' THEN 2
             WHEN 'acknowledged' THEN 3
             WHEN 'accepted' THEN 4
             ELSE 5
           END,
           updated_at DESC,
           id DESC
         LIMIT 200`,
        [providerId],
      );
      return {
        providerScope: 'actor_resolved',
        items: await Promise.all(
          ids.rows.map((row) => this.loadProvider(client, row.id, providerId)),
        ),
      };
    });
  }

  detailProvider(actor: AuthenticatedActor, enquiryId: string): Promise<EnquiryView> {
    return this.database.transaction(async (client) => {
      const providerId = await this.resolveProviderContext(client, actor.identityId);
      return this.loadProvider(client, enquiryId, providerId);
    });
  }

  transitionProvider(
    actor: AuthenticatedActor,
    enquiryId: string,
    targetStatus: EnquiryStatus,
    expectedRevision: number,
    reason: string,
    policyVersion: string,
    requestId?: string,
  ): Promise<EnquiryView> {
    return this.database.transaction(async (client) => {
      const providerId = await this.resolveProviderContext(client, actor.identityId);
      await this.callTransition(
        client,
        enquiryId,
        actor.identityId,
        'provider',
        targetStatus,
        expectedRevision,
        reason,
        policyVersion,
      );
      await this.audit(client, {
        actorIdentityId: actor.identityId,
        providerId,
        requestId,
        action: 'interaction_enquiry_provider_transitioned',
        resourceId: enquiryId,
        metadata: {
          targetStatus,
          expectedRevision,
          reason: reason.trim(),
          policyVersion: policyVersion.trim(),
          trustOrPublicationMutation: false,
        },
      });
      return this.loadProvider(client, enquiryId, providerId);
    });
  }

  cancelCustomer(
    actor: AuthenticatedActor,
    enquiryId: string,
    expectedRevision: number,
    reason: string,
    policyVersion: string,
    requestId?: string,
  ): Promise<EnquiryView> {
    return this.database.transaction(async (client) => {
      const transitioned = await this.callTransition(
        client,
        enquiryId,
        actor.identityId,
        'customer',
        'cancelled',
        expectedRevision,
        reason,
        policyVersion,
      );
      await this.audit(client, {
        actorIdentityId: actor.identityId,
        providerId: transitioned.provider_id,
        requestId,
        action: 'interaction_enquiry_customer_cancelled',
        resourceId: enquiryId,
        metadata: {
          expectedRevision,
          reason: reason.trim(),
          policyVersion: policyVersion.trim(),
          trustOrPublicationMutation: false,
        },
      });
      return this.loadCustomer(client, enquiryId, actor.identityId);
    });
  }

  private async callTransition(
    client: PoolClient,
    enquiryId: string,
    actorIdentityId: string,
    actorScope: 'customer' | 'provider',
    targetStatus: EnquiryStatus,
    expectedRevision: number,
    reason: string,
    policyVersion: string,
  ): Promise<{ provider_id: string }> {
    try {
      const result = await client.query<{ provider_id: string }>(
        `SELECT (interaction.transition_enquiry($1, $2, $3, $4, $5, $6, $7)).provider_id`,
        [
          enquiryId,
          actorIdentityId,
          actorScope,
          targetStatus,
          expectedRevision,
          reason.trim(),
          policyVersion.trim(),
        ],
      );
      const row = result.rows[0];
      if (!row) {
        throw new Error('Enquiry transition returned no row.');
      }
      return row;
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('not found')) {
        throw new NotFoundException('The enquiry was not found in the authenticated scope.');
      }
      if (message.includes('revision conflict')) {
        throw new ConflictException('The enquiry changed. Refresh before retrying the action.');
      }
      if (message.includes('transition is not allowed') || message.includes('Unknown enquiry')) {
        throw new BadRequestException('The requested enquiry state transition is not allowed.');
      }
      throw error;
    }
  }

  private async resolvePublication(
    client: PoolClient,
    publicProviderId: string,
  ): Promise<PublicationScopeRow> {
    const result = await client.query<PublicationScopeRow>(
      `SELECT
         publications.id AS publication_id,
         publications.provider_id,
         publications.category_id,
         publications.requirement_version_id
       FROM discovery.publications AS publications
       JOIN provider.organizations AS organizations
         ON organizations.id = publications.provider_id
        AND organizations.status = 'ready_for_verification'
       JOIN provider.category_selections AS selections
         ON selections.provider_id = publications.provider_id
        AND selections.category_id = publications.category_id
        AND selections.requirement_version_id = publications.requirement_version_id
        AND selections.status = 'selected'
       WHERE publications.id = $1
         AND publications.status = 'published'
         AND discovery.required_claims_current(
           publications.provider_id,
           publications.category_id,
           publications.requirement_version_id,
           now()
         )`,
      [publicProviderId],
    );
    const publication = result.rows[0];
    if (!publication) {
      throw new NotFoundException('The public provider is not currently eligible for enquiries.');
    }
    return publication;
  }

  private async resolveProviderContext(client: PoolClient, identityId: string): Promise<string> {
    const result = await client.query<ProviderContextRow>(
      `SELECT DISTINCT assignments.provider_id
       FROM authz.role_assignments AS assignments
       JOIN authz.roles AS roles ON roles.id = assignments.role_id
       JOIN provider.organizations AS organizations ON organizations.id = assignments.provider_id
       WHERE assignments.identity_id = $1
         AND assignments.scope_type = 'provider'
         AND assignments.provider_id IS NOT NULL
         AND assignments.revoked_at IS NULL
         AND assignments.starts_at <= now()
         AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
         AND roles.role_key IN ('provider_owner', 'provider_member', 'provider_responder')
         AND organizations.status <> 'archived'
       ORDER BY assignments.provider_id
       LIMIT 2`,
      [identityId],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('The authenticated identity has no active provider workspace.');
    }
    if (result.rows.length > 1) {
      throw new ConflictException(
        'The authenticated identity has more than one active provider workspace.',
      );
    }
    return (result.rows[0] as ProviderContextRow).provider_id;
  }

  private loadCustomer(
    client: PoolClient,
    enquiryId: string,
    customerIdentityId: string,
  ): Promise<EnquiryView> {
    return this.load(client, enquiryId, 'enquiries.customer_identity_id = $2', customerIdentityId);
  }

  private loadProvider(
    client: PoolClient,
    enquiryId: string,
    providerId: string,
  ): Promise<EnquiryView> {
    return this.load(client, enquiryId, 'enquiries.provider_id = $2', providerId);
  }

  private async load(
    client: PoolClient,
    enquiryId: string,
    scopeSql: string,
    scopeValue: string,
  ): Promise<EnquiryView> {
    const result = await client.query<EnquiryRow>(
      `SELECT
         enquiries.id AS enquiry_id,
         enquiries.customer_identity_id,
         publications.id AS public_provider_id,
         profiles.display_name AS provider_display_name,
         categories.category_key,
         categories.name AS category_name,
         enquiries.service_summary,
         enquiries.timing,
         enquiries.requested_for,
         enquiries.locality_summary,
         enquiries.preferred_channel,
         enquiries.status,
         enquiries.revision,
         enquiries.created_at,
         enquiries.updated_at,
         enquiries.terminal_at
       FROM interaction.enquiries AS enquiries
       JOIN discovery.publications AS publications ON publications.id = enquiries.publication_id
       JOIN provider.profiles AS profiles ON profiles.provider_id = enquiries.provider_id
       JOIN catalog.service_categories AS categories ON categories.id = enquiries.category_id
       WHERE enquiries.id = $1 AND ${scopeSql}`,
      [enquiryId, scopeValue],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('The enquiry was not found in the authenticated scope.');
    }
    const events = await client.query<EnquiryEventRow>(
      `SELECT
         id,
         sequence,
         event_type,
         from_status,
         to_status,
         actor_kind,
         reason,
         policy_version,
         occurred_at
       FROM interaction.enquiry_events
       WHERE enquiry_id = $1
       ORDER BY sequence`,
      [enquiryId],
    );
    return this.toView(row, events.rows);
  }

  private toView(row: EnquiryRow, events: EnquiryEventRow[]): EnquiryView {
    return {
      enquiryId: row.enquiry_id,
      publicProviderId: row.public_provider_id,
      providerDisplayName: row.provider_display_name,
      categoryKey: row.category_key,
      categoryName: row.category_name,
      serviceSummary: row.service_summary,
      timing: row.timing,
      requestedFor: row.requested_for?.toISOString() ?? null,
      localitySummary: row.locality_summary,
      preferredChannel: row.preferred_channel,
      status: row.status,
      revision: row.revision,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      terminalAt: row.terminal_at?.toISOString() ?? null,
      events: events.map(
        (event): EnquiryEventView => ({
          eventId: event.id,
          sequence: event.sequence,
          eventType: event.event_type,
          fromStatus: event.from_status,
          toStatus: event.to_status,
          actorKind: event.actor_kind,
          reason: event.reason,
          policyVersion: event.policy_version,
          occurredAt: event.occurred_at.toISOString(),
          actorIdentityExposed: false,
        }),
      ),
      fullChatEnabled: false,
      privateContactIncluded: false,
      privateEvidenceIncluded: false,
      internalIdentifiersIncluded: false,
      synthetic: true,
    };
  }

  private assertTiming(dto: CreateEnquiryDto): void {
    if (dto.timing === 'scheduled') {
      if (!dto.requestedFor || new Date(dto.requestedFor).getTime() <= Date.now()) {
        throw new BadRequestException('Scheduled enquiries require a future requestedFor time.');
      }
    } else if (dto.requestedFor) {
      throw new BadRequestException('requestedFor is accepted only for scheduled enquiries.');
    }
  }

  private async audit(
    client: PoolClient,
    event: {
      actorIdentityId: string;
      providerId: string;
      requestId: string | undefined;
      action: string;
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
       ) VALUES ($1, 'identity', $2, $3, $4, 'interaction_enquiry', $5, 'success', $6::jsonb)`,
      [
        event.requestId ?? null,
        event.actorIdentityId,
        event.providerId,
        event.action,
        event.resourceId,
        JSON.stringify(event.metadata),
      ],
    );
  }
}
