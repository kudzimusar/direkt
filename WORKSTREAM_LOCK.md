# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | RELEASED — VC1–VC8 complete and merged |
| Owner/agent | None — VC programme closed through PR #270; next material repository work requires a fresh bounded claim |
| Authorized scope | No active VC implementation scope. RC2 Sentry under Issue #261 is the next planned integration checkpoint and must claim a new lane from the merged `main` baseline before repository writes begin. |
| Protected surface | Android, backend/database/OpenAPI, web/PWA, operations portal, CI, trust/privacy, payments, integrations and release boundaries remain regression-protected. |
| Stable baseline | VC1–VC8 merged through PR #270 at `c7f5985bc20372b4761e063dc3a66ecc736556e2`; exact reviewed closure head `cc7cdb5760c01498f27ca1daba738e02296320cb` passed all required permanent gates and inspected PWA/Android visual evidence |
| Current task | VC programme closed. Preserve the merged baseline; begin RC2 or any other material work only after a fresh workstream claim and predecessor regression check. |
| Governing issue | Issue #259 — CLOSED/COMPLETED; Issue #261 remains the runtime-integration tracker for RC2+ |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates |

## VC1–VC8 closure record

1. VC1–VC6 were promoted through PR #268 at `c5eb25b2e579d7f148b67130baf307a45f11e7a0`.
2. AI0 was promoted through PR #265 and remains provider-neutral/backend-owned.
3. VC7 implemented bounded customer discovery assistance, grounded public Help, provider onboarding/readiness guidance and provider profile drafting with source-controlled governance, evaluations, fail-closed switches and deterministic/manual fallback.
4. Restricted evidence/OCR/operations-case AI remains disabled until explicit privacy/security/data-processing/provider approval and dedicated evaluation/runtime evidence exist.
5. VC8 permanent verification guards AI disclosure/fallback/privacy, restricted-data gating, target/focus/reflow/accessibility expectations, browser credential boundaries and no-blanket-verification semantics.
6. Permanent responsive evidence is owned by `functional-pwa-ci.yml`; permanent native Android evidence is owned by `android-ci.yml`.
7. Exact closure head `cc7cdb5760c01498f27ca1daba738e02296320cb` passed Backend, Android, PWA, W4/W7/W8, integration, staging, recovery, security, performance, Play, Phase 11 synthetic, Phase12A/final-preauthorization and documentation gates.
8. Closure-head web/operations evidence: run `29830637290`, artifact ID `8495136163`, digest `sha256:87e995d951efdb5d1282bbd7ad32bd08b4826a858a9c32570b0ed99f3541dd6d`.
9. Closure-head native Android evidence: run `29830637218`, artifact ID `8495234528`, digest `sha256:ec089058f023ae279325e7e89df63d33b61308ca664dad7cb64e547b6b5fe326`.
10. Customer Discover, Provider Overview and Provider Evidence captures were visually inspected and confirmed synthetic-only with no private-evidence/raw-coordinate/developer-harness leakage.
11. The redundant standalone VC8 screenshot workflow was removed after permanent PWA/Android evidence lanes proved ownership.
12. PR #270 merged at `c7f5985bc20372b4761e063dc3a66ecc736556e2`; Issue #259 closed as completed.

## Persistent product/AI/trust contract

1. AI is assistive, never authoritative: it cannot approve/reject verification, publish trust, suspend providers, decide serious complaints/appeals, mutate payment truth, widen permissions or make legal/regulatory conclusions.
2. Customer discovery AI remains optional/reversible; deterministic search/category/area paths remain available.
3. AI output is schema/allowlist validated; model-invented canonical identifiers are rejected server-side.
4. Browser and Android clients use DIREKT-controlled API/BFF boundaries; no privileged provider/database/payment/AI credentials enter client code.
5. Implemented AI use cases use synthetic/public-safe or deliberately reduced provider-safe context within their approved modes; restricted evidence AI remains separately gated.
6. Payment/commercial state cannot create or strengthen verification, publication or ranking authority.
7. Exact private coordinates, private evidence, raw contact data, reviewer-private notes, credentials and tokens remain protected.
8. Real participants, real evidence, live external communications, real money movement and production release remain separate Phase 11/12 and integration gates.

## Runtime-integration handoff

- RC0 — integration ledger/dependency/source audit. **Closed — PR #263.**
- AI0 — provider-neutral AI foundation. **Closed — PR #265; runtime activation remains per-use-case/data-classification gated.**
- RC1 — Resend transactional-outbox runtime. **Closed through source/hotfix/closure PRs #269/#271/#272/#273 at the managed synthetic boundary; real-participant/production email remains disabled.**
- VC1–VC8 — **Closed — PR #270 merged at `c7f5985bc20372b4761e063dc3a66ecc736556e2`; Issue #259 completed.**
- RC2 — Sentry API/portal runtime observability is the next planned bounded checkpoint. It must start from current merged `main`, recheck predecessor regressions, and claim the lane before source changes.
- RC3–RC11 remain sequenced by `docs/integrations/RUNTIME_INTEGRATION_CLOSURE_PLAN.md`.

## Persistent stop conditions

Stop rather than merge or activate a later checkpoint if it would:

- regress required Android/backend/database/OpenAPI/web/portal gates;
- weaken Cloud Run IAM or expose privileged Supabase/database/Storage access;
- expose private evidence, raw contact data or exact private provider coordinates;
- fabricate or bypass participant, legal/privacy, payment, AI-provider or production-release gates;
- accept client-selected provider scope or authorization;
- allow commercial/payment state to influence verification or public trust claims;
- allow AI output to become authoritative verification/trust/payment/dispute/publication authority;
- store production credentials or model/provider secrets in source or browser-readable surfaces;
- replace backend-authoritative behavior with static fixtures while claiming runtime completion;
- mark an integration or AI use case `ACTIVE` without exact configured-provider/runtime evidence.

## Conflict rule

No active workstream currently owns the repository write lane. Any next material workstream must claim a new bounded lane from the current merged `main` baseline, re-run the appropriate predecessor regression checks, and preserve every VC, trust, privacy, integration and release control above.