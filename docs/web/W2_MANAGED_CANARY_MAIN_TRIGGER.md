# W2 Managed Main-Branch Canary Trigger

**Purpose:** Execute the trusted IAM-private synthetic W2 functional web canary from the exact reviewed merge commit on `main`.

**Requested:** 2026-07-20  
**Pre-trigger baseline:** `77001d48c1850f941901fc6fc4e90d2d74ae2b38`  
**Scope:** Managed W2 closure evidence only; no application/runtime source behavior changes.

This must remain the only change in the trigger PR. After review and merge, the trusted `push` workflow must deploy the exact merge SHA, preserve private API/web IAM, use synthetic-only data, verify canonical API↔BFF discovery parity/privacy/rendering, remove temporary Invoker grants, and post PASS or FAIL to Issue #133. W3 must not begin without PASS.