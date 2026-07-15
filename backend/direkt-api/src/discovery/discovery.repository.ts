import { Injectable, NotFoundException } from '@nestjs/common';
import type { QueryResultRow } from 'pg';
import { DatabaseService } from '../platform/database/database.service';
import type { DiscoverySearchDto } from './discovery.dto';
import type {
  PublicAvailability,
  PublicCategory,
  PublicClaimCard,
  PublicOperatingModel,
  PublicationEligibilityView,
  SavedProviderView,
} from './discovery.types';

interface SearchRow extends QueryResultRow {
  public_provider_id: string;
  provider_id: string;
  category_id: string;
  category_key: string;
  category_name: string;
  public_display_name: string;
  operating_model: PublicOperatingModel;
  public_locality: string;
  public_latitude: number | null;
  public_longitude: number | null;
  service_area_geojson: Record<string, unknown>;
  availability_state: PublicAvailability;
  next_available_at: Date | null;
  low_bandwidth_url: string | null;
  standard_url: string | null;
  alt_text: string | null;
  policy_version: string;
  distance_km: number | null;
  area_match: boolean;
}

interface ClaimRow extends QueryResultRow {
  claim_key: string;
  claim_statement: string;
  limitation: string;
  evidence_class: string;
  checked_at: Date;
  valid_until: Date;
  policy_version: string;
}

interface EligibilityRow extends QueryResultRow {
  provider_id: string;
  category_key: string;
  display_name: string;
  operating_model: PublicOperatingModel;
  provider_status: string;
  category_status: string;
  public_locality: string | null;
  has_public_premises: boolean;
  has_service_area: boolean;
  mandatory_claims_current: boolean;
  public_provider_id: string | null;
  publication_status: string | null;
  refreshed_at: Date | null;
}

export interface DiscoverySearchRows {
  rows: SearchRow[];
  hasMore: boolean;
}

@Injectable()
export class DiscoveryRepository {
  constructor(private readonly database: DatabaseService) {}

  async categories(): Promise<PublicCategory[]> {
    const result = await this.database.query<{
      category_key: string;
      name: string;
      description: string;
    }>(
      `SELECT category_key, name, description
       FROM catalog.service_categories
       WHERE status = 'active'
       ORDER BY name, category_key`,
    );

    return result.rows.map((row) => ({
      key: row.category_key,
      name: row.name,
      description: row.description,
    }));
  }

  async search(dto: DiscoverySearchDto, offset: number): Promise<DiscoverySearchRows> {
    const values: unknown[] = [];
    const conditions = [
      `publications.status = 'published'`,
      `organizations.status = 'ready_for_verification'`,
      `discovery.required_claims_current(
         publications.provider_id,
         publications.category_id,
         publications.requirement_version_id,
         now()
       )`,
    ];

    const parameter = (value: unknown): string => {
      values.push(value);
      return `$${values.length}`;
    };

    if (dto.category) {
      conditions.push(`categories.category_key = ${parameter(dto.category)}`);
    }
    if (dto.q) {
      const queryParameter = parameter(`%${dto.q.trim()}%`);
      conditions.push(
        `(publications.public_display_name ILIKE ${queryParameter}
          OR publications.public_locality ILIKE ${queryParameter}
          OR categories.name ILIKE ${queryParameter})`,
      );
    }
    if (dto.area) {
      conditions.push(`publications.public_locality ILIKE ${parameter(`%${dto.area.trim()}%`)}`);
    }
    if (dto.operatingModel) {
      conditions.push(`publications.operating_model = ${parameter(dto.operatingModel)}`);
    }
    if (dto.availability) {
      conditions.push(`COALESCE(availability.state, 'unknown') = ${parameter(dto.availability)}`);
    }
    if (dto.claim) {
      const claimParameter = parameter(dto.claim);
      conditions.push(
        `EXISTS (
           SELECT 1
           FROM verification.cases AS claim_cases
           JOIN verification.claims AS claims ON claims.case_id = claim_cases.id
           WHERE claim_cases.provider_id = publications.provider_id
             AND claim_cases.category_id = publications.category_id
             AND claims.claim_key = ${claimParameter}
             AND claims.status = 'active'
             AND claims.valid_until > now()
         )`,
      );
    }

    let originExpression = 'NULL::geography';
    let areaMatchExpression = 'false';
    let distanceExpression = 'NULL::double precision';
    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      const longitudeParameter = parameter(dto.longitude);
      const latitudeParameter = parameter(dto.latitude);
      originExpression = `ST_SetSRID(ST_MakePoint(${longitudeParameter}, ${latitudeParameter}), 4326)::geography`;
      distanceExpression = `CASE
           WHEN publications.public_premises IS NULL THEN NULL
           ELSE ST_Distance(publications.public_premises, ${originExpression}) / 1000.0
         END`;
      areaMatchExpression = `ST_Covers(publications.service_area::geometry, ${originExpression}::geometry)`;

      const radiusKm = dto.radiusKm ?? 25;
      const radiusParameter = parameter(radiusKm * 1000);
      conditions.push(
        `(
           (
             publications.operating_model = 'mobile'
             AND ${areaMatchExpression}
           )
           OR (
             publications.operating_model = 'fixed_premises'
             AND publications.public_premises IS NOT NULL
             AND ST_DWithin(publications.public_premises, ${originExpression}, ${radiusParameter})
           )
           OR (
             publications.operating_model = 'hybrid'
             AND (
               ${areaMatchExpression}
               OR ST_DWithin(publications.public_premises, ${originExpression}, ${radiusParameter})
             )
           )
         )`,
      );
    }

