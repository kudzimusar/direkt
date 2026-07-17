import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import type {
  CancelCommercialPaymentIntentDto,
  CancelCommercialSubscriptionDto,
  CommercialPolicyDto,
  CreateCommercialPaymentIntentDto,
  CreateCommercialSubscriptionDto,
  DecideCommercialAdjustmentDto,
  RequestCommercialAdjustmentDto,
  SyntheticPaymentWebhookDto,
  TransitionCommercialProductDto,
  TransitionCommercialSubscriptionDto,
  TransitionReconciliationCaseDto,
} from './commercial.dto';
import { CommercialRepository } from './commercial.repository';
import type {
  CommercialAdjustmentView,
  CommercialInvoiceView,
  CommercialPaymentIntentView,
  CommercialProductView,
  CommercialReconciliationCaseView,
  CommercialSubscriptionView,
  OperationsCommercialOverviewView,
  ProviderCommercialWorkspaceView,
  SyntheticWebhookProcessingView,
} from './commercial.types';
import { PAYMENT_PROVIDER, type PaymentProviderPort } from './payment-provider.port';

@Injectable()
export class CommercialService {
  constructor(
    private readonly repository: CommercialRepository,
    @Inject(PAYMENT_PROVIDER) private readonly paymentProvider: PaymentProviderPort,
  ) {}

  products(): Promise<CommercialProductView[]> {
    return this.repository.listProducts();
  }

  providerWorkspace(actor: AuthenticatedActor): Promise<ProviderCommercialWorkspaceView> {
    return this.run(this.repository.providerWorkspace(actor));
  }

  createSubscription(
    actor: AuthenticatedActor,
    dto: CreateCommercialSubscriptionDto,
    idempotencyKey: string | undefined,
    requestId?: string,
  ): Promise<CommercialSubscriptionView> {
    const normalizedKey = this.requireIdempotencyKey(idempotencyKey);
    const fingerprint = this.hash(
      JSON.stringify({
        productKey: dto.productKey,
        priceKey: dto.priceKey,
        policyVersion: dto.policyVersion.trim(),
      }),
    );
    return this.run(
      this.repository.createSubscription(
        actor,
        dto.productKey,
        dto.priceKey,
        dto.policyVersion.trim(),
        this.hash(normalizedKey),
        fingerprint,
        requestId,
      ),
    );
  }

  cancelSubscription(
    actor: AuthenticatedActor,
    subscriptionId: string,
    dto: CancelCommercialSubscriptionDto,
    requestId?: string,
  ): Promise<CommercialSubscriptionView> {
    return this.run(
      this.repository.cancelSubscription(
        actor,
        subscriptionId,
        dto.expectedRevision,
        dto.reason.trim(),
        dto.policyVersion.trim(),
        requestId,
      ),
    );
  }

  issueInvoice(
    actor: AuthenticatedActor,
    subscriptionId: string,
    dto: CommercialPolicyDto,
    requestId?: string,
  ): Promise<CommercialInvoiceView> {
    return this.run(
      this.repository.issueInvoice(actor, subscriptionId, dto.policyVersion.trim(), requestId),
    );
  }

  createPaymentIntent(
    actor: AuthenticatedActor,
    invoiceId: string,
    dto: CreateCommercialPaymentIntentDto,
    idempotencyKey: string | undefined,
    requestId?: string,
  ): Promise<CommercialPaymentIntentView> {
    if (this.paymentProvider.mode !== 'synthetic') {
      throw new ServiceUnavailableException(
        'Payment initiation is disabled until a reviewed provider integration is approved.',
      );
    }
    const normalizedKey = this.requireIdempotencyKey(idempotencyKey);
    const fingerprint = this.hash(
      JSON.stringify({
        invoiceId,
        policyVersion: dto.policyVersion.trim(),
        providerMode: this.paymentProvider.mode,
      }),
    );
    return this.run(
      this.repository.createPaymentIntent(
        actor,
        invoiceId,
        dto.policyVersion.trim(),
        this.hash(normalizedKey),
        fingerprint,
        requestId,
      ),
    );
  }

  cancelPaymentIntent(
    actor: AuthenticatedActor,
    paymentIntentId: string,
    dto: CancelCommercialPaymentIntentDto,
    requestId?: string,
  ): Promise<CommercialPaymentIntentView> {
    return this.run(
      this.repository.cancelPaymentIntent(
        actor,
        paymentIntentId,
        dto.expectedRevision,
        dto.policyVersion.trim(),
        requestId,
      ),
    );
  }

