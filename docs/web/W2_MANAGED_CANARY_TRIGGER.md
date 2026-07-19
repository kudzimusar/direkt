# W2 Managed Canary Trigger

**Purpose:** Execute the bounded IAM-private synthetic W2 functional web canary against the exact already-merged `main` base selected by the trusted workflow.

**Requested:** 2026-07-19  
**Expected merged-source baseline at trigger creation:** `952797382e3a593e3a4c0fbcca76aa7a9950df09`  
**Scope:** Canary evidence only; no application/runtime source changes in this trigger PR.

The trusted `pull_request_target` workflow must reject this trigger unless this is the only changed file. It must deploy the PR base SHA, keep both API and web services IAM-private, use synthetic-only data, remove temporary deployer Invoker grants, and must not authorize public cutover, real participants, or formal Phase 12 production release.
