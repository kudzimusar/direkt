# DIREKT VC0 — Repository-wide UI Visual Gap Matrix

**Programme:** VC — DIREKT Visual Completion  
**Workstream:** VC0 — repository-wide visual baseline and gap audit  
**Governing issue:** #259  
**Audit baseline:** `a7a1e03f4de3b2cad3d51b7f611bdbb2f30af961`  
**Predecessor stable checkpoint:** W8 closed; canonical functional browser verified at `https://app.direkt.forum`  
**Production status:** Phase 11 real evidence and Phase 12 production authorization remain gated

## 1. Purpose

This document records the visual-completion gap between the implemented DIREKT product and the repository's authoritative product/design requirements. It covers the whole product, not one isolated PWA workstream:

1. native Android customer/provider application;
2. functional customer/provider web/PWA;
3. internal operations/admin portal;
4. historical prototype/preview surfaces as design evidence only.

The audit is intentionally strict. Functional correctness, test coverage or remote reachability does not by itself make a surface visually production-ready.

## 2. Authority hierarchy used

The audit was reconstructed in this order:

1. `AGENTS.md`;
2. `MASTER_BUILD_PLAN.md`;
3. `PROJECT_STATUS.md`;
4. `WORKSTREAM_LOCK.md`;
5. `DEFINITION_OF_DONE.md`;
6. `design.md`;
7. current repository/integration reconciliation evidence;
8. `docs/product/PRODUCT_REQUIREMENTS.md`;
9. `docs/product/FEATURE_CATALOG.md`;
10. `docs/product/USER_JOURNEYS.md`;
11. `docs/design/SCREEN_INVENTORY.md`;
12. `docs/design/DESIGN_SYSTEM.md`;
13. `docs/design/ANDROID_UI_SPECIFICATION.md`;
14. `docs/design/PWA_UI_SPECIFICATION.md`;
15. `docs/design/RESPONSIVE_ADMIN_DESIGN.md`;
16. relevant Android, web/PWA, operations, API, testing and phase/workstream documents;
17. actual current source;
18. external AI-generated design suggestions last.

Where historical documentation conflicts with newer source/evidence, current source plus reviewed managed evidence wins. AI-generated design never overrides trust, privacy, authorization, accessibility, release or domain rules.

## 3. Exact source and regression checkpoint

### 3.1 Source truth

At VC0 entry the actual single implementation lane was `build/android-v1`, not merely the latest `main` merge. The lane head was:

`a7a1e03f4de3b2cad3d51b7f611bdbb2f30af961` — `fix: complete closed-state W8 verifier`

The lane already contained the W8 closure/status synchronization that had not yet been reflected by the latest visible `main` checkpoint. `WORKSTREAM_LOCK.md` at that source recorded W0–W8 as closed and the lane as released.

W8 managed/canonical evidence remains:

- managed functional runtime source: `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`;
- managed run: `29721199177`;
- managed evidence digest: `sha256:00a0d41e8b8824d7764ab9762f05816bac3639d9360ed8926071c346f066e0b0`;
- canonical-domain verification head: `a831b58f8f6684bd345b668c1dfb4d8aab70c5c5`;
- canonical-domain run: `29802524466`;
- canonical evidence digest: `sha256:1fc4c334f79f8f6b0f30fcaf55d2d19ea2941cdebc8c5eabf886a913704ea786`;
- canonical functional browser: `https://app.direkt.forum`;
- preserved historical/synthetic preview: `https://direkt.forum/preview/`.

### 3.2 Regression truth discovered by VC0

On `a7a1e03...`:

- W8 canonical-domain verification: PASS;
- functional customer/provider PWA CI: PASS;
- W4 customer contract: PASS;
- integration runtime audit: PASS;
- documentation quality: PASS;
- W7 cross-client workflow: Android PASS; backend/database/OpenAPI PASS; documentation/browser privilege PASS; W2–W7 functional-web job FAIL.

