# Phase 12 Preauthorization Release Readiness — 2026-07-19

**Status:** PREAUTHORIZED ENGINEERING ONLY — FORMAL PHASE 12 REMAINS BLOCKED  
**Programme timezone:** Asia/Tokyo  
**Stable source audited:** `25c445f4e33073d1f174b0a30ea5ca50d838859e`  
**Governing Phase 11 issue:** #112

## Purpose

Define the exact work that may continue toward Android production release without misrepresenting synthetic readiness as completion of the real Zambia pilot.

This document does not authorize:

- real participant recruitment or processing;
- unrestricted signup or invitations;
- public production traffic;
- Play production rollout;
- signed production release distribution;
- real verification claims based only on synthetic data;
- real-money activation;
- closure of Phase 11 or Issue #112.

The authoritative phase order remains:

```text
Phase 11 real controlled pilot
→ 11C–11H PRIMARY-PILOT evidence
→ 11I evidence-led corrections
→ 11J STOP / REPEAT / NARROW / PROCEED
→ global release gates
→ formal Phase 12 authorization
→ Android production release
```

## Formal Phase 12 entry gate

Formal Phase 12 remains blocked until all of the following are true:

1. the authorized real controlled Zambia pilot has actually run;
2. required 11C–11H `PRIMARY-PILOT` evidence is recorded;
3. legitimate evidence-led corrections are promoted and revalidated;
4. 11J records an evidence-backed `PROCEED` decision;
5. qualified Zambia legal/privacy/consumer approval and applicable DPC evidence exist;
6. the global release gates in `MASTER_BUILD_PLAN.md` are satisfied.

Synthetic/system results may demonstrate implementation readiness, but cannot satisfy those entry conditions.

## Current repository release audit

| Release concern | Current evidence | Status before formal release |
|---|---|---|
| Android application ID | `com.kudzimusar.direkt` | Ready baseline |
| Android target API | `targetSdk = 36` | Meets the announced Google Play requirement taking effect 2026-08-31 for new apps/updates; re-check again at release time |
| Android compile API | `compileSdk = 36` | Ready baseline |
| Release version | `versionCode = 8`, `versionName = "0.8.0-phase8"` | Stale; must be deliberately advanced under release versioning before signed distribution |
| Release build type | Exists, with release lint enabled | Partial |
| Release minification | `isMinifyEnabled = false` | Explicit release decision still required; not changed merely to chase a checklist |
| Production signing | No repository signing configuration or key material | Correct fail-closed state before authorization; protected upload-key process still required |
| Android CI | Debug unit/lint/APK/test-APK gate exists | Strong development gate, but not sufficient for AAB release readiness |
| Release AAB gate | No permanent non-publishing AAB readiness workflow at audit start | Gap to close with protected preauthorization engineering |
| Play App Signing | Planned in `docs/android/PLAY_STORE_RELEASE.md` | External Play Console action still pending |
| Play testing tracks | Internal/closed/staged model documented | Real Play track configuration/evidence pending |
| Store listing | Requirements documented | Final listing/screenshots/content rating/support/privacy artifacts pending |
| Data safety declaration | Requirement documented | Final declaration must match the actual SDK/data flow at release time |
| Production backend | Managed Cloud Run remains protected staging; no public production authorization | Blocked until formal release gates |
| Real Firebase participant auth | Implementation exists; real configuration/canary externally gated | Blocked until Phase 11 entry approval |
| Monitoring | Phase 10 protected monitoring/recovery evidence exists; Sentry real-participant use remains disabled | Production monitoring/alert ownership must be re-confirmed for release |
| Support/verification staffing | Bounded pilot ownership defined | Real operating capacity must be evidenced by the pilot before production |
| Device/accessibility matrix | Automated/synthetic checks and planned matrix exist | Real Zambia device/network evidence remains mandatory in 11G |

## Current Google Play policy checkpoint

At this 2026-07-19 checkpoint:

