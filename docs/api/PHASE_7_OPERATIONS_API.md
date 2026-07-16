# Phase 7 Operations API

The Phase 7 internal operations API is versioned under `/api/v1`. It is the only supported boundary for the operations portal.

## Triage

- `GET /api/v1/operations/triage`
- role-scoped queue visibility;
- deterministic priority, age and service-level state;
- safe provider/category/requirement labels without evidence content.

## Evidence review

- assigned evidence review routes remain under the verification-evidence API;
- grants are short-lived, audited, revocable and restricted to the active assigned reviewer;
- response models exclude persistent URLs, object keys and private evidence bytes.

## Field work

- `POST /api/v1/operations/field-work-items`
- `GET /api/v1/operations/field-work-items`
- `GET /api/v1/operations/field-work-items/{workItemId}`
- `POST /api/v1/operations/field-work-items/{workItemId}/transitions`
- `POST /api/v1/operations/field-work-items/{workItemId}/reassign`
- `POST /api/v1/operations/field-work-items/{workItemId}/cancel`
- `POST /api/v1/operations/field-work-items/{workItemId}/submissions`

Submission responses expose only public-safe summaries, structured observations and explicit non-exposure flags. Private notes, evidence identifiers, storage metadata and precise coordinates are excluded.

## Escalations and overrides

- create, list, start and resolve escalation routes;
- create and inspect high-risk override requests;
- record independent approvals;
- requester, self and duplicate approvals fail;
- approvals do not themselves create verification decisions, claims or publication.

## Incidents, expiry and reporting

- create, list, start and resolve operations incidents;
- inspect evidence/claim expiry and renewal state;
- export only fixed aggregate operational metrics.

Incident records are internal operations controls. They do not implement customer complaints, interaction history, review moderation or appeals, which remain Phase 8.

## Authorization contract

The portal may hide unavailable navigation, but backend permission checks are authoritative. Ownership and assignment-sensitive resources use scoped `404` responses where disclosure would expose another operator's work. Database constraints remain authoritative for provider/category/case scope, lifecycle transitions, public-safe text, four-eyes approval and terminal immutability.

## OpenAPI and compatibility

The generated OpenAPI document is validated by permanent backend CI after formatting, lint, strict TypeScript, migration verification, database-backed tests and production build. Phase 7 adds operations contracts without changing Phase 8 enquiry/review or Phase 9 payment ownership.
