export const SANDBOX_PAYMENT_PROVIDER_KEYS = [
  'mtn_momo',
  'airtel_money',
  'dpo',
  'stripe',
  'paypal',
] as const;

export type SandboxPaymentProviderKey = (typeof SANDBOX_PAYMENT_PROVIDER_KEYS)[number];

export type SandboxPaymentBusinessFlow =
  'provider_subscription' | 'verification_processing_fee' | 'renewal_reverification_fee';

export type SandboxPaymentProviderReadiness = 'sandbox_proven' | 'pending_provider';

export type SandboxPaymentActionKind = 'mobile_money_prompt' | 'hosted_checkout';

export type SandboxPaymentCompletionKind = 'none' | 'server_capture';

export type SandboxPaymentMethod =
  | {
      kind: 'mobile_money';
      accountReference: string;
      accountReferenceIsSynthetic: boolean;
    }
  | {
      kind: 'hosted_checkout';
    };

export interface SandboxPaymentProviderCapabilities {
  actionKind: SandboxPaymentActionKind;
  completionKind: SandboxPaymentCompletionKind;
  supportsIndependentStatusQuery: true;
  supportsWebhookOrCallback: true;
  supportsRefundOrAdjustment: boolean;
  supportsZmw: boolean;
  supportsInternationalPayer: boolean;
}

export interface SandboxPaymentProviderDescriptor {
  key: SandboxPaymentProviderKey;
  displayName: string;
  readiness: SandboxPaymentProviderReadiness;
  targetEnvironment: 'sandbox';
  capabilities: SandboxPaymentProviderCapabilities;
  secretNames: readonly string[];
  runtimeEnabled: boolean;
  productionMoneyMovement: false;
  customerToProviderPayments: false;
}

export interface SandboxPaymentExecutionBoundary {
  nodeEnvironment: 'development' | 'test' | 'production';
  dataMode: 'synthetic-only' | 'controlled-pilot' | 'production';
  trafficMode: 'disabled' | 'internal' | 'synthetic-public' | 'controlled-pilot';
  businessFlow: SandboxPaymentBusinessFlow;
  realMoneyApproved: boolean;
  participantDataIncluded: boolean;
  credentialSource: 'secret_manager' | 'environment' | 'client';
}

export interface SandboxPaymentInitiationInput {
  paymentIntentId: string;
  externalReference: string;
  currency: string;
  amountMinor: number;
  expiresAt: string;
  businessFlow: SandboxPaymentBusinessFlow;
  paymentMethod: SandboxPaymentMethod;
}

export interface SandboxPaymentInitiationResult {
  providerKey: SandboxPaymentProviderKey;
  providerReference: string;
  status: 'requires_action' | 'processing';
  redirectUrl?: string;
  externalDeliveryAttempted: boolean;
  credentialExposed: false;
  productionMoneyMovement: false;
}

export interface SandboxPaymentStatusInput {
  providerReference: string;
  expectedCurrency: string;
  expectedAmountMinor: number;
}

export interface SandboxPaymentCompletionInput extends SandboxPaymentStatusInput {
  idempotencyKey: string;
}

export interface SandboxPaymentStatusResult {
  providerKey: SandboxPaymentProviderKey;
  providerReference: string;
  status: 'pending' | 'requires_action' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  currency: string;
  amountMinor: number;
  independentlyVerified: boolean;
  providerTransactionId?: string;
  adjustmentStatus?: 'none' | 'partially_refunded' | 'refunded';
  adjustmentAmountMinor?: number;
  rawPayloadIncluded: false;
  credentialIncluded: false;
}

export interface SandboxPaymentProviderPort {
  readonly descriptor: SandboxPaymentProviderDescriptor;

  initiate(
    input: SandboxPaymentInitiationInput,
    boundary: SandboxPaymentExecutionBoundary,
  ): Promise<SandboxPaymentInitiationResult>;

