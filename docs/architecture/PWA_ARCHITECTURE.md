# DIREKT Customer/Provider PWA Architecture

**Status:** Owner-authorized remote-test companion client  
**Date:** 2026-07-19  
**Governing issue:** #133

## 1. Decision

DIREKT remains **Android-first**, but Version 1 now includes a responsive installable **customer/provider Progressive Web App (PWA)** so the owner and approved reviewers can inspect the product remotely on desktop, tablet and mobile while native Android continues toward release.

The PWA is a client, not a new backend or trust authority.

```text
Native Android ─┐
                ├── canonical REST/OpenAPI ──> DIREKT NestJS API ──> PostgreSQL/PostGIS + private Storage
Customer PWA ───┘

Operations browser ──> protected Next.js operations portal ──> same DIREKT API
```

## 2. Why this change is allowed

The original plan made Android the only Version 1 customer/provider UI to control scope. The owner has now explicitly authorized a desktop/browser companion because:

- Phase 5–9 domain/backend work already exists;
- remote-only development makes owner-facing visual validation essential;
- a PWA provides immediate desktop/tablet/mobile inspection without replacing Android;
- the canonical API/domain boundaries prevent the web client from becoming a second backend;
- synthetic public review can proceed without weakening Phase 11 real-participant or Phase 12 production gates.

## 3. Non-negotiable boundaries

The PWA must never:

- connect directly to PostgreSQL;
- receive a Supabase service/secret key;
- query private Storage with broad credentials;
- infer authorization from hidden UI;
- create or strengthen verification/publication/ranking state client-side;
- expose exact private provider coordinates;
- publish evidence bytes in public cache;
- persist backend refresh/session tokens in `localStorage`;
- enable real participant traffic merely because the public UI is reachable;
- claim synthetic data is a live Zambia pilot.

The backend remains authoritative for identity, session, permission, provider scope, verification, publication, interactions, review eligibility, commercial state and audit.

## 4. Deployment modes

### 4.1 Public synthetic review — authorized now

Canonical path:

```text
https://direkt.forum/app/
```

Characteristics:

- static PWA assets through the existing GitHub Pages publication path;
- Cloudflare provides authoritative DNS for `direkt.forum`;
- fictional/synthetic data only;
- no real login or API token;
- no POST/PUT/PATCH/DELETE to DIREKT services;
- installable manifest and offline shell;
- explicit synthetic-review banner;
- `noindex` during pre-release review.

This mode is safe for product-owner visual testing and does not require making Cloud Run public.

### 4.2 Protected managed/live test — future gate

A live API-backed browser mode requires all of the following before activation:

- approved browser authentication/session design;
- same-origin or reviewed backend-for-frontend/gateway pattern;
- HttpOnly/Secure/SameSite session handling where cookies are used;
- CSRF protections for cookie-authenticated writes;
- strict CORS/origin allowlist;
- Cloud Run/API access path that does not weaken IAM/private service controls;
- rate limiting and bot/abuse controls;
- PWA-specific authorization and privacy regressions;
- explicit test-data environment classification;
- no service/database credential in browser code.

### 4.3 Production PWA — formal release gate

Production browser access is separate from the public synthetic PWA. It requires Phase 11 evidence, legal/privacy approval, production backend authorization, release monitoring/support/rollback, and a browser threat-model review.

## 5. Product parity strategy

The PWA mirrors **product capabilities**, not Android implementation details.

### Customer

- Discover / area selection / categories;
- provider results and public-safe profile;
- check-specific trust details;
- saves;
- tracked enquiries;
- time-limited contact-consent explanation;
- review/complaint states when contract-ready;
- account/privacy/help.

### Provider

- overview/readiness;
- provider profile/service areas;
- private evidence task/status representation;
- verification timeline;
- availability;
- enquiry inbox/response states;
- review response;
- subscription/receipt state;
- account/security.

### Deliberate differences

- Native Android remains the preferred evidence-capture/device-permission path.
- The public synthetic PWA never uploads private evidence.
- Browser installability/offline shell does not imply offline authorization or offline trust upgrades.
- Maps always retain list/manual-area alternatives.

## 6. Design alignment

The PWA uses the native Android semantic palette as its default visual baseline:

- primary green `#087A55`;
- deep green `#00513A`;
- mint container `#D9F5E9`;
- ink `#16211C`;
- surface `#F8FAF9` / white;
- amber attention `#F2A900`;
- Material-like status semantics and minimum accessible targets.

Responsive behavior:

- desktop: persistent sidebar + wide workspace;
- tablet: compact header + adaptive content columns;
- mobile: bottom navigation consistent with Android information architecture.

The PWA must preserve status text/icons so colour is never the only signal.

## 7. Offline model

Initial synthetic PWA:

- service worker caches only public static assets;
- previously loaded synthetic UI remains available offline;
- no background sync of real user actions;
- no private evidence or contact data in Cache Storage.

Future live PWA:

- public-safe reads may be cached only under an explicit data-classification policy;
- authenticated/private responses default to `no-store` unless a reviewed encrypted/local strategy exists;
- writes require server acknowledgement before success;
- trust status is never upgraded offline.

## 8. Security headers and browser controls

Public synthetic deployment should use or inherit:

- restrictive Content Security Policy where supported by the hosting path;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: no-referrer` or stricter approved policy;
- `Permissions-Policy` minimizing camera/location/microphone until required;
- no third-party analytics/telemetry without approval;
- no inline secrets or private endpoints.

Cloudflare Turnstile is not currently active and must not be represented as protecting the PWA until its 403 provisioning issue, keys and source integration are resolved.

## 9. API client rule

When live API mode is introduced, TypeScript client code must be generated or contract-checked from the canonical OpenAPI document. The PWA may add presentation adapters, caching and view models, but may not duplicate domain state machines.

## 10. Testing gates

Public synthetic PWA must pass:

- manifest/service-worker/static-asset validation;
- desktop/tablet/mobile responsive review;
- keyboard navigation;
- focus visibility and dialog focus handling;
- reduced-motion handling;
- light/dark contrast review;
- offline shell reload;
- no real API/secret/private URL references;
- documentation/site build.

Before live API mode:

- API contract tests;
- authentication/session/CSRF/CORS tests;
- authorization negative tests;
- private evidence/location non-leakage;
- retry/idempotency/offline write tests;
- accessibility browser E2E;
- performance budgets on representative low-bandwidth profiles.

## 11. Reversal conditions

The PWA may be reduced back to synthetic review only if it creates unacceptable security, operational or maintenance cost. Removing the PWA must not require backend/domain rewrites because Android remains on the same canonical API contracts.
