# DIREKT Backend and Frontend API Plan

**Status:** Planning baseline after the stable Phase 3 checkpoint.  
**Implementation authority:** This document defines sequencing and boundaries; it does not activate the next phase by itself.

## 1. Objectives

The API layer must let the native Android app and the internal operations portal use one authoritative backend while preserving DIREKT's trust model.

The design must:

- keep PostgreSQL, storage and provider credentials behind NestJS;
- expose versioned, documented HTTP contracts;
- support low-bandwidth and interrupted Android sessions;
- keep provider scope and operator permissions server-enforced;
- separate self-asserted profile data from evidence-derived public claims;
- make every external delivery idempotent and auditable;
- support synthetic, development, staging and production environments without changing domain logic;
- generate Android and TypeScript clients from the same OpenAPI contract.

## 2. Client architecture

### 2.1 Native Android

Recommended networking stack:

- Retrofit or an equivalent typed HTTP client;
- OkHttp for transport, interceptors, timeouts and certificate-safe HTTPS;
- Kotlin serialization for API payloads;
- generated DTOs/models from the committed OpenAPI contract;
- Room for durable local drafts and bounded cached reads;
- WorkManager for retryable uploads and synchronization;
- Android Keystore-backed encrypted refresh-token storage;
- access tokens held in memory and refreshed through the backend.

Android build flavors:

```text
debug      → local or development API
staging    → controlled Cloud Run staging API
release    → production API after authorization
```

Build configuration values:

```text
DIREKT_API_BASE_URL
DIREKT_APP_ENV
ANDROID_MAPS_API_KEY
SENTRY_DSN or Firebase identifiers
```

Android must never contain:

- `DATABASE_URL`;
- Supabase service-role keys;
- OTP/payment/WhatsApp provider secrets;
- Google server API keys;
- operator/admin credentials.

### 2.2 Operations portal

Preferred request flow:

```text
Browser
  → Next.js route handler/server action on Vercel
  → DIREKT NestJS API on Cloud Run
```

The portal layer will:

- keep session/refresh material in secure, HttpOnly, same-site cookies;
- call the backend with server-side credentials/session tokens;
- validate backend response schemas;
- render access-denied and session-expired states without exposing internal errors;
- never import a database, Supabase, payment or storage client.

Portal environment values:

```text
DIREKT_API_BASE_URL
PORTAL_COOKIE_SECRET
PORTAL_SESSION_COOKIE_NAME
NEXT_PUBLIC_APP_ENV
NEXT_PUBLIC_SENTRY_DSN
```

## 3. Backend architecture

The NestJS modular monolith remains the domain boundary.

Required modules/adapters:

```text
auth
account
provider-core
catalog
location
search
storage
verification
trust-publication
availability
interaction-enquiry
review
notification
payment
operations
support
platform/audit
platform/outbox
platform/idempotency
```

External provider interfaces:

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

Every adapter must have:

- a disabled implementation;
- a synthetic/test implementation;
- a production implementation selected by environment;
- typed error mapping;
- timeout and retry policy;
- circuit-breaker or degradation behavior where appropriate;
- metrics and audit events;
- no provider-specific types escaping into domain services.

## 4. HTTP contract rules

### 4.1 Base path and versioning

```text
/api/v1
```

Breaking contract changes require `/api/v2`. Additive fields remain optional until all released clients tolerate them.

### 4.2 Common headers

Requests:

```text
Authorization: Bearer <access-token>
X-Request-Id: <client-generated UUID when available>
Idempotency-Key: <opaque client key for retryable mutations>
Accept-Language: en-ZM
```

Responses:

```text
X-Request-Id
ETag where cacheable
Retry-After for throttling or temporary unavailability
```

### 4.3 Error format

Use RFC-style problem details:

```json
{
  "type": "https://direkt.example/problems/provider-not-ready",
  "title": "Provider is not ready for verification",
  "status": 409,
  "detail": "Required profile fields are incomplete.",
  "instance": "/api/v1/providers/...",
  "requestId": "...",
  "errors": [
    { "field": "serviceAreaSummary", "code": "required" }
  ]
}
```

