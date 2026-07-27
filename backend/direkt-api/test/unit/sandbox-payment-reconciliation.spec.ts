import { describe, expect, it } from 'vitest';
import {
  planSandboxReconciliationResolution,
  reconcileSandboxPaymentObservation,
  type SandboxPaymentReconciliationInput,
  type SandboxReconciliationResolutionInput,
} from '../../src/commercial/sandbox-payment-reconciliation';
import type { SandboxPaymentStatusResult } from '../../src/commercial/sandbox-payment-provider.port';

type InputOverrides = {
  paymentIntent?: Partial<SandboxPaymentReconciliationInput['paymentIntent']>;
  invoice?: Partial<SandboxPaymentReconciliationInput['invoice']>;
  ledger?: Partial<SandboxPaymentReconciliationInput['ledger']>;
  observation?: {
    observationId?: string;
    occurredAt?: string;
    result?: Partial<SandboxPaymentStatusResult>;
    omitProviderTransactionId?: boolean;
  };
  priorObservationFingerprints?: readonly string[];
  policyVersion?: string;
};

type ResolutionOverrides = {
  actorKind?: SandboxReconciliationResolutionInput['actorKind'];
  hasManagePermission?: boolean;
  reconciliationCase?: Partial<SandboxReconciliationResolutionInput['reconciliationCase']>;
  expectedRevision?: number;
  targetStatus?: SandboxReconciliationResolutionInput['targetStatus'];
  reasonCode?: string;
  reason?: string;
  policyVersion?: string;
};

function input(overrides: InputOverrides = {}): SandboxPaymentReconciliationInput {
  const base: SandboxPaymentReconciliationInput = {
    paymentIntent: {
      paymentIntentId: '11111111-1111-4111-8111-111111111111',
      providerId: '22222222-2222-4222-8222-222222222222',
      invoiceId: '33333333-3333-4333-8333-333333333333',
      providerKey: 'stripe',
      providerReference: 'cs_test_reconciliation_123',
      status: 'pending',
      revision: 1,
      currency: 'USD',
      amountMinor: 100,
    },
    invoice: {
      invoiceId: '33333333-3333-4333-8333-333333333333',
      providerId: '22222222-2222-4222-8222-222222222222',
      status: 'open',
      currency: 'USD',
      totalMinor: 100,
    },
    ledger: {
      receivedMinor: 0,
      reversedMinor: 0,
      refundedMinor: 0,
      adjustmentMinor: 0,
    },
    observation: {
      observationId: 'RC8-OBSERVATION-0001',
      occurredAt: '2026-07-26T12:00:00.000Z',
      result: {
        providerKey: 'stripe',
        providerReference: 'cs_test_reconciliation_123',
        status: 'succeeded',
        currency: 'USD',
        amountMinor: 100,
        independentlyVerified: true,
        providerTransactionId: 'pi_reconciliation_123',
        adjustmentStatus: 'none',
        rawPayloadIncluded: false,
        credentialIncluded: false,
      },
    },
    priorObservationFingerprints: [],
    policyVersion: 'rc8-v1',
  };

  const result: SandboxPaymentStatusResult = {
    ...base.observation.result,
    ...overrides.observation?.result,
  };
  if (overrides.observation?.omitProviderTransactionId) {
    delete result.providerTransactionId;
  }

  return {
    paymentIntent: { ...base.paymentIntent, ...overrides.paymentIntent },
    invoice: { ...base.invoice, ...overrides.invoice },
    ledger: { ...base.ledger, ...overrides.ledger },
    observation: {
      observationId: overrides.observation?.observationId ?? base.observation.observationId,
      occurredAt: overrides.observation?.occurredAt ?? base.observation.occurredAt,
      result,
    },
    priorObservationFingerprints:
      overrides.priorObservationFingerprints ?? base.priorObservationFingerprints,
    policyVersion: overrides.policyVersion ?? base.policyVersion,
  };
}

function completedPayment(overrides: InputOverrides = {}): SandboxPaymentReconciliationInput {
  return input({
    ...overrides,
    paymentIntent: {
      ...overrides.paymentIntent,
      status: overrides.paymentIntent?.status ?? 'succeeded',
    },
    invoice: {
      ...overrides.invoice,
      status: overrides.invoice?.status ?? 'paid',
    },
    ledger: {
      receivedMinor: 100,
      reversedMinor: 0,
      refundedMinor: 0,
      adjustmentMinor: 0,
      ...overrides.ledger,
    },
  });
}

