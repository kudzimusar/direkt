# W7 — Cross-Client Parity and Regression Checkpoint

**Status:** IMPLEMENTING — exact-head regression and trusted-main managed final browser evidence are required before closure  
**Workstream:** Functional Android/Web parity  
**Governing plan:** `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`

## W7 acceptance boundary

W7 adds no new product domain behavior. It must prove that the closed W2–W6 browser capabilities remain compatible with the canonical backend and protected Android client while preserving responsive, accessibility, offline, privacy and security invariants.

### Exact-head repository evidence required

Before promotion, the same reviewed W7 head must pass:

- functional web TypeScript, W2–W7 contract verifiers and production build;
- canonical backend format/lint/type/authorization/migration checks, full Vitest regression and build;
- canonical OpenAPI generation/check and local PostgreSQL/PostGIS migration regression;
- Android debug unit tests, lint and debug assembly;
- Android debug and release runtime dependency graph resolution;
- Android protected-path diff proving no W7 Android mutation;
- responsive mobile/tablet/desktop navigation semantics;
- skip-link, keyboard focus target-size and reduced-motion semantics;
- service-worker network-only/no-store rules for API, authentication and private lifecycle traffic;
- no privileged Supabase/database authority or browser-readable DIREKT session/private evidence state;
- CSRF/origin/provider-scope/privacy negative contracts;
- capability matrix reconciliation using only PASS/GATED/N/A without fabricated runtime claims;
- repository supply-chain/security and documentation gates.

No implementation SHA, workflow run, or managed canary may be recorded here as PASS until it is the exact evidence used for promotion.

## Managed W7 closure evidence required

After the reviewed W7 implementation is merged to `main` and the implementation lane is synchronized, a separate one-file trusted-main trigger must run the reviewed W7 managed canary against an immutable merged source. The managed canary must establish:

1. the functional web shell renders desktop side navigation, tablet rail, mobile bottom navigation, skip-link and main-content landmarks;
2. the installable manifest, bounded service worker and offline fallback are served from the same deployment;
3. API/auth/customer/provider private traffic remains network-only/no-store and session-gated;
4. unauthenticated direct API and managed web access remain denied while the private canary is active;
5. rendered/static/bootstrap responses contain no privileged credentials, private object keys, raw contact, DIREKT access/refresh tokens or private coordinate fields;
6. temporary canary Invoker grants are removed and final IAM is re-verified;
7. the W2–W6 evidence chain remains reconciled;
8. external integrations, real participant admission and formal production release remain explicitly GATED.

The authoritative PASS/FAIL result is posted to Issue #133 under `<!-- direkt-w7-main-canary-result -->` only by the trusted-main trigger workflow.

## Honest cross-client constraint retained

The additive PWA workstream must not modify `android/direkt-app/**`. W7 may prove canonical REST/OpenAPI compatibility and zero Android regression, but it must not fabricate live Android network mutations for runtime paths the protected Android surface does not currently expose. Those runtime activations remain explicitly GATED in the parity matrix.

## W8 remains blocked

W8 controlled cutover is not authorized until both the exact-head repository matrix and the trusted-main managed W7 canary pass and this checkpoint is updated with the actual evidence identifiers. W8 must continue to preserve the synthetic preview separately and must not weaken the IAM-private canonical API, participant, payment, external-provider, Phase 11 or formal Phase 12 gates.
