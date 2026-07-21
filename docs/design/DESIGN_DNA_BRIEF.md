# DIREKT VC0 — Design DNA Brief and Flagship Review Directions

**Programme:** VC — DIREKT Visual Completion  
**Governing issue:** #259  
**Purpose:** prepare genuinely differentiated high-fidelity directions for owner review before broad implementation  
**Status:** review brief prepared; no visual direction is approved yet

## 1. What this brief controls

This brief translates the authoritative DIREKT product/design rules into a high-fidelity design-generation and review contract.

It is intentionally **not** a new product specification and **not** permission to replace existing application architecture. The implementation targets remain:

- native Android: Jetpack Compose / Material 3;
- functional customer/provider web/PWA: existing Next.js/React application and BFF boundary;
- operations portal: existing isolated Next.js/React operations application;
- canonical NestJS REST/OpenAPI/domain/database/storage/auth/trust logic unchanged unless separately authorized.

AI design output is advisory until explicitly approved and reconciled with repository rules.

## 2. Immutable DIREKT character

DIREKT must feel:

- modern and world-class;
- trustworthy without looking governmental;
- local and approachable without looking informal;
- visually rich enough to feel like a real services marketplace rather than a text prototype;
- efficient rather than luxurious;
- transparent rather than sales-heavy;
- calm and clear around trust, verification, disputes and failure states;
- Material 3 aligned on Android;
- responsive and polished on mobile, tablet and desktop;
- visually structured through typography, imagery and whitespace rather than excessive borders;
- accessible and low-bandwidth aware.

Avoid:

- generic fintech/glassmorphism aesthetics;
- government-portal visual language;
- generic SaaS dashboards for customer/provider journeys;
- luxury/premium visual cues that imply exclusivity;
- oversized marketing hero sections that delay service discovery;
- decorative trust shields, seals or animated verification celebrations;
- blanket `Verified` badges;
- primitive text glyphs as navigation/iconography;
- developer/workstream/API labels in user-facing production UI.

## 3. Trust DNA — non-negotiable

Every direction must preserve the same trust semantics.

### 3.1 Public trust is check-specific

A public provider can show individual check states such as identity, premises/operating model, qualifications or experience where the canonical backend permits them.

A trust component must be able to show:

- check/claim name;
- current state in plain language;
- icon + text + colour;
- what was checked;
- scope/category where relevant;
- reviewed/check date;
- valid-until/expiry where relevant;
- evidence/source class where public-safe;
- limitation/what the result does not prove.

Never reduce this to a single global `Verified` label.

### 3.2 Proof before persuasion

On provider profiles and search results:

1. service fit and locality/coverage;
2. scoped trust/check information;
3. availability;
4. tracked enquiry/contact action;
5. promotional/provider storytelling.

Provider imagery may support confidence, but it must not visually overpower the actual proof/limitations.

### 3.3 Commercial state never looks like trust authority

Subscription/payment/account health must use a separate visual family from verification/trust checks.

A paid plan cannot visually resemble an upgraded trust badge.

## 4. Privacy DNA

### Public-safe

May include, when canonical state allows:

- provider display name;
- category/service scope;
- public locality/service area;
- explicitly consented public premises location;
- public work/premises imagery;
- public-safe trust claims/check cards;
- public reviews;
- availability.

### Private/restricted

Must never be exposed through design prototypes, runtime screenshots or creative tools:

- private evidence documents;
- identity-document contents;
- storage object keys/URLs;
- exact private base coordinates;
- raw contact data without current consent scope;
- private reviewer notes/rationale;
- staff-only identifiers or secrets.

Use synthetic placeholders for all restricted flows.

## 5. Accessibility and low-bandwidth DNA

Every direction must demonstrate:

- body copy readable at roughly 16sp-equivalent;
- 48dp-class primary interaction targets;
- focus/TalkBack/screen-reader semantics;
- status not colour-only;
- map with accessible list equivalent;
- 200% text scaling/reflow strategy;
- reduced-motion behavior;
- meaningful offline/retry/error states;
- imagery that can degrade to compact thumbnails/placeholders without breaking task completion;
- no critical action hidden behind image-only affordances.

## 6. Shared visual foundation — starting constraints, not final approval

The current repository already converges around:

- primary green: approximately `#087A55`;
- deeper green/ink support: approximately `#00513A` / `#16211C`;
- mint/positive neutral surface: approximately `#D9F5E9`;
- warm amber for attention: approximately `#F2A900`;
- informational blue role;
- neutral light/dark surfaces.

