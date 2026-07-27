#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
path = ROOT / "scripts/rc7/verify-maps-contract.py"
text = path.read_text(encoding="utf-8")
old = '''    rc7_released = (
        "RELEASED — RC7 Google Maps runtime integration closed" in lock
        and "No repository write lane is active" in lock
    )
    rc8_active = (
        "CLAIMED — RC8 sandbox payment runtime closure" in lock
        and "RC8 implementation contract — CLAIMED" in lock
        and "RC8 is the sole active repository write lane" in lock
    )
    rc8_closed = (
        "| Status | RELEASED |" in lock
        and "RC8 implementation contract — CLOSED AND PRESERVED" in lock
        and "No repository write lane is active" in lock
    )
    if not (rc7_released or rc8_active or rc8_closed):
        raise AssertionError("RC7 closure must remain preserved through RC8 closed/released.")
'''
new = '''    for needle in (
        "47285575862cbf08845eaeabe093afea1ea79bd1",
        "30234521983/1",
        "8641270327",
        "sha256:24da53c0bd6fa885fa4a6814f70af090096192e6c5b7a03c89fba51416877fde",
        "RC7 is `CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY`",
    ):
        require(lock, needle, "immutable RC7 closure receipt")
'''
if text.count(old) != 1:
    raise SystemExit("RC7 transient ownership block not found exactly once")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
print("RC7_FORWARD_COMPATIBLE_CLOSURE_PATCH|PASS")
