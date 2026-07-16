export type ReviewModerationStatus = 'pending' | 'published' | 'withheld' | 'removed' | 'appealed';
export type ReviewAppealStatus = 'submitted' | 'upheld' | 'denied';

export interface ProviderReviewResponseView {
  responseId: string;
  body: string;
  createdAt: string;
  providerIdentityExposed: false;
}

export interface ReviewAppealView {
  appealId: string;
  appellantScope: 'customer' | 'provider';
  reason: string;
  status: ReviewAppealStatus;
  createdAt: string;
  decidedAt: string | null;
  decisionReasonCode: string | null;
  decisionReason: string | null;
  actorIdentityExposed: false;
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
  moderationStatus: ReviewModerationStatus;
  revision: number;
  createdAt: string;
  publishedAt: string | null;
  providerResponse: ProviderReviewResponseView | null;
  appeals: ReviewAppealView[];
  reportsCount: number;
  customerIdentityExposed: false;
  contactIncluded: false;
  interactionPrivateDetailIncluded: false;
  internalRationaleIncluded: false;
  trustOrRankingMutation: false;
  synthetic: true;
}

export interface PublicReviewView {
  reviewId: string;
  publicProviderId: string;
  providerDisplayName: string;
  categoryKey: string;
  rating: number;
  title: string;
  body: string;
  publishedAt: string;
  providerResponse: ProviderReviewResponseView | null;
  contactIncluded: false;
  interactionIdentifierIncluded: false;
  moderationRationaleIncluded: false;
  synthetic: true;
}

export interface ProviderReviewListView {
  providerScope: 'actor_resolved';
  items: ReviewView[];
}

export interface OperationsReviewListView {
  items: ReviewView[];
  moderationScope: 'privacy_safe';
}
