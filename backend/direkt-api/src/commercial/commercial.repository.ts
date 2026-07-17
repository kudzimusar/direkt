import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PoolClient } from 'pg';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { DatabaseService } from '../platform/database/database.service';
import type {
  DecideCommercialAdjustmentDto,
  RequestCommercialAdjustmentDto,
  SyntheticPaymentWebhookDto,
  TransitionCommercialProductDto,
  TransitionCommercialSubscriptionDto,
  TransitionReconciliationCaseDto,
} from './commercial.dto';
import type {
  CommercialAdjustmentApprovalView,
  CommercialAdjustmentView,
  CommercialEntitlementDefinitionView,
  CommercialEntitlementGrantView,
  CommercialInvoiceLineView,
  CommercialInvoiceView,
  CommercialPaymentEventView,
  CommercialPaymentIntentView,
  CommercialPriceView,
  CommercialProductView,
  CommercialReceiptView,
  CommercialReconciliationCaseView,
  CommercialReconciliationEventView,
  CommercialSubscriptionEventView,
  CommercialSubscriptionView,
  OperationsCommercialOverviewView,
  ProviderCommercialWorkspaceView,
  SyntheticWebhookProcessingView,
} from './commercial.types';
import { PAYMENT_PROVIDER, type PaymentProviderPort } from './payment-provider.port';

interface ProductRow {
  id: string;
  product_key: string;
  name: string;
  description: string;
  status: CommercialProductView['status'];
  policy_version: string;
}

interface PriceRow {
  id: string;
  price_key: string;
  currency: string;
  amount_minor: string;
  billing_interval: CommercialPriceView['billingInterval'];
  interval_count: number;
  status: CommercialPriceView['status'];
  effective_from: Date;
  retired_at: Date | null;
}

interface EntitlementDefinitionRow {
  entitlement_key: string;
  display_name: string;
  description: string;
  limit_value: string | null;
  limit_unit: string | null;
  status: CommercialEntitlementDefinitionView['status'];
}

interface SubscriptionRow {
  id: string;
  provider_id: string;
  product_id: string;
  product_key: string;
  product_name: string;
  price_id: string;
  price_key: string;
  currency: string;
  amount_minor: string;
  billing_interval: CommercialSubscriptionView['billingInterval'];
  status: CommercialSubscriptionView['status'];
  revision: number;
  current_period_start: Date | null;
  current_period_end: Date | null;
  grace_ends_at: Date | null;
  cancel_at_period_end: boolean;
  cancelled_at: Date | null;
  expired_at: Date | null;
  policy_version: string;
  created_at: Date;
  updated_at: Date;
}

interface SubscriptionEventRow {
  id: string;
  sequence: number;
  from_status: CommercialSubscriptionEventView['fromStatus'];
  to_status: CommercialSubscriptionEventView['toStatus'];
  actor_kind: CommercialSubscriptionEventView['actorKind'];
  reason: string;
  policy_version: string;
  occurred_at: Date;
}

interface EntitlementGrantRow {
  id: string;
  entitlement_key: string;
  display_name: string;
  description: string;
  status: CommercialEntitlementGrantView['status'];
  limit_value: string | null;
  limit_unit: string | null;
  effective_from: Date;
  effective_until: Date | null;
}

interface InvoiceRow {
  id: string;
  provider_id: string;
  subscription_id: string | null;
  invoice_number: string;
  status: CommercialInvoiceView['status'];
  revision: number;
  currency: string;
  subtotal_minor: string;
  total_minor: string;
  issued_at: Date;
  due_at: Date;
  paid_at: Date | null;
  voided_at: Date | null;
  uncollectible_at: Date | null;
  policy_version: string;
}

interface InvoiceLineRow {
  id: string;
  line_key: string;
  description: string;
  quantity: number;
  unit_amount_minor: string;
  line_total_minor: string;
}

interface PaymentRow {
  id: string;
  provider_id: string;
  invoice_id: string;
  provider_key: 'synthetic';
  external_reference: string;
  status: CommercialPaymentIntentView['status'];
  revision: number;
  currency: string;
  amount_minor: string;
  expires_at: Date;
  completed_at: Date | null;
  last_error_code: string | null;
  policy_version: string;
  created_at: Date;
  updated_at: Date;
}

interface PaymentEventRow {
  id: string;
  sequence: number;
  from_status: CommercialPaymentEventView['fromStatus'];
  to_status: CommercialPaymentEventView['toStatus'];
  event_source: CommercialPaymentEventView['eventSource'];
  reason_code: string;
  occurred_at: Date;
}

interface ReceiptRow {
  invoice_id: string;
  provider_id: string;
  subscription_id: string | null;
  invoice_number: string;
  currency: string;
  total_minor: string;
  paid_at: Date;
  payment_intent_id: string;
  provider_key: 'synthetic';
  external_reference: string;
  completed_at: Date;
}

