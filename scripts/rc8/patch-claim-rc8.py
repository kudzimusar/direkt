#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASELINE = "e4011bc789b3464043d7f5078108c1285a561fdf"


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise AssertionError(f"{path}: expected one occurrence, found {count}: {old!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


def insert_once(path: str, marker: str, block: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    if block.strip() in text:
        return
    count = text.count(marker)
    if count != 1:
        raise AssertionError(f"{path}: expected one marker, found {count}: {marker!r}")
    target.write_text(text.replace(marker, block + marker, 1), encoding="utf-8")


lock = "WORKSTREAM_LOCK.md"
replace_once(lock, "| Status | RELEASED — RC7 Google Maps runtime integration closed |", "| Status | CLAIMED — RC8 sandbox payment runtime closure |")
replace_once(lock, "| Owner/agent | None. RC7 is closed; RC8 requires an explicit new claim. |", "| Owner/agent | Active repository agent — Issue #261 RC8 sandbox payments checkpoint. |")
replace_once(
    lock,
    "| Authorized scope | No active write lane. Preserve RC0–RC7 evidence and all production/participant stop gates; RC8 sandbox payment work requires a separate explicit claim. |",
    "| Authorized scope | Reconcile and promote the existing RC8 sandbox-provider source checkpoint, bind only reviewed provider sandbox credentials through least-privilege server-side controls, execute synthetic managed provider/reconciliation evidence, and close the checkpoint. Real money, participant data, production endpoints, customer-to-provider payments, escrow, wallet/payout authority and payment influence over verification/trust remain prohibited. |",
)
replace_once(
    lock,
    "| Protected surface | Closed RC0–RC6 evidence, including RC5 managed run `30183466799` and RC6 managed run `30137700769`; UIA Issue #354; exact-private-coordinate non-publication; backend/database/OpenAPI trust boundaries; private API/BFF IAM; payments; VC1–VC8 Design DNA; Phase 11/12 gates; Android auth/signing/Play/Data Safety. |",
    "| Protected surface | Closed RC0–RC7 evidence, including RC5 managed run `30183466799`, RC6 managed run `30137700769` and RC7 managed run `30234521983/1`; UIA Issue #354; backend/database/OpenAPI and commercial ledger trust boundaries; private API/BFF IAM; provider credentials; VC1–VC8 Design DNA; Phase 11/12 gates; Android auth/signing/Play/Data Safety. |",
)
replace_once(lock, f"| Implementation branch | None after RC7 closure. Exact RC7 source: `47285575862cbf08845eaeabe093afea1ea79bd1`. |", "| Implementation branch | `integration/rc8-sandbox-payments`, replayed from source checkpoint PR #454 onto the current RC7-closed baseline after this claim merges. |")
replace_once(
    lock,
    "| Current task | None. RC7 is closed; RC8 is the next dependency-safe checkpoint but is not claimed. |",
    "| Current task | RC8 — promote the existing sandbox adapter/reconciliation source checkpoint, then implement least-privilege runtime binding and managed synthetic provider evidence before formal closure. |",
)
replace_once(
    lock,
    "| Governing issue | Issue #261 — Runtime integration closure after W8. RC7 is closed; Issue #354 UIA remains parked/read-only. |",
    "| Governing issue | Issue #261 — Runtime integration closure after W8. RC8 is the sole active bounded write lane; Issue #354 UIA remains parked/read-only. |",
)

rc8_contract = f"""## RC8 implementation contract — CLAIMED

1. RC8 is limited to sandbox adapters, runtime proof and reconciliation for DIREKT-owned provider subscriptions, verification-processing fees and renewal/re-verification fees.
2. Real money, participant payment data, production provider endpoints or credentials, customer-to-provider service payments, escrow, stored value, wallets and marketplace payouts remain disabled and outside scope.
3. Source checkpoint PR #454 must be replayed onto current `main@{BASELINE}` without overwriting RC0–RC7 closure evidence and must pass the complete exact-head regression matrix before merge.
4. Provider credentials remain server-side and Secret Manager-backed with least privilege. Android and browser clients never receive credentials or declare payment success.
5. Success requires independent provider verification plus exact provider reference, transaction identifier where applicable, amount and currency agreement with the backend-owned DIREKT intent and ledger.
6. Provider observations, payment events, ledger postings, mismatch cases and adjustments remain append-only and idempotent. A mismatch opens reconciliation; it is never silently repaired.
7. Refund and accounting-adjustment execution requires two independent approvers, requester exclusion, balanced ledger effects and operations-only revision-checked resolution.
8. MTN MoMo, DPO, Stripe and PayPal may be proven only against reviewed sandbox/test environments. Airtel remains provider-pending and Flutterwave remains deferred/excluded.
9. Managed evidence must use bounded synthetic values, sanitized receipts, exact reviewed source, explicit cleanup and no raw provider payload or credential leakage. A failed provider attempt remains preserved and cannot be documented as passing.
10. RC8 closes only after source promotion, applicable managed sandbox provider and reconciliation proof, status/ledger reconciliation, exact-head regressions, trigger consumption and workstream release. Production and participant authorization remain false.

"""
insert_once(lock, "## Runtime integration closure contract", rc8_contract)
replace_once(
    lock,
    "- RC8 — sandbox-only payment-provider adapter closure/reconciliation for already proven MTN, DPO, Stripe and PayPal rails; Airtel remains provider-pending and Flutterwave deferred; real money remains disabled.",
    "- RC8 — sandbox-only payment-provider adapter closure/reconciliation for already proven MTN, DPO, Stripe and PayPal rails; Airtel remains provider-pending and Flutterwave deferred; real money remains disabled. **CLAIMED — source checkpoint promotion, bounded runtime binding and managed synthetic evidence in progress.**",
)
replace_once(
    lock,
    "No repository write lane is active. RC0–RC7 evidence remains immutable/regression-protected, UIA Issue #354 remains parked/read-only, and RC8 source work requires an explicit new claim. Production and participant authorization remain blocked.",
    "RC8 is the sole active repository write lane. RC0–RC7 evidence remains immutable/regression-protected, UIA Issue #354 remains parked/read-only, and RC9+ source work must not begin until RC8 is closed or explicitly transitioned. Real-money, participant and production authorization remain blocked.",
)

project = "PROJECT_STATUS.md"
replace_once(
    project,
    "**Active repository write lane:** none; RC1–RC7 are closed at documented synthetic-only managed boundaries",
    "**Active repository write lane:** RC8 sandbox payment runtime closure under Issue #261; RC1–RC7 remain closed at documented synthetic-only managed boundaries",
)
replace_once(
    project,
    "- runtime integration closure — **RC1–RC7 are closed at synthetic-only managed boundaries; RC7 Google Maps passed backend OAuth and API 36 map-ready evidence**.",
    "- runtime integration closure — **RC1–RC7 are closed at synthetic-only managed boundaries; RC8 sandbox payment source promotion and managed evidence are active**.",
)
replace_once(
    project,
    "VC1–VC8 and RC1–RC7 are closed at their documented boundaries. No active repository write lane exists.\n\nRC8 sandbox-only payment-provider reconciliation is the next dependency-safe integration checkpoint, but it is not claimed. Before RC8 source changes:\n\n1. start from current merged `main`;\n2. recheck RC0–RC7 exact-head evidence and the current integration ledger;\n3. claim a new bounded lane in `WORKSTREAM_LOCK.md`;\n4. keep all real-money movement, escrow and participant/production authorization disabled;\n5. preserve backend-authoritative ledger/webhook reconciliation and all verification/trust separation rules.",
    "VC1–VC8 and RC1–RC7 are closed at their documented boundaries. RC8 is the sole active repository write lane.\n\nRC8 execution order is:\n\n1. replay the reviewed PR #454 source checkpoint onto the current RC7-closed `main`;\n2. require the complete exact-head backend, Android, web, portal, integration, supply-chain and documentation regression matrix before source promotion;\n3. bind only reviewed sandbox/test provider credentials through least-privilege server-side controls;\n4. execute bounded synthetic provider and reconciliation evidence with real money, participant data and production authorization false;\n5. close RC8 only after status/ledger reconciliation, trigger consumption, exact-head regressions and workstream release.",
)

rc5 = "scripts/rc5/verify-test-lab-closure.py"
replace_once(
    rc5,
    '''rc7_closed_handoff = (
    "RELEASED — RC7 Google Maps runtime integration closed" in lock
    and "RC7 implementation contract — CLOSED AND PRESERVED" in lock
    and "No repository write lane is active" in lock
)
assert released_handoff or rc7_handoff or rc7_closed_handoff, (
    "RC5 closure must remain valid with no active lane, bounded RC7 active, or RC7 closed/released"
)
''',
    '''rc7_closed_handoff = (
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
assert released_handoff or rc7_handoff or rc7_closed_handoff or rc8_active_handoff, (
    "RC5 closure must remain valid with no active lane, bounded RC7 active, RC7 closed/released, or bounded RC8 active"
)
''',
)

rc6 = "scripts/rc6/verify-whatsapp-contract.py"
replace_once(
    rc6,
    '''    supported_states = (
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
    '''    rc8_active_lock_needles = (
        "CLAIMED — RC8 sandbox payment runtime closure",
        "RC5 implementation contract — CLOSED AND PRESERVED",
        "RC6 implementation contract — CLOSED AND PRESERVED",
        "exact-current-main managed run `30137700769`",
        "RC7 implementation contract — CLOSED AND PRESERVED",
        "RC8 implementation contract — CLAIMED",
        "RC8 is the sole active repository write lane",
        "Production/participant WhatsApp delivery remains disabled",
    )
    supported_states = (
        all(needle in lock for needle in active_lock_needles),
        all(needle in lock for needle in rc5_resumed_lock_needles),
        all(needle in lock for needle in post_rc5_closed_lock_needles),
        all(needle in lock for needle in rc7_active_lock_needles),
        all(needle in lock for needle in rc7_closed_lock_needles),
        all(needle in lock for needle in rc8_active_lock_needles),
    )
    if sum(supported_states) != 1:
        raise AssertionError(
            "RC6 lock must be exactly one supported state: active RC6, RC5 resumed, no active lane before RC7, bounded RC7 active, RC7 closed/released, or bounded RC8 active."
        )
''',
)

rc7 = "scripts/rc7/verify-maps-contract.py"
replace_once(
    rc7,
    '''    for needle in (
        "RELEASED — RC7 Google Maps runtime integration closed",
        "RC7 implementation contract — CLOSED AND PRESERVED",
        "Places and Routes remain disabled",
        "Exact private provider bases never become public markers",
        "No repository write lane is active",
    ):
        require(lock, needle, "RC7 workstream contract")
''',
    '''    for needle in (
        "RC7 implementation contract — CLOSED AND PRESERVED",
        "Places and Routes remain disabled",
        "Exact private provider bases never become public markers",
    ):
        require(lock, needle, "RC7 workstream contract")
    rc7_released = (
        "RELEASED — RC7 Google Maps runtime integration closed" in lock
        and "No repository write lane is active" in lock
    )
    rc8_active = (
        "CLAIMED — RC8 sandbox payment runtime closure" in lock
        and "RC8 implementation contract — CLAIMED" in lock
        and "RC8 is the sole active repository write lane" in lock
    )
    if not (rc7_released or rc8_active):
        raise AssertionError("RC7 closure must remain preserved with the lane released or bounded RC8 active.")
''',
)

print("RC8_CLAIM_PATCH|PASS")
