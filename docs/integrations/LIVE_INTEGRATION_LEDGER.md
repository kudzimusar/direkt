# DIREKT Live Integration Ledger

**Repository:** `kudzimusar/direkt`  
**Last reconciled:** 2026-07-21 (Asia/Tokyo)  
**Governing issue:** #261 — Runtime integration closure after W8  
**Purpose:** Canonical cross-agent source of truth for integration existence, state, evidence, blockers and next actions.

> Every integration-related PR must update this ledger whenever provisioning, source integration, secrets, runtime binding, managed evidence, legal/commercial state, fallback/kill-switch or production authorization changes.

## Status vocabulary

| Status | Meaning |
|---|---|
| `ACTIVE` | Source/config/runtime evidence proves approved use. |
| `IMPLEMENTED_GATED` | Code exists but broader/provider activation remains fail-closed. |
| `EXTERNALLY_PROVISIONED` | Account/API/product/credential exists, runtime use not proven. |
| `SANDBOX_PROVEN` | Real provider sandbox flow succeeded; DIREKT runtime/live activation not approved. |
| `PENDING_PROVIDER` | Waiting on provider approval/onboarding. |
| `PLANNED` | Approved direction exists; implementation incomplete. |
| `DISABLED` | Intentionally off in approved environment. |
| `SUPERSEDED` | Historical/fallback direction. |
| `BLOCKED` | Cannot progress without external/legal/commercial/repository gate. |

No account, key, secret, dashboard project or SDK becomes `ACTIVE` by existence alone.

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
| GitHub WIF | `ACTIVE` | Keyless GitHub Actions → Google Cloud. |
| GitHub Actions | `ACTIVE` | CI/security/release/infrastructure gates. |
| Cloud Logging/Monitoring | `ACTIVE` | Authoritative infrastructure/runtime telemetry. |
| Firebase project | `ACTIVE foundation` | Attached to `direkt-dev-502701`. |
| Firebase App Distribution | `ACTIVE` | Controlled Android tester distribution. |
| `direkt.forum` | `ACTIVE` | Canonical owner-controlled root/domain. |
| `app.direkt.forum` | `ACTIVE synthetic-review host` | W8 canonical browser/BFF host; run `29802524466` passed. |
| Operations portal | `ACTIVE private staging` | Privileged operator UI through canonical API. |
| Native Android | `ACTIVE implementation` | Primary customer/provider native client. |

## AI provider and use-case ledger

| Integration / use case | State | Evidence / boundary |
|---|---|---|
| Provider-neutral `AiProvider` backend contract | `IMPLEMENTED_GATED` | PR #265; Gemini primary/Groq fallback adapters; synthetic-only `AiService` input gate; timeout/failover; non-authoritative AI rule. |
| Gemini Developer API | `SANDBOX_PROVEN / RUNTIME NOT BOUND` | Synthetic provider canary returned HTTP 200 / `DIREKT_AI_OK`; server-only Secret Manager key version enabled. |
| Groq hosted open-model fallback | `SANDBOX_PROVEN / RUNTIME NOT BOUND` | Synthetic provider canary returned HTTP 200 / `DIREKT_GROQ_OK`; server-only Secret Manager key version enabled. |
| Customer discovery intent/category assist | `IMPLEMENTED_GATED` | Active-category allowlist validation, explicit customer confirmation, deterministic category matching fallback, per-use-case kill switch. |
| Grounded public Help | `IMPLEMENTED_GATED` | Approved public fact set/source identifiers, deterministic help fallback, per-use-case kill switch. |
| Provider onboarding/readiness guide | `IMPLEMENTED_GATED` | Synthetic provider-safe context only when explicitly enabled; deterministic readiness fallback. |
| Provider public-profile draft | `IMPLEMENTED_GATED` | Provider-confirmed facts only; editable draft; provider confirmation required; manual fallback. |
| Operations case summary / restricted evidence OCR | `DISABLED / RESTRICTED_GATED` | No restricted evidence/model use without dedicated privacy/security/data-processing/provider approval and runtime proof. |
| Production AI | `DISABLED` | No real participant data or authoritative verification/trust/payment/dispute/publication decision delegated to AI. |

