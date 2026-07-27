# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | RELEASED |
| Owner/agent | None — RC8 is closed; Issue #261 remains the runtime-integration tracker. |
| Authorized scope | No active write lane. RC8 evidence is immutable/regression-protected. RC9 may begin only through a new explicit claim. Real money, participant data, production endpoints, customer-to-provider payments, escrow, wallet/payout authority and payment influence over verification/trust remain prohibited. |
| Protected surface | Closed RC0–RC8 evidence, including RC5 run `30183466799`, RC6 run `30137700769`, RC7 run `30234521983/1` and RC8 run `30241092949/1` on `ccc4e9463d810ddf554182b1607c22d3a7c8c8d3`; UIA Issue #354; backend/database/OpenAPI and commercial ledger trust boundaries; private API/BFF IAM; provider credentials; VC1–VC8 Design DNA; Phase 11/12 gates; Android auth/signing/Play/Data Safety. |
| Implementation branch | None — `docs/rc8-managed-closure` is the bounded closeout branch only. |
| Stable baseline | RC5–RC8 are closed. RC8 exact source `ccc4e9463d810ddf554182b1607c22d3a7c8c8d3` passed managed run `30241092949/1` with artifact `8643323319` (`sha256:bbb4600eb5a062552947e91c878dd09c6d1e4dc307ae4783c7fa1fb4cf6e4935`). Application provider registration, participant use, production credentials/endpoints and real-money movement remain disabled. UIA Issue #354 remains parked/open. |
| Current task | None. RC9 OpenAPI-generated client adoption/decision is next in sequence but is not claimed. |
| Governing issue | Issue #261 — Runtime integration closure after W8. No active repository lane; Issue #354 UIA remains parked/read-only. |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized. |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates. |

## W8 historical closure receipt — CLOSED AND PRESERVED

The following strings are historical closure evidence required by the permanent W8 cutover verifier; they do not describe current lock ownership:

- Historical lock row: `Status | RELEASED`.
- W8 — controlled route/deployment cutover completed with a dedicated least-privilege runtime identity.
- Canonical owner-review host: `https://app.direkt.forum`; historical preview remains `https://direkt.forum/preview/`.
- W8 implementation claim is **RELEASED**. No later implementation lane is currently claimed; RC5 closure is preserved below.

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

## RC5 implementation contract — CLOSED AND PRESERVED

1. Firebase Test Lab is a testing/evidence service only; it does not authorize production release, participant enrollment, production auth, real communications or real private evidence.
2. The Test Lab workflow must build and test an exact reviewed source SHA that is already merged to `main` for managed proof, while pull-request CI may validate source changes before merge.
3. Android instrumentation assertions must reflect the current post-VC product semantics and stable accessibility/test tags; stale copy must be repaired rather than changing the approved UI merely to satisfy an old test.
4. The managed matrix must remain small, explicit and cost-bounded, and must use currently supported Firebase Test Lab model/version pairs discovered from the live catalog rather than guessed/stale device identifiers.
5. Coverage must include the minimum supported Android boundary where feasible, the Android 13 notification-permission era, and a current platform baseline without multiplying redundant devices.
6. Test APKs, app APKs, result summaries and retained artifacts must contain only synthetic/public-safe data and no production credentials, participant data, raw tokens, private evidence or exact private provider coordinates.
7. GitHub Actions authenticates through existing Workload Identity Federation. Broad Test Lab authority is confined to the dedicated, empty Spark project `direkt-testlab-502701-20260726`; `roles/editor` is isolated there, `roles/owner` and service-account keys remain prohibited, and the main DIREKT project receives no broadening.
8. Test results must be machine-enforced: a matrix/infrastructure/test failure cannot be documented as passing, and flaky reruns must not erase the original failed evidence.
9. Existing Android unit/lint/build, App Distribution, Crashlytics, FCM, signing, Play/Data Safety and cross-client regression gates remain intact.
10. RC5 is `CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX`: exact source `c3744430a7beb1cd47246d858df9ac1379a068ac` passed run `30183466799` on `MediumPhone.arm` API 26, 33 and 36 with zero flaky retries. Artifact `8626329335` (`sha256:03a40951a23c937d8b0fd2990a7d2652afbd1172631c0b480af756aebd92a843`) is schema-valid. Participant/production authorization remains false; historical failures and superseded v2 infrastructure remain evidence only.

## UIA owner-review promotion contract — PARKED AND PRESERVED

