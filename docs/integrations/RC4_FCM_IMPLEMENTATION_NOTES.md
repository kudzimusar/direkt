# RC4 FCM implementation notes

RC4 is claimed from exact merged RC3 baseline `0d7d29313990c37b25bd985588866a85bbe10f83` under Issue #261.

Scope is limited to Firebase Cloud Messaging: backend provider-neutral send adapter through the transactional outbox, device-token lifecycle, Android foreground/background handling and runtime notification permission, retry/idempotency/privacy controls, exact-source managed synthetic canary, permanent verifier promotion, and status/ledger reconciliation.

## Managed proof progression

- Exact source `b8d62fc0bc1470766dc6ef55aa807fa5ebdbb5c1`, managed run `29909954329`, proved the corrected Firebase registration path on the managed Android emulator: exact-source checkout, backend preflight, GitHub OIDC, least-privilege FCM bootstrap verification, Firebase app/config resolution, APK build, emulator provisioning and synthetic FCM registration all passed.
- The same run then failed before any backend image deployment or push delivery because the old canary attempted to create a new Secret Manager secret and mutate its IAM policy from the intentionally least-privileged GitHub deployer identity. Sanitized result: `PERMISSION_DENIED`.
- PR #371 replaced that obsolete runtime-admin behavior with one owner-provisioned empty Secret Manager container named `direkt-fcm-canary-token`. The canary may create only a temporary numeric secret version, pin that exact version into the private Cloud Run Job, delete the job, and destroy that version during cleanup.
- `scripts/rc4/verify-fcm-canary-secret-lifecycle.py` and its dedicated workflow fail closed on runtime secret creation, IAM mutation, `latest`, hard-coded version 1, whole-secret deletion or broad Secret Manager admin.

## Required least-privilege owner bootstrap

Run `scripts/rc4/bootstrap-fcm-canary-secret.sh` once with an owner/admin-authenticated Google Cloud CLI before the next managed proof. It creates no secret value and verifies only this boundary:

- fixed container: `direkt-fcm-canary-token` in `direkt-dev-502701`;
- `direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com`: secret-scoped `roles/secretmanager.secretVersionManager`;
- `direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com`: secret-scoped `roles/secretmanager.secretAccessor`.

Do not grant project-wide Secret Manager Admin and do not store a participant or production token in this container. The workflow-generated value is synthetic test-device material and is destroyed after the run.

No Test Lab, Maps, WhatsApp, payment activation, participant/production push, Phase 11 exit or Phase 12 production release is authorized by this claim.
