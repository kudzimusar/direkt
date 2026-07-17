import type { CommercialPaymentActionView } from './commercial.types';

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');

export interface PaymentActionInput {
  externalReference: string;
  currency: string;
  amountMinor: number;
  expiresAt: string;
}

export interface PaymentWebhookVerificationInput {
  canonicalPayload: string;
  signature: string | undefined;
  timestamp: string | undefined;
  receivedAt: Date;
}

export interface PaymentWebhookVerification {
  signatureVerified: boolean;
  timestampVerified: boolean;
  eventFingerprint: string;
}

export interface PaymentProviderPort {
  readonly mode: 'synthetic' | 'disabled';
  createAction(input: PaymentActionInput): CommercialPaymentActionView;
  verifyWebhook(input: PaymentWebhookVerificationInput): PaymentWebhookVerification;
}
