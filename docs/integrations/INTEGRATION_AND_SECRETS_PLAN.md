# DIREKT Integration and Secrets Plan

**Status:** Phase 10 controlled development/staging activation baseline — public pilot and production remain separately gated.  
**Platform:** Native Android customer/provider application, Next.js internal operations portal, NestJS API, PostgreSQL/PostGIS.  
**Repository:** `kudzimusar/direkt`

## 1. Purpose

This document defines the external services, connectors, credentials, secret-storage boundaries and setup sequence required to move DIREKT from the current synthetic Phase 3 checkpoint to remotely testable development, controlled staging and later production.

The central rule is:

> Android and browser clients call the DIREKT API. They do not connect directly to PostgreSQL, Supabase service credentials, payment operators, regulator systems or privileged storage.

Phase 10 may activate synthetic-only managed development and protected staging services to validate this topology. Phase 11 still owns real participant/pilot data and Phase 12 owns production release. Exact provisioned identifiers and deployment controls are recorded in `../phase10/INFRASTRUCTURE_ACTIVATION_CONTRACT.md`.

## 2. Target deployment topology

```text
Native Android app
  ├── HTTPS → DIREKT NestJS API on Google Cloud Run
  ├── Google Maps SDK for Android
  └── Firebase SDKs: App Distribution, Crashlytics, Cloud Messaging

Operations portal browser
  └── HTTPS → Next.js portal on Vercel
                 └── server-side HTTPS → DIREKT NestJS API on Cloud Run

DIREKT NestJS API
  ├── PostgreSQL/PostGIS on Supabase
  ├── private object storage on Supabase Storage
  ├── Google Cloud Secret Manager
  ├── Google Cloud Tasks / Pub/Sub for asynchronous work
  ├── OTP, email, WhatsApp and map-provider adapters
  └── later payment and official-registry adapters

GitHub
  ├── source, planning and issues
  ├── permanent CI quality gates
  ├── OpenID Connect deployment identity
  └── non-secret deployment identifiers
```

## 3. Direct workspace connectors

### 3.1 GitHub — connected

The GitHub connector is already connected to `kudzimusar/direkt`. It can manage repository files, branches, issues, pull requests, reviews and Actions evidence.

It must not be used as a runtime secret store. GitHub Actions secrets are intentionally write-only to workflows and cannot be read back by agents.

### 3.2 Supabase — available for authorization

A Supabase connector is available in this workspace. After the owner authorizes the correct Supabase account/organization, the agent can:

- list and inspect projects;
- create a project or development branch after explicit cost confirmation;
- execute migrations and SQL;
- inspect database, API, Auth, Storage and Edge Function logs;
- inspect security and performance advisors;
- generate TypeScript types;
- deploy Edge Functions when an approved design requires them.

DIREKT will not use Supabase Auth as the initial identity authority. The existing NestJS identity/session/authorization model remains authoritative.

### 3.3 Vercel, Google Cloud and Firebase

No direct Vercel or Google Cloud/Firebase management connector is currently exposed in this workspace. These services will be controlled through:

1. owner-created projects in their official dashboards;
2. GitHub Actions workflows;
3. Google Workload Identity Federation rather than long-lived JSON service-account keys;
4. environment variables and managed secret stores.

## 4. Provisioned and remaining services

### 4.1 Supabase project

Create one development project first. Create a separate production project only when the production gate is approved.

**Development project display name:** `direct-app`  
**Immutable project ref:** `aeeuscifrxcjmnswqwnq`  
**Region:** `ap-northeast-1` (Tokyo development infrastructure; Zambia latency and cross-border approval remain Phase 10/11 gates).

Required capabilities:

- PostgreSQL;
- PostGIS extension;
- connection pooling;
- private Storage buckets;
- backups and database observability.

Create these Storage buckets as private:

| Bucket | Purpose | Public |
|---|---|---|
| `provider-evidence` | identity, licence, certificate and location evidence | Never |
| `provider-media-private` | unapproved provider photos | Never |
| `provider-media-public` | approved public listing images only | Not until publication policy permits |
| `system-exports` | encrypted operational exports and restore evidence | Never |

Backend-only values:

```text
DATABASE_URL
DIRECT_DATABASE_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_EVIDENCE_BUCKET=provider-evidence
SUPABASE_PRIVATE_MEDIA_BUCKET=provider-media-private
SUPABASE_PUBLIC_MEDIA_BUCKET=provider-media-public
```

