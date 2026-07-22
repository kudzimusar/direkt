# RC4 FCM implementation notes

Temporary implementation-branch note. RC4 is claimed from exact merged RC3 baseline `0d7d29313990c37b25bd985588866a85bbe10f83` under Issue #261.

Scope is limited to Firebase Cloud Messaging: backend provider-neutral send adapter through the transactional outbox, device-token lifecycle, Android foreground/background handling and runtime notification permission, retry/idempotency/privacy controls, exact-source managed synthetic canary, permanent verifier promotion, and status/ledger reconciliation.

No Test Lab, Maps, WhatsApp, payment activation, participant/production push, Phase 11 exit or Phase 12 production release is authorized by this claim.
