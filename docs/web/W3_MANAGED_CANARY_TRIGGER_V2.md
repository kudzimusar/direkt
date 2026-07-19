# W3 Managed Auth/Session Canary V2 Trigger

**Purpose:** Execute the staging-WIF-aligned IAM-private synthetic W3 canary against the exact already-merged `main` base.

**Scope:** Evidence only; no application, Android, backend, workflow or infrastructure implementation change.

The workflow must verify this is the only changed file, deploy only the PR base SHA, exercise the complete W3 session closure contract, remove temporary Invoker grants, and preserve all Firebase Web, real-participant, public-cutover and Phase 12 gates.
