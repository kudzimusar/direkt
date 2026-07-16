# Phase 7 Review Regressions

**Pull request:** #29  
**Governing issue:** #28  
**Fixture policy:** Synthetic data only

## Review findings repaired

| Finding | Permanent correction | Regression evidence |
|---|---|---|
| Incident resolution could be attempted by an unrelated support operator | PostgreSQL now permits the assigned owner, active global trust supervisor or administrator only; terminal resolution is immutable | `operations-reporting.e2e.spec.ts` rejects unrelated support resolution before the owner resolves |
| Public-returning field text could contain precise location or private storage references | Reusable PostgreSQL public-safe text checks cover work reasons, terminal text, summaries and observation notes | `operations-field-workflow.e2e.spec.ts` rejects coordinate pairs and private object paths |
| Field-work creation failed because a PL/pgSQL variable shadowed an assignment column | Forward-only migration qualifies assignment columns and preserves scope checks | All field-work lifecycle tests create scoped assignments successfully |
| Reassignment migration assumed a generated foreign-key name | Migration discovers the existing self-reference and replaces it with the deferred named constraint | Migration verification and atomic reassignment test pass |
| Override fixture linked case evidence through an obsolete path | Fixture now seeds the current mandatory evidence snapshot without the retired link insertion | High-risk override evidence-gate and four-eyes tests pass |
| Expiry privacy assertion rejected the safe `objectKeyIncluded: false` flag | Assertion now checks concrete serialized key fields and storage URLs | Reporting expiry test confirms flags remain visible while storage metadata is absent |
| Missed-visit test advanced the item to `in_progress` before recording `missed` | Fixture records `missed` from `accepted`, preserving the stricter lifecycle | Parameterized field terminal-state regression passes for `missed` and `unable_to_verify` |
| Field repository audit request identifier conflicted with `exactOptionalPropertyTypes` | Audit input accepts explicit `string | undefined` | Strict TypeScript passes |

## Permanent gate coverage

Backend CI verifies:

- formatting and ESLint;
- strict TypeScript;
- forward-only migration application and checksum verification;
- database, integration, service and HTTP regressions with coverage;
- production JavaScript build;
- generated OpenAPI validation.

Operations portal CI verifies:

- formatting, lint and strict TypeScript;
- permission-aware navigation and actions;
- keyboard and accessibility behavior;
- loading, empty, overdue, denied, revoked and conflict states;
- production Next.js build;
- API-only architecture isolation.

## Security assertions

The Phase 7 regressions prove that:

- unassigned and revoked private evidence access fails;
- field observations create no decisions or claims;
- requester, self and duplicate high-risk approvals fail;
- overrides cannot bypass mandatory evidence or publication policy;
- unrelated support operators cannot resolve another owner's incident;
- precise coordinates and private storage references cannot enter public-returning field text;
- reporting output contains no storage paths, document content, private coordinates or disallowed identifiers;
- the portal cannot import database or storage modules.

## Deferred validation

Real provider/customer data, production storage, field-verification economics, legal/privacy review, representative devices/connectivity, maps, messaging, payments and public pilot operation remain outside this checkpoint and are retained by Issue #5 and later phases.
