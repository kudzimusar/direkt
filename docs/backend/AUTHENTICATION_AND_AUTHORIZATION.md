# DIREKT Authentication and Authorization

## Authentication goals

- secure phone/email identity;
- recoverable account;
- revocable sessions;
- stronger privileged access;
- Android and portal separation;
- minimal vendor lock-in.

## Session model

Implementation decision must document access-token lifetime, refresh/session storage, device list, revocation, reuse detection and recovery. Android secrets use Keystore-backed storage. Portal uses secure, HttpOnly, SameSite cookies or equivalent approved approach.

## Authorization

Backend checks:

1. authenticated identity;
2. platform role;
3. provider/organization membership;
4. object ownership/scope;
5. action-specific state;
6. step-up authentication where required.

## Sensitive actions

Require recent/step-up authentication for:

- provider ownership transfer;
- identity/contact change;
- role changes;
- evidence decision/override;
- evidence export/download;
- suspension/reinstatement;
- payment configuration;
- account deletion.

## MFA

Mandatory for operations roles before pilot. Supported factor selected during implementation; recovery is audited and not weaker than login.

## Abuse

OTP rate limits, IP/device/account controls, enumeration-safe errors, bot mitigation proportional to risk and fraud monitoring.

## Tests

Every protected endpoint has allow/deny cases, including wrong provider, revoked role, expired session and client-tampered claims.
