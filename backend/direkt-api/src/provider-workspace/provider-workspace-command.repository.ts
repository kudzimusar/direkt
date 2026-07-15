import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { PoolClient } from 'pg';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { DatabaseService } from '../platform/database/database.service';
import type {
  RemoveWorkspaceServiceDto,
  UpdateWorkspaceAvailabilityDto,
  UpdateWorkspaceLocationDto,
} from './provider-workspace.dto';
import type { ProviderWorkspaceRole } from './provider-workspace.types';

export interface ProviderWorkspaceContext {
  providerId: string;
  representativeRole: ProviderWorkspaceRole;
}

interface ContextRow {
  provider_id: string;
  role_key: ProviderWorkspaceRole;
}

@Injectable()
export class ProviderWorkspaceCommandRepository {
  constructor(private readonly database: DatabaseService) {}

  context(identityId: string): Promise<ProviderWorkspaceContext> {
    return this.database.transaction((client) => this.resolveContext(client, identityId));
  }

  removeService(
    actor: AuthenticatedActor,
    categoryKey: string,
    input: RemoveWorkspaceServiceDto,
  ): Promise<void> {
    return this.database.transaction(async (client) => {
      const context = await this.resolveContext(client, actor.identityId);
      const result = await client.query<{ category_id: string }>(
        `UPDATE provider.category_selections AS selections
         SET status = 'removed'
         FROM catalog.service_categories AS categories
         WHERE selections.provider_id = $1
           AND selections.category_id = categories.id
           AND categories.category_key = $2
           AND selections.status = 'selected'
         RETURNING selections.category_id`,
        [context.providerId, categoryKey],
      );
      if (!result.rows[0]) {
        throw new NotFoundException('The selected provider service was not found.');
      }

      await this.audit(client, {
        actorId: actor.identityId,
        providerId: context.providerId,
        action: 'provider_workspace_service_removed',
        resourceType: 'provider_category_selection',
        resourceId: result.rows[0].category_id,
        metadata: { categoryKey, reason: input.reason },
      });
    });
  }

  updateLocation(actor: AuthenticatedActor, input: UpdateWorkspaceLocationDto): Promise<void> {
    return this.database.transaction(async (client) => {
      const context = await this.resolveContext(client, actor.identityId);
      await client.query(
        `INSERT INTO discovery.provider_locations (
           provider_id,
           private_base,
           public_premises,
           public_premises_consent,
           public_locality,
           service_area,
           source,
           confidence,
           confirmed_at
         ) VALUES (
           $1,
           CASE
             WHEN $2::double precision IS NULL THEN NULL
             ELSE ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography
           END,
           CASE
             WHEN $4::boolean = false THEN NULL
             ELSE ST_SetSRID(ST_MakePoint($6, $5), 4326)::geography
           END,
           $4,
           $7,
           ST_GeogFromText($8),
           'provider_declared',
           'medium',
           now()
         )
         ON CONFLICT (provider_id) DO UPDATE
         SET private_base = CASE
               WHEN $2::double precision IS NULL THEN discovery.provider_locations.private_base
               ELSE EXCLUDED.private_base
             END,
             public_premises = EXCLUDED.public_premises,
             public_premises_consent = EXCLUDED.public_premises_consent,
             public_locality = EXCLUDED.public_locality,
             service_area = EXCLUDED.service_area,
             source = EXCLUDED.source,
             confidence = EXCLUDED.confidence,
             confirmed_at = EXCLUDED.confirmed_at,
             updated_at = now()`,
        [
          context.providerId,
          input.privateBaseLatitude ?? null,
          input.privateBaseLongitude ?? null,
          input.publicPremisesConsent,
          input.publicPremisesLatitude ?? null,
          input.publicPremisesLongitude ?? null,
          input.publicLocality.trim(),
          input.serviceAreaWkt.trim(),
        ],
      );

      await this.audit(client, {
        actorId: actor.identityId,
        providerId: context.providerId,
        action: 'provider_workspace_location_updated',
        resourceType: 'provider_location',
        resourceId: context.providerId,
        metadata: {
          privateBaseStored: input.privateBaseLatitude !== undefined,
          publicPremisesConfigured: input.publicPremisesConsent,
          publicPremisesConsent: input.publicPremisesConsent,
          serviceAreaConfigured: true,
          coordinatesExcludedFromAudit: true,
        },
      });
    });
  }

  updateAvailability(
    actor: AuthenticatedActor,
    categoryKey: string,
    input: UpdateWorkspaceAvailabilityDto,
  ): Promise<void> {
    return this.database.transaction(async (client) => {
      const context = await this.resolveContext(client, actor.identityId);
      const category = await client.query<{ category_id: string }>(
        `SELECT selections.category_id
         FROM provider.category_selections AS selections
         JOIN catalog.service_categories AS categories ON categories.id = selections.category_id
         WHERE selections.provider_id = $1
           AND categories.category_key = $2
           AND selections.status = 'selected'`,
        [context.providerId, categoryKey],
      );
      const categoryId = category.rows[0]?.category_id;
      if (!categoryId) {
        throw new NotFoundException('Availability requires a currently selected provider service.');
      }

      await client.query(
        `INSERT INTO discovery.provider_availability (
           provider_id,
           category_id,
           state,
           next_available_at,
           updated_at
         ) VALUES ($1, $2, $3, $4, now())
         ON CONFLICT (provider_id, category_id) DO UPDATE
         SET state = EXCLUDED.state,
             next_available_at = EXCLUDED.next_available_at,
             updated_at = now()`,
        [context.providerId, categoryId, input.state, input.nextAvailableAt ?? null],
      );

      await this.audit(client, {
        actorId: actor.identityId,
        providerId: context.providerId,
        action: 'provider_workspace_availability_updated',
        resourceType: 'provider_availability',
        resourceId: categoryId,
        metadata: {
          categoryKey,
          state: input.state,
          nextAvailableAt: input.nextAvailableAt ?? null,
          trustOrPublicationMutation: false,
        },
      });
    });
  }

  private async resolveContext(
    client: PoolClient,
    identityId: string,
  ): Promise<ProviderWorkspaceContext> {
    const result = await client.query<ContextRow>(
      `SELECT DISTINCT ON (assignments.provider_id)
         assignments.provider_id,
         roles.role_key
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
       ORDER BY
         assignments.provider_id,
         CASE roles.role_key
           WHEN 'provider_owner' THEN 1
           WHEN 'provider_member' THEN 2
           ELSE 3
         END,
         assignments.created_at
       LIMIT 2`,
      [identityId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('The authenticated identity has no active provider workspace.');
    }
    if (result.rows.length > 1) {
      throw new ConflictException(
        'The authenticated identity has more than one active provider workspace. A server-owned workspace context is required.',
      );
    }
    const row = result.rows[0] as ContextRow;
    return { providerId: row.provider_id, representativeRole: row.role_key };
  }

  private async audit(
    client: PoolClient,
    event: {
      actorId: string;
      providerId: string;
      action: string;
      resourceType: string;
      resourceId: string;
      metadata: Record<string, unknown>;
    },
  ): Promise<void> {
    await client.query(
      `INSERT INTO platform.audit_events (
         actor_type,
         actor_id,
         provider_id,
         action,
         resource_type,
         resource_id,
         outcome,
         metadata
       ) VALUES ('identity', $1, $2, $3, $4, $5, 'success', $6::jsonb)`,
      [
        event.actorId,
        event.providerId,
        event.action,
        event.resourceType,
        event.resourceId,
        JSON.stringify(event.metadata),
      ],
    );
  }
}
