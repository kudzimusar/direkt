# DIREKT App Design Plan

This is the primary product-design specification for DIREKT Version 1. It controls native Android, customer/provider web/PWA, trust presentation and the relationship with the internal operations portal.

For the world-class modernization programme, read this together with:

- `docs/product/WORLD_CLASS_PRODUCT_AND_AI_PLAN.md`;
- `docs/design/VISUAL_COMPLETION_PLAN.md`;
- `docs/design/DESIGN_SYSTEM.md`;
- `docs/architecture/AI_PRODUCT_ARCHITECTURE.md`.

## 1. Design objective

Help a customer answer, quickly and honestly:

1. What service do I need?
2. Who can provide it in or near this area?
3. What exactly has DIREKT checked?
4. Is that information current and relevant to this service?
5. What is the next safe action and how is accountability preserved?

Help a provider answer:

1. How do I establish a credible presence?
2. What do I need to complete next?
3. What evidence is required and why?
4. What is the status of each check?
5. How do I receive work, manage enquiries and build reputation?

Help an authorized operator answer:

1. What requires attention now?
2. Which canonical facts and evidence support the case?
3. Which policy/checklist applies?
4. What can I decide, request or escalate?
5. What auditable history remains after the action?

DIREKT should feel like a complete local-services marketplace and trust system, not a directory, test harness or generic dashboard.

## 2. Global benchmark direction

Use a composite benchmark rather than copying one competitor:

- Urban Company for marketplace polish, provider professionalism and operational quality;
- Checkatrade for visible recurring trust checks;
- Taskrabbit for short task-to-provider/action flow;
- Thumbtack for AI-guided natural-language/multimodal service discovery;
- DIREKT's own differentiation in check-specific proof, privacy-by-precision, Zambia resilience and human-accountable trust operations.

The target is to match world-class visual/product clarity while exceeding generic trust-badge models through precise proof.

## 3. Design principles

### Proof before persuasion

Trust details, check scope, currentness, dates and limitations take precedence over promotional language.

### Specific, not generic

Use `Phone confirmed`, `Qualification reviewed for plumbing` or `Premises visited`, never a context-free `Verified`.

### Marketplace first

The opening customer experience should immediately communicate:

- what services are available;
- where the customer is searching;
- relevant providers;
- why those providers may be suitable;
- what action to take next.

Do not lead with developer/workstream/API labels or large marketing content that delays discovery.

### Map plus list

Maps provide geographic context; lists provide accessibility, comparison and resilience when maps or location permission are unavailable.

### Privacy by precision

Show only the precision needed for the task. A mobile provider may show a service area/locality while a storefront may consent to an exact public premises pin.

### Low-bandwidth first

Core text, navigation, trust and action state load independently of large imagery. Images use multiple sizes, compression, placeholders and retry.

### Actionable states

Every rejection, expiry, permission denial, no-result, AI failure and offline state explains the next safe action.

### Familiar platform behaviour

Android follows Material 3/system patterns. Web/PWA uses responsive accessible web patterns. Operations uses desktop-grade evidence-review patterns rather than copying a consumer mobile layout.

### AI-assisted, not AI-authorized

AI may reduce friction by understanding, suggesting, summarizing, drafting or extracting. It must not become the source of verification truth, authorization, payment authority or final consequential decisions.

A customer/provider/operator must be able to distinguish:

1. canonical facts;
2. AI suggestion/summary;
3. user-confirmed input;
4. human-authorized outcome.

## 4. Brand and visual character

DIREKT should feel:

- modern and world-class;
- trustworthy without appearing governmental;
- local and approachable without becoming visually informal;
- visually rich enough to feel like a genuine services marketplace;
- efficient rather than luxurious;
- transparent rather than sales-heavy;
- calm during trust, dispute and failure states;
- accessible and low-bandwidth aware.

Avoid:

- generic fintech/glassmorphism styling;
- government-portal visual language;
- generic SaaS dashboards for customer/provider journeys;
- luxury cues implying exclusivity;
- oversized hero sections that delay service discovery;
- decorative verification seals/shields;
- celebratory trust animations;
- primitive glyph navigation/icons;
- developer/workstream/API text in production-facing UI.

## 5. Design DNA directions

High-fidelity review must compare the same product scope across genuinely different directions.

### A — Structured Trust

- calm neutral surfaces;
- strong information hierarchy;
- restrained DIREKT green;
- precise check-specific trust cards;
- moderate shape/elevation;
- excellent accessibility and low-bandwidth fit.

Risk: becoming too clinical unless imagery and human language add warmth.

### B — Neighbourhood Marketplace

- warmer local marketplace character;
- stronger provider/work/category imagery;
- more human storytelling;
- softer surfaces while trust remains immediately visible.

Risk: imagery/persuasion overpowering proof or bandwidth budgets.

### C — Field Utility

- faster, flatter, task-oriented composition;
- strong list/map and provider-workspace efficiency;
- dense but readable operations patterns;
- minimal decorative content.

Risk: customer surfaces becoming too enterprise-like.

