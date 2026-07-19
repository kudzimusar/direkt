# Phase 11 Synthetic Controlled Pilot Activation — 2026-07-19

**Status:** COMPLETE — SYNTHETIC / SYSTEM-METRIC FUNCTIONAL READINESS ONLY  
**Governing issue:** #112  
**Programme timezone:** Asia/Tokyo  
**Real-participant pilot:** NOT AUTHORIZED  
**Phase 12 formal authorization:** NOT GRANTED

## 1. Purpose and evidence boundary

This checkpoint activates a production-shaped, explicitly synthetic Phase 11 cohort so DIREKT can be exercised end to end without fabricating Zambia regulator approvals, legal opinions, participant consent, real-world trust comprehension, real-device observations or willingness-to-pay results.

The activation uses the canonical product architecture and state machines. It does not create a pilot-only provider, verification, discovery, enquiry, review, complaint or payment model.

Evidence from this checkpoint is classified only as:

- `SYNTHETIC` — deterministic demo/persona/state-machine fixtures;
- `SYSTEM-METRIC` — counts and invariants measured from the approved synthetic runtime;
- `ASSUMPTION` — pricing/device/market scenarios not observed from real participants.

Nothing in this checkpoint is `PRIMARY-PILOT` evidence.

## 2. Source-control and regression predecessor

Before adding the synthetic pilot, the current `main` branch was regression-audited.

A pre-existing Android dependency regression was found: the merged Dependabot bundle had failed Android CI, the Android performance budget and Phase 10 supply-chain security on its exact head. The project restored the last verified Android dependency/wrapper baseline before continuing.

Controlled repair:

- PR #118 — restore verified Android dependency baseline;
- merge checkpoint: `e21566deb3fc3a30baf3c6ca3539721416dc1e0a`;
- Android CI: green;
- Android performance budget: green;
- Phase 10 supply-chain security: green;
- documentation quality: green.

Synthetic activation implementation:

- PR #119 — bounded Phase 11 synthetic controlled pilot;
- reviewed exact implementation head: `bbbf5569cf39e5fa0b0f7cd30c9ddf5383474c0c`;
- promoted merge checkpoint: `7b886b9bee91c1337f4e4ad43f71afa4389644de`.

Exact-head gates before promotion were green for:

- backend formatter;
- ESLint;
- TypeScript typecheck;
- authorization-policy checks;
- migration checks;
- full backend test suite;
- backend build;
- OpenAPI contract check;
- backend container build/readiness;
- controlled staging container readiness;
- Phase 10 recovery/reliability;
- Phase 10 supply-chain security;
- Phase 11 synthetic controlled-pilot activation;
- documentation quality.

Codex review raised two valid P1 findings before promotion:

1. synthetic activation latches had to be explicitly present rather than defaulting to safe-looking values;
2. provider verification fixtures had to traverse the canonical evidence/review lifecycle rather than starting directly in review.

Both were fixed before merge. The final activator requires explicit `DIREKT_DATA_MODE=synthetic-only`, explicit `PILOT_ENTRY_APPROVED=false`, explicit activation opt-in, refuses production and refuses a non-empty participant/provider/interaction target.

## 3. Managed Supabase activation

Managed project:

- Supabase project: `direct-app`;
- project ref: `aeeuscifrxcjmnswqwnq`;
- region: `ap-northeast-1`.

Before activation the managed target contained:

- 0 DIREKT identities;
- 0 provider organizations;
- 0 enquiries.

The Phase 11 external-identity/invitation migration was then applied through the managed migration path and recorded in DIREKT's migration ledger.

Migration:

```text
202607190100_phase11_external_identity_binding.sql
```

Repository SHA-256:

```text
4693680a6ce8a68e970e5707c7e82dc59654fa13f1a6dd0b10f23165b4ee34bb
```

The migration added the privacy-minimized `account.external_identities` and `account.pilot_invitations` structures plus `pilot.invitations.manage` authorization. Synthetic activation deliberately created no rows in either table.

## 4. Synthetic cohort

The managed cohort exactly matches the approved maximum Phase 11 shape.

| Participant type | Wave 1 | Wave 2 | Wave 3 | Total |
|---|---:|---:|---:|---:|
| Providers | 8 | 8 | 8 | 24 |
| Customers | 20 | 20 | 20 | 60 |

Synthetic identities use deterministic `P11-DEMO-*` audit codes and deterministic UUID ranges. No raw phone number, email address, real identity document or real participant lookup key was created.

### Provider mix

Each approved category contains exactly:

- 2 registered-business fixtures;
- 2 qualified-individual fixtures;
- 2 experienced-informal fixtures.

Categories:

1. plumbing/water repair;
2. motor-vehicle mechanics;
3. electrical repair/services;
4. appliance/electronics repair.

Wave 1 contains four plumbing and four mechanics providers, satisfying the minimum-three-provider supply-before-demand rule for both active synthetic categories.

## 5. Synthetic policy and consent boundary

Synthetic-only policy record:

```text
policy_key: pilot_participation_notice
version: synthetic-demo-v1
```

This is not the legally approved real-participant notice.

