# Functional DIREKT Web/PWA Agent Contract

This file applies to `web/direkt-app/**` and supplements the repository-root `AGENTS.md`.

## Purpose

This directory contains the real customer/provider browser client for the same DIREKT product as the native Android application.

It is not:

- the internal operations portal;
- the preserved synthetic `web/direkt-pwa/` preview;
- a replacement for Android;
- a direct Supabase/database client;
- a separate trust or authorization authority.

## Mandatory controls

Before changing this directory, read:

1. `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`;
2. `docs/web/FUNCTIONAL_PARITY_MATRIX.md`;
3. `docs/architecture/FUNCTIONAL_PWA_ARCHITECTURE_DECISION.md`;
4. `docs/testing/FUNCTIONAL_PWA_NO_REGRESSION_TEST_PLAN.md`;
5. `WORKSTREAM_LOCK.md`.

## Architecture rules

- Use Next.js, React and TypeScript already approved for this workstream.
- Share behavior with Android through canonical REST/OpenAPI and backend state, not shared UI binaries.
- Do not introduce Kotlin Multiplatform/Compose Web as part of this workstream.
- Mobile web uses bottom navigation aligned to Android.
- Desktop uses persistent side navigation with the same capabilities and no bottom navigation.
- Tablet uses an adaptive rail/side pattern without changing product semantics.
- Authenticated browser traffic uses reviewed BFF/session routes; do not create a generic unauthenticated proxy.
- `DIREKT_API_BASE_URL` is server-only. Never expose it through `NEXT_PUBLIC_*`.
- Never add Supabase service-role/database credentials or direct privileged Supabase client access.
- Service workers may cache only explicit non-sensitive shell assets. Never blanket-cache API/auth/private lifecycle responses.

## Functional parity rules

A screen is not complete because it visually resembles Android.

A capability is complete only when it:

- maps to an authoritative canonical contract;
- enforces the same server authorization/provider scope;
- produces/reads the same durable backend state as Android;
- preserves trust/privacy semantics;
- passes the relevant row in `FUNCTIONAL_PARITY_MATRIX.md`.

Static fixtures may be used only for isolated component tests and must not be counted as functional parity evidence.

## Android no-regression rules

Do not edit `android/direkt-app/**` for ordinary web/PWA work.

Never bundle:

- Gradle/dependency upgrades;
- Compose refactors;
- Android Firebase changes;
- manifest permission changes;
- release/signing/version changes;
- Android navigation redesign

with a web/PWA checkpoint.

Shared backend/OpenAPI changes must remain backward compatible and run Android regression gates.

## Security and privacy

- Firebase proves phone possession only; DIREKT owns roles, provider scope, admission and authorization.
- Browser session tokens must not be stored in JavaScript-readable persistent storage.
- Private evidence/contact/exact-coordinate responses must be non-cacheable.
- Offline mutations never pretend success without durable backend acknowledgement.
- No payment state may strengthen trust/publication/ranking.
- No generic “verified/safe/guaranteed” claims.
- External providers remain gated until `CURRENT_INTEGRATION_STATUS.md` is legitimately promoted with runtime evidence.

## Completion

Run the web verification suite and all affected repository/Android/backend gates before checkpointing. Update parity/status documents only from evidence, never from intended behavior.
