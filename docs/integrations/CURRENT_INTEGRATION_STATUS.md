# DIREKT Current Integration Status Register

**Authoritative as-of date:** 2026-07-22 (Asia/Tokyo)  
**Scope:** repository `kudzimusar/direkt`, managed development/staging evidence, live Supabase verification and owner-configured external services  
**Purpose:** prevent external provisioning, source integration and runtime activation from being conflated.  
**Detailed live receipts:** `LIVE_INTEGRATION_LEDGER.md`

## Status vocabulary

- **ACTIVE** — source/configuration and managed execution evidence prove approved runtime use.
- **IMPLEMENTED_GATED** — application/domain code exists, but broader/provider-backed activation remains fail-closed.
- **EXTERNALLY_PROVISIONED** — account/domain/credential exists, but application runtime use is not proven.
- **SANDBOX_PROVEN** — a real provider sandbox flow succeeded, but DIREKT runtime/live activation is not approved.
- **PENDING_PROVIDER** — provider approval or credential issuance remains pending.
- **PLANNED** — approved direction exists; implementation/runtime binding incomplete.
- **DISABLED** — intentionally off in the approved environment.
- **SUPERSEDED** — historical/fallback direction.
- **BLOCKED** — external/legal/commercial/repository gate prevents progression.

No integration becomes ACTIVE merely because an account, DNS record, API key, SDK, model name or secret exists.

## Domain and public edge

| Integration | State | Current role |
|---|---|---|
| `direkt.forum` | **ACTIVE** | Canonical owner-controlled root/domain. |
| `app.direkt.forum` | **ACTIVE synthetic-review host** | Canonical functional customer/provider browser/BFF host; W8 DNS/TLS/runtime/PWA/BFF/session/privacy verification passed. Real-participant/production activation remains gated. |
| Vercel Domains | **ACTIVE — registrar only** | Domain registration only. |
| Cloudflare DNS | **ACTIVE** | Authoritative DNS edge. |
| GitHub Pages | **ACTIVE public static origin** | Documentation and synthetic/non-sensitive preview content. |
| Cloudflare Email Routing | **EXTERNALLY_PROVISIONED** | Role/support aliases; not outbound application delivery. |
| Cloudflare Turnstile | **PLANNED / NOT ACTIVE** | RC10 threat-model decision only. |

## Core data/backend infrastructure

| Integration | State | Current role |
|---|---|---|
| Supabase PostgreSQL | **ACTIVE** | System of record behind the API; project `aeeuscifrxcjmnswqwnq`. |
| PostGIS | **ACTIVE** | Spatial/service-area foundation. |
| Supabase Storage | **ACTIVE infrastructure** | Private evidence/media/export storage through server-side grants. |
| Supabase Data API/PostgREST | **QUARANTINED** | Not a privileged client application path. |
| NestJS DIREKT API | **ACTIVE private staging** | Canonical REST/OpenAPI trust boundary; direct unauthenticated access denied. |
| Artifact Registry | **ACTIVE** | Immutable container images. |
| Cloud Run | **ACTIVE managed runtime** | IAM-private API/operations plus public synthetic-only customer/provider browser/BFF runtime. |
| Secret Manager | **ACTIVE** | Runtime secret authority. |
| GitHub Workload Identity Federation | **ACTIVE** | Keyless GitHub Actions → Google Cloud identity. |
| Cloud Logging/Monitoring | **ACTIVE** | Authoritative infrastructure/runtime observability. |
| GitHub Actions | **ACTIVE** | CI, security, release and infrastructure gates. |

Managed project: `direkt-dev-502701` (`264358173369`), region `asia-northeast1`.

Live Supabase hardening remains proven through migration `202607191200_integration_runtime_privilege_hardening.sql`: browser application-schema usage `0`, browser/PUBLIC executable application functions `0`, application `SECURITY DEFINER` functions `0`, required Storage buckets private.

## Android, identity and Firebase runtime

