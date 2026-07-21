# DIREKT VC0 — Repository-wide UI Visual Gap Matrix

**Programme:** VC — DIREKT Visual Completion  
**Workstream:** VC0 — repository-wide visual baseline and gap audit  
**Governing issue:** #259  
**Stable baseline:** `a06a66d313d8417d8b7731e3d845c1c71bda3dd4` (`Merge PR #260: finalize W8 closure and release integration sequencing`)  
**Verified predecessor head:** `e2c4cdd33cdf0f037fc5528093d4ef904f2bb07e`  
**Production status:** Phase 11 real evidence and 11J remain pending; formal Phase 12 production release remains blocked

## 1. Scope and authority

This audit covers the whole DIREKT product:

1. native Android customer/provider application;
2. functional customer/provider web/PWA;
3. internal operations/admin portal;
4. historical prototype/preview surfaces as design evidence only.

It was reconstructed from the repository authority chain, in order:

1. `AGENTS.md`;
2. `MASTER_BUILD_PLAN.md`;
3. `PROJECT_STATUS.md`;
4. `WORKSTREAM_LOCK.md`;
5. `DEFINITION_OF_DONE.md`;
6. `design.md`;
7. current repository/integration reconciliation evidence;
8. product requirements, feature catalogue, user journeys and screen inventory;
9. `docs/design/DESIGN_SYSTEM.md`;
10. `docs/design/ANDROID_UI_SPECIFICATION.md`;
11. `docs/design/PWA_UI_SPECIFICATION.md`;
12. `docs/design/RESPONSIVE_ADMIN_DESIGN.md`;
13. relevant Android, PWA, operations, API, testing and phase/workstream documents;
14. actual current implementation;
15. AI-generated design suggestions last.

Repository trust/privacy/security/product rules always override generated design output.

## 2. Exact current checkpoint

During VC0, W8 closure/status synchronization was promoted separately through PR #260. VC0 was therefore reconciled onto the new stable `main` rather than carrying a divergent pre-promotion history.

Current stable source:

`a06a66d313d8417d8b7731e3d845c1c71bda3dd4`

W8 evidence remains:

- managed functional runtime source: `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`;
- managed run: `29721199177`;
- managed evidence digest: `sha256:00a0d41e8b8824d7764ab9762f05816bac3639d9360ed8926071c346f066e0b0`;
- canonical-domain verification head: `a831b58f8f6684bd345b668c1dfb4d8aab70c5c5`;
- canonical-domain run: `29802524466`;
- canonical evidence digest: `sha256:1fc4c334f79f8f6b0f30fcaf55d2d19ea2941cdebc8c5eabf886a913704ea786`;
- functional browser: `https://app.direkt.forum`;
- preserved historical/synthetic preview: `https://direkt.forum/preview/`.

On predecessor head `e2c4cdd33cdf0f037fc5528093d4ef904f2bb07e`, the following required checks passed:

- documentation quality;
- W8 canonical-domain verification;
- functional customer/provider PWA CI;
- customer/provider PWA CI;
- W4 customer contract;
- integration runtime audit;
- W7 cross-client regression.

### Regression-harness prerequisite discovered by VC0

The historical W7 workflow currently calls the aggregate `npm run verify`, and that aggregate later acquired W8 checks. The W8 verifier also asserts the current workstream lock remains in the W8-released state.

That is harmless while VC0 remains a non-overlapping design-control branch and the W8 lock is released, but it creates a latent coupling: **before a future material VC implementation workstream claims the implementation lane, W7/W8 historical gate ownership must be decoupled or the W8 verifier must be made insensitive to the next legitimate lock owner.**

VC0 does not change product/runtime behavior to solve that future-lane issue. It is a required pre-VC1/implementation regression-control item.

## 3. Classification legend

| Classification | Meaning |
|---|---|
| **Functional + visually ready** | Functionality and visual execution already meet the documented production-quality direction. |
| **Functional + needs polish** | Structure/behavior are sound, but hierarchy, typography, icons, imagery, spacing, responsive detail or final states need refinement. |
| **Functional + prototype-level UI** | Core behavior exists, but presentation still exposes development/demo language, raw technical inputs, fixtures, simulation controls or placeholder interactions. |
| **Missing visual implementation** | A required user-facing visual flow is absent or materially incomplete even where backend/domain support exists. |
| **Externally gated** | Completion depends materially on a separately gated integration, real participant/pilot state, production credential or approval. A truthful inactive/fallback design may still be created. |

