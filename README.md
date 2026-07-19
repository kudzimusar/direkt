# DIREKT

**DIREKT is an Android-first, verification-led local service marketplace for Zambia with an installable customer/provider PWA companion.**

It helps customers discover nearby providers—such as plumbers, electricians, mechanics and repair technicians—using evidence-backed business, identity, qualification and location information. Providers do not receive a generic “verified” label merely for registering or paying. Each public trust claim is tied to a specific check, status, evidence scope and validity period.

## Product position

DIREKT is not another open business directory. Its differentiator is a controlled trust layer built around:

- identity and contact verification;
- business or professional evidence;
- qualification and licence evidence where applicable;
- public service-area and reduced-precision location information;
- private physical-location evidence;
- field verification for selected categories where approved;
- certificate expiry and renewal controls;
- platform-tracked enquiries, complaints and reviews.

The first production client remains the **native Android application**. A responsive installable **customer/provider PWA** is now an approved companion for desktop, tablet and mobile remote testing and future browser use through the same canonical API boundaries. A separate web operations portal supports verification, moderation, support and administration. iOS is deferred.

## Repository status

The repository contains the authoritative product, design, architecture, trust, security, testing and operations specifications plus the native Android, customer/provider PWA, NestJS API, PostgreSQL/PostGIS migrations and internal operations portal implementation.

- **Phases 0–10:** complete and promoted.
- **Phase 11:** internal/synthetic readiness is complete; real participant 11C–11H evidence, external legal/privacy gates and 11J remain pending under Issue #112.
- **Phase 12:** preauthorization release engineering has advanced substantially, but formal production release remains blocked until Phase 11 exit and the global release gates genuinely pass.
- **Issue #133:** reconciles current repository/integration truth and adds the remote customer/provider PWA without bypassing Phase 11/12 gates.

Primary Zambia interviews, real provider evidence and field validation have not been fabricated or treated as complete. Historical secondary-research assumptions remain provisional where Phase 11 primary evidence is required.

### Mandatory reading order

1. [`AGENTS.md`](AGENTS.md)
2. [`MASTER_BUILD_PLAN.md`](MASTER_BUILD_PLAN.md)
3. [`PROJECT_STATUS.md`](PROJECT_STATUS.md)
4. [`WORKSTREAM_LOCK.md`](WORKSTREAM_LOCK.md)
5. [`DEFINITION_OF_DONE.md`](DEFINITION_OF_DONE.md)
6. [`docs/REPOSITORY_RECONCILIATION_2026-07-19.md`](docs/REPOSITORY_RECONCILIATION_2026-07-19.md)
7. [`docs/integrations/CURRENT_INTEGRATION_STATUS.md`](docs/integrations/CURRENT_INTEGRATION_STATUS.md)
8. [`docs/INDEX.md`](docs/INDEX.md)
9. relevant phase-specific control documents referenced by `PROJECT_STATUS.md`.

## Repository layout

```text
android/direkt-app/              Native Kotlin/Jetpack Compose application
web/direkt-pwa/                  Responsive installable customer/provider PWA
backend/direkt-api/              TypeScript/NestJS modular backend
admin/direkt-operations-portal/ Internal web operations portal
database/                        Migrations, seeds and database policies
prototype/                       Historical synthetic browser prototype for Pages
infrastructure/                  Deployment and environment definitions
docs/                            Authoritative planning and operating documents
scripts/                         Validation, packaging and maintenance scripts
.github/workflows/               Documentation, product, security and deployment CI
```

## Branch and workflow policy

DIREKT uses one controlled implementation stream:

- `main` is the stable promoted checkpoint and public Pages source.
- `build/android-v1` is the long-lived sequential implementation branch; the historical branch name does not make the PWA a second product line.
- One active owner or agent controls overlapping writes to a workstream.
- Every material task ends with checks, documentation, an atomic commit and a status update.
- Force-pushing is prohibited.
- The active repository agent creates, verifies and merges routine checkpoint pull requests automatically when safe.
- Completed linked issues are closed automatically only when their acceptance evidence exists.
- External credentials, qualified legal approval, participant results and field evidence are never fabricated.

See [`docs/operations/AGENT_WORKFLOW.md`](docs/operations/AGENT_WORKFLOW.md).

## Build, managed staging and remote testing

Current controlled collaboration/testing channels include:

- **`direkt.forum` / GitHub Pages** for public documentation, the synthetic customer/provider PWA and other fictional/non-sensitive review content;
- **GitHub Actions** for backend, Android, PWA, portal, documentation, security/supply-chain and managed-infrastructure verification;
- **Supabase development** project `aeeuscifrxcjmnswqwnq` for the protected PostgreSQL/PostGIS/private-storage development boundary;
- **Google Cloud** project `direkt-dev-502701` for Artifact Registry and IAM-private Cloud Run staging;
- **Firebase App Distribution** for approved internal Android debug distribution to named testers.

Managed staging is synthetic/private and is not the real Phase 11 participant-access path. An internet-addressable Cloud Run URL does not imply public pilot access when IAM denies unauthenticated invocation.

GitHub Pages cannot execute the native Android application. The PWA is a separate browser client/synthetic review surface, not an Android emulator. See [`docs/operations/REMOTE_UI_TESTING.md`](docs/operations/REMOTE_UI_TESTING.md) and [`docs/operations/REMOTE_ANDROID_TESTING.md`](docs/operations/REMOTE_ANDROID_TESTING.md).

## Public web

Canonical public site:

`https://direkt.forum/`

Remote customer/provider PWA after promotion:

`https://direkt.forum/app/`

The public PWA is deliberately synthetic-only during pre-release review: no real submissions, participant data, private evidence, privileged credentials or protected API calls.

The historical `https://kudzimusar.github.io/direkt/` project address is not the owner-facing canonical URL.

Public Pages/PWA content must not host the production API, authenticated operations, secrets, real verification documents, personal data, participant linkage keys or private location evidence.

## Download the planning pack

[Download the generated DIREKT planning pack](https://direkt.forum/downloads/DIREKT_PLANNING_PACK.zip)

## Current workstreams

The formal programme remains in **Phase 11 — controlled Zambia pilot and primary validation** until genuine real-participant evidence and 11J complete. In parallel, repository-safe Phase 12 preauthorization work may proceed only within its documented fail-closed boundaries.

Issue #133 additionally addresses the owner-visible product/testing gap by:

1. reconciling current integration/domain/provider truth against source and managed evidence;
2. preserving detailed historical plans while explicitly superseding stale current-state assertions;
3. publishing an Android-aligned desktop/tablet/mobile customer/provider PWA for synthetic remote testing;
4. retaining the canonical REST/OpenAPI boundary for any future live PWA mode;
5. keeping real pilot, private evidence, production providers, money movement, signing and Play release gated.

See [`PROJECT_STATUS.md`](PROJECT_STATUS.md) for the live checkpoint and [`docs/integrations/CURRENT_INTEGRATION_STATUS.md`](docs/integrations/CURRENT_INTEGRATION_STATUS.md) for integration status.

## Rights and contribution status

This repository is publicly visible for collaboration, testing and GitHub Pages. Public visibility does not grant a licence to reuse the product, brand, documentation or code. See [`LICENSE.md`](LICENSE.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).
