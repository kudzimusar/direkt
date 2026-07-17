export type CommercialProductStatus = 'active' | 'retired';
export type CommercialBillingInterval = 'monthly' | 'annual' | 'one_time';
export type CommercialSubscriptionStatus =
  | 'pending'
  | 'active'
  | 'grace'
  | 'past_due'
  | 'cancelled'
  | 'expired';
export type CommercialEntitlementStatus =
  | 'active'
  | 'limited'
  | 'suspended'
  | 'expired'
  | 'revoked';
export type CommercialInvoiceStatus = 'open' | 'paid' | 'void' | 'uncollectible';
export type CommercialPaymentStatus =
  | 'pending'
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'reversed';
export type CommercialReconciliationStatus = 'open' | 'investigating' | 'resolved' | 'closed';
export type CommercialAdjustmentStatus = 'requested' | 'approved' | 'rejected' | 'applied';

export interface CommercialPriceView {
  priceId: string;
  priceKey: string;
  currency: string;
  amountMinor: number;
  billingInterval: CommercialBillingInterval;
  intervalCount: number;
  status: CommercialProductStatus;
  effectiveFrom: string;
  retiredAt: string | null;
}

export interface CommercialEntitlementDefinitionView {
  entitlementKey: string;
  displayName: string;
  description: string;
  limitValue: number | null;
  limitUnit: string | null;
  status: CommercialProductStatus;
}

export interface CommercialProductView {
  productId: string;
  productKey: string;
  name: string;
  description: string;
  status: CommercialProductStatus;
  policyVersion: string;
  prices: CommercialPriceView[];
  entitlements: CommercialEntitlementDefinitionView[];
  verificationIncluded: false;
  publicationIncluded: false;
  rankingIncluded: false;
  synthetic: true;
}

export interface CommercialSubscriptionEventView {
  eventId: string;
  sequence: number;
  fromStatus: CommercialSubscriptionStatus | null;
  toStatus: CommercialSubscriptionStatus;
  actorKind: 'provider' | 'operations' | 'system';
  reason: string;
  policyVersion: string;
  occurredAt: string;
  actorIdentityExposed: false;
  privateMetadataIncluded: false;
}

export interface CommercialEntitlementGrantView {
  entitlementGrantId: string;
  entitlementKey: string;
  displayName: string;
  description: string;
  status: CommercialEntitlementStatus;
  limitValue: number | null;
  limitUnit: string | null;
  effectiveFrom: string;
  effectiveUntil: string | null;
  verificationEffect: false;
  publicationEffect: false;
  rankingEffect: false;
}

export interface CommercialSubscriptionView {
  subscriptionId: string;
  providerId: string;
  productId: string;
  productKey: string;
  productName: string;
  priceId: string;
  priceKey: string;
  currency: string;
  amountMinor: number;
  billingInterval: CommercialBillingInterval;
  status: CommercialSubscriptionStatus;
  revision: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  graceEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  expiredAt: string | null;
  policyVersion: string;
  createdAt: string;
  updatedAt: string;
  entitlements: CommercialEntitlementGrantView[];
  events: CommercialSubscriptionEventView[];
  trustOrRankingMutation: false;
  synthetic: true;
}

export interface CommercialInvoiceLineView {
  invoiceLineId: string;
  lineKey: string;
  description: string;
  quantity: number;
  unitAmountMinor: number;
  lineTotalMinor: number;
}

export interface CommercialInvoiceView {
  invoiceId: string;
  providerId: string;
  subscriptionId: string | null;
  invoiceNumber: string;
  status: CommercialInvoiceStatus;
  revision: number;
  currency: string;
  subtotalMinor: number;
  totalMinor: number;
  issuedAt: string;
  dueAt: string;
  paidAt: string | null;
  voidedAt: string | null;
  uncollectibleAt: string | null;
  policyVersion: string;
  lines: CommercialInvoiceLineView[];
  paymentCredentialIncluded: false;
  customerContactIncluded: false;
  privateEvidenceIncluded: false;
}

export interface CommercialPaymentEventView {
  eventId: string;
  sequence: number;
  fromStatus: CommercialPaymentStatus | null;
  toStatus: CommercialPaymentStatus;
  eventSource: 'provider' | 'operations' | 'synthetic_webhook' | 'system';
  reasonCode: string;
  occurredAt: string;
  rawPayloadIncluded: false;
  credentialIncluded: false;
}

export interface CommercialPaymentActionView {
  mode: 'synthetic' | 'disabled';
  state: 'requires_action' | 'unavailable';
  instruction: string;
  externalDeliveryAttempted: false;
  credentialRequested: false;
  productionMoneyMovement: false;
}

