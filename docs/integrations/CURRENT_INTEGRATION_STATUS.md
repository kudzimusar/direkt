# DIREKT Current Integration Status Register

**Authoritative as-of date:** 2026-07-19 (Asia/Tokyo)  
**Scope:** repository `kudzimusar/direkt`, owner-configured external services, managed development/staging evidence, and current application source  
**Purpose:** prevent external provisioning, source integration and runtime activation from being conflated.

## 1. How to read this register

Every integration is assigned one runtime state:

- **ACTIVE** — source/configuration and managed execution evidence prove the integration is in use inside the approved development/staging boundary.
- **IMPLEMENTED_GATED** — application/domain code exists, but real/provider-backed activation is deliberately fail-closed behind legal, privacy, pilot, credential or release gates.
- **EXTERNALLY_PROVISIONED** — the owner has configured the external service/account/domain/credential boundary, but current application source or managed runtime evidence does not yet prove end-to-end use.
- **PLANNED** — approved direction exists, but implementation/runtime binding is not complete.
- **DISABLED** — intentionally off in the current approved environment.
- **SUPERSEDED** — retained only as historical context or fallback; no longer the preferred current direction.

Evidence strength is recorded separately:

- **managed** — repository workflow or managed environment execution passed;
- **source** — current code/configuration proves implementation exists;
- **owner/external** — owner-supplied dashboard/configuration evidence or provider correspondence; does not by itself prove runtime use;
- **plan** — documented intended architecture only.

## 2. Canonical domain and web edge

| Integration | State | Evidence | Current use |
|---|---|---|---|
| `direkt.forum` | **ACTIVE** | owner/external | Canonical public DIREKT web domain. The previous `kudzimusar.github.io/direkt` address is no longer the owner-facing canonical URL. |
| Vercel Domains | **ACTIVE — registrar only** | owner/external | Domain registration remains with Vercel. Vercel is not the current protected application-runtime host. |
| Cloudflare authoritative DNS | **ACTIVE** | owner/external | `direkt.forum` nameservers moved from Vercel DNS to Cloudflare. Recorded nameservers: `athena.ns.cloudflare.com` and `tate.ns.cloudflare.com`. |
| GitHub Pages | **ACTIVE public static origin** | managed + owner/external | Serves public documentation and synthetic/non-sensitive UI review content behind `direkt.forum`. It must not host authenticated operations or private participant data. |
| Cloudflare Email Routing | **EXTERNALLY_PROVISIONED** | owner/external | Routing configured for `privacy@`, `support@`, `security@`, `legal@`, and `pilot@direkt.forum`; catch-all is not part of the approved route. Alias test messages were initiated. Runtime application email delivery is a separate concern. |
| DMARC | **ACTIVE DNS policy** | owner/external | `_dmarc.direkt.forum` published with initial monitoring policy `p=none`; policy may be tightened only after SPF/DKIM/sender evidence supports it. |
| Cloudflare Turnstile | **PLANNED / NOT ACTIVE** | owner/external | Intended web abuse/bot control. Latest automated widget/token setup attempt returned 403 because the token lacked required Turnstile permissions. Do not claim Turnstile protection until widget creation, keys, source integration and verification pass. |

### Domain boundary

Cloudflare is authoritative DNS/email-edge infrastructure. It is **not** currently the DIREKT API runtime, database, privileged identity provider or evidence store. A DNS change must never be interpreted as authorization to make Cloud Run or private data public.

## 3. Core data and backend infrastructure

