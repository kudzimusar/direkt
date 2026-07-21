# DIREKT Current Integration Status Register

**Authoritative as-of date:** 2026-07-21 (Asia/Tokyo)  
**Scope:** repository `kudzimusar/direkt`, managed development/staging evidence, live Supabase verification and owner-configured external services  
**Purpose:** prevent external provisioning, source integration and runtime activation from being conflated.  
**Detailed live receipts:** `LIVE_INTEGRATION_LEDGER.md`

## Status vocabulary

- **ACTIVE** — source/configuration and managed execution evidence prove approved runtime use.
- **IMPLEMENTED_GATED** — application/domain code exists, but broader/provider-backed activation remains fail-closed.
- **EXTERNALLY_PROVISIONED** — account/domain/credential setup exists, but application runtime use is not proven.
- **SANDBOX_PROVEN** — a real provider sandbox flow succeeded, but DIREKT runtime/live activation is not approved.
- **PENDING_PROVIDER** — provider account/product exists but provider approval or credential issuance is pending.
- **PLANNED** — approved direction exists; implementation/runtime binding incomplete.
- **DISABLED** — intentionally off in the approved environment.
- **SUPERSEDED** — historical/fallback direction, not the current preferred runtime.
- **BLOCKED** — cannot progress without an external/legal/commercial/repository gate.

No integration becomes ACTIVE merely because an account, DNS record, API key, SDK, model name or secret exists.

## Domain and public edge

| Integration | State | Current role |
|---|---|---|
| `direkt.forum` | **ACTIVE** | Canonical owner-controlled public root/domain. |
| `app.direkt.forum` | **ACTIVE synthetic-review host** | Canonical functional customer/provider browser/BFF host; W8 DNS/TLS/runtime/PWA/BFF/session/privacy verification passed. Real-participant/production activation remains gated. |
| Vercel Domains | **ACTIVE — registrar only** | Domain registration; not current protected staging runtime. |
| Cloudflare DNS | **ACTIVE** | Authoritative DNS edge. |
| GitHub Pages | **ACTIVE public static origin** | Documentation and synthetic/non-sensitive preview content. |
| Cloudflare Email Routing | **EXTERNALLY_PROVISIONED** | Role aliases/support routing; not outbound application delivery. |
| Cloudflare Turnstile | **PLANNED / NOT ACTIVE** | RC10 threat-model decision only; do not add without a reviewed abuse-sensitive public flow. |

## Core data/backend infrastructure

| Integration | State | Current role |
|---|---|---|
| Supabase PostgreSQL | **ACTIVE** | System of record behind the API; project `aeeuscifrxcjmnswqwnq`. |
| PostGIS | **ACTIVE** | Spatial/service-area foundation. |
| Supabase Storage | **ACTIVE infrastructure** | Private evidence/media/export storage through server-side grants. |
| Supabase Data API/PostgREST | **QUARANTINED** | Not a privileged client application path. |
| NestJS DIREKT API | **ACTIVE private staging** | Canonical REST/OpenAPI trust boundary; direct unauthenticated access denied. |
| Artifact Registry | **ACTIVE** | Immutable container images. |
| Cloud Run | **ACTIVE managed runtime** | IAM-private API/operations staging plus public synthetic-only customer/provider browser/BFF runtime. |
| Secret Manager | **ACTIVE** | Runtime secret authority. |
| GitHub Workload Identity Federation | **ACTIVE** | Keyless GitHub Actions → Google Cloud identity. |
| Cloud Logging/Monitoring | **ACTIVE** | Authoritative infrastructure/runtime observability. |
| GitHub Actions | **ACTIVE** | CI, security, release and infrastructure gates. |

Managed Google resources:

```text
Project: direkt-dev-502701 (264358173369)
Region: asia-northeast1
API runtime: direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com
Portal runtime: direkt-portal-runtime@direkt-dev-502701.iam.gserviceaccount.com
Customer/provider web runtime: direkt-cp-web-runtime@direkt-dev-502701.iam.gserviceaccount.com
GitHub deployer: direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com
WIF: projects/264358173369/locations/global/workloadIdentityPools/direkt-github/providers/direkt-main
```

## Live Supabase boundary checkpoint

Applied hardening migration:

```text
202607191200_integration_runtime_privilege_hardening.sql
sha256=e02d1be228a992b7541db92328e9528b8fe0e184660fb78206ca405e9c7b2372
```

Verified after apply: migration count `39`; browser application-schema usage `0`; browser executable application functions `0`; PUBLIC executable application functions `0`; application `SECURITY DEFINER` functions `0`; all required Storage buckets remain private.

## Android, identity and delivery

