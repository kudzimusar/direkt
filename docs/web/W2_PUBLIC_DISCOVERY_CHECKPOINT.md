# W2 — Functional Web/PWA Public Discovery Checkpoint

**Status:** Implementation complete on `build/android-v1`; exact-head CI/review and managed runtime canary required before W2 exit is declared  
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
- share-safe metadata;
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
2. backend-managed synthetic/test publication changes are observable in the browser client;
3. category/search/profile/claim/availability/review/share projections render from managed backend state;
4. public responses contain no private evidence, contact data or private coordinates;
5. manual/list fallback remains usable without Google Maps activation;
6. the exact deployment source is tied to a reviewed commit and canary evidence.

Until that managed canary exists, the W2 matrix rows remain `IMPLEMENTING`, even though the repository implementation is present.

## Next task after checkpoint merge

Run the managed W2 staging/canary boundary, record backend-observable evidence, and only then close W2 and advance to W3 browser authentication/session implementation. W3 must not be used to bypass the still-open real Phase 11 participant gate.
