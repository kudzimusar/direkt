# DIREKT API foundation

This directory contains the DIREKT NestJS modular-backend foundation.

## Phase 2B scope

Implemented:

- versioned REST API root at `/api/v1`;
- liveness and database/PostGIS readiness endpoints;
- validated configuration;
- request IDs and structured completion logs;
- global request validation;
- RFC 7807-compatible problem details;
- generated OpenAPI;
- PostgreSQL/PostGIS connection boundary;
- checksummed, forward-only migration runner;
- platform audit, outbox and idempotency foundations;
- synthetic seed command;
- unit, HTTP and database integration tests.

Not implemented:

- accounts or authentication;
- provider creation;
- evidence upload or verification decisions;
- public trust claims;
- Firebase, maps, SMS, regulators or payments;
- production deployment or production credentials.

## Runtime

| Component | Version line |
|---|---:|
| Node.js | 24 Active LTS |
| npm | 11 |
| NestJS | 11.1.x |
| TypeScript | 5.9.x |
| PostgreSQL | 18 |
| PostGIS | 3.6 |

Use Node 24. The repository records `npm@11.16.0` as the package-manager baseline and commits an npm lockfile version 3.

## Local database

```bash
docker compose up -d database
```

The local-only development connection is:

```text
postgresql://direkt:direkt_dev@localhost:5432/direkt
```

It is not a production credential and must not be reused outside local development.

## Install and verify

Use the committed dependency graph:

```bash
npm ci --ignore-scripts
```

Do not regenerate or update the lockfile as part of ordinary installation. A dependency change must deliberately update both `package.json` and `package-lock.json`, then pass the complete CI gate.

Run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run migration:check
npm run test
npm run build
npm run openapi:check
```

## Run locally

```bash
cp .env.example .env
npm run migration:up
npm run seed:synthetic
npm run start:dev
```

Endpoints:

```text
GET http://localhost:3000/api/v1/health/live
GET http://localhost:3000/api/v1/health/ready
GET http://localhost:3000/api/docs
GET http://localhost:3000/api/docs-json
```

## Migrations

Migration files are stored in the repository root:

```text
database/migrations/
```

Rules:

- timestamped and forward-only;
- one transaction per migration;
- checksums recorded in `public.direkt_schema_migrations`;
- previously applied files must never be edited;
- an advisory lock prevents concurrent runners;
- destructive changes require a separate backup/compatibility plan.

## Security rules

Never commit:

- `.env` files;
- production database URLs;
- service accounts, signing keys or tokens;
- real provider/customer records;
- identity documents, qualifications or private coordinates;
- raw idempotency keys;
- unreviewed production CORS origins.

The default API has no domain mutation endpoints. Health and documentation endpoints do not imply that provider verification is operational.
