from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text()
    if text.count(old) != 1:
        raise SystemExit(f"Expected one marker in {path}: {old[:80]!r}; found {text.count(old)}")
    file.write_text(text.replace(old, new))


replace_once(
    "MASTER_BUILD_PLAN.md",
    "- Design and scaffolding may proceed on an explicit provisional baseline.\n- Primary Zambia validation is mandatory before controlled pilot and production claims, not before prototype design.",
    "- Design and scaffolding may proceed on an explicit provisional baseline.\n- Synthetic-only managed development and protected staging deployments may proceed during Phase 10 for integration, security, recovery and performance validation.\n- Primary Zambia validation is mandatory before controlled pilot and production claims, not before prototype design or restricted infrastructure validation.",
)
replace_once(
    "MASTER_BUILD_PLAN.md",
    "- approved map, OTP and payment-provider terms.\n\n### Phase 11 — Controlled Zambia pilot and primary validation",
    "- approved map, OTP and payment-provider terms;\n- synthetic-only managed development and protected staging deployment evidence for Supabase, Cloud Run, Vercel and Firebase;\n- tested deployment rollback, environment isolation and infrastructure kill-switch procedures.\n\nPhase 10 deployment authorization is limited to synthetic-only development and protected staging. It does not authorize real participants, real evidence, public promotion, a Zambia pilot or a production release.\n\n### Phase 11 — Controlled Zambia pilot and primary validation",
)

replace_once(
    "docs/phase10/HANDOFF_FROM_PHASE9.md",
    "**Authorization state:** Unclaimed until the Phase 9 checkpoint is merged, Issue #34 is closed and the workstream lock is released.",
    "**Authorization state:** Active under Issue #41 and checkpoint PR #42 after the Phase 9 checkpoint was promoted and the workstream lock was explicitly claimed.",
)
replace_once(
    "docs/phase10/HANDOFF_FROM_PHASE9.md",
    "- approved map, OTP and payment-provider terms.\n\nPhase 10 is a hardening and approval phase. It must not be used to bypass Phase 11 controlled Zambia pilot validation or Phase 12 production-release gates.",
    "- approved map, OTP and payment-provider terms;\n- synthetic-only managed development and protected staging infrastructure needed to execute the hardening, restore, security and performance evidence.\n\nPhase 10 is a hardening, approval and controlled infrastructure-activation phase. It may create restricted development/staging deployments, but it must not be used to bypass Phase 11 controlled Zambia pilot validation or Phase 12 production-release gates.",
)
replace_once(
    "docs/phase10/HANDOFF_FROM_PHASE9.md",
    "- backup and restore scope for evidence metadata and objects.\n\nReal evidence remains prohibited until these controls and legal approvals pass.",
    "- backup and restore scope for evidence metadata and objects;\n- protected Supabase-to-Cloud-Run integration evidence using synthetic records only;\n- protected Vercel Preview/Staging integration evidence without browser database/storage credentials.\n\nReal evidence remains prohibited until these controls and legal approvals pass. Synthetic-only remote integration is authorized by `INFRASTRUCTURE_ACTIVATION_CONTRACT.md`.",
)
replace_once(
    "docs/phase10/HANDOFF_FROM_PHASE9.md",
    "- dependency failure and external-provider outage scenarios.\n\n### 10G — Supply-chain, secret and configuration hardening",
    "- dependency failure and external-provider outage scenarios;\n- immutable Cloud Run revision deployment, readiness, rollback and scale-to-zero evidence;\n- protected Vercel Preview/Staging health and API-connectivity evidence.\n\n### 10G — Supply-chain, secret and configuration hardening",
)
replace_once(
    "docs/phase10/HANDOFF_FROM_PHASE9.md",
    "## Supabase activation boundary",
    "## Managed development and staging deployment boundary\n\nPhase 10 explicitly authorizes remotely reachable managed development and protected staging infrastructure when all data is synthetic, access is restricted or deliberately bounded, search indexing and public promotion are disabled, exact-source deployment is recorded and rollback/kill-switch controls exist.\n\nThe deployment classes, bound project identifiers, Cloud Run access modes, Vercel protection requirements and retained Phase 11/12 gates are authoritative in `INFRASTRUCTURE_ACTIVATION_CONTRACT.md`. An internet-addressable development URL is not a controlled Zambia pilot or production launch by itself. Real participant processing, unrestricted invitations, real evidence and production claims remain prohibited.\n\n## Supabase activation boundary",
)
replace_once(
    "docs/phase10/HANDOFF_FROM_PHASE9.md",
    "- [ ] all Phase 9 permanent workflows pass on one exact reviewed head;\n- [ ] PR #35 is merged;\n- [ ] Issue #34 is closed as completed;\n- [ ] `PROJECT_STATUS.md` records Phase 9 as stable and Phase 10 as next;\n- [ ] `WORKSTREAM_LOCK.md` is released and then explicitly claimed for Phase 10;\n- [ ] the Phase 9 commercial trust contract is treated as inherited architecture;\n- [ ] a Phase 10 governing issue and checkpoint PR exist;\n- [ ] no real provider, credential, deployment or pilot is assumed without current approval.",
    "- [x] all Phase 9 permanent workflows passed on one exact reviewed head;\n- [x] PR #35 was merged;\n- [x] Issue #34 was closed as completed;\n- [x] `PROJECT_STATUS.md` records Phase 9 as stable and Phase 10 as active;\n- [x] `WORKSTREAM_LOCK.md` was released and explicitly claimed for Phase 10;\n- [x] the Phase 9 commercial trust contract is inherited architecture;\n- [x] Issue #41 and PR #42 govern Phase 10;\n- [x] real providers, real credentials, a public pilot and production remain gated, while controlled synthetic-only development/staging deployment is explicitly authorized.",
)
replace_once(
    "docs/phase10/HANDOFF_FROM_PHASE9.md",
    "- performance and soak thresholds pass;\n- external provider and authority terms are approved or remain explicit stop gates;",
    "- performance and soak thresholds pass;\n- Supabase, Cloud Run, protected Vercel Preview/Staging and Firebase internal distribution evidence is recorded where applicable;\n- external provider and authority terms are approved or remain explicit stop gates;",
)

