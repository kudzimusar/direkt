# Phase 7 Operations Backend

**Runtime:** Node.js 24, npm 11, NestJS 11.1.x, TypeScript 5.9.x  
**Database:** PostgreSQL 18 with PostGIS 3.6  
**API prefix:** `/api/v1/operations`

## Modules

Phase 7 extends the backend with four bounded operations domains:

- triage queues;
- field work;
- escalations and high-risk overrides;
- incidents, expiry and reporting.

Private evidence review remains owned by the verification-evidence module and is exposed to operations only through assigned, audited access contracts.

## Database migrations

| Migration | Purpose |
|---|---|
| `202607162200_operations_triage_foundation.sql` | Role-scoped deterministic queues and service-level state |
| `202607162230_operations_evidence_review_grants.sql` | Assigned short-lived private evidence access |
| `202607162300_operations_field_workflow.sql` | Templates, assignments, submissions and advisory field lifecycle |
| `202607162301_operations_field_reassignment_fk.sql` | Deferred atomic replacement reference |
| `202607162330_operations_escalations_overrides.sql` | Escalations and four-eyes override records |
| `202607162331_operations_override_approval_serialization.sql` | Concurrent approval serialization |
| `202607162400_operations_incidents_expiry_reporting.sql` | Bounded incidents, expiry views and aggregate metrics |
| `202607162401_operations_review_trust_boundaries.sql` | Incident ownership and public-safe field text controls |
| `202607162402_operations_field_work_item_scope_fix.sql` | Unambiguous scoped field-work trigger validation |

All migrations are forward-only, checksummed and executed transactionally per file.

## HTTP behavior

- `403` means the session lacks the required permission.
- `404` is used for scoped resources that must not disclose another operator's ownership or assignment.
- `400` is used when a database-enforced scope, privacy or lifecycle rule is violated.
- `409` is used for active-work conflicts, duplicate approvals and idempotency-key payload conflicts.

## Field-work rules

- Creation requires an active global `field_agent` role and a non-terminal scoped verification case.
- Work items are bound to one verification assignment and one effective inspection template.
- `scheduled -> accepted -> in_progress` is the normal execution path.
- `missed` is valid from `scheduled` or `accepted`; it is not valid after work has started.
- `unable_to_verify` and `safety_abort` are valid after work has started.
- Submissions are immutable and idempotent by work item plus client submission key.
- Field submissions remain advisory and do not create verification decisions, claims or publication.

## Incident and override rules

- Incidents are operations-internal records and do not create Phase 8 customer interaction or review history.
- Only the assigned incident owner may resolve an incident unless the actor has active global `trust_supervisor` or `admin` authority.
- Terminal incident resolution fields are immutable.
- High-risk overrides require two distinct authorized approvers.
- Requester, self and duplicate approvals are rejected.
- Mandatory evidence, provider/category scope and publication policy remain non-bypassable.

## Reporting rules

Expiry and reporting endpoints return fixed allowlisted projections. Provider/evidence identifiers are omitted from aggregate export, and no endpoint returns object keys, document contents, precise private coordinates or reviewer private notes.
