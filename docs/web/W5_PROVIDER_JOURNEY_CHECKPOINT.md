# W5 — Provider Journey Parity Checkpoint

**Status:** CLOSED — managed synthetic provider canary PASS on exact merged source `79228f4bda96106b929aa6183613cb9d2dc127f6`  
**Evidence:** trusted-main W5 result recorded by GitHub Actions on Issue #133 (`issuecomment-5017630247`); exact managed run link is preserved in that authoritative bot comment  
**Workstream:** Functional Android/Web parity  
**Governing plan:** `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`

## Closed browser boundary

The W5 functional web client uses only actor-resolved provider APIs and reviewed same-origin BFF routes for:

- provider workspace/readiness and verification timeline;
- profile, operating model, service selection/removal, availability and location/service-area configuration;
- separate private-base, consented public-premises and service-area location models;
- recoverable private evidence upload intents with transient upload grants, SHA-256 confirmation, interruption marking, retry and cancellation;
- provider-scoped enquiry list, revision-controlled transitions and safe lifecycle history;
- provider-scoped tracked interactions and masked consent-scoped current handoff state;
- provider reviews, public response and appeal submission;
- account/session security inherited from closed W3;
- actor-resolved commercial/subscription state as read-only W5 context pending W6 commercial mutation closure.

## Security and privacy invariants retained

- No browser action accepts provider ID, representative role or provider scope from client input.
- Provider ownership/scope is resolved by backend authorization with `providerFromActor: true`.
- Private base coordinates are write-only in the workspace response contract.
- Public premises coordinates require explicit consent.
- Private evidence storage object keys are never returned to or consumed by the provider UI.
- Upload URLs are transient grants used only for the active upload attempt and are not persisted in browser storage.
- Access/refresh tokens remain HttpOnly under the closed W3 session boundary.
- Provider interactions expose masked contact hints only under current consent; raw contact remains excluded.
- No provider mutation creates verification, publication or ranking authority in the browser.
- W5 commercial state remains read-only; real money movement remains disabled.

## Closure evidence reconciliation

The trusted-main W5 managed provider canary passed on exact merged source `79228f4bda96106b929aa6183613cb9d2dc127f6`. The managed evidence established:

1. a synthetic authenticated provider identity resolved its own actor-scoped workspace without any browser-supplied provider ID;
2. workspace/readiness, verification timeline, tracked interactions, masked handoff state, reviews and commercial state were available through the reviewed web BFF projections;
3. reversible provider profile and availability mutations were durably observable through authoritative backend/web state;
4. provider projections passed private-field scanning for raw contact, private coordinates, private object keys and privileged literals;
5. recoverable upload-intent behavior remained idempotent/retryable when an applicable verification case existed, while non-applicable fixture paths were not fabricated as PASS;
6. enquiry/review mutation coverage remained explicitly fixture-dependent where the generated synthetic provider had no applicable enquiry/review record; canonical exact-head lifecycle suites and static W5 contract checks continue to enforce revision/policy/trust boundaries;
7. unauthenticated direct API and web access remained denied by Cloud Run IAM;
8. temporary canary Invoker grants were removed after the run;
9. exact-head W2–W5 TypeScript/contract/build gates and Android protected-path checks were green before promotion;
10. no Android source, Gradle, Compose, Firebase Android, signing or release-policy file changed in W5.

## Scope carried forward to W6

W6 may now implement commercial parity only within the currently authorized commercial boundary:

- product catalogue and entitlements;
- subscription creation/status/cancellation using canonical actor-resolved provider scope;
- invoice/payment-intent/receipt lifecycle where already supported by the backend;
- synthetic/disabled payment-provider behavior only.

Real MTN/Airtel money movement, production payment credentials, real participants and formal Phase 12 production release remain separately gated and must not be inferred from W5 closure.
