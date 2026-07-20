# W7 — Cross-Client Parity and Regression Checkpoint

**Status:** CLOSED — exact-head regression PASS and trusted-main managed final browser canary PASS  
**Workstream:** Functional Android/Web parity  
**Governing plan:** `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`

## Closure evidence

W7 added no new product-domain behavior. It closed only after the reviewed browser capabilities from W2–W6 passed the combined web/backend/database/OpenAPI/Android regression boundary and a separate trusted-main managed browser canary passed on an immutable merged source.

### Exact-head repository evidence

Reviewed implementation PR: **#215**  
Exact reviewed implementation head: `23aedc0af48e244c60a9d03accbdc74e83b14416`  
Implementation merge on `main`: `6cb346d8bde38712324d39a634a171501975b2e3`

The exact reviewed head passed the required matrix, including:

- functional web TypeScript, W2–W7 contract verification and production build;
- canonical backend format/lint/type/authorization/migration checks, full Vitest regression and build;
- canonical OpenAPI generation/check plus local PostgreSQL/PostGIS migration regression;
- Android debug unit tests, lint and debug assembly;
- Android debug and release runtime dependency graph resolution;
- Android protected-path proof showing no W7 mutation under `android/direkt-app/**`;
- responsive mobile/tablet/desktop navigation semantics;
- skip-link, keyboard/focus target-size and reduced-motion semantics;
- explicit service-worker network-only/no-store handling for API, authentication and private lifecycle traffic;
- no privileged Supabase/database authority or browser-readable DIREKT session/private evidence state;
- CSRF/origin/provider-scope/privacy negative contracts;
- capability-matrix reconciliation using only evidence-backed PASS/GATED/N/A states;
- repository supply-chain/security and documentation gates.

Primary W7 cross-client regression run: `29712726974` — PASS on the exact reviewed head.  
Supporting exact-head workflows also passed for documentation quality, customer/provider PWA validation, W4 lifecycle regression, functional PWA verification and Phase 10 supply-chain/security.

## Trusted-main managed final browser evidence

After implementation promotion and branch synchronization, PR **#219** added only `docs/web/W7_MANAGED_CANARY_MAIN_TRIGGER.md` as the trusted-main evidence trigger.

Exact trusted-main managed source: `25b8cd1b122882974db94b502e3a87080105733d`

Issue #133 contains the workflow-authored authoritative result under:

`<!-- direkt-w7-main-canary-result -->`

Result: **W7 managed final browser canary: PASS** on the exact source above.

The reviewed managed workflow establishes the following closure controls before reporting PASS:

1. the functional web shell renders desktop side navigation, tablet rail, mobile bottom navigation, skip-link and main-content landmarks;
2. the installable manifest, bounded service worker and offline fallback are served from the same deployment;
3. API/auth/customer/provider private traffic remains network-only/no-store and session-gated;
4. unauthenticated direct API and managed web access remain denied while the private canary is active;
5. rendered/static/bootstrap responses are scanned for privileged credentials, private object keys, raw contact, DIREKT access/refresh tokens and private coordinate fields;
6. temporary canary Invoker grants are removed through the always-run cleanup step and final IAM is re-verified before a successful run can conclude;
7. the W2–W6 evidence chain remains reconciled;
8. external integrations, real participant admission and formal production release remain explicitly GATED.

The canary produces a sanitized `w7-canary-evidence.json` artifact and does not authorize public API access, real participant admission, external-provider activation or production release.

## Honest cross-client constraint retained

The additive PWA workstream did not modify `android/direkt-app/**`. W7 proves canonical REST/OpenAPI compatibility and zero Android regression; it does not fabricate live Android network mutations for runtime paths the protected Android surface does not currently expose. Those runtime activations remain explicitly GATED in the parity matrix.

## W8 authorization boundary

W7 closure unblocks **W8 controlled route/deployment cutover only**.

W8 must:

- preserve the existing static synthetic `web/direkt-pwa/` review surface under an explicit preview/historical route;
- promote the functional `web/direkt-app/` only through a reviewed server-side browser/BFF runtime, not by converting it into a privileged static Pages client;
- keep the canonical NestJS API IAM-private;
- use a dedicated least-privilege customer/provider web runtime identity before any public browser cutover rather than reusing the operations-portal runtime identity;
- verify public route/DNS/TLS/runtime health plus manifest/service-worker/installability on the exact promoted source;
- preserve real participant, identity-provider, payment, external-provider, Phase 11 and formal Phase 12 production gates.

W7 is closed. W8 is the active workstream checkpoint.
