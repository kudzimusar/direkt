#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    target = ROOT / path
    assert target.is_file(), f"missing {path}"
    return target.read_text(encoding="utf-8")


lock = read("WORKSTREAM_LOCK.md")
status = read("PROJECT_STATUS.md")
register = read("docs/integrations/CURRENT_INTEGRATION_STATUS.md")
ledger = read("docs/integrations/LIVE_INTEGRATION_LEDGER.md")
doc = read("docs/integrations/RC5_ISOLATED_TEST_LAB.md")
workflow = read(".github/workflows/firebase-test-lab-isolated.yml")
contract = read(".github/workflows/rc5-test-lab-isolated-contract.yml")
runner = read("scripts/rc5/run-test-lab-isolated-managed.sh")

for text in (lock, status, register, ledger, doc):
    assert "c3744430a7beb1cd47246d858df9ac1379a068ac" in text
    assert "30183466799" in text
    assert "direkt-testlab-502701-20260726" in text

assert "RC5 implementation contract — CLOSED AND PRESERVED" in lock
assert "CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX" in lock
released_handoff = (
    "No active implementation lane exists" in lock
    and "RC7+ source work must not begin until a new explicit bounded claim" in lock
)
rc7_handoff = (
    "CLAIMED — RC7 Google Maps runtime integration" in lock
    and "RC7 implementation contract — CLAIMED" in lock
    and "RC7 is the sole active repository write lane" in lock
)
assert released_handoff or rc7_handoff, "RC5 closure must remain valid in released or bounded RC7 state"
assert "Firebase Test Lab | **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX**" in register
assert "Firebase Test Lab | `CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX`" in ledger
assert "8626329335" in register and "8626329335" in ledger
assert "sha256:03a40951a23c937d8b0fd2990a7d2652afbd1172631c0b480af756aebd92a843" in register and "sha256:03a40951a23c937d8b0fd2990a7d2652afbd1172631c0b480af756aebd92a843" in ledger
assert "DIREKT Firebase Test Lab isolated Android matrix" in workflow
assert "RUN-DIREKT-ISOLATED-TEST-LAB" in workflow
assert "DIREKT RC5 isolated Test Lab contract" in contract
assert '--num-flaky-test-attempts 0' in runner
assert '--no-use-orchestrator' in runner
assert '--no-record-video' in runner
assert '--no-performance-metrics' in runner
assert '--no-auto-google-login' in runner
assert 'productionAuthorization: false' in runner
assert 'participantData: false' in runner

obsolete = ['.github/workflows/firebase-test-lab.yml', '.github/workflows/firebase-test-lab-managed.yml', '.github/workflows/rc5-test-lab-contract.yml', '.github/workflows/rc5-test-lab-preflight.yml', '.github/workflows/rc5-test-lab-preflight-once.yml', '.github/workflows/rc5-test-lab-managed-v2-contract.yml', '.github/workflows/rc5-test-lab-managed-v2-proof-contract.yml', '.github/workflows/rc5-test-lab-managed-v2-proof-once.yml', '.github/workflows/rc5-test-lab-managed-v2-retry-contract.yml', '.github/workflows/rc5-test-lab-managed-v2-retry-once.yml', '.github/workflows/rc5-test-lab-input-readback-contract.yml', '.github/workflows/rc5-test-lab-input-readback-once.yml', '.github/workflows/rc5-test-lab-isolated-preflight-once.yml', '.github/workflows/rc5-test-lab-isolated-proof-contract.yml', '.github/workflows/rc5-test-lab-isolated-proof-once.yml']
for path in obsolete:
    assert not (ROOT / path).exists(), f"obsolete RC5 workflow remains: {path}"

print("rc5_test_lab_closure=PASS")
print("managed_run=30183466799")
print("matrix=api26_api33_api36_zero_flaky_retries")
print("production_authorization=false")
