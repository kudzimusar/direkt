# Phase 11 Controlled Pilot Execution and Entry Control

**Status:** SYNTHETIC FUNCTIONAL READINESS COMPLETE — REAL PARTICIPANT PILOT STILL EXTERNALLY BLOCKED  
**Governing issue:** #112  
**Stable predecessor:** `369fc72581b3ed27920b8fc949e32cfedf1ad8d9`  
**Current promoted synthetic implementation baseline:** `7b886b9bee91c1337f4e4ad43f71afa4389644de`  
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

Repository-side preparation, synthetic regression, protected-staging readiness, bounded pilot decisions and managed synthetic activation are authorized and complete.

Real-participant activity is still not authorized. Do not recruit participants, collect real identity/evidence/contact/precise-location data, activate unrestricted invitations, move real money, or represent the real pilot as running until every remaining external entry gate below is explicitly evidenced.

The authoritative Phase 11A decisions are in:

- `PHASE11A_REAL_PILOT_ENTRY_DECISION_2026-07-19.md`;
- `PILOT_PRIVACY_CONSENT_RETENTION_BASELINE.md`;
- `PILOT_RECRUITMENT_AND_OPERATIONS_PROTOCOL.md`;
- `SECONDARY_EVIDENCE_SUBSTITUTION_MATRIX.md`.

The authoritative synthetic activation evidence is:

- `PHASE11_SYNTHETIC_CONTROLLED_PILOT_ACTIVATION_2026-07-19.md`.

## Synthetic readiness checkpoint

Phase 11 synthetic activation was preceded by a regression-first audit.

A pre-existing Android dependency/wrapper regression was detected and repaired through PR #118 before any Phase 11 activation proceeded. The synthetic activator was then implemented, reviewed, regression-tested and promoted through PR #119.

Managed Supabase activation now contains exactly:

- 24 synthetic providers;
- 60 synthetic customers;
- 84 synthetic consent records;
- 48 complete evidence/reviewer/recommendation/decision/claim lifecycles;
- 24 published provider/category records;
- 60 enquiries: 36 closed, 12 accepted/active, 6 declined and 6 unanswered/received;
- 24 reviews;
- 6 complaints.

Privacy/runtime invariants remain:

- 0 `account.contacts`;
- 0 external Firebase identities;
- 0 real pilot invitations;
- 0 Storage objects;
- 0 field visits;
- 0 payment intents.

All of the above is `SYNTHETIC` or `SYSTEM-METRIC` evidence only. It must never be relabelled as `PRIMARY-PILOT` evidence.

## 11A — Entry gate and control plane

### Phase 10 predecessor

- [x] Phase 10 technical and managed exit evidence complete.
- [x] PR #111 merged final Phase 10 documentation promotion.
- [x] Issue #41 closed as completed.
- [x] Phase 11 work began from the controlled Phase 10 baseline.

### Legal/privacy/processor gates

- [ ] Qualified Zambia privacy/data-protection/consumer review signed off for the exact real-pilot wording and data flow.
- [x] Controller/processor/joint-controller allocation decided for the bounded pilot: individual-controller filing path for Shadreck Kudzanai Musarurwa; no joint controller planned; approved external services act as processors/sub-processors according to their actual role.
- [ ] Required Data Protection Commission controller-registration evidence recorded.
- [ ] Required overseas storage/transfer authorization recorded for the exact Supabase/Google/Firebase topology used with real data.
- [x] Pilot privacy/consent/withdrawal/retention baseline approved at product/operations level.
- [ ] Final participant/provider notice and consent wording receive qualified review and a real-participant version ID before recruitment.
- [x] Retention/deletion/rights operating schedule defined, subject to qualified review/DPC direction before real data.
- [ ] Consumer/marketplace terms and complaint/redress wording receive qualified review before real recruitment.
- [x] Real-money commercial activity removed from Phase 11 critical path; payments remain disabled.

### Pilot scope and ownership gates

- [x] Exact bounded geography approved: Kabwata Ward + Chilenje Ward, Kabwata Constituency, Lusaka District; no city-wide inference.
- [x] Credible alternative evaluated: Matero Constituency retained as later stress/expansion candidate.
- [x] Limited categories approved: plumbing/water repair, electrical repair/services, motor-vehicle mechanics, appliance/electronics repair.
- [x] Maximum cohort documented: 24 providers + 60 customers, in three waves of at most 8 providers + 20 customers.
- [x] Provider-pathway target documented per category: two registered businesses, two qualified individuals, two experienced informal providers where lawful and accurately represented.
- [x] Invite-only recruitment method and inclusion/exclusion/conflict criteria approved.
- [x] Named pilot/product owner assigned: Shadreck Kudzanai Musarurwa.
- [x] Named security/privacy accountable owner assigned: Shadreck Kudzanai Musarurwa for the bounded pilot.
- [x] Named support owner assigned: Shadreck Kudzanai Musarurwa for the bounded pilot.
- [x] Named incident commander assigned: Shadreck Kudzanai Musarurwa for the bounded pilot.
- [x] Support hours and escalation model approved: Mon–Fri 08:00–16:00 CAT; Sat 09:00–12:00 CAT; critical incidents outside normal hours.
- [x] Numeric pause/stop criteria approved.
- [x] Representative Android device/network matrix approved.
- [x] Research-code/key-custody rule approved.
- [ ] Zambia-based field operator/lead appointed and trained before any real `field visited` or equivalent claim is enabled.

### External-provider gates

Wave 1 minimizes the provider critical path rather than waiting for every optional integration.

