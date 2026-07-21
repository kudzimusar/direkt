# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — VC7–VC8 final AI/product quality closure |
| Owner/agent | Active repository agent — Issue #259 Visual Completion programme |
| Authorized scope | Exact-head VC7 safe AI product use cases, customer/provider/operations visual completion, accessibility/responsive/offline/low-bandwidth quality closure, reproducible visual evidence, regression hardening, documentation/status reconciliation and PR #270 promotion |
| Protected surface | Android, backend/database/OpenAPI, web/PWA, operations portal, CI, trust/privacy, payments, integrations and release boundaries remain regression-protected. RC1 is closed; RC2+ integration work must not mutate overlapping repository surfaces until this VC claim releases or is explicitly reconciled. |
| Implementation branch | `vc/ai-quality-7-8`, now synchronized by merge with current `main` through PR #274 after RC1 closure PR #273 |
| Stable baseline | VC1–VC6 merged through PR #268 at `c5eb25b2e579d7f148b67130baf307a45f11e7a0`; AI0 merged through PR #265; RC1 managed Resend checkpoint closed through PR #273; canonical app `https://app.direkt.forum` remains non-production until separate Phase 11/12 authorization |
| Current task | VC8 closure — exact-head responsive/native visual evidence, accessibility/AI-safety/regression proof, final status reconciliation and PR #270 promotion |
| Governing issue | Issue #259 — DIREKT Visual Completion; Issue #261 remains the runtime integration tracker for RC2+ after this lane releases |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates |

## VC7–VC8 implementation contract

1. AI is assistive, never authoritative: it cannot approve/reject verification, publish trust, suspend providers, decide serious complaints/appeals, mutate payment truth, widen permissions or make legal/regulatory conclusions.
2. Customer discovery AI remains optional and reversible; deterministic category/search/area flows continue when AI is disabled, unavailable, invalid or rejected.
3. AI output is schema/allowlist validated and model-invented canonical IDs are rejected server-side.
4. Browser and Android clients use DIREKT-controlled API/BFF boundaries; no model/provider credential, privileged database credential or restricted retrieval authority enters client code.
5. Implemented VC7 use cases use synthetic/public-safe or deliberately reduced provider-safe context only. Restricted evidence/OCR/operations-case AI remains hard-disabled until explicit privacy/security/data-processing approval and dedicated runtime evidence exist.
6. Prompt injection, sensitive-data disclosure, excessive agency, hallucination, outage/fallback, authorization and evaluation controls are required before any AI use case can be runtime-enabled.
7. AI cannot create or strengthen verification, publication, ranking or commercial state. Payment remains independent from trust.
8. Exact private provider coordinates, private evidence, raw contact data, reviewer-private notes, credentials and tokens remain outside public/client AI context.
9. Every material UI action must execute a real authorized flow, be explicitly disabled/gated, or clearly state its synthetic limitation; deceptive no-op controls are prohibited.
10. VC8 requires exact-head Android/backend/database/OpenAPI/PWA/operations/security/performance/release regressions plus accessibility, responsive/adaptive, offline/failure, low-bandwidth and visual evidence.
11. Real participants, real evidence, live external communications, real money movement and production release remain separate Phase 11/12 and integration gates.
12. The VC lane releases only after final status, Issue #259 handoff, exact-head regression matrix and inspected visual evidence artifacts are documented.

## Runtime-integration coordination

- RC0 — integration ledger/dependency/source audit. **Closed — PR #263.**
- AI0 — provider-neutral AI foundation. **Closed — PR #265; runtime activation remains per-use-case and data-classification gated.**
- RC1 — Resend transactional-outbox runtime. **Closed — source PR #269; managed execution `direkt-resend-canary-ct9mp` succeeded on exact source `8e367f47f16b3f9f28a26a62ee8bdd305a286153`; hotfixes #271/#272 and closure PR #273 merged; real-participant/production email remains disabled.**
- RC2 — Sentry API/portal runtime observability is next only after this VC lane releases or a non-overlapping claim is explicitly reconciled.
- RC3–RC11 remain sequenced by `docs/integrations/RUNTIME_INTEGRATION_CLOSURE_PLAN.md`.

