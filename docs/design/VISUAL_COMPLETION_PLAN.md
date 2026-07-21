# DIREKT Visual Completion Plan

**Programme:** VC — DIREKT Visual Completion  
**Governing issue:** #259  
**Current stage:** VC0 design-control/audit only  
**Stable predecessor:** `main` at `a06a66d313d8417d8b7731e3d845c1c71bda3dd4`  
**Primary surfaces:** native Android, functional customer/provider web/PWA, internal operations portal

## 1. Objective

Complete DIREKT's high-fidelity UI/UX layer without rebuilding the product or weakening existing functionality.

The following remain authoritative:

- NestJS REST/OpenAPI API;
- PostgreSQL/PostGIS and private storage;
- authentication/session/authorization;
- server-resolved provider scope;
- verification/publication/trust rules;
- privacy/location rules;
- enquiry/contact-handoff/review/complaint lifecycles;
- commercial ledger/subscription boundaries;
- Android architecture;
- functional browser/BFF architecture;
- operations permissions/audit boundaries;
- Phase 11 and Phase 12 gates.

The visual programme interprets DIREKT. It does not redefine DIREKT.

## 2. Non-negotiable design rules

Every VC stage preserves:

1. proof before persuasion;
2. no blanket `Verified` badge;
3. check-specific trust state, scope, dates, meaning and limitations;
4. icon + text + colour for status, never colour alone;
5. map plus accessible list equivalent;
6. privacy by precision;
7. provider work/premises imagery separate from private evidence;
8. customer/provider mobile bottom navigation;
9. customer/provider desktop persistent side navigation;
10. desktop-first operations evidence review with responsive task/triage flows;
11. 48dp-class interaction targets;
12. readable typography and font scaling;
13. short functional motion only;
14. low-bandwidth/offline-safe fallbacks;
15. commercial/payment state visually separate from trust authority;
16. gated integrations represented honestly as unavailable/pending/fallback.

## 3. Repository control model

### VC0

The promoted `WORKSTREAM_LOCK.md` explicitly permits VC0 read-only/design-control work on a non-overlapping branch without monopolizing the implementation lane. Therefore VC0 does **not** claim the material implementation lane.

VC0 may add audit/design-control documents and issue metadata only. It must not mass-edit Android, web, operations or backend product code.

### VC1+ material implementation

Before any broad visual code changes:

1. owner approves a high-fidelity representative design direction;
2. the current stable source is re-fetched;
3. predecessor gates are verified;
4. the implementation lane is formally claimed with exact scope/protected surfaces;
5. the historical W7/W8 verifier-to-lock coupling identified by VC0 is corrected so a legitimate new lock owner does not invalidate historical W8 completion;
6. implementation proceeds in bounded vertical slices;
7. every slice receives exact-head regression and visual evidence review.

### Stop conditions

Stop rather than merge if a change would:

- weaken authorization/IAM/BFF/session controls;
- accept provider scope from client state;
- expose private evidence, raw contact data or exact private locations;
- replace authoritative backend state with fixtures while claiming functionality;
- make Maps, FCM, Sentry, Crashlytics, Resend, WhatsApp, payment providers or registries appear active when they are not;
- let payment/commercial state improve trust/publication/ranking;
- introduce real participants, real evidence, real money movement or production release;
- require unrelated framework rewrites;
- regress Android/backend/database/OpenAPI/web/admin gates;
- contradict approved trust/privacy/accessibility rules.

---

# VC0 — Repository-wide visual baseline and gap audit

**Status:** repository audit/design package prepared; actual high-fidelity Stitch renders and owner aesthetic approval still required before material implementation.

## Outputs

- `docs/design/UI_VISUAL_GAP_MATRIX.md`;
- `docs/design/VISUAL_COMPLETION_PLAN.md`;
- `docs/design/DESIGN_DNA_BRIEF.md`;
- Issue #259;
- exact-source/regression baseline evidence;
- three differentiated design directions and generation prompts;
- Stitch/Antigravity and Higgsfield workflow boundaries.

## Exit checkpoint

VC0 may be treated as repository-side complete when:

- authority reconstruction and matrix are complete;
- stable predecessor regression evidence is green;
- three genuinely differentiated directions are documented;
- design tooling workflow/privacy controls are documented;
- no broad UI code has started;
- actual representative high-fidelity renders are presented to the owner;
- the owner explicitly approves or requests revisions.

Because the current automation environment does not expose a connected Stitch/Higgsfield design connector, the repository-side VC0 package can reach **render-ready review status**, but must not falsely claim that external high-fidelity renders already exist.