interface WebhookReceiptRow {
  id: string;
  provider_key: string;
  external_event_id: string;
  event_fingerprint: string;
  signature_verified: boolean;
  timestamp_verified: boolean;
  payment_intent_id: string | null;
  processing_outcome: 'received' | 'processed' | 'rejected' | 'duplicate' | 'failed';
  rejection_code: string | null;
}

interface ReconciliationRow {
  id: string;
  provider_id: string;
  invoice_id: string | null;
  payment_intent_id: string | null;
  ledger_transaction_id: string | null;
  mismatch_code: string;
  expected_amount_minor: string | null;
  observed_amount_minor: string | null;
  currency: string | null;
  status: CommercialReconciliationCaseView['status'];
  revision: number;
  resolution_code: string | null;
  opened_at: Date;
  updated_at: Date;
  resolved_at: Date | null;
  closed_at: Date | null;
}

interface ReconciliationEventRow {
  id: string;
  sequence: number;
  from_status: CommercialReconciliationEventView['fromStatus'];
  to_status: CommercialReconciliationEventView['toStatus'];
  reason_code: string;
  reason: string;
  policy_version: string;
  occurred_at: Date;
}

interface AdjustmentRow {
  id: string;
  provider_id: string;
  invoice_id: string | null;
  payment_intent_id: string | null;
  adjustment_type: CommercialAdjustmentView['adjustmentType'];
  currency: string;
  amount_minor: string;
  status: CommercialAdjustmentView['status'];
  revision: number;
  request_reason: string;
  policy_version: string;
  requested_at: Date;
  updated_at: Date;
  decided_at: Date | null;
  applied_at: Date | null;
}

interface AdjustmentApprovalRow {
  id: string;
  decision: CommercialAdjustmentApprovalView['decision'];
  reason: string;
  policy_version: string;
  decided_at: Date;
}

@Injectable()
export class CommercialRepository {
  constructor(
    private readonly database: DatabaseService,
    @Inject(PAYMENT_PROVIDER) private readonly paymentProvider: PaymentProviderPort,
  ) {}

  listProducts(): Promise<CommercialProductView[]> {
    return this.database.transaction((client) => this.loadProducts(client));
  }

  providerWorkspace(actor: AuthenticatedActor): Promise<ProviderCommercialWorkspaceView> {
    return this.database.transaction(async (client) => {
      const providerId = await this.providerContext(
        client,
        actor.identityId,
        'commercial.subscriptions.read',
      );
      const subscriptionIds = await client.query<{ id: string }>(
        `SELECT id FROM commercial.subscriptions
         WHERE provider_id = $1 ORDER BY created_at DESC, id DESC`,
        [providerId],
      );
      const invoiceIds = await client.query<{ id: string }>(
        `SELECT id FROM commercial.invoices
         WHERE provider_id = $1 ORDER BY issued_at DESC, id DESC`,
        [providerId],
      );
      const paymentIds = await client.query<{ id: string }>(
        `SELECT id FROM commercial.payment_intents
         WHERE provider_id = $1 ORDER BY created_at DESC, id DESC`,
        [providerId],
      );
      return {
        providerId,
        providerScope: 'actor_resolved',
        products: await this.loadProducts(client),
        subscriptions: await Promise.all(
          subscriptionIds.rows.map((row) => this.loadSubscription(client, row.id)),
        ),
        invoices: await Promise.all(invoiceIds.rows.map((row) => this.loadInvoice(client, row.id))),
        paymentIntents: await Promise.all(
          paymentIds.rows.map((row) => this.loadPaymentIntent(client, row.id)),
        ),
        receipts: await this.loadReceipts(client, providerId),
        paymentProviderMode: this.paymentProvider.mode,
        credentialStored: false,
        privateInteractionContactIncluded: false,
        privateEvidenceIncluded: false,
        verificationMutation: false,
        publicationMutation: false,
        rankingMutation: false,
        synthetic: true,
      };
    });
  }

  createSubscription(
    actor: AuthenticatedActor,
    productKey: string,
    priceKey: string,
    policyVersion: string,
    keyHash: string,
    fingerprint: string,
    requestId?: string,
  ): Promise<CommercialSubscriptionView> {
    return this.database.transaction(async (client) => {
      const result = await client.query<{ id: string }>(
        `SELECT (commercial.create_subscription($1, $2, $3, $4, $5, $6, $7)).id AS id`,
        [
          actor.identityId,
          productKey,
          priceKey,
          policyVersion,
          keyHash,
          fingerprint,
          requestId ?? null,
        ],
      );
      const id = result.rows[0]?.id;
      if (!id) throw new Error('Commercial subscription creation returned no identifier.');
      return this.loadSubscription(client, id);
    });
  }

