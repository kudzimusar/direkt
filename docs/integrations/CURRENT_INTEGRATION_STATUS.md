# DIREKT Current Integration Status Register

**Authoritative as-of date:** 2026-07-19 (Asia/Tokyo)  
**Scope:** repository `kudzimusar/direkt`, owner-configured external services, managed development/staging evidence, and current application source  
**Purpose:** prevent external provisioning, source integration and runtime activation from being conflated.

## 1. Status vocabulary

- **ACTIVE** — source/configuration and managed execution evidence prove approved runtime use.
- **IMPLEMENTED_GATED** — application/domain code exists, but real/provider-backed activation is deliberately fail-closed.
- **EXTERNALLY_PROVISIONED** — external account/domain/credential setup exists, but application runtime use is not yet proven.
- **PLANNED** — approved direction exists, implementation/runtime binding incomplete.
- **DISABLED** — intentionally off in the current approved environment.
- **SUPERSEDED** — retained as history/fallback but no longer the preferred current direction.

Evidence provenance is separate: `managed`, `source`, `owner/external`, or `plan`.

## 2. Domain and public web edge

| Integration | State | Evidence | Current role |
|---|---|---|---|
| `direkt.forum` | **ACTIVE** | owner/external | Canonical public DIREKT domain. |
| Vercel Domains | **ACTIVE — registrar only** | owner/external | Domain registration remains with Vercel; it is not the current protected app runtime. |
| Cloudflare authoritative DNS | **ACTIVE** | owner/external | Authoritative DNS for `direkt.forum`; recorded nameservers `athena.ns.cloudflare.com` and `tate.ns.cloudflare.com`. |
| GitHub Pages | **ACTIVE public static origin** | managed + owner/external | Documentation and synthetic/non-sensitive remote UI content behind `direkt.forum`. |
| Cloudflare Email Routing | **EXTERNALLY_PROVISIONED** | owner/external | Approved role aliases including `privacy@`, `support@`, `security@`, `legal@`, `pilot@direkt.forum`; runtime outbound app delivery is separate. |
| DMARC | **ACTIVE DNS policy** | owner/external | Initial monitoring policy published with `p=none`; tighten only after sender evidence supports it. |
| Cloudflare Turnstile | **PLANNED / NOT ACTIVE** | owner/external | Intended bot/abuse control. Latest automated setup/token attempt returned HTTP 403 due missing required Turnstile permissions. |

Cloudflare DNS/email changes do not authorize public backend traffic or real participant processing.

## 3. Core data/backend infrastructure

| Integration | State | Evidence | Current role |
|---|---|---|---|
| Supabase PostgreSQL | **ACTIVE** | managed + source + live read-only check | System of record behind the API. Project `direct-app`, ref `aeeuscifrxcjmnswqwnq`, region `ap-northeast-1`. |
| PostGIS | **ACTIVE** | managed + source | Spatial/service-area foundation. |
| Supabase Storage | **ACTIVE infrastructure** | managed + source + live read-only check | Four private buckets: `provider-evidence`, `provider-media-private`, `provider-media-public` (still private), `system-exports`. |
| Supabase Data API/PostgREST | **QUARANTINED / NOT AN APP CLIENT PATH** | managed | Android/PWA/portal do not use direct privileged domain access. |
| NestJS DIREKT API | **ACTIVE private staging** | managed + source | Canonical REST/OpenAPI boundary on IAM-private Cloud Run staging. |
| Cloud Run | **ACTIVE private staging** | managed | `direkt-api` and `direkt-operations-portal-staging`. |
| Artifact Registry | **ACTIVE** | managed | `direkt-containers` stores immutable container images. |
| Google Secret Manager | **ACTIVE** | managed | Runtime secret authority with pinned-version deployment contracts. |
| GitHub Workload Identity Federation | **ACTIVE** | managed | Keyless GitHub Actions → Google Cloud deployment identity. |
| Cloud Logging / Monitoring | **ACTIVE** | managed | Infrastructure/runtime observability, rollback/kill-switch/alert evidence. |
| GitHub Actions | **ACTIVE** | managed | CI, security, release and managed-infrastructure gates. |

Bound Google resources:

