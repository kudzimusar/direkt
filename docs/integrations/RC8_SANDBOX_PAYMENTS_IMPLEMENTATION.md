# RC8 Sandbox Payment Adapters and Reconciliation

**Governing issue:** #261
**Branch:** `integration/rc8-sandbox-payments`
**Replayed base:** `main@54d0129027b7f324272c4bcc94a0f2109318fd18`
**State:** IMPLEMENTED_GATED / MANAGED PROOF ARMED

## Source replay receipt

RC7 closed through PR #487, and RC8 became the sole bounded repository lane through PR #488. The original PR #454 source checkpoint was replayed losslessly as one commit over `main@54d0129027b7f324272c4bcc94a0f2109318fd18`: all 16 net RC8 files were preserved, while stale pre-RC7 history was removed.

The source checkpoint was promoted through PR #454 at `6098b71f89d62fa059de298be11a8d9d8539c25e`. It remains fail-closed in the application: no provider is registered as runtime-enabled, no API service secret binding, controller route, webhook endpoint or database executor was introduced. Managed proof is isolated to one private temporary Cloud Run Job.

## Approved RC8 scope

RC8 is limited to sandbox adapters and reconciliation for DIREKT-owned provider commercial charges:

- provider subscriptions;
- verification-processing fees;
- renewal or re-verification fees;
- invoice and receipt state;
- refunds or accounting adjustments where the provider supports them;
- settlement and reconciliation evidence.

RC8 does not authorize:

- customer-to-provider service payments;
- escrow or marketplace payouts;
- stored value or a DIREKT wallet;
- real participant payment data;
- real money movement;
- production payment credentials or production provider endpoints;
- payment influence over verification, publication, trust or ranking.

## Provider programme

| Provider | RC8 state | Source treatment |
|---|---|---|
| MTN MoMo Collections | Sandbox proven | Source adapter implemented and source-tested behind an unbound runtime gate; managed sandbox execution remains pending. |
| Airtel Money Zambia Cash-In | Provider pending | Registered fail-closed with no usable credential metadata. |
| DPO Pay by Network | Sandbox proven | Source adapter implemented and source-tested for `createToken`, hosted checkout and independent `verifyToken`; runtime remains unbound. |
| Stripe Checkout | Sandbox proven | Source adapter implemented and source-tested for test Checkout Session creation and independent server retrieval; runtime remains unbound. |
| PayPal Orders | Sandbox proven | Source adapter implemented and source-tested for order creation, server capture and independent order retrieval; runtime remains unbound. |
| Flutterwave | Deferred/blocked | Excluded from the executable RC8 provider catalogue. |

## RC8A source foundation — green

The first bounded slice establishes:

1. an explicit provider-neutral sandbox port;
2. one immutable provider catalogue with capability and readiness metadata;
3. exact allowed business flows;
4. Secret Manager-only credential sourcing;
5. synthetic-only, non-production and no-participant-data execution rules;
6. real-money and customer-to-provider payment prohibitions;
7. duplicate-registration rejection;
8. provider-pending rejection for Airtel;
9. runtime-disabled adapters for every registered provider;
10. a permanent parser/static contract and unit regressions.

RC8A performs no network request and binds no provider credential. Exact-head Backend CI passed formatting, lint, typecheck, authorization checks, migrations, tests, build and OpenAPI together with the applicable container, integration, PWA, supply-chain, recovery, staging and Phase 11 regressions.

## RC8B — MTN MoMo Collections source adapter — green

The MTN source adapter models the proven asynchronous Collections path while remaining absent from the application registry/runtime binding:

- OAuth through injected server-only sandbox credentials;
- the exact MTN sandbox host and sandbox target environment;
- Request to Pay using the DIREKT payment-intent UUID as `X-Reference-Id`;
- credential-free HTTPS callback configuration;
- HTTP `202 Accepted` mapped only to `processing`, never payment success;
- independent status retrieval before success can be recorded;
- exact amount and currency comparison against the DIREKT intent;
- provider financial-transaction identifier required for a successful result;
- synthetic mobile-money account enforcement before any provider request;
- bounded external references, request timeout and retryable/non-retryable error separation;
- raw provider payloads and credentials excluded from returned evidence.