replace_once(
    "docs/integrations/INTEGRATION_AND_SECRETS_PLAN.md",
    "**Status:** Planning baseline — no production integration is authorized by this document.",
    "**Status:** Phase 10 controlled development/staging activation baseline — public pilot and production remain separately gated.",
)
replace_once(
    "docs/integrations/INTEGRATION_AND_SECRETS_PLAN.md",
    "The central rule is:\n\n> Android and browser clients call the DIREKT API. They do not connect directly to PostgreSQL, Supabase service credentials, payment operators, regulator systems or privileged storage.",
    "The central rule is:\n\n> Android and browser clients call the DIREKT API. They do not connect directly to PostgreSQL, Supabase service credentials, payment operators, regulator systems or privileged storage.\n\nPhase 10 may activate synthetic-only managed development and protected staging services to validate this topology. Phase 11 still owns real participant/pilot data and Phase 12 owns production release. Exact provisioned identifiers and deployment controls are recorded in `../phase10/INFRASTRUCTURE_ACTIVATION_CONTRACT.md`.",
)
replace_once(
    "docs/integrations/INTEGRATION_AND_SECRETS_PLAN.md",
    "## 4. Services to connect now",
    "## 4. Provisioned and remaining services",
)
replace_once(
    "docs/integrations/INTEGRATION_AND_SECRETS_PLAN.md",
    "**Development project name:** `direkt-dev`  \n**Recommended provisional region:** a Europe West region, subject to a latency test from Zambia before production.",
    "**Development project display name:** `direct-app`  \n**Immutable project ref:** `aeeuscifrxcjmnswqwnq`  \n**Region:** `ap-northeast-1` (Tokyo development infrastructure; Zambia latency and cross-border approval remain Phase 10/11 gates).",
)
replace_once(
    "docs/integrations/INTEGRATION_AND_SECRETS_PLAN.md",
    "**Development project name:** `direkt-dev`\n\nEnable now:",
    "**Development project ID:** `direkt-dev-502701`  \n**Project number:** `264358173369`  \n**Region:** `asia-northeast1`\n\nThe project, Artifact Registry, Cloud Run service identities, Workload Identity Federation and Secret Manager entries are provisioned. Repository deployment and verification remain controlled by the Phase 10 infrastructure contract.\n\nEnable/verify:",
)
replace_once(
    "docs/integrations/INTEGRATION_AND_SECRETS_PLAN.md",
    "1. Authorize the Supabase connector or create `direkt-dev` in the Supabase dashboard.\n2. Create `direkt-dev` in Google Cloud and attach Firebase.\n3. Register the debug Android application and create `direkt-internal-testers`.\n4. Create the Vercel portal project with the correct root directory.\n5. Configure Workload Identity Federation and the two service accounts.\n6. Add only the listed GitHub deployment variables/secrets.\n7. Add runtime secrets to Google Secret Manager, not GitHub.\n8. Create Sentry projects for API and portal.\n9. Create Maps, Twilio Verify, Brevo and Meta accounts only when their phase is authorized.\n10. Keep MTN MoMo, Airtel Money and regulator credentials deferred until formal access and product gates are satisfied.",
    "1. Re-run and retain passing Supabase exact-project activation evidence for `aeeuscifrxcjmnswqwnq`.\n2. Merge the protected Cloud Run development deployment workflow to `main`, then deploy an exact reviewed source through GitHub OIDC.\n3. Verify Firebase debug/internal tester configuration for `direkt-internal-testers`.\n4. Create or verify the protected Vercel Preview/Staging portal project with the correct root directory.\n5. Verify Workload Identity Federation, the deployer/runtime service accounts and least-privilege IAM.\n6. Keep deployment material in GitHub Environments and runtime secrets in Google Secret Manager.\n7. Create/verify Sentry projects and PII scrubbing before telemetry activation.\n8. Create Maps, OTP, email and WhatsApp accounts only when their adapter gates are authorized.\n9. Keep MTN MoMo, Airtel Money and regulator credentials deferred until formal access and product gates are satisfied.\n10. Do not convert managed development/staging activation into a public pilot or production launch.",
)

