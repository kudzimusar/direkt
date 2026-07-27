import { createHash } from 'node:crypto';
import type { CommercialInvoiceStatus, CommercialPaymentStatus } from './commercial.types';
import type {
  SandboxPaymentProviderKey,
  SandboxPaymentStatusResult,
} from './sandbox-payment-provider.port';

export type SandboxPaymentReconciliationMismatchCode =
  | 'PROVIDER_KEY_MISMATCH'
  | 'PROVIDER_REFERENCE_MISMATCH'
  | 'PROVIDER_STATUS_NOT_INDEPENDENTLY_VERIFIED'
  | 'PAYMENT_INVOICE_SCOPE_MISMATCH'
  | 'PAYMENT_INVOICE_CURRENCY_MISMATCH'
  | 'PAYMENT_INVOICE_AMOUNT_MISMATCH'
  | 'PAYMENT_INVOICE_STATE_MISMATCH'
  | 'PROVIDER_CURRENCY_MISMATCH'
  | 'PROVIDER_AMOUNT_MISMATCH'
  | 'PROVIDER_TRANSACTION_ID_REQUIRED'
  | 'PROVIDER_STATUS_REGRESSION'
  | 'PAYMENT_LEDGER_NET_MISMATCH'
  | 'PROVIDER_ADJUSTMENT_AMOUNT_MISSING'
  | 'PROVIDER_ADJUSTMENT_AMOUNT_INVALID'
  | 'PROVIDER_ADJUSTMENT_REQUIRES_REVIEW';

export interface SandboxPaymentIntentReconciliationSnapshot {
  paymentIntentId: string;
  providerId: string;
  invoiceId: string;
  providerKey: SandboxPaymentProviderKey;
  providerReference: string;
  status: CommercialPaymentStatus;
  revision: number;
  currency: string;
  amountMinor: number;
}

export interface SandboxInvoiceReconciliationSnapshot {
  invoiceId: string;
  providerId: string;
  status: CommercialInvoiceStatus;
  currency: string;
  totalMinor: number;
}

export interface SandboxLedgerReconciliationSnapshot {
  receivedMinor: number;
  reversedMinor: number;
  refundedMinor: number;
  adjustmentMinor: number;
}

export interface SandboxProviderPaymentObservation {
  observationId: string;
  occurredAt: string;
  result: SandboxPaymentStatusResult;
}

export interface SandboxPaymentReconciliationInput {
  paymentIntent: SandboxPaymentIntentReconciliationSnapshot;
  invoice: SandboxInvoiceReconciliationSnapshot;
  ledger: SandboxLedgerReconciliationSnapshot;
  observation: SandboxProviderPaymentObservation;
  priorObservationFingerprints: readonly string[];
  policyVersion: string;
}

export interface SandboxProviderObservationEventPlan {
  eventType: 'provider_payment_observed';
  observationId: string;
  observationFingerprint: string;
  providerKey: SandboxPaymentProviderKey;
  providerReference: string;
  providerTransactionId: string | null;
  status: SandboxPaymentStatusResult['status'];
  currency: string;
  amountMinor: number;
  adjustmentStatus: NonNullable<SandboxPaymentStatusResult['adjustmentStatus']>;
  adjustmentAmountMinor: number | null;
  independentlyVerified: boolean;
  occurredAt: string;
  policyVersion: string;
  appendOnly: true;
  rawPayloadIncluded: false;
  credentialIncluded: false;
}

export interface SandboxPaymentEventPlan {
  eventType: 'provider_payment_status_reconciled';
  paymentIntentId: string;
  fromStatus: CommercialPaymentStatus;
  toStatus: CommercialPaymentStatus;
  expectedRevision: number;
  reasonCode: string;
  providerObservationFingerprint: string;
  eventSource: 'provider';
  appendOnly: true;
  rawPayloadIncluded: false;
  credentialIncluded: false;
}

