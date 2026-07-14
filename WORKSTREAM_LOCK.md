# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | UNCLAIMED |
| Owner/agent | — |
| Phase | Phase 1B |
| Task | Build and publish the synthetic interactive DIREKT prototype |
| Modules/paths | `prototype`, `docs/design`, `docs/product`, `docs/research`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `RISK_REGISTER.md` |
| Claimed at | — |
| Expected handoff | Interactive mobile-responsive prototype published on GitHub Pages; design documents synchronized; feedback findings recorded; Phase 2 authorization decision completed |
| Last clean commit | Use the current `build/android-v1` head after the Phase 1A secondary-research checkpoint is merged and synchronized |

## Phase 1B acceptance criteria

The active owner must:

1. read `SECONDARY_RESEARCH_BASELINE.md`, `design.md`, the screen inventory and trust documents;
2. claim this lock before broad writes;
3. build customer, provider and operations prototype flows using fictional data only;
4. display separate trust claims and all important states;
5. include fixed, mobile and hybrid provider examples;
6. include tracked enquiry and consent-aware call/WhatsApp handoff;
7. include offline, slow-network, loading, empty, permission-denied and error states;
8. publish the prototype through GitHub Pages;
9. record structured review findings and design corrections;
10. update status, decisions, risks and the Phase 1B exit decision;
11. create, verify and merge the checkpoint PR automatically when safe;
12. close completed issues and authorize only the exact next phase.

## Claim procedure

Before editing:

1. synchronize `build/android-v1` with the latest `main` checkpoint;
2. verify the working state and existing checks;
3. replace `UNCLAIMED` with `CLAIMED`;
4. record the agent, task, scope and timestamp;
5. commit the lock claim before broad implementation.

## Release procedure

After implementation:

1. run required checks;
2. inspect for real personal data, secrets and unsupported claims;
3. update documentation and `PROJECT_STATUS.md`;
4. create the checkpoint PR with the exact head;
5. verify CI, mergeability and unresolved comments;
6. merge automatically when safe;
7. close only issues whose acceptance evidence is complete;
8. synchronize the implementation branch;
9. release or transfer the lock with a precise handoff.

## Conflict rule

A second agent must not write to the listed paths while the lock is claimed. Read-only review is allowed. A stale lock must be resolved explicitly rather than overwritten by assumption.