| Integration | State | Evidence | Current use |
|---|---|---|---|
| Supabase PostgreSQL | **ACTIVE** | managed + source | System-of-record database for DIREKT schemas through the backend. Project display name `direct-app`, ref `aeeuscifrxcjmnswqwnq`, region `ap-northeast-1`. |
| PostGIS | **ACTIVE** | managed + source | Spatial/service-area storage and query foundation. Manual/list discovery remains valid without Google Maps. |
| Supabase Storage | **ACTIVE infrastructure** | managed + source | Four private buckets: `provider-evidence`, `provider-media-private`, `provider-media-public` (still private), `system-exports`. Real participant evidence remains gated. |
| Supabase Data API/PostgREST | **QUARANTINED / NOT AN APP CLIENT PATH** | managed | DIREKT application schemas are not exposed as a direct browser/mobile domain path. Android/PWA/portal must use the DIREKT API. |
| NestJS DIREKT API | **ACTIVE private staging** | managed + source | Canonical REST/OpenAPI domain boundary on Cloud Run. IAM-private staging; not public production traffic. |
| Google Cloud Run | **ACTIVE private staging** | managed | `direkt-api` and `direkt-operations-portal-staging` deployed under IAM-private controls in `direkt-dev-502701`, region `asia-northeast1`. |
| Artifact Registry | **ACTIVE** | managed | `direkt-containers` stores immutable SHA-tagged API/portal images. |
| Google Secret Manager | **ACTIVE** | managed | Runtime secret authority. Pinned numeric versions are required for Cloud Run runtime attachment. |
| GitHub Workload Identity Federation | **ACTIVE** | managed | Keyless GitHub Actions → Google Cloud deployment identity through `projects/264358173369/locations/global/workloadIdentityPools/direkt-github/providers/direkt-main`. |
| Cloud Logging / Monitoring | **ACTIVE** | managed | Cloud Run infrastructure/runtime observability, rollback/kill-switch/alert evidence. |
| GitHub Actions | **ACTIVE** | managed | Permanent backend, Android, portal, documentation, security, release and managed-infrastructure gates. |

### Bound Google identities

- Project: `direkt-dev-502701` (`264358173369`)
- API runtime: `direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com`
- Portal runtime: `direkt-portal-runtime@direkt-dev-502701.iam.gserviceaccount.com`
- GitHub deployer: `direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com`

## 4. Android delivery and identity

| Integration | State | Evidence | Current use |
|---|---|---|---|
| Firebase project | **ACTIVE foundation** | managed + source | Attached to `direkt-dev-502701`; used for controlled Android distribution and prepared participant authentication boundary. |
| Firebase App Distribution | **ACTIVE** | managed | Internal debug APK distribution to `direkt-internal-testers`; managed distribution evidence passed in Phase 10. |
| Firebase Authentication / phone OTP | **IMPLEMENTED_GATED** | source | `POST /auth/firebase/exchange` verifies Firebase phone ID tokens, Zambia `+260` phone format, recent auth and invite/consent gates. Real participant SMS/phone-auth activation remains fail-closed until Phase 11 external/legal/configuration canaries pass. |
| Firebase Crashlytics | **PLANNED / NOT SOURCE-ACTIVE** | plan + Phase 11 audit | Preferred Android crash/ANR service, but current audited Android packages did not contain active Crashlytics runtime integration. |
| Firebase Cloud Messaging | **PLANNED** | plan | Future push notifications/in-app notification delivery. No production notification delivery claim yet. |
| Firebase Test Lab | **PLANNED** | plan | Intended for real-device/device-matrix validation when the controlled testing gate is active. |
| Google Play | **IMPLEMENTED_GATED release engineering** | source + managed | Release contract, reproducible unsigned AAB and preauthorization Play metadata preparation exist. No signed/distributed production artifact or Play-track activation is authorized. |

## 5. Location and maps

| Integration | State | Evidence | Current use |
|---|---|---|---|
| PostGIS location model | **ACTIVE** | managed + source | Canonical area/service-area/private/public location semantics. |
| Manual area / landmark / list fallback | **ACTIVE** | source | Required first-class discovery path; does not depend on a map vendor. |
| Google Maps Platform | **EXTERNALLY_PROVISIONED / RUNTIME NOT PROVEN** | owner/external + Phase 11 source audit | Owner reports setup exists, but the Phase 11 code audit found no active Maps SDK/runtime binding and Android discovery still used the synthetic/manual map abstraction. |
| Maps production/private coordinates | **DISABLED** | source/plan | Exact private provider base coordinates must not become public markers or ranking inputs. |

Live Maps may be activated only after restricted keys, SDK/source binding, privacy terms, quotas/budgets, fallback tests and kill-switch evidence agree.