  cancelSubscription(
    actor: AuthenticatedActor,
    subscriptionId: string,
    expectedRevision: number,
    reason: string,
    policyVersion: string,
    requestId?: string,
  ): Promise<CommercialSubscriptionView> {
    return this.database.transaction(async (client) => {
      await client.query(
        `SELECT (commercial.cancel_provider_subscription($1, $2, $3, $4, $5, $6)).id`,
        [
          actor.identityId,
          subscriptionId,
          expectedRevision,
          reason,
          policyVersion,
          requestId ?? null,
        ],
      );
      return this.loadSubscription(client, subscriptionId);
    });
  }

  issueInvoice(
    actor: AuthenticatedActor,
    subscriptionId: string,
    policyVersion: string,
    requestId?: string,
  ): Promise<CommercialInvoiceView> {
    return this.database.transaction(async (client) => {
      const result = await client.query<{ id: string }>(
        `SELECT (commercial.issue_subscription_invoice($1, $2, $3, $4)).id AS id`,
        [actor.identityId, subscriptionId, policyVersion, requestId ?? null],
      );
      const id = result.rows[0]?.id;
      if (!id) throw new Error('Commercial invoice issuance returned no identifier.');
      return this.loadInvoice(client, id);
    });
  }

  createPaymentIntent(
    actor: AuthenticatedActor,
    invoiceId: string,
    policyVersion: string,
    keyHash: string,
    fingerprint: string,
    requestId?: string,
  ): Promise<CommercialPaymentIntentView> {
    return this.database.transaction(async (client) => {
      const result = await client.query<{ id: string }>(
        `SELECT (commercial.create_payment_intent($1, $2, $3, $4, $5, $6)).id AS id`,
        [actor.identityId, invoiceId, policyVersion, keyHash, fingerprint, requestId ?? null],
      );
      const id = result.rows[0]?.id;
      if (!id) throw new Error('Commercial payment intent creation returned no identifier.');
      return this.loadPaymentIntent(client, id);
    });
  }

  cancelPaymentIntent(
    actor: AuthenticatedActor,
    paymentIntentId: string,
    expectedRevision: number,
    policyVersion: string,
    requestId?: string,
  ): Promise<CommercialPaymentIntentView> {
    return this.database.transaction(async (client) => {
      await client.query(
        `SELECT (commercial.cancel_provider_payment_intent($1, $2, $3, $4, $5)).id`,
        [actor.identityId, paymentIntentId, expectedRevision, policyVersion, requestId ?? null],
      );
      return this.loadPaymentIntent(client, paymentIntentId);
    });
  }

