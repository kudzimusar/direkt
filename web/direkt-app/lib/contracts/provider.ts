export type ProviderWorkspaceRole = "provider_owner" | "provider_member" | "provider_responder";
export type WorkspaceTaskState = "complete" | "action_required" | "blocked" | "not_started";
export type WorkspaceUploadState =
  | "queued"
  | "uploading"
  | "interrupted"
  | "retryable"
  | "submitted"
  | "terminal_failure"
  | "cancelled";
export type EnquiryStatus =
  | "received"
  | "acknowledged"
  | "needs_information"
  | "accepted"
  | "declined"
  | "closed"
  | "cancelled";

export interface ProviderWorkspaceCategoryView {
  categoryKey: string;
  categoryName: string;
  requirementVersionId: string;
  requirementVersion: number;
  requiredRequirements: number;
  evidenceSubmitted: number;
  openCases: number;
  correctionRequired: number;
  currentClaims: number;
  publicationEligible: boolean;
}

export interface ProviderWorkspaceSummary {
  providerId: string;
  representativeRole: ProviderWorkspaceRole;
  provider: {
    pathway: "registered_business" | "qualified_individual" | "experienced_informal";
    status: string;
    discoverable: boolean;
    displayName: string;
    operatingModel: "fixed_premises" | "mobile" | "hybrid";
    localitySummary: string | null;
    serviceAreaSummary: string;
    registeredBusinessName: string | null;
    qualificationSummary: string | null;
    experienceSummary: string | null;
    revision: number;
  };
  categories: ProviderWorkspaceCategoryView[];
  location: {
    configured: boolean;
    privateBaseStored: boolean;
    publicPremisesConfigured: boolean;
    publicPremisesConsent: boolean;
    publicLocality: string | null;
    serviceAreaConfigured: boolean;
    privacyBoundary: string;
  };
  availability: Array<{
    categoryKey: string;
    categoryName: string;
    state: "available" | "limited" | "unavailable" | "unknown";
    nextAvailableAt: string | null;
    updatedAt: string | null;
  }>;
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
  tasks: Array<{
    key: string;
    title: string;
    detail: string;
    state: WorkspaceTaskState;
    priority: number;
    action: string | null;
  }>;
  trustBoundary: string;
  synthetic: true;
}

export interface ProviderTimelineEvent {
  eventId: string;
  caseId: string;
  categoryKey: string;
  categoryName: string;
  requirementKey: string;
  requirementLabel: string;
  checkKey: string;
  eventType: "case_created" | "case_status" | "evidence_submitted" | "evidence_status" | "decision" | "claim_status";
  caseStatus: string;
  evidenceStatus: string | null;
  evidenceClass: string | null;
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

export interface ProviderUploadIntent {
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

export interface ProviderUploadGrant extends ProviderUploadIntent {
  upload: {
    uploadSessionId: string;
    uploadUrl: string;
    expiresAt: string;
    requiredHeaders: Record<string, string>;
    synthetic: boolean;
  };
}

export interface ProviderEnquiry {
  enquiryId: string;
  publicProviderId: string;
  providerDisplayName: string;
  categoryKey: string;
  categoryName: string;
  serviceSummary: string;
  timing: "urgent" | "within_week" | "flexible" | "scheduled";
  requestedFor: string | null;
  localitySummary: string;
  preferredChannel: "call" | "whatsapp" | "none";
  status: EnquiryStatus;
  revision: number;
  createdAt: string;
  updatedAt: string;
  terminalAt: string | null;
  events: Array<{
    eventId: string;
    sequence: number;
    eventType: "created" | "status_changed";
    fromStatus: EnquiryStatus | null;
    toStatus: EnquiryStatus;
    actorKind: "customer" | "provider" | "system";
    reason: string;
    policyVersion: string;
    occurredAt: string;
    actorIdentityExposed: false;
  }>;
  fullChatEnabled: false;
  privateContactIncluded: false;
  privateEvidenceIncluded: false;
  internalIdentifiersIncluded: false;
  synthetic: true;
}

export interface ProviderEnquiryListView {
  providerScope: "actor_resolved";
  items: ProviderEnquiry[];
}

export interface ProviderReview {
  reviewId: string;
  interactionId: string;
  publicProviderId: string;
  providerDisplayName: string;
  categoryKey: string;
  categoryName: string;
  rating: number;
  title: string;
  body: string;
  moderationStatus: "pending" | "published" | "withheld" | "removed" | "appealed";
  revision: number;
  createdAt: string;
  publishedAt: string | null;
  providerResponse: { responseId: string; body: string; createdAt: string; providerIdentityExposed: false } | null;
  appeals: Array<{
    appealId: string;
    appellantScope: "customer" | "provider";
    reason: string;
    status: "submitted" | "upheld" | "denied";
    createdAt: string;
    decidedAt: string | null;
    decisionReasonCode: string | null;
    decisionReason: string | null;
    actorIdentityExposed: false;
  }>;
  reportsCount: number;
  customerIdentityExposed: false;
  contactIncluded: false;
  interactionPrivateDetailIncluded: false;
  internalRationaleIncluded: false;
  trustOrRankingMutation: false;
  synthetic: true;
}

export interface ProviderReviewListView {
  providerScope: "actor_resolved";
  items: ProviderReview[];
}

export interface ProviderCommercialWorkspace {
  providerId: string;
  providerScope: "actor_resolved";
  products: Array<Record<string, unknown>>;
  subscriptions: Array<Record<string, unknown>>;
  invoices: Array<Record<string, unknown>>;
  paymentIntents: Array<Record<string, unknown>>;
  receipts: Array<Record<string, unknown>>;
  paymentProviderMode: "synthetic" | "disabled";
  credentialStored: false;
  privateInteractionContactIncluded: false;
  privateEvidenceIncluded: false;
  verificationMutation: false;
  publicationMutation: false;
  rankingMutation: false;
  synthetic: true;
}

export interface ProviderStateResponse {
  workspace: ProviderWorkspaceSummary;
  timeline: ProviderTimelineEvent[];
  uploads: ProviderUploadIntent[];
  enquiries: ProviderEnquiryListView;
  reviews: ProviderReviewListView;
  commercial: ProviderCommercialWorkspace;
}
