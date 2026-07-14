# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | UNCLAIMED |
| Owner/agent | — |
| Phase | Phase 1A |
| Task | Zambia discovery and assumptions validation |
| Modules/paths | `docs/product`, `docs/research`, `docs/trust`, `PROJECT_STATUS.md` |
| Claimed at | — |
| Expected handoff | — |
| Last clean commit | Use current `build/android-v1` HEAD after branch creation |

## Claim procedure

Before editing:

1. pull the latest authorized branch;
2. verify the working tree is clean;
3. run existing checks;
4. replace `UNCLAIMED` with `CLAIMED`;
5. record the agent, task, scope and timestamp;
6. commit the lock claim before broad implementation when multiple agents may access the branch.

## Release procedure

After implementation:

1. run required tests;
2. update documentation and `PROJECT_STATUS.md`;
3. create the atomic implementation commit;
4. write a handoff using the template;
5. set the lock to `UNCLAIMED`;
6. commit the handoff/lock release;
7. report the exact next approved task.

## Conflict rule

A second agent must not write to the listed paths while the lock is claimed. Read-only review is allowed. If the lock appears stale, the owner must resolve it; an agent must not overwrite it based on assumption.