  processSyntheticWebhook(
    dto: SyntheticPaymentWebhookDto,
    signatureVerified: boolean,
    timestampVerified: boolean,
    eventFingerprint: string,
  ): Promise<SyntheticWebhookProcessingView> {
    return this.database.transaction(async (client) => {
      const existing = await client.query<WebhookReceiptRow>(
        `SELECT id, provider_key, external_event_id, event_fingerprint,
                signature_verified, timestamp_verified, payment_intent_id,
                processing_outcome, rejection_code
         FROM commercial.webhook_receipts
         WHERE provider_key = 'synthetic' AND external_event_id = $1
         FOR UPDATE`,
        [dto.externalEventId],
      );
      const replay = existing.rows[0];
      if (replay) {
        if (replay.event_fingerprint !== eventFingerprint) {
          throw new ConflictException(
            'The webhook event identifier was reused with a different payload.',
          );
        }
        return {
          webhookReceiptId: replay.id,
          processingOutcome: 'duplicate',
          signatureVerified: replay.signature_verified,
          timestampVerified: replay.timestamp_verified,
          rejectionCode: replay.rejection_code,
          paymentIntent: replay.payment_intent_id
            ? await this.loadPaymentIntent(client, replay.payment_intent_id)
            : null,
          rawPayloadStored: false,
          productionMoneyMovement: false,
        };
      }

      const receiptResult = await client.query<WebhookReceiptRow>(
        `SELECT receipt.id, receipt.provider_key, receipt.external_event_id,
                receipt.event_fingerprint, receipt.signature_verified,
                receipt.timestamp_verified, receipt.payment_intent_id,
                receipt.processing_outcome, receipt.rejection_code
         FROM commercial.record_webhook_receipt(
           'synthetic', $1, $2, $3, $4, $5, $6, $7, $8::jsonb
         ) AS receipt`,
        [
          dto.externalEventId,
          dto.eventType,
          eventFingerprint,
          signatureVerified,
          timestampVerified,
          dto.paymentIntentId,
          dto.occurredAt,
          JSON.stringify({
            targetStatus: dto.targetStatus,
            amountMinor: dto.amountMinor,
            currency: dto.currency,
            rawPayloadStored: false,
          }),
        ],
      );
      const receipt = receiptResult.rows[0];
      if (!receipt) throw new Error('Webhook receipt creation returned no row.');
      if (!signatureVerified || !timestampVerified) {
        return {
          webhookReceiptId: receipt.id,
          processingOutcome: 'rejected',
          signatureVerified,
          timestampVerified,
          rejectionCode: receipt.rejection_code,
          paymentIntent: null,
          rawPayloadStored: false,
          productionMoneyMovement: false,
        };
      }

      const paymentScope = await client.query<{
        provider_id: string;
        invoice_id: string;
        currency: string;
        amount_minor: string;
      }>(
        `SELECT provider_id, invoice_id, currency, amount_minor
         FROM commercial.payment_intents WHERE id = $1 FOR UPDATE`,
        [dto.paymentIntentId],
      );
      const payment = paymentScope.rows[0];
      if (!payment) throw new NotFoundException('Synthetic payment intent was not found.');
      if (payment.currency !== dto.currency || Number(payment.amount_minor) !== dto.amountMinor) {
        await client.query(`SELECT set_config('direkt.commercial_write', 'on', true)`);
        await client.query(
          `UPDATE commercial.webhook_receipts
           SET processing_outcome = 'failed', processed_at = now(),
               rejection_code = 'AMOUNT_OR_CURRENCY_MISMATCH'
           WHERE id = $1`,
          [receipt.id],
        );
        await client.query(
          `SELECT (commercial.open_reconciliation_case(
             $1, $2, $3, NULL, 'PAYMENT_WEBHOOK_AMOUNT_MISMATCH',
             $4, $5, $6, $7
           )).id`,
          [
            payment.provider_id,
            payment.invoice_id,
            dto.paymentIntentId,
            Number(payment.amount_minor),
            dto.amountMinor,
            payment.currency,
            dto.policyVersion,
          ],
        );
        return {
          webhookReceiptId: receipt.id,
          processingOutcome: 'failed',
          signatureVerified: true,
          timestampVerified: true,
          rejectionCode: 'AMOUNT_OR_CURRENCY_MISMATCH',
          paymentIntent: await this.loadPaymentIntent(client, dto.paymentIntentId),
          rawPayloadStored: false,
          productionMoneyMovement: false,
        };
      }

      await client.query(
        `SELECT (commercial.process_verified_payment_webhook($1, $2, $3, $4)).id`,
        [receipt.id, dto.targetStatus, dto.reasonCode, dto.policyVersion],
      );
      return {
        webhookReceiptId: receipt.id,
        processingOutcome: 'processed',
        signatureVerified: true,
        timestampVerified: true,
        rejectionCode: null,
        paymentIntent: await this.loadPaymentIntent(client, dto.paymentIntentId),
        rawPayloadStored: false,
        productionMoneyMovement: false,
      };
    });
  }

  operationsOverview(): Promise<OperationsCommercialOverviewView> {
    return this.database.transaction(async (client) => {
      const subscriptionIds = await client.query<{ id: string }>(
        `SELECT id FROM commercial.subscriptions ORDER BY updated_at DESC, id DESC`,
      );
      const invoiceIds = await client.query<{ id: string }>(
        `SELECT id FROM commercial.invoices ORDER BY issued_at DESC, id DESC`,
      );
      const paymentIds = await client.query<{ id: string }>(
        `SELECT id FROM commercial.payment_intents ORDER BY updated_at DESC, id DESC`,
      );
      const reconciliationIds = await client.query<{ id: string }>(
        `SELECT id FROM commercial.reconciliation_cases ORDER BY opened_at DESC, id DESC`,
      );
      const adjustmentIds = await client.query<{ id: string }>(
        `SELECT id FROM commercial.adjustment_requests ORDER BY requested_at DESC, id DESC`,
      );
      return {
        products: await this.loadProducts(client),
        subscriptions: await Promise.all(
          subscriptionIds.rows.map((row) => this.loadSubscription(client, row.id)),
        ),
        invoices: await Promise.all(invoiceIds.rows.map((row) => this.loadInvoice(client, row.id))),
        paymentIntents: await Promise.all(
          paymentIds.rows.map((row) => this.loadPaymentIntent(client, row.id)),
        ),
        reconciliationCases: await Promise.all(
          reconciliationIds.rows.map((row) => this.loadReconciliation(client, row.id)),
        ),
        adjustments: await Promise.all(
          adjustmentIds.rows.map((row) => this.loadAdjustment(client, row.id)),
        ),
        rawWebhookIncluded: false,
        paymentCredentialIncluded: false,
        privateInteractionContactIncluded: false,
        trustOrRankingMutation: false,
      };
    });
  }

  transitionSubscriptionOperations(
    actor: AuthenticatedActor,
    subscriptionId: string,
    dto: TransitionCommercialSubscriptionDto,
    requestId?: string,
  ): Promise<CommercialSubscriptionView> {
    return this.database.transaction(async (client) => {
      await client.query(
        `SELECT (commercial.transition_subscription_operations($1, $2, $3, $4, $5, $6, $7)).id`,
        [
          actor.identityId,
          subscriptionId,
          dto.targetStatus,
          dto.expectedRevision,
          dto.reason,
          dto.policyVersion,
          requestId ?? null,
        ],
      );
      return this.loadSubscription(client, subscriptionId);
    });
  }

