# DIREKT Threat Model

## Assets

Identity documents, qualification evidence, precise locations, accounts/sessions, public trust claims, payment records, complaint data, signing keys and audit records.

## Actors

External attacker, fraudulent provider/customer, compromised device, malicious insider, colluding field agent/reviewer, third-party compromise and accidental operator.

## Key threats and mitigations

| Threat | Mitigation |
|---|---|
| IDOR/cross-provider access | object-scope authorization and tests |
| Evidence URL leakage | private objects, short-lived signed access, audit |
| Trust claim forgery | server derivation, constraints, audit, separation |
| Account takeover | OTP controls, sessions, MFA privileged, recovery |
| Location exposure | data-class separation, coarsening, logging rules |
| Forged files | validation, review, source checks, immutable versions |
| Webhook replay | signature, timestamp, idempotency |
| Fake reviews | tracked interaction eligibility/anomaly review |
| Insider evidence browsing | purpose access, audit, alerts, least privilege |
| Public Pages leak | synthetic-only policy and CI scan |
| Supply-chain compromise | lockfiles, scanning, minimal dependencies, signed release |
| Denial of service | rate limits, quotas, queues, scaling/degradation |

## Abuse cases

- provider submits a competitor’s certificate;
- customer uses enquiries to harvest phone numbers;
- staff approves own/related provider;
- provider changes exact pin after verification;
- field agent reuses old photos;
- paid provider attempts to suppress negative review;
- attacker enumerates account existence.

Each implemented feature adds abuse tests and updates this model.
