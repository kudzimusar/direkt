# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | RELEASED — all currently repository-clearable Phase 12 preauthorization work complete |
| Owner/agent | None — lane available only for a new explicitly authorized task |
| Formal programme phase | Phase 11 remains open; formal Phase 12 production release is not authorized |
| Final implementation checkpoint | PR #140 merged to `main` at `8363e2196739f5bad2393eaa8896d4c43bd64e0f` |
| Branch synchronization | PR #143 history-synchronized `main` to `build/android-v1` after final implementation hardening |
| Governing issue | Issue #112 remains open |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates |
| Further repository-only Phase 12 work | None should be marked complete merely by adding documents, toggling assertions or generating synthetic evidence |

## Final hardened controls

- formal release eligibility is checked during Gradle configuration and cannot be bypassed by excluding the verification task;
- release runtime dependency inspection uses resolved selected targets and detects substitutions/project targets;
- merged release permissions include both `uses-permission` and `uses-permission-sdk-23`;
- permanent regression tests cover the high-risk release-policy bypasses;
- all five formal release eligibility assertions remain false in preauthorization;
- no production signing, Play publication, public traffic, participant/payment activation or production staffing claim was created.

## Remaining genuine gates

- real 11C–11H Zambia pilot evidence and 11J `PROCEED`;
- required regulatory/legal/privacy approvals and final live policy versions;
- production client cutover removing/isolation of synthetic preview surfaces;
- end-to-end account deletion;
- actual production environment and backup restore;
- operational support/verification/on-call staffing and production monitoring;
- authorized signed reproducible AAB, final Play declarations/assets/content rating and internal/closed testing;
- formal go/no-go, staged rollout and final release record.

## Conflict rule

A new agent may claim the lane only for an explicitly authorized next task and must update this file before overlapping writes. Read-only investigation is allowed.
