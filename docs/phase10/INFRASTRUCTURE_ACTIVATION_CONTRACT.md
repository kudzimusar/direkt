# Phase 10 Infrastructure Activation Contract

**Status:** Authorized development/staging integration boundary  
**Governing issue:** #41  
**Checkpoint PR:** #42  
**Data mode:** Synthetic-only until Phase 11 separately authorizes a controlled pilot

## 1. Purpose

Phase 10 requires real managed infrastructure to prove private storage, configuration, deployment, backup, restore, monitoring, security and performance controls. A remotely reachable development or staging deployment is therefore allowed when it is restricted, synthetic-only and not represented as a public pilot or production service.

This contract corrects the earlier over-broad wording that prohibited every deployment. It does not relax the Phase 11 real-participant gate or the Phase 12 production-release gate.

## 2. Deployment classes

| Class | Owner phase | Data | Audience | Status |
|---|---|---|---|---|
| Local/emulated | Phases 0–10 | synthetic | developers | allowed |
| Managed development | Phase 10 | synthetic only | repository agents and named internal testers | allowed |
| Protected staging | Phase 10 | synthetic plus separately approved non-personal fixtures | named team/testers behind deployment protection | allowed |
| Controlled Zambia pilot | Phase 11 | consented pilot data | approved pilot cohort | prohibited until Phase 11 entry gates pass |
| Production | Phase 12 | approved real data | public users and operations staff | prohibited until Phase 12 release gates pass |

An internet-addressable URL does not by itself make a deployment a public pilot. Public promotion, indexing, unrestricted invitations, real participant processing and production claims remain prohibited in Phase 10.

## 3. Bound infrastructure

### Supabase development

| Field | Value |
|---|---|
| Project display name | `direct-app` (display name is informational) |
| Immutable project ref | `aeeuscifrxcjmnswqwnq` |
| URL | `https://aeeuscifrxcjmnswqwnq.supabase.co` |
| Region | `ap-northeast-1` |
| Use | PostgreSQL/PostGIS and private object storage |

The backend remains the only privileged Supabase client. Android and browser code receive no database URL, secret key or service-role credential.

Required private buckets:

- `provider-evidence`;
- `provider-media-private`;
- `provider-media-public` (still private until publication approval);
- `system-exports`.

The existing manual workflow `DIREKT Supabase development activation` remains the mutation and verification authority. Repeated verification must target the immutable project ref and upload sanitized evidence only.

### Google Cloud development

| Field | Value |
|---|---|
| Project ID | `direkt-dev-502701` |
| Project number | `264358173369` |
| Region | `asia-northeast1` |
| Artifact Registry | `direkt-containers` |
| Cloud Run service | `direkt-api` |
| Runtime service account | `direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com` |
| GitHub deployer service account | `direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com` |
| GitHub WIF provider | `projects/264358173369/locations/global/workloadIdentityPools/direkt-github/providers/direkt-main` |

Runtime secrets are read from Google Secret Manager using these existing names:

- `direkt-database-url`;
- `direkt-supabase-url`;
- `direkt-supabase-secret-key`;
- `direkt-access-token-secret`;
- `direkt-contact-hash-pepper`;
- `direkt-challenge-hash-pepper`.

The administrative `direkt-direct-database-url` secret is deliberately not attached to the API runtime.

### Firebase internal distribution

| Field | Value |
|---|---|
| Firebase project | `direkt-dev-502701` |
| Debug Android app ID | `1:264358173369:android:64d69e281d447f44e15968` |
| Production Android app ID | `1:264358173369:android:905e61d484ab6a9ee15968` |
| Internal tester group | `direkt-internal-testers` |

Phase 10 permits debug/internal tester distribution. Public Play release remains Phase 12.

### Vercel operations portal

The Vercel project must use:

```text
Repository: kudzimusar/direkt
Root directory: admin/direkt-operations-portal
Framework: Next.js
Production branch during Phase 10: a protected Phase 12 release branch, not main
Preview deployments: enabled
Deployment protection: enabled for every Phase 10 URL
```

Phase 10 Vercel environments are Preview or a protected custom Staging environment. They must remain no-indexed and must not use a public production custom domain.

Required Preview/Staging variables:

```text
DIREKT_API_BASE_URL
NEXT_PUBLIC_APP_ENV=development
PORTAL_COOKIE_SECRET
```

`DIREKT_API_BASE_URL` points only to the approved DIREKT Cloud Run development service. The portal never receives Supabase or database credentials.

## 4. Cloud Run access modes

The protected workflow `DIREKT Cloud Run development deployment` supports:

- `private` — default; Cloud Run IAM authentication is required;
- `public-synthetic` — explicit opt-in for portal integration when the supplied Vercel origin is HTTPS and the environment remains synthetic-only.

`public-synthetic` means network invocation is unauthenticated at the Cloud Run IAM layer; application authentication and authorization remain mandatory for protected DIREKT routes. It does not authorize real data, public promotion or a pilot.

Before any wider test cohort, Phase 10 must add rate limits, abuse controls, monitoring and a tested kill switch.

## 5. Repository deployment controls

Every managed deployment must:

1. be manually dispatched from `main`;
2. require an exact 40-character reviewed source commit;
3. require a typed environment-specific confirmation phrase;
4. use the GitHub `development` Environment;
5. use GitHub OIDC/Workload Identity Federation rather than a JSON service-account key;
6. build an immutable image tagged by source SHA;
7. bind runtime secrets by Secret Manager reference only;
8. run health/readiness smoke tests;
9. record the source, image, environment and result without secrets;
10. preserve rollback to a prior immutable revision;
11. remain synthetic-only and no-indexed;
12. stop immediately on project, region, source or secret-reference mismatch.

## 6. Phase boundaries retained

Phase 10 does not authorize:

- real participant, provider or evidence data;
- unrestricted public signup or invitations;
- real OTP, WhatsApp, map, registry or payment credentials unless separately approved under the relevant adapter gate;
- real money movement;
- public search-engine indexing;
- public product claims, marketing launch or uncontrolled traffic;
- a Zambia pilot outside Phase 11;
- a production release outside Phase 12.

## 7. Repository integration evidence

- Infrastructure bootstrap PR #43 was reviewed and merged to `main` at `4ef98f9f96f17a4aa22109f807ebed1f0381e0e3`.
- Its exact reviewed source was `14910e3b632cb213244a966ef41ea928e7494e77`.
- Synchronization PR #44 merged the infrastructure history into `build/android-v1` at `3b0dadb5aed34d13d99ade532eb11ebc8f3c1c90` without force-pushing.
- The backend container, portal readiness and environment-boundary controls are now part of the active Phase 10 checkpoint PR #42.
- Managed-environment execution evidence remains separate from repository integration evidence and must be captured from the protected activation/deployment workflows.

## 8. Exit evidence

Infrastructure integration is complete only when the repository records:

- a passing exact-project Supabase activation/verification run;
- a passing immutable Cloud Run deployment and readiness smoke;
- a protected Vercel Preview/Staging deployment and `/api/health` result;
- a Firebase internal distribution result where Android changes require it;
- sanitized security/performance advisor findings;
- Secret Manager and environment ownership without exposed values;
- rollback, kill-switch and incident-response evidence;
- all permanent CI gates on one reviewed head.
