# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | FINAL_VALIDATION |
| Owner/agent | OpenAI GPT-5.6 Thinking — Phase 5 customer-discovery agent |
| Phase | Phase 5 — Android customer discovery |
| Task | Validate the promoted Phase 5 programme record, merge reviewed PR #24, close Issue #23 and synchronize the implementation branch |
| Modules/paths | `database`, `backend/direkt-api`, `android/direkt-app`, `admin/direkt-operations-portal`, `docs/backend`, `docs/testing`, `PROJECT_STATUS.md`, `WORKSTREAM_LOCK.md` |
| Claimed at | 2026-07-15 after Phase 4 checkpoint promotion |
| Expected handoff | Merged and recorded synthetic customer-discovery vertical slice with public-safe publication/location boundaries, deterministic PostGIS search, Android discovery states, green permanent CI and resolved review findings |
| Last clean checkpoint | `6317a48a35367e79a97bec5184a25af14dfac707` |
| Reviewed implementation head | `4107aff54b098d299fd41dd60f63256150aab573` |
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

## Reviewed checkpoint evidence

The Phase 5 implementation was reviewed and verified on exact source head `4107aff54b098d299fd41dd60f63256150aab573`.

| Gate | Run | Result | Artifact SHA-256 |
|---|---:|---|---|
| Backend/PostGIS | #358 | Passed | `3e2a0ed7e7fcb69f8f6e48d57477c478b587cbf1cbcb71dd818d0ba05e666afb` |
| Android reports | #221 | Passed | `074e99ea0a56ed0961db938f60daa2391fa9b53b129cdca4b9f33b8ce80131bc` |
| Operations portal | #222 | Passed | `8b09068672e8011fc1d51dfb588aca809e0c65ef8568ee22594d6495b9a8a892` |
| Documentation quality | #670 | Passed | `343c734aebec30755cf620c57f1d1a5309d930e6d82784bba56ce0c53e0fdc80` |

All three automated review findings were repaired with permanent database/application regressions and their review threads are resolved. The current mutation promotes only the programme record and lock state; permanent CI must pass again on the resulting exact head before merge.

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
11. exclude unpublished, hidden, suspended, stale, degraded, revoked, expired or removed-category providers;
12. provide safe provider profile/trust details, saves, sharing and low-bandwidth/image-free states;
13. provide empty/sparse/populated/no-location/stale-claim Android states and no-results recovery without fabricated providers;
14. add synthetic operations visibility into publication eligibility without private location/evidence;
15. update OpenAPI, architecture, privacy, testing, decisions, risks and project status;
16. obtain green backend/PostGIS, Android, portal and documentation workflows on one reviewed exact head;
17. repair valid review findings with regressions, merge automatically, close Issue #23 and synchronize the build branch.

Criteria 1–16 are satisfied on the reviewed implementation head. Criterion 17 remains active until the final record-validation head passes and PR #24 merges.

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

Phase 5 proves:

- public search/profile responses do not serialize private coordinates, evidence identifiers or reviewer notes;
- fixed providers use only consented public premises for point distance;
- mobile providers match by service area without a private-origin distance;
- hybrid providers support both safe paths without leaking their private base;
- manual/no-location search returns bounded deterministic results;
- unpublished, suspended, hidden, removed-category and stale-claim providers are excluded;
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

A second agent must not modify the listed Phase 5 paths while this lock is in final validation. Read-only review is allowed. The lock is released only after PR #24 merges, Issue #23 closes and the implementation branch is synchronized.
