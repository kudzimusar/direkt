# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — VC7–VC8 AI product intelligence and world-class quality closure |
| Owner/agent | Active repository agent — Issue #259 Visual Completion programme |
| Authorized scope | Bounded AI-assisted product use cases on the merged provider-neutral AI foundation, customer/provider/operations UX completion, accessibility/responsive/offline/low-bandwidth quality closure, regression hardening, documentation/status reconciliation and final VC evidence |
| Protected surface | Android, backend/database/OpenAPI, web/PWA, operations portal, CI, trust/privacy, payments and release boundaries remain regression-protected. Issue #261 may continue external/provider-managed evidence work, but no overlapping repository code writes begin while this VC claim is active. |
| Implementation branch | `vc/ai-quality-7-8` from `main@c5eb25b2e579d7f148b67130baf307a45f11e7a0` after VC1–VC6 promotion; do not build new work on the diverged historical `build/android-v1` branch |
| Stable baseline | VC1–VC6 merged through PR #268 at `c5eb25b2e579d7f148b67130baf307a45f11e7a0`; AI0 merged through PR #265; RC1 source checkpoint merged through PR #269; canonical app `https://app.direkt.forum` remains synthetic-review only |
| Current task | VC7 — first bounded AI-assisted customer discovery use case with deterministic fallback, then provider/operations assists where safe; VC8 follows with full visual/product/AI/accessibility/regression closure |
| Governing issue | Issue #259 — DIREKT Visual Completion; Issue #261 remains the external/runtime integration evidence tracker |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates |

## VC7–VC8 implementation contract

1. AI is assistive, never authoritative: it may interpret, classify, suggest, summarize, extract or draft within approved use cases, but cannot approve/reject verification, publish trust, suspend providers, decide serious complaints/appeals, mutate payment truth, widen permissions or make legal/regulatory conclusions.
2. Customer discovery AI must remain optional and reversible: deterministic search/category/area flows continue to work when AI is disabled, unavailable, low-confidence or rejected by the user.
3. AI output is schema-validated and canonical IDs/categories are resolved by server logic; model-invented identifiers are rejected.
4. Browser and Android clients call DIREKT-controlled API/BFF boundaries; no model/provider credential, privileged database credential or restricted retrieval authority enters client code.
5. The initial VC7 use cases use synthetic/public-safe data only. Restricted evidence/OCR remains disabled until explicit privacy/legal/provider approval and dedicated evaluation exist.
6. Prompt injection, sensitive-data disclosure, excessive agency, hallucination, cost/latency, outage/fallback and authorization tests are required before any use case is marked runtime-active.
7. AI cannot create or strengthen verification, publication, ranking or commercial state. Payment remains independent from trust.
8. Exact private provider coordinates, private evidence, raw contact data, reviewer-private notes, credentials and tokens remain outside public/client AI context.
9. Every material UI action must either execute a real authorized flow, be explicitly disabled/gated, or state its synthetic limitation; no deceptive no-op controls survive VC8.
10. VC8 requires exact-head Android/backend/database/OpenAPI/PWA/operations/security/performance/release regressions plus accessibility, responsive/adaptive, offline/failure and low-bandwidth evidence.
11. Real participants, real evidence, live external communications, real money movement and production release remain separate Phase 11/12 and integration gates.
12. The VC lane releases only after the final VC status, issue handoff, exact-head regression matrix and residual external blockers are documented.

## Runtime-integration coordination

- RC0 — integration ledger/dependency/source audit. **Closed — PR #263.**
- AI0 — provider-neutral Gemini-primary/Groq-fallback AI foundation. **Closed — PR #265; model runtimes remain gated until use-case/provider evaluation and managed evidence.**
- RC1 — Resend runtime email source checkpoint. **SOURCE CHECKPOINT MERGED — PR #269. Managed synthetic delivery/canary and any remaining external evidence stay on Issue #261 and do not authorize overlapping code writes during VC7–VC8.**
- RC2–RC11 — remain planned under `docs/integrations/RUNTIME_INTEGRATION_CLOSURE_PLAN.md`; resume sequential repository writes after the VC lane is released or after an explicitly reconciled non-overlapping claim.

## Completed VC1–VC6 checkpoint

1. PR #268 promoted the cross-surface Design DNA foundation, customer discovery/provider-profile modernization, provider professional workspace, operations mission control and Android visual/product modernization.
2. The approved execution hybrid is Structured Trust for proof/information architecture, Neighbourhood Marketplace for customer warmth/imagery and Field Utility for provider/operations density.
3. No blanket `Verified` badge was introduced; check-specific statements, dates/currentness and limitations remain the trust language.
4. The functional PWA continues through the reviewed same-origin BFF/private-API boundary; no direct privileged Supabase/database path was introduced.
5. Android remains native Jetpack Compose/Material 3; web/Android share Design DNA and canonical contracts, not UI binaries.
6. Operations uses a desktop queue → case/evidence → checklist/decision workspace with compact task-focused fallback and synthetic decision controls disabled until authorized.
7. Historical W4/W7/PWA regression gates were corrected so legitimate post-W7 Android evolution is validated rather than prohibited.
8. The promoted checkpoint passed exact-head Android, W7, PWA, operations, performance, integration, security, staging, Play readiness, Phase12A reproducibility and final preauthorization gates before merge.

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
- mark an integration or AI use case `ACTIVE` without exact configured-provider/runtime evidence.

## Conflict rule

No second agent may write to overlapping repository surfaces while this VC7–VC8 claim is active. Issue #261 may continue read-only/provider-console/managed-canary evidence gathering that does not mutate overlapping repository code. Any necessary overlapping integration code change must first reconcile ownership in this file. The lane is released only after VC7–VC8 bounded checkpoints are promoted, final regressions pass and the next handoff is recorded.
