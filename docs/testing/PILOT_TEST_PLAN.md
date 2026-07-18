# DIREKT Phase 11 Controlled Pilot Test Plan

**Status:** ENTRY PREPARATION — REAL PILOT NOT YET AUTHORIZED  
**Governing issue:** #112  
**Evidence register:** `../phase11/PILOT_VALIDATION_EVIDENCE_REGISTER.md`

## 1. Purpose

Validate the same production-shaped Android → REST/OpenAPI → NestJS → PostgreSQL/PostGIS/private-storage → operations-portal product under a tightly bounded Zambia pilot. The pilot exists to test assumptions and operating capacity, not to create a parallel implementation.

Synthetic tests remain regression evidence. They do not count as Phase 11 primary pilot evidence.

## 2. Entry criteria

All applicable criteria must be explicitly satisfied before recruitment or real participant processing:

- Phase 10 closeout complete and stable baseline identified;
- qualified Zambia legal/privacy/consumer findings recorded;
- controller/processor, Data Protection Commission registration and overseas storage/transfer requirements resolved as applicable;
- approved pilot privacy notice, participant agreement, consent/version, retention/deletion and withdrawal rules;
- exact pilot area and limited categories approved;
- bounded provider/customer/operations cohort and recruitment rules approved;
- named pilot, privacy/security, support and incident owners assigned;
- support hours, escalation and pause/stop process approved;
- approved private evidence/data handling systems and research-code custody;
- participant access/authentication path approved and implemented without weakening backend authorization;
- any Maps, telemetry, OTP/communications, registry or payment provider actually used approved for exact pilot use;
- representative device/connectivity matrix selected;
- critical regression, backup/restore, privacy and incident controls passed;
- distribution restricted to the approved cohort.

`PILOT_ENTRY_APPROVED=true` is only a technical latch and is never sufficient evidence by itself.

## 3. Cohorts

The approved cohort should cover the smallest sample capable of testing the agreed questions across:

- customers with differing local-service discovery habits;
- registered businesses;
- qualified individuals;
- experienced informal providers;
- fixed-premises, mobile and hybrid operating models;
- accessibility/digital-confidence needs where recruitment permits;
- reviewers, field staff, support and incident/operations roles.

Exact counts must be approved before recruitment. Do not invent or silently expand the cohort to meet a target.

## 4. Required scenarios

### 4.1 Provider journey

```text
Account
→ profile
→ category/service
→ operating model
→ private evidence
→ verification case
→ staff review
→ correction/resubmission
→ approved scoped claims
→ publication eligibility
```

Capture completion/abandonment, evidence rejection reasons, resubmission, comprehension, turnaround and pathway differences.

### 4.2 Customer discovery and trust

```text
Onboarding
→ area/location choice
→ category/search
→ list/map or manual fallback
→ provider profile
→ scoped trust claims + limitations
→ save/share
```

Test permission denial, manual landmark/area/Plus Code fallback where supported, low bandwidth, fixed/mobile/hybrid providers, reduced public precision and separate comprehension of identity, contact, business, qualification, location, field-visit, expiry and “not checked” language.

### 4.3 Enquiry and accountability loop

```text
Discovery
→ tracked enquiry
→ provider response
→ consented call/WhatsApp handoff where approved
→ interaction history
→ review eligibility
→ review/moderation
→ complaint/escalation where needed
```

Measure completion, response time, unanswered enquiries, handoff comprehension, consent expiry/revocation, review completion, moderation and complaints.

Do not add full chat merely because participants request it. Classify the request and determine whether the existing tracked handoff fails a validated need.

### 4.4 Operations and field workflow

Test queue triage, evidence review, assignment, inspection, four-eyes controls, correction/rejection, complaint, incident, expiry/recheck and audit.

Measure time per case, field travel/cost, availability, turnaround, queue ageing, operator capacity, evidence quality, safety and fraud/collusion indicators.

### 4.5 Pricing and unit economics

Research perceived value, acceptable price bands, billing preference and willingness to pay without moving real money unless a separately approved payment gate exists.

Keep payment state independent from verification, publication and ranking.

## 5. Device and connectivity matrix

The final matrix must name real devices/networks before pilot start. It must include representative variation across:

| Dimension | Required coverage |
|---|---|
| Android version | oldest supported/recruited device, mid-range installed base and current release where available |
| Hardware | low-memory/low-storage device, common mid-range device, higher-capability reference device |
| Screen/accessibility | small screen, larger screen, increased font/display scale and assistive needs where applicable |
| Network | stable Wi-Fi, stable mobile data, slow/high-latency mobile data, intermittent/dropout condition |
| Storage | adequate storage and near-low-storage condition |
| Location | permission granted, denied and unavailable/inaccurate |
| App lifecycle | cold start, background/foreground, process death/restart |
| Upload | normal, interrupted, retry and resumed/recreated session |

