# DIREKT Project Status

**Updated:** 2026-07-21 (Asia/Tokyo)  
**Stable branch:** `main`  
**Active promotion branch:** `vc/ai-quality-7-8`  
**Active promotion PR:** #270  
**Governing visual/product issue:** #259  
**Runtime integration tracker:** #261

## 1. Programme state

DIREKT’s repository state is now:

- Phases 0–10 — **complete**;
- Phase 11 internal/synthetic readiness — **complete**;
- Phase 11 real 11C–11H evidence and 11J — **pending / externally gated**;
- repository-clearable Phase 12 preauthorization engineering — **complete**;
- formal Phase 12 production release — **not authorized**;
- functional customer/provider web/PWA W0–W8 — **closed**;
- VC0 preparation/control — **closed**;
- VC1–VC8 implementation — **completion candidate proven on PR #270; final closure-head regression/promotion pending**;
- runtime integration closure — **RC1 Resend closed at its managed synthetic boundary; RC2 Sentry is the next bounded checkpoint after VC promotion**.

The major product-modernization work is no longer an unimplemented plan. VC1–VC8 has been implemented across Android, customer/provider PWA and operations, including bounded AI assistance and permanent visual/quality evidence. Existing real-world, privacy/legal, payment and production gates remain authoritative.

## 2. Current product truth

DIREKT has:

- native Android customer/provider implementation using Jetpack Compose/Material 3;
- functional responsive customer/provider web/PWA companion;
- privileged internal operations portal;
- canonical NestJS REST/OpenAPI backend;
- PostgreSQL/PostGIS/private-storage foundation;
- check-specific verification/trust engine;
- enquiries, reviews, complaints and commercial foundations;
- active managed development/staging infrastructure within documented boundaries;
- canonical browser application at `https://app.direkt.forum`;
- preserved synthetic historical preview at `https://direkt.forum/preview/`;
- a completed VC1–VC8 modernization candidate using the approved Structured Trust + Neighbourhood Marketplace + Field Utility hybrid;
- bounded AI assistance behind DIREKT-controlled backend/BFF boundaries with deterministic/manual fallback and fail-closed use-case switches;
- permanent synthetic-safe responsive/native visual-evidence generation in normal CI.

Android remains the primary native Version 1 client. Web/PWA remains additive and shares product semantics through canonical backend contracts, not shared UI binaries or privileged browser credentials.

## 3. Functional Android/web parity

W0–W8 are **closed**.

```text
                         DIREKT PRODUCT
                              │
               ┌──────────────┴──────────────┐
               │                             │
        Android Client                Web/PWA Client
       Jetpack Compose              Next.js / React
               │                             │
               └──────────────┬──────────────┘
                              │
                     Canonical OpenAPI
                              │
                     DIREKT NestJS API
                              │
              PostgreSQL / PostGIS / Private Storage
                              │
          Identity / Trust / Enquiries / Reviews / Commercial / Audit
```

W8 stable managed evidence remains:

- functional managed runtime source: `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`;
- managed run: `29721199177`;
- canonical-domain verification run: `29802524466`;
- canonical host: `https://app.direkt.forum`.

W8 proves functional browser parity/cutover. VC1–VC8 supplies the subsequent visual/product/AI modernization; neither workstream authorizes Phase 11 real participants or production release.

## 4. VC1–VC8 implementation truth

### VC1–VC6

Promoted through PR #268 at:

`c5eb25b2e579d7f148b67130baf307a45f11e7a0`

Delivered:

- cross-surface Design DNA and visual-system reconciliation;
- customer marketplace/discovery and provider-profile modernization;
- provider professional workspace and evidence presentation;
- operations mission-control / queue → case/evidence → checklist/decision composition;
- Android visual/product modernization;
- historical W4/W7 ownership corrections so legitimate post-closure evolution remains regression-tested rather than prohibited.

### VC7 — bounded AI intelligence

The provider-neutral AI foundation was promoted through PR #265. VC7 adds source-controlled product use cases rather than client-direct model access:

- customer natural-language discovery/category assistance;
- grounded public Help assistance;
- provider onboarding/readiness guidance;
- provider public-profile drafting requiring provider review/confirmation.

Controls include:

- use-case registry and data classification;
- prompt/version control and input limits;
- schema/canonical-category validation;
- authorization and provider-scope enforcement;
- evaluation fixtures and prompt/security tests;
- deterministic/manual fallback;
- per-use-case kill switches;
- explicit disclosure/confirmation where material.

AI cannot approve/reject verification, create trust/publication/ranking authority, authorize payments, decide serious disputes/appeals, widen permissions or make legal/regulatory conclusions.

Restricted evidence OCR/extraction and restricted operations AI remain disabled until separately approved privacy/security/data-processing/provider requirements and dedicated runtime evidence exist.

### VC8 — quality and evidence closure

VC8 adds permanent checks for:

- responsive/adaptive presentation;
- accessibility/focus/target/reflow rules;
- AI disclosure and deterministic fallback;
- privacy/credential boundaries;
- no blanket `Verified` regression;
- restricted-data AI gating;
- exact-head visual evidence.

Permanent evidence ownership:

- `functional-pwa-ci.yml` — responsive customer/provider/public Help/operations evidence;
- `android-ci.yml` — native Android build/emulator/customer/provider/evidence captures.

The standalone VC8 screenshot workflow is redundant after these permanent lanes proved successful and is removed in the final closure state-control commit.

## 5. VC8 candidate evidence

Candidate source:

`2bb734660b520940311c4d2b9c088d8f15224755`

### Web and operations

- workflow run: `29829438711`;
- artifact: `direkt-vc8-web-visual-evidence-2bb734660b520940311c4d2b9c088d8f15224755`;
- artifact ID: `8494672572`;
- digest: `sha256:212607749a2c3525e15cb46083f06c221ca0b485b0987f5ae338d5d2bf8de3b0`.

Representative states include customer discovery at responsive viewports, deterministic AI fallback, provider public profile/check-specific trust, grounded Help, operations mission control and evidence review.

### Native Android

- workflow run: `29829437845`;
- artifact: `direkt-vc8-android-visual-evidence-2bb734660b520940311c4d2b9c088d8f15224755`;
- artifact ID: `8494745779`;
- digest: `sha256:ce86f3affd2c8b3b797e8a22de1dda2fd080d32f3a46b20d365500ae08a1a0bb`.

Visually inspected native states:

1. Customer Discover;
2. Provider Overview;
3. Provider Evidence/recovery.

All visual evidence is synthetic/public-safe as applicable. No private evidence, exact private coordinates, raw contacts, credentials, developer/test-harness presentation or blanket provider verification is exposed.

## 6. Exact-head regression truth

All permanent candidate gates passed on `2bb734660b520940311c4d2b9c088d8f15224755`:

- Backend CI and Backend Container CI;
- Android unit/lint/assembly plus native visual evidence;
- Android performance budget;
- both customer/provider PWA suites;
- W4 customer contract;
- W7 cross-client regression;
- W8 canonical-domain contract;
- integration runtime audit;
- controlled staging readiness;
- recovery/reliability;
- supply-chain security;
- Phase 11 synthetic controlled pilot;
- Play readiness;
- Phase 12A preauthorization;
- final preauthorization readiness;
- documentation quality.

No coverage threshold, authorization rule, IAM/BFF boundary, privacy rule, trust rule or release condition was weakened to obtain the green matrix.

The final closure state-control commit must rerun the same permanent matrix before PR #270 may merge.

## 7. Integration/runtime truth

Detailed authority:

- `docs/integrations/CURRENT_INTEGRATION_STATUS.md`;
- `docs/integrations/LIVE_INTEGRATION_LEDGER.md`;
- `docs/integrations/RUNTIME_INTEGRATION_CLOSURE_PLAN.md`;
- `WORKSTREAM_LOCK.md`.

Current distinctions remain important:

