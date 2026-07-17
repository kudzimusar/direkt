import { ServiceUnavailableException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type {
  PaymentActionInput,
  PaymentProviderPort,
  PaymentWebhookVerification,
  PaymentWebhookVerificationInput,
} from './payment-provider.port';
import type { CommercialPaymentActionView } from './commercial.types';

export class DisabledPaymentProviderAdapter implements PaymentProviderPort {
  public readonly mode = 'disabled' as const;

  createAction(_input: PaymentActionInput): CommercialPaymentActionView {
    throw new ServiceUnavailableException(
      'Payment initiation is disabled until a reviewed provider integration is approved.',
    );
  }

  verifyWebhook(input: PaymentWebhookVerificationInput): PaymentWebhookVerification {
    return {
      signatureVerified: false,
      timestampVerified: false,
      eventFingerprint: createHash('sha256')
        .update(input.canonicalPayload, 'utf8')
        .digest('hex'),
    };
  }
}
