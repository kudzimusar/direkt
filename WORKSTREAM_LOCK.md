# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — RC3 Firebase Crashlytics Android runtime closure |
| Owner/agent | Active repository agent — Issue #261 runtime integration closure workstream |
| Authorized scope | Firebase Crashlytics activation for the native Android customer/provider application only: reviewed SDK/plugin dependency, default-off collection control, strict non-PII custom metadata policy, release/build mapping, synthetic crash/non-fatal evidence, alerting/managed-device proof and exact-head regressions. Sentry remains API/portal only; FCM and Test Lab remain RC4/RC5. |
| Protected surface | Android, backend/database/OpenAPI, web/PWA, operations portal, CI, trust/privacy, payments, integrations, VC1–VC8 completion and release boundaries remain regression-protected. |
| Implementation branch | `integration/rc3-crashlytics-runtime` from RC2 closure merge `c9cce1bb688ecb9c746d2ebd9d57dfe2f8c275b6`; do not build new integration work on stale/diverged branches. |
| Stable baseline | RC2 Sentry closure PR #280 merged at `c9cce1bb688ecb9c746d2ebd9d57dfe2f8c275b6`; Sentry is proven only for the synthetic managed API/private-portal boundary. Temporary RC2 one-shot dispatcher/authorization artifacts are removed on this RC3 branch before Android runtime changes. |
| Current task | RC3 — audit existing Firebase Android apps/configuration and current native release architecture, then integrate Crashlytics with fail-closed collection/privacy controls, release mapping and managed synthetic crash/non-fatal proof without changing Android permissions or enabling FCM. |
| Governing issue | Issue #261 — Runtime integration closure after W8; Issue #259 VC1–VC8 is closed and preserved as baseline. |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized. |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates. |

## VC1–VC8 closure record preserved

1. VC1–VC6 were promoted through PR #268 at `c5eb25b2e579d7f148b67130baf307a45f11e7a0`.
2. The approved execution hybrid is Structured Trust for proof/information architecture, Neighbourhood Marketplace for customer warmth/imagery and Field Utility for provider/operations density.
3. AI0 was promoted through PR #265; VC7 uses the provider-neutral backend foundation rather than client-direct model credentials.
4. VC7 implements bounded customer discovery intent assistance, grounded public Help, provider onboarding/readiness guidance and provider profile drafting with source-controlled governance, evaluations, fail-closed switches and deterministic/manual fallback.
5. Restricted evidence/OCR/operations-case AI remains disabled until explicit privacy/security/data-processing/provider approval and dedicated evaluation/runtime evidence exist.
6. VC8 permanent verification guards AI disclosure/fallback/privacy, restricted-data gating, target/focus/reflow/accessibility expectations, browser credential boundaries and no-blanket-verification semantics.
7. Permanent responsive visual evidence is owned by `functional-pwa-ci.yml`; permanent native Android evidence is owned by `android-ci.yml`.
8. The VC1–VC8 closure programme merged through PR #270 at `c7f5985bc20372b4761e063dc3a66ecc736556e2`; RC3 must preserve those exact product, AI, privacy and accessibility boundaries.

## Runtime integration closure contract

1. Close one bounded integration checkpoint at a time; do not batch unrelated SDK/provider activation.
2. An external account, API key, DSN, secret, dashboard project or Firebase product toggle is not `ACTIVE` evidence by itself.
3. Each closure requires applicable source integration, least-privilege configuration, privacy/security controls, fallback or kill switch, managed canary/device evidence, exact-head regressions and status documentation.
4. Android/browser clients call DIREKT-controlled API/BFF boundaries; they do not receive privileged provider, database, payment, AI, registry or telemetry-auth credentials.
5. Real participants, real external communications, real payment movement, production auth and production release remain separately gated.
6. Payment state cannot create or improve verification, publication or ranking authority.
7. AI output cannot independently verify providers, change trust/ranking/publication, authorize payments/escrow, decide disputes, override consent/authorization or act as legal/regulatory authority.
8. Exact private provider coordinates, raw evidence, contact data, credentials and tokens must not leak into telemetry, public maps, browser caches or provider payloads.
9. Sentry auth tokens remain CI/release tooling only and must never bind to API, portal, Android or browser runtime.
10. RC2 Sentry remains synthetic-only until a separate reviewed privacy/data-use decision authorizes a broader data class.
11. RC3 Crashlytics must not upload user identifiers, contact data, evidence content, exact private coordinates, auth/session tokens or unrestricted free-form logs/custom keys.
12. Crashlytics automatic collection must be explicitly controlled by the approved data mode/consent boundary; RC3 proof must not silently activate production participant telemetry.
13. RC3 must not add notification permission, FCM messaging, Maps/location permission or any unrelated Android runtime capability.
14. The workstream releases the lane only after status/ledger reconciliation, exact-head regression matrix, managed evidence and handoff are promoted.

## Dependency-safe implementation sequence