| Integration | State | Current role |
|---|---|---|
| Native Android | **ACTIVE implementation / controlled distribution** | Primary customer/provider native client. |
| Firebase project | **ACTIVE foundation** | Attached to `direkt-dev-502701`. |
| Firebase App Distribution | **ACTIVE** | Controlled Android delivery to `direkt-internal-testers`. |
| Firebase Authentication / phone OTP | **IMPLEMENTED_GATED** | Phone-possession proof/session exchange behind invite/consent/Phase 11 gates. |
| Firebase Crashlytics | **PLANNED / NOT SOURCE-ACTIVE** | RC3 next: Android plugin/runtime setup, privacy/release mapping, synthetic crash/ANR evidence and alerts. |
| FCM | **PLANNED** | RC4: server send path, token lifecycle, Android handling/permissions, retries and managed canary. |
| Firebase Test Lab | **PLANNED** | RC5 after RC3–RC4 stabilize Android runtime dependencies. |
| Google Play | **IMPLEMENTED_GATED** | Release engineering prepared; no production release authorized. |

Current merged Android manifest does not introduce location, camera, contacts, SMS/call-log, broad storage/media, microphone or notification runtime permissions through the current integration baseline.

## AI product/runtime status

The earlier register had two conflicting AI sections. The reconciled truth is:

| Integration / use case | State | Current role |
|---|---|---|
| Provider-neutral backend `AiProvider` contract | **IMPLEMENTED_GATED** | Gemini primary + Groq fallback adapters; backend-only credentials; timeout/failover and non-authoritative AI boundary. |
| Gemini Developer API | **SANDBOX_PROVEN / DIREKT RUNTIME NOT BOUND** | Synthetic provider canary succeeded; server-only Secret Manager key exists. |
| Groq open-model fallback | **SANDBOX_PROVEN / DIREKT RUNTIME NOT BOUND** | Synthetic provider canary succeeded; server-only Secret Manager key exists. |
| Customer discovery/category assistance | **IMPLEMENTED / FAIL-CLOSED** | Deterministic matching is always available; model path requires synthetic-only use-case switch and valid provider runtime binding. |
| Grounded public Help | **IMPLEMENTED / FAIL-CLOSED** | Uses approved public facts/source identifiers; deterministic help remains available when AI is disabled/unavailable. |
| Provider onboarding/readiness guidance | **IMPLEMENTED / FAIL-CLOSED** | Model path only for synthetic workspace/data; deterministic readiness guidance remains canonical fallback. |
| Provider public-profile drafting | **IMPLEMENTED / FAIL-CLOSED** | Editable draft only; provider confirmation required; deterministic/manual profile path remains. |
| Restricted operations case summary / evidence OCR | **DISABLED / RESTRICTED-GATED** | No restricted evidence may be sent to a model without separate privacy/security/data-processing/provider approval and dedicated evaluation/runtime proof. |
| Client-direct AI SDK/API calls | **PROHIBITED** | Model credentials/system prompts/tool authority remain backend-owned. |
| Production AI | **DISABLED** | No real participant data or authoritative trust/payment/dispute/publication decision may be delegated to AI. |

### What AI is doing now

Current managed DIREKT runtime does **not** have Gemini/Groq bound as an active application runtime provider. AI product surfaces exist, but use-case switches and provider mode default fail-closed. Therefore current behavior is deterministic/manual unless a reviewed synthetic environment explicitly enables both the use case and provider binding.

The backend currently rejects non-synthetic model requests. AI cannot verify a provider, change trust/ranking/publication, approve/release payments or escrow, decide disputes, override consent/authorization, or make legal/regulatory conclusions.

## Location and maps

| Integration | State | Current role |
|---|---|---|
| PostGIS location model | **ACTIVE** | Canonical location/service-area semantics. |
| Manual area/list fallback | **ACTIVE** | Provider-independent privacy/accessibility fallback. |
| Google Maps Platform | **EXTERNALLY_PROVISIONED / RUNTIME NOT PROVEN** | RC7: restricted Android/backend credentials, SDK/server binding, privacy/quotas/fallback/kill switch and non-leakage evidence still required. |
| Private-coordinate map publication | **DISABLED** | Exact private provider bases must not become public markers/ranking inputs. |

## Communications and notifications

| Integration | State | Current role |
|---|---|---|
| Transactional outbox | **ACTIVE domain foundation** | Durable asynchronous-event source of truth. |
| Resend | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY** | Cloud Run execution `direkt-resend-canary-ct9mp` proved outbox → Resend → durable `published` state. Sending key is sending-only/domain-restricted to verified `notify.direkt.forum`. Real-participant/production email remains disabled. |
| Firebase phone OTP | **IMPLEMENTED_GATED** | Current pilot phone-possession direction. |
| WhatsApp Cloud API | **EXTERNALLY CONFIGURED / RUNTIME GATED** | RC6 application adapter still required; production sends remain consent/legal/provider gated. |
| FCM push | **PLANNED** | RC4. |
| Cloud Tasks / Pub/Sub / Scheduler | **PLANNED ON DEMAND** | Add only when a real retry/fan-out/scheduling need justifies them. |

## Observability

| Integration | State | Current role |
|---|---|---|
| Cloud Logging / Monitoring | **ACTIVE** | Authoritative infrastructure/runtime observability. |
| Sentry API/portal | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY** | RC2 source integrated through PR #275; managed synthetic API + private portal canaries succeeded from exact merged source `035f4e8ff60a6e571d7aa09c0eaedb831c73648b`. Separate DSNs, numeric Secret Manager versions, exact release SHA, PII minimization and kill switch proven. Real-participant/production restricted-data telemetry remains separately gated. |
| Sentry Android | **NOT DEFAULT / NOT ACTIVE** | Android crash/ANR ownership remains Firebase Crashlytics in RC3. |