Managed counts:

- 60 synthetic customer consent records;
- 24 synthetic provider consent records;
- 84 accepted synthetic consents total.

No real participant invitation, Firebase external identity or contact record was created.

## 6. Provider verification lifecycle — synthetic 11C/11F functional coverage

Each required provider claim traversed the production-shaped verification chain:

```text
draft
→ awaiting_evidence
→ completed synthetic upload-session metadata
→ evidence item/version marked clean and ready for review
→ case/evidence linkage
→ ready_for_review
→ independent reviewer assignment
→ assigned
→ in_review
→ reviewer recommendation
→ immutable verification.record_decision(...)
→ approved scoped claim
→ publication eligibility
```

Managed invariants:

| Artifact | Count |
|---|---:|
| Verification cases | 48 |
| Approved cases | 48 |
| Completed synthetic upload sessions | 48 |
| Approved synthetic evidence items | 48 |
| Clean evidence versions | 48 |
| Case/evidence links | 48 |
| Reviewer assignments | 48 |
| Reviewer recommendations | 48 |
| Immutable decisions | 48 |
| Active scoped claims | 48 |
| Published provider/category records | 24 |

The evidence object keys and hashes are synthetic metadata only. No corresponding Storage object was uploaded.

This proves state-machine integration and publication gating. It does not prove real provider onboarding completion, abandonment, evidence rejection/resubmission behavior, document quality or human comprehension.

## 7. Discovery/location/trust — synthetic 11D functional coverage

Synthetic providers include:

- Kabwata and Chilenje localities;
- mobile, fixed-premises and hybrid operating models;
- bounded synthetic service areas;
- scoped verification claims and limitations.

Runtime boundary remains:

- Google Maps: disabled/manual-first for Wave 1;
- precise-location permission: not required for core manual discovery;
- `field visited` or equivalent public claim: disabled;
- synthetic public-premises coordinates: fixture-only and not real addresses.

The managed database has 24 published providers after required-claim checks. Real customer trust-language comprehension and real service-area accuracy remain `PRIMARY-PILOT` work.

## 8. Enquiries, interactions, reviews and complaints — synthetic 11E coverage

Managed synthetic enquiry distribution:

| Enquiry state | Count |
|---|---:|
| Closed | 36 |
| Accepted / active | 12 |
| Declined | 6 |
| Received / unanswered | 6 |
| Total | 60 |

Tracked interactions:

- 36 completed;
- 12 active;
- 48 total tracked interactions.

Accountability-loop fixtures:

- 24 interaction-eligible reviews;
- 6 synthetic complaints;
- production call/WhatsApp delivery disabled;
- preferred contact channel kept at `none` in the seeded scenarios;
- no raw contact handoff data created.

These are deterministic workflow scenarios, not measured response rates or complaint rates.

## 9. Operations — synthetic 11F coverage

The synthetic run proves:

- reviewer assignment and independence controls execute;
- evidence state transitions execute;
- immutable decision/claim publication chain executes;
- enquiry lifecycle and tracked-interaction synchronization execute;
- review eligibility and complaint intake execute;
- audit records are produced;
- Wave caps and category/pathway mix are enforced by post-seed invariants.

Not activated:

- real field work;
- field travel/cost measurement;
- real support workload;
- real queue ageing/capacity observations;
- real safety events.

Managed invariant:

```text
field_visits = 0
```

## 10. Devices, connectivity and recovery — synthetic 11G coverage

The approved matrix remains:

- constrained/older supported Android;
- common mid-range Android;
- higher-capability/current Android;
- small screen and increased font/display scale;
- stable Wi-Fi/mobile data;
- slow/high-latency/intermittent conditions;
- location denied/unavailable;
- interrupted upload/retry;
- app/process restart recovery;
- low-storage/recovery conditions.

Synthetic/system evidence comes from the repository's Android/backend regression, performance, recovery, upload/idempotency and controlled-staging gates. The Android dependency baseline was explicitly repaired and revalidated before Phase 11 synthetic activation.

No real Zambia device/network observation is claimed. Formal 11G remains pending `PRIMARY-PILOT` evidence.

## 11. Pricing and unit economics — synthetic 11H model

No payment intent or real-money movement was created.

Managed invariant:

```text
payment_intents = 0
```

Scenario-only price bands retained for later interview testing:

- ZMW 50/month;
- ZMW 100/month;
- ZMW 150/month;
- ZMW 250/month.

These are `ASSUMPTION` values used to exercise pricing/unit-economics modelling only. They are not willingness-to-pay findings.

The later primary pilot must measure:

```text
verification reviewer minutes × labour cost
+ support minutes × labour cost
+ authentication/SMS cost
+ infrastructure allocation
+ field cost when activated
+ acquisition/activation effort
= estimated cost per activated provider
```

and compare that against real provider value perception and willingness to pay.

## 12. Privacy and storage invariants

Post-activation managed counts:

```text
identities                    85
customer profiles             60
provider organizations        24
accepted synthetic consents   84
account.contacts               0
account.external_identities    0
account.pilot_invitations      0
storage.objects                0
synthetic storage objects      0
field visits                   0
payment intents                0
```

