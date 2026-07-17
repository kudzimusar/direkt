import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import type { Server } from 'node:http';
import { Pool } from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../scripts/migration-lib';
import { databaseUrl } from '../../scripts/runtime-config';
import { AppModule } from '../../src/app.module';
import { configureApplication } from '../../src/configure-application';

const WEBHOOK_SECRET =
  'direkt-phase9-e2e-synthetic-payment-webhook-secret-not-for-production-00001';

interface ChallengeResponse {
  challengeId: string;
  synthetic: { code: string };
}

interface SessionResponse {
  identityId: string;
  accessToken: string;
}

interface ProviderResponse {
  id: string;
}

interface ProductResponse {
  productId: string;
  productKey: string;
  prices: Array<{ priceKey: string; currency: string; amountMinor: number }>;
  verificationIncluded: false;
  rankingIncluded: false;
}

interface SubscriptionResponse {
  subscriptionId: string;
  providerId: string;
  status: string;
  revision: number;
  graceEndsAt: string | null;
  entitlements: Array<{ entitlementKey: string; status: string; rankingEffect: false }>;
  events: Array<{ toStatus: string }>;
  trustOrRankingMutation: false;
}

interface InvoiceResponse {
  invoiceId: string;
  providerId: string;
  subscriptionId: string;
  invoiceNumber: string;
  status: string;
  revision: number;
  currency: string;
  totalMinor: number;
  paidAt: string | null;
  lines: Array<{ lineTotalMinor: number }>;
  paymentCredentialIncluded: false;
}

interface PaymentResponse {
  paymentIntentId: string;
  providerId: string;
  invoiceId: string;
  externalReference: string;
  status: string;
  revision: number;
  currency: string;
  amountMinor: number;
  action: {
    mode: string;
    state: string;
    credentialRequested: false;
    productionMoneyMovement: false;
  };
  rawWebhookIncluded: false;
  trustOrRankingMutation: false;
}

interface WebhookResponse {
  webhookReceiptId: string;
  processingOutcome: string;
  signatureVerified: boolean;
  timestampVerified: boolean;
  rejectionCode: string | null;
  paymentIntent: PaymentResponse | null;
  rawPayloadStored: false;
  productionMoneyMovement: false;
}

interface WorkspaceResponse {
  providerId: string;
  subscriptions: SubscriptionResponse[];
  invoices: InvoiceResponse[];
  paymentIntents: PaymentResponse[];
  receipts: Array<{
    paymentIntentId: string;
    invoiceNumber: string;
    totalMinor: number;
    paymentCredentialIncluded: false;
    trustOrRankingMutation: false;
  }>;
  credentialStored: false;
  privateInteractionContactIncluded: false;
  verificationMutation: false;
  publicationMutation: false;
  rankingMutation: false;
}

interface ReconciliationResponse {
  reconciliationCaseId: string;
  status: string;
  revision: number;
  mismatchCode: string;
  rawWebhookIncluded: false;
  trustOrRankingMutation: false;
}

interface AdjustmentResponse {
  adjustmentRequestId: string;
  providerId: string;
  status: string;
  revision: number;
  approvals: Array<{ decision: string; approverIdentityExposed: false }>;
  productionMoneyMovement: false;
  trustOrRankingMutation: false;
}

interface OperationsOverviewResponse {
  subscriptions: SubscriptionResponse[];
  invoices: InvoiceResponse[];
  paymentIntents: PaymentResponse[];
  reconciliationCases: ReconciliationResponse[];
  adjustments: AdjustmentResponse[];
  rawWebhookIncluded: false;
  paymentCredentialIncluded: false;
  trustOrRankingMutation: false;
}

interface TrustCounts {
  decisions: string;
  claims: string;
  publications: string;
  reviews: string;
  complaints: string;
}

