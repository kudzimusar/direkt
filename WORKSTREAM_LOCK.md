# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | RELEASED |
| Owner/agent | None |
| Phase | Phase 3 complete; Phase 4 not claimed |
| Task | No active implementation workstream |
| Modules/paths | None reserved by this lock |
| Released at | 2026-07-15 after stable checkpoint promotion |
| Last clean checkpoint | `149f3b3aa24163ebb6a0b023283cf4a39badb5d6` |
| Governing issue | Issue #16 — closed as completed |

A new phase must create or confirm its governing issue, define its scope and stop gates, and claim this lock before modifying shared implementation paths.

## Phase 2C stable release record

Phase 2C completed through PR #15:

```text
verified PR head: 2e31df2233a63c39e4ef5df43a40a9683eef106e
merge commit:     bd8e937bf234cd894e04cc05935c7994e62c42be
```

Final exact-head evidence:

```text
Backend CI #112 — passed
artifact sha256: eb2ef088dcc5655dcc6ef864c29b7bfca78c48ecf971b5b1e1e4357ece842114

Operations Portal CI #38 — passed
artifact sha256: 3111922097ec7fda582c7f649687bd738a8f0eec5df37262ab584c6d888ff1b7

Documentation quality #272 — passed
artifact sha256: f9989fda65d229dbf1d4907d63d0c871d515ac7b0daeb53ef6dff4732a19343b
```

## Phase 3 stable release record

Phase 3 completed through PR #17:

```text
verified PR head: dab29ac118c3b695ab84f4fcd2ac96091e16052c
merge commit:     149f3b3aa24163ebb6a0b023283cf4a39badb5d6
Issue #16:        closed as completed
```

Final exact-head evidence:

```text
Backend/PostGIS CI #235 — passed
artifact sha256: cc730fb7a2c0fd590baeb810b8adc9de7c2413a3cf5dbdef0e6fb9a6aab2e554

Android CI #122 — passed
reports sha256: fb0c4d7742e248ea1f748b82c4b89228007466a0e222ca3f144a8864ed9859d5

Operations Portal CI #132 — passed
artifact sha256: 45ea34f050952da493bd2df09d6acafc98e045819cd83b55e7b55d1c452fd6e7

Documentation quality #450 — passed
artifact sha256: 360dd3e56d2e97d988f056db0f039b0dbc6c7a6e3bf217be07f03fc5945a27ee
```

Phase 3 delivered the first authenticated business-domain vertical slice:

1. customer profiles built on Phase 2C identities and sessions;
2. provider organizations separated from human identities;
3. provider-scoped representatives;
4. registered-business, qualified-individual and experienced-informal pathways;
5. fixed-premises, mobile and hybrid operating models;
6. versioned service categories and immutable activated requirements;
7. non-public provider drafts and validated internal state transitions;
8. server-enforced provider/object scope;
9. actor-attributed append-only audit coverage;
10. synthetic Android and operations-portal states;
11. an empty public-directory boundary that cannot publish a provider in Phase 3.

Two automated review findings were resolved and regression-tested before merge:

- activated or retired requirement versions now reject inserts, updates and deletes;
- customer-profile domain constraint failures return HTTP 400 rather than HTTP 500.

`build/android-v1` was fast-forwarded to the Phase 3 merge checkpoint without force-pushing and has zero divergence from `main`.

## Retained trust boundary

No provider profile may become publicly discoverable because an account exists, a profile is complete, a provider pays, an administrator edits a database row, or a client requests publication.

Public discoverability remains blocked until a later phase creates approved evidence-derived claims and an explicit publication policy. Phase 4 must not be inferred as active from the completion of Phase 3.

## Next claim procedure

Before Phase 4 or any other shared implementation work starts:

1. create or approve a governing issue;
2. define the exact scope, exclusions, security controls and exit gates;
3. confirm the stable `main` checkpoint;
4. synchronize the implementation branch;
5. change the current lock from `RELEASED` to `CLAIMED` with an owner, paths and expected handoff;
6. do not introduce real data, production credentials or public trust claims without their explicit gates.

## Conflict rule

A second agent must not modify paths reserved by a claimed lock. Read-only review is allowed. A stale or ambiguous lock must be resolved explicitly rather than overwritten by assumption.