# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | UNCLAIMED |
| Owner/agent | — |
| Phase | Phase 2C next |
| Task | Identity, authentication-policy and operations-admin foundation |
| Modules/paths | `backend/direkt-api`, `database`, `admin/direkt-operations-portal`, `docs/backend`, `docs/architecture`, `docs/security`, `docs/testing`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `RISK_REGISTER.md` |
| Claimed at | — |
| Expected handoff | Identity/session/role contracts; synthetic verification adapters; object-scope authorization tests; operations portal shell; extended CI; no real OTP/evidence/vendor integration |
| Last clean checkpoint | Pending automatic merge of Phase 2B PR #13 after final exact-head checks |

## Phase 2B release record

Phase 2B delivered:

1. a Node.js 24/NestJS 11/TypeScript 5.9 workspace;
2. a committed npm lockfile installed with `npm ci`;
3. validated configuration, request IDs and structured logs;
4. RFC 7807-compatible problem details and OpenAPI;
5. PostgreSQL 18/PostGIS 3.6 local and CI infrastructure;
6. checksummed, advisory-locked, transactional forward migrations;
7. append-only audit, outbox and hashed idempotency foundations;
8. unit, HTTP and real PostGIS integration tests;
9. green format, lint, typecheck, migration, coverage, build and OpenAPI gates;
10. no real authentication, provider, evidence, trust, payment or production integration.

The lock is released for checkpoint promotion. It must be claimed again before Phase 2C implementation begins.

## Phase 2C preliminary acceptance boundary

The next owner must not begin until PR #13 is merged and `build/android-v1` is synchronized with `main`.

The bounded Phase 2C owner must:

1. define identity, contact, consent, session, role and assignment schemas;
2. implement authentication interfaces with synthetic development adapters only;
3. define short-lived access and revocable session policy;
4. enforce customer/provider/reviewer/field-agent/admin role boundaries;
5. add provider/object-scope authorization tests;
6. audit authentication and privileged actions;
7. create the Next.js operations-portal workspace and safe shell;
8. add CI for backend, admin and database changes;
9. avoid real OTP, evidence, verification decisions and production credentials;
10. create, verify and merge the checkpoint automatically when safe.

## Claim procedure

Before editing:

1. verify the latest stable checkpoint is merged;
2. synchronize `build/android-v1` without force-pushing;
3. inspect the approved Phase 2C issue and control documents;
4. replace `UNCLAIMED` with `CLAIMED`;
5. record owner, scope, timestamp and clean checkpoint;
6. commit the claim before broad implementation.

## Release procedure

After implementation:

1. run all phase-specific checks;
2. inspect the diff, migrations, dependency locks and artifacts;
3. update status, decisions, risks and handoff;
4. create and verify the checkpoint PR;
5. merge automatically only at the verified head;
6. close only completed issues;
7. synchronize the implementation branch without force-pushing;
8. release or transfer the lock.

## Conflict rule

A second agent must not write to the listed paths while the lock is claimed. Read-only review is allowed. A stale lock must be resolved explicitly rather than overwritten by assumption.
