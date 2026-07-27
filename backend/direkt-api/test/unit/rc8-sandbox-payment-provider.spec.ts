import { describe, expect, it } from 'vitest';
import {
  GatedSandboxPaymentProviderAdapter,
  SandboxPaymentProviderRegistry,
  sandboxPaymentProviderCatalog,
  sandboxPaymentProviderDescriptor,
} from '../../src/commercial/sandbox-payment-provider.registry';
import type { SandboxPaymentExecutionBoundary } from '../../src/commercial/sandbox-payment-provider.port';

const safeBoundary: SandboxPaymentExecutionBoundary = {
  nodeEnvironment: 'test',
  dataMode: 'synthetic-only',
  trafficMode: 'internal',
  businessFlow: 'provider_subscription',
  realMoneyApproved: false,
  participantDataIncluded: false,
  credentialSource: 'secret_manager',
};

const failureCases: Array<{
  boundary: SandboxPaymentExecutionBoundary;
  code: string;
}> = [
  {
    boundary: { ...safeBoundary, nodeEnvironment: 'production' },
    code: 'PRODUCTION_ENVIRONMENT_PROHIBITED',
  },
  {
    boundary: { ...safeBoundary, dataMode: 'controlled-pilot' },
    code: 'NON_SYNTHETIC_DATA_PROHIBITED',
  },
  {
    boundary: { ...safeBoundary, participantDataIncluded: true },
    code: 'PARTICIPANT_DATA_PROHIBITED',
  },
  {
    boundary: { ...safeBoundary, realMoneyApproved: true },
    code: 'REAL_MONEY_PROHIBITED',
  },
  {
    boundary: { ...safeBoundary, credentialSource: 'client' },
    code: 'SECRET_MANAGER_REQUIRED',
  },
];

describe('RC8 sandbox payment provider foundation', () => {
  it('registers only the reviewed sandbox provider set', () => {
    const keys = sandboxPaymentProviderCatalog().map(({ key }) => key);

    expect(keys).toEqual(['mtn_momo', 'airtel_money', 'dpo', 'stripe', 'paypal']);
    expect(keys).not.toContain('flutterwave');
  });

  it('preserves provider readiness and secret-container metadata without values', () => {
    expect(sandboxPaymentProviderDescriptor('mtn_momo')).toMatchObject({
      readiness: 'sandbox_proven',
      targetEnvironment: 'sandbox',
      runtimeEnabled: false,
      productionMoneyMovement: false,
      customerToProviderPayments: false,
    });
    expect(sandboxPaymentProviderDescriptor('airtel_money')).toMatchObject({
      readiness: 'pending_provider',
      secretNames: [],
      runtimeEnabled: false,
    });
    expect(sandboxPaymentProviderDescriptor('stripe').secretNames).toEqual([
      'direkt-stripe-sandbox-secret-key',
    ]);
  });

  it('rejects Airtel while provider approval and credentials remain pending', async () => {
    const adapter = new GatedSandboxPaymentProviderAdapter(
      sandboxPaymentProviderDescriptor('airtel_money'),
    );

    await expect(
      adapter.initiate(
        {
          paymentIntentId: '00000000-0000-4000-8000-000000008001',
          externalReference: 'RC8-AIRTEL-PENDING-0001',
          currency: 'ZMW',
          amountMinor: 100,
          expiresAt: '2026-07-26T20:00:00.000Z',
          businessFlow: 'provider_subscription',
          paymentMethod: {
            kind: 'mobile_money',
            accountReference: '260971000001',
            accountReferenceIsSynthetic: true,
          },
        },
        safeBoundary,
      ),
    ).rejects.toMatchObject({ code: 'SANDBOX_PROVIDER_NOT_PROVEN' });
  });

  it.each(failureCases)('fails closed at the $code boundary', async ({ boundary, code }) => {
    const adapter = new GatedSandboxPaymentProviderAdapter(
      sandboxPaymentProviderDescriptor('mtn_momo'),
    );

    await expect(
      adapter.verifyStatus(
        {
          providerReference: '00000000-0000-4000-8000-000000008002',
          expectedCurrency: 'ZMW',
          expectedAmountMinor: 100,
        },
        boundary,
      ),
    ).rejects.toMatchObject({ code });
  });

  it('keeps sandbox-proven providers source-registered but runtime disabled', async () => {
    const registry = new SandboxPaymentProviderRegistry();
    const provider = registry.require('paypal');

    await expect(
      provider.initiate(
        {
          paymentIntentId: '00000000-0000-4000-8000-000000008003',
          externalReference: 'RC8-PAYPAL-GATED-0001',
          currency: 'USD',
          amountMinor: 100,
          expiresAt: '2026-07-26T20:00:00.000Z',
          businessFlow: 'verification_processing_fee',
          paymentMethod: { kind: 'hosted_checkout' },
        },
        safeBoundary,
      ),
    ).rejects.toMatchObject({ code: 'SANDBOX_RUNTIME_NOT_ENABLED' });
  });

  it('rejects duplicate provider registration', () => {
    const descriptor = sandboxPaymentProviderDescriptor('dpo');
    const adapter = new GatedSandboxPaymentProviderAdapter(descriptor);

    expect(() => new SandboxPaymentProviderRegistry([adapter, adapter])).toThrow(
      'Duplicate sandbox payment provider registration is prohibited.',
    );
  });
});