The W7 failure was reproduced and traced to a regression-harness coupling defect: the historical W7 job invoked the global `npm run verify`, which later acquired W8 checks. VC0 therefore treats the baseline as **not globally green until the corrected exact-head W7 gate passes**. The repair is limited to restoring independent historical gate ownership: W7 verifies W2–W7 plus build; W8 remains verified by its dedicated W8 workflow. No product/runtime/UI behavior is changed by that repair.

Broad visual implementation is blocked until the corrected baseline is green.

## 4. Classification legend

| Classification | Meaning |
|---|---|
| **Functional + visually ready** | Functionality and visual execution already satisfy the documented production-quality direction; only routine regression maintenance remains. |
| **Functional + needs polish** | Structure and behavior are sound, but hierarchy, typography, icons, imagery, spacing, responsive detail or final states need production-quality refinement. |
| **Functional + prototype-level UI** | Core behavior exists, but the presentation still exposes development/demo concepts, raw technical inputs, test fixtures, simulation controls, text-heavy scaffolding or placeholder interactions. |
| **Missing visual implementation** | The product requirement exists but there is no adequate user-facing visual flow yet, even if backend/domain support exists. |
| **Externally gated** | Completion depends materially on a separately gated external integration, real participant/pilot state, production credential, legal/operations approval or other non-VC activation. A safe visual shell may still be designed without activating the gate. |

**VC0 finding:** no audited flagship customer/provider/operations journey is currently classified as fully **functional + visually ready** end-to-end.

## 5. Current surface truth

### 5.1 Native Android

Current Android is genuine Jetpack Compose/Material 3 application code with domain-specific discovery, provider workspace, interactions, commercial and pilot-auth concepts. It is not merely a screenshot prototype.

However, the root shell is still visibly development-oriented:

- one broad `Scaffold`/`LazyColumn` presentation rather than a finished route-led experience;
- top-bar development label `Phase 11 — controlled pilot entry`;
- bottom-navigation icons rendered as the first letter of each destination;
- `Preview context` mode selector;
- provider destinations mapped through customer destination enum values;
- repeated trust-boundary/development explanation cards;
- synthetic state controls such as `Start synthetic upload`, `Simulate interruption`, `Save synthetic draft offline`, `Simulate stale`, `Expire consent`;
- text descriptions in place of real marketplace imagery and map presentation.

The Android theme contains a useful green/ink/mint/amber Material 3 foundation and light/dark schemes, but typography, iconography, component hierarchy and adaptive layout are not yet a locked cross-product Design DNA.

### 5.2 Functional customer/provider web/PWA

`web/direkt-app/` is the current functional browser client. It uses the canonical API/BFF/session architecture and is remotely reachable in the reviewed synthetic mode.

It has stronger responsive scaffolding than Android today:

- mobile bottom navigation;
- tablet rail;
- desktop persistent side navigation;
- skip links/focus/reduced-motion/offline foundations;
- API-backed discovery;
- authenticated customer/provider state and mutations;
- public provider bundle;
- commercial parity within gated boundaries.

But significant development artifacts remain visible:

- `Functional PWA workstream`;
- W-stage labels such as `W2 closed`, `W3 closed`, `W6 active`/parity language in historical/current shell code;
- `Parity target`, `Android remains protected`, `Canonical discovery`, `API-backed`, `W2 public discovery`;
- technical BFF/API/provider-scope explanations presented as primary user content;
- primitive text glyphs such as `⌂`, `◇`, `↔`, `○`, `←`, `★`, `☆` instead of an approved icon system;
- card-heavy text presentation with little provider/category/work imagery;
- search results list without the intended finished map/list marketplace experience;
- raw provider configuration inputs such as category keys, coordinates and WKT polygons.

The public provider profile has the strongest current user-facing trust structure and should be preserved conceptually, but it still needs production visual hierarchy, imagery, iconography and copy refinement.

### 5.3 Operations/admin portal

The operations portal has real permission-aware architecture and route coverage for mission control, triage, evidence review, field workflow, escalations, incidents, interaction history, review moderation, complaints, finance, reporting, provider drafts/workspaces and discovery eligibility.

Its current presentation remains an operations prototype/test harness:

