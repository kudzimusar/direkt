# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — VC7–VC8 AI product intelligence and world-class quality closure |
| Owner/agent | Active repository agent — Issue #259 Visual Completion programme |
| Authorized scope | Bounded AI-assisted product use cases on the merged provider-neutral AI foundation; customer/provider/operations UX completion; accessibility/responsive/offline/low-bandwidth quality closure; reproducible synthetic visual evidence; regression hardening; documentation/status reconciliation and final VC promotion |
| Protected surface | Android, backend/database/OpenAPI, web/PWA, operations portal, CI, trust/privacy, payments, integrations and release boundaries remain regression-protected. RC1 is closed; RC2+ integration work must not mutate overlapping repository surfaces until this VC claim is released or explicitly reconciled. |
| Implementation branch | `vc/ai-quality-7-8`, originally branched after VC1–VC6 promotion and continuously reconciled with newer `main` integration fixes; do not build new work on the diverged historical `build/android-v1` branch |
| Stable baseline | VC1–VC6 merged through PR #268 at `c5eb25b2e579d7f148b67130baf307a45f11e7a0`; AI0 merged through PR #265; RC1 managed Resend checkpoint closed through PR #273 on `main`; canonical app `https://app.direkt.forum` remains non-production until separate Phase 11/12 authorization |
| Current task | VC8 closure — exact-head visual evidence, accessibility/AI-safety/regression proof, final status reconciliation and PR #270 promotion |
| Governing issue | Issue #259 — DIREKT Visual Completion; Issue #261 remains the runtime integration tracker for RC2+ after this lane releases |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates |

## VC7–VC8 implementation contract

1. AI is assistive, never authoritative: it may interpret, classify, suggest, summarize, extract or draft within approved use cases, but cannot approve/reject verification, publish trust, suspend providers, decide serious complaints/appeals, mutate payment truth, widen permissions or make legal/regulatory conclusions.
2. Customer discovery AI remains optional and reversible: deterministic search/category/area flows continue to work when AI is disabled, unavailable, low-confidence or rejected by the user.
3. AI output is schema-validated and canonical IDs/categories are resolved by server logic; model-invented identifiers are rejected.
4. Browser and Android clients call DIREKT-controlled API/BFF boundaries; no model/provider credential, privileged database credential or restricted retrieval authority enters client code.
5. Implemented VC7 use cases use synthetic/public-safe or deliberately reduced provider-safe context only. Restricted evidence/OCR/operations case AI remains hard-disabled until explicit privacy/security/data-processing approval and dedicated runtime evidence exist.
6. Prompt injection, sensitive-data disclosure, excessive agency, hallucination, outage/fallback, authorization and evaluation controls are required before any AI use case can be considered runtime-enabled.
7. AI cannot create or strengthen verification, publication, ranking or commercial state. Payment remains independent from trust.
8. Exact private provider coordinates, private evidence, raw contact data, reviewer-private notes, credentials and tokens remain outside public/client AI context.
9. Every material UI action must either execute a real authorized flow, be explicitly disabled/gated, or state its synthetic limitation; no deceptive no-op controls survive VC8.
10. VC8 requires exact-head Android/backend/database/OpenAPI/PWA/operations/security/performance/release regressions plus accessibility, responsive/adaptive, offline/failure, low-bandwidth and visual evidence.
11. Real participants, real evidence, live external communications, real money movement and production release remain separate Phase 11/12 and integration gates.
12. The VC lane releases only after final VC status, Issue #259 handoff, exact-head regression matrix, visual evidence artifacts and residual external blockers are documented.

## Runtime-integration coordination

- RC0 — integration ledger/dependency/source audit. **Closed — PR #263.**
- AI0 — provider-neutral Gemini-primary/Groq-fallback AI foundation. **Closed — PR #265; model runtimes remain gated by per-use-case switches and data-classification controls.**
- RC1 — Resend transactional-outbox email runtime. **Closed — source PR #269; managed execution `direkt-resend-canary-ct9mp` succeeded on exact source `8e367f47f16b3f9f28a26a62ee8bdd305a286153`; closure PR #273 merged; real-participant/production email remains disabled.**
- RC2 — Sentry API/portal runtime observability is the next integration checkpoint after the VC lane releases or a non-overlapping claim is explicitly reconciled.
- RC3–RC11 remain sequenced by `docs/integrations/RUNTIME_INTEGRATION_CLOSURE_PLAN.md`.

## Completed VC1–VC7 implementation

1. PR #268 promoted the cross-surface Design DNA foundation, customer discovery/provider-profile modernization, provider professional workspace, operations mission control and Android visual/product modernization.
2. The approved execution hybrid is Structured Trust for proof/information architecture, Neighbourhood Marketplace for customer warmth/imagery and Field Utility for provider/operations density.
3. No blanket `Verified` badge was introduced; check-specific statements, dates/currentness and limitations remain the trust language.
4. The functional PWA continues through the reviewed same-origin BFF/private-API boundary; no direct privileged Supabase/database path was introduced.
5. Android remains native Jetpack Compose/Material 3; web/Android share Design DNA and canonical contracts, not UI binaries.
6. Operations uses a desktop queue → case/evidence → checklist/decision workspace; restricted evidence AI is explicitly inactive and consequential synthetic decision controls remain disabled.
7. VC7 implements source-controlled AI use-case governance plus bounded customer discovery intent assistance, grounded public help, provider onboarding guidance and provider profile drafting with deterministic/manual fallback and fail-closed per-use-case switches.
8. Provider/client AI cannot auto-write trust, publication, payment or authorization state; provider profile wording remains an editable draft requiring provider confirmation.
9. Android provider/evidence presentation is human-facing while preserving the proven upload/retry state machine and test tags.
10. Permanent VC8 verification now guards AI disclosure/fallback/privacy, restricted-data gating, 48px/focus/reflow requirements and browser credential boundaries.

## Persistent stop conditions

Stop rather than merge if a checkpoint would:

- regress Android/backend/database/OpenAPI/web/portal required gates;
- weaken Cloud Run IAM or expose privileged Supabase/database/Storage access;
- expose private evidence, raw contact data or exact private provider coordinates;
- fabricate or bypass participant, legal/privacy, payment, AI-provider or production-release gates;
- accept client-selected provider scope or authorization;
- allow commercial/payment state to influence verification or public trust claims;
- allow AI output to become an authoritative verification/trust/payment/dispute/publication decision;
- store production credentials or model/provider secrets in source or browser-readable surfaces;
- replace backend-authoritative behavior with static fixtures while claiming runtime completion;
- mark an integration or AI use case `ACTIVE` without exact configured-provider/runtime evidence;
- claim VC8 complete without inspecting the exact-head visual evidence artifacts and full regression matrix.

## Conflict rule

No second agent may write to overlapping repository surfaces while this VC7–VC8 claim is active. RC2+ integration work may continue only on read-only/provider-console/non-overlapping evidence surfaces unless ownership is explicitly reconciled here. The lane is released only after VC7–VC8 final evidence is promoted, exact-head regressions pass, PR #270 merges and the next handoff is recorded.
