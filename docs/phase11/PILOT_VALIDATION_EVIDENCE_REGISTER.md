# Phase 11 Pilot Validation Evidence Register

**Status:** SYNTHETIC/SYSTEM READINESS RECORDED — PRIMARY-PILOT EVIDENCE EMPTY BY DESIGN  
**Governing issue:** #112  
**Rule:** Record only sanitized aggregate/pseudonymous evidence in GitHub. Real identities, contact values, evidence files, exact private coordinates, recordings, consent signatures and lookup keys stay in approved private systems.

## How to use this register

Each real-pilot evidence item receives an ID:

```text
P11-<STAGE>-<TYPE>-###
```

Synthetic/system readiness items use an explicit `S11-` prefix so they cannot be mistaken for participant evidence:

```text
S11-<STAGE>-<TYPE>-###
```

Evidence classifications:

- `PRIMARY-PILOT` — consented real participant/operation observation;
- `SYSTEM-METRIC` — measured from the approved runtime;
- `SYNTHETIC` — deterministic functional/state-machine fixture;
- `SECONDARY-OFFICIAL` — regulator/statistics/local-government/provider source;
- `ASSUMPTION` — not yet validated;
- `REQUEST` — participant preference, not automatically a requirement.

Every result must identify sample/cohort count, scope/version, observation versus interpretation, limitations and linked engineering action where applicable.

**Never copy synthetic numbers into a `PRIMARY-PILOT` row.**

## Entry authorization record

| Field | Evidence/status |
|---|---|
| Real-pilot authorization date | Pending |
| Approved real-entry checklist version | Pending final external gates |
| Qualified legal/privacy sign-off reference | Pending — private reference only |
| Controller/processor/transfer/storage approval reference | DPC controller filing draft; approval/transfer/storage references pending — private only |
| Real participant notice/consent version | Pending qualified review and final version ID |
| Synthetic notice version | `pilot_participation_notice` / `synthetic-demo-v1` — demo use only |
| Exact area decision | Approved internally: Kabwata Ward + Chilenje Ward, Lusaka; Matero comparison candidate |
| Exact category decision | Approved internally: plumbing, electrical, mechanics, appliance/electronics repair |
| Cohort cap and role mix | Approved: maximum 24 providers + 60 customers; three waves of max 8 + 20; 2/2/2 provider-pathway target per category |
| Named operational owners | Approved internally: Shadreck Kudzanai Musarurwa for bounded pilot accountable roles |
| Support/escalation/stop criteria | Approved internally |
| Approved device/network matrix | Approved as pilot test matrix; real recruited devices pending |
| Approved Maps/location mode | Wave 1 manual/list first; Maps disabled unless separately approved |
| Approved error-monitoring mode | Existing protected platform monitoring; Sentry disabled for real participant data until separately approved/privacy-tested |
| Approved OTP/communications mode | Firebase implementation complete; real provider/configuration/DPC canary pending; production WhatsApp/call disabled |
| Payment mode | Disabled; zero payment intents in synthetic activation |

## Synthetic managed activation checkpoint

**Evidence record:** `PHASE11_SYNTHETIC_CONTROLLED_PILOT_ACTIVATION_2026-07-19.md`  
**Implementation merge:** `7b886b9bee91c1337f4e4ad43f71afa4389644de`  
**Managed Supabase:** project ref `aeeuscifrxcjmnswqwnq`  
**Migration checksum:** `4693680a6ce8a68e970e5707c7e82dc59654fa13f1a6dd0b10f23165b4ee34bb`

| Synthetic evidence ID | Stage | Classification | Result | Limitation |
|---|---|---|---|---|
| S11-C-COHORT-001 | 11C | SYNTHETIC + SYSTEM-METRIC | 24 provider fixtures and 60 customer fixtures; exact 8+20 per wave | Not real recruitment/onboarding behavior |
| S11-C-MIX-001 | 11C | SYSTEM-METRIC | Each category has exactly 2 registered-business, 2 qualified-individual and 2 experienced-informal fixtures | Does not establish legality/availability of real providers |
| S11-C-VERIFY-001 | 11C/11F | SYSTEM-METRIC | 48 cases, upload sessions, evidence items/versions, case links, assignments, recommendations, decisions and active claims | Synthetic evidence metadata; no real document quality/rework |
| S11-D-PUBLISH-001 | 11D | SYSTEM-METRIC | 24 provider/category publications created only after required current claims existed | Does not measure human trust comprehension |
| S11-D-LOCATION-001 | 11D | SYNTHETIC | Kabwata/Chilenje plus mobile/fixed/hybrid location/service-area fixtures exercised; Maps remains disabled/manual-first | Synthetic coordinates/service areas are not real accuracy observations |
| S11-E-ENQUIRY-001 | 11E | SYSTEM-METRIC | 60 enquiries: 36 closed, 12 accepted/active, 6 declined, 6 received/unanswered | Deterministic scenarios, not market response rates |
| S11-E-ACCOUNTABILITY-001 | 11E | SYSTEM-METRIC | 48 tracked interactions, 24 eligible reviews, 6 complaints | Does not measure real moderation/complaint workload |
| S11-F-BOUNDARY-001 | 11F | SYSTEM-METRIC | 0 field visits; four-eyes reviewer lifecycle executed synthetically | No field time/cost/safety evidence |
| S11-G-REGRESSION-001 | 11G | SYSTEM-METRIC | Android baseline repaired before activation; backend/container/recovery/performance/security gates green on promoted source | Not real Zambia device/network evidence |
| S11-H-MODEL-001 | 11H | ASSUMPTION | Scenario bands ZMW 50/100/150/250 per month retained for later WTP testing; 0 payment intents | Not willingness-to-pay evidence |
| S11-P-PRIVACY-001 | Privacy | SYSTEM-METRIC | 84 synthetic consents; 0 contacts; 0 external identities; 0 real invitations; 0 Storage objects | Synthetic consent is not real informed consent |

