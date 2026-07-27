import {
  assertSandboxPaymentBoundary,
  SandboxPaymentBoundaryError,
  SandboxPaymentProviderRejectedError,
  SandboxPaymentProviderUnavailableError,
  SandboxPaymentVerificationMismatchError,
  type SandboxPaymentBusinessFlow,
  type SandboxPaymentExecutionBoundary,
  type SandboxPaymentInitiationInput,
  type SandboxPaymentInitiationResult,
  type SandboxPaymentProviderDescriptor,
  type SandboxPaymentProviderPort,
  type SandboxPaymentStatusInput,
  type SandboxPaymentStatusResult,
} from './sandbox-payment-provider.port';

const STRIPE_API_BASE_URL = 'https://api.stripe.com';
const STRIPE_CHECKOUT_HOST = 'checkout.stripe.com';
const CHECKOUT_SESSION_ID = /^cs_test_[A-Za-z0-9_]+$/;
const PAYMENT_INTENT_ID = /^pi_[A-Za-z0-9_]+$/;
const API_VERSION = /^\d{4}-\d{2}-\d{2}(?:\.[a-z]+)?$/;
const ISO_CURRENCY = /^[A-Z]{3}$/;
const EXTERNAL_REFERENCE = /^[A-Za-z0-9._:-]{1,64}$/;

export interface StripeSandboxCredentials {
  secretKey: string;
}

export interface StripeSandboxConfiguration {
  baseUrl: typeof STRIPE_API_BASE_URL;
  apiVersion: string;
  successUrl: string;
  cancelUrl: string;
  timeoutMs: number;
}

interface StripeCheckoutSessionResponse {
  id?: unknown;
  url?: unknown;
  status?: unknown;
  payment_status?: unknown;
  amount_total?: unknown;
  currency?: unknown;
  payment_intent?: unknown;
}

export class StripeSandboxPaymentProviderAdapter implements SandboxPaymentProviderPort {
  constructor(
    public readonly descriptor: SandboxPaymentProviderDescriptor,
    private readonly credentials: StripeSandboxCredentials,
    private readonly configuration: StripeSandboxConfiguration,
  ) {
    if (descriptor.key !== 'stripe' || descriptor.targetEnvironment !== 'sandbox') {
      throw new Error('Stripe adapter requires the reviewed Stripe sandbox descriptor.');
    }
    if (configuration.baseUrl !== STRIPE_API_BASE_URL) {
      throw new Error('Stripe sandbox adapter must use the approved Stripe API host.');
    }
    if (!credentials.secretKey.startsWith('sk_test_') || credentials.secretKey.length > 512) {
      throw new Error('Stripe sandbox adapter requires an account test-mode secret key.');
    }
    if (!API_VERSION.test(configuration.apiVersion)) {
      throw new Error('Stripe API version must be explicit and source controlled.');
    }
    assertCredentialFreeHttpsUrl(configuration.successUrl, 'success');
    assertCredentialFreeHttpsUrl(configuration.cancelUrl, 'cancel');
    if (!Number.isInteger(configuration.timeoutMs) || configuration.timeoutMs < 1000) {
      throw new Error('Stripe timeout must be at least 1000 milliseconds.');
    }
  }

