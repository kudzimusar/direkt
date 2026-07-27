import { afterEach, describe, expect, it, vi } from 'vitest';
import { PayPalSandboxPaymentProviderAdapter } from '../../src/commercial/paypal-sandbox-payment-provider.adapter';
import { sandboxPaymentProviderDescriptor } from '../../src/commercial/sandbox-payment-provider.registry';
import type {
  SandboxPaymentExecutionBoundary,
  SandboxPaymentInitiationInput,
} from '../../src/commercial/sandbox-payment-provider.port';

const ORDER_ID = '5O190127TN364715T';
const CAPTURE_ID = '3C679366HH908993F';

const boundary: SandboxPaymentExecutionBoundary = {
  nodeEnvironment: 'test',
  dataMode: 'synthetic-only',
  trafficMode: 'internal',
  businessFlow: 'provider_subscription',
  realMoneyApproved: false,
  participantDataIncluded: false,
  credentialSource: 'secret_manager',
};

const initiationInput: SandboxPaymentInitiationInput = {
  paymentIntentId: '33333333-3333-4333-8333-333333333333',
  externalReference: 'RC8-PAYPAL-0001',
  currency: 'USD',
  amountMinor: 100,
  expiresAt: '2026-07-26T20:00:00.000Z',
  businessFlow: 'provider_subscription',
  paymentMethod: { kind: 'hosted_checkout' },
};

function createAdapter(): PayPalSandboxPaymentProviderAdapter {
  return new PayPalSandboxPaymentProviderAdapter(
    { ...sandboxPaymentProviderDescriptor('paypal'), runtimeEnabled: true },
    {
      clientId: 'synthetic-paypal-client-id-123456',
      clientSecret: 'synthetic-paypal-client-secret-123456',
    },
    {
      baseUrl: 'https://api-m.sandbox.paypal.com',
      returnUrl: 'https://app.example.test/payments/paypal/return',
      cancelUrl: 'https://app.example.test/payments/paypal/cancel',
      timeoutMs: 5000,
    },
  );
}

