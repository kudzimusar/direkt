export type EnquiryTiming = 'urgent' | 'within_week' | 'flexible' | 'scheduled';
export type EnquiryPreferredChannel = 'call' | 'whatsapp' | 'none';
export type EnquiryStatus =
  | 'received'
  | 'acknowledged'
  | 'needs_information'
  | 'accepted'
  | 'declined'
  | 'closed'
  | 'cancelled';

export interface EnquiryEventView {
  eventId: string;
  sequence: number;
  eventType: 'created' | 'status_changed';
  fromStatus: EnquiryStatus | null;
  toStatus: EnquiryStatus;
  actorKind: 'customer' | 'provider' | 'system';
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
  preferredChannel: EnquiryPreferredChannel;
  status: EnquiryStatus;
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

export interface ProviderEnquiryListView {
  providerScope: 'actor_resolved';
  items: EnquiryView[];
}
