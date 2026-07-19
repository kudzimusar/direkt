# W6 — Commercial Parity Checkpoint

**Status:** IMPLEMENTING — repository implementation under exact-head verification; managed synthetic commercial canary required before closure  
**Workstream:** Functional Android/Web parity  
**Governing plan:** `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`

## Implemented browser boundary

W6 extends the actor-resolved provider Account surface with the canonical commercial lifecycle already supported by the DIREKT backend:

- safe product catalogue and entitlement display;
- retry-safe subscription creation using an explicit idempotency key;
- provider-scoped subscription status and cancellation with expected revision control;
- immutable invoice issue/return behavior;
- synthetic payment-intent creation only when the backend payment-provider mode is `synthetic`;
- provider-scoped payment-intent cancellation with expected revision control;
- invoice/payment-intent/receipt status display;
- server-controlled commercial policy version.

## Hard boundaries

- No browser action accepts provider ID or provider scope.
- The BFF forwards commercial actions only to actor-resolved `provider-workspace/me/**` routes.
- Subscription/payment-intent creation requires retry-safe `Idempotency-Key` semantics.
- Cancellation uses authoritative revision checks.
- Payment initiation remains unavailable when the backend provider mode is not `synthetic`.
- The browser cannot invoke the synthetic payment webhook and never receives webhook signing authority.
- Commercial state explicitly carries no verification, publication or ranking effect.
- No payment credential is requested, stored or returned by the W6 browser surface.
- External MTN/Airtel credentials and real money movement remain GATED and are not activated by W6.

## Managed W6 closure evidence required

Before W6 is CLOSED, managed synthetic staging on exact reviewed source must prove:

1. an actor-resolved synthetic provider can read products, entitlements and its commercial workspace through the web BFF;
2. subscription creation is idempotent under a repeated identical key and remains provider-scoped;
3. invoice issue/return behavior is durable and provider-scoped;
4. synthetic payment intent creation is either successful only in synthetic mode or correctly fail-closed when mode is disabled;
5. cancellation uses expected revision and is durably observable;
6. product/subscription/payment/receipt projections retain `verification/publication/ranking = false` and exclude payment credentials;
7. no browser route exposes or calls webhook-signing authority;
8. unauthenticated API/web access remains denied and temporary Invoker grants are removed;
9. exact-head W2–W6 web/build gates and Android protected-path checks remain green.

External provider connectivity that is not configured must remain explicitly GATED rather than being counted as PASS.