## 6. Email, OTP, messaging and notifications

| Integration | State | Evidence | Current use |
|---|---|---|---|
| Resend | **EXTERNALLY_PROVISIONED** | owner/external | Current preferred transactional email provider. `notify.direkt.forum` is verified; a synthetic outbound test send passed. |
| `direkt-resend-api-key` | **EXTERNALLY_PROVISIONED secret** | owner/external | Send-only API key stored in Google Secret Manager; `direkt-api-runtime` has secret access. The current Cloud Run API runtime allowlist has not yet been reconciled to attach/use this secret, so application email is **not** yet runtime-active. |
| Brevo | **SUPERSEDED as preferred provider** | historical plan | Earlier plan selected Brevo. Resend now replaces it as the preferred transactional-email direction unless a later decision explicitly reverses this. |
| Firebase phone OTP | **IMPLEMENTED_GATED** | source | Current preferred pilot identity/phone-possession direction. Real SMS use remains gated. |
| Twilio Verify | **SUPERSEDED for current pilot direction** | historical plan | Earlier candidate only. Do not configure as a parallel OTP authority unless a new provider decision is approved. |
| WhatsApp Cloud API | **PLANNED / DISABLED** | source + plan | Consent-aware contact handoff domain model exists; production WhatsApp delivery adapter/credentials remain disabled. |
| Call handoff | **IMPLEMENTED_GATED** | source | Time-limited verified-contact reference, consent, expiry/revocation and tracked interaction model exist. Public/synthetic review does not release real contacts. |
| FCM push notifications | **PLANNED** | plan | Intended for enquiry, verification and operational notification events after privacy/delivery gates. |
| Transactional outbox | **ACTIVE domain foundation** | source | Canonical durable source for future asynchronous delivery; provider dispatch must remain idempotent and record delivery state. |
| Cloud Tasks / Pub/Sub / Scheduler | **PLANNED** | plan | Intended retry/fan-out/scheduled job infrastructure; not required to claim current core app readiness. |

### Required step before Resend becomes ACTIVE

1. implement a provider-neutral email adapter and Resend implementation in the NestJS API;
2. add fail-closed environment validation (`EMAIL_PROVIDER=resend`) without exposing the key;
3. deliberately extend the Cloud Run API secret allowlist to bind the pinned `direkt-resend-api-key` version;
4. route approved domain events/outbox records to minimized templates;
5. add retry/idempotency, provider-error redaction, rate/cost controls and synthetic delivery tests;
6. verify SPF/DKIM/DMARC alignment and sender/from addresses;
7. prove a managed staging send with no participant PII before any pilot use.

## 7. Observability

| Integration | State | Evidence | Current use |
|---|---|---|---|
| Cloud Logging / Monitoring | **ACTIVE** | managed | Current authoritative infrastructure/runtime monitoring path. |
| Sentry API/portal projects | **EXTERNALLY_PROVISIONED / RUNTIME NOT PROVEN** | owner/external + Phase 11 audit | External setup reported, but current audited NestJS/Next.js dependencies did not prove Sentry SDK activation. |
| Sentry Android | **NOT APPROVED AS DUPLICATE DEFAULT** | plan | Android plan prefers Crashlytics. Adding Sentry Android requires an explicit architecture decision. |

No telemetry service may receive raw evidence, tokens, contact values, precise private coordinates, enquiry/complaint free text or unnecessary identity data.

## 8. Operations portal and browser clients

| Integration/client | State | Evidence | Current use |
|---|---|---|---|
| Next.js operations portal | **ACTIVE private staging** | managed + source | Internal verification/moderation/field/support/finance/audit interface on IAM-private Cloud Run staging. |
| Vercel portal hosting | **SUPERSEDED for current protected staging path** | source decision | Retained as a possible later protected target, but current end-to-end protected path is Cloud Run. Vercel must not force the API public. |
| Customer/provider native Android | **ACTIVE implementation / distribution available** | source + managed | Primary product client; debug/internal builds are remotely distributable. |
| Customer/provider PWA | **AUTHORIZED REMOTE-TEST CLIENT** | owner decision + repository workstream | Responsive installable browser client sharing canonical product/API semantics. Initial public deployment is synthetic-only for remote visual testing; live API/auth mode remains fail-closed until an approved browser session/API path exists. |

