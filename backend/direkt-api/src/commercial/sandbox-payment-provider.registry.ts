import {
  assertSandboxPaymentBoundary,
  SANDBOX_PAYMENT_PROVIDER_KEYS,
  SandboxPaymentBoundaryError,
  type SandboxPaymentExecutionBoundary,
  type SandboxPaymentInitiationInput,
  type SandboxPaymentInitiationResult,
  type SandboxPaymentProviderDescriptor,
  type SandboxPaymentProviderKey,
  type SandboxPaymentProviderPort,
  type SandboxPaymentStatusInput,
  type SandboxPaymentStatusResult,
} from './sandbox-payment-provider.port';

const descriptors: Readonly<Record<SandboxPaymentProviderKey, SandboxPaymentProviderDescriptor>> =
  Object.freeze({
    mtn_momo: Object.freeze({
      key: 'mtn_momo',
      displayName: 'MTN MoMo Collections',
      readiness: 'sandbox_proven',
      targetEnvironment: 'sandbox',
      capabilities: Object.freeze({
        actionKind: 'mobile_money_prompt',
        completionKind: 'none',
        supportsIndependentStatusQuery: true,
        supportsWebhookOrCallback: true,
        supportsRefundOrAdjustment: true,
        supportsZmw: true,
        supportsInternationalPayer: false,
      }),
      secretNames: Object.freeze([
        'direkt-mtn-momo-collections-subscription-key',
        'direkt-mtn-momo-api-user',
        'direkt-mtn-momo-api-key',
      ]),
      runtimeEnabled: false,
      productionMoneyMovement: false,
      customerToProviderPayments: false,
    }),
    airtel_money: Object.freeze({
      key: 'airtel_money',
      displayName: 'Airtel Money Zambia Cash-In',
      readiness: 'pending_provider',
      targetEnvironment: 'sandbox',
      capabilities: Object.freeze({
        actionKind: 'mobile_money_prompt',
        completionKind: 'none',
        supportsIndependentStatusQuery: true,
        supportsWebhookOrCallback: true,
        supportsRefundOrAdjustment: false,
        supportsZmw: true,
        supportsInternationalPayer: false,
      }),
      secretNames: Object.freeze([]),
      runtimeEnabled: false,
      productionMoneyMovement: false,
      customerToProviderPayments: false,
    }),
    dpo: Object.freeze({
      key: 'dpo',
      displayName: 'DPO Pay by Network',
      readiness: 'sandbox_proven',
      targetEnvironment: 'sandbox',
      capabilities: Object.freeze({
        actionKind: 'hosted_checkout',
        completionKind: 'none',
        supportsIndependentStatusQuery: true,
        supportsWebhookOrCallback: true,
        supportsRefundOrAdjustment: true,
        supportsZmw: true,
        supportsInternationalPayer: true,
      }),
      secretNames: Object.freeze(['direkt-dpo-sandbox-company-token']),
      runtimeEnabled: false,
      productionMoneyMovement: false,
      customerToProviderPayments: false,
    }),
    stripe: Object.freeze({
      key: 'stripe',
      displayName: 'Stripe Checkout',
      readiness: 'sandbox_proven',
      targetEnvironment: 'sandbox',
      capabilities: Object.freeze({
        actionKind: 'hosted_checkout',
        completionKind: 'none',
        supportsIndependentStatusQuery: true,
        supportsWebhookOrCallback: true,
        supportsRefundOrAdjustment: true,
        supportsZmw: false,
        supportsInternationalPayer: true,
      }),
      secretNames: Object.freeze(['direkt-stripe-sandbox-secret-key']),
      runtimeEnabled: false,
      productionMoneyMovement: false,
      customerToProviderPayments: false,
    }),
    paypal: Object.freeze({
      key: 'paypal',
      displayName: 'PayPal Orders',
      readiness: 'sandbox_proven',
      targetEnvironment: 'sandbox',
      capabilities: Object.freeze({
        actionKind: 'hosted_checkout',
        completionKind: 'server_capture',
        supportsIndependentStatusQuery: true,
        supportsWebhookOrCallback: true,
        supportsRefundOrAdjustment: true,
        supportsZmw: false,
        supportsInternationalPayer: true,
      }),
      secretNames: Object.freeze([
        'direkt-paypal-sandbox-client-id',
        'direkt-paypal-sandbox-client-secret',
      ]),
      runtimeEnabled: false,
      productionMoneyMovement: false,
      customerToProviderPayments: false,
    }),
  });

export function sandboxPaymentProviderCatalog(): readonly SandboxPaymentProviderDescriptor[] {
  return SANDBOX_PAYMENT_PROVIDER_KEYS.map((key) => descriptors[key]);
}

export function sandboxPaymentProviderDescriptor(
  key: SandboxPaymentProviderKey,
): SandboxPaymentProviderDescriptor {
  return descriptors[key];
}

export class GatedSandboxPaymentProviderAdapter implements SandboxPaymentProviderPort {
  constructor(public readonly descriptor: SandboxPaymentProviderDescriptor) {}

  async initiate(
    _input: SandboxPaymentInitiationInput,
    boundary: SandboxPaymentExecutionBoundary,
  ): Promise<SandboxPaymentInitiationResult> {
    assertSandboxPaymentBoundary(this.descriptor, boundary);
    throw new SandboxPaymentBoundaryError(
      'SANDBOX_RUNTIME_NOT_ENABLED',
      `${this.descriptor.displayName} initiation has no active runtime binding.`,
    );
  }

  async verifyStatus(
    _input: SandboxPaymentStatusInput,
    boundary: SandboxPaymentExecutionBoundary,
  ): Promise<SandboxPaymentStatusResult> {
    assertSandboxPaymentBoundary(this.descriptor, boundary);
    throw new SandboxPaymentBoundaryError(
      'SANDBOX_RUNTIME_NOT_ENABLED',
      `${this.descriptor.displayName} verification has no active runtime binding.`,
    );
  }
}

export class SandboxPaymentProviderRegistry {
  private readonly providers: ReadonlyMap<SandboxPaymentProviderKey, SandboxPaymentProviderPort>;

  constructor(
    providerPorts: readonly SandboxPaymentProviderPort[] = sandboxPaymentProviderCatalog().map(
      (descriptor) => new GatedSandboxPaymentProviderAdapter(descriptor),
    ),
  ) {
    const entries = providerPorts.map((provider) => [provider.descriptor.key, provider] as const);
    const uniqueKeys = new Set(entries.map(([key]) => key));
    if (uniqueKeys.size !== entries.length) {
      throw new Error('Duplicate sandbox payment provider registration is prohibited.');
    }
    this.providers = new Map(entries);
  }

  list(): readonly SandboxPaymentProviderDescriptor[] {
    return SANDBOX_PAYMENT_PROVIDER_KEYS.map((key) => this.require(key).descriptor);
  }

  require(key: SandboxPaymentProviderKey): SandboxPaymentProviderPort {
    const provider = this.providers.get(key);
    if (!provider) {
      throw new Error(`Sandbox payment provider ${key} is not registered.`);
    }
    return provider;
  }
}