- `Synthetic Phase 7`, `Stage 7A`, `Stage 7B` labels;
- fixture records embedded in page modules;
- visible API-route implementation notes;
- loading/empty/error/access-denied state cards shown simultaneously as test evidence;
- evidence review is metadata/table oriented rather than the documented secure evidence-viewer workspace;
- 44px and 36px controls remain in some admin CSS despite the 48dp-class interaction target;
- hard-coded local status colours exist outside a reconciled shared semantic token layer;
- desktop table density exists, but the queue/detail/evidence split-view and responsive field/triage hierarchy are not yet high fidelity.

### 5.4 Historical prototype/preview

`web/direkt-pwa/` and `https://direkt.forum/preview/` remain historical/synthetic review evidence only. They contain explicit `Synthetic remote UI review`, `UI checkpoint`, `Android-aligned PWA` and preview-mode controls. They must not be treated as the canonical functional client or copied wholesale into final production UI.

No canonical repository-wide screenshot/reference-baseline set was found in source search. VC2/VC3 should add owner-approved visual references or stable design links/IDs without committing private evidence or participant data.

---

# 6. Shared/auth screen matrix

| ID | Screen | Current implementation | Classification | Primary VC gap |
|---|---|---|---|---|
| SH-001 | Splash / session restore | Android startup/session state and web bootstrap exist, but no polished branded restore/loading sequence is established. | Functional + needs polish | Calm startup, offline/session recovery, no decorative delay. |
| SH-002 | Registration / account creation | Pilot/auth foundations exist; no complete production registration visual flow. | Missing visual implementation | Define progressive account creation without implying pilot/production activation. |
| SH-003 | Phone sign-in | Android pilot-auth card and browser auth boundary exist. | Functional + prototype-level UI | Remove implementation language; polished phone input, consent, recovery and disabled-gate states. |
| SH-004 | Verification code | Android code field exists; browser equivalent depends on current auth mode. | Functional + prototype-level UI | OTP hierarchy, resend/error/timer/accessibility states. |
| SH-005 | Terms / privacy consent | Controlled-pilot notice/consent appears in auth flow. | Functional + prototype-level UI | Separate required vs optional consent; readable legal summary + full policy links. |
| SH-006 | Notification permission education | Notification runtime activation remains gated and Android manifest deliberately lacks notification runtime permission. | Externally gated | Design education/denied/settings states without activating FCM/production messaging. |
| SH-007 | Customer / provider mode selector | Android `Preview context`; web surface switcher/provider scope is backend constrained. | Functional + prototype-level UI | Replace preview semantics with legitimate account-role/context patterns; never client-grant provider scope. |
| SH-008 | Notification centre | Transactional/outbox foundations exist; no complete user-facing centre. | Externally gated | Design inbox/badges/read state around active channels only; do not imply FCM/email/WhatsApp activation. |
| SH-009 | Support / help | Complaints/safety concepts exist, but no cohesive help centre. | Missing visual implementation | Help, safety escalation, FAQs, contact/support boundaries. |
| SH-010 | Account / security | Android account/auth/commercial sections and web account/session controls exist. | Functional + needs polish | Cohesive profile/security/privacy/session layout; role-aware sections. |

# 7. Customer screen matrix

