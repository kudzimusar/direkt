# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | RELEASED — all currently repository-clearable Phase 12 preauthorization work complete |
| Owner/agent | None — implementation lane available only for a new explicitly authorized task |
| Formal programme phase | Phase 11 remains open; formal Phase 12 production release is not authorized |
| Completed engineering scope | Phase 12 preauthorization foundation, Phase 12A Android release engineering, Phase 12B Play/listing/permissions/Data Safety preparation, production-readiness matrices, staffing requirements, monitoring/rollback/staged-rollout contract, release package/runbook and fail-closed formal release eligibility latches |
| Stable implementation promotion | PR #136 merged to `main` at `c6bb694046b2fe8e82d3f745330447632169355c` |
| Branch synchronization | PR #137 forward-synchronized `main` to `build/android-v1` without file changes before documentary closeout |
| Governing issue | Issue #112 remains open; real controlled-pilot evidence and Phase 11 exit are still required |
| Real-pilot authorization | BLOCKED pending external/legal gates and actual controlled Zambia pilot evidence |
| Production-release authorization | BLOCKED pending real 11C–11H evidence, 11J `PROCEED`, global release gates, legal/regulatory evidence, production operations/staffing, signed artifact and actual Play testing/release evidence |
| Further Phase 12 repository-only work | None should be marked complete merely by adding documents, synthetic evidence or toggling latches; the remaining gates require genuine external or release-execution evidence |

## Completed Phase 12 preauthorization controls

- source-controlled Android release identity and fail-closed release channels;
- reproducible unsigned AAB packaging with exact-source provenance;
- protected upload-signing contract with injected-signing and configuration-cache defenses;
- source-controlled formal Phase 12/product/deletion/operations/Play eligibility latches, all false in preauthorization;
- Gradle release packaging blocked unless formal eligibility assertions are satisfied;
- repository-controlled Play listing candidate and asset/reviewer requirements;
- merged release manifest permission validation;
- current permission baseline `android.permission.INTERNET` only;
- implementation dependency allowlist coupled to Data Safety review;
- Firebase Authentication Data Safety inventory and no fabricated account-deletion/IARC/approval claims;
- production runtime readiness and explicit fail-closed traffic/payment boundaries;
- reusable managed restore/rollback/kill-switch/monitoring pattern evidence without production overclaim;
- support/verification staffing requirements without claiming staffing operational;
- monitoring, stop criteria, rollback and staged-rollout plan;
- release package/provenance/tag/notes contract and formal execution runbook;
- permanent CI truth gates for Play readiness and final Phase 12 preauthorization readiness;
- exact residual external/real-world blocker matrix.

## Remaining gates before formal Phase 12

1. Real 11C–11H controlled Zambia pilot evidence.
2. Evidence-backed 11J `PROCEED`.
3. DPC controller registration and applicable overseas storage/transfer authorization.
4. Qualified Zambia legal/privacy/consumer approval and final live policy/rights versions.
5. Evidence-led production Android client cutover removing/isolation of synthetic preview marketplace surfaces.
6. End-to-end account deletion including in-app and public web request paths plus backend fulfillment/audit/policy consistency.
7. Actual production backend/data boundary, production backup restore and approved pre-traffic validation.
8. Operational support/verification/on-call staffing and exercises.
9. Active/tested production monitoring and escalation routes.
10. Real Play developer-account/current policy verification, signed reproducible AAB, final declarations/assets/IARC, internal/closed testing and resolved findings.
11. Formal go/no-go, staged rollout and final tag/notes/release record.

## Non-negotiable controls

- Preserve all Phase 4–10 trust, privacy, security, commercial and recovery invariants.
- Android and the operations portal remain on the canonical REST/OpenAPI backend; no privileged client/database shortcut.
- No secrets, real personal data, exact private coordinates or real evidence in public repository artifacts.
- Release signing remains fail-closed and publishing remains separately gated.
- All five formal release eligibility latches remain false until their matching reviewed evidence exists.
- Current Google Play requirements must be rechecked from official sources on the actual release date.
- Issue #112 must remain open until the real controlled-pilot exit criteria are met.

## Conflict rule

A new agent may claim the implementation lane only for an explicitly authorized next task and must update this file before overlapping writes. Read-only investigation remains allowed. A stale or ambiguous lock must be resolved explicitly rather than overwritten by assumption.
