# DIREKT Android Architecture

## Current approach

DIREKT Version 1 is a native Android application written in Kotlin with Jetpack Compose and Material 3. The client uses unidirectional state flow and will grow toward MVVM/Clean Architecture boundaries without prematurely fragmenting the first build.

The Phase 2A source lives at:

```text
android/direkt-app/
```

## Current Phase 2A structure

```text
:app
├── MainActivity
├── ui/DirektApp
├── ui/DirektAppState
└── ui/theme/DirektTheme
```

The first scaffold deliberately contains one application module. It establishes:

- the Android namespace and application identifiers;
- Compose and Material 3;
- theme tokens;
- customer/provider mode boundaries;
- navigation destinations and an explicit state holder;
- synthetic customer/provider content;
- unit and Compose instrumentation smoke tests;
- strict exclusion of networking, Firebase, real evidence and payments.

This is not the final module topology. It is the smallest reproducible foundation that can produce a tested APK.

## Approved toolchain baseline

| Item | Phase 2A value |
|---|---:|
| Gradle | 9.4.0 |
| Android Gradle Plugin | 9.0.0 |
| Kotlin / Compose plugin | 2.3.0 |
| Compose BOM | 2025.09.01 |
| compileSdk | 36 |
| targetSdk | 36 |
| minSdk | 23 |
| Build JDK | 17 |

The values were selected from the current Android `nowinandroid` reference baseline. They are pinned for reproducibility and must be reviewed again at release gates rather than silently floated.

## Application identity

```text
namespace:                    com.kudzimusar.direkt
production applicationId:    com.kudzimusar.direkt
debug applicationId:         com.kudzimusar.direkt.debug
```

Debug builds use an application ID suffix so development installations cannot replace a future production installation.

## Planned modules

Modules will be introduced only when a real dependency, ownership, build-time or test-isolation boundary justifies them.

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

## Target layers

- **Presentation:** Compose, immutable UI models, ViewModels and event handlers.
- **Domain:** use cases and client-side rules that do not duplicate server authority.
- **Data:** repositories coordinating API, Room and DataStore sources.
- **Platform:** permissions, camera, notifications, secure storage and WorkManager.
- **Testing:** synthetic builders, fakes, clocks and deterministic dispatchers.

The backend remains authoritative for trust claims, permissions, publication, commercial entitlement and verification decisions.

## Target data flow

```text
UI intent → ViewModel → Use case → Repository
Repository → API/Room/DataStore → mapped domain result
Domain result → immutable UI state → Compose
```

Phase 2A uses `DirektAppState` as a narrow state-holder boundary. It is not an authorization or backend session model.

## Dependency injection

Hilt remains the planned dependency-injection mechanism. It is intentionally not added to the Phase 2A shell because there are no network, repository or platform service dependencies to inject yet.

When added:

- interfaces remain explicit;
- production and test graphs remain separate;
- network, clock, location and analytics are replaceable;
- Android framework dependencies do not enter pure domain code.

## Concurrency and background work

Coroutines and Flow will provide structured concurrency. WorkManager will be used only for durable approved work such as resumable evidence upload and synchronization. Global mutable scopes are prohibited.

## Offline model

Later phases will use:

- Room for cache and resumable drafts;
- DataStore for preferences and non-sensitive session metadata;
- app-private temporary storage for evidence capture;
- client-generated request/idempotency identifiers;
- explicit pending, failed and retry states;
- server acknowledgement as the only source of final trust state.

The Phase 2A shell performs no persistence or network access.

## Build variants

Current:

- `debug` — synthetic development build with `.debug` application ID suffix;
- `release` — unsigned/non-production scaffold using the production identifier.

Later approved environments may add local, staging and production configuration through typed, non-secret build inputs. Production keys and endpoints must never be committed.

## Quality gates

The first Android CI gate compiles and retains:

```text
./gradlew --no-daemon --stacktrace \
  testDebugUnitTest \
  lintDebug \
  assembleDebug \
  assembleDebugAndroidTest
```

Required outputs:

- unit-test results;
- Android lint reports;
- debug APK;
- Compose instrumentation test APK;
- exact commit and branch build summary.

Future quality layers include formatting/static analysis, screenshot tests for trust states, managed-device execution, accessibility checks, performance budgets and measured baseline profiles.
