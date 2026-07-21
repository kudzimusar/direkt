# DIREKT Project Status

**Updated:** 2026-07-21 (Asia/Tokyo)  
**Stable branch:** `main`  
**Sequential implementation lane:** `build/android-v1` when formally claimed  
**Documentation/modernization planning branch:** `docs/world-class-ai-vc-plan` until promoted  
**Programme state:** Phases 0–10 are complete. Phase 11 internal/synthetic readiness is complete; real 11C–11H evidence and 11J remain pending. Repository-clearable Phase 12 preauthorization engineering and the Phase 0–12 integration/runtime reconciliation are complete. Functional customer/provider web/PWA W0–W8 is closed. Formal Phase 12 production release is not authorized. The next product-modernization programme is VC1–VC8 after the VC0 design/benchmark checkpoint and explicit owner direction.

## 1. Current product truth

DIREKT now has:

- native Android customer/provider implementation;
- functional responsive customer/provider web/PWA companion;
- privileged operations portal;
- canonical NestJS REST/OpenAPI backend;
- PostgreSQL/PostGIS/private storage foundation;
- check-specific verification/trust engine;
- enquiries/reviews/complaints/commercial foundations;
- active managed development/staging infrastructure within documented boundaries;
- closed W0–W8 browser parity/cutover workstream.

The major remaining product gap is no longer basic backend scaffolding. It is the conversion of a technically mature but visually uneven product into a world-class, AI-assisted marketplace across customer, provider and operations experiences without regressing trust/privacy/security.

Governing modernization documents:

- `docs/product/WORLD_CLASS_PRODUCT_AND_AI_PLAN.md`;
- `docs/design/VISUAL_COMPLETION_PLAN.md`;
- `docs/architecture/AI_PRODUCT_ARCHITECTURE.md`;
- Issue #259.

## 2. Completed functional Android/Web parity

The owner-authorized browser companion is additive to native Android. W0 through W8 are closed.

Governing historical controls:

- `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`;
- `docs/web/FUNCTIONAL_PARITY_MATRIX.md`;
- `docs/architecture/FUNCTIONAL_PWA_ARCHITECTURE_DECISION.md`;
- `docs/testing/FUNCTIONAL_PWA_NO_REGRESSION_TEST_PLAN.md`.

Architecture:

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

W0–W8 result:

1. W0 baseline/parity controls — **Closed**;
2. W1 PWA shell/BFF/typed API foundation — **Closed**;
3. W2 public discovery slice — **Closed**;
4. W3 browser authentication/session boundary — **Closed**;
5. W4 customer parity — **Closed**;
6. W5 provider parity — **Closed**;
7. W6 commercial parity within boundaries — **Closed**;
8. W7 cross-client security/accessibility/resilience — **Closed**;
9. W8 deployment/canonical route cutover — **Closed**.

Functional browser application:

`https://app.direkt.forum`

Historical synthetic preview:

`https://direkt.forum/preview/`

W8 stable evidence:

- functional managed runtime source: `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`;
- managed run: `29721199177`;
- canonical-domain verification run: `29802524466`;
- canonical host: `https://app.direkt.forum`.

W8 proves functional parity/cutover, not final visual design approval.

## 3. Current checkpoints

| Checkpoint | PR / evidence | Stable result |
|---|---:|---|
| Phase 11 entry foundation | #113 | `53e20e67a877f481fc94458d1d2ea62bf4e47b0f` |
| Phase 11 synthetic pilot | #119 | `7b886b9bee91c1337f4e4ad43f71afa4389644de` |
| Phase 12 preauthorization foundation | #125 | `7b23d812b751345a740a34b77ad1b7890ed15cd1` |
| Phase 12A Android release engineering | #129 | `48f6d2d212d64192819d76d67e157b25f8a5e98b` |
| Phase 12B Play/Data Safety preparation | #134 | `b876c499aed0f135feec39601b58f22c734879cc` |
| Remaining clearable Phase 12 controls | #136 | `c6bb694046b2fe8e82d3f745330447632169355c` |
| Late Phase 12 release-policy hardening | #140 | `8363e2196739f5bad2393eaa8896d4c43bd64e0f` |
| Reconciled synthetic customer/provider PWA | #142 | `d9ae39963ace0ef99ad744f5615a98dbec058463` |
| Phase 0–12 integration/runtime audit | #149 | `25deaae72ca2974c5560a8059a50fce37c810f63` |
| Integration closeout/status sync | #151/#152 | `885eb72dcda12be8c23c4068dec138562af5888a` |
| W8 managed browser runtime | run `29721199177` | PASS |
| W8 canonical host/DNS/TLS | PR #257 / run `29802524466` | PASS |