Do not return stack traces, SQL details, secret names or raw provider responses.

### 4.4 Pagination

Use cursor pagination for lists that can grow:

```text
?limit=20&cursor=<opaque-cursor>
```

Response:

```json
{
  "items": [],
  "nextCursor": null
}
```

### 4.5 Idempotency

Require `Idempotency-Key` for:

- provider creation;
- upload-session creation;
- enquiry submission;
- payment initiation;
- webhook replay-sensitive operations;
- final verification decisions.

Persist only the existing protected hash of the key plus request fingerprint, outcome and expiry.

## 5. API surface by capability

## 5.1 Authentication and sessions

Current synthetic contracts will be extended behind `OtpProvider`.

```text
POST   /api/v1/auth/challenges
POST   /api/v1/auth/challenges/{challengeId}/verify
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/sessions
DELETE /api/v1/auth/sessions/{sessionId}
```

Rules:

- challenge creation responses are enumeration-safe;
- production uses an approved OTP provider;
- access tokens contain identity/session references only;
- roles and permissions are resolved server-side;
- refresh tokens rotate and family reuse revokes the family;
- device/session labels are user-visible and revocable.

## 5.2 Account profile

```text
GET /api/v1/account/profile
PUT /api/v1/account/profile
GET /api/v1/account/consents
PUT /api/v1/account/consents/{policyKey}
```

The account profile is a human identity profile, not a provider organization.

## 5.3 Provider core and representatives

Existing Phase 3 contracts remain non-public:

```text
POST   /api/v1/providers
GET    /api/v1/providers/{providerId}
PATCH  /api/v1/providers/{providerId}
POST   /api/v1/providers/{providerId}/transitions
GET    /api/v1/providers/{providerId}/representatives
POST   /api/v1/providers/{providerId}/representatives
DELETE /api/v1/providers/{providerId}/representatives/{assignmentId}
GET    /api/v1/catalog/categories
PUT    /api/v1/providers/{providerId}/categories/{categoryKey}
DELETE /api/v1/providers/{providerId}/categories/{categoryKey}
```

Every provider request resolves provider scope from the authenticated assignment. A client-supplied provider ID never grants access.

## 5.4 Location and service areas

```text
POST /api/v1/location/geocode
POST /api/v1/location/reverse-geocode
GET  /api/v1/location/places/suggest?q=...
PUT  /api/v1/providers/{providerId}/location
PUT  /api/v1/providers/{providerId}/service-areas
```

Store separately:

- private precise point/evidence;
- public-safe locality summary;
- service-area geometry or bounded radius;
- source and confidence;
- consent and last-confirmed timestamp.

Android may use the Maps SDK for interaction, but the backend normalizes and authorizes stored location data.

## 5.5 Evidence upload

```text
POST   /api/v1/providers/{providerId}/evidence/upload-sessions
POST   /api/v1/providers/{providerId}/evidence
GET    /api/v1/providers/{providerId}/evidence
GET    /api/v1/providers/{providerId}/evidence/{evidenceId}
DELETE /api/v1/providers/{providerId}/evidence/{evidenceId}
POST   /api/v1/providers/{providerId}/evidence/{evidenceId}/replace
```

Recommended upload flow:

1. Android requests an upload session.
2. Backend validates provider scope, evidence type, file limits and consent.
3. Backend returns a short-lived signed upload URL to a private bucket.
4. Android uploads with resumable/retry behavior.
5. Android confirms completion.
6. Backend verifies object metadata, checksum, media type and scan status.
7. Evidence becomes available to authorized operators only after processing.

Evidence object names must use opaque IDs, not phone numbers, names or document numbers.

## 5.6 Verification cases and decisions

```text
POST   /api/v1/providers/{providerId}/verification-cases
GET    /api/v1/providers/{providerId}/verification-cases
GET    /api/v1/verification-cases/{caseId}
POST   /api/v1/verification-cases/{caseId}/assign
POST   /api/v1/verification-cases/{caseId}/checks
POST   /api/v1/verification-cases/{caseId}/field-visits
POST   /api/v1/verification-cases/{caseId}/recommendations
POST   /api/v1/verification-cases/{caseId}/decisions
POST   /api/v1/verification-cases/{caseId}/appeals
```

