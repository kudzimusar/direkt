# Phase 6 provider workspace testing

## Permanent test matrix

| Boundary | Test evidence |
|---|---|
| Actor-resolved provider ownership | `provider-workspace.e2e.spec.ts` |
| Revocation and cross-provider denial | `provider-workspace.e2e.spec.ts`, `provider-workspace-uploads.e2e.spec.ts` |
| Profile/service/location/availability independence | `provider-workspace-mutations.e2e.spec.ts` |
| Coordinate and audit non-disclosure | `provider-workspace-mutations.e2e.spec.ts` |
| Upload logical-intent idempotency | `provider-workspace-uploads.e2e.spec.ts` |
| Interrupted retry with a fresh session | `provider-workspace-uploads.e2e.spec.ts` |
| One immutable evidence version | `provider-workspace-uploads.e2e.spec.ts` |
| Direct confirmation case/session scope | `evidence-confirmation-scope.e2e.spec.ts` |
| Provider-safe timeline | `provider-workspace-uploads.e2e.spec.ts` |
| Read-only Phase 8/9 endpoints | `provider-workspace-deferred.e2e.spec.ts` |
| Operations aggregate privacy | `provider-workspace-operations.e2e.spec.ts` |
| Authorization audit typing | `authorization.service.spec.ts` |
| Android readiness and deferred boundaries | `ProviderWorkspaceModelsTest.kt` |
| Android persistence and retry state | `ProviderUploadRecoveryStoreTest.kt` |
| Android activity recreation | `ProviderWorkspaceRecoveryTest.kt` |
| Operations portal privacy | `provider-workspaces.spec.tsx` |
| Operations navigation permission | `navigation.spec.ts` |

## Backend and database assertions

The backend suites prove:

- provider IDs and roles supplied by clients do not select workspace ownership;
- no assignment is denied and multiple active assignments are rejected;
- revoked membership is effective on the next request;
- profile, service, location and availability updates do not create claims or publications;
- location responses and audit events contain no coordinate values;
- an identical client upload key returns one logical intent;
- retry increments the attempt count and creates a different upload session;
- an interrupted session is cancelled;
- confirmation creates one version and one case link;
- a mismatched case requirement returns a domain error and leaves session, evidence and version state unchanged;
- another provider cannot list, read or cancel an intent;
- provider timeline serialization contains no storage or reviewer fields;
- deferred endpoints expose no mutation route;
- operations output contains aggregate counts only.

## Android assertions

Unit tests prove:

- readiness counts use independent controls;
- safe location summaries contain no coordinates;
- Phase 8/9 surfaces are read-only;
- upload encoding/decoding falls back safely when corrupt;
- interruption survives store recreation;
- retry preserves logical intent and changes session ID;
- repeated start while active is idempotent;
- submitted state is terminal.

Compose instrumentation proves:

- the Phase 6 shell is visible;
- provider dashboard, profile and privacy boundary are accessible;
- upload attempt one can be interrupted;
- activity recreation restores interruption;
- retry appears as attempt two;
- later-phase boundary copy remains visible and non-interactive.

## Operations portal assertions

Server-rendered tests prove the portal:

- labels records synthetic;
- displays readiness and interrupted/retryable counts;
- states that coordinates and evidence identifiers are excluded;
- exposes no evidence-review or provider-publication action;
- appears only when server permissions include `operations.providers.read`.

## Required release commands

### Backend/PostGIS

```bash
cd backend/direkt-api
npm ci --ignore-scripts
npm run format:check
npm run lint
npm run typecheck
npm run migration:check
npm run test
npm run build
npm run openapi:check
```

### Android

```bash
cd android/direkt-app
./gradlew --no-daemon clean testDebugUnitTest lintDebug assembleDebug assembleDebugAndroidTest
```

### Operations portal

```bash
cd admin/direkt-operations-portal
npm ci --ignore-scripts
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

### Documentation

```bash
python scripts/validate_docs.py
python scripts/package_planning_docs.py
python scripts/build_pages_source.py
mkdocs build --strict
```

All four permanent workflows must pass on one exact reviewed head. Thresholds may not be reduced to obtain a green result.