| ID | Screen | Current implementation | Classification | Primary VC gap |
|---|---|---|---|---|
| CU-001 | Discover home | Android and functional PWA render discovery controls/results; shell still exposes development labels and is text/card heavy. | Functional + prototype-level UI | Marketplace-quality home hierarchy, categories, nearby/service intent, imagery, calm trust cues. |
| CU-002 | Area selector | Manual area/locality controls exist. | Functional + prototype-level UI | Human-readable area picker, recent areas, permission fallback, privacy explanation. |
| CU-003 | Category browser | Chips/selects exist; no rich category browsing system. | Functional + prototype-level UI | Category icon/imagery tiles, hierarchy, low-bandwidth fallback. |
| CU-004 | Search suggestions | No finished predictive/suggested-search presentation found. | Missing visual implementation | Recent/suggested/category/provider suggestions with accessible keyboard/mobile behavior. |
| CU-005 | Result list | API-backed list exists on web; Android synthetic/current discovery cards exist. | Functional + needs polish | Strong provider card hierarchy, images, service fit, distance/area wording, trust snippets, availability. |
| CU-006 | Result map | Android shows a synthetic text-map concept; functional web does not provide the intended finished map/list experience. Google Maps runtime is not active. | Externally gated | Build safe visual map/list shell and accessible list parity; do not activate Maps until integration gate clears. |
| CU-007 | Filters | Android chips and web form controls exist. | Functional + needs polish | Bottom sheet/side panel patterns, active filter summary, clear/reset, 48dp targets. |
| CU-008 | Provider profile | Functional web public provider bundle is structurally strong; Android has provider result/trust cards rather than a fully finished profile hierarchy. | Functional + needs polish | Provider/work imagery, service grouping, actions, trust placement, reviews, adaptive desktop composition. |
| CU-009 | Trust details | Check-specific claims, scope/limitations/dates are present on web and conceptually on Android. | Functional + needs polish | Dedicated check-detail component family; icons + text + dates + limitations; no blanket badge. |
| CU-010 | Service detail | Service/category information exists mostly inside profile/result cards. | Functional + prototype-level UI | Dedicated service scope, what is/not included, pricing disclaimer, availability and enquiry CTA. |
| CU-011 | Create enquiry | Web has real structured form; Android has controlled/synthetic/offline draft experience. | Functional + needs polish | Progressive form, provider context, timing/locality, draft/retry clarity, no raw IDs. |
| CU-012 | Contact-sharing consent | Consent-scoped handoff exists. | Functional + needs polish | Clear temporary access, channel, expiry, revoke, privacy explanation. |
| CU-013 | Enquiry detail | Lifecycle cards/history exist. | Functional + needs polish | Timeline/state hierarchy, next action, provider context, accessible failures/conflicts. |
| CU-014 | Saved providers | Android/web lists exist. | Functional + needs polish | Provider imagery/cards, compare/revisit context, empty state. |
| CU-015 | Review eligibility | Eligibility/reason state exists after tracked interactions. | Functional + needs polish | Explain why eligible/not eligible without exposing internal codes. |
| CU-016 | Submit review | Functional browser form and lifecycle exist; Android review surface remains less complete visually. | Functional + needs polish | Rating controls/icons, guidance, moderation expectations, success/pending states. |
| CU-017 | Report provider / interaction | Review report and complaint actions exist in browser journeys. | Functional + prototype-level UI | Separate safety/report/complaint semantics; human reason labels; severity guidance. |
| CU-018 | Complaint detail | Complaint records/status exist, but no polished dedicated detail journey. | Functional + prototype-level UI | Case timeline, updates, evidence/privacy boundaries, escalation/help. |
| CU-019 | No-results recovery | Empty/no-result states exist conceptually and in components. | Functional + needs polish | Alternative area/category, clear filters, manual list fallback, helpful imagery. |
| CU-020 | Location permission / fallback | Manual fallback is implemented; Android release permissions remain deliberately absent; Maps/location integration is not active. | Externally gated | Permission education only when justified; precise privacy copy; manual area remains first-class. |

# 8. Provider screen matrix

