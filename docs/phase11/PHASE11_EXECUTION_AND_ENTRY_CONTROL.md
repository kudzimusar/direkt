# Phase 11 Controlled Pilot Execution and Entry Control

**Status:** ENTRY PREPARATION ACTIVE — REAL PARTICIPANT PILOT BLOCKED  
**Governing issue:** #112  
**Stable predecessor:** `369fc72581b3ed27920b8fc949e32cfedf1ad8d9`  
**Date (Asia/Tokyo programme timezone):** 2026-07-19

Repository checkpoint dates use the programme operating timezone, `Asia/Tokyo`. GitHub commit metadata is displayed in UTC and may therefore show the previous calendar date for work performed after midnight in Japan.

## Purpose

Phase 11 validates the production-shaped DIREKT product with a tightly bounded Zambia cohort. It does not rebuild the product and it does not create a pilot-only fork.

The canonical execution path remains:

```text
Native Android
  ↓
REST/OpenAPI
  ↓
NestJS domain modules
  ↓
PostgreSQL/PostGIS + private object storage
  ↓
Internal operations portal
```

All legitimate pilot corrections must land in this same codebase with normal authorization, audit, migration, API and regression controls.

## Current authorization state

Repository-side preparation, synthetic regression and protected-staging readiness are authorized.

Real-participant activity is not authorized yet. Do not recruit participants, collect real identity/evidence/contact/precise-location data, activate unrestricted invitations, move real money, or represent the pilot as running until every applicable entry gate below is explicitly evidenced.

## 11A — Entry gate and control plane

### Phase 10 predecessor

- [x] Phase 10 technical and managed exit evidence complete.
- [x] PR #111 merged final Phase 10 documentation promotion.
- [x] Temporary PR #98 closed unmerged.
- [x] Issue #41 closed as completed.
- [x] `main` and `build/android-v1` synchronized at `369fc72581b3ed27920b8fc949e32cfedf1ad8d9` before Phase 11 claim.

### Legal/privacy/processor gates

- [ ] Qualified Zambia privacy/data-protection review signed off.
- [ ] Controller/processor/joint-controller allocation approved.
- [ ] Required Data Protection Commission registration evidence recorded.
- [ ] Overseas storage/transfer authorization resolved for the exact Supabase/Google/Sentry/other processor topology used with real data.
- [ ] Pilot privacy notice and layered notices approved.
- [ ] Consent wording/version and withdrawal process approved.
- [ ] Retention/deletion/rights schedule approved for pilot data.
- [ ] Consumer/marketplace terms and complaint/redress wording reviewed.
- [ ] Tax/invoicing/payment classification reviewed for any commercial pilot activity.

### Pilot scope and ownership gates

- [ ] Exact named Lusaka neighbourhood/zone boundary approved; no city-wide inference.
- [ ] At least one credible alternative area/zone evaluated as required by the area decision record.
- [ ] Limited category set approved from evidence; provisional seed categories are not treated as final approval.
- [ ] Maximum customer/provider/operations cohort documented.
- [ ] Registered-business, qualified-individual and experienced-informal provider mix documented.
- [ ] Recruitment method and inclusion/exclusion criteria approved.
- [ ] Named pilot owner assigned.
- [ ] Named security/privacy owner assigned.
- [ ] Named support owner assigned.
- [ ] Named incident commander assigned.
- [ ] Support hours and escalation channels approved.
- [ ] Pause/stop criteria approved.
- [ ] Representative Android device/network matrix approved.
- [ ] Research-code/key custody and deletion owner approved.

### External-provider gates

- [ ] Maps usage, data flow, keys, restrictions, quotas/budgets, privacy and fallback approved for the exact pilot mode actually used.
- [ ] Error-monitoring/telemetry processors approved for real pilot data and configured to exclude protected content.
- [ ] OTP/communications provider approved before real delivery.
- [ ] Registry/authority access approved before automated or privileged use.
- [ ] Payment provider/legal gate approved before any real-money activity.