A documented hybrid may combine, for example, A's trust structure, B's marketplace imagery and C's operations density. Owner approval must be explicit.

## 6. Colour direction

Current semantic identity starts around:

| Token | Intended role |
|---|---|
| Primary green | DIREKT action/brand identity |
| Deep green/ink | structural emphasis and text |
| Mint/positive surface | calm positive/support surface |
| Warm amber | pending/expiry/action needed |
| Red | rejection/revocation/suspension/destructive action |
| Blue/info | information/location/neutral assistance |
| Neutral surfaces | cards, sheets, evidence and workspace surfaces |

VC1 may refine tonal values for hierarchy and contrast.

Rules:

- colour never carries status alone;
- payment/commercial colours never mimic verification authority;
- AI assistance uses neutral/informational styling, not trust-success styling;
- dynamic colour must not weaken state semantics.

## 7. Typography and density

- Use a modern highly readable sans-serif/system family with broad Android/web support.
- Define stable page/section/card/body/supporting/metadata roles.
- Body copy should generally be about 16sp-equivalent for normal reading.
- Critical trust dates/limitations never use tiny captions.
- Support 200% font scaling/reflow.
- Minimum Android interaction target: 48dp-class.
- Use whitespace/grouping/hierarchy rather than excessive borders/cards.
- Operations may use denser layouts while preserving readability/focus.

## 8. Iconography and imagery

### Iconography

- Material Symbols/Material Icons or approved vector equivalents;
- consistent state convention;
- visible labels for ambiguous actions;
- icon + text for trust/status;
- no primitive letters/symbols for production navigation.

### Imagery

Use imagery to create a real marketplace:

- provider work;
- consented premises;
- category/service concepts;
- lightweight onboarding/empty-state illustration where useful.

Never treat provider imagery as evidence of verification.

Public work/premises imagery and private verification evidence are separate systems.

Generated assets require review for Zambia relevance, rights/provenance, stereotyping/bias, alt text and low-bandwidth delivery.

## 9. Navigation model

### Customer

Baseline destinations:

1. **Discover**
2. **Saved**
3. **Enquiries**
4. **Account**

Discover owns search/AI need entry, category, area, filters and result navigation.

### Provider

Baseline destinations are reconciled during VC1 but must cover:

- overview/readiness;
- verification/evidence;
- enquiries/work;
- account/business management.

The final nav should minimize duplication between `Profile` and task-oriented provider management.

### Responsive behavior

- compact customer/provider: bottom navigation;
- medium: adaptive navigation rail/two-pane where useful;
- desktop customer/provider web: persistent side navigation;
- operations desktop: dedicated role-scoped side navigation and evidence workspace.

### Role switching

A user with a provider relationship may switch modes. The UI clearly changes context; server authorization controls what provider-management actions are actually allowed.

## 10. Core customer screens

1. splash/session restore;
2. welcome/value/consent;
3. sign in/register/verification;
4. area selection/location fallback;
5. Discover home;
6. search/suggestions/AI need understanding;
7. map/list results;
8. filters;
9. provider profile;
10. trust details;
11. service/availability detail;
12. tracked enquiry;
13. contact-sharing consent;
14. saved providers;
15. enquiry history/detail;
16. review eligibility/submission;
17. report/complaint;
18. notification centre;
19. account/privacy/help.

## 11. Customer discovery and AI assistance

The customer may:

- browse categories;
- search keywords/services;
- describe a service need in natural language when AI is activated;
- answer bounded clarifying questions;
- confirm/edit suggested category/search intent;
- proceed through normal deterministic discovery.

AI may later accept approved photo/voice input, but those affordances remain hidden/inactive until permissions, model/data-processing and integration gates are proven.

Deterministic publication, privacy and eligibility rules run before AI ranking/recommendation.

Manual search/category flow remains available at all times.

## 12. Provider result card and profile hierarchy

### Provider card

Present:

1. public-safe work/premises thumbnail where available;
2. provider name/service;
3. locality/service-area fit;
4. concise current check-specific trust statements;
5. availability;
6. review summary only when threshold permits;
7. clear primary action.

### Public provider profile

Present:

1. provider identity/service/operating model;
2. public locality/service area;
3. current check-specific trust summary;
4. availability and enquiry/contact action;
5. services;
6. trust details with dates/scope/limitations;
7. public work/premises imagery;
8. reviews from eligible interactions;
9. response statistics only when meaningful;
10. save/share/report controls.

Do not put an overall star rating or imagery above more important trust facts without evidence that users understand the hierarchy.

## 13. Trust-details pattern

Each check may show:

- check name;
- current state;
- scope/category;
- completed/reviewed date;
- expiry/currentness where relevant;
- public-safe source class;
- `What this means` explanation;
- `What this does not prove` limitation.

Example:

> **Plumbing qualification — Current**  
> DIREKT reviewed a qualification document matching the provider's submitted identity for the stated plumbing scope. Reviewed 12 June 2026; valid until 12 June 2027. This does not guarantee the quality or outcome of future work.

AI may summarize these facts, but the canonical check remains visible and authoritative.

## 14. Location design

Distinguish:

- **Use my current area** — temporary search origin;
- **Choose area manually** — province/district/locality or approved map method;
- **Travels to customers** — provider service area;
- **Visit business** — consented public premises;
- **Location checked by DIREKT** — private check result without private coordinate disclosure.

Customers must not assume a wide service area was physically verified.

## 15. Provider onboarding and workspace

Use a resumable task-oriented flow:

1. account/representative identity;
2. provider pathway/business details;
3. category/services;
4. operating model;
5. service area/public premises consent;
6. contact/profile/public imagery;
7. category-specific evidence;
8. premises/field evidence where required;
9. declarations;
10. review/submit;
11. ongoing corrections/renewals/publication state.

Provider overview emphasizes:

- next actions;
- readiness;
- services/availability;
- enquiries;
- publication status;
- verification/expiry;
- commercial state separately.

AI may explain requirements, suggest categories and draft provider-supplied public descriptions. Provider confirms generated public copy. AI never self-approves evidence.

## 16. Verification states

Internal/provider-safe states may include:

- Not started;
- In progress;
- Submitted;
- Under review;
- Action required;
- Approved/current;
- Expiring soon;
- Expired;
- Rejected;
- Revoked;
- Suspended.

Customer-facing state is limited to safe public semantics and limitations. Rejected evidence details, private notes and private documents never become public.

## 17. Operations portal design

Operations prioritizes queue efficiency, evidence safety and human decision quality:

- mission control;
- role-scoped queues;
- desktop queue + case + secure evidence/decision workspace;
- evidence access banner/audit/revocation;
- checklist/reason codes/notes;
- previous/current evidence comparison;
- field assignment/escalation;
- complaints/incidents/appeals;
- audit/configuration/system health;
- four-eyes confirmation for defined overrides;
- keyboard accessibility and responsive task layouts.

AI operations assistance may summarize cases, highlight conflicts/missing items or draft safe explanations. It remains clearly secondary to source evidence/canonical facts and cannot select final decisions autonomously.

## 18. Loading, empty, error and offline states

Every applicable data screen defines:

- skeleton/progress;
- empty state with meaningful action;
- no-results recovery;
- recoverable network error;
- authentication/session expiry;
- permission denial;
- insufficient privilege;
- stale cached data marker;
- partial dependency failure;
- map unavailable → list fallback;
- AI unavailable/low-confidence → manual fallback.

Do not use indefinite spinners without explanation.

## 19. Offline and low-connectivity design

- Previously loaded public profiles may show `Last updated`.
- Search preserves query/filters/area when connectivity fails.
- Provider forms save recoverable drafts where architecture supports it.
- Evidence uploads show explicit pending/failed/retry/resume.
- Trust state is never upgraded offline.
- Contact actions that cannot be tracked show a limitation.
- AI outage never blocks standard search, provider management, complaint or support entry.

## 20. Accessibility

- TalkBack/screen-reader labels describe status/action, not colour/icon alone.
- Map results have an equivalent ordered list.
- Dialog/sheet focus returns correctly.
- 200% font scaling/zoom/reflow is tested on critical flows.
- Errors are announced and associated with fields.
- Timeouts are avoidable/extendable where required.
- Motion is restrained/reduced-motion aware.
- Keyboard focus is complete on web/operations.
- AI suggestions are clearly labelled, editable and confirmable.

## 21. AI interaction rules

AI should be embedded into tasks rather than presented as an all-powerful chatbot.

Approved visual patterns include:

- `Describe what you need` composer;
- bounded clarifying prompts;
- confirmable category/query suggestions;
- `Why this result` explanation;
- provider comparison summary;
- onboarding copilot;
- evidence quality/extraction suggestion;
- operations case copilot;
- documentation-grounded support assistant;
- AI unavailable/manual fallback.

Never:

- style AI output like an approved trust decision;
- hide uncertainty;
- conceal canonical sources behind a summary;
- require AI to complete a core task;
- let model-generated text weaken trust/legal limitations.

## 22. VC1–VC8 design programme

- **VC1:** reconcile design system/tokens/components/AI patterns.
- **VC2:** generate high-fidelity benchmark directions and obtain explicit owner approval.
- **VC3:** lock approved Design DNA and component foundation.
- **VC4:** customer world-class experience.
- **VC5:** provider professional workspace.
- **VC6:** operations mission control.
- **VC7:** bounded AI intelligence layer.
- **VC8:** visual/product/accessibility/performance/security/regression/AI quality gate.

VC8 does not authorize Phase 11 real pilot or Phase 12 production.

## 23. Design handoff requirements

Each implemented screen/slice requires:

- screen identifier and route;
- user role;
- entry/exit conditions;
- data contract;
- trust/privacy/authorization boundary;
- loading/empty/error/offline/AI-fallback states;
- analytics events;
- accessibility notes;
- approved design reference and synthetic-safe screenshot/visual comparison for VC work;
- AI use-case/data/authority notes where applicable;
- acceptance/regression tests.

A screen is not complete merely because it is functional or attractive. It must remain truthful, accessible, private, resilient and aligned with the approved Design DNA.