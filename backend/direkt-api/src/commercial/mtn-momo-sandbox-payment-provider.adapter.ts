import {
  assertSandboxPaymentBoundary,
  SandboxPaymentBoundaryError,
  SandboxPaymentProviderRejectedError,
  SandboxPaymentProviderUnavailableError,
  SandboxPaymentVerificationMismatchError,
  type SandboxPaymentExecutionBoundary,
  type SandboxPaymentInitiationInput,
  type SandboxPaymentInitiationResult,
  type SandboxPaymentProviderDescriptor,
  type SandboxPaymentProviderPort,
  type SandboxPaymentStatusInput,
  type SandboxPaymentStatusResult,
} from './sandbox-payment-provider.port';

const MTN_SANDBOX_BASE_URL = 'https://sandbox.momodeveloper.mtn.com';
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_CURRENCY = /^[A-Z]{3}$/;
const SYNTHETIC_MSISDN = /^\d{10,15}$/;
const EXTERNAL_REFERENCE = /^[A-Za-z0-9._:-]{1,64}$/;

export interface MtnMomoSandboxCredentials {
  collectionSubscriptionKey: string;
  apiUser: string;
  apiKey: string;
}

export interface MtnMomoSandboxConfiguration {
  baseUrl: typeof MTN_SANDBOX_BASE_URL;
  targetEnvironment: 'sandbox';
  callbackUrl: string;
  timeoutMs: number;
}

interface MtnMomoTokenResponse {
  access_token?: unknown;
}

interface MtnMomoStatusResponse {
  amount?: unknown;
  currency?: unknown;
  financialTransactionId?: unknown;
  status?: unknown;
}

export class MtnMomoSandboxPaymentProviderAdapter implements SandboxPaymentProviderPort {
  constructor(
    public readonly descriptor: SandboxPaymentProviderDescriptor,
    private readonly credentials: MtnMomoSandboxCredentials,
    private readonly configuration: MtnMomoSandboxConfiguration,
  ) {
    if (descriptor.key !== 'mtn_momo' || descriptor.targetEnvironment !== 'sandbox') {
      throw new Error('MTN MoMo adapter requires the reviewed MTN sandbox descriptor.');
    }
    if (configuration.baseUrl !== MTN_SANDBOX_BASE_URL) {
      throw new Error('MTN MoMo sandbox base URL must match the approved provider host.');
    }
    const callbackUrl = new URL(configuration.callbackUrl);
    if (callbackUrl.protocol !== 'https:' || callbackUrl.username || callbackUrl.password) {
      throw new Error('MTN MoMo callback URL must be credential-free HTTPS.');
    }
    if (!Number.isInteger(configuration.timeoutMs) || configuration.timeoutMs < 1000) {
      throw new Error('MTN MoMo timeout must be at least 1000 milliseconds.');
    }
    for (const value of [
      credentials.collectionSubscriptionKey,
      credentials.apiUser,
      credentials.apiKey,
    ]) {
      if (value.length < 8 || value.length > 512) {
        throw new Error('MTN MoMo sandbox credentials are missing or malformed.');
      }
    }
  }

