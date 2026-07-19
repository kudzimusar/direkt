# DIREKT Integration and Secrets Plan

**Status:** Reconciled current-state plan — 2026-07-19  
**Repository:** `kudzimusar/direkt`  
**Platform:** Native Android primary client, customer/provider PWA companion, Next.js internal operations portal, NestJS API, PostgreSQL/PostGIS  
**Detailed runtime truth:** [`CURRENT_INTEGRATION_STATUS.md`](CURRENT_INTEGRATION_STATUS.md)

## 1. Purpose

This document defines the external services, client/provider boundaries, secret placement and activation sequence needed to move DIREKT from managed synthetic/private staging through the controlled Zambia pilot and later production.

The central rule is:

> Android, the customer/provider PWA and the operations portal consume DIREKT-owned API/domain contracts. They do not connect directly to PostgreSQL, Supabase privileged credentials, payment operators, regulator systems or broad private storage.

An external account or secret may exist before a feature is runtime-active. Every integration must separately prove:

1. provider/account provisioning;
2. source adapter/SDK implementation;
3. configuration/secret binding;
4. managed synthetic canary/smoke evidence;
5. privacy/legal/operational approval where applicable;
6. controlled-pilot evidence where required;
7. production authorization.

## 2. Current deployment topology

```text
Public web edge
  Vercel Domains (registrar)
      ↓
  Cloudflare authoritative DNS
      ↓
  direkt.forum → GitHub Pages static publication
      ├── /          documentation
      └── /app/      synthetic customer/provider PWA

Native Android
  ├── canonical REST/OpenAPI → DIREKT API on Google Cloud Run
  ├── Firebase App Distribution (active internal test delivery)
  ├── Firebase phone auth exchange (implemented, real use gated)
  ├── future FCM/Crashlytics when activated
  └── Maps only after runtime activation gate

Future live customer/provider PWA
  └── approved browser session/BFF/gateway → same DIREKT API
      (not active in public synthetic PWA)

Operations browser
  └── Next.js operations portal on IAM-private Cloud Run staging
      └── server-side Google identity + DIREKT application session → same DIREKT API

DIREKT API
  ├── Supabase PostgreSQL/PostGIS
  ├── private Supabase Storage
  ├── Google Secret Manager
  ├── Cloud Logging/Monitoring
  ├── provider-neutral external adapters when approved
  └── transactional outbox / future Tasks/PubSub/Scheduler
```

## 3. Canonical public domain, Cloudflare and Vercel

### 3.1 Canonical domain

Owner-facing canonical domain:

```text
https://direkt.forum/
```

The old `https://kudzimusar.github.io/direkt/` address is a historical/technical Pages origin path and is not the canonical public entry point.

### 3.2 Vercel

Current role:

- domain registrar for `direkt.forum`;
- **not** the current protected API/operations runtime;
- earlier Vercel portal-hosting plans are superseded by the proven IAM-private Cloud Run staging path, although Vercel could be reconsidered later only with an approved private API calling pattern.

Do not place database/Supabase/provider credentials in Vercel public/client environment variables.

### 3.3 Cloudflare

Owner-configured current state:

- Free plan active for `direkt.forum`;
- authoritative nameservers: `athena.ns.cloudflare.com`, `tate.ns.cloudflare.com`;
- authoritative DNS fronts the GitHub Pages static public origin;
- Email Routing configured for `privacy@`, `support@`, `security@`, `legal@`, and `pilot@direkt.forum`;
- catch-all is not part of the approved alias plan;
- DMARC published at `_dmarc.direkt.forum` with initial `p=none` monitoring policy;
- Turnstile is **not active**: the latest automated setup/token attempt returned 403 due insufficient Turnstile permissions.

Cloudflare DNS/email configuration does not authorize public backend traffic or real participant processing.

## 4. Supabase

### 4.1 Project binding

| Field | Value |
|---|---|
| Display name | `direct-app` |
| Project ref | `aeeuscifrxcjmnswqwnq` |
| URL | `https://aeeuscifrxcjmnswqwnq.supabase.co` |
| Region | `ap-northeast-1` |

Approved use: PostgreSQL system of record, PostGIS, connection pooling, private Storage and backup/inspection/advisor workflows. The backend is the only privileged application client.

### 4.2 Private buckets

- `provider-evidence`
- `provider-media-private`
- `provider-media-public` — remains private until publication policy permits approved public media
- `system-exports`

### 4.3 Backend-only values

```text
DATABASE_URL
DIRECT_DATABASE_URL        # administrative/migrations/backups only, never API runtime
SUPABASE_URL
SUPABASE_SECRET_KEY
SUPABASE_EVIDENCE_BUCKET=provider-evidence
SUPABASE_PRIVATE_MEDIA_BUCKET=provider-media-private
SUPABASE_PUBLIC_MEDIA_BUCKET=provider-media-public
```

Never embed database URLs or Supabase privileged keys in Android, PWA, portal client bundles, Pages or public artifacts.

### 4.4 Data API boundary