Current managed DIREKT runtime does **not** bind Gemini/Groq as active application providers. AI modes default fail-closed. Current user-facing AI surfaces therefore use deterministic/manual fallback unless a reviewed synthetic environment explicitly enables both the use case and provider binding. The backend rejects non-synthetic model requests.

## Payment integration programme

### Approved initial business scope

- provider subscriptions;
- verification-processing fees;
- renewal/re-verification fees;
- invoices/receipts;
- refunds/adjustments;
- reconciliation and administrative finance operations.

Not authorized as MVP production flows: customer-to-provider service payments, escrow, marketplace/provider payouts, DIREKT wallet/stored value.

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
| Airtel Money Zambia Cash-In API 2.0 | `PENDING_PROVIDER` | Zambia TEST app/Cash-In exists; credentials await Airtel approval. |
| DPO Pay / Network | `SANDBOX_PROVEN` | `createToken` result `000`; hosted checkout; `verifyToken` result `000 Transaction Paid`. |
| Stripe Checkout | `SANDBOX_PROVEN` | Account-sandbox auth/Checkout/payment verification succeeded. |
| Stripe Link | `EXTERNALLY_PROVISIONED / NOT EXPLICITLY PROVEN` | Dedicated Link evidence optional/outstanding. |
| PayPal | `SANDBOX_PROVEN` | OAuth, order, Personal sandbox approval, capture and independent verification `COMPLETED`. |
| Flutterwave | `BLOCKED / DEFERRED` | Zambia onboarding unavailable/deferred due provider capacity. |
| Real money movement | `DISABLED` | Requires legal/commercial/provider/pilot/release gates. |
| Escrow | `PLANNED LATER` | Separate legal/regulatory/payout/dispute/KYC architecture required. |

### Payment Secret Manager receipts

Secret names only; never record values.

**MTN MoMo**
- `direkt-mtn-momo-collections-subscription-key` — version 1 enabled.
- `direkt-mtn-momo-api-user` — version 1 enabled.
- `direkt-mtn-momo-api-key` — version 1 enabled.
- `direkt-mtn-momo-widget-subscription-key` — version 1 enabled.

**Stripe**
- `direkt-stripe-sandbox-secret-key` version 1 disabled — obsolete organization-scoped key.
- version 2 enabled — correct account sandbox key.

**PayPal**
- `direkt-paypal-sandbox-client-id`
- `direkt-paypal-sandbox-client-secret`

**Airtel**
- no usable credentials stored yet; Zambia TEST approval pending.

**DPO**
- public sandbox credentials used for proof only; no production DPO merchant credential provisioned in DIREKT Secret Manager.

RC8 must implement provider-neutral sandbox adapters/reconciliation while keeping real money disabled.

## Communications and notifications

| Integration | State | Runtime evidence / next closure |
|---|---|---|
| Transactional outbox | `ACTIVE` | Canonical asynchronous delivery source of truth. |
| Resend | `ACTIVE — SYNTHETIC-ONLY MANAGED CANARY` | Cloud Run execution `direkt-resend-canary-ct9mp` on exact source `8e367f47f16b3f9f28a26a62ee8bdd305a286153` proved outbox insert → claim → provider send → durable `published`. Key sending-only/domain-restricted to `notify.direkt.forum`. Real participant/production email disabled. |
| Firebase phone OTP | `IMPLEMENTED_GATED` | Real approved participant path/OTP canary/abuse/privacy/legal evidence still gated. |
| FCM | `PLANNED` | RC4 server send path, token lifecycle, Android notification handling/permissions, retries/privacy/canary. |
| WhatsApp Cloud API | `EXTERNALLY CONFIGURED / RUNTIME GATED` | RC6 adapter, consent-at-send, opt-out, templates, idempotency, receipts/retries/privacy. |
| Firebase Crashlytics | `PLANNED / NOT SOURCE-ACTIVE` | RC3 next: Android plugin/runtime, privacy, release mapping, synthetic crash/ANR evidence and alerts. |
| Firebase Test Lab | `PLANNED` | RC5 device matrix after RC3–RC4 dependency stabilization. |
| Cloudflare Turnstile | `PLANNED / WHERE NEEDED` | RC10 threat-model decision. |
| Cloud Tasks / Pub/Sub / Scheduler | `PLANNED ON DEMAND` | Add only when justified by real retry/fan-out/scheduling need. |

