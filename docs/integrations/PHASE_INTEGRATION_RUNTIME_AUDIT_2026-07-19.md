# DIREKT Phase-by-Phase Integration Runtime Audit — 2026-07-19

**Scope:** Phases 0–12, current `main`, managed evidence and live read-only Supabase inspection  
**Purpose:** Verify that every integration introduced or planned through the build programme is being used only for its intended trust boundary, identify source/runtime drift, and clear all safe repository-side corrective work without fabricating external evidence.

## Executive result

The audit found that the strongest managed integrations are genuinely active and correctly bounded:

- Supabase PostgreSQL/PostGIS is the system-of-record data foundation;
- Supabase Storage is server-side private evidence/media/export storage, not a direct client backend;
- Artifact Registry + Cloud Run provide immutable, IAM-private staging deployment for the API and operations portal;
- Secret Manager supplies runtime secrets through numeric enabled versions;
- GitHub Workload Identity Federation is the deployment/distribution authentication boundary;
- Firebase App Distribution is the controlled Android distribution channel;
- Firebase phone authentication is implemented behind explicit Phase 11 admission/configuration gates;
- Cloud Logging/Monitoring remains the active infrastructure observability layer;
- GitHub Pages + `direkt.forum` provide public static documentation and the synthetic-only PWA test surface.

The audit also confirms that several accounts/providers may be externally provisioned but are **not runtime-active application integrations**. They must not be described or tested as if they are live:

- Google Maps;
- Sentry;
- Resend application delivery;
- Firebase Crashlytics;
- FCM;
- Firebase Test Lab automation;
- Cloudflare Turnstile;
- production WhatsApp delivery;
- MTN MoMo/Airtel Money;
- automated PACRA/NCC/TEVETA access.

No source change in this audit activates those providers.

## Corrective work performed by this audit

1. Added a machine-checkable cross-platform integration runtime contract.
2. Added a permanent consolidated integration regression workflow covering backend/database, operations portal, Android, PWA and Phase 12 Play/Data Safety boundaries.
3. Added a PostgreSQL/Supabase privilege-hardening migration that removes default browser-role/PUBLIC function execution from DIREKT application schemas while preserving owner/runtime execution.
4. Extended the Supabase managed verification script to fail if browser roles retain application-function execution or if an unreviewed `SECURITY DEFINER` function appears.
5. Reconciled the phase-by-phase integration history below so historical plans do not get mistaken for current runtime truth.
6. Preserved all formal Phase 11/12 release gates; no synthetic evidence is promoted into real-pilot or production evidence.

## Live Supabase audit

Project:

```text
name: direct-app
ref: aeeuscifrxcjmnswqwnq
region: ap-northeast-1
state: ACTIVE_HEALTHY
```

Verified on 2026-07-19:

- PostgreSQL 17.6 family;
- PostGIS 3.3.7 and `pgcrypto` 1.3 present;
- 38 DIREKT migrations recorded before this audit migration;
- four required Storage buckets exist and are private;
- no objects currently stored in those four buckets;
- `anon` and `authenticated` have no application-schema usage and no table privileges on the inspected application schemas;
- application schemas currently contain no `SECURITY DEFINER` functions.

Security advisor observations:

- numerous application functions have mutable `search_path` warnings;
- PostGIS / `btree_gist` extension placement warnings exist;
- the migration ledger has RLS enabled with no policies;
- performance advisor reports numerous unindexed foreign keys and unused indexes.

Risk decision:

- mutable `search_path` is retained as explicit defense-in-depth debt rather than mass-mutating 100+ established functions without workload/regression evidence;
- the immediate callable-surface risk is reduced by revoking PUBLIC/browser EXECUTE on application functions and preserving zero browser schema usage;
- no `SECURITY DEFINER` application function is allowed without a future explicit reviewed exception;
- unindexed-FK/unused-index INFO findings are not blindly auto-remediated because index decisions require actual workload/query evidence and write-cost review;
- `public.direkt_schema_migrations` remains browser inaccessible; its no-policy RLS state is intentionally fail-closed.

## Phase-by-phase integration map

### Phase 0 — repository, CI and public static edge

| Integration | Intended use | Current truth |
|---|---|---|
| GitHub repository | source of truth, PR review, branch protection | **ACTIVE** |
| GitHub Actions | CI, security, release, infrastructure workflows | **ACTIVE** |
| GitHub Pages | public static docs/PWA origin | **ACTIVE** |
| `direkt.forum` | canonical owner-facing domain | **ACTIVE** |
| Vercel Domains | registrar only | **ACTIVE / registrar** |
| Cloudflare DNS | authoritative DNS edge | **ACTIVE** |
| Cloudflare Email Routing | role-alias inbound routing | **EXTERNALLY_PROVISIONED** |
| Cloudflare Turnstile | future public abuse-control challenge | **PLANNED / not active** |

