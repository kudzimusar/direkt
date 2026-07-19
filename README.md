# DIREKT

**DIREKT is an Android-first, verification-led local service marketplace for Zambia with a functionally equivalent customer/provider web/PWA companion.**

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

The first production client remains the **native Android application**. The browser client is the same DIREKT customer/provider product expressed through a responsive installable **web/PWA**: mobile retains Android-aligned bottom navigation, while desktop uses persistent side navigation. Both clients share canonical backend/OpenAPI, identity, authorization, provider scope, trust, enquiry, review and commercial rules. A separate web operations portal supports verification, moderation, support and administration. iOS is deferred.

## Repository status

The repository contains the authoritative product, design, architecture, trust, security, testing and operations specifications plus the native Android client, the functional customer/provider web/PWA workstream, the preserved synthetic PWA preview, NestJS API, PostgreSQL/PostGIS migrations and internal operations portal implementation.

- **Phases 0–10:** complete and promoted.
- **Phase 11:** internal/synthetic readiness is complete; real participant 11C–11H evidence, external legal/privacy gates and 11J remain pending under Issue #112.
- **Phase 12:** repository-clearable/preauthorization engineering is complete, but formal production release remains blocked until Phase 11 exit and the global release gates genuinely pass.
- **Functional PWA parity workstream:** active under the owner-authorized W0–W8 plan. Android is regression-protected; the real browser client is additive under `web/direkt-app/` and the existing `web/direkt-pwa/` preview remains synthetic-only until controlled cutover.

Primary Zambia interviews, real provider evidence and field validation have not been fabricated or treated as complete. Historical secondary-research assumptions remain provisional where Phase 11 primary evidence is required.

### Mandatory reading order

1. [`AGENTS.md`](AGENTS.md)
2. [`MASTER_BUILD_PLAN.md`](MASTER_BUILD_PLAN.md)
3. [`PROJECT_STATUS.md`](PROJECT_STATUS.md)
4. [`WORKSTREAM_LOCK.md`](WORKSTREAM_LOCK.md)
5. [`DEFINITION_OF_DONE.md`](DEFINITION_OF_DONE.md)
6. [`docs/REPOSITORY_RECONCILIATION_2026-07-19.md`](docs/REPOSITORY_RECONCILIATION_2026-07-19.md)
7. [`docs/integrations/CURRENT_INTEGRATION_STATUS.md`](docs/integrations/CURRENT_INTEGRATION_STATUS.md)
8. [`docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`](docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md)
9. [`docs/web/FUNCTIONAL_PARITY_MATRIX.md`](docs/web/FUNCTIONAL_PARITY_MATRIX.md)
10. [`docs/architecture/FUNCTIONAL_PWA_ARCHITECTURE_DECISION.md`](docs/architecture/FUNCTIONAL_PWA_ARCHITECTURE_DECISION.md)
11. [`docs/testing/FUNCTIONAL_PWA_NO_REGRESSION_TEST_PLAN.md`](docs/testing/FUNCTIONAL_PWA_NO_REGRESSION_TEST_PLAN.md)
12. [`docs/INDEX.md`](docs/INDEX.md) and relevant phase-specific controls.

## Repository layout

```text
android/direkt-app/              Native Kotlin/Jetpack Compose application
web/direkt-app/                  Functional responsive customer/provider Next.js PWA
web/direkt-pwa/                  Preserved synthetic customer/provider preview
backend/direkt-api/              TypeScript/NestJS modular backend
admin/direkt-operations-portal/ Internal web operations portal
database/                        Migrations, seeds and database policies
prototype/                       Historical synthetic browser prototype for Pages
infrastructure/                  Deployment and environment definitions
docs/                            Authoritative planning and operating documents
scripts/                         Validation, packaging and maintenance scripts
.github/workflows/               Documentation, product, security and deployment CI
```

## Functional customer/provider architecture

```text
                         DIREKT PRODUCT
                              │
               ┌──────────────┴──────────────┐
               │                             │
        Android Client                Web/PWA Client
       Jetpack Compose              Next.js / React
               │                             │
       bottom navigation             mobile: bottom nav
                                     desktop: side nav
               │                             │
               └──────────────┬──────────────┘
                              │
                     Canonical OpenAPI
                              │
                     DIREKT NestJS API
                              │
              ┌───────────────┼────────────────┐
              │               │                │
         PostgreSQL        PostGIS       Private Storage
              │               │                │
              └───────────────┴────────────────┘
                              │
             Identity / Trust / Enquiries / Reviews
                   / Commercial / Audit
```