- RC0 — integration ledger, dependency/source audit, permanent-gate ownership sanity check and payment evidence reconciliation. **Closed — PR #263.**
- AI0 — provider-neutral AI foundation. **Closed — PR #265; runtime activation remains per-use-case and data-classification gated.**
- RC1 — Resend transactional-outbox runtime. **Closed — source PR #269; managed synthetic execution proven; hotfixes #271/#272 and closure PR #273 merged; real-participant/production email remains disabled.**
- RC2 — Sentry for approved NestJS/Next.js surfaces with strict PII scrubbing, release controls and kill switch; Cloud Logging remains authoritative infrastructure telemetry. **Closed — source PR #275 and closure PR #280; managed synthetic API + private portal canary #1 passed. Participant/production telemetry remains disabled.**
- RC3 — Firebase Crashlytics Android activation with privacy/release mapping and synthetic crash/ANR evidence. **ACTIVE CHECKPOINT.**
- RC4 — FCM push delivery: server send path, token lifecycle, Android notification handling/permissions, retries and managed canary.
- RC5 — Firebase Test Lab device-matrix automation after Android runtime dependencies stabilize through RC3–RC4.
- RC6 — WhatsApp Cloud API application adapter using outbox/idempotency/consent/template/delivery-receipt rules; production sends remain gated until provider/legal approvals exist.
- RC7 — Google Maps runtime activation with separate restricted Android/backend credentials, privacy-safe publication semantics, quotas, manual/list fallback and kill switch.
- RC8 — sandbox-only payment-provider adapter closure/reconciliation for already proven MTN, DPO, Stripe and PayPal rails; Airtel remains provider-pending and Flutterwave deferred; real money remains disabled.
- RC9 — OpenAPI-generated Kotlin and TypeScript client adoption/decision after backend integration/API shape stabilizes; migrate incrementally with cross-client regressions.
- RC10 — Turnstile threat-model decision; implement only if a reviewed public abuse-sensitive flow requires it, otherwise close as not currently justified.
- RC11 — combined integration regression, managed evidence index, live ledger/status reconciliation and lane release.

## VC7–VC8 implementation contract preserved after closure

1. AI is assistive, never authoritative: it cannot approve/reject verification, publish trust, suspend providers, decide serious complaints/appeals, mutate payment truth, widen permissions or make legal/regulatory conclusions.
2. Customer discovery AI remains optional and reversible; deterministic category/search/area flows continue when AI is disabled, unavailable, invalid or rejected.
3. AI output is schema/allowlist validated and model-invented canonical IDs are rejected server-side.
4. Browser and Android clients use DIREKT-controlled API/BFF boundaries; no model/provider credential, privileged database credential or restricted retrieval authority enters client code.
5. Implemented VC7 use cases use synthetic/public-safe or deliberately reduced provider-safe context only. Restricted evidence/OCR/operations-case AI remains hard-disabled until separate approval and runtime evidence exist.
6. Prompt injection, sensitive-data disclosure, excessive agency, hallucination, outage/fallback, authorization and evaluation controls are required before any AI use case can be runtime-enabled.
7. AI cannot create or strengthen verification, publication, ranking or commercial state. Payment remains independent from trust.
8. Exact private provider coordinates, private evidence, raw contact data, reviewer-private notes, credentials and tokens remain outside public/client AI context.
9. Every material UI action must execute a real authorized flow, be explicitly disabled/gated, or clearly state its synthetic limitation.
10. Real participants, real evidence, live external communications, real money movement and production release remain separate Phase 11/12 and integration gates.

## Completed W0–W8 workstream contract

1. The functional browser client is additive under `web/direkt-app/`; Android remains the primary native Version 1 client.
2. Android and web share product semantics through canonical NestJS REST/OpenAPI boundaries, not shared UI binaries.
3. Browser session state remains server-controlled and provider scope/DIREKT authorization remain backend-authoritative.
4. No direct privileged Supabase/database/Storage credentials or authority enter browser code.
5. Commercial state cannot create or improve verification/publication/ranking authority; real money remains separately gated.
6. Canonical host `https://app.direkt.forum` passed independent W8 exact-head verification; `https://direkt.forum/preview/` remains the explicit synthetic historical/review route.
7. W8 closure did not authorize real participants, real evidence, production authentication, external communications/payment activation, Phase 11 exit or production release.

## Persistent stop conditions

Stop rather than merge or activate a later checkpoint if it would:

- regress Android/backend/database/OpenAPI/web/portal required gates;
- weaken Cloud Run IAM or expose privileged Supabase/database/Storage access;
- expose private evidence, raw contact data or exact private provider coordinates;
- fabricate or bypass participant, legal/privacy, payment, AI-provider or production-release gates;
- accept client-selected provider scope or authorization;
- allow commercial/payment state to influence verification or public trust claims;
- allow AI output to become authoritative verification/trust/payment/dispute/publication authority;
- store production credentials, model/provider secrets or telemetry auth tokens in application runtime or browser-readable surfaces;
- enable unrestricted Crashlytics collection/logging for real participants without a separate reviewed privacy/data-use authorization;
- replace backend-authoritative behavior with static fixtures while claiming runtime completion;
- mark an integration or AI use case `ACTIVE` without exact configured-provider/runtime evidence.

## Conflict rule

The VC1–VC8 implementation claim and RC2 integration checkpoint are closed and preserved as baseline. No second agent may write to overlapping RC3 Android/Firebase runtime-integration surfaces while this claim is active. Read-only review may continue. The RC3 lock is released only after source/runtime promotion, managed device evidence, status/ledger reconciliation and exact-head regressions are complete.
