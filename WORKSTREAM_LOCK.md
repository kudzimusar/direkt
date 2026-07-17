# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — Phase 10 managed-integration and approval closeout |
| Owner/agent | OpenAI GPT-5.6 Thinking — Phase 10 hardening agent |
| Phase | Phase 10 — Security, privacy, legal and reliability hardening |
| Task | Complete the remaining managed-environment, external-approval, review and promotion gates from `docs/phase10/HANDOFF_FROM_PHASE9.md` |
| Modules/paths | `database`, `backend/direkt-api`, `android/direkt-app`, `admin/direkt-operations-portal`, `docs`, `.github`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `RISK_REGISTER.md` |
| Claimed at | 2026-07-17 after stable Phase 9 promotion and branch synchronization |
| Last reviewed | 2026-07-18 after the exact repository/CI technical checkpoint |
| Exact technical checkpoint | `3a387e31626f0669f33ca464b428492694df8c32` — nine permanent workflows passed together |
| Expected handoff | Phase 11 may receive an active handoff only after exact-project managed activation, external approvals or explicit stop gates, final review, merge and synchronization |
| Last stable checkpoint | `4c78e2419aa4eca225495acaac8e7e0ee81903f1` |
| Governing issue | Issue #41 |
| Checkpoint PR | PR #42 |

## Stable predecessor

Phase 9 completed through PR #35 and Issue #34.

```text
Phase 9 exact reviewed head: 4a2694351b6c0fc03c63a1c97f463e0cb1d96e78
Phase 9 merge commit:       4c78e2419aa4eca225495acaac8e7e0ee81903f1
Issue #34:                  closed as completed
```

## Phase 10 delivery stages

- 10A — threat model and security architecture;
- 10B — authorization and tenant-isolation review;
- 10C — privacy, retention and legal controls;
- 10D — private storage and evidence-access validation;
- 10E — abuse, rate limiting and operational safeguards;
- 10F — reliability, recovery and performance;
- 10G — supply-chain, secret and configuration hardening;
- 10H — provider and authority approval package;
- 10I — validation, review and checkpoint promotion.

## Repository/CI technical checkpoint

The exact technical head `3a387e31626f0669f33ca464b428492694df8c32` passed these permanent workflows together:

- documentation quality;
- backend CI;
- backend container CI;
- operations portal CI;
- Android CI;
- controlled staging container readiness;
- recovery and reliability exercise;
- supply-chain security;
- Android performance budget.

This checkpoint proves the repository-side implementation and synthetic CI exercises. It does not prove the remaining managed-environment, legal or pilot-entry gates.

## Remaining lock scope

The Phase 10 lock remains claimed until all of the following are completed or explicitly stop-gated by the authoritative plan:

1. Exact DIREKT Supabase project `aeeuscifrxcjmnswqwnq` is exposed, activated and verified without substituting another project.
2. The exact reviewed source is merged to `main` and the manually approved private Cloud Run staging deployment passes readiness with immutable images, bounded identities and pinned secrets.
3. Managed restore, rollback, scale-to-zero, kill-switch, alerting and incident-tabletop evidence is recorded.
4. Protected Vercel Preview/Staging and Firebase internal-distribution evidence is completed or explicitly excluded through an approved plan decision.
5. Qualified Zambia legal, privacy, authority, payments, tax and provider evidence is recorded; unapproved adapters remain disabled.
6. PR #42 is reviewed and merged, Issue #41 is closed, and long-lived branches are synchronized without force-pushing.

## Non-negotiable boundaries

- No real participant/evidence data, real money movement, public pilot or production release.
- Synthetic-only managed development and IAM-protected staging may be used solely for Phase 10 verification.
- Preserve all Phase 4–9 verification, publication, privacy, interaction, accountability and commercial invariants.
- Production configuration must fail closed.
- Client state or supplied identifiers never establish authorization.
- Protected values must remain absent from source, logs, artifacts and clients.
- External provider, authority and legal approval must be evidenced rather than assumed.
- The dedicated DIREKT Supabase project remains inaccessible through the current connector; unrelated projects must not be modified.
- `docs/phase11/HANDOFF_FROM_PHASE10.md` remains a blocked draft and does not start Phase 11.

## Conflict rule

A second agent must not modify the listed Phase 10 paths while this lock is claimed. Read-only review is allowed. A stale or ambiguous lock must be resolved explicitly rather than overwritten by assumption.
