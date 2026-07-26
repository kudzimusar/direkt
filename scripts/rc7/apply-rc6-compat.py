#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[2]
path = root / "scripts/rc6/verify-whatsapp-contract.py"
text = path.read_text(encoding="utf-8")
old = '''    post_rc5_closed_lock_needles = (
        "RELEASED — RC5 Firebase Test Lab device-matrix closure complete",
        "RC5 implementation contract — CLOSED AND PRESERVED",
        "RC6 implementation contract — CLOSED AND PRESERVED",
        "exact-current-main managed run `30137700769`",
        "No active implementation lane exists",
        "production/participant WhatsApp delivery remains disabled",
    )
    supported_states = (
        all(needle in lock for needle in active_lock_needles),
        all(needle in lock for needle in rc5_resumed_lock_needles),
        all(needle in lock for needle in post_rc5_closed_lock_needles),
    )
    if sum(supported_states) != 1:
        raise AssertionError(
            "RC6 lock must be exactly one supported state: active RC6, closed RC6 with RC5 resumed, or closed RC5/RC6 with no active lane."
        )
'''
new = '''    post_rc5_closed_lock_needles = (
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
'''
if text.count(old) != 1:
    raise SystemExit("RC6 compatibility patch target did not match exactly once")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
print("RC6 verifier now preserves closure under bounded RC7 ownership")
