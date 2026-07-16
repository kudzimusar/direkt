export type ContactHandoffChannel = 'call' | 'whatsapp';
export type EffectiveContactHandoffStatus = 'active' | 'expired' | 'revoked';
export type TrackedInteractionStatus = 'active' | 'completed' | 'cancelled';

export interface ContactHandoffView {
  handoffId: string;
  interactionId: string;
  enquiryId: string;
  channel: ContactHandoffChannel;
  contactDisplayHint: string;
  status: EffectiveContactHandoffStatus;
  consentedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  policyVersion: string;
  deliveryState: 'disabled';
  externalDeliveryAttempted: false;
  rawContactIncluded: false;
  synthetic: true;
}

export interface TrackedInteractionEventView {
  eventId: string;
  sequence: number;
  eventType:
    | 'accepted'
    | 'handoff_created'
    | 'handoff_revoked'
    | 'completed'
    | 'cancelled'
    | 'review_submitted'
    | 'provider_response_submitted'
    | 'review_moderated'
    | 'appeal_submitted'
    | 'appeal_decided'
    | 'complaint_submitted'
    | 'complaint_linked';
  actorKind: 'customer' | 'provider' | 'operations' | 'system';
  reason: string;
  policyVersion: string;
  occurredAt: string;
  actorIdentityExposed: false;
  privateMetadataIncluded: false;
}

export interface ReviewEligibilityView {
  eligible: boolean;
  reasonCode:
    | 'INTERACTION_ACTIVE'
    | 'INTERACTION_CANCELLED'
    | 'WINDOW_NOT_OPEN'
    | 'WINDOW_EXPIRED'
    | 'ALREADY_REVIEWED'
    | 'ELIGIBLE';
  eligibleFrom: string | null;
  eligibleUntil: string | null;
}

export interface TrackedInteractionView {
  interactionId: string;
  enquiryId: string;
  publicProviderId: string;
  providerDisplayName: string;
  categoryKey: string;
  categoryName: string;
  status: TrackedInteractionStatus;
  revision: number;
  startedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  reviewEligibility: ReviewEligibilityView;
  handoffs: ContactHandoffView[];
  events: TrackedInteractionEventView[];
  customerContactIncluded: false;
  privateEvidenceIncluded: false;
  internalModerationIncluded: false;
  synthetic: true;
}

export interface ProviderInteractionListView {
  providerScope: 'actor_resolved';
  items: TrackedInteractionView[];
}