`DIRECT_DATABASE_URL` is for migrations, backups and administrative operations. `DATABASE_URL` is for normal API traffic through the appropriate pooled connection.

Do not place `SUPABASE_SERVICE_ROLE_KEY`, database passwords or database URLs in Android, Vercel client-exposed variables, GitHub files or GitHub Pages.

### 4.2 Google Cloud project

Create one Google Cloud project and attach Firebase to the same project.

**Development project ID:** `direkt-dev-502701`  
**Project number:** `264358173369`  
**Region:** `asia-northeast1`

The project, Artifact Registry, Cloud Run service identities, Workload Identity Federation and Secret Manager entries are provisioned. Repository deployment and verification remain controlled by the Phase 10 infrastructure contract.

Enable/verify:

- Cloud Run API;
- Artifact Registry API;
- Cloud Build API;
- Secret Manager API;
- IAM Service Account Credentials API;
- Security Token Service API;
- Cloud Logging and Cloud Monitoring;
- Firebase Management and required Firebase APIs.

Enable when their phase begins:

- Cloud Tasks;
- Pub/Sub;
- Cloud Scheduler;
- Cloud Key Management Service;
- Maps Platform APIs;
- Vision API or Document AI only after the evidence-processing design is approved.

Create service accounts:

| Service account | Purpose | Minimum role direction |
|---|---|---|
| `direkt-github-deployer` | GitHub Actions deploys images and Cloud Run revisions | Artifact Registry writer, Cloud Run deployer, service-account user |
| `direkt-api-runtime` | Cloud Run runtime identity | secret accessor plus only required Google API roles |

Create a Workload Identity Pool and GitHub OIDC provider restricted to:

```text
repository: kudzimusar/direkt
production branch: main
staging/development branch: explicit approved branch only
```

Do not create or store a long-lived Google service-account JSON key unless Workload Identity Federation proves impossible.

### 4.3 Firebase Android project

Attach Firebase to the `direkt-dev` Google Cloud project.

Register two Android applications:

```text
Debug:      com.kudzimusar.direkt.debug
Production: com.kudzimusar.direkt
```

Enable:

- App Distribution for remote tester delivery;
- Crashlytics for Android crashes and ANRs;
- Cloud Messaging for future push notifications;
- Test Lab when real-device/device-matrix testing begins.

Do not enable Firebase Auth, Firestore or Firebase Storage for the DIREKT domain model. Authentication remains in NestJS, PostgreSQL remains the system of record and Supabase Storage is the approved evidence-storage candidate.

Create tester group:

```text
direkt-internal-testers
```

Recommended GitHub Actions variables/secrets:

```text
FIREBASE_PROJECT_ID
FIREBASE_APP_ID_ANDROID_DEBUG
FIREBASE_TESTER_GROUPS=direkt-internal-testers
FIREBASE_GOOGLE_SERVICES_JSON_DEBUG_BASE64
```

Prefer Workload Identity Federation for deployment authentication. Use a base64 service-account secret only as a temporary fallback.

### 4.4 Vercel operations portal

Import `kudzimusar/direkt` and configure:

```text
Root directory: admin/direkt-operations-portal
Framework: Next.js
Production branch: main
Preview deployments: enabled
```

The portal browser must not call Supabase directly. The preferred pattern is:

```text
Browser → same-origin Next.js route handler/server action → DIREKT API
```

This keeps refresh/session material in secure HttpOnly cookies and prevents backend tokens from being persisted in browser local storage.

Vercel environment variables:

```text
DIREKT_API_BASE_URL
PORTAL_COOKIE_SECRET
PORTAL_SESSION_COOKIE_NAME=direkt_portal_session
NEXT_PUBLIC_APP_ENV
NEXT_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT
```

Never add database URLs, Supabase service-role keys, OTP credentials, payment credentials or registry credentials to `NEXT_PUBLIC_*` variables.

### 4.5 Google Maps Platform

Enable when location implementation starts:

- Maps SDK for Android;
- Places API where address/place suggestions are needed;
- Geocoding API for server-controlled normalization;
- Routes API only when route/distance functions are explicitly required.

Create separate keys:

| Key | Restriction |
|---|---|
| Android Maps key | Android application restriction using package name and signing-certificate SHA-1; restrict to Maps SDK for Android |
| Backend Maps key | server-side only; restrict to required APIs, quotas and production egress IP when static egress is configured |

Never reuse one key between Android and the backend. Configure budget alerts, quotas and key rotation.

