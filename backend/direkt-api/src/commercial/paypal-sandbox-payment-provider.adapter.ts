import {
  assertSandboxPaymentBoundary,
  SandboxPaymentBoundaryError,
  SandboxPaymentProviderRejectedError,
  SandboxPaymentProviderUnavailableError,
  SandboxPaymentVerificationMismatchError,
  type SandboxPaymentCompletionInput,
  type SandboxPaymentExecutionBoundary,
  type SandboxPaymentInitiationInput,
  type SandboxPaymentInitiationResult,
  type SandboxPaymentProviderDescriptor,
  type SandboxPaymentProviderPort,
  type SandboxPaymentStatusInput,
  type SandboxPaymentStatusResult,
} from './sandbox-payment-provider.port';

const PAYPAL_SANDBOX_BASE_URL = 'https://api-m.sandbox.paypal.com';
const PAYPAL_APPROVAL_HOST = 'www.sandbox.paypal.com';
const PAYPAL_ORDER_ID = /^[A-Z0-9]{8,32}$/;
const PAYPAL_CAPTURE_ID = /^[A-Z0-9]{8,32}$/;
const ISO_CURRENCY = /^[A-Z]{3}$/;
const EXTERNAL_REFERENCE = /^[A-Za-z0-9._:-]{1,64}$/;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9._:-]{1,108}$/;

export interface PayPalSandboxCredentials {
  clientId: string;
  clientSecret: string;
}

export interface PayPalSandboxConfiguration {
  baseUrl: typeof PAYPAL_SANDBOX_BASE_URL;
  returnUrl: string;
  cancelUrl: string;
  timeoutMs: number;
}

interface PayPalTokenResponse {
  access_token?: unknown;
}

interface PayPalLink {
  href?: unknown;
  rel?: unknown;
}

interface PayPalCapture {
  id?: unknown;
  status?: unknown;
  amount?: {
    currency_code?: unknown;
    value?: unknown;
  };
}

interface PayPalOrderResponse {
  id?: unknown;
  status?: unknown;
  links?: PayPalLink[];
  purchase_units?: Array<{
    amount?: {
      currency_code?: unknown;
      value?: unknown;
    };
    payments?: {
      captures?: PayPalCapture[];
    };
  }>;
}

