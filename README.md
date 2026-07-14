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

The repository contains the authoritative product, design, architecture, trust, security, testing and operations specifications for DIREKT.

- **Phase 0:** complete
- **Phase 1A:** complete with accepted limitations using an official and credible secondary-research baseline
- **Phase 1B:** authorized — synthetic interactive prototype
- **Android product code:** begins in Phase 2 after the Phase 1B design checkpoint
- **Public pilot:** not authorized

Primary Zambia interviews and real operational validation have been deferred to later prototype, legal-hardening and controlled-pilot gates. They have not been fabricated or treated as completed.

### Mandatory reading order

1. [`AGENTS.md`](AGENTS.md)
2. [`MASTER_BUILD_PLAN.md`](MASTER_BUILD_PLAN.md)
3. [`PROJECT_STATUS.md`](PROJECT_STATUS.md)
4. [`WORKSTREAM_LOCK.md`](WORKSTREAM_LOCK.md)
5. [`DEFINITION_OF_DONE.md`](DEFINITION_OF_DONE.md)
6. [`docs/INDEX.md`](docs/INDEX.md)
7. [`docs/research/SECONDARY_RESEARCH_BASELINE.md`](docs/research/SECONDARY_RESEARCH_BASELINE.md)

## Planned repository layout

```text
android/direkt-app/              Native Kotlin/Jetpack Compose application
backend/direkt-api/              TypeScript/NestJS modular backend
admin/direkt-operations-portal/ Internal web operations portal
database/                        Migrations, seeds and database policies
prototype/                       Synthetic browser prototype for Pages
infrastructure/                  Deployment and environment definitions
docs/                            Authoritative planning and operating documents
scripts/                         Validation, packaging and maintenance scripts
.github/workflows/               Documentation, Pages and product CI
```

## Branch and workflow policy

DIREKT uses one controlled implementation stream:

- `main` is the stable checkpoint and GitHub Pages source.
- `build/android-v1` is the sequential implementation branch.
- One active owner or agent controls writes to a workstream.
- Every material task ends with checks, documentation, an atomic commit and a status update.
- Force-pushing is prohibited.
- The active repository agent creates, verifies and merges routine checkpoint pull requests automatically when safe.
- Completed linked issues are closed automatically when their acceptance evidence exists.
- External credentials, legal approval and real-world evidence are never fabricated.

See [`docs/operations/AGENT_WORKFLOW.md`](docs/operations/AGENT_WORKFLOW.md).

## Build and remote testing

The repository has three remote collaboration channels:

- **GitHub Pages** publishes documentation and synthetic browser prototypes.
- **DIREKT Android CI** tests, lints and builds a debug APK after the Gradle project is scaffolded.
- **Firebase App Distribution** will deliver approved test builds to named Android testers after Firebase configuration.

GitHub Pages cannot execute the native Android application. See [`docs/operations/REMOTE_ANDROID_TESTING.md`](docs/operations/REMOTE_ANDROID_TESTING.md).

## GitHub Pages

The Pages workflow publishes:

- product and technical documentation;
- fictional, non-sensitive interactive prototypes;
- test instructions and pilot material;
- release notes and approved reports.

Pages must not host the production API, authenticated operations, secrets, real verification documents, personal data or private location evidence.

Public site:

`https://kudzimusar.github.io/direkt/`

## Download the planning pack

[Download the generated DIREKT planning pack](https://kudzimusar.github.io/direkt/downloads/DIREKT_PLANNING_PACK.zip)

## Current next workstream

The active next workstream is **Phase 1B — build and publish a synthetic interactive DIREKT prototype through GitHub Pages**.

The prototype will cover customer discovery, provider trust details, provider evidence progress and operations review using fictional Zambia-oriented data. It will not claim that the backend, verification engine or production integrations already exist.

## Rights and contribution status

This repository is publicly visible for collaboration, testing and GitHub Pages. Public visibility does not grant a licence to reuse the product, brand, documentation or code. See [`LICENSE.md`](LICENSE.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).