---

# VC1 — Design-system reconciliation

**Purpose:** turn the approved direction into one canonical cross-product visual system.

## Foundations

- semantic colour roles/light-dark behavior;
- typography/fallbacks/type scale;
- spacing/grid;
- radii/elevation;
- iconography;
- imagery;
- motion;
- adaptive breakpoints/window classes;
- accessibility;
- low-bandwidth behavior.

## Component families

- navigation/app bars;
- search/suggestions/filters;
- category/provider cards;
- provider profile header/gallery;
- check-specific trust cards/details;
- map/list controls;
- saved/enquiry/contact-consent/review/complaint flows;
- provider readiness/services/areas/evidence/timeline/availability;
- subscription/receipt states;
- loading/empty/error/offline/retry patterns;
- operations queue/case/evidence/decision/audit components.

Platform-native behavior remains allowed: Compose, customer/provider web and operations should share Design DNA, not identical binaries/layouts.

---

# VC2 — High-fidelity flagship design review

Before broad implementation, create at least three genuinely different visual directions against the same product rules.

## Required experiences

### Customer

1. Discover/Home;
2. Search/results/map-list;
3. Provider public profile + trust details.

### Provider

4. Provider workspace/overview;
5. Verification/evidence status.

### Operations

6. Verification queue + case/evidence review.

## Required variants

- compact/mobile customer/provider;
- desktop customer/provider web;
- adaptive/tablet where composition materially changes;
- desktop operations evidence-review workspace;
- compact operations triage/field sample.

## Owner decision

Record exactly one:

- `APPROVE DIRECTION A`;
- `APPROVE DIRECTION B`;
- `APPROVE DIRECTION C`;
- `APPROVE HYBRID` with exact borrowed elements;
- `REVISE` with concrete changes.

Silence is never approval.

---

# VC3 — Lock approved Design DNA

After owner approval:

- record stable Stitch project/screen references;
- retrieve approved Design DNA through Stitch MCP where available;
- reconcile generated tokens against repository authority;
- lock typography, semantic colours, icons, imagery, component anatomy, adaptive rules, motion, accessibility and low-bandwidth rules;
- record rejected patterns;
- never adopt generated API/business logic as canonical.

Repository trust/privacy/security requirements always win over generated design metadata.

---

# VC4 — Customer experience vertical slices

Implement Android + functional web together where capabilities correspond.

## VC4A — Discovery and provider decision

- Discover/Home;
- area/category/search/suggestions;
- filters;
- result list;
- truthful map/list shell/fallback;
- provider cards/profile;
- trust details;
- service detail;
- no-results/permission/offline states.

Google Maps runtime activation remains a separate integration gate.

## VC4B — Saved/enquiries/contact consent

- Saved;
- create enquiry;
- enquiry detail/timeline;
- contact-sharing consent/revoke/expiry;
- draft/retry/conflict states.

## VC4C — Reviews/complaints/account

- review eligibility/submission/report/appeal presentation;
- complaint creation/detail;
- account/security/privacy/support.

### Customer slice gate

- public-safe provider projection only;
- no client-selected provider scope;
- no private evidence/exact private coordinates;
- Android + web + applicable backend/OpenAPI gates pass;
- responsive/accessibility/offline checks pass;
- approved visual-reference comparison recorded.

---

# VC5 — Provider experience vertical slices

## VC5A — Overview/profile/services/areas

- overview/readiness;
- onboarding pathway;
- representative/business details;
- services/categories;
- operating model;
- service areas/public premises consent;
- availability;
- publication status.

Replace raw category keys, coordinate pairs and WKT with safe user-facing controls while preserving canonical contracts.

## VC5B — Verification/evidence

- requirements;
- capture/file upload;
- progress/resume/retry;
- timeline;
- correction/action required;
- review/declaration.

Private evidence remains private. Public work/premises imagery is separate.

## VC5C — Enquiries/reviews/commercial/account

- enquiry inbox/detail/response;
- contact handoff;
- reviews/provider response/appeal;
- portfolio if approved;
- subscriptions/invoices/receipts;
- member/team UI only when authorized;
- account/security.

Real payment movement remains separately gated.

---

# VC6 — Operations portal

Use the same brand/trust system with operations-appropriate density.

## VC6A — Verification core

- mission control;
- triage queue;
- queue/detail split;
- verification case;
- secure evidence viewer;
- decision/reason/checklist;
- provider operations summary;
- discovery/publication eligibility.

## VC6B — Field/trust operations

