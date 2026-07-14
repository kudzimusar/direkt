# DIREKT Project Status

**Updated:** 2026-07-14  
**Authoritative branch:** `main`  
**Implementation branch:** `build/android-v1`  
**Current programme state:** Phase 0 documentation baseline committed; repository automation and Pages activation require verification.

## Current phase

| Item | State |
|---|---|
| Repository created | Complete |
| Public visibility confirmed | Complete |
| Comprehensive planning pack | Complete |
| Documentation validation workflow | Added; first CI run must be observed |
| GitHub Pages workflow | Added; one-time repository setting required |
| Sequential build branch | To be created from the documentation baseline |
| Product code | Not started |
| Approved next phase | Phase 1A — Zambia discovery and assumptions validation |

## Current source of truth

The baseline documentation in this repository controls the build. Earlier presentations and conversations are useful discovery material but do not override the committed specifications.

## Immediate owner actions

1. In GitHub, open **Settings → Pages**.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Confirm the first documentation quality and Pages workflows pass.
4. Review `docs/product/PRODUCT_REQUIREMENTS.md`, `docs/trust/VERIFICATION_MODEL.md` and `design.md`.
5. Begin Phase 1A research; do not scaffold product code yet.

## Exact next approved workstream

**Phase 1A: Zambia discovery and assumptions validation**

The assigned agent must:

- read all control documents;
- claim `WORKSTREAM_LOCK.md`;
- create a structured research repository section;
- identify a pilot area and candidate provider categories;
- create interview and observation instruments;
- record findings without unnecessary personal data;
- update the assumptions, evidence matrix, journeys and pilot plan;
- produce an explicit Phase 1A exit review.

## Known decisions

- Native Android Version 1.
- Internal admin portal may be web-based.
- Backend is a modular TypeScript/NestJS API backed by PostgreSQL/PostGIS.
- One controlled build lane; no feature PR workflow.
- GitHub Pages is limited to static, synthetic and non-sensitive material.
- Verification and payment are separate.
- Exact private provider locations are not public by default.

## Open decisions requiring Phase 1 evidence

- initial pilot city/area;
- initial provider categories;
- approved map/geocoding provider;
- approved payment/mobile-money provider;
- phone OTP/SMS vendor;
- final minimum Android SDK based on device research;
- formal evidence and issuing-body rules per category;
- pilot subscription price;
- whether in-app messaging is needed before public launch.

## Blockers

No technical blocker exists for documentation. Product implementation is intentionally blocked until Phase 1A assumptions and field constraints are validated.

## Status update template

Every implementation handoff must update:

- current phase and task;
- commit and branch;
- completed acceptance criteria;
- tests and results;
- migrations;
- blockers and known limitations;
- security/privacy impact;
- exact next authorized task.