## Completed VC1–VC7 implementation

1. PR #268 promoted the cross-surface Design DNA foundation, customer discovery/provider-profile modernization, provider professional workspace, operations mission control and Android visual/product modernization.
2. Approved hybrid: Structured Trust for proof/information architecture, Neighbourhood Marketplace for customer warmth/imagery, Field Utility for provider/operations density.
3. No blanket `Verified` badge; check-specific statements, dates/currentness and limitations remain the trust language.
4. PWA remains behind reviewed same-origin BFF/private-API boundaries; no direct privileged Supabase/database path was introduced.
5. Android remains native Jetpack Compose/Material 3; web/Android share Design DNA and canonical contracts, not UI binaries.
6. Operations uses desktop queue → case/evidence → checklist/decision composition; restricted evidence AI is explicitly inactive and consequential synthetic decisions remain disabled.
7. VC7 implements source-controlled AI governance plus bounded customer discovery intent assistance, grounded public help, provider onboarding guidance and provider profile drafting with deterministic/manual fallback and fail-closed use-case switches.
8. Provider/client AI cannot auto-write trust/publication/payment/authorization state; profile wording is an editable draft requiring provider confirmation.
9. Android provider/evidence presentation is human-facing while preserving the proven upload/retry state machine and test tags.
10. Permanent VC8 verification guards AI disclosure/fallback/privacy, restricted-data gating, interaction target/focus/reflow requirements and browser credential boundaries.
11. Responsive/native screenshot evidence is generated only from synthetic/public-safe fixtures by the permanent PWA and Android CI lanes and must be inspected before closure.

## Completed W0–W8 workstream contract

1. The functional browser client is additive under `web/direkt-app/`; Android remains the primary native Version 1 client.
2. Android and web share product semantics through canonical NestJS REST/OpenAPI boundaries, not shared UI binaries.
3. Browser session state remains server-controlled and provider scope/DIREKT authorization remain backend-authoritative.
4. No direct privileged Supabase/database/Storage credentials or authority enter browser code.
5. Commercial state cannot create or improve verification/publication/ranking authority; real money remains separately gated.
6. Canonical host `https://app.direkt.forum` passed independent W8 exact-head verification; `https://direkt.forum/preview/` remains the explicit synthetic historical/review route.
7. W8 closure did not authorize real participants, real evidence, production authentication, external communications/payment activation, Phase 11 exit or production release.

## Persistent stop conditions

Stop rather than merge if a checkpoint would:

- regress Android/backend/database/OpenAPI/web/portal required gates;
- weaken Cloud Run IAM or expose privileged Supabase/database/Storage access;
- expose private evidence, raw contact data or exact private provider coordinates;
- fabricate or bypass participant, legal/privacy, payment, AI-provider or production-release gates;
- accept client-selected provider scope or authorization;
- allow commercial/payment state to influence verification or public trust claims;
- allow AI output to become authoritative verification/trust/payment/dispute/publication authority;
- store production credentials or model/provider secrets in source or browser-readable surfaces;
- replace backend-authoritative behavior with static fixtures while claiming runtime completion;
- mark an integration or AI use case `ACTIVE` without exact configured-provider/runtime evidence;
- claim VC8 complete without inspecting exact-head visual evidence artifacts and the full regression matrix.

## Conflict rule

No second agent may write to overlapping repository surfaces while this VC7–VC8 claim is active. RC2+ work may proceed only on read-only/provider-console/non-overlapping evidence surfaces unless ownership is explicitly reconciled here. The lane releases only after VC7–VC8 evidence is promoted, exact-head regressions pass, PR #270 merges and the next handoff is recorded.
