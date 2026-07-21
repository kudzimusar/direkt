# DIREKT Current Integration Status Register

**Authoritative as-of date:** 2026-07-21 (Asia/Tokyo)  
**Scope:** repository `kudzimusar/direkt`, managed development/staging evidence, live Supabase verification and owner-configured external services  
**Purpose:** prevent external provisioning, source integration and runtime activation from being conflated.  
**Detailed live receipts:** `LIVE_INTEGRATION_LEDGER.md`

## Status vocabulary

- **ACTIVE** — source/configuration and managed execution evidence prove approved runtime use.
- **IMPLEMENTED_GATED** — application/domain code exists, but real/provider-backed activation remains fail-closed.
- **EXTERNALLY_PROVISIONED** — account/domain/credential setup exists, but application runtime use is not proven.
- **SANDBOX_PROVEN** — a real provider sandbox flow was exercised successfully, but DIREKT runtime/live activation is not yet approved.
- **PENDING_PROVIDER** — provider account/product exists but provider approval or credential issuance is still pending.
- **PLANNED** — approved direction exists; implementation/runtime binding incomplete.
- **DISABLED** — intentionally off in the approved environment.
- **SUPERSEDED** — historical/fallback direction, not the current preferred runtime.
- **BLOCKED** — cannot progress without an external/legal/commercial/repository gate.

No integration becomes ACTIVE merely because an account, DNS record, API key or secret exists.

## Domain and public edge

| Integration | State | Current role |
|---|---|---|
| `direkt.forum` | **ACTIVE** | Canonical owner-controlled public root/domain. |
| `app.direkt.forum` | **ACTIVE synthetic-review host** | Canonical functional customer/provider browser/BFF host; DNS/TLS/runtime/PWA/BFF/session/privacy/preview verification passed in W8 run `29802524466`. Real-participant/production activation remains gated. |
| Vercel Domains | **ACTIVE — registrar only** | Domain registration; not current protected staging runtime. |
| Cloudflare DNS | **ACTIVE** | Authoritative DNS edge, including `app` CNAME mapping required by Cloud Run. |
| GitHub Pages | **ACTIVE public static origin** | Documentation and synthetic/non-sensitive preview content, including preserved `/preview/`. |
| Cloudflare Email Routing | **EXTERNALLY_PROVISIONED** | Role aliases/support routing; not outbound application delivery. |
| Cloudflare Turnstile | **PLANNED / NOT ACTIVE** | Future abuse-control challenge only if justified by approved abuse-control design. |

## Core data/backend infrastructure

| Integration | State | Current role |
|---|---|---|
| Supabase PostgreSQL | **ACTIVE** | System of record behind the API; project `aeeuscifrxcjmnswqwnq`. |
| PostGIS | **ACTIVE** | Spatial/service-area foundation. |
| Supabase Storage | **ACTIVE infrastructure** | Private evidence/media/export storage through server-side grants. |
| Supabase Data API/PostgREST | **QUARANTINED** | Not a privileged client application path. |
| NestJS DIREKT API | **ACTIVE private staging** | Canonical REST/OpenAPI trust boundary; direct unauthenticated access remains denied. |
| Artifact Registry | **ACTIVE** | Immutable container images. |
| Cloud Run | **ACTIVE managed runtime** | IAM-private API/operations staging plus public synthetic-only customer/provider browser/BFF runtime with dedicated least-privilege identity. |
| Secret Manager | **ACTIVE** | Runtime secret authority. |
| GitHub Workload Identity Federation | **ACTIVE** | Keyless GitHub Actions → Google Cloud identity. |
| Cloud Logging/Monitoring | **ACTIVE** | Current infrastructure/runtime observability. |
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

Applied migration:

```text
202607191200_integration_runtime_privilege_hardening.sql
sha256=e02d1be228a992b7541db92328e9528b8fe0e184660fb78206ca405e9c7b2372
```

Verified after apply:

- migration count `39`;
- browser application-schema usage `0`;
- browser executable application functions `0`;
- PUBLIC executable application functions `0`;
- application `SECURITY DEFINER` functions `0`;
- all four required Storage buckets remain private.

