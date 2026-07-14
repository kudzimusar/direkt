# DIREKT Backup and Recovery

## Objectives

Final RPO/RTO set before pilot. Initial planning targets:

- core database RPO ≤ 24 hours, with managed point-in-time capability preferred;
- pilot restore target ≤ 8 hours;
- production targets tightened from measured business impact.

## Coverage

- PostgreSQL;
- object storage/evidence;
- configuration/versioned rules;
- infrastructure definitions;
- signing/secret recovery procedures;
- Pages/repository already versioned.

## Controls

- automated backups;
- encryption;
- separate failure domain/account where feasible;
- retention;
- access logging;
- restoration documentation;
- integrity checks;
- no untested “backup exists” claim.

## Restore exercise

At least before pilot and periodically:

1. create isolated restore environment;
2. restore database and storage references;
3. run integrity/application checks;
4. verify sample evidence access authorization;
5. record time/gaps;
6. destroy restored sensitive data securely.

## Disaster

Use `docs/operations/DISASTER_RECOVERY.md` for decision and communication flow.
