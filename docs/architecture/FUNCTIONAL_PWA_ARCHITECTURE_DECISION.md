# Architecture Decision — Functional Customer/Provider Web/PWA

**Decision date:** 2026-07-19  
**Status:** Accepted by owner; implementation active  
**Supersedes for live-browser architecture:** the assumption that the customer/provider PWA remains permanently synthetic-only  
**Does not supersede:** Android-first release strategy, private API/IAM boundary, Phase 11/12 release gates

## Context

DIREKT already has a native Android customer/provider application, a canonical NestJS REST/OpenAPI backend, PostgreSQL/PostGIS, private Storage, and an internal Next.js operations portal. The existing public `web/direkt-pwa/` was intentionally built as a synthetic visual review surface and is prevented by CI from calling protected/live APIs.

The owner requires the missing browser/desktop application to provide the same customer/provider product functionality as Android. Desktop should differ mainly in navigation/layout: persistent side navigation instead of a mobile bottom bar.

## Decision

Build a second client for the same DIREKT product under `web/direkt-app/` using Next.js, React and TypeScript.

Android and web share business behavior through the canonical REST/OpenAPI and server-side domain boundaries. They do not share UI binaries.

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

For authenticated browser access, use a reviewed BFF/session boundary rather than making the canonical API public:

```text
Browser → HTTPS → Next.js Web/BFF → authenticated IAM invocation → private NestJS API
```

## Reasons

1. The current Android project is a single stable Compose `:app` module. A Kotlin Multiplatform/Compose Web conversion would introduce unnecessary regression risk.
2. The canonical backend already owns authorization, trust, provider scope and lifecycle rules, so the correct sharing boundary is API/domain, not UI framework.
3. The repository already uses Next.js/React/TypeScript for the operations portal, reducing ecosystem/supply-chain expansion.
4. A BFF preserves the existing private Cloud Run API boundary and enables secure HttpOnly browser sessions.
5. Responsive navigation can preserve the Android information architecture without designing a second desktop product.

## Alternatives rejected

### Kotlin Multiplatform / Compose Multiplatform rewrite

Rejected for this workstream because it requires restructuring Android and increases release/dependency regression risk without improving backend/domain parity.

### Flutter Web or another shared UI framework

Rejected because it would add a second client stack and likely require Android migration/rewrite.

### Connect the existing static `web/direkt-pwa/` directly to the API

Rejected because that surface is explicitly synthetic-only and current security CI intentionally prevents network/API access. It remains preserved until controlled cutover.

### Make Cloud Run API unauthenticated and call it directly from the browser

Rejected because it weakens a proven IAM-private boundary and expands attack surface unnecessarily.

### Direct browser Supabase client

Rejected. Supabase remains managed data/private-storage infrastructure behind DIREKT server authorization. No browser service-role/database authority is permitted.

## Security impact

- positive: preserves private API and server-side authorization;
- positive: no privileged database/Supabase credentials enter browser code;
- positive: secure HttpOnly/SameSite session pattern becomes possible;
- required controls: CSRF, origin/CSP, session rotation/logout/revocation, IAM service identity, private-response cache controls, timeout/retry/idempotency;
- real Firebase participant activation remains separately gated.

## Privacy impact

- exact private provider coordinates remain non-public;
- private evidence remains short-lived/scoped and non-cacheable;
- contact handoff remains explicit-consent/time-limited;
- service worker must never blanket-cache authenticated/private responses;
- telemetry/logging must minimize contact/location/personal data.

## Compatibility impact

Android remains unchanged by default. Shared backend/OpenAPI changes must be backward compatible and run Android regression gates.

## Migration plan

1. preserve `web/direkt-pwa/` synthetic preview;
2. build `web/direkt-app/` additively;
3. connect public discovery first;
4. add secure browser auth/BFF after fail-closed tests;
5. complete customer/provider/commercial parity;
6. pass cross-client parity and Android regression gates;
7. cut over approved browser route while archiving preview.

## Reversal conditions

Reverse or narrow this decision if browser functionality cannot be delivered without weakening IAM/private-data boundaries, requires an Android cross-platform rewrite, or creates unresolvable backward-compatibility regressions.