## 4. Integration/runtime truth

### Active in approved boundaries

- Supabase PostgreSQL/PostGIS and private server-side Storage;
- canonical NestJS REST/OpenAPI backend;
- Artifact Registry and IAM-private Cloud Run API/operations staging;
- public synthetic-only functional customer/provider browser/BFF runtime at `https://app.direkt.forum`;
- Secret Manager;
- GitHub Actions and Workload Identity Federation;
- Cloud Logging/Monitoring;
- Firebase App Distribution;
- GitHub Pages/static public edge, `direkt.forum` and preserved `/preview/` route;
- native Android implementation;
- transactional outbox domain foundation.

### Implemented but gated

- Firebase phone authentication/session exchange;
- real participant admission and private evidence processing;
- real contact handoff;
- Google Play release/signing execution;
- real payment-provider activation.

### Externally provisioned or planned, not runtime-active

- Google Maps;
- Sentry;
- Resend application delivery;
- Firebase Crashlytics;
- FCM;
- Firebase Test Lab automation;
- Cloudflare Turnstile;
- production WhatsApp delivery;
- MTN MoMo/Airtel Money or approved payment aggregator path;
- automated PACRA/NCC/TEVETA access;
- AI model/provider runtime — **not selected or active merely because AI architecture is now planned**.

Vercel remains registrar role rather than the protected staging application runtime. Brevo/Twilio are historical/superseded directions unless later reviewed.

OpenAPI generation/drift checking is active. Fully generated Kotlin/TypeScript client package adoption remains separately evidenced work.

## 5. Live Supabase checkpoint

Project: `aeeuscifrxcjmnswqwnq`

Hardening migration:

`202607191200_integration_runtime_privilege_hardening.sql`

Recorded checksum:

`e02d1be228a992b7541db92328e9528b8fe0e184660fb78206ca405e9c7b2372`

Post-apply managed verification recorded:

- DIREKT migration count: `39`;
- browser application-schema usage: `0`;
- browser executable DIREKT application functions: `0`;
- PUBLIC executable DIREKT application functions: `0`;
- application `SECURITY DEFINER` functions: `0`;
- all required Storage buckets remain private;
- Storage object count remains `0` at the recorded checkpoint.

Advisor warnings on mutable `search_path`, extension placement and index opportunities remain explicit hardening/performance debt and must not be mass-mutated without workload/regression evidence.

## 6. Android release boundary

Current Android release identity remains:

- application ID: `com.kudzimusar.direkt`;
- version code: `12`;
- version name: `0.12.0-preauth.1`;
- channel: `preauthorization`.

The recorded merged release manifest declares the existing non-runtime-prompt permissions. Location, camera, contacts, SMS/call-log, broad storage/media, microphone and notification runtime permissions remain absent at the recorded preauthorization checkpoint.

No signed production artifact or Play production release has been created.

## 7. World-class benchmark direction

DIREKT uses a composite benchmark:

- **Urban Company:** service-marketplace polish, provider professionalism and operational quality;
- **Checkatrade:** trust proposition and recurring checks;
- **Taskrabbit:** transaction simplicity;
- **Thumbtack:** AI-guided natural-language/multimodal discovery;
- **DIREKT differentiation:** check-specific proof, privacy-by-precision, payment-independent trust, Zambia low-bandwidth/locality fit and human-accountable operations.

No single benchmark is copied literally.

## 8. AI-native product direction

AI is now a planned cross-cutting product capability, not an isolated chatbot feature.