export interface CommercialPaymentIntentView {
  paymentIntentId: string;
  providerId: string;
  invoiceId: string;
  providerKey: 'synthetic';
  externalReference: string;
  status: CommercialPaymentStatus;
  revision: number;
  currency: string;
  amountMinor: number;
  expiresAt: string;
  completedAt: string | null;
  lastErrorCode: string | null;
  policyVersion: string;
  createdAt: string;
  updatedAt: string;
  events: CommercialPaymentEventView[];
  action: CommercialPaymentActionView;
  paymentCredentialIncluded: false;
  customerContactIncluded: false;
  rawWebhookIncluded: false;
  trustOrRankingMutation: false;
  synthetic: true;
}

export interface CommercialReceiptView {
  invoiceId: string;
  providerId: string;
  subscriptionId: string | null;
  invoiceNumber: string;
  currency: string;
  totalMinor: number;
  paidAt: string;
  paymentIntentId: string;
  providerKey: 'synthetic';
  externalReference: string;
  completedAt: string;
  paymentCredentialIncluded: false;
  customerContactIncluded: false;
  trustOrRankingMutation: false;
  synthetic: true;
}

export interface CommercialReconciliationEventView {
  eventId: string;
  sequence: number;
  fromStatus: CommercialReconciliationStatus | null;
  toStatus: CommercialReconciliationStatus;
  reasonCode: string;
  reason: string;
  policyVersion: string;
  occurredAt: string;
  actorIdentityExposed: false;
}

export interface CommercialReconciliationCaseView {
  reconciliationCaseId: string;
  providerId: string;
  invoiceId: string | null;
  paymentIntentId: string | null;
  ledgerTransactionId: string | null;
  mismatchCode: string;
  expectedAmountMinor: number | null;
  observedAmountMinor: number | null;
  currency: string | null;
  status: CommercialReconciliationStatus;
  revision: number;
  resolutionCode: string | null;
  openedAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  events: CommercialReconciliationEventView[];
  rawWebhookIncluded: false;
  privateEvidenceIncluded: false;
  trustOrRankingMutation: false;
}

export interface CommercialAdjustmentApprovalView {
  approvalId: string;
  decision: 'approved' | 'rejected';
  reason: string;
  policyVersion: string;
  decidedAt: string;
  approverIdentityExposed: false;
}

export interface CommercialAdjustmentView {
  adjustmentRequestId: string;
  providerId: string;
  invoiceId: string | null;
  paymentIntentId: string | null;
  adjustmentType: 'credit' | 'debit' | 'synthetic_refund';
  currency: string;
  amountMinor: number;
  status: CommercialAdjustmentStatus;
  revision: number;
  requestReason: string;
  policyVersion: string;
  requestedAt: string;
  updatedAt: string;
  decidedAt: string | null;
  appliedAt: string | null;
  approvals: CommercialAdjustmentApprovalView[];
  productionMoneyMovement: false;
  trustOrRankingMutation: false;
}

export interface ProviderCommercialWorkspaceView {
  providerId: string;
  providerScope: 'actor_resolved';
  products: CommercialProductView[];
  subscriptions: CommercialSubscriptionView[];
  invoices: CommercialInvoiceView[];
  paymentIntents: CommercialPaymentIntentView[];
  receipts: CommercialReceiptView[];
  paymentProviderMode: 'synthetic' | 'disabled';
  credentialStored: false;
  privateInteractionContactIncluded: false;
  privateEvidenceIncluded: false;
  verificationMutation: false;
  publicationMutation: false;
  rankingMutation: false;
  synthetic: true;
}

export interface OperationsCommercialOverviewView {
  products: CommercialProductView[];
  subscriptions: CommercialSubscriptionView[];
  invoices: CommercialInvoiceView[];
  paymentIntents: CommercialPaymentIntentView[];
  reconciliationCases: CommercialReconciliationCaseView[];
  adjustments: CommercialAdjustmentView[];
  rawWebhookIncluded: false;
  paymentCredentialIncluded: false;
  privateInteractionContactIncluded: false;
  trustOrRankingMutation: false;
}

export interface SyntheticWebhookProcessingView {
  webhookReceiptId: string;
  processingOutcome: 'processed' | 'rejected' | 'duplicate';
  signatureVerified: boolean;
  timestampVerified: boolean;
  rejectionCode: string | null;
  paymentIntent: CommercialPaymentIntentView | null;
  rawPayloadStored: false;
  productionMoneyMovement: false;
}
