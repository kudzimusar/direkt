# DIREKT Functional Web/PWA Parity Implementation Plan

**Status:** Authoritative implementation workstream  
**Authorized:** 2026-07-19 by repository owner  
**Baseline:** synchronized `main` checkpoint after PR #152 (`885eb72dcda12be8c23c4068dec138562af5888a`)  
**Implementation lane:** `build/android-v1`  
**Related trackers:** Issue #133 (customer/provider PWA), Issue #112 (real Phase 11 pilot evidence/exit)

## 1. Objective

Deliver a real customer/provider browser application that is functionally equivalent to the DIREKT Android product while preserving Android as the primary native Version 1 client and Play release target.

The web/PWA is not a separate product and must not invent a second business logic stack. Android and web must converge on the same:

- NestJS REST/OpenAPI contracts;
- PostgreSQL/PostGIS system of record;
- private object-storage boundary;
- DIREKT identity/session and server-side authorization rules;
- provider scope resolution;
- verification/trust semantics;
- discovery/publication rules;
- enquiry, contact-consent, interaction, review and complaint lifecycles;
- commercial/subscription state;
- privacy and audit rules.

Desktop is a layout adaptation only. Mobile web retains bottom navigation aligned to Android. Desktop uses persistent side navigation with the same destinations and capabilities.

## 2. Non-negotiable architecture

```text
                         DIREKT PRODUCT
                              │
               ┌──────────────┴──────────────┐
               │                             │
        Android Client                Web/PWA Client
       Jetpack Compose              Next.js / React
               │                             │
       bottom navigation             mobile: bottom nav
                                     desktop: side nav
               │                             │
               └──────────────┬──────────────┘
                              │
                     Canonical OpenAPI
                              │
                     DIREKT NestJS API
                              │
              ┌───────────────┼────────────────┐
              │               │                │
         PostgreSQL        PostGIS       Private Storage
              │               │                │
              └───────────────┴────────────────┘
                              │
             Identity / Trust / Enquiries / Reviews
                   / Commercial / Audit
```

### Browser deployment boundary

```text
Browser
   │ HTTPS
   ▼
DIREKT Web/PWA — Next.js
   │
   │ reviewed BFF/session boundary
   ▼
IAM-private DIREKT NestJS API
   │
   ├── PostgreSQL/PostGIS
   └── private Storage grants
```

The IAM-private API must not be made unauthenticated merely to support the browser client.

The browser must never receive privileged Supabase/database credentials, service-role keys or unrestricted private Storage authority.

## 3. Technology decision

Create the real client under:

```text
web/direkt-app/
```

Use:

- Next.js;
- React;
- TypeScript;
- installable PWA manifest and bounded service worker;
- typed canonical REST/OpenAPI client boundary;
- server-side BFF/session routes where authenticated browser access requires protected Cloud Run invocation;
- the existing DIREKT visual language and trust vocabulary.

Do **not**:

- convert Android to Kotlin Multiplatform;
- move Compose UI into shared cross-platform binaries;
- introduce Flutter Web, Vue, Angular or another UI framework for this workstream;
- make the existing private API public;
- connect browser code directly to privileged Supabase/database/Storage surfaces;
- count static fixtures as functional parity when an authoritative backend capability exists.

The current Android project is a single `:app` Compose module. Preserving that stable structure is lower risk than a cross-platform refactor.

## 4. Existing synthetic PWA treatment

`web/direkt-pwa/` is the current synthetic review surface. It remains preserved while the functional app is built.

It must not be silently converted into a live client because current integration-security checks intentionally require that preview surface to remain disconnected from privileged/live APIs.

The controlled cutover occurs only after the real application passes the parity, security and regression gates. Historical preview content is then retained under a clearly labelled archival/preview route.

## 5. Functional parity definition

Parity means:

```text
same product capability
+ same authoritative backend contract
+ same authorization and provider scope
+ same state transitions
+ same trust/privacy semantics
+ same observable business outcome
+ equivalent Android-aligned UX
```

Parity does **not** mean copying Android preview fixtures into JavaScript.

A change made through Android must become observable through web, and a change made through web must become observable through Android, whenever both clients support that capability, because both operate on the same backend state.

