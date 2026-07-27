import { afterEach, describe, expect, it, vi } from 'vitest';
import { sandboxPaymentProviderDescriptor } from '../../src/commercial/sandbox-payment-provider.registry';
import type {
  SandboxPaymentExecutionBoundary,
  SandboxPaymentInitiationInput,
} from '../../src/commercial/sandbox-payment-provider.port';
import { StripeSandboxPaymentProviderAdapter } from '../../src/commercial/stripe-sandbox-payment-provider.adapter';

const PAYMENT_INTENT_ID = '22222222-2222-4222-8222-222222222222';
const SESSION_ID = 'cs_test_synthetic_session_123';

const boundary: SandboxPaymentExecutionBoundary = {
  nodeEnvironment: 'test',
  dataMode: 'synthetic-only',
  trafficMode: 'internal',
  businessFlow: 'verification_processing_fee',
  realMoneyApproved: false,
  participantDataIncluded: false,
  credentialSource: 'secret_manager',
};

const initiationInput: SandboxPaymentInitiationInput = {
  paymentIntentId: PAYMENT_INTENT_ID,
  externalReference: 'RC8-STRIPE-0001',
  currency: 'USD',
  amountMinor: 100,
  expiresAt: '2026-07-26T20:00:00.000Z',
  businessFlow: 'verification_processing_fee',
  paymentMethod: { kind: 'hosted_checkout' },
};

function createAdapter(): StripeSandboxPaymentProviderAdapter {
  return new StripeSandboxPaymentProviderAdapter(
    { ...sandboxPaymentProviderDescriptor('stripe'), runtimeEnabled: true },
    { secretKey: 'sk_test_synthetic_account_key_1234567890' },
    {
      baseUrl: 'https://api.stripe.com',
      apiVersion: '2025-06-30.basil',
      successUrl: 'https://app.example.test/payments/success',
      cancelUrl: 'https://app.example.test/payments/cancel',
      timeoutMs: 5000,
    },
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('StripeSandboxPaymentProviderAdapter', () => {
  it('creates an idempotent hosted Checkout Session without exposing the secret key', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: SESSION_ID,
          url: 'https://checkout.stripe.com/c/pay/cs_test_synthetic_session_123',
          status: 'open',
          payment_status: 'unpaid',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    await expect(createAdapter().initiate(initiationInput, boundary)).resolves.toEqual({
      providerKey: 'stripe',
      providerReference: SESSION_ID,
      status: 'requires_action',
      redirectUrl: 'https://checkout.stripe.com/c/pay/cs_test_synthetic_session_123',
      externalDeliveryAttempted: true,
      credentialExposed: false,
      productionMoneyMovement: false,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.stripe.com/v1/checkout/sessions');
    const init = fetchMock.mock.calls[0]?.[1];
    const headers = init?.headers as Record<string, string>;
    expect(headers).toMatchObject({
      Authorization: 'Bearer sk_test_synthetic_account_key_1234567890',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': PAYMENT_INTENT_ID,
      'Stripe-Version': '2025-06-30.basil',
    });
    expect(typeof init?.body).toBe('string');
    if (typeof init?.body !== 'string') {
      throw new Error('Expected Stripe Checkout body to be form encoded.');
    }
    const form = new URLSearchParams(init.body);
    expect(form.get('mode')).toBe('payment');
    expect(form.get('client_reference_id')).toBe('RC8-STRIPE-0001');
    expect(form.get('metadata[direkt_payment_intent_id]')).toBe(PAYMENT_INTENT_ID);
    expect(form.get('line_items[0][price_data][currency]')).toBe('usd');
    expect(form.get('line_items[0][price_data][unit_amount]')).toBe('100');
    expect(form.get('line_items[0][price_data][product_data][name]')).toBe(
      'DIREKT verification processing fee',
    );
    expect(init.body).not.toContain('sk_test_');
  });

  it('independently requires complete and paid status with exact amount and currency', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: SESSION_ID,
          status: 'complete',
          payment_status: 'paid',
          amount_total: 100,
          currency: 'usd',
          payment_intent: 'pi_synthetic_payment_intent_123',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    await expect(
      createAdapter().verifyStatus(
        {
          providerReference: SESSION_ID,
          expectedCurrency: 'USD',
          expectedAmountMinor: 100,
        },
        boundary,
      ),
    ).resolves.toEqual({
      providerKey: 'stripe',
      providerReference: SESSION_ID,
      status: 'succeeded',
      currency: 'USD',
      amountMinor: 100,
      independentlyVerified: true,
      providerTransactionId: 'pi_synthetic_payment_intent_123',
      rawPayloadIncluded: false,
      credentialIncluded: false,
    });
  });

  it.each([
    { amount_total: 200, currency: 'usd', code: 'AMOUNT_MISMATCH' },
    { amount_total: 100, currency: 'eur', code: 'CURRENCY_MISMATCH' },
  ])('rejects independently retrieved $code facts', async ({ amount_total, currency, code }) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: SESSION_ID,
          status: 'complete',
          payment_status: 'paid',
          amount_total,
          currency,
          payment_intent: 'pi_synthetic_payment_intent_123',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    await expect(
      createAdapter().verifyStatus(
        {
          providerReference: SESSION_ID,
          expectedCurrency: 'USD',
          expectedAmountMinor: 100,
        },
        boundary,
      ),
    ).rejects.toMatchObject({ code });
  });

  it('does not treat an open unpaid Checkout Session as payment success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: SESSION_ID,
          status: 'open',
          payment_status: 'unpaid',
          amount_total: 100,
          currency: 'usd',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    await expect(
      createAdapter().verifyStatus(
        {
          providerReference: SESSION_ID,
          expectedCurrency: 'USD',
          expectedAmountMinor: 100,
        },
        boundary,
      ),
    ).resolves.toMatchObject({ status: 'requires_action', independentlyVerified: true });
  });

  it('rejects ZMW because the reviewed Stripe provider descriptor does not support it', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    await expect(
      createAdapter().initiate({ ...initiationInput, currency: 'ZMW' }, boundary),
    ).rejects.toMatchObject({ code: 'SYNTHETIC_PAYMENT_METHOD_REQUIRED' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('normalizes rate limits as retryable provider unavailability', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 429 }));

    await expect(createAdapter().initiate(initiationInput, boundary)).rejects.toMatchObject({
      name: 'SandboxPaymentProviderUnavailableError',
    });
  });

  it('treats non-retryable provider responses as rejected Checkout creation', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 400 }));

    await expect(createAdapter().initiate(initiationInput, boundary)).rejects.toMatchObject({
      name: 'SandboxPaymentProviderRejectedError',
      status: 400,
    });
  });
});
