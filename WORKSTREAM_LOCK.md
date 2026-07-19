# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | RELEASED — Phase 12A preauthorization checkpoint complete |
| Owner/agent | None — implementation lane available for the next explicitly authorized task |
| Formal programme phase | Phase 11 — Controlled Zambia pilot and primary validation remains open |
| Completed engineering scope | Phase 12A preauthorization — production-safe Android release configuration, versioning, reproducible unsigned AAB packaging and protected-signing contract |
| Stable promotion | PR #129 merged to `main` at `48f6d2d212d64192819d76d67e157b25f8a5e98b` |
| Branch synchronization | PR #130 forward-synchronized `main` to `build/android-v1` without file changes |
| Governing issue | Issue #112 remains open; Phase 12A does not close Phase 11 |
| Real-pilot authorization | BLOCKED until the explicit legal/privacy/provider/ownership/cohort/consent/support/device/stop gates are satisfied |
| Production-release authorization | BLOCKED until real 11C–11H evidence, 11J `PROCEED`, and global release gates authorize formal Phase 12 |
| Next safe engineering candidate | Phase 12B preauthorization preparation of Play listing, permissions and Data Safety inventory; no Play submission or production activation without the governing gates |

## Phase 12A completion evidence

- Source-controlled Android preauthorization identity: `12` / `0.12.0-preauth.1` / `preauthorization`.
- Current preauthorization source cannot enable release signing.
- Future release-candidate/production packaging is fail-closed unless the protected DIREKT signing contract is explicitly enabled.
- Alternate Android Gradle Plugin injected-signing overrides are rejected.
- Protected signing requires configuration cache to be disabled before signing credentials are consumed.
- Keystore material must remain external to git and resolve outside the repository checkout.
- Exact source provenance is verified before release evidence is built.
- CI proves two clean release AAB builds are byte-for-byte identical.
- Verified unsigned AAB SHA-256: `890b710f18ad7208b6db0e5668193a739052e010462d0beeddb8f752c14dd169`.
- Exact Phase 12A head `468ab708b41b4b9ebcc0b6b007b613454caaee89` passed Android CI, Android performance, supply-chain/security, documentation and Phase 12A release-readiness gates.
- No real signing key was configured; no signed AAB, Play upload, public traffic change or real-participant activation occurred.

## Phase 11 workstream still pending externally

- 11C — provider cohort/onboarding/real-evidence validation after entry authorization;
- 11D — customer discovery, location/Maps and trust-comprehension validation;
- 11E — enquiries, consented contact handoff, reviews and complaints;
- 11F — field verification and operations capacity;
- 11G — real-device/connectivity/reliability matrix;
- 11H — pricing and unit economics without premature real payments;
- 11I — evidence-led corrections in the canonical production codebase;
- 11J — exit evidence and STOP / REPEAT / NARROW / PROCEED Phase 12 decision.

## Non-negotiable implementation controls

- Preserve all Phase 4–10 verification, publication, privacy, interaction, accountability, commercial, security and recovery invariants.
- Android and the operations portal use the canonical REST/OpenAPI backend; no client-only authorization or direct privileged database access.
- Database changes are forward-only and checksummed; applied migrations are never edited.
- Exact private coordinates, real evidence, protected contact data and secrets never enter public repository artifacts or telemetry.
- Release signing remains fail-closed and must never silently fall back to an unintended signed or unsigned artifact.
- Public-repository CI must remain capable of proving the unsigned release contract with no production credentials.
- No preauthorization workflow may publish to Play or change production traffic.
- Phase 12 production release is not authorized until Phase 11 real evidence and the global release gates support it.

## Conflict rule

A new agent may claim the implementation lane only for an explicitly authorized next task and must update this file before making overlapping writes. Read-only investigation remains allowed.