RC8B passed formatting, lint, typecheck, authorization, migrations, unit tests, build and OpenAPI. It has no environment/config registration, Secret Manager runtime binding or managed provider execution. The existing Phase 9 synthetic adapter remains the only executable payment-provider path.

## RC8C — hosted checkout providers — green

### Stripe Checkout

- an account-scoped `sk_test_` credential is injected server-side;
- the Stripe API version is explicit rather than silently drifting;
- Checkout Session creation uses the DIREKT payment-intent UUID as the idempotency key;
- the provider reference and bounded DIREKT intent reference are preserved in Checkout metadata;
- only the reviewed hosted-checkout business flows and non-ZMW currency path are accepted;
- only an HTTPS `checkout.stripe.com` test Checkout URL may be returned to a client;
- browser success/cancel redirects do not create payment truth;
- the backend retrieves the Checkout Session independently;
- only `status=complete` with `payment_status=paid`, an exact amount/currency match and a valid PaymentIntent id maps to `succeeded`;
- open/unpaid sessions remain `requires_action`, expired sessions become `cancelled`, and malformed or mismatched facts fail closed.

### PayPal Orders

- OAuth uses injected server-only sandbox client credentials and the exact PayPal sandbox API host;
- order creation uses the DIREKT payment-intent UUID as `PayPal-Request-Id`;
- only HTTPS approval links on `www.sandbox.paypal.com` may be returned;
- payer approval is not payment success;
- server capture is idempotent but returns only `processing` with `independentlyVerified=false`;
- only a later independent GET of the order may produce `succeeded`;
- the retrieved order must match the exact amount and currency and contain a valid capture id;
- refund and partial-refund states remain successful historical payments with explicit adjustment facts rather than rewriting the original transaction.

### DPO Pay by Network

- token creation uses the reviewed API v6 XML endpoint;
- only the approved DPO hosted-payment URL is returned;
- `CompanyRefUnique` prevents reference reuse;
- ZMW amount, currency, service type and payment-time limit are bounded;
- the browser return does not create payment truth;
- only independent `verifyToken` facts can produce `succeeded`;
- final amount, currency, approval, completion and provider transaction reference must all match;
- DPO result codes and HTTP failures are sanitized into retryable or rejected states.

Stripe, PayPal and DPO passed their source adapter unit regressions together with the complete applicable repository matrix. None has environment/config registration, a Secret Manager runtime binding, a provider webhook endpoint or managed sandbox execution.

## RC8D — provider-neutral reconciliation and immutable adjustments — green

RC8D adds a pure provider-neutral reconciliation planner above the provider adapters and below the existing Phase 9 commercial state machines.

### Immutable provider observations

Every normalized provider result becomes a bounded append-only observation containing only:

- provider key and provider reference;
- provider transaction identifier when present;
- normalized status;
- amount and currency;
- refund or partial-refund status and explicit adjustment amount when available;
- independent-verification flag;
- occurrence time, policy version and a SHA-256 observation fingerprint.

Credentials and raw provider payloads are never included. Identical provider facts produce the same fingerprint and are treated as duplicates without another payment event, ledger posting, reconciliation case or adjustment request.

### Exact comparison boundary

The planner compares the immutable provider observation with:

- provider key and reference on the DIREKT payment intent;
- payment-intent provider, invoice, revision, status, amount and currency;
- invoice provider scope, status, amount and currency;
- append-only received, reversed, refunded and adjustment ledger totals.

A successful provider result can create a planned payment transition and one balanced `payment_received` posting only when the provider result is independently verified, the invoice is open, all references match, amount/currency match exactly and a provider transaction identifier exists.

The planner never silently repairs a mismatch. It opens a system-owned reconciliation plan for provider-reference, provider-key, verification, scope, amount, currency, invoice-state, terminal-status or ledger-net disagreement.

### Immutable adjustment handling

A provider refund does not rewrite the original successful payment, invoice or historical ledger rows.