| Integration | State | Current role |
|---|---|---|
| Native Android | **ACTIVE implementation / controlled distribution** | Primary customer/provider native client. |
| Firebase project | **ACTIVE foundation** | Attached to `direkt-dev-502701`. |
| Firebase App Distribution | **ACTIVE** | Controlled Android delivery to `direkt-internal-testers`. |
| Firebase Authentication / phone OTP | **IMPLEMENTED_GATED** | Phone-possession proof/session exchange behind invite/consent/Phase 11 gates. |
| Firebase Crashlytics | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY** | RC3 exact-source managed proof succeeded for `9098f7eb333baf096163f1564b3d8e5e5da3fcf0` through bridge run `29885635547`: fatal delivery, focused package-scoped input-dispatch ANR, historical `REASON_ANR`, restart pickup and Crashlytics/DataTransport delivery all passed. Automatic collection remains default-off, Analytics is absent, and participant/production crash telemetry remains disabled. |
| FCM | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY** | RC4 exact-main managed run `29916381754` on source `f05ff19105cb8dc7c4621c044c110b6029f63300` proved backend-owned transactional-outbox delivery through FCM HTTP v1 to Android in both foreground and background. The fixed `direkt-fcm-canary-token` container uses secret-scoped least privilege and a temporary numeric version that was destroyed after the private Cloud Run Job was deleted. Participant registration and participant/production push remain disabled. |
| Firebase Test Lab | **IMPLEMENTED_GATED / MANAGED MATRIX PENDING** | RC5 source now repairs the current Android instrumentation contract, executes it in Android CI, builds an exact-source Test Lab workflow, selects a 2–3 device matrix from the live virtual catalog, and defines an owner-provisioned custom-role/dedicated-results-bucket boundary. Owner bootstrap and exact-main managed matrix evidence remain required before ACTIVE status. |
| Google Play | **IMPLEMENTED_GATED** | Release engineering prepared; no production release authorized. |

RC3 closure does not authorize participant/production crash telemetry. Crashlytics remains fail-closed by default outside the debug-only, exact-source-bound `synthetic-only` proof path. RC4 does not authorize participant/production push: participant token registration remains disabled. The fixed `direkt-fcm-canary-token` container grants only secret-scoped `roles/secretmanager.secretVersionManager` to the GitHub deployer and `roles/secretmanager.secretAccessor` to the runtime identity; proof runs may add one temporary numeric version, pin that exact version into the private Cloud Run Job, delete the job, then destroy only that version.

## AI provider foundation and current AI behavior

| Integration / use case | State | Current role |
|---|---|---|
| Provider-neutral backend `AiProvider` contract | **IMPLEMENTED_GATED** | Gemini primary + Groq fallback adapters, backend-only credentials, timeout/failover and non-authoritative AI boundary. |
| Gemini Developer API | **SANDBOX_PROVEN / DIREKT RUNTIME NOT BOUND** | Synthetic provider canary succeeded; server-only Secret Manager key exists. |
| Groq open-model fallback | **SANDBOX_PROVEN / DIREKT RUNTIME NOT BOUND** | Synthetic provider canary succeeded; server-only Secret Manager key exists. |
| Customer discovery/category assistance | **IMPLEMENTED / FAIL-CLOSED** | Deterministic matching always available; model path requires explicit synthetic switch and provider binding. |
| Grounded public Help | **IMPLEMENTED / FAIL-CLOSED** | Approved public facts/source identifiers; deterministic help fallback. |
| Provider onboarding/readiness guidance | **IMPLEMENTED / FAIL-CLOSED** | Model path synthetic-only; deterministic readiness fallback. |
| Provider public-profile drafting | **IMPLEMENTED / FAIL-CLOSED** | Editable draft only; provider confirmation required; manual fallback. |
| Restricted operations case summary / evidence OCR | **DISABLED / RESTRICTED-GATED** | Separate privacy/security/data-processing/provider approval and dedicated runtime proof required. |
| Client-direct AI SDK/API calls | **PROHIBITED** | Credentials/system prompts/tool authority remain backend-owned. |
| Production AI | **DISABLED** | AI cannot become verification/trust/payment/dispute/publication/authorization authority. |

Current managed DIREKT runtime does **not** bind Gemini/Groq as active application providers. AI modes default fail-closed and the backend rejects non-synthetic model requests. Current AI-capable surfaces therefore use deterministic/manual behavior unless a reviewed synthetic environment explicitly enables both the use case and provider binding.

## Location and maps

| Integration | State | Current role |
|---|---|---|
| PostGIS location model | **ACTIVE** | Canonical location/service-area semantics. |
| Manual area/list fallback | **ACTIVE** | Provider-independent privacy/accessibility fallback. |
| Google Maps Platform | **EXTERNALLY_PROVISIONED / RUNTIME NOT PROVEN** | RC7 restricted credentials, SDK/server binding, privacy/quotas/fallback/kill switch/non-leakage proof required. |
| Private-coordinate map publication | **DISABLED** | Exact private provider bases must not become public markers/ranking inputs. |