export interface SandboxLedgerPostingPlan {
  transactionType: 'payment_received';
  providerId: string;
  invoiceId: string;
  paymentIntentId: string;
  externalReference: string;
  currency: string;
  amountMinor: number;
  debitAccount: 'cash_clearing';
  creditAccount: 'accounts_receivable';
  balanced: true;
  appendOnly: true;
}

export interface SandboxReconciliationCasePlan {
  mismatchCode: SandboxPaymentReconciliationMismatchCode;
  providerId: string;
  invoiceId: string;
  paymentIntentId: string;
  providerKey: SandboxPaymentProviderKey;
  providerReference: string;
  expectedAmountMinor: number | null;
  observedAmountMinor: number | null;
  expectedCurrency: string | null;
  observedCurrency: string | null;
  status: 'open';
  policyVersion: string;
  openedBy: 'system';
  providerObservationFingerprint: string;
  appendOnly: true;
  rawPayloadIncluded: false;
  credentialIncluded: false;
  trustOrRankingMutation: false;
}

export interface SandboxAdjustmentRequestPlan {
  adjustmentType: 'synthetic_refund';
  providerId: string;
  invoiceId: string;
  paymentIntentId: string;
  providerKey: SandboxPaymentProviderKey;
  providerReference: string;
  providerTransactionId: string;
  currency: string;
  amountMinor: number;
  status: 'requested';
  requestReasonCode: 'PROVIDER_REFUND_OBSERVED';
  providerObservationFingerprint: string;
  requiresTwoIndependentApprovers: true;
  requesterMayApprove: false;
  directLedgerMutation: false;
  productionMoneyMovement: false;
  appendOnly: true;
  trustOrRankingMutation: false;
}

export type SandboxPaymentReconciliationOutcome =
  | 'duplicate'
  | 'pending'
  | 'matched'
  | 'transition_planned'
  | 'reconciliation_required'
  | 'adjustment_required';

export interface SandboxPaymentReconciliationPlan {
  outcome: SandboxPaymentReconciliationOutcome;
  observationEvent: SandboxProviderObservationEventPlan;
  paymentEvent: SandboxPaymentEventPlan | null;
  ledgerPosting: SandboxLedgerPostingPlan | null;
  reconciliationCase: SandboxReconciliationCasePlan | null;
  adjustmentRequest: SandboxAdjustmentRequestPlan | null;
  historicalPaymentRewritten: false;
  historicalLedgerRewritten: false;
  invoiceDirectlyRewritten: false;
  operationsResolutionRequired: boolean;
  trustOrRankingMutation: false;
}

export interface SandboxReconciliationCaseSnapshot {
  reconciliationCaseId: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  revision: number;
  mismatchCode: SandboxPaymentReconciliationMismatchCode;
}

export interface SandboxReconciliationResolutionInput {
  actorKind: 'provider' | 'operations' | 'system';
  hasManagePermission: boolean;
  reconciliationCase: SandboxReconciliationCaseSnapshot;
  expectedRevision: number;
  targetStatus: 'investigating' | 'resolved' | 'closed';
  reasonCode: string;
  reason: string;
  policyVersion: string;
}

export interface SandboxReconciliationResolutionPlan {
  reconciliationCaseId: string;
  fromStatus: SandboxReconciliationCaseSnapshot['status'];
  toStatus: SandboxReconciliationResolutionInput['targetStatus'];
  expectedRevision: number;
  nextRevision: number;
  reasonCode: string;
  reason: string;
  policyVersion: string;
  actorKind: 'operations';
  appendOnlyEvent: true;
  sourceCaseMutated: false;
}

export class SandboxPaymentReconciliationError extends Error {
  constructor(
    public readonly code:
      | 'INVALID_RECONCILIATION_INPUT'
      | 'RECONCILIATION_PERMISSION_REQUIRED'
      | 'RECONCILIATION_REVISION_CONFLICT'
      | 'RECONCILIATION_TRANSITION_NOT_ALLOWED',
    message: string,
  ) {
    super(message);
    this.name = 'SandboxPaymentReconciliationError';
  }
}

