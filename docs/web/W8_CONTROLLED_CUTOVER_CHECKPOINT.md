# W8 — Controlled Functional Browser Cutover Checkpoint

**Status:** CLOSED — canonical functional browser host `https://app.direkt.forum` independently verified with DNS resolution, valid HTTPS/TLS, functional runtime/PWA/BFF/session/privacy controls and preserved synthetic `/preview/` route  
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
8. The canonical functional browser hostname is `https://app.direkt.forum`; the static owner-controlled root remains `https://direkt.forum/`.

## Deployment identity boundary

The dedicated runtime identity exists. The approved GitHub deployer has resource-scoped `roles/iam.serviceAccountUser` on this one runtime identity so it can verify and attach it to Cloud Run. This does not grant project-wide service-account administration.

The deployment workflow may verify/attach the pre-provisioned identity and add/remove only the bounded service-level API invoker binding. It must not create runtime identities, rewrite service-account IAM, reuse operations/API runtime identities as the permanent customer/provider runtime, or make `direkt-api` public.

Service-account ID `direkt-cp-web-runtime` is 21 characters and remains statically checked against the required 6–30-character account-ID boundary.

## Exact-head repository acceptance

The W8 cutover/evidence mechanism and managed attempt 8 passed the required exact-head matrix before promotion:

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
Attempt-8 merged runtime source: `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`.

## Managed public functional UI checkpoint — PASS

**Exact merged runtime source:** `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`  
**Managed run:** `29721199177`  
**Managed public functional UI:** `https://direkt-customer-provider-web-6cvw322xxq-an.a.run.app`  
**Evidence artifact:** `direkt-w8-functional-cutover-c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`  
**Artifact digest:** `sha256:00a0d41e8b8824d7764ab9762f05816bac3639d9360ed8926071c346f066e0b0`

The managed run passed immutable source verification, the complete functional W2–W8 contract, private API/runtime preflight, bounded runtime-to-API invoker binding, image build/deploy, dedicated runtime attachment, IAM verification, direct unauthenticated API denial, responsive browser reachability, manifest/service-worker/offline behavior, BFF discovery, synthetic session/private-state boundaries, browser privacy scanning and evidence promotion.

## Canonical-domain closure — PASS

The owner verified base-domain ownership, created the Cloud Run mapping for `app.direkt.forum`, and published the exact required Cloudflare DNS record:

```text
app CNAME ghs.googlehosted.com.
```

The final canonical-domain verifier was added and exact-head tested through PR #257.

**Canonical URL:** `https://app.direkt.forum`  
**Verification exact head:** `a831b58f8f6684bd345b668c1dfb4d8aab70c5c5`  
**Verification workflow run:** `29802524466`  
**Evidence artifact ID:** `8484244284`  
**Evidence artifact:** `direkt-w8-canonical-domain-a831b58f8f6684bd345b668c1dfb4d8aab70c5c5`  
**Artifact digest:** `sha256:1fc4c334f79f8f6b0f30fcaf55d2d19ea2941cdebc8c5eabf886a913704ea786`  
**Verification mechanism merged:** PR #257 at `a4ad5fa348857f27b5bfef23f6f761deb75859c7`

The external verifier independently proved:

1. public DNS resolution for `app.direkt.forum`;
2. valid HTTPS/TLS hostname and certificate-chain validation through the HTTPS client;
3. direct reachability of the functional responsive browser shell;
4. installable DIREKT manifest;
5. bounded service worker and offline fallback;
6. canonical-host BFF discovery into the reviewed private API path with `no-store` behavior;
7. synthetic session bootstrap with no JavaScript-readable access/refresh token material;
8. unauthenticated private customer/provider state denial;
9. browser-observable privacy scan with no protected credential/evidence/contact/private-location markers;
10. preserved and independently reachable `https://direkt.forum/preview/` synthetic review route.

The sanitized evidence records `canonicalCustomDomainVerified:true`, while `realParticipantActivation:false`, `externalPaymentActivation:false`, and `formalProductionRelease:false` remain unchanged.

## W8 exit decision

All documented W8 exit conditions are now met:

- managed functional browser runtime: PASS;
- dedicated least-privilege runtime identity: PASS;
- canonical API remains IAM-private: PASS;
- canonical hostname/DNS/TLS: PASS;
- responsive runtime/PWA/offline: PASS;
- BFF/session/private-state/privacy boundaries: PASS;
- preserved explicit synthetic preview: PASS;
- direct external canonical-host verification: PASS.

**Decision: W8 CLOSED.** The W0–W8 functional customer/provider browser parity/cutover workstream no longer requires the repository single-lane lock and may release it for the next separately authorized workstream.

## Non-authorization statement

W8 closure proves browser deployment/readiness only. It does **not** authorize real participant admission, production authentication, real evidence collection, production WhatsApp/FCM/email delivery, real money movement, Phase 11 exit, Play production release or formal Phase 12 production launch. Those remain controlled by their own documented integration, pilot, legal/privacy and release gates.