Audit decision: registrar/DNS/static-origin roles are separated. Cloudflare DNS does not imply public API access, and Vercel is not the current application runtime.

### Phase 1 — Android shell and distribution foundation

| Integration | Intended use | Current truth |
|---|---|---|
| Android/Gradle | primary Version 1 native client | **ACTIVE implementation** |
| Firebase App Distribution | controlled APK delivery to named testers | **ACTIVE** |
| Google Play | eventual signed release and tracks | **IMPLEMENTED_GATED** |

App Distribution uses WIF rather than a long-lived Google credential and targets the exact debug package `com.kudzimusar.direkt.debug` plus the `direkt-internal-testers` group.

### Phase 2 — API, database and operations foundations

| Integration | Intended use | Current truth |
|---|---|---|
| NestJS REST API | canonical trust/business boundary | **ACTIVE private staging** |
| PostgreSQL | canonical relational system of record | **ACTIVE via Supabase** |
| PostGIS | location geometry/query foundation | **ACTIVE** |
| OpenAPI | canonical API contract and drift check | **ACTIVE** |
| Next.js operations portal | privileged operations client through API only | **ACTIVE private staging** |
| Transactional outbox | durable asynchronous event handoff foundation | **ACTIVE domain foundation** |

The operations portal has no direct database/Supabase client dependency. It calls the protected API through the Cloud Run service identity boundary.

OpenAPI generation/checking is active. Fully generated Kotlin/TypeScript network-client packages are **not currently a runtime integration**; Android has a bounded pilot-specific HTTPS exchange and the public PWA intentionally makes no private API calls. A future generated-client adoption must be its own reviewed migration rather than being falsely recorded as already active.

### Phase 3 — identity, authorization and provider onboarding

| Integration | Intended use | Current truth |
|---|---|---|
| synthetic auth challenge | local/test auth abstraction | **ACTIVE only in development/test** |
| Firebase phone OTP | phone-possession proof for controlled pilot | **IMPLEMENTED_GATED** |
| Twilio Verify | older OTP recommendation | **SUPERSEDED** |

Firebase phone authentication is not authorization. The backend binds a hashed provider subject/phone to an invited DIREKT identity, checks current notice/admission, creates DIREKT sessions and then the Android client signs out of Firebase.

### Phase 4 — verification evidence

| Integration | Intended use | Current truth |
|---|---|---|
| Supabase Storage | private evidence/media/export objects | **ACTIVE server-side foundation** |
| Supabase browser Storage/DB client | direct client access | **DISABLED / prohibited** |

The API creates short-lived private upload/read grants. Evidence completion verifies size, media type and SHA-256 server-side. Private object paths and Supabase provider errors are not exposed as public client contracts.

### Phase 5 — discovery and location

| Integration | Intended use | Current truth |
|---|---|---|
| PostGIS | service-area/public-premises spatial model | **ACTIVE** |
| manual area/list search | privacy/accessibility fallback | **ACTIVE** |
| Google Maps | visual map/geocoding enhancement | **EXTERNALLY_PROVISIONED / runtime unproven** |

Android still intentionally renders a synthetic privacy-safe map card. The product must retain manual/list fallback and must never expose private provider base coordinates. Maps activation remains blocked until SDK/key restrictions, privacy terms, kill switch and fallback regressions are proven.

### Phase 6 — provider workspace

No new external provider became necessary. The workspace continues through the canonical API and private Supabase Storage boundary. This is intentional: provider profile/evidence workflows do not receive direct Supabase credentials.

### Phase 7 — operations workflow

| Integration | Intended use | Current truth |
|---|---|---|
| Cloud Run operations portal | IAM-private operator UI | **ACTIVE staging** |
| Vercel application hosting | historical portal-hosting plan | **SUPERSEDED for current staging** |
| Cloud Run service-to-service identity | portal invokes private API | **ACTIVE** |

The portal remains non-public and separate from the customer/provider PWA.

### Phase 8 — enquiries, contact handoff and reviews

| Integration | Intended use | Current truth |
|---|---|---|
| transactional outbox | eventual asynchronous delivery source | **ACTIVE foundation** |
| WhatsApp Cloud API | approved post-consent delivery channel | **PLANNED / disabled** |
| telephone/call handoff | explicit consent-based contact release | **IMPLEMENTED_GATED domain** |
| FCM | notification delivery | **PLANNED** |

The enquiry/contact model exists without pretending external WhatsApp/FCM delivery is active. Consent, expiry, revocation and audit semantics stay inside DIREKT even before an external channel is attached.

### Phase 9 — commercial/payment foundation

| Integration | Intended use | Current truth |
|---|---|---|
| synthetic payment adapter | domain/testing | **ACTIVE test-only** |
| MTN MoMo | future Zambia payment rail candidate | **PLANNED / disabled** |
| Airtel Money | future Zambia payment rail candidate | **PLANNED / disabled** |
| PACRA/NCC/TEVETA | verification evidence sources | **MANUAL evidence only** |

