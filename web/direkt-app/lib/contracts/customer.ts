export type EnquiryTiming = "urgent" | "today" | "within_week" | "flexible";
export type PreferredChannel = "call" | "whatsapp";

export interface SavedProviderView {
  publicProviderId: string;
  displayName: string;
  categoryName: string;
  locality: string;
  savedAt: string;
  sharePath: string;
  synthetic: true;
}

export interface EnquiryView {
  enquiryId: string;
  publicProviderId: string;
  providerPublicId: string;
  providerDisplayName: string;
  categoryKey: string;
  categoryName: string;
  serviceSummary: string;
  timing: EnquiryTiming;
  localitySummary: string;
  preferredChannel: PreferredChannel;
  status: "received" | "accepted" | "declined" | "closed" | "cancelled";
  revision: number;
  createdAt: string;
  respondedAt: string | null;
  closedAt: string | null;
  updatedAt: string;
  policyVersion: string;
  rawContactIncluded: false;
  chatIncluded: false;
  attachmentIncluded: false;
  privateEvidenceIncluded: false;
}

export interface ContactHandoffView {
  handoffId: string;
  enquiryId: string;
  interactionId: string;
  channel: PreferredChannel;
  contactDisplayHint: string;
  status: "active" | "revoked" | "expired";
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  rawContactIncluded: false;
  externalDeliveryAttempted: false;
}

export interface ReviewEligibilityView {
  eligible: boolean;
  reasonCode: string;
  evaluatedAt: string;
}

export interface InteractionEventView {
  sequence: number;
  eventType: string;
  occurredAt: string;
  summary: string;
}

export interface InteractionView {
  interactionId: string;
  enquiryId: string;
  publicProviderId: string;
  providerDisplayName: string;
  categoryKey: string;
  categoryName: string;
  status: "active" | "closed" | "cancelled";
  openedAt: string;
  closedAt: string | null;
  revision: number;
  reviewEligibility: ReviewEligibilityView;
  handoffs: ContactHandoffView[];
  events: InteractionEventView[];
  rawContactIncluded: false;
  chatIncluded: false;
  attachmentIncluded: false;
  privateEvidenceIncluded: false;
}

export interface ReviewView {
  reviewId: string;
  interactionId: string;
  enquiryId: string;
  publicProviderId: string;
  providerDisplayName: string;
  rating: number;
  title: string;
  body: string;
  moderationStatus: "pending" | "published" | "hidden" | "removed";
  revision: number;
  createdAt: string;
  updatedAt: string;
  providerResponse: { body: string; createdAt: string; updatedAt: string } | null;
  appeals: Array<{ appealId: string; status: string; reasonCode: string; statement: string; createdAt: string }>;
  reportsCount: number;
}

export interface ComplaintView {
  complaintId: string;
  interactionId: string;
  enquiryId: string;
  publicProviderId: string;
  providerDisplayName: string;
  submittedByRole: "customer" | "provider";
  category: "safety" | "conduct" | "service_dispute" | "privacy" | "other";
  summary: string;
  status: "open" | "triaged" | "awaiting_information" | "resolved" | "dismissed";
  revision: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
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