The approved direction may refine tonal values for contrast and hierarchy, but should not arbitrarily replace the established semantic identity.

### Typography

Use a modern sans-serif system with excellent mobile readability and broad device support.

The final implementation must define:

- display/hero only where task-appropriate;
- page title;
- section title;
- card title;
- body;
- supporting/limitation text;
- labels/status metadata;
- numeric/metric treatment for operations.

Do not rely on ultralight weights or dense all-caps body copy.

### Iconography

Primary target:

- Material Symbols/Material Icons or approved vector equivalent;
- consistent filled/outlined state convention;
- explicit labels for ambiguous actions;
- icon + text for trust/status.

## 7. Required flagship review set

Each candidate direction must render the same six experiences so the owner compares aesthetics rather than different product scope.

### Customer

1. **Discover/Home**
   - service search;
   - location/area control;
   - category discovery;
   - selected/nearby or relevant provider preview;
   - calm trust education;
   - mobile bottom nav and desktop persistent side nav.

2. **Search results + map/list**
   - query/category/area context;
   - filters;
   - privacy-safe map representation;
   - accessible provider list equivalent;
   - provider cards with imagery, locality/service area, availability and scoped trust snippets;
   - no exact private provider coordinates.

3. **Provider public profile + trust details**
   - provider/work imagery separated from evidence;
   - services/coverage/availability;
   - check-specific trust summary;
   - check-detail state with dates/scope/limitations;
   - public reviews;
   - save/share/tracked-enquiry actions;
   - no blanket verification.

### Provider

4. **Provider workspace / overview**
   - profile/readiness summary;
   - next tasks;
   - services/availability;
   - enquiry attention;
   - publication status;
   - no raw category keys, coordinates or WKT in the primary experience.

5. **Verification / evidence status**
   - per-requirement cards/timeline;
   - action-required/correction/expiry states;
   - private evidence upload entry;
   - resumable/retry state;
   - calm privacy explanation;
   - never reveal private reviewer identity/rationale.

### Operations

6. **Verification queue + case/evidence review**
   - desktop queue/detail/evidence composition;
   - priority/SLA/ownership/filtering;
   - case/check context;
   - secure synthetic evidence viewer state;
   - checklist/decision/reason controls;
   - short-lived/revocable-access treatment;
   - audit/history;
   - compact/mobile triage/field variant.

## 8. Direction A — Structured Trust

**Working name:** `Structured Trust`  
**Intent:** calm, precise, confident service marketplace with strong information architecture and understated visual authority.

### Visual character

- crisp white/neutral surfaces with green used intentionally rather than everywhere;
- deep ink typography;
- moderate radii, restrained elevation;
- clearly separated information layers with generous whitespace;
- provider photography cropped cleanly and used as supporting context;
- compact semantic iconography;
- trust cards read almost like understandable records, but never governmental forms.

### Composition

#### Discover/Home

Mobile:

- compact branded top bar;
- prominent search field with service + area affordance;
- two-row/category horizontal tiles with simple vector icons and optional lightweight illustration;
- `Providers for your area` cards with one work image, service/locality, availability, two trust snippets;
- short `How DIREKT checks work` explainer card below task content;
- four-item bottom nav with approved icons.

Desktop:

- persistent side nav;
- wide search/area bar;
- category grid left/centre;
- curated/recent provider panel;
- no oversized marketing hero.

#### Results + map/list

- mobile segmented `List / Map` control with list as accessible default/fallback;
- desktop two-pane list + privacy-safe map;
- filter chips/sheet;
- selection synchronizes card/map without implying a private exact pin;
- trust snippets shown as compact icon + statement + date/limitation entry point.

#### Provider profile

- contained provider image strip/hero;
- identity/service/locality first;
- strong `What DIREKT can currently say` trust section;
- each check uses a clean record card with status icon, statement, checked/valid-until and limitation;
- action rail for save/share/enquiry;
- reviews and work gallery lower in hierarchy.

#### Provider workspace

- task-oriented summary header;
- readiness shown as checklist progress, not a score that implies trust;
- `Next actions`, `Services & availability`, `Enquiries`, `Publication status` modules;
- calm empty/error/retry panels.

#### Evidence status

