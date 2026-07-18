# Phase 10 Incident Exercise — Supabase/PostGIS Readiness 503

**Exercise date:** 2026-07-18  
**Environment:** synthetic-only development  
**Affected service:** `direkt-api` on Cloud Run  
**Data impact:** none; no participant or provider records were present

## Scenario

The private Cloud Run API returned `503 Database or PostGIS is not ready`. The readiness probe deliberately queried both the database and `PostGIS_Version()`, so the service failed closed instead of accepting traffic against an incomplete schema.

## Detection

The failure was detected by the authenticated readiness workflow. Direct inspection of the exact Supabase project established:

- the project identity and region were correct;
- the project was healthy;
- DIREKT migrations were absent;
- PostGIS was not installed;
- three expected private buckets existed, while `system-exports` was missing.

## Roles used for the exercise

| Role | Interim Phase 10 owner |
|---|---|
| Incident commander and programme owner | DIREKT repository owner (`kudzimusar`) |
| Technical responder | Phase 10 hardening workstream under Issue #41 |
| Database/infrastructure responder | Supabase and Google Cloud protected workflows |
| Privacy assessment | No real data present; qualified privacy owner remains a Phase 11 entry requirement |
| Communications owner | Not activated; no external participant communication was required |

These assignments are sufficient for the synthetic technical exercise. They are not a substitute for named operational staff and qualified privacy/legal ownership before a real pilot.

## Containment

- Cloud Run deployment retries were stopped.
- The API remained IAM-private.
- No public invocation member was added.
- No unrelated Supabase project was modified.
- No real data, production provider credential or payment mode was enabled.

## Corrective action

1. The repository-controlled Supabase activation workflow was executed against project ref `aeeuscifrxcjmnswqwnq`.
2. The complete migration chain and PostGIS were applied.
3. All four private buckets were verified.
4. The application-owned migration ledger was hardened with RLS and browser-role grants removed.
5. The platform-owned `spatial_ref_sys` advisor finding was recorded as a managed Supabase exception instead of bypassing extension ownership.
6. Cloud Run deployment was hardened to use exact main ancestry, immutable images, bounded identities, numeric Secret Manager versions and private readiness tokens.
7. The API was redeployed and independently inspected.

## Recovery evidence

The recovered service reached:

- application source `c6530f18792b498d5603885d5871f4ecdf91979d`;
- ready revision `direkt-api-00003-g9d`;
- six numeric Secret Manager references;
- bounded runtime identity `direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com`;
- no public invokers;
- authenticated database readiness success.

## Lessons and permanent changes

- A healthy managed-project status does not prove application-schema readiness.
- Readiness must continue to test required extensions and schema dependencies.
- Deployment must stop before mutation when secret versions or source ancestry are unresolved.
- Managed extension ownership must be respected; repository migrations may harden only application-owned objects.
- Live infrastructure evidence must be reconciled into the long-lived implementation branch before phase promotion.
- A real pilot requires named incident, privacy, support and communications owners plus approved escalation channels.

## Exercise outcome

The technical incident path passed: detection, fail-closed containment, root-cause isolation, controlled migration recovery, private redeployment and independent verification were completed without data loss or public exposure.

The remaining Phase 10 managed-operations workflow separately exercises revision rollback, service-to-service kill switch, post-idle readiness and monitoring policy evidence.
