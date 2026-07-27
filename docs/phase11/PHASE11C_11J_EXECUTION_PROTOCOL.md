# Phase 11C–11J Primary-Pilot Execution Protocol

**State:** EXECUTION READY / REAL ENTRY BLOCKED / NO PRIMARY-PILOT EVIDENCE  
**Governing issue:** #112  
**Readiness claim merge:** `e79d8c4794c27ee16deaefdb56856d97cd5933a5`  
**Production authorization:** false

## Goal

Provide one canonical, production-shaped protocol for executing Phase 11C–11J immediately after every applicable legal, privacy, provider, environment and owner gate is evidenced.

This document does not authorize recruitment or participant processing. `PILOT_ENTRY_APPROVED` remains false. No result in this package is `PRIMARY-PILOT` evidence.

## Execution sequence

```text
Entry gate evidence complete
→ owner records Wave 1 authorization
→ invite-only recruitment
→ current notice + explicit consent
→ 11C–11H bounded observations
→ daily safety/privacy/quality review
→ evidence classification
→ 11I canonical corrections and revalidation where needed
→ 11J STOP / REPEAT / NARROW / PROCEED decision
```

No stage may be skipped to create an optimistic exit result.

## Cohort and wave boundary

The server-enforced maximum per wave remains:

- at most 8 providers;
- at most 20 customers.

The approved Phase 11 maximum remains three waves, up to 24 providers and 60 customers in total. These are ceilings, not recruitment targets. The owner must record the actual approved Wave 1 count, categories, geography and pathway mix before the first invitation.

Wave 1 remains invite-only and bounded to Kabwata Ward and Chilenje Ward, Kabwata Constituency, Lusaka District, unless a later owner-approved narrowing is recorded. Manual area, landmark, Plus Code and list paths remain authoritative when Maps is disabled.

## Pre-entry requirements

Real execution is prohibited until the blocker register records evidence for every applicable hard gate:

1. Zambia DPC controller-registration outcome;
2. applicable overseas storage/transfer authorization for the exact real-data topology;
3. qualified Zambia privacy, consumer and marketplace review;
4. approved participant/provider notice and consent version;
5. approved retention, deletion, withdrawal and complaint wording;
6. final Wave 1 scope, owners, support window and incident contacts;
7. approved Firebase Zambia configuration and real auth canary;
8. approved private-storage, consent, withdrawal and deletion canary;
9. no unresolved critical or high entry defect;
10. explicit owner authorization with date and exact source/deployment identifiers.

A missing or ambiguous gate is a block, not an assumption.

## 11C — Provider cohort and real evidence validation

### Goal

Determine whether real providers can complete the canonical onboarding, evidence, verification, resubmission and publication lifecycle safely and with understandable trust claims.

### Required observations

- invitation accepted or declined;
- notice version and consent timestamp;
- onboarding started and completed;
- abandonment step and stated reason;
- evidence requested, submitted, rejected and resubmitted;
- evidence rejection reason comprehension;
- verification review and four-eyes decision time;
- publication eligibility and provider confirmation;
- trust-claim comprehension and misunderstanding;
- withdrawal, deletion or correction request;
- provider pathway: registered business, qualified individual or experienced informal provider.

### Metrics

- invitation-to-start rate;
- onboarding completion rate;
- abandonment rate by step;
- evidence first-pass acceptance rate;
- resubmission rate and cycles;
- median and maximum review turnaround;
- publication conversion rate;
- provider-reported comprehension and burden;
- privacy/support incidents.

### Exit condition

11C evidence is sufficient only when every participating provider has a terminal documented outcome and private evidence controls have no unresolved critical/high defect.

## 11D — Customer discovery, location and trust comprehension

### Goal

Determine whether customers can find an appropriate provider using list/manual location paths and accurately understand separate identity, evidence, service-area and recency claims.

### Required scenarios

- location permission granted;
- permission denied;
- no GPS or poor GPS;
- manual ward/area/landmark entry;
- fixed, mobile and hybrid provider service areas;
- reduced public precision;
- no-result and fallback path;
- comparison of two providers with different trust claims;
- comprehension of claim limitations and expiry/recheck language.

### Metrics

- successful discovery rate;
- time to usable result;
- permission-denial recovery rate;
- manual fallback completion rate;
- service-area mismatch rate;
- trust-claim comprehension score;
- false-inference count;
- accessibility or language blockers.

### Exit condition

No unresolved private-coordinate leak, location-authority ambiguity or material trust misunderstanding may remain.

## 11E — Enquiries, contact handoff, reviews and complaints

### Goal

Validate the canonical enquiry-to-interaction lifecycle without adding full chat or bypassing consent.

### Required observations