export function reconcileSandboxPaymentObservation(
  input: SandboxPaymentReconciliationInput,
): SandboxPaymentReconciliationPlan {
  assertInput(input);
  const observationEvent = buildObservationEvent(input);

  if (input.priorObservationFingerprints.includes(observationEvent.observationFingerprint)) {
    return safePlan('duplicate', observationEvent);
  }

  const mismatchDetails = firstMismatch(input, observationEvent);
  if (mismatchDetails) {
    return reconciliationPlan(input, observationEvent, mismatchDetails);
  }

  const adjustmentPlan = planAdjustment(input, observationEvent);
  if (adjustmentPlan) {
    return adjustmentPlan;
  }

  const providerStatus = input.observation.result.status;
  if (isPendingStatus(providerStatus)) {
    if (input.paymentIntent.status === providerStatus) {
      return safePlan('matched', observationEvent);
    }
    return freezePlan({
      ...safePlanFields('pending', observationEvent),
      paymentEvent: paymentEvent(
        input,
        observationEvent,
        providerStatus,
        'PROVIDER_STATUS_PENDING',
      ),
    });
  }

  if (providerStatus === 'succeeded') {
    if (input.paymentIntent.status === 'succeeded') {
      const expectedNet = input.paymentIntent.amountMinor;
      const observedNet = ledgerNet(input.ledger);
      if (observedNet !== expectedNet) {
        return reconciliationPlan(input, observationEvent, {
          code: 'PAYMENT_LEDGER_NET_MISMATCH',
          expectedAmountMinor: expectedNet,
          observedAmountMinor: observedNet,
          expectedCurrency: input.paymentIntent.currency,
          observedCurrency: input.observation.result.currency,
        });
      }
      return safePlan('matched', observationEvent);
    }

    const providerTransactionId = input.observation.result.providerTransactionId;
    if (!providerTransactionId) {
      return reconciliationPlan(
        input,
        observationEvent,
        mismatch('PROVIDER_TRANSACTION_ID_REQUIRED', input),
      );
    }
    return freezePlan({
      ...safePlanFields('transition_planned', observationEvent),
      paymentEvent: paymentEvent(input, observationEvent, 'succeeded', 'PROVIDER_STATUS_SUCCEEDED'),
      ledgerPosting: Object.freeze({
        transactionType: 'payment_received',
        providerId: input.paymentIntent.providerId,
        invoiceId: input.paymentIntent.invoiceId,
        paymentIntentId: input.paymentIntent.paymentIntentId,
        externalReference: providerTransactionId,
        currency: input.paymentIntent.currency,
        amountMinor: input.paymentIntent.amountMinor,
        debitAccount: 'cash_clearing',
        creditAccount: 'accounts_receivable',
        balanced: true,
        appendOnly: true,
      }),
    });
  }

  const targetStatus: CommercialPaymentStatus =
    providerStatus === 'cancelled' ? 'cancelled' : 'failed';
  if (input.paymentIntent.status === targetStatus) {
    return safePlan('matched', observationEvent);
  }
  return freezePlan({
    ...safePlanFields('transition_planned', observationEvent),
    paymentEvent: paymentEvent(input, observationEvent, targetStatus, 'PROVIDER_STATUS_TERMINAL'),
  });
}

