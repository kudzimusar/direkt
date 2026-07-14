# DIREKT Authentication and Authorization

## Status

Phase 2C implements the first testable authentication and authorization foundation. It is intentionally synthetic: no real SMS, email, OTP, Firebase, Supabase Auth or production signing system is connected.

The foundation establishes contracts that later production adapters must preserve.

## Identity boundaries

DIREKT separates these concepts:

1. **Identity** — the account-level actor.
2. **Contact** — a phone or email method associated with an identity.
3. **Contact verification** — proof that a challenge for that contact was completed.
4. **Provider membership** — authority to act for one provider organization.
5. **Provider trust claims** — later evidence-derived public claims.

Contact verification never creates a provider trust claim and never makes a provider discoverable.

Phase 2C stores a keyed SHA-256 lookup hash and a public-safe display hint for contacts. It does not persist a raw phone number or email address. The schema reserves an encrypted-value field for a later approved privacy design; it is unused in this phase.

## Passwordless challenge contract

Versioned endpoints:

```text
POST /api/v1/auth/challenges
POST /api/v1/auth/challenges/verify
```

The request endpoint always returns an enumeration-safe acceptance response. It does not disclose whether a contact is already registered.

Phase 2C uses a synthetic adapter with the fixed code `246810`. The response explicitly labels this as synthetic. Production configuration disables this adapter and requires a separately approved delivery provider.

Persisted challenge data includes only:

- opaque challenge ID;
- channel;
- keyed contact hash;
- display hint;
- keyed challenge-code hash;
- expiry;
- consumed state;
- failed-attempt count and maximum attempts;
- optional hashed request fingerprint.

Challenges are short lived, single use and attempt limited.

## Access-token policy

The foundation issues a compact HMAC-signed access token containing only:

- token version;
- issuer and audience;
- identity ID;
- session ID;
- issue and expiry timestamps.

No role, permission or provider scope is embedded in the token. Authorization is resolved from the current database state on every protected request, so a client cannot promote itself by modifying a token or request header.

Default development/test lifetime:

```text
10 minutes
```

Production secrets are mandatory and must come from an approved secret manager. Repository development secrets are visibly non-production and are rejected as a production deployment strategy.

## Refresh-session policy

Versioned endpoint:

```text
POST /api/v1/auth/sessions/rotate
```

Refresh tokens are opaque random values. Only their SHA-256 hashes are stored.

Each session belongs to a family. Rotation:

1. creates a replacement session with a new refresh-token hash;
2. revokes the previous session as `Rotated`;
3. links the previous session to its replacement;
4. returns a new short-lived access token and refresh token.

Reusing a previously rotated token is treated as compromise. The complete session family is revoked and an immutable audit event is recorded.

Session records include:

- identity and family IDs;
- hashed refresh token;
- creation, expiry and last-seen timestamps;
- revocation time and reason;
- replacement-session link;
- reuse-detection time;
- public-safe device label;
- hashed user-agent and IP fingerprints;
- step-up/MFA policy state.

## Account session management

Protected endpoints:

```text
GET  /api/v1/auth/sessions
POST /api/v1/auth/sessions/:sessionId/revoke
POST /api/v1/auth/sessions/revoke-others
```

An identity may list and revoke only its own sessions. Revoked and expired sessions cannot authenticate, even when the access-token signature is otherwise valid.

## Roles and permissions

The database defines these initial roles:

- customer;
- provider owner;
- provider member;
- provider responder;
- field agent;
- reviewer;
- support;
- trust supervisor;
- finance;
- auditor;
- administrator.

Roles are either global or provider-scoped. A database trigger rejects assignments whose scope does not match the role definition.

Temporary assignments use bounded timestamp ranges. A PostgreSQL exclusion constraint prevents overlapping grants while allowing an expired bounded grant to be re-issued later.

## Deny-by-default authorization

Every non-public controller route must declare a permission. A route without public metadata or permission metadata is denied.

The backend checks:

1. access-token signature and expiry;
2. active, non-revoked session;
3. active identity status;
4. server-side role assignments;
5. requested permission;
6. provider scope where applicable;
7. object ownership or separation-of-duties policy;
8. step-up/MFA policy where required by the action.

UI visibility is never authorization. The portal may hide navigation, but the backend remains authoritative.

## Separation of duties

Current policy tests prove that:

- an actor cannot approve evidence they submitted;
- a field agent can record a visit outcome but cannot grant final approval;
- finance can read approved commercial information but cannot alter verification;
- provider-scoped permissions do not apply to a different provider;
- a client-provided role header has no effect;
- revoked and expired sessions are denied;
- emergency administrative actions require a specific reason and audit event.

The verification and provider objects referenced by these policies are not implemented until later phases.

## Operations access

Protected endpoints:

```text
GET  /api/v1/operations/session
POST /api/v1/operations/emergency-actions
```

The session endpoint returns the roles and permissions resolved by the backend. The emergency endpoint records a synthetic audit event only; it cannot change provider or verification state in Phase 2C.

MFA remains mandatory for real operations access before pilot. Phase 2C models the requirement but does not connect a production factor.

## Audit requirements

Append-only audit events cover:

- first-time and subsequent contact verification;
- session creation, rotation and revocation;
- refresh-token reuse detection;
- role assignment, change and revocation;
- authorization denial;
- self-approval denial;
- reasoned synthetic emergency action.

Database triggers ensure first-time verified-contact insertion and role-assignment changes cannot bypass the audit stream.

## Abuse-control boundary

The current schema supports challenge expiry, attempt limits and hashed request fingerprints. Production work must add distributed rate limiting, provider-specific delivery controls, bot mitigation, anomaly detection and support-safe account recovery before a real OTP provider is enabled.

## Required future work

Before production authentication:

- select approved SMS/email and MFA providers;
- design encrypted contact-value storage and key rotation;
- add distributed challenge throttling;
- establish secure Android Keystore storage;
- establish secure HttpOnly/SameSite portal cookies or an equivalent reviewed session approach;
- test recovery and privileged step-up flows;
- complete Zambia privacy/legal review;
- complete penetration and abuse testing.

## Verification evidence

Phase 2C backend CI runs formatting, lint, strict type checking, clean PostgreSQL/PostGIS migrations, unit/HTTP/database tests with coverage, production build and OpenAPI validation. The operations portal has an independent locked-dependency pipeline.