```text
Project: direkt-dev-502701 (264358173369)
Region: asia-northeast1
API runtime: direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com
Portal runtime: direkt-portal-runtime@direkt-dev-502701.iam.gserviceaccount.com
GitHub deployer: direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com
WIF: projects/264358173369/locations/global/workloadIdentityPools/direkt-github/providers/direkt-main
```

## 4. Android delivery and identity

| Integration | State | Evidence | Current role |
|---|---|---|---|
| Firebase project | **ACTIVE foundation** | managed + source | Attached to `direkt-dev-502701`. |
| Firebase App Distribution | **ACTIVE** | managed | Controlled Android test delivery to `direkt-internal-testers`. |
| Firebase Authentication / phone OTP | **IMPLEMENTED_GATED** | source | Phone-possession proof/session exchange is implemented with invite/consent gates; real participant use remains blocked by Phase 11 external/legal/configuration canaries. |
| Firebase Crashlytics | **PLANNED / NOT SOURCE-ACTIVE** | source audit + plan | Preferred Android crash/ANR direction, but not proven active in current audited release dependency surface. |
| FCM | **PLANNED** | plan | Future push delivery; no production-active claim. |
| Firebase Test Lab | **PLANNED** | plan | Future controlled device-matrix evidence. |
| Google Play | **IMPLEMENTED_GATED release engineering** | managed + source | Release contracts/Play-readiness exist; no signed/public production release authorized. |

## 5. Location and maps

| Integration | State | Evidence | Current role |
|---|---|---|---|
| PostGIS location model | **ACTIVE** | managed + source | Canonical location/service-area semantics. |
| Manual area/list fallback | **ACTIVE** | source | Required discovery path independent of map provider. |
| Google Maps Platform | **EXTERNALLY_PROVISIONED / RUNTIME NOT PROVEN** | owner/external + Phase 11 source audit | Owner reports setup, but audited source did not prove active SDK/runtime binding. |
| Private-coordinate map publication | **DISABLED** | source/plan | Exact private provider bases must not become public markers/ranking inputs. |

Maps becomes `ACTIVE` only after restricted credentials, source integration, privacy terms, quotas/budgets, fallback/non-leakage tests and kill-switch evidence agree.

## 6. Email, OTP, messaging and notifications

| Integration | State | Evidence | Current role |
|---|---|---|---|
| Resend | **EXTERNALLY_PROVISIONED** | owner/external | Preferred transactional email direction. `notify.direkt.forum` verified; synthetic outbound test passed. |
| `direkt-resend-api-key` | **EXTERNALLY_PROVISIONED secret** | owner/external | Send-only key stored in Secret Manager; API runtime identity has access. Current source/runtime allowlist does not yet prove application email delivery. |
| Brevo | **SUPERSEDED as preferred provider** | historical plan | Earlier preference only unless a later decision reverses it. |
| Firebase phone OTP | **IMPLEMENTED_GATED** | source | Current pilot phone-possession direction. |
| Twilio Verify | **SUPERSEDED for current pilot direction** | historical plan | Earlier candidate; not the current default architecture. |
| WhatsApp Cloud API | **PLANNED / DISABLED** | source + plan | Consent-aware domain handoff exists; production delivery adapter/credentials disabled. |
| Call/contact handoff | **IMPLEMENTED_GATED** | source | Consent/expiry/revocation/tracked interaction model exists; real release remains gated. |
| FCM push | **PLANNED** | plan | Future event delivery. |
| Transactional outbox | **ACTIVE domain foundation** | source | Durable source for future asynchronous delivery. |
| Cloud Tasks / Pub/Sub / Scheduler | **PLANNED** | plan | Add only when real retry/fan-out/schedule need is justified. |

Before Resend becomes `ACTIVE`: implement provider-neutral email adapter + Resend implementation; fail-closed provider configuration; deliberately bind a pinned Secret Manager version to the API runtime; add outbox/idempotency/retry/error-redaction/template/privacy controls; verify SPF/DKIM/DMARC alignment; and pass a managed synthetic staging send.

## 7. Observability

