# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — RC5 Firebase Test Lab device-matrix closure |
| Owner/agent | Active repository agent — Issue #261 runtime integration closure workstream. |
| Authorized scope | Firebase Test Lab only: repair the current Android instrumentation smoke contract, build exact-reviewed debug/app-test APKs, add least-privilege GitHub OIDC Test Lab execution, run a small controlled device/API matrix, retain sanitized bounded artifacts/results, promote a permanent verifier, and reconcile status/ledger. No UIA browser/operations promotion, Maps, WhatsApp, payment, production auth or unrelated backend/PWA/portal feature work is authorized in RC5. |
| Protected surface | Backend/database/OpenAPI, web/PWA, operations portal, trust/privacy, payments, integrations, VC1–VC8 completion, Phase 11/12 gates, Android auth/distribution/signing/Play/Data Safety and RC0–RC4 evidence remain regression-protected. |
| Implementation branch | `integration/rc5-firebase-test-lab` from merged RC4 closeout baseline `9ce693c8a9d248283ff5bef30bf1842fee78faf7`. |
| Stable baseline | RC4 closure PR #376 merged at `9ce693c8a9d248283ff5bef30bf1842fee78faf7`; exact-main FCM managed proof run `29916381754` succeeded on `f05ff19105cb8dc7c4621c044c110b6029f63300`; participant/production push remains disabled. |
| Current task | RC5 — repair stale instrumentation assertions without weakening the UI, add exact-source Firebase Test Lab automation and a bounded supported-device matrix, prove managed instrumentation execution and artifact retention, then reconcile status and release/transition the lane. |
| Governing issue | Issue #261 — Runtime integration closure after W8; Issue #259 VC1–VC8 is closed and preserved as baseline. |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized. |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates. |

## RC3 implementation contract — CLOSED AND PRESERVED

1. Crashlytics is the Android crash/ANR telemetry path; Android Sentry remains inactive.
2. Automatic Crashlytics collection is disabled by default. Only the explicit synthetic/debug canary path may opt in for bounded proof.
3. RC3 did not add Firebase Analytics merely to obtain breadcrumbs or session context.
4. No raw evidence, contact data, auth tokens, cookies, precise private coordinates, provider-reviewer notes or unrestricted free text may be attached to Crashlytics.
5. No stable participant identifier is set as a Crashlytics user ID; synthetic canaries use non-identifying bounded metadata only.
6. Release/build mapping remains source-controlled and compatible with existing preauthorization signing/version controls.
7. Synthetic crash and ANR proof does not create a production-accessible crash trigger; the canary entry point remains debug/test-only and absent from the release manifest/runtime.
8. Existing Firebase Auth/App Distribution behavior remains intact.
9. The permanent integration verifier positively asserts Crashlytics/privacy/canary controls and remains mandatory.
10. RC3 is `ACTIVE — SYNTHETIC-ONLY MANAGED CANARY`; participant/production crash telemetry remains separately gated.

## RC4 implementation contract — CLOSED AND PRESERVED

1. FCM send authority is backend-owned. Android/browser clients never receive server credentials or decide delivery truth.
2. Push delivery originates from a DIREKT-controlled transactional outbox event and records durable success/failure state.
3. Device tokens are identity-bound server-side, may be registered/rotated/deleted only by the authenticated identity, are never logged, and are removed/disabled on provider invalid-token responses.
4. FCM is fail-closed by default. Production and controlled-pilot participant push remain disabled during RC4; the managed canary is synthetic-only.
5. Android must support foreground/background receipt and Android 13+ notification permission without making permission grant an authentication, trust, verification or service-access prerequisite.
6. Push payloads contain only bounded routing/display identifiers; no raw evidence, auth tokens, contact data, exact private coordinates, reviewer notes or unrestricted free text.
7. Retries are bounded and idempotency/deduplication identifiers are stable across retry attempts.
8. The managed canary must prove exact reviewed source, a registered synthetic device token, backend outbox/provider send success, and Android receipt on the managed emulator/device.
9. RC4 must not activate Firebase Test Lab, Maps, Analytics or unrelated Firebase products early.
10. RC4 is `ACTIVE — SYNTHETIC-ONLY MANAGED CANARY`; participant registration and participant/production push remain separately gated.

## RC5 implementation contract — ACTIVE

1. Firebase Test Lab is a testing/evidence service only; it does not authorize production release, participant enrollment, production auth, real communications or real private evidence.
2. The Test Lab workflow must build and test an exact reviewed source SHA that is already merged to `main` for managed proof, while pull-request CI may validate source changes before merge.
3. Android instrumentation assertions must reflect the current post-VC product semantics and stable accessibility/test tags; stale copy must be repaired rather than changing the approved UI merely to satisfy an old test.
4. The managed matrix must remain small, explicit and cost-bounded, and must use currently supported Firebase Test Lab model/version pairs discovered from the live catalog rather than guessed/stale device identifiers.
5. Coverage must include the minimum supported Android boundary where feasible, the Android 13 notification-permission era, and a current platform baseline without multiplying redundant devices.
6. Test APKs, app APKs, result summaries and retained artifacts must contain only synthetic/public-safe data and no production credentials, participant data, raw tokens, private evidence or exact private provider coordinates.
7. GitHub Actions must authenticate through existing Workload Identity Federation and use the narrowest practical Test Lab/result-storage permissions; project Editor/Owner and long-lived service-account keys are prohibited.
8. Test results must be machine-enforced: a matrix/infrastructure/test failure cannot be documented as passing, and flaky reruns must not erase the original failed evidence.
9. Existing Android unit/lint/build, App Distribution, Crashlytics, FCM, signing, Play/Data Safety and cross-client regression gates remain intact.
10. RC5 is not `ACTIVE` until exact-head source/regression evidence, managed Test Lab execution, sanitized result/artifact evidence, permanent verifier promotion and status/ledger reconciliation are complete.