- a full refund uses the full independently verified provider amount;
- a partial refund requires an explicit bounded adjustment amount;
- invalid, missing or conflicting adjustment amounts open reconciliation cases;
- a new valid refund creates a `synthetic_refund` adjustment request and a linked reconciliation-review plan;
- no ledger mutation occurs at observation time;
- the request requires two independent approvers;
- the requester may not approve their own request;
- an already-posted matching refund is recognized without a duplicate adjustment;
- conflicting existing refund totals open a ledger reconciliation case.

Application of an approved adjustment remains governed by the existing Phase 9 database state machines and balanced append-only ledger functions.

### Operations-only resolution

Reconciliation resolution plans require:

- an operations actor;
- `commercial.reconciliation.manage` authority;
- the exact expected case revision;
- an allowed `open → investigating/resolved → closed` transition;
- a bounded reason code, explanation and policy version.

Resolution produces an append-only event plan and never mutates the supplied case snapshot.

### RC8D source state

The exact RC8D head passed repository formatting, lint, strict typechecking, route-authorization checks, migrations, all backend tests, build and OpenAPI, together with the RC8 contract, container, runtime audit, PWA, supply-chain, recovery, staging, documentation and Phase 11 gates.

RC8D still has no controller route, provider runtime binding, database executor or managed provider transaction. The permanent RC8 contract prevents removal of observation fingerprinting, mismatch queues, immutable history flags, two-person adjustment approval and operations-only reconciliation.

## Managed runtime proof — armed

The reviewed runtime slice is source-controlled on `feat/rc8-managed-sandbox-proof` from `6098b71f89d62fa059de298be11a8d9d8539c25e`. It:

- validates existing Secret Manager containers and pinned numeric versions without reading values through GitHub CI;
- requires secret-scoped `roles/secretmanager.secretAccessor` only for `direkt-api-runtime`;
- builds an immutable exact-main backend image;
- creates one private, synthetic-only Cloud Run Job with zero retries and bounded timeout;
- activates cloned descriptors only inside the canary process while `PAYMENT_PROVIDER_MODE=disabled` remains true for the application;
- proves MTN Request to Pay plus independent successful status;
- proves an unpaid Stripe Checkout and unapproved PayPal order remain `requires_action`;
- proves append-only success planning, balanced posting, duplicate suppression, mismatch review and immutable two-person refund adjustment planning;
- emits only sanitized receipts and deletes the temporary job on every outcome.

DPO remains runtime-unbound because no DIREKT private sandbox credential exists. Airtel remains provider-pending. Flutterwave remains deferred/excluded. No PayPal capture, browser approval, real money, participant data, production endpoint, customer-to-provider payment, escrow, wallet, payout or direct ledger mutation is authorized.

### Preserved exact-main managed attempt 2

Exact-main run `30238926656/2` reached the private Cloud Run Job after the owner least-privilege secret bootstrap. It failed before Stripe, PayPal or reconciliation because MTN returned HTTP 500 during Request to Pay. Artifact `8642921752` (`sha256:f78da1c133b7d7dfa0e8397657052bc178250dbe7322c2e5a5404234ba9e80d6`) preserves the sanitized failure receipt. The temporary job was deleted; cleanup succeeded; real money, participant data, production authorization and customer-to-provider payments remained false.

The correction removes the artificial callback-host dependency from this polling-only canary and uses the exact previously successful MTN sandbox payer `46733123470`. The reusable adapter still includes `X-Callback-Url` when a reviewed matching callback URL is configured, while the managed proof relies on independent status polling as the payment-truth boundary.

## Merge and runtime gates

The source checkpoint is merged. The managed proof may execute only after the runtime-source exact head passes all applicable repository regressions and the following controls remain enforced:

- explicit sandbox target environment;
- source-controlled provider allowlist;
- exact Secret Manager containers and least-privilege runtime binding;
- timeouts, bounded retries and idempotency;
- callback/webhook authenticity or independent status verification;
- sanitized receipts and no credential/raw-payload leakage;
- real money and production authorization remain false;
- Android and browser clients cannot declare payment success.
