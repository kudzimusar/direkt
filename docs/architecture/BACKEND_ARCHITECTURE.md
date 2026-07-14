# DIREKT Backend Architecture

## Implemented foundation

DIREKT uses a TypeScript/NestJS modular monolith with REST/OpenAPI. The Phase 2B workspace is:

```text
backend/direkt-api/
```

Current runtime baseline:

| Component | Version line |
|---|---:|
| Node.js | 24 Active LTS |
| npm | 11 with committed lockfile |
| NestJS | 11.1.x |
| TypeScript | 5.9.x strict mode |
| PostgreSQL | 18 |
| PostGIS | 3.6 |

The current API exposes only platform health and documentation surfaces. No provider, evidence, verification, payment or account mutation endpoint exists yet.

## Current module structure

```text
AppModule
├── ConfigModule
├── DatabaseModule
└── HealthModule
```

Platform HTTP boundaries provide:

- request/correlation IDs;
- structured request-completion logs;
- global input validation;
- RFC 7807-compatible problem details;
- explicit CORS allowlisting;
- versioned API prefix `/api/v1`;
- generated OpenAPI and Swagger documentation.

The readiness endpoint queries PostgreSQL and `PostGIS_Version()`. Liveness does not depend on the database.

## Module contract

Each future domain module owns:

- controllers and transport validation;
- application use cases;
- domain models and policies;
- persistence adapters;
- events and jobs;
- authorization checks;
- tests.

No controller performs direct database queries. No module reads another module's tables except through an approved service, event or read model.

The Phase 2B `DatabaseService` is a platform connection boundary. It does not grant domain modules permission to bypass repositories or use cases.

## Persistence

PostgreSQL/PostGIS is the system of record. Critical rules use constraints, transactions and explicit state machines.

The first platform schema contains only:

```text
public.direkt_schema_migrations
platform.audit_events
platform.outbox_events
platform.idempotency_keys
```

Domain schemas are introduced only with their owning module and migration.

## API conventions

- root: `/api/v1`;
- JSON request and response bodies;
- RFC 7807-compatible `application/problem+json` errors;
- opaque UUID identifiers;
- caller-supplied UUID request IDs accepted only when valid;
- generated request IDs returned through `x-request-id`;
- cursor pagination for changing collections;
- hashed idempotency keys for approved retried mutations;
- ETags or explicit versions for concurrency-sensitive edits;
- OpenAPI generated and validated in CI.

## Configuration and CORS

Configuration is schema-validated at startup. Development may use the documented local PostGIS URL. Production must provide explicit configuration through the deployment environment.

CORS is disabled when no origins are configured. It is never opened with a wildcard while credentials or sensitive operations are present.

## Async processing

The transactional outbox foundation is implemented, but no publisher worker is active yet. Later approved uses include:

- notifications;
- evidence scanning and processing;
- expiry and renewal;
- search/read-model refresh;
- webhooks;
- reconciliation.

Workers require retry class, exponential backoff, maximum attempts, idempotent handling and failure escalation.

## Audit model

`platform.audit_events` is append-only. A database trigger rejects update and delete operations. Audit events are operational/security records, not unrestricted analytics.

Audit metadata must be minimized and must not contain raw credentials, document bytes or unnecessary personal data.

## Security boundaries

Phase 2B deliberately excludes:

- authentication and token issuance;
- production Supabase or database connections;
- provider or customer records;
- evidence and private-location storage;
- regulator, map, SMS, Firebase and payment integrations;
- public trust-claim creation.

Later phases must add role plus provider/object scope, signed evidence access, rate limits, session controls and privileged-action audits before exposing protected operations.

## Testing and CI

The permanent backend workflow uses PostgreSQL 18/PostGIS 3.6 and the committed npm lockfile. It runs:

```text
npm ci --ignore-scripts
npm run format:check
npm run lint
npm run typecheck
npm run migration:check
npm run test
npm run build
npm run openapi:check
```

CI retains coverage, OpenAPI and the exact lockfile. Migration tests prove PostGIS availability, SRID 4326 coordinate order, idempotent migration execution and append-only audit enforcement.

## Deployment

The API is designed as a stateless container-ready process. Workers are separate processes when introduced. Each environment has separate database and storage resources.

Migrations run as an explicit release step under an advisory lock. Application instances do not silently alter the schema during startup.
