# DIREKT Operations Portal

This Next.js/TypeScript workspace is the internal DIREKT operations-portal foundation.

## Phase 2C scope

Implemented:

- non-indexed accessible portal shell;
- synthetic privileged sign-in, access-denied and session-expired states;
- permission-derived navigation;
- synthetic mission-control dashboard;
- restrictive response headers;
- unit and server-rendered accessibility tests;
- lint, typecheck, test and production-build CI.

Not implemented:

- a real OTP, email, SMS or identity provider;
- production session cookies or credentials;
- direct PostgreSQL or object-storage access;
- evidence viewing, verification decisions or provider suspension;
- production deployment.

## Architectural boundary

The portal may communicate only with the versioned DIREKT backend API. It must never import a database client, connect directly to PostgreSQL, or generate storage URLs. Backend authorization remains authoritative even when navigation is hidden.

## Local verification

```bash
npm ci --ignore-scripts
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Until the first CI-generated lockfile is committed, the bootstrap workflow creates it with `npm install --package-lock-only --ignore-scripts` and retains it as a short-lived artifact.

## Synthetic-data rule

Use only reserved UUIDs, `example.invalid` hints and fictional queue values. Never commit a real name, phone number, email address, evidence document, private coordinate, access token or production URL.