A decision must identify:

- the specific claim/check;
- evidence considered;
- result and limitations;
- reviewer and separation-of-duties state;
- validity/expiry;
- reason codes;
- audit and policy version.

No single endpoint creates a blanket “verified provider” flag.

## 5.7 Publication and public search

Publication remains blocked until the verification/publication phase is approved.

Planned public endpoints:

```text
GET /api/v1/public/categories
GET /api/v1/public/providers/search
GET /api/v1/public/providers/{publicProviderId}
GET /api/v1/public/providers/{publicProviderId}/claims
```

Search inputs:

```text
category
latitude/longitude or area
radius
operating model
availability window
claim filters
cursor
```

Search outputs expose only:

- public-safe provider identity;
- approved media;
- service area, not private coordinates;
- evidence-derived claim cards and limitations;
- freshness/expiry;
- tracked interaction action.

Commercial status may not create or improve a trust claim.

## 5.8 Availability and enquiries

```text
GET  /api/v1/public/providers/{publicProviderId}/availability
PUT  /api/v1/providers/{providerId}/availability
POST /api/v1/enquiries
GET  /api/v1/enquiries/{enquiryId}
GET  /api/v1/providers/{providerId}/enquiries
POST /api/v1/enquiries/{enquiryId}/accept
POST /api/v1/enquiries/{enquiryId}/decline
POST /api/v1/enquiries/{enquiryId}/contact-handoff
POST /api/v1/enquiries/{enquiryId}/close
```

Contact handoff requires consent and records the platform-tracked interaction before revealing the minimum contact data required for call or WhatsApp handoff.

## 5.9 Notifications and device registration

```text
POST   /api/v1/devices
DELETE /api/v1/devices/{deviceId}
GET    /api/v1/notifications
POST   /api/v1/notifications/{notificationId}/read
PUT    /api/v1/notification-preferences
```

The backend stores FCM registration tokens as protected device credentials. Notifications contain no private evidence or sensitive document data.

## 5.10 Reviews, reports and disputes

```text
POST /api/v1/interactions/{interactionId}/reviews
GET  /api/v1/public/providers/{publicProviderId}/reviews
POST /api/v1/public/providers/{publicProviderId}/reports
POST /api/v1/interactions/{interactionId}/disputes
GET  /api/v1/account/disputes
```

Review eligibility requires a platform-tracked interaction. Moderation and appeals remain operator-controlled and auditable.

## 5.11 Payments — deferred API contract

```text
POST /api/v1/payments/intents
GET  /api/v1/payments/intents/{paymentIntentId}
POST /api/v1/payments/intents/{paymentIntentId}/cancel
GET  /api/v1/account/payments
POST /api/v1/webhooks/payments/{provider}
```

Backend rules:

- provider adapters never update business state directly;
- webhook signatures are verified before parsing business payloads;
- transaction/provider references are unique;
- ledger entries are append-only;
- reconciliation jobs compare internal and provider states;
- Android displays only backend-confirmed state.

## 5.12 Operations portal API

```text
GET  /api/v1/operations/mission-control
GET  /api/v1/operations/providers
GET  /api/v1/operations/providers/{providerId}
GET  /api/v1/operations/verification-queue
GET  /api/v1/operations/verification-cases/{caseId}
POST /api/v1/operations/verification-cases/{caseId}/assign
GET  /api/v1/operations/reports
GET  /api/v1/operations/disputes
GET  /api/v1/operations/audit
POST /api/v1/operations/emergency-actions
```

Operations endpoints require explicit permissions, provider/case scope, audit reason and separation of duties. Emergency actions require an expiry and retrospective review.

## 6. OpenAPI and generated clients

The NestJS OpenAPI document is the contract source of truth.

CI will:

1. generate OpenAPI from the backend;
2. compare it with the committed contract;
3. reject undocumented breaking changes;
4. generate a Kotlin client package for Android;
5. generate TypeScript schemas/client functions for the portal server layer;
6. compile and test both generated clients;
7. publish the OpenAPI artifact with the checkpoint evidence.

