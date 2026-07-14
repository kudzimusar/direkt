# DIREKT Environment and Configuration

## Environments

- local;
- development/shared integration;
- staging/pilot;
- production.

Each has separate database, storage, credentials, payment/webhook configuration and notification identity.

## Configuration classes

### Public client configuration
API base URL, build/version and non-secret feature declarations.

### Server secrets
Database credentials, signing keys, service API keys and webhook secrets. Stored in environment secret manager, never repository.

### Operational configuration
Categories, evidence requirements, plans, reason codes and templates. Versioned in database with audit, not ad hoc environment variables.

### Feature flags
Used for controlled rollout, not permanent hidden policy. Every flag has owner, default, environments and removal date.

## `.env.example`

Only placeholders and descriptions. Startup validates required values and fails safely.

## Production controls

- least-privilege service identities;
- key rotation;
- no developer personal credentials;
- audit and break-glass process;
- environment banner in admin portal;
- production write access limited;
- staging never uses real evidence by convenience.
