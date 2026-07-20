# W8 — Controlled Functional Browser Cutover Checkpoint

**Status:** IMPLEMENTING — functional public `run.app` browser/BFF checkpoint PASS on exact source `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`; canonical-domain routing, DNS, TLS and direct external verification remain before W8 closure  
**Workstream:** Functional Android/Web parity  
**Governing plan:** `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`

## Purpose

W8 promotes the reviewed `web/direkt-app/` Next.js browser/BFF to a remotely reachable synthetic-only review runtime while keeping the canonical API IAM-private, preserving Android compatibility and retaining all real-participant and production-release gates.

## Controlled cutover architecture

1. GitHub Pages remains the public static documentation/synthetic-preview origin.
2. The dependency-free `web/direkt-pwa/` remains preserved under explicit `/preview/`; the historical static `/app/` route remains intact during transition.
3. The functional browser/BFF runs on Cloud Run because its server session/BFF boundary cannot safely be converted into a privileged static client.
4. The public browser/BFF uses the dedicated least-privilege runtime identity `direkt-cp-web-runtime@direkt-dev-502701.iam.gserviceaccount.com`.
5. That identity receives only service-level `roles/run.invoker` on the IAM-private `direkt-api` service.
6. Only the browser/BFF is publicly invokable. Direct unauthenticated canonical-API access remains denied.
7. Browser authentication remains synthetic for this review checkpoint.

## Deployment identity boundary

The dedicated runtime identity exists. The approved GitHub deployer has resource-scoped `roles/iam.serviceAccountUser` on this one runtime identity so it can verify and attach it to Cloud Run. This does not grant project-wide service-account administration.

The deployment workflow may verify/attach the pre-provisioned identity and add/remove only the bounded service-level API invoker binding. It must not create runtime identities, rewrite service-account IAM, reuse operations/API runtime identities as the permanent customer/provider runtime, or make `direkt-api` public.

Service-account ID `direkt-cp-web-runtime` is 21 characters and remains statically checked against the required 6–30-character account-ID boundary.

## Exact-head repository acceptance

The final W8 cutover/evidence mechanism and attempt-8 one-file trigger passed the required exact-head matrix before promotion:

- W2–W8 functional web TypeScript/static/security/build verification;
- backend/database/OpenAPI regression;
- Android unit/lint/assembly/dependency regression with no protected Android mutation;
- supply-chain/protected-literal controls for mechanism changes;
- historical `/app/` plus explicit `/preview/` packaging;
- dedicated-runtime and browser-privilege negative controls;
- exact-source trusted-main dispatch;
- fail-closed IAM cleanup;
- sanitized evidence generation and upload.

Attempt-8 trigger exact head: `cf0afb8ce1249a7988a79c1b20eef528244d60be` — required checks PASS.  
Attempt-8 merged source: `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`.

## Managed cutover progression

W8 remained fail-closed while defects were isolated and corrected:

- early attempts corrected deployment-identity overreach and the invalid 36-character runtime account ID;
- dedicated-runtime preflight was isolated, then the valid runtime identity and resource-scoped attach permission were provisioned;
- deployment, image, private-API invoker, origin and IAM checks were split into auditable phases;
- browser verification was split into direct-API denial, public shell, PWA/offline, BFF discovery, session/private-state and privacy-evidence phases;
- a PWA manifest icon mismatch was corrected and permanently regression-tested;
- attempt 7 passed all runtime checks but exposed an evidence-upload predicate defect;
- attempt 8 reproduced the full managed verification and successfully promoted the evidence artifact.

Earlier incomplete attempts are diagnostic history only and do not override the final exact-source PASS.

## Managed public functional UI checkpoint — PASS

**Exact merged source:** `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`  
**Managed run:** `29721199177`  
**Public functional UI:** `https://direkt-customer-provider-web-6cvw322xxq-an.a.run.app`  
**Evidence artifact:** `direkt-w8-functional-cutover-c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`  
**Artifact digest:** `sha256:00a0d41e8b8824d7764ab9762f05816bac3639d9360ed8926071c346f066e0b0`

The managed run passed:

1. immutable reviewed-source verification;
2. functional W2–W8 contract verification;
3. private API and dedicated-runtime preflight;
4. service-level runtime-to-API invoker binding;
5. image build/push and Cloud Run deployment;
6. dedicated runtime attachment and origin pinning;
7. final IAM boundary verification;
8. direct unauthenticated canonical API denial;
9. public responsive browser shell reachability;
10. installable manifest, service worker and offline fallback;
11. BFF discovery traversal into the private API;
12. synthetic session and unauthenticated private-state boundaries;
13. browser privacy scan;
14. evidence artifact upload and trusted-main promotion.

The sanitized evidence records synthetic-only data mode, 4 backend-managed categories, responsive/PWA/offline PASS, private traffic network-only/no-store controls, private-state denial, privacy PASS, preserved `https://direkt.forum/preview/`, and `canonicalCustomDomainVerified:false`.

A successful managed `run.app` route gives the owner a directly working functional UI for review, but it does **not** by itself close W8.

## Canonical-domain closure still required

W8 closes only after an approved canonical functional-app route is independently proven with:

- DNS resolution;
- valid TLS;
- functional runtime health;
- installable manifest/service worker/offline shell;
- privacy/cache controls;
- preserved explicit synthetic `/preview/` route;
- direct external fetch of the working UI.

The existing `direkt.forum` root is the GitHub Pages/static origin. A server-side functional application cannot safely replace only `/app/` through a simple Cloud Run domain mapping. The remaining closure must use a routing architecture that supports the required separation, such as an approved dedicated app host/subdomain or reviewed edge/load-balancer route.

Until that route is configured and externally verified, the working functional review UI remains the managed `run.app` URL, `canonicalCustomDomainVerified` remains false, and W8 remains **IMPLEMENTING**.

## Non-authorization statement

W8 browser readiness does not authorize real participant admission, production authentication, real money movement, Phase 11 exit or formal production release.