function resolutionInput(
  overrides: ResolutionOverrides = {},
): SandboxReconciliationResolutionInput {
  const base: SandboxReconciliationResolutionInput = {
    actorKind: 'operations',
    hasManagePermission: true,
    reconciliationCase: {
      reconciliationCaseId: '44444444-4444-4444-8444-444444444444',
      status: 'open',
      revision: 2,
      mismatchCode: 'PROVIDER_AMOUNT_MISMATCH',
    },
    expectedRevision: 2,
    targetStatus: 'investigating',
    reasonCode: 'FINANCE_REVIEW_STARTED',
    reason: 'Finance operations started an independent provider reconciliation review.',
    policyVersion: 'rc8-v1',
  };
  return {
    ...base,
    ...overrides,
    reconciliationCase: { ...base.reconciliationCase, ...overrides.reconciliationCase },
  };
}

describe('RC8D provider-neutral payment reconciliation', () => {
  it('plans one append-only successful transition and balanced ledger posting', () => {
    const plan = reconcileSandboxPaymentObservation(input());

    expect(plan).toMatchObject({
      outcome: 'transition_planned',
      historicalPaymentRewritten: false,
      historicalLedgerRewritten: false,
      invoiceDirectlyRewritten: false,
      operationsResolutionRequired: false,
      trustOrRankingMutation: false,
      paymentEvent: {
        fromStatus: 'pending',
        toStatus: 'succeeded',
        expectedRevision: 1,
        eventSource: 'provider',
        appendOnly: true,
      },
      ledgerPosting: {
        transactionType: 'payment_received',
        externalReference: 'pi_reconciliation_123',
        currency: 'USD',
        amountMinor: 100,
        debitAccount: 'cash_clearing',
        creditAccount: 'accounts_receivable',
        balanced: true,
        appendOnly: true,
      },
    });
    expect(plan.observationEvent).toMatchObject({
      eventType: 'provider_payment_observed',
      appendOnly: true,
      rawPayloadIncluded: false,
      credentialIncluded: false,
    });
    expect(plan.observationEvent.observationFingerprint).toMatch(/^[0-9a-f]{64}$/);
    expect(Object.isFrozen(plan)).toBe(true);
    expect(Object.isFrozen(plan.paymentEvent)).toBe(true);
    expect(Object.isFrozen(plan.ledgerPosting)).toBe(true);
  });

  it('recognizes an already-balanced successful payment without another posting', () => {
    const plan = reconcileSandboxPaymentObservation(completedPayment());

    expect(plan).toMatchObject({
      outcome: 'matched',
      paymentEvent: null,
      ledgerPosting: null,
      reconciliationCase: null,
      adjustmentRequest: null,
    });
  });

  it('deduplicates identical provider facts by immutable fingerprint', () => {
    const first = reconcileSandboxPaymentObservation(input());
    const duplicate = reconcileSandboxPaymentObservation(
      input({ priorObservationFingerprints: [first.observationEvent.observationFingerprint] }),
    );

    expect(duplicate).toMatchObject({
      outcome: 'duplicate',
      paymentEvent: null,
      ledgerPosting: null,
      reconciliationCase: null,
      adjustmentRequest: null,
    });
    expect(duplicate.observationEvent.observationFingerprint).toBe(
      first.observationEvent.observationFingerprint,
    );
  });

  it.each([
    {
      name: 'unverified provider status',
      value: input({ observation: { result: { independentlyVerified: false } } }),
      code: 'PROVIDER_STATUS_NOT_INDEPENDENTLY_VERIFIED',
    },
    {
      name: 'provider key mismatch',
      value: input({ observation: { result: { providerKey: 'paypal' } } }),
      code: 'PROVIDER_KEY_MISMATCH',
    },
    {
      name: 'provider reference mismatch',
      value: input({ observation: { result: { providerReference: 'cs_test_other_123' } } }),
      code: 'PROVIDER_REFERENCE_MISMATCH',
    },
    {
      name: 'invoice provider scope mismatch',
      value: input({ invoice: { providerId: '55555555-5555-4555-8555-555555555555' } }),
      code: 'PAYMENT_INVOICE_SCOPE_MISMATCH',
    },
    {
      name: 'invoice currency mismatch',
      value: input({ invoice: { currency: 'EUR' } }),
      code: 'PAYMENT_INVOICE_CURRENCY_MISMATCH',
    },
    {
      name: 'invoice amount mismatch',
      value: input({ invoice: { totalMinor: 200 } }),
      code: 'PAYMENT_INVOICE_AMOUNT_MISMATCH',
    },
    {
      name: 'provider currency mismatch',
      value: input({ observation: { result: { currency: 'EUR' } } }),
      code: 'PROVIDER_CURRENCY_MISMATCH',
    },
    {
      name: 'provider amount mismatch',
      value: input({ observation: { result: { amountMinor: 200 } } }),
      code: 'PROVIDER_AMOUNT_MISMATCH',
    },
    {
      name: 'missing provider transaction id',
      value: input({ observation: { omitProviderTransactionId: true } }),
      code: 'PROVIDER_TRANSACTION_ID_REQUIRED',
    },
    {
      name: 'successful payment against a void invoice',
      value: input({ invoice: { status: 'void' } }),
      code: 'PAYMENT_INVOICE_STATE_MISMATCH',
    },
    {
      name: 'terminal payment moved backwards',
      value: completedPayment({ observation: { result: { status: 'processing' } } }),
      code: 'PROVIDER_STATUS_REGRESSION',
    },
  ])('opens reconciliation for $name', ({ value, code }) => {
    const plan = reconcileSandboxPaymentObservation(value);

    expect(plan).toMatchObject({
      outcome: 'reconciliation_required',
      paymentEvent: null,
      ledgerPosting: null,
      adjustmentRequest: null,
      operationsResolutionRequired: true,
      historicalPaymentRewritten: false,
      historicalLedgerRewritten: false,
      invoiceDirectlyRewritten: false,
      reconciliationCase: {
        mismatchCode: code,
        status: 'open',
        openedBy: 'system',
        appendOnly: true,
        rawPayloadIncluded: false,
        credentialIncluded: false,
        trustOrRankingMutation: false,
      },
    });
  });

  it('opens a case instead of silently repairing a successful ledger mismatch', () => {
    const plan = reconcileSandboxPaymentObservation(
      completedPayment({ ledger: { receivedMinor: 75 } }),
    );

    expect(plan).toMatchObject({
      outcome: 'reconciliation_required',
      reconciliationCase: {
        mismatchCode: 'PAYMENT_LEDGER_NET_MISMATCH',
        expectedAmountMinor: 100,
        observedAmountMinor: 75,
      },
      paymentEvent: null,
      ledgerPosting: null,
    });
  });

  it('creates an immutable full-refund request without rewriting payment history', () => {
    const plan = reconcileSandboxPaymentObservation(
      completedPayment({
        observation: {
          result: {
            adjustmentStatus: 'refunded',
          },
        },
      }),
    );

    expect(plan).toMatchObject({
      outcome: 'adjustment_required',
      paymentEvent: null,
      ledgerPosting: null,
      historicalPaymentRewritten: false,
      historicalLedgerRewritten: false,
      invoiceDirectlyRewritten: false,
      operationsResolutionRequired: true,
      reconciliationCase: {
        mismatchCode: 'PROVIDER_ADJUSTMENT_REQUIRES_REVIEW',
        observedAmountMinor: 100,
      },
      adjustmentRequest: {
        adjustmentType: 'synthetic_refund',
        amountMinor: 100,
        status: 'requested',
        requestReasonCode: 'PROVIDER_REFUND_OBSERVED',
        requiresTwoIndependentApprovers: true,
        requesterMayApprove: false,
        directLedgerMutation: false,
        productionMoneyMovement: false,
        appendOnly: true,
        trustOrRankingMutation: false,
      },
    });
    expect(Object.isFrozen(plan.adjustmentRequest)).toBe(true);
  });

  it('requires an explicit amount for a partial provider refund', () => {
    const plan = reconcileSandboxPaymentObservation(
      completedPayment({ observation: { result: { adjustmentStatus: 'partially_refunded' } } }),
    );

    expect(plan).toMatchObject({
      outcome: 'reconciliation_required',
      reconciliationCase: {
        mismatchCode: 'PROVIDER_ADJUSTMENT_AMOUNT_MISSING',
        observedAmountMinor: null,
      },
      adjustmentRequest: null,
    });
  });

  it('creates a guarded partial-refund request from an explicit provider amount', () => {
    const plan = reconcileSandboxPaymentObservation(
      completedPayment({
        observation: {
          result: {
            adjustmentStatus: 'partially_refunded',
            adjustmentAmountMinor: 40,
          },
        },
      }),
    );

    expect(plan).toMatchObject({
      outcome: 'adjustment_required',
      adjustmentRequest: {
        amountMinor: 40,
        requiresTwoIndependentApprovers: true,
        requesterMayApprove: false,
        directLedgerMutation: false,
      },
    });
  });

  it('recognizes an already-posted refund without duplicating the adjustment', () => {
    const plan = reconcileSandboxPaymentObservation(
      completedPayment({
        ledger: { refundedMinor: 40 },
        observation: {
          result: {
            adjustmentStatus: 'partially_refunded',
            adjustmentAmountMinor: 40,
          },
        },
      }),
    );

    expect(plan).toMatchObject({
      outcome: 'matched',
      adjustmentRequest: null,
      reconciliationCase: null,
      historicalLedgerRewritten: false,
    });
  });

  it.each([
    { adjustmentStatus: 'refunded' as const, adjustmentAmountMinor: 40 },
    { adjustmentStatus: 'partially_refunded' as const, adjustmentAmountMinor: 100 },
    { adjustmentStatus: 'partially_refunded' as const, adjustmentAmountMinor: 1.5 },
  ])('rejects an invalid provider adjustment amount %#', (result) => {
    const plan = reconcileSandboxPaymentObservation(completedPayment({ observation: { result } }));

    expect(plan).toMatchObject({
      outcome: 'reconciliation_required',
      reconciliationCase: { mismatchCode: 'PROVIDER_ADJUSTMENT_AMOUNT_INVALID' },
      adjustmentRequest: null,
    });
  });

  it('keeps a pending provider observation non-terminal and append-only', () => {
    const plan = reconcileSandboxPaymentObservation(
      input({
        observation: {
          result: { status: 'processing' },
          omitProviderTransactionId: true,
        },
      }),
    );

    expect(plan).toMatchObject({
      outcome: 'pending',
      paymentEvent: {
        fromStatus: 'pending',
        toStatus: 'processing',
        appendOnly: true,
      },
      ledgerPosting: null,
      reconciliationCase: null,
    });
  });

  it('rejects malformed reconciliation input before producing a plan', () => {
    expect(() =>
      reconcileSandboxPaymentObservation(input({ observation: { occurredAt: 'not-a-time' } })),
    ).toThrow(expect.objectContaining({ code: 'INVALID_RECONCILIATION_INPUT' }));
  });
});

