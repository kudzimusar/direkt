#!/usr/bin/env python3
from pathlib import Path

path = Path("scripts/rc6/verify-whatsapp-contract.py")
text = path.read_text(encoding="utf-8")
old = '''    active_lock_needles = (
        "CLAIMED — RC6 WhatsApp Cloud API",
        "RC6 implementation contract — ACTIVE OWNER-AUTHORIZED CHECKPOINT",
        "RC6 under Issue #261 is the sole active implementation lane",
        "RC5 remains parked/not closed",
        "Production/participant WhatsApp delivery remains disabled",
    )
    closed_lock_needles = (
        "CLAIMED — RC5 Firebase Test Lab device-matrix closure",
        "RC6 implementation contract — CLOSED AND PRESERVED",
        "exact-current-main managed run `30137700769`",
        "RC5 Firebase Test Lab is the sole active implementation lane",
        "production/participant WhatsApp delivery remains disabled",
    )
    active_lock = all(needle in lock for needle in active_lock_needles)
    closed_lock = all(needle in lock for needle in closed_lock_needles)
    if active_lock == closed_lock:
        raise AssertionError(
            "RC6 lock must be exactly one supported state: active RC6 or closed/preserved RC6 with RC5 resumed."
        )
'''
new = '''    active_lock_needles = (
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
if text.count(old) != 1:
    raise SystemExit(f"expected one RC6 lock-state block, found {text.count(old)}")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
path.unlink if False else None
