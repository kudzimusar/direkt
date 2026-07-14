# DIREKT Admin Portal Architecture

## Purpose

The DIREKT operations portal is the internal desktop-oriented interface for verification, field work, support, trust and safety, finance exceptions, audit and controlled configuration.

It is not a public marketplace client and is never hosted through GitHub Pages.

## Technology baseline

Phase 2C establishes:

```text
admin/direkt-operations-portal
```

with:

- Node.js 24 and npm 11;
- Next.js 16;
- React 19;
- TypeScript 5.9 strict mode;
- committed npm lockfile;
- server-rendered accessible shell;
- independent GitHub Actions verification.

## Hard boundary

The portal consumes the versioned DIREKT backend API. It must never:

- import a PostgreSQL client;
- connect directly to the database;
- connect directly to object storage;
- construct private evidence URLs;
- trust client-provided roles;
- embed production secrets in browser bundles;
- place sensitive content in public/static output or browser logs.

The backend performs authentication, role resolution, provider scope, object authorization and audit.

## Phase 2C routes

The foundation includes:

```text
/sign-in
/access-denied
/session-expired
/operations
```

These routes demonstrate privileged-session states and navigation only. The sign-in experience is synthetic and does not contact an OTP provider.

The `/operations` mission-control shell contains fictional zero-value summaries and does not expose evidence, providers or decisions.

## Navigation policy

Navigation is derived from the backend-compatible permission fixture rather than the displayed role name. Tests prove that:

- reviewers see verification navigation but not finance or administration;
- finance sees finance navigation but not verification controls;
- an `admin` label without server permissions produces no navigation;
- hidden navigation never implies backend permission.

## Security response headers

All routes set or require:

- `X-Robots-Tag: noindex, nofollow, noarchive`;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- `Referrer-Policy: no-referrer`;
- restrictive Permissions Policy;
- Content Security Policy;
- removal of the framework-powered header.

The Phase 2C CSP is a foundation and must be reviewed again when real API connections, analytics or evidence rendering are introduced.

## Accessibility baseline

The shell includes:

- skip navigation;
- semantic header, navigation, aside and main landmarks;
- visible keyboard focus;
- 44-pixel minimum interactive targets;
- scalable typography;
- responsive single-column behaviour;
- synthetic-status announcement;
- disabled-state semantics;
- reduced-motion handling.

Server-rendered tests assert the required landmarks and warning state. Later phases add browser E2E, automated accessibility tooling and representative user testing.

## Planned feature modules

Later phases may add:

- verification queues and cases;
- secure evidence viewer;
- field operations;
- provider and customer support;
- trust and safety;
- subscriptions and reconciliation;
- taxonomy and evidence rules;
- audit and reporting;
- role management.

None of these domain modules is operational in Phase 2C.

## Privileged session requirements

Real operations access must use:

- short-lived access/session state;
- inactivity and absolute session limits;
- mandatory MFA before pilot;
- server-side permission resolution;
- step-up authentication for sensitive actions;
- revocation and device/session management;
- reasoned, append-only audit for privileged actions.

Phase 2C represents these rules but uses only a synthetic reviewer fixture in the UI.

## Testing and CI

The portal workflow proves on a clean runner:

```text
npm ci --ignore-scripts
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

It also rejects direct database/storage imports, committed environment files and missing no-index configuration. Coverage and build manifests are retained as artifacts.

## Deployment status

No production or staging portal deployment is authorized in Phase 2C. Environment architecture, secure cookies, approved API origins, MFA and restricted diagnostics must be approved before external deployment.
