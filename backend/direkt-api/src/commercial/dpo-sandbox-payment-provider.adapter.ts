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

const DPO_API_URL = 'https://secure.3gdirectpay.com/API/v6/';
const DPO_HOSTED_URL = 'https://secure.3gdirectpay.com/payv2.php';
const DPO_TOKEN = /^[A-Za-z0-9_-]{8,128}$/;
const DPO_REFERENCE = /^[A-Za-z0-9._:-]{1,64}$/;
const DPO_SERVICE_TYPE = /^\d{1,10}$/;
const DPO_SERVICE_DATE = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/;
const ISO_CURRENCY = /^[A-Z]{3}$/;
const MAX_XML_RESPONSE_BYTES = 65536;

export interface DpoSandboxCredentials {
  companyToken: string;
}

export interface DpoSandboxConfiguration {
  apiUrl: typeof DPO_API_URL;
  hostedUrl: typeof DPO_HOSTED_URL;
  redirectUrl: string;
  backUrl: string;
  serviceType: string;
  serviceDate: string;
  paymentTimeLimitHours: number;
  timeoutMs: number;
}

export class DpoSandboxPaymentProviderAdapter implements SandboxPaymentProviderPort {
  constructor(
    public readonly descriptor: SandboxPaymentProviderDescriptor,
    private readonly credentials: DpoSandboxCredentials,
    private readonly configuration: DpoSandboxConfiguration,
  ) {
    if (descriptor.key !== 'dpo' || descriptor.targetEnvironment !== 'sandbox') {
      throw new Error('DPO adapter requires the reviewed DPO sandbox descriptor.');
    }
    if (configuration.apiUrl !== DPO_API_URL || configuration.hostedUrl !== DPO_HOSTED_URL) {
      throw new Error('DPO adapter must use the approved API v6 and hosted-payment endpoints.');
    }
    assertCredentialFreeHttpsUrl(configuration.redirectUrl, 'redirect');
    assertCredentialFreeHttpsUrl(configuration.backUrl, 'back');
    if (!DPO_SERVICE_TYPE.test(configuration.serviceType)) {
      throw new Error('DPO service type must be an explicit numeric sandbox service identifier.');
    }
    if (!DPO_SERVICE_DATE.test(configuration.serviceDate)) {
      throw new Error('DPO service date must use YYYY/MM/DD HH:mm format.');
    }
    if (
      !Number.isInteger(configuration.paymentTimeLimitHours) ||
      configuration.paymentTimeLimitHours < 1 ||
      configuration.paymentTimeLimitHours > 24
    ) {
      throw new Error('DPO payment time limit must be between 1 and 24 hours.');
    }
    if (!Number.isInteger(configuration.timeoutMs) || configuration.timeoutMs < 1000) {
      throw new Error('DPO timeout must be at least 1000 milliseconds.');
    }
    if (credentials.companyToken.length < 8 || credentials.companyToken.length > 512) {
      throw new Error('DPO sandbox company token is missing or malformed.');
    }
  }

