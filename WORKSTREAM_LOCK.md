# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED |
| Owner/agent | OpenAI GPT-5.6 Thinking — Phase 3 identity/provider/category core agent |
| Phase | Phase 3 |
| Task | Implement customer/provider account services, provider profiles, authorized representatives, operating models, category taxonomy and controlled drafts |
| Modules/paths | `backend/direkt-api`, `database`, `android/direkt-app`, `admin/direkt-operations-portal`, `.github/workflows`, `docs/product`, `docs/backend`, `docs/architecture`, `docs/android`, `docs/testing`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `RISK_REGISTER.md` |
| Claimed at | 2026-07-15 08:05 JST / 2026-07-14 23:05 UTC |
| Expected handoff | Tested synthetic identity/provider/category vertical slice; server-enforced provider scope; drafts and state transitions; no public discoverability or evidence-derived claims; green Android/backend/admin/docs CI; checkpoint promoted automatically |
| Last clean checkpoint | `bd8e937bf234cd894e04cc05935c7994e62c42be` |
| Governing issue | Issue #16 |

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

Issue #14 is closed. `build/android-v1` was fast-forwarded to the merge checkpoint before this Phase 3 claim.

## Phase 3 objective

Create the first bounded business-domain vertical slice on top of the Phase 2C identity and authorization foundation.

The vertical slice must support:

1. customer account application services built on authenticated identities;
2. provider profile creation as a non-public draft;
3. authorized provider representatives and provider-scoped assignments;
4. registered-business, qualified-individual and experienced-informal-provider pathways;
5. fixed-premises, mobile and hybrid operating models;
6. service-category taxonomy and versioned category requirements;
7. profile drafts with explicit, validated state transitions;
8. server-enforced provider/object scope on every mutation and query;
9. append-only audit events for profile, representative, category and state changes;
10. synthetic Android and operations-portal surfaces sufficient to exercise the bounded core;
11. migrations, OpenAPI, tests, documentation and exact-head CI evidence.

## Phase 3 acceptance criteria

The active owner must:

- preserve the Phase 2C authentication, session and deny-by-default authorization contracts;
- create provider-domain tables through forward-only checksummed migrations;
- keep provider organization identity separate from the human account identity;
- model one primary provider pathway explicitly rather than inferring it from missing evidence;
- model fixed, mobile and hybrid operations without exposing private location precision;
- version category and requirement definitions so later evidence cases retain historical meaning;
- prevent drafts, self-asserted profile fields or commercial state from becoming publicly discoverable;
- ensure provider-scoped roles cannot access another provider;
- reject invalid profile-state transitions at both application and database boundaries;
- write immutable audit events for sensitive changes;
- expose only bounded synthetic API contracts;
- add Android and portal states using fictional data only;
- retain backend, Android, portal and documentation artifacts;
- create, verify and merge the Phase 3 checkpoint automatically when every gate is green.

## Non-negotiable trust boundary

A provider profile may not become publicly discoverable because an account exists, a profile is complete, a provider pays, an administrator edits a database row, or the client requests publication.

Public discoverability remains blocked until Phase 4 creates approved evidence-derived claims and an explicit publication policy. Phase 3 may model a future publication state only as an unreachable or blocked state with tests proving the restriction.

## Explicit exclusions

- No real identity, contact, provider or customer data.
- No real evidence upload or evidence viewer.
- No verification case, approval, rejection or public trust claim.
- No production OTP, Firebase/Supabase Auth or privileged credentials.
- No payment, subscription, map, regulator or field-agent integration.
- No production backend, portal or Android deployment.
- No public provider discoverability.

## Required test evidence

At minimum, prove:

- unauthenticated account/provider operations are denied;
- a customer cannot mutate a provider without an assignment;
- a representative for provider A cannot read or mutate provider B;
- expired/revoked provider assignments are denied;
- client-tampered roles and provider IDs are ignored or rejected;
- invalid provider pathway and operating-model combinations fail;
- invalid profile state transitions fail;
- category requirement versions are immutable after activation;
- provider/profile changes create audit events;
- no endpoint or query returns a discoverable provider in Phase 3;
- all synthetic Android/admin states are clearly labelled and contain no real data.

## Release procedure

1. implement the bounded Issue #16 acceptance criteria;
2. run backend migrations, authorization tests, OpenAPI, Android, portal and documentation checks;
3. inspect migrations, dependency locks, artifacts and security boundaries;
4. update project status, decisions, risks and the phase handoff;
5. create the checkpoint PR;
6. repair all CI and review findings on the same branch;
7. merge automatically only at the verified exact head;
8. synchronize `build/android-v1` without force-pushing;
9. close Issue #16 only after all evidence is recorded;
10. activate Phase 4 only after Phase 3 is stable.

## Conflict rule

A second agent must not modify the listed Phase 3 paths while this lock is claimed. Read-only review is allowed. A stale lock must be resolved explicitly rather than overwritten by assumption.
