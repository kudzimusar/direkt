# DIREKT Visual Completion Plan

**Programme:** VC — DIREKT Visual Completion  
**Governing issue:** #259  
**Current stage:** VC0 only  
**Primary product surfaces:** native Android, functional customer/provider web/PWA, internal operations portal  
**Historical preview:** evidence/reference only; never the canonical runtime

## 1. Objective

Complete the high-fidelity UI/UX layer of DIREKT without rebuilding the product or changing its authoritative domain model.

The following remain authoritative and must not be replaced by generated UI logic:

- NestJS REST/OpenAPI API;
- PostgreSQL/PostGIS;
- Supabase private storage/runtime boundaries;
- authentication/session/authorization;
- server-resolved provider scope;
- verification/publication/trust rules;
- location privacy;
- enquiry/contact-handoff/review/complaint lifecycles;
- commercial ledger/subscription rules;
- Android architecture;
- functional web/PWA BFF architecture;
- operations permissions and audit boundaries;
- Phase 11 and Phase 12 controls.

The visual programme interprets DIREKT. It does not redefine DIREKT.

## 2. Non-negotiable visual/product principles

Every VC stage must preserve:

1. proof before persuasion;
2. no blanket `Verified` badge;
3. check-specific trust state, scope, reviewed date, expiry where relevant, source/evidence class, meaning and limitations;
4. status communicated by icon + text + colour, never colour alone;
5. map plus accessible list equivalent;
6. privacy by precision;
7. public premises imagery/work imagery separated from private verification evidence;
8. mobile bottom navigation for customer/provider compact layouts;
9. persistent side navigation for customer/provider desktop web;
10. desktop-first operations evidence review with responsive field/triage flows rather than simple desktop shrink-down;
11. 48dp-class interaction targets;
12. readable body typography and font scaling;
13. short functional motion only;
14. low-bandwidth and offline-safe fallbacks;
15. commercial/payment state visually separate from verification/trust authority;
16. gated integrations shown honestly as unavailable/pending/fallback, never fabricated as active.

## 3. Workstream controls

### Single lane

All overlapping writes remain on the repository's sequential implementation lane unless a later reviewed repository decision changes that rule.

Before each VC stage/slice:

1. re-read `AGENTS.md`, `MASTER_BUILD_PLAN.md`, `PROJECT_STATUS.md`, `WORKSTREAM_LOCK.md`, `DEFINITION_OF_DONE.md` and the relevant design/product documents;
2. fetch the exact current source;
3. verify required predecessor gates;
4. update/confirm the workstream lock and issue scope;
5. inspect actual implementation before editing;
6. keep changes bounded to the slice;
7. run exact-head regression;
8. inspect UI evidence and diff;
9. update design/status/handoff docs;
10. merge only when the exact reviewed head is green.

### Stop conditions

Stop rather than merge when a visual change would:

- weaken authorization or IAM/BFF/session controls;
- accept provider scope from client state;
- expose private evidence, raw contacts or exact private provider locations;
- replace canonical API state with fixtures while claiming functional completion;
- make Google Maps, FCM, Sentry, Crashlytics, Resend, WhatsApp, payment providers or registries appear active when they are not;
- make commercial/payment state improve trust/publication/ranking;
- introduce real participants, real evidence, real money movement or production release;
- require unrelated framework/dependency rewrites;
- regress Android/backend/database/OpenAPI/web/admin gates;
- conflict with an owner-approved Design DNA without an explicit design change decision.

## 4. VC0 — repository-wide visual baseline and gap audit

**Status:** active in the current workstream.

### Outputs

- `docs/design/UI_VISUAL_GAP_MATRIX.md`;
- `docs/design/VISUAL_COMPLETION_PLAN.md`;
- `docs/design/DESIGN_DNA_BRIEF.md`;
- Issue #259 and a bounded lock claim;
- exact-source/regression baseline evidence;
- representative design-direction package prepared for owner review.

### VC0 gate

No broad UI code change is allowed during VC0.

A narrow regression-harness repair is allowed only when needed to make the existing historical gates independently valid and it changes no product/runtime/UI behavior.

### VC0 exit

VC0 exits only after:

- the gap matrix is complete;
- the exact-head baseline is green or a reviewed blocker is explicitly retained;
- three genuinely differentiated visual directions are defined against the same non-negotiable trust/privacy rules;
- the Stitch/Higgsfield workflow is ready;
- the owner has a concrete representative review package;
- no direction has been silently selected.

