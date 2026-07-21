# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — runtime integration closure after W8 |
| Owner/agent | Active repository agent — Issue #261 runtime integration closure workstream |
| Authorized scope | Dependency-audit, source/runtime closure and managed evidence for integrations tracked by Issue #261 plus reconciliation of newly proven sandbox payment-provider evidence; one bounded integration checkpoint at a time |
| Protected surface | Android, backend/database/OpenAPI, web/PWA, operations portal, CI, trust/privacy, payments and release boundaries remain regression-protected; VC0 design/audit work under Issue #259 may continue only on non-overlapping design-control surfaces |
| Implementation branch | `integration/runtime-closure-261` from clean `main` baseline; do not build new integration work on the currently diverged historical `build/android-v1` branch until history is reconciled |
| Stable baseline | `main` at W8 closure merge `a06a66d313d8417d8b7731e3d845c1c71bda3dd4`; canonical app `https://app.direkt.forum`; W8 verification run `29802524466` |
| Current task | RC0 — dependency/current-source audit, live integration ledger promotion, historical W7/W8 verifier ownership decoupling if required, then sequential runtime integration closure |
| Governing issue | Issue #261 — Runtime integration closure after W8 |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates |

## Runtime integration closure contract

1. Close one bounded integration checkpoint at a time; do not batch unrelated SDK/provider activation.
2. An external account, API key, secret or dashboard project is not `ACTIVE` evidence by itself.
3. Each closure requires applicable source integration, least-privilege secret/runtime binding, privacy/security controls, retry/idempotency/fallback or kill switch, managed canary/device evidence, exact-head regressions and status documentation.
4. The transactional outbox remains the domain source of truth for asynchronous external delivery.
5. Android/browser clients call DIREKT-controlled API/BFF boundaries; they do not receive privileged provider, database, payment or registry credentials.
6. Real participants, real external communications, real payment movement, production auth and production release remain separately gated.
7. Payment state cannot create or improve verification, publication or ranking authority.
8. Exact private provider coordinates, raw evidence, contact data, credentials and tokens must not leak into telemetry, public maps, browser caches or provider payloads.
9. Generated-client adoption must follow API-shape stabilization and preserve backward compatibility across Android and web.
10. Turnstile is implemented only if an approved abuse-control design demonstrates a concrete public-flow need.
11. VC0 under Issue #259 may continue as read-only/design-control work but must not modify overlapping runtime-integration surfaces while this lock is claimed.
12. The workstream releases the lane only after the final integration status ledger, exact-head regression matrix and handoff are promoted.

## Dependency-safe implementation sequence

- RC0 — integration ledger, dependency/source audit, permanent-gate ownership sanity check and payment evidence reconciliation.
- RC1 — Resend runtime email adapter through the transactional outbox, idempotency/retry/privacy/templates and managed canary.
- RC2 — Sentry for approved NestJS/Next.js surfaces with strict PII scrubbing, release/source-map controls and kill switch; Cloud Logging remains authoritative infrastructure telemetry.
- RC3 — Firebase Crashlytics Android activation with privacy/release mapping and synthetic crash/ANR evidence.
- RC4 — FCM push delivery: server send path, token lifecycle, Android notification handling/permissions, retries and managed canary.
- RC5 — Firebase Test Lab device-matrix automation after the Android runtime dependency set stabilizes through RC3–RC4.
- RC6 — WhatsApp Cloud API application adapter using outbox/idempotency/consent/template/delivery-receipt rules; production sends remain gated until provider/legal approvals exist.
- RC7 — Google Maps runtime activation with separate restricted Android/backend credentials, privacy-safe publication semantics, quotas, manual/list fallback and kill switch.
- RC8 — sandbox-only payment-provider adapter closure/reconciliation for already proven MTN, DPO, Stripe and PayPal rails; Airtel remains provider-pending and Flutterwave deferred; real money remains disabled.
- RC9 — OpenAPI-generated Kotlin and TypeScript client adoption/decision after backend integration/API shape stabilizes; migrate incrementally with cross-client regressions.
- RC10 — Turnstile threat-model decision; implement only if a reviewed public abuse-sensitive flow requires it, otherwise close as not currently justified.
- RC11 — combined integration regression, managed evidence index, live ledger/status reconciliation and lane release.

## Completed W0–W8 workstream contract

1. The functional browser client is additive under `web/direkt-app/`; Android remains the primary native Version 1 client.
2. Android and web share product semantics through the canonical NestJS REST/OpenAPI boundary, not shared UI binaries.
3. The browser uses a reviewed BFF/session boundary; the canonical API remains IAM-private.
4. No direct privileged Supabase/database/Storage credentials or authority enter browser code.
5. Shared backend/OpenAPI behavior remains backward compatible with Android and regression-tested.
6. Mobile web uses Android-aligned bottom navigation; desktop uses persistent side navigation with the same product capabilities.
7. No preview/static fixture is counted as functional parity where an authoritative backend capability exists.
8. Browser authentication/session state remains server-controlled; provider scope and DIREKT authorization are backend-authoritative.
9. Customer/provider mutations use canonical lifecycle, eligibility, consent, revision and idempotency rules.
10. Commercial state cannot create or improve verification/publication/ranking authority; real money movement remains separately gated.
11. W7 closed only after combined Android/backend/database/OpenAPI/web regression, responsive/accessibility/offline/privacy negatives and managed browser evidence passed.
12. W8 exposed only the reviewed browser/BFF entry point using dedicated least-privilege runtime identity `direkt-cp-web-runtime@direkt-dev-502701.iam.gserviceaccount.com`; the API remained private.
13. Managed W8 attempt 8 passed on runtime source `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`, run `29721199177`, artifact digest `sha256:00a0d41e8b8824d7764ab9762f05816bac3639d9360ed8926071c346f066e0b0`.
14. Canonical host `https://app.direkt.forum` passed independent exact-head DNS/TLS/runtime/PWA/BFF/session/privacy/preview verification on `a831b58f8f6684bd345b668c1dfb4d8aab70c5c5`, run `29802524466`, artifact digest `sha256:1fc4c334f79f8f6b0f30fcaf55d2d19ea2941cdebc8c5eabf886a913704ea786`.
15. `https://direkt.forum/preview/` remains preserved as the explicit synthetic historical/review route.
16. W8 closure does not authorize real participants, real evidence, production authentication, external communications/payment activation, Phase 11 exit or production release.

## Persistent stop conditions

Stop rather than merge if a checkpoint would:

- regress Android/backend/database/OpenAPI/web/portal required gates;
- weaken Cloud Run IAM or expose privileged Supabase/database/Storage access;
- expose private evidence, raw contact data or exact private provider coordinates;
- fabricate or bypass participant, legal/privacy, payment or production-release gates;
- accept client-selected provider scope or authorization;
- allow commercial/payment state to influence verification or public trust claims;
- store production credentials in source or browser-readable surfaces;
- replace backend-authoritative behavior with static fixtures while claiming runtime completion;
- mark an integration `ACTIVE` without managed runtime evidence.

## Conflict rule

No second agent may write to overlapping runtime-integration surfaces while this claim is active. Read-only review and the isolated VC0 design-control branch may continue. The lock is released only after bounded checkpoints are promoted, final regressions pass, integration status/ledger are reconciled and the next handoff is recorded.