Target bounded uses:

- natural-language service need understanding;
- query/category expansion;
- explainable provider comparison summaries from public facts;
- provider onboarding/requirements guidance;
- provider public-copy drafting with confirmation;
- evidence quality/OCR assistance after restricted-data approval;
- operations case/checklist assistance;
- complaint/review moderation assistance;
- fraud/anomaly signals;
- documentation-grounded support;
- analytics/taxonomy insights.

Non-negotiable AI boundary:

AI cannot autonomously approve/reject verification, publish trust claims, suspend providers, decide serious complaints/appeals, mutate payment ledgers, bypass authorization, expose restricted evidence or make legal conclusions.

No AI provider is currently marked `ACTIVE`. Provider selection/provisioning/runtime activation requires the same integration-truth discipline as every other external dependency.

## 9. VC0 and next implementation programme

VC0 establishes the audit, benchmark, world-class target, AI architecture and owner visual-review checkpoint without broad UI implementation.

VC1–VC8:

1. **VC1 — Design-system reconciliation**;
2. **VC2 — High-fidelity benchmark directions and owner approval**;
3. **VC3 — Approved Design DNA/component foundation**;
4. **VC4 — Customer world-class experience**;
5. **VC5 — Provider professional workspace**;
6. **VC6 — Operations mission control**;
7. **VC7 — AI intelligence layer**;
8. **VC8 — World-class visual/product/AI quality gate**.

Before material VC implementation:

- re-fetch latest stable source;
- verify predecessor CI;
- correct the known historical W7/W8 verifier-to-lock coupling before the new legitimate lock owner is recorded;
- claim exact implementation scope;
- preserve existing backend/domain/integration boundaries;
- implement bounded vertical slices with exact-head regression and visual evidence.

## 10. Visual quality status

Current functional UI remains testable but should not be confused with final visual quality.

Known broad gaps:

- insufficient typography hierarchy;
- primitive/placeholder iconography in places;
- limited imagery/marketplace richness;
- text-heavy cards/forms;
- developer/workstream/API language visible in places;
- incomplete world-class search/discovery/provider profile composition;
- provider workspace still exposes implementation-oriented concepts in places;
- operations lacks the final desktop queue → case → secure evidence → decision composition;
- AI assistance is not yet implemented as a product layer.

VC1–VC8 exists to close these gaps without regressions.

## 11. Remaining genuine programme gates

No repository-only document, toggle, synthetic dataset, web UI, AI demo or unsigned artifact can clear:

1. actual 11C–11H Zambia pilot evidence;
2. evidence-backed 11J `PROCEED`;
3. required Zambia regulatory/legal/privacy approvals and final live policy versions;
4. evidence-led removal/isolation of synthetic preview marketplace surfaces from production;
5. end-to-end account deletion including public request/backend fulfillment;
6. actual production environment plus production-backup restore;
7. operational support/verification/on-call staffing and exercises;
8. active/tested production monitoring and escalation;
9. real Play account/current-policy verification, authorized signed reproducible AAB, final forms/assets/content rating and testing;
10. formal go/no-go, staged rollout and final release record;
11. for any production AI capability: approved provider/data processing, evaluation/security evidence, monitoring, fallback/kill switch and human-accountability controls.

## 12. Current boundary and next authorized work

- Phase 10: complete.
- Phase 11 internal/synthetic readiness: complete.
- Phase 11 real evidence and 11J: pending.
- Phase 12 repository-clearable/preauthorization engineering: complete.
- Phase 0–12 integration/runtime reconciliation: complete.
- Functional customer/provider web/PWA W0–W8: **CLOSED**.
- W8 implementation claim: **RELEASED**.
- Formal Phase 12 production release: **BLOCKED** until Phase 11 and all release gates support `PROCEED`.
- Issue #112 remains the real-pilot tracker.
- Issue #259 is the visual/world-class modernization tracker.
- Next planned implementation programme after the documentation/owner checkpoint: **VC1–VC8**.

VC work must not be used to bypass real pilot, legal, payments, registry, communications or production activation gates.