  transitionReconciliation(
    actor: AuthenticatedActor,
    reconciliationCaseId: string,
    dto: TransitionReconciliationCaseDto,
    requestId?: string,
  ): Promise<CommercialReconciliationCaseView> {
    return this.database.transaction(async (client) => {
      await client.query(
        `SELECT (commercial.transition_reconciliation_case($1, $2, $3, $4, $5, $6, $7, $8)).id`,
        [
          actor.identityId,
          reconciliationCaseId,
          dto.targetStatus,
          dto.expectedRevision,
          dto.reasonCode,
          dto.reason,
          dto.policyVersion,
          requestId ?? null,
        ],
      );
      return this.loadReconciliation(client, reconciliationCaseId);
    });
  }

  transitionProduct(
    actor: AuthenticatedActor,
    productId: string,
    dto: TransitionCommercialProductDto,
    requestId?: string,
  ): Promise<CommercialProductView> {
    return this.database.transaction(async (client) => {
      await client.query(`SELECT (commercial.transition_product($1, $2, $3, $4, $5, $6)).id`, [
        actor.identityId,
        productId,
        dto.targetStatus,
        dto.reason,
        dto.policyVersion,
        requestId ?? null,
      ]);
      const product = (await this.loadProducts(client)).find(
        (item) => item.productId === productId,
      );
      if (!product) throw new NotFoundException('Commercial product was not found.');
      return product;
    });
  }

  requestAdjustment(
    actor: AuthenticatedActor,
    dto: RequestCommercialAdjustmentDto,
    requestId?: string,
  ): Promise<CommercialAdjustmentView> {
    return this.database.transaction(async (client) => {
      const result = await client.query<{ id: string }>(
        `SELECT (commercial.request_adjustment($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)).id AS id`,
        [
          actor.identityId,
          dto.providerId,
          dto.invoiceId ?? null,
          dto.paymentIntentId ?? null,
          dto.adjustmentType,
          dto.currency,
          dto.amountMinor,
          dto.reason,
          dto.policyVersion,
          requestId ?? null,
        ],
      );
      const id = result.rows[0]?.id;
      if (!id) throw new Error('Commercial adjustment request returned no identifier.');
      return this.loadAdjustment(client, id);
    });
  }

  decideAdjustment(
    actor: AuthenticatedActor,
    adjustmentId: string,
    dto: DecideCommercialAdjustmentDto,
    requestId?: string,
  ): Promise<CommercialAdjustmentView> {
    return this.database.transaction(async (client) => {
      await client.query(`SELECT (commercial.decide_adjustment($1, $2, $3, $4, $5, $6)).id`, [
        actor.identityId,
        adjustmentId,
        dto.decision,
        dto.reason,
        dto.policyVersion,
        requestId ?? null,
      ]);
      return this.loadAdjustment(client, adjustmentId);
    });
  }

  applyAdjustment(
    actor: AuthenticatedActor,
    adjustmentId: string,
    policyVersion: string,
    requestId?: string,
  ): Promise<CommercialAdjustmentView> {
    return this.database.transaction(async (client) => {
      await client.query(`SELECT (commercial.apply_adjustment($1, $2, $3, $4)).id`, [
        actor.identityId,
        adjustmentId,
        policyVersion,
        requestId ?? null,
      ]);
      return this.loadAdjustment(client, adjustmentId);
    });
  }

  private async providerContext(
    client: PoolClient,
    identityId: string,
    permission: string,
  ): Promise<string> {
    const result = await client.query<{ provider_id: string }>(
      `SELECT commercial.resolve_provider_context($1, $2) AS provider_id`,
      [identityId, permission],
    );
    const providerId = result.rows[0]?.provider_id;
    if (!providerId) throw new NotFoundException('Commercial provider workspace was not found.');
    return providerId;
  }

