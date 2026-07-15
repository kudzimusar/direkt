import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../platform/database/database.service';
import type {
  ProviderWorkspaceAvailabilityView,
  ProviderWorkspaceCategoryView,
  ProviderWorkspaceLocationView,
  ProviderWorkspaceRole,
  ProviderWorkspaceSummary,
  ProviderWorkspaceTaskView,
} from './provider-workspace.types';

interface AssignmentRow {
  provider_id: string;
  role_key: ProviderWorkspaceRole;
}

interface ProviderRow {
  pathway: ProviderWorkspaceSummary['provider']['pathway'];
  status: ProviderWorkspaceSummary['provider']['status'];
  discoverable: boolean;
  display_name: string;
  operating_model: ProviderWorkspaceSummary['provider']['operatingModel'];
  locality_summary: string | null;
  service_area_summary: string;
  registered_business_name: string | null;
  qualification_summary: string | null;
  experience_summary: string | null;
  revision: number;
}

interface CategoryRow {
  category_key: string;
  category_name: string;
  requirement_version: number;
  status: ProviderWorkspaceCategoryView['status'];
  required_requirements: string;
  evidence_submitted: string;
  open_cases: string;
  correction_required: string;
  current_claims: string;
  publication_eligible: boolean;
}

interface LocationRow {
  private_base_stored: boolean;
  public_premises_configured: boolean;
  public_premises_consent: boolean;
  public_locality: string;
  service_area_configured: boolean;
}

interface AvailabilityRow {
  category_key: string;
  category_name: string;
  state: ProviderWorkspaceAvailabilityView['state'];
  next_available_at: Date | null;
  updated_at: Date | null;
}

@Injectable()
export class ProviderWorkspaceRepository {
  constructor(private readonly database: DatabaseService) {}

  workspace(identityId: string): Promise<ProviderWorkspaceSummary> {
    return this.database.transaction(async (client) => {
      const assignment = await this.resolveAssignment(client, identityId);
      const provider = await this.provider(client, assignment.provider_id);
      const categories = await this.categories(client, assignment.provider_id);
      const location = await this.location(client, assignment.provider_id);
      const availability = await this.availability(client, assignment.provider_id);

      const profileComplete = this.profileComplete(provider);
      const selectedCategories = categories.filter((category) => category.status === 'selected');
      const mandatoryRequirements = selectedCategories.reduce(
        (total, category) => total + category.requiredRequirements,
        0,
      );
      const evidenceSubmitted = selectedCategories.reduce(
        (total, category) => total + category.evidenceSubmitted,
        0,
      );
      const openCases = selectedCategories.reduce(
        (total, category) => total + category.openCases,
        0,
      );
      const correctionRequired = selectedCategories.reduce(
        (total, category) => total + category.correctionRequired,
        0,
      );
      const currentClaims = selectedCategories.reduce(
        (total, category) => total + category.currentClaims,
        0,
      );
      const publicationEligibleCategories = selectedCategories.filter(
        (category) => category.publicationEligible,
      ).length;
      const completionPercent = this.completionPercent({
        profileComplete,
        selectedCategoryCount: selectedCategories.length,
        locationConfigured: location.configured,
        mandatoryRequirements,
        currentClaims,
        correctionRequired,
      });

      return {
        providerId: assignment.provider_id,
        representativeRole: assignment.role_key,
        provider: {
          pathway: provider.pathway,
          status: provider.status,
          discoverable: provider.discoverable,
          displayName: provider.display_name,
          operatingModel: provider.operating_model,
          localitySummary: provider.locality_summary,
          serviceAreaSummary: provider.service_area_summary,
          registeredBusinessName: provider.registered_business_name,
          qualificationSummary: provider.qualification_summary,
          experienceSummary: provider.experience_summary,
          revision: provider.revision,
        },
        categories,
        location,
        availability,
        readiness: {
          profileComplete,
          selectedCategories: selectedCategories.length,
          mandatoryRequirements,
          evidenceSubmitted,
          openCases,
          correctionRequired,
          currentClaims,
          publicationEligibleCategories,
          completionPercent,
        },
        tasks: this.tasks({
          profileComplete,
          selectedCategoryCount: selectedCategories.length,
          locationConfigured: location.configured,
          mandatoryRequirements,
          evidenceSubmitted,
          openCases,
          correctionRequired,
          currentClaims,
        }),
        deferredSurfaces: {
          enquiries: {
            state: 'empty',
            phaseOwner: 'phase8',
            mutationAllowed: false,
            message:
              'Real enquiry creation, response transitions and contact handoff begin in Phase 8.',
          },
          reviewResponses: {
            state: 'empty',
            phaseOwner: 'phase8',
            mutationAllowed: false,
            message:
              'Tracked reviews, moderation, appeals and provider responses begin in Phase 8.',
          },
          subscription: {
            state: 'synthetic_only',
            phaseOwner: 'phase9',
            mutationAllowed: false,
            message: 'Products, entitlements, invoices and payments begin in Phase 9.',
          },
        },
        trustBoundary:
          'Profile completion, availability, uploads and commercial state cannot create claims, publication or trust ranking.',
        synthetic: true,
      };
    });
  }