Supabase advisor warnings for mutable function `search_path`, extension placement and index opportunities remain explicit hardening/performance debt. They are not evidence of an exposed browser application path.

## Android, identity and delivery

| Integration | State | Current role |
|---|---|---|
| Native Android | **ACTIVE implementation / controlled distribution** | Primary customer/provider native client. |
| Firebase project | **ACTIVE foundation** | Attached to `direkt-dev-502701`. |
| Firebase App Distribution | **ACTIVE** | Controlled Android delivery to `direkt-internal-testers`. |
| Firebase Authentication / phone OTP | **IMPLEMENTED_GATED** | Phone-possession proof/session exchange behind invite/consent/Phase 11 gates. |
| Firebase Crashlytics | **PLANNED / NOT SOURCE-ACTIVE** | Android crash/ANR runtime integration closure still required. |
| FCM | **PLANNED** | Push-delivery adapter/runtime integration closure still required. |
| Firebase Test Lab | **PLANNED** | Device-matrix automation/runtime closure still required. |
| Google Play | **IMPLEMENTED_GATED** | Release engineering prepared; no production release authorized. |

Current merged release manifest permissions:

```text
android.permission.ACCESS_NETWORK_STATE
android.permission.INTERNET
com.google.android.providers.gsf.permission.READ_GSERVICES
com.kudzimusar.direkt.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION
```

No dangerous runtime permission prompt is currently introduced by these declarations. Location, camera, contacts, SMS/call-log, broad storage/media, microphone and notification runtime permissions remain absent.

## AI provider foundation

| Integration | State | Current role |
|---|---|---|
| Provider-neutral backend AI contract | **IMPLEMENTED_GATED** | Gemini primary + Groq fallback adapters with synthetic-only input classification, bounded timeout/failover and explicit non-authoritative AI boundary. |
| Gemini Developer API | **SANDBOX_PROVEN / RUNTIME NOT BOUND** | Synthetic HTTP 200 canary returned `DIREKT_AI_OK`; `direkt-gemini-dev-api-key` version 1 enabled in Secret Manager. |
| Groq open-model fallback | **SANDBOX_PROVEN / RUNTIME NOT BOUND** | Synthetic HTTP 200 canary returned `DIREKT_GROQ_OK`; `direkt-groq-dev-api-key` version 1 enabled in Secret Manager. |
| Ollama | **PLANNED LOCAL FALLBACK** | Optional no-key local/offline development path; not deployed to Cloud Run. |
| Production AI | **DISABLED** | AI may not become authority for verification, trust/ranking/publication, payments/escrow, disputes, consent or authorization. |

AI0 proves provider access and the fail-closed backend abstraction, not active DIREKT runtime use. No AI key is placed in Android/browser code, and external/free-tier AI remains synthetic/non-sensitive only until a separate privacy/data-use/legal gate authorizes otherwise.

## Location and maps

| Integration | State | Current role |
|---|---|---|
| PostGIS location model | **ACTIVE** | Canonical location/service-area semantics. |
| Manual area/list fallback | **ACTIVE** | Provider-independent privacy/accessibility fallback. |
| Google Maps Platform | **EXTERNALLY_PROVISIONED / RUNTIME NOT PROVEN** | External setup reported; source/runtime activation still requires restricted credentials, SDK/server binding, privacy/quotas/fallback and kill-switch evidence. |
| Private-coordinate map publication | **DISABLED** | Exact private provider bases must not become public markers/ranking inputs. |

Maps becomes ACTIVE only after restricted credentials, source integration, privacy terms, quotas, fallback/non-leakage tests and kill-switch evidence agree.

## Communications and notifications