Authenticated browser mode must use a reviewed BFF/session/gateway boundary to invoke the IAM-private API. The API must not be made public merely to support the PWA, and browser code must never receive privileged Supabase/database credentials.

## Branch and workflow policy

DIREKT uses one controlled implementation stream:

- `main` is the stable promoted checkpoint and public Pages source.
- `build/android-v1` is the long-lived sequential implementation branch; the historical branch name does not make the web/PWA a second product line.
- One active owner or agent controls overlapping writes to a workstream.
- Every material task ends with checks, documentation, an atomic commit and a status update.
- Force-pushing is prohibited.
- The active repository agent creates, verifies and merges routine checkpoint pull requests automatically when safe.
- Completed linked issues are closed automatically only when their acceptance evidence exists.
- External credentials, qualified legal approval, participant results and field evidence are never fabricated.

See [`docs/operations/AGENT_WORKFLOW.md`](docs/operations/AGENT_WORKFLOW.md).

## Build, managed staging and remote testing

Current controlled collaboration/testing channels include:

- **`direkt.forum` / GitHub Pages** for public documentation, the preserved synthetic customer/provider PWA and fictional/non-sensitive review content;
- **GitHub Actions** for backend, Android, functional web/PWA, preview PWA, portal, documentation, security/supply-chain and managed-infrastructure verification;
- **Supabase development** project `aeeuscifrxcjmnswqwnq` for the protected PostgreSQL/PostGIS/private-storage development boundary;
- **Google Cloud** project `direkt-dev-502701` for Artifact Registry and IAM-private Cloud Run staging;
- **Firebase App Distribution** for approved internal Android debug distribution to named testers.

Managed staging is synthetic/private and is not the real Phase 11 participant-access path. An internet-addressable Cloud Run URL does not imply public pilot access when IAM denies unauthenticated invocation.

GitHub Pages cannot execute the native Android application and must not be used as an authenticated backend runtime. The preserved `web/direkt-pwa/` is a static synthetic preview. The new `web/direkt-app/` functional browser client uses a separate reviewed deployment/session architecture before authenticated mode is activated.

## Public web

Canonical public site:

`https://direkt.forum/`

Current synthetic preview route after Pages publication:

`https://direkt.forum/app/`

The functional browser application will receive its approved route/runtime only after W7 parity/security/regression evidence and W8 controlled cutover. `app.direkt.forum` is the preferred deployment shape unless later routing evidence justifies a different reviewed choice.

Public Pages/PWA content must not host the production API, authenticated operations, secrets, real verification documents, personal data, participant linkage keys or private location evidence.

## Functional PWA implementation controls

The governing plan is [`docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`](docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md).

Core rules:

1. no Kotlin Multiplatform/Compose Web rewrite of Android;
2. no Android dependency/Gradle/release changes bundled into PWA work;
3. same backend/OpenAPI and server-side authorization for both clients;
4. mobile bottom navigation, desktop side navigation, same functionality;
5. BFF/session boundary for authenticated browser access to the private API;
6. no direct privileged Supabase/database access;
7. no fixture-only capability may be counted as parity;
8. every shared backend/OpenAPI change must pass Android regression gates;
9. current Phase 11/12 legal, participant, payment, signing and production gates remain unchanged.

## Download the planning pack

[Download the generated DIREKT planning pack](https://direkt.forum/downloads/DIREKT_PLANNING_PACK.zip)

## Current workstreams

The formal programme remains in **Phase 11 — controlled Zambia pilot and primary validation** until genuine real-participant evidence and 11J complete. Formal Phase 12 production release remains blocked.

The active repository implementation lane is the **functional customer/provider PWA parity workstream**:

- W0 — baseline freeze, architecture/parity/no-regression controls;
- W1 — functional Next.js PWA shell/BFF/typed API foundation;
- W2 — real public discovery vertical slice;
- W3 — browser authentication/account/session boundary;
- W4 — customer journey parity;
- W5 — provider journey parity;
- W6 — commercial parity within authorized boundaries;
- W7 — cross-client parity/security/accessibility/resilience and Android regression closure;
- W8 — controlled deployment/route cutover.

See [`PROJECT_STATUS.md`](PROJECT_STATUS.md) for the live checkpoint and [`docs/integrations/CURRENT_INTEGRATION_STATUS.md`](docs/integrations/CURRENT_INTEGRATION_STATUS.md) for integration status.

## Rights and contribution status

This repository is publicly visible for collaboration, testing and GitHub Pages. Public visibility does not grant a licence to reuse the product, brand, documentation or code. See [`LICENSE.md`](LICENSE.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).