  async initiate(
    input: SandboxPaymentInitiationInput,
    boundary: SandboxPaymentExecutionBoundary,
  ): Promise<SandboxPaymentInitiationResult> {
    assertSandboxPaymentBoundary(this.descriptor, boundary);
    this.assertInitiationInput(input, boundary);

    const responseXml = await this.postXml(
      `<API3G>
<CompanyToken>${xmlEscape(this.credentials.companyToken)}</CompanyToken>
<Request>createToken</Request>
<Transaction>
<PaymentAmount>${minorToDecimal(input.amountMinor)}</PaymentAmount>
<PaymentCurrency>${input.currency}</PaymentCurrency>
<CompanyRef>${xmlEscape(input.externalReference)}</CompanyRef>
<RedirectURL>${xmlEscape(this.configuration.redirectUrl)}</RedirectURL>
<BackURL>${xmlEscape(this.configuration.backUrl)}</BackURL>
<CompanyRefUnique>1</CompanyRefUnique>
<PTL>${this.configuration.paymentTimeLimitHours}</PTL>
</Transaction>
<Services>
<Service>
<ServiceType>${this.configuration.serviceType}</ServiceType>
<ServiceDescription>${xmlEscape(productDescription(boundary.businessFlow))}</ServiceDescription>
<ServiceDate>${this.configuration.serviceDate}</ServiceDate>
</Service>
</Services>
</API3G>`,
      'token creation',
    );

    assertDpoResult(responseXml, 'token creation');
    const transactionToken = requiredTag(responseXml, 'TransToken', 'token creation');
    if (!DPO_TOKEN.test(transactionToken)) {
      throw new SandboxPaymentProviderUnavailableError(
        'DPO returned a malformed sandbox transaction token.',
      );
    }

    return {
      providerKey: 'dpo',
      providerReference: transactionToken,
      status: 'requires_action',
      redirectUrl: `${this.configuration.hostedUrl}?ID=${encodeURIComponent(transactionToken)}`,
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
    if (!DPO_TOKEN.test(input.providerReference)) {
      throw new SandboxPaymentVerificationMismatchError(
        'MALFORMED_STATUS',
        'DPO provider reference is not a bounded transaction token.',
      );
    }
    assertExpectedAmountAndCurrency(input.expectedAmountMinor, input.expectedCurrency);

    const responseXml = await this.postXml(
      `<API3G>
<CompanyToken>${xmlEscape(this.credentials.companyToken)}</CompanyToken>
<Request>verifyToken</Request>
<TransactionToken>${xmlEscape(input.providerReference)}</TransactionToken>
</API3G>`,
      'token verification',
    );

    assertDpoResult(responseXml, 'token verification');
    const currency = requiredTag(
      responseXml,
      'TransactionFinalCurrency',
      'token verification',
    ).toUpperCase();
    const amountMinor = decimalToMinor(
      requiredTag(responseXml, 'TransactionFinalAmount', 'token verification'),
    );
    if (!ISO_CURRENCY.test(currency) || amountMinor === null) {
      throw new SandboxPaymentVerificationMismatchError(
        'MALFORMED_STATUS',
        'DPO returned malformed final amount or currency facts.',
      );
    }
    if (currency !== input.expectedCurrency) {
      throw new SandboxPaymentVerificationMismatchError(
        'CURRENCY_MISMATCH',
        'DPO final currency does not match the DIREKT intent.',
      );
    }
    if (amountMinor !== input.expectedAmountMinor) {
      throw new SandboxPaymentVerificationMismatchError(
        'AMOUNT_MISMATCH',
        'DPO final amount does not match the DIREKT intent.',
      );
    }

    const status = normalizeDpoStatus(
      optionalTag(responseXml, 'TransactionPaid'),
      optionalTag(responseXml, 'TransactionApproval'),
      optionalTag(responseXml, 'TransactionCompletion'),
    );
    const providerTransactionId =
      optionalTag(responseXml, 'AccRef') ?? optionalTag(responseXml, 'TransRef');
    if (
      status === 'succeeded' &&
      (!providerTransactionId || !DPO_REFERENCE.test(providerTransactionId))
    ) {
      throw new SandboxPaymentVerificationMismatchError(
        'MALFORMED_STATUS',
        'DPO successful verification omitted a bounded provider transaction reference.',
      );
    }

    return {
      providerKey: 'dpo',
      providerReference: input.providerReference,
      status,
      currency,
      amountMinor,
      independentlyVerified: true,
      ...(providerTransactionId ? { providerTransactionId } : {}),
      adjustmentStatus: 'none',
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
        'Payment intent flow does not match the approved DPO execution boundary.',
      );
    }
    if (input.paymentMethod.kind !== 'hosted_checkout') {
      throw new SandboxPaymentBoundaryError(
        'SYNTHETIC_PAYMENT_METHOD_REQUIRED',
        'DPO RC8 execution requires the hosted-checkout payment method.',
      );
    }
    if (!DPO_REFERENCE.test(input.externalReference)) {
      throw new SandboxPaymentBoundaryError(
        'SYNTHETIC_PAYMENT_METHOD_REQUIRED',
        'DPO company reference must be bounded and non-sensitive.',
      );
    }
    assertExpectedAmountAndCurrency(input.amountMinor, input.currency);
  }