| Integration | State | Current role |
|---|---|---|
| Transactional outbox | **ACTIVE domain foundation** | Durable asynchronous-event foundation. |
| Resend | **EXTERNALLY_PROVISIONED / RC1 PREFLIGHT PROVEN** | `notify.direkt.forum` verified and `direkt-resend-api-key` version 1 enabled. Runtime app-event delivery is not yet proven. |
| Brevo | **SUPERSEDED** | Historical preferred email provider. |
| Firebase phone OTP | **IMPLEMENTED_GATED** | Current pilot phone-possession direction. |
| Twilio Verify | **SUPERSEDED** | Earlier OTP candidate. |
| WhatsApp Cloud API | **EXTERNALLY CONFIGURED / RUNTIME GATED** | Consent-aware domain handoff/control-plane setup exists; production delivery adapter remains disabled. |
| FCM push | **PLANNED** | Future event delivery/runtime closure. |
| Cloud Tasks / Pub/Sub / Scheduler | **PLANNED** | Add only when real retry/fan-out/scheduling needs justify them. |

Resend remains non-ACTIVE until an application adapter, runtime secret attachment, outbox/idempotency/retry behavior, privacy/template controls and managed synthetic delivery canary exist.

## Observability

| Integration | State | Current role |
|---|---|---|
| Cloud Logging / Monitoring | **ACTIVE** | Authoritative infrastructure/runtime observability. |
| Sentry API/portal | **EXTERNALLY_PROVISIONED / RUNTIME NOT PROVEN** | External setup reported; audited runtime SDK activation not yet proven. |
| Sentry Android | **NOT DEFAULT** | Android plan prefers Crashlytics unless a later reviewed decision changes this. |

No telemetry provider may receive raw evidence, tokens, contact data, exact private coordinates or unnecessary free text.

## Browser/application surfaces

| Surface | State | Current role |
|---|---|---|
| Next.js operations portal | **ACTIVE private staging** | Privileged operator UI on IAM-private Cloud Run through the API. |
| Vercel portal hosting | **SUPERSEDED for current staging** | Not the current protected application runtime. |
| Customer/provider functional PWA | **ACTIVE synthetic-only functional review runtime** | Canonical host `https://app.direkt.forum`; reviewed BFF traverses IAM-private API; responsive/PWA/offline/session/privacy evidence passed. Real participant authentication/data remains separately gated. |
| Preserved synthetic preview | **ACTIVE static review surface** | `https://direkt.forum/preview/`; non-sensitive historical/synthetic review only. |

The operations portal has no direct privileged database/Supabase client path. The functional PWA uses the reviewed BFF/private-API boundary and must not acquire privileged Supabase/database authority.

## Payments and verification authorities

| Integration | State | Current role |
|---|---|---|
| Subscription/payment domain | **ACTIVE implementation** | Products, subscriptions, invoices, intents, ledger and reconciliation contracts. |
| Synthetic payment adapter | **ACTIVE tests only** | Lifecycle/idempotency testing without real money. |
| MTN MoMo Collections API | **SANDBOX_PROVEN / RUNTIME DISABLED** | OAuth, Request to Pay and authoritative status verification succeeded in sandbox; runtime adapter/Cloud Run binding not yet active. |
| MTN Collection Widget / QR / USSD | **EXTERNALLY_PROVISIONED / RUNTIME DISABLED** | Separate widget subscription/secret exists; runtime feature not wired. |
| Airtel Money Zambia Cash-In API | **PENDING_PROVIDER / DISABLED** | Zambia TEST application and Cash-In product created; provider approval/credential generation pending. |
| DPO Pay / Network | **SANDBOX_PROVEN / RUNTIME DISABLED** | Sandbox `createToken` + hosted checkout + `verifyToken` returned paid; no production merchant runtime binding. |
| Stripe Checkout | **SANDBOX_PROVEN / RUNTIME DISABLED** | Account-sandbox API/Checkout/payment verification succeeded; live merchant activation remains separate. |
| Stripe Link | **EXTERNALLY_PROVISIONED / NOT EXPLICITLY PROVEN** | Sandbox account exists; dedicated Link evidence still outstanding. |
| PayPal | **SANDBOX_PROVEN / RUNTIME DISABLED** | OAuth/order/approval/capture/independent verification succeeded in sandbox. |
| Flutterwave | **BLOCKED / DEFERRED** | Zambia onboarding unavailable/rejected because provider capacity/full; do not block DIREKT on this rail. |
| Real money movement | **DISABLED** | Requires legal/commercial/provider/pilot/release gates. |
| Escrow/customer-to-provider payments | **PLANNED LATER / NOT MVP** | Requires separate legal/regulatory/payout/dispute/KYC architecture. |
| PACRA | **MANUAL EVIDENCE SOURCE** | Business evidence source. |
| NCC | **MANUAL EVIDENCE SOURCE** | Contractor/technical evidence where applicable. |
| TEVETA | **MANUAL EVIDENCE SOURCE** | Training/qualification evidence source. |
| Automated registry APIs | **NOT AUTHORIZED** | No scraping/fabricated API access. |

