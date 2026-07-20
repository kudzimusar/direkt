# W8 — Controlled Functional Browser Cutover Checkpoint

**Status:** IMPLEMENTING — functional public `run.app` browser/BFF checkpoint PASS on exact source `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`; canonical-domain routing/DNS/TLS evidence remains before W8 closure  
**Workstream:** Functional Android/Web parity  
**Governing plan:** `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`

## Purpose

W8 promotes the reviewed functional `web/direkt-app/` browser/BFF application to a remotely reachable synthetic-only review runtime without exposing the canonical NestJS API, weakening Android, or activating real participants, real payments or formal production release.

W8 is a deployment/readiness checkpoint, not a new product-domain phase.

## Controlled cutover architecture

1. GitHub Pages remains the public static documentation/synthetic-preview origin.
2. The dependency-free `web/direkt-pwa/` build is preserved under explicit `/preview/`; the historical `/app/` static route remains intact during transition.
3. The functional `web/direkt-app/` Next.js application runs on Cloud Run because its reviewed BFF/session boundary cannot safely be converted into a privileged static Pages client.
4. The public browser/BFF service uses the dedicated least-privilege runtime identity `direkt-cp-web-runtime@direkt-dev-502701.iam.gserviceaccount.com`.
5. That runtime identity receives only service-level `roles/run.invoker` on the IAM-private `direkt-api` service.
6. Only the browser/BFF service is publicly invokable. Direct unauthenticated access to the canonical API remains denied.
7. Browser authentication remains `synthetic` for this remote-review checkpoint. Firebase/real participant admission remains separately gated.
8. Real MTN/Airtel money movement, external providers, Phase 11 real evidence and formal Phase 12 production release remain disabled/unclaimed.

## Deployment identity boundary

The dedicated runtime identity now exists. The approved GitHub deployer has resource-scoped `roles/iam.serviceAccountUser` on this one runtime identity so it can verify and attach the identity to Cloud Run. This does not grant project-wide service-account administration.

The reviewed deployment workflow may:

- verify and attach the pre-provisioned runtime identity;
- add/remove only the service-level `roles/run.invoker` binding between that runtime and `direkt-api` during cutover/rollback;
- deploy only the public browser/BFF service.

The deployment workflow must not:

- create the runtime service account;
- grant itself or rewrite service-account IAM policy;
- reuse `direkt-portal-runtime` or `direkt-api-runtime` as the permanent public customer/provider runtime;
- make `direkt-api` public.

Required runtime identity:

```text
direkt-cp-web-runtime@direkt-dev-502701.iam.gserviceaccount.com
```

Service-account ID `direkt-cp-web-runtime` is 21 characters and remains statically checked against the required 6–30-character account-ID boundary.

## Exact-head repository acceptance

The final W8 cutover/evidence mechanism and attempt-8 one-file trigger passed the required exact-head matrix before promotion, including:

- W2–W8 functional web TypeScript/static/security/build verification;
- backend/database/OpenAPI regression;
- Android unit/lint/assembly/dependency regression with no `android/direkt-app/**` mutation;
- supply-chain/protected-literal controls where applicable to mechanism changes;
- Pages packaging of both historical `/app/` and explicit `/preview/` synthetic routes;
- dedicated-runtime and browser-privilege negative controls;
- exact-merged-source trusted-main dispatch;
- fail-closed IAM cleanup on unsuccessful cutovers;
- reliable sanitized evidence generation and upload.

Attempt-8 trigger exact head: `cf0afb8ce1249a7988a79c1b20eef528244d60be` — all required trigger-head checks PASS.  
Attempt-8 merged source: `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`.

## Managed cutover progression

The W8 cutover was intentionally fail-closed while infrastructure and verification defects were removed:

