# DIREKT Security Model

## Security objectives

- protect identity, evidence, private location and financial data;
- prevent unauthorized trust-state changes;
- maintain provider/customer isolation;
- preserve auditability;
- remain usable on consumer Android devices;
- support incident detection/recovery.

## Controls

### Identity/access
Secure sessions, privileged MFA, least privilege, object authorization, step-up and revocation.

### Android
Keystore, app-private storage, safe networking, no secrets, tamper/resilience review, secure logout and dependency control.

### API
TLS, validation, rate limiting, authorization, idempotency, safe errors, CSRF protections for portal model, CORS restrictions.

### Data/storage
Private objects, signed access, encryption, database roles, backups, retention, public/private projections.

### Trust integrity
Derived claims, state-machine constraints, separation of duties, audit and override review.

### Operations
Evidence access logs, session timeout, export controls, production access, incident response.

### Supply chain
Pinned/locked dependencies, code scanning, secret scanning, signed builds/artifacts and update review.

## Assurance

Threat modelling per phase, automated security tests, review before pilot, independent assessment before broad production as resources permit.