| ID | Screen | Current implementation | Classification | Primary VC gap |
|---|---|---|---|---|
| PR-001 | Provider overview | Android dashboard/readiness and web provider overview exist. | Functional + prototype-level UI | Marketplace/provider workspace dashboard with task hierarchy, readiness, enquiries and status. |
| PR-002 | Onboarding checklist | Android text checklist and web readiness tasks exist. | Functional + prototype-level UI | Resumable stepper/checklist, saved progress, why each item matters, error/recovery. |
| PR-003 | Provider type / pathway | Operating-model/type concepts exist, but not as a polished guided pathway. | Functional + prototype-level UI | Guided fixed/mobile/hybrid choice with implications and privacy. |
| PR-004 | Representative details | Domain support exists; no clearly finished standalone visual flow found. | Missing visual implementation | Role/authority capture, identity boundaries, edit/review states. |
| PR-005 | Business / professional details | Data exists across profile/workspace, not a coherent production screen. | Missing visual implementation | Structured identity/profile sections with category-dependent requirements. |
| PR-006 | Category / services | Web uses category-key inputs and rows; Android uses basic selection. | Functional + prototype-level UI | Human category picker, service editor, scope, removal consequences. |
| PR-007 | Operating model | Select/form exists. | Functional + prototype-level UI | Visual explanation of fixed/mobile/hybrid and related location/privacy behavior. |
| PR-008 | Service areas | Web currently exposes raw WKT polygon input. | Functional + prototype-level UI | Map/draw/area-picker abstraction plus accessible text alternative; hide implementation geometry. |
| PR-009 | Public premises consent | Raw latitude/longitude + consent checkbox exists. | Functional + prototype-level UI | Address/place workflow, explicit public-point preview, separate private base, privacy confirmation. |
| PR-010 | Evidence requirements | Requirement/timeline concepts exist. | Functional + needs polish | Requirement cards, accepted evidence, status, scope, expiry, action. |
| PR-011 | Evidence capture / upload | Browser recoverable private upload is functional; Android includes synthetic upload/recovery controls. | Functional + prototype-level UI | Real capture/file-picker states, progress/retry, privacy, size/type guidance; remove simulation controls. |
| PR-012 | Review and declaration | No complete polished declaration/review-before-submit flow found. | Missing visual implementation | Summary, declarations, consent, edit links, submission consequences. |
| PR-013 | Verification timeline | Android/web timelines exist. | Functional + needs polish | Visual chronology, per-check status, correction/expiry, concise explanations. |
| PR-014 | Action required / correction | Correction/retry concepts exist but are scattered. | Functional + prototype-level UI | Dedicated task card/detail flow, exact missing item, resubmit/review expectations. |
| PR-015 | Availability | Web and Android state controls exist. | Functional + needs polish | Quick status, next available time, per-service scope, clear unknown/unavailable states. |
| PR-016 | Enquiry inbox | Provider enquiry states exist. | Functional + needs polish | Prioritized list, response SLA/context, filters, unread/attention treatment. |
| PR-017 | Enquiry response | Lifecycle actions exist. | Functional + needs polish | Accept/decline/request-info hierarchy, reason capture, revision conflict states. |
| PR-018 | Portfolio | No finished portfolio/media management surface found. | Missing visual implementation | Work/premises imagery management separated from verification evidence. |
| PR-019 | Reviews / provider response | Review/provider-response domain exists and browser provider journey covers review state. | Functional + needs polish | Review summary, response form, moderation/appeal states. |
| PR-020 | Subscription / receipts | Commercial parity exists with synthetic/gated payment boundaries. | Functional + needs polish | Product/plan, invoice/receipt/status clarity; real payment actions remain externally gated. |
| PR-021 | Provider members | No completed member-management visual flow found. | Missing visual implementation | Role-scoped members only when product scope/authorization permits. |
| PR-022 | Publication status | Readiness/publication eligibility is represented. | Functional + needs polish | Explicit why published/not published, blocking checks, no commercial conflation. |

# 9. Operations/admin screen matrix

