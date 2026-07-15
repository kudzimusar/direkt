# Phase 3 Provider and Category Core

## Purpose

Phase 3 introduces DIREKT's first authenticated business-domain vertical slice on top of the Phase 2C identity, session and authorization foundation.

It supports customer profiles, non-public provider drafts, provider-scoped representatives, operating models, service categories and immutable category-requirement versions. It does **not** introduce verification, trust claims or public provider discovery.

## Domain separation

A human account identity and a provider organization are different records.

- `account.identities` represents the authenticated human.
- `account.customer_profiles` stores the authenticated human's bounded customer-facing preferences.
- `provider.organizations` represents the provider aggregate.
- `provider.profiles` contains self-asserted provider draft data.
- `authz.role_assignments` connects authorized humans to provider organizations through provider-scoped roles.

Provider ownership is therefore an authorization relationship, not an identity alias.

## Provider pathways

Every provider selects one explicit pathway:

- `registered_business`;
- `qualified_individual`;
- `experienced_informal`.

The pathway is self-asserted in Phase 3. It creates no verification claim.

## Operating models

Profiles support:

- `fixed` — requires a private premises label;
- `mobile` — requires a service-area label;
- `hybrid` — requires both.

These fields are operational drafting inputs. Exact public coordinates are not collected or exposed in this phase.

## Profile states

The only Phase 3 profile states are:

```text
draft -> complete -> archived
   ^         |
   |---------|
```

`draft` and `complete` are editable non-public states. `complete` means only that the required self-asserted profile fields and at least one active category are present. `archived` is terminal.

Invalid state transitions are rejected by both the application service and a PostgreSQL trigger.

## Discoverability invariant

`provider.profiles.discoverability_state` is constrained to `blocked`.

No Phase 3 action can change that value. Account creation, profile completion, category selection, provider-role assignment, administrator access or a direct API request cannot create a public listing.

Phase 4 must introduce evidence-derived claims and an explicit publication policy before discoverability can exist.

## Category versioning

`catalog.categories` contains stable category identities. `catalog.category_requirement_versions` stores versioned requirement arrays.

A requirement version may be edited while it is a draft. After activation, its category, version, requirements, creator and creation time are immutable. A changed requirement set must be represented by a new version so historical provider and future verification records retain their original meaning.

Only one active requirement version may exist for each category.

## Authorization

Phase 3 adds server-resolved permissions for:

- customer profile read/manage;
- provider draft creation;
- provider profile read/manage;
- representative assignment;
- provider category selection;
- profile state transitions;
- category read/manage.

Provider routes use the existing deny-by-default guard and provider route parameter. Client-supplied role or provider claims are ignored.

The draft creator receives a server-written `provider_owner` assignment in the same transaction that creates the provider profile.

## Audit

Database triggers append events for:

- customer profile creation and update;
- provider profile creation and update;
- provider profile state transitions.

Existing Phase 2C role-assignment auditing covers representative changes. Audit records remain append-only.

## API surface

Authenticated Phase 3 endpoints include:

- `GET|PUT /api/v1/account/profile`;
- `POST /api/v1/providers`;
- `GET|PATCH /api/v1/providers/:providerId`;
- `POST /api/v1/providers/:providerId/transitions`;
- `POST /api/v1/providers/:providerId/representatives`;
- `PUT /api/v1/providers/:providerId/categories/:categoryId`;
- `GET /api/v1/categories`;
- `GET /api/v1/operations/provider-core/summary`.

There is no public provider search or publication endpoint.

## Synthetic client surfaces

Android contains a non-exported synthetic provider-core activity and policy model. The operations portal contains a synthetic provider-core route and accessible table. Both surfaces label their data as fictional and display the publication block.

Neither surface connects directly to PostgreSQL, object storage, an OTP vendor, evidence storage or a production deployment.
