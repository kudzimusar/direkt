# RC5 Firebase Test Lab implementation notes

**Checkpoint:** RC5 — Firebase Test Lab Android device-matrix closure  
**Governing issue:** #261

## Scope

RC5 adds managed Android instrumentation evidence only. It does not authorize production release, participant enrollment, production authentication, real communications, real evidence, Maps, WhatsApp, payments or unrelated UI/backend activation.

The implementation preserves the existing native Android customer/provider product and fixes the stale test contract rather than modifying approved post-VC UI copy to satisfy an old test.

## Android instrumentation repair

`DirektAppSmokeTest` aligns with the current shell and stable trust-boundary semantics:

- `foundation-root` must render;
- `DIREKT` and `Find the right local service` must render on the current customer shell;
- Account navigation must expose `pilot-auth-card`;
- the default participant-auth state must remain visibly disabled;
- no production credential or participant endpoint may be embedded in the debug build.

Android CI installs the built debug APK plus `debugAndroidTest` APK on its managed local emulator and executes `DirektAppSmokeTest`. Compilation of the instrumentation APK alone is not accepted as test evidence.

## Managed Test Lab contract

`.github/workflows/firebase-test-lab-managed.yml` is manual/exact-source managed proof only:

1. requires `RUN-DIREKT-TEST-LAB` plus an exact 40-character source SHA;
2. checks out that SHA, fetches `origin/main`, and requires the dispatched SHA to equal the **exact current main** head;
3. builds unit/lint/debug/instrumentation artifacts without persistent Firebase config or production credentials;
4. authenticates with existing GitHub Workload Identity Federation;
5. verifies the owner-provisioned Test Lab APIs, exact live custom-role definitions, absence of project-scoped Storage authority, and both dedicated bucket boundaries;
6. uploads the app and instrumentation APKs to immutable per-run paths in the dedicated one-day synthetic input bucket and passes explicit `gs://` paths to Test Lab;
7. queries the live virtual Android catalog instead of pinning stale device IDs;
8. selects a deterministic 2–3 device matrix through `scripts/rc5/select-test-lab-matrix.py`;
9. runs only `com.kudzimusar.direkt.DirektAppSmokeTest` as instrumentation;
10. disables flaky reruns, Test Orchestrator, video, performance metrics and automatic Google-account login;
11. stores provider results only under an attempt-isolated path in the dedicated 30-day results bucket and uploads only a sanitized matrix/receipt to GitHub artifacts.

Test Lab non-zero outcomes remain hard failures. A failed first execution is not erased by automatic flaky reruns because `--num-flaky-test-attempts 0` is explicit, and GitHub reruns use distinct run/attempt paths.

## Device-matrix policy

The source-controlled selector consumes the live virtual Test Lab catalog. It prefers phone form factors and caps the matrix at three unique virtual model/version pairs:

- the lowest available compatible virtual API above `minSdk 23`;
- API 33 for the Android 13 runtime notification-permission boundary;
- the highest live virtual API in the current API 35–36 baseline.

API 33 and a current API 35–36 target are mandatory. If the live catalog cannot satisfy those boundaries, RC5 fails closed instead of silently substituting unrelated coverage.

## Least-privilege owner bootstrap

`scripts/rc5/bootstrap-test-lab.sh` is the only owner-authorized provisioning step. It is idempotent and creates no secrets or service-account keys.

It:

- enables `testing.googleapis.com` and `toolresults.googleapis.com`;
- creates/updates custom project role `direktTestLabRunner` from the project-applicable non-Storage Test Lab/Analytics execution permissions plus only `iam.roles.get` and `serviceusage.services.get` for managed verification;
- queries Google IAM `list-testable-permissions` before custom-role mutation and fails early if any requested permission is invalid for a project-level custom role;
- keeps the project-scoped runner role with **no project-scoped Cloud Storage permissions**;
- creates/updates bucket-only `direktTestLabResultsWriter` with exactly `storage.buckets.get`, `storage.buckets.getIamPolicy`, and `storage.objects.create`;
- creates results bucket `gs://direkt-test-lab-results-264358173369` with uniform access in `asia-northeast1` and exactly one 30-day delete lifecycle rule;
- creates/updates bucket-only `direktTestLabInputStager` with exactly `storage.buckets.get`, `storage.buckets.getIamPolicy`, `storage.objects.create`, and `storage.objects.get`;
- creates synthetic input bucket `gs://direkt-test-lab-inputs-264358173369` with uniform access in `asia-northeast1` and exactly one one-day delete lifecycle rule;
- binds the input role only on that input bucket, allowing immutable upload and download validation but no object list, delete or update;
- binds the results role only on the results bucket, preserving append-only evidence;
- fails if either bucket role escapes to project IAM or if the deployer receives broad project roles such as Owner, Editor, Test Lab Admin, Storage Admin, Object Admin, Object User or Object Viewer.

This avoids Google’s broad predefined Test Lab role path because the DIREKT Firebase project also contains private application storage. Storage access is isolated to synthetic RC5 buckets instead of applying Test Lab/Storage roles across the project.

## APK input boundary

The app and test APKs are synthetic build artifacts. They are uploaded with the Cloud Storage JSON media-insert API using `ifGenerationMatch=0` to immutable paths:

```text
gs://direkt-test-lab-inputs-264358173369/rc5/inputs/<source-sha>/<run-id>/attempt-<attempt>/
```

The deployer can create and get objects only in this dedicated bucket. It cannot list, delete, update or overwrite them. The one-day lifecycle is owner-controlled and automatically removes stale inputs. Test Lab receives explicit `gs://` app/test references, avoiding the local-file staging path that produced `INVALID_INPUT_APK — User input file could not be downloaded` in preserved failed receipts #428 and #429.

## Evidence boundary

The managed proof may retain:

- app/test APK hashes;
- synthetic test class name;
- selected public Test Lab model/version identifiers;
- Test Lab matrix/result metadata;
- synthetic screenshots/logs produced by the current default-off participant-auth UI;
- sanitized pass/fail receipt.

The results path is **append-only** for the GitHub deployer: each run attempt gets a unique object prefix, and the proof identity cannot read, list, delete or overwrite prior result objects or change the 30-day lifecycle. The preflight probe is retained under its unique attempt path until lifecycle deletion.

It must not retain production credentials, raw auth/FCM tokens, participant contact data, private evidence, reviewer notes, exact private provider coordinates or production endpoints. Automatic Google-account login is explicitly disabled.

## Source-phase state

Until the isolated input bootstrap, exact-current-main managed execution and closure reconciliation succeed, Firebase Test Lab remains:

`IMPLEMENTED_GATED / MANAGED MATRIX PENDING`

RC7 and later integration source work remain blocked by the RC5 single-writer lock.
