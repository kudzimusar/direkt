# DIREKT Project Status

**Updated:** 2026-07-14  
**Authoritative branch:** `main` for stable checkpoints  
**Implementation branch:** `build/android-v1`  
**Current programme state:** Phase 0 complete; GitHub Pages and documentation workflows operational; Phase 1A Zambia discovery is active.

## Current phase

| Item | State |
|---|---|
| Repository created | Complete |
| Public visibility confirmed | Complete |
| Comprehensive planning pack | Complete |
| Documentation validation workflow | Complete; successful runs observed |
| GitHub Pages workflow | Complete; public site live at `https://kudzimusar.github.io/direkt/` |
| Android CI workflow | Installed and operational; dormant build path until Gradle project scaffolding exists |
| Firebase tester-distribution workflow | Installed; blocked on approved package name, Firebase project and repository secrets |
| Sequential build branch | Active: `build/android-v1` |
| Product code | Not started; intentionally blocked |
| Active phase | Phase 1A — Zambia discovery and assumptions validation |
| Workstream lock | CLAIMED by Phase 1A research-planning agent |

## Current source of truth

The committed repository documentation controls the build. Earlier presentations and conversations are discovery material but do not override approved repository specifications.

Phase 1A evidence is controlled by `docs/research/INDEX.md`, `docs/research/RESEARCH_PLAN.md`, `docs/research/ASSUMPTIONS_REGISTER.md` and `docs/research/PHASE_1A_EXIT_REVIEW.md`.

## Remote build and testing state

The following workflows are present on `main` and `build/android-v1`:

- `.github/workflows/pages.yml` — validates and deploys the MkDocs documentation site;
- `.github/workflows/android-ci.yml` — preflights the Android directory, then runs unit tests, Android lint and debug APK assembly when the Gradle project exists;
- `.github/workflows/android-distribute.yml` — manually builds and distributes a tested APK through Firebase App Distribution after approval and secret setup.

GitHub Pages is the documentation and synthetic-prototype surface. It is not an Android runtime or production backend.

## Phase 1A initialization completed

The following research controls are committed on `build/android-v1`:

- authoritative research index and plan;
- ethics, consent and public-repository privacy protocol;
- critical assumptions register;
- customer interview guide;
- provider interview guide;
- verification-operations interview guide;
- contextual field-observation guide;
- anonymized interview-note template;
- fieldwork execution checklist;
- official desk-research register;
- auditable research log;
- pilot-area decision framework;
- pilot-category decision framework;
- category evidence matrix;
- technology/connectivity research framework;
- location/addressing research framework;
- payments/communication research framework;
- Zambia legal-research register;
- formal Phase 1A exit gate.

No real participant data, document images or private coordinates have been collected or committed.

## Exact next executable workstream

**Phase 1A exploratory fieldwork wave**

Recruit and conduct:

- 4 customers with recent local-provider hiring experience;
- 4 providers from four different candidate categories;
- 2 verification, issuing-body, procurement or field-operations stakeholders.

The exploratory wave must:

1. use the committed consent and note protocols;
2. include at least one fixed-premises provider and one mobile provider;
3. test natural location/direction language;
4. privately identify evidence types without copying identifiers into GitHub;
5. test comprehension of separate synthetic trust claims;
6. record device, data and communication constraints;
7. update `RESEARCH_LOG.md` and affected assumptions;
8. review instruments before the main fieldwork wave.

## Known decisions

- Native Android Version 1.
- Internal operations portal may be web-based.
- Backend is a modular TypeScript/NestJS API backed by PostgreSQL/PostGIS.
- One controlled build lane; no feature-PR workflow.
- GitHub Pages is limited to static, synthetic and non-sensitive material.
- GitHub Actions is the native Android build and test engine.
- Firebase App Distribution is the preferred early field-tester delivery channel after package-name approval.
- Verification and payment are separate.
- Exact private provider locations are not public by default.
- Phase 1A evidence types must be labelled and desk research cannot replace Zambia field evidence.

## Open decisions requiring Phase 1A evidence

- initial pilot city/area and boundary;
- initial provider categories;
- permanent Android application ID/package name;
- approved map/geocoding provider;
- approved payment/mobile-money provider;
- phone OTP/SMS vendor;
- final minimum Android SDK based on device research;
- formal evidence and issuing-body rules per category;
- pilot subscription price and payment scope;
- whether in-app messaging is needed before public launch;
- field-verification cost, staffing and renewal model;
- public/private location precision;
- legal basis and authority agreements for identity and credential verification.

## Blockers and stop gates

- Android product scaffolding is prohibited until Phase 1A and Phase 1B gates are satisfied.
- Firebase distribution is blocked until the permanent package name and credentials are approved.
- Production collection of identity documents, certificates or precise private locations is blocked until legal, privacy, retention and access controls are approved.
- No public verification claim may be derived from payment, self-declaration alone or unconfirmed desk research.

## Phase 1A completion state

`docs/research/PHASE_1A_EXIT_REVIEW.md` currently records `NOT READY`. Field interviews, contextual observations, synthesis, pilot decisions and legal-review inputs remain outstanding.

## Status update template

Every handoff must update:

- current phase and task;
- commit and branch;
- completed acceptance criteria;
- evidence IDs or tests and results;
- migrations;
- blockers and known limitations;
- security/privacy impact;
- exact next authorized task;
- workstream-lock status.