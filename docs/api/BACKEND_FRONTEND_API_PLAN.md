# DIREKT Backend and Frontend API Plan

**Status:** Current reconciled client/API boundary — 2026-07-19  
**Implementation authority:** canonical REST/OpenAPI contracts are backend-owned; client additions do not activate real participant or production access by themselves.

## 1. Objectives

The API layer must let native Android, the customer/provider PWA and the internal operations portal use one authoritative backend while preserving DIREKT trust/privacy rules.

The design must:

- keep PostgreSQL, private Storage and provider secrets behind NestJS;
- expose versioned documented HTTP contracts;
- support low-bandwidth/interrupted mobile/browser sessions;
- keep provider scope/operator permissions server-enforced;
- separate self-asserted profile data from evidence-derived public claims;
- make external delivery idempotent/auditable;
- support synthetic/development/staging/pilot/production classifications without changing domain rules;
- generate or contract-check Android and TypeScript clients from the same OpenAPI source.

## 2. Client architecture

### 2.1 Native Android

Primary Version 1 customer/provider client. Uses typed HTTPS transport, generated/validated API models, durable drafts/caches where appropriate, WorkManager for retryable background work and Android Keystore-backed protected session storage.

Android never contains database URLs, Supabase privileged keys, OTP/email/WhatsApp/payment provider secrets, server Maps keys or operator credentials.

### 2.2 Customer/provider PWA

Public synthetic review mode at `https://direkt.forum/app/` is static and makes no protected API calls.

Future live mode must:

- consume the same `/api/v1` REST/OpenAPI semantics as Android;
- use an approved browser authentication/session/BFF/gateway boundary;
- avoid storing refresh/session secrets in `localStorage`;
- use HttpOnly/Secure/SameSite cookies where cookie sessions are chosen;
- implement CSRF protection for cookie-authenticated writes;
- enforce strict origin/CORS policy;
- keep private/authenticated responses out of uncontrolled service-worker/cache storage;
- never connect directly to Supabase/PostgreSQL/private Storage with privileged credentials;
- retain server-side provider scope, permission, verification/publication, interaction/review and commercial enforcement.

The PWA may add presentation/view-model/cache adapters but may not duplicate authoritative domain state machines.

### 2.3 Operations portal

Current protected request flow:

```text
Authorized browser
  → Next.js operations portal on IAM-private Cloud Run staging
  → Google workload identity boundary + DIREKT application session
  → DIREKT NestJS API on IAM-private Cloud Run
```

The portal keeps session material server-side/secure, validates backend responses, renders denied/expired states safely and never imports direct database/Supabase/payment/private-storage clients.

Earlier Vercel-hosting plans are not the current protected staging runtime. Any future Vercel/browser deployment must preserve a reviewed private API calling pattern rather than making Cloud Run public.

## 3. Backend architecture

The NestJS modular monolith remains the domain boundary.

Core modules/adapters include auth/account, provider/catalog/location/search/storage, verification/trust publication, availability, enquiries/interactions/reviews, notifications, commercial/payment, operations/support and platform audit/outbox/idempotency.

Provider interfaces include:

```text
OtpProvider
EmailProvider
WhatsAppProvider
PushNotificationProvider
MapsProvider
ObjectStorageProvider
MalwareScanner
DocumentExtractionProvider
PaymentProvider
RegistryVerificationProvider
```

Adapters require disabled/test implementations where appropriate, typed errors, timeout/retry/degradation policy, metrics/audit and no provider-specific types leaking into domain services.

## 4. HTTP contract rules

Base path:

```text
/api/v1
```

Breaking contract changes require a new major API version. Additive fields remain backward-compatible until all released clients tolerate them.

Typical request controls:

```text
Authorization: Bearer <application-access-token>
X-Request-Id: <client-generated-or-proxy request id>
Idempotency-Key: <opaque key for retryable mutations>
```

Cloud Run infrastructure authorization is a separate platform header/token boundary and never replaces DIREKT application authorization.

Responses use the common JSON/problem-details conventions and must not expose stack traces, object-storage paths, private coordinates, raw provider errors or secrets.

## 5. Client generation and contract validation

OpenAPI is generated/validated in backend CI and is the canonical client contract source.

- Android may use generated Kotlin DTO/client layers or equivalent contract validation.
- PWA/portal TypeScript clients must be generated or schema-contract-checked against the same source.
- Generated clients do not own authorization or state-machine decisions.
- Contract changes require compatibility tests across active clients.

## 6. Authentication and sessions

DIREKT remains authoritative for account/session/role/provider scope.

Firebase phone authentication is an implemented **proof-of-phone-possession exchange**, not an authorization authority. Real participant activation remains gated by pilot/legal/configuration controls.

Browser live-mode design must be reviewed before enabling PWA real sign-in. Public synthetic PWA does not initiate real OTP or create DIREKT sessions.

## 7. Evidence and storage

Private evidence is accessed only through backend-authorized, short-lived scoped storage grants. Public clients never receive broad Storage credentials or private object keys.

The public PWA cannot upload/view real evidence. A future protected PWA upload flow must match Android/backend upload-intent, checksum, MIME/size, retry and authorization contracts.

## 8. Location

PostGIS and manual/list area semantics are authoritative. Maps is an optional provider layer and cannot become a dependency for basic discovery.

Clients must distinguish private provider base, consented public premises and public service areas. Mobile providers are never publicly ranked by private base distance.

## 9. Notifications and external delivery

The transactional outbox/domain event model is the source of truth. Provider delivery is downstream and idempotent.

Current directions:

- Firebase phone auth — implemented but real-use gated;
- Resend — externally provisioned; runtime email adapter/binding/canary still required;
- FCM — planned;
- WhatsApp Cloud API — planned/disabled;
- contact handoff domain contract — implemented/gated.

Provider state is defined in `docs/integrations/CURRENT_INTEGRATION_STATUS.md`; an account/key existing is not sufficient to call an adapter active.

## 10. Payments and registries

Commercial lifecycle/ledger/reconciliation contracts exist, while real payment providers/money movement remain disabled. Official-registry automation is not assumed; PACRA/NCC/TEVETA remain manual evidence sources unless authorized interfaces/data-use agreements exist.

## 11. Environment sequencing

```text
public synthetic UI
  → no protected API calls

managed development/private staging
  → synthetic/non-personal data + IAM/private service controls

controlled pilot
  → only after explicit Phase 11 entry gates and participant authorization

production
  → only after 11J PROCEED + global release gates
```

No client deployment or public URL may silently advance an environment classification.

## 12. Failure and privacy rules

Every networked integration defines timeout, retry/idempotency, degraded fallback, redaction, telemetry minimization and kill-switch behavior. Never log access tokens, evidence contents, contact values, exact private coordinates or raw third-party payloads unnecessarily.

## 13. Current PWA live-mode gate

Before connecting `direkt.forum/app/` to real managed data, prove:

1. browser auth/session architecture;
2. private API access/gateway design without weakening Cloud Run IAM;
3. CORS/origin/CSRF/session/logout/revocation tests;
4. OpenAPI client compatibility;
5. private evidence/location non-leakage;
6. service-worker/cache restrictions for authenticated data;
7. rate/abuse controls;
8. controlled test-data classification and rollback.

Until then, the public PWA remains synthetic-only by design.
