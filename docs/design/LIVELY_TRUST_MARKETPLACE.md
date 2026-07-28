# DIREKT Lively Trust Marketplace Design System

## Status and authority

**Owner-approved direction:** 2026-07-28  
**Governing issue:** #522  
**Implementation PR:** #524  
**Clients:** native Android and responsive installable customer/provider PWA  
**Canonical PWA:** `https://app.direkt.forum/`  
**Account deep link:** `https://app.direkt.forum/?view=account`

This document is the implementation-level visual specification for the owner-approved **Lively Trust Marketplace** refinement. It extends, and does not delete, the existing DIREKT design authority in:

- root `design.md`;
- `docs/design/DESIGN_SYSTEM.md`;
- `docs/design/ANDROID_UI_SPECIFICATION.md`;
- `docs/design/PWA_UI_SPECIFICATION.md`;
- `docs/design/VISUAL_COMPLETION_PLAN.md`.

When this document describes a visual value differently from the older green-led customer presentation, it controls the customer Android/PWA presentation for Issue #522. Existing provider, operations, trust, privacy, AI, offline and authorization rules remain in force.

## Implementation directive

> Keep all working functionality. Redesign and restyle the presentation without replacing business logic, API contracts, session boundaries, authorization, canonical trust state or integration gates.

The implementation must preserve:

- Android and PWA customer/provider mode behavior;
- the PWA `?view=discover|saved|enquiries|account` entry contract;
- search, manual area, category, filter and list/map behavior;
- saved providers, enquiries, consent handoffs, reviews and complaints;
- backend-authoritative authentication and provider scope;
- check-specific trust, dates, scope and limitations;
- offline, low-bandwidth, loading, empty and error behavior;
- permanent Android, PWA, W4, W7, W8 and security regression tests.

Generated reference images are a quality and composition target, not a source of fictional product data. Controls visible in a reference may be implemented only when a real existing action or truthful state supports them.

## Design DNA

Lively Trust Marketplace combines:

- **Structured Trust:** proof-led information hierarchy and check-specific trust;
- **Neighbourhood Marketplace:** warmth, local-service illustration and category color;
- **Field Utility:** fast actions, readable lists and efficient provider/operations density.

The product should feel modern, lively, local, calm and trustworthy. It must not feel like a government portal, generic fintech product, luxury service, test harness or static design mockup.

## Semantic color system

Use semantic tokens. Do not hard-code isolated screen colors.

### Light theme

| Token | Value | Role |
|---|---:|---|
| Primary | `#2457F5` | primary action, selected navigation, focus |
| Primary strong | `#173EB5` | pressed/high-emphasis blue |
| Primary soft | `#EAF0FF` | selected tonal surfaces |
| Indigo | `#5B45F5` | CTA gradient and secondary brand energy |
| Teal | `#0F927F` | area/location and calm assistance |
| Teal soft | `#E3F7F3` | teal tonal surface |
| Orange | `#F97316` | marketplace/category warmth |
| Orange soft | `#FFF0E5` | orange tonal surface |
| Amber | `#E99A00` | pending, scheduled, action needed |
| Amber soft | `#FFF4D8` | warning tonal surface |
| Violet | `#7445E8` | category and illustration accent |
| Violet soft | `#F1EAFF` | violet tonal surface |
| Success | `#087A63` | current approved check or successful workflow state |
| Success soft | `#E3F5EF` | success tonal surface |
| Danger | `#C9342C` | rejection, revocation, destructive action |
| Danger soft | `#FDEBE9` | danger tonal surface |
| Background | `#F7F9FC` | application background |
| Surface | `#FFFFFF` | cards, fields and sheets |
| Surface subtle | `#F1F4F9` | grouped secondary surface |
| Text primary | `#101B35` | headings and primary content |
| Text secondary | `#59667A` | support text |
| Text muted | `#7B8798` | metadata and inactive labels |
| Outline | `#D7DFEA` | card and field borders |

### Dark theme

Use purpose-built dark values rather than inverting the light theme:

- primary `#9BB4FF`;
- primary soft `#21356C`;
- teal `#75D7C5`;
- orange `#FFAE76`;
- violet `#C3AEFF`;
- background `#0D1320`;
- surface `#141C2B`;
- surface subtle `#202B3D`;
- text primary `#F2F5FA`;
- text secondary `#C3CBD8`;
- outline `#3A4658`.

