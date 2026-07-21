# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — VC0 repository-wide visual baseline and gap audit |
| Owner/agent | VC — DIREKT Visual Completion |
| Authorized scope | Read-only reconstruction/audit across Android, functional web/PWA, operations portal and historical preview surfaces; create/update VC0 control/design documentation; narrowly repair regression-harness defects discovered while verifying the baseline, without changing product/runtime/UI behaviour. No broad UI implementation until owner approves a representative high-fidelity direction. |
| Protected surface | Android behaviour and release controls; backend/database/OpenAPI contracts; IAM/BFF/session boundaries; provider-scope authorization; trust/publication semantics; private evidence/location/contact boundaries; PWA/offline/security behavior; operations permissions; Phase 11/12 gates. |
| Implementation lane | `build/android-v1` — historical name retained as the single sequential implementation lane |
| Exact VC0 baseline | `a7a1e03f4de3b2cad3d51b7f611bdbb2f30af961` (`fix: complete closed-state W8 verifier`) |
| Stable predecessor checkpoint | W8 CLOSED: managed functional runtime source `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`; managed run `29721199177`; canonical host `https://app.direkt.forum`; canonical-domain verification run `29802524466`; PR #257 merge checkpoint `a4ad5fa348857f27b5bfef23f6f761deb75859c7` |
| Current task | VC0 only: exact-source/regression verification, full implemented-screen inventory, code/preview inspection, visual gap matrix, design-system gap audit, Stitch/Higgsfield workflow, differentiated flagship design directions for owner review; plus only the regression-harness repair needed to keep historical W7/W8 checks independently valid. |
| Governing issue | #259 — VC — DIREKT Visual Completion |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates |

## VC0 implementation boundary

VC0 may change repository control/design documentation needed to establish the programme and its auditable baseline. It may also make a narrowly bounded regression-harness correction when an existing historical verifier is proven to be incorrectly coupled to a later workstream state. It must not mass-edit Android, web/PWA, operations UI, backend, database, OpenAPI, authentication, authorization, trust, payment, notification or deployment behaviour.

Before VC1 or any broad visual implementation begins, VC0 must:

1. reconstruct the product from the repository authority hierarchy;
2. record the exact current source and regression state without false-green claims;
3. inventory all implemented and specified customer, provider, shared/auth and operations screens;
4. inspect actual Android, functional browser and operations UI code plus historical preview/reference surfaces;
5. classify each surface as functional + visually ready, functional + needs polish, functional + prototype-level UI, missing visual implementation, or externally gated;
6. identify visible development/prototype artifacts and cross-client design-system gaps;
7. define protected vertical-slice sequencing for VC1–VC7;
8. prepare Stitch-first Design DNA and Higgsfield-secondary asset workflows;
9. present genuinely differentiated representative high-fidelity directions for owner approval;
10. keep broad UI propagation blocked until that approval is explicit.

## Current regression truth at VC0 claim

On exact head `a7a1e03f4de3b2cad3d51b7f611bdbb2f30af961`:

- W8 canonical-domain verification: PASS;
- functional customer/provider PWA CI: PASS;
- W4 customer contract: PASS;
- integration runtime audit: PASS;
- documentation quality: PASS;
- W7 cross-client regression: Android and backend/database/OpenAPI jobs PASS, while the W2–W7 functional-web job fails deterministically because that historical W7 workflow now invokes the global `npm run verify`, which later acquired W8-specific checks. This is a regression-harness coupling defect, not evidence that Android/backend/database/OpenAPI or the separately verified functional PWA runtime regressed.

VC0 must correct that coupling so W7 verifies W2–W7 and W8 remains independently verified by its own exact canonical-domain workflow. A VC workstream must not describe the complete regression baseline as green until the corrected exact-head gate passes.

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

## Persistent stop conditions

The VC workstream must stop rather than merge if it would:

- regress Android/backend/database/OpenAPI/web/portal required gates;
- weaken Cloud Run IAM or expose privileged Supabase/database/Storage access;
- expose private evidence, raw contact data or exact private provider coordinates;
- fabricate or bypass participant, legal/privacy, payment or production-release gates;
- accept client-selected provider scope or authorization;
- allow commercial/payment state to influence verification or public trust claims;
- store production credentials in source or browser-readable surfaces;
- replace backend-authoritative behavior with static fixtures while claiming runtime completion;
- introduce a blanket “Verified” badge or otherwise overstate check-specific trust;
- use colour alone to communicate status;
- remove accessible list alternatives to map/location experiences;
- rebuild the existing product as a separate Stitch/Higgsfield-generated application.

## Conflict rule

The lane is **CLAIMED by VC0**. Parallel overlapping writes are prohibited. Unrelated work must use non-overlapping paths or wait for a documented handoff/release. Broad visual implementation remains blocked until VC0 closes and the owner explicitly approves a representative high-fidelity direction.