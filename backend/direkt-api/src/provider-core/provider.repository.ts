import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { DatabaseService } from '../platform/database/database.service';
import type {
  AddRepresentativeDto,
  CreateProviderDto,
  UpdateProviderProfileDto,
} from './provider.dto';
import type {
  CategoryView,
  CustomerProfileView,
  ProviderCategorySelectionView,
  ProviderOperationsSummary,
  ProviderStatus,
  ProviderView,
} from './provider.types';

interface CustomerProfileRow {
  identity_id: string;
  display_name: string;
  profile_status: 'active' | 'suspended' | 'closed';
}

interface ProviderRow {
  id: string;
  pathway: ProviderView['pathway'];
  status: ProviderView['status'];
  discoverable: false;
  display_name: string;
  operating_model: ProviderView['operatingModel'];
  locality_summary: string | null;
  service_area_summary: string;
  registered_business_name: string | null;
  qualification_summary: string | null;
  experience_summary: string | null;
  revision: number;
}

interface CategorySelectionRow {
  category_key: string;
  category_name: string;
  version: number;
  status: 'selected' | 'removed';
}

interface CategoryRequirementRow {
  category_key: string;
  category_name: string;
  description: string;
  version: number;
  requirement_key: string;
  label: string;
  requirement_kind: string;
  required: boolean;
  guidance: string;
}

@Injectable()
export class ProviderRepository {
  constructor(private readonly database: DatabaseService) {}

  upsertCustomerProfile(
    actor: AuthenticatedActor,
    displayName: string,
    requestId?: string,
  ): Promise<CustomerProfileView> {
    return this.database.transaction(async (client) => {
      const result = await client.query<CustomerProfileRow>(
        `INSERT INTO account.customer_profiles (identity_id, display_name)
         VALUES ($1, $2)
         ON CONFLICT (identity_id) DO UPDATE
           SET display_name = EXCLUDED.display_name,
               updated_at = now()
         RETURNING identity_id, display_name, profile_status`,
        [actor.identityId, displayName],
      );
      const row = result.rows[0];
      if (!row) {
        throw new Error('Customer profile upsert returned no row.');
      }
      await this.insertAudit(client, {
        actor,
        requestId,
        action: 'customer_profile_upserted',
        resourceType: 'customer_profile',
        resourceId: actor.identityId,
      });
      return {
        identityId: row.identity_id,
        displayName: row.display_name,
        profileStatus: row.profile_status,
        synthetic: true,
      };
    });
  }

