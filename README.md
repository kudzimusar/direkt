# DIREKT

**DIREKT is an Android-first, verification-led local service marketplace for Zambia.**

It helps customers discover nearby providers—such as plumbers, electricians, mechanics, builders, cleaners, tailors and technicians—using evidence-backed business, identity, qualification and location information. Providers do not receive a generic “verified” label merely for registering or paying. Each trust claim is tied to a specific check, status, evidence set and validity period.

## Product position

DIREKT is not intended to be another open business directory. Its differentiator is a controlled trust layer built around:

- identity and contact verification;
- business or professional evidence;
- qualification and licence evidence where applicable;
- public service-area and location information;
- private physical-location evidence;
- field verification for selected provider categories;
- certificate expiry and renewal controls;
- platform-tracked enquiries, complaints and reviews.

The first production client is a **native Android application**. A web administration portal supports verification, moderation, support and operations. iOS is explicitly deferred, while the backend and API contracts must remain portable enough to support it later.

## Repository status

This repository contains the authoritative product, design, architecture, trust, security, testing and operations documentation for DIREKT. Implementation agents must read the mandatory control documents before writing code.

### Mandatory reading order

1. [`AGENTS.md`](AGENTS.md)
2. [`MASTER_BUILD_PLAN.md`](MASTER_BUILD_PLAN.md)
3. [`PROJECT_STATUS.md`](PROJECT_STATUS.md)
4. [`WORKSTREAM_LOCK.md`](WORKSTREAM_LOCK.md)
5. [`DEFINITION_OF_DONE.md`](DEFINITION_OF_DONE.md)
6. [`docs/INDEX.md`](docs/INDEX.md)

## Planned repository layout

```text
android/direkt-app/              Native Kotlin/Jetpack Compose application
backend/direkt-api/              TypeScript/NestJS modular backend
admin/direkt-operations-portal/ Internal web operations portal
database/                        Migrations, seeds and database policies
infrastructure/                  Deployment and environment definitions
docs/                            Authoritative planning and operating documents
scripts/                         Validation, packaging and maintenance scripts
.github/workflows/               Documentation, Pages and product CI
```

## Branch and workflow policy

DIREKT uses one controlled implementation stream rather than feature-PR development:

- `main` is the stable, reviewable source of truth and GitHub Pages source.
- `build/android-v1` is the sequential implementation branch.
- Only one active implementation owner or agent may change a module at a time.
- Every material task ends with tests, documentation, an atomic commit and a status update.
- Force-pushing is prohibited.
- Phase checkpoints are promoted to `main` only after required quality gates pass.

See [`docs/operations/AGENT_WORKFLOW.md`](docs/operations/AGENT_WORKFLOW.md).

## Build and remote testing

The repository now has three distinct remote collaboration channels:

- **GitHub Pages** publishes documentation and synthetic browser prototypes.
- **DIREKT Android CI** tests, lints and builds a debug APK after the native Gradle project is scaffolded.
- **Firebase App Distribution** can deliver manually approved test builds to named Android tester groups after Firebase credentials are configured as repository secrets.

GitHub Pages cannot run the native Android app. See [`docs/operations/REMOTE_ANDROID_TESTING.md`](docs/operations/REMOTE_ANDROID_TESTING.md) for the complete testing workflow.

## GitHub Pages

The repository includes a MkDocs-based Pages workflow for:

- public product and technical documentation;
- synthetic, non-sensitive HTML prototypes;
- test instructions and pilot material;
- release notes and published test reports.

GitHub Pages must **not** be used for the production API, authenticated administration, secrets, real verification documents, personal data or private location evidence.

Complete the one-time repository setting described in [`docs/operations/PAGES_USAGE.md`](docs/operations/PAGES_USAGE.md).

## Download the planning pack

A repository-ready archive is published through the documentation site after Pages deployment:

[Download the generated DIREKT planning pack](https://kudzimusar.github.io/direkt/downloads/DIREKT_PLANNING_PACK.zip)

## Current next workstream

The next approved implementation workstream is **Phase 1A — product assumptions, Zambia field research and interaction-design validation**. Product scaffolding must not begin until the Phase 1A exit criteria in the master plan are met.

## Rights and contribution status

This repository is publicly visible for collaboration, testing and GitHub Pages. Public visibility does not grant a licence to reuse the product, brand, documentation or code. See [`LICENSE.md`](LICENSE.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).