  async initiate(
    input: SandboxPaymentInitiationInput,
    boundary: SandboxPaymentExecutionBoundary,
  ): Promise<SandboxPaymentInitiationResult> {
    assertSandboxPaymentBoundary(this.descriptor, boundary);
    this.assertInitiationInput(input, boundary);
    const accessToken = await this.createAccessToken();
    const response = await this.providerFetch(
      `${this.configuration.baseUrl}/collection/v1_0/requesttopay`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': this.credentials.collectionSubscriptionKey,
          'X-Callback-Url': this.configuration.callbackUrl,
          'X-Reference-Id': input.paymentIntentId,
          'X-Target-Environment': this.configuration.targetEnvironment,
        },
        body: JSON.stringify({
          amount: minorToDecimal(input.amountMinor),
          currency: input.currency,
          externalId: input.externalReference,
          payer: {
            partyIdType: 'MSISDN',
            partyId:
              input.paymentMethod.kind === 'mobile_money'
                ? input.paymentMethod.accountReference
                : '',
          },
          payerMessage: 'DIREKT synthetic provider fee',
          payeeNote: 'DIREKT synthetic payment',
        }),
        signal: AbortSignal.timeout(this.configuration.timeoutMs),
      },
    );

    if (response.status !== 202) {
      await this.throwForProviderResponse(response, 'request to pay');
    }

    return {
      providerKey: 'mtn_momo',
      providerReference: input.paymentIntentId,
      status: 'processing',
      externalDeliveryAttempted: true,
      credentialExposed: false,
      productionMoneyMovement: false,
    };
  }

  async verifyStatus(
    input: SandboxPaymentStatusInput,
    boundary: SandboxPaymentExecutionBoundary,
  ): Promise<SandboxPaymentStatusResult> {
    assertSandboxPaymentBoundary(this.descriptor, boundary);
    if (!UUID_V4.test(input.providerReference)) {
      throw new SandboxPaymentVerificationMismatchError(
        'MALFORMED_STATUS',
        'MTN MoMo provider reference is not a UUID v4.',
      );
    }
    if (
      !ISO_CURRENCY.test(input.expectedCurrency) ||
      !Number.isSafeInteger(input.expectedAmountMinor)
    ) {
      throw new SandboxPaymentVerificationMismatchError(
        'MALFORMED_STATUS',
        'Expected payment amount or currency is malformed.',
      );
    }

    const accessToken = await this.createAccessToken();
    const response = await this.providerFetch(
      `${this.configuration.baseUrl}/collection/v1_0/requesttopay/${encodeURIComponent(input.providerReference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': this.credentials.collectionSubscriptionKey,
          'X-Target-Environment': this.configuration.targetEnvironment,
        },
        signal: AbortSignal.timeout(this.configuration.timeoutMs),
      },
    );

    if (!response.ok) {
      await this.throwForProviderResponse(response, 'payment status');
    }

    const payload = await this.parseJson<MtnMomoStatusResponse>(response, 'payment status');
    const currency = typeof payload.currency === 'string' ? payload.currency : '';
    const amountMinor = typeof payload.amount === 'string' ? decimalToMinor(payload.amount) : null;
    const status = normalizeMtnStatus(payload.status);

    if (!ISO_CURRENCY.test(currency) || amountMinor === null || status === null) {
      throw new SandboxPaymentVerificationMismatchError(
        'MALFORMED_STATUS',
        'MTN MoMo returned a malformed payment status response.',
      );
    }
    if (currency !== input.expectedCurrency) {
      throw new SandboxPaymentVerificationMismatchError(
        'CURRENCY_MISMATCH',
        'MTN MoMo payment currency does not match the DIREKT intent.',
      );
    }
    if (amountMinor !== input.expectedAmountMinor) {
      throw new SandboxPaymentVerificationMismatchError(
        'AMOUNT_MISMATCH',
        'MTN MoMo payment amount does not match the DIREKT intent.',
      );
    }

    const transactionId = payload.financialTransactionId;
    if (
      status === 'succeeded' &&
      (typeof transactionId !== 'string' || transactionId.length < 1 || transactionId.length > 256)
    ) {
      throw new SandboxPaymentVerificationMismatchError(
        'MALFORMED_STATUS',
        'MTN MoMo successful payment status omitted the provider transaction id.',
      );
    }

    return {
      providerKey: 'mtn_momo',
      providerReference: input.providerReference,
      status,
      currency,
      amountMinor,
      independentlyVerified: true,
      ...(typeof transactionId === 'string' ? { providerTransactionId: transactionId } : {}),
      rawPayloadIncluded: false,
      credentialIncluded: false,
    };
  }

  private assertInitiationInput(
    input: SandboxPaymentInitiationInput,
    boundary: SandboxPaymentExecutionBoundary,
  ): void {
    if (input.businessFlow !== boundary.businessFlow) {
      throw new SandboxPaymentBoundaryError(
        'UNAUTHORIZED_PAYMENT_FLOW',
        'Payment intent flow does not match the approved execution boundary.',
      );
    }
    if (
      input.paymentMethod.kind !== 'mobile_money' ||
      !input.paymentMethod.accountReferenceIsSynthetic ||
      !SYNTHETIC_MSISDN.test(input.paymentMethod.accountReference)
    ) {
      throw new SandboxPaymentBoundaryError(
        'SYNTHETIC_PAYMENT_METHOD_REQUIRED',
        'MTN MoMo RC8 execution requires a bounded synthetic mobile-money account.',
      );
    }
    if (!UUID_V4.test(input.paymentIntentId)) {
      throw new SandboxPaymentBoundaryError(
        'SYNTHETIC_PAYMENT_METHOD_REQUIRED',
        'MTN MoMo payment intent id must be a stable UUID v4.',
      );
    }
    if (!EXTERNAL_REFERENCE.test(input.externalReference)) {
      throw new SandboxPaymentBoundaryError(
        'SYNTHETIC_PAYMENT_METHOD_REQUIRED',
        'MTN MoMo external reference must be bounded and non-sensitive.',
      );
    }
    if (
      !ISO_CURRENCY.test(input.currency) ||
      !Number.isSafeInteger(input.amountMinor) ||
      input.amountMinor <= 0
    ) {
      throw new SandboxPaymentBoundaryError(
        'SYNTHETIC_PAYMENT_METHOD_REQUIRED',
        'MTN MoMo amount and currency must be valid synthetic payment values.',
      );
    }
  }

  private async createAccessToken(): Promise<string> {
    const basic = Buffer.from(
      `${this.credentials.apiUser}:${this.credentials.apiKey}`,
      'utf8',
    ).toString('base64');
    const response = await this.providerFetch(`${this.configuration.baseUrl}/collection/token/`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Ocp-Apim-Subscription-Key': this.credentials.collectionSubscriptionKey,
      },
      signal: AbortSignal.timeout(this.configuration.timeoutMs),
    });

    if (!response.ok) {
      await this.throwForProviderResponse(response, 'access token');
    }

    const payload = await this.parseJson<MtnMomoTokenResponse>(response, 'access token');
    const accessToken = payload.access_token;
    if (typeof accessToken !== 'string' || accessToken.length < 16 || accessToken.length > 4096) {
      throw new SandboxPaymentProviderUnavailableError(
        'MTN MoMo returned a malformed access-token response.',
      );
    }
    return accessToken;
  }

  private async providerFetch(url: string, init: RequestInit): Promise<Response> {
    return fetch(url, init).catch((error: unknown) => {
      throw new SandboxPaymentProviderUnavailableError(
        error instanceof Error
          ? `MTN MoMo sandbox request failed: ${error.name}`
          : 'MTN MoMo sandbox request failed.',
      );
    });
  }

  private async throwForProviderResponse(response: Response, operation: string): Promise<never> {
    if (response.status === 429 || response.status >= 500) {
      throw new SandboxPaymentProviderUnavailableError(
        `MTN MoMo ${operation} is unavailable with HTTP ${response.status}.`,
      );
    }
    throw new SandboxPaymentProviderRejectedError(
      response.status,
      `MTN MoMo rejected ${operation} with HTTP ${response.status}.`,
    );
  }

  private async parseJson<T>(response: Response, operation: string): Promise<T> {
    const responseText = await response.text();
    try {
      return JSON.parse(responseText) as T;
    } catch {
      throw new SandboxPaymentProviderUnavailableError(
        `MTN MoMo returned malformed JSON for ${operation}.`,
      );
    }
  }
}

function minorToDecimal(amountMinor: number): string {
  const whole = Math.trunc(amountMinor / 100);
  const fraction = String(amountMinor % 100).padStart(2, '0');
  return `${whole}.${fraction}`;
}

function decimalToMinor(value: string): number | null {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) {
    return null;
  }
  const whole = Number(match[1]);
  const fraction = Number((match[2] ?? '').padEnd(2, '0'));
  const amountMinor = whole * 100 + fraction;
  return Number.isSafeInteger(amountMinor) ? amountMinor : null;
}

function normalizeMtnStatus(value: unknown): SandboxPaymentStatusResult['status'] | null {
  if (typeof value !== 'string') {
    return null;
  }
  switch (value.toUpperCase()) {
    case 'PENDING':
      return 'pending';
    case 'ONGOING':
      return 'processing';
    case 'SUCCESSFUL':
      return 'succeeded';
    case 'FAILED':
    case 'REJECTED':
      return 'failed';
    case 'EXPIRED':
      return 'cancelled';
    default:
      return null;
  }
}