  createProvider(
    actor: AuthenticatedActor,
    input: CreateProviderDto,
    requestId?: string,
  ): Promise<ProviderView> {
    return this.database.transaction(async (client) => {
      const organizationResult = await client.query<{ id: string }>(
        `INSERT INTO provider.organizations (pathway, created_by_identity_id)
         VALUES ($1, $2)
         RETURNING id`,
        [input.pathway, actor.identityId],
      );
      const organization = organizationResult.rows[0];
      if (!organization) {
        throw new Error('Provider organization creation returned no row.');
      }

      await client.query(
        `INSERT INTO provider.profiles (
           provider_id,
           display_name,
           operating_model,
           locality_summary,
           service_area_summary,
           registered_business_name,
           qualification_summary,
           experience_summary
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          organization.id,
          input.displayName,
          input.operatingModel,
          input.localitySummary ?? null,
          input.serviceAreaSummary,
          input.registeredBusinessName ?? null,
          input.qualificationSummary ?? null,
          input.experienceSummary ?? null,
        ],
      );

      await client.query(
        `INSERT INTO authz.role_assignments (
           identity_id,
           role_id,
           scope_type,
           provider_id,
           assigned_by_identity_id,
           reason
         )
         SELECT $1, id, 'provider', $2, $1, 'Provider draft creator assigned as owner'
         FROM authz.roles
         WHERE role_key = 'provider_owner'`,
        [actor.identityId, organization.id],
      );

      await this.insertAudit(client, {
        actor,
        requestId,
        providerId: organization.id,
        action: 'provider_draft_created',
        resourceType: 'provider_organization',
        resourceId: organization.id,
        metadata: { pathway: input.pathway, discoverable: false },
      });

      return this.loadProvider(client, organization.id);
    });
  }

  findProvider(providerId: string): Promise<ProviderView | null> {
    return this.database.transaction(async (client) => {
      const exists = await client.query<{ id: string }>(
        'SELECT id FROM provider.organizations WHERE id = $1',
        [providerId],
      );
      return exists.rows[0] ? this.loadProvider(client, providerId) : null;
    });
  }

  updateProviderProfile(
    actor: AuthenticatedActor,
    providerId: string,
    input: UpdateProviderProfileDto,
    requestId?: string,
  ): Promise<ProviderView | null> {
    return this.database.transaction(async (client) => {
      const result = await client.query<{ provider_id: string }>(
        `UPDATE provider.profiles
         SET display_name = COALESCE($2, display_name),
             operating_model = COALESCE($3, operating_model),
             locality_summary = COALESCE($4, locality_summary),
             service_area_summary = COALESCE($5, service_area_summary),
             registered_business_name = COALESCE($6, registered_business_name),
             qualification_summary = COALESCE($7, qualification_summary),
             experience_summary = COALESCE($8, experience_summary),
             revision = revision + 1,
             updated_at = now()
         WHERE provider_id = $1
         RETURNING provider_id`,
        [
          providerId,
          input.displayName ?? null,
          input.operatingModel ?? null,
          input.localitySummary ?? null,
          input.serviceAreaSummary ?? null,
          input.registeredBusinessName ?? null,
          input.qualificationSummary ?? null,
          input.experienceSummary ?? null,
        ],
      );
      if (!result.rows[0]) {
        return null;
      }
      await this.insertAudit(client, {
        actor,
        requestId,
        providerId,
        action: 'provider_profile_updated',
        resourceType: 'provider_profile',
        resourceId: providerId,
      });
      return this.loadProvider(client, providerId);
    });
  }

  transitionProvider(
    actor: AuthenticatedActor,
    providerId: string,
    targetStatus: ProviderStatus,
    reason: string,
    requestId?: string,
  ): Promise<ProviderView | null> {
    return this.database.transaction(async (client) => {
      const result = await client.query<{ id: string }>(
        `UPDATE provider.organizations
         SET status = $2
         WHERE id = $1
         RETURNING id`,
        [providerId, targetStatus],
      );
      if (!result.rows[0]) {
        return null;
      }
      await this.insertAudit(client, {
        actor,
        requestId,
        providerId,
        action: 'provider_status_transitioned',
        resourceType: 'provider_organization',
        resourceId: providerId,
        metadata: { targetStatus, reason, discoverable: false },
      });
      return this.loadProvider(client, providerId);
    });
  }

  addRepresentative(
    actor: AuthenticatedActor,
    providerId: string,
    input: AddRepresentativeDto,
    requestId?: string,
  ): Promise<{ assignmentId: string; providerId: string; identityId: string; role: string }> {
    return this.database.transaction(async (client) => {
      const result = await client.query<{ id: string }>(
        `INSERT INTO authz.role_assignments (
           identity_id,
           role_id,
           scope_type,
           provider_id,
           assigned_by_identity_id,
           reason
         )
         SELECT $1, id, 'provider', $2, $3, $4
         FROM authz.roles
         WHERE role_key = $5
         RETURNING id`,
        [input.identityId, providerId, actor.identityId, input.reason, input.role],
      );
      const assignment = result.rows[0];
      if (!assignment) {
        throw new Error('Representative assignment returned no row.');
      }
      await this.insertAudit(client, {
        actor,
        requestId,
        providerId,
        action: 'provider_representative_assigned',
        resourceType: 'role_assignment',
        resourceId: assignment.id,
        metadata: { identityId: input.identityId, role: input.role },
      });
      return {
        assignmentId: assignment.id,
        providerId,
        identityId: input.identityId,
        role: input.role,
      };
    });
  }

  selectCategory(
    actor: AuthenticatedActor,
    providerId: string,
    categoryKey: string,
    requestId?: string,
  ): Promise<ProviderView | null> {
    return this.database.transaction(async (client) => {
      const categoryResult = await client.query<{
        category_id: string;
        requirement_version_id: string;
      }>(
        `SELECT categories.id AS category_id, versions.id AS requirement_version_id
         FROM catalog.service_categories AS categories
         JOIN catalog.requirement_versions AS versions
           ON versions.category_id = categories.id AND versions.status = 'active'
         WHERE categories.category_key = $1 AND categories.status = 'active'`,
        [categoryKey],
      );
      const category = categoryResult.rows[0];
      if (!category) {
        return null;
      }

      await client.query(
        `INSERT INTO provider.category_selections (
           provider_id,
           category_id,
           requirement_version_id,
           status
         ) VALUES ($1, $2, $3, 'selected')
         ON CONFLICT (provider_id, category_id) DO UPDATE
           SET requirement_version_id = EXCLUDED.requirement_version_id,
               status = 'selected',
               updated_at = now()`,
        [providerId, category.category_id, category.requirement_version_id],
      );
      await this.insertAudit(client, {
        actor,
        requestId,
        providerId,
        action: 'provider_category_selected',
        resourceType: 'provider_category_selection',
        resourceId: providerId,
        metadata: { categoryKey },
      });
      return this.loadProvider(client, providerId);
    });
  }

  async listCategories(): Promise<CategoryView[]> {
    const result = await this.database.query<CategoryRequirementRow>(
      `SELECT
         categories.category_key,
         categories.name AS category_name,
         categories.description,
         versions.version,
         requirements.requirement_key,
         requirements.label,
         requirements.requirement_kind,
         requirements.required,
         requirements.guidance
       FROM catalog.service_categories AS categories
       JOIN catalog.requirement_versions AS versions
         ON versions.category_id = categories.id AND versions.status = 'active'
       JOIN catalog.requirements AS requirements
         ON requirements.requirement_version_id = versions.id
       WHERE categories.status = 'active'
       ORDER BY categories.name, requirements.requirement_key`,
    );

    const categories = new Map<string, CategoryView>();
    for (const row of result.rows) {
      const existing = categories.get(row.category_key);
      const requirement = {
        key: row.requirement_key,
        label: row.label,
        kind: row.requirement_kind,
        required: row.required,
        guidance: row.guidance,
      };
      if (existing) {
        existing.requirements.push(requirement);
      } else {
        categories.set(row.category_key, {
          key: row.category_key,
          name: row.category_name,
          description: row.description,
          version: row.version,
          requirements: [requirement],
        });
      }
    }
    return [...categories.values()];
  }

  async listOperationsProviders(): Promise<ProviderOperationsSummary[]> {
    const result = await this.database.query<{
      provider_id: string;
      display_name: string;
      pathway: ProviderOperationsSummary['pathway'];
      operating_model: ProviderOperationsSummary['operatingModel'];
      status: ProviderOperationsSummary['status'];
      discoverable: false;
    }>(
      `SELECT
         organizations.id AS provider_id,
         profiles.display_name,
         organizations.pathway,
         profiles.operating_model,
         organizations.status,
         organizations.discoverable
       FROM provider.organizations AS organizations
       JOIN provider.profiles AS profiles ON profiles.provider_id = organizations.id
       ORDER BY organizations.created_at DESC
       LIMIT 100`,
    );
    return result.rows.map((row) => ({
      providerId: row.provider_id,
      displayName: row.display_name,
      pathway: row.pathway,
      operatingModel: row.operating_model,
      status: row.status,
      discoverable: false,
      synthetic: true,
    }));
  }

  private async loadProvider(client: PoolClient, providerId: string): Promise<ProviderView> {
    const providerResult = await client.query<ProviderRow>(
      `SELECT
         organizations.id,
         organizations.pathway,
         organizations.status,
         organizations.discoverable,
         profiles.display_name,
         profiles.operating_model,
         profiles.locality_summary,
         profiles.service_area_summary,
         profiles.registered_business_name,
         profiles.qualification_summary,
         profiles.experience_summary,
         profiles.revision
       FROM provider.organizations AS organizations
       JOIN provider.profiles AS profiles ON profiles.provider_id = organizations.id
       WHERE organizations.id = $1`,
      [providerId],
    );
    const row = providerResult.rows[0];
    if (!row) {
      throw new Error('Provider load returned no row.');
    }

    const categoryResult = await client.query<CategorySelectionRow>(
      `SELECT
         categories.category_key,
         categories.name AS category_name,
         versions.version,
         selections.status
       FROM provider.category_selections AS selections
       JOIN catalog.service_categories AS categories ON categories.id = selections.category_id
       JOIN catalog.requirement_versions AS versions
         ON versions.id = selections.requirement_version_id
       WHERE selections.provider_id = $1
       ORDER BY categories.name`,
      [providerId],
    );
    const categories: ProviderCategorySelectionView[] = categoryResult.rows.map((selection) => ({
      categoryKey: selection.category_key,
      categoryName: selection.category_name,
      requirementVersion: selection.version,
      status: selection.status,
    }));

    return {
      id: row.id,
      pathway: row.pathway,
      status: row.status,
      discoverable: false,
      displayName: row.display_name,
      operatingModel: row.operating_model,
      localitySummary: row.locality_summary,
      serviceAreaSummary: row.service_area_summary,
      registeredBusinessName: row.registered_business_name,
      qualificationSummary: row.qualification_summary,
      experienceSummary: row.experience_summary,
      revision: row.revision,
      categories,
      synthetic: true,
    };
  }

  private async insertAudit(
    client: PoolClient,
    input: {
      actor: AuthenticatedActor;
      requestId?: string | undefined;
      providerId?: string;
      action: string;
      resourceType: string;
      resourceId: string;
      metadata?: Record<string, unknown>;
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
        input.providerId ?? null,
        input.action,
        input.resourceType,
        input.resourceId,
        JSON.stringify(input.metadata ?? { synthetic: true, phase: 3 }),
      ],
    );
  }
}