Planned values:

```text
ANDROID_MAPS_API_KEY
GOOGLE_MAPS_SERVER_API_KEY
```

### 4.6 Error monitoring

Use:

- Firebase Crashlytics for Android;
- Sentry for NestJS and Next.js;
- Cloud Logging/Monitoring for Cloud Run infrastructure;
- Vercel logs for portal deployment/runtime inspection.

Sentry values:

```text
SENTRY_DSN
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT_API
SENTRY_PROJECT_PORTAL
```

Do not send identity documents, phone numbers, precise private coordinates, access tokens or raw request bodies to error-monitoring services. Add explicit PII scrubbing before enabling production telemetry.

## 5. Communication providers

### 5.1 Production OTP — choose one provider

The current production configuration intentionally disables synthetic challenges. Production authentication cannot begin until an approved OTP provider is connected.

Recommended first adapter: **Twilio Verify**, subject to Zambia delivery and cost testing.

Required values:

```text
OTP_PROVIDER=twilio_verify
TWILIO_ACCOUNT_SID
TWILIO_API_KEY
TWILIO_API_KEY_SECRET
TWILIO_VERIFY_SERVICE_SID
```

Use production API keys rather than the master Auth Token. Configure country permissions, rate limits, attempt limits and fraud controls. Normalize Zambian numbers to E.164 (`+260...`) and retain only the existing protected contact-hash model where possible.

Keep an `OtpProvider` interface so another regional provider can replace Twilio without changing domain logic.

### 5.2 Transactional email — Brevo

Use Brevo for operational invitations, support messages, evidence-status notifications and email fallback. Do not use email as proof of professional identity.

```text
EMAIL_PROVIDER=brevo
BREVO_API_KEY
BREVO_SENDER_EMAIL
BREVO_SENDER_NAME=DIREKT
```

Verify a DIREKT-owned sender domain before production.

### 5.3 WhatsApp Cloud API

Use direct Meta WhatsApp Cloud API for consented enquiry handoff and notifications after the communication phase is approved.

```text
WHATSAPP_PROVIDER=meta_cloud
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID
WHATSAPP_APP_SECRET
WHATSAPP_WEBHOOK_VERIFY_TOKEN
```

Requirements:

- Meta Business Manager and a verified business;
- an approved WhatsApp Business Account and phone number;
- approved message templates where required;
- explicit user opt-in;
- signed webhook verification;
- no identity or evidence documents sent through WhatsApp.

## 6. Payment providers — defer connection

Payments are not part of the current Phase 3 checkpoint. Do not add live credentials yet.

Candidate provider adapters for Zambia:

- MTN MoMo API;
- Airtel Africa Developer Portal / Airtel Money APIs;
- an approved aggregator only after commercial, regulatory, reconciliation and support comparison.

Future values must use provider-neutral naming plus provider-specific credentials:

```text
PAYMENT_PROVIDER
PAYMENT_WEBHOOK_SECRET
MTN_MOMO_SUBSCRIPTION_KEY
MTN_MOMO_API_USER
MTN_MOMO_API_KEY
MTN_MOMO_TARGET_ENVIRONMENT
AIRTEL_CLIENT_ID
AIRTEL_CLIENT_SECRET
AIRTEL_COUNTRY=ZM
AIRTEL_CURRENCY=ZMW
```

Before implementation, confirm business onboarding, Zambia production access, settlement, refunds, reversals, webhook signing, reconciliation, fees, taxes, support obligations and Google Play policy implications.

The backend must own the payment ledger, idempotency, webhook verification and reconciliation. Android must never decide that a payment succeeded.

## 7. Zambia verification authorities

Potential evidence sources include:

- PACRA business search;
- National Council for Construction registered contractor/supplier/manufacturer records;
- TEVETA certification/accreditation systems.

These are evidence sources, not automatic trust authorities. No public developer API or production integration agreement is assumed.

Initial implementation mode:

```text
REGISTRY_VERIFICATION_MODE=manual
```

DIREKT must not scrape protected systems or fabricate regulator access. API or data-feed integration requires a written agreement, permitted data fields, matching rules, audit requirements, availability expectations and a manual fallback.

## 8. Google Cloud asynchronous services

Use the existing transactional outbox as the domain source of truth.

| Work | Service |
|---|---|
| OTP/email/WhatsApp dispatch retries | Cloud Tasks |
| push notifications and fan-out events | Pub/Sub |
| evidence scan/extraction jobs | Pub/Sub or Cloud Tasks depending workload |
| scheduled expiry/recheck processing | Cloud Scheduler → Cloud Run job/service |
| backups and restore exercises | Cloud Run jobs + private backup storage |

