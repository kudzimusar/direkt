# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — full integration reconciliation, regression audit and UI-test readiness |
| Owner/agent | OpenAI GPT-5.5 Thinking |
| Formal programme phase | Phase 11 remains open; formal Phase 12 production release is not authorized |
| User-authorized scope | Re-audit all currently clearable Phase 12 work, regressions, and every integration introduced across earlier phases; correct source/runtime mismatches that can be safely cleared; finish with a practical UI-testing path |
| Stable baseline | `main` at `d9ae39963ace0ef99ad744f5615a98dbec058463`; `build/android-v1` is 0 behind with no file differences before this claim |
| Governing issues | Issue #112 remains open; Issue #133 reconciliation/PWA checkpoint is already promoted |
| Release boundary | No real pilot evidence fabrication, production signing, Play publication, public backend traffic, live payments, or bypass of legal/regulatory/Phase 11 gates |

## Audit coverage

- Supabase PostgreSQL/PostGIS/Storage and Data API boundary;
- Cloud Run, Artifact Registry, Secret Manager, WIF, Logging/Monitoring;
- Firebase App Distribution/Auth/Crashlytics/FCM/Test Lab;
- domain/DNS/Pages/Cloudflare edge and email routing;
- Resend/Brevo/OTP/WhatsApp/outbox/asynchronous delivery;
- Maps/location privacy and fallback;
- Sentry/telemetry privacy;
- Vercel versus current Cloud Run portal hosting;
- OpenAPI/generated client boundaries;
- payments and verification-authority adapters;
- Android, operations portal and customer/provider PWA UI testability;
- regression/security/release gates.

## Conflict rule

No second agent may write to the audited integration/runtime/UI paths while this lock is claimed. Read-only review is allowed. The lock is released only after corrective PRs are promoted, branches synchronized, final regressions pass and the UI-test handoff is recorded.
