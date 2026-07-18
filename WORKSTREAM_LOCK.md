# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — Phase 11 entry preparation and controlled-pilot readiness |
| Owner/agent | OpenAI GPT-5.5 Thinking — Phase 11 controlled-pilot agent |
| Phase | Phase 11 — Controlled Zambia pilot and primary validation |
| Task | Complete every repository-side Phase 11 entry/readiness requirement, reconcile Maps/Sentry truth, prepare production-shaped pilot controls, and preserve explicit external stop gates until real pilot evidence exists |
| Modules/paths | `database`, `backend/direkt-api`, `android/direkt-app`, `admin/direkt-operations-portal`, `docs`, `.github`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `RISK_REGISTER.md` |
| Claimed at | 2026-07-19 after Phase 10 PR #111 promotion, Issue #41 closure and exact long-lived branch synchronization |
| Stable baseline | `369fc72581b3ed27920b8fc949e32cfedf1ad8d9` |
| Governing issue | Issue #112 |
| Real-pilot authorization | BLOCKED until the explicit legal/privacy/provider/ownership/cohort/consent/support/device/stop gates in `docs/phase11/HANDOFF_FROM_PHASE10.md` are satisfied |
| Expected handoff | Phase 11 may close only after an actually executed controlled pilot produces the required evidence and an explicit STOP / REPEAT / NARROW / PROCEED decision |

## Stable predecessor

Phase 10 completed through PR #111 and Issue #41.

```text
Phase 10 final managed source: 5d9313333c49d6501944e6ddba4cd408c540ff47
Phase 10 promotion merge:       369fc72581b3ed27920b8fc949e32cfedf1ad8d9
Issue #41:                      closed as completed
main/build/android-v1:          synchronized at promotion merge
```

## Phase 11 workstream

- 11A — entry gate, legal/privacy/consent/ownership and pilot control plane;
- Maps/Sentry — reconcile claimed external setup with the actual repository/runtime implementation;
- 11B — production-shaped pilot backend/data readiness without duplicate domain models;
- 11C — provider cohort/onboarding/real-evidence validation after entry authorization;
- 11D — customer discovery, location/Maps and trust-comprehension validation;
- 11E — enquiries, consented contact handoff, reviews and complaints;
- 11F — field verification and operations capacity;
- 11G — real-device/connectivity/reliability matrix;
- 11H — pricing and unit economics without premature real payments;
- 11I — evidence-led corrections in the canonical production codebase;
- 11J — exit evidence and STOP / REPEAT / NARROW / PROCEED Phase 12 decision.

## Entry boundary

Repository-side engineering, documentation, synthetic regression and protected-staging preparation are authorized.

The following remain prohibited until their explicit gates are evidenced:

- recruitment or processing of real pilot participants;
- real identity, qualification, contact, precise-location or evidence collection;
- unrestricted signup/invitations, public pilot promotion or production claims;
- unapproved Maps/geocoding, OTP/communications, registry or payment-provider operation;
- real-money movement;
- treating provisional Lusaka/category assumptions as approved pilot scope;
- claiming primary validation, legal sign-off, owner assignments or field results that have not actually occurred.

## Non-negotiable implementation controls

- Preserve all Phase 4–10 verification, publication, privacy, interaction, accountability, commercial, security and recovery invariants.
- Android and the operations portal use the canonical REST/OpenAPI backend; no client-only authorization or direct privileged database access.
- Reuse canonical provider, verification, discovery, enquiry, interaction, review, complaint and subscription entities.
- Add only production-compatible pilot controls that are genuinely required; no pilot-only duplicate business logic.
- Database changes are forward-only and checksummed; applied migrations are never edited.
- Exact private coordinates, real evidence, protected contact data and secrets never enter public repository artifacts or telemetry.
- Unapproved adapters fail closed and remain kill-switchable.
- Phase 12 production release is not authorized until Phase 11 real evidence and the global release gates support it.

## Conflict rule

No second agent may write to the listed Phase 11 paths while this lock is claimed. Read-only investigation is allowed. A stale or ambiguous lock must be resolved explicitly rather than overwritten by assumption.
