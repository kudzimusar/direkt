#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[2]
path = root / "scripts/rc11/verify-final-integration-closure.py"
text = path.read_text(encoding="utf-8")
old = '''for needle in (
    "RELEASED — RC11 CLOSED AND PRESERVED",
    "RC11 implementation contract — CLOSED AND PRESERVED",
    "RC11A requires the combined",
    "RC11B maintains one managed evidence index",
    "RC11C reconciles the live ledger",
    "RC11D requires a dedicated exact-head closure receipt",
    "The repository write lane is RELEASED",
):
    require(LOCK, needle)

require(PROJECT, "Active repository write lane:** none; RC0–RC11 are closed")
'''
new = '''for needle in (
    "RC11 implementation contract — CLOSED AND PRESERVED",
    "RC11A requires the combined",
    "RC11B maintains one managed evidence index",
    "RC11C reconciles the live ledger",
    "RC11D requires a dedicated exact-head closure receipt",
):
    require(LOCK, needle)

'''
if old not in text:
    raise SystemExit("RC11 later-lane verifier source did not match")
text = text.replace(old, new, 1)
text = text.replace('print("workstream_lane=released")', 'print("rc11_closure_preserved=true")\nprint("later_lane_ownership_not_asserted=true")', 1)
path.write_text(text, encoding="utf-8")
print("RC11_LATER_LANE_PATCH|PASS")
