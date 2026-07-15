# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED |
| Owner/agent | OpenAI GPT-5.6 Thinking — Phase 4 verification/evidence agent |
| Phase | Phase 4 — verification and private evidence engine |
| Task | Implement separate verification cases, private evidence metadata/access, review/decision lifecycle, expiry degradation and derived scoped claims |
| Modules/paths | `database`, `backend/direkt-api`, `android/direkt-app`, `admin/direkt-operations-portal`, `.github/workflows`, `docs/trust`, `docs/security`, `docs/backend`, `docs/api`, `docs/android`, `docs/architecture`, `docs/testing`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `RISK_REGISTER.md` |
| Claimed at | 2026-07-15 17:10 JST / 2026-07-15 08:10 UTC |
| Expected handoff | Tested synthetic verification/evidence vertical slice; private storage adapter boundary; immutable evidence and decision history; scoped claims; automatic expiry degradation; green backend/Android/admin/docs CI; checkpoint merged automatically |
| Last clean checkpoint | `7736c0909130a3bfbbe993f26ecf28056a699315` |
| Governing issue | Issue #20 |

## Stable predecessor

Phase 3 completed through PR #17 and the stable programme record was updated through PR #18. The API/integration planning checkpoint was merged through PR #19.

```text
Phase 3 verified head: dab29ac118c3b695ab84f4fcd2ac96091e16052c
Phase 3 merge commit: 149f3b3aa24163ebb6a0b023283cf4a39badb5d6
Current clean checkpoint: 7736c0909130a3bfbbe993f26ecf28056a699315
```

`main` and `build/android-v1` were identical before this claim.

## Phase 4 objective

Create a bounded verification and evidence engine that supports private evidence submission, case review, corrections, resubmission, renewal, revocation, optional field visits, reasoned immutable decisions and evidence-derived scoped claims.

## Acceptance criteria

The active owner must:

1. preserve Phase 2C authentication/session/authorization and Phase 3 provider/category boundaries;
2. create forward-only checksummed database migrations for cases, evidence versions, assignments, review events, decisions, field visits, claims and expiry processing;
3. store only opaque private object references and safe metadata—never original evidence bytes in PostgreSQL or public output;
4. implement a storage adapter with a synthetic private implementation until dedicated Supabase infrastructure is connected;
5. require provider scope for submission and explicit reviewer/case scope for evidence access;
6. audit upload-session creation, evidence confirmation/view, assignment, recommendation, decision, correction, replacement, renewal and revocation;
7. enforce separation of duties so a reviewer cannot approve their own provider/submission and finance/commercial roles cannot decide verification;
8. reject invalid state transitions in application and database layers;
9. model evidence validity/expiry and deterministically degrade dependent claims;
10. derive scoped claims with what was checked, checked-at, expiry, evidence class, limitations and policy version;
11. never expose original evidence, identity numbers, signatures, private addresses or reviewer notes publicly;
12. add synthetic Android and operations-portal states with fictional metadata only;
13. update OpenAPI, architecture, security, trust, testing, decisions, risks and project status;
14. obtain green backend/PostGIS, Android, portal and documentation workflows on one reviewed exact head;
15. repair review findings with regression tests, merge automatically, close Issue #20 and synchronize the build branch.

## Non-negotiable stop gates

- No real evidence files or personal data.
- No production Supabase/storage credentials.
- No direct client access to private storage credentials.
- No blanket `verified provider` flag.
- No public discoverability from profile completion, payment, administrator action, direct database edits or client requests.
- No production field-agent, authority, map, OTP or payment integration.
- No public pilot or production deployment.

## Required regression evidence

At minimum, prove:

- provider A cannot read provider B evidence;
- a non-assigned reviewer cannot view a case/evidence item;
- a reviewer cannot approve their own provider or own submission;
- finance cannot recommend or decide verification;
- opaque evidence references never expose contact/document identifiers;
- evidence versions and decisions are append-only;
- invalid case/evidence/claim transitions fail;
- correction/replacement preserves history;
- revoked or expired evidence removes/degrades dependent claims;
- direct provider/payment/database state cannot create a public claim;
- public claim output contains scoped safe metadata and limitations only;
- Android/admin fixtures are synthetic and contain no real evidence.

## Conflict rule

A second agent must not modify the listed Phase 4 paths while this lock is claimed. Read-only review is allowed. A stale or ambiguous lock must be resolved explicitly rather than overwritten by assumption.