| ID | Screen | Current implementation | Classification | Primary VC gap |
|---|---|---|---|---|
| OP-001 | Operations dashboard | `Mission control` route/metrics exist with synthetic/stage language. | Functional + prototype-level UI | Production information architecture, workload/attention hierarchy, environment indicator moved out of primary content. |
| OP-002 | Verification queue | Triage queue with metrics/table/keyboard structure exists. | Functional + prototype-level UI | Queue/detail split, saved filters, clear SLA/priority semantics, responsive triage. |
| OP-003 | Verification case | Context appears across evidence/provider workspace routes, but not as a cohesive case workspace. | Functional + prototype-level UI | Case header, checklist, evidence, history, decisions, related provider context. |
| OP-004 | Secure evidence viewer | Metadata/access controls exist; no complete high-fidelity private evidence viewer matching design spec. | Missing visual implementation | Revocable view, watermark, zoom, metadata, versions, checklist, timeout/access audit; synthetic-only until real evidence gate. |
| OP-005 | Decision + reason form | Decision/action domain exists across operations flows. | Functional + prototype-level UI | Clear check-specific decision form, reason codes, limitations, four-eyes states. |
| OP-006 | Field assignment | Field workflow route exists. | Functional + prototype-level UI | Assignment list/detail, travel/contact minimization, offline-ready field hierarchy. |
| OP-007 | Field visit record | Structured field workflow exists. | Functional + prototype-level UI | Mobile-first task form, evidence boundaries, unable/missed/safety states. |
| OP-008 | Provider operations profile | Provider drafts/workspaces routes exist. | Functional + prototype-level UI | Unified provider summary, services, checks, cases, actions, audit. |
| OP-009 | Complaint queue | Customer complaints route exists. | Functional + prototype-level UI | Queue/detail workflow, severity/status, interaction linkage, response history. |
| OP-010 | Incident case | Internal incidents route exists. | Functional + prototype-level UI | Incident severity/owner/actions/timeline without conflating customer complaints. |
| OP-011 | Appeal review | Review moderation/appeal flows exist. | Functional + prototype-level UI | Original/moderated/appeal comparison, reasoned decision and audit trail. |
| OP-012 | Subscription exception | Finance/commercial route exists; real payments remain gated. | Functional + prototype-level UI | Exception queue, account/invoice context, no trust-state impact. |
| OP-013 | Payment reconciliation | Synthetic reconciliation foundations exist; real provider money movement disabled. | Externally gated | High-fidelity ledger/reconciliation shell may be designed; no real payment activation. |
| OP-014 | Taxonomy configuration | No complete current production visual route. | Missing visual implementation | Versioned category/config editing with review controls. |
| OP-015 | Evidence-rule configuration | No complete current production visual route. | Missing visual implementation | Versioned requirement/rule editor with effective dates and audit. |
| OP-016 | Audit search / history | Navigation marks dedicated Audit as planned. | Missing visual implementation | Role-scoped immutable search/history, export boundaries. |
| OP-017 | Role management | Navigation marks role management planned. | Missing visual implementation | Must remain separately controlled; do not infer authorization from UI. |
| OP-018 | System health / queues | Some mission-control/reporting status exists; no cohesive system-health screen. | Functional + prototype-level UI | Operational health, queues, degraded integrations, kill-switch state, no secret leakage. |

## 9.1 Additional implemented operations routes beyond the original inventory wording

| Current route/surface | Classification | VC interpretation |
|---|---|---|
| Escalations and overrides | Functional + prototype-level UI | Preserve explicit ownership/four-eyes semantics; redesign as case-linked escalation workspace. |
| Interaction history | Functional + prototype-level UI | Preserve privacy-safe summaries; improve timeline/filter/detail hierarchy. |
| Review moderation | Functional + prototype-level UI | Integrate with OP-011 visual family. |
| Customer complaints | Functional + prototype-level UI | Integrate with OP-009 detail/triage family. |
| Commercial finance | Functional + prototype-level UI | Keep commercial state visually and semantically separate from trust verification. |
| Expiry and reporting | Functional + prototype-level UI | Improve renewal/expiry signals, charts only where accessible table equivalents exist. |
| Provider drafts | Functional + prototype-level UI | Clarify draft vs public provider state. |
| Provider workspaces | Functional + prototype-level UI | Candidate foundation for unified OP-008 provider operations profile. |
| Discovery eligibility | Functional + prototype-level UI | Strong candidate for explainable publication-status visualization; never expose private inputs. |

# 10. Prototype/development artifacts visible in user-facing UI

The following must not define final production aesthetics or copy:

### Android

- `Phase 11 — controlled pilot entry` in the top app bar;
- `Preview context` mode selector;
- navigation icons made from destination initials;
- `Phase 5 discovery boundary` and repeated implementation-boundary cards;
- `Synthetic privacy-safe map` presented as text rather than a map/list product experience;
- `Image description:` rendered as user-facing placeholder copy;
- `Start synthetic upload`, `Simulate interruption`, `Save synthetic draft offline`, `Simulate stale`, `Expire consent` and similar test controls;
- internal wording such as API/provider/publication scope explanations where user-centered copy should be primary.

