# W5 — Provider Journey Parity Checkpoint

**Status:** IMPLEMENTING — repository implementation under exact-head verification; managed provider canary required before closure  
**Workstream:** Functional Android/Web parity  
**Governing plan:** `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`

## Implemented browser boundary

The W5 functional web client now uses only actor-resolved provider APIs and reviewed same-origin BFF routes for:

- provider workspace/readiness and verification timeline;
- profile, operating model, service selection/removal, availability and location/service-area configuration;
- separate private-base, consented public-premises and service-area location models;
- recoverable private evidence upload intents with transient upload grants, SHA-256 confirmation, interruption marking, retry and cancellation;
- provider-scoped enquiry list, revision-controlled transitions and safe lifecycle history;
- provider-scoped tracked interactions and masked consent-scoped current handoff state;
- provider reviews, public response and appeal submission;
- account/session security inherited from closed W3;
- actor-resolved commercial/subscription state as read-only W5 context pending W6 commercial mutation closure.

## Security and privacy invariants

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

## Managed W5 closure evidence required

W5 is CLOSED only after exact reviewed source proves in managed synthetic staging:

1. an authenticated provider identity resolves exactly one actor-scoped workspace without a client provider ID;
2. provider workspace/readiness, timeline, interactions, masked handoff state, reviews and commercial state are readable through the web BFF;
3. a reversible provider profile or availability mutation is durably observable through the canonical API/web state;
4. private evidence upload intent creation is idempotent/recoverable and interruption/retry does not leak private object keys;
5. enquiry transition uses expected revision and remains provider-scoped;
6. review response/appeal paths preserve moderation/trust boundaries where applicable synthetic fixtures exist;
7. no raw contact/private evidence/private coordinates appear in browser-safe provider projections;
8. unauthenticated direct API/web access remains denied by Cloud Run IAM;
9. temporary canary Invoker grants are removed;
10. Android protected-path and repository regression gates remain green.

Capabilities without an applicable managed synthetic fixture must remain explicitly GATED/NOT-APPLICABLE in the parity evidence rather than being fabricated as PASS.
