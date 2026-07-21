# DIREKT RC3 — Firebase Crashlytics Android Runtime Closure

**Governing issue:** #261  
**Checkpoint:** RC3  
**Source state:** `IMPLEMENTED_GATED / MANAGED DEVICE CANARY PENDING`  
**Participant/production Crashlytics telemetry:** `DISABLED`

## Scope

RC3 owns Firebase Crashlytics for the native Android customer/provider app only.

It does not activate:

- Firebase Cloud Messaging;
- notification permission;
- Google Maps/location permissions;
- Firebase Test Lab automation;
- Google Analytics;
- Sentry on Android;
- production participant telemetry.

RC4 owns FCM and RC5 owns Firebase Test Lab.

## Existing Firebase architecture preserved

DIREKT does not store `google-services.json` in the repository and existing Firebase Authentication uses explicit Firebase options injected through the controlled build boundary.

RC3 preserves that rule:

- generic Android builds do not apply the Google Services or Crashlytics Gradle plugins;
- the Crashlytics SDK is present but collection defaults to disabled;
- only the managed `synthetic-canary` build applies the official Google Services and Crashlytics build plugins;
- that workflow downloads the exact registered Firebase debug-app configuration through Firebase Management API and materializes `google-services.json` ephemerally on the isolated CI runner;
- the ephemeral configuration is removed after the build and is never committed or uploaded as evidence.

This conditional build path exists so the managed canary receives the official Crashlytics build metadata without introducing a second persistent Firebase configuration authority.

## Fail-closed collection controls

The main Android manifest declares:

```xml
<meta-data
    android:name="firebase_crashlytics_collection_enabled"
    android:value="false" />
```

Crashlytics runtime activation requires all of the following:

- `DIREKT_CRASHLYTICS_MODE=synthetic-canary`;
- release channel remains `preauthorization`;
- `DIREKT_CRASHLYTICS_RELEASE` is an exact lowercase 40-character source SHA;
- exact Firebase API key, app ID and project ID are supplied from the managed Firebase app configuration.

Outside that boundary, `DirektApplication` does not initialize the default Firebase app for Crashlytics and does not enable collection.

## Privacy contract

RC3 source may attach only fixed synthetic metadata:

- `direkt_canary=true`;
- `direkt_data_mode=synthetic-only`;
- exact reviewed source SHA;
- fixed canary kind (`fatal` or `nonfatal`).

RC3 must not call Crashlytics user-ID APIs or unrestricted Crashlytics logging APIs and must not attach:

- names, phone numbers, email addresses or contact data;
- evidence content or reviewer-private notes;
- exact private provider coordinates;
- auth/session tokens, cookies or credentials;
- arbitrary request/response bodies;
- unrestricted free-form application logs.

## Synthetic device canary

Workflow:

```text
.github/workflows/firebase-crashlytics-canary.yml
```

The managed workflow is manual and accepts only an exact reviewed source commit already merged to `main`.

It:

1. authenticates through existing GitHub WIF;
2. resolves the exact active Firebase Android debug app for `com.kudzimusar.direkt.debug`;
3. downloads the Firebase configuration artifact from Firebase Management API and keeps it ephemeral;
4. builds the exact debug APK with `synthetic-canary` mode and source-SHA binding;
5. uses the existing isolated GitHub-hosted Android emulator lane, not Firebase Test Lab;
6. records one fixed synthetic non-fatal exception;
7. records one fixed synthetic fatal exception and restarts the app so the crash report can upload;
8. polls Firebase Crashlytics REST API for exact exception markers and the exact package;
9. records only sanitized event identifiers and runtime metadata.

The canary intentionally uses neither App Distribution nor real participant devices.

## Source-phase promotion requirements

Before the RC3 source PR merges:

- generic Android unit/lint/debug/release-boundary builds pass without `google-services.json`;
- no new Android dangerous/runtime permission is introduced;
- no FCM/Maps/Sentry-Android dependency enters the runtime;
- Crashlytics dependency/plugin versions are reviewed and source-controlled;
- collection is default-off and activation is synthetic-only;
- custom metadata remains fixed/non-sensitive;
- permanent runtime verifier recognizes `IMPLEMENTED_GATED / MANAGED DEVICE CANARY PENDING`, not `ACTIVE`;
- Android, backend/database/OpenAPI, PWA/portal, supply-chain, performance and release gates remain green.

## Managed-phase promotion requirements

After source merge:

1. dispatch `DIREKT managed Crashlytics synthetic device canary` from the exact source merge SHA;
2. require both exact fatal and non-fatal events to appear through Crashlytics API verification;
3. record sanitized event IDs, package, Firebase app/project and exact source;
4. reconcile this document, `CURRENT_INTEGRATION_STATUS.md`, `LIVE_INTEGRATION_LEDGER.md`, `WORKSTREAM_LOCK.md` and the permanent runtime verifier;
5. promote only `ACTIVE — SYNTHETIC-ONLY MANAGED DEVICE CANARY` unless a separate privacy/data-use authorization explicitly broadens telemetry collection.

## Stop conditions

Stop rather than promote RC3 if:

- a generic build requires committed `google-services.json`;
- Crashlytics collection becomes enabled by default;
- user IDs/contact/evidence/private coordinates/tokens or unrestricted logs enter Crashlytics;
- FCM, notification permission, Maps/location or Test Lab scope is pulled into RC3;
- the exact Firebase debug app cannot be resolved;
- the fatal and non-fatal events cannot be verified through managed evidence;
- any protected regression gate fails.