Record exact device model, Android version and network/provider privately where that combination could identify a participant; publish only the minimized matrix needed for product decisions.

## 6. Reliability and recovery checks

At minimum validate:

- cold-start usability;
- authentication/session recovery under the approved real provider;
- API timeout/retry behavior;
- no duplicate mutation after retry/idempotency replay;
- interrupted evidence upload recovery through the canonical logical-upload flow;
- process/app restart recovery;
- no private evidence in logs/crash/error telemetry;
- manual discovery when location is denied/unavailable;
- list/manual fallback when Maps is unavailable or disabled;
- consent revocation taking effect without stale contact grants;
- publication/trust expiry remaining deterministic;
- complaint/incident escalation under service degradation.

## 7. Metrics

Required evidence classes:

- task success and abandonment by journey;
- provider onboarding and evidence rework;
- trust interpretation/comprehension;
- search/discovery success and no-result behavior;
- enquiry completion, provider response and unanswered rate;
- handoff consent comprehension and revocation;
- review/complaint/moderation behavior;
- verification/field turnaround and queue ageing;
- support contacts and handling time;
- crash/ANR/error rate without PII leakage;
- device/network/recovery failures;
- privacy withdrawals and incidents;
- Maps/location fallback findings;
- willingness-to-pay evidence;
- verification, field, support and acquisition cost/staff effort.

All metrics require sample size and limitation notes. Small qualitative samples must not be presented as population estimates.

## 8. Immediate stop criteria

Pause affected processing immediately and escalate when any of the following occurs:

- unauthorized exposure of real identity evidence, raw contact data or exact private coordinates;
- authentication/authorization bypass or cross-provider/tenant data access;
- secret/token leakage into client, log, telemetry or public artifact;
- loss of required consent/legal/provider authorization;
- inability to honor a valid withdrawal/revocation or required processing restriction;
- critical/high security defect affecting pilot data or access;
- unapproved public exposure, unrestricted invitation or search indexing;
- real-money movement when payment activation is not explicitly approved;
- field activity creates an immediate safety risk or a serious safety incident occurs;
- trust wording or system behavior makes a materially false claim about what DIREKT verified;
- private evidence/storage/backup integrity can no longer be assured.

Restart requires documented containment, owner approval, corrective action and revalidation.

## 9. Operational pause/narrow criteria

The pilot owner must define numeric thresholds before entry for:

- verification queue age;
- unanswered enquiry backlog;
- support backlog/response time;
- field capacity/travel burden;
- crash/ANR/error rate;
- repeated upload/recovery failure;
- complaint/incident rate;
- evidence rejection/rework load;
- cost ceiling.

Do not invent these thresholds before owner/capacity evidence exists. Crossing an approved threshold must trigger pause, cohort freeze or scope narrowing according to the entry record.

## 10. Evidence handling

- use pseudonymous research/evidence IDs in repository artifacts;
- keep lookup keys, consent records, real evidence, recordings and exact private coordinates in approved private systems only;
- no raw participant data in GitHub issues, Actions artifacts or telemetry;
- distinguish observation, participant statement, system metric and interpretation;
- record contradictions and negative results;
- link engineering fixes to evidence IDs without exposing participant identity;
- do not retroactively change raw evidence to fit a decision.

## 11. Evidence-led correction loop

```text
Evidence
→ defect / assumption / request
→ root cause
→ canonical backend/domain change where required
→ forward migration
→ REST/OpenAPI
→ Android/portal
→ regression tests
→ protected staging
→ bounded pilot revalidation
```

No direct database corrections, fake statuses, client-only authorization, duplicate pilot endpoints or temporary claim overrides.

## 12. Exit

Phase 11 cannot close on repository readiness alone.

Required exit package:

- participant/consent summary;
- exact area/categories/cohort;
- device/network matrix;
- onboarding/evidence/trust/enquiry/operations results;
- support/moderation load;
- incidents/privacy withdrawals;
- Maps/location findings;
- pricing/unit economics;
- staffing/capacity model;
- unresolved defects and accepted limitations;
- legal/provider approvals;
- exact revalidated source checkpoint;
- explicit **STOP / REPEAT / NARROW / PROCEED** recommendation.

Only an evidence-backed `PROCEED` decision may authorize Phase 12 production-release preparation.
