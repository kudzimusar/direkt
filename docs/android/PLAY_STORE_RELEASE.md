# DIREKT Play Store Release

## Accounts and signing

- organization-controlled Play Console;
- Play App Signing;
- production upload key protected and recoverable;
- separate debug/staging signing;
- no signing secrets in repository.

## Tracks

1. internal testing;
2. closed pilot testing;
3. optional open testing;
4. staged production.

## Required preparation

- application ID and brand ownership;
- store listing;
- screenshots using synthetic/consented content;
- privacy policy;
- terms/support route;
- data-safety form matching implementation;
- content rating;
- permissions declarations;
- target API/current policy check;
- tester instructions and feedback route;
- country/device availability;
- release notes.

## Quality gate

- signed AAB reproducible;
- CI tests green;
- crash/ANR thresholds acceptable;
- accessibility/device matrix passed;
- backend compatibility;
- migration test;
- monitoring/support ready;
- rollback/hotfix procedure;
- staged rollout stop criteria.

## Policy drift

Google Play requirements change. Re-check official requirements during scaffolding, closed testing and every production release rather than relying on this planning date.