export function planSandboxReconciliationResolution(
  input: SandboxReconciliationResolutionInput,
): SandboxReconciliationResolutionPlan {
  if (input.actorKind !== 'operations' || !input.hasManagePermission) {
    throw new SandboxPaymentReconciliationError(
      'RECONCILIATION_PERMISSION_REQUIRED',
      'Only an authorized operations actor may resolve a payment reconciliation case.',
    );
  }
  if (input.reconciliationCase.revision !== input.expectedRevision) {
    throw new SandboxPaymentReconciliationError(
      'RECONCILIATION_REVISION_CONFLICT',
      'The reconciliation case revision changed before this resolution was planned.',
    );
  }
  const allowed =
    (input.reconciliationCase.status === 'open' &&
      ['investigating', 'resolved'].includes(input.targetStatus)) ||
    (input.reconciliationCase.status === 'investigating' && input.targetStatus === 'resolved') ||
    (input.reconciliationCase.status === 'resolved' && input.targetStatus === 'closed');
  if (!allowed) {
    throw new SandboxPaymentReconciliationError(
      'RECONCILIATION_TRANSITION_NOT_ALLOWED',
      'The requested reconciliation transition is not allowed.',
    );
  }
  if (
    !/^[A-Z][A-Z0-9_]{2,79}$/.test(input.reasonCode) ||
    input.reason.trim().length < 12 ||
    input.policyVersion.trim().length < 3
  ) {
    throw new SandboxPaymentReconciliationError(
      'INVALID_RECONCILIATION_INPUT',
      'Reconciliation resolution requires a bounded reason, policy and reason code.',
    );
  }

  return Object.freeze({
    reconciliationCaseId: input.reconciliationCase.reconciliationCaseId,
    fromStatus: input.reconciliationCase.status,
    toStatus: input.targetStatus,
    expectedRevision: input.expectedRevision,
    nextRevision: input.expectedRevision + 1,
    reasonCode: input.reasonCode,
    reason: input.reason.trim(),
    policyVersion: input.policyVersion.trim(),
    actorKind: 'operations',
    appendOnlyEvent: true,
    sourceCaseMutated: false,
  });
}

interface MismatchDetails {
  code: SandboxPaymentReconciliationMismatchCode;
  expectedAmountMinor: number | null;
  observedAmountMinor: number | null;
  expectedCurrency: string | null;
  observedCurrency: string | null;
}

function firstMismatch(
  input: SandboxPaymentReconciliationInput,
  observation: SandboxProviderObservationEventPlan,
): MismatchDetails | null {
  const payment = input.paymentIntent;
  const invoice = input.invoice;
  const result = input.observation.result;

  if (!result.independentlyVerified) {
    return mismatch('PROVIDER_STATUS_NOT_INDEPENDENTLY_VERIFIED', input);
  }
  if (result.providerKey !== payment.providerKey) {
    return mismatch('PROVIDER_KEY_MISMATCH', input);
  }
  if (result.providerReference !== payment.providerReference) {
    return mismatch('PROVIDER_REFERENCE_MISMATCH', input);
  }
  if (invoice.invoiceId !== payment.invoiceId || invoice.providerId !== payment.providerId) {
    return mismatch('PAYMENT_INVOICE_SCOPE_MISMATCH', input);
  }
  if (invoice.currency !== payment.currency) {
    return mismatch('PAYMENT_INVOICE_CURRENCY_MISMATCH', input);
  }
  if (invoice.totalMinor !== payment.amountMinor) {
    return mismatch('PAYMENT_INVOICE_AMOUNT_MISMATCH', input);
  }
  if (result.currency !== payment.currency) {
    return mismatch('PROVIDER_CURRENCY_MISMATCH', input);
  }
  if (result.amountMinor !== payment.amountMinor) {
    return mismatch('PROVIDER_AMOUNT_MISMATCH', input);
  }
  if (result.status === 'succeeded' && !result.providerTransactionId) {
    return mismatch('PROVIDER_TRANSACTION_ID_REQUIRED', input);
  }

  const adjustmentStatus = observation.adjustmentStatus;
  if (adjustmentStatus !== 'none') {
    if (result.status !== 'succeeded') {
      return mismatch('PROVIDER_STATUS_REGRESSION', input);
    }
    return null;
  }

  if (result.status === 'succeeded') {
    const expectedInvoiceStatus = payment.status === 'succeeded' ? 'paid' : 'open';
    if (invoice.status !== expectedInvoiceStatus) {
      return mismatch('PAYMENT_INVOICE_STATE_MISMATCH', input);
    }
  } else if (payment.status !== 'succeeded' && invoice.status === 'paid') {
    return mismatch('PAYMENT_INVOICE_STATE_MISMATCH', input);
  }

  if (!isPaymentTransitionAllowed(payment.status, result.status)) {
    return mismatch('PROVIDER_STATUS_REGRESSION', input);
  }
  return null;
}

