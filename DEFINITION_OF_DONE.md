# DIREKT Definition of Done

“Done” means implemented, verified, documented, secure enough for its stage and operable by the next responsible person. Code existing in a branch is not completion.

## Universal task completion

A task is done only when:

- acceptance criteria are demonstrably met;
- relevant automated tests pass;
- failure and negative cases are covered;
- authorization is enforced server-side;
- security, privacy, accessibility and offline impact are reviewed;
- migrations are forward-only and tested;
- API/data/design documents match behaviour;
- no secrets or real personal data are committed;
- the diff contains no unrelated changes;
- an atomic commit exists;
- `PROJECT_STATUS.md` and the handoff identify the next task;
- the workstream lock is released.

## Android feature completion

- UI follows `design.md` and Material 3 rules.
- Loading, empty, error, permission-denied and offline states exist.
- State survives expected configuration/process conditions.
- TalkBack semantics, touch targets and font scaling are checked.
- Network and local-storage behaviour is tested.
- Analytics events contain no sensitive evidence.
- Screens do not claim verification beyond backend-derived facts.
- Device-matrix impact is recorded.

## Backend feature completion

- OpenAPI contract exists and is versioned.
- Validation, authentication, authorization and rate limits are considered.
- Idempotency exists for retried writes where required.
- Database constraints defend critical invariants.
- Audit events cover privileged and trust-affecting actions.
- Structured errors use the common problem-details shape.
- Unit and integration tests include cross-tenant/cross-role denial.
- Observability does not log secrets, documents or precise private location.

## Verification feature completion

- Required evidence and check scope are explicit.
- Valid state transitions are enforced.
- Reviewer action requires reason codes where applicable.
- Decision history is immutable/auditable.
- Expiry, revocation and resubmission are handled.
- Public copy states exactly what was checked and what was not.
- Payment cannot influence the result.
- Evidence access controls are tested.

## Documentation completion

- one H1 title;
- purpose and intended audience;
- concrete rules and examples;
- no unresolved placeholders such as “TBD” for blocking requirements;
- links resolve in the Pages build;
- terminology matches `GLOSSARY.md`;
- decisions are linked to source requirements;
- documentation validation passes.

## Phase completion

A phase additionally requires:

- all phase deliverables present;
- exit criteria signed off;
- risks and decisions updated;
- no open critical/high defect unless owner formally accepts it;
- a stable checkpoint on `main`;
- test evidence and release notes;
- next phase explicitly authorized.

## Release completion

- signed artifacts are reproducible;
- current Play policies are checked;
- data-safety and privacy declarations match behaviour;
- backup/restore has been demonstrated;
- incident and rollback procedures are tested;
- support and verification operations are staffed;
- monitoring and alerts are active;
- staged rollout and stop criteria are documented.
