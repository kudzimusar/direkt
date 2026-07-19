# W5 Managed Provider Canary Main Trigger

**Purpose:** Dispatch the reviewed W5 IAM-private synthetic provider canary from trusted `main` against this exact merged source.

**Scope:** Evidence trigger only. No application, Android, backend, workflow or infrastructure implementation change.

The trusted main trigger must dispatch the reviewed W5 managed canary, preserve synthetic-only data and private IAM, remove temporary Invoker grants, and must not activate real participants, public cutover, real payment movement or formal Phase 12 production release.
