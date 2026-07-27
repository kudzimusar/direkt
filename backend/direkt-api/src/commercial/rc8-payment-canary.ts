import { randomUUID } from 'node:crypto';
import { MtnMomoSandboxPaymentProviderAdapter } from './mtn-momo-sandbox-payment-provider.adapter';
import { PayPalSandboxPaymentProviderAdapter } from './paypal-sandbox-payment-provider.adapter';
import {
  SandboxPaymentProviderRejectedError,
  type SandboxPaymentBusinessFlow,
  type SandboxPaymentExecutionBoundary,
  type SandboxPaymentProviderDescriptor,
  type SandboxPaymentStatusResult,
} from './sandbox-payment-provider.port';
import { sandboxPaymentProviderDescriptor } from './sandbox-payment-provider.registry';
import {
  reconcileSandboxPaymentObservation,
  type SandboxPaymentReconciliationInput,
} from './sandbox-payment-reconciliation';
import { StripeSandboxPaymentProviderAdapter } from './stripe-sandbox-payment-provider.adapter';

const AMOUNT_MINOR = 100;
const MTN_CURRENCY = 'EUR';
const INTERNATIONAL_CURRENCY = 'USD';
const STRIPE_API_VERSION = '2025-06-30.basil';
const POLICY_VERSION = 'rc8-managed-v1';

interface Rc8PaymentCanaryReceipt {
  schema: 'direkt.rc8.payments-canary.v1';
  environment: 'sandbox';
  runtimeSurface: 'private_cloud_run_job';
  mtn: {
    initiationStatus: 'processing';
    verificationStatus: 'succeeded';
    independentlyVerified: true;
    transactionIdPresent: true;
    amountMatched: true;
    currencyMatched: true;
  };
  stripe: {
    initiationStatus: 'requires_action';
    verificationStatus: 'requires_action';
    independentlyVerified: true;
    paymentIntentPresent: false;
    browserRedirectCreatesTruth: false;
  };
  paypal: {
    initiationStatus: 'requires_action';
    verificationStatus: 'requires_action';
    independentlyVerified: true;
    captureAttempted: false;
    browserApprovalCreatesTruth: false;
  };
  reconciliation: {
    successfulOutcome: 'transition_planned';
    balancedLedgerPosting: true;
    duplicateOutcome: 'duplicate';
    mismatchOutcome: 'reconciliation_required';
    mismatchCode: 'PROVIDER_AMOUNT_MISMATCH';
    adjustmentOutcome: 'adjustment_required';
    requiresTwoIndependentApprovers: true;
    requesterMayApprove: false;
    historicalPaymentRewritten: false;
    historicalLedgerRewritten: false;
    trustOrRankingMutation: false;
  };
  dpoRuntimeBound: false;
  airtelRuntimeBound: false;
  flutterwaveIncluded: false;
  credentialIncluded: false;
  rawProviderPayloadIncluded: false;
  participantDataIncluded: false;
  productionAuthorization: false;
  realMoneyApproved: false;
  customerToProviderPayments: false;
}

function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`RC8 managed canary requires ${name}.`);
  }
  return value;
}

function approvedDescriptor(
  key: 'mtn_momo' | 'stripe' | 'paypal',
): SandboxPaymentProviderDescriptor {
  const descriptor = sandboxPaymentProviderDescriptor(key);
  return Object.freeze({ ...descriptor, runtimeEnabled: true });
}

function boundary(businessFlow: SandboxPaymentBusinessFlow): SandboxPaymentExecutionBoundary {
  return {
    nodeEnvironment: 'test',
    dataMode: 'synthetic-only',
    trafficMode: 'internal',
    businessFlow,
    realMoneyApproved: false,
    participantDataIncluded: false,
    credentialSource: 'secret_manager',
  };
}

function externalReference(provider: string): string {
  const runId = requireEnvironment('RC8_CANARY_RUN_ID')
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(-20);
  if (!runId) {
    throw new Error('RC8 managed canary run id is malformed.');
  }
  return `RC8-${provider}-${runId}`;
}

function expiresAt(): string {
  return new Date(Date.now() + 15 * 60 * 1000).toISOString();
}