External delivery must be idempotent. Outbox records are not deleted until delivery status is durably recorded.

## 9. Secret placement matrix

### 9.1 Google Secret Manager — backend runtime authority

Store database and Supabase privileged credentials, token secrets and peppers, OTP/email/WhatsApp/maps-server/payment credentials, backend Sentry DSN, webhook secrets and encryption/KMS references.

Cloud Run reads secrets through `direkt-api-runtime` IAM. Secrets are not copied into container images.

### 9.2 GitHub Actions secrets and variables

Store only deployment/build material:

```text
GCP_PROJECT_ID
GCP_REGION
GCP_WORKLOAD_IDENTITY_PROVIDER
GCP_SERVICE_ACCOUNT
GCP_ARTIFACT_REGISTRY
GCP_CLOUD_RUN_SERVICE
FIREBASE_PROJECT_ID
FIREBASE_APP_ID_ANDROID_DEBUG
FIREBASE_TESTER_GROUPS
FIREBASE_GOOGLE_SERVICES_JSON_DEBUG_BASE64
SENTRY_AUTH_TOKEN
SENTRY_ORG
ANDROID_KEYSTORE_BASE64
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD
ANDROID_STORE_PASSWORD
```

Android signing values are release-phase secrets only.

Use GitHub Environments:

```text
development
staging
production
```

Production deployments require environment approval and protected `main`.

### 9.3 Vercel

Store only portal-specific server configuration and explicitly public client configuration. Vercel must not become the database-secret authority.

### 9.4 Android application

No value embedded in an APK is a true secret. Android API keys must be application-restricted and quota-restricted. Access tokens are short-lived; refresh tokens use Keystore-backed encrypted storage. No provider credential, service-role key or database URL may enter the APK.

## 10. Existing backend environment contract

The current API already validates:

```text
NODE_ENV
PORT
LOG_LEVEL
DATABASE_URL
CORS_ORIGINS
AUTH_CHALLENGE_MODE
ACCESS_TOKEN_SECRET
CONTACT_HASH_PEPPER
CHALLENGE_HASH_PEPPER
ACCESS_TOKEN_TTL_SECONDS
REFRESH_TOKEN_TTL_DAYS
CHALLENGE_TTL_SECONDS
```

Implementation must extend this schema in bounded phases. Production startup must fail closed when a required provider is selected without its credentials.

## 11. Setup order for the owner

1. Re-run and retain passing Supabase exact-project activation evidence for `aeeuscifrxcjmnswqwnq`.
2. Merge the protected Cloud Run development deployment workflow to `main`, then deploy an exact reviewed source through GitHub OIDC.
3. Verify Firebase debug/internal tester configuration for `direkt-internal-testers`.
4. Create or verify the protected Vercel Preview/Staging portal project with the correct root directory.
5. Verify Workload Identity Federation, the deployer/runtime service accounts and least-privilege IAM.
6. Keep deployment material in GitHub Environments and runtime secrets in Google Secret Manager.
7. Create/verify Sentry projects and PII scrubbing before telemetry activation.
8. Create Maps, OTP, email and WhatsApp accounts only when their adapter gates are authorized.
9. Keep MTN MoMo, Airtel Money and regulator credentials deferred until formal access and product gates are satisfied.
10. Do not convert managed development/staging activation into a public pilot or production launch.

## 12. Required owner handoff data

The owner can safely share these non-secret identifiers:

```text
Supabase organization ID
Supabase project ref
Google Cloud project ID
Google Cloud numeric project number
Google Cloud region
Workload Identity pool/provider resource name
Deployment service-account email
Cloud Run service name
Artifact Registry repository name
Firebase project ID
Firebase Android app ID for debug
Firebase tester group name
Vercel team/organization ID
Vercel project ID
Vercel portal URL
Sentry organization slug and project slugs
Approved sender email/domain
```

Do not paste secret values into chat. Add them directly to GitHub Actions, Google Secret Manager or Vercel and report only that the named secret exists.

## 13. Implementation authorization boundary

Creating accounts and storing secrets does not authorize the related feature. Each integration is implemented only when its phase has an approved adapter contract, sandbox credentials, threat model, privacy review, retry/reconciliation behavior, synthetic tests, exact-head CI evidence and explicit production stop gates.