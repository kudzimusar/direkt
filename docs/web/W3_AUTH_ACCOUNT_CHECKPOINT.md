# W3 — Browser Authentication, Account and Session Checkpoint

**Status:** IMPLEMENTING — repository implementation under exact-head verification; managed synthetic session canary required before closure  
**Workstream:** Functional Android/Web parity  
**Governing plan:** `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`

## Scope

W3 adds the browser authentication/account/session boundary without changing DIREKT authorization authority or activating real participants.

Implemented repository boundary:

- server-only authenticated BFF calls to the IAM-private DIREKT API;
- fail-closed auth modes: `disabled`, explicitly-authorized `synthetic`, and gated `firebase-exchange`;
- Firebase-to-DIREKT exchange route that injects the server-controlled pilot notice version and requires explicit consent;
- no Firebase claims become DIREKT roles, permissions or provider scope;
- HttpOnly rotating access/refresh session cookies;
- Secure/SameSite cookie policy in production;
- same-origin and double-submit CSRF protection for browser mutations;
- access-expiry rotation with bounded one-time retry after backend 401;
- session list, revoke-other, single-session revoke and logout paths;
- account summary from the canonical `/account/profile` and `/auth/sessions` contracts;
- provider-mode availability derived only from the actor-resolved `/provider-workspace/me` backend route;
- no client-selected provider identifier or role is accepted by the W3 browser boundary;
- no access/refresh token is returned in browser JSON or stored in localStorage/sessionStorage/IndexedDB;
- authentication/session API responses remain `no-store`.

## Activation rules

`DIREKT_WEB_AUTH_MODE=synthetic` is allowed only when:

- API mode is `authenticated-bff`;
- `DIREKT_WEB_ALLOW_SYNTHETIC_AUTH=true` is explicitly set;
- the environment is controlled synthetic staging;
- no real SMS/email delivery or real participant activation is inferred.

`firebase-exchange` remains GATED until approved Firebase Web phone-auth configuration and separate Phase 11 participant/legal controls are available. The BFF exchange boundary may be implemented and tested without claiming real Firebase Web activation.

## Managed W3 closure evidence required

Before W3 is CLOSED, managed synthetic evidence must prove on exact reviewed source:

1. bootstrap issues CSRF state without exposing session credentials;
2. synthetic challenge/verification creates a DIREKT browser session through the private API;
3. access/refresh tokens exist only in HttpOnly browser cookies;
4. account summary and session list are backend-observable after sign-in;
5. provider mode is backend-derived and no provider ID is supplied by the client;
6. missing/wrong origin or CSRF is rejected;
7. session revoke/logout invalidates the browser session and protected summary becomes unauthorized;
8. unauthenticated direct API/web access remains denied at Cloud Run IAM;
9. temporary canary Invoker grants are removed;
10. Android protected-path and repository regression gates remain green.

Firebase phone-possession may remain explicitly `GATED`; W3 closure must not fabricate approved Web Firebase configuration or real participant admission.
