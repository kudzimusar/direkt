# DIREKT Agent Workflow

## Model

One coherent programme, sequential tasks, one active write owner.

## Branches

- `main`: stable checkpoints and Pages;
- `build/android-v1`: active sequence.

No feature PRs unless owner changes policy. Read-only review can be parallel.

## Agent cycle

```text
Read → Verify → Claim lock → Plan → Implement → Test
→ Inspect diff → Document → Atomic commit → Status/handoff → Release lock
```

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

After phase exit:

1. clean branch;
2. full quality gate;
3. review status/risks/decisions;
4. record checkpoint;
5. promote to `main` with non-force Git operation;
6. verify Pages/deployments;
7. authorize next phase.

## Prohibitions

No force push, silent architecture changes, skipped tests, direct production changes, untracked prompts/instructions, real public test data or claims unsupported by committed evidence.