  private async loadProducts(client: PoolClient): Promise<CommercialProductView[]> {
    const products = await client.query<ProductRow>(
      `SELECT id, product_key, name, description, status, policy_version
       FROM commercial.products ORDER BY product_key`,
    );
    return Promise.all(
      products.rows.map(async (product) => {
        const prices = await client.query<PriceRow>(
          `SELECT id, price_key, currency, amount_minor, billing_interval,
                  interval_count, status, effective_from, retired_at
           FROM commercial.prices WHERE product_id = $1
           ORDER BY effective_from DESC, price_key`,
          [product.id],
        );
        const entitlements = await client.query<EntitlementDefinitionRow>(
          `SELECT entitlement_key, display_name, description, limit_value, limit_unit, status
           FROM commercial.product_entitlements WHERE product_id = $1
           ORDER BY entitlement_key`,
          [product.id],
        );
        return {
          productId: product.id,
          productKey: product.product_key,
          name: product.name,
          description: product.description,
          status: product.status,
          policyVersion: product.policy_version,
          prices: prices.rows.map((price) => ({
            priceId: price.id,
            priceKey: price.price_key,
            currency: price.currency,
            amountMinor: Number(price.amount_minor),
            billingInterval: price.billing_interval,
            intervalCount: price.interval_count,
            status: price.status,
            effectiveFrom: price.effective_from.toISOString(),
            retiredAt: price.retired_at?.toISOString() ?? null,
          })),
          entitlements: entitlements.rows.map((entitlement) => ({
            entitlementKey: entitlement.entitlement_key,
            displayName: entitlement.display_name,
            description: entitlement.description,
            limitValue: entitlement.limit_value === null ? null : Number(entitlement.limit_value),
            limitUnit: entitlement.limit_unit,
            status: entitlement.status,
          })),
          verificationIncluded: false,
          publicationIncluded: false,
          rankingIncluded: false,
          synthetic: true,
        };
      }),
    );
  }