describe('RC8D operations-only reconciliation resolution', () => {
  it.each([
    resolutionInput({ actorKind: 'provider' }),
    resolutionInput({ hasManagePermission: false }),
  ])('rejects a non-operations or unauthorized resolution', (value) => {
    expect(() => planSandboxReconciliationResolution(value)).toThrow(
      expect.objectContaining({ code: 'RECONCILIATION_PERMISSION_REQUIRED' }),
    );
  });

  it('rejects a stale reconciliation revision', () => {
    expect(() =>
      planSandboxReconciliationResolution(resolutionInput({ expectedRevision: 1 })),
    ).toThrow(expect.objectContaining({ code: 'RECONCILIATION_REVISION_CONFLICT' }));
  });

  it('rejects an invalid state transition', () => {
    expect(() =>
      planSandboxReconciliationResolution(resolutionInput({ targetStatus: 'closed' })),
    ).toThrow(expect.objectContaining({ code: 'RECONCILIATION_TRANSITION_NOT_ALLOWED' }));
  });

  it('plans an append-only operations event without mutating the source case', () => {
    const sourceCase = resolutionInput().reconciliationCase;
    const before = { ...sourceCase };
    const plan = planSandboxReconciliationResolution(
      resolutionInput({ reconciliationCase: sourceCase }),
    );

    expect(plan).toEqual({
      reconciliationCaseId: '44444444-4444-4444-8444-444444444444',
      fromStatus: 'open',
      toStatus: 'investigating',
      expectedRevision: 2,
      nextRevision: 3,
      reasonCode: 'FINANCE_REVIEW_STARTED',
      reason: 'Finance operations started an independent provider reconciliation review.',
      policyVersion: 'rc8-v1',
      actorKind: 'operations',
      appendOnlyEvent: true,
      sourceCaseMutated: false,
    });
    expect(sourceCase).toEqual(before);
    expect(Object.isFrozen(plan)).toBe(true);
  });
});
