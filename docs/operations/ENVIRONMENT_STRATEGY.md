# DIREKT Environment Strategy

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