DIREKT domain schemas are not a direct PostgREST/browser/mobile client path. Managed hardening quarantines the browser-facing surface. The NestJS API remains authoritative.

## 5. Google Cloud managed infrastructure

| Field | Value |
|---|---|
| Project ID | `direkt-dev-502701` |
| Project number | `264358173369` |
| Region | `asia-northeast1` |
| Artifact Registry | `direkt-containers` |
| API service | `direkt-api` |
| Operations portal service | `direkt-operations-portal-staging` |

Identities:

```text
direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com
direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com
direkt-portal-runtime@direkt-dev-502701.iam.gserviceaccount.com
```

WIF provider:

```text
projects/264358173369/locations/global/workloadIdentityPools/direkt-github/providers/direkt-main
```

Use Workload Identity Federation; do not create long-lived service-account JSON keys for routine deployment.

Current API/portal staging is IAM-private. No public invocation is authorized; public DNS/PWA work must not weaken this boundary.

## 6. Google Secret Manager

Secret Manager is the backend/runtime secret authority. Cloud Run attaches only explicitly allowlisted, pinned numeric secret versions.

Existing protected runtime families include database/Supabase values, access-token secret, contact/challenge/rate-limit peppers and portal cookie secret. `DIRECT_DATABASE_URL` remains administrative and must not be attached to the API runtime.

Owner provisioning also added:

```text
direkt-resend-api-key
```

It is a send-only Resend API key stored in Secret Manager, and `direkt-api-runtime` has accessor permission. **This does not yet prove runtime email integration.** Before Resend is active, the API deployment allowlist/configuration must deliberately bind a pinned numeric version and source tests must prove the adapter path.

## 7. GitHub and CI/CD

GitHub hosts source/plans/issues and permanent CI. Use GitHub Actions for build/test/security/release/deployment evidence, GitHub Environments for bounded deployment/build material and WIF for Google Cloud auth. GitHub is not a runtime secret store.

## 8. Firebase

Firebase is attached to `direkt-dev-502701`.

Android IDs:

```text
Debug:      com.kudzimusar.direkt.debug
Production: com.kudzimusar.direkt
```

### App Distribution — active

Tester group `direkt-internal-testers`. Managed internal distribution has passed and is the preferred owner/tester path for native Android UI review before Play.

### Firebase phone authentication — implemented but gated

Current preferred pilot phone-possession architecture uses Firebase Authentication and DIREKT session exchange. Firebase identity never grants DIREKT roles/provider scope directly. Real participant use remains disabled until Phase 11 external/legal/privacy/policy/configuration and managed canary gates pass.

### Crashlytics / FCM / Test Lab

- Crashlytics: preferred Android crash/ANR provider but not proven source-active at the Phase 11 audit.
- FCM: planned notification delivery; not production-active.
- Test Lab: planned for controlled device-matrix evidence.

## 9. Customer/provider PWA

Public route:

```text
https://direkt.forum/app/
```

The public PWA uses synthetic data, makes no real submissions, contains no backend credentials, caches only its static shell and exists for remote product-owner review. A future live API mode requires an approved browser auth/session design and private backend access pattern. Never make Cloud Run public merely to connect the PWA.

## 10. Google Maps and location

PostGIS/manual/list location behavior is active and authoritative. Owner reports Maps setup exists externally, but Phase 11 source reconciliation found no runtime SDK/API binding at that checkpoint.

Maps remains externally provisioned until restricted keys, quotas/budgets, source SDK/adapter integration, manual/list fallback, private-coordinate non-leakage, kill switch and legal/privacy terms are proven. Never reuse one key across Android and server trust boundaries.

## 11. Observability

Active: Cloud Logging, Cloud Monitoring and managed alert/rollback/kill-switch evidence.

Sentry external setup is owner-reported, but the Phase 11 source audit found no Sentry SDK dependency in NestJS or Next.js. Sentry remains runtime-unproven until source binding, PII/token/contact/evidence/coordinate scrubbing, release/source-map controls, alert/quota ownership, kill switch and synthetic privacy canaries pass. Android continues to prefer Crashlytics unless an explicit decision approves Sentry Android.

## 12. Transactional email — Resend

**Preferred provider:** Resend. The previous Brevo preference is superseded and retained only as historical alternative.

Owner-configured state:

- `notify.direkt.forum` verified in Resend;
- synthetic outbound test email passed;
- send-only API key stored as `direkt-resend-api-key` in Secret Manager;
- API runtime service account has accessor permission;
- DMARC monitoring policy exists at the parent domain.

Runtime activation requires a provider-neutral email adapter, Resend implementation/tests, fail-closed `EMAIL_PROVIDER=resend` configuration, pinned secret attachment, explicit sender policy, SPF/DKIM/DMARC alignment, outbox/idempotency/retry/delivery-state/error-redaction, minimized templates and a managed staging canary.

Potential uses after activation include pilot/operational notices, verification/evidence status notifications, support acknowledgements and approved enquiry/security notifications. Email is not proof of professional identity.

## 13. OTP direction