export class PayPalSandboxPaymentProviderAdapter implements SandboxPaymentProviderPort {
  constructor(
    public readonly descriptor: SandboxPaymentProviderDescriptor,
    private readonly credentials: PayPalSandboxCredentials,
    private readonly configuration: PayPalSandboxConfiguration,
  ) {
    if (descriptor.key !== 'paypal' || descriptor.targetEnvironment !== 'sandbox') {
      throw new Error('PayPal adapter requires the reviewed PayPal sandbox descriptor.');
    }
    if (
      descriptor.capabilities.completionKind !== 'server_capture' ||
      configuration.baseUrl !== PAYPAL_SANDBOX_BASE_URL
    ) {
      throw new Error('PayPal sandbox adapter requires the approved server-capture boundary.');
    }
    assertCredentialFreeHttpsUrl(configuration.returnUrl, 'return');
    assertCredentialFreeHttpsUrl(configuration.cancelUrl, 'cancel');
    if (!Number.isInteger(configuration.timeoutMs) || configuration.timeoutMs < 1000) {
      throw new Error('PayPal timeout must be at least 1000 milliseconds.');
    }
    for (const value of [credentials.clientId, credentials.clientSecret]) {
      if (value.length < 8 || value.length > 512) {
        throw new Error('PayPal sandbox credentials are missing or malformed.');
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
    const response = await this.providerFetch(`${this.configuration.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': input.paymentIntentId,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: input.externalReference,
            custom_id: input.paymentIntentId,
            invoice_id: input.externalReference,
            amount: {
              currency_code: input.currency,
              value: minorToDecimal(input.amountMinor),
            },
          },
        ],
        application_context: {
          return_url: this.configuration.returnUrl,
          cancel_url: this.configuration.cancelUrl,
          user_action: 'PAY_NOW',
          shipping_preference: 'NO_SHIPPING',
        },
      }),
      signal: AbortSignal.timeout(this.configuration.timeoutMs),
    });

    if (!response.ok) {
      await this.throwForProviderResponse(response, 'order creation');
    }

    const payload = await this.parseJson(response, 'order creation');
    const orderId = typeof payload.id === 'string' ? payload.id : '';
    const approvalUrl = approvalLink(payload.links);
    if (!PAYPAL_ORDER_ID.test(orderId) || approvalUrl === null) {
      throw new SandboxPaymentProviderUnavailableError(
        'PayPal returned a malformed sandbox order response.',
      );
    }

    return {
      providerKey: 'paypal',
      providerReference: orderId,
      status: 'requires_action',
      redirectUrl: approvalUrl,
      externalDeliveryAttempted: true,
      credentialExposed: false,
      productionMoneyMovement: false,
    };
  }

  async completeAction(
    input: SandboxPaymentCompletionInput,
    boundary: SandboxPaymentExecutionBoundary,
  ): Promise<SandboxPaymentStatusResult> {
    assertSandboxPaymentBoundary(this.descriptor, boundary);
    this.assertStatusInput(input);
    if (!IDEMPOTENCY_KEY.test(input.idempotencyKey)) {
      throw new SandboxPaymentVerificationMismatchError(
        'MALFORMED_STATUS',
        'PayPal capture idempotency key is malformed.',
      );
    }

    const accessToken = await this.createAccessToken();
    const response = await this.providerFetch(
      `${this.configuration.baseUrl}/v2/checkout/orders/${encodeURIComponent(input.providerReference)}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': input.idempotencyKey,
        },
        body: '{}',
        signal: AbortSignal.timeout(this.configuration.timeoutMs),
      },
    );

    if (!response.ok) {
      await this.throwForProviderResponse(response, 'order capture');
    }
    await this.parseJson(response, 'order capture');

    return {
      providerKey: 'paypal',
      providerReference: input.providerReference,
      status: 'processing',
      currency: input.expectedCurrency,
      amountMinor: input.expectedAmountMinor,
      independentlyVerified: false,
      adjustmentStatus: 'none',
      rawPayloadIncluded: false,
      credentialIncluded: false,
    };
  }

