# DIREKT PWA UI Specification

## Purpose

Provide a responsive, installable customer/provider interface that lets the owner inspect DIREKT remotely on desktop, tablet and mobile while preserving the Android-first product model and the same trust semantics.

## Primary layouts

### Desktop

- persistent left navigation;
- customer/provider mode switcher;
- wide content canvas with list/detail or main/insight columns;
- visible environment/synthetic-review status;
- keyboard-first navigation and focus treatment.

### Tablet

- compact top navigation or reduced sidebar;
- one/two-column adaptive cards;
- touch targets at least 44–48 CSS px;
- no desktop-only hover dependency.

### Mobile

- four-destination bottom navigation aligned with Android information architecture;
- single-column task flow;
- no horizontally clipped tables or trust cards.

## Customer destinations

1. Discover
2. Saved
3. Enquiries
4. Account

Discover includes manual area, categories, provider results, provider profiles and check-specific trust details.

## Provider destinations

1. Overview
2. Evidence
3. Enquiries
4. Account

Overview summarizes readiness/current checks/actions. Evidence presents safe status/timeline information and must not expose evidence bytes in the public synthetic build.

## Trust presentation

Never show a blanket `Verified` label. Each check includes:

- check name;
- state;
- safe summary;
- limitation/context;
- date/expiry when present in the live contract.

Commercial/subscription state is visually separate from trust state.

## Environment labelling

Every public pre-release PWA screen includes a persistent banner indicating:

- synthetic remote UI review;
- no real submissions;
- no real participant data;
- live pilot access remains gated.

## Brand tokens

Use Android-aligned defaults:

| Token | Value |
|---|---|
| primary | `#087A55` |
| primary deep | `#00513A` |
| primary container | `#D9F5E9` |
| ink | `#16211C` |
| base surface | `#F8FAF9` |
| attention | `#F2A900` |

Dark mode follows the native Material 3 semantic roles rather than arbitrary inversion.

## PWA behavior

- manifest uses standalone display;
- service worker caches static shell only;
- install prompt is progressive enhancement, never blocking;
- offline state is explicit;
- theme/mode preferences may be local because they contain no sensitive domain data;
- public build never stores auth/session/evidence/contact data.

## Accessibility

- semantic landmarks and skip link;
- visible keyboard focus;
- Enter/Space support for interactive cards;
- dialog semantics;
- status not conveyed by color alone;
- reduced-motion support;
- screen-reader names for icon-only controls;
- zoom/reflow support through responsive layouts.

## Remote review acceptance

The owner should be able to answer from `direkt.forum/app/`:

1. What does the current DIREKT palette feel like?
2. Can I understand customer vs provider mode immediately?
3. Can I see the implemented discovery/trust/enquiry/provider-workspace concepts?
4. Are trust claims specific rather than vague?
5. Does desktop feel like a real product rather than a phone stretched across a monitor?
6. Can the same UI collapse cleanly to tablet/mobile widths?
7. Is it obvious which functions are synthetic/gated rather than live?