- vertical requirement timeline/cards;
- action required is amber + icon + text;
- current/expired/replaced states explicit;
- upload action opens dedicated sheet/page;
- progress/retry state visible without simulation controls.

#### Operations

- dense three-column desktop: queue / case / evidence-review workspace;
- strong column headers and keyboard focus;
- neutral surfaces with semantic status accents;
- evidence viewer central, decision/checklist right;
- persistent but subtle environment indicator outside case content.

### Typography

- neutral modern grotesk/system sans;
- strong title/body contrast without large marketing-scale headings;
- tabular/numeric styling in operations metrics.

### Motion

- 120–220ms functional state transitions;
- gentle panel transitions;
- no celebratory verification animation.

### Strengths

- strongest fit for trust transparency and evidence review;
- easiest to keep low-bandwidth;
- highly adaptable between Compose and web;
- likely best accessibility baseline.

### Risks to watch

- can become too clinical or government-adjacent if imagery and human language are too restrained;
- must retain marketplace warmth through provider imagery, category iconography and friendly copy.

## 9. Direction B — Neighbourhood Marketplace

**Working name:** `Neighbourhood Marketplace`  
**Intent:** warmer, more human and visually rich while keeping proof and privacy explicit.

### Visual character

- brighter natural imagery and illustrated category moments;
- warmer neutral surfaces around the established DIREKT green;
- softer radii and layered cards;
- more visual storytelling about provider work and neighbourhood context;
- trust information anchored as a calm proof layer rather than decorative badge system.

### Composition

#### Discover/Home

Mobile:

- compact branded header with friendly location context;
- search field over a restrained warm surface block;
- illustrated/photo-backed category tiles optimized for small assets;
- `Trusted information, clearly explained` micro-section;
- provider cards led by real work/premises image, then service/locality, availability and check snippets.

Desktop:

- side navigation;
- editorial-but-efficient category mosaic;
- provider cards with stronger imagery;
- local service discovery feels more like a genuine marketplace than a dashboard.

#### Results + map/list

- image-rich provider cards but list remains fast-scannable;
- desktop map/list split with image thumbnail and selected-card emphasis;
- mobile map optional, list first;
- filters use human labels and quick chips.

#### Provider profile

- stronger work/premises gallery and provider introduction;
- trust summary immediately beneath identity/service hero so imagery cannot imply verification by itself;
- scoped check cards use human-friendly sentences, icons, dates and limitations;
- service descriptions/reviews/story sections feel more relational.

#### Provider workspace

- welcoming workspace header with business identity/image;
- visual task cards and readiness path;
- `What needs attention`, `Your services`, `New enquiries`, `How customers see you` sections;
- publication/trust state remains distinct from paid/commercial state.

#### Evidence status

- requirement cards use illustrated/document-type icons;
- upload guidance more visual and reassuring;
- correction states explain exactly what to do next;
- no visual representation of the submitted private document in public/provider dashboard summaries beyond safe metadata.

#### Operations

- retains professional density; imagery is almost absent here except safe thumbnails inside authorized evidence context;
- slightly softer surfaces than Direction A;
- queue/detail remains highly structured so consumer warmth does not turn operations into a consumer marketplace UI.

### Typography

- slightly warmer humanist sans characteristics while preserving legibility;
- stronger friendly section headings;
- no playful handwritten/display fonts.

### Motion

- subtle image/card transitions and sheet movement;
- reduced-motion equivalent;
- never animate trust status as celebration.

### Strengths

- strongest marketplace vitality and local approachability;
- best use of approved provider/work imagery;
- can differentiate DIREKT from directories/government portals.

### Risks to watch

- imagery can become heavy on data/bandwidth;
- photography can accidentally over-persuade relative to evidence;
- softer cards can become generic marketplace styling unless trust components remain distinctive.

## 10. Direction C — Field Utility

**Working name:** `Field Utility`  
**Intent:** high-efficiency, service-first interface optimized for quick scanning, action and constrained connectivity.

### Visual character

- bolder information hierarchy;
- flatter surfaces with fewer decorative cards;
- stronger use of dividers, grouped rows and compact semantic panels;
- controlled green + informational blue + amber roles;
- smaller imagery footprint, used where it materially aids provider recognition or service fit;
- navigation/actions feel fast and operational without becoming a developer dashboard.

### Composition

#### Discover/Home

Mobile:

- search and area are immediately actionable at top;
- compact category grid;
- recent/relevant providers in efficient rows with thumbnail, service/locality, availability and trust summary;
- minimal promotional content;
- strong offline/manual-area fallback.

