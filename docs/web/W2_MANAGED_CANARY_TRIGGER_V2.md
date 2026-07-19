# W2 Managed Canary Trigger V2

**Purpose:** Execute the trusted deterministic IAM-private synthetic W2 functional web canary against the exact already-merged `main` base selected by the workflow.

**Requested:** 2026-07-20  
**Expected merged-source baseline at trigger creation:** `67ba2c06097df7c992948c7d23ba9c1830a53842`  
**Scope:** Managed canary evidence only; no application/runtime source changes in this trigger PR.

The trusted `pull_request_target` workflow must reject this trigger unless this is the only changed file. It must deploy only the PR base SHA, keep API and web IAM-private, use synthetic-only data, remove temporary deployer Invoker grants, and post a deterministic sanitized PASS or FAIL result directly to this PR. No W3 advancement is permitted without PASS evidence.