Current pilot direction: **Firebase phone authentication**. The earlier Twilio Verify candidate is superseded for the current pilot architecture unless a future provider decision explicitly changes direction.

## 14. Cloudflare Email Routing vs Resend

```text
Inbound / role aliases
Cloudflare Email Routing
  privacy@ / support@ / security@ / legal@ / pilot@

Outbound transactional application email
DIREKT API → Resend (after runtime adapter activation)
  sender domain: notify.direkt.forum
```

Inbound routing configuration does not make Resend active, and Resend verification does not prove inbound aliases.

## 15. WhatsApp and call handoff

The Phase 8 domain already supports tracked enquiry lifecycle, verified-contact references/masked hints, time-limited consent, expiry/revocation and external-delivery-disabled state.

WhatsApp Cloud API remains planned/disabled until approved Meta resources, opt-in/template requirements, webhook verification, secret placement, idempotent delivery/retry, minimized content policy, managed canary and pilot authorization exist. No evidence/identity documents may be sent through WhatsApp.

## 16. Push notifications

FCM is the planned Android push provider. Activation requires token lifecycle/privacy handling, user preference/consent policy, minimized notification content, outbox/idempotent dispatch, stale/revoked token cleanup and controlled evidence.

## 17. Asynchronous jobs

Use the existing transactional outbox as the domain source of truth.

| Work | Candidate |
|---|---|
| email/WhatsApp/push retries | Cloud Tasks |
| fan-out events | Pub/Sub |
| scheduled expiry/recheck | Cloud Scheduler → Cloud Run job/service |
| evidence scan/extraction | Tasks/PubSub depending workload |

Do not introduce queue infrastructure merely to satisfy an architecture diagram; add it when throughput/retry/operational need is real and tested.

## 18. Payments

The Phase 9 commercial foundation is implemented, but real payment providers/money movement remain disabled. Candidate Zambia providers remain MTN MoMo, Airtel Money or an approved aggregator after commercial/regulatory/settlement/support comparison. Payment can never improve trust/publication/ranking.

## 19. Zambia verification authorities

Candidate/manual evidence sources: PACRA, National Council for Construction where relevant, and TEVETA. Initial mode remains manual/reviewer-supported. Do not scrape protected systems or fabricate official APIs. Automated integration requires written access/data-use permission, matching rules, audit requirements, availability expectations and manual fallback.

## 20. Secret placement matrix

### Google Secret Manager

Backend/runtime provider credentials and sensitive values: database/Supabase privileged values; token secrets/peppers; Resend key; future server-side Maps/WhatsApp/payment/webhook/telemetry secrets; encryption/KMS references.

### GitHub Actions / Environments

Deployment/build material only: Google identifiers, WIF/deployer identity, Firebase app/tester identifiers, release metadata and protected signing material only in authorized release workflows.

### Android

No embedded APK value is a true secret. No database/Supabase service/provider secret enters the APK.

### Public PWA

No secret, privileged endpoint token, database URL or private evidence URL. Public static bundle is assumed permanently readable.

### Operations portal

Server-side portal configuration only. No direct database/Supabase/provider credential path.

## 21. Current setup/activation order

### Already proven foundation

1. Supabase exact-project activation/security boundary.
2. Google Cloud project/Artifact Registry/Cloud Run/Secret Manager.
3. WIF and least-privilege runtime/deployer identities.
4. IAM-private API/portal staging, rollback/kill switch/monitoring.
5. Firebase internal Android distribution.
6. Firebase phone-auth source architecture (real use still gated).
7. `direkt.forum` registration/DNS/static public path.

### External provisioning completed but runtime reconciliation required

8. Cloudflare DNS/Email Routing/DMARC.
9. Resend sender domain + send-only secret.
10. owner-reported Maps/Sentry setup.

### Next integration activation work

11. runtime email adapter + pinned Resend secret deployment/canary.
12. Turnstile only after Cloudflare permission/widget setup succeeds and a real public form/auth flow requires it.
13. Maps source integration only when privacy/fallback/key restrictions are proven.
14. Sentry/Crashlytics/FCM source activation with privacy/alert controls.
15. WhatsApp/real payment/registry integrations only under their explicit phase/provider gates.

## 22. Owner handoff identifiers that are safe to record

Supabase project ref; Google Cloud project ID/number/region; WIF provider resource; service-account emails; Cloud Run service names; Artifact Registry repo; Firebase project/app IDs/tester group; canonical public domain; Cloudflare nameservers; Resend verified sender domain; Sentry organization/project slugs; approved sender/contact domains.

Never paste secret values into chat/repository. Report only that a named secret exists and where it is stored.

## 23. Production authorization boundary

Creating or configuring Cloudflare, Resend, Firebase, Maps, Sentry, WhatsApp, payment or registry accounts does **not** authorize production use.

Formal activation requires the applicable adapter contract, secret boundary, privacy/threat review, fallback/kill switch, synthetic tests, managed canary, pilot evidence and production gates. The public PWA improves testability but does not change this rule.