    const limitParameter = parameter(dto.limit + 1);
    const offsetParameter = parameter(offset);
    const result = await this.database.query<SearchRow>(
      `SELECT
         publications.id AS public_provider_id,
         publications.provider_id,
         publications.category_id,
         categories.category_key,
         categories.name AS category_name,
         publications.public_display_name,
         publications.operating_model,
         publications.public_locality,
         CASE
           WHEN publications.public_premises IS NULL THEN NULL
           ELSE ST_Y(publications.public_premises::geometry)
         END AS public_latitude,
         CASE
           WHEN publications.public_premises IS NULL THEN NULL
           ELSE ST_X(publications.public_premises::geometry)
         END AS public_longitude,
         ST_AsGeoJSON(publications.service_area::geometry)::jsonb AS service_area_geojson,
         COALESCE(availability.state, 'unknown') AS availability_state,
         availability.next_available_at,
         media.low_bandwidth_url,
         media.standard_url,
         media.alt_text,
         publications.policy_version,
         ${distanceExpression} AS distance_km,
         ${areaMatchExpression} AS area_match
       FROM discovery.publications AS publications
       JOIN provider.organizations AS organizations ON organizations.id = publications.provider_id
       JOIN catalog.service_categories AS categories ON categories.id = publications.category_id
       LEFT JOIN discovery.provider_availability AS availability
         ON availability.provider_id = publications.provider_id
        AND availability.category_id = publications.category_id
       LEFT JOIN LATERAL (
         SELECT
           public_media.low_bandwidth_url,
           public_media.standard_url,
           public_media.alt_text
         FROM discovery.public_media
         WHERE public_media.provider_id = publications.provider_id
           AND (public_media.category_id IS NULL OR public_media.category_id = publications.category_id)
           AND public_media.status = 'approved'
         ORDER BY public_media.sort_order, public_media.created_at, public_media.id
         LIMIT 1
       ) AS media ON true
       WHERE ${conditions.join('\n         AND ')}
       ORDER BY
         CASE WHEN ${areaMatchExpression} THEN 0 ELSE 1 END,
         ${distanceExpression} ASC NULLS LAST,
         publications.public_display_name,
         publications.id
       LIMIT ${limitParameter}
       OFFSET ${offsetParameter}`,
      values,
    );