## Communications and notifications

| Integration | State | Current role |
|---|---|---|
| Transactional outbox | **ACTIVE domain foundation** | Durable asynchronous-event source of truth. |
| Resend | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY** | Cloud Run execution `direkt-resend-canary-ct9mp` proved outbox → Resend → durable `published`; key is sending-only/domain-restricted to verified `notify.direkt.forum`. |
| Firebase phone OTP | **IMPLEMENTED_GATED** | Current pilot phone-possession direction. |
| WhatsApp Cloud API | **IMPLEMENTED_GATED / MANAGED CANARY PENDING** | RC6 backend-only provider-neutral Meta adapter, transactional outbox, hashed opt-out, template-only payload boundary, raw-body HMAC webhook verification, durable idempotent receipts/retries and synthetic canary entrypoint are implemented. Provider business/phone/template/secret state and managed synthetic proof are not yet verified. Only Meta test/synthetic assets plus one owner-controlled verified recipient may be used for proof; participant/production delivery remains disabled. |
| FCM push | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY** | Exact-main run `29916381754` on `f05ff19105cb8dc7c4621c044c110b6029f63300` passed synthetic Firebase registration, immutable backend image/private Cloud Run Job deployment, foreground and background outbox → FCM → Android receipt proof, sanitized artifact publication and ordered cleanup. Artifact `rc4-fcm-canary-29916381754` digest `sha256:f45d1924ee6138f86ec15a222e97f28ff67bbe9c610ff75f57666fd03929526c`. Participant registration and participant/production push remain disabled. |
| Cloud Tasks / Pub/Sub / Scheduler | **PLANNED ON DEMAND** | Add only for a justified retry/fan-out/scheduling need. |

Continuous, controlled-pilot participant and production external email remain disabled. Participant/production push remains disabled after RC4 synthetic proof; any participant activation requires a later explicit privacy/release authorization. The 2026-07-22 owner bootstrap verified the fixed FCM canary secret container and its secret-scoped least-privilege bindings without creating, reading or printing a secret value.

## Observability

| Integration | State | Current role |
|---|---|---|
| Cloud Logging / Monitoring | **ACTIVE** | Authoritative infrastructure/runtime telemetry. |
| Sentry API/portal | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY** | RC2 source + managed API/private-portal canary proven with separate DSNs, exact release SHA, PII minimization and kill switch. |
| Sentry Android | **NOT DEFAULT / NOT ACTIVE** | Android crash/ANR ownership is Firebase Crashlytics under RC3. |
| Firebase Crashlytics | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY** | Exact-source RC3 proof on `9098f7eb333baf096163f1564b3d8e5e5da3fcf0` passed through managed bridge run `29885635547`; default collection remains off, Firebase Analytics is absent, and production/participant telemetry is not authorized. |

Participant/production Sentry telemetry remains disabled.

No telemetry provider may receive raw evidence, tokens, cookies, contact data, exact private coordinates or unnecessary free text. RC3 does not set a stable participant/user identifier and does not add Firebase Analytics.

## Payments and verification authorities