function planAdjustment(
  input: SandboxPaymentReconciliationInput,
  observation: SandboxProviderObservationEventPlan,
): SandboxPaymentReconciliationPlan | null {
  if (observation.adjustmentStatus === 'none') {
    return null;
  }
  if (!['succeeded', 'reversed'].includes(input.paymentIntent.status)) {
    return reconciliationPlan(input, observation, mismatch('PROVIDER_STATUS_REGRESSION', input));
  }
  const expectedInvoiceStatus = input.paymentIntent.status === 'reversed' ? 'open' : 'paid';
  if (input.invoice.status !== expectedInvoiceStatus) {
    return reconciliationPlan(
      input,
      observation,
      mismatch('PAYMENT_INVOICE_STATE_MISMATCH', input),
    );
  }

  const amount = observation.adjustmentAmountMinor;
  if (amount === null) {
    return reconciliationPlan(input, observation, {
      code: 'PROVIDER_ADJUSTMENT_AMOUNT_MISSING',
      expectedAmountMinor: input.paymentIntent.amountMinor,
      observedAmountMinor: null,
      expectedCurrency: input.paymentIntent.currency,
      observedCurrency: input.observation.result.currency,
    });
  }
  const fullRefund = observation.adjustmentStatus === 'refunded';
  const invalid =
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    amount > input.paymentIntent.amountMinor ||
    (fullRefund && amount !== input.paymentIntent.amountMinor) ||
    (!fullRefund && amount >= input.paymentIntent.amountMinor);
  if (invalid) {
    return reconciliationPlan(input, observation, {
      code: 'PROVIDER_ADJUSTMENT_AMOUNT_INVALID',
      expectedAmountMinor: input.paymentIntent.amountMinor,
      observedAmountMinor: amount,
      expectedCurrency: input.paymentIntent.currency,
      observedCurrency: input.observation.result.currency,
    });
  }

  if (input.ledger.refundedMinor === amount) {
    return safePlan('matched', observation);
  }
  if (input.ledger.refundedMinor !== 0) {
    return reconciliationPlan(input, observation, {
      code: 'PAYMENT_LEDGER_NET_MISMATCH',
      expectedAmountMinor: amount,
      observedAmountMinor: input.ledger.refundedMinor,
      expectedCurrency: input.paymentIntent.currency,
      observedCurrency: input.observation.result.currency,
    });
  }

  const providerTransactionId = input.observation.result.providerTransactionId;
  if (!providerTransactionId) {
    return reconciliationPlan(
      input,
      observation,
      mismatch('PROVIDER_TRANSACTION_ID_REQUIRED', input),
    );
  }
  return freezePlan({
    ...safePlanFields('adjustment_required', observation),
    reconciliationCase: reconciliationCase(input, observation, {
      code: 'PROVIDER_ADJUSTMENT_REQUIRES_REVIEW',
      expectedAmountMinor: input.paymentIntent.amountMinor,
      observedAmountMinor: amount,
      expectedCurrency: input.paymentIntent.currency,
      observedCurrency: input.observation.result.currency,
    }),
    adjustmentRequest: Object.freeze({
      adjustmentType: 'synthetic_refund',
      providerId: input.paymentIntent.providerId,
      invoiceId: input.paymentIntent.invoiceId,
      paymentIntentId: input.paymentIntent.paymentIntentId,
      providerKey: input.paymentIntent.providerKey,
      providerReference: input.paymentIntent.providerReference,
      providerTransactionId,
      currency: input.paymentIntent.currency,
      amountMinor: amount,
      status: 'requested',
      requestReasonCode: 'PROVIDER_REFUND_OBSERVED',
      providerObservationFingerprint: observation.observationFingerprint,
      requiresTwoIndependentApprovers: true,
      requesterMayApprove: false,
      directLedgerMutation: false,
      productionMoneyMovement: false,
      appendOnly: true,
      trustOrRankingMutation: false,
    }),
    operationsResolutionRequired: true,
  });
}