Storage buckets remain private. Synthetic evidence metadata does not imply an uploaded file exists.

The post-activation Supabase security advisor produced no new finding against the Phase 11 external-identity/invitation tables or the synthetic cohort. Existing project-wide advisories about mutable function search paths, extensions in `public` and the intentionally inaccessible migration ledger remain separate hardening debt and were not introduced by this activation.

## 13. External integrations and runtime mode

The synthetic checkpoint intentionally preserves the previously approved integration boundaries.

| Integration | Synthetic Phase 11 state |
|---|---|
| Supabase/Postgres/PostGIS | Active managed synthetic data source |
| Supabase Storage | Buckets private; no synthetic evidence objects uploaded |
| Google Cloud / Cloud Run | Protected IAM-private staging/readiness retained; no public production traffic authorized |
| Firebase Auth | Backend/Android integration implemented and fail-closed; no real Firebase identities or invitations seeded |
| Google Maps | Disabled for Wave 1; manual/list/location fallback remains authoritative |
| Sentry | Disabled for real pilot data until separately approved/privacy-tested |
| Production WhatsApp/call delivery | Disabled |
| Cloudflare | No new Phase 11 runtime dependency introduced by this activation |
| Payments | Disabled; zero payment intents |
| Automated registry integrations | Not required; no synthetic result is treated as authority verification |

The existence of an integration account or cloud resource is not treated as approval to process real participant data.

## 14. 11I corrections performed during activation

The evidence-led correction rule was exercised before promotion.

### Finding S11-I-001 — Android dependency regression

- classification: regression defect;
- root cause: an unverified Dependabot multi-dependency/wrapper bundle had been merged despite failed permanent gates;
- correction: restore last verified Android/Gradle baseline;
- revalidation: Android CI, performance, supply-chain and docs gates green;
- promoted through PR #118.

### Finding S11-I-002 — implicit synthetic latches

- classification: trust-boundary defect found by review;
- root cause: missing environment variables could fall back to synthetic-looking defaults;
- correction: require explicit `synthetic-only`, explicit `PILOT_ENTRY_APPROVED=false`, explicit activation opt-in;
- revalidation: permanent negative CI guards pass;
- promoted through PR #119.

### Finding S11-I-003 — skipped verification lifecycle

- classification: synthetic coverage defect found by review;
- root cause: first activator revision created cases directly in review state;
- correction: traverse evidence upload metadata, evidence readiness, assignment, recommendation and decision lifecycle before publication;
- revalidation: 48 complete lifecycles in disposable CI and managed Supabase;
- promoted through PR #119.

### Finding S11-I-004 — stale Phase 11 test fixtures

- classification: regression-fixture defect;
- root cause: Firebase/pilot tests did not populate schema-required `published_at`; revoked-consent fixture did not populate `revoked_at`;
- correction: repair fixtures to match canonical schema constraints;
- revalidation: full backend suite green.

## 15. What this checkpoint closes

Closed for synthetic/engineering readiness:

- bounded 24-provider/60-customer cohort generation;
- three-wave structure;
- category/pathway mix;
- policy/consent fixture path;
- provider/evidence/verification/claim/publication chain;
- enquiry/interaction/review/complaint chain;
- fail-closed activation guards;
- managed Supabase Phase 11 schema activation;
- managed synthetic data activation;
- zero-real-contact/storage/payment/field-claim invariants;
- synthetic 11C–11H functional/model coverage;
- 11I correction loop for defects found during activation.

## 16. What remains open

This checkpoint does not close the formal Phase 11 real-pilot obligations.

Still pending:

1. DPC controller-registration evidence;
2. applicable DPC overseas storage/transfer authorization;
3. qualified Zambia legal/privacy/consumer sign-off;
4. final approved real participant notice/consent version;
5. approved real Firebase provider/configuration canary;
6. real private-storage/auth/deletion/withdrawal canary under approved real-pilot conditions;
7. actual Zambia `PRIMARY-PILOT` evidence for 11C–11H;
8. evidence-backed 11J `STOP / REPEAT / NARROW / PROCEED` decision.

## 17. Phase 12 boundary

Synthetic functional readiness does not authorize public production release.

Current programme truth:

```text
PHASE 11 INTERNAL SCOPE/OPERATIONS:       COMPLETE
PHASE 11 SYNTHETIC FUNCTIONAL READINESS: COMPLETE
PHASE 11 MANAGED SYNTHETIC ACTIVATION:   COMPLETE
PHASE 11 REAL-PARTICIPANT ENTRY:         EXTERNAL GATES PENDING
PHASE 11 PRIMARY 11C–11H EVIDENCE:       PENDING
PHASE 11J EXIT DECISION:                 PENDING
PHASE 12 FORMAL AUTHORIZATION:            NOT GRANTED
```

Engineering may continue against protected synthetic/staging paths, but signed production release, unrestricted signup, public production traffic, real verification claims, real-money activation and a formal Phase 12 `PROCEED` remain prohibited until the documented real-pilot exit gates are satisfied.