- Attempts 1–2 failed before UI promotion; review corrected deployment-identity overreach and an invalid 36-character runtime service-account ID.
- Attempts 3–4 isolated the dedicated-runtime preflight boundary. The owner then provisioned the valid runtime identity and applied resource-scoped `roles/iam.serviceAccountUser` from the GitHub deployer to that identity only.
- Attempt 5 proved preflight, private-API invoker binding, image build/push, Cloud Run deployment/runtime attachment, origin pinning and IAM verification; the final browser exercise remained opaque.
- Attempt 6 isolated a PWA manifest icon-contract mismatch; the manifest now has separate standard and maskable icon declarations with a permanent static regression.
- Attempt 7 completed every managed runtime/IAM/PWA/BFF/session/privacy check successfully, but artifact upload was skipped because the workflow incorrectly used `hashFiles()` against `runner.temp`. The evidence pipeline was corrected and permanently guarded.
- Attempt 8 reproduced the complete managed verification and successfully uploaded/promoted the sanitized evidence artifact.

Earlier failed/incomplete attempts are historical diagnostic evidence only and do not override the final exact-source PASS.

## Managed public functional UI checkpoint — PASS

**Exact merged source:** `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`  
**Managed run:** `29721199177`  
**Public functional UI:** `https://direkt-customer-provider-web-6cvw322xxq-an.a.run.app`  
**Evidence artifact:** `direkt-w8-functional-cutover-c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`  
**Artifact digest:** `sha256:00a0d41e8b8824d7764ab9762f05816bac3639d9360ed8926071c346f066e0b0`

The managed run passed every controlled verification step:

1. immutable reviewed source verification;
2. functional W2–W8 contract verification;
3. approved Google Cloud authentication;
4. private API and dedicated-runtime preflight;
5. service-level runtime-to-API invoker binding;
6. image build/push;
7. Cloud Run deployment and dedicated runtime attachment;
8. browser origin pinning;
9. final runtime/IAM boundary verification;
10. direct unauthenticated canonical API denial;
11. public responsive browser shell reachability;
12. installable manifest, service worker and offline fallback;
13. BFF discovery traversal into the IAM-private API;
14. synthetic session and unauthenticated private-state boundaries;
15. browser-visible privacy scan and sanitized evidence generation;
16. evidence artifact upload and trusted-main promotion.

The sanitized evidence records:

- `dataMode: synthetic-only`;
- public functional web reachable;
- canonical API remains IAM-private;
- dedicated runtime identity attached;
- canonical discovery through private API PASS with 4 categories observed;
- responsive shell PASS;
- installable manifest PASS;
- service-worker private traffic network-only PASS;
- offline fallback PASS;
- synthetic session bootstrap no-store PASS;
- unauthenticated private state denied;
- browser privacy scan PASS;
- explicit synthetic preview route retained as `https://direkt.forum/preview/`;
- canonical custom domain not yet verified;
- real participant activation false;
- external payment activation false;
- formal production release false.

A successful managed `run.app` route is sufficient to give the owner a directly working functional UI for review, but it **does not by itself close W8**.

## Canonical-domain closure still required

W8 closes only after an approved canonical functional-app route is independently proven with:

- DNS resolution;
- valid TLS;
- functional runtime health;
- installable manifest/service worker/offline shell;
- privacy/cache controls;
- preserved explicit synthetic `/preview/` route;
- direct external fetch of the working UI.

The existing `direkt.forum` root is the GitHub Pages/static origin. A server-side functional application cannot safely replace only `/app/` through a simple Cloud Run domain mapping. The remaining closure work must use a routing architecture that actually supports the intended separation, such as an approved dedicated app host/subdomain or reviewed edge/load-balancer route.

Until that route is configured and externally verified:

- the working functional review UI remains the managed `run.app` URL above;
- the explicit static synthetic preview remains preserved;
- `canonicalCustomDomainVerified` remains false;
- W8 remains **IMPLEMENTING**, not closed.

## Non-authorization statement

W8 browser deployment readiness does not authorize real participant admission, Firebase production authentication, automated registry access, real payments, WhatsApp/FCM production delivery, Phase 11 exit, 11J `PROCEED`, Google Play production release or formal Phase 12 production release.
