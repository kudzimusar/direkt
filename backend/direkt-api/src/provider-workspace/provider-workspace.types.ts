import type {
  OperatingModel,
  ProviderCategorySelectionView,
  ProviderPathway,
  ProviderStatus,
} from '../provider-core/provider.types';

export type ProviderWorkspaceRole =
  | 'provider_owner'
  | 'provider_member'
  | 'provider_responder';

export type WorkspaceTaskState = 'complete' | 'action_required' | 'blocked' | 'not_started';

export interface ProviderWorkspaceCategoryView extends ProviderCategorySelectionView {
  requiredRequirements: number;
  evidenceSubmitted: number;
  openCases: number;
  correctionRequired: number;
  currentClaims: number;
  publicationEligible: boolean;
}

export interface ProviderWorkspaceLocationView {
  configured: boolean;
  privateBaseStored: boolean;
  publicPremisesConfigured: boolean;
  publicPremisesConsent: boolean;
  publicLocality: string | null;
  serviceAreaConfigured: boolean;
  privacyBoundary: string;
}

export interface ProviderWorkspaceAvailabilityView {
  categoryKey: string;
  categoryName: string;
  state: 'available' | 'limited' | 'unavailable' | 'unknown';
  nextAvailableAt: string | null;
  updatedAt: string | null;
}

export interface ProviderWorkspaceTaskView {
  key: string;
  title: string;
  detail: string;
  state: WorkspaceTaskState;
  priority: number;
  action: string | null;
}

export interface ProviderWorkspaceDeferredSurfaceView {
  state: 'empty' | 'synthetic_only' | 'read_only';
  phaseOwner: 'phase8' | 'phase9';
  mutationAllowed: false;
  message: string;
}

export interface ProviderWorkspaceSummary {
  providerId: string;
  representativeRole: ProviderWorkspaceRole;
  provider: {
    pathway: ProviderPathway;
    status: ProviderStatus;
    discoverable: boolean;
    displayName: string;
    operatingModel: OperatingModel;
    localitySummary: string | null;
    serviceAreaSummary: string;
    registeredBusinessName: string | null;
    qualificationSummary: string | null;
    experienceSummary: string | null;
    revision: number;
  };
  categories: ProviderWorkspaceCategoryView[];
  location: ProviderWorkspaceLocationView;
  availability: ProviderWorkspaceAvailabilityView[];
  readiness: {
    profileComplete: boolean;
    selectedCategories: number;
    mandatoryRequirements: number;
    evidenceSubmitted: number;
    openCases: number;
    correctionRequired: number;
    currentClaims: number;
    publicationEligibleCategories: number;
    completionPercent: number;
  };
  tasks: ProviderWorkspaceTaskView[];
  deferredSurfaces: {
    enquiries: ProviderWorkspaceDeferredSurfaceView;
    reviewResponses: ProviderWorkspaceDeferredSurfaceView;
    subscription: ProviderWorkspaceDeferredSurfaceView;
  };
  trustBoundary: string;
  synthetic: true;
}
