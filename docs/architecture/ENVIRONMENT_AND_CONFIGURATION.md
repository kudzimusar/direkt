# DIREKT Environment and Configuration

## Environments

DIREKT distinguishes deployment environment, data mode and traffic mode. They are separate controls and must not be inferred from one another.

Deployment environments:

- `local`;
- `development`;
- `staging`;
- `pilot`;
- `production`.

Data modes:

- `synthetic-only`;
- `controlled-pilot`;
- `production`.

Traffic modes:

- `disabled`;
- `internal`;
- `synthetic-public` where explicitly permitted for non-sensitive synthetic demos only.

Each managed environment has separate database/storage bindings, credentials, provider/webhook configuration and notification identity as applicable.

## Configuration classes

### Public client configuration

API base URL, build/version and non-secret feature declarations.

### Server secrets

Database credentials, signing keys, service API keys and webhook secrets. Stored in the approved environment secret manager, never in the repository or client bundles.

### Operational configuration

Categories, evidence requirements, plans, reason codes and templates. Versioned in the database with audit, not ad hoc environment variables.

### Feature flags

Used for controlled rollout, not permanent hidden policy. Every flag requires an owner, safe default, target environments and removal/review condition.

## Phase 11 controlled-pilot latch

`PILOT_ENTRY_APPROVED` is a technical fail-closed latch. It is **not** legal approval and must never be set merely to make a deployment pass.

The backend rejects `DIREKT_DATA_MODE=controlled-pilot` unless all current pre-entry conditions hold:

- `PILOT_ENTRY_APPROVED=true`;
- `DIREKT_ENVIRONMENT=pilot`;
- private evidence storage uses the approved Supabase boundary;
- synthetic authentication challenges are disabled;
- payment mode is disabled;
- traffic remains disabled until a separately approved participant access/authentication path exists.

The current latch deliberately authorizes no participant traffic. It prevents controlled-pilot data mode from being enabled before the legal/privacy/provider/operations entry package is recorded.

Opening traffic requires a later reviewed code/configuration change after:

- qualified legal/privacy/processor gates pass;
- exact pilot scope/owners/support/stop criteria are approved;
- a real participant authentication provider/path is approved and implemented;
- the pilot access architecture preserves backend authorization and does not expose privileged Cloud Run/Supabase credentials;
- relevant Maps/telemetry/communications providers are approved for the exact data they receive.

See `../phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md`.

## `.env.example`

Only placeholders and descriptions. Startup validates required values and fails safely.

A value appearing in `.env.example` does not mean that the provider or feature is approved for real use.

## Production controls

- least-privilege service identities;
- key rotation;
- no developer personal credentials;
- audit and break-glass process;
- environment banner in admin portal;
- production write access limited;
- staging never uses real evidence by convenience;
- controlled-pilot mode never bypasses the explicit Phase 11 entry gate;
- production traffic remains a separate Phase 12 release decision.
