# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | RELEASED |
| Owner/agent | None |
| Phase | Phase 4 complete; Phase 5 not claimed |
| Task | No active implementation workstream |
| Modules/paths | None reserved by this lock |
| Released at | 2026-07-15 after Phase 4 stable checkpoint promotion |
| Last clean checkpoint | `d9078a78d3677a94a720de2d16483487594b261e` |
| Governing issue | Issue #20 — closed as completed |

A new phase must create or confirm its governing issue, define its scope and stop gates, and claim this lock before modifying shared implementation paths.

## Stable predecessor

Phase 3 completed through PR #17, its programme record was updated through PR #18, and the API/integration planning checkpoint was merged through PR #19.

```text
Phase 3 verified head: dab29ac118c3b695ab84f4fcd2ac96091e16052c
Phase 3 merge commit: 149f3b3aa24163ebb6a0b023283cf4a39badb5d6
Integration planning checkpoint: 7736c0909130a3bfbbe993f26ecf28056a699315
```

## Phase 4 stable release record

Phase 4 completed through PR #21:

```text
verified PR head: 10c21f076ba27a7e0e38ac1819a4489e063eb6ec
merge commit:     d9078a78d3677a94a720de2d16483487594b261e
Issue #20:        closed as completed
```

Final exact-head evidence:

```text
Backend/PostGIS CI #296 — passed
artifact sha256: af68f4556085b0ec92f8b774697a1c76980f647aa731ce29ad788ba0ced2f7b5

Android CI #173 — passed
reports sha256: 9802c03b45a7599840f4b14a469dd12f4751cd50f95c802a712908b34f22ab79
debug APK sha256: 4940d82fecb05ab1f407cdb86e0776fdfb026b56c4200f04a360b279103f32ba
Compose test APK sha256: 680b5f05fd9c01bb293a963492ec8c6dd835599b3c72aae4b45eae5bdb0ed561

Operations Portal CI #175 — passed
artifact sha256: 6724c536c93bb8eea793f28977e556594843e809ac595fe5e9ab33c32a6fb6a3

Documentation quality #556 — passed
artifact sha256: 1e0937dc76f18f77fcb9ccd1c1ff3fafc4283da468ce86c0b1e3c320aaa93db6
```

Phase 4 delivered:

1. verification cases bound to provider, category, requirement version and scoped check;
2. private upload sessions and opaque object references behind an adapter boundary;
3. immutable evidence versions, recommendations, decisions and field-visit history;
4. evidence validity, expiry, correction, replacement, renewal and revocation lifecycles;
5. assignment-bound reviewer, supervisor and field workflows;
6. separation of duties for provider owners, evidence submitters, finance and high-risk decisions;
7. safe scoped claim cards with limitations, freshness and policy version;
8. deterministic claim degradation after expiry or evidence revocation;
9. provider-scoped submission and assigned-reviewer private access with audit coverage;
10. synthetic Android verification timelines and operations-portal review states;
11. OpenAPI and database gates preventing public evidence exposure or direct claim creation.

Three automated review findings were resolved and regression-tested before merge:

- shared requirement keys now support deterministic category scope;
- completed case lifecycle steps reject repeat final decisions;
- recommendation and decision results must match their immutable reason-code outcome.

`build/android-v1` was fast-forwarded to the Phase 4 merge checkpoint without force-pushing.

## Retained trust and privacy boundary

No provider becomes publicly discoverable because an account exists, a profile is complete, a provider pays, an administrator edits a row, a client requests publication or private evidence is uploaded.

Original evidence, storage keys, identity numbers, signatures, private addresses, precise private locations and reviewer notes remain outside public output. Phase 5 may consume only approved safe claim cards and public-safe provider/location/media projections.

## Next claim procedure

Before Phase 5 or any other shared implementation work starts:

1. create or approve a governing issue;
2. define the exact customer-discovery, publication, location-privacy, caching and no-location-fallback boundaries;
3. confirm the stable `main` checkpoint;
4. synchronize the implementation branch;
5. change the current lock from `RELEASED` to `CLAIMED` with an owner, paths and expected handoff;
6. do not introduce real provider data, production credentials, public indexing or production discovery without their explicit gates.

## Conflict rule

A second agent must not modify paths reserved by a claimed lock. Read-only review is allowed. A stale or ambiguous lock must be resolved explicitly rather than overwritten by assumption.