---

# 5. VC1 — Design-system reconciliation

**Purpose:** reconcile repository design requirements and implementation foundations into one cross-product visual system before propagation.

### Scope

#### Foundations

- semantic colour roles;
- light/dark behavior;
- typography/fallbacks/type scale;
- spacing/grid;
- shape/radii;
- elevation;
- iconography;
- imagery;
- motion;
- breakpoints/window size classes;
- accessibility;
- low-bandwidth rendering.

#### Component families

- app bars/navigation/bottom nav/rail/side nav;
- search/suggestions/filters;
- category cards;
- provider cards;
- provider profile header/gallery;
- check-specific trust cards/details;
- location/map/list controls;
- saved providers;
- enquiry cards/forms/timeline/contact consent;
- review/complaint patterns;
- provider readiness/tasks/services/areas;
- evidence requirements/upload/timeline/correction;
- availability;
- commercial/subscription/receipt state;
- operations queue/case/evidence/decision/audit components;
- loading/empty/error/offline/permission/retry states.

### Deliverable

A reconciled token/component specification that can be represented consistently in:

- Jetpack Compose/Material 3;
- React/Next.js CSS/components;
- operations portal CSS/components.

Do not force identical rendering across platforms. Preserve platform-native behavior while keeping shared brand/trust semantics.

### Exit gate

VC1 does not authorize broad code propagation. It supplies the constraints used by VC2 high-fidelity design review.

---

# 6. VC2 — High-fidelity flagship design review

**Purpose:** obtain explicit owner approval before the visual system is propagated.

### Required representative screens

#### Customer

1. Discover/Home;
2. Search/results/map-list;
3. Provider public profile + trust details.

#### Provider

4. Provider overview/workspace;
5. Verification/evidence status.

#### Operations

6. Verification queue + case/evidence review.

### Required variants

- compact/mobile for customer/provider;
- desktop for customer/provider web;
- adaptive/tablet where layout changes materially;
- desktop evidence-review composition for operations;
- compact field/triage variant for operations where relevant.

### Directions

Generate at least three genuinely differentiated directions from `DESIGN_DNA_BRIEF.md`.

All directions must obey the same product rules; differentiation must come from visual rhythm, imagery treatment, information density, navigation framing and component composition—not from changing trust semantics.

### Review package

For each direction include:

- flagship screen set;
- light theme at minimum;
- dark theme sample where required by platform spec;
- typography and token sample;
- provider/category imagery treatment;
- icon style;
- trust-card treatment;
- map/list treatment;
- error/empty/offline sample;
- operations density example;
- accessibility notes;
- low-bandwidth behavior.

### Owner decision

Record one of:

- `APPROVE DIRECTION A/B/C`;
- `APPROVE HYBRID` with exact elements;
- `REVISE` with concrete requested changes.

No implementation agent may infer approval from silence.

---

# 7. VC3 — Lock approved Design DNA

**Purpose:** turn the owner-approved visual direction into an implementation contract.

### Outputs

Create/update a canonical approved design record containing:

- Stitch project/screen IDs or stable references;
- extracted Design DNA/tokens;
- repository-authoritative corrections to generated suggestions;
- type scale;
- semantic colours;
- icon set;
- imagery rules;
- component anatomy;
- adaptive rules;
- motion rules;
- accessibility rules;
- low-bandwidth rules;
- explicitly rejected patterns;
- approval date/decision reference.

### Precedence

When Stitch metadata conflicts with repository rules:

1. trust/privacy/security/authorization/accessibility requirements win;
2. product/user journey requirements win;
3. platform specification wins;
4. owner-approved Design DNA visual intent applies within those constraints.

Generated source code never becomes canonical merely because Stitch or another tool produced it.

---

# 8. VC4 — Customer experience vertical slices

Implement Android + functional web together where capabilities correspond.

## VC4A — Discovery and provider decision

- Discover/Home;
- area selection;
- categories;
- search/suggestions;
- filters;
- result list;
- map/list shell and fallback;
- provider card;
- provider public profile;
- trust details;
- service detail;
- no-results/permission/offline states.

**External gate rule:** real Google Maps activation remains separate. A map shell/fallback may be implemented without claiming an active provider integration.