  private async loadSubscription(
    client: PoolClient,
    subscriptionId: string,
  ): Promise<CommercialSubscriptionView> {
    const result = await client.query<SubscriptionRow>(
      `SELECT subscriptions.id, subscriptions.provider_id, subscriptions.product_id,
              products.product_key, products.name AS product_name,
              subscriptions.price_id, prices.price_key, prices.currency,
              prices.amount_minor, prices.billing_interval, subscriptions.status,
              subscriptions.revision, subscriptions.current_period_start,
              subscriptions.current_period_end, subscriptions.grace_ends_at,
              subscriptions.cancel_at_period_end, subscriptions.cancelled_at,
              subscriptions.expired_at, subscriptions.policy_version,
              subscriptions.created_at, subscriptions.updated_at
       FROM commercial.subscriptions AS subscriptions
       JOIN commercial.products AS products ON products.id = subscriptions.product_id
       JOIN commercial.prices AS prices ON prices.id = subscriptions.price_id
       WHERE subscriptions.id = $1`,
      [subscriptionId],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Commercial subscription was not found.');
    const events = await client.query<SubscriptionEventRow>(
      `SELECT id, sequence, from_status, to_status, actor_kind,
              reason, policy_version, occurred_at
       FROM commercial.subscription_events
       WHERE subscription_id = $1 ORDER BY sequence`,
      [subscriptionId],
    );
    const grants = await client.query<EntitlementGrantRow>(
      `SELECT grants.id, grants.entitlement_key, definitions.display_name,
              definitions.description, grants.status, grants.limit_value,
              grants.limit_unit, grants.effective_from, grants.effective_until
       FROM commercial.entitlement_grants AS grants
       JOIN commercial.product_entitlements AS definitions
         ON definitions.product_id = grants.product_id
        AND definitions.entitlement_key = grants.entitlement_key
       WHERE grants.subscription_id = $1 ORDER BY grants.entitlement_key`,
      [subscriptionId],
    );
    return {
      subscriptionId: row.id,
      providerId: row.provider_id,
      productId: row.product_id,
      productKey: row.product_key,
      productName: row.product_name,
      priceId: row.price_id,
      priceKey: row.price_key,
      currency: row.currency,
      amountMinor: Number(row.amount_minor),
      billingInterval: row.billing_interval,
      status: row.status,
      revision: row.revision,
      currentPeriodStart: row.current_period_start?.toISOString() ?? null,
      currentPeriodEnd: row.current_period_end?.toISOString() ?? null,
      graceEndsAt: row.grace_ends_at?.toISOString() ?? null,
      cancelAtPeriodEnd: row.cancel_at_period_end,
      cancelledAt: row.cancelled_at?.toISOString() ?? null,
      expiredAt: row.expired_at?.toISOString() ?? null,
      policyVersion: row.policy_version,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      entitlements: grants.rows.map((grant) => ({
        entitlementGrantId: grant.id,
        entitlementKey: grant.entitlement_key,
        displayName: grant.display_name,
        description: grant.description,
        status: grant.status,
        limitValue: grant.limit_value === null ? null : Number(grant.limit_value),
        limitUnit: grant.limit_unit,
        effectiveFrom: grant.effective_from.toISOString(),
        effectiveUntil: grant.effective_until?.toISOString() ?? null,
        verificationEffect: false,
        publicationEffect: false,
        rankingEffect: false,
      })),
      events: events.rows.map((event) => ({
        eventId: event.id,
        sequence: event.sequence,
        fromStatus: event.from_status,
        toStatus: event.to_status,
        actorKind: event.actor_kind,
        reason: event.reason,
        policyVersion: event.policy_version,
        occurredAt: event.occurred_at.toISOString(),
        actorIdentityExposed: false,
        privateMetadataIncluded: false,
      })),
      trustOrRankingMutation: false,
      synthetic: true,
    };
  }

  private async loadInvoice(client: PoolClient, invoiceId: string): Promise<CommercialInvoiceView> {
    const result = await client.query<InvoiceRow>(
      `SELECT id, provider_id, subscription_id, invoice_number, status, revision,
              currency, subtotal_minor, total_minor, issued_at, due_at, paid_at,
              voided_at, uncollectible_at, policy_version
       FROM commercial.invoices WHERE id = $1`,
      [invoiceId],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Commercial invoice was not found.');
    const lines = await client.query<InvoiceLineRow>(
      `SELECT id, line_key, description, quantity, unit_amount_minor, line_total_minor
       FROM commercial.invoice_lines WHERE invoice_id = $1 ORDER BY created_at, id`,
      [invoiceId],
    );
    const mappedLines: CommercialInvoiceLineView[] = lines.rows.map((line) => ({
      invoiceLineId: line.id,
      lineKey: line.line_key,
      description: line.description,
      quantity: line.quantity,
      unitAmountMinor: Number(line.unit_amount_minor),
      lineTotalMinor: Number(line.line_total_minor),
    }));
    return {
      invoiceId: row.id,
      providerId: row.provider_id,
      subscriptionId: row.subscription_id,
      invoiceNumber: row.invoice_number,
      status: row.status,
      revision: row.revision,
      currency: row.currency,
      subtotalMinor: Number(row.subtotal_minor),
      totalMinor: Number(row.total_minor),
      issuedAt: row.issued_at.toISOString(),
      dueAt: row.due_at.toISOString(),
      paidAt: row.paid_at?.toISOString() ?? null,
      voidedAt: row.voided_at?.toISOString() ?? null,
      uncollectibleAt: row.uncollectible_at?.toISOString() ?? null,
      policyVersion: row.policy_version,
      lines: mappedLines,
      paymentCredentialIncluded: false,
      customerContactIncluded: false,
      privateEvidenceIncluded: false,
    };
  }

  private async loadPaymentIntent(
    client: PoolClient,
    paymentIntentId: string,
  ): Promise<CommercialPaymentIntentView> {
    const result = await client.query<PaymentRow>(
      `SELECT id, provider_id, invoice_id, provider_key, external_reference,
              status, revision, currency, amount_minor, expires_at, completed_at,
              last_error_code, policy_version, created_at, updated_at
       FROM commercial.payment_intents WHERE id = $1`,
      [paymentIntentId],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Commercial payment intent was not found.');
    const events = await client.query<PaymentEventRow>(
      `SELECT id, sequence, from_status, to_status, event_source, reason_code, occurred_at
       FROM commercial.payment_events WHERE payment_intent_id = $1 ORDER BY sequence`,
      [paymentIntentId],
    );
    const action =
      row.status === 'requires_action'
        ? this.paymentProvider.createAction({
            externalReference: row.external_reference,
            currency: row.currency,
            amountMinor: Number(row.amount_minor),
            expiresAt: row.expires_at.toISOString(),
          })
        : {
            mode: this.paymentProvider.mode,
            state: 'unavailable' as const,
            instruction:
              row.status === 'succeeded'
                ? 'Payment is backend-confirmed; no further action is required.'
                : 'No payment action is available for the current backend-confirmed state.',
            externalDeliveryAttempted: false as const,
            credentialRequested: false as const,
            productionMoneyMovement: false as const,
          };
    return {
      paymentIntentId: row.id,
      providerId: row.provider_id,
      invoiceId: row.invoice_id,
      providerKey: row.provider_key,
      externalReference: row.external_reference,
      status: row.status,
      revision: row.revision,
      currency: row.currency,
      amountMinor: Number(row.amount_minor),
      expiresAt: row.expires_at.toISOString(),
      completedAt: row.completed_at?.toISOString() ?? null,
      lastErrorCode: row.last_error_code,
      policyVersion: row.policy_version,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      events: events.rows.map((event) => ({
        eventId: event.id,
        sequence: event.sequence,
        fromStatus: event.from_status,
        toStatus: event.to_status,
        eventSource: event.event_source,
        reasonCode: event.reason_code,
        occurredAt: event.occurred_at.toISOString(),
        rawPayloadIncluded: false,
        credentialIncluded: false,
      })),
      action,
      paymentCredentialIncluded: false,
      customerContactIncluded: false,
      rawWebhookIncluded: false,
      trustOrRankingMutation: false,
      synthetic: true,
    };
  }

  private async loadReceipts(
    client: PoolClient,
    providerId: string,
  ): Promise<CommercialReceiptView[]> {
    const receipts = await client.query<ReceiptRow>(
      `SELECT invoice_id, provider_id, subscription_id, invoice_number,
              currency, total_minor, paid_at, payment_intent_id,
              provider_key, external_reference, completed_at
       FROM commercial.safe_receipts
       WHERE provider_id = $1 ORDER BY paid_at DESC`,
      [providerId],
    );
    return receipts.rows.map((receipt) => ({
      invoiceId: receipt.invoice_id,
      providerId: receipt.provider_id,
      subscriptionId: receipt.subscription_id,
      invoiceNumber: receipt.invoice_number,
      currency: receipt.currency,
      totalMinor: Number(receipt.total_minor),
      paidAt: receipt.paid_at.toISOString(),
      paymentIntentId: receipt.payment_intent_id,
      providerKey: receipt.provider_key,
      externalReference: receipt.external_reference,
      completedAt: receipt.completed_at.toISOString(),
      paymentCredentialIncluded: false,
      customerContactIncluded: false,
      trustOrRankingMutation: false,
      synthetic: true,
    }));
  }

  private async loadReconciliation(
    client: PoolClient,
    reconciliationId: string,
  ): Promise<CommercialReconciliationCaseView> {
    const result = await client.query<ReconciliationRow>(
      `SELECT id, provider_id, invoice_id, payment_intent_id, ledger_transaction_id,
              mismatch_code, expected_amount_minor, observed_amount_minor, currency,
              status, revision, resolution_code, opened_at, updated_at, resolved_at, closed_at
       FROM commercial.reconciliation_cases WHERE id = $1`,
      [reconciliationId],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Commercial reconciliation case was not found.');
    const events = await client.query<ReconciliationEventRow>(
      `SELECT id, sequence, from_status, to_status, reason_code,
              reason, policy_version, occurred_at
       FROM commercial.reconciliation_events
       WHERE reconciliation_case_id = $1 ORDER BY sequence`,
      [reconciliationId],
    );
    return {
      reconciliationCaseId: row.id,
      providerId: row.provider_id,
      invoiceId: row.invoice_id,
      paymentIntentId: row.payment_intent_id,
      ledgerTransactionId: row.ledger_transaction_id,
      mismatchCode: row.mismatch_code,
      expectedAmountMinor:
        row.expected_amount_minor === null ? null : Number(row.expected_amount_minor),
      observedAmountMinor:
        row.observed_amount_minor === null ? null : Number(row.observed_amount_minor),
      currency: row.currency,
      status: row.status,
      revision: row.revision,
      resolutionCode: row.resolution_code,
      openedAt: row.opened_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      resolvedAt: row.resolved_at?.toISOString() ?? null,
      closedAt: row.closed_at?.toISOString() ?? null,
      events: events.rows.map((event) => ({
        eventId: event.id,
        sequence: event.sequence,
        fromStatus: event.from_status,
        toStatus: event.to_status,
        reasonCode: event.reason_code,
        reason: event.reason,
        policyVersion: event.policy_version,
        occurredAt: event.occurred_at.toISOString(),
        actorIdentityExposed: false,
      })),
      rawWebhookIncluded: false,
      privateEvidenceIncluded: false,
      trustOrRankingMutation: false,
    };
  }

  private async loadAdjustment(
    client: PoolClient,
    adjustmentId: string,
  ): Promise<CommercialAdjustmentView> {
    const result = await client.query<AdjustmentRow>(
      `SELECT id, provider_id, invoice_id, payment_intent_id, adjustment_type,
              currency, amount_minor, status, revision, request_reason,
              policy_version, requested_at, updated_at, decided_at, applied_at
       FROM commercial.adjustment_requests WHERE id = $1`,
      [adjustmentId],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Commercial adjustment request was not found.');
    const approvals = await client.query<AdjustmentApprovalRow>(
      `SELECT id, decision, reason, policy_version, decided_at
       FROM commercial.adjustment_approvals
       WHERE adjustment_request_id = $1 ORDER BY decided_at, id`,
      [adjustmentId],
    );
    return {
      adjustmentRequestId: row.id,
      providerId: row.provider_id,
      invoiceId: row.invoice_id,
      paymentIntentId: row.payment_intent_id,
      adjustmentType: row.adjustment_type,
      currency: row.currency,
      amountMinor: Number(row.amount_minor),
      status: row.status,
      revision: row.revision,
      requestReason: row.request_reason,
      policyVersion: row.policy_version,
      requestedAt: row.requested_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      decidedAt: row.decided_at?.toISOString() ?? null,
      appliedAt: row.applied_at?.toISOString() ?? null,
      approvals: approvals.rows.map((approval) => ({
        approvalId: approval.id,
        decision: approval.decision,
        reason: approval.reason,
        policyVersion: approval.policy_version,
        decidedAt: approval.decided_at.toISOString(),
        approverIdentityExposed: false,
      })),
      productionMoneyMovement: false,
      trustOrRankingMutation: false,
    };
  }
}