## 11C — Provider cohort and evidence — PRIMARY-PILOT

| Evidence ID | Metric/observation | Result | Sample | Limitation | Action |
|---|---|---|---:|---|---|
| Pending | Provider onboarding completion | Pending | 0 | Real pilot blocked | None |
| Pending | Abandonment stage/reason | Pending | 0 | Real pilot blocked | None |
| Pending | Evidence rejection reasons | Pending | 0 | Real pilot blocked | None |
| Pending | Evidence resubmission rate | Pending | 0 | Real pilot blocked | None |
| Pending | Verification turnaround | Pending | 0 | Real pilot blocked | None |
| Pending | Registered/qualified/informal pathway differences | Pending | 0 | Real pilot blocked | None |
| Pending | Private evidence handling issues | Pending | 0 | Real pilot blocked | None |

Synthetic state-machine success above must not be used as an onboarding completion rate or verification turnaround result.

## 11D — Discovery, location and trust comprehension — PRIMARY-PILOT

| Evidence ID | Metric/observation | Result | Sample | Limitation | Action |
|---|---|---|---:|---|---|
| Pending | Manual area/landmark search success | Pending | 0 | Real pilot blocked | None |
| Pending | Precise-location permission denial recovery | Pending | 0 | Real pilot blocked | None |
| Pending | Map versus manual fallback comprehension | Pending | 0 | Maps intentionally disabled in Wave 1 | None |
| Pending | Fixed/mobile/hybrid service-area accuracy | Pending | 0 | Real pilot blocked | None |
| Pending | Public/private location comprehension | Pending | 0 | Real pilot blocked | None |
| Pending | Identity claim comprehension | Pending | 0 | Real pilot blocked | None |
| Pending | Business-registration claim comprehension | Pending | 0 | Real pilot blocked | None |
| Pending | Qualification claim comprehension | Pending | 0 | Real pilot blocked | None |
| Pending | Location/field-visit claim comprehension | Pending | 0 | Real pilot blocked; field claims disabled | None |
| Pending | “Not checked” limitation comprehension | Pending | 0 | Real pilot blocked | None |

## 11E — Enquiries, handoff, reviews and complaints — PRIMARY-PILOT

| Evidence ID | Metric/observation | Result | Sample | Limitation | Action |
|---|---|---|---:|---|---|
| Pending | Enquiry completion | Pending | 0 | Real pilot blocked | None |
| Pending | Provider response time | Pending | 0 | Real pilot blocked | None |
| Pending | Unanswered enquiry rate | Pending | 0 | Real pilot blocked | None |
| Pending | Call/WhatsApp consent comprehension | Pending | 0 | Production delivery adapter disabled | None |
| Pending | Consent expiry/revocation behavior | Pending | 0 | Real pilot blocked | None |
| Pending | Review completion | Pending | 0 | Real pilot blocked | None |
| Pending | Moderation workload | Pending | 0 | Real pilot blocked | None |
| Pending | Complaint rate/type | Pending | 0 | Real pilot blocked | None |

The 36/12/6/6 synthetic enquiry distribution is a test scenario mix, not a response or unanswered-rate finding.

## 11F — Operations and field capacity — PRIMARY-PILOT

| Evidence ID | Metric/observation | Result | Sample | Limitation | Action |
|---|---|---|---:|---|---|
| Pending | Queue triage time | Pending | 0 | Real pilot blocked | None |
| Pending | Evidence review time | Pending | 0 | Real pilot blocked | None |
| Pending | Field assignment/travel time | Pending | 0 | Field lead required | None |
| Pending | Field cost per case | Pending | 0 | Field lead required | None |
| Pending | Verification turnaround | Pending | 0 | Real pilot blocked | None |
| Pending | Queue ageing/SLA breaches | Pending | 0 | Real pilot blocked | None |
| Pending | Safety incidents/near misses | Pending | 0 | No real field activity | None |
| Pending | Collusion/fraud indicators | Pending | 0 | Real pilot blocked | None |
| Pending | Recheck/expiry workload | Pending | 0 | Real pilot blocked | None |

## 11G — Device, connectivity and reliability — PRIMARY-PILOT