Path("docs/operations/ENVIRONMENT_STRATEGY.md").write_text("""# DIREKT Environment Strategy

## Environment classes

| Environment | Owner phase | Data | Access | Deployment status |
|---|---|---|---|---|
| Local | all implementation phases | synthetic | developer machine | allowed |
| Development | Phase 10 integration/hardening | synthetic only | repository agents and named internal testers | managed deployment allowed |
| Staging | Phase 10 release-candidate validation | synthetic and separately approved non-personal fixtures | protected named team/testers | protected deployment allowed |
| Controlled Zambia pilot | Phase 11 | consented pilot data | approved pilot cohort | prohibited until Phase 11 entry gates pass |
| Production | Phase 12 | approved real data | public users and authorized staff | prohibited until Phase 12 release gates pass |

## Local

Use containerized/emulated dependencies where practical, synthetic seed data and developer-specific secrets outside the repository.

## Development

Development is a shared managed integration environment. It may use the bound Supabase project, Cloud Run API, protected Vercel Preview/Staging portal and Firebase internal distribution. It remains synthetic-only, no-indexed and unsuitable for public promotion or real participant/evidence processing.

## Staging

Staging uses production-like configuration with separate environment controls, protected access, synthetic data and explicitly approved non-personal fixtures. It validates migration, backup/restore, incident, security, performance and release-candidate behavior. It is not the Phase 11 pilot.

## Controlled pilot

Phase 11 creates a separate consented and operationally staffed boundary. Development/staging data and credentials must not be silently promoted into the pilot.

## Production

Production requires separate credentials, approved real-data controls, controlled migrations, monitoring, support and the complete Phase 12 release gate.

## Rules

- never point debug builds at production;
- make the environment visually and operationally identifiable;
- never copy a production database into a lower environment;
- test the forward migration path in development/staging;
- separate vendor webhooks, credentials and callback URLs by environment;
- GitHub Pages never functions as a backend/authenticated-data environment;
- every managed deployment uses an exact reviewed commit and retains rollback evidence;
- Phase 10 managed URLs remain no-indexed and are not publicly promoted;
- real users, real evidence, public pilot claims and production release remain Phase 11/12 responsibilities.
""")

