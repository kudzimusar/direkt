# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — UIA owner-review promotion; RC5 parked at owner-controlled infrastructure boundary |
| Owner/agent | Active repository agent — Issue #354 runnable surfaces acceptance and connected UI review. |
| Authorized scope | UIA promotion only: promote an exact merged post-VC/current `main` source to the synthetic owner-review browser runtime, refresh/verify the approved internal Android App Distribution build, refresh/verify the protected operations review surface where the existing deployment path permits it, capture clean production-built responsive evidence, and reconcile owner-access acceptance. No redesign, RC5 Test Lab source change, Maps, WhatsApp, payment, production auth, real-participant activation or unrelated backend feature work is authorized. |
| Protected surface | RC5 Firebase Test Lab source/workflows and draft proof bridge PR #378, backend/database/OpenAPI trust and authorization boundaries, private API/BFF IAM, operations authorization/private evidence controls, payments, integrations, VC1–VC8 design baseline, Phase 11/12 gates, Android auth/signing/Play/Data Safety and RC0–RC4 evidence remain regression-protected. |
| Implementation branch | `integration/uia-owner-review-transition-1ca498` from `main@1ca498657e193a331c3c6de70579128e20bce043`. |
| Stable baseline | RC5 source PR #377 merged at `7e718ce0a1a5d5e58b04566e7f14c8fbc5ddc463`; Next.js 16.2.11 security update PR #380 merged at `8c08168faa8205c06401a4bff06f017a39d34536`; RC5 project-applicable IAM correction PR #379 merged at current `main@1ca498657e193a331c3c6de70579128e20bce043` after exact-head RC5 contract, PWA, documentation, supply-chain and integration-runtime gates passed. RC5 remains `IMPLEMENTED_GATED / MANAGED MATRIX PENDING` at an owner-controlled Google Cloud bootstrap boundary; draft PR #378 is preserved and must remain unmerged while UIA owns exact-current-main promotion. RC4 remains closed with managed FCM proof run `29916381754` successful. |
| Current task | UIA — make the already-completed VC1–VC8 product directly reviewable by the owner on the canonical browser host, current internal Android build and protected operations surface, without changing the approved visual direction or weakening synthetic/real-participant boundaries. |
| Governing issue | Issue #354 — UIA runnable surfaces acceptance and connected UI review. Issue #261 RC5 remains parked, not closed. |
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

## RC5 implementation contract — SOURCE COMPLETE; MANAGED MATRIX PENDING

1. Firebase Test Lab is a testing/evidence service only; it does not authorize production release, participant enrollment, production auth, real communications or real private evidence.
2. The Test Lab workflow must build and test an exact reviewed source SHA that is already merged to `main` for managed proof, while pull-request CI may validate source changes before merge.
3. Android instrumentation assertions must reflect the current post-VC product semantics and stable accessibility/test tags; stale copy must be repaired rather than changing the approved UI merely to satisfy an old test.
4. The managed matrix must remain small, explicit and cost-bounded, and must use currently supported Firebase Test Lab model/version pairs discovered from the live catalog rather than guessed/stale device identifiers.
5. Coverage must include the minimum supported Android boundary where feasible, the Android 13 notification-permission era, and a current platform baseline without multiplying redundant devices.
6. Test APKs, app APKs, result summaries and retained artifacts must contain only synthetic/public-safe data and no production credentials, participant data, raw tokens, private evidence or exact private provider coordinates.
7. GitHub Actions must authenticate through existing Workload Identity Federation and use the narrowest practical Test Lab/result-storage permissions; project Editor/Owner and long-lived service-account keys are prohibited.
8. Test results must be machine-enforced: a matrix/infrastructure/test failure cannot be documented as passing, and flaky reruns must not erase the original failed evidence.
9. Existing Android unit/lint/build, App Distribution, Crashlytics, FCM, signing, Play/Data Safety and cross-client regression gates remain intact.
10. RC5 remains `IMPLEMENTED_GATED / MANAGED MATRIX PENDING` until owner-controlled bootstrap, exact-current-main managed Test Lab execution, sanitized result/artifact evidence, permanent verifier promotion and status/ledger reconciliation are complete. Draft PR #378 remains the preserved one-shot proof bridge and must not merge while UIA owns the exact-current-main lane.

## UIA owner-review promotion contract — ACTIVE

1. UIA is an acceptance/promotion checkpoint, not a new visual-design phase. The approved VC1–VC8 Structured Trust + Neighbourhood Marketplace + Field Utility direction is preserved.
2. Every promoted owner-review surface must be tied to an exact merged source on `main`; no stale prototype or pre-VC deployment may be represented as the current product.
3. The canonical browser review remains synthetic/public-safe and must preserve the private API/BFF IAM boundary, privacy controls, offline/PWA contract and `https://direkt.forum/preview/` historical preview separation.
4. Android distribution remains internal/preauthorization only through the approved Firebase App Distribution tester group; no Play production release or unrestricted tester enrollment is authorized.
5. Operations remains protected/private. Synthetic supervisor/session/queue/evidence presentation may be used for visual review but must not be represented as connected real-operations UAT or grant consequential decision authority.
6. No real participant data, production auth, private evidence activation, real communications, real money movement or Phase 11/12 release authority is introduced by UIA.
7. Owner-facing evidence must come from production-built or equivalent clean runtime presentation with no Next.js development toolbar, `1 Issue` badge, debug/canary labels or other developer-only UI leakage.
8. Existing backend, Android, PWA, portal, supply-chain, privacy, authorization and integration regressions remain mandatory; UIA must not weaken them to obtain a visual pass.
9. RC5 owner-side Google Cloud provisioning may proceed independently because it does not modify repository source, but PR #378 must remain draft/unmerged until UIA releases the exact-current-main lane; after UIA closure RC5 resumes from the then-current reconciled `main` as required by its exact-current-main proof contract.
10. UIA closes only after the owner has straightforward current access to the final VC browser, Android and protected operations surfaces and Issue #354 explicitly distinguishes visual/synthetic review, connected development/staging UI testing, real Phase 11 participant UAT and production release.

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
- RC5 — Firebase Test Lab device-matrix automation after Android runtime dependencies stabilize through RC3–RC4. **PARKED — source PR #377 plus IAM correction PR #379 are merged; exact-head regressions are green; owner-controlled Google Cloud bootstrap and managed matrix proof remain pending; draft PR #378 preserved.**
- UIA — post-VC owner-review promotion. **ACTIVE COORDINATED TRANSITION — bounded browser/Android/operations review promotion only; no redesign or participant/production activation.**
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

UIA Issue #354 is the sole active implementation lane during this coordinated transition. RC5 source/workflow changes and PR #378 merge are frozen; owner-controlled Google Cloud provisioning may proceed independently because it does not change repository source. RC6+ source work must not begin until UIA releases the lane and RC5 is either resumed for its exact-current-main managed proof or explicitly re-coordinated. UIA must not modify RC5 Test Lab files or broaden Android/backend/PWA/portal authority beyond the bounded owner-review promotion contract above.