| Evidence ID | Device/condition | Scenario | Result | Recovery behavior | Action |
|---|---|---|---|---|---|
| Pending | Low-end Android | cold start/navigation | Pending | Pending | None |
| Pending | Low memory/storage | evidence workflow | Pending | Pending | None |
| Pending | Small screen/font scale | core customer/provider tasks | Pending | Pending | None |
| Pending | Slow/intermittent network | API reads/writes | Pending | Pending | None |
| Pending | Interrupted upload | evidence upload retry | Pending | Pending | None |
| Pending | App restart/process loss | draft/upload recovery | Pending | Pending | None |
| Pending | Location denied | manual discovery fallback | Pending | Pending | None |
| Pending | Maps unavailable | list/manual fallback | Pending | Pending | None |

Automated Android/backend/recovery evidence is `SYSTEM-METRIC`; it does not replace recruited real-device evidence.

## 11H — Pricing and unit economics — PRIMARY-PILOT

| Evidence ID | Metric/observation | Result | Sample | Limitation | Action |
|---|---|---|---:|---|---|
| Pending | Perceived provider value | Pending | 0 | Real pilot blocked | None |
| Pending | Acceptable price band | Pending | 0 | Real pilot blocked | None |
| Pending | Billing-cycle preference | Pending | 0 | Real pilot blocked | None |
| Pending | Category/pathway differences | Pending | 0 | Real pilot blocked | None |
| Pending | Verification cost | Pending | 0 | Real operational labour not measured | None |
| Pending | Field visit cost | Pending | 0 | Field visits disabled | None |
| Pending | Support/moderation cost | Pending | 0 | Real workload not measured | None |
| Pending | Acquisition/activation friction | Pending | 0 | Real recruitment blocked | None |

Synthetic price bands are scenario inputs only and remain `ASSUMPTION`.

## Privacy, incident and withdrawal register — PRIMARY-PILOT

Only aggregate/sanitized real-pilot entries belong here.

| Evidence ID | Class | Count/severity | Resolution | Product/process effect |
|---|---|---|---|---|
| Pending | Consent withdrawal | 0 | Real pilot not started | None |
| Pending | Privacy request | 0 | Real pilot not started | None |
| Pending | Security incident | 0 | Real pilot not started | None |
| Pending | Safety incident | 0 | Real pilot not started | None |
| Pending | Complaint escalation | 0 | Real pilot not started | None |

Synthetic withdrawal/auth regression tests are system evidence and do not populate this real-participant register.

## 11I — Evidence-led correction log

| Finding ID | Evidence IDs | Classification | Root cause | Canonical change | Tests | Revalidation |
|---|---|---|---|---|---|---|
| S11-I-001 | CI/workflow evidence | Defect | Unverified Android dependency/wrapper bundle had been merged despite failed gates | Restored last verified Android dependency baseline in PR #118 | Android CI, performance, supply-chain, docs | Passed |
| S11-I-002 | Codex review | Defect | Synthetic activator allowed missing latch variables to fall back/default | Required explicit `synthetic-only`, explicit `PILOT_ENTRY_APPROVED=false`, explicit activation opt-in | Negative synthetic activation guards | Passed |
| S11-I-003 | Codex review | Coverage defect | First synthetic provider seed skipped evidence/review lifecycle and entered review directly | Added upload/evidence/link/assignment/recommendation lifecycle before decision/publication | Disposable PostGIS + managed Supabase invariants | Passed |
| S11-I-004 | Backend CI | Regression fixture defect | Phase 11 auth tests omitted schema-required policy/revocation fields | Repaired policy `published_at` and consent `revoked_at` fixtures | Full backend suite | Passed |

Rules remain:

- defects use the existing production architecture;
- assumptions are updated in decision/risk records;
- requests are not automatically features;
- no direct DB correction or client-only workaround for real cases;
- full chat, new payments or new trust claims require evidence and change control.

## 11J — Exit review

| Required decision input | Result |
|---|---|
| Participant/consent summary | Pending real participants; synthetic cohort recorded separately |
| Exact area/categories | Internally approved; real-pilot authorization pending |
| Device/network baseline | Synthetic/system matrix ready; real device evidence pending |
| Provider onboarding/evidence outcomes | Pending PRIMARY-PILOT |
| Trust comprehension | Pending PRIMARY-PILOT |
| Enquiry/response/review/complaint outcomes | Pending PRIMARY-PILOT |
| Operations/staffing capacity | Pending real operations |
| Incident/privacy/withdrawal outcomes | Pending real pilot |
| Maps/location outcome | Manual-first synthetic path retained; real findings pending |
| Pricing/unit economics | Scenario model only; real WTP/cost evidence pending |
| Unresolved critical/high defects | No known synthetic activation blocker at promoted checkpoint; real-pilot defects unknown |
| Accepted limitations | Synthetic evidence is non-primary; Maps/Sentry/prod comms/payments/field claims disabled |
| Legal/provider approvals | Pending external evidence |
| Recommendation | **Pending — STOP / REPEAT / NARROW / PROCEED** |

Phase 12 is not formally authorized while this real-pilot exit evidence remains pending.
