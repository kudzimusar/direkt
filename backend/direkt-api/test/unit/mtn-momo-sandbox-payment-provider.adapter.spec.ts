import { afterEach, describe, expect, it, vi } from 'vitest';
import { MtnMomoSandboxPaymentProviderAdapter } from '../../src/commercial/mtn-momo-sandbox-payment-provider.adapter';
import { sandboxPaymentProviderDescriptor } from '../../src/commercial/sandbox-payment-provider.registry';
import type {
  SandboxPaymentExecutionBoundary,
  SandboxPaymentInitiationInput,
} from '../../src/commercial/sandbox-payment-provider.port';

const PAYMENT_INTENT_ID = '11111111-1111-4111-8111-111111111111';
const CALLBACK_URL = 'https://payments.example.test/api/v1/payments/mtn/callback';

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
  paymentIntentId: PAYMENT_INTENT_ID,
  externalReference: 'RC8-MTN-0001',
  currency: 'EUR',
  amountMinor: 100,
  expiresAt: '2026-07-26T20:00:00.000Z',
  businessFlow: 'provider_subscription',
  paymentMethod: {
    kind: 'mobile_money',
    accountReference: '46733123470',
    accountReferenceIsSynthetic: true,
  },
};

function createAdapter(
  configuration: { callbackUrl?: string } = { callbackUrl: CALLBACK_URL },
): MtnMomoSandboxPaymentProviderAdapter {
  return new MtnMomoSandboxPaymentProviderAdapter(
    { ...sandboxPaymentProviderDescriptor('mtn_momo'), runtimeEnabled: true },
    {
      collectionSubscriptionKey: 'synthetic-subscription-key-123456',
      apiUser: '11111111-1111-4111-8111-111111111112',
      apiKey: 'synthetic-api-key-1234567890',
    },
    {
      baseUrl: 'https://sandbox.momodeveloper.mtn.com',
      targetEnvironment: 'sandbox',
      ...(configuration.callbackUrl ? { callbackUrl: configuration.callbackUrl } : {}),
      timeoutMs: 5000,
    },
  );
}

function tokenResponse(): Response {
  return new Response(JSON.stringify({ access_token: 'synthetic-access-token-1234567890' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MtnMomoSandboxPaymentProviderAdapter', () => {
  it('creates a bounded Request to Pay and treats HTTP 202 as processing only', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(new Response(null, { status: 202 }));

    const result = await createAdapter().initiate(initiationInput, boundary);

    expect(result).toEqual({
      providerKey: 'mtn_momo',
      providerReference: PAYMENT_INTENT_ID,
      status: 'processing',
      externalDeliveryAttempted: true,
      credentialExposed: false,
      productionMoneyMovement: false,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'https://sandbox.momodeveloper.mtn.com/collection/token/',
    );
    const tokenHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(tokenHeaders.Authorization).toMatch(/^Basic /);
    expect(tokenHeaders['Ocp-Apim-Subscription-Key']).toBe('synthetic-subscription-key-123456');

    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      'https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay',
    );
    const requestInit = fetchMock.mock.calls[1]?.[1];
    const requestHeaders = requestInit?.headers as Record<string, string>;
    expect(requestHeaders).toMatchObject({
      Authorization: 'Bearer synthetic-access-token-1234567890',
      'Ocp-Apim-Subscription-Key': 'synthetic-subscription-key-123456',
      'X-Callback-Url': CALLBACK_URL,
      'X-Reference-Id': PAYMENT_INTENT_ID,
      'X-Target-Environment': 'sandbox',
    });
    expect(typeof requestInit?.body).toBe('string');
    if (typeof requestInit?.body !== 'string') {
      throw new Error('Expected MTN Request to Pay body to be a JSON string.');
    }
    const body = JSON.parse(requestInit.body) as Record<string, unknown>;
    expect(body).toMatchObject({
      amount: '1.00',
      currency: 'EUR',
      externalId: 'RC8-MTN-0001',
      payer: { partyIdType: 'MSISDN', partyId: '46733123470' },
    });
    expect(JSON.stringify(body)).not.toContain('synthetic-api-key');
    expect(JSON.stringify(body)).not.toContain('synthetic-subscription-key');
  });

  it('supports status-polling-only initiation without a callback header', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(new Response(null, { status: 202 }));

    await expect(createAdapter({}).initiate(initiationInput, boundary)).resolves.toMatchObject({
      status: 'processing',
      providerReference: PAYMENT_INTENT_ID,
    });

    const requestHeaders = fetchMock.mock.calls[1]?.[1]?.headers as Record<string, string>;
    expect(requestHeaders).not.toHaveProperty('X-Callback-Url');
    expect(requestHeaders['X-Reference-Id']).toBe(PAYMENT_INTENT_ID);
  });

  it('independently verifies a successful status with exact amount and currency', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            amount: '1.00',
            currency: 'EUR',
            financialTransactionId: 'synthetic-financial-transaction-123',
            status: 'SUCCESSFUL',
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      );

    await expect(
      createAdapter().verifyStatus(
        {
          providerReference: PAYMENT_INTENT_ID,
          expectedCurrency: 'EUR',
          expectedAmountMinor: 100,
        },
        boundary,
      ),
    ).resolves.toEqual({
      providerKey: 'mtn_momo',
      providerReference: PAYMENT_INTENT_ID,
      status: 'succeeded',
      currency: 'EUR',
      amountMinor: 100,
      independentlyVerified: true,
      providerTransactionId: 'synthetic-financial-transaction-123',
      rawPayloadIncluded: false,
      credentialIncluded: false,
    });
  });

  it.each([
    {
      payload: { amount: '2.00', currency: 'EUR', status: 'SUCCESSFUL' },
      code: 'AMOUNT_MISMATCH',
    },
    {
      payload: { amount: '1.00', currency: 'USD', status: 'SUCCESSFUL' },
      code: 'CURRENCY_MISMATCH',
    },
  ])('rejects independently verified $code provider facts', async ({ payload, code }) => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

    await expect(
      createAdapter().verifyStatus(
        {
          providerReference: PAYMENT_INTENT_ID,
          expectedCurrency: 'EUR',
          expectedAmountMinor: 100,
        },
        boundary,
      ),
    ).rejects.toMatchObject({ code });
  });

  it('requires a synthetic mobile-money account before any provider request', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    await expect(
      createAdapter().initiate(
        {
          ...initiationInput,
          paymentMethod: {
            kind: 'mobile_money',
            accountReference: '46733123470',
            accountReferenceIsSynthetic: false,
          },
        },
        boundary,
      ),
    ).rejects.toMatchObject({ code: 'SYNTHETIC_PAYMENT_METHOD_REQUIRED' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('normalizes rate limits and server failures as retryable provider unavailability', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(new Response(null, { status: 429 }));

    await expect(createAdapter().initiate(initiationInput, boundary)).rejects.toMatchObject({
      name: 'SandboxPaymentProviderUnavailableError',
    });
  });

  it('treats non-retryable provider responses as rejected payment initiation', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(new Response(null, { status: 400 }));

    await expect(createAdapter().initiate(initiationInput, boundary)).rejects.toMatchObject({
      name: 'SandboxPaymentProviderRejectedError',
      status: 400,
    });
  });
});
