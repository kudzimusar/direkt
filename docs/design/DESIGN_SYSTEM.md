# DIREKT Design System

## Purpose

Provide a coherent world-class visual and interaction system across Android, customer/provider web/PWA and the operations portal while communicating trust accurately, supporting AI-assisted workflows safely and remaining accessible, responsive and low-bandwidth aware.

The design system is governed by:

- `docs/product/WORLD_CLASS_PRODUCT_AND_AI_PLAN.md`;
- `docs/design/VISUAL_COMPLETION_PLAN.md`;
- `docs/architecture/AI_PRODUCT_ARCHITECTURE.md`.

Platform-native behavior remains valid. Android Compose, customer/provider web and operations share Design DNA and semantics, not necessarily identical layouts.

## Foundations

### Colour roles

Use semantic tokens rather than hard-coded screen colours:

- `primary`: core DIREKT actions;
- `onPrimary`;
- `surface`, `surfaceVariant`, `onSurface`;
- `success`: current approved check or successfully completed non-commercial state;
- `warning`: pending/expiring/action needed;
- `danger`: rejected/revoked/suspended/destructive;
- `info`: neutral explanation/location/AI assistance;
- `outline`, `disabled`;
- separate commercial/billing semantic roles that never resemble trust authority.

All text/background pairs must meet WCAG contrast targets. Status always includes text/icon and never relies on colour alone.

### Typography

Material 3 scale is the Android base, reconciled to equivalent web tokens.

Define stable roles for:

- display/hero only when task-appropriate;
- page title;
- section title;
- card title;
- body;
- supporting/limitation text;
- labels/status metadata;
- numeric/metric treatment for operations.

Critical trust state, dates, expiry and limitation text must never be relegated to unreadable captions. Support localization expansion and 200% text scaling/reflow.

### Spacing, shape and density

- 4dp base grid;
- 8/12/16/24/32dp common spacing;
- 48dp-class minimum touch targets;
- moderate corner radius;
- elevation reserved for hierarchy, not decoration;
- customer/provider experiences use comfortable marketplace density;
- operations uses denser task-oriented composition without sacrificing focus or accessibility.

### Iconography

Use Material Symbols/Material Icons or approved vector assets.

- no primitive text glyphs for production navigation;
- consistent filled/outlined state convention;
- explicit labels for ambiguous actions;
- icon + text for trust/status;
- no shield/seal icon that implies government endorsement or blanket verification;
- AI icons indicate assistance, not authority.

### Imagery

Imagery must make DIREKT feel like a real local-services marketplace.

Use:

- authentic provider/work/premises imagery where consented;
- Zambia-relevant category imagery or illustration;
- lightweight thumbnails and low-bandwidth variants;
- neutral placeholders when images are absent.

Never mix public marketplace imagery with private verification evidence.

Generated imagery requires review for:

- Zambia relevance;
- stereotyping/bias;
- rights/provenance;
- accessibility/alt text;
- low-bandwidth delivery.

### Motion

- short, functional transitions;
- no celebratory verification animation that implies guarantee;
- honour reduced motion;
- upload/processing animation must not conceal duration or state;
- AI processing states must not fake certainty or hide a deterministic action.

### Adaptive layout

Customer/provider:

- compact/mobile: bottom navigation;
- medium/tablet: adaptive rail/split layout where useful;
- expanded/desktop: persistent side navigation and wider content composition.

Operations:

- desktop: queue + case + evidence/decision workspace;
- tablet: one/two pane according to task;
- compact: task-focused triage/field flow, never a squeezed desktop table.

## Core components

### Verification check card

Fields:

- icon;
- check name;
- state label;
- reviewed/current date;
- expiry where relevant;
- scope/category where relevant;
- short meaning;
- limitation/what the check does not prove;
- details action.

Variants: current, pending, action required, expiring, expired, unavailable, revoked/suspended where policy exposes it.

Never collapse all checks into one generic `Verified` badge.

