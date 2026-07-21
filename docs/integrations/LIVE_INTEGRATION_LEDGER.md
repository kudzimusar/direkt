# DIREKT Live Integration Ledger

**Repository:** `kudzimusar/direkt`  
**Last reconciled:** 2026-07-21 (Asia/Tokyo)  
**Governing issue:** #261 — Runtime integration closure after W8  
**Purpose:** Canonical cross-agent source of truth for integration existence, state, evidence, blockers and next actions.

> Every integration-related PR must update this ledger in the same change whenever provisioning, source integration, secrets, runtime binding, managed evidence, legal/commercial state, fallback/kill-switch or production authorization changes.

## Status vocabulary

| Status | Meaning |
|---|---|
| `ACTIVE` | Source/config/runtime evidence proves approved use. |
| `IMPLEMENTED_GATED` | Code exists but provider/real activation remains fail-closed. |
| `EXTERNALLY_PROVISIONED` | Account/API/product/credential exists, but runtime use is not proven. |
| `SANDBOX_PROVEN` | Real provider sandbox API flow succeeded, but DIREKT runtime/live activation is not approved. |
| `PENDING_PROVIDER` | Waiting on provider approval/onboarding. |
| `PLANNED` | Approved direction exists; implementation incomplete. |
| `DISABLED` | Intentionally off in the approved environment. |
| `SUPERSEDED` | Historical/fallback direction. |
| `BLOCKED` | Cannot progress without an external/legal/commercial/repository gate. |

No account, key, secret or dashboard project becomes `ACTIVE` by existence alone.

## Source-of-truth precedence

1. Exact current repository source and `WORKSTREAM_LOCK.md`.
2. Managed runtime evidence, CI and canaries.
3. This ledger and `CURRENT_INTEGRATION_STATUS.md`.
4. Provider dashboards and Secret Manager metadata.
5. Older plans, handoffs and conversation summaries.

## Core infrastructure

| Integration | State | Current role / evidence |
|---|---|---|
| Supabase PostgreSQL | `ACTIVE` | Canonical system of record; project `aeeuscifrxcjmnswqwnq`. |
| PostGIS | `ACTIVE` | Spatial/service-area foundation. |
| Supabase Storage | `ACTIVE` | Private evidence/media/export storage through server-side grants. |
| Supabase Data API/PostgREST | `QUARANTINED` | Not a privileged browser/client path. |
| NestJS DIREKT API | `ACTIVE` | IAM-private canonical REST/OpenAPI trust boundary. |
| Google Cloud project | `ACTIVE` | `direkt-dev-502701`, project number `264358173369`. |
| Artifact Registry | `ACTIVE` | Immutable container images. |
| Cloud Run | `ACTIVE` | Private API/operations plus public synthetic-only browser/BFF runtime. |
| Secret Manager | `ACTIVE` | Runtime secret authority. |
| GitHub Workload Identity Federation | `ACTIVE` | Keyless GitHub Actions → Google Cloud. |
| GitHub Actions | `ACTIVE` | CI/security/release/infrastructure gates. |
| Cloud Logging/Monitoring | `ACTIVE` | Infrastructure/runtime observability baseline. |
| Firebase project | `ACTIVE foundation` | Attached to `direkt-dev-502701`. |
| Firebase App Distribution | `ACTIVE` | Controlled Android tester distribution. |
| `direkt.forum` | `ACTIVE` | Canonical owner-controlled root/domain and preserved `/preview/`. |
| `app.direkt.forum` | `ACTIVE synthetic-review host` | W8 canonical functional browser/BFF host; run `29802524466` passed. |
| Operations portal | `ACTIVE private staging` | Privileged operator UI through the API. |
| Native Android | `ACTIVE implementation` | Primary customer/provider native client. |

## Payment integration programme

### Approved initial business scope

- provider subscriptions;
- verification-processing fees;
- renewal/re-verification fees;
- invoices/receipts;
- refunds/adjustments;
- reconciliation and administrative finance operations.

Not currently authorized as MVP production flows:

- customer-to-provider service payments;
- escrow;
- marketplace/provider payouts;
- DIREKT wallet/stored value.

### Payment trust rule

```text
Payment intent
  -> provider adapter
  -> external provider
  -> callback/status API
  -> independent verification
  -> immutable payment event
  -> DIREKT ledger
  -> invoice/receipt
  -> subscription/entitlement state
```

Clients never decide payment success. Payment state never creates verification, publication eligibility or ranking authority.

### Provider status

