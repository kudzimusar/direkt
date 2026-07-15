import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../platform/database/database.service';
import type {
  CreateProviderDraftDto,
  UpdateProviderProfileDto,
  UpsertCustomerProfileDto,
} from './dto/phase3.dto';
import type { ProfileState } from './provider-policy';

export interface ProviderProfileRecord {
  providerId: string;
  pathway: string;
  displayName: string;
  operatingModel: string;
  serviceAreaLabel: string | null;
  premisesLabel: string | null;
  description: string;
  profileState: ProfileState;
  discoverabilityState: 'blocked';
  version: number;
  categories: Array<{
    categoryId: string;
    categoryKey: string;
    name: string;
    requirementVersionId: string;
    requirementVersion: number;
  }>;
}

@Injectable()
export class Phase3Repository {
  constructor(private readonly database: DatabaseService) {}

  async getCustomerProfile(identityId: string): Promise<Record<string, unknown> | null> {
    const result = await this.database.query<Record<string, unknown>>(
      `SELECT identity_id AS "identityId", preferred_name AS "preferredName", locale,
              created_at AS "createdAt", updated_at AS "updatedAt"
         FROM account.customer_profiles
        WHERE identity_id = $1`,
      [identityId],
    );
    return result.rows[0] ?? null;
  }

