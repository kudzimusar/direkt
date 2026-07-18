# Phase 10 Decision Closeout Addendum — 2026-07-18

This addendum records final Phase 10 decisions that supersede stale status assumptions while preserving the main `DECISION_LOG.md` history.

## D10-1 — Exact DIREKT Supabase project is the managed development authority

**Decision:** All Phase 10 managed database/storage evidence is bound to immutable project ref `aeeuscifrxcjmnswqwnq` (`direct-app`). No unrelated Supabase project may substitute for it.

**Evidence:** 37 migration-ledger entries, 13 DIREKT application schemas, four private buckets and managed restore run `29641165494`.

## D10-2 — IAM-private Cloud Run is the authoritative protected portal staging path

**Decision:** `direkt-api` plus `direkt-operations-portal-staging` in `direkt-dev-502701` form the authoritative Phase 10 and Phase 11-entry protected staging topology.

The browser does not connect directly to Supabase or privileged credentials. The portal runtime calls the private API using audience-bound Cloud Run identity while preserving DIREKT application authorization separately.

## D10-3 — Vercel is excluded from the current entry path

**Decision:** A separate Vercel Preview/Staging binding is not required for Phase 10 completion or Phase 11 entry preparation. This avoids a second paid/protected hosting boundary while Cloud Run already provides the required private service-identity topology.

A future Vercel decision must not make the API publicly invokable merely to enable portal connectivity.

## D10-4 — Firebase distribution is internal-only

**Decision:** Firebase App Distribution is limited to the debug Android application and `direkt-internal-testers`. External/public distribution is outside Phase 10.

**Evidence:** run `29635486574` passed.

## D10-5 — Unapproved external adapters remain disabled

**Decision:** Phase 10 records explicit stop gates rather than assuming approval for production maps/geocoding, OTP/communications, registry and payment providers.

No real credentials, registry scraping, unrestricted communication sending or real-money movement is authorized by Phase 10 completion.

## D10-6 — Rollback recovery must restore floating `LATEST` Cloud Run traffic

**Decision:** After a named-revision rollback exercise, recovery must use `gcloud run services update-traffic --to-latest`, not `--to-revisions <captured-revision>=100`.

**Reason:** pinning a named revision caused later healthy deployments to be created but retired instead of becoming the active latest revision. Independent inspection detected this mismatch.

**Final evidence on `5d9313333c49d6501944e6ddba4cd408c540ff47`:**

- deployment `29647717734` — PASS;
- independent inspection `29647798494` — PASS;
- managed operations `29647821458` — PASS.

## D10-7 — Independent inspection is a mandatory companion to deployment

**Decision:** A successful canonical service smoke test is insufficient on its own because an older revision could still be serving traffic. Independent inspection must verify latest-created/latest-ready revision integrity, exact image provenance, runtime identity, numeric secret references, scaling and IAM boundaries.

## D10-8 — Monitoring permissions remain least-privilege

**Decision:** The GitHub deployer receives `roles/monitoring.alertPolicyEditor` for the Phase 10 Cloud Monitoring alert-policy surface rather than broad Project Editor/Owner access.

## D10-9 — Phase 10 completion does not automatically authorize the Phase 11 pilot

**Decision:** Phase 10 is complete when repository hardening, managed synthetic/private-staging evidence, explicit external stop gates and promotion controls are satisfied.

Actual real-participant Phase 11 activity still requires the entry checklist in `docs/phase11/HANDOFF_FROM_PHASE10.md`, including qualified legal/privacy findings, consent/participant terms, named operational owners, bounded pilot design and approved providers for any real external adapter used.
