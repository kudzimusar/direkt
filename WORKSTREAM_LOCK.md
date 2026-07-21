# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | RELEASED — VC1–VC8 implementation/evidence complete; PR #270 final exact-head promotion in progress |
| Owner/agent | No new overlapping implementation owner may claim this lane until PR #270 promotion is resolved; after merge, the next bounded repository lane is RC2 Sentry under Issue #261 |
| Authorized scope | Final state-control verification and PR #270 promotion only. No new product/backend/integration feature work is authorized in this released VC closure checkpoint. |
| Protected surface | Android, backend/database/OpenAPI, web/PWA, operations portal, CI, trust/privacy, payments, integrations and release boundaries remain regression-protected. |
| Implementation branch | `vc/ai-quality-7-8`, synchronized with `main` through the RC1 closure baseline before final VC evidence |
| Stable baseline | VC1–VC6 PR #268; AI0 PR #265; RC1 managed Resend closure PR #273; VC8 candidate source `2bb734660b520940311c4d2b9c088d8f15224755` with all permanent candidate regressions green and inspected PWA/Android visual evidence |
| Current task | Run the full exact-head matrix after state-control/workflow cleanup; inspect closure-head visual artifacts; promote PR #270 only if synchronized, review-clear and fully green; then close Issue #259 |
| Governing issue | Issue #259 — DIREKT Visual Completion; Issue #261 remains the runtime-integration tracker for RC2+ after VC promotion |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates |

## VC1–VC8 closure record

1. VC1–VC6 were promoted through PR #268 at `c5eb25b2e579d7f148b67130baf307a45f11e7a0`.
2. The approved execution hybrid is Structured Trust for proof/information architecture, Neighbourhood Marketplace for customer warmth/imagery and Field Utility for provider/operations density.
3. AI0 was promoted through PR #265; VC7 uses the provider-neutral backend foundation rather than client-direct model credentials.
4. VC7 implements bounded customer discovery intent assistance, grounded public Help, provider onboarding/readiness guidance and provider profile drafting with source-controlled governance, evaluations, fail-closed switches and deterministic/manual fallback.
5. Restricted evidence/OCR/operations-case AI remains disabled until explicit privacy/security/data-processing/provider approval and dedicated evaluation/runtime evidence exist.
6. VC8 permanent verification guards AI disclosure/fallback/privacy, restricted-data gating, target/focus/reflow/accessibility expectations, browser credential boundaries and no-blanket-verification semantics.
7. Permanent responsive visual evidence is owned by `functional-pwa-ci.yml`; permanent native Android evidence is owned by `android-ci.yml`.
8. Candidate source `2bb734660b520940311c4d2b9c088d8f15224755` passed all permanent applicable regression gates.
9. Web/operations candidate evidence: run `29829438711`, artifact ID `8494672572`, digest `sha256:212607749a2c3525e15cb46083f06c221ca0b485b0987f5ae338d5d2bf8de3b0`.
10. Native Android candidate evidence: run `29829437845`, artifact ID `8494745779`, digest `sha256:ce86f3affd2c8b3b797e8a22de1dda2fd080d32f3a46b20d365500ae08a1a0bb`.
11. Customer Discover, Provider Overview and Provider Evidence native captures were visually inspected and confirmed synthetic-only with no private-evidence/raw-coordinate/developer-harness leakage.
12. The former standalone VC8 visual-evidence workflow is removed because the permanent PWA/Android lanes now own the exact-head evidence requirement.
13. Final PR #270 promotion still requires the closure-head matrix to remain fully green and branch synchronization/review state to remain clean.

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

## Runtime-integration coordination

- RC0 — integration ledger/dependency/source audit. **Closed — PR #263.**
- AI0 — provider-neutral AI foundation. **Closed — PR #265; runtime activation remains per-use-case and data-classification gated.**
- RC1 — Resend transactional-outbox runtime. **Closed — source PR #269; managed synthetic execution proven; hotfixes #271/#272 and closure PR #273 merged; real-participant/production email remains disabled.**
- RC2 — Sentry API/portal runtime observability is the next bounded integration checkpoint **only after PR #270 is merged and a new explicit workstream claim is recorded from the merged baseline**.
- RC3–RC11 remain sequenced by `docs/integrations/RUNTIME_INTEGRATION_CLOSURE_PLAN.md`.

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
- store production credentials or model/provider secrets in source or browser-readable surfaces;
- replace backend-authoritative behavior with static fixtures while claiming runtime completion;
- mark an integration or AI use case `ACTIVE` without exact configured-provider/runtime evidence;
- promote PR #270 without a green exact closure-head matrix and inspected closure-head visual evidence.

## Conflict rule

The VC1–VC8 implementation claim is released. Until PR #270 promotion is resolved, no new overlapping feature work should be stacked onto `vc/ai-quality-7-8`. After merge, RC2 or any other material workstream must claim a new bounded lane from the merged `main` baseline and must preserve all VC, trust, privacy, integration and release regressions.