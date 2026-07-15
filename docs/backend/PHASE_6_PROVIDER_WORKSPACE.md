# Phase 6 backend provider workspace

## Scope

The Phase 6 backend delivers an authenticated provider workspace on top of the Phase 3 provider model, Phase 4 private evidence engine and Phase 5 discovery publication boundary.

It includes:

- actor-resolved workspace summary and tasks;
- profile and service selection commands;
- private base, consented public premises and service-area writes;
- availability updates independent of trust;
- recoverable logical evidence-upload intents;
- provider-safe verification timeline;
- read-only Phase 8 and Phase 9 boundaries;
- aggregate operations visibility.

## New database records

`provider_workspace.upload_intents` stores one logical provider upload across retries.

`provider_workspace.upload_attempts` stores the session used by each attempt. It preserves the relationship between logical intent and private upload session while evidence bytes remain outside PostgreSQL.

The migration grants:

- `provider.evidence.manage` to provider owners and members;
- `provider.availability.manage` to provider owners and members;
- both permissions to administrators for controlled synthetic administration.

Provider responders remain read-only for profile/workspace state and cannot manage evidence or availability.

## Workspace readiness

Readiness is an operational projection, not a trust score. It uses independent checks for:

- profile completeness;
- selected services;
- configured service area;
- required evidence/current claims;
- unresolved corrections.

Publication eligibility remains owned by the discovery policy and current scoped claims.

## Command rules

- All provider context is resolved from the authenticated identity.
- Category selection reuses immutable active requirement versions.
- Service removal preserves historical cases, evidence, decisions and claims.
- Location writes validate coordinate pairs and public-premises consent.
- Audit metadata excludes coordinates.
- Availability requires a currently selected service.
- Limited availability requires a future timestamp.
- Availability cannot mutate verification or publication state.

## Upload lifecycle

Allowed logical states are:

- queued;
- uploading;
- interrupted;
- retryable;
- submitted;
- terminal failure;
- cancelled.

A new or retryable intent creates a fresh existing `evidence.upload_sessions` record through the private-storage adapter. Confirmation delegates to the Phase 4 evidence service and then marks the logical intent submitted.

The logical intent is creator-scoped. Another representative of the same provider does not automatically inherit a partially uploaded document from the creator.

## Safe output

Provider responses may include:

- public-safe profile fields;
- category and requirement labels;
- case/check IDs needed for the provider's own workflow;
- safe upload state, attempt count and safe error code;
- safe timeline messages and claim limitations.

They exclude:

- private coordinate values;
- object keys and document contents;
- hashes in timeline/workspace output;
- reviewer identity and rationale;
- internal risk data.

## Related records

- [Architecture](../architecture/PHASE_6_PROVIDER_WORKSPACE.md)
- [API contract](../api/PHASE_6_PROVIDER_WORKSPACE_API.md)
- [Android experience](../android/PHASE_6_PROVIDER_WORKSPACE.md)
- [Privacy controls](../security/PHASE_6_PROVIDER_WORKSPACE_PRIVACY.md)
- [Test matrix](../testing/PHASE_6_PROVIDER_WORKSPACE_TESTING.md)
