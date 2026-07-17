import type { ConfigService } from '@nestjs/config';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type {
  PaymentActionInput,
  PaymentProviderPort,
  PaymentWebhookVerification,
  PaymentWebhookVerificationInput,
} from './payment-provider.port';
import type { CommercialPaymentActionView } from './commercial.types';

const MAX_WEBHOOK_AGE_SECONDS = 5 * 60;

export class SyntheticPaymentProviderAdapter implements PaymentProviderPort {
  public readonly mode = 'synthetic' as const;
  private readonly webhookSecret: string;

  constructor(configService: ConfigService) {
    this.webhookSecret = configService.getOrThrow<string>('PAYMENT_SYNTHETIC_WEBHOOK_SECRET');
  }

  createAction(input: PaymentActionInput): CommercialPaymentActionView {
    return {
      mode: 'synthetic',
      state: 'requires_action',
      instruction: `Complete the synthetic payment scenario for ${input.externalReference}. No money will move.`,
      externalDeliveryAttempted: false,
      credentialRequested: false,
      productionMoneyMovement: false,
    };
  }

  verifyWebhook(input: PaymentWebhookVerificationInput): PaymentWebhookVerification {
    const eventFingerprint = createHash('sha256')
      .update(input.canonicalPayload, 'utf8')
      .digest('hex');
    const timestampSeconds = this.parseTimestamp(input.timestamp);
    const receivedSeconds = Math.floor(input.receivedAt.getTime() / 1000);
    const timestampVerified =
      timestampSeconds !== null &&
      Math.abs(receivedSeconds - timestampSeconds) <= MAX_WEBHOOK_AGE_SECONDS;
    const signatureVerified = this.verifySignature(
      input.signature,
      input.timestamp,
      input.canonicalPayload,
    );
    return {
      signatureVerified,
      timestampVerified,
      eventFingerprint,
    };
  }

  private verifySignature(
    signature: string | undefined,
    timestamp: string | undefined,
    canonicalPayload: string,
  ): boolean {
    if (!signature || !timestamp || !/^[0-9a-f]{64}$/.test(signature)) {
      return false;
    }
    const expected = createHmac('sha256', this.webhookSecret)
      .update(`${timestamp}.${canonicalPayload}`, 'utf8')
      .digest();
    const supplied = Buffer.from(signature, 'hex');
    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
  }

  private parseTimestamp(value: string | undefined): number | null {
    if (!value || !/^\d{10}$/.test(value)) {
      return null;
    }
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : null;
  }
}
