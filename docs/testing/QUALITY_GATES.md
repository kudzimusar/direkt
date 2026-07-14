# DIREKT Quality Gates

## Every push

- formatting/lint/type;
- unit tests;
- documentation validation;
- secret scan;
- build affected workspace.

## Phase checkpoint

- full Android/backend/admin test;
- database migration from baseline;
- contract test;
- authorization/security suite;
- Pages strict build;
- dependency review;
- synthetic E2E;
- status/risk/decision updates.

## Pilot gate

- acceptance and device matrix;
- accessibility;
- threat review;
- restore exercise;
- performance/resilience;
- legal/privacy;
- support/operations drill;
- no open critical/high unless documented exceptional acceptance.

## Production gate

All pilot gates plus Play policy/data safety, signed artifact, monitoring/alerts, incident/rollback, staged rollout and production smoke.

## Evidence

CI links, commands/results, test report artifact, known limitations and approval.
