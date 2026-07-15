# Phase 6 provider workspace architecture

## Purpose

Phase 6 adds an authenticated provider workspace without weakening the identity, evidence, claim, publication or location boundaries established in Phases 3–5.

The workspace is a provider-owned operational surface. It is not a public profile, a blanket verification status, a payment entitlement or a client-selected tenant context.

## Module boundaries

| Module | Responsibility | Prohibited responsibility |
|---|---|---|
| `provider-core` | Provider organization, pathway, profile, representatives and category selections | Public publication or evidence decisions |
| `provider-workspace` | Actor-resolved workspace summary, safe commands, upload recovery and provider timeline | Client-selected provider ownership, reviewer data or public trust inference |
| `verification-evidence` | Private upload sessions, immutable evidence versions, cases, decisions and claims | Public evidence output or commercial status |
| `discovery` | Policy-controlled public-safe publication and search | Private provider base, original evidence or profile-completion publication |
| `operations` | Aggregate readiness, verification and upload-state visibility | Evidence content, object keys, coordinates or reviewer rationale |
| Android provider mode | Synthetic dashboard, task states, private upload recovery and safe timeline presentation | Production storage, background location, messaging or payments |

## Server-owned provider context

Routes under `/api/v1/provider-workspace/me` do not accept a provider identifier.

The authorization layer first verifies that the authenticated identity has an active provider-scoped permission. The workspace repository then resolves the active provider assignment again inside the database transaction.

The resolver:

1. accepts only active `provider_owner`, `provider_member` or permitted responder assignments;
2. ignores client role and provider headers;
3. rejects identities with no active provider workspace;
4. rejects ambiguous identities assigned to more than one active provider until a future server-owned context-selection contract exists;
5. rechecks revocation and assignment time bounds on every request.

## Location separation

The provider workspace preserves three separate location concepts:

- **Private base:** private geography used only for authorized internal operations.
- **Public premises:** optional geography stored only with explicit publication consent.
- **Service area:** non-private polygon used for service compatibility, especially for mobile providers.

Workspace reads expose booleans and a public-safe locality only. Coordinates and service-area WKT are write-only in provider responses and are excluded from audit metadata.

## Recoverable upload model

Phase 6 introduces a logical upload intent above the existing private evidence upload session.

```text
logical upload intent
  ├── attempt 1 → private upload session A → interrupted
  ├── attempt 2 → private upload session B → completed
  └── one immutable evidence version created by session B
```

The logical intent persists:

- provider, creator, case and requirement scope;
- an idempotent client intent key;
- safe document contract metadata;
- attempt count and recoverable state;
- active session reference and submitted evidence reference;
- safe error code and timestamps.

It does not persist evidence bytes, signed URLs, raw idempotency secrets, hashes, object keys or reviewer data.

Database triggers prove that every attempt and session matches the same provider, creator and requirement. Confirmation remains transactional: a case/provider/requirement or lifecycle mismatch rolls back the evidence item, version, case link and session completion together.

## Provider-safe verification timeline

The provider timeline is derived from cases, linked evidence, immutable decisions and scoped claims. It returns allowlisted messages and safe reason codes only.

It never returns:

- reviewer or field-agent identity;
- private recommendation or decision rationale;
- object keys, signed URLs, hashes or document contents;
- internal risk data;
- other providers' events.

## Availability independence

Availability is minimal operational metadata for a selected service. Updates do not mutate:

- verification cases or decisions;
- evidence or claims;
- publication eligibility functions;
- discovery ranking weight;
- subscription or payment state.

## Deferred Phase 8 and Phase 9 surfaces

Phase 6 exposes only read-only boundaries for:

- enquiries;
- review responses;
- subscription status.

No Phase 6 route creates or mutates these resources. Phase 8 retains enquiries, contact handoff, reviews, moderation and appeals. Phase 9 retains products, entitlements, invoices, payments and webhooks.

## Operations projection

`GET /api/v1/operations/provider-workspaces` returns aggregate counts and booleans:

- provider/profile readiness;
- representative and selected-service counts;
- location configuration flags;
- open cases, corrections, current claims and publication-eligible service count;
- queued, active, interrupted/retryable, submitted and terminal upload counts.

It explicitly returns `coordinatesExposed: false`, `evidenceIdentifiersExposed: false` and `objectKeysExposed: false`.

## Production stop gates

Phase 6 does not authorize:

- real provider or evidence records;
- production object storage or upload endpoints;
- map, geocoding or background-location services;
- enquiries, WhatsApp/call handoff or reviews;
- products, payments, invoices or webhooks;
- deployment or public pilot traffic.
