# DIREKT Database Design

## Principles

- PostgreSQL/PostGIS;
- UUID/opaque public identifiers;
- UTC timestamps;
- soft deletion only where history is legally/operationally needed;
- immutable/auditable trust decisions;
- explicit status enums/check constraints;
- provider scope on every related entity;
- no evidence bytes in relational tables;
- public/private location separated;
- money in minor units and currency.

## Core table groups

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

### Platform
`notifications`, `delivery_attempts`, `outbox_events`, `job_failures`, `audit_events`, `analytics_events`.

## Critical constraints

- one active approved outcome per check/version rules;
- public claim references current approved check;
- evidence version immutable after submission;
- reviewer cannot approve own provider/evidence;
- provider member scope;
- review references eligible interaction;
- ledger entries balanced/immutable;
- service-area geometry valid;
- public location cannot accidentally reference private evidence record;
- expiry date not before effective date.

## Geospatial indexes

- GiST indexes for public points and service geometries;
- normalized place hierarchy;
- query bounding box before exact distance;
- store geography/geometry deliberately;
- test coordinate order and SRID.

## Migration policy

- timestamped, forward-only;
- transactional where possible;
- data backfill separate for large operations;
- down migrations not relied on for production rollback;
- schema and application compatibility during deployment;
- migration tests on representative data;
- destructive changes require backup/restore plan.
