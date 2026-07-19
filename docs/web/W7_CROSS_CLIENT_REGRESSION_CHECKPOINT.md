# W7 — Cross-Client Parity and Regression Checkpoint

**Status:** CLOSED — comprehensive exact-head regression PASS plus trusted-main managed final browser canary PASS on exact merged source `cebbbc70bfb871da5661924c6653fd050eef12cd`  
**Managed evidence:** Issue #133 authoritative bot result under `<!-- direkt-w7-main-canary-result -->`  
**Workstream:** Functional Android/Web parity  
**Governing plan:** `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`

## Closed W7 acceptance boundary

W7 added no new product domain. It proved that the closed W2–W6 browser capabilities remain compatible with the canonical backend and protected Android client while preserving responsive, accessibility, offline, privacy and security invariants.

### Exact-head repository evidence

The W7 checkpoint passed on exact implementation head `d647a46845fde68c6a13fd8149ba482e48c47ba3`, subsequently promoted to `main` as `a813412d3ab9f1738460b85ca077e6cfc5d73579`:

- functional web TypeScript, W2–W7 contract verifiers and production build;
- backend migrations, full Jest regression, build and canonical OpenAPI generation/check;
- database Data API, authorization and provider-workspace contract harnesses;
- Android debug unit tests, lint and debug assembly;
- Android debug and release runtime dependency graph resolution;
- Android protected-path diff proving no W7 Android mutation;
- mobile bottom navigation, tablet navigation rail and desktop side navigation semantics;
- skip-link, keyboard focus target size and reduced-motion semantics;
- service-worker network-only/no-store rules for auth/customer/provider mutation routes;
- no privileged Supabase/database authority or browser-readable DIREKT session/private evidence state;
- CSRF/origin/provider-scope/direct-canonical-API negative contracts;
- parity matrix reconciliation using PASS/GATED/N/A without fabricated runtime claims.

The comprehensive W7 workflow `29707651313` completed successfully, including all Android, backend/database/OpenAPI, functional-web and documentation/security jobs.

## Managed W7 closure evidence

The trusted-main W7 final browser canary passed on exact merged trigger source `cebbbc70bfb871da5661924c6653fd050eef12cd`. The managed evidence established:

1. the reviewed functional web shell rendered desktop side navigation, tablet rail, mobile bottom navigation, skip-link and main-content landmarks from the immutable deployment;
2. the installable manifest, service worker and offline fallback were served from the same deployment;
3. auth/customer/provider mutation routes remained network-only/no-store and session-gated;
4. unauthenticated direct API and web access remained denied by Cloud Run IAM during the private canary;
5. browser-safe rendered/static/auth-bootstrap responses passed scans for service-role credentials, database URLs, private object keys, raw contact, DIREKT access/refresh tokens and private coordinate fields;
6. temporary canary Invoker grants were removed after the run;
7. the W2–W6 managed evidence chain remained reconciled and no core capability was silently downgraded;
8. external integrations, real participant admission and formal production release remained explicitly GATED.

## Honest cross-client constraint retained

The additive PWA workstream did not modify `android/direkt-app/**`. W7 therefore proves canonical REST/OpenAPI compatibility and zero Android regression. It does not fabricate a live Android network mutation for client paths that the protected existing Android runtime does not currently expose. That runtime activation remains explicitly GATED in the parity matrix rather than being counted as PASS.

## Scope carried forward to W8

W8 is authorized only for controlled browser-route/deployment cutover:

- preserve the historical synthetic preview separately;
- deploy the real `web/direkt-app` browser client through a reviewed public web entry point while keeping the canonical NestJS API IAM-private;
- use a dedicated least-privilege customer/provider web runtime identity before public cutover;
- verify public browser discovery/installability and private BFF/API invocation boundaries;
- keep real Firebase Web participant activation, external integrations, real payment movement, Phase 11 real evidence and formal Phase 12 production release separately GATED;
- update project-wide docs/status only after the public route and rollback/preview preservation are proven.

W8 cutover must not reuse the operations portal runtime identity as the permanent public customer/provider web runtime.
