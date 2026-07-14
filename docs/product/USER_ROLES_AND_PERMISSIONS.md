# DIREKT User Roles and Permissions

Permissions are enforced by the backend and reflected in the clients. Hidden UI is not authorization.

## Core principles

- deny by default;
- roles are scoped to an organization/provider where applicable;
- privileged operations require stronger authentication;
- evidence access is purpose-limited and audited;
- no role may approve its own submitted evidence;
- finance staff cannot alter verification;
- field agents cannot grant final approval unless policy explicitly assigns a limited check;
- auditors are read-only.

## Permission matrix

| Capability | Customer | Provider owner | Provider member | Field agent | Reviewer | Support | Trust supervisor | Finance | Admin |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Search public providers | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create enquiry | ✓ | ✓ as customer | ✓ as customer | — | — | — | — | — | — |
| Manage own provider profile | — | ✓ | scoped | — | — | — | — | — | emergency only |
| Submit provider evidence | — | ✓ | scoped | visit only | — | — | — | — | emergency only |
| View provider-private evidence | — | own submissions | own submissions | assigned visit subset | assigned cases | limited metadata | escalated cases | — | controlled |
| Decide verification check | — | — | — | structured visit outcome only | ✓ | — | override/appeal | — | controlled |
| Assign field visit | — | — | — | — | ✓/lead | — | ✓ | — | ✓ |
| Manage support ticket | own | own | own | own | limited | ✓ | ✓ | billing only | ✓ |
| Moderate review | own report | response only | response only | — | — | limited | ✓ | — | ✓ |
| Suspend provider | — | — | — | — | recommend | recommend | ✓ | — | emergency |
| View payment ledger | own receipts | provider receipts | scoped | — | — | limited | — | ✓ | ✓ |
| Change plans/prices | — | — | — | — | — | — | — | recommend | ✓ |
| Manage roles | — | provider members | limited | — | — | — | operations roles limited | — | ✓ |
| Export data | own | own provider | scoped | — | case-limited | ticket-limited | controlled | financial | controlled |

## Provider roles

### Provider owner
- legal/primary controller;
- can invite/remove members;
- can submit declarations;
- cannot erase audit history;
- sensitive owner change triggers re-verification.

### Provider manager
- manages profile, service areas, enquiries and evidence according to grant;
- cannot transfer ownership;
- cannot view unrelated private owner identity fields.

### Provider responder
- handles enquiries and public responses;
- cannot change trust evidence or commercial ownership.

## Operations separation of duties

- Reviewer submits a decision.
- High-risk approvals, overrides or reinstatements may require a supervisor.
- Finance can reconcile payment but cannot edit check outcomes.
- Support can gather information but cannot silently change trust state.
- Admin emergency actions require reason, audit event and retrospective review.

## Permission implementation requirements

- central permission policy in backend;
- provider/tenant scope in every protected query;
- object-level authorization;
- automated allow and deny tests;
- short-lived evidence URLs;
- permission change invalidates relevant sessions or caches;
- no privilege derived from mutable client claims alone.