### Color governance

- Status never relies on color alone.
- Payment/commercial color must not resemble trust authority.
- AI assistance uses informational/neutral styling, never trust-success styling.
- Orange and violet are category/decorative accents, not verification state.
- A provider must never receive a generic `Verified`, `High trust`, `Safe` or guaranteed badge from presentation code.

## Typography

Use Inter where a reviewed bundled/self-hosted implementation exists. Otherwise use Android/system sans-serif and the browser system stack. Never download a font at runtime.

### Android roles

| Role | Size / line height | Weight |
|---|---|---|
| Home hero | `36sp / 42sp` | 700 |
| Page title | `30sp / 36sp` | 700 |
| Section title | `22sp / 28sp` | 700 |
| Card title | `18sp / 24sp` | 600 |
| Body large | `17sp / 26sp` | 400 |
| Body | `16sp / 24sp` | 400 |
| Body small | `14sp / 20sp` | 400 |
| Label | `14sp / 20sp` | 600 |
| Eyebrow | `12sp / 16sp` | 700 |
| Navigation | `12sp / 16sp` | 600 |

### PWA roles

- Home hero: `clamp(2rem, 4.4vw, 3.25rem)`;
- page title: `clamp(1.75rem, 3vw, 2.5rem)`;
- section title: `clamp(1.25rem, 2vw, 1.75rem)`;
- body: `1rem` with approximately `1.5` line height;
- small body: `0.875rem`;
- navigation label: `0.75rem–0.8125rem`.

Rules:

- avoid ExtraBold as the default;
- headings must not dominate the first viewport;
- body text remains at least 16sp/1rem for normal reading;
- trust dates, scope and limitations remain at least 14sp/0.875rem;
- support Android 200% font scale and browser 200% zoom/reflow;
- do not use fixed-height cards that clip scaled text.

## Spacing, shape and elevation

Use a 4-unit base grid.

Common spacing: `4, 8, 12, 16, 20, 24, 32, 40, 48` dp or equivalent rem/CSS px rhythm.

- compact horizontal screen padding: 16–20;
- large-phone/desktop content padding: 24–34;
- card padding: 16–20;
- section separation: 24–32;
- field separation: 12–16.

Radii:

- small badge: 8;
- button/small card: 12–16;
- primary card: 20;
- search/trust card: 24;
- hero: 28;
- chips/segmented control: pill.

Elevation:

- flat groups: 0;
- standard card: 1;
- search/primary composition: 2–4;
- stronger elevation is reserved for transient overlays.

Avoid placing every text block in a raised card.

## Touch, pointer and focus

- Android minimum target: 48dp;
- PWA minimum target: 44 CSS px, with 48px preferred for primary mobile controls;
- primary button height: 56;
- field row: at least 64–72;
- segmented control: 44–48;
- visible `:focus-visible` styling on the PWA;
- labels remain visible for bottom navigation;
- no action or information may be hover-only.

## Iconography and illustration

Use Material-style rounded vector icons on Android and the existing source-controlled `DirektIcon` SVG system on the PWA.

- normal icon: 20–24;
- category icon: 24–28;
- empty-state/trust illustration: 40–56;
- outlined inactive navigation; stronger/filled active state;
- ambiguous icons require text labels.

The neighbourhood artwork is decorative, public-safe and lightweight. It represents no provider, checked location or private coordinate. Provider work/premises images remain separate from private verification evidence.

## Navigation

Customer destinations remain:

1. Home/Discover;
2. Saved;
3. Enquiries;
4. Account.

Adaptation:

- Android compact: Material 3 bottom navigation;
- PWA compact: bottom navigation;
- PWA tablet: navigation rail;
- PWA desktop: labeled side navigation;
- the same destination model drives every PWA navigation surface;
- provider mode remains gated by backend-authoritative account capability.

PWA accepted entries remain:

```text
?view=discover
?view=saved
?view=enquiries
?view=account
```

`https://app.direkt.forum/?view=account` must continue to initialize Account. Invalid values safely fall back to Discover.

## Core component rules

### Header and mode control

Use a compact blue-gradient DIREKT mark, wordmark and a pill segmented control. Selecting Provider changes visual context only after the existing provider-capability gate permits it; selection never grants permission.

