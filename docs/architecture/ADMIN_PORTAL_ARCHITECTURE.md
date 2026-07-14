# DIREKT Admin Portal Architecture

## Purpose

Internal operations interface for verification, field work, support, trust/safety, finance exceptions and configuration.

## Technology

Next.js with TypeScript and an accessible component system. The portal consumes the same versioned backend API; it does not connect directly to the database or object storage.

## Boundaries

- separate privileged authentication/session policy;
- no public indexing;
- server-side and backend authorization;
- evidence access through short-lived authorized URLs;
- inactivity and absolute session limits;
- auditable exports;
- restricted production diagnostics.

## Feature modules

- shell/navigation;
- verification queues/cases;
- secure evidence viewer;
- field operations;
- provider/customer support;
- trust and safety;
- subscriptions/reconciliation;
- taxonomy/evidence rules;
- audit/reporting;
- role management.

## Rendering

Use server/client rendering based on security and interaction needs. Sensitive payloads must not be embedded into public/static output or browser logs.

## Testing

- component tests;
- API-contract tests;
- browser E2E;
- keyboard/accessibility;
- role-denial tests;
- evidence URL expiry/access tests;
- audit assertions for privileged actions.
