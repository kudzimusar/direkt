# DIREKT

**DIREKT is an Android-first, verification-led local service marketplace for Zambia.**

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

The first production client is a **native Android application**. A web operations portal supports verification, moderation, support and administration. iOS is deferred, while backend and API boundaries remain portable enough to support it later.

## Repository status

The repository contains the authoritative product, design, architecture, trust, security, testing and operations specifications plus the native Android, NestJS API, PostgreSQL/PostGIS migrations and internal operations portal implementation.

- **Phases 0–9:** complete and promoted.
- **Phase 10:** security/privacy/legal/reliability hardening and managed synthetic/private-staging activation complete; final promotion merged through PR #111 at `369fc72581b3ed27920b8fc949e32cfedf1ad8d9` and Issue #41 is closed.
- **Phase 11:** repository-side controlled Zambia pilot entry preparation is active under Issue #112.
- **Real participant pilot:** not yet authorized; legal/privacy/provider/operational entry gates remain open.
- **Phase 12 production release:** not authorized before actual Phase 11 primary evidence and an explicit evidence-backed proceed decision.

Primary Zambia interviews, real provider evidence and field validation have not been fabricated or treated as complete. The historical secondary-research assumptions remain provisional where Phase 11 primary evidence is required.

### Mandatory reading order

1. [`AGENTS.md`](AGENTS.md)
2. [`MASTER_BUILD_PLAN.md`](MASTER_BUILD_PLAN.md)
3. [`PROJECT_STATUS.md`](PROJECT_STATUS.md)
4. [`WORKSTREAM_LOCK.md`](WORKSTREAM_LOCK.md)
5. [`DEFINITION_OF_DONE.md`](DEFINITION_OF_DONE.md)
6. [`docs/INDEX.md`](docs/INDEX.md)
7. [`docs/phase11/HANDOFF_FROM_PHASE10.md`](docs/phase11/HANDOFF_FROM_PHASE10.md)
8. [`docs/phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md`](docs/phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md)

## Repository layout

```text
android/direkt-app/              Native Kotlin/Jetpack Compose application
backend/direkt-api/              TypeScript/NestJS modular backend
admin/direkt-operations-portal/ Internal web operations portal
database/                        Migrations, seeds and database policies
prototype/                       Synthetic browser prototype for Pages
infrastructure/                  Deployment and environment definitions
docs/                            Authoritative planning and operating documents
scripts/                         Validation, packaging and maintenance scripts
.github/workflows/               Documentation, product, security and deployment CI
```

## Branch and workflow policy

DIREKT uses one controlled implementation stream:

- `main` is the stable promoted checkpoint and GitHub Pages source.
- `build/android-v1` is the sequential implementation branch.
- One active owner or agent controls writes to a workstream.
- Every material task ends with checks, documentation, an atomic commit and a status update.
- Force-pushing is prohibited.
- The active repository agent creates, verifies and merges routine checkpoint pull requests automatically when safe.
- Completed linked issues are closed automatically only when their acceptance evidence exists.
- External credentials, qualified legal approval, participant results and field evidence are never fabricated.

See [`docs/operations/AGENT_WORKFLOW.md`](docs/operations/AGENT_WORKFLOW.md).

## Build, managed staging and remote testing

Current controlled collaboration/testing channels include:

- **GitHub Pages** for documentation and fictional/non-sensitive prototypes only;
- **GitHub Actions** for backend, Android, portal, documentation, security/supply-chain and managed-infrastructure verification;
- **Supabase development** project `aeeuscifrxcjmnswqwnq` for the protected PostgreSQL/PostGIS/private-storage development boundary;
- **Google Cloud** project `direkt-dev-502701` for Artifact Registry and IAM-private Cloud Run staging;
- **Firebase App Distribution** for approved internal Android debug distribution to named testers.

Managed Phase 10 staging is synthetic/private and is not the real Phase 11 participant-access path. An internet-addressable Cloud Run URL does not imply public pilot access when IAM denies unauthenticated invocation.

GitHub Pages cannot execute the native Android application. See [`docs/operations/REMOTE_ANDROID_TESTING.md`](docs/operations/REMOTE_ANDROID_TESTING.md).

## GitHub Pages

The Pages workflow publishes:

- product and technical documentation;
- fictional, non-sensitive interactive prototypes;
- test instructions and approved pilot material;
- release notes and approved reports.

Pages must not host the production API, authenticated operations, secrets, real verification documents, personal data, participant linkage keys or private location evidence.

Public site:

`https://kudzimusar.github.io/direkt/`

## Download the planning pack

[Download the generated DIREKT planning pack](https://kudzimusar.github.io/direkt/downloads/DIREKT_PLANNING_PACK.zip)

## Current workstream

The active workstream is **Phase 11 — controlled Zambia pilot and primary validation**, beginning with the entry gate rather than real recruitment.

Current repository priorities are:

1. preserve the Phase 10 stable baseline and permanent regressions;
2. satisfy/document qualified legal, privacy, processor and provider entry gates;
3. approve a tightly bounded pilot area/categories/cohort and named operational owners;
4. reconcile external Maps/Sentry setup with actual runtime source/configuration evidence;
5. establish a safe participant access/authentication path without exposing privileged infrastructure;
6. execute the real controlled pilot only after entry authorization;
7. apply evidence-led corrections to the same production codebase;
8. make the Phase 11 `STOP / REPEAT / NARROW / PROCEED` exit decision before Phase 12.

See [`PROJECT_STATUS.md`](PROJECT_STATUS.md) for the live checkpoint and blockers.

## Rights and contribution status

This repository is publicly visible for collaboration, testing and GitHub Pages. Public visibility does not grant a licence to reuse the product, brand, documentation or code. See [`LICENSE.md`](LICENSE.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).
