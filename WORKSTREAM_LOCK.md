# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — functional customer/provider web/PWA parity implementation |
| Owner/agent | Active repository agent — functional PWA parity workstream |
| Authorized scope | Document and implement the real customer/provider web/PWA companion using the same canonical REST/OpenAPI backend, identity, authorization, trust, enquiry, review and commercial rules as Android; desktop replaces bottom navigation with side navigation while mobile retains bottom navigation |
| Protected surface | `android/direkt-app/**` is regression-protected; no Android architecture, dependency, Gradle, release/signing or UI refactor is authorized by this workstream unless a separately reviewed compatibility fix is strictly required |
| Implementation lane | `build/android-v1` — historical name retained; single sequential product lane |
| Stable checkpoint | W8 managed functional browser checkpoint PASS: exact merged source `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`, managed run `29721199177`, public UI `https://direkt-customer-provider-web-6cvw322xxq-an.a.run.app`; canonical API remained IAM-private and the complete Android/backend/database/OpenAPI/web/security gate set passed before promotion |
| Current task | W8 — working synthetic-only functional UI is promoted on managed `run.app`; remaining work is canonical-domain route selection/configuration plus DNS/TLS/direct-external verification while preserving the static synthetic `/preview/` route and private canonical API |
| Governing plan | `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md` |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized |
| Governing issues | Issue #133 for customer/provider PWA/reconciliation; Issue #112 remains open for real pilot evidence/exit |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates |

## Workstream contract

1. The existing synthetic `web/direkt-pwa/` remains a preserved review surface until the functional web client passes the documented parity and security gates.
2. The real browser client is additive under `web/direkt-app/`; it must not be created by refactoring Android into Kotlin Multiplatform/Compose Web.
3. Android and web share product semantics through the canonical NestJS REST/OpenAPI boundary, not shared UI binaries.
4. A live browser client must use a reviewed browser session/BFF/gateway boundary. The IAM-private API must not be made public merely to support the web client.
5. No direct privileged Supabase/database/Storage credentials or authority may enter browser code.
6. Every shared backend/OpenAPI change must remain backward compatible with Android and pass Android regression gates.
7. Mobile web uses bottom navigation aligned to Android. Desktop uses persistent side navigation with the same destinations and capabilities; desktop is a layout adaptation, not a different product.
8. No synthetic fixture or preview-only behavior may be counted as functional parity when a canonical backend capability exists.
9. W2 public discovery uses backend-managed synthetic/test state through the reviewed `authenticated-bff` private API boundary; production unauthenticated API mode remains prohibited.
10. W2 managed evidence passed without exposing API/web publicly. The bounded canary reused `direkt-portal-runtime` only for the private synthetic exercise and bound no portal secret; this does not authorize public deployment.
11. A dedicated least-privilege customer/provider web runtime identity is required for W8 public cutover. The runtime is `direkt-cp-web-runtime@direkt-dev-502701.iam.gserviceaccount.com`; the GitHub deployer has resource-scoped `roles/iam.serviceAccountUser` on this identity only, while runtime-to-API authority remains service-level `roles/run.invoker` on `direkt-api`.
12. W3 browser authentication keeps session material HttpOnly and server-controlled, enforces CSRF/origin/session rotation/replay/expiry controls, and never derives provider scope or authorization from client-selected state or Firebase claims.
13. W4 customer actions remain backend-authoritative and use the same enquiry, contact-consent, interaction, review and complaint lifecycle rules as Android. Managed customer evidence covers customer-controlled mutations; provider-mediated states remain protected and are verified by canonical lifecycle suites rather than fabricated authority.
14. W5 provider workspace access remains actor-resolved server-side. No browser-selected provider identifier grants or widens provider scope. Private evidence upload grants are transient, private object keys remain excluded, and masked handoffs do not expose raw contact.
15. W6 commercial actions remain actor-resolved, retry-safe and revision-controlled, with no verification/publication/ranking effects. External payment credentials and production money movement remain prohibited until separately authorized.
16. W7 closed only after combined Android/backend/database/OpenAPI/web regression evidence plus responsive/accessibility/offline/privacy negative controls and a trusted-main managed browser canary passed; unsupported external integrations remain explicitly GATED.
17. W8 may expose only the reviewed browser/BFF entry point. The canonical API remains IAM-private; the functional browser runtime must use a dedicated least-privilege identity, and the historical static synthetic PWA must remain available under an explicit preview/historical route rather than being silently overwritten.
18. A W8 public route is not accepted merely because deployment succeeds. DNS/TLS, runtime health, manifest/service-worker/installability, browser privacy/cache boundaries and a directly reachable working UI must be verified on the exact promoted source before closure.
19. W8 managed attempt 8 passed on exact source `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`, managed run `29721199177`. Evidence artifact `direkt-w8-functional-cutover-c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2` with digest `sha256:00a0d41e8b8824d7764ab9762f05816bac3639d9360ed8926071c346f066e0b0` proves public functional UI reachability, private API denial, BFF discovery through the private API, PWA/offline behavior, session/private-state boundaries and browser privacy controls.
20. The successful managed `run.app` route gives the owner a working functional review UI but does not by itself close W8. Canonical-domain routing, DNS/TLS, direct external verification and preserved explicit preview evidence remain mandatory.

