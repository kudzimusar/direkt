# DIREKT Android Architecture

## Approach

Native Kotlin, Jetpack Compose, unidirectional data flow, Clean Architecture boundaries and MVVM presentation.

## Planned modules

```text
:app
:core:model
:core:designsystem
:core:network
:core:database
:core:datastore
:core:security
:core:analytics
:core:testing
:feature:auth
:feature:discover
:feature:providerprofile
:feature:enquiries
:feature:reviews
:feature:provideronboarding
:feature:verification
:feature:providerdashboard
:feature:account
:feature:support
```

Start with enough modules to enforce boundaries, not excessive fragmentation.

## Layers

- Presentation: Compose + ViewModel/UI state.
- Domain: use cases and pure policy-independent client logic.
- Data: repositories coordinating API/local sources.
- Platform: permissions, camera, notifications, secure storage.
- Test fixtures: synthetic builders.

Backend remains authoritative for trust, permissions, publication and payment.

## Data flow

```text
UI intent → ViewModel → Use case → Repository
Repository → API/Room/DataStore → mapped domain result
Domain result → immutable UI state → Compose
```

## Dependency injection

Hilt with explicit interfaces. Test components replace network, clock, location and analytics.

## Concurrency

Coroutines and Flow. Structured concurrency. No global mutable scopes. WorkManager for durable uploads/sync.

## Offline

- Room stores cache and drafts;
- DataStore stores preferences/session metadata only;
- evidence files use app-private temporary storage and lifecycle cleanup;
- queued writes carry client request/idempotency IDs;
- server acknowledgement determines final state.

## Build variants

- local/dev;
- staging;
- production.

No production key in source. Environment endpoints and feature flags are injected through safe build configuration.

## Quality

- ktlint/detekt or approved equivalents;
- unit tests;
- Compose tests;
- screenshot tests for trust states;
- dependency/version catalog;
- baseline profiles after measurement;
- strict release signing separation.
