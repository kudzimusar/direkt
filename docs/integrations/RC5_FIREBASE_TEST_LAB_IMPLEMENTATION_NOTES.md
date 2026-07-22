# RC5 Firebase Test Lab implementation notes

**Checkpoint:** RC5 — Firebase Test Lab Android device-matrix closure  
**Branch:** `integration/rc5-firebase-test-lab`  
**Baseline:** RC4 closeout `main@9ce693c8a9d248283ff5bef30bf1842fee78faf7`  
**Governing issue:** #261

## Scope

RC5 adds managed Android instrumentation evidence only. It does not authorize production release, participant enrollment, production authentication, real communications, real evidence, Maps, WhatsApp, payments or unrelated UI/backend activation.

The implementation preserves the existing native Android customer/provider product and fixes the stale test contract rather than modifying approved post-VC UI copy to satisfy an old test.

## Android instrumentation repair

`DirektAppSmokeTest` previously asserted obsolete pre-VC strings. RC5 aligns the test with the current shell and stable trust-boundary semantics:

- `foundation-root` must render;
- `DIREKT` and `Find the right local service` must render on the current customer shell;
- Account navigation must expose `pilot-auth-card`;
- the default participant-auth state must remain visibly disabled;
- no production credential or participant endpoint may be embedded in the debug build.

Android CI now installs the built debug APK plus `debugAndroidTest` APK on its managed local emulator and executes `DirektAppSmokeTest`. Compilation of the instrumentation APK alone is no longer accepted as test evidence.

## Managed Test Lab contract

`.github/workflows/firebase-test-lab.yml` is manual/exact-source managed proof only:

1. requires `RUN-DIREKT-TEST-LAB` plus an exact 40-character source SHA, with the confirmation value passed through the workflow environment rather than interpolated directly into shell source;
2. checks out that SHA, fetches `origin/main`, and requires the dispatched SHA to equal the **exact current main** head; an older ancestor of `main` cannot produce promotable RC5 evidence;
3. builds unit/lint/debug/instrumentation artifacts without persistent Firebase config or production credentials;
4. authenticates with existing GitHub Workload Identity Federation;
5. verifies the owner-provisioned Test Lab APIs, exact live custom-role definitions, absence of a project-scoped results role, and the dedicated results-bucket boundary;
6. queries the live virtual Android catalog instead of pinning stale device IDs;
7. selects a deterministic 2–3 device matrix through `scripts/rc5/select-test-lab-matrix.py`;
8. runs only `com.kudzimusar.direkt.DirektAppSmokeTest` as instrumentation;
9. disables flaky reruns, Test Orchestrator, video, performance metrics and automatic Google-account login for this bounded proof;
10. stores detailed provider results only under an attempt-isolated path in the dedicated 30-day lifecycle bucket and uploads only a sanitized matrix/receipt to GitHub artifacts.

Test Lab non-zero outcomes remain hard failures. A failed first execution is not erased by automatic flaky reruns because `--num-flaky-test-attempts 0` is explicit, and GitHub reruns use a distinct `GITHUB_RUN_ATTEMPT` results path.

## Device-matrix policy

The source-controlled selector consumes the live output of:

```text
gcloud firebase test android models list --filter=virtual --format=json
```

It prefers phone form factors and caps the matrix at three unique virtual model/version pairs:

- exact `minSdk 23` when still offered, otherwise the lowest available virtual pre-Android-13 API at or above 23;
- API 33 for the Android 13 runtime notification-permission boundary;
- the highest live virtual API in the current API 35–36 baseline.

API 33 and a current API 35–36 target are mandatory. If the live catalog cannot satisfy those boundaries, RC5 fails closed instead of silently substituting unrelated coverage.

## Least-privilege owner bootstrap

`scripts/rc5/bootstrap-test-lab.sh` is the only owner-authorized provisioning step. It is idempotent and creates no secrets or service-account keys.

It:

- enables `testing.googleapis.com` and `toolresults.googleapis.com`;
- creates/updates custom project role `direktTestLabRunner` from the current non-Storage Firebase Test Lab Admin + Firebase Analytics Viewer execution permissions, plus only `iam.roles.get` for exact live custom-role verification and `serviceusage.services.get` for read-only verification that the two Test Lab APIs remain enabled; the project-scoped runner role has **no Cloud Storage permissions**;
- creates/updates custom role `direktTestLabResultsWriter` containing only `storage.buckets.get`, `storage.buckets.getIamPolicy`, `storage.buckets.update` and object create/delete/get/list; it is bound only at the dedicated bucket scope, and `storage.buckets.getIamPolicy` exists solely so managed proof can verify that bucket-scoped binding;
- creates dedicated bucket `gs://direkt-test-lab-results-264358173369` with uniform bucket-level access in `asia-northeast1` and a 30-day delete lifecycle;
- binds `direktTestLabRunner` to the existing GitHub deployer at project scope;
- binds `direktTestLabResultsWriter` only on the dedicated results bucket and explicitly fails if that role is present for the deployer at project scope;
- fails if the GitHub deployer has project-level `roles/owner`, `roles/editor`, `roles/cloudtestservice.testAdmin`, `roles/firebase.analyticsViewer`, `roles/storage.admin` or `roles/storage.objectAdmin`.

This deliberately avoids Google’s broad predefined Test Lab role path because the DIREKT Firebase project also contains private application storage. Firebase’s documented gcloud Test Lab role pair is used only as the permission baseline; storage access is split to the dedicated bucket instead of granting those predefined roles project-wide.

## Evidence boundary

The managed proof may retain:

- app/test APK hashes;
- synthetic test class name;
- selected public Test Lab model/version identifiers;
- Test Lab matrix/result metadata;
- synthetic screenshots/logs produced by the current default-off participant-auth UI;
- sanitized pass/fail receipt.

It must not retain production credentials, raw auth/FCM tokens, participant contact data, private evidence, reviewer notes, exact private provider coordinates or production endpoints. Automatic Google-account login is explicitly disabled for the managed matrix.

## Source-phase state

Until owner bootstrap, exact-current-main managed execution and closure reconciliation succeed, Firebase Test Lab remains:

`IMPLEMENTED_GATED / MANAGED MATRIX PENDING`

RC6 and later integration source work remain blocked by the RC5 single-writer lock.
