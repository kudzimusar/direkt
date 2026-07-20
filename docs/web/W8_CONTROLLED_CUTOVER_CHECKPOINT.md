# W8 — Controlled Functional Browser Cutover Checkpoint

**Status:** IMPLEMENTING — deployment mechanism reviewed; first trusted-main cutover failed closed; dedicated runtime-identity prerequisite and managed public/canonical-domain evidence pending  
**Workstream:** Functional Android/Web parity  
**Governing plan:** `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`

## Purpose

W8 promotes the already-reviewed functional `web/direkt-app/` browser/BFF application to a remotely reachable synthetic-only review runtime without exposing the canonical NestJS API, weakening Android, or activating real participants, real payments or formal production release.

W8 is a deployment/readiness checkpoint, not a new product-domain phase.

## Controlled cutover architecture

1. GitHub Pages remains the public static documentation/synthetic-preview origin.
2. The dependency-free `web/direkt-pwa/` build is preserved under explicit `/preview/`; the historical `/app/` path remains intact during transition so existing links do not break before the functional route is proven.
3. The functional `web/direkt-app/` Next.js application is deployed to a server runtime because its reviewed BFF/session boundary cannot be safely converted into a privileged static Pages client.
4. The public browser/BFF service uses a dedicated least-privilege runtime identity: `direkt-customer-provider-web-runtime@direkt-dev-502701.iam.gserviceaccount.com`.
5. That runtime identity receives only service-level `roles/run.invoker` on the IAM-private `direkt-api` Cloud Run service.
6. Only the browser/BFF service is publicly invokable. The canonical API must continue to deny unauthenticated direct access.
7. Browser authentication remains `synthetic` for this remote-review checkpoint. Firebase/real participant admission remains separately gated.
8. Real MTN/Airtel money movement, external providers, Phase 11 real evidence and formal Phase 12 production release remain disabled/unclaimed.

## Deployment identity boundary

The Google Cloud integration plan defines `direkt-github-deployer` as a deployment identity with Artifact Registry/Cloud Run deployment and service-account attachment authority. W8 therefore must not silently expand that identity into an IAM service-account administrator.

The dedicated runtime identity is a one-time infrastructure prerequisite. It must exist before the trusted W8 cutover runs. The deployment workflow may:

- verify the exact runtime identity exists;
- attach that identity to the customer/provider Cloud Run service using the deployer's already-approved service-account-user boundary;
- add/remove only the service-level `roles/run.invoker` binding between that runtime and `direkt-api` as part of the controlled cutover/rollback.

The deployment workflow must not:

- create the runtime service account;
- grant itself or rewrite `roles/iam.serviceAccountUser` on that service account;
- reuse `direkt-portal-runtime` or `direkt-api-runtime` as the permanent public customer/provider runtime.

Required one-time runtime identity:

```text
direkt-customer-provider-web-runtime@direkt-dev-502701.iam.gserviceaccount.com
```

This identity requires no project-wide application role for W8 beyond being attachable as the Cloud Run runtime. API invocation is granted at the `direkt-api` service boundary by the reviewed deployment workflow.

## Exact-head repository acceptance

Before the W8 deployment mechanism may merge, the same reviewed head must prove:

- W2–W8 functional web TypeScript/static/security/build verification passes;
- backend/database/OpenAPI regressions remain green;
- Android unit/lint/assembly/dependency regression remains green and `android/direkt-app/**` is unchanged;
- supply-chain/protected-literal controls pass;
- Pages packaging contains both the historical `/app/` synthetic route and explicit `/preview/` synthetic route;
- no W8 script/workflow reuses `direkt-portal-runtime` as the permanent public customer/provider identity;
- the managed workflow can only dispatch an exact commit already merged to `main`;
- a failed public cutover removes `allUsers` from the web service and removes the W8 runtime-to-API binding;
- no successful path makes `direkt-api` publicly invokable;
- the deploy workflow treats the dedicated runtime identity as a pre-provisioned prerequisite rather than self-provisioning IAM authority.

## First trusted-main attempt

The first W8 trusted-main trigger merged at exact source `532b6d4a44e984dde49c60a87d7d053dda07f6f6` and reported **FAIL / INCOMPLETE** on Issue #133. No functional UI was promoted.

That failed checkpoint is not treated as product evidence. The fail-closed design remains authoritative: W8 stays open and the canonical API must remain IAM-private.

Post-failure review found that the original W8 deployment mechanism exceeded the documented deployment-identity boundary by attempting to create the dedicated service account and rewrite that account's IAM policy inside the release workflow. That mechanism is being corrected before another managed attempt. This records the reviewed control defect without claiming an unobserved workflow failure line as the exact runtime error.

## Managed public functional UI checkpoint

After the corrected mechanism is reviewed and merged, a separate one-file trusted-main trigger must dispatch `functional-pwa-w8-managed-cutover.yml` against the exact trigger source.

The managed checkpoint must prove:

1. the pre-provisioned dedicated customer/provider runtime service account exists and is attached to the functional web service;
2. the public web service is reachable without Cloud Run IAM credentials;
3. direct unauthenticated access to `direkt-api` remains `403`;
4. public discovery traverses the BFF/runtime identity into the private API and returns backend-managed synthetic categories;
5. manifest, service worker and offline fallback are served from the same functional runtime;
6. API/auth/customer/provider private traffic remains network-only/no-store and private state remains session-gated;
7. browser-visible responses contain no privileged credentials, private object keys, raw contact, DIREKT access/refresh tokens or private coordinate fields;
8. the evidence artifact records the exact source and public functional UI URL;
9. any failed run returns deployment IAM to a fail-closed state without rewriting the pre-provisioned runtime identity's IAM policy.

A successful managed `run.app` route is sufficient to give the owner a directly working functional UI for review, but it does **not** by itself close W8.

## Canonical-domain closure still required

W8 closes only after the approved canonical functional app route is independently proven with:

- DNS resolution;
- valid TLS;
- functional runtime health;
- installable manifest/service worker/offline shell;
- privacy/cache controls;
- preserved explicit synthetic `/preview/` route;
- a direct external fetch of the working UI.

Because the existing `direkt.forum` root is currently the GitHub Pages/static origin, a server-side functional application cannot safely replace only the `/app/` path through a simple Cloud Run domain mapping. The final approved route must use an architecture that actually supports the required routing (for example a reviewed dedicated app host/subdomain or an approved edge/load-balancer route). No canonical-domain PASS will be claimed until that route is real and externally verified.

## Non-authorization statement

W8 browser deployment readiness does not authorize real participant admission, Firebase production authentication, automated registry access, real payments, WhatsApp/FCM production delivery, Phase 11 exit, 11J `PROCEED`, Google Play production release or formal Phase 12 production release.
