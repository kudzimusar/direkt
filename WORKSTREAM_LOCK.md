# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — repository/integration reconciliation and remote customer/provider PWA |
| Owner/agent | OpenAI GPT-5.5 Thinking — Issue #133 reconciliation/PWA workstream |
| Formal programme phase | Phase 11 remains open; formal Phase 12 production release is not authorized |
| Immediate scope | Reconcile current documentation/integration truth; preserve historical plans; publish and validate a synthetic customer/provider PWA at the canonical public web path |
| Stable promoted baseline | `main` at `8363e2196739f5bad2393eaa8896d4c43bd64e0f`; Phase 12 late hardening promoted in PR #140 and implementation lane synchronized through PR #143 |
| Governing issue | Issue #133; Issue #112 remains open for real Phase 11 pilot/exit evidence |
| Production-release authorization | BLOCKED |
| Expected closeout | PR #142 exact-head validation/review, promotion to `main`, Pages deployment verification at `direkt.forum/app/`, branch synchronization, status/lock closeout and Issue #133 evidence record |

## Prior-lock reconciliation

The previous lock for late Phase 12 release-policy hardening is complete: PR #140 merged to `main` and PR #143 history-synchronized `build/android-v1`. This workstream therefore claims the released lane without discarding any Phase 12 controls.

## Non-negotiable controls

- Preserve all Phase 4–12 trust, privacy, security, signing, Play and fail-closed release controls.
- The public PWA remains synthetic-only until a separately reviewed live-browser authentication/API security gate passes.
- Do not make the IAM-private API or operations portal public to connect the PWA.
- No real participant data, private evidence, exact private coordinates, contact release, payment activation or production provider credentials enter the public PWA.
- External provisioning is not runtime activation; integration status follows `docs/integrations/CURRENT_INTEGRATION_STATUS.md`.
- Android remains the primary Version 1 client and Play release target; the PWA is an additive companion.
- No production signing, Play publication, public production traffic, participant/payment activation or Issue #112 closure.

## Conflict rule

No second agent may write overlapping repository-reconciliation/PWA/control paths while Issue #133 holds this lock. Read-only investigation and non-overlapping external evidence gathering are allowed.
