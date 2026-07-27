#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise AssertionError(f"{path}: expected one occurrence, found {count}: {old!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


def replace_count(path: str, old: str, new: str, expected: int) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != expected:
        raise AssertionError(f"{path}: expected {expected} occurrences, found {count}: {old!r}")
    target.write_text(text.replace(old, new), encoding="utf-8")


def insert_once(path: str, marker: str, block: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    if block.strip() in text:
        return
    count = text.count(marker)
    if count != 1:
        raise AssertionError(f"{path}: expected one marker, found {count}: {marker!r}")
    target.write_text(text.replace(marker, block + marker, 1), encoding="utf-8")


adapter = "backend/direkt-api/src/commercial/mtn-momo-sandbox-payment-provider.adapter.ts"
replace_once(adapter, "  callbackUrl: string;\n", "  callbackUrl?: string;\n")
replace_once(
    adapter,
    """    const callbackUrl = new URL(configuration.callbackUrl);
    if (callbackUrl.protocol !== 'https:' || callbackUrl.username || callbackUrl.password) {
      throw new Error('MTN MoMo callback URL must be credential-free HTTPS.');
    }
""",
    """    if (configuration.callbackUrl) {
      const callbackUrl = new URL(configuration.callbackUrl);
      if (callbackUrl.protocol !== 'https:' || callbackUrl.username || callbackUrl.password) {
        throw new Error('MTN MoMo callback URL must be credential-free HTTPS.');
      }
    }
""",
)
replace_once(
    adapter,
    "          'X-Callback-Url': this.configuration.callbackUrl,\n",
    "          ...(this.configuration.callbackUrl\n            ? { 'X-Callback-Url': this.configuration.callbackUrl }\n            : {}),\n",
)

test = "backend/direkt-api/test/unit/mtn-momo-sandbox-payment-provider.adapter.spec.ts"
replace_count(test, "260971000001", "46733123470", 3)
replace_once(
    test,
    """function createAdapter(): MtnMomoSandboxPaymentProviderAdapter {
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
      callbackUrl: CALLBACK_URL,
      timeoutMs: 5000,
    },
  );
}
""",
    """function createAdapter(
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
""",
)
insert_once(
    test,
    "  it('independently verifies a successful status with exact amount and currency', async () => {\n",
    """  it('supports status-polling-only initiation without a callback header', async () => {
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

""",
)

canary = "backend/direkt-api/src/commercial/rc8-payment-canary.ts"
replace_once(
    canary,
    "      callbackUrl: requireEnvironment('RC8_MTN_CALLBACK_URL'),\n",
    "",
)

runner = "scripts/rc8/run-payments-managed.sh"
replace_once(
    runner,
    "RC8_MTN_SYNTHETIC_MSISDN=260971000001,RC8_MTN_CALLBACK_URL=https://app.direkt.forum/rc8-sandbox-callback-disabled,",
    "RC8_MTN_SYNTHETIC_MSISDN=46733123470,",
)

verifier = "scripts/rc8/verify-payments-contract.py"
insert_once(
    verifier,
    'require(CANARY, "RC8_PAYMENTS_RECEIPT|")\n',
    """require(MTN, "callbackUrl?: string")
require(MTN, "...(this.configuration.callbackUrl")
require(MTN_TEST, "status-polling-only initiation without a callback header")
require(MTN_TEST, "46733123470")
reject(CANARY, "RC8_MTN_CALLBACK_URL")
""",
)
insert_once(
    verifier,
    'require(MANAGED_RUNNER, "dpo_runtime_bound=false")\n',
    """require(MANAGED_RUNNER, "RC8_MTN_SYNTHETIC_MSISDN=46733123470")
reject(MANAGED_RUNNER, "RC8_MTN_CALLBACK_URL")
""",
)

implementation = "docs/integrations/RC8_SANDBOX_PAYMENTS_IMPLEMENTATION.md"
insert_once(
    implementation,
    "## Merge and runtime gates\n",
    """### Preserved exact-main managed attempt 2

Exact-main run `30238926656/2` reached the private Cloud Run Job after the owner least-privilege secret bootstrap. It failed before Stripe, PayPal or reconciliation because MTN returned HTTP 500 during Request to Pay. Artifact `8642921752` (`sha256:f78da1c133b7d7dfa0e8397657052bc178250dbe7322c2e5a5404234ba9e80d6`) preserves the sanitized failure receipt. The temporary job was deleted; cleanup succeeded; real money, participant data, production authorization and customer-to-provider payments remained false.

The correction removes the artificial callback-host dependency from this polling-only canary and uses the exact previously successful MTN sandbox payer `46733123470`. The reusable adapter still includes `X-Callback-Url` when a reviewed matching callback URL is configured, while the managed proof relies on independent status polling as the payment-truth boundary.

""",
)

print("RC8_MTN_POLLING_ONLY_PATCH|PASS")
