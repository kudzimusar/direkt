# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED |
| Owner/agent | OpenAI GPT-5.6 Thinking — Phase 5 customer-discovery agent |
| Phase | Phase 5 — Android customer discovery |
| Task | Implement public-safe publication/search, privacy-preserving location and service-area models, deterministic discovery filters/ranking, and Android customer discovery states |
| Modules/paths | `database`, `backend/direkt-api`, `android/direkt-app`, `admin/direkt-operations-portal`, `.github/workflows`, `docs/backend`, `docs/api`, `docs/android`, `docs/architecture`, `docs/security`, `docs/testing`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `RISK_REGISTER.md` |
| Claimed at | 2026-07-15 after Phase 4 checkpoint promotion |
| Expected handoff | Tested synthetic customer-discovery vertical slice with public-safe publication and location boundaries; deterministic PostGIS filters/pagination; Android list/map/profile/saves/share/no-location states; green permanent CI; reviewed checkpoint merged automatically |
| Last clean checkpoint | `6317a48a35367e79a97bec5184a25af14dfac707` |
| Governing issue | Issue #23 |

## Stable predecessor

Phase 4 completed through PR #21 and its stable programme record was promoted through PR #22.

```text
Phase 4 verified PR head: 10c21f076ba27a7e0e38ac1819a4489e063eb6ec
Phase 4 merge commit:     d9078a78d3677a94a720de2d16483487594b261e
Phase 4 record checkpoint: 6317a48a35367e79a97bec5184a25af14dfac707
Issue #20:                closed as completed
```

`main` and `build/android-v1` were identical before this Phase 5 claim.

## Phase 5 objective

Create a bounded, synthetic Android customer-discovery vertical slice that searches only eligible public-safe provider projections and current scoped claims while preserving provider/customer location privacy and functioning without device location or images.

## Acceptance criteria

The active owner must:

1. preserve Phase 4 claim, evidence, verification and privacy boundaries;
2. create forward-only checksummed migrations for publication eligibility, public-safe provider identity/media, public premises, service areas, minimal availability and saved providers;
3. represent private base, consented public premises and service-area geometry as distinct database/API types;
4. prevent private coordinates, evidence, reviewer data and storage references from entering public DTOs, logs or fixtures;
5. publish only through a policy-controlled function requiring current mandatory claims and eligible provider/category state;
6. prove payment, profile completion, administrator row edits and client input cannot publish or rank a provider as more trusted;
7. support manual area search without location permission and one-time location education without background tracking;
8. implement category, normalized text, distance where lawful, operating-model, availability and claim filters;
9. handle fixed, mobile and hybrid providers without exposing or measuring from a private base;
10. provide deterministic ordering, explainable allowlisted reason labels and opaque cursor pagination;
11. exclude unpublished, hidden, suspended, stale, degraded, revoked or expired mandatory-claim providers;
12. provide safe provider profile/trust details, saves, sharing and low-bandwidth/image-free states;
13. provide empty/sparse/populated/no-location/stale-claim Android states and no-results recovery without fabricated providers;
14. add synthetic operations visibility into publication eligibility without private location/evidence;
15. update OpenAPI, architecture, privacy, testing, decisions, risks and project status;
16. obtain green backend/PostGIS, Android, portal and documentation workflows on one reviewed exact head;
17. repair valid review findings with regressions, merge automatically, close Issue #23 and synchronize the build branch.

## Non-negotiable stop gates

- No real provider/customer records or production search traffic.
- No production maps, places, geocoding or device-location integration.
- No background customer location.
- Manual area selection is always available.
- No precise private provider base in public DTOs, logs, analytics, Android fixtures or map presentation.
- Mobile providers use service-area compatibility, not distance from a private base.
- No blanket verified-provider flag or claim inference in Android.
- No public publication from payment, profile completion, direct database edits, administrator action or client request.
- No public indexing, production deployment, enquiry/contact handoff, reviews or public pilot.

## Required regression evidence

At minimum, prove:

- a public search/profile response cannot serialize private coordinates, evidence identifiers or reviewer notes;
- fixed providers use only consented public premises for point distance;
- mobile providers match by service area without a private-origin distance;
- hybrid providers support both safe paths without leaking their private base;
- manual/no-location search returns bounded deterministic results;
- unpublished, suspended, hidden and stale-claim providers are excluded;
- direct row insertion cannot bypass publication eligibility;
- multi-filter ordering and cursor pagination are stable;
- search reasons are allowlisted and supported by data;
- saves and sharing contain only public IDs and safe metadata;
- low-bandwidth and image-free Android states remain usable;
- empty results suggest adjustments rather than invented providers;
- Android/customer fixtures remain fictional and contain no production map or location values.

## Retained Phase 4 trust and privacy boundary

No provider becomes publicly discoverable because an account exists, a profile is complete, a provider pays, an administrator edits a row, a client requests publication or private evidence is uploaded.

Original evidence, storage keys, identity numbers, signatures, private addresses, precise private locations and reviewer notes remain outside public output. Phase 5 consumes only approved safe claim cards and public-safe provider/location/media projections.

## Conflict rule

A second agent must not modify the listed Phase 5 paths while this lock is claimed. Read-only review is allowed. A stale or ambiguous lock must be resolved explicitly rather than overwritten by assumption.