1. UIA is an acceptance/promotion checkpoint, not a new visual-design phase. The approved VC1–VC8 Structured Trust + Neighbourhood Marketplace + Field Utility direction is preserved.
2. Every promoted owner-review surface must be tied to an exact merged source on `main`; no stale prototype or pre-VC deployment may be represented as the current product.
3. The canonical browser review remains synthetic/public-safe and must preserve the private API/BFF IAM boundary, privacy controls, offline/PWA contract and `https://direkt.forum/preview/` historical preview separation.
4. Android distribution remains internal/preauthorization only through the approved Firebase App Distribution tester group; no Play production release or unrestricted tester enrollment is authorized.
5. Operations remains protected/private. Synthetic supervisor/session/queue/evidence presentation may be used for visual review but must not be represented as connected real-operations UAT or grant consequential decision authority.
6. No real participant data, production auth, private evidence activation, real communications, real money movement or Phase 11/12 release authority is introduced by UIA.
7. Owner-facing evidence must come from production-built or equivalent clean runtime presentation with no Next.js development toolbar, `1 Issue` badge, debug/canary labels or other developer-only UI leakage.
8. Existing backend, Android, PWA, portal, supply-chain, privacy, authorization and integration regressions remain mandatory; RC5 must not weaken them.
9. UIA Issue #354 remains open and parked. RC5 no longer owns a write lane; UIA or RC7+ requires an explicit new claim before source changes.
10. UIA closes only after the owner has straightforward current access to the final VC browser, Android and protected operations surfaces and Issue #354 explicitly distinguishes visual/synthetic review, connected development/staging UI testing, real Phase 11 participant UAT and production release.

## RC6 implementation contract — CLOSED AND PRESERVED

1. WhatsApp send authority is backend-owned and application-managed; Android/browser clients never receive Meta/WhatsApp credentials or directly decide provider delivery state.
2. Outbound WhatsApp delivery originates from the DIREKT transactional outbox and must preserve stable idempotency across retries.
3. Consent and opt-out state are checked at send time; a queued event cannot bypass a later withdrawal or channel-specific opt-out.
4. Only approved/template-governed payloads may be sent where Meta policy requires templates; unrestricted free-form participant messaging is not introduced by RC6.
5. Payloads must not include identity documents, certificates, raw evidence, auth tokens, exact private coordinates, reviewer notes or other restricted/private evidence.
6. Webhook authenticity must be verified before delivery/read/failure receipts affect durable DIREKT state; duplicate/out-of-order webhook events must be handled idempotently.
7. Retries are bounded, observable and fail-closed; provider errors cannot silently become `delivered` or erase original failure evidence.
8. A kill switch/provider enablement gate must default real/participant delivery off. Synthetic managed proof may run only with bounded synthetic/non-personal data and approved provider state.
9. Production/participant WhatsApp delivery remains disabled until business/phone/template/provider/legal/privacy approvals and later release authorization are explicitly evidenced.
10. RC6 is `CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY`: exact-current-main managed run `30137700769` on source `8838b7a6d726a5aed44ce21a39506c1265a98d15` passed the private outbox → Meta `hello_world` test-template send → authentic signed webhook receipt path on retry. The initial pre-provider Google Cloud CLI setup failure remains preserved in Issue #404. Existing RC0–RC5, UIA, backend/database/OpenAPI, Android/PWA/portal, payment, privacy, authorization and production-release gates remain regression-protected; production/participant WhatsApp delivery remains disabled.

## RC7 implementation contract — CLOSED AND PRESERVED

1. RC7 activates only the APIs justified by the current product flow: Maps SDK for Android for map display and backend Geocoding for bounded search-area/address normalization. Places and Routes remain disabled because the existing manual area input and PostGIS distance/service-area logic already satisfy the reviewed flow.
2. Android and backend authentication remain separate. The Android key is restricted to DIREKT package/signing-certificate pairs and Maps SDK for Android; backend Geocoding uses the assigned Cloud Run service identity with a downscoped address-only OAuth token and no backend API key, secret value, static egress IP or Cloud NAT dependency.
3. Exact private provider bases never become public markers, polygons, distance origins, ranking inputs, logs, telemetry or provider payloads. Only consented public premises and privacy-approved service-area geometry may render.
4. Mobile providers render public service areas without a base marker. Fixed-premises markers require a consented public premises point. Hybrid providers may show the consented public premises and the separate public service area.
5. Manual area and list discovery remain fully functional and are never treated as lower trust. RC7 adds no background-location permission and cannot make device location a prerequisite for discovery, authentication, verification or service access.
6. Android Maps and backend Geocoding default disabled. Explicit source-controlled switches, valid protected credentials and synthetic-only non-production data are required for managed proof; provider outage, map-load failure or denied location capability must fall back safely.
7. Backend Geocoding accepts bounded search-area input, constrains results to Zambia, filters provider responses and never exposes or logs credentials, raw provider payloads, unnecessary coordinate precision or unrestricted free text.
8. Quotas, budget alerts, per-request timeout, bounded result count and rotation instructions are required. Routes and Places costs cannot be incurred because those APIs are not enabled or accepted by either credential.
9. Managed closure is proven on exact source `47285575862cbf08845eaeabe093afea1ea79bd1` through run `30234521983/1`: restricted key/API metadata, backend synthetic Geocoding, final APK restriction, API 36 map readiness and cleanup all passed. Artifact `8641270327` (`sha256:24da53c0bd6fa885fa4a6814f70af090096192e6c5b7a03c89fba51416877fde`) preserves the sanitized receipt; earlier failures remain preserved.
10. RC7 is `CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY`. It does not authorize participant Maps usage, private-location publication, production authentication, real communications, real money, Phase 11 exit or Phase 12 release.