### Primary action

- blue-to-indigo gradient or solid semantic primary;
- 56 high;
- 16 radius;
- explicit verb label;
- disabled/loading states preserve size;
- destructive actions never use the primary gradient.

### Search/request card

Contains the working service/problem and area/landmark fields and `Find providers` action. Android/compact web stacks fields; wider PWA may align fields in a responsive grid when DOM order, validation and keyboard order remain correct.

### Category chip

Category chips may use blue, teal, orange and violet tonal variants. Category color never represents trust. Chips remain horizontally scrollable on compact screens and may form a responsive grid on desktop.

### Proof principle card

Title: `Proof before persuasion`.

Approved compact copy:

> Trust information is check-specific. Payment or subscription never upgrades a provider's trust status.

The card may use a restrained blue/lavender/peach gradient. It must not resemble a certificate or imply blanket approval.

### Provider and Saved cards

Show only real current data available from existing contracts:

- provider identity/service;
- locality/service-area fit;
- availability;
- check-specific trust statements with scope/currentness;
- review summary only when the approved threshold permits;
- working actions only.

Do not invent trust scores, insurance, ratings, comparison results or availability merely because a reference image displays them.

### Enquiry cards

Show canonical service, state, last update and existing next action. Do not add full chat, fictional responses or optimistic completion. Consent and contact boundaries remain unchanged.

### Account rows

Show only implemented destinations/actions. Account status and provider trust remain visually and semantically separate. Authentication remains backend-owned and the current participant gate remains truthful.

## Screen composition

### Home

Recommended order:

1. header and mode selector;
2. local-help badge;
3. balanced hero title and description;
4. lightweight illustration;
5. service and area inputs;
6. `Find providers`;
7. popular service chips;
8. proof principle;
9. existing location education, filters, map/list and results;
10. error/offline/review-boundary states.

The illustration must not push the search task excessively below the fold.

### Saved

Use the existing saved-provider state. Provide truthful populated, empty and account-required states. Compact layouts stack cards; wider PWA may use a two-column grid when reading/focus order remains clear.

### Enquiries

Use the existing enquiry lifecycle and actions. Status filters are shown only when canonical state mapping supports them. Desktop list/detail is allowed only when a real selected-detail state exists.

### Account and privacy

Use a bounded form width, secure-account/authentication card, and real account/privacy/support sections. Preserve pilot authentication restrictions, HttpOnly/server-owned sessions and provider-scope resolution.

## Responsive behavior

### Android

- compact under 600dp: single column and bottom navigation;
- medium 600–839dp: rail/two-pane when useful;
- expanded 840dp+: bounded content and deliberate pane composition.

### PWA

- below 768px: mobile header, bottom navigation, single column;
- 768–1199px: rail and adaptive one/two-column composition;
- 1200px+: 264–288px side navigation and bounded main content, approximately 1180–1280px maximum;
- reading/forms remain approximately 560–680px wide;
- desktop must not be a stretched mobile column.

## Accessibility and resilience

Required:

- TalkBack and web screen-reader semantics;
- logical traversal and focus order;
- 48dp Android and 44px web targets;
- WCAG AA contrast;
- status not color-only;
- Android 200% font scale and web 200% zoom/reflow;
- reduced-motion support;
- form error announcement/focus;
- map/list equivalence;
- loading, empty, error, offline and stale states;
- manual/non-AI fallback;
- public-safe, low-bandwidth image behavior;
- no private evidence or session material in public caches.

## Motion

Use short functional motion:

- press/selection 100–150ms;
- chip/segment 150–200ms;
- expansion 200–250ms;
- navigation content 200–300ms.

Honor reduced motion. Do not use celebratory trust animation or theatrical AI effects.

## Completion evidence

A customer visual slice is complete only when:

- Android and PWA use the same semantic design system with platform-native adaptations;
- all four customer destinations remain interactive;
- `?view=account` deep-link behavior remains valid;
- automated Android/PWA/cross-client/accessibility tests pass on exact head;
- Android and PWA compact/tablet/desktop screenshots are captured with synthetic/public-safe data;
- provider and operations regressions remain green;
- owner visual review is recorded after automated tests;
- no trust, privacy, payment, AI, participant or production authority changed.