function tokenResponse(): Response {
  return new Response(JSON.stringify({ access_token: 'synthetic-paypal-access-token-123456' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PayPalSandboxPaymentProviderAdapter', () => {
  it('creates an idempotent sandbox order and returns only the approved PayPal URL', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: ORDER_ID,
            status: 'CREATED',
            links: [
              {
                rel: 'approve',
                href: `https://www.sandbox.paypal.com/checkoutnow?token=${ORDER_ID}`,
              },
            ],
          }),
          { status: 201, headers: { 'content-type': 'application/json' } },
        ),
      );

    await expect(createAdapter().initiate(initiationInput, boundary)).resolves.toEqual({
      providerKey: 'paypal',
      providerReference: ORDER_ID,
      status: 'requires_action',
      redirectUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${ORDER_ID}`,
      externalDeliveryAttempted: true,
      credentialExposed: false,
      productionMoneyMovement: false,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api-m.sandbox.paypal.com/v1/oauth2/token');
    const tokenInit = fetchMock.mock.calls[0]?.[1];
    expect(tokenInit?.body).toBe('grant_type=client_credentials');
    const tokenHeaders = tokenInit?.headers as Record<string, string>;
    expect(tokenHeaders.Authorization).toMatch(/^Basic /);

    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      'https://api-m.sandbox.paypal.com/v2/checkout/orders',
    );
    const orderInit = fetchMock.mock.calls[1]?.[1];
    const orderHeaders = orderInit?.headers as Record<string, string>;
    expect(orderHeaders).toMatchObject({
      Authorization: 'Bearer synthetic-paypal-access-token-123456',
      'Content-Type': 'application/json',
      'PayPal-Request-Id': initiationInput.paymentIntentId,
    });
    expect(typeof orderInit?.body).toBe('string');
    if (typeof orderInit?.body !== 'string') {
      throw new Error('Expected PayPal order body to be JSON.');
    }
    const body = JSON.parse(orderInit.body) as Record<string, unknown>;
    expect(body).toMatchObject({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: 'RC8-PAYPAL-0001',
          custom_id: initiationInput.paymentIntentId,
          invoice_id: 'RC8-PAYPAL-0001',
          amount: { currency_code: 'USD', value: '1.00' },
        },
      ],
      application_context: {
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    });
    expect(orderInit.body).not.toContain('synthetic-paypal-client-secret');
  });

  it('never treats the server capture response as independently verified success', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: ORDER_ID, status: 'COMPLETED' }), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        }),
      );

    await expect(
      createAdapter().completeAction(
        {
          providerReference: ORDER_ID,
          expectedCurrency: 'USD',
          expectedAmountMinor: 100,
          idempotencyKey: 'RC8-PAYPAL-CAPTURE-0001',
        },
        boundary,
      ),
    ).resolves.toEqual({
      providerKey: 'paypal',
      providerReference: ORDER_ID,
      status: 'processing',
      currency: 'USD',
      amountMinor: 100,
      independentlyVerified: false,
      adjustmentStatus: 'none',
      rawPayloadIncluded: false,
      credentialIncluded: false,
    });
  });

  it('independently retrieves the order before recognizing successful capture', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: ORDER_ID,
            status: 'COMPLETED',
            purchase_units: [
              {
                amount: { currency_code: 'USD', value: '1.00' },
                payments: {
                  captures: [
                    {
                      id: CAPTURE_ID,
                      status: 'COMPLETED',
                      amount: { currency_code: 'USD', value: '1.00' },
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      );

    await expect(
      createAdapter().verifyStatus(
        {
          providerReference: ORDER_ID,
          expectedCurrency: 'USD',
          expectedAmountMinor: 100,
        },
        boundary,
      ),
    ).resolves.toEqual({
      providerKey: 'paypal',
      providerReference: ORDER_ID,
      status: 'succeeded',
      currency: 'USD',
      amountMinor: 100,
      independentlyVerified: true,
      providerTransactionId: CAPTURE_ID,
      adjustmentStatus: 'none',
      rawPayloadIncluded: false,
      credentialIncluded: false,
    });
  });

  it.each([
    { value: '2.00', currency: 'USD', code: 'AMOUNT_MISMATCH' },
    { value: '1.00', currency: 'EUR', code: 'CURRENCY_MISMATCH' },
  ])('rejects independently retrieved $code facts', async ({ value, currency, code }) => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: ORDER_ID,
            status: 'COMPLETED',
            purchase_units: [
              {
                payments: {
                  captures: [
                    {
                      id: CAPTURE_ID,
                      status: 'COMPLETED',
                      amount: { currency_code: currency, value },
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      );

    await expect(
      createAdapter().verifyStatus(
        {
          providerReference: ORDER_ID,
          expectedCurrency: 'USD',
          expectedAmountMinor: 100,
        },
        boundary,
      ),
    ).rejects.toMatchObject({ code });
  });

  it('maps a refunded capture to succeeded with an explicit accounting adjustment', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: ORDER_ID,
            status: 'COMPLETED',
            purchase_units: [
              {
                payments: {
                  captures: [
                    {
                      id: CAPTURE_ID,
                      status: 'REFUNDED',
                      amount: { currency_code: 'USD', value: '1.00' },
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      );

    await expect(
      createAdapter().verifyStatus(
        {
          providerReference: ORDER_ID,
          expectedCurrency: 'USD',
          expectedAmountMinor: 100,
        },
        boundary,
      ),
    ).resolves.toMatchObject({
      status: 'succeeded',
      adjustmentStatus: 'refunded',
      independentlyVerified: true,
    });
  });

  it('rejects ZMW before any PayPal request', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    await expect(
      createAdapter().initiate({ ...initiationInput, currency: 'ZMW' }, boundary),
    ).rejects.toMatchObject({ code: 'SYNTHETIC_PAYMENT_METHOD_REQUIRED' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('normalizes rate limits as retryable provider unavailability', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(new Response(null, { status: 429 }));

    await expect(createAdapter().initiate(initiationInput, boundary)).rejects.toMatchObject({
      name: 'SandboxPaymentProviderUnavailableError',
    });
  });
});