## Active implementation sequence

- W0 — baseline freeze, Android/API/screen inventory, functional parity matrix and project-wide documentation. **Closed.**
- W1 — additive Next.js/React/TypeScript PWA shell, design system, responsive navigation, manifest/service-worker safety, BFF boundary and typed API foundation. **Closed.**
- W2 — real public discovery vertical slice through canonical API contracts plus managed IAM-private evidence. **Closed — managed run `29694862350` PASS on `4b892b90c42239c81c4f9c6f8c9f5447519dd6f6`.**
- W3 — browser authentication/account/session boundary. **Closed — managed run `29703117963` PASS on `012a7b9c24e93087d823661298d051c08ea34ec0`.**
- W4 — complete customer journey parity. **Closed — managed run `29704996877` PASS on `61a6bce54bffcec545a2009ac353596ee1d69f83`, with exact-head lifecycle contract/backend evidence for provider-mediated states.**
- W5 — complete provider journey parity. **Closed — managed PASS on exact merged source `79228f4bda96106b929aa6183613cb9d2dc127f6`; authoritative bot result is Issue #133 comment `5017630247`.**
- W6 — commercial parity within currently authorized/gated payment boundaries. **Closed — trusted-main managed commercial canary PASS on exact merged source `1b5753002afcf115f6f47334f6588648eca7501d`.**
- W7 — cross-client parity, security, accessibility, responsive, offline/network and Android regression closure. **Closed — exact-head combined regression PASS plus trusted-main managed final browser canary PASS on `25b8cd1b122882974db94b502e3a87080105733d`.**
- W8 — controlled route/deployment cutover; preserve historical preview separately. **Active — managed functional `run.app` PASS; canonical-domain route/DNS/TLS/external verification remains.**

## Stop conditions

Do not merge or promote the functional PWA checkpoint if:

- Android unit/lint/build or release-policy regressions appear;
- the web client requires weakening Cloud Run IAM or exposing privileged Supabase access;
- protected API behavior is changed incompatibly for Android;
- private evidence, contact data or exact provider coordinates can leak into public/browser caches;
- a real participant, legal, payment, production or release gate would need to be fabricated or bypassed;
- parity is claimed from static fixtures instead of backend-observable state;
- browser authentication would expose session credentials to JavaScript-readable storage, accept client-selected provider scope, skip CSRF/origin protections, or activate real participant access without the separate Phase 11 gates;
- a customer or provider mutation could report success without authoritative backend acknowledgement or bypass canonical eligibility, consent, revision or idempotency rules;
- provider mode accepts a provider ID, role or scope selected by the browser;
- commercial state or payment behavior would be allowed to mutate verification, publication or ranking authority, store production payment credentials, or initiate real money movement before external-provider authorization;
- W8 would reuse the privileged operations-portal runtime identity as the permanent public customer/provider identity;
- W8 would make the canonical API unauthenticated/public as a shortcut for browser access;
- the synthetic `/app/` review surface would be overwritten without an explicit preserved preview/historical route;
- the promoted browser route cannot be proven reachable over the approved domain with valid TLS, runtime health, installable manifest/service worker and privacy/cache controls on the exact promoted source.

## Conflict rule

No parallel overlapping writes are permitted while this lock is claimed. Read-only investigation is allowed. A subsequent agent must continue this exact workstream or leave a complete handoff before changing overlapping Android, backend/OpenAPI, web/PWA, CI or control-document paths.