- field assignments/visit record;
- escalations/overrides;
- incidents;
- interaction history;
- review moderation/appeals;
- complaints.

## VC6C — Commercial/reporting/configuration

- subscription exceptions;
- payment reconciliation shell within gates;
- expiry/reporting;
- taxonomy/evidence rules where authorized;
- audit explorer;
- role management only when separately authorized;
- system health/queues.

### Adaptive rule

- desktop/laptop: queue + detail + evidence workspace;
- tablet: one/two panes according to task;
- compact/mobile: task-focused triage/field actions, never a squeezed desktop table.

---

# VC7 — World-class quality gate

A screen is not complete merely because it looks attractive.

## Visual

- matches approved Design DNA/reference with documented platform adaptations;
- approved typography/icons/imagery;
- coherent spacing/hierarchy;
- responsive/adaptive layouts;
- light/dark behavior where required;
- no production-facing workstream/development labels;
- no primitive glyph icons where approved vectors exist.

## Accessibility

- contrast;
- TalkBack/screen-reader labels;
- keyboard/focus order;
- 48dp-class targets;
- 200% font scaling/reflow;
- reduced motion;
- status not colour-only;
- accessible map/list equivalence;
- form error focus/summary behavior.

## Product/trust

- no blanket `Verified` badge;
- check scope/date/limitations preserved;
- commercial state separate from trust;
- no private evidence/location/contact leakage;
- no gated-integration overclaim;
- no real participant/payment/production activation.

## Regression

Run all applicable exact-head gates:

- Android unit/lint/assembly and relevant UI tests;
- backend authorization/tests/build/migrations when touched;
- OpenAPI generation/drift when touched;
- database migration verification when touched;
- functional PWA typecheck/contracts/build/offline/security/responsive tests;
- operations tests/build/permission/accessibility checks;
- documentation quality;
- supply-chain/security where build/dependencies change.

## Visual evidence

Use only synthetic/public-safe data. Record:

- approved design reference;
- tested viewport/window class;
- representative screenshots/visual references;
- accessibility state;
- loading/empty/error/offline state;
- deliberate platform adaptations.

Never use real evidence, participant identity, raw contact data or private coordinates as visual fixtures.

---

# AI-assisted design workflow

## Google Stitch — primary high-fidelity source

Use Stitch for:

- 2–3 high-fidelity directions;
- mobile/desktop/adaptive flagship screens;
- typography/layout/component exploration;
- approved Design DNA;
- owner visual review.

Do not generate or adopt a parallel full-stack DIREKT application.

Recommended project naming:

- `DIREKT-VC-A-Structured-Trust`;
- `DIREKT-VC-B-Neighbourhood-Marketplace`;
- `DIREKT-VC-C-Field-Utility`;
- after approval: `DIREKT-VC-APPROVED`.

## Antigravity + Stitch MCP bridge

1. connect Stitch MCP in Antigravity using secure credentials;
2. verify project listing;
3. fetch only the approved DIREKT project;
4. extract Design DNA/tokens;
5. reconcile them against repository rules;
6. implement into existing Compose/Next.js/admin code;
7. compare implementation against approved design in emulator/browser;
8. record deliberate differences;
9. never commit API keys.

## Higgsfield — secondary asset layer

Use only for controlled imagery/illustration/art-direction work such as:

- category concepts;
- generic provider work-scene concepts;
- onboarding/empty-state illustration concepts;
- moodboards;
- promotional/store assets.

Do not send private evidence, participant identity documents, raw contacts, exact private coordinates, restricted operations screenshots or secrets.

Every generated asset requires human review for Zambia relevance, stereotyping, provenance/licensing, accessibility/alt text and low-bandwidth delivery.

---

# Representative owner review checkpoint

| Experience | Compact/mobile | Desktop/adaptive | Must prove |
|---|---|---|---|
| Customer Discover/Home | Required | Required for web | Brand, categories, search, local marketplace character, low-bandwidth hierarchy. |
| Search/results/map | Required | Required | Map/list equivalence, filters, provider cards, privacy-safe location. |
| Provider profile + trust | Required | Required | Proof before persuasion, imagery/evidence separation, no blanket verification. |
| Provider workspace | Required | Required for web | Readiness/tasks/services/enquiries without raw technical inputs. |
| Verification/evidence | Required | Required for web | Private upload/timeline/correction states and calm trust language. |
| Operations queue/case | Compact triage/field sample | Required desktop | Queue/detail/evidence density, privacy, accessibility and audit. |

Broad visual implementation remains blocked until this representative set is actually rendered and the owner explicitly approves a direction.