function reconciliationPlan(
  input: SandboxPaymentReconciliationInput,
  observation: SandboxProviderObservationEventPlan,
  details: MismatchDetails,
): SandboxPaymentReconciliationPlan {
  return freezePlan({
    ...safePlanFields('reconciliation_required', observation),
    reconciliationCase: reconciliationCase(input, observation, details),
    operationsResolutionRequired: true,
  });
}

function reconciliationCase(
  input: SandboxPaymentReconciliationInput,
  observation: SandboxProviderObservationEventPlan,
  details: MismatchDetails,
): SandboxReconciliationCasePlan {
  return Object.freeze({
    mismatchCode: details.code,
    providerId: input.paymentIntent.providerId,
    invoiceId: input.paymentIntent.invoiceId,
    paymentIntentId: input.paymentIntent.paymentIntentId,
    providerKey: input.paymentIntent.providerKey,
    providerReference: input.paymentIntent.providerReference,
    expectedAmountMinor: details.expectedAmountMinor,
    observedAmountMinor: details.observedAmountMinor,
    expectedCurrency: details.expectedCurrency,
    observedCurrency: details.observedCurrency,
    status: 'open',
    policyVersion: input.policyVersion.trim(),
    openedBy: 'system',
    providerObservationFingerprint: observation.observationFingerprint,
    appendOnly: true,
    rawPayloadIncluded: false,
    credentialIncluded: false,
    trustOrRankingMutation: false,
  });
}

function mismatch(
  code: SandboxPaymentReconciliationMismatchCode,
  input: SandboxPaymentReconciliationInput,
): MismatchDetails {
  return {
    code,
    expectedAmountMinor: input.paymentIntent.amountMinor,
    observedAmountMinor: input.observation.result.amountMinor,
    expectedCurrency: input.paymentIntent.currency,
    observedCurrency: input.observation.result.currency,
  };
}

function paymentEvent(
  input: SandboxPaymentReconciliationInput,
  observation: SandboxProviderObservationEventPlan,
  targetStatus: CommercialPaymentStatus,
  reasonCode: string,
): SandboxPaymentEventPlan {
  return Object.freeze({
    eventType: 'provider_payment_status_reconciled',
    paymentIntentId: input.paymentIntent.paymentIntentId,
    fromStatus: input.paymentIntent.status,
    toStatus: targetStatus,
    expectedRevision: input.paymentIntent.revision,
    reasonCode,
    providerObservationFingerprint: observation.observationFingerprint,
    eventSource: 'provider',
    appendOnly: true,
    rawPayloadIncluded: false,
    credentialIncluded: false,
  });
}

function buildObservationEvent(
  input: SandboxPaymentReconciliationInput,
): SandboxProviderObservationEventPlan {
  const result = input.observation.result;
  const adjustmentStatus = result.adjustmentStatus ?? 'none';
  const adjustmentAmountMinor =
    result.adjustmentAmountMinor ?? (adjustmentStatus === 'refunded' ? result.amountMinor : null);
  const canonical = JSON.stringify({
    providerKey: result.providerKey,
    providerReference: result.providerReference,
    providerTransactionId: result.providerTransactionId ?? null,
    status: result.status,
    currency: result.currency,
    amountMinor: result.amountMinor,
    adjustmentStatus,
    adjustmentAmountMinor,
    independentlyVerified: result.independentlyVerified,
  });
  return Object.freeze({
    eventType: 'provider_payment_observed',
    observationId: input.observation.observationId,
    observationFingerprint: createHash('sha256').update(canonical, 'utf8').digest('hex'),
    providerKey: result.providerKey,
    providerReference: result.providerReference,
    providerTransactionId: result.providerTransactionId ?? null,
    status: result.status,
    currency: result.currency,
    amountMinor: result.amountMinor,
    adjustmentStatus,
    adjustmentAmountMinor,
    independentlyVerified: result.independentlyVerified,
    occurredAt: input.observation.occurredAt,
    policyVersion: input.policyVersion.trim(),
    appendOnly: true,
    rawPayloadIncluded: false,
    credentialIncluded: false,
  });
}