  private async postXml(xml: string, operation: string): Promise<string> {
    const response = await fetch(this.configuration.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: xml,
      signal: AbortSignal.timeout(this.configuration.timeoutMs),
    }).catch((error: unknown) => {
      throw new SandboxPaymentProviderUnavailableError(
        error instanceof Error
          ? `DPO sandbox request failed: ${error.name}`
          : 'DPO sandbox request failed.',
      );
    });

    if (!response.ok) {
      if (response.status === 429 || response.status >= 500) {
        throw new SandboxPaymentProviderUnavailableError(
          `DPO ${operation} is unavailable with HTTP ${response.status}.`,
        );
      }
      throw new SandboxPaymentProviderRejectedError(
        response.status,
        `DPO rejected ${operation} with HTTP ${response.status}.`,
      );
    }

    const responseXml = await response.text();
    if (Buffer.byteLength(responseXml, 'utf8') > MAX_XML_RESPONSE_BYTES) {
      throw new SandboxPaymentProviderUnavailableError(
        `DPO returned an oversized response for ${operation}.`,
      );
    }
    if (!responseXml.includes('<API3G>') || !responseXml.includes('</API3G>')) {
      throw new SandboxPaymentProviderUnavailableError(
        `DPO returned malformed XML for ${operation}.`,
      );
    }
    return responseXml;
  }
}

function assertDpoResult(xml: string, operation: string): void {
  const result = requiredTag(xml, 'Result', operation);
  if (result !== '000') {
    throw new SandboxPaymentProviderRejectedError(
      422,
      `DPO rejected ${operation} with result ${boundedCode(result)}.`,
    );
  }
}

function requiredTag(xml: string, tag: string, operation: string): string {
  const value = optionalTag(xml, tag);
  if (value === null) {
    throw new SandboxPaymentProviderUnavailableError(
      `DPO omitted ${tag} from ${operation} response.`,
    );
  }
  return value;
}

function optionalTag(xml: string, tag: string): string | null {
  const match = new RegExp(`<${tag}>([^<]{0,512})</${tag}>`).exec(xml);
  return match?.[1]?.trim() || null;
}

function normalizeDpoStatus(
  paid: string | null,
  approval: string | null,
  completion: string | null,
): SandboxPaymentStatusResult['status'] {
  const paidValue = paid?.toLowerCase();
  const approvalValue = approval?.toLowerCase();
  const completionValue = completion?.toLowerCase();
  if (
    ['1', 'true', 'yes', 'paid'].includes(paidValue ?? '') &&
    ['approved', '1', 'true', 'yes'].includes(approvalValue ?? '') &&
    ['completed', '1', 'true', 'yes'].includes(completionValue ?? '')
  ) {
    return 'succeeded';
  }
  if (['declined', 'rejected', 'failed', '0', 'false', 'no'].includes(approvalValue ?? '')) {
    return 'failed';
  }
  if (['cancelled', 'canceled', 'voided', 'expired'].includes(completionValue ?? '')) {
    return 'cancelled';
  }
  if (['1', 'true', 'yes', 'paid'].includes(paidValue ?? '')) {
    return 'processing';
  }
  return 'requires_action';
}

function assertExpectedAmountAndCurrency(amountMinor: number, currency: string): void {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0 || !ISO_CURRENCY.test(currency)) {
    throw new SandboxPaymentVerificationMismatchError(
      'MALFORMED_STATUS',
      'DPO amount or currency is malformed.',
    );
  }
}

function productDescription(flow: SandboxPaymentExecutionBoundary['businessFlow']): string {
  switch (flow) {
    case 'provider_subscription':
      return 'DIREKT synthetic provider subscription';
    case 'verification_processing_fee':
      return 'DIREKT synthetic verification processing fee';
    case 'renewal_reverification_fee':
      return 'DIREKT synthetic renewal or re-verification fee';
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

function xmlEscape(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function boundedCode(value: string): string {
  return /^[A-Za-z0-9_-]{1,32}$/.test(value) ? value : 'MALFORMED';
}

function assertCredentialFreeHttpsUrl(value: string, purpose: string): void {
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new Error(`DPO ${purpose} URL must be credential-free HTTPS.`);
  }
}
