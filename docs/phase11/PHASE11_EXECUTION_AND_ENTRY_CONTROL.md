# Phase 11 Controlled Pilot Execution and Entry Control

**Status:** INTERNAL 11A DECISIONS COMPLETE — REAL PARTICIPANT PILOT STILL EXTERNALLY BLOCKED  
**Governing issue:** #112  
**Stable predecessor:** `369fc72581b3ed27920b8fc949e32cfedf1ad8d9`  
**Current promoted baseline before this workstream:** `53e20e67a877f481fc94458d1d2ea62bf4e47b0f`  
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

Repository-side preparation, synthetic regression, protected-staging readiness and bounded pilot decisions are authorized.

Real-participant activity is still not authorized. Do not recruit participants, collect real identity/evidence/contact/precise-location data, activate unrestricted invitations, move real money, or represent the pilot as running until every remaining external entry gate below is explicitly evidenced.

The authoritative Phase 11A decisions are in:

- `PHASE11A_REAL_PILOT_ENTRY_DECISION_2026-07-19.md`;
- `PILOT_PRIVACY_CONSENT_RETENTION_BASELINE.md`;
- `PILOT_RECRUITMENT_AND_OPERATIONS_PROTOCOL.md`;
- `SECONDARY_EVIDENCE_SUBSTITUTION_MATRIX.md`.

## 11A — Entry gate and control plane

### Phase 10 predecessor

- [x] Phase 10 technical and managed exit evidence complete.
- [x] PR #111 merged final Phase 10 documentation promotion.
- [x] Temporary PR #98 closed unmerged.
- [x] Issue #41 closed as completed.
- [x] `main` and `build/android-v1` synchronized before Phase 11 claim.

### Legal/privacy/processor gates

- [ ] Qualified Zambia privacy/data-protection/consumer review signed off for the exact pilot wording and data flow.
- [x] Controller/processor/joint-controller allocation decided for the bounded pilot: individual-controller filing path for Shadreck Kudzanai Musarurwa; no joint controller planned; approved external services act as processors/sub-processors according to their actual role.
- [ ] Required Data Protection Commission controller-registration evidence recorded.
- [ ] Required overseas storage/transfer authorization recorded for the exact Supabase/Google/Firebase topology used with real data.
- [x] Pilot privacy/consent/withdrawal/retention baseline approved at product/operations level.
- [ ] Final participant/provider notice and consent wording receive qualified review and a version ID before recruitment.
- [x] Retention/deletion/rights operating schedule defined, subject to qualified review/DPC direction before real data.
- [ ] Consumer/marketplace terms and complaint/redress wording receive qualified review before real recruitment.
- [x] Real-money commercial activity removed from Phase 11 critical path; payments remain disabled. Any later commercial activity requires separate tax/invoicing/payment approval.

### Pilot scope and ownership gates

- [x] Exact bounded geography approved: Kabwata Ward + Chilenje Ward, Kabwata Constituency, Lusaka District; no city-wide inference.
- [x] Credible alternative evaluated: Matero Constituency retained as later stress/expansion candidate.
- [x] Limited categories approved for entry: plumbing/water repair, electrical repair/services, motor-vehicle mechanics, appliance/electronics repair.
- [x] Maximum cohort documented: 24 providers + 60 customers, in three waves of at most 8 providers + 20 customers.
- [x] Provider-pathway target documented per category: two registered businesses, two qualified individuals, two experienced informal providers where lawful and accurately represented.
- [x] Invite-only recruitment method and inclusion/exclusion/conflict criteria approved.
- [x] Named pilot/product owner assigned: Shadreck Kudzanai Musarurwa.
- [x] Named security/privacy accountable owner assigned: Shadreck Kudzanai Musarurwa for the bounded pilot.
- [x] Named support owner assigned: Shadreck Kudzanai Musarurwa for the bounded pilot.
- [x] Named incident commander assigned: Shadreck Kudzanai Musarurwa for the bounded pilot.
- [x] Support hours and escalation model approved: Mon–Fri 08:00–16:00 CAT; Sat 09:00–12:00 CAT; critical incidents outside normal hours.
- [x] Numeric pause/stop criteria approved in the recruitment/operations protocol.
- [x] Representative Android device/network matrix approved across low-end, mid-range, current Android, accessibility, degraded connectivity, denied location and lifecycle/recovery states.
- [x] Research-code/key-custody rule approved: repository stores only pseudonymous evidence IDs/aggregates; lookup keys, real evidence, recordings and precise private location remain in approved private systems under the privacy accountable owner.
- [ ] Zambia-based field operator/lead appointed and trained before any real `field visited` or equivalent claim is enabled.