RC2 detail: `docs/integrations/RC2_SENTRY_CLOSURE.md`.

No telemetry provider may receive raw evidence, tokens, cookies, raw contact data, exact private coordinates or unnecessary free text.

## Payments and verification authorities

| Integration | State | Current role |
|---|---|---|
| Subscription/payment domain | **ACTIVE implementation** | Products, subscriptions, invoices, intents, ledger and reconciliation contracts. |
| Synthetic payment adapter | **ACTIVE tests only** | Lifecycle/idempotency testing without real money. |
| MTN MoMo Collections API | **SANDBOX_PROVEN / RUNTIME DISABLED** | OAuth, Request to Pay and authoritative status verification succeeded in sandbox. |
| MTN Collection Widget / QR / USSD | **EXTERNALLY_PROVISIONED / RUNTIME DISABLED** | Separate widget subscription exists; runtime feature not wired. |
| Airtel Money Zambia Cash-In API | **PENDING_PROVIDER / DISABLED** | Zambia TEST application/Cash-In exists; approval/credentials pending. |
| DPO Pay / Network | **SANDBOX_PROVEN / RUNTIME DISABLED** | Sandbox create/checkout/verify paid flow succeeded. |
| Stripe Checkout | **SANDBOX_PROVEN / RUNTIME DISABLED** | Account-sandbox Checkout/payment verification succeeded. |
| Stripe Link | **EXTERNALLY_PROVISIONED / NOT EXPLICITLY PROVEN** | Dedicated Link evidence still optional/outstanding. |
| PayPal | **SANDBOX_PROVEN / RUNTIME DISABLED** | OAuth/order/approval/capture/independent verification succeeded. |
| Flutterwave | **BLOCKED / DEFERRED** | Zambia onboarding unavailable/deferred; do not block DIREKT on this rail. |
| Real money movement | **DISABLED** | Requires legal/commercial/provider/pilot/release gates. |
| Escrow/customer-to-provider payments | **PLANNED LATER / NOT MVP** | Separate legal/regulatory/payout/dispute/KYC architecture required. |
| PACRA / NCC / TEVETA | **MANUAL EVIDENCE SOURCES** | No fabricated API access or scraping. |
| Automated registry APIs | **NOT AUTHORIZED** | Activate only through lawful formal access. |

Payment sandbox evidence is readiness evidence only. Clients never decide payment success, and payment state cannot create verification/publication/ranking authority.

## Browser/application surfaces

| Surface | State | Current role |
|---|---|---|
| Next.js operations portal | **ACTIVE private staging** | Privileged operator UI on IAM-private Cloud Run through the API. |
| Vercel portal hosting | **SUPERSEDED for current staging** | Not the current protected application runtime. |
| Customer/provider functional PWA | **ACTIVE synthetic-only functional review runtime** | Canonical host `https://app.direkt.forum`; reviewed BFF traverses IAM-private API. |
| Preserved synthetic preview | **ACTIVE static review surface** | `https://direkt.forum/preview/`. |

## API/client contract tooling

| Integration | State | Current role |
|---|---|---|
| OpenAPI | **ACTIVE** | Canonical backend contract generated and drift-checked in CI. |
| Android API boundary | **ACTIVE implementation** | Backend API only; no privileged direct Supabase path. |
| TypeScript/PWA API boundary | **ACTIVE reviewed BFF architecture** | Canonical API remains IAM-private. |
| Fully generated Kotlin/TypeScript client packages | **NOT CURRENT RUNTIME INTEGRATION** | RC9 incremental adoption/decision after integration/API shape stabilizes. |

## Runtime-integration sequence

Issue #261 governs one bounded checkpoint at a time:

1. RC0 ledger/audit/payment evidence reconciliation — **CLOSED**.
2. AI0 provider-neutral AI foundation — **CLOSED / RUNTIME GATED**.
3. RC1 Resend — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**.
4. RC2 Sentry API/portal — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**.
5. RC3 Firebase Crashlytics — **NEXT after a fresh workstream claim**.
6. RC4 FCM.
7. RC5 Firebase Test Lab.
8. RC6 WhatsApp Cloud API application adapter.
9. RC7 Google Maps runtime.
10. RC8 sandbox payment adapters/reconciliation.
11. RC9 generated Kotlin/TypeScript clients.
12. RC10 Turnstile threat-model decision.
13. RC11 combined closure regression/evidence index/lane release.

W8 and VC1–VC8 are closed. Runtime integration work does not authorize real participants, production external communications, real money, Phase 11 exit or Phase 12 production release.

## Change-control rule

Update this register and `LIVE_INTEGRATION_LEDGER.md` whenever provider/model provisioning, source adapter/SDK, secret/runtime binding, managed canary, privacy/legal approval, AI evaluation, fallback/kill switch or production authorization changes. External provisioning alone is never enough to mark an integration ACTIVE.
