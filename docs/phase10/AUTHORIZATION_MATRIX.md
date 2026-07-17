# Phase 10 Authorization and Tenant-Isolation Matrix

**Baseline date:** 2026-07-17  
**Governing issue:** #41  
**Checkpoint PR:** #42  
**Generated route evidence:** `artifacts/diagnostics/authorization-policies.json`

## Objective

Prove that every DIREKT HTTP operation is explicitly classified, every protected action uses a registered permission, provider tenancy is resolved by the server, and high-risk database functions preserve authorization even if a controller or client is defective.

## Current route-policy inventory

Permanent backend run #1184 produced the following exact inventory:

| Measure | Result |
|---|---:|
| Controller files | 18 |
| HTTP route operations | 135 |
| Explicit public operations | 14 |
| Explicit permission-protected operations | 121 |
| Unclassified operations | 0 |
| Public and permission double-classifications | 0 |
| Ad hoc permission expressions | 0 |

The inventory is regenerated on every backend CI run by:

```bash
npm run authorization:check
```

The check parses controller TypeScript and fails when:

- an HTTP method has neither `@PublicRoute()` nor `@RequirePermission(...)`;
- a route is declared both public and permission-protected;
- a protected operation does not use the central `PERMISSIONS` registry.

## Runtime fail-closed sequence

```text
request
  → AccessTokenGuard
      → public route: continue without actor
      → protected route: valid bearer token + active session required
  → PermissionGuard
      → public route: continue
      → missing permission metadata: deny
      → ambiguous provider policy: deny
      → actor-resolved provider policy: resolve live assignment and assert permission
      → resource provider parameter: assert permission in that provider scope
      → global policy: assert current global assignment
  → controller/service
  → database function or constrained transaction
```

A user-interface mode, visible navigation item, route parameter or request-body identifier never grants authority.

## Scope classes

| Scope class | Source of truth | Valid use | Denial conditions |
|---|---|---|---|
| Public | explicit `@PublicRoute()` metadata and public allowlist projection | health, auth challenge contract, public category/provider/search/review/catalogue and signed synthetic webhook boundary | route lacks public metadata or exposes a private lifecycle/data class |
| Own-account | authenticated identity from active session | session management, customer profile and own interaction records | missing/revoked session, different identity or invalid owner relationship |
| Actor-resolved provider | active server-side provider assignment | provider workspace, evidence upload, enquiries, review responses and commercial workspace | zero, revoked, expired or multiple active provider contexts |
| Resource-provider | validated resource/provider relationship plus permission | explicit provider resource management where a provider parameter identifies the target | copied ID, mismatched provider, inactive assignment or missing permission |
| Global operations | current global role assignment | triage, review, incident, complaint, reporting, finance and audit workspaces | absent/revoked/expired assignment or missing registered permission |
| Assigned case/purpose | active case/work assignment and permission | private evidence review and field/verification work | unassigned case, expired/revoked grant, wrong purpose or completed scope |
| Four-eyes | requester separation plus multiple independent permissions | high-risk trust override and commercial adjustment approval | requester self-approval, duplicate approver, insufficient approvers or stale state |

## Permission families

### Account and provider

- account session/profile management;
- provider profile, representative, evidence and availability management;
- provider enquiry and review-response actions.

### Verification and evidence

- evidence upload/own/private read and management;
- case creation/read/assignment/review;
- field visit, final decision and claim read/expiry.

### Discovery and interaction

- publication management/read;
- customer saves;
- enquiry, handoff, review, report and complaint own-scope operations.

### Operations and trust

- portal access, provider/triage/evidence access;
- field work, escalations, overrides, incidents and reporting;
- interaction history, review moderation and complaint management;
- provider suspension and emergency actions.

### Commercial and finance

- product, subscription, invoice and payment permissions;
- reconciliation management;
- adjustment request/approval;
- ledger read.

### Audit and administration

- audit read;
- role management;
- emergency administrative action.

Commercial permissions do not derive from verification/trust roles. Review and complaint permissions do not derive from finance. Portal navigation follows permissions but does not replace API/database enforcement.

## Database authorization review classes

Phase 10 reviews database functions in four groups:

| Group | Required independent controls |
|---|---|
| Trust/publication | active permission, assigned case/provider scope, current requirement version, allowed transition, immutable decision/event history |
| Operations | active global/assigned role, owner/purpose, revision, reason/policy version, event audit and terminal immutability |
| Interaction/accountability | customer/provider ownership, qualifying tracked interaction, one-per-scope uniqueness, consent/review eligibility and public allowlist |
| Commercial/finance | actor-resolved provider or global finance permission, idempotency/fingerprint, immutable invoice/ledger history, replay integrity, reconciliation and independent approvals |

Direct table access must not bypass these rules. Production database roles and grants require a dedicated Phase 10 review before deployment.

## High-risk actions requiring step-up design

The current synthetic platform has live permission and four-eyes checks but no production step-up authentication mechanism. The following actions require a future short-lived elevated assurance grant before real operation:

- final verification decision;
- high-risk override approval;
- provider suspension or emergency action;
- private evidence export/access outside ordinary assigned review;
- review appeal or destructive moderation outcome;
- incident closure with material impact;
- reporting export containing restricted aggregates;
- commercial adjustment approval and future real refund/reversal;
- role/permission administration;
- secret/environment activation.

Phase 10 must implement or retain a production stop gate for these actions. A UI `stepUpRequired` flag alone is not authorization.

## Permanent validation requirements

- static controller classification check on every backend build;
- OpenAPI bearer/public classification consistency;
- missing-policy and ambiguous-provider guard denial tests;
- zero/revoked/expired/ambiguous provider-assignment tests;
- copied-resource and cross-provider denial tests;
- current global-role and role-separation tests;
- assigned evidence/case purpose and expiry tests;
- requester/self-approval and duplicate-approver denial tests;
- direct database-function authorization tests;
- no protected identity, contact, evidence or rationale leakage from denied responses.

## Residual stop gates

Before production or pilot use:

- define and implement short-lived step-up assurance;
- review PostgreSQL runtime roles, grants and function execution privileges;
- complete all route-to-function mapping and verify no unguarded privileged SQL path;
- add distributed rate limits and authentication abuse monitoring;
- define privileged access review, revocation and emergency procedures;
- validate authorization on representative devices, deployed proxies and the exact private-storage environment.
