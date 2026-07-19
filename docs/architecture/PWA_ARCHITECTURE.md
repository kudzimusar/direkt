# DIREKT Customer/Provider PWA Architecture

**Status:** Owner-authorized remote-test companion client  
**Date:** 2026-07-19  
**Governing issue:** #133

## Decision

DIREKT remains **Android-first**, but Version 1 now includes a responsive installable **customer/provider Progressive Web App (PWA)** so the owner and approved reviewers can inspect the product remotely on desktop, tablet and mobile while native Android continues toward release.

The PWA is a client, not a new backend or trust authority.

```text
Native Android ─┐
                ├── canonical REST/OpenAPI ──> DIREKT NestJS API ──> PostgreSQL/PostGIS + private Storage
Customer PWA ───┘

Operations browser ──> protected Next.js operations portal ──> same DIREKT API
```

## Why this change is allowed

The original plan made Android the only Version 1 customer/provider UI to control scope. The owner explicitly authorized a browser companion because Phase 5–9 domain/backend work already exists, remote-only development makes visual validation essential, and the canonical API/domain boundary allows another client without creating a second backend.

## Non-negotiable boundaries

The PWA must never:

- connect directly to PostgreSQL;
- receive a Supabase service/secret key;
- query private Storage with broad credentials;
- infer authorization from hidden UI;
- create/strengthen verification, publication or ranking client-side;
- expose exact private provider coordinates;
- publish evidence bytes in public cache;
- persist privileged refresh/session secrets in `localStorage`;
- enable real participant traffic merely because the UI is public;
- claim synthetic data is a live Zambia pilot.

The backend remains authoritative for identity, session, permission, provider scope, verification, publication, interactions, review eligibility, commercial state and audit.

## Deployment modes

### Public synthetic review — authorized now

Canonical path:

```text
https://direkt.forum/app/
```

- static PWA assets through the public Pages path;
- Cloudflare authoritative DNS for `direkt.forum`;
- fictional/synthetic data only;
- no real login/API token or protected write;
- installable manifest/offline shell;
- explicit synthetic-review banner;
- `noindex` during pre-release review.

This mode is safe for visual/product testing and does not require making Cloud Run public.

### Protected live test — future gate

Live API-backed browser mode requires approved browser authentication/session design, same-origin or reviewed gateway/BFF pattern, secure cookie/session handling where used, CSRF controls for cookie-authenticated writes, strict origin/CORS controls, a Cloud Run/API access path that does not weaken IAM, rate/abuse controls, authorization/privacy regressions and explicit test-data classification.

### Production PWA — formal release gate

Production browser access is separate from the public synthetic PWA and requires Phase 11 exit evidence, legal/privacy approval, production backend authorization, monitoring/support/rollback and browser threat-model approval.

## Product parity strategy

### Customer

- Discover / area / categories;
- provider results and public-safe profile;
- check-specific trust details;
- saves;
- tracked enquiries;
- contact-consent explanation;
- review/complaint states when contract-ready;
- account/privacy/help.

### Provider

- overview/readiness;
- profile/service areas;
- evidence task/status representation;
- verification timeline;
- availability;
- enquiry inbox/response states;
- review response;
- subscription/receipt state;
- account/security.

Native Android remains preferred for device-specific evidence capture/permissions/background behavior. Public synthetic PWA never uploads private evidence.

## Design alignment

Default palette follows the native Android semantic baseline:

- primary green `#087A55`;
- deep green `#00513A`;
- mint `#D9F5E9`;
- ink `#16211C`;
- surface `#F8FAF9` / white;
- amber `#F2A900`.

Desktop uses persistent sidebar/wide workspace; tablet adapts columns; mobile uses bottom navigation aligned with Android information architecture. Status always includes text/icon, not color alone.

## Offline model

Initial public PWA caches public static assets only. It may preserve theme/mode preference but no auth, contact, private evidence or participant data. No offline write is represented as successful.

Future live mode requires explicit caching/data-classification rules; authenticated/private responses default to no-store unless a reviewed protected strategy exists.

## Security and testing

Public synthetic PWA requires JavaScript/manifest/static validation, responsive review, keyboard/focus/reduced-motion checks, offline-shell reload, no credential/private URL leakage and strict Pages build.

Before live API mode add API contract, authentication/session, CSRF/CORS, authorization-negative, evidence/location non-leakage, retry/idempotency, accessibility browser E2E, rate/abuse and performance testing.

Cloudflare Turnstile is not currently active and must not be represented as protecting the PWA until its external permission/setup issue and source verification are resolved.

## Reversal condition

The PWA may be reduced back to synthetic review if it creates unacceptable security or maintenance cost. Backend/domain architecture must not need a rewrite because Android and PWA share canonical API contracts.
