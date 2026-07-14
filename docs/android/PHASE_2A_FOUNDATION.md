# DIREKT Phase 2A Android Foundation

## Objective

Phase 2A establishes a reproducible native Android project and the first CI-built debug APK without introducing production services or sensitive data.

## Implemented source

The Android project is rooted at `android/direkt-app` and currently contains one `:app` module.

Implemented boundaries:

- `MainActivity` as the Android entry point;
- `DirektTheme` for Material 3 colour tokens;
- `DirektAppState` for customer/provider mode and navigation state;
- `DirektApp` for the synthetic foundation shell;
- unit tests for deterministic state transitions;
- a Compose instrumentation smoke test;
- a manifest with backup disabled and no dangerous permissions.

## Toolchain

| Component | Pinned value |
|---|---:|
| Gradle | 9.4.0 |
| Android Gradle Plugin | 9.0.0 |
| Kotlin / Compose compiler plugin | 2.3.0 |
| Compose BOM | 2025.09.01 |
| compileSdk | 36 |
| targetSdk | 36 |
| minSdk | 23 |
| Build JDK | 17 |

The baseline was selected from Google's current Android `nowinandroid` reference project inspected during this phase.

## Android identity

```text
namespace = com.kudzimusar.direkt
release applicationId = com.kudzimusar.direkt
debug applicationId = com.kudzimusar.direkt.debug
```

The debug suffix protects the future production installation identity.

## CI contract

The Android workflow must run:

```text
./gradlew --no-daemon --stacktrace \
  testDebugUnitTest \
  lintDebug \
  assembleDebug \
  assembleDebugAndroidTest
```

Required retained artifacts:

- the debug APK;
- the Compose instrumentation test APK;
- unit-test reports;
- Android lint reports;
- the exact commit and branch build summary.

## Wrapper bootstrap limitation

The Gradle distribution URL and SHA-256 checksum are committed. The launcher uses a standard wrapper JAR when present and otherwise delegates to the pinned Gradle installation.

GitHub Actions installs Gradle 9.4.0 and generates the standard wrapper JAR on the clean runner before invoking `./gradlew`. This limitation is explicit and does not permit an unpinned Gradle version.

A later maintenance change may commit the generated binary wrapper JAR directly when the repository transfer path supports it.

## Safety boundaries

Phase 2A does not include:

- Internet or location permissions;
- authentication or authorization;
- Firebase configuration;
- production API endpoints;
- provider identity or qualification evidence;
- regulator integrations;
- customer or provider payments;
- real phone numbers, documents or coordinates;
- any claim that verification is operational.

All visible provider and location content is synthetic.

## Exit evidence

Phase 2A may close only after GitHub Actions proves:

1. clean project configuration;
2. successful unit tests;
3. successful Android lint;
4. successful debug APK assembly;
5. successful Compose test APK assembly;
6. artifact retention;
7. correct application identifiers;
8. no secret or production configuration committed.

Until those results are recorded, Issue #10 remains open.