**VC0 conclusion:** no flagship customer, provider or operations journey is currently production-visually complete end-to-end.

## 4. Actual implementation baseline

### 4.1 Native Android

The Android application is genuine Jetpack Compose/Material 3 product code with discovery, provider workspace, interaction, commercial and pilot-auth domain behavior. It is not merely a screenshot prototype.

Current visual problems include:

- root experience still behaves like a broad controlled-pilot/demo surface rather than a finished route-led marketplace;
- top-bar development label such as `Phase 11 — controlled pilot entry`;
- bottom navigation icons rendered from destination initials instead of approved vectors;
- `Preview context` mode selector;
- repeated development/trust-boundary explanation cards;
- synthetic controls such as `Start synthetic upload`, `Simulate interruption`, `Save synthetic draft offline`, `Simulate stale`, `Expire consent`;
- text description placeholders instead of a mature imagery system;
- synthetic text-map presentation rather than the intended map + accessible list product experience.

Strength: the Android theme already provides a useful Material 3 green/ink/mint/amber light/dark foundation.

### 4.2 Functional customer/provider web/PWA

`web/direkt-app/` is the canonical functional browser client and preserves the reviewed BFF/session/private-API boundary.

Strengths:

- mobile bottom navigation;
- tablet rail;
- desktop persistent side navigation;
- skip links/focus/reduced-motion/offline foundations;
- API-backed discovery;
- authenticated customer/provider state and lifecycle mutations;
- public-safe provider projection;
- commercial parity inside gated boundaries.

Visual/development debt:

- workstream labels such as `Functional PWA workstream`, W-stage/parity language and implementation-boundary copy;
- primitive text glyphs such as `⌂`, `◇`, `↔`, `○`, `←`, `★`, `☆`;
- card-heavy, text-heavy presentation with little marketplace imagery;
- no finished map/list search experience;
- raw provider IDs in enquiry UI;
- raw category keys;
- raw latitude/longitude and WKT polygon inputs in provider workspace;
- API/BFF/provider-scope implementation explanations presented too prominently to end users.

Strength: the public provider profile has the strongest current trust-information structure and should be evolved rather than discarded.

### 4.3 Operations/admin portal

The operations portal has broad route coverage and real permission-aware architecture for mission control, triage, evidence review, field workflow, escalations, incidents, interaction history, review moderation, complaints, finance, reporting, provider workspaces and discovery eligibility.

Current visual state remains prototype/test-harness level:

- labels such as `Synthetic Phase 7`, `Stage 7A`, `Stage 7B`;
- fixture records embedded in page modules;
- visible API implementation notes;
- loading/empty/error/access-denied test cards shown as demonstrations rather than state-driven product views;
- evidence review is metadata/table oriented rather than the documented secure evidence-review workspace;
- some controls remain below the 48dp-class target;
- local hard-coded status colours are not fully reconciled to one semantic token system;
- desktop table density exists, but the intended queue/detail/evidence split and responsive field/triage hierarchy are not yet high fidelity.

### 4.4 Historical prototype/preview

`web/direkt-pwa/` and `https://direkt.forum/preview/` remain historical/synthetic review evidence only. Labels such as `Synthetic remote UI review`, `UI checkpoint` and `Android-aligned PWA` are appropriate only on that preserved preview route and must not define the canonical product aesthetic.

No repository-wide owner-approved screenshot/reference baseline set was found during VC0 source inspection.

---

## 5. Shared/auth screen matrix

| ID | Screen | Classification | Main gap |
|---|---|---|---|
| SH-001 | Splash / session restore | Functional + needs polish | Branded calm loading, offline/session recovery. |
| SH-002 | Registration / account creation | Missing visual implementation | Complete progressive production flow without implying activation. |
| SH-003 | Phone sign-in | Functional + prototype-level UI | Remove pilot/implementation language; polish validation/recovery. |
| SH-004 | Verification code | Functional + prototype-level UI | OTP hierarchy, resend/error/timer/accessibility states. |
| SH-005 | Terms / privacy consent | Functional + prototype-level UI | Separate required/optional consent and readable summaries. |
| SH-006 | Notification permission education | Externally gated | Honest inactive/denied/settings states; no fake FCM activation. |
| SH-007 | Customer/provider mode/context | Functional + prototype-level UI | Legitimate account context without client-granting provider scope. |
| SH-008 | Notification centre | Externally gated | Design only around actually active delivery/state. |
| SH-009 | Support / help | Missing visual implementation | Cohesive help/safety/support centre. |
| SH-010 | Account / security | Functional + needs polish | Unified profile/security/privacy/session hierarchy. |