  async initiate(
    input: SandboxPaymentInitiationInput,
    boundary: SandboxPaymentExecutionBoundary,
  ): Promise<SandboxPaymentInitiationResult> {
    assertSandboxPaymentBoundary(this.descriptor, boundary);
    this.assertInitiationInput(input, boundary);

    const body = new URLSearchParams();
    body.set('mode', 'payment');
    body.set('success_url', this.configuration.successUrl);
    body.set('cancel_url', this.configuration.cancelUrl);
    body.set('client_reference_id', input.externalReference);
    body.set('metadata[direkt_payment_intent_id]', input.paymentIntentId);
    body.set('payment_intent_data[metadata][direkt_payment_intent_id]', input.paymentIntentId);
    body.set('line_items[0][price_data][currency]', input.currency.toLowerCase());
    body.set('line_items[0][price_data][unit_amount]', String(input.amountMinor));
    body.set('line_items[0][price_data][product_data][name]', productName(input.businessFlow));
    body.set('line_items[0][quantity]', '1');

    const response = await this.providerFetch(
      `${this.configuration.baseUrl}/v1/checkout/sessions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.credentials.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Idempotency-Key': input.paymentIntentId,
          'Stripe-Version': this.configuration.apiVersion,
        },
        body: body.toString(),
        signal: AbortSignal.timeout(this.configuration.timeoutMs),
      },
    );

    if (!response.ok) {
      await this.throwForProviderResponse(response, 'Checkout Session creation');
    }

    const payload = await this.parseJson(response, 'Checkout Session creation');
    const sessionId = typeof payload.id === 'string' ? payload.id : '';
    const checkoutUrl = typeof payload.url === 'string' ? payload.url : '';
    if (!CHECKOUT_SESSION_ID.test(sessionId) || !isApprovedCheckoutUrl(checkoutUrl)) {
      throw new SandboxPaymentProviderUnavailableError(
        'Stripe returned a malformed test Checkout Session response.',
      );
    }

    return {
      providerKey: 'stripe',
      providerReference: sessionId,
      status: 'requires_action',
      redirectUrl: checkoutUrl,
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
    if (!CHECKOUT_SESSION_ID.test(input.providerReference)) {
      throw new SandboxPaymentVerificationMismatchError(
        'MALFORMED_STATUS',
        'Stripe provider reference is not a test Checkout Session id.',
      );
    }
    assertExpectedAmountAndCurrency(input.expectedAmountMinor, input.expectedCurrency);

    const response = await this.providerFetch(
      `${this.configuration.baseUrl}/v1/checkout/sessions/${encodeURIComponent(input.providerReference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.credentials.secretKey}`,
          'Stripe-Version': this.configuration.apiVersion,
        },
        signal: AbortSignal.timeout(this.configuration.timeoutMs),
      },
    );

    if (!response.ok) {
      await this.throwForProviderResponse(response, 'Checkout Session retrieval');
    }

    const payload = await this.parseJson(response, 'Checkout Session retrieval');
    const currency = typeof payload.currency === 'string' ? payload.currency.toUpperCase() : '';
    const amountMinor =
      typeof payload.amount_total === 'number' && Number.isSafeInteger(payload.amount_total)
        ? payload.amount_total
        : null;
    const paymentIntent =
      typeof payload.payment_intent === 'string' ? payload.payment_intent : undefined;
    const status = normalizeStripeStatus(payload.status, payload.payment_status);

    if (!ISO_CURRENCY.test(currency) || amountMinor === null || status === null) {
      throw new SandboxPaymentVerificationMismatchError(
        'MALFORMED_STATUS',
        'Stripe returned a malformed Checkout Session status response.',
      );
    }
    if (currency !== input.expectedCurrency) {
      throw new SandboxPaymentVerificationMismatchError(
        'CURRENCY_MISMATCH',
        'Stripe Checkout currency does not match the DIREKT intent.',
      );
    }
    if (amountMinor !== input.expectedAmountMinor) {
      throw new SandboxPaymentVerificationMismatchError(
        'AMOUNT_MISMATCH',
        'Stripe Checkout amount does not match the DIREKT intent.',
      );
    }
    if (status === 'succeeded' && (!paymentIntent || !PAYMENT_INTENT_ID.test(paymentIntent))) {
      throw new SandboxPaymentVerificationMismatchError(
        'MALFORMED_STATUS',
        'Stripe paid Checkout Session omitted a valid PaymentIntent id.',
      );
    }

    return {
      providerKey: 'stripe',
      providerReference: input.providerReference,
      status,
      currency,
      amountMinor,
      independentlyVerified: true,
      ...(paymentIntent ? { providerTransactionId: paymentIntent } : {}),
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
        'Payment intent flow does not match the approved Stripe execution boundary.',
      );
    }
    if (input.paymentMethod.kind !== 'hosted_checkout') {
      throw new SandboxPaymentBoundaryError(
        'SYNTHETIC_PAYMENT_METHOD_REQUIRED',
        'Stripe RC8 execution requires the hosted-checkout payment method.',
      );
    }
    if (!EXTERNAL_REFERENCE.test(input.externalReference)) {
      throw new SandboxPaymentBoundaryError(
        'SYNTHETIC_PAYMENT_METHOD_REQUIRED',
        'Stripe client reference must be bounded and non-sensitive.',
      );
    }
    assertExpectedAmountAndCurrency(input.amountMinor, input.currency);
    if (input.currency === 'ZMW' && !this.descriptor.capabilities.supportsZmw) {
      throw new SandboxPaymentBoundaryError(
        'SYNTHETIC_PAYMENT_METHOD_REQUIRED',
        'Stripe is not registered for ZMW in the RC8 provider catalogue.',
      );
    }
  }

  private async providerFetch(url: string, init: RequestInit): Promise<Response> {
    return fetch(url, init).catch((error: unknown) => {
      throw new SandboxPaymentProviderUnavailableError(
        error instanceof Error
          ? `Stripe sandbox request failed: ${error.name}`
          : 'Stripe sandbox request failed.',
      );
    });
  }

  private async throwForProviderResponse(response: Response, operation: string): Promise<never> {
    if (response.status === 429 || response.status >= 500) {
      throw new SandboxPaymentProviderUnavailableError(
        `Stripe ${operation} is unavailable with HTTP ${response.status}.`,
      );
    }
    throw new SandboxPaymentProviderRejectedError(
      response.status,
      `Stripe rejected ${operation} with HTTP ${response.status}.`,
    );
  }

  private async parseJson(
    response: Response,
    operation: string,
  ): Promise<StripeCheckoutSessionResponse> {
    const responseText = await response.text();
    try {
      return JSON.parse(responseText) as StripeCheckoutSessionResponse;
    } catch {
      throw new SandboxPaymentProviderUnavailableError(
        `Stripe returned malformed JSON for ${operation}.`,
      );
    }
  }
}

function assertExpectedAmountAndCurrency(amountMinor: number, currency: string): void {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0 || !ISO_CURRENCY.test(currency)) {
    throw new SandboxPaymentVerificationMismatchError(
      'MALFORMED_STATUS',
      'Stripe amount or currency is malformed.',
    );
  }
}

function productName(flow: SandboxPaymentBusinessFlow): string {
  switch (flow) {
    case 'provider_subscription':
      return 'DIREKT provider subscription';
    case 'verification_processing_fee':
      return 'DIREKT verification processing fee';
    case 'renewal_reverification_fee':
      return 'DIREKT renewal or re-verification fee';
  }
}

function assertCredentialFreeHttpsUrl(value: string, purpose: string): void {
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new Error(`Stripe ${purpose} URL must be credential-free HTTPS.`);
  }
}

function isApprovedCheckoutUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && parsed.hostname === STRIPE_CHECKOUT_HOST;
  } catch {
    return false;
  }
}

function normalizeStripeStatus(
  sessionStatus: unknown,
  paymentStatus: unknown,
): SandboxPaymentStatusResult['status'] | null {
  if (sessionStatus === 'complete' && paymentStatus === 'paid') {
    return 'succeeded';
  }
  if (sessionStatus === 'expired') {
    return 'cancelled';
  }
  if (sessionStatus === 'open') {
    return 'requires_action';
  }
  if (sessionStatus === 'complete' && paymentStatus === 'unpaid') {
    return 'processing';
  }
  return null;
}