- Google Play states that from **2026-08-31**, new apps and app updates for standard Android mobile apps must target **Android 16 / API level 36 or higher**.
- DIREKT already declares `targetSdk = 36`, so no target-SDK migration is currently required for that announced deadline.
- Google Play requires accurate Data safety declarations for published apps and requires developers to account for data collected or shared by app code and included SDKs.
- The planned release process uses Android App Bundles and Play App Signing; the protected upload key must remain outside the public repository.

Official references must be re-checked at every closed-test and production release checkpoint because Play policy changes over time.

## Engineering explicitly authorized before formal Phase 12

The following work may continue now because it does not create a production launch or substitute for primary evidence:

1. build an **unsigned, non-publishable release AAB** in CI to prove the release variant compiles;
2. run release lint and package/target identity assertions;
3. generate a SHA-256 checksum for the readiness artifact;
4. ensure no signing keys, service-account files, production credentials or real participant configuration enter the repository or artifact;
5. retain the artifact only as short-lived CI evidence and label it clearly as **PREAUTHORIZATION / NOT FOR DISTRIBUTION**;
6. keep production upload, Play Console publishing and production backend traffic absent from the workflow;
7. prepare release/store/data-safety checklists from actual code, while leaving legal/participant-dependent fields unresolved rather than inventing answers;
8. continue protected synthetic/staging regression work against the canonical Android → API → backend → database → operations architecture.

## Release-readiness workflow contract

The preauthorization workflow must:

- run without production signing secrets;
- fail if signing key files or obvious signing configuration are introduced into the public Android project prematurely;
- execute release lint and `bundleRelease`;
- confirm the AAB exists;
- record commit SHA and artifact SHA-256;
- upload only the clearly labelled non-publishable readiness artifact;
- perform no Play upload, Firebase production distribution, public deployment or traffic change;
- never set `PILOT_ENTRY_APPROVED=true` or production release latches.

This gate proves buildability only. It does **not** prove Play approval, installability from Play, device compatibility, legal compliance, production operations or product-market validation.

## Work that must remain blocked

Do not perform any of the following under the preauthorization label:

- create or distribute a production-signed AAB to the public;
- configure unrestricted Play production access;
- enable production Firebase invitations/OTP before the real-pilot entry gates;
- make Cloud Run publicly callable merely to prepare Phase 12;
- enable Sentry with real participant data without the approved privacy boundary;
- enable real payments;
- manufacture DPC/legal references, participant metrics, device observations or willingness-to-pay evidence;
- change trust semantics or release scope merely to make a release checklist appear complete.

## Remaining path to formal Phase 12

### External/real-evidence blockers

- DPC controller-registration evidence;
- applicable overseas storage/transfer authorization;
- qualified Zambia legal/privacy/consumer review;
- approved final real-participant notice/consent version;
- real Firebase and private-storage/auth/deletion/withdrawal canaries;
- 11C provider onboarding/evidence/comprehension evidence;
- 11D discovery/location/trust-comprehension evidence;
- 11E enquiry/contact/review/complaint evidence;
- 11F real operations/capacity evidence;
- 11G Zambia device/connectivity/recovery evidence;
- 11H willingness-to-pay and unit-economics evidence;
- 11J `PROCEED` decision.

### Release gates to close after evidence supports proceed

- deliberate release version code/name;
- protected upload key and Play App Signing setup;
- signed reproducible AAB and signature/hash evidence;
- Play internal then closed testing evidence;
- final store listing, privacy policy, terms/support route, content rating and Data safety declarations;
- production backend and operations readiness;
- operational support and verification staffing;
- production monitoring/alerts and incident ownership;
- staged rollout/rollback/stop criteria;
- final current-Play-policy check;
- release tag and notes.

## Decision

Proceed with **Phase 12 preauthorization release-readiness engineering only** while Phase 11 remains the formally active programme phase.

Do not rename this work as Phase 12 completion or production release. Formal Phase 12 begins only after the real pilot, 11J `PROCEED` decision and global release gates authorize it.