Path("docs/operations/DEPLOYMENT_RUNBOOK.md").write_text("""# DIREKT Deployment Runbook

## Authorized deployment classes

Phase 10 authorizes synthetic-only managed development and protected staging deployments. Phase 11 separately authorizes a controlled Zambia pilot; Phase 12 separately authorizes production. A development URL must not be described or promoted as a pilot or production service.

## Development pre-deploy

1. select an exact reviewed 40-character source commit;
2. confirm permanent backend/portal/documentation checks for that source or run them inside the deployment workflow;
3. verify the target project, region, service and environment names;
4. verify GitHub OIDC/Workload Identity Federation and least-privilege service accounts;
5. verify Secret Manager references exist without reading or printing values;
6. confirm Supabase migrations and private buckets against project `aeeuscifrxcjmnswqwnq`;
7. confirm synthetic-only data mode, payment disabled and no real participant/evidence data;
8. record the current Cloud Run revision and portal deployment for rollback;
9. confirm an owner for monitoring and rollback during the window.

## Supabase development activation

Run the manual workflow `DIREKT Supabase development activation` from `main` with:

```text
confirmation: ACTIVATE-DIREKT-DEVELOPMENT
source_sha: <exact reviewed commit>
```

The workflow must verify the immutable project ref, Tokyo region, migrations, PostGIS, private buckets and advisors and retain sanitized evidence.

## Cloud Run development deployment

Run `DIREKT Cloud Run development deployment` from `main` with:

```text
confirmation: DEPLOY-DIREKT-DEVELOPMENT
source_sha: <exact reviewed commit>
access_mode: private | public-synthetic
portal_origin: <required HTTPS Vercel origin only for public-synthetic>
```

Use `private` by default. Use `public-synthetic` only for a protected Vercel integration that still relies on DIREKT application authentication/authorization and contains no real data. The workflow builds an immutable SHA-tagged image, deploys Secret Manager references, performs readiness checks and records the revision.

## Vercel Preview/Staging

- root directory: `admin/direkt-operations-portal`;
- deployment protection enabled;
- Preview or protected custom Staging environment only;
- `DIREKT_API_BASE_URL` points to the approved Cloud Run development API;
- `NEXT_PUBLIC_APP_ENV=development`;
- no database, Supabase server or provider credentials;
- no indexing or public production custom domain;
- `/api/health` must report ready before use.

## Post-deploy

1. verify API liveness/readiness and portal health;
2. verify environment/data-mode labels and no-index headers;
3. run synthetic login, provider scope, private evidence, enquiry and commercial smoke paths appropriate to the source;
4. inspect Cloud Run, Supabase and Vercel logs for redaction and errors;
5. confirm queues/reconciliation are bounded;
6. record source SHA, image/revision, portal deployment, smoke result and owner;
7. keep the previous immutable revision available for rollback.

## Rollback and kill switch

- route Cloud Run traffic back to the prior healthy immutable revision or set service ingress/IAM to block invocation;
- disable the Vercel deployment or restore deployment protection;
- set external adapters to disabled and revoke environment-specific credentials where exposure is suspected;
- stop further database writes when integrity is at risk;
- use forward schema correction rather than blind production-style down migrations;
- declare an incident when security, privacy, integrity or availability thresholds are met;
- document containment, recovery and follow-up tests.

## Production boundary

No production deployment is authorized by this runbook until Phase 12. Production requires current legal/provider approvals, real-data privacy controls, tested restore, monitoring, staffing, rollback, signed Android release and explicit environment approval.
""")

replace_once(
    ".gitignore",
    "# Supabase CLI local state\nsupabase/.temp/\nsupabase/.branches/",
    "# Supabase CLI local state\nsupabase/.temp/\nsupabase/.branches/\n\n# Deployment provider local/auth state\n.vercel/\ngha-creds-*.json",
)
