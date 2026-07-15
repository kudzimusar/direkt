# Phase 3 Acceptance Evidence

## Required permanent gates

The checkpoint may merge only when the same exact PR head passes:

1. backend format, lint, strict TypeScript, clean PostgreSQL/PostGIS migrations, tests with coverage, production build and OpenAPI validation;
2. Android unit tests, lint, debug APK and Android-test APK assembly;
3. operations-portal format, lint, strict TypeScript, tests with coverage, production build and API-only isolation checks;
4. documentation validation, planning archive generation, Pages-source generation and strict MkDocs build.

## Database and domain assertions

Tests must prove:

- profile discoverability is constrained to `blocked`;
- mobile and hybrid profiles require a service area;
- fixed and hybrid profiles require a private premises label;
- invalid profile state transitions fail in PostgreSQL;
- activated category requirements cannot be rewritten or deleted;
- provider category selections reference a requirement version belonging to the same category;
- provider and customer profile mutations append audit records;
- no public provider query or publication operation exists.

## Authorization assertions

Tests and review must prove:

- unauthenticated provider/account operations are denied;
- provider creation is granted through a server-resolved customer permission;
- provider reads and mutations require a current provider-scoped role assignment;
- provider A assignments cannot authorize provider B access;
- revoked or expired assignments are denied by the Phase 2C authorization snapshot;
- client-supplied roles and provider identifiers cannot override the authenticated actor or route scope;
- representative assignment is restricted to provider owners;
- completion remains a non-public profile state.

## Client assertions

Android and portal checks must prove:

- all fixtures are fictional;
- the publication block is visible;
- complete profiles still report zero discoverability;
- no real phone, email, provider identity or evidence is present;
- the portal imports no database or object-storage client;
- the Android Phase 3 activity is not exported;
- both client builds remain reproducible from committed dependency locks.

## Review gate

Before merge:

- inspect all forward migrations and generated OpenAPI;
- inspect dependency and Gradle lock inputs;
- resolve every review thread with code or a documented rejection rationale;
- record exact head SHA, workflow run IDs and artifact digests in Issue #16 and `PROJECT_STATUS.md`;
- merge only with expected-head protection;
- synchronize `build/android-v1` to the merge commit without force-pushing;
- close Issue #16 only after the stable checkpoint exists.
