# RC5 isolated Firebase Test Lab lane

RC5 is closed at the synthetic-only managed boundary. Exact source `c3744430a7beb1cd47246d858df9ac1379a068ac` passed managed run `30183466799/1` on all three selected virtual devices with zero flaky retries.

## Isolated project

The owner provisioned a dedicated Firebase project for Test Lab only:

- project ID: `direkt-testlab-502701-20260726`;
- project number: `482116157386`;
- plan: Spark, billing disabled;
- enabled APIs: Firebase Management, Testing and Tool Results;
- deployer: `direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com` through the existing GitHub Workload Identity Federation provider;
- deployer authority: `roles/editor`, scoped only to this isolated Test Lab project;
- service-account keys: none;
- data mode: synthetic/public-safe only;
- participant and production authorization: false.

The project exists only to contain the broad Firebase Test Lab execution authority and Firebase-managed result storage. It must not receive customer data, production secrets, application databases, unrelated buckets or production workloads.

## Source lanes

The isolated v3 lane is separate from the historical v2 custom-role and dedicated-bucket evidence:

- `.github/workflows/firebase-test-lab-isolated.yml` is the permanent exact-source managed workflow;
- `scripts/rc5/run-test-lab-isolated-managed.sh` builds the current debug app and instrumentation APKs, verifies the isolated project, selects the bounded live matrix and submits local APK files through `gcloud firebase test android run`;
- `.github/workflows/rc5-test-lab-isolated-preflight-once.yml` is a path-scoped one-shot read-only preflight bridge;
- `scripts/rc5/run-test-lab-isolated-preflight.sh` verifies project identity, Firebase/API availability, the isolated `roles/editor` binding and the live virtual-device catalogue without creating a matrix;
- `.github/workflows/rc5-test-lab-isolated-contract.yml` rejects authority, project, transport, matrix, retry or production-boundary drift.

## Managed matrix contract

The live selector must return exactly three virtual-device targets:

1. API 26 compatibility baseline;
2. API 33 notification-permission baseline;
3. current API 35 or 36 baseline.

The managed run must use:

- `DirektAppSmokeTest` only;
- five-minute per-device timeout;
- zero flaky-test attempts;
- no Test Orchestrator;
- no video recording;
- no performance metrics;
- no automatic Google login;
- Firebase-managed default results storage;
- exact current `main` source;
- synthetic/public-safe data only;
- production authorization false.

Canonical closure evidence is Issue #449 and artifact `8626329335` (`sha256:03a40951a23c937d8b0fd2990a7d2652afbd1172631c0b480af756aebd92a843`): schema-valid receipt `result: passed`, exit code zero, category `PASSED`, three selected targets, and all enforced runtime controls. This closure does not authorize participants, production authentication, private evidence, external communications, real payments or production release.
