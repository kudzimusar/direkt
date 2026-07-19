# Functional PWA No-Regression Test Plan

**Status:** Mandatory for the functional customer/provider web/PWA workstream  
**Baseline:** synchronized `main` after PR #152  
**Primary risk:** adding a full browser client without regressing Android, backend trust boundaries, release controls or Phase 11/12 gates

## 1. Core principle

The functional web/PWA is additive. Android remains the primary native Version 1 client and must not regress as a side effect of browser implementation.

A web/PWA checkpoint is not mergeable merely because web tests pass. Shared backend/OpenAPI changes must also prove Android compatibility.

## 2. Protected Android surface

During W0/W1, changes under the following path are prohibited unless a separately reviewed compatibility fix is unavoidable:

```text
android/direkt-app/**
```

In particular, do not bundle web work with:

- Gradle wrapper changes;
- AGP/Kotlin/Compose upgrades;
- Firebase Android dependency changes;
- namespace/application ID changes;
- navigation/UI refactors;
- release version/signing/latch changes;
- manifest permission expansion.

## 3. Required baseline evidence

Before each material shared-contract checkpoint, record or re-run the current relevant baseline:

- Android unit tests;
- Android lint;
- debug assembly;
- release eligibility/signing contract checks where applicable;
- merged manifest/SDK inventory gates where applicable;
- backend unit/integration/e2e tests;
- migration checks;
- OpenAPI generation/drift checks;
- integration runtime audit;
- supply-chain/security checks.

If an existing baseline is red, isolate and repair it before attributing failures to the PWA workstream.

## 4. Web/PWA test layers

### Static and type safety

- TypeScript strict typecheck;
- framework build;
- lint/format checks;
- manifest validation;
- service-worker cache allowlist validation;
- environment-variable allowlist;
- bundle/source scan for privileged Supabase/database/service-account material.

### Unit/component

- navigation state;
- responsive shell breakpoints;
- customer/provider destination mapping;
- trust/status rendering;
- problem-details/error mapping;
- API timeout/retry/idempotency helpers;
- session-cookie policy helpers;
- offline state behavior.

### Browser/e2e

- mobile bottom navigation present;
- desktop side navigation present and bottom navigation absent;
- tablet adaptive behavior;
- category → search → provider profile → claims → availability journey;
- authenticated session lifecycle when W3 is active;
- customer enquiry/review/complaint journey when W4 is active;
- provider workspace/evidence/enquiry/review/commercial journey when W5/W6 is active.

### Accessibility

- keyboard-only navigation;
- visible focus;
- semantic labels/landmarks;
- screen-reader naming for navigation/status controls;
- 200% text resilience;
- reduced-motion support;
- contrast checks;
- no color-only trust/status meaning.

### Network/resilience

- slow response;
- timeout;
- offline shell;
- offline mutation refusal/queue policy as explicitly designed;
- interrupted evidence upload;
- retry/idempotency;
- expired session;
- 401/403/409/422/429/5xx problem-details states.

## 5. Security negatives

The following must fail closed:

- direct browser use of Supabase service-role/database credentials;
- direct authorization from Firebase custom/client claims;
- client-selected provider tenant/scope;
- CSRF on authenticated mutation routes;
- unapproved origin access;
- refresh/session token exposure to JavaScript-readable storage;
- arbitrary authenticated API response caching by service worker;
- private evidence/contact/exact-coordinate content in public caches;
- unauthenticated access to protected backend routes;
- replay of idempotency-sensitive mutations;
- stale optimistic revision writes;
- payment state strengthening trust/publication.

## 6. Cross-client parity tests

For every capability supported by both clients:

1. establish authoritative backend state;
2. read/render it in Android and web;
3. mutate through one client where authorized;
4. verify durable backend acknowledgement;
5. read the updated state through the other client;
6. verify equivalent trust/status/lifecycle interpretation.

High-priority parity pairs:

- account/session state;
- provider publication/profile/trust claims;
- availability;
- enquiry lifecycle;
- contact-consent/handoff state;
- interaction/review eligibility;
- reviews/provider responses/appeals;
- complaint state;
- provider readiness/evidence state;
- subscription/commercial state.

## 7. CI merge gate

A functional PWA PR touching only `web/direkt-app/**` and documentation must pass:

- web install/typecheck/test/build;
- PWA security/static checks;
- documentation quality;
- supply-chain/security;
- Android protected-path diff assertion.

A PR touching backend/OpenAPI/database/shared integration contracts must additionally pass:

- backend full verification;
- migration validation;
- OpenAPI generation/check;
- Android unit/lint/debug assembly;
- integration runtime audit;
- any phase-specific security/release gate affected by the change.

## 8. Merge blockers

Do not merge when:

- Android regression exists;
- web build works only by weakening a security/IAM boundary;
- a private field appears in a public/browser projection;
- a required parity row is marked complete using static fixture evidence only;
- critical/high review findings remain unresolved;
- exact PR head has not passed required checks;
- production/participant/legal/payment/release evidence is being inferred rather than proven.

## 9. W8 cutover evidence

Before replacing the owner-facing synthetic preview route with the functional app, verify:

- deployed route resolves publicly as intended;
- TLS/domain routing is correct;
- manifest and service worker are reachable;
- desktop/mobile navigation contracts hold in deployed build;
- authenticated route architecture preserves IAM/private API design;
- no private/participant data is cached into public/static assets;
- rollback target to prior preview/static checkpoint exists;
- Android checkpoint remains unchanged/green;
- Issue #133 acceptance evidence is updated honestly.
