# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED |
| Owner/agent | OpenAI GPT-5.6 Thinking — Phase 1A research-planning agent |
| Phase | Phase 1A |
| Task | Initialize and execute Zambia discovery and assumptions validation |
| Modules/paths | `docs/research`, `docs/product`, `docs/trust`, `docs/operations`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `RISK_REGISTER.md` |
| Claimed at | 2026-07-14 20:51 JST / 2026-07-14 11:51 UTC |
| Expected handoff | Phase 1A research system initialized, evidence-gathering instruments committed, desk research recorded, and exact field-research assignment documented; lock remains claimed until the Phase 1A exit review is complete or the owner authorizes an interim handoff. |
| Last clean commit | `b2c9b87787c0d959ab04614731b4986a02390c77` |

## Active acceptance criteria

The active owner must:

1. establish the authoritative `docs/research/` structure;
2. create customer, provider and field-verification research instruments;
3. define participant, evidence, privacy and consent rules;
4. create the assumptions register and category-evidence matrix;
5. record official desk-research sources separately from field findings;
6. identify candidate pilot areas and categories without presenting provisional choices as approved decisions;
7. update `PROJECT_STATUS.md` with progress, evidence gaps and the next executable task;
8. prevent Android product scaffolding until the Phase 1A exit gate is formally passed.

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