## 6. Navigation and responsive contract

### Customer destinations

- Discover
- Saved
- Enquiries
- Account

### Provider destinations

The browser may present provider-friendly labels while preserving the same product capability mapping:

- Overview / workspace
- Evidence / verification readiness
- Enquiries
- Account / profile / commercial

### Viewports

- **Mobile:** Android-aligned bottom navigation.
- **Tablet:** navigation rail or compact side navigation according to available width.
- **Desktop:** persistent side navigation; no bottom navigation.

The content hierarchy, actions, trust semantics and state are shared across viewports. Desktop must not become a separate admin-style product.

## 7. Browser authentication/session contract

Firebase may prove phone possession for the controlled pilot direction, but Firebase claims never become DIREKT authorization.

Target flow:

```text
Firebase Web phone authentication
          ↓
Firebase ID token
          ↓
DIREKT Web BFF
          ↓
POST /api/v1/auth/firebase/exchange
          ↓
DIREKT rotating session
          ↓
HttpOnly + Secure + SameSite browser session boundary
```

DIREKT roles, permissions, provider scope, admission, consent and trust state remain backend-authoritative.

Do not store refresh tokens or long-lived sensitive session material in `localStorage`, `sessionStorage`, IndexedDB or JavaScript-readable cookies.

Authenticated browser activation is separately gated until BFF/session, CSRF, origin, IAM invocation, timeout/retry, logout/revocation and canary evidence pass.

## 8. Implementation sequence

### W0 — Baseline freeze and parity map

Deliver:

- exact source baseline recorded;
- Android protected-path contract;
- current Android screen/navigation inventory;
- canonical OpenAPI capability inventory;
- feature classification: API-backed, implemented-gated, preview-only, external-gated;
- functional parity matrix;
- project-wide architecture, testing and no-regression documentation;
- workstream lock claimed.

Exit:

- no ambiguity about what parity means;
- Android baseline remains unchanged;
- every planned browser capability maps to an authoritative product/API boundary or is explicitly gated.

### W1 — Functional web foundation

Create `web/direkt-app/` with:

- Next.js/React/TypeScript foundation;
- DIREKT design tokens;
- responsive shell;
- mobile bottom navigation;
- tablet adaptive navigation;
- desktop side navigation;
- PWA manifest;
- bounded service worker/offline shell;
- loading, empty, error and offline states;
- BFF boundary scaffolding;
- typed API foundation;
- strict environment validation;
- CSP/security-header baseline;
- unit/static/accessibility-oriented component checks;
- CI that also proves protected Android paths did not regress.

Exit:

- clean web build/test/typecheck;
- no privileged material in browser bundle;
- Android gates remain green;
- no real participant or production activation.

### W2 — Real public discovery vertical slice

Connect through canonical API contracts:

- public categories;
- provider search;
- results;
- provider profile;
- scoped trust claims;
- availability;
- public reviews/share projection where applicable.

Use backend-managed synthetic/test state, not hard-coded UI fixtures, to prove end-to-end connectivity.

Exit:

- backend state changes are observable in the web client;
- public projections expose no private evidence/contact/exact-coordinate data;
- manual/list fallback remains first-class.

### W3 — Authentication and account

Implement:

- Firebase Web phone-possession flow when approved configuration is present;
- BFF Firebase-to-DIREKT exchange;
- secure browser session handling;
- rotation/logout/revocation/expiry;
- notice/consent admission boundary;
- account/profile/session views;
- backend-derived role/provider mode.

Exit:

- no client-selected provider scope;
- CSRF/origin/session replay and expiry tests pass;
- fail-closed behavior when configuration/gates are absent.

### W4 — Customer journey parity

Implement:

- discover/search/filter/area;
- save/unsave where canonical contract supports it;
- provider profile and trust details;
- enquiry creation/history/detail/cancel;
- consent-aware contact handoff/revoke;
- interaction history;
- review eligibility and review submission;
- report/appeal/complaint paths supported by the canonical contract;
- account/security/session UX.

Exit:

- every successful mutation produces durable backend acknowledgement;
- Android/web observe the same authoritative lifecycle state.

