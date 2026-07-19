export type EnquiryTiming = "urgent" | "within_week" | "flexible" | "scheduled";
export type PreferredChannel = "call" | "whatsapp" | "none";

export interface SavedProviderView {
  publicProviderId: string;
  displayName: string;
  categoryName: string;
  locality: string;
  savedAt: string;
  sharePath: string;
  synthetic: true;
}

export interface EnquiryEventView {
  eventId: string;
  sequence: number;
  eventType: "created" | "status_changed";
  fromStatus: EnquiryView["status"] | null;
  toStatus: EnquiryView["status"];
  actorKind: "customer" | "provider" | "system";
  reason: string;
  policyVersion: string;
  occurredAt: string;
  actorIdentityExposed: false;
}

export interface EnquiryView {
  enquiryId: string;
  publicProviderId: string;
  providerDisplayName: string;
  categoryKey: string;
  categoryName: string;
  serviceSummary: string;
  timing: EnquiryTiming;
  requestedFor: string | null;
  localitySummary: string;
  preferredChannel: PreferredChannel;
  status:
    | "received"
    | "acknowledged"
    | "needs_information"
    | "accepted"
    | "declined"
    | "closed"
    | "cancelled";
  revision: number;
  createdAt: string;
  updatedAt: string;
  terminalAt: string | null;
  events: EnquiryEventView[];
  fullChatEnabled: false;
  privateContactIncluded: false;
  privateEvidenceIncluded: false;
  internalIdentifiersIncluded: false;
  synthetic: true;
}

export interface ContactHandoffView {
  handoffId: string;
  interactionId: string;
  enquiryId: string;
  channel: "call" | "whatsapp";
  contactDisplayHint: string;
  status: "active" | "expired" | "revoked";
  consentedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  policyVersion: string;
  deliveryState: "disabled";
  externalDeliveryAttempted: false;
  rawContactIncluded: false;
  synthetic: true;
}

export interface ReviewEligibilityView {
  eligible: boolean;
  reasonCode:
    | "INTERACTION_ACTIVE"
    | "INTERACTION_CANCELLED"
    | "WINDOW_NOT_OPEN"
    | "WINDOW_EXPIRED"
    | "ALREADY_REVIEWED"
    | "ELIGIBLE";
  eligibleFrom: string | null;
  eligibleUntil: string | null;
}

export interface InteractionEventView {
  eventId: string;
  sequence: number;
  eventType:
    | "accepted"
    | "handoff_created"
    | "handoff_revoked"
    | "completed"
    | "cancelled"
    | "review_submitted"
    | "provider_response_submitted"
    | "review_moderated"
    | "appeal_submitted"
    | "appeal_decided"
    | "complaint_submitted"
    | "complaint_linked";
  actorKind: "customer" | "provider" | "operations" | "system";
  reason: string;
  policyVersion: string;
  occurredAt: string;
  actorIdentityExposed: false;
  privateMetadataIncluded: false;
}

export interface InteractionView {
  interactionId: string;
  enquiryId: string;
  publicProviderId: string;
  providerDisplayName: string;
  categoryKey: string;
  categoryName: string;
  status: "active" | "completed" | "cancelled";
  revision: number;
  startedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  reviewEligibility: ReviewEligibilityView;
  handoffs: ContactHandoffView[];
  events: InteractionEventView[];
  customerContactIncluded: false;
  privateEvidenceIncluded: false;
  internalModerationIncluded: false;
  synthetic: true;
}

export interface ReviewView {
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
  providerResponse: {
    responseId: string;
    body: string;
    createdAt: string;
    providerIdentityExposed: false;
  } | null;
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

export interface ComplaintView {
  complaintId: string;
  interactionId: string;
  publicProviderId: string;
  providerDisplayName: string;
  categoryKey: string;
  complaintType: "service_quality" | "contact_privacy" | "provider_conduct" | "other";
  summary: string;
  status: "submitted" | "triaged" | "resolved" | "closed";
  revision: number;
  createdAt: string;
  updatedAt: string;
  terminalAt: string | null;
  events: Array<{
    eventId: string;
    sequence: number;
    fromStatus: "submitted" | "triaged" | "resolved" | "closed" | null;
    toStatus: "submitted" | "triaged" | "resolved" | "closed";
    actorKind: "customer" | "operations";
    reason: string;
    policyVersion: string;
    occurredAt: string;
    actorIdentityExposed: false;
  }>;
  phase7IncidentLinked: false;
  contactIncluded: false;
  privateInteractionDetailIncluded: false;
  actorIdentityExposed: false;
  trustOrRankingMutation: false;
  synthetic: true;
}

export interface AccountContactReference {
  id: string;
  channel: "email" | "phone";
  displayHint: string;
  verified: boolean;
  verifiedAt: string | null;
}

export interface CustomerJourneyState {
  authenticated: true;
  contacts: AccountContactReference[];
  savedProviders: SavedProviderView[];
  enquiries: EnquiryView[];
  interactions: InteractionView[];
  reviews: ReviewView[];
  complaints: ComplaintView[];
}
