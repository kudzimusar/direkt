# DIREKT Current Integration Status Register

**Authoritative as-of date:** 2026-07-19 (Asia/Tokyo)  
**Scope:** repository `kudzimusar/direkt`, managed development/staging evidence, live Supabase verification and owner-configured external services  
**Purpose:** prevent external provisioning, source integration and runtime activation from being conflated.

## Status vocabulary

- **ACTIVE** — source/configuration and managed execution evidence prove approved runtime use.
- **IMPLEMENTED_GATED** — application/domain code exists, but real/provider-backed activation remains fail-closed.
- **EXTERNALLY_PROVISIONED** — account/domain/credential setup exists, but application runtime use is not proven.
- **PLANNED** — approved direction exists; implementation/runtime binding incomplete.
- **DISABLED** — intentionally off in the approved environment.
- **SUPERSEDED** — historical/fallback direction, not the current preferred runtime.

No integration becomes ACTIVE merely because an account, DNS record, API key or secret exists.

## Domain and public edge

| Integration | State | Current role |
|---|---|---|
| `direkt.forum` | **ACTIVE** | Canonical owner-controlled public domain. |
| Vercel Domains | **ACTIVE — registrar only** | Domain registration; not current protected staging runtime. |
| Cloudflare DNS | **ACTIVE** | Authoritative DNS edge. |
| GitHub Pages | **ACTIVE public static origin** | Documentation and synthetic/non-sensitive PWA content. |
| Cloudflare Email Routing | **EXTERNALLY_PROVISIONED** | Role aliases/support routing; not outbound application delivery. |
| Cloudflare Turnstile | **PLANNED / NOT ACTIVE** | Future abuse-control challenge. |

## Core data/backend infrastructure

| Integration | State | Current role |
|---|---|---|
| Supabase PostgreSQL | **ACTIVE** | System of record behind the API; project `aeeuscifrxcjmnswqwnq`. |
| PostGIS | **ACTIVE** | Spatial/service-area foundation. |
| Supabase Storage | **ACTIVE infrastructure** | Private evidence/media/export storage through server-side grants. |
| Supabase Data API/PostgREST | **QUARANTINED** | Not a privileged client application path. |
| NestJS DIREKT API | **ACTIVE private staging** | Canonical REST/OpenAPI trust boundary. |
| Artifact Registry | **ACTIVE** | Immutable container images. |
| Cloud Run | **ACTIVE private staging** | IAM-private API and operations portal. |
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
| Firebase Crashlytics | **PLANNED / NOT SOURCE-ACTIVE** | Future Android crash/ANR option. |
| FCM | **PLANNED** | Future push delivery. |
| Firebase Test Lab | **PLANNED** | Future device-matrix automation. |
| Google Play | **IMPLEMENTED_GATED** | Release engineering prepared; no production release authorized. |

Current merged release manifest permissions:

```text
android.permission.ACCESS_NETWORK_STATE
android.permission.INTERNET
com.google.android.providers.gsf.permission.READ_GSERVICES
com.kudzimusar.direkt.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION
```

No dangerous runtime permission prompt is currently introduced by these declarations. Location, camera, contacts, SMS/call-log, broad storage/media, microphone and notification runtime permissions remain absent.

## Location and maps

| Integration | State | Current role |
|---|---|---|
| PostGIS location model | **ACTIVE** | Canonical location/service-area semantics. |
| Manual area/list fallback | **ACTIVE** | Provider-independent privacy/accessibility fallback. |
| Google Maps Platform | **EXTERNALLY_PROVISIONED / RUNTIME NOT PROVEN** | External setup reported; audited source does not prove SDK/runtime activation. |
| Private-coordinate map publication | **DISABLED** | Exact private provider bases must not become public markers/ranking inputs. |

Maps becomes ACTIVE only after restricted credentials, source integration, privacy terms, quotas, fallback/non-leakage tests and kill-switch evidence agree.

## Communications and notifications

| Integration | State | Current role |
|---|---|---|
| Transactional outbox | **ACTIVE domain foundation** | Durable asynchronous-event foundation. |
| Resend | **EXTERNALLY_PROVISIONED** | Preferred email direction; runtime app-event delivery not yet proven. |
| Brevo | **SUPERSEDED** | Historical preferred email provider. |
| Firebase phone OTP | **IMPLEMENTED_GATED** | Current pilot phone-possession direction. |
| Twilio Verify | **SUPERSEDED** | Earlier OTP candidate. |
| WhatsApp Cloud API | **PLANNED / DISABLED** | Consent-aware domain handoff exists; production delivery adapter disabled. |
| FCM push | **PLANNED** | Future event delivery. |
| Cloud Tasks / Pub/Sub / Scheduler | **PLANNED** | Add only when real retry/fan-out/scheduling needs justify them. |

