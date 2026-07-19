# W6 — Commercial Parity Checkpoint

**Status:** CLOSED — trusted-main managed commercial canary PASS on exact merged source `1b5753002afcf115f6f47334f6588648eca7501d`  
**Evidence:** authoritative GitHub Actions PASS result indexed on Issue #133 under `<!-- direkt-w6-main-canary-result -->`  
**Workstream:** Functional Android/Web parity  
**Governing plan:** `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`

## Closed browser boundary

W6 extends the actor-resolved provider Account surface with the canonical commercial lifecycle already supported by the DIREKT backend:

- safe product catalogue and entitlement display;
- retry-safe subscription creation using an explicit idempotency key;
- provider-scoped subscription status and cancellation with expected revision control;
- immutable invoice issue/return behavior;
- synthetic payment-intent creation only when the backend payment-provider mode is `synthetic`;
- provider-scoped payment-intent cancellation with expected revision control;
- invoice/payment-intent/receipt status display;
- server-controlled commercial policy version.

## Hard boundaries retained

- No browser action accepts provider ID or provider scope.
- The BFF forwards commercial actions only to actor-resolved `provider-workspace/me/**` routes.
- Subscription/payment-intent creation requires retry-safe `Idempotency-Key` semantics.
- Cancellation uses authoritative revision checks.
- Payment initiation remains unavailable when the backend provider mode is not `synthetic`.
- The browser cannot invoke the synthetic payment webhook and never receives webhook signing authority.
- Commercial state explicitly carries no verification, publication or ranking effect.
- No payment credential is requested, stored or returned by the W6 browser surface.
- External MTN/Airtel credentials and real money movement remain GATED and are not activated by W6.

## Closure evidence reconciliation

The trusted-main W6 managed commercial canary passed on exact merged source `1b5753002afcf115f6f47334f6588648eca7501d`. Combined with the exact-head repository gates that promoted the W6 implementation, the closure establishes:

1. an actor-resolved synthetic provider can read products, entitlements and its commercial workspace through the reviewed web BFF;
2. subscription creation is retry-safe/idempotent under the same key and remains provider-scoped;
3. invoice issue/return behavior is durable and provider-scoped;
4. payment-intent behavior is restricted to the backend-authorized synthetic provider mode and remains fail-closed otherwise;
5. subscription/payment-intent cancellation uses authoritative expected-revision checks and is durably observable;
6. commercial product/subscription/payment/receipt projections retain no verification, publication or ranking effects and exclude payment credentials;
7. the browser exposes no payment-webhook signing authority and never invokes the synthetic webhook directly;
8. unauthenticated direct API/web access remains denied by Cloud Run IAM and temporary canary Invoker access is removed after the run;
9. exact-head W2–W6 TypeScript/contract/build gates and Android protected-path checks were green before promotion;
10. no Android source, Gradle, Compose, Firebase Android, signing or release-policy file changed in W6.

## Scope carried forward to W7

W7 is now authorized to execute cross-client parity and regression closure only:

- Android unit/lint/debug and release-boundary regression;
- backend/database/OpenAPI regression;
- functional web type/build/contract regression;
- responsive/mobile/tablet/desktop navigation parity;
- accessibility, keyboard/focus and reduced-motion/static semantics;
- offline/network/private-cache safety;
- session/provider-scope/privacy negative controls;
- final capability parity matrix reconciliation with unsupported external integrations kept explicitly GATED.

External payment providers, real money movement, real participants and formal Phase 12 production release remain separately gated and must not be inferred from W6 closure.
