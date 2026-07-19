# DIREKT Project Status

**Updated (Asia/Tokyo):** 2026-07-19  
**Stable branch:** `main`  
**Implementation branch:** `build/android-v1` — history-preserving synchronization maintained; no force-push or history rewrite permitted  
**Programme state:** Phases 0–10 are complete and stable. Phase 11 internal/synthetic readiness is complete, but real-participant pilot evidence and 11J remain pending. Phase 12A preauthorization release engineering is complete and promoted. Formal Phase 12 production release is still not authorized.

## Stable checkpoints

| Phase/checkpoint | PR | Merge commit | Status |
|---|---:|---|---|
| Phase 4 verification/evidence | #21 | `d9078a78d3677a94a720de2d16483487594b261e` | complete |
| Phase 5 customer discovery | #24 | `11541db4d5ea856404f8fee03c0ca55cf6bab36c` | complete |
| Phase 6 provider workspace | #26 | `3083b54278c73ce74f53db800c2ec0dfc59c4dde` | complete |
| Phase 7 operations workflow | #29 | `7ea8aa17dbced5f9e56dd259b15216223aa33921` | complete |
| Phase 8 enquiries/interactions/reviews | #31 | `0182951cdc26a892b3423728bd843e2969b25bc0` | complete |
| Phase 9 subscription/payment foundation | #35 | `4c78e2419aa4eca225495acaac8e7e0ee81903f1` | complete |
| Phase 10 security/privacy/reliability | #111 | `369fc72581b3ed27920b8fc949e32cfedf1ad8d9` | complete |
| Phase 11 entry-control foundation | #113 | `53e20e67a877f481fc94458d1d2ea62bf4e47b0f` | Issue #112 open |
| Android regression baseline repair | #118 | `e21566deb3fc3a30baf3c6ca3539721416dc1e0a` | complete |
| Phase 11 synthetic controlled-pilot implementation | #119 | `7b886b9bee91c1337f4e4ad43f71afa4389644de` | complete |
| Phase 11 managed synthetic activation | #120 | `06ade25b92bdb1dc310b88ed64626037671683c4` | complete |
| Phase 11 external-entry package | #121 | `e24c41944675d1f31d4466127902917419e37fce` | external gates pending |
| Phase 11 final synthetic checkpoint | #123 | `25c445f4e33073d1f174b0a30ea5ca50d838859e` | complete |
| Phase 12 preauthorization release-readiness foundation | #125 | `7b23d812b751345a740a34b77ad1b7890ed15cd1` | complete |
| Phase 12A Android release contract | #129 | `48f6d2d212d64192819d76d67e157b25f8a5e98b` | complete |

## Current Phase 11 truth

Phase 11 repository-side synthetic/readiness work is complete, including regression repair, controlled synthetic cohort activation and production-shaped workflow exercise. This does **not** substitute for the mandatory real Zambia pilot evidence.

The following remain pending:

- DPC controller-registration evidence and any applicable overseas storage/transfer authorization;
- qualified Zambia legal/privacy/consumer review and approved real-participant notice/consent version;
- real Firebase and private-storage/auth/deletion/withdrawal canaries inside the approved boundary;
- Zambia-based field ownership before field-verification claims;
- 11C–11H `PRIMARY-PILOT` evidence from actual controlled pilot activity;
- 11J evidence-backed `STOP / REPEAT / NARROW / PROCEED` decision.

Issue #112 remains the active Phase 11 tracker and must stay open until those exit criteria are genuinely met.

## Phase 12 preauthorization foundation

The release surface was audited and the permanent release-readiness gate was introduced before Phase 12A. The Android package remains `com.kudzimusar.direkt`, with `compileSdk` and `targetSdk` at API 36. Preauthorization workflows remain non-publishing and do not authorize signing, Play upload, public production traffic or real-participant activation.

## Phase 12A — completed

Phase 12A implemented the production-safe Android release contract without crossing the formal release boundary.

### Release identity and versioning

- [x] Removed the stale hard-coded Phase 8 release identity.
- [x] Added source-controlled release identity in `android/direkt-app/release/version.properties`.
- [x] Current identity is `versionCode = 12`, `versionName = 0.12.0-preauth.1`, channel `preauthorization`.
- [x] Release identity is consumed through Gradle provider-backed file input tracking.
- [x] Version code/name/channel rules fail closed before release packaging.
- [x] Before any actual Play upload, the selected version code must still be verified against the highest version code in the real Play Console.