Payment sandbox evidence is a provisioning/adapter-readiness receipt only. Android/browser clients must never decide payment success; real money remains disabled until separate authorization.

## API/client contract tooling

| Integration | State | Current role |
|---|---|---|
| OpenAPI | **ACTIVE** | Canonical backend contract generated and drift-checked in CI. |
| Android API boundary | **ACTIVE implementation** | Backend API only; no privileged direct Supabase path. |
| TypeScript/PWA API boundary | **ACTIVE reviewed BFF architecture in synthetic mode** | Functional PWA reaches canonical REST/OpenAPI through reviewed same-origin BFF/private-API path; real participant activation remains gated. |
| Fully generated Kotlin/TypeScript client packages | **NOT CURRENT RUNTIME INTEGRATION** | Runtime adoption still requires a reviewed migration and Android/web/backend/OpenAPI regression evidence after API shape stabilizes. |

## W8 closure and runtime-integration workstream

W8 is **CLOSED**. The canonical functional browser host passed independent exact-head verification in workflow run `29802524466`; the W0–W8 implementation claim is released.

Issue #261 now governs sequential runtime-integration closure. `WORKSTREAM_LOCK.md` and `RUNTIME_INTEGRATION_CLOSURE_PLAN.md` define the current dependency-safe order. `LIVE_INTEGRATION_LEDGER.md` is the mandatory cross-agent receipt ledger.

AI0 under Issue #264 is the owner-authorized provider-neutral AI foundation immediately after RC0. Its provider/API evidence and source implementation are gated rather than ACTIVE; RC1 Resend follows after AI0 promotion.

VC0 visual audit/design-control work under Issue #259 remains non-overlapping design/audit work. Broad visual implementation requires separate owner approval and must not overlap claimed runtime-integration surfaces.

Every integration retains its own activation requirements and must not be marked ACTIVE until source/configuration, least-privilege secrets, runtime binding, privacy/security, fallback/kill-switch, managed canary and regression evidence genuinely pass.

## Phase 0–12 audit checkpoint

PR #149 promoted the full integration/runtime audit at `25deaae72ca2974c5560a8059a50fce37c810f63` after exact-head regression checks on `e3cddf7645e514d9a6254fff86283d4055d745c4`.

Permanent controls verify:

- server-only Supabase privilege boundaries;
- private Cloud Run/WIF/Secret Manager invariants;
- Firebase gated/active states;
- inactive provider SDKs do not silently enter runtime dependencies;
- portal has no direct privileged data dependency;
- OpenAPI/outbox/payment boundaries remain intact;
- PWA browser/private-API privilege boundaries remain explicit;
- Android merged permissions and resolved release runtime dependencies match reviewed inventories.

Detailed evidence: `docs/integrations/PHASE_INTEGRATION_RUNTIME_AUDIT_2026-07-19.md` and `docs/integrations/PHASE_INTEGRATION_AUDIT_CLOSEOUT_2026-07-19.md`.

## Change-control rule

Update this register and `LIVE_INTEGRATION_LEDGER.md` whenever provider provisioning, source adapter/SDK, secret/runtime binding, managed canary, privacy/legal approval, fallback/kill switch or production authorization changes. External provisioning alone is never enough to mark an integration ACTIVE.
