#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise AssertionError(f"{path}: expected one occurrence, found {count}: {old!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


def replace_count(path: str, old: str, new: str, expected: int) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != expected:
        raise AssertionError(f"{path}: expected {expected} occurrences, found {count}: {old!r}")
    target.write_text(text.replace(old, new), encoding="utf-8")


verifier = "scripts/rc8/verify-payments-contract.py"
replace_once(
    verifier,
    'MANAGED_WORKFLOW = ROOT / ".github/workflows/rc8-payments-managed.yml"\n',
    'MANAGED_WORKFLOW = ROOT / ".github/workflows/rc8-payments-managed.yml"\nCONTRACT_WORKFLOW = ROOT / ".github/workflows/rc8-payments-contract.yml"\n',
)
replace_once(verifier, 'require(LOCK, "| Status | RELEASED |")\n', "")
replace_once(verifier, 'require(LOCK, "No repository write lane is active")\n', "")
replace_once(
    verifier,
    'require(MANAGED_WORKFLOW, "bash scripts/rc8/run-payments-managed.sh")\n',
    'require(MANAGED_WORKFLOW, "bash scripts/rc8/run-payments-managed.sh")\nrequire(MANAGED_WORKFLOW, \'"PROJECT_STATUS.md"\')\nrequire(CONTRACT_WORKFLOW, \'"PROJECT_STATUS.md"\')\n',
)

contract = ".github/workflows/rc8-payments-contract.yml"
replace_count(
    contract,
    '      - "docs/integrations/CURRENT_INTEGRATION_STATUS.md"\n',
    '      - "docs/integrations/CURRENT_INTEGRATION_STATUS.md"\n      - "PROJECT_STATUS.md"\n',
    2,
)

managed = ".github/workflows/rc8-payments-managed.yml"
replace_once(
    managed,
    '      - "docs/integrations/CURRENT_INTEGRATION_STATUS.md"\n',
    '      - "docs/integrations/CURRENT_INTEGRATION_STATUS.md"\n      - "PROJECT_STATUS.md"\n',
)

print("RC8_FORWARD_COMPATIBLE_CLOSURE_PATCH|PASS")