### Protected signing contract

- [x] Current `preauthorization` source cannot enable release signing.
- [x] Future release-candidate/production packaging requires explicit protected signing enablement and cannot silently fall back to an unsigned release artifact.
- [x] Signing material remains external to git and must resolve outside the repository checkout.
- [x] Android Gradle Plugin injected-signing overrides are prohibited so they cannot bypass the DIREKT release contract.
- [x] Protected signed builds require configuration cache to be disabled before signing credentials are consumed.
- [x] No real upload key or signing credential was configured or tested during Phase 12A.

### Reproducible AAB evidence

- [x] CI verifies the exact checked-out source SHA before producing release evidence.
- [x] CI proves injected-signing and configuration-cache signing bypass attempts fail closed.
- [x] `lintRelease` passes.
- [x] Two independent clean, build-cache-disabled `bundleRelease` executions produce byte-for-byte identical unsigned AABs.
- [x] Verified AAB SHA-256: `890b710f18ad7208b6db0e5668193a739052e010462d0beeddb8f752c14dd169`.
- [x] Exact evidence source: `468ab708b41b4b9ebcc0b6b007b613454caaee89`.
- [x] Final short-lived evidence artifact: `direkt-phase12a-preauthorization-aab-30-468ab708b41b4b9ebcc0b6b007b613454caaee89`.
- [x] Artifact archive digest: `sha256:00cc6ca6781079ed83964e2374a1fe2698bce2e31cef691cd04dea2f8a284c30`.
- [x] Evidence retention expiry: 2026-07-26.

### Exact-head quality gates

Exact Phase 12A head `468ab708b41b4b9ebcc0b6b007b613454caaee89` passed:

- Android CI;
- Android performance budget;
- Phase 10 supply-chain/security;
- documentation quality;
- Phase 12A release-readiness and reproducibility.

Automated review findings were addressed before merge, including exact-SHA provenance, keystore symlink resolution, configuration-cache-aware version input, injected-signing bypass and signing-secret configuration-cache exposure.

PR #129 promoted Phase 12A to `main` at `48f6d2d212d64192819d76d67e157b25f8a5e98b`. PR #130 then forward-synchronized `build/android-v1` without file changes.

## Authorization boundary

Phase 12A proves a production-safe **release engineering contract and reproducible unsigned preauthorization artifact**. It does not prove or authorize a production release.

Still prohibited until the governing gates permit them:

- real upload-key activation;
- signed production AAB;
- Play Console internal, closed or production-track publication;
- public production backend traffic;
- unrestricted signup or real-participant Firebase activation;
- real-money activity;
- relabelling synthetic or Phase 12A evidence as `PRIMARY-PILOT` evidence;
- closing Phase 11 or Issue #112;
- declaring formal Phase 12 authorized.

## Current source documents

- `docs/phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md`
- `docs/phase11/PHASE11_SYNTHETIC_CONTROLLED_PILOT_ACTIVATION_2026-07-19.md`
- `docs/phase11/PILOT_VALIDATION_EVIDENCE_REGISTER.md`
- `docs/phase12/PHASE12_PREAUTHORIZATION_RELEASE_READINESS_2026-07-19.md`
- `docs/architecture/PHASE12_PREAUTHORIZATION_RELEASE_READINESS_DECISION.md`
- `docs/architecture/PHASE12A_ANDROID_RELEASE_CONTRACT_DECISION.md`
- `android/direkt-app/release/SIGNING_CONTRACT.md`

## Phase boundaries and next safe work

- Phase 10: complete.
- Phase 11 internal/synthetic readiness: complete.
- Phase 11 real-participant entry and 11C–11H primary evidence: pending external gates and actual Zambia pilot.
- Phase 11J: pending.
- Phase 12 preauthorization foundation: complete.
- Phase 12A Android release configuration/versioning/reproducible unsigned AAB/protected-signing contract: complete.
- Formal Phase 12 production release: not authorized until actual Phase 11 exit evidence supports `PROCEED` and the global release gates pass.
- Next safe engineering candidate while those gates remain blocked: **Phase 12B — repository-controlled Play listing, permissions declarations and Data Safety inventory/preparation**. Final Play submission remains gated.

Issue #5 remains the historical deferred real-world validation obligation. Issue #112 remains open as the active controlled-pilot execution tracker.