| Provider | State | Evidence / next action |
|---|---|---|
| MTN MoMo Collections API | `SANDBOX_PROVEN` | OAuth, Request to Pay, status query and final `SUCCESSFUL` verified. |
| MTN Collection Widget / QR / USSD | `EXTERNALLY_PROVISIONED` | Separate widget subscription exists; runtime feature not wired. |
| Airtel Money Zambia Cash-In API 2.0 | `PENDING_PROVIDER` | Zambia Op-Co app created in TEST mode; Cash-In added; merchant code `LHE8TGNW`; credentials await Airtel approval. |
| DPO Pay / Network | `SANDBOX_PROVEN` | `createToken` result `000`; hosted checkout completed; `verifyToken` result `000 Transaction Paid`. |
| Stripe Checkout | `SANDBOX_PROVEN` | Account sandbox `sk_test_` authentication passed; Checkout completed; server verification `complete/paid`. |
| Stripe Link | `EXTERNALLY_PROVISIONED / NOT EXPLICITLY PROVEN` | Account sandbox exists; Link-specific checkout evidence remains optional/outstanding. |
| PayPal | `SANDBOX_PROVEN` | OAuth, order, Personal sandbox approval, capture and independent verification all `COMPLETED`. |
| Flutterwave | `BLOCKED / DEFERRED` | Zambia self-service onboarding unavailable; provider later rejected/deferred onboarding because capacity/full. |
| Real money movement | `DISABLED` | Requires legal/commercial/provider/pilot/release gates. |
| Escrow | `PLANNED LATER` | Not current MVP; requires separate legal/regulatory/payout/dispute/KYC architecture. |

### Payment Secret Manager receipts

Secret names only; never record values.

**MTN MoMo**

- `direkt-mtn-momo-collections-subscription-key` — version 1 enabled.
- `direkt-mtn-momo-api-user` — version 1 enabled.
- `direkt-mtn-momo-api-key` — version 1 enabled.
- `direkt-mtn-momo-widget-subscription-key` — version 1 enabled.

Evidence: OAuth HTTP 200; Request to Pay accepted; payment-status HTTP 200; final `SUCCESSFUL`; provider financial transaction ID returned.

**Stripe**

- `direkt-stripe-sandbox-secret-key`
  - version 1 disabled — obsolete organization-scoped `sk_org_...` key;
  - version 2 enabled — correct account sandbox `sk_test_...` key.

Evidence: API auth HTTP 200; Checkout session created; final server verification `status=complete`, `payment_status=paid`, PaymentIntent returned.

**PayPal**

- `direkt-paypal-sandbox-client-id`
- `direkt-paypal-sandbox-client-secret`

Evidence: OAuth success; Personal sandbox buyer approval; server capture; final independent order/capture `COMPLETED`; USD 1.00 sandbox amount.

**Airtel**

No usable credentials stored yet because Zambia TEST approval remains pending.

**DPO**

Public DPO sandbox credentials were used for sandbox proof only. No private production DPO merchant credential is provisioned in DIREKT Secret Manager yet.

### Payment runtime closure still required

The repository payment port remains intentionally synthetic/disabled. Runtime closure must use provider-neutral adapters and keep real money disabled:

```text
PaymentProvider
  |- MtnMomoPaymentProvider
  |- AirtelMoneyPaymentProvider
  |- DpoPaymentProvider
  |- StripePaymentProvider
  |- PayPalPaymentProvider
  `- FlutterwavePaymentProvider (only if onboarding reopens)
