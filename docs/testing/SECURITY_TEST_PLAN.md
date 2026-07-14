# DIREKT Security Test Plan

## Automated

- secret and dependency scanning;
- static analysis;
- authorization matrix tests;
- input/file validation;
- webhook signature/replay;
- session/revocation;
- evidence URL expiry;
- public/private serialization;
- rate limits;
- audit event assertions.

## Manual/independent

Before pilot:

- IDOR and role escalation;
- Android local storage/log inspection;
- portal session/CSRF/XSS;
- file upload/storage;
- location exposure;
- trust-state tampering;
- payment flow;
- backup/restore access;
- Pages/public asset review.

## Abuse scenarios

Collusion, duplicate provider, fake review, account recovery attack, OTP enumeration, field evidence replay and complaint harassment.

## Findings

Severity, evidence, affected version, owner, due date, regression test and risk acceptance. Critical/high blocks release unless formally resolved/accepted by authorized owner.
