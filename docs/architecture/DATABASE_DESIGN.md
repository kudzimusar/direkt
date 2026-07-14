# DIREKT Database Design

## Current foundation

DIREKT uses PostgreSQL 18 with PostGIS 3.6 as the system of record. The Phase 2B migration is stored under:

```text
database/migrations/
```

The current implemented schema is intentionally limited to cross-cutting platform infrastructure:

```text
public.direkt_schema_migrations
platform.audit_events
platform.outbox_events
platform.idempotency_keys
```

Enabled extensions:

```text
postgis
pgcrypto
```

No customer, provider, evidence, verification, enquiry, review, subscription or payment table exists yet.

## Design principles

- PostgreSQL/PostGIS;
- UUID/opaque identifiers;
- UTC `timestamptz` timestamps;
- database constraints for critical invariants;
- immutable/auditable security and trust decisions;
- explicit states and check constraints;
- provider scope on every future provider-owned entity;
- no evidence bytes in relational tables;
- public and private location models remain separate;
- money stored in minor units plus ISO currency;
- raw secrets and raw idempotency keys are never persisted.

## Implemented migration control

The migration runner:

1. obtains a PostgreSQL advisory lock;
2. creates the migration ledger when absent;
3. reads timestamped SQL files in lexical order;
4. calculates a SHA-256 checksum for each file;
5. rejects modification of an already-applied migration;
6. executes each new migration in its own transaction;
7. records version, checksum and application time;
8. releases the advisory lock;
9. supports an idempotent second run with no changes.

Production rollback does not depend on down migrations. A faulty release is corrected through a new forward migration plus application rollback where compatible.

## Platform tables

### `public.direkt_schema_migrations`

Stores the exact filename and SHA-256 checksum of each applied migration. It is migration infrastructure, not an application-domain table.

### `platform.audit_events`

Append-only operational and security records. The database rejects update and delete operations through a trigger.

Key fields include:

- occurrence time;
- request ID;
- actor type and optional opaque actor ID;
- optional provider scope;
- action, resource type and optional resource ID;
- success/denied/failed outcome;
- minimized JSON metadata.

Audit metadata must not contain passwords, tokens, document bytes or unnecessary personal data.

### `platform.outbox_events`

Durable transactional handoff for later asynchronous workers.

It records:

- event and aggregate identity;
- JSON payload and headers;
- available time;
- pending/processing/published/failed state;
- attempts, lock details and last error;
- publication timestamp with state consistency constraints.

No worker is enabled in Phase 2B.

### `platform.idempotency_keys`

Replay-protection foundation for future approved mutations.

Only a SHA-256 key hash and request fingerprint are stored. The table includes expiry, optional response metadata and a unique `(scope, key_hash)` constraint.

## Planned table groups

These are planned contracts, not currently deployed tables.

### Identity

`users`, `user_contacts`, `sessions`, `roles`, `role_assignments`, `consents`, `policy_versions`.

### Providers

`providers`, `provider_members`, `provider_profiles`, `provider_services`, `provider_hours`, `provider_portfolio`, `publication_states`.

### Taxonomy

`service_categories`, `services`, `category_synonyms`, `category_requirement_versions`.

### Location

`places`, `provider_service_areas`, `provider_public_locations`, `provider_private_locations`, `location_verification_checks`.

### Verification

`verification_cases`, `verification_checks`, `evidence_items`, `evidence_versions`, `review_assignments`, `verification_decisions`, `field_visits`, `field_visit_answers`, `public_claims`, `fraud_flags`.

### Marketplace

`enquiries`, `enquiry_events`, `contact_shares`, `interactions`, `saved_providers`, `reviews`, `review_reports`, `complaints`, `enforcement_actions`, `appeals`.

### Commercial

`plans`, `plan_versions`, `subscriptions`, `payment_attempts`, `payment_events`, `ledger_entries`, `invoices`, `receipts`, `reconciliation_items`.

## Future critical constraints

- one active approved outcome per check/version rules;
- every public claim references a current approved check;
- evidence versions become immutable after submission;
- reviewer cannot approve their own provider/evidence;
- provider-member object scope;
- reviews require an eligible tracked interaction;
- financial ledgers are balanced and immutable;
- service-area geometries are valid;
- public location cannot expose a private-location evidence record;
- expiry cannot precede effective date.

## Geospatial rules

- longitude precedes latitude when constructing points;
- public WGS84 coordinates use SRID 4326;
- GiST indexes support public points and service geometries when introduced;
- queries use a bounding region before exact distance where beneficial;
- geography versus geometry is selected explicitly;
- exact private coordinates are never copied into public search tables.

The Phase 2B integration test constructs a Lusaka point as `POINT(28.3228 -15.3875)` with SRID 4326 to protect coordinate order.

## Testing

CI starts a clean `postgis/postgis:18-3.6` database and proves:

- extensions can be enabled;
- all migrations apply;
- a second run is idempotent;
- required platform tables exist;
- PostGIS reports version 3.6;
- SRID and coordinate order are correct;
- append-only audit mutation is rejected.

## Migration policy

- timestamped and forward-only;
- transactional where possible;
- large data backfills separated from schema changes;
- schema/application compatibility maintained during rollout;
- destructive changes require a tested backup/restore plan;
- applied migration files are never edited;
- production credentials and dumps never enter the public repository.
