# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED |
| Owner/agent | OpenAI GPT-5.6 Thinking — Phase 2A Android foundation agent |
| Phase | Phase 2A |
| Task | Scaffold the native Android project and produce the first green debug APK |
| Modules/paths | `android/direkt-app`, `.github/workflows/android-ci.yml`, `docs/android`, `docs/architecture`, `docs/testing`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `RISK_REGISTER.md` |
| Claimed at | 2026-07-14 23:04 JST / 2026-07-14 14:04 UTC |
| Expected handoff | Reproducible Kotlin/Compose scaffold; tests and lint green; debug APK retained by Actions; architecture documentation synchronized; Phase 2B authorized |
| Last clean checkpoint | `7d8f6fb2b8e69ade0e0b5a6872b21531d5bc1447` |

## Phase 2A acceptance criteria

The active owner must:

1. synchronize `build/android-v1` with the latest `main` checkpoint;
2. claim this lock before broad implementation;
3. create the native project at `android/direkt-app`;
4. use Kotlin, Jetpack Compose, Material 3 and Gradle Kotlin DSL;
5. use `com.kudzimusar.direkt` as namespace and production application ID;
6. use a debug-safe application ID suffix;
7. establish reproducible dependency and tool versions;
8. implement a synthetic application shell and navigation boundary;
9. add unit, lint and Compose smoke tests;
10. make GitHub Android CI run tests, lint and `assembleDebug` successfully;
11. retain the debug APK artifact;
12. update architecture, Android, testing and bootstrap documents;
13. avoid Firebase, real authentication, production API calls and real evidence;
14. create, verify and merge the checkpoint automatically when safe.

## Active safety boundaries

- Synthetic fixtures only.
- No real identity documents, certificates, phone numbers or coordinates.
- No Firebase configuration or service account.
- No production API endpoint or secret.
- No customer payment or regulator integration.
- No claim that the scaffold implements verification.

## Claim procedure

Before editing:

1. verify the latest `main` and build-branch heads;
2. run existing repository checks where available;
3. replace `UNCLAIMED` with `CLAIMED`;
4. record agent, scope and timestamp;
5. commit the lock claim.

## Release procedure

After implementation:

1. run unit tests, lint and debug assembly;
2. inspect the diff and generated artifacts;
3. update status, decisions, risks and handoff;
4. create and verify the checkpoint PR;
5. merge automatically only at the verified head;
6. confirm the Actions artifact;
7. close only completed issues;
8. synchronize the implementation branch without force-pushing;
9. release or transfer the lock.

## Conflict rule

A second agent must not write to the listed paths while the lock is claimed. Read-only review is allowed. A stale lock must be resolved explicitly rather than overwritten by assumption.
