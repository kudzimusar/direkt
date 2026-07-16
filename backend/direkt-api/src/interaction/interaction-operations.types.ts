export interface OperationsInteractionView {
  interactionId: string;
  enquiryId: string;
  publicProviderId: string;
  providerDisplayName: string;
  categoryKey: string;
  categoryName: string;
  status: 'active' | 'completed' | 'cancelled';
  revision: number;
  startedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  reviewEligibleFrom: string | null;
  reviewEligibleUntil: string | null;
  reviewModerationStatus: 'pending' | 'published' | 'withheld' | 'removed' | 'appealed' | null;
  eventCount: number;
  handoffCount: number;
  complaintCount: number;
  lastEventType: string | null;
  lastEventAt: string | null;
  customerIdentityExposed: false;
  contactIncluded: false;
  privateEvidenceIncluded: false;
  internalModerationRationaleIncluded: false;
  trustOrRankingMutation: false;
  synthetic: true;
}

export interface OperationsInteractionListView {
  items: OperationsInteractionView[];
  interactionScope: 'privacy_safe';
}