- [x] Google Maps is **not required for Wave 1**; manual area/landmark/Plus Code and list paths remain authoritative. Maps runtime stays disabled until separately approved and tested.
- [x] Sentry is **not required for Wave 1**; it stays disabled for real pilot data until separately approved/privacy-canary tested.
- [x] Firebase phone-auth backend/Android implementation, token verification, invite-only admission, policy-version consent binding, phone-recycling protection and abuse gates are implemented and regression-tested.
- [ ] Firebase real-participant provider/configuration approval remains pending: Zambia SMS region policy, exact production signing credentials, provider quotas/abuse controls, participant disclosure, DPC overseas-transfer/storage approval and real auth canary.
- [x] Production call/WhatsApp delivery is not required for Wave 1; unapproved external communications delivery remains disabled.
- [x] Automated registry/authority integrations are not required for Wave 1; approved manual evidence/issuer review remains available.
- [x] Payment provider is not required for Phase 11; real-money movement remains disabled.

Unapproved integrations remain disabled, manual or synthetic. A cloud project or vendor account existing is not evidence that the runtime integration or legal/provider gate is complete.

### 11A real-entry decision

**Internal Phase 11A scope/operations decisions and technical synthetic readiness are complete.**

`PILOT_ENTRY_APPROVED=true` remains prohibited until the remaining real-entry evidence exists:

1. applicable DPC controller registration;
2. applicable DPC overseas storage/transfer authorization for the exact real-data topology;
3. qualified Zambia review of final privacy/consent/consumer/marketplace wording;
4. approved final real-participant notice/consent version;
5. approved real Firebase provider/configuration and participant-auth canary;
6. private-storage/auth/deletion/withdrawal canary under the authorized real-pilot environment.

The field-lead gate blocks field-visit claims, not the entire no-field-claim first wave.

## 11B — Production-shaped pilot data readiness

Do not create duplicate provider, verification, discovery, enquiry, interaction, review, complaint or subscription models.

Completed production-shaped readiness work includes:

- [x] canonical policy/notice version structure already exists;
- [x] privacy-minimized external identity binding added;
- [x] invite-only pilot invitation structure added;
- [x] canonical consent records bound to policy versions;
- [x] synthetic cohort uses the existing provider, verification, discovery, interaction, review and complaint domains;
- [x] synthetic activation uses the existing `verification.record_decision(...)`, publication refresh and enquiry transition state machines;
- [x] fail-closed activation guards prevent accidental production/real-pilot seeding;
- [x] negative and regression tests cover auth, invitation, withdrawal and synthetic activation boundaries;
- [x] managed migration applied with repository checksum `4693680a6ce8a68e970e5707c7e82dc59654fa13f1a6dd0b10f23165b4ee34bb`.

Any further pilot-specific implementation still requires:

1. forward-only checksummed migration where schema changes are necessary;
2. backend-owned authorization and state transition rules;
3. audit coverage;
4. OpenAPI update where applicable;
5. Android/portal use through the established API;
6. privacy/retention/threat-model updates;
7. negative authorization and deletion/withdrawal tests.

Do not implement speculative fields merely because they are listed as candidates.

## 11C–11H — Required real-pilot evidence

Synthetic functional/model coverage is now complete enough to exercise the current architecture, but the mandatory primary evidence classes remain open.

| Stage | Synthetic/system readiness | Mandatory real evidence status |
|---|---|---|
| 11C provider cohort | 24 providers; exact 2/2/2 category/pathway mix; 48 complete verification lifecycles; 24 publications | `PRIMARY-PILOT` onboarding, abandonment, rework, comprehension and turnaround NOT STARTED — external entry blocked |
| 11D discovery/trust | Kabwata/Chilenje, mobile/fixed/hybrid fixtures, manual-first mode, scoped claims and limitations | `PRIMARY-PILOT` permission denial, service-area accuracy and trust-language comprehension NOT STARTED |
| 11E interactions | 60 enquiries, 48 tracked interactions, 24 reviews, 6 complaints across controlled states | Real response rates, handoff comprehension, review/complaint behavior NOT STARTED |
| 11F operations | Evidence/reviewer/decision/audit lifecycle exercised; field visits remain zero | Real reviewer/field/support time, cost, capacity, safety and fraud/collusion evidence NOT STARTED |
| 11G devices/network | Android/backend regression, recovery/performance and approved device-condition matrix retained | Real Zambia devices/networks/recovery observations NOT STARTED |
| 11H economics | Scenario-only price/cost model retained; payment intents remain zero | Real willingness-to-pay, billing preference and unit-cost evidence NOT STARTED |

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

The synthetic activation already exercised this rule for:

- a pre-existing Android dependency regression;
- implicit synthetic activation latches;
- an initial synthetic verification path that skipped evidence/review lifecycle stages;
- stale Firebase/pilot regression fixtures.

All four were corrected before or during the promoted synthetic checkpoint and revalidated through permanent gates.

Prohibited shortcuts remain:

- hardcoded real pilot users;
- direct database status fixes for real cases;
- fake real verification/claim states;
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

Synthetic functional readiness alone cannot produce the 11J recommendation.

## Phase 12 boundary

Phase 12 is not authorized merely because Phase 11 synthetic activation is complete. It begins formally only after the actual controlled pilot and global release gates support a `PROCEED` decision.

Until then, signed production release, Play public rollout, production traffic, unrestricted signup, real production verification claims and real-money activation remain blocked. Protected engineering and synthetic/staging readiness may continue without relabelling that work as formal Phase 12 release authorization.
