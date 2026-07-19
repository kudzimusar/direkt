# W3 — Browser Authentication, Account and Session Checkpoint

**Status:** CLOSED — managed synthetic auth/session evidence passed on exact merged source `012a7b9c24e93087d823661298d051c08ea34ec0`  
**Managed run:** `29703117963` — PASS  
**Workstream:** Functional Android/Web parity  
**Governing plan:** `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`

## Scope delivered

W3 added the browser authentication/account/session boundary without changing DIREKT authorization authority or activating real participants.

Implemented and evidenced boundary:

- server-only authenticated BFF calls to the IAM-private DIREKT API;
- fail-closed auth modes: `disabled`, explicitly-authorized `synthetic`, and gated `firebase-exchange`;
- Firebase-to-DIREKT exchange route that injects the server-controlled pilot notice version and requires explicit consent;
- no Firebase claims become DIREKT roles, permissions or provider scope;
- HttpOnly rotating access/refresh session cookies;
- Secure/SameSite cookie policy in production;
- same-origin and double-submit CSRF protection for browser mutations;
- refresh rotation confined to the dedicated protected mutation path so arbitrary parallel reads cannot race a one-time refresh token;
- access/session cookie retention aligned so a still-valid refresh token remains usable after access-token expiry without exposing credentials to browser JavaScript;
- session list, revoke-other, single-session revoke and logout paths;
- account summary from the canonical `/account/profile` and `/auth/sessions` contracts;
- provider-mode availability derived only from the actor-resolved `/provider-workspace/me` backend route;
- no client-selected provider identifier or role is accepted by the browser boundary;
- no access/refresh token is returned in browser JSON or stored in localStorage/sessionStorage/IndexedDB;
- authentication/session API responses remain `no-store`.

## Managed closure evidence

Trusted-main managed run `29703117963` on exact merged source `012a7b9c24e93087d823661298d051c08ea34ec0` passed the W3 closure contract:

1. bootstrap issued CSRF state without exposing session credentials;
2. controlled synthetic challenge/verification created a DIREKT browser session through the IAM-private API;
3. access/refresh credentials remained only in HttpOnly browser cookies;
4. account summary and session list were backend-observable after sign-in;
5. provider-mode availability was backend-derived and no provider identifier was supplied by the client;
6. missing origin and incorrect CSRF mutations were rejected;
7. idle access-expiry refresh rotation succeeded through the protected refresh route;
8. logout/revocation invalidated the browser session and protected summary became unauthorized;
9. unauthenticated direct API and web invocation remained denied by Cloud Run IAM;
10. temporary canary Invoker grants were removed and final IAM remained private;
11. Android protected-path and repository regression gates remained green.

Issue #133 contains the sanitized managed PASS record for this exact run.

## Review defects closed before W3 exit

Two valid P2 findings were corrected before promotion:

- access-cookie lifetime originally could remove the material required to rotate a still-valid refresh session after idle expiry;
- automatic read-time refresh could race the one-time refresh token across concurrent browser requests.

The final design retains session material only inside the HttpOnly boundary through refresh expiry and performs rotation only through the explicit CSRF/origin-protected refresh mutation.

## Gates intentionally unchanged

`firebase-exchange` remains **GATED** until approved Firebase Web phone-auth configuration and the separate Phase 11 participant/legal controls are complete. W3 closure does not activate real Firebase Web participants, real pilot admission, public backend traffic, payments or formal Phase 12 production release.

## Exit decision

W3 is CLOSED. W4 customer-journey parity may proceed on the same `build/android-v1` single implementation lane. All customer mutations must remain backend-authoritative, CSRF/origin protected, `no-store`, observable in canonical lifecycle state and regression-safe for Android.