describe('Phase 9 subscription, payment, ledger and reconciliation closed loop', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 4 });
  let app: INestApplication;
  let owner: SessionResponse;
  let otherOwner: SessionResponse;
  let outsider: SessionResponse;
  let financeRequester: SessionResponse;
  let financeApproverOne: SessionResponse;
  let financeApproverTwo: SessionResponse;
  let providerId: string;

  const httpServer = (): Server => app.getHttpServer() as Server;

  async function signIn(contact: string): Promise<SessionResponse> {
    const challenge = await request(httpServer())
      .post('/api/v1/auth/challenges')
      .send({ channel: 'email', contact })
      .expect(202);
    const challengeBody = challenge.body as ChallengeResponse;
    const verified = await request(httpServer())
      .post('/api/v1/auth/challenges/verify')
      .send({
        challengeId: challengeBody.challengeId,
        code: challengeBody.synthetic.code,
        deviceLabel: 'Synthetic Phase 9 commercial client',
      })
      .expect(200);
    return verified.body as SessionResponse;
  }

  async function createProvider(
    session: SessionResponse,
    suffix: string,
  ): Promise<ProviderResponse> {
    const response = await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${session.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName: `Synthetic Phase 9 Provider ${suffix}`,
        operatingModel: 'mobile',
        localitySummary: 'Synthetic Lusaka locality',
        serviceAreaSummary: 'Synthetic commercial service area',
        registeredBusinessName: `Synthetic Phase 9 Provider ${suffix} Limited`,
      })
      .expect(201);
    return response.body as ProviderResponse;
  }

  async function grantFinance(identityId: string, reason: string): Promise<void> {
    await pool.query(
      `INSERT INTO authz.role_assignments (
         identity_id, role_id, scope_type, assigned_by_identity_id, reason
       )
       SELECT $1, id, 'global', $1, $2
       FROM authz.roles WHERE role_key = 'finance'`,
      [identityId, reason],
    );
  }

  async function trustState(): Promise<TrustCounts> {
    const result = await pool.query<TrustCounts>(
      `SELECT
         (SELECT count(*)
          FROM verification.decisions AS decisions
          JOIN verification.cases AS cases ON cases.id = decisions.case_id
          WHERE cases.provider_id = $1)::text AS decisions,
         (SELECT count(*) FROM verification.claims WHERE provider_id = $1)::text AS claims,
         (SELECT count(*) FROM discovery.publications WHERE provider_id = $1)::text AS publications,
         (SELECT count(*) FROM interaction.reviews WHERE provider_id = $1)::text AS reviews,
         (SELECT count(*) FROM interaction.complaints WHERE provider_id = $1)::text AS complaints`,
      [providerId],
    );
    const row = result.rows[0];
    if (!row) throw new Error('Commercial trust-state query returned no row.');
    return row;
  }

  function canonicalWebhook(payload: {
    externalEventId: string;
    eventType: string;
    paymentIntentId: string;
    targetStatus: string;
    reasonCode: string;
    occurredAt: string;
    amountMinor: number;
    currency: string;
    policyVersion: string;
  }): string {
    return JSON.stringify({
      externalEventId: payload.externalEventId,
      eventType: payload.eventType,
      paymentIntentId: payload.paymentIntentId,
      targetStatus: payload.targetStatus,
      reasonCode: payload.reasonCode,
      occurredAt: payload.occurredAt,
      amountMinor: payload.amountMinor,
      currency: payload.currency,
      policyVersion: payload.policyVersion,
    });
  }

  function sendWebhook(
    payload: Parameters<typeof canonicalWebhook>[0],
    signatureOverride?: string,
  ) {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature =
      signatureOverride ??
      createHmac('sha256', WEBHOOK_SECRET)
        .update(`${timestamp}.${canonicalWebhook(payload)}`, 'utf8')
        .digest('hex');
    return request(httpServer())
      .post('/api/v1/webhooks/payments/synthetic')
      .set('x-direkt-timestamp', timestamp)
      .set('x-direkt-signature', signature)
      .send(payload);
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.PAYMENT_PROVIDER_MODE = 'synthetic';
    process.env.PAYMENT_SYNTHETIC_WEBHOOK_SECRET = WEBHOOK_SECRET;
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();

    owner = await signIn('phase9-owner@example.invalid');
    otherOwner = await signIn('phase9-other-owner@example.invalid');
    outsider = await signIn('phase9-outsider@example.invalid');
    financeRequester = await signIn('phase9-finance-requester@example.invalid');
    financeApproverOne = await signIn('phase9-finance-approver-one@example.invalid');
    financeApproverTwo = await signIn('phase9-finance-approver-two@example.invalid');

    providerId = (await createProvider(owner, 'Alpha')).id;
    await createProvider(otherOwner, 'Beta');
    await grantFinance(
      financeRequester.identityId,
      'Synthetic Phase 9 commercial request and reconciliation operator',
    );
    await grantFinance(
      financeApproverOne.identityId,
      'Synthetic Phase 9 separated commercial approver one',
    );
    await grantFinance(
      financeApproverTwo.identityId,
      'Synthetic Phase 9 separated commercial approver two',
    );
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('completes the synthetic commercial lifecycle without mutating trust', async () => {
    const beforeTrust = await trustState();

    const productsResponse = await request(httpServer())
      .get('/api/v1/commercial/products')
      .expect(200);
    const products = productsResponse.body as ProductResponse[];
    const coreProduct = products.find(
      (product) => product.productKey === 'provider_workspace_core',
    );
    expect(coreProduct).toMatchObject({
      verificationIncluded: false,
      rankingIncluded: false,
    });
    expect(coreProduct?.prices[0]).toMatchObject({
      priceKey: 'provider_workspace_core_monthly_zmw',
      currency: 'ZMW',
      amountMinor: 15000,
    });

    await request(httpServer())
      .get('/api/v1/provider-workspace/me/commercial')
      .set('authorization', `Bearer ${outsider.accessToken}`)
      .expect(403);

    const subscriptionPayload = {
      productKey: 'provider_workspace_core',
      priceKey: 'provider_workspace_core_monthly_zmw',
      policyVersion: 'phase9-e2e-v1',
    };
    const subscriptionCreated = await request(httpServer())
      .post('/api/v1/provider-workspace/me/subscriptions')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .set('idempotency-key', 'phase9-subscription-alpha-0001')
      .send(subscriptionPayload)
      .expect(201);
    const subscription = subscriptionCreated.body as SubscriptionResponse;
    expect(subscription).toMatchObject({
      providerId,
      status: 'pending',
      revision: 1,
      entitlements: [],
      trustOrRankingMutation: false,
    });

    const subscriptionReplay = await request(httpServer())
      .post('/api/v1/provider-workspace/me/subscriptions')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .set('idempotency-key', 'phase9-subscription-alpha-0001')
      .send(subscriptionPayload)
      .expect(201);
    expect((subscriptionReplay.body as SubscriptionResponse).subscriptionId).toBe(
      subscription.subscriptionId,
    );

    await request(httpServer())
      .post('/api/v1/provider-workspace/me/subscriptions')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .set('idempotency-key', 'phase9-subscription-alpha-0001')
      .send({ ...subscriptionPayload, policyVersion: 'phase9-e2e-v2' })
      .expect(409);

    await request(httpServer())
      .post(`/api/v1/provider-workspace/me/subscriptions/${subscription.subscriptionId}/cancel`)
      .set('authorization', `Bearer ${otherOwner.accessToken}`)
      .send({
        expectedRevision: 1,
        reason: 'Copied subscription identifiers must not cross provider scope.',
        policyVersion: 'phase9-e2e-v1',
      })
      .expect(404);

    const invoiceCreated = await request(httpServer())
      .post(`/api/v1/provider-workspace/me/subscriptions/${subscription.subscriptionId}/invoices`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({ policyVersion: 'phase9-e2e-v1' })
      .expect(201);
    const invoice = invoiceCreated.body as InvoiceResponse;
    expect(invoice).toMatchObject({
      providerId,
      subscriptionId: subscription.subscriptionId,
      status: 'open',
      currency: 'ZMW',
      totalMinor: 15000,
      paymentCredentialIncluded: false,
    });
    expect(invoice.lines).toEqual([expect.objectContaining({ lineTotalMinor: 15000 })]);

    const invoiceReplay = await request(httpServer())
      .post(`/api/v1/provider-workspace/me/subscriptions/${subscription.subscriptionId}/invoices`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({ policyVersion: 'phase9-e2e-v1' })
      .expect(201);
    expect((invoiceReplay.body as InvoiceResponse).invoiceId).toBe(invoice.invoiceId);

    const paymentCreated = await request(httpServer())
      .post(`/api/v1/provider-workspace/me/invoices/${invoice.invoiceId}/payment-intents`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .set('idempotency-key', 'phase9-payment-alpha-0001')
      .send({ policyVersion: 'phase9-e2e-v1' })
      .expect(201);
    const payment = paymentCreated.body as PaymentResponse;
    expect(payment).toMatchObject({
      providerId,
      invoiceId: invoice.invoiceId,
      status: 'requires_action',
      currency: 'ZMW',
      amountMinor: 15000,
      action: {
        mode: 'synthetic',
        state: 'requires_action',
        credentialRequested: false,
        productionMoneyMovement: false,
      },
      rawWebhookIncluded: false,
      trustOrRankingMutation: false,
    });

    const paymentReplay = await request(httpServer())
      .post(`/api/v1/provider-workspace/me/invoices/${invoice.invoiceId}/payment-intents`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .set('idempotency-key', 'phase9-payment-alpha-0001')
      .send({ policyVersion: 'phase9-e2e-v1' })
      .expect(201);
    expect((paymentReplay.body as PaymentResponse).paymentIntentId).toBe(payment.paymentIntentId);

    const rejectedWebhookPayload = {
      externalEventId: 'synthetic-event-rejected-0001',
      eventType: 'payment.succeeded',
      paymentIntentId: payment.paymentIntentId,
      targetStatus: 'succeeded',
      reasonCode: 'SYNTHETIC_CONFIRMED',
      occurredAt: new Date().toISOString(),
      amountMinor: 15000,
      currency: 'ZMW',
      policyVersion: 'phase9-e2e-v1',
    };
    const rejectedWebhook = await sendWebhook(rejectedWebhookPayload, '0'.repeat(64)).expect(200);
    expect(rejectedWebhook.body as WebhookResponse).toMatchObject({
      processingOutcome: 'rejected',
      signatureVerified: false,
      rawPayloadStored: false,
      productionMoneyMovement: false,
    });

    const successfulWebhookPayload = {
      ...rejectedWebhookPayload,
      externalEventId: 'synthetic-event-success-0001',
      occurredAt: new Date().toISOString(),
    };
    const successfulWebhook = await sendWebhook(successfulWebhookPayload).expect(200);
    const success = successfulWebhook.body as WebhookResponse;
    expect(success).toMatchObject({
      processingOutcome: 'processed',
      signatureVerified: true,
      timestampVerified: true,
      rejectionCode: null,
      rawPayloadStored: false,
      productionMoneyMovement: false,
      paymentIntent: {
        paymentIntentId: payment.paymentIntentId,
        status: 'succeeded',
        rawWebhookIncluded: false,
        trustOrRankingMutation: false,
      },
    });

    const workspaceAfterPayment = await request(httpServer())
      .get('/api/v1/provider-workspace/me/commercial')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    const paidWorkspace = workspaceAfterPayment.body as WorkspaceResponse;
    expect(paidWorkspace).toMatchObject({
      providerId,
      credentialStored: false,
      privateInteractionContactIncluded: false,
      verificationMutation: false,
      publicationMutation: false,
      rankingMutation: false,
    });
    expect(paidWorkspace.subscriptions[0]).toMatchObject({
      subscriptionId: subscription.subscriptionId,
      status: 'active',
      revision: 2,
    });
    expect(paidWorkspace.subscriptions[0]?.entitlements.length).toBeGreaterThan(0);
    expect(paidWorkspace.subscriptions[0]?.entitlements).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: 'active', rankingEffect: false })]),
    );
    expect(paidWorkspace.invoices[0]).toMatchObject({
      invoiceId: invoice.invoiceId,
      status: 'paid',
      totalMinor: 15000,
    });
    expect(paidWorkspace.receipts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paymentIntentId: payment.paymentIntentId,
          totalMinor: 15000,
          paymentCredentialIncluded: false,
          trustOrRankingMutation: false,
        }),
      ]),
    );

    const ledgerAfterSuccess = await pool.query<{
      transactions: string;
      entries: string;
      unbalanced: string;
    }>(
      `SELECT
         (SELECT count(*) FROM commercial.ledger_transactions WHERE provider_id = $1)::text AS transactions,
         (SELECT count(*) FROM commercial.ledger_entries WHERE provider_id = $1)::text AS entries,
         (
           SELECT count(*) FROM (
             SELECT ledger_transaction_id
             FROM commercial.ledger_entries
             WHERE provider_id = $1
             GROUP BY ledger_transaction_id
             HAVING sum(debit_minor) <> sum(credit_minor)
           ) AS imbalance
         )::text AS unbalanced`,
      [providerId],
    );
    expect(ledgerAfterSuccess.rows[0]).toEqual({
      transactions: '2',
      entries: '4',
      unbalanced: '0',
    });

    const webhookReplay = await sendWebhook(successfulWebhookPayload).expect(200);
    expect(webhookReplay.body as WebhookResponse).toMatchObject({
      webhookReceiptId: success.webhookReceiptId,
      processingOutcome: 'duplicate',
    });
    const ledgerAfterReplay = await pool.query<{ count: string }>(
      `SELECT count(*)::text AS count
       FROM commercial.ledger_transactions WHERE provider_id = $1`,
      [providerId],
    );
    expect(ledgerAfterReplay.rows[0]?.count).toBe('2');

    const conflictingReplay = {
      ...successfulWebhookPayload,
      targetStatus: 'reversed',
      reasonCode: 'SYNTHETIC_REVERSAL',
    };
    await sendWebhook(conflictingReplay).expect(409);

    const reversalPayload = {
      ...successfulWebhookPayload,
      externalEventId: 'synthetic-event-reversal-0001',
      eventType: 'payment.reversed',
      targetStatus: 'reversed',
      reasonCode: 'SYNTHETIC_REVERSAL',
      occurredAt: new Date().toISOString(),
    };
    const reversal = await sendWebhook(reversalPayload).expect(200);
    expect(reversal.body as WebhookResponse).toMatchObject({
      processingOutcome: 'processed',
      paymentIntent: { status: 'reversed' },
    });

    const workspaceAfterReversal = await request(httpServer())
      .get('/api/v1/provider-workspace/me/commercial')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    const reversedWorkspace = workspaceAfterReversal.body as WorkspaceResponse;
    const graceSubscription = reversedWorkspace.subscriptions.find(
      (item) => item.subscriptionId === subscription.subscriptionId,
    );
    expect(graceSubscription).toMatchObject({ status: 'grace', revision: 3 });
    expect(graceSubscription?.graceEndsAt).not.toBeNull();
    expect(
      reversedWorkspace.invoices.find((item) => item.invoiceId === invoice.invoiceId),
    ).toMatchObject({ status: 'open' });

    const retryPaymentCreated = await request(httpServer())
      .post(`/api/v1/provider-workspace/me/invoices/${invoice.invoiceId}/payment-intents`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .set('idempotency-key', 'phase9-payment-alpha-0002')
      .send({ policyVersion: 'phase9-e2e-v1' })
      .expect(201);
    const retryPayment = retryPaymentCreated.body as PaymentResponse;

    const mismatchPayload = {
      externalEventId: 'synthetic-event-mismatch-0001',
      eventType: 'payment.succeeded',
      paymentIntentId: retryPayment.paymentIntentId,
      targetStatus: 'succeeded',
      reasonCode: 'SYNTHETIC_CONFIRMED',
      occurredAt: new Date().toISOString(),
      amountMinor: 14999,
      currency: 'ZMW',
      policyVersion: 'phase9-e2e-v1',
    };
    const mismatch = await sendWebhook(mismatchPayload).expect(200);
    expect(mismatch.body as WebhookResponse).toMatchObject({
      processingOutcome: 'failed',
      rejectionCode: 'AMOUNT_OR_CURRENCY_MISMATCH',
      paymentIntent: { status: 'requires_action' },
      rawPayloadStored: false,
    });

    const operationsOverview = await request(httpServer())
      .get('/api/v1/operations/commercial')
      .set('authorization', `Bearer ${financeRequester.accessToken}`)
      .expect(200);
    const operations = operationsOverview.body as OperationsOverviewResponse;
    expect(operations).toMatchObject({
      rawWebhookIncluded: false,
      paymentCredentialIncluded: false,
      trustOrRankingMutation: false,
    });
    const reconciliation = operations.reconciliationCases.find(
      (item) => item.paymentIntentId === retryPayment.paymentIntentId,
    );
    expect(reconciliation).toMatchObject({
      status: 'open',
      mismatchCode: 'PAYMENT_WEBHOOK_AMOUNT_MISMATCH',
      rawWebhookIncluded: false,
      trustOrRankingMutation: false,
    });
    if (!reconciliation) throw new Error('Mismatch reconciliation fixture was not returned.');

    const investigating = await request(httpServer())
      .post(
        `/api/v1/operations/commercial/reconciliation/${reconciliation.reconciliationCaseId}/transitions`,
      )
      .set('authorization', `Bearer ${financeRequester.accessToken}`)
      .send({
        targetStatus: 'investigating',
        expectedRevision: 1,
        reasonCode: 'MISMATCH_REVIEW_STARTED',
        reason: 'Finance started the synthetic amount-mismatch investigation.',
        policyVersion: 'phase9-e2e-v1',
      })
      .expect(200);
    expect(investigating.body as ReconciliationResponse).toMatchObject({
      status: 'investigating',
      revision: 2,
    });

    const resolved = await request(httpServer())
      .post(
        `/api/v1/operations/commercial/reconciliation/${reconciliation.reconciliationCaseId}/transitions`,
      )
      .set('authorization', `Bearer ${financeRequester.accessToken}`)
      .send({
        targetStatus: 'resolved',
        expectedRevision: 2,
        reasonCode: 'SYNTHETIC_AMOUNT_REJECTED',
        reason: 'The mismatched synthetic webhook was rejected without money movement.',
        policyVersion: 'phase9-e2e-v1',
      })
      .expect(200);
    expect(resolved.body as ReconciliationResponse).toMatchObject({
      status: 'resolved',
      revision: 3,
    });

    await request(httpServer())
      .post(
        `/api/v1/operations/commercial/reconciliation/${reconciliation.reconciliationCaseId}/transitions`,
      )
      .set('authorization', `Bearer ${financeRequester.accessToken}`)
      .send({
        targetStatus: 'closed',
        expectedRevision: 3,
        reasonCode: 'CASE_CLOSED',
        reason: 'Finance closed the resolved synthetic reconciliation exception.',
        policyVersion: 'phase9-e2e-v1',
      })
      .expect(200);

    const pastDue = await request(httpServer())
      .post(
        `/api/v1/operations/commercial/subscriptions/${subscription.subscriptionId}/transitions`,
      )
      .set('authorization', `Bearer ${financeRequester.accessToken}`)
      .send({
        targetStatus: 'past_due',
        expectedRevision: 3,
        reason: 'The reversed payment left the synthetic subscription past due.',
        policyVersion: 'phase9-e2e-v1',
      })
      .expect(200);
    expect(pastDue.body as SubscriptionResponse).toMatchObject({ status: 'past_due', revision: 4 });
    expect((pastDue.body as SubscriptionResponse).entitlements).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: 'suspended' })]),
    );

    const adjustmentCreated = await request(httpServer())
      .post('/api/v1/operations/commercial/adjustments')
      .set('authorization', `Bearer ${financeRequester.accessToken}`)
      .send({
        providerId,
        invoiceId: invoice.invoiceId,
        paymentIntentId: payment.paymentIntentId,
        adjustmentType: 'synthetic_refund',
        currency: 'ZMW',
        amountMinor: 1000,
        reason: 'Request a bounded synthetic refund adjustment after the reversal test.',
        policyVersion: 'phase9-e2e-v1',
      })
      .expect(201);
    const adjustment = adjustmentCreated.body as AdjustmentResponse;
    expect(adjustment).toMatchObject({
      providerId,
      status: 'requested',
      revision: 1,
      approvals: [],
      productionMoneyMovement: false,
      trustOrRankingMutation: false,
    });

    const firstApproval = await request(httpServer())
      .post(`/api/v1/operations/commercial/adjustments/${adjustment.adjustmentRequestId}/decisions`)
      .set('authorization', `Bearer ${financeApproverOne.accessToken}`)
      .send({
        decision: 'approved',
        reason: 'First independent synthetic adjustment approval recorded.',
        policyVersion: 'phase9-e2e-v1',
      })
      .expect(200);
    expect(firstApproval.body as AdjustmentResponse).toMatchObject({ status: 'requested' });
    expect((firstApproval.body as AdjustmentResponse).approvals).toHaveLength(1);

    const secondApproval = await request(httpServer())
      .post(`/api/v1/operations/commercial/adjustments/${adjustment.adjustmentRequestId}/decisions`)
      .set('authorization', `Bearer ${financeApproverTwo.accessToken}`)
      .send({
        decision: 'approved',
        reason: 'Second independent synthetic adjustment approval recorded.',
        policyVersion: 'phase9-e2e-v1',
      })
      .expect(200);
    expect(secondApproval.body as AdjustmentResponse).toMatchObject({
      status: 'approved',
      revision: 2,
    });
    expect((secondApproval.body as AdjustmentResponse).approvals).toHaveLength(2);

    const appliedAdjustment = await request(httpServer())
      .post(`/api/v1/operations/commercial/adjustments/${adjustment.adjustmentRequestId}/apply`)
      .set('authorization', `Bearer ${financeApproverTwo.accessToken}`)
      .send({ policyVersion: 'phase9-e2e-v1' })
      .expect(200);
    expect(appliedAdjustment.body as AdjustmentResponse).toMatchObject({
      status: 'applied',
      revision: 3,
      productionMoneyMovement: false,
    });

    const balance = await pool.query<{ unbalanced: string }>(
      `SELECT count(*)::text AS unbalanced
       FROM (
         SELECT ledger_transaction_id
         FROM commercial.ledger_entries
         WHERE provider_id = $1
         GROUP BY ledger_transaction_id
         HAVING sum(debit_minor) <> sum(credit_minor)
       ) AS imbalance`,
      [providerId],
    );
    expect(balance.rows[0]?.unbalanced).toBe('0');

    await expect(
      pool.query(
        `UPDATE commercial.ledger_entries
         SET debit_minor = debit_minor + 1
         WHERE id = (SELECT id FROM commercial.ledger_entries WHERE provider_id = $1 LIMIT 1)`,
        [providerId],
      ),
    ).rejects.toThrow(/append-only/i);
    await expect(
      pool.query(
        `DELETE FROM commercial.ledger_transactions
         WHERE id = (SELECT id FROM commercial.ledger_transactions WHERE provider_id = $1 LIMIT 1)`,
        [providerId],
      ),
    ).rejects.toThrow(/append-only/i);
    await expect(
      pool.query(
        `UPDATE commercial.invoice_lines
         SET quantity = 2 WHERE invoice_id = $1`,
        [invoice.invoiceId],
      ),
    ).rejects.toThrow(/append-only/i);
    await expect(
      pool.query(
        `UPDATE commercial.subscriptions
         SET status = 'active' WHERE id = $1`,
        [subscription.subscriptionId],
      ),
    ).rejects.toThrow(/authorized state machine/i);
    await expect(
      pool.query(
        `SELECT (commercial.transition_subscription_operations(
           $1, $2, 'active', 4, $3, $4, NULL
         )).id`,
        [
          outsider.identityId,
          subscription.subscriptionId,
          'An unrelated customer cannot transition copied commercial identifiers.',
          'phase9-e2e-v1',
        ],
      ),
    ).rejects.toThrow(/not authorized/i);

    const afterTrust = await trustState();
    expect(afterTrust).toEqual(beforeTrust);

    const finalOverview = await request(httpServer())
      .get('/api/v1/operations/commercial')
      .set('authorization', `Bearer ${financeRequester.accessToken}`)
      .expect(200);
    const serialized = JSON.stringify(finalOverview.body);
    expect(serialized).not.toContain(WEBHOOK_SECRET);
    expect(serialized).not.toContain('service_role');
    expect(serialized).not.toContain('cardNumber');
    expect(serialized).not.toContain('mobileMoneyPin');
    expect(serialized).not.toContain('customerContact');
  });
});