  private async resolveAssignment(client: PoolClient, identityId: string): Promise<AssignmentRow> {
    const result = await client.query<AssignmentRow>(
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
    return result.rows[0] as AssignmentRow;
  }

  private async provider(client: PoolClient, providerId: string): Promise<ProviderRow> {
    const result = await client.query<ProviderRow>(
      `SELECT
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
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('The active provider workspace was not found.');
    }
    return row;
  }

  private async categories(
    client: PoolClient,
    providerId: string,
  ): Promise<ProviderWorkspaceCategoryView[]> {
    const result = await client.query<CategoryRow>(
      `SELECT
         categories.category_key,
         categories.name AS category_name,
         versions.version AS requirement_version,
         selections.status,
         (
           SELECT count(*)
           FROM catalog.requirements AS requirements
           WHERE requirements.requirement_version_id = selections.requirement_version_id
             AND requirements.required = true
         )::text AS required_requirements,
         (
           SELECT count(DISTINCT items.requirement_id)
           FROM evidence.items AS items
           JOIN catalog.requirements AS requirements ON requirements.id = items.requirement_id
           WHERE items.provider_id = selections.provider_id
             AND requirements.requirement_version_id = selections.requirement_version_id
             AND items.status NOT IN ('draft', 'revoked', 'expired')
         )::text AS evidence_submitted,
         (
           SELECT count(*)
           FROM verification.cases AS cases
           WHERE cases.provider_id = selections.provider_id
             AND cases.category_id = selections.category_id
             AND cases.requirement_version_id = selections.requirement_version_id
             AND cases.status NOT IN ('approved', 'rejected', 'revoked', 'expired', 'cancelled', 'closed')
         )::text AS open_cases,
         (
           SELECT count(*)
           FROM verification.cases AS cases
           WHERE cases.provider_id = selections.provider_id
             AND cases.category_id = selections.category_id
             AND cases.requirement_version_id = selections.requirement_version_id
             AND cases.status = 'correction_required'
         )::text AS correction_required,
         (
           SELECT count(*)
           FROM verification.cases AS cases
           JOIN verification.claims AS claims ON claims.case_id = cases.id
           WHERE cases.provider_id = selections.provider_id
             AND cases.category_id = selections.category_id
             AND cases.requirement_version_id = selections.requirement_version_id
             AND claims.status = 'active'
             AND claims.valid_until > now()
         )::text AS current_claims,
         (
           selections.status = 'selected'
           AND organizations.status = 'ready_for_verification'
           AND locations.provider_id IS NOT NULL
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
         ) AS publication_eligible
       FROM provider.category_selections AS selections
       JOIN provider.organizations AS organizations ON organizations.id = selections.provider_id
       JOIN provider.profiles AS profiles ON profiles.provider_id = selections.provider_id
       JOIN catalog.service_categories AS categories ON categories.id = selections.category_id
       JOIN catalog.requirement_versions AS versions ON versions.id = selections.requirement_version_id
       LEFT JOIN discovery.provider_locations AS locations ON locations.provider_id = selections.provider_id
       WHERE selections.provider_id = $1
       ORDER BY categories.name, categories.category_key`,
      [providerId],
    );

    return result.rows.map((row) => ({
      categoryKey: row.category_key,
      categoryName: row.category_name,
      requirementVersion: row.requirement_version,
      status: row.status,
      requiredRequirements: Number(row.required_requirements),
      evidenceSubmitted: Number(row.evidence_submitted),
      openCases: Number(row.open_cases),
      correctionRequired: Number(row.correction_required),
      currentClaims: Number(row.current_claims),
      publicationEligible: row.publication_eligible,
    }));
  }

  private async location(
    client: PoolClient,
    providerId: string,
  ): Promise<ProviderWorkspaceLocationView> {
    const result = await client.query<LocationRow>(
      `SELECT
         private_base IS NOT NULL AS private_base_stored,
         public_premises IS NOT NULL AS public_premises_configured,
         public_premises_consent,
         public_locality,
         service_area IS NOT NULL AS service_area_configured
       FROM discovery.provider_locations
       WHERE provider_id = $1`,
      [providerId],
    );
    const row = result.rows[0];
    if (!row) {
      return {
        configured: false,
        privateBaseStored: false,
        publicPremisesConfigured: false,
        publicPremisesConsent: false,
        publicLocality: null,
        serviceAreaConfigured: false,
        privacyBoundary:
          'Private base, consented public premises and service area are separate records. No coordinates are returned by this workspace summary.',
      };
    }
    return {
      configured: row.service_area_configured,
      privateBaseStored: row.private_base_stored,
      publicPremisesConfigured: row.public_premises_configured,
      publicPremisesConsent: row.public_premises_consent,
      publicLocality: row.public_locality,
      serviceAreaConfigured: row.service_area_configured,
      privacyBoundary:
        'Private base, consented public premises and service area are separate records. No coordinates are returned by this workspace summary.',
    };
  }

  private async availability(
    client: PoolClient,
    providerId: string,
  ): Promise<ProviderWorkspaceAvailabilityView[]> {
    const result = await client.query<AvailabilityRow>(
      `SELECT
         categories.category_key,
         categories.name AS category_name,
         COALESCE(availability.state, 'unknown') AS state,
         availability.next_available_at,
         availability.updated_at
       FROM provider.category_selections AS selections
       JOIN catalog.service_categories AS categories ON categories.id = selections.category_id
       LEFT JOIN discovery.provider_availability AS availability
         ON availability.provider_id = selections.provider_id
        AND availability.category_id = selections.category_id
       WHERE selections.provider_id = $1
         AND selections.status = 'selected'
       ORDER BY categories.name, categories.category_key`,
      [providerId],
    );
    return result.rows.map((row) => ({
      categoryKey: row.category_key,
      categoryName: row.category_name,
      state: row.state,
      nextAvailableAt: row.next_available_at?.toISOString() ?? null,
      updatedAt: row.updated_at?.toISOString() ?? null,
    }));
  }

  private profileComplete(provider: ProviderRow): boolean {
    const localityComplete =
      provider.operating_model === 'mobile' || Boolean(provider.locality_summary?.trim());
    const pathwayComplete =
      (provider.pathway === 'registered_business' &&
        Boolean(provider.registered_business_name?.trim())) ||
      (provider.pathway === 'qualified_individual' &&
        Boolean(provider.qualification_summary?.trim())) ||
      (provider.pathway === 'experienced_informal' && Boolean(provider.experience_summary?.trim()));
    return (
      Boolean(provider.display_name.trim()) &&
      Boolean(provider.service_area_summary.trim()) &&
      localityComplete &&
      pathwayComplete
    );
  }

  private completionPercent(input: {
    profileComplete: boolean;
    selectedCategoryCount: number;
    locationConfigured: boolean;
    mandatoryRequirements: number;
    currentClaims: number;
    correctionRequired: number;
  }): number {
    const checks = [
      input.profileComplete,
      input.selectedCategoryCount > 0,
      input.locationConfigured,
      input.mandatoryRequirements > 0 && input.currentClaims >= input.mandatoryRequirements,
      input.correctionRequired === 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  private tasks(input: {
    profileComplete: boolean;
    selectedCategoryCount: number;
    locationConfigured: boolean;
    mandatoryRequirements: number;
    evidenceSubmitted: number;
    openCases: number;
    correctionRequired: number;
    currentClaims: number;
  }): ProviderWorkspaceTaskView[] {
    const tasks: ProviderWorkspaceTaskView[] = [
      {
        key: 'complete_profile',
        title: 'Complete provider profile',
        detail: 'Confirm the operating model, locality and pathway-specific profile fields.',
        state: input.profileComplete ? 'complete' : 'action_required',
        priority: 10,
        action: input.profileComplete ? null : 'edit_profile',
      },
      {
        key: 'select_services',
        title: 'Select services',
        detail: 'Choose at least one active category and its immutable requirement version.',
        state: input.selectedCategoryCount > 0 ? 'complete' : 'action_required',
        priority: 20,
        action: input.selectedCategoryCount > 0 ? null : 'select_services',
      },
      {
        key: 'configure_service_area',
        title: 'Configure service area',
        detail: 'Keep the private base, consented public premises and service area separate.',
        state: input.locationConfigured ? 'complete' : 'action_required',
        priority: 30,
        action: input.locationConfigured ? null : 'edit_service_area',
      },
      {
        key: 'submit_evidence',
        title: 'Submit required evidence',
        detail: 'Evidence must be linked to a selected requirement and remains private.',
        state:
          input.mandatoryRequirements === 0
            ? 'blocked'
            : input.evidenceSubmitted >= input.mandatoryRequirements
              ? 'complete'
              : 'action_required',
        priority: 40,
        action:
          input.mandatoryRequirements > 0 && input.evidenceSubmitted < input.mandatoryRequirements
            ? 'open_evidence'
            : null,
      },
      {
        key: 'resolve_corrections',
        title: 'Resolve verification corrections',
        detail:
          'Correction requirements are scoped to a case and do not imply a provider-wide verdict.',
        state: input.correctionRequired > 0 ? 'action_required' : 'complete',
        priority: 50,
        action: input.correctionRequired > 0 ? 'open_verification_timeline' : null,
      },
      {
        key: 'verification_progress',
        title: 'Track verification progress',
        detail: 'Current claims are created only by immutable verification decisions.',
        state:
          input.mandatoryRequirements > 0 && input.currentClaims >= input.mandatoryRequirements
            ? 'complete'
            : input.openCases > 0
              ? 'not_started'
              : 'blocked',
        priority: 60,
        action: input.openCases > 0 ? 'open_verification_timeline' : null,
      },
    ];
    return tasks.sort((left, right) => left.priority - right.priority);
  }
}
