# DIREKT Agent Workflow

## Model

One coherent programme, sequential tasks, one active write owner.

## Branches

- `main`: stable checkpoints and Pages;
- `build/android-v1`: active implementation sequence.

Do not create multiple feature branches. Read-only review may run in parallel.

## Agent cycle

```text
Read → Verify → Claim lock → Plan → Implement → Test
→ Inspect diff → Document → Atomic commit
→ Create checkpoint PR → Verify CI/head/reviews → Merge
→ Update or close linked issues → Status/handoff → Release lock
```

## Automated GitHub responsibility

The active agent is authorized to perform routine repository administration without asking the owner to click GitHub controls:

- create a checkpoint PR from `build/android-v1` to `main`;
- inspect the exact diff and current head SHA;
- wait for and verify required CI;
- resolve actionable review findings within scope;
- merge a passing, unchanged and approved checkpoint PR;
- update and close linked issues when their acceptance evidence is complete;
- synchronize `build/android-v1` with the resulting `main` checkpoint.

The agent must not merge merely because a PR exists. It must verify the current head, tests, documentation, risk state and acceptance evidence immediately before merge.

## Issues

An issue is a work and evidence tracker, not necessarily a software defect.

Close automatically when:

- all checklist items or acceptance criteria are evidenced;
- required tests/checks pass;
- relevant repository documents are updated;
- no external owner decision remains.

Keep open when completion depends on:

- interviews or field observations not yet supplied;
- legal or regulatory confirmation;
- production credentials or provider registrations;
- a payment, mapping or messaging vendor decision;
- sensitive evidence that must remain outside the public repository;
- an explicit owner approval gate.

## Task sizing

One task should be coherent enough to test and commit, usually one domain capability or phase deliverable. Do not combine unrelated migrations, redesign and release changes.

## Commit format

Examples:

- `docs: establish DIREKT product and trust baseline`
- `feat(auth): add phone session foundation`
- `feat(verification): enforce check state transitions`
- `test(search): cover service-area boundary ranking`
- `fix(android): recover interrupted evidence upload`

## Phase promotion

After a task or phase exit:

1. confirm the workstream branch is clean;
2. run the full applicable quality gate;
3. review status, risks, decisions and issue acceptance criteria;
4. create the checkpoint PR;
5. verify its current head SHA, changed files, checks and review state;
6. merge without force when all gates pass;
7. update/close eligible issues;
8. verify Pages and other relevant deployments;
9. synchronize the implementation branch;
10. authorize the exact next task or phase.

## Prohibitions

No force push, silent architecture changes, skipped tests, direct production changes, untracked prompts/instructions, real public test data or claims unsupported by committed evidence.