  async verifyStatus(
    input: SandboxPaymentStatusInput,
    boundary: SandboxPaymentExecutionBoundary,
  ): Promise<SandboxPaymentStatusResult> {
    assertSandboxPaymentBoundary(this.descriptor, boundary);
    this.assertStatusInput(input);
    const accessToken = await this.createAccessToken();
    const response = await this.providerFetch(
      `${this.configuration.baseUrl}/v2/checkout/orders/${encodeURIComponent(input.providerReference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: AbortSignal.timeout(this.configuration.timeoutMs),
      },
    );

    if (!response.ok) {
      await this.throwForProviderResponse(response, 'order retrieval');
    }

    const payload = await this.parseJson(response, 'order retrieval');
    const facts = extractOrderFacts(payload);
    if (facts === null) {
      throw new SandboxPaymentVerificationMismatchError(
        'MALFORMED_STATUS',
        'PayPal returned a malformed sandbox order status response.',
      );
    }
    if (facts.currency !== input.expectedCurrency) {
      throw new SandboxPaymentVerificationMismatchError(
        'CURRENCY_MISMATCH',
        'PayPal order currency does not match the DIREKT intent.',
      );
    }
    if (facts.amountMinor !== input.expectedAmountMinor) {
      throw new SandboxPaymentVerificationMismatchError(
        'AMOUNT_MISMATCH',
        'PayPal order amount does not match the DIREKT intent.',
      );
    }
    if (facts.status === 'succeeded' && !facts.captureId) {
      throw new SandboxPaymentVerificationMismatchError(
        'MALFORMED_STATUS',
        'PayPal completed order omitted a valid capture id.',
      );
    }

    return {
      providerKey: 'paypal',
      providerReference: input.providerReference,
      status: facts.status,
      currency: facts.currency,
      amountMinor: facts.amountMinor,
      independentlyVerified: true,
      ...(facts.captureId ? { providerTransactionId: facts.captureId } : {}),
      adjustmentStatus: facts.adjustmentStatus,
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
        'Payment intent flow does not match the approved PayPal execution boundary.',
      );
    }
    if (input.paymentMethod.kind !== 'hosted_checkout') {
      throw new SandboxPaymentBoundaryError(
        'SYNTHETIC_PAYMENT_METHOD_REQUIRED',
        'PayPal RC8 execution requires the hosted-checkout payment method.',
      );
    }
    if (!EXTERNAL_REFERENCE.test(input.externalReference)) {
      throw new SandboxPaymentBoundaryError(
        'SYNTHETIC_PAYMENT_METHOD_REQUIRED',
        'PayPal order reference must be bounded and non-sensitive.',
      );
    }
    assertExpectedAmountAndCurrency(input.amountMinor, input.currency);
    if (input.currency === 'ZMW' && !this.descriptor.capabilities.supportsZmw) {
      throw new SandboxPaymentBoundaryError(
        'SYNTHETIC_PAYMENT_METHOD_REQUIRED',
        'PayPal is not registered for ZMW in the RC8 provider catalogue.',
      );
    }
  }

  private assertStatusInput(input: SandboxPaymentStatusInput): void {
    if (!PAYPAL_ORDER_ID.test(input.providerReference)) {
      throw new SandboxPaymentVerificationMismatchError(
        'MALFORMED_STATUS',
        'PayPal provider reference is not a bounded sandbox order id.',
      );
    }
    assertExpectedAmountAndCurrency(input.expectedAmountMinor, input.expectedCurrency);
  }

  private async createAccessToken(): Promise<string> {
    const basic = Buffer.from(
      `${this.credentials.clientId}:${this.credentials.clientSecret}`,
      'utf8',
    ).toString('base64');
    const response = await this.providerFetch(`${this.configuration.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(this.configuration.timeoutMs),
    });

    if (!response.ok) {
      await this.throwForProviderResponse(response, 'access token');
    }

    const responseText = await response.text();
    let payload: PayPalTokenResponse;
    try {
      payload = JSON.parse(responseText) as PayPalTokenResponse;
    } catch {
      throw new SandboxPaymentProviderUnavailableError(
        'PayPal returned malformed JSON for access token.',
      );
    }
    const accessToken = payload.access_token;
    if (typeof accessToken !== 'string' || accessToken.length < 16 || accessToken.length > 4096) {
      throw new SandboxPaymentProviderUnavailableError(
        'PayPal returned a malformed access-token response.',
      );
    }
    return accessToken;
  }

  private async providerFetch(url: string, init: RequestInit): Promise<Response> {
    return fetch(url, init).catch((error: unknown) => {
      throw new SandboxPaymentProviderUnavailableError(
        error instanceof Error
          ? `PayPal sandbox request failed: ${error.name}`
          : 'PayPal sandbox request failed.',
      );
    });
  }

  private async throwForProviderResponse(response: Response, operation: string): Promise<never> {
    if (response.status === 429 || response.status >= 500) {
      throw new SandboxPaymentProviderUnavailableError(
        `PayPal ${operation} is unavailable with HTTP ${response.status}.`,
      );
    }
    throw new SandboxPaymentProviderRejectedError(
      response.status,
      `PayPal rejected ${operation} with HTTP ${response.status}.`,
    );
  }

