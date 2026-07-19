# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — Phase 12B through all currently clearable Phase 12 preauthorization work |
| Owner/agent | OpenAI GPT-5.5 Thinking — Phase 12 release-readiness agent |
| Formal programme phase | Phase 11 remains open; formal Phase 12 production release is not authorized |
| Authorized engineering scope | Complete every Phase 12 deliverable that can be made repository-complete without real pilot evidence, qualified legal approval, real signing keys, Play Console publication, production traffic activation, or staffing claims |
| Immediate task | Phase 12B Play listing, permissions declarations and Data Safety inventory; then continue through production-readiness, monitoring/rollback/staged-rollout/release-package preparation that can be proven safely |
| Modules/paths | `android/direkt-app`, `.github/workflows`, `docs/android`, `docs/operations`, `docs/phase12`, `docs/legal`, `docs/architecture`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `WORKSTREAM_LOCK.md` |
| Claimed at | 2026-07-19 after Phase 12A closure and branch synchronization |
| Stable baseline | `main` at `7ce215979e1c585c107cee5c4b078010f05ecc28`; `build/android-v1` effective tree identical and 0 behind before this claim |
| Governing issue | Issue #112 remains open; Phase 12 work is preauthorization engineering only until Phase 11 exit supports `PROCEED` |
| Real-pilot authorization | BLOCKED pending external/legal gates and actual controlled Zambia pilot evidence |
| Production-release authorization | BLOCKED pending real 11C–11H evidence, 11J `PROCEED`, global release gates, signing/Play approvals and operational staffing |
| Expected handoff | Promote all safely clearable Phase 12 engineering checkpoints, document the exact residual external blockers, release this lock, and do not overclaim production authorization |

## Authorized work now

- repository-controlled Play store listing package and review instructions;
- Android permission inventory reconciled against the manifest and runtime implementation;
- Data Safety inventory mapped to actual app/backend/SDK behavior and privacy documentation;
- content-rating, target-audience, country/device and developer-account readiness checklists;
- account-deletion/privacy-policy readiness requirements without fabricating a public deletion endpoint;
- production backend/configuration readiness checks that do not change public traffic;
- release monitoring, rollback, incident, staged-rollout and stop-criteria preparation;
- support/verification staffing role and shift requirements as an unfilled readiness matrix, not a staffing claim;
- release notes/tagging/checksum/provenance templates and non-publishing CI validation;
- exact blocker matrix separating completed engineering from external/manual/legal/real-world requirements.

## Not authorized

- real upload-key material or production signing credentials;
- signed/distributed production AAB;
- Play Console internal, closed, open or production publication;
- public Cloud Run/backend traffic or unrestricted signup;
- real participant Firebase/OTP activation;
- real-money payment activation;
- claims that support/verification staffing is operational without named real staff/evidence;
- completion of 11C–11H or 11J without real Zambia pilot evidence;
- closure of Issue #112 or declaration that formal Phase 12 is complete.

## Non-negotiable controls

- Preserve all Phase 4–10 trust, privacy, security, commercial and recovery invariants.
- Android and portal remain on the canonical REST/OpenAPI backend; no privileged client/database shortcut.
- No secrets, real personal data, exact private coordinates or real evidence in public repository artifacts.
- Release signing remains fail-closed and publishing remains separately gated.
- Current Google Play requirements must be rechecked against official sources before any actual submission.
- Every promoted checkpoint requires exact-head tests, documentation, review, merge and history-preserving branch synchronization.

## Conflict rule

No second agent may write to the listed Phase 12 paths while this lock is claimed. Read-only investigation is allowed. A stale or ambiguous lock must be resolved explicitly rather than overwritten by assumption.
