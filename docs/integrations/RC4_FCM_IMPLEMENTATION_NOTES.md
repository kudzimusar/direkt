# RC4 FCM implementation notes

RC4 is claimed from exact merged RC3 baseline `0d7d29313990c37b25bd985588866a85bbe10f83` under Issue #261.

Scope is limited to Firebase Cloud Messaging: backend provider-neutral send adapter through the transactional outbox, device-token lifecycle, Android foreground/background handling and runtime notification permission, retry/idempotency/privacy controls, exact-source managed synthetic canary, permanent verifier promotion, and status/ledger reconciliation.

## Managed proof progression

- Exact source `b8d62fc0bc1470766dc6ef55aa807fa5ebdbb5c1`, managed run `29909954329`, proved the corrected Firebase registration path on the managed Android emulator: exact-source checkout, backend preflight, GitHub OIDC, least-privilege FCM bootstrap verification, Firebase app/config resolution, APK build, emulator provisioning and synthetic FCM registration all passed.
- The same run then failed before any backend image deployment or push delivery because the old canary attempted to create a new Secret Manager secret and mutate its IAM policy from the intentionally least-privileged GitHub deployer identity. Sanitized result: `PERMISSION_DENIED`.
- PR #371 replaced that obsolete runtime-admin behavior with one owner-provisioned empty Secret Manager container named `direkt-fcm-canary-token`. The canary may create only a temporary numeric secret version, pin that exact version into the private Cloud Run Job, delete the job, and destroy that version during cleanup.
- `scripts/rc4/verify-fcm-canary-secret-lifecycle.py` and its dedicated workflow fail closed on runtime secret creation, IAM mutation, `latest`, hard-coded version 1, whole-secret deletion or broad Secret Manager admin.

## Least-privilege bootstrap and managed closure

The owner bootstrap completed successfully on 2026-07-22 for the fixed `direkt-fcm-canary-token` container. It created no secret value and verified only secret-scoped `roles/secretmanager.secretVersionManager` for the GitHub deployer and `roles/secretmanager.secretAccessor` for the runtime identity.

Exact-main managed run `29916381754` on `f05ff19105cb8dc7c4621c044c110b6029f63300` then passed the complete RC4 proof: synthetic Firebase registration, temporary numeric secret version creation, immutable backend image/private Cloud Run Job deployment, foreground and background outbox → FCM → Android receipts, sanitized evidence publication, Cloud Run Job deletion, and temporary secret-version destruction. Artifact `rc4-fcm-canary-29916381754` has digest `sha256:f45d1924ee6138f86ec15a222e97f28ff67bbe9c610ff75f57666fd03929526c`.

RC4 is therefore closed as `ACTIVE — SYNTHETIC-ONLY MANAGED CANARY`. Participant registration, participant/production push, Test Lab, Maps, WhatsApp, payment activation, Phase 11 exit and Phase 12 production release remain separately gated. RC5 Firebase Test Lab is the next integration checkpoint after an explicit lane claim.
