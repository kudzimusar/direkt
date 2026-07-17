import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { DisabledPaymentProviderAdapter } from '../../src/commercial/disabled-payment-provider.adapter';
import { SyntheticPaymentProviderAdapter } from '../../src/commercial/synthetic-payment-provider.adapter';

const SECRET = 'direkt-unit-test-synthetic-payment-webhook-secret-not-for-production-00001';

describe('Phase 9 payment provider boundary', () => {
  it('returns a synthetic action without credentials or money movement', () => {
    const adapter = new SyntheticPaymentProviderAdapter(
      new ConfigService({ PAYMENT_SYNTHETIC_WEBHOOK_SECRET: SECRET }),
    );

    expect(
      adapter.createAction({
        externalReference: 'SYN-PAY-0123456789ABCDEF',
        currency: 'ZMW',
        amountMinor: 15000,
        expiresAt: '2026-07-17T03:00:00.000Z',
      }),
    ).toMatchObject({
      mode: 'synthetic',
      state: 'requires_action',
      externalDeliveryAttempted: false,
      credentialRequested: false,
      productionMoneyMovement: false,
    });
  });

  it('verifies a fresh canonical synthetic webhook signature', () => {
    const adapter = new SyntheticPaymentProviderAdapter(
      new ConfigService({ PAYMENT_SYNTHETIC_WEBHOOK_SECRET: SECRET }),
    );
    const receivedAt = new Date('2026-07-17T02:00:00.000Z');
    const timestamp = String(Math.floor(receivedAt.getTime() / 1000));
    const canonicalPayload = JSON.stringify({
      externalEventId: 'synthetic-event-0001',
      paymentIntentId: '00000000-0000-4000-8000-000000009999',
      targetStatus: 'succeeded',
      amountMinor: 15000,
      currency: 'ZMW',
    });
    const signature = createHmac('sha256', SECRET)
      .update(`${timestamp}.${canonicalPayload}`, 'utf8')
      .digest('hex');

    expect(
      adapter.verifyWebhook({ canonicalPayload, signature, timestamp, receivedAt }),
    ).toMatchObject({
      signatureVerified: true,
      timestampVerified: true,
    });
  });

  it('rejects invalid or stale synthetic webhook evidence', () => {
    const adapter = new SyntheticPaymentProviderAdapter(
      new ConfigService({ PAYMENT_SYNTHETIC_WEBHOOK_SECRET: SECRET }),
    );
    const receivedAt = new Date('2026-07-17T02:10:00.000Z');
    const timestamp = String(Math.floor(new Date('2026-07-17T02:00:00.000Z').getTime() / 1000));

    expect(
      adapter.verifyWebhook({
        canonicalPayload: '{"safe":true}',
        signature: '0'.repeat(64),
        timestamp,
        receivedAt,
      }),
    ).toMatchObject({
      signatureVerified: false,
      timestampVerified: false,
    });
  });

  it('keeps disabled payment history readable without enabling action', () => {
    const adapter = new DisabledPaymentProviderAdapter();

    expect(
      adapter.createAction({
        externalReference: 'SYN-PAY-HISTORICAL',
        currency: 'ZMW',
        amountMinor: 15000,
        expiresAt: '2026-07-17T03:00:00.000Z',
      }),
    ).toMatchObject({
      mode: 'disabled',
      state: 'unavailable',
      credentialRequested: false,
      productionMoneyMovement: false,
    });
  });
});