Unapproved integrations remain disabled, manual or synthetic. A cloud project or vendor account existing is not evidence that the runtime integration or legal/provider gate is complete.

## 11B — Production-shaped pilot data readiness

Do not create duplicate provider, verification, discovery, enquiry, interaction, review, complaint or subscription models.

Add a pilot-specific data structure only when the pilot operation proves it is necessary. Candidate needs include:

- immutable policy/notice versions;
- pseudonymous research codes separated from identity/contact lookup keys;
- cohort eligibility and consent/withdrawal state;
- pilot-scope configuration and feature gates;
- minimal validation metrics with no evidence/contact/precise coordinates in telemetry;
- retention/deletion jobs and withdrawal propagation.

Any implementation requires:

1. forward-only checksummed migration;
2. backend-owned authorization and state transition rules;
3. audit coverage;
4. OpenAPI update where applicable;
5. Android/portal use through the established API;
6. privacy/retention/threat-model updates;
7. negative authorization and deletion/withdrawal tests.

Do not implement speculative fields merely because they are listed as candidates.

## 11C–11H — Required real-pilot evidence

The following evidence is mandatory after entry authorization.

| Stage | Required evidence | Current status |
|---|---|---|
| 11C provider cohort | onboarding completion/abandonment, evidence rejection/resubmission, comprehension, turnaround, pathway differences | NOT STARTED — entry blocked |
| 11D discovery/trust | permission denial, manual/map fallback, service-area accuracy, reduced precision, trust-language comprehension | NOT STARTED — entry blocked |
| 11E interactions | enquiry completion, response/unanswered rates, consented handoff understanding, expiry/revocation, reviews, complaints | NOT STARTED — entry blocked |
| 11F operations | queue ageing, reviewer/field time, cost, capacity, safety, collusion/fraud risks, rechecks | NOT STARTED — entry blocked |
| 11G devices/network | low-end devices, Android versions, screens, memory/storage, intermittent connectivity, upload/restart recovery | NOT STARTED — entry blocked |
| 11H economics | willingness to pay, billing preference, pathway/category differences, verification/field/support/acquisition cost | NOT STARTED — entry blocked |

No synthetic test result may be substituted for these primary evidence classes.

## 11I — Evidence-led correction rule

Every finding follows:

```text
Evidence
→ classify defect / assumption / request
→ root cause
→ backend/domain contract first where required
→ forward migration
→ REST/OpenAPI
→ Android/portal
→ tests
→ protected staging
→ bounded pilot revalidation
```

Prohibited shortcuts:

- hardcoded pilot users;
- direct database status fixes;
- fake verification/claim states;
- client-only authorization;
- temporary duplicate endpoints;
- claim overrides outside approved policy;
- private data in logs/analytics/Sentry;
- Phase 12 rewrite debt.

## 11J — Exit decision

Phase 11 ends with exactly one evidence-backed recommendation:

- **STOP** — unsafe, uneconomic or materially misunderstood;
- **REPEAT** — insufficient evidence;
- **NARROW** — reduce geography/categories/features/operations;
- **PROCEED** — production-release preparation is justified.

The exit record must include:

- participant and consent summary;
- exact boundary and categories;
- device/network matrix;
- provider onboarding/evidence metrics;
- trust comprehension findings;
- enquiry/response/review/complaint metrics;
- verification turnaround and operations load;
- incidents, withdrawals and privacy events;
- Maps/location findings;
- pricing/willingness-to-pay and unit-cost evidence;
- staffing/capacity calculation;
- defects and accepted limitations;
- legal/provider approvals;
- explicit Phase 12 recommendation.

## Phase 12 boundary

Phase 12 is not authorized merely because repository-side Phase 11 preparation is complete. It begins only after the actual controlled pilot and global release gates support a `PROCEED` decision.

Until then, signed production release, Play public rollout, production traffic, unrestricted signup, production claims and real-money activation remain blocked.
