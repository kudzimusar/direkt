# DIREKT PWA UI Specification

## Purpose

Provide a responsive, installable customer/provider interface that delivers world-class DIREKT discovery, trust, enquiry and provider-workspace experiences on desktop, tablet and mobile while preserving Android as the primary Version 1 native client and the same canonical backend/trust/privacy authority.

Read with:

- `docs/product/WORLD_CLASS_PRODUCT_AND_AI_PLAN.md`;
- `docs/design/VISUAL_COMPLETION_PLAN.md`;
- `docs/design/DESIGN_SYSTEM.md`;
- `docs/architecture/AI_PRODUCT_ARCHITECTURE.md`.

## Architecture boundary

The PWA remains a presentation client through the reviewed same-origin BFF/private-API boundary.

It must not:

- connect directly to privileged Supabase/database paths;
- hold model-provider secrets or privileged prompts;
- accept provider scope from untrusted client state;
- become the source of verification, payment or authorization truth;
- expose private evidence/private coordinates/raw contacts outside approved scope.

AI capabilities call approved backend orchestration endpoints only and retain manual/deterministic fallbacks.

## Primary layouts

### Desktop

- persistent left navigation;
- customer/provider mode switcher;
- wide content canvas using one/two-pane composition according to task;
- marketplace content prioritized over environment/development chrome;
- persistent environment status only where pre-release truth requires it, visually secondary to product content;
- keyboard-first navigation and visible focus;
- results may use list + map split when Maps is genuinely active;
- provider workspace may use master/detail panels for enquiries, verification or services.

### Tablet

- adaptive one/two-column content;
- navigation rail or compact side navigation where approved;
- no desktop-only hover dependency;
- 44–48 CSS px-class touch targets;
- split views only when both panes remain readable at large text/zoom.

### Mobile

- four-destination bottom navigation aligned with the approved cross-client information architecture;
- single-column task-first flow;
- no horizontally clipped trust/action content;
- bottom actions respect safe areas and on-screen keyboard;
- map always has a list equivalent.

## Customer destinations

Baseline destinations:

1. Discover;
2. Saved;
3. Enquiries;
4. Account.

Discover includes:

- current/manual area;
- category discovery;
- keyword search;
- optional AI-assisted `Describe what you need` entry when activated;
- clarifying suggestions with user confirmation;
- filters;
- result list/map;
- provider comparison/profile;
- check-specific trust details;
- no-results/manual fallback.

Do not expose raw category keys, provider IDs or workflow/API terminology as primary user content.

## Provider destinations

Baseline destinations:

1. Overview;
2. Verification/Evidence;
3. Enquiries;
4. Account.

Overview summarizes:

- readiness/next actions;
- services and availability;
- public profile/publication state;
- enquiry attention;
- commercial state separately from trust.

Evidence presents safe requirement/status/timeline/upload/correction information and never exposes evidence bytes through public/synthetic contexts.

AI onboarding assistance may explain requirements or draft provider copy, but all public provider content remains editable/confirmable and all trust outcomes remain canonical/human-accountable.

## World-class marketplace presentation

- Use approved typography/iconography/imagery from VC Design DNA.
- Replace primitive glyphs and development labels.
- Use authentic/local marketplace imagery or lightweight approved illustrations without making imagery substitute for trust evidence.
- Keep service search and area selection prominent.
- Provider cards emphasize service fit/locality/current trust snippets/availability/action.
- Provider profiles separate public work/premises imagery from private evidence.
- Do not use oversized marketing hero sections that delay discovery.
- Use responsive whitespace/hierarchy rather than generic dashboard-card overload.

## Trust presentation

Never show a blanket `Verified` label.

Each applicable check supports:

- check name;
- current state;
- safe summary of what was checked;
- category/scope where applicable;
- reviewed/current date;
- valid-until/expiry where applicable;
- limitation/context;
- details action.

Commercial/subscription state uses a separate visual family from trust.

