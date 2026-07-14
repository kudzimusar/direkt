# DIREKT Backend Functional Specification

## Responsibilities

The backend is the authoritative policy and orchestration layer for identity, provider data, verification, discovery, enquiries, reputation, complaints, subscriptions, notifications, audit and operations.

## Domain services

### Identity/access
Accounts, contacts, sessions, consent, role/provider relationships, recovery and privileged authentication.

### Provider
Provider lifecycle, members, services, operating model, publication and profile versions.

### Verification
Requirement resolution, cases, evidence versions, assignment, decision, expiry, claims and rechecks.

### Discovery
Category normalization, area compatibility, geospatial filtering, ranking and public-safe projection.

### Marketplace
Enquiries, contact consent, interaction state, review eligibility and saves.

### Trust/safety
Reports, complaints, restrictions, enforcement, appeals and fraud flags.

### Commercial
Plans, entitlements, subscriptions, payment adapter, ledger, receipts and reconciliation.

### Platform
Notification policies, jobs/outbox, audit, analytics, configuration and health.

## Cross-cutting rules

- every request has correlation ID;
- authentication and object authorization;
- input validation;
- safe problem details;
- UTC;
- idempotent retried writes;
- structured audit for privileged actions;
- public response DTOs exclude private fields by construction;
- consistent transaction boundaries;
- no direct trust-state mutation outside verification service.

## Publication projection

Public provider data is assembled from:

- approved provider-authored profile fields;
- public-safe location;
- current derived claims;
- allowed review aggregates;
- availability;
- commercial/sponsorship label;
- enforcement/publication policy.

It never serializes persistence entities directly.