async function verifyMtnStatus(
  adapter: MtnMomoSandboxPaymentProviderAdapter,
  providerReference: string,
): Promise<SandboxPaymentStatusResult> {
  const statusBoundary = boundary('provider_subscription');
  for (let attempt = 0; attempt < 36; attempt += 1) {
    try {
      const status = await adapter.verifyStatus(
        {
          providerReference,
          expectedCurrency: MTN_CURRENCY,
          expectedAmountMinor: AMOUNT_MINOR,
        },
        statusBoundary,
      );
      if (status.status === 'succeeded') {
        return status;
      }
      if (status.status === 'failed' || status.status === 'cancelled') {
        throw new Error(`MTN sandbox payment reached terminal status ${status.status}.`);
      }
    } catch (error: unknown) {
      if (!(error instanceof SandboxPaymentProviderRejectedError && error.status === 404)) {
        throw error;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error('MTN sandbox payment did not reach independently verified success in time.');
}

function reconciliationInput(
  result: SandboxPaymentStatusResult,
  overrides: {
    paymentStatus?: 'pending' | 'succeeded';
    invoiceStatus?: 'open' | 'paid';
    ledgerReceivedMinor?: number;
    observedAmountMinor?: number;
    adjustmentStatus?: 'none' | 'partially_refunded' | 'refunded';
    adjustmentAmountMinor?: number;
    priorFingerprints?: readonly string[];
  } = {},
): SandboxPaymentReconciliationInput {
  const paymentIntentId = '11111111-1111-4111-8111-111111111111';
  const providerId = '22222222-2222-4222-8222-222222222222';
  const invoiceId = '33333333-3333-4333-8333-333333333333';
  return {
    paymentIntent: {
      paymentIntentId,
      providerId,
      invoiceId,
      providerKey: result.providerKey,
      providerReference: result.providerReference,
      status: overrides.paymentStatus ?? 'pending',
      revision: 1,
      currency: result.currency,
      amountMinor: result.amountMinor,
    },
    invoice: {
      invoiceId,
      providerId,
      status: overrides.invoiceStatus ?? 'open',
      currency: result.currency,
      totalMinor: result.amountMinor,
    },
    ledger: {
      receivedMinor: overrides.ledgerReceivedMinor ?? 0,
      reversedMinor: 0,
      refundedMinor: 0,
      adjustmentMinor: 0,
    },
    observation: {
      observationId: `RC8-OBS-${randomUUID()}`,
      occurredAt: new Date().toISOString(),
      result: {
        ...result,
        amountMinor: overrides.observedAmountMinor ?? result.amountMinor,
        adjustmentStatus: overrides.adjustmentStatus ?? result.adjustmentStatus ?? 'none',
        ...(overrides.adjustmentAmountMinor === undefined
          ? {}
          : { adjustmentAmountMinor: overrides.adjustmentAmountMinor }),
      },
    },
    priorObservationFingerprints: overrides.priorFingerprints ?? [],
    policyVersion: POLICY_VERSION,
  };
}

function proveReconciliation(
  result: SandboxPaymentStatusResult,
): Rc8PaymentCanaryReceipt['reconciliation'] {
  const successful = reconcileSandboxPaymentObservation(reconciliationInput(result));
  if (
    successful.outcome !== 'transition_planned' ||
    successful.ledgerPosting?.balanced !== true ||
    successful.trustOrRankingMutation ||
    successful.historicalPaymentRewritten ||
    successful.historicalLedgerRewritten
  ) {
    throw new Error('RC8 successful reconciliation plan violated the immutable ledger contract.');
  }

  const duplicate = reconcileSandboxPaymentObservation(
    reconciliationInput(result, {
      priorFingerprints: [successful.observationEvent.observationFingerprint],
    }),
  );
  if (duplicate.outcome !== 'duplicate') {
    throw new Error('RC8 duplicate provider observation was not deduplicated.');
  }

  const mismatch = reconcileSandboxPaymentObservation(
    reconciliationInput(result, { observedAmountMinor: result.amountMinor + 1 }),
  );
  if (
    mismatch.outcome !== 'reconciliation_required' ||
    mismatch.reconciliationCase?.mismatchCode !== 'PROVIDER_AMOUNT_MISMATCH'
  ) {
    throw new Error('RC8 provider mismatch did not open the expected reconciliation case.');
  }

  const adjustment = reconcileSandboxPaymentObservation(
    reconciliationInput(result, {
      paymentStatus: 'succeeded',
      invoiceStatus: 'paid',
      ledgerReceivedMinor: result.amountMinor,
      adjustmentStatus: 'partially_refunded',
      adjustmentAmountMinor: 25,
    }),
  );
  if (
    adjustment.outcome !== 'adjustment_required' ||
    adjustment.adjustmentRequest?.requiresTwoIndependentApprovers !== true ||
    adjustment.adjustmentRequest.requesterMayApprove ||
    adjustment.adjustmentRequest.directLedgerMutation
  ) {
    throw new Error('RC8 refund observation bypassed immutable two-person adjustment review.');
  }

  return {
    successfulOutcome: 'transition_planned',
    balancedLedgerPosting: true,
    duplicateOutcome: 'duplicate',
    mismatchOutcome: 'reconciliation_required',
    mismatchCode: 'PROVIDER_AMOUNT_MISMATCH',
    adjustmentOutcome: 'adjustment_required',
    requiresTwoIndependentApprovers: true,
    requesterMayApprove: false,
    historicalPaymentRewritten: false,
    historicalLedgerRewritten: false,
    trustOrRankingMutation: false,
  };
}

async function main(): Promise<void> {
  if (
    process.env.RC8_PAYMENT_CANARY_APPROVED !== 'true' ||
    process.env.NODE_ENV !== 'test' ||
    process.env.DIREKT_DATA_MODE !== 'synthetic-only' ||
    process.env.DIREKT_TRAFFIC_MODE !== 'internal' ||
    process.env.PAYMENT_PROVIDER_MODE !== 'disabled'
  ) {
    throw new Error('RC8 managed canary requires the approved private synthetic-only boundary.');
  }

  const mtn = new MtnMomoSandboxPaymentProviderAdapter(
    approvedDescriptor('mtn_momo'),
    {
      collectionSubscriptionKey: requireEnvironment('RC8_MTN_COLLECTION_SUBSCRIPTION_KEY'),
      apiUser: requireEnvironment('RC8_MTN_API_USER'),
      apiKey: requireEnvironment('RC8_MTN_API_KEY'),
    },
    {
      baseUrl: 'https://sandbox.momodeveloper.mtn.com',
      targetEnvironment: 'sandbox',
      timeoutMs: 10000,
    },
  );
  const mtnIntentId = randomUUID();
  const mtnInitiation = await mtn.initiate(
    {
      paymentIntentId: mtnIntentId,
      externalReference: externalReference('MTN'),
      currency: MTN_CURRENCY,
      amountMinor: AMOUNT_MINOR,
      expiresAt: expiresAt(),
      businessFlow: 'provider_subscription',
      paymentMethod: {
        kind: 'mobile_money',
        accountReference: requireEnvironment('RC8_MTN_SYNTHETIC_MSISDN'),
        accountReferenceIsSynthetic: true,
      },
    },
    boundary('provider_subscription'),
  );
  const mtnStatus = await verifyMtnStatus(mtn, mtnInitiation.providerReference);
  if (
    mtnInitiation.status !== 'processing' ||
    mtnStatus.status !== 'succeeded' ||
    !mtnStatus.independentlyVerified ||
    !mtnStatus.providerTransactionId
  ) {
    throw new Error('MTN managed sandbox proof did not reach authoritative success.');
  }

  const stripe = new StripeSandboxPaymentProviderAdapter(
    approvedDescriptor('stripe'),
    { secretKey: requireEnvironment('RC8_STRIPE_SECRET_KEY') },
    {
      baseUrl: 'https://api.stripe.com',
      apiVersion: STRIPE_API_VERSION,
      successUrl: requireEnvironment('RC8_STRIPE_SUCCESS_URL'),
      cancelUrl: requireEnvironment('RC8_STRIPE_CANCEL_URL'),
      timeoutMs: 10000,
    },
  );
  const stripeIntentId = randomUUID();
  const stripeInitiation = await stripe.initiate(
    {
      paymentIntentId: stripeIntentId,
      externalReference: externalReference('STRIPE'),
      currency: INTERNATIONAL_CURRENCY,
      amountMinor: AMOUNT_MINOR,
      expiresAt: expiresAt(),
      businessFlow: 'verification_processing_fee',
      paymentMethod: { kind: 'hosted_checkout' },
    },
    boundary('verification_processing_fee'),
  );
  const stripeStatus = await stripe.verifyStatus(
    {
      providerReference: stripeInitiation.providerReference,
      expectedCurrency: INTERNATIONAL_CURRENCY,
      expectedAmountMinor: AMOUNT_MINOR,
    },
    boundary('verification_processing_fee'),
  );
  if (
    stripeInitiation.status !== 'requires_action' ||
    stripeStatus.status !== 'requires_action' ||
    !stripeStatus.independentlyVerified ||
    stripeStatus.providerTransactionId
  ) {
    throw new Error(
      'Stripe managed sandbox proof incorrectly treated an unpaid Checkout as success.',
    );
  }

  const paypal = new PayPalSandboxPaymentProviderAdapter(
    approvedDescriptor('paypal'),
    {
      clientId: requireEnvironment('RC8_PAYPAL_CLIENT_ID'),
      clientSecret: requireEnvironment('RC8_PAYPAL_CLIENT_SECRET'),
    },
    {
      baseUrl: 'https://api-m.sandbox.paypal.com',
      returnUrl: requireEnvironment('RC8_PAYPAL_RETURN_URL'),
      cancelUrl: requireEnvironment('RC8_PAYPAL_CANCEL_URL'),
      timeoutMs: 10000,
    },
  );
  const paypalIntentId = randomUUID();
  const paypalInitiation = await paypal.initiate(
    {
      paymentIntentId: paypalIntentId,
      externalReference: externalReference('PAYPAL'),
      currency: INTERNATIONAL_CURRENCY,
      amountMinor: AMOUNT_MINOR,
      expiresAt: expiresAt(),
      businessFlow: 'renewal_reverification_fee',
      paymentMethod: { kind: 'hosted_checkout' },
    },
    boundary('renewal_reverification_fee'),
  );
  const paypalStatus = await paypal.verifyStatus(
    {
      providerReference: paypalInitiation.providerReference,
      expectedCurrency: INTERNATIONAL_CURRENCY,
      expectedAmountMinor: AMOUNT_MINOR,
    },
    boundary('renewal_reverification_fee'),
  );
  if (
    paypalInitiation.status !== 'requires_action' ||
    paypalStatus.status !== 'requires_action' ||
    !paypalStatus.independentlyVerified ||
    paypalStatus.providerTransactionId
  ) {
    throw new Error(
      'PayPal managed sandbox proof incorrectly treated an unapproved order as success.',
    );
  }

  const receipt: Rc8PaymentCanaryReceipt = {
    schema: 'direkt.rc8.payments-canary.v1',
    environment: 'sandbox',
    runtimeSurface: 'private_cloud_run_job',
    mtn: {
      initiationStatus: 'processing',
      verificationStatus: 'succeeded',
      independentlyVerified: true,
      transactionIdPresent: true,
      amountMatched: true,
      currencyMatched: true,
    },
    stripe: {
      initiationStatus: 'requires_action',
      verificationStatus: 'requires_action',
      independentlyVerified: true,
      paymentIntentPresent: false,
      browserRedirectCreatesTruth: false,
    },
    paypal: {
      initiationStatus: 'requires_action',
      verificationStatus: 'requires_action',
      independentlyVerified: true,
      captureAttempted: false,
      browserApprovalCreatesTruth: false,
    },
    reconciliation: proveReconciliation(mtnStatus),
    dpoRuntimeBound: false,
    airtelRuntimeBound: false,
    flutterwaveIncluded: false,
    credentialIncluded: false,
    rawProviderPayloadIncluded: false,
    participantDataIncluded: false,
    productionAuthorization: false,
    realMoneyApproved: false,
    customerToProviderPayments: false,
  };

  console.log('RC8_PAYMENTS_CANARY|PASS');
  console.log(`RC8_PAYMENTS_RECEIPT|${JSON.stringify(receipt)}`);
}

function sanitizedError(error: unknown): string {
  const source =
    error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown RC8 canary failure.';
  return source
    .replace(/(Bearer|Basic)\s+\S+/gi, '$1 [REDACTED]')
    .replace(/[A-Za-z0-9_+=/.:-]{80,}/g, '[REDACTED_LONG_VALUE]')
    .slice(0, 1000);
}

void main().catch((error: unknown) => {
  console.error(`RC8_PAYMENTS_CANARY|FAIL|${sanitizedError(error)}`);
  process.exitCode = 1;
});