Resend remains EXTERNALLY_PROVISIONED until an application adapter, runtime secret attachment, outbox/idempotency/retry behavior, privacy/template controls and managed delivery canary exist.

## Observability

| Integration | State | Current role |
|---|---|---|
| Cloud Logging / Monitoring | **ACTIVE** | Authoritative infrastructure/runtime observability. |
| Sentry API/portal | **EXTERNALLY_PROVISIONED / RUNTIME NOT PROVEN** | External setup reported; audited runtime SDK activation not proven. |
| Sentry Android | **NOT DEFAULT** | Android plan prefers Crashlytics unless a later reviewed decision changes this. |

No telemetry provider may receive raw evidence, tokens, contact data, exact private coordinates or unnecessary free text.

## Browser/application surfaces

| Surface | State | Current role |
|---|---|---|
| Next.js operations portal | **ACTIVE private staging** | Privileged operator UI on IAM-private Cloud Run through the API. |
| Vercel portal hosting | **SUPERSEDED for current staging** | Not the current protected application runtime. |
| Customer/provider PWA | **AUTHORIZED REMOTE-TEST CLIENT** | Synthetic responsive/installable UI review surface; live API mode separately gated. |

The operations portal has no direct privileged database/Supabase client path. The PWA remains static/synthetic and must not silently acquire privileged API/Supabase access.

## Payments and verification authorities

| Integration | State | Current role |
|---|---|---|
| Subscription/payment domain | **ACTIVE implementation** | Products, subscriptions, invoices, intents, ledger and reconciliation contracts. |
| Synthetic payment adapter | **ACTIVE tests only** | Lifecycle/idempotency testing without real money. |
| MTN MoMo | **PLANNED / DISABLED** | Candidate future provider. |
| Airtel Money | **PLANNED / DISABLED** | Candidate future provider. |
| Real money movement | **DISABLED** | Requires legal/commercial/provider/pilot/release gates. |
| PACRA | **MANUAL EVIDENCE SOURCE** | Business evidence source. |
| NCC | **MANUAL EVIDENCE SOURCE** | Contractor/technical evidence where applicable. |
| TEVETA | **MANUAL EVIDENCE SOURCE** | Training/qualification evidence source. |
| Automated registry APIs | **NOT AUTHORIZED** | No scraping/fabricated API access. |

## API/client contract tooling

| Integration | State | Current role |
|---|---|---|
| OpenAPI | **ACTIVE** | Canonical backend contract generated and drift-checked in CI. |
| Android API boundary | **ACTIVE implementation** | Backend API only; no privileged direct Supabase path. |
| TypeScript/PWA live API boundary | **AUTHORIZED ARCHITECTURE / NOT LIVE** | Future live client must use the same REST/OpenAPI trust boundary. |
| Fully generated Kotlin/TypeScript client packages | **NOT CURRENT RUNTIME INTEGRATION** | Do not falsely claim generated-client adoption until a reviewed client migration exists. |

## Phase 0–12 audit checkpoint

PR #149 promoted the full integration/runtime audit at `25deaae72ca2974c5560a8059a50fce37c810f63` after exact-head regression checks on `e3cddf7645e514d9a6254fff86283d4055d745c4`.

Permanent controls now verify:

- server-only Supabase privilege boundaries;
- private Cloud Run/WIF/Secret Manager invariants;
- Firebase gated/active states;
- inactive provider SDKs do not silently enter runtime dependencies;
- portal has no direct privileged data dependency;
- OpenAPI/outbox/payment boundaries remain intact;
- PWA remains synthetic/static;
- Android merged permissions and resolved release runtime dependencies match reviewed inventories.

Detailed evidence: `docs/integrations/PHASE_INTEGRATION_RUNTIME_AUDIT_2026-07-19.md` and `docs/integrations/PHASE_INTEGRATION_AUDIT_CLOSEOUT_2026-07-19.md`.

## Change-control rule

Update this register whenever provider provisioning, source adapter/SDK, secret/runtime binding, managed canary, privacy/legal approval, fallback/kill switch or production authorization changes. External provisioning alone is never enough to mark an integration ACTIVE.