| Integration | State | Evidence | Current role |
|---|---|---|---|
| Cloud Logging / Monitoring | **ACTIVE** | managed | Current authoritative infrastructure/runtime observability. |
| Sentry API/portal | **EXTERNALLY_PROVISIONED / RUNTIME NOT PROVEN** | owner/external + source audit | External setup reported; audited NestJS/Next.js source did not prove runtime SDK activation. |
| Sentry Android | **NOT DEFAULT** | plan | Android plan prefers Crashlytics; duplicate telemetry requires explicit decision. |

No telemetry provider may receive raw evidence, tokens, contact data, exact private coordinates or unnecessary free text.

## 8. Browser/application surfaces

| Surface | State | Evidence | Current role |
|---|---|---|---|
| Next.js operations portal | **ACTIVE private staging** | managed + source | Privileged internal portal on IAM-private Cloud Run. |
| Vercel portal hosting | **SUPERSEDED for current protected staging** | managed decision | May only be reconsidered with a proven private backend path. |
| Native Android | **ACTIVE implementation / controlled distribution** | source + managed | Primary customer/provider client. |
| Customer/provider PWA | **AUTHORIZED REMOTE-TEST CLIENT** | owner decision + source | Responsive installable companion. Initial public deployment is synthetic-only; live API mode separately gated. |

## 9. Payments/commercial

| Integration | State | Evidence | Current role |
|---|---|---|---|
| Subscription/payment domain | **ACTIVE implementation** | source | Products, entitlements, subscriptions, invoices, receipts, intents, ledger, webhook/reconciliation contracts. |
| Synthetic payment adapter | **ACTIVE tests only** | source | Lifecycle/idempotency testing without real money. |
| MTN MoMo | **PLANNED / DISABLED** | plan | Candidate future provider. |
| Airtel Money | **PLANNED / DISABLED** | plan | Candidate future provider. |
| Real money movement | **DISABLED** | source + managed | Requires commercial/legal/provider/pilot/release gates. |

## 10. Verification authorities

| Integration | State | Evidence | Current role |
|---|---|---|---|
| PACRA | **MANUAL EVIDENCE SOURCE** | research/plan | Business evidence source. |
| NCC | **MANUAL EVIDENCE SOURCE** | research/plan | Contractor/technical evidence where applicable. |
| TEVETA | **MANUAL EVIDENCE SOURCE** | research/plan | Training/qualification evidence source. |
| Automated registry APIs | **NOT AUTHORIZED** | plan | No scraping/fabricated API access; written access/data-use agreement required. |

## 11. API/client contract tooling

| Integration | State | Evidence | Current role |
|---|---|---|---|
| OpenAPI | **ACTIVE** | source + CI | Canonical backend contract generated/validated in CI. |
| Android client boundary | **ACTIVE implementation** | source | Backend API only; no direct privileged Supabase path. |
| TypeScript/PWA client boundary | **AUTHORIZED** | owner decision | Future live PWA uses same REST/OpenAPI semantics. Public PWA currently synthetic only. |

## 12. Runtime truth summary

### Usable now in approved managed boundaries

- Supabase PostgreSQL/PostGIS/private Storage infrastructure;
- NestJS API and operations portal on IAM-private Cloud Run staging;
- Artifact Registry;
- Secret Manager;
- GitHub Actions/WIF;
- Cloud Logging/Monitoring;
- Firebase App Distribution;
- `direkt.forum` public static edge through Cloudflare DNS + GitHub Pages.

### Implemented but not available as public real-user features

- Firebase phone OTP/session exchange;
- real participant admission;
- real contact handoff;
- real private evidence processing;
- production Android signing/Play release;
- real payment-provider money movement.

### Externally provisioned but runtime proof incomplete

- Resend;
- Google Maps;
- Sentry;
- Cloudflare Email Routing as support infrastructure.

### Not active

- Cloudflare Turnstile;
- production FCM;
- Crashlytics runtime;
- production WhatsApp;
- MTN MoMo/Airtel Money;
- automated official-registry integration.

## 13. Change-control rule

No document may call an integration `ACTIVE` solely because an account, DNS record, API key or secret exists. Update this register whenever provider provisioning, source adapter/SDK, secret/runtime binding, managed canary, privacy/legal approval, fallback/kill switch or production authorization changes.
