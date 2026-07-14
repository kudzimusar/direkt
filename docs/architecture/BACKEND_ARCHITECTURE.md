# DIREKT Backend Architecture

## Framework

TypeScript and NestJS modular monolith with REST/OpenAPI.

## Module contract

Each domain module owns:

- controllers/transport validation;
- application use cases;
- domain models/policies;
- persistence adapters;
- events/jobs;
- authorization checks;
- tests.

No controller performs direct database queries. No module reads another module’s tables except through approved read models or services.

## Persistence

PostgreSQL/PostGIS, forward migrations and repository/query layer. Critical states use constraints and transactions.

## API

- `/api/v1`;
- JSON;
- RFC 7807-style problem details;
- opaque public IDs;
- cursor pagination where data changes frequently;
- idempotency keys for retried mutations;
- ETags/version fields for concurrency-sensitive profile edits;
- OpenAPI generated and validated.

## Async processing

Use durable queue/outbox for:

- notifications;
- evidence scanning/processing;
- expiry;
- search/read-model refresh;
- webhooks;
- analytics;
- reconciliation.

Jobs have retry class, backoff, max attempts and dead-letter escalation.

## Security

- access token and secure refresh/session approach selected during implementation;
- role plus object/provider scope;
- evidence signed access;
- input/file validation;
- rate limits;
- audit;
- secret manager;
- restricted admin network/session controls where practical.

## Deployment

Container-ready stateless API and worker processes. Separate database/storage per environment. Migrations run as an explicit release step, not automatically from every app instance.