## 9. Payments and commercial providers

| Integration | State | Evidence | Current use |
|---|---|---|---|
| Commercial/subscription domain | **ACTIVE implementation** | source | Products, entitlements, subscriptions, invoices, receipts, payment intents, ledger, webhooks/reconciliation contracts implemented. |
| Synthetic payment adapter | **ACTIVE for tests only** | source | Used to prove lifecycle/idempotency without real money. |
| MTN MoMo | **PLANNED / DISABLED** | plan | Candidate real Zambia payment provider; no production credential or money movement. |
| Airtel Money | **PLANNED / DISABLED** | plan | Candidate alternative/secondary provider; no production credential or money movement. |
| Real money movement | **DISABLED** | managed + source | Zero real payment activation until commercial/legal/provider and Phase 11/12 gates allow it. |

## 10. Verification authorities

| Integration | State | Evidence | Current use |
|---|---|---|---|
| PACRA | **MANUAL EVIDENCE SOURCE** | plan/research | Relevant business-registration evidence source. No assumed public API integration agreement. |
| NCC | **MANUAL EVIDENCE SOURCE** | plan/research | Relevant contractor/technical evidence source where category rules require it. |
| TEVETA | **MANUAL EVIDENCE SOURCE** | plan/research | Relevant training/qualification evidence source. |
| Automated registry APIs | **NOT AUTHORIZED** | plan | No scraping or fabricated API access. Written access/data-use agreement required before automation. |

## 11. API/client contract tooling

| Integration | State | Evidence | Current use |
|---|---|---|---|
| OpenAPI | **ACTIVE** | source + CI | Canonical backend contract generated/validated in CI. All user clients must remain contract-aligned. |
| Android API client boundary | **ACTIVE implementation** | source | Android consumes backend-owned contracts; no direct privileged Supabase path. |
| TypeScript/PWA client boundary | **AUTHORIZED** | owner decision | PWA must consume the same REST/OpenAPI semantics when live mode is approved. Initial public PWA is synthetic and contains no privileged credentials. |

## 12. Runtime truth matrix

### Usable now inside the approved managed environment

- Supabase PostgreSQL/PostGIS;
- Supabase private Storage infrastructure;
- NestJS API on IAM-private Cloud Run staging;
- Next.js operations portal on IAM-private Cloud Run staging;
- Artifact Registry;
- Secret Manager;
- GitHub Actions + Workload Identity Federation;
- Cloud Logging/Monitoring;
- Firebase App Distribution;
- canonical `direkt.forum` static/public web edge through Cloudflare DNS + GitHub Pages;
- Android/customer/provider and operations application code using synthetic/controlled data boundaries.

### Implemented but intentionally not available to public real users

- Firebase phone OTP/session exchange;
- real participant invitations/consents;
- live contact handoff;
- real private evidence processing;
- production Android release/signing/Play publication;
- real payment provider/money movement.

### Provisioned externally but still requiring runtime source proof

- Resend transactional email;
- Google Maps;
- Sentry;
- Cloudflare Email Routing as app-support infrastructure (routing itself is external, not application dispatch).

### Not active

- Cloudflare Turnstile;
- FCM production push;
- Crashlytics runtime;
- WhatsApp production delivery;
- MTN MoMo/Airtel Money;
- automated PACRA/NCC/TEVETA integration.

## 13. Change-control rule

No other document may call an integration `active` solely because an account, domain, API key, DNS record or secret exists. This register is the current status source of truth and must be updated whenever any of these changes:

1. provider/account provisioning;
2. source dependency or adapter implementation;
3. secret/runtime binding;
4. managed canary or smoke evidence;
5. privacy/legal approval;
6. kill switch/fallback status;
7. production authorization.

`PROJECT_STATUS.md` should summarize this register; detailed truth remains here.
