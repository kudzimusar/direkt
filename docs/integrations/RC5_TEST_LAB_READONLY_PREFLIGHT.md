# RC5 Firebase Test Lab Read-Only Preflight Contract

**Checkpoint state:** RC5 active/resumed; managed matrix not yet authorized  
**Governing tracker:** Issue #261  
**Stale bridge:** draft PR #378 must remain unmerged

## Purpose

The read-only preflight separates owner-controlled Google Cloud resource verification from Firebase Test Lab execution. It is a metadata/IAM/bucket/catalog inspection only: it must prove that the existing APIs, custom roles, IAM bindings, results bucket and live virtual Android catalog match the reviewed RC5 contract before any matrix is allowed to consume quota or write test results.

## Exact inspected boundary

The managed preflight may read only:

- `testing.googleapis.com` and `toolresults.googleapis.com` service state;
- the `direktTestLabRunner` and `direktTestLabResultsWriter` custom-role definitions;
- project IAM bindings for the GitHub deployer;
- absence of prohibited broad and project-scoped Cloud Storage roles;
- the dedicated `gs://direkt-test-lab-results-264358173369` bucket metadata, uniform access, exactly one 30-day delete lifecycle rule and role-specific IAM allowlist;
- every bucket-level role granted to the GitHub deployer, which must resolve to the approved results-writer role only with no additional bucket role;
- the live Firebase Test Lab virtual Android model and version catalogs;
- the public-safe 2–3 device candidate selected by the source-controlled RC5 matrix policy.

## Prohibited actions

The preflight cannot:

- enable an API;
- create, update, delete or undelete a custom role;
- add or remove project/bucket IAM bindings;
- create, update or delete a bucket;
- create, move, overwrite or delete a Storage object;
- read a secret value or create a service-account key;
- build participant credentials or production configuration;
- execute `gcloud firebase test android run`;
- claim RC5 closure or authorize production release.

These prohibitions are enforced by `scripts/rc5/verify-test-lab-preflight.py` and the permanent RC5 contract workflow.

## Managed receipt

The managed artifact contains only a schema-validated text receipt and sanitized public device candidate. Every dispatch uses a unique bridge correlation identifier, and the receipt is accepted only from the workflow run whose exact `run-name`, source SHA and `CORRELATION` marker match that dispatch. Its required boundaries are:

```text
CORRELATION|rc5-<bridge-run-id>-<attempt>
MODE|metadata_iam_catalog_only
RESOURCE_MUTATION|false
MATRIX_EXECUTED|false
SECRET_VALUES_ACCESSED|false
PRODUCTION_AUTHORIZATION|false
```

A ready receipt must also contain:

```text
RESULT|ready
FAILURE_COUNT|0
```

The one-shot bridge publishes a dedicated receipt issue and links it to Issue #261. A successful result becomes promotable only while the inspected source remains exact current `main`.

## Handoff rule

Only after the exact-main read-only receipt is ready may DIREKT replace stale PR #378 with a synchronized one-shot bridge for the existing managed matrix workflow. Any failed or stale preflight remains permanent evidence and blocks matrix execution. RC5 closes only after a later exact-current-main matrix succeeds with machine-enforced results and sanitized artifacts.

RC6 remains closed and preserved. UIA remains parked/open. RC7+ and production authorization remain blocked while RC5 is open.