## Observability

| Integration | State | Evidence / boundary |
|---|---|---|
| Cloud Logging / Monitoring | `ACTIVE` | Authoritative infrastructure/runtime baseline. |
| Sentry API/portal | `ACTIVE — SYNTHETIC-ONLY MANAGED CANARY` | PR #275 source integration; exact merged proof source `035f4e8ff60a6e571d7aa09c0eaedb831c73648b`; Issue #261 contains sanitized managed dispatch + final `success` receipt. Separate API/portal DSNs, enabled numeric Secret Manager versions, exact release SHA, API/portal event IDs/flush, private portal invocation cleanup, PII minimization and kill switch proven. |
| Firebase Crashlytics | `PLANNED / NEXT` | Preferred Android crash/ANR path; Sentry Android remains inactive. |

RC2 details: `docs/integrations/RC2_SENTRY_CLOSURE.md`.

Never send raw evidence, auth tokens, cookies, raw contact data, exact private coordinates or unnecessary free text to telemetry providers. RC2 does not authorize real participant or production restricted-data telemetry.

## Maps and location

| Integration | State | Direction |
|---|---|---|
| PostGIS | `ACTIVE` | Canonical spatial/service-area model. |
| Manual area/list fallback | `ACTIVE` | Must remain available if map provider fails. |
| Google Maps Platform | `EXTERNALLY_PROVISIONED / RUNTIME NOT PROVEN` | RC7: restricted Android/backend credentials if required; privacy, quotas, fallback, kill switch and non-leakage tests. |
| Private provider coordinates | `DISABLED FOR PUBLICATION` | Exact private bases must not become public markers/ranking inputs. |

## API/client contract tooling

| Integration | State | Notes |
|---|---|---|
| OpenAPI | `ACTIVE` | Canonical backend contract generated/drift-checked in CI. |
| Android API boundary | `ACTIVE` | Backend API only; no privileged direct Supabase path. |
| Web/PWA BFF/API boundary | `ACTIVE reviewed architecture` | Canonical API remains IAM-private. |
| Fully generated Kotlin client | `NOT ADOPTED` | RC9 reviewed incremental migration/decision. |
| Fully generated TypeScript client | `NOT ADOPTED` | RC9 reviewed incremental migration/decision. |

## Verification authorities / registries

| Authority | State | Rule |
|---|---|---|
| PACRA | `MANUAL EVIDENCE SOURCE` | No fabricated API access/scraping. |
| NCC | `MANUAL EVIDENCE SOURCE` | Manual evidence where applicable. |
| TEVETA | `MANUAL EVIDENCE SOURCE` | Manual qualification/training evidence. |
| Automated registry APIs | `NOT AUTHORIZED` | Activate only through formal lawful access. |

## Runtime closure queue

The authoritative sequence is maintained in `WORKSTREAM_LOCK.md` and `RUNTIME_INTEGRATION_CLOSURE_PLAN.md`.

1. RC0 ledger/audit/permanent-gate/payment evidence — **CLOSED — PR #263**.
2. AI0 provider-neutral AI foundation — **CLOSED — PR #265; provider runtime remains gated**.
3. RC1 Resend — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**.
4. RC2 Sentry API/portal — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**. Source PR #275; managed proof exact source `035f4e8ff60a6e571d7aa09c0eaedb831c73648b`; real-participant/production restricted-data telemetry disabled.
5. RC3 Firebase Crashlytics — **NEXT after fresh lane claim**.
6. RC4 FCM.
7. RC5 Firebase Test Lab.
8. RC6 WhatsApp Cloud API application adapter.
9. RC7 Google Maps runtime.
10. RC8 sandbox payment adapters/reconciliation.
11. RC9 generated Kotlin/TypeScript clients.
12. RC10 Turnstile threat-model decision.
13. RC11 combined integration regression/evidence index/lane release.

W8 and VC1–VC8 remain closed. No runtime integration checkpoint authorizes real participants, production external communications, real money, Phase 11 exit or Phase 12 production release.
