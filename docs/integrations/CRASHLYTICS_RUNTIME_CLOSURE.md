# DIREKT RC3 — Firebase Crashlytics Android Runtime Closure

**Governing issue:** #261  
**Checkpoint:** RC3  
**Authoritative source PR:** #283  
**Source merge:** `4fe461d4ff11be85153cc01cf9eade561266aae4`  
**Current state:** `IMPLEMENTED_GATED / SYNTHETIC CANARY PENDING`  
**Participant/production Crashlytics telemetry:** `DISABLED`

## Scope

RC3 owns Firebase Crashlytics for the native Android customer/provider application only.

RC3 does not activate:

- Firebase Analytics;
- Firebase Cloud Messaging;
- notification runtime permission;
- Google Maps or location permissions;
- Firebase Test Lab automation;
- Sentry on Android;
- real-participant or production crash telemetry.

RC4 owns FCM and RC5 owns Firebase Test Lab.

## Source integration

PR #283 merged the reviewed Android Crashlytics source checkpoint at `4fe461d4ff11be85153cc01cf9eade561266aae4`.

The implementation:

- adds the Firebase Crashlytics SDK under the existing Firebase BoM;
- registers Google Services and Crashlytics Gradle plugins but applies them only when `DIREKT_CRASHLYTICS_BUILD_ENABLED=true`;
- requires runner-provisioned `app/google-services.json` for that controlled build and keeps the file prohibited from repository source;
- preserves existing Firebase Authentication initialization behavior;
- keeps automatic Crashlytics collection disabled in the main Android manifest;
- allows the RC3 canary only for a debug build, explicit canary enablement, `synthetic-only` data mode and an exact lowercase 40-character source SHA;
- exposes only fixed canary modes: `crash`, `anr`, `flush`, `disable`;
- uses only bounded non-identifying canary custom keys;
- does not set a stable Crashlytics user ID or add unrestricted Crashlytics logs;
- keeps the canary trigger absent from normal production/release user flows.

## Privacy and telemetry contract

RC3 canary metadata is limited to fixed source-controlled values such as:

- `direkt_data_mode=synthetic-only`;
- exact reviewed source SHA;
- release channel;
- fixed canary kind.

RC3 must not attach:

- names, phone numbers, emails or contact data;
- evidence content or reviewer-private notes;
- exact private provider coordinates;
- authentication/session tokens, cookies or credentials;
- arbitrary request or response bodies;
- stable participant identifiers;
- unrestricted free-form Crashlytics logs;
- Firebase Analytics breadcrumbs.

The Play/Data Safety inventory explicitly accounts for the release-capable Crashlytics dependency while participant/production collection remains disabled.

## Managed crash + ANR proof

Workflow:

```text
.github/workflows/firebase-crashlytics-canary.yml
```

The managed workflow is manual and exact-source controlled. PR #284 added a temporary one-shot dispatcher solely because the repository connector could not invoke `workflow_dispatch` directly. Both the dispatcher and its authorization marker are temporary and are removed by the RC3 closeout branch after the proof completes.

The managed proof:

1. authenticates through existing GitHub WIF;
2. resolves the registered Firebase debug app `com.kudzimusar.direkt.debug`;
3. downloads its Firebase config at runtime and materializes `google-services.json` only on the isolated runner;
4. removes the temporary Firebase config immediately after build;
5. builds the exact source in synthetic-only preauthorization canary mode;
6. provisions the existing GitHub-hosted headless Android emulator, without using Firebase Test Lab;
7. triggers a deliberate debug-only fatal crash and proves process termination;
8. restarts the app in `flush` mode and requires a Crashlytics upload success receipt;
9. triggers a deliberate Android ANR, confirms the OS ANR signal, restarts/flushes and requires a Crashlytics upload success receipt;
10. runs `disable` to return collection to the fail-closed state;
11. uploads only sanitized diagnostic logs.

## Source regression receipt

Exact source head `ab4bcabfffef2ef3d6c7efc852882e3002313026` passed:

- DIREKT Android CI;
- Android performance budget;
- Phase 12A preauthorization release readiness;
- Phase 12B Play readiness;
- Phase 12 final preauthorization readiness;
- Phase 10 supply-chain security;
- W7 cross-client regression;
- W8 canonical-domain verification;
- both functional/customer-provider PWA suites;
- documentation quality;
- full integration-runtime audit.

This source-phase receipt does not by itself make Crashlytics `ACTIVE`.

## Managed-phase closure requirements

RC3 may be promoted only after:

1. the exact-source managed crash + ANR canary completes successfully;
2. the sanitized managed workflow/run receipt is recorded;
3. temporary RC2/RC3 one-shot dispatcher and authorization artifacts are removed;
4. `CURRENT_INTEGRATION_STATUS.md`, `LIVE_INTEGRATION_LEDGER.md`, `WORKSTREAM_LOCK.md` and the permanent integration verifier are reconciled;
5. exact-head closure regressions pass.

The maximum promotion at RC3 is:

```text
ACTIVE — SYNTHETIC-ONLY MANAGED DEVICE CANARY
```

unless a separate reviewed privacy/data-use decision explicitly authorizes a broader telemetry class.

## Stop conditions

Stop rather than promote RC3 if:

- the managed crash or ANR proof fails;
- automatic collection is enabled by default;
- `google-services.json` becomes a committed source artifact;
- Firebase Analytics, FCM, Maps/location, notification permission or Test Lab is pulled into RC3;
- user IDs, contact/evidence/private-coordinate/token data or unrestricted logs enter Crashlytics;
- the canary becomes reachable in production/release user flows;
- any protected Android/backend/database/OpenAPI/PWA/portal/security/release gate regresses.

## Next checkpoint after closure

RC4 — Firebase Cloud Messaging push delivery: server send path, device-token lifecycle, Android notification handling/permission UX, retries/privacy controls and managed canary.
