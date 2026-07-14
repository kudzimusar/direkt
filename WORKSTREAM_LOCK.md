# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED |
| Owner/agent | OpenAI GPT-5.6 Thinking — Phase 2C identity/auth/admin foundation agent |
| Phase | Phase 2C |
| Task | Identity, session policy, authorization and operations-portal foundation |
| Modules/paths | `backend/direkt-api`, `database`, `admin/direkt-operations-portal`, `.github/workflows`, `docs/backend`, `docs/architecture`, `docs/security`, `docs/testing`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `RISK_REGISTER.md` |
| Claimed at | 2026-07-15 00:24 JST / 2026-07-14 15:24 UTC |
| Expected handoff | Identity/contact/session/role contracts; synthetic challenge adapters; deny-by-default provider/object authorization; operations portal shell; backend/admin/database CI green; no real OTP/evidence/vendor integration |
| Last clean checkpoint | `3873b378787390ea757e44b6bd5af3a2daac080f` |

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

PR #13 merged at `3873b378787390ea757e44b6bd5af3a2daac080f`; Issue #12 is closed.

## Phase 2C acceptance criteria

The active owner must:

1. implement identity, contact, policy consent, session, role, permission and scoped-assignment schemas;
2. store only strong hashes of refresh/session secrets and authentication challenges;
3. model session expiry, rotation, revocation and reuse detection;
4. separate contact verification from provider/trust verification;
5. implement passwordless phone/email interfaces with synthetic local adapters only;
6. make challenge responses enumeration-safe and rate-limit ready;
7. implement deny-by-default permission policy and provider/object scope;
8. cover customer, provider owner/member/responder, field agent, reviewer, support, trust supervisor, finance, auditor and admin roles;
9. test wrong-provider, revoked-role, expired-session and client-tampered-role denial;
10. audit authentication, role changes and privileged actions;
11. create the Next.js/TypeScript operations-portal workspace and accessible safe shell;
12. prohibit direct portal database/storage access;
13. add backend, database and portal CI with retained artifacts;
14. avoid real OTP, evidence, verification decisions, production credentials and external vendors;
15. create, verify and merge the checkpoint automatically when safe.

## Active safety boundaries

- No real phone number, email address, account or provider identity.
- No production JWT/private signing key or identity-provider credential.
- No real SMS/email/OTP service.
- No Firebase/Supabase Auth production connection.
- No evidence upload/viewer or verification decision.
- No public provider/trust-claim creation.
- No direct portal database or object-storage connection.
- No production admin deployment.
- Synthetic fixtures only.

## Claim procedure

Before editing:

1. verify the latest checkpoint is merged and synchronized;
2. inspect Issue #14 and the authentication, role and portal architecture documents;
3. replace `UNCLAIMED` with `CLAIMED`;
4. record owner, scope, timestamp and clean checkpoint;
5. commit the claim before broad implementation.

## Release procedure

After implementation:

1. run all backend, migration, authorization and portal checks;
2. inspect the diff, migrations, dependency locks and artifacts;
3. update status, decisions, risks and handoff;
4. create and verify the checkpoint PR;
5. merge automatically only at the verified head;
6. close only completed issues;
7. synchronize the implementation branch without force-pushing;
8. release or transfer the lock.

## Conflict rule

A second agent must not write to the listed paths while the lock is claimed. Read-only review is allowed. A stale lock must be resolved explicitly rather than overwritten by assumption.
