# Phase 11 Controlled Pilot Wave Runbook

**State:** READY FOR OWNER USE AFTER REAL-ENTRY APPROVAL  
**Current authorization:** preparation only; no participant execution

## Roles

Before a wave is authorized, record named individuals for:

- pilot/product owner;
- privacy/security accountable owner;
- support owner;
- incident commander;
- reviewer/verification lead;
- Zambia field lead when field claims are in scope;
- independent four-eyes approver where required.

One person may hold multiple roles only where the approved operating model permits it and conflicts are recorded.

## Wave 0 — hard-gate preflight

The owner must complete and sign the blocker register. Required checks:

- legal/privacy/consumer review complete;
- DPC controller and overseas-transfer outcomes recorded as applicable;
- final notice/consent version active in the pilot database;
- Firebase Zambia configuration and real auth canary passed;
- private storage, consent, withdrawal and deletion canary passed;
- exact cohort, geography, categories and recruitment list approved;
- support hours, escalation contacts and incident procedure active;
- permitted integrations and disabled integrations recorded;
- exact deployment/image/source and database migration state recorded;
- zero unresolved critical/high entry defects;
- `PILOT_ENTRY_APPROVED=true` authorized through the protected process, never a casual local toggle.

If any item is false, missing or disputed, stop before invitations.

## Wave authorization record

Record:

- wave identifier;
- approval date/time and approver;
- exact source SHA and immutable deployment revision;
- database project/environment and migration checksum state;
- notice/consent version;
- maximum and actual provider/customer counts;
- approved geography and categories;
- provider pathway allocation;
- enabled/disabled communication, telemetry, Maps, AI and payment modes;
- support and incident contacts;
- scheduled start/end and daily review time.

## Invitation and admission

1. Create only owner-approved, invite-only invitations.
2. Confirm the contact-minimized invitation path and expiry.
3. Present the exact active notice before admission.
4. Require explicit consent bound to the notice version.
5. Confirm canonical DIREKT session creation; Firebase claims never grant DIREKT permissions.
6. Record admission outcome using a research identifier, not raw contact details.
7. Reject expired, revoked, duplicate, over-cap or wrong-wave invitations.

## Provider flow — 11C

For each provider:

1. observe onboarding without coaching unless the intervention is logged;
2. record completion/abandonment step and duration;
3. verify evidence remains private and access-scoped;
4. record evidence rejection/resubmission cycles and comprehension;
5. observe review/four-eyes lifecycle through canonical state transitions;
6. confirm public claims are check-specific, current and supported;
7. obtain provider confirmation before publication where required;
8. test correction, withdrawal and deletion handling;
9. close with a documented terminal outcome.

## Customer flow — 11D and 11E

For each approved customer task:

1. test location permission granted and denied as assigned;
2. test manual area/landmark fallback;
3. observe provider discovery and trust-claim interpretation;
4. create an enquiry through the canonical API;
5. observe response, decline or unanswered expiry;
6. test consented contact handoff only when the approved channel is active;
7. test consent expiry/revocation;
8. close or cancel the interaction;
9. test eligible review or complaint path;
10. record comprehension, task success and incidents.

## Operations flow — 11F

Daily operations must review:

- new and ageing verification cases;
- evidence access and audit history;
- assignment conflicts and reviewer independence;
- pending four-eyes decisions;
- support queue and unresolved complaints;
- privacy/consent/withdrawal/deletion requests;
- suspected fraud, collusion or safety issues;
- field activity only where an authorized field lead and claim type exist;
- staffing hours, handling time and direct cost.

No operator may directly edit a terminal trust state outside the canonical decision path.

## Device/network flow — 11G

Assign participants or controlled sessions across the approved matrix. For each condition, record:

- device model/API/screen/memory/storage class without unnecessary device identifiers;
- network type and observed quality;
- app version/source;
- task attempted and outcome;
- background/restart/interruption behavior;
- upload retry/recovery result;
- data loss, duplicate or authorization issue;
- support intervention.

## Pricing interview — 11H

Use non-binding scenarios only. Record:

- offered price/card exactly as shown;
- currency and billing period;
- acceptance, rejection or preferred alternative;
- reason and perceived fairness;
- provider pathway and service category;
- expected support/verification benefit;
- no payment intent or real transfer.

Payment status must not affect verification, publication or ranking.

## Daily close

At the end of each operating day:

1. reconcile invitations, consent, participants and withdrawals;
2. review all high/critical findings and incidents;
3. review private-data access and unexpected telemetry/provider payloads;
4. calculate current cohort and stage metrics;
5. back up only through approved private infrastructure;
6. confirm disabled integrations remain disabled;
7. record continue, pause or stop decision for the next day.

## Immediate stop conditions

Stop the affected flow or whole wave immediately for:

- any unconsented participant processing;
- cross-account authorization/session access;
- raw evidence, contact data or exact private-coordinate exposure;
- participant safety event or material legal/privacy breach;
- credential, token or secret exposure;
- unexpected real-money movement;
- unsupported verification/public trust claim;
- data corruption or unrecoverable participant data loss;
- inability to execute withdrawal/deletion obligations;
- regulator, counsel or provider instruction to stop.

## Mandatory pause conditions

Pause intake and review before resuming when:

- two or more high-severity incidents occur in one wave;
- repeated authentication/consent failure exceeds the owner-approved threshold;
- evidence upload or recovery failures recur across participants/devices;
- operations backlog exceeds the owner-approved age/capacity threshold;
- complaint, harassment or fraud pattern is emerging;
- a provider integration becomes unstable or changes terms/configuration;
- the actual cohort diverges from the approved scope.

Non-critical numeric thresholds must be written and owner-approved before Wave 1. They may not be invented after seeing results.

## End-of-wave review

Before another wave:

- freeze and verify the wave evidence register;
- classify every finding;
- resolve or accept every critical/high issue explicitly;
- calculate 11C–11H metrics and confidence limits where meaningful;
- identify missing evidence and participant withdrawals;
- decide STOP, REPEAT or NARROW for the next wave; `PROCEED` is reserved for 11J after the required pilot evidence;
- record any canonical 11I correction and exact revalidation evidence;
- obtain a new owner authorization for the next wave.
