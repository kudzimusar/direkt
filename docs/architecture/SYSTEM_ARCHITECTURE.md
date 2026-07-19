# DIREKT System Architecture

## Context

```text
Native Android customer/provider ─┐
                                 ├─ canonical HTTPS REST/OpenAPI ─> NestJS DIREKT API
Customer/provider PWA ────────────┘                                  │
                                                                     ├─ Supabase PostgreSQL/PostGIS
Privileged operations browser ─> Next.js portal ─ protected path ───┤
                                                                     ├─ private Supabase Storage
                                                                     ├─ transactional outbox/jobs
                                                                     └─ approved external adapters
```

### Current deployment classes

```text
Public static web
  direkt.forum
    → Cloudflare authoritative DNS
    → GitHub Pages
       /      documentation
       /app/  synthetic customer/provider PWA

Protected managed staging
  Google Cloud Run
    direkt-api                       IAM-private
    direkt-operations-portal-staging IAM-private

Managed data
  Supabase project aeeuscifrxcjmnswqwnq
    PostgreSQL/PostGIS + private Storage
```

The public PWA is currently synthetic-only and does not call the protected API. Future live browser mode must preserve the same backend policy boundary through an approved browser authentication/session/gateway design.

## Domain modules

- identity/access;
- customers/providers/representatives;
- taxonomy/categories;
- locations;
- verification/evidence;
- field operations;
- search/discovery;
- enquiries/interactions;
- reviews/complaints/trust and safety;
- subscriptions/payments;
- notifications/outbox;
- audit/compliance;
- analytics/operations.

Modules communicate through explicit application services/domain events, not cross-module table manipulation.

## Client roles

### Native Android

Primary Version 1 customer/provider client. Owns device-specific permission UX, secure local session storage, native evidence capture/background work and Play distribution concerns.

### Customer/provider PWA

Responsive companion client. Shares API/domain semantics with Android but is not a privileged shortcut. Public pre-release mode is synthetic. Live mode requires reviewed browser session, CSRF/CORS/origin, caching and abuse controls.

### Operations portal

Separate privileged Next.js application. Server-side/runtime identity plus DIREKT application authorization are both required. It must never be published as public Pages/PWA content.

## Architectural principles

- API is the policy boundary.
- Database constraints protect invariants.
- Object storage is private by default.
- Public claims derive only from approved/current scoped checks.
- Payment cannot strengthen verification/publication/ranking.
- Clients never receive privileged database/Supabase/provider credentials.
- Asynchronous work is durable/idempotent.
- Third parties sit behind adapters.
- Precise private location is a separate protected data class.
- Logs/telemetry contain minimized references, not sensitive payloads.
- Modular monolith first.
- Deploy environments are isolated and fail closed.
- External provisioning is not runtime activation; see `docs/integrations/CURRENT_INTEGRATION_STATUS.md`.

## Current external systems

### Active managed foundation

- Supabase PostgreSQL/PostGIS/private Storage;
- Google Cloud Run;
- Artifact Registry;
- Secret Manager;
- GitHub Actions + Workload Identity Federation;
- Cloud Logging/Monitoring;
- Firebase App Distribution.

### Implemented/gated or externally provisioned

- Firebase phone authentication/session exchange — implemented, real participant use gated;
- Resend — externally provisioned, application runtime adapter/binding not yet proven;
- Google Maps — externally provisioned, runtime source integration not yet proven at audited baseline;
- Sentry — externally provisioned, runtime SDK integration not yet proven;
- FCM/Crashlytics/WhatsApp/payment/registry automation — planned, disabled or gated according to the integration register.

Every provider integration requires timeout/retry/idempotency/privacy/failure-mode/kill-switch documentation appropriate to its role.

## Security zones

1. Public internet/static Pages/PWA synthetic content.
2. Native/browser client runtime.
3. Authenticated application API boundary.
4. application services/jobs.
5. protected database/storage.
6. privileged operations/evidence access.
7. third-party providers.
8. deployment/secret-management control plane.

Public DNS reachability must never collapse these zones. Evidence viewing and privileged actions require stronger controls than public discovery.

## Scalability and reliability

Pilot scale uses horizontally scalable API containers and PostgreSQL/PostGIS indexes. Dedicated search/cache/queue services are introduced only when measured need justifies them.

Reliability controls include health/readiness probes, graceful dependency degradation, transactional outbox, idempotency, backup/restore, immutable storage versions, rollback/kill switches, structured observability, SLOs and runbooks.