  async upsertCustomerProfile(
    identityId: string,
    input: UpsertCustomerProfileDto,
  ): Promise<Record<string, unknown>> {
    const result = await this.database.query<Record<string, unknown>>(
      `INSERT INTO account.customer_profiles (
         identity_id, preferred_name, locale, updated_by_identity_id
       ) VALUES ($1, $2, $3, $1)
       ON CONFLICT (identity_id) DO UPDATE SET
         preferred_name = EXCLUDED.preferred_name,
         locale = EXCLUDED.locale,
         updated_by_identity_id = EXCLUDED.updated_by_identity_id
       RETURNING identity_id AS "identityId", preferred_name AS "preferredName", locale,
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [identityId, input.preferredName.trim(), input.locale],
    );
    return result.rows[0]!;
  }

  async createProviderDraft(
    identityId: string,
    input: CreateProviderDraftDto,
  ): Promise<ProviderProfileRecord> {
    return this.database.transaction(async (client) => {
      const provider = await client.query<{ id: string }>(
        `INSERT INTO provider.organizations (pathway, created_by_identity_id)
         VALUES ($1, $2)
         RETURNING id`,
        [input.pathway, identityId],
      );
      const providerId = provider.rows[0]!.id;

      await client.query(
        `INSERT INTO provider.profiles (
           provider_id, display_name, operating_model, service_area_label,
           premises_label, description, updated_by_identity_id
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          providerId,
          input.displayName.trim(),
          input.operatingModel,
          input.serviceAreaLabel?.trim() ?? null,
          input.premisesLabel?.trim() ?? null,
          input.description?.trim() ?? '',
          identityId,
        ],
      );

      await client.query(
        `INSERT INTO authz.role_assignments (
           identity_id, role_id, scope_type, provider_id, reason, assigned_by_identity_id
         )
         SELECT $1, id, 'provider', $2, 'Provider draft creator', $1
           FROM authz.roles
          WHERE role_key = 'provider_owner'`,
        [identityId, providerId],
      );

      return this.getProviderProfileWithClient(client, providerId);
    });
  }

  async getProviderProfile(providerId: string): Promise<ProviderProfileRecord> {
    return this.database.transaction((client) =>
      this.getProviderProfileWithClient(client, providerId),
    );
  }

  async updateProviderProfile(
    providerId: string,
    identityId: string,
    input: UpdateProviderProfileDto,
  ): Promise<ProviderProfileRecord> {
    return this.database.transaction(async (client) => {
      const current = await this.getProviderProfileWithClient(client, providerId);
      const next = {
        displayName: input.displayName?.trim() ?? current.displayName,
        operatingModel: input.operatingModel ?? current.operatingModel,
        serviceAreaLabel:
          input.serviceAreaLabel === undefined
            ? current.serviceAreaLabel
            : input.serviceAreaLabel.trim(),
        premisesLabel:
          input.premisesLabel === undefined ? current.premisesLabel : input.premisesLabel.trim(),
        description:
          input.description === undefined ? current.description : input.description.trim(),
      };

      await client.query(
        `UPDATE provider.profiles
            SET display_name = $2,
                operating_model = $3,
                service_area_label = $4,
                premises_label = $5,
                description = $6,
                version = version + 1,
                updated_by_identity_id = $7
          WHERE provider_id = $1`,
        [
          providerId,
          next.displayName,
          next.operatingModel,
          next.serviceAreaLabel,
          next.premisesLabel,
          next.description,
          identityId,
        ],
      );
      return this.getProviderProfileWithClient(client, providerId);
    });
  }

  async transitionProviderProfile(
    providerId: string,
    identityId: string,
    targetState: ProfileState,
  ): Promise<ProviderProfileRecord> {
    return this.database.transaction(async (client) => {
      const result = await client.query(
        `UPDATE provider.profiles
            SET profile_state = $2,
                version = version + 1,
                updated_by_identity_id = $3
          WHERE provider_id = $1`,
        [providerId, targetState, identityId],
      );
      if (result.rowCount !== 1) {
        throw new NotFoundException('Provider profile not found.');
      }
      return this.getProviderProfileWithClient(client, providerId);
    });
  }

  async assignRepresentative(input: {
    providerId: string;
    actorIdentityId: string;
    identityId: string;
    role: 'provider_member' | 'provider_responder';
    reason: string;
  }): Promise<void> {
    await this.database.query(
      `INSERT INTO authz.role_assignments (
         identity_id, role_id, scope_type, provider_id, reason, assigned_by_identity_id
       )
       SELECT $1, id, 'provider', $2, $3, $4
         FROM authz.roles
        WHERE role_key = $5`,
      [input.identityId, input.providerId, input.reason.trim(), input.actorIdentityId, input.role],
    );
  }

  async selectCategory(input: {
    providerId: string;
    identityId: string;
    categoryId: string;
    requirementVersionId: string;
  }): Promise<ProviderProfileRecord> {
    return this.database.transaction(async (client) => {
      const version = await client.query<{ status: string }>(
        `SELECT status
           FROM catalog.category_requirement_versions
          WHERE id = $1 AND category_id = $2`,
        [input.requirementVersionId, input.categoryId],
      );
      if (version.rows[0]?.status !== 'active') {
        throw new ConflictException('The selected category requirement version is not active.');
      }

      await client.query(
        `INSERT INTO provider.profile_categories (
           provider_id, category_id, requirement_version_id, selected_by_identity_id
         ) VALUES ($1, $2, $3, $4)
         ON CONFLICT (provider_id, category_id) DO UPDATE SET
           requirement_version_id = EXCLUDED.requirement_version_id,
           selected_by_identity_id = EXCLUDED.selected_by_identity_id,
           selected_at = now()`,
        [input.providerId, input.categoryId, input.requirementVersionId, input.identityId],
      );
      return this.getProviderProfileWithClient(client, input.providerId);
    });
  }

  async listCategories(): Promise<Array<Record<string, unknown>>> {
    const result = await this.database.query<Record<string, unknown>>(
      `SELECT c.id, c.category_key AS "categoryKey", c.name,
              rv.id AS "requirementVersionId", rv.version, rv.requirements
         FROM catalog.categories c
         JOIN catalog.category_requirement_versions rv
           ON rv.category_id = c.id AND rv.status = 'active'
        WHERE c.status = 'active'
        ORDER BY c.name`,
    );
    return result.rows;
  }

  async operationsSummary(): Promise<Record<string, number>> {
    const result = await this.database.query<Record<string, string>>(
      `SELECT
         (SELECT count(*)::text FROM provider.organizations) AS providers,
         (SELECT count(*)::text FROM provider.profiles WHERE profile_state = 'draft') AS drafts,
         (SELECT count(*)::text FROM provider.profiles WHERE profile_state = 'complete') AS complete,
         (SELECT count(*)::text FROM provider.profiles WHERE discoverability_state <> 'blocked') AS discoverable,
         (SELECT count(*)::text FROM catalog.categories WHERE status = 'active') AS categories`,
    );
    const row = result.rows[0]!;
    return {
      providers: Number(row.providers),
      drafts: Number(row.drafts),
      complete: Number(row.complete),
      discoverable: Number(row.discoverable),
      categories: Number(row.categories),
    };
  }

  private async getProviderProfileWithClient(
    client: PoolClient,
    providerId: string,
  ): Promise<ProviderProfileRecord> {
    const profile = await client.query<Omit<ProviderProfileRecord, 'categories'>>(
      `SELECT p.provider_id AS "providerId", o.pathway, p.display_name AS "displayName",
              p.operating_model AS "operatingModel", p.service_area_label AS "serviceAreaLabel",
              p.premises_label AS "premisesLabel", p.description,
              p.profile_state AS "profileState", p.discoverability_state AS "discoverabilityState",
              p.version
         FROM provider.profiles p
         JOIN provider.organizations o ON o.id = p.provider_id
        WHERE p.provider_id = $1`,
      [providerId],
    );
    const row = profile.rows[0];
    if (!row) {
      throw new NotFoundException('Provider profile not found.');
    }
    const categories = await client.query<ProviderProfileRecord['categories'][number]>(
      `SELECT pc.category_id AS "categoryId", c.category_key AS "categoryKey", c.name,
              pc.requirement_version_id AS "requirementVersionId", rv.version AS "requirementVersion"
         FROM provider.profile_categories pc
         JOIN catalog.categories c ON c.id = pc.category_id
         JOIN catalog.category_requirement_versions rv ON rv.id = pc.requirement_version_id
        WHERE pc.provider_id = $1
        ORDER BY c.name`,
      [providerId],
    );
    return { ...row, categories: categories.rows };
  }
}
