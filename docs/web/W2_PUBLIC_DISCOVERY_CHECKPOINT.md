# W2 — Functional Web/PWA Public Discovery Checkpoint

**Status:** Repository implementation merged through PR #155; private managed canary infrastructure is the active W2 task and must pass before W2 exit is declared  
**Workstream:** Functional Android/Web parity  
**Governing plan:** `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`

## Purpose

W2 replaces the browser preview-only discovery surface with a real implementation that consumes the same canonical public discovery and review projections used by the DIREKT backend. It does not activate real participants, make the NestJS API public, or weaken any Phase 11/12 gate.

## Implemented slice

The functional client under `web/direkt-app/` now implements:

- canonical public category loading;
- provider search through the backend `DiscoverySearchDto` query contract;
- manual area and category/availability filtering;
- backend-derived provider result cards;
- deep-linkable provider profiles;
- scoped trust claim cards with limitations and validity;
- public availability projection;
- privacy-safe public review projection and provider response display;
- share-safe metadata plus browser share/clipboard fallback;
- explicit empty/error/fail-closed states;
- mobile/tablet/desktop responsive behavior using the W1 shell.

No provider fixture is invented by the W2 UI when the canonical API is enabled. When the runtime is disabled or unreachable, discovery fails closed rather than substituting preview data.

## Browser/API boundary

The browser calls only specific same-origin routes such as:

```text
/api/discovery/search
/api/discovery/categories
/api/discovery/providers/{publicProviderId}
```

The server-side Next.js boundary invokes the canonical NestJS API. A generic catch-all API proxy is prohibited.

For IAM-private Cloud Run invocation, `authenticated-bff` mode obtains a short-lived Google identity token from the Cloud Run metadata service and sends it as `X-Serverless-Authorization`. The private API base URL and infrastructure token are never exposed to browser JavaScript.

`DIREKT_WEB_API_MODE=public` is prohibited when `NODE_ENV=production`; production must retain the reviewed server-to-server IAM boundary.

## Contract-drift control

`web/direkt-app/scripts/verify-discovery-contract.mjs` verifies the W2 boundary against repository-authoritative backend source:

- `backend/direkt-api/src/discovery/discovery.types.ts`;
- `backend/direkt-api/src/discovery/discovery.dto.ts`;
- `backend/direkt-api/src/interaction/review.types.ts`.

The check fails if:

- required provider/search/review fields drift;
- obsolete provisional field names return;
- discovery query allowlists diverge;
- a generic proxy appears;
- Cloud Run identity markers disappear;
- the private API URL/token becomes browser-visible;
- production unauthenticated API mode is allowed;
- upstream server-error details are blindly relayed.

The permanent functional-PWA workflow runs this contract check alongside locked dependency installation, TypeScript, static security/PWA checks, the production build and Android protected-path verification.

## Managed W2 canary design

The managed canary is intentionally separate from public cutover.

- `web/direkt-app/Dockerfile` produces a non-root standalone Next.js image from the locked npm dependency graph.
- `.github/workflows/functional-pwa-managed-canary.yml` deploys an immutable image to `direkt-customer-provider-web-staging` in the existing `direkt-dev-502701` project.
- The canary service is **IAM-private**, scale-to-zero capable and labelled `synthetic-only`.
- For this bounded private W2 canary only, it reuses the already-approved `direkt-portal-runtime` identity because that identity already has the exact Cloud Run Invoker relationship required to call the private `direkt-api` service. The canary does not bind the portal cookie secret or any other secret.
- The workflow must verify that the API remains free of `allUsers`/`allAuthenticatedUsers`, that the bounded runtime identity already has API Invoker, and that the web service itself has no public Invoker.
- The deployer receives temporary service-level Invoker on the API and canary web service only for direct comparison/smoke evidence; the workflow removes those grants in an `always()` cleanup and verifies the final IAM state.
- A dedicated least-privilege customer/provider web runtime identity is still mandatory before any public W8 cutover. The private W2 canary identity reuse is not approval to expose the operations runtime identity publicly.

The canary compares canonical API output with the web BFF for categories, provider search and a complete public-provider bundle (profile, claims, availability, reviews and share), scans for prohibited private fields, verifies the server-rendered DIREKT discovery shell and confirms unauthenticated API/web requests are denied.

The canary workflow is installed first. A later one-file trigger PR is permitted only after the workflow is merged to `main`; the workflow then checks out the already-merged base SHA and rejects any trigger PR that changes more than `docs/web/W2_MANAGED_CANARY_TRIGGER.md`. This prevents unmerged application code from being deployed merely to obtain evidence.

## Privacy and trust invariants preserved

W2 does not expose:

- private evidence or private object URLs;
- verified contact references or contact handoff data;
- private provider base coordinates;
- reviewer identities or moderation rationale;
- privileged Supabase/database credentials;
- blanket “verified”, “safe” or guarantee claims.

Mobile providers continue to be described by public service area semantics rather than distance from a private base. Trust copy remains scoped to individual backend-derived claims and limitations.

## Android no-regression boundary

W2 intentionally changes no file under `android/direkt-app/**`. It introduces no Kotlin Multiplatform conversion, Gradle/dependency upgrade, Android UI refactor, release/signing change or Play-policy bypass.

The W2 checkpoint must not merge unless the exact PR head proves the Android protected path unchanged and all applicable repository security/documentation checks are green.

## W2 exit evidence still required

Repository implementation alone is not enough to mark the public discovery parity rows `PASS`.

Before W2 exit is declared, managed test evidence must prove:

1. the functional web runtime can invoke the IAM-private DIREKT API without making that API public;
2. backend-managed synthetic/test publication state is observable through the browser-facing BFF;
3. category/search/profile/claim/availability/review/share projections match managed backend state;
4. public responses contain no private evidence, contact data or private coordinates;
5. manual/list fallback remains usable without Google Maps activation;
6. the rendered web service responds from the exact reviewed deployment source;
7. temporary canary Invoker privileges are removed and both API/web remain IAM-private after the exercise.

Until that managed canary exists, the W2 matrix rows remain `IMPLEMENTING`, even though the repository implementation is present.

## Next task

Merge and verify the managed-canary deployment mechanism, run the bounded trigger against the exact merged source, record sanitized canary evidence, and only then close W2 and advance to W3 browser authentication/session implementation. W3 must not be used to bypass the still-open real Phase 11 participant gate.
