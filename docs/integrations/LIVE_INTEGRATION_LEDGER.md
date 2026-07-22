# DIREKT Live Integration Ledger

**Repository:** `kudzimusar/direkt`  
**Last reconciled:** 2026-07-22 (Asia/Tokyo)  
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

## AI provider foundation

| Integration | State | Evidence / boundary |
|---|---|---|
| Provider-neutral `AiProvider` backend contract | `IMPLEMENTED_GATED` | Gemini primary and Groq fallback adapters, synthetic-only input gate, bounded timeout/failover and non-authoritative AI rules implemented under Issue #264 / PR #265. |
| Gemini Developer API | `SANDBOX_PROVEN / RUNTIME NOT BOUND` | Synthetic canary returned HTTP 200 with `DIREKT_AI_OK`; server-only secret `direkt-gemini-dev-api-key` version 1 is enabled. |
| Groq hosted open-model fallback | `SANDBOX_PROVEN / RUNTIME NOT BOUND` | Synthetic canary returned HTTP 200 with `DIREKT_GROQ_OK`; server-only secret `direkt-groq-dev-api-key` version 1 is enabled. |
| Ollama local fallback | `PLANNED / LOCAL ONLY` | No-key developer/offline fallback; not a Cloud Run dependency. |
| OpenRouter free router | `PLANNED / OPTIONAL` | Development/emergency candidate only; not a core production dependency. |
| Production AI | `DISABLED` | No real participant data or authoritative trust/payment/dispute/publication decision may be delegated to AI. |

AI0 does **not** mark an AI provider `ACTIVE`: the proven API canaries were synthetic external checks, not a DIREKT Cloud Run runtime binding. AI remains fail-closed by default. Free-tier/external AI providers may receive only synthetic/non-sensitive data until privacy/data-use/legal review explicitly authorizes a broader boundary.

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
| Resend | `ACTIVE — SYNTHETIC-ONLY MANAGED CANARY` | Managed Cloud Run execution `direkt-resend-canary-ct9mp` succeeded on exact source `8e367f47f16b3f9f28a26a62ee8bdd305a286153`, proving outbox insert → claim → Resend send → durable `published` state. Sending key is sending-only/domain-restricted to verified `notify.direkt.forum`; `direkt-resend-api-key` v1 enabled; runtime secret access proven. Continuous, controlled-pilot participant and production email remain disabled. |
| Firebase phone OTP | `IMPLEMENTED_GATED` | Real approved participant path, OTP canary, abuse/rate-limit/privacy/legal evidence. |
| FCM | `IMPLEMENTED_GATED / SYNTHETIC CANARY PENDING` | RC4 source integration adds provider-neutral HTTP v1 delivery through `communications.push.send.v1`, server-only identity-bound token lifecycle, Android foreground/background receipt handling and Android 13+ notification permission controls. Participant registration is source-controlled disabled; exact-source managed foreground/background synthetic delivery evidence remains required before ACTIVE status. |
| WhatsApp Cloud API | `EXTERNALLY CONFIGURED / RUNTIME GATED` | Runtime adapter, approved templates/phone identity where needed, consent-at-send, opt-out, idempotency, receipts/retries/privacy controls. |
| Firebase Crashlytics | `ACTIVE — SYNTHETIC-ONLY MANAGED CANARY` | RC3 exact-source managed proof succeeded for `9098f7eb333baf096163f1564b3d8e5e5da3fcf0`; bridge run `29885635547` enforced marker-pinned source identity and terminal canary success for fatal delivery, focused input-dispatch ANR, historical `REASON_ANR`, restart pickup and post-ANR Crashlytics/DataTransport delivery. Automatic collection remains default-off; Firebase Analytics and stable participant user IDs are absent; participant/production telemetry remains disabled. |
| Firebase Test Lab | `PLANNED` | CI/device matrix, test APKs, artifact/report retention. |
| Cloudflare Turnstile | `PLANNED / WHERE NEEDED` | Only for reviewed abuse-sensitive public flows with server verification, accessibility fallback and kill switch. |
| Cloud Tasks / Pub/Sub / Scheduler | `PLANNED ON DEMAND` | Add only when retry/fan-out/scheduling needs justify them. |

Controlled-pilot participant and production FCM delivery remain disabled during RC4. Device-token registration is fail-closed unless a later controlled-pilot authorization explicitly enables the source-controlled registration gate.

## Observability

| Integration | State | Direction |
|---|---|---|
| Cloud Logging / Monitoring | `ACTIVE` | Infrastructure/runtime baseline. |
| Sentry API/portal | `ACTIVE — SYNTHETIC-ONLY MANAGED CANARY` | Source PR #275 merged at `15210c5b0bf1832e32f8c33a7618c69f61f65275`. Managed Sentry canary #1 completed SUCCESS in 4m15s for separate `direkt-api` and `direkt-operations-portal` projects. DSNs are separately bound through `direkt-sentry-api-dsn` v1 and `direkt-sentry-portal-dsn` v1; `direkt-sentry-auth-token` v2 is CI/release-only and absent from application runtime. Default PII, traces, SDK logs, breadcrumbs, local variables and replay are disabled; privacy scrubbers redact sensitive text/coordinates. Exact SHA release binding is required. Cloud Logging remains authoritative. Participant/production Sentry telemetry remains disabled. |
| Firebase Crashlytics | `ACTIVE — SYNTHETIC-ONLY MANAGED CANARY` | Android crash/ANR ownership is proven under RC3 on exact source `9098f7eb333baf096163f1564b3d8e5e5da3fcf0`; managed bridge run `29885635547` passed all exact-source and terminal-proof controls. Default collection remains off outside the bounded debug canary and production/participant telemetry is not authorized. |

