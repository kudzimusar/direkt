#!/usr/bin/env python3
"""Keep the permanent RC9 verifier focused on RC9 while RC10 closes."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PATH = ROOT / "scripts/rc9/verify-generated-client-contract.py"
text = PATH.read_text(encoding="utf-8")
replacements = {
    'require(LOCK, "RC10 implementation contract — CLAIMED")': 'require(LOCK, "RC10 implementation contract — CLOSED AND PRESERVED")',
    'require(PROJECT, "RC1–RC9 are closed")': 'require(PROJECT, "RC1–RC10 are closed")',
    'require(PROJECT, "Active repository write lane:** RC10 Turnstile threat-model decision")': 'require(PROJECT, "Active repository write lane:** none")',
    'print("later_checkpoint=rc10_claimed")': 'print("later_checkpoint=rc10_closed")',
}
for old, new in replacements.items():
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected one RC9 later-lane target {old!r}; found {count}")
    text = text.replace(old, new)
PATH.write_text(text, encoding="utf-8")
print("RC9_LATER_LANE_DECOUPLING|PASS")