### Functional web/PWA

- primitive glyph navigation/icons: `⌂`, `◇`, `↔`, `○`, `←`, `★`, `☆`, text checkmarks/arrows;
- `Functional PWA workstream`;
- W-stage/changelog labels inside the product shell;
- `Parity target`, `Android remains protected`, `Canonical discovery`, `API-backed`, `W2 public discovery`;
- primary content explaining BFF/API/provider-scope implementation details;
- raw provider public IDs in customer enquiry forms;
- raw category keys;
- raw latitude/longitude and WKT polygon inputs;
- technical share-safety/API-boundary notes as visible primary UI.

### Operations portal

- `Synthetic Phase 7`, `Stage 7A`, `Stage 7B`;
- fixture IDs/content embedded as visible primary data without a polished demo-data convention;
- API endpoint strings rendered in page content;
- simultaneous `loading`, `empty`, `overdue`, `access denied`, revoked/expired/conflict cards used as test evidence rather than actual state-driven rendering;
- `Planned` items mixed into operational navigation without a deliberate roadmap/permission treatment;
- session-policy implementation detail occupying permanent sidebar attention.

### Historical preview

- `Synthetic remote UI review`;
- `UI checkpoint`;
- `Android-aligned PWA`;
- preview user-mode controls and primitive theme glyph.

Historical preview labels may remain on the preserved preview route; they must not leak into the final functional product shell.

# 11. Shared design-system gap audit

## 11.1 Typography

Current state:

- Android relies mainly on default Material 3 typography;
- functional web uses Inter/system-family styling without a locked cross-platform type scale contract;
- operations portal uses its own CSS sizing/weight conventions;
- technical/development copy competes visually with user tasks.

Gap:

- canonical type family/fallback policy;
- platform-specific but equivalent scale mapping;
- clearer display/title/body/label hierarchy;
- body readability around 16sp-equivalent;
- status/limitation text hierarchy;
- 200% font scaling/reflow validation.

## 11.2 Iconography

Current state:

- Android bottom navigation uses destination initials;
- web uses primitive text glyphs and stars/checkmarks/arrows;
- admin has minimal consistent icon usage.

Gap:

- approved Material Symbols/Material Icons or controlled vector set;
- icon semantics for search, map/list, save, enquiry, account, evidence, checks, expiry, warning, info, privacy, upload, field, audit;
- icons must supplement—not replace—status text.

## 11.3 Imagery

Current state:

- provider/category/work imagery is largely absent;
- text descriptions substitute for images in Android;
- public provider profile lacks a mature gallery/premises/work visual hierarchy;
- verification evidence is correctly private but public imagery rules are not yet embodied in components.

Gap:

- category illustration/icon strategy;
- provider hero/gallery/thumbnail system;
- premises/work imagery rules;
- low-bandwidth thumbnail/source-set policy;
- placeholders and failed-image states;
- strict separation between public imagery and private verification evidence;
- culturally appropriate Zambia-oriented art direction without stereotyping.

## 11.4 Colour

Current state:

- useful green/ink/mint/amber foundation exists on Android/PWA;
- dark schemes exist in Android/PWA foundations;
- admin includes local hard-coded status colours;
- some status treatments rely heavily on chip colour.

Gap:

- one canonical semantic palette/token map;
- contrast validation across light/dark;
- status icon + text + colour rule enforcement;
- operations density states mapped to shared semantics;
- no commercial/payment colour conflation with trust.

## 11.5 Spacing, shape and elevation

Current state:

- 4dp/8/12/16/24/32 guidance exists;
- implementation is card-heavy and inconsistent across clients;
- operations controls include 44px and 36px targets.

Gap:

- canonical spacing tokens and layout grids;
- 48dp-class interaction targets;
- restrained radius/elevation hierarchy;
- fewer unnecessary cards/borders;
- clearer section grouping and meaningful whitespace.