## VC4B — Saved, enquiries and contact consent

- Saved;
- create enquiry;
- enquiry detail/timeline;
- contact-sharing consent/revoke/expiry;
- low-bandwidth draft/retry/conflict states.

## VC4C — Reviews, complaints and account

- review eligibility;
- review submission/report/appeal presentation;
- complaint creation/detail;
- account/security/privacy/support.

### Slice gate

For every VC4 slice:

- no client-selected provider scope;
- public profile remains public-safe projection only;
- no private evidence/exact private coordinates;
- Android regression and web functional contract pass;
- API/OpenAPI untouched unless separately justified and backward compatible;
- responsive/accessibility/offline checks pass;
- approved visual-reference comparison recorded.

---

# 9. VC5 — Provider experience vertical slices

## VC5A — Provider overview/profile/services/areas

- overview/readiness;
- onboarding checklist;
- provider pathway;
- representative/business details;
- services/categories;
- operating model;
- location/service area;
- public premises consent;
- publication status;
- availability.

Replace raw implementation inputs such as category keys, coordinate pairs and WKT with safe user-facing controls while preserving the same backend contracts or reviewed adapters.

## VC5B — Verification/evidence

- evidence requirements;
- capture/file upload;
- resumable/retry/error states;
- verification timeline;
- correction/action required;
- review/declaration.

Private evidence remains private. Public work/premises imagery is a separate media system.

## VC5C — Enquiries/reviews/commercial/account

- provider enquiry inbox/detail/response;
- contact-handoff status;
- reviews/provider response/appeal;
- portfolio imagery if in approved scope;
- subscription/invoices/receipts;
- team/member surfaces only if authorized;
- account/security.

Real payment movement remains disabled until its own integration/release gate clears.

---

# 10. VC6 — Operations portal

Use the same brand/trust system but optimize for evidence review, queue throughput, keyboard operation and auditability.

## VC6A — Verification core

- mission control;
- triage queue;
- queue/detail split view;
- verification case;
- secure evidence viewer;
- decision/reason/checklist;
- provider operations summary;
- discovery/publication eligibility.

## VC6B — Field, escalation and trust operations

- field assignments;
- field visit record;
- escalations/overrides;
- incidents;
- interaction history;
- review moderation/appeals;
- complaints.

## VC6C — Commercial/reporting/configuration

- subscription exceptions;
- reconciliation shell within gated payment boundaries;
- expiry/reporting;
- taxonomy/evidence-rule configuration where authorized;
- audit explorer;
- role-management UI only when separately authorized;
- system health/queues.

### Operations adaptive rule

- desktop/laptop: queue + detail + evidence/workspace density;
- tablet: collapsed navigation, one/two panes depending task;
- compact/mobile: task-focused triage/field actions, not a squeezed desktop table.

---

# 11. VC7 — World-class quality gate

No screen is complete because it merely resembles a mockup.

## 11.1 Visual gate

- matches approved Design DNA/reference within documented platform adaptations;
- approved typography/icons/imagery;
- coherent spacing/hierarchy;
- responsive/adaptive behavior;
- light/dark behavior where required;
- no development/workstream labels in production-facing UI;
- no primitive glyph icons where approved vectors exist.

## 11.2 Accessibility gate

- WCAG contrast;
- TalkBack/screen reader labels;
- keyboard/focus order;
- 48dp-class targets;
- 200% font scaling/reflow;
- reduced motion;
- status not colour-only;
- accessible map/list equivalence;
- form error focus/summary behavior.

## 11.3 Product/trust gate

- no generic `Verified` badge;
- check scope/date/limitation retained;
- commercial state separate from trust;
- no private evidence/location/contact leakage;
- no gated integration overclaim;
- no real participant/payment/production activation.

## 11.4 Regression gate

At each exact reviewed head run all applicable checks:

- Android unit/lint/assembly and relevant instrumentation/screenshot tests;
- backend tests/build/authorization/migrations when touched;
- OpenAPI generation/drift checks when touched;
- database migration verification when touched;
- functional PWA typecheck/contracts/build/offline/security/responsive tests;
- operations portal tests/build/permission/accessibility checks;
- documentation quality;
- supply-chain/security gates where dependency/build files change.

## 11.5 Visual evidence gate

Use only synthetic/public-safe data for visual evidence.

For each slice retain:

