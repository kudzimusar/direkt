# Phase 12A Android Release Configuration and Signing Decision

**Decision date:** 2026-07-19  
**Status:** Accepted for Phase 12A preauthorization engineering  
**Owner approval:** Explicitly authorized by the repository owner for Phase 12A  
**Formal Phase 12 authorization:** Not granted

## Context

The existing Android release variant was buildable, but it still carried the stale hard-coded identity `versionCode = 8` / `versionName = 0.8.0-phase8`. The preauthorization workflow could build one unsigned AAB and calculate a checksum, but it did not prove byte reproducibility and intentionally rejected any signing configuration rather than defining how a future protected upload-key boundary should work.

Phase 12A needs to remove those release-engineering risks without enabling production signing, Play publishing, public backend traffic or real-participant activity.

## Decision

### 1. Source-controlled release identity

Use `android/direkt-app/release/version.properties` as the sole reviewed source of truth for Android:

- version code;
- version name;
- release channel.

The initial Phase 12A identity is `12` / `0.12.0-preauth.1` on channel `preauthorization`.

The Gradle build validates the contract before configuring variants. Preauthorization, release-candidate and production labels have distinct naming rules so an artifact cannot silently present itself as a production release while carrying a preauthorization identity.

### 2. Fail-closed protected signing contract

Introduce conditional release signing in Gradle, but keep it impossible in the current source state.

Signing requires two independent gates:

1. source-controlled release channel must be `release-candidate` or `production`;
2. the protected execution environment must explicitly set `DIREKT_RELEASE_SIGNING_ENABLED=true` and provide all required upload-keystore inputs.

The current `preauthorization` channel rejects signing even if signing variables are accidentally supplied.

The protected inputs are:

- `DIREKT_UPLOAD_KEYSTORE_PATH`;
- `DIREKT_UPLOAD_KEYSTORE_PASSWORD`;
- `DIREKT_UPLOAD_KEY_ALIAS`;
- `DIREKT_UPLOAD_KEY_PASSWORD`.

The keystore path must be absolute and point to a readable file outside the repository checkout. No real signing material is introduced by this decision.

### 3. Reproducibility is proved, not assumed

The Phase 12A readiness workflow must build the unsigned release AAB twice from clean state with build cache disabled, under the same source SHA and release contract.

The checkpoint passes only if:

- both AABs exist;
- both SHA-256 digests are identical;
- byte comparison confirms exact equality.

Only the second verified artifact is packaged as short-lived evidence, together with deterministic release metadata and the digest.

### 4. Preauthorization workflow remains non-publishing

The public-repository readiness workflow always forces signing disabled, maps no upload-key secrets, rejects tracked key material and performs no Play, Firebase distribution or production deployment action.

## Alternatives considered

### Keep hard-coded version values in `app/build.gradle.kts`

Rejected. Release identity changes would remain mixed with build logic, harder to audit and easier to alter accidentally during unrelated Android work.

### Drive release versions entirely from CI environment variables

Rejected for the baseline. Hidden CI values weaken source-to-artifact traceability and make reproducing an exact release identity from a commit harder. A reviewed source-controlled identity is the safer default.

### Configure a real keystore now but keep publishing disabled

Rejected. Real signing capability is not needed to prove Phase 12A engineering and would introduce secret-management and accidental-distribution risk before formal Phase 12 authorization.

### Continue rejecting all signing configuration until formal Phase 12

Rejected. That avoids immediate risk but defers validation of the signing boundary itself. A fail-closed conditional contract can be reviewed and tested safely now without any real key.

### Treat a single successful AAB build plus checksum as reproducibility evidence

Rejected. A checksum identifies one artifact; it does not prove that rebuilding the same source produces the same bytes.

## Security and privacy impact

Positive controls:

- real signing keys and passwords remain outside git;
- common keystore formats are ignored and CI rejects tracked key material;
- signing cannot activate while the tracked channel is `preauthorization`;
- all protected signing inputs are required together when signing is eventually authorized;
- keystore location must be an absolute protected-runner path;
- no service-account or Play publishing credentials are introduced;
- no real participant data or production environment configuration is required.

The release channel is added to Android `BuildConfig` as non-sensitive provenance only. No secret value is embedded.

## Migration impact

There is no database, API or user-data migration.

Android release identity changes from the stale Phase 8 values to the Phase 12A preauthorization identity. The new `versionCode = 12` is greater than the previous repository value `8`, preserving monotonic progression within repository history. It is explicitly not represented as proof of any previously published Play version.

Before any authorized Play upload, the release owner must verify the chosen version code is greater than every version code already present in the actual Play Console.

## Compatibility impact

- package/application ID remains `com.kudzimusar.direkt`;
- minSdk, targetSdk and compileSdk remain unchanged;
- debug builds retain the `.debug` application ID suffix;
- no runtime API or database contract changes;
- release minification remains disabled pending a separate evidence-backed decision.

## Approval and authorization boundary

The repository owner explicitly authorized implementation of “Phase 12A — production-safe Android release configuration, versioning, reproducible AAB packaging and protected-signing contract.”

That approval authorizes this engineering contract only. It does not authorize:

- a real upload key;
- a signed production artifact;
- Play Console upload;
- internal/closed/production release activation;
- public backend traffic;
- real Firebase participant activation;
- closure of Phase 11 or Issue #112;
- formal Phase 12 production release.

## Reversal conditions

Revisit this decision if:

- Google Play signing requirements materially change;
- the package name or release architecture changes through an approved decision;
- reproducibility cannot be maintained across supported build infrastructure;
- the protected signing mechanism requires credentials to enter the repository checkout;
- a future release system provides a stronger hardware-backed or managed signing boundary.

Any change that weakens the two-gate signing model or introduces publishing capability requires a new reviewed release-workflow decision.