### W5 — Provider journey parity

Implement:

- workspace overview/readiness;
- profile/services/operating model/service areas;
- verification/evidence requirements;
- recoverable private evidence upload flow;
- enquiry inbox/detail/transitions;
- contact-handoff state;
- interactions;
- reviews/provider response/appeal;
- account/profile/security;
- commercial/subscription state.

Exit:

- provider scope is actor-resolved server-side;
- private evidence never becomes public/browser-cached;
- retries remain idempotent/recoverable.

### W6 — Commercial parity within authorized boundaries

Implement only currently authorized domain capabilities:

- product catalogue;
- entitlements/subscription status;
- subscription lifecycle actions;
- invoices/payment-intent state where contract-supported;
- cancellation/status/receipts where contract-supported.

Real MTN MoMo/Airtel Money movement remains disabled until separately approved and runtime-proven.

### W7 — Cross-client parity and regression closure

Run:

- Android unit/lint/debug/release-policy checks;
- backend/database/OpenAPI checks;
- web unit/type/build/e2e checks;
- customer/provider cross-client parity matrix;
- authorization and provider-scope negatives;
- responsive viewport suite;
- keyboard/focus/screen-reader/contrast/reduced-motion checks;
- slow network/offline/interrupted upload/retry/expired-session scenarios;
- private-data/cache/security scans;
- browser session/CSRF/origin tests.

Exit:

- all applicable parity rows PASS;
- no Android regression;
- no critical/high unresolved review finding;
- no gated provider is falsely promoted.

### W8 — Controlled cutover

Only after W7:

- preserve current synthetic preview under an explicit historical/preview route;
- promote the functional browser application to the approved canonical app route/domain;
- verify DNS/TLS/runtime health/service-worker/manifest;
- keep production/real-participant gates separate from browser deployment readiness;
- update Issue #133 only when its acceptance evidence is genuinely complete.

## 9. No-regression contract

1. `android/direkt-app/**` is protected during W0/W1 unless a separately reviewed compatibility change is unavoidable.
2. No Android dependency, Gradle wrapper, Compose, Firebase or release/signing upgrade is bundled with PWA work.
3. Shared backend/OpenAPI changes are backward compatible by default: additive endpoint/field/versioned behavior rather than destructive rename/removal.
4. Every shared contract/backend PR runs Android regression gates.
5. Android baseline-before versus result-after must be equivalent for unchanged capabilities.
6. No KMP/shared-UI refactor is permitted by this workstream.
7. Exact-head CI and review findings are resolved before merge.
8. Existing Phase 11/12 legal, participant, payment, signing and production gates remain unchanged.

## 10. Security/privacy invariants

- no direct browser database access;
- no privileged Supabase/service-role credential in client/server bundle source;
- no private evidence URL persisted beyond bounded authorized use;
- no exact private provider coordinate exposed to public discovery;
- no trust claim created by payment, UI flags or client assertions;
- no browser mode toggle grants authorization/provider scope;
- no arbitrary authenticated API response caching in service worker;
- no fake success for offline mutations;
- timeout/retry/idempotency behavior is explicit;
- logs and telemetry minimize personal/contact/location data;
- real participant activation remains gated.

## 11. Definition of done for functional browser parity

The workstream is complete only when all applicable rows in `docs/web/FUNCTIONAL_PARITY_MATRIX.md` pass and:

- customer and provider workflows are backend-functional rather than fixture-only;
- desktop has side navigation and no bottom navigation;
- mobile retains bottom navigation;
- Android and web operate against the same authoritative state/contracts;
- installability/offline shell/accessibility/responsiveness pass;
- authenticated web access preserves the private API/IAM boundary;
- Android regression evidence is green;
- current synthetic preview is preserved until controlled cutover;
- no formal Phase 11/12 gate is overclaimed.

## 12. Reversal conditions

Revert or narrow the workstream if implementation requires:

- making the canonical API public without an approved gateway/BFF decision;
- weakening Android release/security gates;
- direct privileged Supabase access from browser code;
- a cross-platform Android rewrite;
- material trust/privacy/authorization changes not separately approved;
- production/provider activation without required evidence.
