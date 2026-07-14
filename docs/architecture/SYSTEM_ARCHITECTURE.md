# DIREKT System Architecture

## Context

```text
Android customer/provider app
        |
     HTTPS REST
        |
API gateway / NestJS modular monolith
        |
PostgreSQL + PostGIS | Private object storage | Job queue/cache
        |
Admin operations portal | Notification/payment/map/identity adapters
```

GitHub Pages is separate and hosts static documentation/prototypes only.

## Domain modules

- identity/access;
- customers;
- providers;
- taxonomy;
- locations;
- verification/evidence;
- field operations;
- search/discovery;
- enquiries/interactions;
- reviews;
- complaints/trust and safety;
- subscriptions/payments;
- notifications;
- audit/compliance;
- analytics/operations.

Modules communicate through explicit application services and domain events, not cross-module table manipulation.

## Architectural principles

- API is the policy boundary;
- database constraints protect invariants;
- object storage is private by default;
- public claims are derived from approved current checks;
- asynchronous work is durable and idempotent;
- third parties sit behind adapters;
- precise private location is a separate data class;
- logs contain references, not sensitive payloads;
- modular monolith first;
- deploy environments are isolated.

## External systems

Candidates, not final commitments:

- managed PostgreSQL/storage;
- map/geocoding SDK/API;
- FCM;
- SMS/OTP;
- mobile-money/payment;
- email;
- error monitoring;
- issuing-body/registry lookups where authorized.

Every integration requires timeout, retry, idempotency, privacy and failure-mode documentation.

## Security zones

1. Public internet/Pages.
2. Android and browser clients.
3. Public API ingress.
4. application services/jobs.
5. data/storage.
6. privileged operations evidence access.
7. third-party integrations.

Evidence viewing and privileged actions require stronger controls than public discovery.

## Scalability

Pilot scale uses horizontal API processes and database indexes. Search remains PostGIS/PostgreSQL until measured requirements justify a dedicated engine. Storage objects use immutable versions. Jobs use queue/backoff and dead-letter handling.

## Reliability

- health/readiness probes;
- graceful dependency degradation;
- transactional outbox for critical events;
- idempotency keys;
- backup/restore;
- structured observability;
- runbooks and SLOs.