Never send raw evidence, auth tokens, cookies, contact data, exact private coordinates or unnecessary free text to telemetry providers.

### RC3 Crashlytics closure receipt

```text
Integration: Firebase Crashlytics Android (RC3)
Previous state: IMPLEMENTED_GATED / SYNTHETIC CANARY PENDING
New state: CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY
External provisioning: Firebase project direkt-dev-502701; registered debug application package com.kudzimusar.direkt.debug
Repo/source changes: Crashlytics SDK/plugin integration, default-off collection/privacy guards, exact-source synthetic fatal+ANR canary, deterministic focus/input-dispatch and REASON_ANR proof harness, exact-source dispatch enforcement; exact proven source 9098f7eb333baf096163f1564b3d8e5e5da3fcf0
Secret Manager names/versions: no new Crashlytics application secret; GitHub OIDC and temporary Firebase app configuration retrieval remain managed and non-persistent
Runtime binding: debug/staging synthetic-only canary path; release/participant automatic collection remains disabled
Managed canary evidence: RC3 managed proof bridge run 29885635547 SUCCESS; marker-pinned SHA validation, exact-source canary dispatch, terminal success watch, sanitized receipt and success enforcement all passed; underlying canary proved fatal Crashlytics/DataTransport delivery, focused package-scoped Input dispatching timed out ANR, historical REASON_ANR, restart pickup and post-ANR delivery
Privacy/security checks: Firebase Analytics absent; no stable participant Crashlytics user ID; bounded non-identifying synthetic metadata only; no raw evidence/contact/auth token/private-coordinate payloads; release trigger remains absent
Fallback/kill switch: automatic collection default-off; build/canary/data-mode gates fail closed; Cloud Logging remains infrastructure authority
Production authorization: NOT AUTHORIZED; participant/production crash telemetry remains disabled
Known blockers: none for RC3 closure
Next exact step: RC4 FCM source/runtime closure
Ledger updated: YES
```

### RC4 FCM source-phase receipt

```text
Integration: Firebase Cloud Messaging (RC4)
Previous state: PLANNED
New state: IMPLEMENTED_GATED / SYNTHETIC CANARY PENDING
External provisioning: Firebase project direkt-dev-502701; registered Android debug application com.kudzimusar.direkt.debug; managed FCM API/least-privilege runtime role proof pending exact-source canary
Repo/source changes: provider-neutral backend FCM HTTP v1 adapter using managed Google identity; durable communications.push.send.v1 outbox with bounded retry/idempotency and invalid-token handling; server-only token table with classification anti-downgrade control; authenticated identity-bound registration/rotation/deletion routes; Android Messaging SDK/service, exact-source foreground/background receipt handling and Android 13+ permission control; source PR #339
Secret Manager names/versions: no persistent FCM application secret; managed canary is designed to create a one-run temporary FCM-token secret and delete it after proof
Runtime binding: default disabled; FCM provider activation restricted to non-production synthetic-only mode; participant registration source-controlled disabled
Managed canary evidence: PENDING — exact-source workflow must prove outbox → FCM HTTP v1 → Android foreground and background receipts before promotion
Privacy/security checks: no Firebase Analytics; no raw FCM token in API response/audit/logs/artifacts; device-token rows server-only; push payload restricted to bounded synthetic routing identifiers; routes require authenticated account.sessions.manage permission
Fallback/kill switch: PUSH_PROVIDER_MODE defaults disabled; PUSH_REGISTRATION_MODE defaults disabled; participant registration constant false; bounded retries and invalid-token invalidation
Production authorization: NOT AUTHORIZED; controlled-pilot participant and production push remain disabled
Known blockers: managed migration/runtime proof and exact-head source merge pending
Next exact step: complete exact-head PR #339 gates/review, merge source, apply RC4 migration to managed Supabase, then run exact-source managed FCM canary
Ledger updated: YES
```

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

1. RC0 ledger/audit/permanent-gate sanity/payment evidence reconciliation — **CLOSED** in PR #263.
2. AI0 provider-neutral AI foundation — **CLOSED** in PR #265 at `eafee4e5f54df9b216365cf2b8217b9a52cb1ada`; Gemini/Groq remain runtime-gated.
3. RC1 Resend — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**. Source PR #269 merged; least-privilege sending/domain restriction and runtime secret access proven; Cloud Run execution `direkt-resend-canary-ct9mp` succeeded on exact source `8e367f47f16b3f9f28a26a62ee8bdd305a286153`; workflow-reporting compatibility hotfixes #271/#272 merged. Real-participant/production email remains disabled.
4. RC2 Sentry API/portal — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**. PR #275 merged at `15210c5b0bf1832e32f8c33a7618c69f61f65275`; managed API + private portal canary #1 completed successfully. Separate DSN v1 bindings proven; Sentry auth token v2 remained CI/release-only; participant/production telemetry disabled.
5. RC3 Crashlytics Android — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**. Exact source `9098f7eb333baf096163f1564b3d8e5e5da3fcf0`; managed bridge run `29885635547` passed marker-pinned exact-source enforcement and terminal fatal+ANR delivery proof. Participant/production telemetry remains disabled.
6. RC4 FCM — **IMPLEMENTED_GATED / SYNTHETIC CANARY PENDING**. Source PR #339 adds backend-owned outbox delivery, identity-bound token lifecycle and Android receive/permission handling; participant registration remains disabled pending managed exact-source proof.
7. RC5 Firebase Test Lab.
8. RC6 WhatsApp runtime adapter.
9. RC7 Google Maps runtime.
10. RC8 sandbox-only payment adapters/evidence reconciliation.
11. RC9 OpenAPI generated Kotlin/TypeScript client adoption decision/migration.
12. RC10 Turnstile only if justified.
13. RC11 full combined regression and lane release.

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
