# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | RELEASED — W0–W8 functional customer/provider web/PWA parity and controlled cutover complete |
| Owner/agent | None — lane available for the next separately authorized implementation workstream |
| Authorized scope | No active implementation claim. Read-only/design-audit work may proceed on non-overlapping branches without monopolizing the implementation lane. A material implementation workstream must claim the lane before overlapping code writes begin. |
| Protected surface | Normal project-wide no-regression controls remain in force for Android, backend/database/OpenAPI, web/PWA, operations portal, CI, trust/privacy and release boundaries. |
| Implementation lane | `build/android-v1` — historical name retained; W8 no longer owns or blocks this lane |
| Stable checkpoint | W8 CLOSED: functional runtime source `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`; managed run `29721199177`; canonical host `https://app.direkt.forum`; canonical-domain verification run `29802524466`; verification mechanism merged through PR #257 at `a4ad5fa348857f27b5bfef23f6f761deb75859c7` |
| Current task | None under W0–W8. Runtime integration closure, visual-completion implementation after owner approval, Phase 11 evidence work or another documented task may claim the lane according to programme priority and bounded scope. |
| Completed governing plan | `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md` — W0 through W8 closed |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized |
| Governing issues | Issue #133 is eligible for closure after this W8 closure checkpoint is promoted; Issue #112 remains open for real pilot evidence/exit; Issue #259 may continue VC0 audit/design-control work without treating W8 as active |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates |

## Completed W0–W8 workstream contract

1. The functional browser client is additive under `web/direkt-app/`; Android remains the primary native Version 1 client.
2. Android and web share product semantics through the canonical NestJS REST/OpenAPI boundary, not shared UI binaries.
3. The browser uses a reviewed BFF/session boundary; the canonical API remains IAM-private.
4. No direct privileged Supabase/database/Storage credentials or authority enter browser code.
5. Shared backend/OpenAPI behavior remains backward compatible with Android and regression-tested.
6. Mobile web uses Android-aligned bottom navigation; desktop uses persistent side navigation with the same product capabilities.
7. No preview/static fixture is counted as functional parity where an authoritative backend capability exists.
8. Browser authentication/session state remains server-controlled; provider scope and DIREKT authorization are backend-authoritative.
9. Customer/provider mutations use canonical lifecycle, eligibility, consent, revision and idempotency rules.
10. Commercial state cannot create or improve verification/publication/ranking authority; real money movement remains separately gated.
11. W7 closed only after combined Android/backend/database/OpenAPI/web regression, responsive/accessibility/offline/privacy negatives and managed browser evidence passed.
12. W8 exposed only the reviewed browser/BFF entry point using dedicated least-privilege runtime identity `direkt-cp-web-runtime@direkt-dev-502701.iam.gserviceaccount.com`; the API remained private.
13. Managed W8 attempt 8 passed on runtime source `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`, run `29721199177`, artifact digest `sha256:00a0d41e8b8824d7764ab9762f05816bac3639d9360ed8926071c346f066e0b0`.
14. Canonical host `https://app.direkt.forum` passed independent exact-head DNS/TLS/runtime/PWA/BFF/session/privacy/preview verification on `a831b58f8f6684bd345b668c1dfb4d8aab70c5c5`, run `29802524466`, artifact digest `sha256:1fc4c334f79f8f6b0f30fcaf55d2d19ea2941cdebc8c5eabf886a913704ea786`.
15. `https://direkt.forum/preview/` remains preserved as the explicit synthetic historical/review route.
16. W8 closure does not authorize real participants, real evidence, production authentication, external communications/payment activation, Phase 11 exit or production release.

## Completed implementation sequence

- W0 — baseline freeze, Android/API/screen inventory, functional parity matrix and project-wide documentation. **Closed.**
- W1 — additive Next.js/React/TypeScript PWA shell, design system, responsive navigation, manifest/service-worker safety, BFF boundary and typed API foundation. **Closed.**
- W2 — real public discovery vertical slice through canonical API contracts plus managed IAM-private evidence. **Closed — managed run `29694862350` PASS on `4b892b90c42239c81c4f9c6f8c9f5447519dd6f6`.**
- W3 — browser authentication/account/session boundary. **Closed — managed run `29703117963` PASS on `012a7b9c24e93087d823661298d051c08ea34ec0`.**
- W4 — complete customer journey parity. **Closed — managed run `29704996877` PASS on `61a6bce54bffcec545a2009ac353596ee1d69f83`.**
- W5 — complete provider journey parity. **Closed — managed PASS on exact merged source `79228f4bda96106b929aa6183613cb9d2dc127f6`.**
- W6 — commercial parity within authorized/gated payment boundaries. **Closed — managed PASS on `1b5753002afcf115f6f47334f6588648eca7501d`.**
- W7 — cross-client parity, security, accessibility, responsive, offline/network and Android regression closure. **Closed — exact-head combined regression plus managed browser canary PASS on `25b8cd1b122882974db94b502e3a87080105733d`.**
- W8 — controlled route/deployment cutover with preserved historical preview. **Closed — canonical `https://app.direkt.forum` verification PASS in run `29802524466`.**

## Persistent stop conditions

A future implementation workstream must still stop rather than merge if it would:

- regress Android/backend/database/OpenAPI/web/portal required gates;
- weaken Cloud Run IAM or expose privileged Supabase/database/Storage access;
- expose private evidence, raw contact data or exact private provider coordinates;
- fabricate or bypass participant, legal/privacy, payment or production-release gates;
- accept client-selected provider scope or authorization;
- allow commercial/payment state to influence verification or public trust claims;
- store production credentials in source or browser-readable surfaces;
- replace backend-authoritative behavior with static fixtures while claiming runtime completion.

## Conflict rule

The W8 implementation claim is **RELEASED**. W8 must not be used as a reason to block unrelated runtime-integration closure. Read-only or design-control audits may run on non-overlapping branches without claiming the implementation lane. Before material implementation begins, the next bounded implementation workstream must claim the lane with its protected surfaces, governing plan/issues and exact baseline. Parallel overlapping code writes remain prohibited once such a claim is established.
