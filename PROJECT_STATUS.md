# DIREKT Project Status

**Updated:** 2026-07-14  
**Authoritative branch:** `main` for stable checkpoints  
**Implementation branch:** `build/android-v1`  
**Current programme state:** Phase 1B prototype implementation complete; Phase 2 native Android foundation authorized after checkpoint deployment verification.

## Current phase

| Item | State |
|---|---|
| Repository and planning baseline | Complete |
| GitHub Pages documentation site | Operational |
| Phase 1A secondary-research baseline | Complete with accepted limitations |
| Phase 1B interactive prototype source | Complete |
| Phase 1B heuristic review | Pass with accepted limitations |
| Prototype Pages integration | Complete in source; verify after checkpoint merge |
| Approved Android application ID | `com.kudzimusar.direkt` |
| Android CI workflow | Installed; first APK follows Phase 2 scaffold |
| Firebase tester distribution | Installed; Firebase project/secrets still deferred |
| Active implementation branch | `build/android-v1` |
| Next phase | Phase 2 — native Android technical foundation |
| Public pilot | Not authorized |

## Phase 1A baseline

The project uses current official and credible secondary research plus explicit provisional assumptions so unavailable manual fieldwork does not block design or scaffolding.

Primary Zambia customer, provider, device, legal and operational validation remains mandatory before controlled public pilot and production claims. It is tracked in GitHub Issue #5.

Authoritative research documents:

- `docs/research/SECONDARY_RESEARCH_BASELINE.md`;
- `docs/research/PHASE_1A_EXIT_REVIEW.md`;
- `docs/research/ASSUMPTIONS_REGISTER.md`;
- `docs/research/CATEGORY_EVIDENCE_MATRIX.md`.

## Approved product baseline

| Area | Decision |
|---|---|
| Default market context | Lusaka District |
| Later pilot boundary | Selected Lusaka neighbourhoods, confirmed before pilot |
| Initial categories | Plumbing, electrical repair, motor-vehicle mechanics, appliance/electronics repair |
| Provider models | Fixed premises, mobile and hybrid |
| Provider pathways | Registered business, qualified individual and experienced informal provider |
| Trust presentation | Separate evidence-backed claims; no blanket safety/verification badge |
| Location | Area, neighbourhood, landmark, pin and optional Plus Code; private precision minimized |
| Customer contact | Tracked enquiry, then consent-aware call or WhatsApp handoff |
| Customer payment/escrow | Deferred from first MVP |
| Provider subscriptions | Later payment-adapter phase |
| Android | Native Kotlin/Compose with offline drafts, compression, retry and low-bandwidth behaviour |

## Phase 1B deliverables

The dependency-free prototype at `prototype/` includes:

### Customer

- welcome and trust explanation;
- manual area and category discovery;
- provider list and synthetic map;
- fixed, mobile and hybrid provider profiles;
- separate trust claims, scope, dates and limitations;
- current, pending, expiring, expired, not supplied and not checked states;
- tracked enquiry and consent-aware contact handoff.

### Provider

- resumable onboarding checklist;
- registered, qualified and experienced-informal pathways;
- operating model and service area;
- evidence requirements;
- interrupted upload, local draft and retry;
- action-required reason and resubmission;
- verification timeline and enquiry inbox.

### Operations

- dashboard and verification queue;
- check-specific case review;
- restricted fictional evidence viewer;
- approve/action-required/reject form;
- reason codes, public-effect explanation and audit history.

### Cross-cutting

- phone and wide viewport previews;
- keyboard-accessible controls and focus styling;
- slow, offline, loading, empty, denied and recoverable-error states;
- fictional data only;
- local-only feedback notes;
- no API, real submission, phone number, WhatsApp destination or remote tracking.

Source documents:

- `docs/design/PHASE_1B_PROTOTYPE_SPEC.md`;
- `docs/design/PHASE_1B_HEURISTIC_REVIEW.md`;
- `docs/design/PHASE_1B_EXIT_REVIEW.md`;
- `docs/design/SCREEN_INVENTORY.md`.

## Phase 1B result

**PASS WITH ACCEPTED LIMITATIONS**

The prototype establishes sufficient interaction and trust structure for technical scaffolding. Representative usability testing, native Android accessibility, real network/device behaviour and operational evidence remain later obligations.

## Android identity

```text
namespace = com.kudzimusar.direkt
applicationId = com.kudzimusar.direkt
```

Debug and staging variants may use safe suffixes while production retains the exact approved ID.

## Exact next executable workstream

**Phase 2A — scaffold the native Android project and produce the first green debug APK**

The next agent must:

1. create the Gradle/Kotlin Android project at `android/direkt-app`;
2. use Jetpack Compose, Material 3 and Kotlin DSL;
3. set namespace and production application ID to `com.kudzimusar.direkt`;
4. create a debug-safe application ID suffix;
5. establish version catalogs and reproducible dependency versions;
6. create baseline theme tokens from the approved design system;
7. implement the application shell and navigation boundaries using synthetic data only;
8. add unit, lint and Compose smoke tests;
9. make the existing Android CI run tests, lint and `assembleDebug` successfully;
10. retain the debug APK as a GitHub Actions artifact;
11. document local bootstrap and known limitations;
12. avoid Firebase, real authentication, production APIs and real evidence collection.

## Phase 2A exit gate

- clean checkout can run the documented Gradle command;
- Android unit tests and lint pass;
- debug APK builds in GitHub Actions;
- application ID and debug suffix are verified;
- no secret or production configuration is committed;
- the app displays a clearly synthetic foundation shell;
- architecture and module documentation match the scaffold;
- exact Phase 2B backend-foundation task is authorized.

## Deferred validation — not current blockers

- representative Zambia interviews;
- real Android device/connectivity matrix;
- real provider evidence in approved private storage;
- field-verification cost and capacity;
- qualified Zambia legal review;
- authority data-access agreements;
- map, SMS/OTP and payment contracts;
- subscription pricing and willingness to pay.

## Stop gates

- No public provider onboarding.
- No real identity documents, certificates or private coordinates.
- No production regulator integration.
- No customer payment or escrow.
- No public pilot or production Play release.
- No payment-derived trust status.
- No blanket safety or verification claim.

## GitHub lifecycle

Routine checkpoint PRs, verification, safe merging, branch synchronization and eligible issue closure are handled by the active repository agent. The owner is not required to perform routine GitHub administration.
