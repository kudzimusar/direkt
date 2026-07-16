# DIREKT Project Status

**Updated:** 2026-07-16  
**Authoritative branch:** `main` for stable checkpoints  
**Implementation branch:** `build/android-v1`  
**Current programme state:** Phase 6 Android provider workspace is complete and stable. Phase 7 operations portal and field workflow is active under Issue #28.

## Current phase

| Item | State |
|---|---|
| Repository and planning baseline | Complete |
| GitHub Pages documentation site | Operational |
| Phase 1A secondary-research baseline | Complete with accepted limitations |
| Phase 1B synthetic prototype | Complete; Issue #6 closed |
| Phase 2A native Android foundation | Complete; PR #11 merged and Issue #10 closed |
| Phase 2B backend/PostGIS foundation | Complete; PR #13 merged and Issue #12 closed |
| Phase 2C identity/auth/admin foundation | Complete; PR #15 merged and Issue #14 closed |
| Phase 3 identity/provider/category core | Complete; PR #17 merged and Issue #16 closed |
| API/integration planning checkpoint | Complete; PR #19 merged |
| Phase 4 verification and private evidence engine | Complete; PR #21 merged and Issue #20 closed |
| Phase 5 Android customer discovery | Complete; PR #24 merged and Issue #23 closed |
| Phase 6 Android provider workspace | Complete; PR #26 merged and Issue #25 closed |
| Phase 7 operations portal and field workflow | Active; Issue #28 |
| Deferred Zambia pilot validation | Open as non-blocking Issue #5 |
| Firebase tester distribution | Installed but intentionally deferred |
| Public pilot | Not authorized |

Issue #28 is the sole active implementation tracker. Issue #5 remains a deliberate later validation obligation and is not a current implementation blocker.

## Stable checkpoint record

| Phase | Pull request | Stable merge commit | Governing issue |
|---|---:|---|---:|
| Phase 2A Android foundation | #11 | `c97ea31e79f387f9c3ced3b4f6ac07d75296c1eb` | #10 closed |
| Phase 2B backend/PostGIS | #13 | `3873b378787390ea757e44b6bd5af3a2daac080f` | #12 closed |
| Phase 2C identity/auth/admin | #15 | `bd8e937bf234cd894e04cc05935c7994e62c42be` | #14 closed |
| Phase 3 provider/category core | #17 | `149f3b3aa24163ebb6a0b023283cf4a39badb5d6` | #16 closed |
| API/integration planning | #19 | `7736c0909130a3bfbbe993f26ecf28056a699315` | Planning checkpoint |
| Phase 4 verification/evidence | #21 | `d9078a78d3677a94a720de2d16483487594b261e` | #20 closed |
| Phase 5 customer discovery | #24 | `11541db4d5ea856404f8fee03c0ca55cf6bab36c` | #23 closed |
| Phase 6 provider workspace | #26 | `3083b54278c73ce74f53db800c2ec0dfc59c4dde` | #25 closed |

## Phase 6 final checkpoint

```text
PR #26
reviewed implementation head: aa10d727091c4e742f0a26c41b00daa07c5000ad
verified final head: 0358cca3bad5b93e146ddca2f07d7ff43c9cc063
merge commit: 3083b54278c73ce74f53db800c2ec0dfc59c4dde
Issue #25: closed as completed
```

Final exact-head evidence:

| Gate | Run | Result | Artifact SHA-256 |
|---|---:|---|---|
| Backend/PostGIS | #497 | Passed | `6b00fe91caa46a688a28ceb410894b00e53f3026fc017c286a6e869a6fe7cde2` |
| Android reports | #287 | Passed | `3a3be0de236a473ec6e45ddc2cac31be2c57ff8f73062d3610b705a48939a69d` |
| Operations portal | #272 | Passed | `82d8f1e4774e6105d0bc4a2fbfb295965e4ab48ec09ccda3e69c4a715d815ceb` |
| Documentation quality | #876 | Passed | `6f37047496485aa454013e1045aa38cf9672012903ec997d8e760cfa46bd79e0` |

Retained Android artifacts:

| Artifact | SHA-256 |
|---|---|
| Debug APK | `8e70747935e0c1d5ab0b36935316c65bb208887e62bddf473574cddac4f8cf29` |
| Compose test APK | `3e700a43ca9c343e44b8d2b6f6c83d1f85e3c628be61737c5cb2553a7a2aadc5` |

Phase 6 delivered:

- actor-resolved provider workspace authorization and cross-provider denial;
- profile, services, location and availability management without trust/publication side effects;
- separate private base, consented public premises and service-area models;
- private case/check-specific evidence capture;
- persistent idempotent interrupted-upload recovery;
- confirmation rollback for provider/requirement/lifecycle mismatches;
- provider-safe verification timeline;
- explicit read-only Phase 8 enquiry/review and Phase 9 subscription boundaries;
- native Android provider dashboard, profile, timeline and upload-recovery states;
- privacy-safe aggregate operations visibility;
- reviewed architecture, API, privacy, testing, decision and risk records.

Review findings and their permanent regressions are recorded in `docs/testing/PHASE_6_REVIEW_REGRESSIONS.md`.

## Active Phase 7 scope

Phase 7 implements:

- role-scoped triage queues with deterministic priority, age and service-level state;
- assigned short-lived private evidence review access;
- field-agent assignment and structured inspection records;
- reasoned recommendations, decisions and explicit escalations;
- distinct four-eyes approval for high-risk overrides;
- bounded operations complaint and incident records;
- evidence/claim expiry and renewal dashboards;
- aggregate operational reporting;
- permission-aware, accessible operations-portal workflows;
- OpenAPI, authorization, field-safety, privacy, testing, decision and risk updates.

## Phase 7 stop gates

No real provider, customer, evidence, complaint, incident or field-visit data, production storage, maps, messaging, payments, deployment or public pilot is authorized.

Evidence access must remain private, assigned, short-lived, audited and revocable. Field agents may record observations but cannot decide verification or create claims. High-risk overrides require two distinct authorized approvers and cannot bypass mandatory evidence or publication policy. The operations portal remains API-only. Phase 8 retains enquiries, reviews and tracked complaint linkage; Phase 9 retains subscriptions and payments.

## Deferred validation — not a current blocker

Issue #5 retains representative Zambia interviews, real-device/connectivity testing, private inspection of real evidence, field-verification economics, qualified legal/privacy review, authority access, approved map/OTP/payment contracts and willingness-to-pay evidence.
