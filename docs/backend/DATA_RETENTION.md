# DIREKT Data Retention and Deletion

**Baseline:** Phase 10 synthetic system — 2026-07-17  
**Status:** Technical lifecycle model. Final periods require qualified Zambia legal, tax, consumer, employment and sector review before real processing.

## Principles

- retain only for a documented purpose and owner;
- use the shortest defensible period;
- distinguish active, grace, historical, legal/safety/fraud hold, deletion-pending, anonymized and deleted states;
- private evidence, contact and precise location receive stricter access and shorter operational exposure than public profile data;
- deletion does not rewrite required audit, decision, complaint, incident or financial history;
- preserved history must be minimized and access restricted;
- vendors, object storage, search indexes, exports and backups must follow the same disposition policy;
- a user-interface delete button is not sufficient evidence of end-to-end deletion;
- real retention periods remain a legal stop gate until approved.

## Lifecycle states

| State | Meaning | Allowed processing |
|---|---|---|
| Active | required for a current account, service, claim, interaction or contract | documented primary purpose and necessary security/support |
| Grace | temporary recovery/appeal/payment/expiry window | restricted purpose; no new unrelated use |
| Historical | primary activity ended but bounded accountability/legal purpose remains | read-only/minimized, role restricted |
| Hold | authorized legal, safety, fraud, dispute or incident preservation | preserve scoped records; suspend ordinary deletion; periodic review |
| Deletion pending | eligible data queued for deletion/anonymization and vendor propagation | no ordinary use; retry/exception handling only |
| Anonymized | identifiers irreversibly removed while aggregate value remains | approved aggregate/statistical use only |
| Deleted | removed from active systems and scheduled out of backups | none |

## Baseline schedules requiring legal confirmation

These are design windows, not approved legal periods.

| Data class | Active trigger | Baseline disposition design | Hold/exception |
|---|---|---|---|
| Authentication challenge | challenge issued | delete code/contact challenge material shortly after expiry/consumption; retain bounded abuse result only | security/fraud investigation |
| Active session | session created | retain until expiry/revocation; retain minimized compromise/audit history separately | security incident/legal hold |
| Account/contact | active account and verified channel | retain while account active; remove/anonymize eligible profile/contact after verified closure | complaints, fraud, legal obligation |
| Provider profile | provider relationship | active profile while contracted; safe public projection removed promptly after unpublication; minimized historical accountability retained | disputes, verification/legal hold |
| Private precise location | current service/verification need | remove obsolete coordinates promptly; retain only minimized location-change/audit fact where justified | safety/fraud/claim dispute |
| Public premises consent | active explicit consent | stop public display immediately on withdrawal; delete coordinates when no separate lawful need remains | dispute proof stores consent event, not unnecessary coordinates |
| Unsubmitted/abandoned upload | logical upload not confirmed | short automated cleanup window for object/session metadata | active security investigation |
| Rejected evidence | rejection/appeal final | delete bytes after bounded correction/appeal/fraud window; preserve minimized decision provenance | fraud/legal/authority hold |
| Approved evidence | claim validity/renewal | retain for active validity and bounded renewal/appeal period; then delete bytes where possible while preserving minimized decision audit | legal/category obligations |
| Verification decision/claim | decision issued | immutable decision and scoped claim history for accountability; public claim ends at expiry/revocation | appeal, legal or fraud hold |
| Search telemetry | search event | aggregate/de-identify early and remove device/session linkage quickly | security abuse investigation |
| Saved provider | customer save | retain until removal/account closure | none beyond bounded audit where needed |
| Enquiry/interaction | enquiry created | retain through support, handoff, completion, review eligibility and complaint window; then minimize/anonymize where possible | complaint, fraud, legal hold |
| Contact handoff | consent grant | raw contact remains in account contact store; provider grant expires at 24 hours; preserve minimized consent/revocation event | complaint/privacy investigation |
| Review/response | review submitted | public content while published; retain moderation/appeal provenance after removal with restricted access | defamation/consumer/legal hold |
| Complaint/report/appeal | record opened | retain through resolution and legally approved consumer/dispute period | litigation/regulatory hold |
| Internal incident | incident opened | severity-based operational/security schedule and post-incident evidence | legal/regulatory/insurance hold |
| Subscription | contract begins | active contract plus approved customer-support/accounting period | dispute/tax/legal hold |
| Invoice/receipt/ledger | financial event | statutory accounting/tax period determined by Zambia advisers; append-only/minimized | audit, tax, litigation hold |
| Webhook receipt | provider event | bounded reconciliation/audit period; no raw body is retained | payment dispute/security incident |
| Reconciliation/adjustment | exception/request opened | retain through resolution plus approved accounting/audit period | audit/tax/litigation hold |
| Operations assignment/grant | assignment begins | active assignment plus bounded access-audit period | incident/investigation hold |
| Audit/security logs | event created | tiered operational schedule: short searchable window, longer restricted archive only if justified | active incident/legal hold |
| CI/build artifacts | workflow run | short diagnostic retention; exclude secrets/private data; delete temporary correction artifacts immediately | security investigation using sanitized copies |
| Research/pilot data | consented collection | consent-specific schedule, pseudonymization and promised deletion date | ethics/legal hold only when disclosed/authorized |
| Analytics | event captured | raw identifiers removed quickly; aggregate only after approved purpose and provider | security investigation with strict scope |

## Deletion workflow

1. authenticate the requester and record request/policy version;
2. identify the subject, provider/workspace relationships and data classes;
3. identify legal, consumer, tax, safety, fraud, dispute and audit obligations;
4. place scoped restrictions or holds with owner, reason, start, review and expiry criteria;
5. revoke sessions, grants, publication and external-adapter access where applicable;
6. delete or irreversibly anonymize eligible active-database records through controlled functions;
7. delete eligible private objects and invalidate signed URLs/sessions;
8. propagate deletion to search, analytics, communications, payment and other processors;
9. prevent deleted data from being restored into active use from backup;
10. record exceptions/retries without storing the deleted content in diagnostics;
11. verify completion and provide a bounded response to the requester;
12. retain only the minimized proof necessary to show the request was handled.

## Holds

A legal, safety, fraud, dispute, tax, incident or regulatory hold requires:

- authorized owner and permission;
- affected person/provider/data classes;
- reason and authority;
- start date and review date;
- scope minimization;
- access restrictions;
- release criteria;
- release/deletion confirmation.

Indefinite or undocumented holds are prohibited.

## Backups

- backup retention must be shorter than or consistent with approved schedules;
- deleted data may remain in encrypted immutable backups only until normal expiry unless a valid hold applies;
- restored environments must reapply deletion tombstones/revocations before service resumes;
- backup access requires restricted operations/security authorization and audit;
- restore exercises must verify integrity without exposing private data in logs/artifacts;
- object-storage and database recovery objectives are defined in Stage 10F.

## Vendor and export disposition

Every processor/export must support:

- inventory and ownership;
- deletion or irreversible anonymization;
- sub-processor propagation;
- termination export and deletion evidence;
- backup-expiry statement;
- incident cooperation;
- cross-border authorization compatibility;
- audit trail without protected content.

## Engineering requirements

Before real processing, implement permanent tests for:

- expiry and cleanup jobs;
- revoked/expired signed grants;
- publication/contact handoff removal;
- deletion request authorization and idempotency;
- legal-hold protection and release;
- private-object deletion and error handling;
- vendor propagation state;
- backup tombstone/revocation replay;
- safe audit proof and log redaction;
- no reappearance after restore.