AI summaries may explain public trust facts in plain language, but canonical check cards remain visible and are not replaced by model-generated conclusions.

## AI interaction patterns

### Describe-your-need composer

- normal text input remains primary/familiar;
- optional AI assistance may classify intent or ask bounded clarifying questions;
- photo/voice affordances appear only when actually approved and active;
- user can edit/reject/bypass suggestions;
- manual keyword/category search always works.

### Why-this-result/provider comparison

- uses only approved public-safe signals;
- clearly identifies generated synthesis when material;
- does not claim hidden certainty or blanket trust;
- never reveals private evidence or sensitive ranking inputs;
- deterministic ranking/eligibility remains authoritative.

### AI unavailable state

- no dead-end chatbot screen;
- return to standard search/category/help flow;
- preserve entered user text where safe;
- explain temporary unavailability succinctly.

## Environment labelling

Public pre-release/synthetic review surfaces must truthfully indicate:

- synthetic or controlled review state;
- no real participant/evidence/money use where applicable;
- functions that remain gated.

Environment labels must be visually secondary and must not leak workstream/API/test harness language into ordinary product cards and task flows.

Production-facing UI removes development/workstream labels while retaining legally/operationally required environment or beta disclosure.

## Brand and semantic tokens

Existing starting identity includes approximately:

| Token | Starting value |
|---|---|
| primary | `#087A55` |
| primary deep | `#00513A` |
| primary container | `#D9F5E9` |
| ink | `#16211C` |
| base surface | `#F8FAF9` |
| attention | `#F2A900` |

VC1 may refine tonal values while preserving semantic identity, contrast and cross-platform consistency.

Dark mode follows approved semantic roles rather than arbitrary inversion.

## PWA behavior

- standalone install manifest;
- service worker uses bounded caching and never creates a privileged data store;
- install prompt is progressive enhancement;
- offline state is explicit;
- theme/mode preference may be local because it is non-sensitive;
- public/synthetic build stores no auth/session/evidence/contact data;
- authenticated cache/session behavior follows reviewed browser security rules;
- AI responses containing account-private context are not persisted into public/static caches;
- model/provider outage never blocks standard discovery/support/manual flows.

## Loading, empty, failure and offline states

Every major journey defines:

- first-load skeleton/progress;
- empty state with next action;
- no-results recovery;
- recoverable API failure;
- offline/stale cache with timestamp where appropriate;
- retry/conflict state for writes;
- map-provider unavailable → list fallback;
- AI unavailable/low-confidence → manual fallback.

## Accessibility

- semantic landmarks and skip link;
- visible keyboard focus;
- logical tab/focus order;
- Enter/Space support for custom interactive controls;
- dialog/sheet semantics;
- status not conveyed by colour alone;
- reduced-motion support;
- accessible names for icon-only controls;
- zoom/reflow at 200%;
- accessible form error summaries/focus;
- map/list equivalence;
- meaningful alt text for provider/work imagery;
- AI suggestions labelled clearly and editable/confirmable.

## Visual evidence and testing

For VC1–VC8 changes record:

- approved design reference;
- compact/tablet/desktop viewport evidence as applicable;
- synthetic-safe screenshots/visual comparisons;
- loading/empty/error/offline states;
- accessibility state;
- AI active/fallback state where applicable;
- deliberate web-specific adaptations.

Exact-head checks include applicable typecheck, contracts/OpenAPI, build, browser/security, offline/PWA, responsive/accessibility and shared backend/Android regressions.

## Acceptance

A PWA VC slice is complete when:

1. it feels like a complete marketplace rather than a test harness;
2. customer/provider mode and primary actions are immediately understandable;
3. trust claims are specific, scoped and current rather than vague;
4. desktop/tablet/mobile are intentionally composed, not stretched versions of one another;
5. AI assistance is useful but optional and distinguishable from canonical facts;
6. synthetic/gated functions remain honest;
7. privacy/BFF/session boundaries remain intact;
8. visual/accessibility/offline/regression gates pass on the exact head.