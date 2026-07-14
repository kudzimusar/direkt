# DIREKT Phase 2B Backend and Data Foundation

## Objective

Phase 2B establishes a reproducible NestJS/PostgreSQL/PostGIS platform without prematurely implementing accounts, providers, evidence, verification, payments or production integrations.

## Implemented runtime

| Component | Pinned baseline |
|---|---:|
| Node.js | 24 Active LTS |
| npm | 11 with lockfile version 3 |
| NestJS | 11.1.x |
| TypeScript | 5.9.x strict mode |
| PostgreSQL | 18 |
| PostGIS | 3.6 |

The committed npm lockfile is installed with `npm ci --ignore-scripts` in CI. Dependency resolution is no longer generated during normal verification.

## Implemented API boundaries

- versioned API root `/api/v1`;
- liveness endpoint `/api/v1/health/live`;
- PostgreSQL/PostGIS readiness endpoint `/api/v1/health/ready`;
- schema-validated environment configuration;
- explicit CORS origin allowlist;
- UUID request/correlation IDs;
- structured JSON request-completion logs;
- global class-validator input validation;
- RFC 7807-compatible problem details;
- deterministic OpenAPI generation and validation;
- Swagger documentation under `/api/docs`.

Only health and documentation operations are public in this phase.

## Implemented database boundaries

- `postgis` and `pgcrypto` extensions;
- checksummed migration ledger;
- PostgreSQL advisory migration lock;
- one transaction per migration;
- rejection of modified applied migrations;
- append-only platform audit events;
- transactional outbox foundation;
- hashed idempotency-key foundation;
- synthetic local seed command.

## Test evidence

The permanent CI workflow starts `postgis/postgis:18-3.6` and verifies:

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

The suite covers:

- health service success and safe failure;
- generated and caller-supplied request IDs;
- problem-details responses;
- real migration application and idempotency;
- PostGIS availability;
- Lusaka coordinate order and SRID 4326;
- append-only audit enforcement;
- absence of prohibited provider/verification/payment paths in OpenAPI.

Coverage thresholds apply to reusable application and migration logic. Command-line wrappers and empty Nest module declarations are exercised directly by CI rather than treated as unit-coverage targets.

## Security and privacy review

Phase 2B introduces no:

- authentication or token issuance;
- production database/Supabase connection;
- real customer or provider record;
- identity, qualification or location evidence;
- production object storage;
- regulator, map, SMS, Firebase or payment integration;
- trust-claim mutation;
- production deployment.

The repository contains a local-only development password and a CI-only password in documented environment definitions. Neither is valid for external or production infrastructure.

## Accepted limitations

- No rate limiter is active because no account or mutation route exists yet.
- No authentication/session policy is implemented yet.
- The outbox table has no publisher worker yet.
- Idempotency storage has no HTTP interceptor yet.
- OpenAPI models are minimal because the only operations are health checks.
- No staging deployment is authorized.

These limitations are bounded inputs to Phase 2C rather than hidden omissions.

## Exit gate

Phase 2B is complete only when:

- the final exact PR head has a green permanent backend CI run;
- coverage and OpenAPI artifacts are retained;
- the committed lockfile is verified through `npm ci`;
- documentation checks pass;
- no unresolved review thread exists;
- the checkpoint is merged automatically;
- the implementation branch is synchronized without force-pushing;
- Issue #12 records exact evidence and closes;
- Phase 2C receives a precise authentication and operations-admin foundation scope.