## 11.6 Components

Needs one reconciled visual family across platform-native implementations:

- provider summary/card;
- category tile;
- search and suggestions;
- map/list switch and filter controls;
- check-specific trust card/details;
- status/limitation/expiry chip patterns;
- provider profile header/gallery;
- enquiry card/detail/timeline;
- evidence requirement/upload/timeline;
- consent and privacy callouts;
- empty/loading/error/offline/retry states;
- bottom nav / rail / side nav;
- operations queue, case header, evidence viewer, decision panel and audit timeline.

## 11.7 Responsive/adaptive layout

Current state:

- web shell already has mobile/tablet/desktop navigation patterns;
- Android root experience is predominantly a single compact scrolling column;
- admin is table-oriented desktop-first but lacks the finished queue/detail split and mobile field-task adaptation.

Gap:

- Android compact/medium/expanded window-size rules;
- web content-level responsive composition beyond shell navigation;
- customer/provider desktop persistent side navigation with appropriate detail panes;
- operations desktop queue/detail/evidence split;
- tablet collapse rules;
- mobile operations task/triage flows rather than desktop shrink-down.

## 11.8 Motion

Current state: little decorative motion, which is safer than over-animation.

Gap:

- short functional transitions for navigation/state changes;
- upload/progress feedback;
- map/list transitions;
- reduced-motion equivalence;
- never animate trust/verification in a way that implies certainty or approval.

## 11.9 Accessibility

Strengths already present:

- skip links/focus styles on web;
- semantics/test tags in Compose;
- reduced-motion foundation;
- accessible list remains central to discovery.

Gaps to close:

- replace glyph/initial icons with labeled vectors;
- enforce 48dp-class targets;
- 200% font scaling/reflow;
- keyboard/focus order in dense operations split views;
- TalkBack/screen-reader labels for check status, maps, uploads, ratings and timelines;
- non-colour status cues everywhere;
- accessible map/list equivalence;
- error summary/focus management in long forms;
- reduced-motion test coverage.

## 11.10 Copy and information architecture

The code correctly contains many trust/privacy boundaries, but too many are expressed as developer/security explanations rather than user-centered product copy.

Required rule:

- keep the underlying invariant;
- move implementation detail to docs/logs/admin diagnostics where appropriate;
- present concise user meaning, limitation, next action and privacy consequence in the UI.

# 12. Priority visual-gap conclusions

1. **Android is the largest flagship visual gap.** It is functionally meaningful but still presents as a single-screen controlled pilot/prototype harness.
2. **The functional PWA has the strongest responsive foundation** but still visibly exposes workstream labels, primitive glyphs, raw technical provider inputs and minimal imagery.
3. **The public provider profile has the best current trust-information structure** and should become a Design DNA reference, not be discarded.
4. **Operations has broad route/function coverage but is visually a test harness.** The secure evidence viewer and queue/detail workspace are the most important missing high-fidelity admin patterns.
5. **Map/location experience is partly externally gated**, but visual map/list shells, fallbacks and accessible list behavior can be designed before Google Maps activation.
6. **Payments, notifications and real participant states remain externally gated.** VC may design honest disabled/pending/fallback states but must not make them appear active.
7. **No mass redesign should start from generated code.** First lock an owner-approved Design DNA using representative screens.

# 13. VC0 exit criteria tied to this matrix

VC0 may close only when:

- this matrix is reviewed against actual source and authoritative docs;
- the baseline regression discrepancy is corrected and exact-head gates are green or a reviewed blocker is explicitly recorded;
- `VISUAL_COMPLETION_PLAN.md` defines controlled VC1–VC7 sequencing;
- `DESIGN_DNA_BRIEF.md` defines non-negotiable trust/privacy/accessibility rules and genuinely differentiated design directions;
- Stitch/Antigravity MCP and Higgsfield-secondary asset workflows are documented without making either tool authoritative over the repository;
- the representative flagship design set is ready for owner review;
- broad UI implementation remains blocked pending explicit owner approval of one direction.