Production payment mode remains disabled. No unapproved real payment-provider route is allowed into OpenAPI, and no registry scraping/automation is authorized.

### Phase 10 — managed infrastructure, security and observability

| Integration | Intended use | Current truth |
|---|---|---|
| Artifact Registry | immutable API/portal container images | **ACTIVE** |
| Cloud Run | private managed staging runtime | **ACTIVE** |
| Secret Manager | runtime secret versions | **ACTIVE** |
| GitHub WIF | keyless deploy/distribution auth | **ACTIVE** |
| Cloud Logging/Monitoring | infra/service observability | **ACTIVE** |
| Sentry API/portal | application error telemetry | **EXTERNALLY_PROVISIONED / runtime unproven** |
| Firebase Crashlytics | preferred future Android crash/ANR channel | **PLANNED** |
| Firebase Test Lab | device automation | **PLANNED** |

Cloud Run uses exact source-tagged images, explicit runtime service accounts, Secret Manager references and `--no-allow-unauthenticated`. Sentry is not silently duplicated with Cloud Logging; activation requires privacy scrubbing, environment/release tagging, protected source-map upload and canary evidence.

### Phase 11 — controlled pilot entry

| Integration | Intended use | Current truth |
|---|---|---|
| Firebase Authentication | invited real participant phone possession | **IMPLEMENTED_GATED** |
| Supabase private data/storage | controlled pilot backend | **ACTIVE foundation; real-data use gated** |
| Firebase App Distribution | controlled pilot APK delivery | **ACTIVE** |

The source is fail-closed unless required pilot API/Firebase/notice bindings exist. Real participant activation remains blocked by regulatory/legal/privacy and canary gates.

### Phase 12 — release engineering and production readiness

| Integration | Intended use | Current truth |
|---|---|---|
| Google Play/App Signing | signed AAB/tracks/staged rollout | **IMPLEMENTED_GATED** |
| production Cloud Run/data boundary | public production runtime | **NOT DEPLOYED/AUTHORIZED** |
| production monitoring/staffing | launch operations | **REQUIREMENTS DEFINED; real evidence pending** |

All repository-clearable release engineering remains complete. The integration audit does not convert preauthorization evidence into production release authorization.

## Cross-cutting external communications status

### Resend

- `notify.direkt.forum` is reported externally verified;
- a synthetic provider-side send was reported successful;
- a Secret Manager secret exists by owner/configuration evidence;
- no backend adapter, runtime secret attachment or app-event delivery canary exists in current source/evidence.

Status remains **EXTERNALLY_PROVISIONED**, not ACTIVE.

This is intentional until approved templates, recipient/privacy policy, event-to-message mapping, outbox/retry behavior and managed runtime canary exist.

### Brevo

Historical preferred email direction, now **SUPERSEDED** by Resend unless a future decision reverses it.

### FCM / WhatsApp

Remain planned delivery channels. Their absence is not a regression because the domain consent/outbox model is deliberately provider-independent.

## Integration anti-regression contract

`scripts/verify-integration-runtime-contract.py` now fails CI if, among other things:

- privileged Supabase credentials/references enter Android, web or portal client trees;
- Cloud Run loses its private/WIF/Secret Manager/disabled-payment invariants;
- Firebase Auth/App Distribution source binding disappears;
- Maps/Sentry/Resend/Twilio SDKs silently become runtime dependencies without a status promotion;
- the operations portal acquires a direct privileged database/storage dependency;
- OpenAPI generation/drift checks disappear;
- the transactional outbox foundation disappears;
- real payment-provider routes enter OpenAPI prematurely;
- the public PWA begins network/API/Supabase calls or reintroduces a blanket “Verified local services” claim.

`.github/workflows/integration-runtime-audit.yml` runs this contract together with backend/database, operations portal, Android and PWA/Phase 12B regression checks.

## What is deliberately not cleared by code alone

These require real external evidence or a separately authorized product decision:

- DPC/legal/privacy gates and actual Zambia pilot evidence;
- real Firebase participant canary;
- Maps runtime activation;
- Sentry runtime activation;
- Resend application delivery activation;
- Crashlytics/FCM/Test Lab activation;
- Turnstile activation;
- WhatsApp production delivery;
- payment-provider production integration;
- automated registry integration;
- production environment/staffing/monitoring;
- signed AAB and Play internal/closed testing;
- production release.

## UI-test outcome

The immediate owner-facing visual test surface remains the synthetic customer/provider PWA under the canonical domain. It is appropriate for layout, navigation, responsive behavior, trust wording, discovery/provider concepts, enquiry/commercial concepts, accessibility and offline-shell review.

Native Android remains the authoritative surface for Firebase phone auth, Android Keystore/session behavior, permissions, native performance and eventual Play validation. The operations portal remains IAM-private and must not be exposed through the public PWA.
