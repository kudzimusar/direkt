# DIREKT Environment Strategy

## Environment classes

| Environment | Owner phase | Data | Access | Deployment status |
|---|---|---|---|---|
| Local | all implementation phases | synthetic | developer machine | allowed |
| Development | Phase 10+ integration/hardening | synthetic only | repository agents and named internal testers | managed deployment allowed |
| Staging | Phase 10/11 regression and release-candidate preparation | synthetic and separately approved non-personal fixtures | protected named team/testers | protected deployment allowed |
| Controlled Zambia pilot | Phase 11 | consented pilot data only after entry approval | approved bounded pilot cohort | prohibited until Phase 11 entry gates and participant-access architecture pass |
| Production | Phase 12 | approved real data | public users and authorized staff | prohibited until Phase 12 release gates pass |

## Local

Use containerized/emulated dependencies where practical, synthetic seed data and developer-specific secrets outside the repository.

## Development

Development is a shared managed integration environment. It may use the bound Supabase project, IAM-private Cloud Run services and Firebase internal distribution. It remains synthetic-only, no-indexed and unsuitable for public promotion or real participant/evidence processing.

Vercel is currently excluded from the protected Phase 11 entry path by the authoritative Phase 10/11 programme decision; historical references to Vercel as an active staging target do not override that decision.

## Staging

Staging uses production-like configuration with separate environment controls, protected access, synthetic data and explicitly approved non-personal fixtures. It validates migration, backup/restore, incident, security, performance and release-candidate behavior. It is not the Phase 11 pilot.

The current authoritative managed staging topology remains IAM-private. A URL existing does not mean Android pilot participants can invoke it.

## Controlled pilot

Phase 11 requires a separate, consented, operationally staffed boundary using the same application code/domain model. Development/staging data and credentials must not be silently promoted into the pilot.

Before any real pilot deployment:

- legal/privacy/controller/processor/transfer/storage gates are approved;
- exact geography/categories/cohort/owners/support/stop criteria are approved;
- participant notice/consent/retention/withdrawal controls are approved;
- a participant-access/authentication architecture is approved and regression-tested;
- external providers actually used are approved for exact data/terms/cost/abuse boundaries;
- pilot credentials and storage/processor bindings are explicitly reviewed;
- `PILOT_ENTRY_APPROVED=true` is set only after the evidence above is recorded.

The technical latch alone does not authorize data collection. Current controlled-pilot configuration remains traffic-disabled until a later reviewed participant-access change.

## Production

Production requires separate credentials, approved real-data controls, controlled migrations, monitoring, support and the complete Phase 12 release gate.

Phase 11 pilot credentials/data must not be assumed safe for production by default.

## Rules

- never point debug builds at production;
- make the environment visually and operationally identifiable;
- never copy a production database into a lower environment;
- never copy real pilot data into development/staging merely for debugging;
- test the forward migration path in development/staging;
- separate vendor webhooks, credentials and callback URLs by environment;
- GitHub Pages never functions as a backend/authenticated-data environment;
- every managed deployment uses an exact reviewed commit and retains rollback evidence;
- Phase 10 managed URLs remain no-indexed and are not publicly promoted;
- real users, real evidence and public pilot claims require Phase 11 authorization;
- production release remains a separate Phase 12 decision after an evidence-backed Phase 11 exit.
