# DIREKT Lively Trust Marketplace Implementation Plan

## Purpose

This plan controls the Issue #522 Android and PWA customer UI refresh. It upgrades the existing working clients rather than creating a replacement app, static prototype or parallel website.

**Baseline:** `main@61edb4ecfd83ef7b7b5f89723ce52c9a244a3cad`  
**Implementation branch:** `ui/lively-trust-marketplace`  
**Pull request:** #524  
**Canonical PWA:** `https://app.direkt.forum/`  
**Account deep link:** `https://app.direkt.forum/?view=account`

Read with:

- root `design.md`;
- `docs/design/LIVELY_TRUST_MARKETPLACE.md`;
- `docs/design/DESIGN_SYSTEM.md`;
- `docs/design/ANDROID_UI_SPECIFICATION.md`;
- `docs/design/PWA_UI_SPECIFICATION.md`;
- `WORKSTREAM_LOCK.md`.

## Repository findings

The repository already contains:

- one Android app with customer/provider modes, Compose/Material 3 and four customer destinations;
- one responsive Next.js/React PWA with mobile bottom navigation, tablet rail and desktop side navigation;
- canonical backend/OpenAPI/BFF/session boundaries;
- working search, area, categories, filters, map/list, Saved, enquiry and Account behavior;
- permanent Android/PWA/cross-client regression and synthetic visual-evidence workflows.

The implementation must therefore restyle existing routes/state/callbacks. It must not rebuild business behavior from the reference images.

## Non-negotiable preservation

- no API, schema or generated-client change unless separately approved;
- no client-side trust, authorization, payment or provider-scope authority;
- no generic `Verified`, trust score, guarantee or fictional status;
- no private evidence, exact private coordinates, raw contacts or credentials;
- manual search and list fallback remain available;
- provider workspace and operations portal remain regression-protected;
- participant, production-authentication, communication, real-money and release authorization remain false.

## Work stages

### NVR0 — Control and baseline

- create Issue #522;
- claim `WORKSTREAM_LOCK.md`;
- use a bounded branch from exact current main because the historical implementation branch is diverged;
- inspect Android/PWA shell, state, tests and screenshot contracts;
- preserve existing exact-head evidence and release boundaries.

### NVR1 — Design foundation

Implement the shared semantic system separately for each platform:

- Android Compose colors, typography and shapes;
- PWA CSS custom properties, dark theme and reusable component styling;
- blue-led brand palette with restrained teal, orange, amber and violet accents;
- 4-unit spacing, consistent radii/elevation, accessible focus and status rules.

Exit: current behavior still builds and all existing screens remain reachable.

### NVR2 — Application shells

Android:

- compact DIREKT header;
- customer/provider segmented control;
- Material 3 bottom navigation;
- correct insets and content padding.

PWA:

- mobile header/bottom navigation;
- tablet rail;
- desktop side navigation;
- visible focus, responsive content width and preserved `?view=` initialization.

Exit: all four customer destinations and provider mode gate remain functional.

### NVR3 — Home/Discover

Recompose the existing discovery state into:

- local-help badge;
- balanced title and support copy;
- public-safe neighbourhood illustration;
- service and area fields;
- `Find providers` action;
- colorful category chips;
- proof-principle card;
- existing location education, filters, map/list and provider results.

Preserve query, area, category, filters, low-bandwidth image mode and truthful Maps fallback.

### NVR4 — Saved

Use existing saved-provider data and actions. Render:

- populated cards;
- empty state;
- account-required state where applicable;
- current check-specific facts only;
- privacy explanation.

Do not add comparison, ratings, insurance or trust scores unless a real existing contract supports them.

### NVR5 — Enquiries

Restyle existing enquiry lifecycle cards and forms. Preserve:

- canonical states;
- create/view/respond/contact/review/complaint behavior;
- consent-aware handoff;
- privacy-safe contact presentation;
- no full-chat invention.

### NVR6 — Account and privacy

Restyle the working authentication/session/account/support experience. Preserve:

- participant authentication gate;
- backend-owned sessions;
- provider mode capability gate;
- consent/security behavior;
- direct web entry through `?view=account`.

### NVR7 — Adaptive, accessible and resilient completion

Verify:

- Android compact/medium/expanded behavior;
- PWA 390px, 820px and 1440px reference widths;
- Android 200% font scale and browser 200% zoom/reflow;
- TalkBack/screen-reader labels;
- keyboard, focus-visible, touch and pointer behavior;
- dark theme and reduced motion;
- loading, empty, error, offline and low-bandwidth states;
- APK/web performance and layout shift.

### NVR8 — Exact-head closure

Required checks include:

- Android unit tests, lint, build, instrumentation and screenshot capture;
- Android performance and release-readiness regressions;
- PWA typecheck, static contracts, build and responsive screenshots;
- W4 customer, W7 cross-client and W8 canonical-domain contracts;
- auth/session/security, integration, supply-chain and documentation gates;
- provider and operations representative screenshots;
- no repository mutation by builds.

Final visual evidence must include:

- Android Home, Saved, Enquiries and Account;
- Android provider Overview and Evidence;
- PWA Home, Saved, Enquiries and Account at compact width;
- representative PWA tablet and desktop states;
- `?view=account` direct entry;
- truthful signed-out, fallback or empty states where live data is unavailable.

## Regression method

For every touched screen, preserve or document:

- entry point and destination;
- state model and callbacks;
- API/data contract;
- auth/trust/privacy boundary;
- loading/empty/error/offline behavior;
- analytics and accessibility identifiers;
- automated tests and visual evidence.

Stable semantic identifiers are preferred over coordinate-based tests. Existing selectors remain until dependent workflows are migrated and green.

Tests must not be weakened to make the redesign pass. Repair the implementation or deliberately update a stale assertion to the current approved contract.

## Owner review

Automated checks run first. The owner should not be asked to perform routine build, lint or basic smoke work that CI can perform.

Owner review checkpoints:

1. shell/theme and navigation;
2. Home/Discover interaction;
3. all four customer destinations on Android and PWA.

Provide:

- exact source SHA;
- Android artifact/internal distribution;
- exact-head PWA preview or canonical promoted URL;
- direct `?view=` links;
- short click/scroll test steps;
- before/after screenshots and known limitations.

Record `APPROVE`, `APPROVE WITH NON-BLOCKING FOLLOW-UP` or `REVISE` with concrete observations. Owner approval does not replace automated accessibility, security or state evidence.

## Rollback

The refresh changes presentation only and is intentionally reversible:

- no database migration belongs to this work;
- token, shell and screen changes are separated into coherent commits;
- Android and PWA slices can be reverted independently;
- PWA preview evidence precedes canonical promotion;
- the exact stable main remains the rollback reference until merge;
- a visual rollback cannot alter backend authority or data.

## Closure

The workstream closes only when:

- exact-head checks are green;
- visual evidence is inspected;
- working functionality and trust/privacy boundaries are preserved;
- documentation and status are reconciled;
- PR #524 is merged;
- Issue #522 records the final source/evidence;
- `WORKSTREAM_LOCK.md` is released without deleting historical closure contracts.
