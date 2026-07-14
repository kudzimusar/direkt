# DIREKT Integration Architecture

## Adapter rule

All third-party services are accessed through a DIREKT-owned interface. Domain code must not depend directly on vendor payloads.

## Integration categories

- maps/geocoding/routing;
- SMS/OTP;
- push;
- email;
- payments/mobile money;
- identity/business/credential lookup;
- malware/document processing;
- error monitoring/analytics.

## Required integration specification

For each vendor document:

- purpose and data shared;
- credentials and environment separation;
- API limits/costs;
- timeout/retry;
- idempotency;
- webhook authentication/replay protection;
- error mapping;
- outage/degradation behaviour;
- retention/subprocessors;
- sandbox/test strategy;
- replacement/export plan;
- monitoring and reconciliation.

## Webhooks

- raw body preserved where signature requires;
- timestamp/signature checked;
- replay window enforced;
- event ID idempotent;
- processing asynchronous after safe acknowledgment;
- unknown events retained safely for investigation;
- no trust state controlled directly by unauthenticated payload.

## Vendor approval gate

No integration enters production without product, security, privacy, cost and operations review.
