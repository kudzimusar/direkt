# RC4 FCM implementation notes

RC4 is claimed from exact merged RC3 baseline `0d7d29313990c37b25bd985588866a85bbe10f83` under Issue #261.

Scope is limited to Firebase Cloud Messaging: backend provider-neutral send adapter through the transactional outbox, device-token lifecycle, Android foreground/background handling and runtime notification permission, retry/idempotency/privacy controls, exact-source managed synthetic canary, permanent verifier promotion, and status/ledger reconciliation.

## Managed proof progression

- Exact source `b8d62fc0bc1470766dc6ef55aa807fa5ebdbb5c1`, managed run `29909954329`, proved the corrected Firebase registration path on the managed Android emulator: exact-source checkout, backend preflight, GitHub OIDC, least-privilege FCM bootstrap verification, Firebase app/config resolution, APK build, emulator provisioning and synthetic FCM registration all passed.
- The same run then failed before any backend image deployment or push delivery because the canary attempted to create a new Secret Manager secret and mutate its IAM policy from the intentionally least-privileged GitHub deployer identity. Sanitized result: `PERMISSION_DENIED`.
- The correction is to preprovision one dedicated empty Secret Manager container named `direkt-fcm-canary-token`. The canary may create only a temporary numeric secret version, pin that exact version into the private Cloud Run Job, and destroy that version during cleanup.
- Runtime secret-container creation/deletion and Secret Manager IAM mutation are prohibited from the managed canary and enforced by `scripts/verify-rc4-fcm-secret-boundary.py`.

## Required least-privilege owner bootstrap

The fixed container `direkt-fcm-canary-token` must exist in `direkt-dev-502701` before the next managed proof. No initial secret value is required.

- `direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com`: secret-scoped `roles/secretmanager.secretVersionManager` on `direkt-fcm-canary-token` only, so the workflow can add and destroy the temporary proof version.
- `direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com`: secret-scoped `roles/secretmanager.secretAccessor` on `direkt-fcm-canary-token` only, so the private Cloud Run canary job can resolve the pinned version.

Do not grant project-wide Secret Manager Admin and do not store a participant or production token in this container. The workflow-generated value is synthetic test-device material and is destroyed after the run.

No Test Lab, Maps, WhatsApp, payment activation, participant/production push, Phase 11 exit or Phase 12 production release is authorized by this claim.