## RC8 implementation contract — CLOSED AND PRESERVED

1. RC8 is limited to sandbox adapters, runtime proof and reconciliation for DIREKT-owned provider subscriptions, verification-processing fees and renewal/re-verification fees.
2. Real money, participant payment data, production provider endpoints or credentials, customer-to-provider service payments, escrow, stored value, wallets and marketplace payouts remain disabled and outside scope.
3. Source checkpoint PR #454 was replayed onto the RC8-claimed baseline and merged at `6098b71f89d62fa059de298be11a8d9d8539c25e` after the complete exact-head regression matrix passed without overwriting RC0–RC7 closure evidence.
4. Provider credentials remain server-side and Secret Manager-backed with least privilege. Android and browser clients never receive credentials or declare payment success.
5. Success requires independent provider verification plus exact provider reference, transaction identifier where applicable, amount and currency agreement with the backend-owned DIREKT intent and ledger.
6. Provider observations, payment events, ledger postings, mismatch cases and adjustments remain append-only and idempotent. A mismatch opens reconciliation; it is never silently repaired.
7. Refund and accounting-adjustment execution requires two independent approvers, requester exclusion, balanced ledger effects and operations-only revision-checked resolution.
8. Managed proof may bind only the existing reviewed MTN MoMo, Stripe and PayPal sandbox/test credentials. DPO remains source-integrated and externally sandbox-proven but runtime-unbound because no DIREKT private sandbox credential exists; Airtel remains provider-pending and Flutterwave remains deferred/excluded.
9. Managed evidence must use bounded synthetic values, sanitized receipts, exact reviewed source, explicit cleanup and no raw provider payload or credential leakage. A failed provider attempt remains preserved and cannot be documented as passing.
10. RC8 is `CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY`: exact source `ccc4e9463d810ddf554182b1607c22d3a7c8c8d3` passed run `30241092949/1` with artifact `8643323319` (`sha256:bbb4600eb5a062552947e91c878dd09c6d1e4dc307ae4783c7fa1fb4cf6e4935`). MTN independent success, Stripe unpaid Checkout retrieval, PayPal unapproved-order retrieval, immutable reconciliation, duplicate suppression, mismatch review, two-person adjustment planning and temporary-job cleanup all passed. The trigger is consumed; application runtime, production, participant and real-money authorization remain false.

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
- RC5 — Firebase Test Lab device-matrix automation. **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX — dedicated Spark project `direkt-testlab-502701-20260726`; exact source `c3744430a7beb1cd47246d858df9ac1379a068ac`; managed run `30183466799`; API 26/33/36; zero flaky retries; participant/production authorization false.**
- UIA — post-VC owner-review promotion. **PARKED / OPEN — PR #385 merged at `fed6db8ab7c479b5e47095b4f0a752514122a4f6`; Issue #354 remains open for remaining owner-access evidence; read-only during RC7.**
- RC6 — WhatsApp Cloud API application adapter. **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY — exact source `8838b7a6d726a5aed44ce21a39506c1265a98d15`; managed run `30137700769` succeeded on retry through outbox → Meta test template → authentic signed webhook receipt; initial failure preserved in Issue #404; production/participant sends remain disabled.**
- RC7 — Google Maps runtime activation with separate restricted Android/backend credentials, privacy-safe publication semantics, quotas, manual/list fallback and kill switch. **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY — exact source `47285575862cbf08845eaeabe093afea1ea79bd1`; run `30234521983/1`; artifact `8641270327` (`sha256:24da53c0bd6fa885fa4a6814f70af090096192e6c5b7a03c89fba51416877fde`); production/participant authorization false.**
- RC8 — sandbox-only payment-provider adapter closure/reconciliation. **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY — exact source `ccc4e9463d810ddf554182b1607c22d3a7c8c8d3`; run `30241092949/1`; artifact `8643323319` (`sha256:bbb4600eb5a062552947e91c878dd09c6d1e4dc307ae4783c7fa1fb4cf6e4935`); MTN/Stripe/PayPal proved privately; DPO runtime-unbound, Airtel provider-pending, Flutterwave deferred; application runtime and real money disabled.**
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

No repository write lane is active. RC0–RC8 evidence remains immutable/regression-protected, UIA Issue #354 remains parked/read-only, and RC9 source work requires a new explicit claim. Real-money, participant and production authorization remain blocked.
