import type {
  OperatingModel,
  ProviderCategorySelectionView,
  ProviderPathway,
  ProviderStatus,
} from '../provider-core/provider.types';
import type {
  EvidenceClass,
  EvidenceStatus,
  VerificationCaseStatus,
} from '../verification-evidence/verification-evidence.types';

export type ProviderWorkspaceRole =
  | 'provider_owner'
  | 'provider_member'
  | 'provider_responder';

export type WorkspaceTaskState = 'complete' | 'action_required' | 'blocked' | 'not_started';
export type WorkspaceUploadState =
  | 'queued'
  | 'uploading'
  | 'interrupted'
  | 'retryable'
  | 'submitted'
  | 'terminal_failure'
  | 'cancelled';

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

export interface ProviderWorkspaceUploadIntentView {
  uploadIntentId: string;
  caseId: string;
  categoryKey: string;
  categoryName: string;
  requirementKey: string;
  requirementLabel: string;
  checkKey: string;
  state: WorkspaceUploadState;
  attemptCount: number;
  activeUploadSessionId: string | null;
  submittedEvidenceId: string | null;
  lastErrorCode: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  cancelledAt: string | null;
  safeToRetry: boolean;
  privateObjectKeyExposed: false;
  synthetic: true;
}

export interface ProviderWorkspaceUploadGrantView extends ProviderWorkspaceUploadIntentView {
  upload: {
    uploadSessionId: string;
    uploadUrl: string;
    expiresAt: string;
    requiredHeaders: Record<string, string>;
    synthetic: true;
  };
}

export interface ProviderWorkspaceTimelineEventView {
  eventId: string;
  caseId: string;
  categoryKey: string;
  categoryName: string;
  requirementKey: string;
  requirementLabel: string;
  checkKey: string;
  eventType:
    | 'case_created'
    | 'case_status'
    | 'evidence_submitted'
    | 'evidence_status'
    | 'decision'
    | 'claim_status';
  caseStatus: VerificationCaseStatus;
  evidenceStatus: EvidenceStatus | null;
  evidenceClass: EvidenceClass | null;
  reasonCode: string | null;
  message: string;
  limitation: string | null;
  validUntil: string | null;
  occurredAt: string;
  reviewerIdentityExposed: false;
  privateRationaleExposed: false;
  privateObjectKeyExposed: false;
  synthetic: true;
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