Desktop:

- persistent side nav;
- search/filter toolbar;
- dense discovery list with optional visual category panel;
- optimized for quick comparison.

#### Results + map/list

- strongest map/list workflow of all directions;
- desktop split pane with resizable/clear hierarchy;
- mobile list-first with map sheet;
- provider cards/rows emphasize distance/service-area meaning, availability and check summaries;
- map markers never imply exact private bases.

#### Provider profile

- compact identity/work header;
- service/coverage and action summary;
- trust/check ledger highly scannable;
- imagery below or alongside decision-critical information rather than dominating.

#### Provider workspace

- operational task dashboard;
- attention queue at top;
- readiness requirements grouped by action;
- service/availability quick controls;
- enquiry counters/list;
- efficient on low-end devices.

#### Evidence status

- compact timeline/requirement list with clear state icons;
- action panels open as sheets/pages;
- upload progress and retry states are prominent and functional;
- minimal illustration.

#### Operations

- strongest fit for high-density operations;
- keyboard-first queue/detail/evidence layout;
- clear pinned action bar;
- compact metadata;
- responsive mobile field task cards.

### Typography

- sturdy modern sans with strong numeric/data readability;
- compact but not cramped line-height;
- larger body sizes preserved even when layout is dense.

### Motion

- minimal: state change, sheet, focus and progress only.

### Strengths

- strongest low-bandwidth and speed profile;
- excellent provider/operations productivity;
- clean map/list and field workflow fit.

### Risks to watch

- may feel too utilitarian or enterprise-like for customers;
- requires carefully selected imagery, warmth and empty-state copy so it does not resemble a developer/admin tool.

## 11. Direction comparison scorecard

Owner review should score each direction 1–5 against the same criteria:

| Criterion | A Structured Trust | B Neighbourhood Marketplace | C Field Utility |
|---|---:|---:|---:|
| Trust clarity without governmental feel | — | — | — |
| Feels like a real local-services marketplace | — | — | — |
| Local/approachable but professional | — | — | — |
| Proof before persuasion | — | — | — |
| Android Material 3 fit | — | — | — |
| Mobile speed/clarity | — | — | — |
| Desktop customer/provider usability | — | — | — |
| Operations evidence-review density | — | — | — |
| Accessibility | — | — | — |
| Low-bandwidth resilience | — | — | — |
| Distinctive DIREKT identity | — | — | — |

A hybrid approval is valid only when the exact borrowed elements are recorded, for example:

> Structured Trust information architecture + Neighbourhood Marketplace imagery/category treatment + Field Utility operations density.

## 12. Stitch generation contract

### 12.1 Base prompt — apply to all directions

Use this as the invariant project context before adding a direction modifier:

> Design a high-fidelity product system for DIREKT, a Zambia-focused local-services marketplace connecting customers with providers using transparent, check-specific trust information. The product includes a native Android customer/provider app, a responsive customer/provider web/PWA, and a separate internal operations portal. It must feel modern, world-class, trustworthy without looking governmental, local and approachable without looking informal, efficient rather than luxurious, transparent rather than sales-heavy, and calm around verification, disputes and failure states. Follow Material 3 principles for Android while keeping web responsive and polished. Use strong typography, meaningful whitespace, approved vector/Material-style iconography, provider work/premises imagery and category imagery, but keep all private verification evidence separate. Never use a generic blanket “Verified” badge. Trust is always check-specific with scope, dates, meaning and limitations; use icon + text + colour, never colour alone. Maps must have accessible list equivalents. Exact private provider locations and private evidence must never appear. Mobile uses bottom navigation; customer/provider desktop web uses persistent side navigation. Operations is desktop-first for evidence review with responsive task/triage layouts. Use 48dp-class targets, readable body text, accessible contrast, font scaling and reduced motion. Optimize for low bandwidth. Do not invent production activation of payments, messaging, maps or participant data. Use synthetic/public-safe sample data only.

### 12.2 Direction modifiers

#### A — Structured Trust

> Use a calm, precise, evidence-led visual language: restrained elevation, moderate radii, crisp neutral surfaces, deep ink typography, established DIREKT green used intentionally, compact semantic icons, clear record-like trust cards softened by provider/work imagery and friendly language. Avoid government styling. Prioritize understandable proof, whitespace and hierarchy.

#### B — Neighbourhood Marketplace

