# Phase 6 provider workspace API

All routes require a bearer session and server-resolved permissions. Provider workspace routes use the authenticated actor's active provider assignment and do not accept a provider ID.

## Workspace summary

### `GET /api/v1/provider-workspace/me`

Returns:

- provider profile and representative role;
- selected service versions;
- safe location configuration flags;
- minimal availability;
- readiness counts and priority tasks;
- read-only later-phase boundaries.

The response excludes coordinates, private evidence, object keys and reviewer data.

## Profile and services

| Method | Route | Permission | Effect |
|---|---|---|---|
| `PATCH` | `/provider-workspace/me/profile` | `provider.profile.manage` | Updates the actor-resolved provider profile |
| `PUT` | `/provider-workspace/me/services/{categoryKey}` | `provider.profile.manage` | Selects the active immutable requirement version |
| `DELETE` | `/provider-workspace/me/services/{categoryKey}` | `provider.profile.manage` | Marks the service removed without deleting history |

These actions cannot create claims or publication records.

## Location and availability

| Method | Route | Permission | Effect |
|---|---|---|---|
| `PUT` | `/provider-workspace/me/location` | `provider.profile.manage` | Stores private base, consented public premises and service area separately |
| `PUT` | `/provider-workspace/me/availability/{categoryKey}` | `provider.availability.manage` | Updates availability for a selected service |

Location write rules:

- latitude and longitude must be supplied as pairs;
- public premises coordinates require explicit consent;
- service area must be a WGS84 polygon;
- coordinates and polygon WKT are not echoed by the workspace response;
- audit metadata records configuration booleans, not coordinates.

Limited availability requires a future `nextAvailableAt`. Other availability states reject that field.

## Recoverable uploads

| Method | Route | Effect |
|---|---|---|
| `POST` | `/provider-workspace/me/upload-intents` | Creates or idempotently returns a logical upload intent |
| `GET` | `/provider-workspace/me/upload-intents` | Lists the representative's safe upload-intent state |
| `GET` | `/provider-workspace/me/upload-intents/{id}` | Reads one safe intent |
| `PUT` | `/provider-workspace/me/upload-intents/{id}/interrupted` | Cancels the current session and marks the intent retryable |
| `POST` | `/provider-workspace/me/upload-intents/{id}/retry` | Creates a fresh private upload session |
| `POST` | `/provider-workspace/me/upload-intents/{id}/confirm` | Confirms one immutable evidence version against the server-owned case |
| `DELETE` | `/provider-workspace/me/upload-intents/{id}` | Cancels a non-submitted intent |

All routes require `provider.evidence.manage`.

### Idempotency

`clientIntentKey` is unique for provider, representative and logical intent. Repeating an identical create request returns the existing intent. Reusing the key with a different case or document contract returns a conflict.

Retry preserves the logical intent ID and increments the attempt count. It creates a fresh upload-session ID. A completed evidence version remains unique to one upload session.

### Confirmation linkage

Confirmation is accepted only when:

- the session belongs to the actor-resolved provider;
- the actor created the session;
- the intent, session, case and requirement agree;
- the case is awaiting evidence or correction;
- the selected service version remains current;
- the upload session is requested, unexpired and within its size limit.

A failure rolls back the transaction and leaves the session and evidence tables unchanged.

## Verification timeline

### `GET /api/v1/provider-workspace/me/verification-timeline`

Returns safe events for:

- case creation;
- evidence submission or safe status changes;
- immutable decisions;
- scoped claim status.

The endpoint excludes reviewer identities, private rationale, storage data, hashes and internal risk information.

## Deferred surfaces

| Method | Route | Owner |
|---|---|---|
| `GET` | `/provider-workspace/me/enquiries` | Phase 8 |
| `GET` | `/provider-workspace/me/review-responses` | Phase 8 |
| `GET` | `/provider-workspace/me/subscription-status` | Phase 9 |

These endpoints are read-only. No matching `POST`, `PUT`, `PATCH` or `DELETE` route exists in Phase 6.

## Operations projection

### `GET /api/v1/operations/provider-workspaces`

Requires `operations.providers.read`.

Returns aggregate readiness, location flags, verification counts and upload-state counts. It does not return provider coordinates, case/evidence/upload identifiers, hashes, object keys, document content or reviewer data.

## Error model

The API uses the repository-wide problem-details contract.

Common outcomes:

- `400`: invalid location pair, invalid lifecycle transition or confirmation scope violation;
- `401`: missing or invalid session;
- `403`: no matching server-resolved permission;
- `404`: no active workspace, selected service, case or actor-owned intent;
- `409`: ambiguous provider assignment, conflicting idempotency contract or invalid upload state.
