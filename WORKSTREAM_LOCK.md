# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — RC6 WhatsApp Cloud API; RC5 and UIA parked by explicit owner sequencing override |
| Owner/agent | Active repository agent — Issue #261 runtime integration closure, RC6 WhatsApp Cloud API checkpoint. |
| Authorized scope | RC6 only: implement the application-managed WhatsApp Cloud API backend adapter through the transactional outbox, consent-at-send and opt-out enforcement, approved-template controls, signed webhook verification, durable idempotency/retry/delivery-receipt state, privacy-safe payload rules, fail-closed configuration/kill switch, and a synthetic managed canary only where provider state permits. No RC5 Test Lab proof-bridge merge, Maps, payments, generated-client migration, Turnstile, production auth, real-participant activation or production release is authorized in this lane. |
| Protected surface | RC5 Firebase Test Lab source/workflows and draft proof bridge PR #378; UIA browser/Android/operations owner-review surfaces and Issue #354; backend/database/OpenAPI trust and authorization boundaries; private API/BFF IAM; operations authorization/private evidence controls; payments; VC1–VC8 Design DNA; Phase 11/12 gates; Android auth/signing/Play/Data Safety; RC0–RC4 closure evidence. |
| Implementation branch | `integration/rc6-whatsapp-sequencing-fed6db8` from exact current `main@fed6db8ab7c479b5e47095b4f0a752514122a4f6`. |
| Stable baseline | UIA promotion PR #385 is merged at `fed6db8ab7c479b5e47095b4f0a752514122a4f6`. RC5 source PR #377, IAM correction PR #379 and the owner-created least-privilege custom roles/results bucket are preserved, but RC5 remains `IMPLEMENTED_GATED / MANAGED MATRIX PENDING`: final owner-side read-only verification and exact-current-main managed Test Lab proof are not complete because Google Cloud Shell is temporarily quota-blocked. Draft PR #378 remains parked. UIA Issue #354 remains open for remaining owner-access acceptance evidence and is parked/read-only during RC6. RC4 remains closed with managed FCM proof run `29916381754` successful. |
| Current task | RC6 — close the WhatsApp Cloud API application adapter at a fail-closed synthetic/runtime boundary without activating real participant or production delivery. |
| Governing issue | Issue #261 — Runtime integration closure after W8. Owner sequencing override recorded 2026-07-23; Issue #354 UIA remains parked/open; RC5 remains parked/open. |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized. |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates. |

## W8 historical closure receipt — CLOSED AND PRESERVED

The following strings are historical closure evidence required by the permanent W8 cutover verifier; they do not describe current lock ownership:

- Historical lock row: `Status | RELEASED`.
- W8 — controlled route/deployment cutover completed with a dedicated least-privilege runtime identity.
- Canonical owner-review host: `https://app.direkt.forum`; historical preview remains `https://direkt.forum/preview/`.
- W8 implementation claim is **RELEASED**. Current implementation ownership is RC6 under Issue #261 as declared in the Current lock table above.

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
10. RC5 remains `IMPLEMENTED_GATED / MANAGED MATRIX PENDING` until owner-controlled bootstrap verification, exact-current-main managed Test Lab execution, sanitized result/artifact evidence, permanent verifier promotion and status/ledger reconciliation are complete. Draft PR #378 remains preserved and parked until RC5 resumes after RC6 or an explicit later coordination decision.

## UIA owner-review promotion contract — PARKED AND PRESERVED

