# DIREKT Android foundation

This directory contains the native Android-first DIREKT client.

## Phase 2A status

The current application is a **synthetic foundation build**. It demonstrates:

- the approved Android identity and debug suffix;
- Material 3 design tokens;
- customer/provider mode boundaries;
- a navigation and state-holder boundary;
- synthetic discovery and provider-progress content;
- unit and Compose instrumentation smoke tests.

It does **not** contain real authentication, networking, provider evidence, verification decisions, payments, Firebase configuration, regulator integrations, phone numbers or private coordinates.

## Toolchain

The project is pinned to:

| Tool | Version |
|---|---:|
| Gradle | 9.4.0 |
| Android Gradle Plugin | 9.0.0 |
| Kotlin / Compose compiler plugin | 2.3.0 |
| Compose BOM | 2025.09.01 |
| compileSdk | 36 |
| targetSdk | 36 |
| minSdk | 23 |
| Java runtime | 17 |

The AGP, Kotlin, Compose and SDK baseline follows the current Android `nowinandroid` reference project inspected for this phase. Production release requirements must be checked again at the release gate.

## Application IDs

```text
release namespace/applicationId: com.kudzimusar.direkt
debug applicationId:             com.kudzimusar.direkt.debug
```

## Build locally

Open this directory as the project root in a current Android Studio installation with Android SDK 36 and JDK 17.

The repository contains pinned wrapper properties and launchers. The first bootstrap currently requires Gradle 9.4.0 to generate the standard wrapper JAR:

```bash
gradle wrapper --gradle-version 9.4.0 --distribution-type bin
chmod +x gradlew
./gradlew --no-daemon --stacktrace testDebugUnitTest lintDebug assembleDebug assembleDebugAndroidTest
```

GitHub Actions performs that bootstrap automatically from the pinned Gradle version before running the wrapper.

## Outputs

```text
app/build/outputs/apk/debug/app-debug.apk
app/build/reports/tests/
app/build/reports/lint-results-debug.html
app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
```

Do not add `local.properties`, signing keys, `google-services.json`, production URLs, credentials or real participant/provider material to the public repository.
