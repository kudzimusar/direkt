import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../platform/database/database.service';

interface ProviderWorkspaceOperationsRow {
  provider_id: string;
  display_name: string;
  provider_status: string;
  operating_model: string;
  representative_count: string;
  selected_services: string;
  profile_complete: boolean;
  private_base_stored: boolean;
  public_premises_configured: boolean;
  public_premises_consent: boolean;
  service_area_configured: boolean;
  open_cases: string;
  corrections_required: string;
  current_claims: string;
  publication_eligible_services: string;
  queued_uploads: string;
  active_uploads: string;
  interrupted_uploads: string;
  submitted_uploads: string;
  terminal_uploads: string;
  last_upload_activity_at: Date | null;
}

export interface ProviderWorkspaceOperationsView {
  providerId: string;
  displayName: string;
  providerStatus: string;
  operatingModel: string;
  representativeCount: number;
  selectedServices: number;
  profileComplete: boolean;
  location: {
    privateBaseStored: boolean;
    publicPremisesConfigured: boolean;
    publicPremisesConsent: boolean;
    serviceAreaConfigured: boolean;
    coordinatesExposed: false;
  };
  verification: {
    openCases: number;
    correctionsRequired: number;
    currentClaims: number;
    publicationEligibleServices: number;
  };
  uploads: {
    queued: number;
    active: number;
    interruptedOrRetryable: number;
    submitted: number;
    terminalOrCancelled: number;
    lastActivityAt: string | null;
    evidenceIdentifiersExposed: false;
    objectKeysExposed: false;
  };
  synthetic: true;
}

@Injectable()
export class ProviderWorkspaceOperationsRepository {
  constructor(private readonly database: DatabaseService) {}

  async list(): Promise<ProviderWorkspaceOperationsView[]> {
    const result = await this.database.query<ProviderWorkspaceOperationsRow>(
      `SELECT
         organizations.id AS provider_id,
         profiles.display_name,
         organizations.status AS provider_status,
         profiles.operating_model,
         (
           SELECT count(DISTINCT assignments.identity_id)
           FROM authz.role_assignments AS assignments
           JOIN authz.roles AS roles ON roles.id = assignments.role_id
           WHERE assignments.provider_id = organizations.id
             AND assignments.scope_type = 'provider'
             AND assignments.revoked_at IS NULL
             AND assignments.starts_at <= now()
             AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
             AND roles.role_key IN ('provider_owner', 'provider_member', 'provider_responder')
         )::text AS representative_count,
         (
           SELECT count(*)
           FROM provider.category_selections AS selections
           WHERE selections.provider_id = organizations.id
             AND selections.status = 'selected'
         )::text AS selected_services,
         (
           length(btrim(profiles.display_name)) >= 2
           AND length(btrim(profiles.service_area_summary)) >= 2
           AND (
             profiles.operating_model = 'mobile'
             OR length(btrim(COALESCE(profiles.locality_summary, ''))) >= 2
           )
           AND (
             (organizations.pathway = 'registered_business'
               AND length(btrim(COALESCE(profiles.registered_business_name, ''))) >= 2)
             OR (organizations.pathway = 'qualified_individual'
               AND length(btrim(COALESCE(profiles.qualification_summary, ''))) >= 2)
             OR (organizations.pathway = 'experienced_informal'
               AND length(btrim(COALESCE(profiles.experience_summary, ''))) >= 2)
           )
         ) AS profile_complete,
         locations.private_base IS NOT NULL AS private_base_stored,
         locations.public_premises IS NOT NULL AS public_premises_configured,
         COALESCE(locations.public_premises_consent, false) AS public_premises_consent,
         locations.service_area IS NOT NULL AS service_area_configured,
         (
           SELECT count(*)
           FROM verification.cases AS cases
           WHERE cases.provider_id = organizations.id
             AND cases.status NOT IN ('approved', 'rejected', 'revoked', 'expired', 'cancelled', 'closed')
         )::text AS open_cases,
         (
           SELECT count(*)
           FROM verification.cases AS cases
           WHERE cases.provider_id = organizations.id
             AND cases.status = 'correction_required'
         )::text AS corrections_required,
         (
           SELECT count(*)
           FROM verification.claims AS claims
           WHERE claims.provider_id = organizations.id
             AND claims.status = 'active'
             AND claims.valid_until > now()
         )::text AS current_claims,
         (
           SELECT count(*)
           FROM provider.category_selections AS selections
           WHERE selections.provider_id = organizations.id
             AND selections.status = 'selected'
             AND organizations.status = 'ready_for_verification'
             AND locations.provider_id IS NOT NULL
             AND locations.service_area IS NOT NULL
             AND (
               profiles.operating_model = 'mobile'
               OR locations.public_premises IS NOT NULL
             )
             AND discovery.required_claims_current(
               selections.provider_id,
               selections.category_id,
               selections.requirement_version_id,
               now()
             )
         )::text AS publication_eligible_services,
         count(*) FILTER (WHERE intents.state = 'queued')::text AS queued_uploads,
         count(*) FILTER (WHERE intents.state = 'uploading')::text AS active_uploads,
         count(*) FILTER (WHERE intents.state IN ('interrupted', 'retryable'))::text AS interrupted_uploads,
         count(*) FILTER (WHERE intents.state = 'submitted')::text AS submitted_uploads,
         count(*) FILTER (WHERE intents.state IN ('terminal_failure', 'cancelled'))::text AS terminal_uploads,
         max(intents.updated_at) AS last_upload_activity_at
       FROM provider.organizations AS organizations
       JOIN provider.profiles AS profiles ON profiles.provider_id = organizations.id
       LEFT JOIN discovery.provider_locations AS locations ON locations.provider_id = organizations.id
       LEFT JOIN provider_workspace.upload_intents AS intents ON intents.provider_id = organizations.id
       WHERE organizations.status <> 'archived'
       GROUP BY
         organizations.id,
         profiles.display_name,
         organizations.status,
         organizations.pathway,
         profiles.operating_model,
         profiles.service_area_summary,
         profiles.locality_summary,
         profiles.registered_business_name,
         profiles.qualification_summary,
         profiles.experience_summary,
         locations.provider_id,
         locations.private_base,
         locations.public_premises,
         locations.public_premises_consent,
         locations.service_area
       ORDER BY profiles.display_name, organizations.id`,
    );

    return result.rows.map((row) => ({
      providerId: row.provider_id,
      displayName: row.display_name,
      providerStatus: row.provider_status,
      operatingModel: row.operating_model,
      representativeCount: Number(row.representative_count),
      selectedServices: Number(row.selected_services),
      profileComplete: row.profile_complete,
      location: {
        privateBaseStored: row.private_base_stored,
        publicPremisesConfigured: row.public_premises_configured,
        publicPremisesConsent: row.public_premises_consent,
        serviceAreaConfigured: row.service_area_configured,
        coordinatesExposed: false,
      },
      verification: {
        openCases: Number(row.open_cases),
        correctionsRequired: Number(row.corrections_required),
        currentClaims: Number(row.current_claims),
        publicationEligibleServices: Number(row.publication_eligible_services),
      },
      uploads: {
        queued: Number(row.queued_uploads),
        active: Number(row.active_uploads),
        interruptedOrRetryable: Number(row.interrupted_uploads),
        submitted: Number(row.submitted_uploads),
        terminalOrCancelled: Number(row.terminal_uploads),
        lastActivityAt: row.last_upload_activity_at?.toISOString() ?? null,
        evidenceIdentifiersExposed: false,
        objectKeysExposed: false,
      },
      synthetic: true,
    }));
  }
}