```

Suggested routing intent:

- Zambia local provider subscriptions/verification fees: MTN / Airtel / approved aggregator.
- International/diaspora: Stripe + Link / PayPal.
- DPO: fallback/benchmark/local-card/mobile-money option after commercial onboarding.
- Flutterwave: deferred.

No payment provider secret is attached to Cloud Run until adapter/config/runtime allowlist and regression gates are reviewed.

## Communications and notifications

| Integration | State | Runtime closure required |
|---|---|---|
| Transactional outbox | `ACTIVE` | Canonical asynchronous delivery source of truth. |
| Resend | `EXTERNALLY_PROVISIONED` | Application adapter, Secret Manager binding, outbox consumer, idempotency/retry, templates/privacy, managed canary. |
| Firebase phone OTP | `IMPLEMENTED_GATED` | Real approved participant path, OTP canary, abuse/rate-limit/privacy/legal evidence. |
| FCM | `PLANNED` | Server send path, device-token lifecycle, Android handling/permission UX, retries/privacy/canary. |
| WhatsApp Cloud API | `EXTERNALLY CONFIGURED / RUNTIME GATED` | Runtime adapter, approved templates/phone identity where needed, consent-at-send, opt-out, idempotency, receipts/retries/privacy controls. |
| Firebase Crashlytics | `PLANNED` | Android plugin/runtime setup, privacy, release mapping, synthetic crash/ANR evidence and alerts. |
| Firebase Test Lab | `PLANNED` | CI/device matrix, test APKs, artifact/report retention. |
| Cloudflare Turnstile | `PLANNED / WHERE NEEDED` | Only for reviewed abuse-sensitive public flows with server verification, accessibility fallback and kill switch. |
| Cloud Tasks / Pub/Sub / Scheduler | `PLANNED ON DEMAND` | Add only when retry/fan-out/scheduling needs justify them. |

## Observability

| Integration | State | Direction |
|---|---|---|
| Cloud Logging / Monitoring | `ACTIVE` | Infrastructure/runtime baseline. |
| Sentry API/portal | `EXTERNALLY_PROVISIONED / RUNTIME NOT PROVEN` | Separate API/portal boundaries, PII minimization/scrubbing, releases/source maps, managed canary and kill switch. |
| Firebase Crashlytics | `PLANNED` | Preferred Android crash/ANR path unless architecture explicitly changes. |

Never send raw evidence, auth tokens, cookies, contact data, exact private coordinates or unnecessary free text to telemetry providers.

## Maps and location

| Integration | State | Direction |
|---|---|---|
| PostGIS | `ACTIVE` | Canonical spatial/service-area model. |
| Manual area/list fallback | `ACTIVE` | Must remain available if map provider fails. |
| Google Maps Platform | `EXTERNALLY_PROVISIONED / RUNTIME NOT PROVEN` | Separate restricted Android/backend credentials if required; privacy, quotas, fallback, kill switch and non-leakage tests. |
| Private provider coordinates | `DISABLED FOR PUBLICATION` | Exact private bases must not become public markers/ranking inputs. |

## API/client contract tooling

| Integration | State | Notes |
|---|---|---|
| OpenAPI | `ACTIVE` | Canonical backend contract generated/drift-checked in CI. |
| Android API boundary | `ACTIVE` | Backend API only; no privileged direct Supabase path. |
| Web/PWA BFF/API boundary | `ACTIVE reviewed architecture` | Canonical API remains IAM-private. |
| Fully generated Kotlin client | `NOT ADOPTED` | Requires reviewed incremental migration after API shape stabilizes. |
| Fully generated TypeScript client | `NOT ADOPTED` | Requires reviewed incremental migration after API shape stabilizes. |

## Verification authorities / registries

| Authority | State | Rule |
|---|---|---|
| PACRA | `MANUAL EVIDENCE SOURCE` | No fabricated API access/scraping. |
| NCC | `MANUAL EVIDENCE SOURCE` | Manual evidence where applicable. |
| TEVETA | `MANUAL EVIDENCE SOURCE` | Manual qualification/training evidence. |
| Automated registry APIs | `NOT AUTHORIZED` | Activate only through formal lawful access. |

## Runtime closure queue

The authoritative sequence is maintained in `WORKSTREAM_LOCK.md` and `RUNTIME_INTEGRATION_CLOSURE_PLAN.md`. At this checkpoint:

1. RC0 ledger/audit/permanent-gate sanity/payment evidence reconciliation.
2. Resend.
3. Sentry API/portal.
4. Crashlytics Android.
5. FCM.
6. Firebase Test Lab.
7. WhatsApp runtime adapter.
8. Google Maps runtime.
9. Sandbox-only payment adapters/evidence reconciliation.
10. OpenAPI generated Kotlin/TypeScript client adoption decision/migration.
11. Turnstile only if justified.
12. Full combined regression and lane release.

Airtel is revisited immediately when provider approval arrives. Flutterwave remains deferred until onboarding reopens.

## Evidence / receipt discipline

For every checkpoint record:

- provider/product;
- environment (`sandbox`, `test`, `staging`, `pilot`, `production`);
- safe account/app/project identifier;
- Secret Manager names and enabled numeric versions, never values;
- API result/status codes;
- managed workflow/run ID where applicable;
- exact commit/PR;
- runtime service/revision;
- privacy/legal/commercial gates;
- fallback/kill switch;
- blocker and owner.

Never store secret values, OAuth/access tokens, raw sensitive webhook payloads, full payment credentials or participant private data here.

## Mandatory agent handoff template

```text
Integration:
Previous state:
New state:
External provisioning:
Repo/source changes:
Secret Manager names/versions:
Runtime binding:
Managed canary evidence:
Privacy/security checks:
Fallback/kill switch:
Production authorization:
Known blockers:
Next exact step:
Ledger updated: YES
```

If `Ledger updated` is not `YES`, the integration handoff is incomplete.
