# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED |
| Owner/agent | OpenAI GPT-5.6 Thinking — Phase 7 operations and field-workflow agent |
| Phase | Phase 7 — Operations portal and field workflow |
| Task | Implement scoped triage, secure evidence review, field assignments and inspections, escalations, four-eyes overrides, incident/expiry dashboards and privacy-safe operational reporting |
| Modules/paths | `database`, `backend/direkt-api`, `admin/direkt-operations-portal`, `docs/backend`, `docs/api`, `docs/architecture`, `docs/security`, `docs/testing`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `RISK_REGISTER.md` |
| Claimed at | 2026-07-16 after Phase 6 checkpoint merge and branch synchronization |
| Expected handoff | Reviewed operations and field-workflow checkpoint with assigned private review access, scoped inspections, immutable escalations/decisions, four-eyes high-risk controls, aggregate dashboards and green permanent CI |
| Last clean checkpoint | `3083b54278c73ce74f53db800c2ec0dfc59c4dde` |
| Governing issue | Issue #28 |

## Stable predecessor

Phase 6 completed through PR #26 and Issue #25.

```text
Phase 6 reviewed source head: aa10d727091c4e742f0a26c41b00daa07c5000ad
Phase 6 verified final head:  0358cca3bad5b93e146ddca2f07d7ff43c9cc063
Phase 6 merge commit:         3083b54278c73ce74f53db800c2ec0dfc59c4dde
Issue #25:                    closed as completed
```

Final exact-head workflows passed: Backend/PostGIS #497, Android #287, Operations Portal #272 and Documentation #876. `main` and `build/android-v1` were synchronized before this Phase 7 claim.

## Phase 7 objective

Create a bounded synthetic operations workflow that lets authorized staff triage verification work, review private evidence through assigned short-lived access, coordinate field inspections, record reasoned recommendations and decisions, apply distinct four-eyes approval to high-risk overrides, and inspect privacy-safe complaint, incident, expiry and operational reporting projections.

## Delivery stages

### Stage 7A — triage contracts and scoped queues

- define deterministic queue priorities, ages, service-level states and escalation metadata;
- enforce role-specific queue visibility from server permissions;
- keep provider, category, requirement, case and assignment identifiers distinct;
- provide empty, normal, overdue, blocked and escalated synthetic states;
- prove finance, support, provider and field-agent roles cannot acquire reviewer or final-decision authority.

### Stage 7B — secure evidence review workspace

- issue short-lived private evidence grants only to active assigned reviewers;
- provide review-safe evidence metadata without storage keys or persistent URLs;
- audit access, recommendation, correction and review actions;
- enforce immediate revocation and expiry behavior;
- prevent submitters, providers, unassigned operators and field agents from final approval.

### Stage 7C — field assignment and structured inspections

- create scoped field-visit assignment lifecycle;
- add structured inspection templates and observations;
- require actor, timestamp, reason and policy version;
- support reassignment, cancellation, missed and unable-to-verify states;
- keep all field observations advisory and non-decisional.

### Stage 7D — escalations and four-eyes controls

- preserve immutable reason-code/result and active-review lifecycle rules;
- add explicit escalation records with severity, owner, due date and resolution state;
- require two distinct authorized identities for high-risk overrides;
- reject requester/self/duplicate approvers;
- prove overrides cannot bypass mandatory evidence or publication policy.

### Stage 7E — complaints, incidents, expiry and reporting

- add bounded operations complaint and incident records without implementing Phase 8 interaction workflows;
- provide expiry/renewal dashboards for evidence and claims;
- provide aggregate queue, review, correction, field, escalation and expiry metrics;
- keep reporting export-safe and privacy-allowlisted.

### Stage 7F — operations portal experience

- build triage, secure review, field assignment, escalation, incident, expiry and reporting pages;
- enforce permission-aware navigation and actions;
- support keyboard, focus and screen-reader semantics;
- add loading, empty, overdue, access-denied, revoked and conflicting-action states;
- keep the portal API-only with no database or storage imports.

### Stage 7G — checkpoint promotion

- update OpenAPI, architecture, authorization, evidence, field-safety, privacy, testing, decisions and risks;
- obtain green backend/PostGIS, Android, portal and documentation workflows on one reviewed exact head;
- repair valid review findings with permanent regressions;
- merge automatically, close Issue #28 and synchronize the build branch.

## Acceptance criteria

The active owner must:

1. preserve all Phase 3–6 identity, evidence, claim, publication, provider-scope and location boundaries;
2. enforce role-specific triage queues and cross-role denial;
3. grant private evidence access only to active assigned reviewers through short-lived audited grants;
4. make revoked, expired and unassigned access fail immediately;
5. keep field assignments and inspections provider/category/check scoped and advisory;
6. prevent field agents from recommendations, final decisions or claims;
7. preserve immutable decisions and reason-code/result compatibility;
8. require two distinct authorized approvers for high-risk overrides;
9. prevent requester, submitter, self-approval and duplicate-approver combinations;
10. prevent overrides from bypassing mandatory evidence, provider/category scope or publication policy;
11. keep complaints/incidents bounded to operations and avoid Phase 8 interaction/review mutations;
12. keep expiry and reporting projections aggregate and privacy-safe;
13. provide permission-aware, accessible portal workflows and critical states;
14. add database, HTTP, service and portal regression evidence;
15. update OpenAPI, architecture, security, testing, decisions, risks and project status;
16. obtain green permanent workflows on one reviewed exact head;
17. repair valid review findings, merge, close Issue #28 and synchronize the branch.

## Non-negotiable stop gates

- No real provider, customer, evidence, complaint, incident or field-visit records.
- No production credentials, storage, maps, messaging, payments, deployment or public pilot.
- Operations portal remains API-only and cannot import backend, database or storage modules.
- Evidence access is private, short-lived, assigned, audited and revocable.
- A field agent cannot make a final decision or create a claim.
- Submitters and providers cannot approve their own evidence.
- High-risk overrides require two distinct authorized approvers.
- Commercial state, profile completion, availability and direct edits cannot create claims or publication.
- Private coordinates, object keys, document content, identity numbers, signatures and reviewer private notes remain outside dashboards and reports.
- Phase 8 retains enquiries, interaction history, reviews, moderation, appeals and tracked complaint linkage.
- Phase 9 retains products, entitlements, subscriptions, invoices, payments and webhooks.

## Required regression evidence

At minimum, prove:

- reviewer, field-agent, support, finance and admin queue permissions behave as designed;
- private evidence grants require an active matching assignment and expire/revoke correctly;
- field observations cannot create decisions or claims;
- four-eyes approvals require distinct eligible identities and cannot bypass evidence gates;
- complaint/incident records expose no Phase 8 review or interaction mutation;
- expiry/reporting projections contain no evidence IDs, object keys, private coordinates or reviewer notes;
- portal navigation and actions follow server permissions;
- fixtures contain no real people, providers, evidence, credentials or production endpoints.

## Conflict rule

A second agent must not modify the listed Phase 7 paths while this lock is claimed. Read-only review is allowed. A stale or ambiguous lock must be resolved explicitly rather than overwritten by assumption.
