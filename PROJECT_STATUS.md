# DIREKT Project Status

**Updated:** 2026-07-14  
**Authoritative branch:** `main` for stable checkpoints  
**Implementation branch:** `build/android-v1`  
**Current programme state:** Phase 2A native Android scaffold implemented on the build branch; GitHub Actions verification and first debug APK are pending.

## Current phase

| Item | State |
|---|---|
| Repository and planning baseline | Complete |
| GitHub Pages documentation site | Operational |
| Phase 1A secondary-research baseline | Complete with accepted limitations |
| Phase 1B synthetic prototype | Complete; Issue #6 closed |
| Deferred Zambia pilot validation | Open as non-blocking Issue #5 |
| Approved Android application ID | `com.kudzimusar.direkt` |
| Phase 2A Android scaffold | Implemented on `build/android-v1` |
| Android CI | Activated; checkpoint PR must prove tests, lint and APK assembly |
| Firebase tester distribution | Installed but intentionally deferred |
| Active issue | #10 — Phase 2A native Android scaffold and first debug APK |
| Public pilot | Not authorized |

## Issue classification

The three previously open issues are not three simultaneous blockers:

- **Issue #6 — Phase 1B prototype:** completed and closed after the source, Pages integration, design review and exit decision were merged.
- **Issue #5 — Phase 10/11 Zambia validation:** deliberately remains open as a future pilot/legal/field-validation gate. It is labelled non-blocking and does not stop Phase 2 implementation.
- **Issue #10 — Phase 2A Android foundation:** the only active implementation issue.

Issues are closed only when their own acceptance criteria are complete. Long-range gate issues stay open so later agents cannot silently omit mandatory validation.

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
| Android | Native Kotlin/Compose with low-bandwidth, offline-draft and retry requirements |

## Phase 2A implementation

The native project now exists at:

```text
android/direkt-app/
```

Implemented foundation:

- Gradle Kotlin DSL project and reproducible version catalog;
- Gradle 9.4.0 distribution pin and launchers;
- Android application module;
- namespace and production application ID `com.kudzimusar.direkt`;
- debug application ID `com.kudzimusar.direkt.debug`;
- compile/target SDK 36 and minimum SDK 23;
- Kotlin 2.3.0, AGP 9.0.0 and Compose BOM 2025.09.01;
- Material 3 theme mapped to DIREKT design tokens;
- customer/provider mode boundary;
- navigation and state-holder boundary;
- synthetic discovery, provider and verification-progress content;
- explicit non-production and trust limitation copy;
- unit tests for state transitions;
- Compose instrumentation smoke test;
- privacy-safe manifest with no Internet, location, camera or notification permissions;
- no Firebase, production backend, payment, regulator or evidence integration.

## Android CI gate

The workflow now activates on Android changes and must execute:

```text
./gradlew --no-daemon --stacktrace \
  testDebugUnitTest \
  lintDebug \
  assembleDebug \
  assembleDebugAndroidTest
```

It must retain:

- debug application APK;
- Compose instrumentation test APK;
- unit-test reports;
- lint reports;
- exact commit, branch, application ID and toolchain summary.

The source checkpoint is not complete until the pull-request run is green and the APK artifact exists.

## Toolchain decision

The Phase 2A baseline follows the current Google Android `nowinandroid` reference inspected on 2026-07-14:

| Tool | Version |
|---|---:|
| Gradle | 9.4.0 |
| Android Gradle Plugin | 9.0.0 |
| Kotlin / Compose compiler plugin | 2.3.0 |
| Compose BOM | 2025.09.01 |
| compileSdk / targetSdk | 36 |
| minSdk | 23 |
| Build JDK | 17 |

These versions are pinned for reproducibility and must be rechecked at release gates.

## Exact next executable work

1. Open the Phase 2A checkpoint PR from `build/android-v1` to `main`.
2. Observe the Android CI and documentation checks.
3. Repair any build, lint or test failure on the same branch.
4. Confirm the debug APK and test APK artifacts.
5. Verify the application IDs from the build output.
6. Update Issue #10 with exact evidence.
7. Merge the checkpoint automatically at the verified head.
8. Synchronize `build/android-v1` with `main` without force-pushing.
9. Close Issue #10 only after artifact verification.
10. Authorize the bounded Phase 2B backend/data foundation task.

## Deferred validation — not current blockers

The following remain mandatory before later pilot/production gates and are tracked by Issue #5:

- representative Zambia interviews;
- real Android device/connectivity matrix;
- real provider evidence in approved private storage;
- field-verification cost and capacity;
- qualified Zambia legal and privacy review;
- authority data-access agreements;
- map, SMS/OTP and payment contracts;
- subscription pricing and willingness-to-pay evidence.

## Stop gates

- No public provider onboarding.
- No real identity documents, certificates or private coordinates.
- No production regulator integration.
- No customer payment or escrow.
- No Firebase project configuration yet.
- No public pilot or production Play release.
- No payment-derived trust status.
- No blanket safety or verification claim.

## GitHub lifecycle

Routine checkpoint PR creation, CI inspection, repairs, safe merging, branch synchronization and eligible issue closure are handled by the active repository agent. The owner is not required to perform routine GitHub administration.