  processSyntheticWebhook(
    dto: SyntheticPaymentWebhookDto,
    signature: string | undefined,
    timestamp: string | undefined,
  ): Promise<SyntheticWebhookProcessingView> {
    if (this.paymentProvider.mode !== 'synthetic') {
      throw new ServiceUnavailableException('Payment webhook processing is disabled.');
    }
    const canonicalPayload = this.canonicalWebhookPayload(dto);
    const verification = this.paymentProvider.verifyWebhook({
      canonicalPayload,
      signature,
      timestamp,
      receivedAt: new Date(),
    });
    return this.run(
      this.repository.processSyntheticWebhook(
        dto,
        verification.signatureVerified,
        verification.timestampVerified,
        verification.eventFingerprint,
      ),
    );
  }

  operationsOverview(): Promise<OperationsCommercialOverviewView> {
    return this.run(this.repository.operationsOverview());
  }

  transitionSubscriptionOperations(
    actor: AuthenticatedActor,
    subscriptionId: string,
    dto: TransitionCommercialSubscriptionDto,
    requestId?: string,
  ): Promise<CommercialSubscriptionView> {
    return this.run(
      this.repository.transitionSubscriptionOperations(actor, subscriptionId, dto, requestId),
    );
  }

  transitionReconciliation(
    actor: AuthenticatedActor,
    reconciliationCaseId: string,
    dto: TransitionReconciliationCaseDto,
    requestId?: string,
  ): Promise<CommercialReconciliationCaseView> {
    return this.run(
      this.repository.transitionReconciliation(actor, reconciliationCaseId, dto, requestId),
    );
  }

  transitionProduct(
    actor: AuthenticatedActor,
    productId: string,
    dto: TransitionCommercialProductDto,
    requestId?: string,
  ): Promise<CommercialProductView> {
    return this.run(this.repository.transitionProduct(actor, productId, dto, requestId));
  }

  requestAdjustment(
    actor: AuthenticatedActor,
    dto: RequestCommercialAdjustmentDto,
    requestId?: string,
  ): Promise<CommercialAdjustmentView> {
    return this.run(this.repository.requestAdjustment(actor, dto, requestId));
  }

  decideAdjustment(
    actor: AuthenticatedActor,
    adjustmentId: string,
    dto: DecideCommercialAdjustmentDto,
    requestId?: string,
  ): Promise<CommercialAdjustmentView> {
    return this.run(this.repository.decideAdjustment(actor, adjustmentId, dto, requestId));
  }

  applyAdjustment(
    actor: AuthenticatedActor,
    adjustmentId: string,
    dto: CommercialPolicyDto,
    requestId?: string,
  ): Promise<CommercialAdjustmentView> {
    return this.run(
      this.repository.applyAdjustment(
        actor,
        adjustmentId,
        dto.policyVersion.trim(),
        requestId,
      ),
    );
  }

  canonicalWebhookPayload(dto: SyntheticPaymentWebhookDto): string {
    return JSON.stringify({
      externalEventId: dto.externalEventId,
      eventType: dto.eventType,
      paymentIntentId: dto.paymentIntentId,
      targetStatus: dto.targetStatus,
      reasonCode: dto.reasonCode,
      occurredAt: dto.occurredAt,
      amountMinor: dto.amountMinor,
      currency: dto.currency,
      policyVersion: dto.policyVersion,
    });
  }

  private requireIdempotencyKey(value: string | undefined): string {
    const normalized = value?.trim();
    if (!normalized || normalized.length < 8 || normalized.length > 200) {
      throw new BadRequestException('A valid Idempotency-Key header is required.');
    }
    return normalized;
  }

  private hash(value: string): string {
    return createHash('sha256').update(value, 'utf8').digest('hex');
  }

  private async run<T>(operation: Promise<T>): Promise<T> {
    try {
      return await operation;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }
      const databaseError = error as { code?: string; message?: string };
      const message = databaseError.message ?? 'Commercial operation failed.';
      if (databaseError.code === '23505' || databaseError.code === '23P01') {
        throw new ConflictException('A conflicting commercial record already exists.');
      }
      if (databaseError.code === '23514' || databaseError.code === '22P02') {
        throw new BadRequestException('Commercial request failed a bounded data rule.');
      }
      if (/not authorized|unambiguous active commercial provider/i.test(message)) {
        throw new ForbiddenException('Commercial action is not authorized.');
      }
      if (/not found/i.test(message)) {
        throw new NotFoundException('Commercial record was not found.');
      }
      if (
        /revision conflict|transition is not allowed|already in the target state|cannot be cancelled|no longer awaiting|idempotency key/i.test(
          message,
        )
      ) {
        throw new ConflictException(message);
      }
      if (/requires|does not permit|must be|cannot create|scope does not match/i.test(message)) {
        throw new BadRequestException(message);
      }
      throw error;
    }
  }
}
