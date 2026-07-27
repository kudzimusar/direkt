#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise AssertionError(f"{path}: expected one occurrence, found {count}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


rc5 = "scripts/rc5/verify-test-lab-closure.py"
replace_once(
    rc5,
    '''rc7_handoff = (
    "CLAIMED — RC7 Google Maps runtime integration" in lock
    and "RC7 implementation contract — CLAIMED" in lock
    and "RC7 is the sole active repository write lane" in lock
)
assert released_handoff or rc7_handoff, "RC5 closure must remain valid in released or bounded RC7 state"
''',
    '''rc7_handoff = (
    "CLAIMED — RC7 Google Maps runtime integration" in lock
    and "RC7 implementation contract — CLAIMED" in lock
    and "RC7 is the sole active repository write lane" in lock
)
rc7_closed_handoff = (
    "RELEASED — RC7 Google Maps runtime integration closed" in lock
    and "RC7 implementation contract — CLOSED AND PRESERVED" in lock
    and "No repository write lane is active" in lock
)
assert released_handoff or rc7_handoff or rc7_closed_handoff, (
    "RC5 closure must remain valid with no active lane, bounded RC7 active, or RC7 closed/released"
)
''',
)

rc6 = "scripts/rc6/verify-whatsapp-contract.py"
replace_once(
    rc6,
    '''    rc7_active_lock_needles = (
        "CLAIMED — RC7 Google Maps runtime integration",
        "RC5 implementation contract — CLOSED AND PRESERVED",
        "RC6 implementation contract — CLOSED AND PRESERVED",
        "exact-current-main managed run `30137700769`",
        "RC7 implementation contract — CLAIMED",
        "RC7 is the sole active repository write lane",
        "Production/participant WhatsApp delivery remains disabled",
    )
    supported_states = (
        all(needle in lock for needle in active_lock_needles),
        all(needle in lock for needle in rc5_resumed_lock_needles),
        all(needle in lock for needle in post_rc5_closed_lock_needles),
        all(needle in lock for needle in rc7_active_lock_needles),
    )
    if sum(supported_states) != 1:
        raise AssertionError(
            "RC6 lock must be exactly one supported state: active RC6, closed RC6 with RC5 resumed, closed RC5/RC6 with no active lane, or closed RC5/RC6 with bounded RC7 active."
        )
''',
    '''    rc7_active_lock_needles = (
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
    supported_states = (
        all(needle in lock for needle in active_lock_needles),
        all(needle in lock for needle in rc5_resumed_lock_needles),
        all(needle in lock for needle in post_rc5_closed_lock_needles),
        all(needle in lock for needle in rc7_active_lock_needles),
        all(needle in lock for needle in rc7_closed_lock_needles),
    )
    if sum(supported_states) != 1:
        raise AssertionError(
            "RC6 lock must be exactly one supported state: active RC6, RC5 resumed, no active lane before RC7, bounded RC7 active, or RC7 closed/released."
        )
''',
)

print("RC7_CLOSURE_COMPATIBILITY_PATCH|PASS")
