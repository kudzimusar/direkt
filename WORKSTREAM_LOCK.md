# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED |
| Owner/agent | OpenAI GPT-5.6 Thinking — Phase 2B backend/data foundation agent |
| Phase | Phase 2B |
| Task | Create the NestJS and PostgreSQL/PostGIS foundation with migrations, health, OpenAPI and CI |
| Modules/paths | `backend/direkt-api`, `database`, `.github/workflows/backend-ci.yml`, `docs/backend`, `docs/architecture`, `docs/testing`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `RISK_REGISTER.md` |
| Claimed at | 2026-07-14 23:34 JST / 2026-07-14 14:34 UTC |
| Expected handoff | Reproducible backend workspace; clean PostGIS migration run; health/readiness and problem-details boundaries; OpenAPI artifact; tests/lint/typecheck/build green; Phase 2C authorized |
| Last clean checkpoint | `c97ea31e79f387f9c3ced3b4f6ac07d75296c1eb` |

## Phase 2B acceptance criteria

The active owner must:

1. preserve Issue #5 as a non-blocking later pilot gate;
2. create the NestJS workspace at `backend/direkt-api`;
3. pin Node.js, NestJS and TypeScript versions;
4. create strict configuration validation and safe development defaults;
5. implement `/api/v1/health/live` and database/PostGIS-backed `/api/v1/health/ready`;
6. establish request IDs, structured logging, validation and RFC 7807 problem details;
7. generate and validate OpenAPI;
8. create PostgreSQL/PostGIS local and CI infrastructure;
9. implement forward-only, checksummed, advisory-locked SQL migrations;
10. limit the first schema to platform audit, outbox and idempotency foundations;
11. add unit and database integration tests;
12. add backend CI for format, lint, typecheck, tests, build, migrations and OpenAPI;
13. retain test/coverage/OpenAPI artifacts;
14. avoid real authentication, production credentials, external providers and trust-claim creation;
15. create, verify and merge the checkpoint automatically when safe.

## Active safety boundaries

- No production Supabase or database connection.
- No committed `.env`, API key, password or service account.
- No real authentication or token issuance.
- No real provider, identity, credential, location or payment data.
- No regulator, map, SMS, Firebase or payment integration.
- No public provider onboarding or trust claim creation.
- Synthetic seeds only.

## Claim procedure

Before editing:

1. verify `main` and `build/android-v1` are synchronized;
2. inspect the approved backend/database documents;
3. replace the previous phase owner with the new owner and scope;
4. record the exact checkpoint and timestamp;
5. commit the lock transfer before broad implementation.

## Release procedure

After implementation:

1. run format, lint, typecheck, unit tests, database tests, build, migration and OpenAPI checks;
2. inspect the diff, dependency lock and generated artifacts;
3. update status, decisions, risks and handoff;
4. create and verify the checkpoint PR;
5. merge automatically only at the verified head;
6. confirm retained artifacts and clean migration evidence;
7. close only completed issues;
8. synchronize the implementation branch without force-pushing;
9. release or transfer the lock.

## Conflict rule

A second agent must not write to the listed paths while the lock is claimed. Read-only review is allowed. A stale lock must be resolved explicitly rather than overwritten by assumption.