### Provider summary card

- provider name/category;
- public work/premises image where available;
- operating model;
- distance or service-area match;
- concise current checks;
- availability;
- review summary if threshold met;
- sponsored label where applicable;
- clear primary action.

### Provider profile header/gallery

- provider identity and service scope;
- public locality/service area;
- work/premises imagery separate from evidence;
- availability/contact/enquiry action;
- trust summary immediately accessible;
- no imagery that visually substitutes for proof.

### Area selector

- current/manual source;
- human-readable area;
- change action;
- permission state;
- never displays private evidence location.

### Search and AI need-entry component

Supports:

- keyword/category search;
- natural-language “describe what you need” input;
- optional approved voice/photo affordance;
- clarifying questions;
- editable AI suggestions;
- manual category/search fallback;
- clear active area context.

AI suggestions are not silently submitted as facts.

### AI suggestion card

Must show:

- what is being suggested;
- why/which approved source or context supports it where relevant;
- editable/confirm/reject controls;
- AI-assistance label when material;
- uncertainty/fallback state;
- no trust-authority styling.

### “Why this result” explanation

May explain approved relevance signals such as:

- service/category match;
- service-area compatibility;
- availability;
- current public trust checks;
- review summary after threshold.

It must not expose proprietary sensitive ranking details, private evidence or fabricated reasons.

### Evidence upload tile

- evidence type;
- requirement explanation;
- capture/select action;
- progress;
- validation;
- version/state;
- remove/replace based on policy;
- offline/retry state;
- optional machine-assisted quality feedback clearly marked as assistance.

### Status timeline

- chronological states;
- customer-safe/provider-safe messages;
- timestamps;
- next action;
- no private reviewer notes.

### Enquiry card

- service;
- safe area summary;
- state;
- provider/customer identity as permitted;
- last update;
- response action.

### Banner

Use for offline, stale cache, suspension, critical action, privacy, AI fallback or service degradation. Banners are dismissible only when safe.

### Operations queue item

- case/check type;
- priority/SLA;
- provider identity as permitted;
- assigned owner;
- age/state;
- risk/action-required indicator;
- no exposed evidence content.

### Operations case/evidence workspace

Desktop composition supports:

- queue/navigation pane;
- case/check facts and history;
- secure evidence viewer;
- checklist/reason/decision controls;
- audit trail;
- AI assistance panel only as a clearly secondary aid.

### AI operations copilot panel

May display:

- summary of canonical facts;
- missing/inconsistent item suggestions;
- draft provider-safe explanation;
- source links/record references where available;
- explicit human review/confirm controls.

It must not present model output as a completed decision.

## Loading, empty, error and offline patterns

Every major component family defines:

- first-load skeleton or progress;
- empty state with useful next action;
- recoverable error;
- offline/cached timestamp state;
- retry behavior;
- AI unavailable/manual fallback where relevant.

## Accessibility

Required across applicable surfaces:

- TalkBack/screen-reader semantics;
- keyboard/focus order;
- sufficient contrast;
- 48dp-class targets;
- 200% font scaling/reflow;
- reduced motion;
- accessible form errors;
- map/list equivalence;
- meaningful image alt text;
- no critical information conveyed only by image/colour/icon.

## AI interaction governance

AI components must visually distinguish:

1. canonical facts;
2. AI-generated summary/suggestion;
3. user-confirmed input;
4. human-reviewed/authorized outcome.

Never blur these states.

AI must remain optional for core task completion and must degrade to manual/deterministic flow.

## Component governance

Every new component requires:

- purpose;
- states;
- responsive behavior;
- accessibility semantics;
- Android preview or web equivalent with synthetic data;
- tests;
- design-system documentation;
- AI/data-boundary documentation when applicable;
- approved visual reference where part of VC1–VC8.

A visually attractive component is not approved if it weakens trust semantics, privacy, accessibility, offline behavior or authority boundaries.