# Phase 3 Provider and Category Core

## Purpose

Phase 3 creates DIREKT's first bounded business-domain vertical slice on top of the Phase 2C identity, session and deny-by-default authorization foundation. It models customers, non-public provider drafts, provider-scoped representatives, operating models and versioned service-category requirements without creating public listings or evidence-derived trust claims.

## Implemented domain boundaries

- Human identities remain in the `account` schema.
- Provider organizations are separate aggregates in the `provider` schema.
- A provider chooses exactly one pathway: registered business, qualified individual or experienced informal provider.
- A provider chooses a fixed-premises, mobile or hybrid operating model.
- Fixed and hybrid profiles require a public-safe locality summary; precise private coordinates are not part of Phase 3.
- Customer profiles are owned by authenticated identities.
- Provider representatives are server-owned provider-scoped role assignments.
- Active category requirement versions are immutable and remain attached to historical provider selections.
- Provider lifecycle states are limited to draft, ready for verification, suspended and archived.

## Publication stop gate

Every provider organization carries `discoverable = false`, protected by a database constraint. The `provider.public_directory` view is an explicit future publication boundary and must remain empty throughout Phase 3.

The following events cannot publish a provider:

1. account creation;
2. provider draft creation;
3. profile completion;
4. category selection;
5. representative assignment;
6. commercial status;
7. an administrator role;
8. a direct client request.

Phase 4 must introduce evidence cases, approved claim derivation and an explicit publication policy before discoverability can exist.

## API surface

Authenticated Phase 3 operations include:

- `PUT /api/v1/account/profile`
- `POST /api/v1/providers`
- `GET /api/v1/providers/{providerId}`
- `PATCH /api/v1/providers/{providerId}/profile`
- `POST /api/v1/providers/{providerId}/state-transitions`
- `POST /api/v1/providers/{providerId}/representatives`
- `PUT /api/v1/providers/{providerId}/categories/{categoryKey}`
- `GET /api/v1/categories`
- `GET /api/v1/operations/providers`

Provider reads and mutations use the server-owned role assignment for the route provider ID. Client role and provider headers do not grant access.

## Initial category baseline

The migration seeds four synthetic planning categories:

- plumbing;
- electrical repairs;
- mechanics;
- appliance and electronics repair.

The requirements are planning contracts only. They do not represent verified evidence, regulator approval or final Zambia legal requirements. Activated versions are immutable; later changes require a new version.

## Test obligations

The checkpoint must prove:

- unauthenticated provider operations are denied;
- invalid pathways and operating models fail;
- cross-provider access is denied;
- revoked representatives lose access immediately;
- active category requirements cannot be silently rewritten;
- invalid provider-state transitions fail at the database boundary;
- provider changes create append-only audit events;
- Android and operations-portal content is clearly synthetic;
- the public directory contains zero providers;
- backend, Android, portal and documentation workflows pass at one exact PR head.

## Explicit exclusions

Phase 3 includes no real user or provider data, evidence upload, evidence viewer, verification decision, public trust claim, production OTP, payment integration, regulator integration, map integration, field visit or production deployment.