    return {
      rows: result.rows.slice(0, dto.limit),
      hasMore: result.rows.length > dto.limit,
    };
  }

  async searchRow(publicProviderId: string): Promise<SearchRow> {
    const result = await this.database.query<SearchRow>(
      `SELECT
         publications.id AS public_provider_id,
         publications.provider_id,
         publications.category_id,
         categories.category_key,
         categories.name AS category_name,
         publications.public_display_name,
         publications.operating_model,
         publications.public_locality,
         CASE
           WHEN publications.public_premises IS NULL THEN NULL
           ELSE ST_Y(publications.public_premises::geometry)
         END AS public_latitude,
         CASE
           WHEN publications.public_premises IS NULL THEN NULL
           ELSE ST_X(publications.public_premises::geometry)
         END AS public_longitude,
         ST_AsGeoJSON(publications.service_area::geometry)::jsonb AS service_area_geojson,
         COALESCE(availability.state, 'unknown') AS availability_state,
         availability.next_available_at,
         media.low_bandwidth_url,
         media.standard_url,
         media.alt_text,
         publications.policy_version,
         NULL::double precision AS distance_km,
         false AS area_match
       FROM discovery.publications AS publications
       JOIN provider.organizations AS organizations ON organizations.id = publications.provider_id
       JOIN catalog.service_categories AS categories ON categories.id = publications.category_id
       LEFT JOIN discovery.provider_availability AS availability
         ON availability.provider_id = publications.provider_id
        AND availability.category_id = publications.category_id
       LEFT JOIN LATERAL (
         SELECT
           public_media.low_bandwidth_url,
           public_media.standard_url,
           public_media.alt_text
         FROM discovery.public_media
         WHERE public_media.provider_id = publications.provider_id
           AND (public_media.category_id IS NULL OR public_media.category_id = publications.category_id)
           AND public_media.status = 'approved'
         ORDER BY public_media.sort_order, public_media.created_at, public_media.id
         LIMIT 1
       ) AS media ON true
       WHERE publications.id = $1
         AND publications.status = 'published'
         AND organizations.status = 'ready_for_verification'
         AND discovery.required_claims_current(
           publications.provider_id,
           publications.category_id,
           publications.requirement_version_id,
           now()
         )`,
      [publicProviderId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Public provider profile was not found.');
    }
    return row;
  }

  async claims(publicProviderId: string): Promise<PublicClaimCard[]> {
    const result = await this.database.query<ClaimRow>(
      `SELECT
         claims.claim_key,
         claims.claim_statement,
         claims.limitation,
         claims.evidence_class,
         claims.checked_at,
         claims.valid_until,
         claims.policy_version
       FROM discovery.publications AS publications
       JOIN provider.organizations AS organizations ON organizations.id = publications.provider_id
       JOIN verification.cases AS cases
         ON cases.provider_id = publications.provider_id
        AND cases.category_id = publications.category_id
       JOIN verification.claims AS claims ON claims.case_id = cases.id
       WHERE publications.id = $1
         AND publications.status = 'published'
         AND organizations.status = 'ready_for_verification'
         AND discovery.required_claims_current(
           publications.provider_id,
           publications.category_id,
           publications.requirement_version_id,
           now()
         )
         AND claims.status = 'active'
         AND claims.valid_until > now()
       ORDER BY claims.claim_key, claims.valid_until DESC, claims.id`,
      [publicProviderId],
    );

    return result.rows.map((row) => ({
      claimKey: row.claim_key,
      statement: row.claim_statement,
      limitation: row.limitation,
      evidenceClass: row.evidence_class,
      checkedAt: row.checked_at.toISOString(),
      validUntil: row.valid_until.toISOString(),
      policyVersion: row.policy_version,
    }));
  }

  async refreshPublication(
    providerId: string,
    categoryKey: string,
    policyVersion: string,
  ): Promise<string> {
    const result = await this.database.query<{ publication_id: string }>(
      `SELECT discovery.refresh_publication($1, $2, $3, now()) AS publication_id`,
      [providerId, categoryKey, policyVersion],
    );
    const publicationId = result.rows[0]?.publication_id;
    if (!publicationId) {
      throw new Error('Publication policy returned no public provider identifier.');
    }
    return publicationId;
  }

  async hidePublication(publicProviderId: string, reason: string): Promise<void> {
    await this.database.query('SELECT discovery.hide_publication($1, $2)', [
      publicProviderId,
      reason,
    ]);
  }

  async eligibility(): Promise<PublicationEligibilityView[]> {
    const result = await this.database.query<EligibilityRow>(
      `SELECT *
       FROM discovery.publication_eligibility
       ORDER BY display_name, category_key, provider_id`,
    );

    return result.rows.map((row) => {
      const locationEligible =
        row.has_service_area && (row.operating_model === 'mobile' || row.has_public_premises);
      return {
        providerId: row.provider_id,
        categoryKey: row.category_key,
        displayName: row.display_name,
        operatingModel: row.operating_model,
        providerStatus: row.provider_status,
        categoryStatus: row.category_status,
        locality: row.public_locality,
        hasPublicPremises: row.has_public_premises,
        hasServiceArea: row.has_service_area,
        mandatoryClaimsCurrent: row.mandatory_claims_current,
        publicProviderId: row.public_provider_id,
        publicationStatus: row.publication_status,
        refreshedAt: row.refreshed_at?.toISOString() ?? null,
        eligible:
          row.provider_status === 'ready_for_verification' &&
          row.category_status === 'selected' &&
          row.mandatory_claims_current &&
          locationEligible,
      };
    });
  }

  async save(identityId: string, publicProviderId: string): Promise<SavedProviderView> {
    const eligible = await this.database.query<{ id: string }>(
      `SELECT publications.id
       FROM discovery.publications AS publications
       JOIN provider.organizations AS organizations ON organizations.id = publications.provider_id
       WHERE publications.id = $1
         AND publications.status = 'published'
         AND organizations.status = 'ready_for_verification'
         AND discovery.required_claims_current(
           publications.provider_id,
           publications.category_id,
           publications.requirement_version_id,
           now()
         )`,
      [publicProviderId],
    );
    if (!eligible.rows[0]) {
      throw new NotFoundException('Eligible public provider profile was not found.');
    }

    await this.database.query(
      `INSERT INTO account.saved_public_providers (identity_id, publication_id)
       VALUES ($1, $2)
       ON CONFLICT (identity_id, publication_id) DO NOTHING`,
      [identityId, publicProviderId],
    );

    const result = await this.database.query<{
      public_provider_id: string;
      public_display_name: string;
      category_name: string;
      public_locality: string;
      saved_at: Date;
    }>(
      `SELECT
         publications.id AS public_provider_id,
         publications.public_display_name,
         categories.name AS category_name,
         publications.public_locality,
         saved.saved_at
       FROM account.saved_public_providers AS saved
       JOIN discovery.publications AS publications ON publications.id = saved.publication_id
       JOIN provider.organizations AS organizations ON organizations.id = publications.provider_id
       JOIN catalog.service_categories AS categories ON categories.id = publications.category_id
       WHERE saved.identity_id = $1
         AND saved.publication_id = $2`,
      [identityId, publicProviderId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Saved public provider was not found.');
    }
    return this.savedView(row);
  }

  async unsave(identityId: string, publicProviderId: string): Promise<void> {
    await this.database.query(
      `DELETE FROM account.saved_public_providers
       WHERE identity_id = $1 AND publication_id = $2`,
      [identityId, publicProviderId],
    );
  }

  async saved(identityId: string): Promise<SavedProviderView[]> {
    const result = await this.database.query<{
      public_provider_id: string;
      public_display_name: string;
      category_name: string;
      public_locality: string;
      saved_at: Date;
    }>(
      `SELECT
         publications.id AS public_provider_id,
         publications.public_display_name,
         categories.name AS category_name,
         publications.public_locality,
         saved.saved_at
       FROM account.saved_public_providers AS saved
       JOIN discovery.publications AS publications ON publications.id = saved.publication_id
       JOIN catalog.service_categories AS categories ON categories.id = publications.category_id
       WHERE saved.identity_id = $1
         AND publications.status = 'published'
         AND organizations.status = 'ready_for_verification'
         AND discovery.required_claims_current(
           publications.provider_id,
           publications.category_id,
           publications.requirement_version_id,
           now()
         )
       ORDER BY saved.saved_at DESC, publications.id`,
      [identityId],
    );
    return result.rows.map((row) => this.savedView(row));
  }

  private savedView(row: {
    public_provider_id: string;
    public_display_name: string;
    category_name: string;
    public_locality: string;
    saved_at: Date;
  }): SavedProviderView {
    return {
      publicProviderId: row.public_provider_id,
      displayName: row.public_display_name,
      categoryName: row.category_name,
      locality: row.public_locality,
      savedAt: row.saved_at.toISOString(),
      sharePath: `/providers/${row.public_provider_id}`,
      synthetic: true,
    };
  }
}

export type DiscoverySearchRow = SearchRow;
