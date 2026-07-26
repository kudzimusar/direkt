# RC5 isolated Firebase Test Lab lane

RC5 remains open until a managed Android instrumentation matrix passes on all selected virtual devices with zero flaky retries.

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

A successful preflight does not close RC5. Closure requires a schema-valid managed receipt with `result: passed`, exit code zero, three selected targets and all enforced runtime controls, followed by regression and documentation reconciliation.