function isPaymentTransitionAllowed(
  currentStatus: CommercialPaymentStatus,
  providerStatus: SandboxPaymentStatusResult['status'],
): boolean {
  if (currentStatus === providerStatus) {
    return true;
  }
  if (currentStatus === 'pending') {
    return ['requires_action', 'processing', 'succeeded', 'failed', 'cancelled'].includes(
      providerStatus,
    );
  }
  if (currentStatus === 'requires_action') {
    return ['processing', 'succeeded', 'failed', 'cancelled'].includes(providerStatus);
  }
  if (currentStatus === 'processing') {
    return ['succeeded', 'failed'].includes(providerStatus);
  }
  return false;
}

function isPendingStatus(
  status: SandboxPaymentStatusResult['status'],
): status is 'pending' | 'requires_action' | 'processing' {
  return status === 'pending' || status === 'requires_action' || status === 'processing';
}

function assertInput(input: SandboxPaymentReconciliationInput): void {
  const currency = /^[A-Z]{3}$/;
  const validAmounts = [
    input.paymentIntent.amountMinor,
    input.invoice.totalMinor,
    input.ledger.receivedMinor,
    input.ledger.reversedMinor,
    input.ledger.refundedMinor,
    input.ledger.adjustmentMinor,
    input.observation.result.amountMinor,
  ].every((value) => Number.isSafeInteger(value) && value >= 0);
  const occurredAt = Date.parse(input.observation.occurredAt);
  if (
    !validAmounts ||
    input.paymentIntent.amountMinor <= 0 ||
    input.invoice.totalMinor <= 0 ||
    !currency.test(input.paymentIntent.currency) ||
    !currency.test(input.invoice.currency) ||
    !currency.test(input.observation.result.currency) ||
    input.paymentIntent.revision < 1 ||
    input.policyVersion.trim().length < 3 ||
    input.observation.observationId.trim().length < 8 ||
    !Number.isFinite(occurredAt)
  ) {
    throw new SandboxPaymentReconciliationError(
      'INVALID_RECONCILIATION_INPUT',
      'Provider reconciliation input failed a bounded data rule.',
    );
  }
}

function ledgerNet(ledger: SandboxLedgerReconciliationSnapshot): number {
  return (
    ledger.receivedMinor - ledger.reversedMinor - ledger.refundedMinor + ledger.adjustmentMinor
  );
}

function safePlan(
  outcome: SandboxPaymentReconciliationOutcome,
  observationEvent: SandboxProviderObservationEventPlan,
): SandboxPaymentReconciliationPlan {
  return freezePlan(safePlanFields(outcome, observationEvent));
}

function safePlanFields(
  outcome: SandboxPaymentReconciliationOutcome,
  observationEvent: SandboxProviderObservationEventPlan,
): SandboxPaymentReconciliationPlan {
  return {
    outcome,
    observationEvent,
    paymentEvent: null,
    ledgerPosting: null,
    reconciliationCase: null,
    adjustmentRequest: null,
    historicalPaymentRewritten: false,
    historicalLedgerRewritten: false,
    invoiceDirectlyRewritten: false,
    operationsResolutionRequired: false,
    trustOrRankingMutation: false,
  };
}

function freezePlan(plan: SandboxPaymentReconciliationPlan): SandboxPaymentReconciliationPlan {
  if (plan.paymentEvent) Object.freeze(plan.paymentEvent);
  if (plan.ledgerPosting) Object.freeze(plan.ledgerPosting);
  if (plan.reconciliationCase) Object.freeze(plan.reconciliationCase);
  if (plan.adjustmentRequest) Object.freeze(plan.adjustmentRequest);
  Object.freeze(plan.observationEvent);
  return Object.freeze(plan);
}