- Supabase/Postgres/PostGIS/private Storage, canonical backend, Cloud Run, Secret Manager, Workload Identity Federation, Logging and core CI/runtime infrastructure are active within their documented environment boundaries;
- RC1 Resend has managed synthetic outbox → provider proof, while real-participant/continuous production email remains separately gated;
- the provider-neutral AI contract is implemented, but external model runtime activation is per-use-case/fail-closed and restricted-data AI remains disabled;
- Maps and other externally provisioned integrations require their own runtime evidence before being represented as active;
- payment rails may be sandbox-proven while real money remains disabled;
- an account, API key, secret or provider dashboard entry alone is never `ACTIVE` runtime evidence.

Backend/integration readiness does not authorize real participant data, private evidence processing, production communications, real money or production release.

## 8. Selected checkpoints

| Checkpoint | PR / evidence | Stable result |
|---|---:|---|
| Phase 11 entry foundation | #113 | `53e20e67a877f481fc94458d1d2ea62bf4e47b0f` |
| Phase 11 synthetic pilot | #119 | `7b886b9bee91c1337f4e4ad43f71afa4389644de` |
| Phase 12 preauthorization foundation | #125 | `7b23d812b751345a740a34b77ad1b7890ed15cd1` |
| Integration/runtime audit | #149 | `25deaae72ca2974c5560a8059a50fce37c810f63` |
| W8 managed browser runtime | run `29721199177` | PASS |
| W8 canonical host/DNS/TLS | run `29802524466` | PASS |
| Runtime-integration closure baseline | #263 | promoted |
| AI0 provider-neutral foundation | #265 | promoted |
| World-class/AI plan | #266 | `48f57870ec0820ed5d8d4f1f34f9fb531c1339f1` |
| VC1–VC6 implementation | #268 | `c5eb25b2e579d7f148b67130baf307a45f11e7a0` |
| RC1 Resend managed synthetic closure | #273 | merged to `main` |
| VC7–VC8 completion candidate | #270 / `2bb734…` | all permanent candidate gates PASS |

## 9. Trust, privacy and commercial boundaries

The following remain non-negotiable:

- no blanket `Verified` badge;
- public trust remains check-specific, scoped, dated/currentness-aware and limitation-aware;
- payment/commercial state cannot create or strengthen verification, publication or ranking authority;
- exact private provider coordinates, private evidence, raw contact data, credentials and reviewer-private notes remain protected;
- browser/Android clients do not receive privileged provider/database/payment/AI credentials;
- provider scope and consequential authorization remain backend-authoritative;
- synthetic fixtures cannot replace canonical state while claiming production functionality.

## 10. Phase 11/12 boundaries remain unchanged

VC1–VC8 completion cannot clear:

1. actual 11C–11H Zambia pilot evidence;
2. evidence-backed 11J `PROCEED`;
3. required Zambia legal/privacy/regulatory approvals and final live policy versions;
4. production evidence/private-data readiness;
5. end-to-end account deletion where required;
6. production environment and backup restore;
7. operational staffing/exercises;
8. active production monitoring/escalation;
9. real Play account/current-policy/signed-release controls;
10. formal go/no-go/staged rollout;
11. any production AI capability without provider/data/evaluation/security/monitoring/fallback/human-accountability approval.

## 11. Next execution rule

Before PR #270 promotion:

1. remove only the redundant standalone VC8 visual workflow; keep permanent PWA/Android evidence ownership;
2. reconcile the VC status, upgraded plan and workstream lock;
3. rerun the full exact-head regression matrix on the closure SHA;
4. inspect exact closure-head web and Android evidence artifacts;
5. verify `main` has not advanced or reconcile it before merge;
6. verify zero unresolved review threads;
7. merge PR #270 only when every required permanent gate is green;
8. close Issue #259 and release the lane;
9. begin RC2 Sentry only from the merged baseline under a new/explicitly reconciled workstream claim.

This sequencing preserves the owner requirement for continuous implementation while keeping regression, trust, privacy, integration and release controls authoritative.