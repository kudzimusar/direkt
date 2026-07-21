# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — RC3 Firebase Crashlytics Android runtime closure |
| Owner/agent | Active repository agent — Issue #261 runtime integration closure workstream |
| Authorized scope | Firebase Crashlytics on native Android only: reviewed SDK/plugin integration, fail-closed collection/privacy controls, exact release/build mapping, synthetic crash/ANR canaries, managed Firebase evidence, permanent verifier promotion, and exact-head Android/integration/security/release regressions. No FCM, Test Lab, Maps, payment, WhatsApp or unrelated backend/PWA/portal feature work is authorized in RC3. |
| Protected surface | Backend/database/OpenAPI, web/PWA, operations portal, trust/privacy, payments, integrations, VC1–VC8 completion, Phase 11/12 gates, Android auth/distribution/signing/Play/Data Safety and RC0–RC2 evidence remain regression-protected. |
| Implementation branch | `integration/rc3-crashlytics-android` from merged RC2 closure baseline `c9cce1bb688ecb9c746d2ebd9d57dfe2f8c275b6`. |
| Stable baseline | RC2 source PR #275 merged at `15210c5b0bf1832e32f8c33a7618c69f61f65275`; managed Sentry synthetic canary #1 succeeded; RC2 closure PR #280 merged at `c9cce1bb688ecb9c746d2ebd9d57dfe2f8c275b6` with exact-head documentation, integration, W7/W8 and PWA gates green. |
| Current task | RC3 — integrate Crashlytics without Analytics, default collection off, add synthetic-only opt-in crash/ANR proof, preserve release/Data Safety boundaries, then reconcile managed Firebase evidence and status before promotion. |
| Governing issue | Issue #261 — Runtime integration closure after W8; Issue #259 VC1–VC8 is closed and preserved as baseline. |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized. |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates. |

## RC3 implementation contract

1. Crashlytics is the Android crash/ANR telemetry path; Android Sentry remains inactive.
2. Automatic Crashlytics collection must be disabled by default. Only an explicit synthetic/debug canary path may opt in during RC3 proof.
3. RC3 must not add Firebase Analytics merely to obtain breadcrumbs or session context.
4. No raw evidence, contact data, auth tokens, cookies, precise private coordinates, provider-reviewer notes or unrestricted free text may be attached to Crashlytics.
5. No stable participant identifier may be set as a Crashlytics user ID during RC3; synthetic canaries use non-identifying bounded metadata only.
6. Release/build mapping must remain source-controlled and compatible with existing preauthorization signing/version controls.
7. Synthetic crash and ANR proof must not create a production-accessible crash trigger. Any canary entry point must be debug/test-only and absent from the release manifest/runtime.
8. Existing Firebase Auth/App Distribution behavior must remain intact; RC3 must not activate FCM or Test Lab early.
9. The permanent integration verifier must be promoted from “Crashlytics prohibited” to positive exact Crashlytics/privacy/canary assertions. Do not weaken or bypass the verifier.
10. RC3 is not `ACTIVE` until source integration, privacy controls, managed Firebase crash/ANR evidence, exact-head regressions and status reconciliation are all complete.
11. Real participant/production crash telemetry remains separately gated even after synthetic RC3 proof unless a later privacy/data-use decision explicitly authorizes it.

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
10. The workstream releases the lane only after status/ledger reconciliation, exact-head regression matrix, managed evidence and handoff are promoted.

## Dependency-safe implementation sequence

- RC0 — integration ledger, dependency/source audit, permanent-gate ownership sanity check and payment evidence reconciliation. **Closed — PR #263.**
- AI0 — provider-neutral AI foundation. **Closed — PR #265; runtime activation remains per-use-case and data-classification gated.**
- RC1 — Resend transactional-outbox runtime. **Closed; synthetic managed execution proven; real-participant/production email remains disabled.**
- RC2 — Sentry for approved NestJS/Next.js surfaces. **Closed — PR #275 source + managed synthetic API/private-portal canary + closure PR #280; participant/production telemetry remains disabled.**
- RC3 — Firebase Crashlytics Android activation with privacy/release mapping and synthetic crash/ANR evidence. **ACTIVE CHECKPOINT.**
- RC4 — FCM push delivery: server send path, token lifecycle, Android notification handling/permissions, retries and managed canary.
- RC5 — Firebase Test Lab device-matrix automation after Android runtime dependencies stabilize through RC3–RC4.
- RC6 — WhatsApp Cloud API application adapter using outbox/idempotency/consent/template/delivery-receipt rules; production sends remain gated until provider/legal approvals exist.
- RC7 — Google Maps runtime activation with separate restricted Android/backend credentials, privacy-safe publication semantics, quotas, manual/list fallback and kill switch.
- RC8 — sandbox-only payment-provider adapter closure/reconciliation for already proven MTN, DPO, Stripe and PayPal rails; Airtel remains provider-pending and Flutterwave deferred; real money remains disabled.
- RC9 — OpenAPI-generated Kotlin and TypeScript client adoption/decision after backend integration/API shape stabilizes; migrate incrementally with cross-client regressions.
- RC10 — Turnstile threat-model decision; implement only if a reviewed public abuse-sensitive flow requires it, otherwise close as not currently justified.
- RC11 — combined integration regression, managed evidence index, live ledger/status reconciliation and lane release.

## VC7–VC8 AI contract preserved

1. AI is assistive, never authoritative: it cannot approve/reject verification, publish trust, suspend providers, decide serious complaints/appeals, mutate payment truth, widen permissions or make legal/regulatory conclusions.
2. Customer discovery AI remains optional and reversible; deterministic category/search/area flows continue when AI is disabled, unavailable, invalid or rejected.
3. AI output is schema/allowlist validated and model-invented canonical IDs are rejected server-side.
4. Browser and Android clients use DIREKT-controlled API/BFF boundaries; no model/provider credential, privileged database credential or restricted retrieval authority enters client code.
5. Implemented AI use cases are customer discovery/category assistance, grounded public Help, provider onboarding/readiness guidance and provider public-profile drafting. Gemini/Groq remain sandbox-proven but are not bound to the managed DIREKT runtime by default.
6. Restricted evidence/OCR/operations-case AI remains hard-disabled until separate approval and runtime evidence exist.
7. AI cannot create or strengthen verification, publication, ranking or commercial state. Payment remains independent from trust.

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

No second agent may write to overlapping RC3 Android/Crashlytics runtime surfaces while this claim is active. Read-only review may continue. RC4+ source work must not begin until RC3 has exact-head source/regression evidence, managed synthetic crash/ANR evidence, status reconciliation, merge promotion and a released/transitioned lock.
