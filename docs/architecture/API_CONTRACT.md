# DIREKT API Contract

## Conventions

Base: `/api/v1`  
Content: JSON except authorized file upload/download flows.  
Time: ISO 8601 UTC.  
IDs: opaque UUID-style values.  
Money: `{ "amountMinor": 1000, "currency": "ZMW" }`.

## Authentication

Bearer access token plus approved session/refresh mechanism. Privileged portal roles require stronger policy. Tokens never carry trust facts as authoritative state.

## Error shape

```json
{
  "type": "https://docs.direkt.example/problems/validation",
  "title": "Validation failed",
  "status": 422,
  "code": "EVIDENCE_INVALID",
  "detail": "The submitted file does not meet this evidence requirement.",
  "instance": "/api/v1/verification-cases/...",
  "correlationId": "..."
}
```

Field errors may be included in a safe extension.

## Endpoint groups

- `/auth/*`
- `/me`, `/sessions`, `/consents`
- `/places`, `/categories`, `/services`
- `/providers`, `/providers/{id}/services`, `/providers/{id}/locations`
- `/providers/{id}/verification-cases`
- `/verification-cases/{id}/evidence`
- `/operations/verification-cases`
- `/operations/field-visits`
- `/search/providers`
- `/enquiries`, `/enquiries/{id}/events`
- `/interactions/{id}/reviews`
- `/reports`, `/complaints`, `/appeals`
- `/plans`, `/subscriptions`, `/payments/webhooks/{provider}`
- `/notifications`
- `/operations/audit`

## Pagination

Cursor-based:

```json
{
  "items": [],
  "page": { "nextCursor": "...", "hasMore": false }
}
```

## Concurrency

Mutable profiles use a version/ETag. Conflict returns 409 with safe current metadata. Verification decisions are append-only rather than overwritten.

## Idempotency

Required for:

- enquiry creation;
- evidence submission finalization;
- payment attempts;
- webhook processing;
- high-impact operations actions;
- queued mobile writes.

## Files

API creates an authorized upload session with type/size/checksum constraints. Client uploads to private storage, then finalizes. Finalization performs validation/scanning and creates immutable evidence version. Download/view access is short lived and audited.

## Versioning

Breaking changes create new major API version. Additive fields are allowed; clients ignore unknown fields. OpenAPI is committed/generated and contract-tested.