## 6. Customer screen matrix

| ID | Screen | Classification | Main gap |
|---|---|---|---|
| CU-001 | Discover home | Functional + prototype-level UI | Marketplace hierarchy, categories, imagery, calm trust cues. |
| CU-002 | Area selector | Functional + prototype-level UI | Human area picker, recent areas, privacy-first fallback. |
| CU-003 | Category browser | Functional + prototype-level UI | Rich icon/imagery tiles and hierarchy. |
| CU-004 | Search suggestions | Missing visual implementation | Recent/suggested/category/provider suggestions. |
| CU-005 | Results list | Functional + needs polish | Production provider cards, imagery, service fit, availability, trust snippets. |
| CU-006 | Results map | Externally gated | Safe map/list shell and accessible list; Google Maps activation remains separate. |
| CU-007 | Filters | Functional + needs polish | Sheet/panel patterns, active summary, reset, 48dp targets. |
| CU-008 | Provider public profile | Functional + needs polish | Imagery, hierarchy, adaptive layout, stronger service/actions composition. |
| CU-009 | Trust details | Functional + needs polish | Dedicated check-detail components with dates/scope/limitations. |
| CU-010 | Service detail | Functional + prototype-level UI | Clear scope, availability, pricing disclaimer and enquiry CTA. |
| CU-011 | Create enquiry | Functional + needs polish | Progressive form; remove raw IDs; clear draft/retry. |
| CU-012 | Contact-sharing consent | Functional + needs polish | Channel, expiry, revoke and privacy clarity. |
| CU-013 | Enquiry detail | Functional + needs polish | Timeline/next-action/conflict hierarchy. |
| CU-014 | Saved providers | Functional + needs polish | Stronger provider cards, imagery and empty state. |
| CU-015 | Review eligibility | Functional + needs polish | Human reasons instead of internal codes. |
| CU-016 | Submit review | Functional + needs polish | Rating controls/icons, moderation expectations and success states. |
| CU-017 | Report provider/interaction | Functional + prototype-level UI | Separate safety/report/complaint semantics. |
| CU-018 | Complaint detail | Functional + prototype-level UI | Dedicated status/timeline/escalation view. |
| CU-019 | No-results recovery | Functional + needs polish | Alternative area/category and clear-filter recovery. |
| CU-020 | Location permission/fallback | Externally gated | Permission education only when justified; manual area remains first-class. |

## 7. Provider screen matrix

| ID | Screen | Classification | Main gap |
|---|---|---|---|
| PR-001 | Provider overview | Functional + prototype-level UI | Production workspace dashboard and task hierarchy. |
| PR-002 | Onboarding checklist | Functional + prototype-level UI | Resumable stepper/checklist with clear reasons/actions. |
| PR-003 | Provider type/pathway | Functional + prototype-level UI | Guided fixed/mobile/hybrid pathway. |
| PR-004 | Representative details | Missing visual implementation | Authority/role capture and edit/review states. |
| PR-005 | Business/professional details | Missing visual implementation | Coherent category-aware details flow. |
| PR-006 | Categories/services | Functional + prototype-level UI | Human category/service editor; remove raw keys. |
| PR-007 | Operating model | Functional + prototype-level UI | Explain privacy/location implications. |
| PR-008 | Service areas | Functional + prototype-level UI | Replace raw WKT with safe area controls + accessible text alternative. |
| PR-009 | Public premises consent | Functional + prototype-level UI | Replace raw coordinates with place/address workflow and explicit preview. |
| PR-010 | Evidence requirements | Functional + needs polish | Requirement cards, accepted evidence, status, scope, expiry. |
| PR-011 | Evidence capture/upload | Functional + prototype-level UI | Real picker/capture/progress/retry; remove simulation controls. |
| PR-012 | Review/declaration | Missing visual implementation | Summary, declarations, consent and edit links. |
| PR-013 | Verification timeline | Functional + needs polish | Strong chronology, per-check status/correction/expiry. |
| PR-014 | Action required/correction | Functional + prototype-level UI | Dedicated task/detail/resubmit flow. |
| PR-015 | Availability | Functional + needs polish | Quick state, next available, per-service scope. |
| PR-016 | Enquiry inbox | Functional + needs polish | Prioritised list, attention/SLA context and filters. |
| PR-017 | Enquiry response | Functional + needs polish | Accept/decline/info hierarchy and conflict states. |
| PR-018 | Portfolio | Missing visual implementation | Public work/premises imagery separate from evidence. |
| PR-019 | Reviews/provider response | Functional + needs polish | Summary, response, moderation/appeal states. |
| PR-020 | Subscription/receipts | Functional + needs polish | Plan/invoice/receipt clarity; real payments remain gated. |
| PR-021 | Provider members | Missing visual implementation | Role-scoped member management only when authorized. |
| PR-022 | Publication status | Functional + needs polish | Explain why published/not published and blockers without commercial conflation. |

