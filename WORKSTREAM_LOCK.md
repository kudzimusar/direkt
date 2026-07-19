# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — Phase 12A preauthorization release engineering |
| Owner/agent | OpenAI GPT-5.5 Thinking — Phase 12A release-readiness agent |
| Formal programme phase | Phase 11 — Controlled Zambia pilot and primary validation remains open |
| Authorized engineering scope | Phase 12A preauthorization — production-safe Android release configuration, versioning, reproducible unsigned AAB packaging and protected-signing contract |
| Task | Replace stale Phase 8 release identity with an auditable source-controlled preauthorization release contract; add strict version/signing validation; prove repeatable unsigned release packaging; keep real signing, Play upload, production traffic and Phase 12 authorization fail-closed |
| Modules/paths | `android/direkt-app`, `.github/workflows/phase12-release-readiness.yml`, `docs/phase12`, `docs/architecture`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `WORKSTREAM_LOCK.md` |
| Claimed at | 2026-07-19 after PR #128 synchronized the final Phase 12 preauthorization-readiness checkpoint |
| Stable baseline | `f78a151ea77ced886fa3cb7dc3c045c1f8dd3895` on `main`; `build/android-v1` has identical effective tree and is 0 behind |
| Governing issue | Issue #112 remains open; Phase 12A work is preauthorization engineering only |
| Real-pilot authorization | BLOCKED until the explicit legal/privacy/provider/ownership/cohort/consent/support/device/stop gates are satisfied |
| Production-release authorization | BLOCKED until real 11C–11H evidence, 11J `PROCEED`, and global release gates authorize formal Phase 12 |
| Expected handoff | Promote only the bounded Phase 12A engineering checkpoint; do not close Issue #112 or represent the unsigned/preauthorization release artifacts as production-ready distribution evidence |

## Stable predecessor

Phase 10 completed through PR #111 and Issue #41. Phase 11 repository-side synthetic/readiness engineering has been promoted through the current stable checkpoint, while real-participant execution remains externally gated.

```text
Phase 10 final managed source: 5d9313333c49d6501944e6ddba4cd408c540ff47
Phase 10 promotion merge:       369fc72581b3ed27920b8fc949e32cfedf1ad8d9
Phase 12A stable baseline:      f78a151ea77ced886fa3cb7dc3c045c1f8dd3895
Issue #112:                     open — real controlled-pilot evidence pending
```

## Phase 12A preauthorization workstream

Authorized now:

- replace the stale Phase 8 Android release identity with a deliberate, source-controlled preauthorization version contract;
- validate release version code/name/channel and package identity before building;
- define protected signing inputs and an explicit signing enable latch without committing keys, passwords, tokens or service-account material;
- keep default and PR release builds unsigned and non-publishable;
- build the release AAB twice from the same source/configuration and require byte-for-byte SHA-256 equality before accepting reproducibility evidence;
- package deterministic release metadata/checksums as short-lived CI evidence;
- document the release-workflow decision, security boundary, migration path and formal activation requirements.

Not authorized now:

- injecting a real upload key or production signing secret into repository-visible configuration;
- signing or distributing a production AAB;
- Play Console upload or internal/closed/production track activation;
- public Cloud Run/backend traffic;
- real Firebase participant invitations/OTP;
- changing `PILOT_ENTRY_APPROVED` or any production release latch;
- treating Phase 12A evidence as `PRIMARY-PILOT`, formal Phase 12 authorization or production release evidence.

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
- Release signing remains fail-closed: absence of the explicit enable latch or any required protected input must never silently fall back to a partially signed release.
- Public-repository CI must remain capable of proving the unsigned release contract with no production credentials.
- No release workflow may publish or change production traffic under the Phase 12A preauthorization label.
- Phase 12 production release is not authorized until Phase 11 real evidence and the global release gates support it.

## Conflict rule

No second agent may write to the listed Phase 12A paths while this lock is claimed. Read-only investigation is allowed. A stale or ambiguous lock must be resolved explicitly rather than overwritten by assumption.
