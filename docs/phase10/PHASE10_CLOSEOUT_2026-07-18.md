# Phase 10 Managed Closeout — 2026-07-18

**Governing issue:** #41  
**Checkpoint PR:** #42  
**Final managed source:** `5d9313333c49d6501944e6ddba4cd408c540ff47`  
**Data mode:** synthetic-only  
**Decision:** Phase 10 technical and managed-infrastructure exit evidence is complete. Phase 11 real-participant activity remains separately entry-gated.

## Managed evidence

### Supabase

- Exact project ref: `aeeuscifrxcjmnswqwnq` (`direct-app`), region `ap-northeast-1`.
- PostgreSQL 17 with PostGIS.
- 37 checksummed DIREKT migrations in `public.direkt_schema_migrations`.
- 13 DIREKT application schemas verified.
- Four required Storage buckets verified private; object count zero during the closeout inspection.
- Browser-facing roles have no direct DIREKT application-schema/table access.
- Managed restore run `29641165494`: **passed**.
  - live metadata capture;
  - 13 application schemas plus migration-ledger dump;
  - clean PostgreSQL 17/PostGIS + `btree_gist` restore;
  - integrity/sentinel comparison;
  - migration-ledger preservation;
  - forward migration check;
  - restored API build/readiness.

### Google Cloud / Cloud Run

Project `direkt-dev-502701`, region `asia-northeast1`, Artifact Registry `direkt-containers`.

Final exact-source chain on `5d9313333c49d6501944e6ddba4cd408c540ff47`:

| Gate | Run | Result |
|---|---:|---|
| Private API + portal deployment | `29647717734` | PASS |
| Independent staging inspection | `29647798494` | PASS |
| Managed rollback/kill-switch/idle/monitoring exercise | `29647821458` | PASS |

The final chain proved:

- immutable SHA-tagged API and portal images;
- bounded runtime identities;
- numeric Secret Manager versions only;
- no public Cloud Run invocation members;
- portal runtime is the bounded API Invoker;
- latest-created/latest-ready revision integrity;
- authenticated API and portal readiness;
- rollback and forward recovery;
- rollback recovery restores floating `LATEST` traffic rather than pinning a named revision;
- portal-to-API kill switch produces the expected authorization denial;
- bounded IAM restoration returns portal/API readiness;
- effective minimum scale 0 / maximum 1 and five-minute post-idle readiness;
- Cloud Monitoring staging API 5xx alert policy created or verified;
- temporary deployer Invoker access removed after every bounded verification window.

### Firebase

Internal App Distribution run `29635486574`: **passed** for the debug application and `direkt-internal-testers` only.

### Hosting decision

`direkt-operations-portal-staging` on IAM-private Cloud Run is the authoritative protected portal staging target for Phase 10 and the Phase 11 entry path. Vercel Preview/Staging is explicitly excluded from this path by the documented programme decision and is not a Phase 10 completion blocker.

## Reliability defects resolved during closeout

The managed closeout found and corrected several real workflow defects rather than bypassing them:

1. native libpq restore URLs incorrectly contained the Node-only `uselibpqcompat` parameter;
2. clean restore targets initialized PostGIS but not required `btree_gist` operator classes;
3. restored API readiness attempted to start before building `dist`;
4. private deployment/inspection/operations required bounded temporary Invoker grants with mandatory cleanup;
5. effective scale-to-zero can be represented by an omitted `minScale` annotation and must be interpreted as zero without weakening `maxScale=1`;
6. Cloud Run IAM revocation/restoration required bounded propagation-aware checks;
7. the Monitoring gate required least-privilege `roles/monitoring.alertPolicyEditor` on the GitHub deployer;
8. rollback recovery previously restored traffic to a named revision, which pinned future traffic and caused healthy new revisions to be retired. Recovery now uses `--to-latest`, preserving floating latest-revision routing.

## External/legal stop gates retained

Phase 10 completion does not authorize participant recruitment, real evidence/contact/location processing, unrestricted signup, production communications, registry access, real-money payments or public release.

Before a controlled Phase 11 pilot begins, the Phase 11 entry checklist still requires, as applicable:

- qualified Zambia privacy, consumer, payments, tax/invoicing and related legal findings;
- required controller/processor, transfer and authority-access approvals;
- approved pilot privacy notice, consent language, participant agreement and retention/withdrawal rules;
- named pilot, security/privacy, support and incident owners;
- bounded cohort, locations, devices/connectivity matrix, recruitment method, support/escalation and stop criteria;
- approved provider terms for any map, OTP/communications, registry or payment adapter actually used.

Unapproved adapters remain disabled. Payments remain disabled. No real money movement is authorized.

## Promotion sequence

After this record is reviewed and merged:

1. all permanent repository workflows must pass on the exact final documentation head;
2. temporary closeout PR #98 must close unmerged;
3. Issue #41 must close as completed;
4. the Phase 10 workstream lock must release;
5. `main` and `build/android-v1` must be synchronized without force-pushing;
6. only then may Phase 11 be claimed for entry preparation, with real pilot activity still blocked until its explicit entry checklist is satisfied.
