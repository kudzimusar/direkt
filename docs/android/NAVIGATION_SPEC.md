# DIREKT Android Navigation Specification

## Route principles

- typed/stable route arguments;
- pass IDs, not entire sensitive objects;
- backend re-authorizes destination data;
- deep links require authentication/role checks;
- unavailable/suspended entity has safe destination;
- system back returns predictably;
- bottom destination state is preserved within memory limits.

## Route groups

- `auth/*`
- `customer/discover`
- `customer/results`
- `provider/{publicId}`
- `provider/{publicId}/trust`
- `enquiries/{id}`
- `reviews/{interactionId}`
- `provider-mode/overview`
- `provider-mode/onboarding/{step}`
- `provider-mode/verification/{caseId}`
- `account/*`
- `support/*`

## Deep links

Candidates:

- shared public provider profile;
- enquiry notification;
- verification action;
- payment/receipt;
- support ticket.

All links use HTTPS app links when domain is approved. Sensitive links expire or require session.

## Role guard

A route that manages provider data verifies current provider membership server-side. Mode selection is UX context, not authorization.

## Navigation tests

- cold deep link;
- logged-out redirect/resume;
- revoked role;
- expired entity;
- back stack after external call;
- process recreation;
- notification link;
- malicious/unknown ID.
