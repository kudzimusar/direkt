#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[2]
path = root / "scripts/rc10/verify-turnstile-decision.py"
text = path.read_text(encoding="utf-8")
old = '''for needle in (
    "RELEASED — RC10 CLOSED AND PRESERVED",
    "RC10 implementation contract — CLOSED AND PRESERVED",
    "Turnstile is conditional abuse control",
    "CLOSED — NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE",
    "RC11 remains unclaimed",
    "The repository write lane is RELEASED",
):
    require(LOCK, needle)
require(PROJECT, "Active repository write lane:** none")
require(PROJECT, "RC1–RC10 are closed")
require(PROJECT, "RC11 is next but unclaimed")
'''
new = '''for needle in (
    "RC10 implementation contract — CLOSED AND PRESERVED",
    "Turnstile is conditional abuse control",
    "CLOSED — NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE",
):
    require(LOCK, needle)
require(PROJECT, "RC1–RC10 are closed")
'''
if old not in text:
    raise SystemExit("RC10 later-lane verifier source did not match")
text = text.replace(old, new, 1)
text = text.replace('print("workstream_lane=released")\nprint("rc11_claimed=false")', 'print("rc10_closure_preserved=true")\nprint("later_lane_ownership_not_asserted=true")', 1)
path.write_text(text, encoding="utf-8")
print("RC10_LATER_LANE_PATCH|PASS")
