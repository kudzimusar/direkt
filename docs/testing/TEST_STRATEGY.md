# DIREKT Test Strategy

## Quality model

Test at the lowest reliable layer, then prove critical journeys end to end.

### Layers

- static analysis/format/type checks;
- domain unit tests;
- repository/data tests;
- database/API integration;
- contract tests;
- Android ViewModel/Compose;
- admin component/browser;
- security/authorization;
- performance/resilience;
- pilot acceptance.

## Risk priority

Highest coverage:

- trust-state transitions;
- evidence access;
- location privacy;
- provider/tenant authorization;
- payment idempotency;
- review eligibility;
- expiry/revocation;
- offline upload;
- complaint/enforcement;
- account/session security.

## Environments

- local synthetic;
- CI ephemeral;
- shared development;
- staging/pilot with synthetic/approved test data;
- production smoke tests that do not mutate sensitive state unexpectedly.

## Test data

Factories and deterministic synthetic fixtures. No copied production identity/evidence.

## CI

Every push runs relevant checks. Phase checkpoint runs full suites, migration verification, docs and security scans. Flaky tests are defects.

## Evidence

Store machine-readable reports/artifacts with retention appropriate to public repository privacy.

## Phase 9 commercial validation

Permanent Phase 9 tests cover actor-resolved provider scope, hashed idempotency and fingerprint conflicts, subscription states, immutable invoice lines, signed/timestamped webhook processing, replay/conflict handling, amount/currency mismatch reconciliation, balanced append-only ledger posting, two-approver adjustments, production-disabled adapters, credential/privacy leak assertions, Android process-death recovery and accessible commercial states, portal finance-permission separation, API-only architecture and before/after trust independence. Promotion requires backend, Android, portal and documentation gates on one exact reviewed head.
