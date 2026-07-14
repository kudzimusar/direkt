# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED |
| Owner/agent | OpenAI GPT-5.6 Thinking — Phase 1B prototype agent |
| Phase | Phase 1B |
| Task | Build, validate and publish the synthetic interactive DIREKT prototype |
| Modules/paths | `prototype`, `scripts/build_pages_source.py`, `docs/design`, `docs/product`, `docs/research`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `RISK_REGISTER.md` |
| Claimed at | 2026-07-14 22:33 JST / 2026-07-14 13:33 UTC |
| Expected handoff | Interactive mobile-responsive prototype published on GitHub Pages; design specifications synchronized; structured review recorded; Phase 2 namespace and authorization decision completed |
| Last clean checkpoint | `main` merge `8035e7d16d43dc3e59e91c4a5c5a13630a8fb802`; synchronized into `build/android-v1` through PR #8 |

## Phase 1B acceptance criteria

The active owner must:

1. read `SECONDARY_RESEARCH_BASELINE.md`, `design.md`, the screen inventory and trust documents;
2. build customer, provider and operations prototype flows using fictional data only;
3. display separate trust claims and all important states;
4. include fixed, mobile and hybrid provider examples;
5. include tracked enquiry and consent-aware call/WhatsApp handoff;
6. include offline, slow-network, loading, empty, permission-denied and error states;
7. publish the prototype through GitHub Pages;
8. record structured review findings and design corrections;
9. update status, decisions, risks and the Phase 1B exit decision;
10. create, verify and merge the checkpoint PR automatically when safe;
11. close completed issues and authorize only the exact next phase.

## Active safety boundaries

- Synthetic people, businesses, documents, reviews and coordinates only.
- No working submission to a backend or third-party form.
- No real phone number or WhatsApp destination.
- No claim that verification, payments or regulator integrations are implemented.
- No public identity documents, certificates, credentials or private locations.

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