  private async parseJson(response: Response, operation: string): Promise<PayPalOrderResponse> {
    const responseText = await response.text();
    try {
      return JSON.parse(responseText) as PayPalOrderResponse;
    } catch {
      throw new SandboxPaymentProviderUnavailableError(
        `PayPal returned malformed JSON for ${operation}.`,
      );
    }
  }
}

interface PayPalOrderFacts {
  status: SandboxPaymentStatusResult['status'];
  currency: string;
  amountMinor: number;
  captureId?: string;
  adjustmentStatus: NonNullable<SandboxPaymentStatusResult['adjustmentStatus']>;
}

function extractOrderFacts(payload: PayPalOrderResponse): PayPalOrderFacts | null {
  const orderStatus = typeof payload.status === 'string' ? payload.status.toUpperCase() : '';
  const purchaseUnit = payload.purchase_units?.[0];
  const capture = purchaseUnit?.payments?.captures?.[0];
  const amount = capture?.amount ?? purchaseUnit?.amount;
  const currency =
    typeof amount?.currency_code === 'string' ? amount.currency_code.toUpperCase() : '';
  const amountMinor = typeof amount?.value === 'string' ? decimalToMinor(amount.value) : null;
  if (!ISO_CURRENCY.test(currency) || amountMinor === null) {
    return null;
  }

  const captureStatus = typeof capture?.status === 'string' ? capture.status.toUpperCase() : '';
  const captureId =
    typeof capture?.id === 'string' && PAYPAL_CAPTURE_ID.test(capture.id) ? capture.id : undefined;

  if (orderStatus === 'VOIDED') {
    return { status: 'cancelled', currency, amountMinor, adjustmentStatus: 'none' };
  }
  if (['CREATED', 'SAVED', 'PAYER_ACTION_REQUIRED', 'APPROVED'].includes(orderStatus)) {
    return { status: 'requires_action', currency, amountMinor, adjustmentStatus: 'none' };
  }
  if (orderStatus !== 'COMPLETED') {
    return null;
  }
  if (captureStatus === 'PENDING') {
    return {
      status: 'processing',
      currency,
      amountMinor,
      ...(captureId ? { captureId } : {}),
      adjustmentStatus: 'none',
    };
  }
  if (captureStatus === 'DECLINED' || captureStatus === 'FAILED') {
    return {
      status: 'failed',
      currency,
      amountMinor,
      ...(captureId ? { captureId } : {}),
      adjustmentStatus: 'none',
    };
  }
  if (captureStatus === 'PARTIALLY_REFUNDED') {
    return {
      status: 'succeeded',
      currency,
      amountMinor,
      ...(captureId ? { captureId } : {}),
      adjustmentStatus: 'partially_refunded',
    };
  }
  if (captureStatus === 'REFUNDED') {
    return {
      status: 'succeeded',
      currency,
      amountMinor,
      ...(captureId ? { captureId } : {}),
      adjustmentStatus: 'refunded',
    };
  }
  if (captureStatus === 'COMPLETED') {
    return {
      status: 'succeeded',
      currency,
      amountMinor,
      ...(captureId ? { captureId } : {}),
      adjustmentStatus: 'none',
    };
  }
  return null;
}

function approvalLink(links: PayPalLink[] | undefined): string | null {
  const href = links?.find((link) => link.rel === 'approve')?.href;
  if (typeof href !== 'string') {
    return null;
  }
  try {
    const parsed = new URL(href);
    return parsed.protocol === 'https:' && parsed.hostname === PAYPAL_APPROVAL_HOST ? href : null;
  } catch {
    return null;
  }
}

function assertExpectedAmountAndCurrency(amountMinor: number, currency: string): void {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0 || !ISO_CURRENCY.test(currency)) {
    throw new SandboxPaymentVerificationMismatchError(
      'MALFORMED_STATUS',
      'PayPal amount or currency is malformed.',
    );
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

function assertCredentialFreeHttpsUrl(value: string, purpose: string): void {
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new Error(`PayPal ${purpose} URL must be credential-free HTTPS.`);
  }
}