## 8. Operations/admin screen matrix

| ID | Screen | Classification | Main gap |
|---|---|---|---|
| OP-001 | Operations dashboard | Functional + prototype-level UI | Real workload/attention hierarchy; remove stage labels. |
| OP-002 | Verification queue | Functional + prototype-level UI | Queue/detail split, filters, SLA/priority semantics, responsive triage. |
| OP-003 | Verification case | Functional + prototype-level UI | Cohesive case workspace with checklist/evidence/history/decision. |
| OP-004 | Secure evidence viewer | Missing visual implementation | Revocable viewer, watermark, zoom, metadata, versions, timeout/access audit. |
| OP-005 | Decision + reason form | Functional + prototype-level UI | Check-specific decision, reason, limitation and four-eyes states. |
| OP-006 | Field assignment | Functional + prototype-level UI | Task list/detail and privacy-minimised field hierarchy. |
| OP-007 | Field visit record | Functional + prototype-level UI | Mobile-first record with missed/unable/safety states. |
| OP-008 | Provider operations profile | Functional + prototype-level UI | Unified provider/services/checks/cases/actions/audit view. |
| OP-009 | Complaint queue | Functional + prototype-level UI | Queue/detail, severity/status, interaction linkage. |
| OP-010 | Incident case | Functional + prototype-level UI | Severity/owner/actions/timeline distinct from complaints. |
| OP-011 | Appeal review | Functional + prototype-level UI | Original/moderated/appeal comparison and reasoned decision. |
| OP-012 | Subscription exception | Functional + prototype-level UI | Account/invoice context; no trust impact. |
| OP-013 | Payment reconciliation | Externally gated | Honest ledger/reconciliation shell only until real provider activation. |
| OP-014 | Taxonomy configuration | Missing visual implementation | Versioned category/config editor with review. |
| OP-015 | Evidence-rule configuration | Missing visual implementation | Versioned rule editor with effective dates/audit. |
| OP-016 | Audit search/history | Missing visual implementation | Role-scoped immutable search/history/export. |
| OP-017 | Role management | Missing visual implementation | Separately controlled; UI never becomes authorization source. |
| OP-018 | System health/queues | Functional + prototype-level UI | Cohesive degraded-integration/queue/kill-switch view without secrets. |

Additional implemented operations routes—escalations/overrides, interaction history, review moderation, customer complaints, commercial finance, expiry/reporting, provider drafts, provider workspaces and discovery eligibility—are all **functional + prototype-level UI** and should be consolidated into the VC6 component/workspace system rather than redesigned as isolated pages.

## 9. User-facing development/prototype artifacts to remove from canonical product UI

### Android

- phase/pilot labels in permanent app chrome;
- `Preview context`;
- destination-initial navigation icons;
- synthetic map/text-map labels;
- visible `Image description:` placeholders;
- synthetic upload/offline/stale/consent simulation controls;
- developer-facing API/publication boundary explanations where user-centred copy should lead.

### Functional web/PWA

- primitive glyph navigation/action icons;
- `Functional PWA workstream` and W-stage labels;
- `Parity target`, `Android remains protected`, `Canonical discovery`, `API-backed` and similar implementation language;
- raw provider public IDs;
- raw category keys;
- raw coordinates and WKT;
- implementation-level BFF/API explanations as primary content.

### Operations

