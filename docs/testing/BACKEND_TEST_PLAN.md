# DIREKT Backend Test Plan

## Unit

Domain state machines, publication policy, entitlement separation, expiry, reason mapping, ranking inputs, consent and retention rules.

## Integration

Real PostgreSQL/PostGIS and storage emulator/test service:

- migrations;
- constraints;
- transactions;
- geospatial boundaries;
- private file authorization;
- outbox/jobs;
- webhook idempotency;
- audit events.

## API

OpenAPI contract, validation, authentication, role/object authorization, pagination, concurrency, idempotency and safe errors.

## Negative

Wrong provider, revoked membership, stale version, duplicate webhook, expired signed URL, invalid transition, forged public-claim request, malicious file and rate limit.

## Data integrity

Every public claim references current approval; review references eligible interaction; payment cannot update verification; location projection excludes private fields.

## Performance

Representative search, queue and upload finalization with explainable thresholds.