- approved design reference ID/link;
- tested viewport/window class;
- representative screenshots or automated visual references where safe;
- accessibility state sample;
- loading/empty/error/offline state sample;
- diff/review note explaining deliberate platform adaptations.

Never commit real evidence, participant identity, raw contact data or private coordinates as visual fixtures.

---

# 12. AI-assisted design tooling architecture

## 12.1 Google Stitch — primary high-fidelity source

Use Stitch for:

- 2–3 high-fidelity visual directions;
- mobile/desktop/adaptive flagship screens;
- typography/layout/component exploration;
- approved visual source metadata/Design DNA;
- owner visual review.

Recommended project naming:

- `DIREKT-VC-A-Structured-Trust`;
- `DIREKT-VC-B-Neighbourhood-Marketplace`;
- `DIREKT-VC-C-Field-Utility`;
- after approval: `DIREKT-VC-APPROVED`.

Do not generate or adopt a parallel full-stack application.

## 12.2 Antigravity + Stitch MCP bridge

The implementation agent should consume approved Stitch context through MCP rather than manually guessing colours/padding.

Owner/setup workflow based on the official Google Codelab:

1. use an appropriate Google Cloud project with billing enabled as required by Stitch setup;
2. sign in to Google Stitch;
3. create/store a Stitch API key securely;
4. in Antigravity Agent Manager open MCP Servers;
5. install/configure the Stitch MCP with the key;
6. verify with `List my Stitch projects.`;
7. fetch only the approved DIREKT project;
8. extract Design DNA/tokens into a repository review artifact;
9. reconcile extracted metadata against `design.md` and the approved VC design record;
10. implement into existing Compose/Next.js/admin code, not a generated replacement stack;
11. compare implemented UI to the approved design in the integrated browser/emulator and fix discrepancies without altering product contracts.

Do not commit Stitch API keys or credentials.

## 12.3 Higgsfield — secondary creative asset layer

Use Higgsfield only for controlled creative work such as:

- provider/workplace imagery concepts;
- category illustrations;
- onboarding/empty-state illustration exploration;
- brand moodboards;
- approved marketing/store assets;
- controlled visual references.

Do not use it to rebuild DIREKT as a separate app or author canonical business logic.

Do not upload:

- private verification evidence;
- real participant identity documents;
- raw contact data;
- exact private provider locations;
- unreleased sensitive operational screenshots.

Any generated asset must pass human review for Zambia relevance, stereotyping, misleading representation, licensing/provenance, accessibility/alt-text suitability and low-bandwidth delivery.

## 12.4 Asset intake contract

Before generated/stock assets enter runtime source, record:

- source/tool;
- generation/reference prompt where appropriate;
- human approval;
- license/provenance status;
- public/private classification;
- alt text;
- crop/aspect variants;
- compression/source-set strategy;
- fallback/placeholder behavior.

---

# 13. Representative review checkpoint before broad code

The owner review checkpoint is six flagship experiences, each shown in the relevant variants:

| Experience | Compact/mobile | Desktop/adaptive | What it must prove |
|---|---|---|---|
| Customer Discover/Home | Required | Required for web | Brand, categories, search, local marketplace character, low-bandwidth hierarchy. |
| Search/results/map | Required | Required | Map/list equivalence, filters, provider cards, privacy-safe location. |
| Provider public profile + trust | Required | Required | Proof-before-persuasion, imagery vs evidence separation, no blanket verification. |
| Provider workspace/overview | Required | Required for web | Readiness/tasks/services/enquiries without technical raw inputs. |
| Provider verification/evidence | Required | Required for web | Private upload/timeline/correction states, calm trust language. |
| Operations queue/case review | Compact triage/field sample | Required desktop | Queue/detail/evidence density, keyboard/accessibility, privacy/audit controls. |

No final aesthetic is selected until owner approval is explicit.

# 14. Programme completion condition

VC is complete only when:

- every matrix row is either visually complete, explicitly deferred with reason, or remains honestly externally gated;
- Android, functional PWA and operations portal use the approved Design DNA appropriately;
- no user-facing development/prototype artifacts remain outside explicit preview/test routes;
- trust/privacy/accessibility/low-bandwidth rules are preserved;
- exact-head regression and visual quality gates pass;
- Phase 11/12 status remains truthful and unchanged unless separately cleared by its own evidence process.