| Integration | State | Current role |
|---|---|---|
| Subscription/payment domain | **ACTIVE implementation** | Products, subscriptions, invoices, intents, ledger/reconciliation contracts. |
| Synthetic payment adapter | **ACTIVE tests only** | Lifecycle/idempotency testing without real money. |
| MTN MoMo Collections API | **SANDBOX_PROVEN / RUNTIME DISABLED** | OAuth, Request to Pay and authoritative status verification succeeded. |
| MTN Collection Widget / QR / USSD | **EXTERNALLY_PROVISIONED / RUNTIME DISABLED** | Runtime feature not wired. |
| Airtel Money Zambia Cash-In API | **PENDING_PROVIDER / DISABLED** | TEST application/Cash-In exists; approval/credentials pending. |
| DPO Pay / Network | **SANDBOX_PROVEN / RUNTIME DISABLED** | Sandbox create/checkout/verify paid flow succeeded. |
| Stripe Checkout | **SANDBOX_PROVEN / RUNTIME DISABLED** | Sandbox Checkout/payment verification succeeded. |
| Stripe Link | **EXTERNALLY_PROVISIONED / NOT EXPLICITLY PROVEN** | Dedicated Link evidence optional/outstanding. |
| PayPal | **SANDBOX_PROVEN / RUNTIME DISABLED** | OAuth/order/approval/capture/verification succeeded. |
| Flutterwave | **BLOCKED / DEFERRED** | Zambia onboarding unavailable/deferred. |
| Real money movement | **DISABLED** | Separate legal/commercial/provider/pilot/release gates required. |
| Escrow/customer-to-provider payments | **PLANNED LATER / NOT MVP** | Separate legal/regulatory/payout/dispute/KYC architecture required. |
| PACRA | **MANUAL EVIDENCE SOURCE** | No fabricated API access/scraping. |
| NCC | **MANUAL EVIDENCE SOURCE** | Manual evidence where applicable. |
| TEVETA | **MANUAL EVIDENCE SOURCE** | Manual qualification/training evidence. |
| Automated registry APIs | **NOT AUTHORIZED** | Formal lawful access required. |

Clients never decide payment success. Payment state cannot create verification/publication/ranking authority. AI output cannot create payment or registry authority.

## Browser/application surfaces

| Surface | State | Current role |
|---|---|---|
| Next.js operations portal | **ACTIVE private staging** | Privileged operator UI through canonical API. |
| Vercel portal hosting | **SUPERSEDED for current staging** | Not current protected runtime. |
| Customer/provider functional PWA | **ACTIVE synthetic-only functional review runtime** | `https://app.direkt.forum`; reviewed BFF/private API boundary. |
| Preserved synthetic preview | **ACTIVE static review surface** | `https://direkt.forum/preview/`. |

## API/client contract tooling

| Integration | State | Current role |
|---|---|---|
| OpenAPI | **ACTIVE** | Canonical backend contract generated/drift-checked in CI. |
| Android API boundary | **ACTIVE implementation** | Backend API only; no privileged direct Supabase path. |
| TypeScript/PWA API boundary | **ACTIVE reviewed BFF architecture** | Canonical API remains IAM-private. |
| Fully generated Kotlin/TypeScript client packages | **NOT CURRENT RUNTIME INTEGRATION** | RC9 incremental adoption/decision after API shape stabilizes. |

## Runtime integration sequence

1. RC0 audit/ledger/payment evidence — **CLOSED**.
2. AI0 provider-neutral AI foundation — **CLOSED / RUNTIME GATED**.
3. RC1 Resend — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**.
4. RC2 Sentry API/portal — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**.
5. RC3 Firebase Crashlytics — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**.
6. RC4 FCM — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**; exact-main managed proof run `29916381754` succeeded on `f05ff19105cb8dc7c4621c044c110b6029f63300` for foreground/background delivery and cleanup; participant/production push remains disabled.
7. RC5 Firebase Test Lab — **PARKED / NOT CLOSED — IMPLEMENTED_GATED / MANAGED MATRIX PENDING**; source contract, local instrumentation, least-privilege roles and dedicated results bucket are preserved. Final owner-side read-only verification and exact-current-main managed Test Lab evidence remain pending because Cloud Shell is temporarily quota-blocked.
8. RC6 WhatsApp Cloud API application adapter — **ACTIVE CHECKPOINT / IMPLEMENTED_GATED — MANAGED CANARY PENDING**; fail-closed backend/outbox/webhook/opt-out source is implemented and regression-proven; managed provider proof remains pending. Meta test/synthetic number plus one owner-controlled verified recipient only; production phone registration, production templates and participant/live WhatsApp traffic remain gated.
9. RC7 Google Maps runtime.
10. RC8 sandbox payment adapters/reconciliation.
11. RC9 generated Kotlin/TypeScript clients.
12. RC10 Turnstile threat-model decision.
13. RC11 combined integration regression/evidence index/lane release.

W8 and VC1–VC8 are closed. Runtime integration work does not authorize real participants, production external communications, real money, Phase 11 exit or Phase 12 production release.

## Change-control rule

Update this register and `LIVE_INTEGRATION_LEDGER.md` whenever provider/model provisioning, source adapter/SDK, secret/runtime binding, managed canary, privacy/legal approval, AI evaluation, fallback/kill switch or production authorization changes. External provisioning alone is never enough to mark an integration ACTIVE.