## Runtime integration closure contract

1. Close one bounded integration checkpoint at a time; do not batch unrelated SDK/provider activation.
2. An external account, API key, DSN, secret or dashboard project is not `ACTIVE` evidence by itself.
3. Each closure requires applicable source integration, least-privilege secret/runtime binding, privacy/security controls, fallback or kill switch, managed canary/device evidence, exact-head regressions and status documentation.
4. Android/browser clients call DIREKT-controlled API/BFF boundaries; they do not receive privileged provider, database, payment, AI, registry or telemetry-auth credentials.
5. Real participants, real external communications, real payment movement, production auth and production release remain separately gated.
6. Payment state cannot create or improve verification, publication or ranking authority.
7. AI output cannot independently verify providers, change trust/ranking/publication, authorize payments/escrow, decide disputes, override consent/authorization or act as legal/regulatory authority.
8. Exact private provider coordinates, raw evidence, contact data, credentials and tokens must not leak into telemetry, public maps, browser caches or provider payloads.
9. Sentry auth tokens remain CI/release tooling only and must never bind to API, portal, Android or browser runtime.
10. The workstream releases or transitions the lane only after status/ledger reconciliation, exact-head regression matrix, managed evidence and handoff are promoted.

## Dependency-safe implementation sequence

- RC0 — integration ledger, dependency/source audit, permanent-gate ownership sanity check and payment evidence reconciliation. **Closed — PR #263.**
- AI0 — provider-neutral AI foundation. **Closed — PR #265; runtime activation remains per-use-case and data-classification gated.**
- RC1 — Resend transactional-outbox runtime. **Closed; synthetic managed execution proven; real-participant/production email remains disabled.**
- RC2 — Sentry for approved NestJS/Next.js surfaces. **Closed — PR #275 source + managed synthetic API/private-portal canary + closure PR #280; participant/production telemetry remains disabled.**
- RC3 — Firebase Crashlytics Android. **Closed — exact source `9098f7eb333baf096163f1564b3d8e5e5da3fcf0`; managed bridge run `29885635547` successful; closure PR #338 merged at `0d7d29313990c37b25bd985588866a85bbe10f83`.**
- RC4 — FCM push delivery: server send path, token lifecycle, Android notification handling/permissions, retries and managed canary. **CLOSED — exact source `f05ff19105cb8dc7c4621c044c110b6029f63300`; managed run `29916381754` successful; participant/production push disabled.**
- RC5 — Firebase Test Lab device-matrix automation after Android runtime dependencies stabilize through RC3–RC4. **ACTIVE CHECKPOINT.**
- RC6 — WhatsApp Cloud API application adapter using outbox/idempotency/consent/template/delivery-receipt rules; production sends remain gated until provider/legal approvals exist.
- RC7 — Google Maps runtime activation with separate restricted Android/backend credentials, privacy-safe publication semantics, quotas, manual/list fallback and kill switch.
- RC8 — sandbox-only payment-provider adapter closure/reconciliation for already proven MTN, DPO, Stripe and PayPal rails; Airtel remains provider-pending and Flutterwave deferred; real money remains disabled.
- RC9 — OpenAPI-generated Kotlin and TypeScript client adoption/decision after backend integration/API shape stabilizes; migrate incrementally with cross-client regressions.
- RC10 — Turnstile threat-model decision; implement only if a reviewed public abuse-sensitive flow requires it, otherwise close as not currently justified.
- RC11 — combined integration regression, managed evidence index, live ledger/status reconciliation and lane release.

## Persistent stop conditions

Stop rather than merge or activate a later checkpoint if it would:

- regress Android/backend/database/OpenAPI/web/portal required gates;
- weaken Cloud Run IAM or expose privileged Supabase/database/Storage access;
- expose private evidence, raw contact data or exact private provider coordinates;
- fabricate or bypass participant, legal/privacy, payment, AI-provider or production-release gates;
- accept client-selected provider scope or authorization;
- allow commercial/payment state to influence verification or public trust claims;
- allow AI output to become authoritative verification/trust/payment/dispute/publication authority;
- store production credentials, model/provider secrets or telemetry admin tokens in application runtime or browser-readable surfaces;
- replace backend-authoritative behavior with static fixtures while claiming runtime completion;
- mark an integration or AI use case `ACTIVE` without exact configured-provider/runtime evidence.

## Conflict rule

RC5 Firebase Test Lab is the sole active implementation lane. UIA Issue #354 may continue read-only evidence analysis but must not deploy or write overlapping Android/backend/PWA/portal surfaces until RC5 releases or explicitly coordinates a non-overlapping transition. RC6+ source work must not begin until RC5 has exact-head regressions, managed Test Lab evidence, status reconciliation, merge promotion and a released/transitioned lock.
