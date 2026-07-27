#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

rc5_path = ROOT / "scripts/rc5/verify-test-lab-closure.py"
rc5 = rc5_path.read_text(encoding="utf-8")
rc5_old = '''released_handoff = (
    "No active implementation lane exists" in lock
    and "RC7+ source work must not begin until a new explicit bounded claim" in lock
)
rc7_handoff = (
    "CLAIMED — RC7 Google Maps runtime integration" in lock
    and "RC7 implementation contract — CLAIMED" in lock
    and "RC7 is the sole active repository write lane" in lock
)
rc7_closed_handoff = (
    "RELEASED — RC7 Google Maps runtime integration closed" in lock
    and "RC7 implementation contract — CLOSED AND PRESERVED" in lock
    and "No repository write lane is active" in lock
)
rc8_active_handoff = (
    "CLAIMED — RC8 sandbox payment runtime closure" in lock
    and "RC7 implementation contract — CLOSED AND PRESERVED" in lock
    and "RC8 implementation contract — CLAIMED" in lock
    and "RC8 is the sole active repository write lane" in lock
)
rc8_closed_handoff = (
    "| Status | RELEASED |" in lock
    and "RC8 implementation contract — CLOSED AND PRESERVED" in lock
    and "No repository write lane is active" in lock
)
assert released_handoff or rc7_handoff or rc7_closed_handoff or rc8_active_handoff or rc8_closed_handoff, (
    "RC5 closure must remain valid through RC8 closed/released"
)
'''
rc5_new = '''for needle in (
    "c3744430a7beb1cd47246d858df9ac1379a068ac",
    "30183466799",
    "8626329335",
    "sha256:03a40951a23c937d8b0fd2990a7d2652afbd1172631c0b480af756aebd92a843",
    "RC5 is `CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX`",
):
    assert needle in lock, f"immutable RC5 closure receipt missing: {needle}"
'''
if rc5.count(rc5_old) != 1:
    raise SystemExit("RC5 transient handoff block not found exactly once")
rc5_path.write_text(rc5.replace(rc5_old, rc5_new, 1), encoding="utf-8")

rc6_path = ROOT / "scripts/rc6/verify-whatsapp-contract.py"
rc6 = rc6_path.read_text(encoding="utf-8")
rc6_old = '''    active_lock_needles = (
        "CLAIMED — RC6 WhatsApp Cloud API",
        "RC6 implementation contract — ACTIVE OWNER-AUTHORIZED CHECKPOINT",
        "RC6 under Issue #261 is the sole active implementation lane",
        "RC5 remains parked/not closed",
        "Production/participant WhatsApp delivery remains disabled",
    )
    rc5_resumed_lock_needles = (
        "CLAIMED — RC5 Firebase Test Lab device-matrix closure",
        "RC6 implementation contract — CLOSED AND PRESERVED",
        "exact-current-main managed run `30137700769`",
        "RC5 Firebase Test Lab is the sole active implementation lane",
        "production/participant WhatsApp delivery remains disabled",
    )
    post_rc5_closed_lock_needles = (
        "RELEASED — RC5 Firebase Test Lab device-matrix closure complete",
        "RC5 implementation contract — CLOSED AND PRESERVED",
        "RC6 implementation contract — CLOSED AND PRESERVED",
        "exact-current-main managed run `30137700769`",
        "No active implementation lane exists",
        "production/participant WhatsApp delivery remains disabled",
    )
    rc7_active_lock_needles = (
        "CLAIMED — RC7 Google Maps runtime integration",
        "RC5 implementation contract — CLOSED AND PRESERVED",
        "RC6 implementation contract — CLOSED AND PRESERVED",
        "exact-current-main managed run `30137700769`",
        "RC7 implementation contract — CLAIMED",
        "RC7 is the sole active repository write lane",
        "Production/participant WhatsApp delivery remains disabled",
    )
    rc7_closed_lock_needles = (
        "RELEASED — RC7 Google Maps runtime integration closed",
        "RC5 implementation contract — CLOSED AND PRESERVED",
        "RC6 implementation contract — CLOSED AND PRESERVED",
        "exact-current-main managed run `30137700769`",
        "RC7 implementation contract — CLOSED AND PRESERVED",
        "No repository write lane is active",
        "Production/participant WhatsApp delivery remains disabled",
    )
    rc8_active_lock_needles = (
        "CLAIMED — RC8 sandbox payment runtime closure",
        "RC5 implementation contract — CLOSED AND PRESERVED",
        "RC6 implementation contract — CLOSED AND PRESERVED",
        "exact-current-main managed run `30137700769`",
        "RC7 implementation contract — CLOSED AND PRESERVED",
        "RC8 implementation contract — CLAIMED",
        "RC8 is the sole active repository write lane",
        "Production/participant WhatsApp delivery remains disabled",
    )
    rc8_closed_lock_needles = (
        "| Status | RELEASED |",
        "RC5 implementation contract — CLOSED AND PRESERVED",
        "RC6 implementation contract — CLOSED AND PRESERVED",
        "exact-current-main managed run `30137700769`",
        "RC7 implementation contract — CLOSED AND PRESERVED",
        "RC8 implementation contract — CLOSED AND PRESERVED",
        "No repository write lane is active",
        "production/participant WhatsApp delivery remains disabled",
    )
    supported_states = (
        all(needle in lock for needle in active_lock_needles),
        all(needle in lock for needle in rc5_resumed_lock_needles),
        all(needle in lock for needle in post_rc5_closed_lock_needles),
        all(needle in lock for needle in rc7_active_lock_needles),
        all(needle in lock for needle in rc7_closed_lock_needles),
        all(needle in lock for needle in rc8_active_lock_needles),
        all(needle in lock for needle in rc8_closed_lock_needles),
    )
    if sum(supported_states) != 1:
        raise AssertionError(
            "RC6 lock must be exactly one supported state through RC8 closed/released."
        )
'''
rc6_new = '''    for needle in (
        "RC6 implementation contract — CLOSED AND PRESERVED",
        "8838b7a6d726a5aed44ce21a39506c1265a98d15",
        "30137700769",
        "RC6 is `CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY`",
        "production/participant WhatsApp delivery remains disabled",
    ):
        require(lock, needle, "immutable RC6 closure receipt")
'''
if rc6.count(rc6_old) != 1:
    raise SystemExit("RC6 transient ownership matrix not found exactly once")
rc6_path.write_text(rc6.replace(rc6_old, rc6_new, 1), encoding="utf-8")

print("RC5_RC6_FORWARD_COMPATIBLE_CLOSURE_PATCH|PASS")