  verifyStatus(
    input: SandboxPaymentStatusInput,
    boundary: SandboxPaymentExecutionBoundary,
  ): Promise<SandboxPaymentStatusResult>;

  completeAction?(
    input: SandboxPaymentCompletionInput,
    boundary: SandboxPaymentExecutionBoundary,
  ): Promise<SandboxPaymentStatusResult>;
}

export class SandboxPaymentBoundaryError extends Error {
  constructor(
    public readonly code:
      | 'SANDBOX_PROVIDER_NOT_PROVEN'
      | 'SANDBOX_RUNTIME_NOT_ENABLED'
      | 'PRODUCTION_ENVIRONMENT_PROHIBITED'
      | 'NON_SYNTHETIC_DATA_PROHIBITED'
      | 'PARTICIPANT_DATA_PROHIBITED'
      | 'REAL_MONEY_PROHIBITED'
      | 'SECRET_MANAGER_REQUIRED'
      | 'UNAUTHORIZED_PAYMENT_FLOW'
      | 'SYNTHETIC_PAYMENT_METHOD_REQUIRED',
    message: string,
  ) {
    super(message);
    this.name = 'SandboxPaymentBoundaryError';
  }
}

export class SandboxPaymentProviderUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SandboxPaymentProviderUnavailableError';
  }
}

export class SandboxPaymentProviderRejectedError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'SandboxPaymentProviderRejectedError';
  }
}

export class SandboxPaymentVerificationMismatchError extends Error {
  constructor(
    public readonly code: 'AMOUNT_MISMATCH' | 'CURRENCY_MISMATCH' | 'MALFORMED_STATUS',
    message: string,
  ) {
    super(message);
    this.name = 'SandboxPaymentVerificationMismatchError';
  }
}

export function assertSandboxPaymentBoundary(
  descriptor: SandboxPaymentProviderDescriptor,
  boundary: SandboxPaymentExecutionBoundary,
): void {
  if (descriptor.readiness !== 'sandbox_proven') {
    throw new SandboxPaymentBoundaryError(
      'SANDBOX_PROVIDER_NOT_PROVEN',
      `${descriptor.displayName} is not approved for DIREKT sandbox execution.`,
    );
  }
  if (boundary.nodeEnvironment === 'production') {
    throw new SandboxPaymentBoundaryError(
      'PRODUCTION_ENVIRONMENT_PROHIBITED',
      'RC8 payment adapters cannot execute in the production environment.',
    );
  }
  if (boundary.dataMode !== 'synthetic-only') {
    throw new SandboxPaymentBoundaryError(
      'NON_SYNTHETIC_DATA_PROHIBITED',
      'RC8 payment adapters accept synthetic-only data.',
    );
  }
  if (boundary.participantDataIncluded) {
    throw new SandboxPaymentBoundaryError(
      'PARTICIPANT_DATA_PROHIBITED',
      'Participant data is prohibited from RC8 sandbox payment execution.',
    );
  }
  if (boundary.realMoneyApproved) {
    throw new SandboxPaymentBoundaryError(
      'REAL_MONEY_PROHIBITED',
      'RC8 does not authorize real money movement.',
    );
  }
  if (boundary.credentialSource !== 'secret_manager') {
    throw new SandboxPaymentBoundaryError(
      'SECRET_MANAGER_REQUIRED',
      'Payment provider credentials must remain server-side in Secret Manager.',
    );
  }
  if (
    ![
      'provider_subscription',
      'verification_processing_fee',
      'renewal_reverification_fee',
    ].includes(boundary.businessFlow)
  ) {
    throw new SandboxPaymentBoundaryError(
      'UNAUTHORIZED_PAYMENT_FLOW',
      'Customer-to-provider service payments and escrow are outside RC8 scope.',
    );
  }
  if (!descriptor.runtimeEnabled) {
    throw new SandboxPaymentBoundaryError(
      'SANDBOX_RUNTIME_NOT_ENABLED',
      `${descriptor.displayName} is source-registered but runtime activation remains fail-closed.`,
    );
  }
}
