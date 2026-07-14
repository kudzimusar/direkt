# DIREKT database foundation

DIREKT uses PostgreSQL with PostGIS as the system of record.

## Current Phase 2B schema

The first migration creates only cross-cutting platform infrastructure:

```text
public.direkt_schema_migrations
platform.audit_events
platform.outbox_events
platform.idempotency_keys
```

It also enables:

```text
postgis
pgcrypto
```

No customer, provider, evidence, verification, enquiry, review, subscription or payment table is introduced in Phase 2B.

## Migration policy

- Files are timestamp-prefixed SQL under `database/migrations/`.
- Migrations are forward-only.
- Each new migration executes in its own transaction.
- An advisory lock prevents concurrent runners.
- SHA-256 checksums are stored when migrations are applied.
- Editing an applied migration causes the runner to fail.
- Migration scripts must be compatible with rolling application deployment.
- Destructive changes require a separate backup, restore and compatibility plan.

## Platform table intent

### `platform.audit_events`

Append-only operational and security evidence. A database trigger rejects update and delete operations. It must not become an unrestricted analytics dump.

### `platform.outbox_events`

Durable handoff for approved asynchronous work. Domain transactions will append events; workers publish them with retries, backoff and failure escalation in later phases.

### `platform.idempotency_keys`

Stores hashes and request fingerprints for mutation replay protection. Raw idempotency keys must never be persisted.

## Local service

The backend Docker Compose configuration uses the PostGIS project's recommended new-user image:

```text
postgis/postgis:18-3.6
```

PostgreSQL 18 uses `/var/lib/postgresql` as the container volume path.

## Data restrictions

The public repository and CI database use synthetic data only. Do not add:

- real identities or phone numbers;
- real provider documents or licence numbers;
- exact private coordinates;
- production connection strings;
- production database dumps;
- real complaints, allegations or audit records.