- enquiry creation and acknowledgement;
- provider response, decline or unanswered expiry;
- consented contact handoff where approved;
- consent expiry and revocation;
- interaction completion or cancellation;
- review eligibility and submission;
- complaint submission, acknowledgement, moderation and outcome;
- duplicate/idempotent requests and retry behavior.

### Metrics

- response rate and median response time;
- unanswered enquiry rate;
- contact-consent acceptance, expiry and revocation;
- interaction completion rate;
- review completion rate;
- complaint rate and resolution time;
- harassment, spam or moderation incidents.

### Exit condition

No contact disclosure without active consent, cross-account access, review-eligibility bypass or unresolved critical complaint defect may remain.

## 11F — Field verification and operations capacity

### Goal

Validate operational triage, evidence review, assignment, inspection where authorized, four-eyes approval, corrections, incidents, expiry/rechecks and audit capacity.

### Boundary

A field-visit claim remains disabled until a Zambia-based field lead is appointed, trained and explicitly authorized. A no-field-claim Wave 1 may proceed if all other entry gates pass.

### Metrics

- case intake and triage time;
- reviewer handling time;
- assignment wait time;
- inspection time and travel cost where authorized;
- four-eyes decision turnaround;
- queue age and backlog;
- support contacts per participant;
- correction/reopen rate;
- fraud, collusion and safety signals;
- staff hours and cost by case type.

### Exit condition

Capacity must be evidenced against the actual cohort. Any unsafe field practice, untraceable decision or unsupported public claim is a stop condition.

## 11G — Device, connectivity and reliability matrix

### Goal

Measure product reliability on representative Zambia Android devices and real network conditions.

### Required conditions

- Android API levels represented by the approved matrix;
- lower-memory and lower-storage device;
- small and large screens;
- intermittent mobile data;
- low bandwidth and high latency;
- app backgrounding and process restart;
- interrupted upload and retry;
- offline/manual location fallback;
- notification unavailable or denied;
- device clock/timezone variance where relevant.

### Metrics

- task success by device/network condition;
- crash/ANR count under approved telemetry boundary;
- interrupted-upload recovery rate;
- duplicate submission rate;
- data-loss count;
- median page/screen completion time;
- support intervention rate;
- battery/data/storage complaints.

### Exit condition

No reproducible data loss, authorization bypass, unrecoverable upload failure or critical device-family blocker may remain.

## 11H — Pricing and unit economics

### Goal

Measure willingness to pay and delivery cost without enabling real payment movement or linking payment to trust.

### Required evidence

- provider price preference and perceived fairness;
- customer willingness to pay where relevant;
- preferred billing channel and timing;
- registered, qualified and informal provider-pathway differences;
- verification review cost;
- field cost where applicable;
- support cost;
- acquisition/recruitment effort;
- infrastructure/provider cost allocation;
- expected recheck and complaint cost.

### Rules

- use interviews, scenario choices and non-binding price cards;
- do not create or complete a real payment intent;
- do not change verification, publication or ranking based on willingness to pay;
- record currency exactly as presented to the participant;
- separate one-time verification processing cost from recurring subscription hypotheses.

### Exit condition

The unit-economics record must show assumptions separately from observed values and must identify an owner-approved sustainable or intentionally subsidized pathway before `PROCEED` is considered.

## 11I — Evidence-led product corrections

Every finding must be classified as:

- **DEFECT:** intended behavior is broken;
- **ASSUMPTION:** product/operating hypothesis is contradicted or unproven;
- **REQUEST:** desired capability outside the approved current contract.

A legitimate correction must use canonical production code, normal migrations/API/client boundaries and full regression. No direct database fix, participant-specific hardcoding, duplicate pilot endpoint, fake trust state or client-only authorization is allowed.

## 11J — Exit decision

The decision board must choose exactly one:

- **STOP** — unsafe, unlawful, uneconomic or materially misunderstood;
- **REPEAT** — evidence is insufficient or corrections require another bounded wave;
- **NARROW** — continue with reduced geography, cohort, category, feature or operating model;
- **PROCEED** — Phase 12 release preparation is justified, subject to every global release gate.

`PROCEED` is prohibited when:

- any critical/high participant-safety, privacy, security or authorization issue remains;
- mandatory evidence classes are missing;
- legal/provider approvals are absent or conditional in a way that blocks the proposed release;
- unit economics or operations capacity are not evidenced;
- the decision relies on synthetic, secondary or sandbox evidence as a substitute for primary evidence.

## Evidence authority

Only observations from approved, consenting participants in the authorized real-pilot environment may be labelled `PRIMARY-PILOT`.

The following never qualify by themselves:

- synthetic seed data;
- CI or automated tests;
- Firebase Test Lab;
- managed provider canaries;
- sandbox payment transactions;
- secondary research;
- owner or agent predictions.
