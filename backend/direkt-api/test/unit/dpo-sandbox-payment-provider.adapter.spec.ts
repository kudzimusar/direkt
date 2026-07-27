import { afterEach, describe, expect, it, vi } from 'vitest';
import { DpoSandboxPaymentProviderAdapter } from '../../src/commercial/dpo-sandbox-payment-provider.adapter';
import { sandboxPaymentProviderDescriptor } from '../../src/commercial/sandbox-payment-provider.registry';
import type {
  SandboxPaymentExecutionBoundary,
  SandboxPaymentInitiationInput,
} from '../../src/commercial/sandbox-payment-provider.port';

const TRANSACTION_TOKEN = 'SYNTHETICTOKEN123456';

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
  paymentIntentId: '44444444-4444-4444-8444-444444444444',
  externalReference: 'RC8-DPO-0001',
  currency: 'ZMW',
  amountMinor: 100,
  expiresAt: '2026-07-26T20:00:00.000Z',
  businessFlow: 'provider_subscription',
  paymentMethod: { kind: 'hosted_checkout' },
};

function createAdapter(): DpoSandboxPaymentProviderAdapter {
  return new DpoSandboxPaymentProviderAdapter(
    { ...sandboxPaymentProviderDescriptor('dpo'), runtimeEnabled: true },
    { companyToken: 'synthetic-dpo-company-token-123456' },
    {
      apiUrl: 'https://secure.3gdirectpay.com/API/v6/',
      hostedUrl: 'https://secure.3gdirectpay.com/payv2.php',
      redirectUrl: 'https://app.example.test/payments/dpo/return',
      backUrl: 'https://app.example.test/payments/dpo/cancel',
      serviceType: '5525',
      serviceDate: '2026/07/26 20:00',
      paymentTimeLimitHours: 5,
      timeoutMs: 5000,
    },
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DpoSandboxPaymentProviderAdapter', () => {
  it('creates an XML token request and returns only the hosted-payment URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        `<API3G>
<Result>000</Result>
<ResultExplanation>Transaction Created</ResultExplanation>
<TransToken>${TRANSACTION_TOKEN}</TransToken>
<TransRef>SYNTHETICREF001</TransRef>
</API3G>`,
        { status: 200, headers: { 'content-type': 'application/xml' } },
      ),
    );

    await expect(createAdapter().initiate(initiationInput, boundary)).resolves.toEqual({
      providerKey: 'dpo',
      providerReference: TRANSACTION_TOKEN,
      status: 'requires_action',
      redirectUrl: `https://secure.3gdirectpay.com/payv2.php?ID=${TRANSACTION_TOKEN}`,
      externalDeliveryAttempted: true,
      credentialExposed: false,
      productionMoneyMovement: false,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://secure.3gdirectpay.com/API/v6/');
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({ 'Content-Type': 'application/xml' });
    expect(typeof init?.body).toBe('string');
    if (typeof init?.body !== 'string') {
      throw new Error('Expected DPO request body to be XML.');
    }
    expect(init.body).toContain('<Request>createToken</Request>');
    expect(init.body).toContain('<PaymentAmount>1.00</PaymentAmount>');
    expect(init.body).toContain('<PaymentCurrency>ZMW</PaymentCurrency>');
    expect(init.body).toContain('<CompanyRef>RC8-DPO-0001</CompanyRef>');
    expect(init.body).toContain('<CompanyRefUnique>1</CompanyRefUnique>');
    expect(init.body).toContain('<ServiceType>5525</ServiceType>');
    expect(init.body).toContain('<PTL>5</PTL>');
  });

  it('independently verifies the token before recognizing payment success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        `<API3G>
<Result>000</Result>
<TransactionFinalCurrency>ZMW</TransactionFinalCurrency>
<TransactionFinalAmount>1.00</TransactionFinalAmount>
<TransactionPaid>yes</TransactionPaid>
<TransactionApproval>approved</TransactionApproval>
<TransactionCompletion>completed</TransactionCompletion>
<AccRef>DPO-SYNTHETIC-001</AccRef>
</API3G>`,
        { status: 200, headers: { 'content-type': 'application/xml' } },
      ),
    );

    await expect(
      createAdapter().verifyStatus(
        {
          providerReference: TRANSACTION_TOKEN,
          expectedCurrency: 'ZMW',
          expectedAmountMinor: 100,
        },
        boundary,
      ),
    ).resolves.toEqual({
      providerKey: 'dpo',
      providerReference: TRANSACTION_TOKEN,
      status: 'succeeded',
      currency: 'ZMW',
      amountMinor: 100,
      independentlyVerified: true,
      providerTransactionId: 'DPO-SYNTHETIC-001',
      adjustmentStatus: 'none',
      rawPayloadIncluded: false,
      credentialIncluded: false,
    });
  });

  it.each([
    { amount: '2.00', currency: 'ZMW', code: 'AMOUNT_MISMATCH' },
    { amount: '1.00', currency: 'USD', code: 'CURRENCY_MISMATCH' },
  ])('rejects independently verified $code facts', async ({ amount, currency, code }) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        `<API3G>
<Result>000</Result>
<TransactionFinalCurrency>${currency}</TransactionFinalCurrency>
<TransactionFinalAmount>${amount}</TransactionFinalAmount>
<TransactionPaid>yes</TransactionPaid>
<TransactionApproval>approved</TransactionApproval>
<TransactionCompletion>completed</TransactionCompletion>
<AccRef>DPO-SYNTHETIC-001</AccRef>
</API3G>`,
        { status: 200, headers: { 'content-type': 'application/xml' } },
      ),
    );

    await expect(
      createAdapter().verifyStatus(
        {
          providerReference: TRANSACTION_TOKEN,
          expectedCurrency: 'ZMW',
          expectedAmountMinor: 100,
        },
        boundary,
      ),
    ).rejects.toMatchObject({ code });
  });

  it('does not treat hosted-return state as payment success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        `<API3G>
<Result>000</Result>
<TransactionFinalCurrency>ZMW</TransactionFinalCurrency>
<TransactionFinalAmount>1.00</TransactionFinalAmount>
<TransactionPaid>no</TransactionPaid>
<TransactionApproval>pending</TransactionApproval>
<TransactionCompletion>pending</TransactionCompletion>
</API3G>`,
        { status: 200, headers: { 'content-type': 'application/xml' } },
      ),
    );

    await expect(
      createAdapter().verifyStatus(
        {
          providerReference: TRANSACTION_TOKEN,
          expectedCurrency: 'ZMW',
          expectedAmountMinor: 100,
        },
        boundary,
      ),
    ).resolves.toMatchObject({ status: 'requires_action', independentlyVerified: true });
  });

  it('maps DPO result codes to sanitized provider rejection', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        `<API3G>
<Result>901</Result>
<ResultExplanation>Denied</ResultExplanation>
</API3G>`,
        { status: 200, headers: { 'content-type': 'application/xml' } },
      ),
    );

    await expect(createAdapter().initiate(initiationInput, boundary)).rejects.toMatchObject({
      name: 'SandboxPaymentProviderRejectedError',
      status: 422,
      message: 'DPO rejected token creation with result 901.',
    });
  });

  it('rejects non-hosted payment methods before any DPO request', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    await expect(
      createAdapter().initiate(
        {
          ...initiationInput,
          paymentMethod: {
            kind: 'mobile_money',
            accountReference: '260971000001',
            accountReferenceIsSynthetic: true,
          },
        },
        boundary,
      ),
    ).rejects.toMatchObject({ code: 'SYNTHETIC_PAYMENT_METHOD_REQUIRED' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('normalizes server failures as retryable provider unavailability', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 503 }));

    await expect(createAdapter().initiate(initiationInput, boundary)).rejects.toMatchObject({
      name: 'SandboxPaymentProviderUnavailableError',
    });
  });
});