> Use a warmer, more human marketplace visual language: richer but low-bandwidth-conscious provider/work imagery, illustrated or icon-led category tiles, warmer neutral surfaces around DIREKT green, softer radii and friendly hierarchy. Keep the trust layer immediately visible and more authoritative than promotional imagery. Avoid playful/informal styling or generic ecommerce patterns.

#### C — Field Utility

> Use a fast, service-first visual language: flatter surfaces, compact grouped rows, strong search/filter/map-list workflows, sturdy typography, limited imagery, clear semantic panels and high scanning efficiency. Keep the customer experience warm enough to feel like a marketplace, not an enterprise admin tool. Make operations especially keyboard- and density-friendly.

### 12.3 Required generation set

Generate for each direction:

1. Customer Discover/Home — mobile;
2. Customer Discover/Home — desktop web;
3. Search/results/map-list — mobile;
4. Search/results/map-list — desktop;
5. Provider public profile + trust details — mobile;
6. Provider public profile + trust details — desktop;
7. Provider workspace/overview — mobile;
8. Provider workspace/overview — desktop web;
9. Provider verification/evidence status — mobile;
10. Provider verification/evidence status — desktop web;
11. Operations queue/case/evidence review — desktop;
12. Operations triage/field task — compact/mobile;
13. component/token board;
14. loading/empty/error/offline/access-denied examples;
15. light theme set and representative dark-theme samples where platform spec requires dark mode.

## 13. Stitch → Antigravity implementation handoff

After owner approval:

1. mark the chosen Stitch project/screens as `APPROVED` and freeze references;
2. retrieve the approved project through Stitch MCP;
3. extract Design DNA: typography, colours, spacing, radii, elevation, icons, component anatomy and adaptive layout rules;
4. record stable project/screen references in the repository;
5. reconcile extracted values against `design.md`, platform specifications and trust/privacy/accessibility rules;
6. reject generated logic/data/API assumptions;
7. implement into existing Compose/Next.js/admin surfaces by controlled vertical slice;
8. compare implementation against approved designs in emulator/browser;
9. record deliberate platform-native differences;
10. run exact-head regressions before promotion.

Do not commit Stitch credentials/API keys.

## 14. Higgsfield secondary asset brief

Use Higgsfield only after the visual direction is approved, primarily to explore or produce controlled creative references/assets such as:

- category illustration concepts;
- generic provider work-scene concepts;
- onboarding/empty-state illustration concepts;
- brand moodboards;
- promotional/store assets.

### Art-direction requirements

- Zambia/local context should feel contemporary and ordinary, not exoticized;
- represent a range of legitimate service trades and customers without stereotyping;
- PPE/tools/work environments should be plausible for the depicted service;
- do not generate imagery that looks like verification evidence or government certification;
- never imply an AI-generated person/business is a real DIREKT provider;
- use synthetic/reference-only labels during review;
- optimize approved runtime imagery into small responsive formats with alt text and placeholders.

### Forbidden inputs

Never send to external creative generation:

- private evidence;
- identity documents;
- real participant personal data;
- raw contact details;
- exact private coordinates;
- private reviewer notes;
- secrets/credentials;
- sensitive operations screenshots containing restricted data.

## 15. Owner approval checkpoint

Broad implementation remains blocked until the owner reviews actual high-fidelity representative renders and records one of:

- `APPROVE DIRECTION A — STRUCTURED TRUST`;
- `APPROVE DIRECTION B — NEIGHBOURHOOD MARKETPLACE`;
- `APPROVE DIRECTION C — FIELD UTILITY`;
- `APPROVE HYBRID — ...` with exact elements;
- `REVISE — ...` with concrete changes.

Silence or general approval of the VC programme does not count as visual-direction approval.

## 16. Current tooling checkpoint

The repository-side Stitch/Higgsfield workflow is now specified, but the current automation environment does not expose a connected Stitch or Higgsfield design connector. Therefore VC0 must **not pretend that generated high-fidelity renders already exist**.

The auditable review checkpoint is:

- product/design authority reconstructed;
- screen/gap matrix complete;
- VC1–VC7 plan complete;
- three differentiated Design DNA directions complete;
- exact generation set/prompts complete;
- external-design privacy boundaries complete;
- Stitch/Antigravity handoff procedure complete;
- broad code propagation blocked;
- actual Stitch renders + owner choice still required before VC1/VC2 implementation propagation.