1. UIA is an acceptance/promotion checkpoint, not a new visual-design phase. The approved VC1–VC8 Structured Trust + Neighbourhood Marketplace + Field Utility direction is preserved.
2. Every promoted owner-review surface must be tied to an exact merged source on `main`; no stale prototype or pre-VC deployment may be represented as the current product.
3. The canonical browser review remains synthetic/public-safe and must preserve the private API/BFF IAM boundary, privacy controls, offline/PWA contract and `https://direkt.forum/preview/` historical preview separation.
4. Android distribution remains internal/preauthorization only through the approved Firebase App Distribution tester group; no Play production release or unrestricted tester enrollment is authorized.
5. Operations remains protected/private. Synthetic supervisor/session/queue/evidence presentation may be used for visual review but must not be represented as connected real-operations UAT or grant consequential decision authority.
6. No real participant data, production auth, private evidence activation, real communications, real money movement or Phase 11/12 release authority is introduced by UIA.
7. Owner-facing evidence must come from production-built or equivalent clean runtime presentation with no Next.js development toolbar, `1 Issue` badge, debug/canary labels or other developer-only UI leakage.
8. Existing backend, Android, PWA, portal, supply-chain, privacy, authorization and integration regressions remain mandatory; RC6 must not weaken them.
9. UIA Issue #354 remains open for remaining owner-access/acceptance evidence but is read-only/parked while RC6 owns the single write lane.
10. UIA closes only after the owner has straightforward current access to the final VC browser, Android and protected operations surfaces and Issue #354 explicitly distinguishes visual/synthetic review, connected development/staging UI testing, real Phase 11 participant UAT and production release.

## RC6 implementation contract — ACTIVE OWNER-AUTHORIZED CHECKPOINT

1. WhatsApp send authority is backend-owned and application-managed; Android/browser clients never receive Meta/WhatsApp credentials or directly decide provider delivery state.
2. Outbound WhatsApp delivery originates from the DIREKT transactional outbox and must preserve stable idempotency across retries.
3. Consent and opt-out state are checked at send time; a queued event cannot bypass a later withdrawal or channel-specific opt-out.
4. Only approved/template-governed payloads may be sent where Meta policy requires templates; unrestricted free-form participant messaging is not introduced by RC6.
5. Payloads must not include identity documents, certificates, raw evidence, auth tokens, exact private coordinates, reviewer notes or other restricted/private evidence.
6. Webhook authenticity must be verified before delivery/read/failure receipts affect durable DIREKT state; duplicate/out-of-order webhook events must be handled idempotently.
7. Retries are bounded, observable and fail-closed; provider errors cannot silently become `delivered` or erase original failure evidence.
8. A kill switch/provider enablement gate must default real/participant delivery off. Synthetic managed proof may run only with bounded synthetic/non-personal data and approved provider state.
9. Production/participant WhatsApp delivery remains disabled until business/phone/template/provider/legal/privacy approvals and later release authorization are explicitly evidenced.
10. Existing RC0–RC5, UIA, backend/database/OpenAPI, Android/PWA/portal, payment, privacy, authorization and production-release gates remain regression-protected.

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
- RC5 — Firebase Test Lab device-matrix automation. **PARKED / NOT CLOSED — source PR #377 plus IAM correction PR #379 are merged; least-privilege custom roles and dedicated results bucket have been created/partially verified; final owner-side verification and exact-current-main managed matrix proof are pending because Cloud Shell is temporarily quota-blocked; draft PR #378 preserved.**
- UIA — post-VC owner-review promotion. **PARKED / OPEN — PR #385 merged at `fed6db8ab7c479b5e47095b4f0a752514122a4f6`; Issue #354 remains open for remaining owner-access evidence; read-only while RC6 owns the lane.**
- RC6 — WhatsApp Cloud API application adapter. **ACTIVE OWNER-AUTHORIZED CHECKPOINT — sequencing override permits RC6 source/runtime work while RC5 remains parked; production/participant sends remain gated.**
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

RC6 under Issue #261 is the sole active implementation lane under the owner-authorized 2026-07-23 sequencing override. RC5 remains parked/not closed and PR #378 must not merge while RC6 owns the lane; owner-side RC5 read-only verification may resume when Cloud Shell access returns but cannot be represented as RC5 closure without exact-current-main managed Test Lab proof. UIA Issue #354 remains parked/read-only and its protected surfaces must not be modified outside RC6 necessity. RC7+ source work must not begin until RC6 releases or is explicitly re-coordinated.