import { createHash } from 'node:crypto';
import type {
  PaymentProviderPort,
  PaymentWebhookVerification,
  PaymentWebhookVerificationInput,
} from './payment-provider.port';
import type { CommercialPaymentActionView } from './commercial.types';

export class DisabledPaymentProviderAdapter implements PaymentProviderPort {
  public readonly mode = 'disabled' as const;

  createAction(): CommercialPaymentActionView {
    return {
      mode: 'disabled',
      state: 'unavailable',
      instruction:
        'Payment initiation is disabled until a reviewed provider integration is approved.',
      externalDeliveryAttempted: false,
      credentialRequested: false,
      productionMoneyMovement: false,
    };
  }

  verifyWebhook(input: PaymentWebhookVerificationInput): PaymentWebhookVerification {
    return {
      signatureVerified: false,
      timestampVerified: false,
      eventFingerprint: createHash('sha256').update(input.canonicalPayload, 'utf8').digest('hex'),
    };
  }
}