Generated code is not hand-edited. Domain UI models remain separate from transport DTOs.

## 7. Caching and offline behavior

Android may cache:

- category taxonomy and requirement metadata;
- public search results with expiry;
- the current user/provider summaries;
- local onboarding/profile/evidence drafts;
- pending mutation metadata.

Android must not cache unencrypted:

- evidence documents;
- precise private locations;
- refresh tokens;
- operator data;
- payment credentials.

Conflict strategy:

- use server revision/ETag for provider profile edits;
- return `409 Conflict` with current server representation;
- preserve local draft and show a field-level reconciliation UI;
- never silently overwrite evidence or verification decisions.

## 8. External webhooks

Planned webhook routes:

```text
POST /api/v1/webhooks/twilio
POST /api/v1/webhooks/whatsapp
POST /api/v1/webhooks/payments/{provider}
POST /api/v1/webhooks/storage
```

Webhook processing sequence:

1. read bounded raw bytes;
2. verify timestamp/signature using the provider-specific secret;
3. reject replay outside the accepted window;
4. persist idempotency/provider event ID;
5. acknowledge quickly;
6. enqueue domain processing;
7. record outcome and retry state;
8. never log full sensitive payloads.

## 9. Rate limiting and abuse controls

Apply separate limits for:

- challenge creation and verification;
- public search;
- provider profile mutation;
- upload-session creation;
- evidence upload confirmation;
- enquiry creation;
- reports/reviews;
- admin sign-in and privileged actions;
- webhook failures.

Limits use identity, session, device fingerprint, IP/network signals and provider scope as permitted. Public error responses remain enumeration-safe.

## 10. Environment model

### Development

- synthetic users/data;
- synthetic OTP allowed;
- Supabase development project;
- Cloud Run development service or local backend;
- Firebase App Distribution debug application;
- Vercel previews;
- sandbox external providers only.

### Staging

- production-shaped infrastructure;
- test accounts and non-real evidence;
- real external sandbox credentials;
- production authentication disabled until abuse controls are approved;
- no public indexing or real provider discoverability.

### Production

- separate Supabase project and secrets;
- production Cloud Run service account;
- approved OTP and communication providers;
- production Firebase application and signing;
- legal/privacy/operations gates complete;
- real provider discoverability only through evidence-derived publication policy.

## 11. Implementation sequence

### Integration Foundation A — deployment and environments

- containerize NestJS API;
- create Cloud Run deployment workflow using GitHub OIDC;
- create Supabase development project and apply migrations;
- configure Secret Manager;
- deploy the Vercel portal BFF boundary;
- configure Firebase App Distribution;
- verify remote synthetic end-to-end health.

### Integration Foundation B — generated clients

- establish committed OpenAPI contract;
- generate Android and portal clients;
- implement typed error/problem mapping;
- add environment/flavor configuration;
- add contract compatibility CI.

### Phase 4 — evidence and verification

- private storage adapter;
- signed upload sessions;
- scanning/extraction pipeline;
- evidence viewer with strict permissions;
- verification case/check/decision model;
- publication remains blocked.

### Phase 5 — location and search

- Maps SDK and server geocoding adapter;
- private/public location separation;
- service-area geometry;
- PostGIS search;
- claim-aware public results after publication authorization.

### Phase 6 — enquiries and notifications

- tracked enquiries;
- availability;
- consent-aware call/WhatsApp handoff;
- FCM device registration and notifications;
- Brevo operational email.

### Later phases

- eligible reviews/disputes;
- subscriptions/payments and reconciliation;
- regulator feeds/partnerships;
- production Play release.

## 12. Acceptance criteria before implementation activation

The owner supplies or confirms:

- Supabase project reference and storage decision;
- Google Cloud project ID, project number and chosen region;
- Workload Identity provider and deployer service-account email;
- Firebase project/app IDs and tester group;
- Vercel project ID and portal URL;
- which integrations are authorized now versus deferred;
- named secrets exist in the correct secret stores without sharing their values in chat.

The agent then creates a bounded implementation issue and workstream lock. No production credential is used until its adapter has synthetic tests, sandbox verification, failure handling, audit coverage and an explicit production gate.