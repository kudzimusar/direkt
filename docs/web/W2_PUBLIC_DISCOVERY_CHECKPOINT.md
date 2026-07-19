# W2 — Functional Web/PWA Public Discovery Checkpoint

**Status:** CLOSED — repository implementation, exact-head regression gates and managed IAM-private canary evidence passed  
**Workstream:** Functional Android/Web parity  
**Governing plan:** `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`

## Purpose

W2 replaces the browser preview-only discovery surface with a real implementation that consumes the same canonical public discovery and review projections used by the DIREKT backend. It does not activate real participants, make the NestJS API public, or weaken any Phase 11/12 gate.

## Implemented slice

The functional client under `web/direkt-app/` implements:

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

The browser calls only specific same-origin routes:

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

The permanent functional-PWA workflow fails if required provider/search/review fields drift, obsolete provisional names return, query allowlists diverge, a generic proxy appears, the private API URL/token becomes browser-visible, production unauthenticated API mode is allowed, or upstream server-error detail is blindly relayed.

## Managed closure evidence

The final trusted canary ran from exact reviewed `main` source:

```text
source: 4b892b90c42239c81c4f9c6f8c9f5447519dd6f6
managed run: 29694862350
data mode: synthetic-only
categories observed: 4
provider search results observed: 20
result: PASS
```

Sanitized evidence was posted by `github-actions[bot]` to Issue #133.

The managed exercise proved:

1. the functional Next.js runtime invoked the IAM-private `direkt-api` service through the reviewed server-side identity boundary;
2. canonical categories and provider search returned backend-managed synthetic state through the browser-facing BFF;
3. API and BFF category/search/profile/claims/availability/reviews/share projections matched;
4. the public projection scan found no prohibited private evidence/contact/provider-base fields;
5. the rendered DIREKT discovery shell and security headers responded from the managed web service;
6. unauthenticated API and web requests were denied;
7. the API and web services remained free of public Invoker bindings;
8. temporary deployer Invoker grants were removed and final IAM cleanup passed.

The canary service remains a private synthetic staging control. It does not authorize a public route, real participants, production traffic, or reuse of the operations runtime identity for W8.

## Privacy and trust invariants preserved

W2 does not expose:

- private evidence or private object URLs;
- verified contact references or contact handoff data;
- private provider base coordinates;
- reviewer identities or moderation rationale;
- privileged Supabase/database credentials;
- blanket “verified”, “safe” or guarantee claims.

Mobile providers continue to be described by public service-area semantics rather than distance from a private base. Trust copy remains scoped to individual backend-derived claims and limitations. Manual/list discovery remains first-class; Google Maps activation is not required for W2 closure.

## Android no-regression boundary

W2 changed no file under `android/direkt-app/**`. It introduced no Kotlin Multiplatform conversion, Gradle/dependency upgrade, Android UI refactor, release/signing change or Play-policy bypass.

Exact-head functional web checks repeatedly proved the Android protected surface unchanged, and the trigger checkpoint passed functional web typecheck, static/PWA security, discovery-contract parity, production build, documentation and public synthetic-PWA packaging before the managed exercise.

## W2 exit decision

All W2 exit conditions are satisfied:

- canonical public categories/search/results/profile/claims/availability/reviews/share use managed backend state;
- backend-managed synthetic publication state is observable through the web BFF;
- public projections remain privacy-safe;
- manual/list fallback remains first-class;
- exact-head regression gates passed;
- managed IAM-private canary evidence passed with cleanup verified.

**Decision: W2 CLOSED.**

## Next task

Proceed to W3 browser authentication/account/session implementation on the same `build/android-v1` lane. W3 must preserve DIREKT backend authorization, server-resolved provider scope, secure HttpOnly browser session handling, CSRF/origin/replay/expiry controls, and the still-open Phase 11 real-participant gate.
