# DIREKT Android Test Plan

## Unit

ViewModels, use cases, mappers, validators, ranking presentation, state reducers, permission logic, upload queue and date/expiry display.

## Compose UI

- navigation and back;
- loading/empty/error/offline;
- trust-card wording/states;
- form validation and draft;
- location fallback;
- font scale;
- TalkBack semantics;
- duplicate-submit prevention.

## Integration

Mock server/API contract, Room migrations, WorkManager upload/retry, notification deep link, session expiry and account switch.

## Device tests

Minimum/current Android, low-resource device, small/large screens, poor network, low storage, denied permissions and process death.

## Critical E2E

Customer search/profile/enquiry/review; provider onboarding/evidence/action-required; suspension/expired check; logout cleanup.

## Release

Signed staging build on physical devices, crash/ANR review and Play pre-launch report when available.