- `Synthetic Phase 7`, `Stage 7A`, `Stage 7B`;
- fixture/test state presentations as if they were normal case content;
- API route strings in primary UI;
- planned items mixed into operational navigation without deliberate unavailable/roadmap treatment;
- session-policy implementation detail dominating permanent navigation.

### Historical preview

Preview labels may remain on the explicit preserved preview route. They must not leak into the functional product.

## 10. Shared design-system gaps

### Typography

- lock one cross-product type family/fallback policy and platform-equivalent scale;
- stronger title/body/supporting/limitation hierarchy;
- readable ~16sp-equivalent body text;
- 200% scaling/reflow validation.

### Iconography

- replace initials/glyphs with Material Symbols/approved vectors;
- establish semantic icons for search, map/list, save, enquiry, account, trust checks, expiry, warning, privacy, upload, field work and audit;
- status always icon + text + colour.

### Imagery

- category icon/illustration system;
- provider hero/gallery/thumbnail system;
- premises/work imagery rules;
- low-bandwidth responsive sources/placeholders;
- strict separation from private verification evidence;
- Zambia-relevant art direction without stereotyping.

### Colour

- reconcile Android/web/admin to one semantic token map;
- validate light/dark contrast;
- remove ad hoc admin status colours;
- keep commercial/payment semantics visually separate from trust.

### Spacing/shape/elevation

- canonical spacing/grid tokens;
- 48dp-class targets;
- restrained radius/elevation hierarchy;
- fewer unnecessary cards/borders;
- more meaningful whitespace/grouping.

### Components

Reconcile platform-native equivalents for:

- provider/category cards;
- search/suggestions/filters;
- map/list controls;
- check-specific trust cards/details;
- provider profile header/gallery;
- enquiry/contact-consent/review/complaint patterns;
- provider readiness/services/areas/evidence/timeline/availability;
- loading/empty/error/offline/retry states;
- navigation;
- operations queue/case/evidence/decision/audit components.

### Responsive/adaptive layout

- Android compact/medium/expanded behavior;
- web content-level responsive composition beyond navigation shell;
- customer/provider desktop side-navigation detail layouts;
- operations desktop queue/detail/evidence split;
- compact operations as task-focused triage/field flows, not squeezed tables.

### Motion

- short functional transitions only;
- progress/upload/state feedback;
- reduced-motion equivalent;
- no decorative trust animation.

### Accessibility

- vector icons with labels/semantics;
- 48dp targets;
- keyboard/focus order;
- TalkBack/screen-reader state labels;
- non-colour status cues;
- map/list equivalence;
- long-form error summary/focus management;
- 200% font scaling/reflow;
- reduced-motion tests.

### Copy/information architecture

Keep the invariant, but translate implementation/security explanations into concise user meaning:

- what happened;
- what it means;
- what it does not mean;
- what the user can do next;
- what remains private.

## 11. Priority conclusions

1. **Android has the largest flagship visual gap**: substantial functionality exists inside a controlled-pilot/prototype presentation.
2. **The functional PWA has the strongest responsive shell**, but workstream labels, raw technical inputs, primitive glyphs and minimal imagery keep it below production visual quality.
3. **The public provider profile has the strongest current trust structure** and should inform the approved Design DNA rather than be discarded.
4. **Operations has broad functional coverage but remains visually a test harness**; queue/detail/evidence review is the highest-value high-fidelity admin redesign.
5. **Map/location is partly externally gated**, but truthful map/list shells, privacy wording and accessible list behavior can be designed before provider activation.
6. **Payments, real messaging and real participant states remain externally gated**; VC may design inactive/pending/fallback states but may not imply activation.
7. **No mass redesign should start from generated code.** The representative design set and owner approval come first.

## 12. VC0 review checkpoint

VC0 repository-side audit/design-control is ready when all of the following are true:

- this matrix is reviewed against current source and authority documents;
- stable predecessor regression evidence is green;
- `VISUAL_COMPLETION_PLAN.md` defines controlled VC1–VC7 sequencing;
- `DESIGN_DNA_BRIEF.md` defines non-negotiable rules, three differentiated directions and exact representative generation prompts;
- Stitch/Antigravity MCP and Higgsfield-secondary boundaries are documented;
- the current design tooling limitation is stated honestly;
- broad implementation remains blocked pending actual high-fidelity renders and explicit owner approval;
- the W7/W8 historical-verifier lock coupling is resolved before any future VC implementation-lane claim that would make the current W8 `RELEASED` assertion stale.
