# DIREKT

**DIREKT is an Android-first, verification-led local service marketplace for Zambia with a responsive customer/provider PWA companion.**

Customers discover nearby providers and inspect check-specific identity, contact, business, qualification and location claims. Providers build evidence-backed profiles and manage verification, enquiries and commercial state. Payment or registration alone can never create a generic “verified” status.

## Product surfaces

- **Native Android** — primary customer/provider client and eventual Play release target.
- **Customer/provider PWA** — installable desktop/tablet/mobile companion for remote product review and, after a separate browser-security gate, future live API use.
- **Operations portal** — privileged Next.js interface for verification, moderation, field work, support, finance exceptions and audit.
- **NestJS API + PostgreSQL/PostGIS** — canonical backend/domain authority shared by all clients.

The public PWA does not create a second backend and does not bypass Android, trust, privacy, pilot or production gates.

## Current programme state

- **Phases 0–10:** complete and stable.
- **Phase 11 internal/synthetic readiness:** complete; real Zambia participant validation, external legal/privacy gates and 11J remain pending.
- **Phase 12 preauthorization engineering:** Android release contract, Play-readiness package and all currently clearable repository-controlled release-readiness controls are prepared; formal production release is still blocked.
- **Issue #133:** authoritative documentation/integration reconciliation plus remote customer/provider PWA.

Real participant evidence, legal approval, operational staffing, signed production artifacts, Play publication and real money movement are never fabricated or inferred from synthetic readiness.

## Canonical remote access

Public domain:

```text
https://direkt.forum/
```

Remote customer/provider UI:

```text
https://direkt.forum/app/
```

The `/app/` build is deliberately **synthetic-only** during this review checkpoint: no real submissions, private evidence, participant data or protected API credentials.

Native Android testing remains available through GitHub Actions artifacts and Firebase App Distribution for approved testers. The operations portal remains IAM-private on Cloud Run staging.

See [`docs/operations/REMOTE_UI_TESTING.md`](docs/operations/REMOTE_UI_TESTING.md).

## Current integration truth

Do not infer that a service is active merely because an account, domain or API key exists. The authoritative status register is:

[`docs/integrations/CURRENT_INTEGRATION_STATUS.md`](docs/integrations/CURRENT_INTEGRATION_STATUS.md)

Current high-level state:

- **Active managed foundation:** Supabase PostgreSQL/PostGIS/private Storage, NestJS API, Cloud Run private staging, Artifact Registry, Secret Manager, GitHub Actions/WIF, Cloud Logging/Monitoring and Firebase App Distribution.
- **Implemented but gated:** Firebase phone OTP/session exchange, real participant access, contact handoff, production Android release/signing and real payment activation.
- **Externally provisioned but runtime proof still required:** Resend transactional email, Google Maps and Sentry.
- **Domain/web edge:** `direkt.forum` uses Cloudflare authoritative DNS with GitHub Pages for public static content; Vercel remains the domain registrar rather than the current protected runtime host.
- **Not active:** Cloudflare Turnstile, production FCM, Crashlytics runtime, production WhatsApp, MTN MoMo/Airtel Money and automated official-registry integrations.

## Repository layout

```text
android/direkt-app/              Native Kotlin/Jetpack Compose customer/provider app
web/direkt-pwa/                  Responsive installable customer/provider PWA
backend/direkt-api/              TypeScript/NestJS modular backend
admin/direkt-operations-portal/ Internal privileged operations portal
database/                        PostgreSQL/PostGIS migrations and policies
prototype/                       Historical Phase 1B synthetic prototype
docs/                            Authoritative plans, contracts and status records
scripts/                         Validation/packaging/maintenance scripts
.github/workflows/               CI, security, release and managed-infrastructure workflows
```

## Mandatory reading order

1. [`AGENTS.md`](AGENTS.md)
2. [`MASTER_BUILD_PLAN.md`](MASTER_BUILD_PLAN.md)
3. [`PROJECT_STATUS.md`](PROJECT_STATUS.md)
4. [`WORKSTREAM_LOCK.md`](WORKSTREAM_LOCK.md)
5. [`DEFINITION_OF_DONE.md`](DEFINITION_OF_DONE.md)
6. [`docs/INDEX.md`](docs/INDEX.md)
7. [`docs/integrations/CURRENT_INTEGRATION_STATUS.md`](docs/integrations/CURRENT_INTEGRATION_STATUS.md)
8. phase-specific control documents referenced by `PROJECT_STATUS.md`

## Branch and workflow policy

- `main` is the stable promoted checkpoint and public site source.
- `build/android-v1` remains the long-lived sequential implementation lane for Android/release work.
- Temporary conflict-containment branches may be used only when an already-active locked lane would otherwise be overwritten; they must be reconciled and removed through the normal PR lifecycle.
- Force-pushing is prohibited.
- Exact-head checks, documentation and review are required before promotion.
- External credentials, legal approval, participant results and field evidence are never invented.

## Public-site safety boundary

Public Pages/PWA content may contain documentation, synthetic UI, non-sensitive test instructions and approved reports. It must not contain:

- production API/server credentials;
- database/Supabase privileged keys;
- real verification evidence;
- private coordinates;
- participant linkage/contact data;
- authenticated operations functionality.

## Planning pack

The generated planning archive remains part of the Pages build and is available from the canonical site under `/downloads/DIREKT_PLANNING_PACK.zip` when published.

## Rights and contribution status

This repository is publicly visible for collaboration and controlled review. Public visibility does not grant a licence to reuse the product, brand, documentation or code. See [`LICENSE.md`](LICENSE.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).