### External-provider gates

Wave 1 minimizes the provider critical path rather than waiting for every optional integration.

- [x] Google Maps is **not required for Wave 1**; manual area/landmark/Plus Code and list paths remain authoritative. Maps runtime stays disabled until separately approved and tested.
- [x] Sentry is **not required for Wave 1**; it stays disabled for real pilot data until separately approved/privacy-canary tested. Existing protected platform logging/monitoring remains the initial observability boundary.
- [ ] Firebase phone authentication provider/data-flow configuration approved and implemented for real participants, including Zambia-only region policy, exact Android credentials/signatures, backend token verification, quotas/abuse controls, participant disclosure and applicable DPC overseas-transfer/storage approval.
- [x] Production call/WhatsApp delivery is not required for Wave 1; unapproved external communications delivery remains disabled.
- [x] Automated registry/authority integrations are not required for Wave 1; approved manual evidence/issuer review remains available.
- [x] Payment provider is not required for Phase 11; real-money movement remains disabled.

Unapproved integrations remain disabled, manual or synthetic. A cloud project or vendor account existing is not evidence that the runtime integration or legal/provider gate is complete.

### 11A real-entry decision

**Internal Phase 11A scope/operations decisions are complete.**

`PILOT_ENTRY_APPROVED=true` remains prohibited until the remaining external evidence exists:

1. applicable DPC controller registration;
2. applicable DPC overseas storage/transfer authorization for the exact real-data topology;
3. qualified Zambia review of final privacy/consent/consumer/marketplace wording;
4. approved final notice/consent version;
5. production-shaped participant authentication implementation and provider configuration;
6. private-storage/auth/deletion/withdrawal canary passes against the approved pilot environment.

The field-lead gate blocks field-visit claims, not the entire first wave, because Wave 1 can operate without field claims.

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

The following evidence is mandatory after external entry authorization.

| Stage | Required evidence | Current status |
|---|---|---|
| 11C provider cohort | onboarding completion/abandonment, evidence rejection/resubmission, comprehension, turnaround, pathway differences | NOT STARTED — external entry blocked |
| 11D discovery/trust | permission denial, manual/map fallback, service-area accuracy, reduced precision, trust-language comprehension | NOT STARTED — external entry blocked |
| 11E interactions | enquiry completion, response/unanswered rates, consented handoff understanding, expiry/revocation, reviews, complaints | NOT STARTED — external entry blocked |
| 11F operations | queue ageing, reviewer/field time, cost, capacity, safety, collusion/fraud risks, rechecks | NOT STARTED — external entry blocked; field claims separately blocked until field lead |
| 11G devices/network | low-end devices, Android versions, screens, memory/storage, intermittent connectivity, upload/restart recovery | NOT STARTED — external entry blocked |
| 11H economics | willingness to pay, billing preference, pathway/category differences, verification/field/support/acquisition cost | NOT STARTED — external entry blocked; no real payments required |

No synthetic or secondary-research result may be substituted for these primary evidence classes. See `SECONDARY_EVIDENCE_SUBSTITUTION_MATRIX.md`.

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
- Maps/location findings, including whether manual-first remains sufficient;
- pricing/willingness-to-pay and unit-cost evidence;
- staffing/capacity calculation;
- defects and accepted limitations;
- legal/provider approvals;
- explicit Phase 12 recommendation.

## Phase 12 boundary

Phase 12 is not authorized merely because Phase 11A internal decisions are complete. It begins only after the actual controlled pilot and global release gates support a `PROCEED` decision.

Until then, signed production release, Play public rollout, production traffic, unrestricted signup, production claims and real-money activation remain blocked.
