#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = "ccc4e9463d810ddf554182b1607c22d3a7c8c8d3"
RUN = "30241092949/1"
ARTIFACT = "8643323319"
DIGEST = "sha256:bbb4600eb5a062552947e91c878dd09c6d1e4dc307ae4783c7fa1fb4cf6e4935"


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


# Workstream lock: release the single lane while preserving the RC8 contract and receipt.
lock = "WORKSTREAM_LOCK.md"
replace_once(lock, "| Status | CLAIMED — RC8 sandbox payment runtime closure |", "| Status | RELEASED |")
replace_once(
    lock,
    "| Owner/agent | Active repository agent — Issue #261 RC8 sandbox payments checkpoint. |",
    "| Owner/agent | None — RC8 is closed; Issue #261 remains the runtime-integration tracker. |",
)
replace_once(
    lock,
    "| Authorized scope | Reconcile and promote the existing RC8 sandbox-provider source checkpoint, bind only reviewed provider sandbox credentials through least-privilege server-side controls, execute synthetic managed provider/reconciliation evidence, and close the checkpoint. Real money, participant data, production endpoints, customer-to-provider payments, escrow, wallet/payout authority and payment influence over verification/trust remain prohibited. |",
    "| Authorized scope | No active write lane. RC8 evidence is immutable/regression-protected. RC9 may begin only through a new explicit claim. Real money, participant data, production endpoints, customer-to-provider payments, escrow, wallet/payout authority and payment influence over verification/trust remain prohibited. |",
)
replace_once(
    lock,
    "| Protected surface | Closed RC0–RC7 evidence, including RC5 managed run `30183466799`, RC6 managed run `30137700769` and RC7 managed run `30234521983/1`; UIA Issue #354; backend/database/OpenAPI and commercial ledger trust boundaries; private API/BFF IAM; provider credentials; VC1–VC8 Design DNA; Phase 11/12 gates; Android auth/signing/Play/Data Safety. |",
    f"| Protected surface | Closed RC0–RC8 evidence, including RC5 run `30183466799`, RC6 run `30137700769`, RC7 run `30234521983/1` and RC8 run `{RUN}` on `{SOURCE}`; UIA Issue #354; backend/database/OpenAPI and commercial ledger trust boundaries; private API/BFF IAM; provider credentials; VC1–VC8 Design DNA; Phase 11/12 gates; Android auth/signing/Play/Data Safety. |",
)
replace_once(
    lock,
    "| Implementation branch | `feat/rc8-managed-sandbox-proof`, based on the merged source checkpoint `main@6098b71f89d62fa059de298be11a8d9d8539c25e`. |",
    "| Implementation branch | None — `docs/rc8-managed-closure` is the bounded closeout branch only. |",
)
replace_once(
    lock,
    "| Stable baseline | RC5–RC7 remain closed. RC8 source checkpoint PR #454 is merged at `6098b71f89d62fa059de298be11a8d9d8539c25e`; all provider adapters remain application-runtime disabled. UIA Issue #354 remains parked/open. Production, participant and real-money activation remain disabled. |",
    f"| Stable baseline | RC5–RC8 are closed. RC8 exact source `{SOURCE}` passed managed run `{RUN}` with artifact `{ARTIFACT}` (`{DIGEST}`). Application provider registration, participant use, production credentials/endpoints and real-money movement remain disabled. UIA Issue #354 remains parked/open. |",
)
replace_once(
    lock,
    "| Current task | RC8 — prove MTN MoMo, Stripe and PayPal through one exact-main private synthetic Cloud Run Job, preserve DPO/Airtel/Flutterwave runtime blocks, then reconcile and close the checkpoint. |",
    "| Current task | None. RC9 OpenAPI-generated client adoption/decision is next in sequence but is not claimed. |",
)
replace_once(
    lock,
    "| Governing issue | Issue #261 — Runtime integration closure after W8. RC8 is the sole active bounded write lane; Issue #354 UIA remains parked/read-only. |",
    "| Governing issue | Issue #261 — Runtime integration closure after W8. No active repository lane; Issue #354 UIA remains parked/read-only. |",
)
replace_once(lock, "## RC8 implementation contract — CLAIMED", "## RC8 implementation contract — CLOSED AND PRESERVED")
replace_once(
    lock,
    "10. RC8 closes only after source promotion, applicable managed sandbox provider and reconciliation proof, status/ledger reconciliation, exact-head regressions, trigger consumption and workstream release. Production and participant authorization remain false.",
    f"10. RC8 is `CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY`: exact source `{SOURCE}` passed run `{RUN}` with artifact `{ARTIFACT}` (`{DIGEST}`). MTN independent success, Stripe unpaid Checkout retrieval, PayPal unapproved-order retrieval, immutable reconciliation, duplicate suppression, mismatch review, two-person adjustment planning and temporary-job cleanup all passed. The trigger is consumed; application runtime, production, participant and real-money authorization remain false.",
)
replace_once(
    lock,
    "- RC8 — sandbox-only payment-provider adapter closure/reconciliation. **CLAIMED — source checkpoint merged at `6098b71f89d62fa059de298be11a8d9d8539c25e`; exact-main private managed proof is armed for MTN MoMo, Stripe and PayPal; DPO runtime-unbound, Airtel provider-pending, Flutterwave deferred; real money remains disabled.**",
    f"- RC8 — sandbox-only payment-provider adapter closure/reconciliation. **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY — exact source `{SOURCE}`; run `{RUN}`; artifact `{ARTIFACT}` (`{DIGEST}`); MTN/Stripe/PayPal proved privately; DPO runtime-unbound, Airtel provider-pending, Flutterwave deferred; application runtime and real money disabled.**",
)
replace_once(
    lock,
    "RC8 is the sole active repository write lane. RC0–RC7 evidence remains immutable/regression-protected, UIA Issue #354 remains parked/read-only, and RC9+ source work must not begin until RC8 is closed or explicitly transitioned. Real-money, participant and production authorization remain blocked.",
    "No repository write lane is active. RC0–RC8 evidence remains immutable/regression-protected, UIA Issue #354 remains parked/read-only, and RC9 source work requires a new explicit claim. Real-money, participant and production authorization remain blocked.",
)

# Project status: promote RC8 closure truth and make RC9 explicitly next but unclaimed.
project = "PROJECT_STATUS.md"
replace_once(
    project,
    "**Active repository write lane:** RC8 sandbox payment runtime closure under Issue #261; RC1–RC7 remain closed at documented synthetic-only managed boundaries",
    "**Active repository write lane:** RELEASED — RC1–RC8 are closed at documented synthetic-only managed boundaries; RC9 is next but unclaimed",
)
replace_once(
    project,
    "- runtime integration closure — **RC1–RC7 are closed at synthetic-only managed boundaries; RC8 source merged at `6098b71f89d62fa059de298be11a8d9d8539c25e` and exact-main managed sandbox evidence is armed**.",
    f"- runtime integration closure — **RC1–RC8 are closed at synthetic-only managed boundaries; RC8 exact source `{SOURCE}` passed managed run `{RUN}` with artifact `{ARTIFACT}` (`{DIGEST}`)**.",
)
insert_once(
    project,
    "- payment rails may be sandbox-proven while real money remains disabled;\n",
    f"- RC8 sandbox payments are **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY** at source `{SOURCE}`, run `{RUN}`, artifact `{ARTIFACT}` (`{DIGEST}`): MTN success, Stripe unpaid Checkout, PayPal unapproved order, immutable reconciliation and cleanup passed; application provider registration, DPO/Airtel/Flutterwave runtime binding, participant use and real money remain disabled;\n",
)
replace_once(
    project,
    "VC1–VC8 and RC1–RC7 are closed at their documented boundaries. RC8 is the sole active repository write lane.\n\nRC8 source promotion is complete through PR #454 at `6098b71f89d62fa059de298be11a8d9d8539c25e`. The active completion order is:\n\n1. verify numeric Secret Manager versions and secret-scoped runtime access for the existing MTN MoMo, Stripe and PayPal sandbox credentials without reading values through CI;\n2. build an immutable exact-main backend image and execute one private synthetic Cloud Run Job;\n3. prove MTN independent success, Stripe unpaid Checkout retrieval, PayPal unapproved-order retrieval, immutable reconciliation, duplicate suppression, mismatch review and two-person adjustment planning;\n4. preserve DPO/Airtel/Flutterwave runtime blocks and keep real money, participant data and production authorization false;\n5. close RC8 only after terminal evidence, status/ledger reconciliation, trigger consumption, exact-head regressions and workstream release.",
    f"VC1–VC8 and RC1–RC8 are closed at their documented boundaries. RC8 closed on exact source `{SOURCE}` through run `{RUN}` and artifact `{ARTIFACT}` (`{DIGEST}`).\n\nNo repository write lane is active. RC9 OpenAPI-generated Kotlin and TypeScript client adoption/decision is next in sequence, but it requires a new explicit claim and must preserve all RC0–RC8, Android, backend, web/PWA, operations, supply-chain and release gates. RC8 does not authorize application payment-provider activation, participant payment data, production credentials/endpoints, real money, customer-to-provider payments, escrow, wallets or payouts.",
)

# Current integration status: represent the exact managed evidence without overstating application activation.
status = "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
replace_once(
    status,
    "| RC8 sandbox provider runtime proof | **IMPLEMENTED_GATED / MANAGED PROOF ARMED** | Source PR #454 merged at `6098b71f89d62fa059de298be11a8d9d8539c25e`. One exact-main private Cloud Run Job is armed for MTN MoMo, Stripe and PayPal using numeric Secret Manager versions; the application registry remains disabled. DPO is runtime-unbound, Airtel provider-pending and Flutterwave excluded. |",
    f"| RC8 sandbox provider runtime proof | **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY** | Exact source `{SOURCE}` passed run `{RUN}` with artifact `{ARTIFACT}` (`{DIGEST}`). MTN, Stripe, PayPal and immutable reconciliation passed in one private temporary job; cleanup passed. The application registry remains disabled; DPO is runtime-unbound, Airtel provider-pending and Flutterwave excluded. |",
)
replace_once(
    status,
    "| MTN MoMo Collections API | **SOURCE INTEGRATED / MANAGED PROOF ARMED** | External sandbox proof already succeeded; RC8 now has a fail-closed source adapter and one private exact-main Request-to-Pay/status proof armed. Application runtime remains disabled. |",
    f"| MTN MoMo Collections API | **MANAGED SANDBOX PROVEN / APPLICATION RUNTIME DISABLED** | Exact-main RC8 run `{RUN}` proved Request to Pay plus independent `succeeded` status with amount/currency and transaction-id agreement. Application runtime remains disabled. |",
)
replace_once(
    status,
    "| Stripe Checkout | **SOURCE INTEGRATED / MANAGED PROOF ARMED** | External sandbox proof already succeeded; RC8 will create and independently retrieve one unpaid test Checkout without treating browser state as payment truth. Application runtime remains disabled. |",
    f"| Stripe Checkout | **MANAGED SANDBOX PROVEN / APPLICATION RUNTIME DISABLED** | Exact-main RC8 run `{RUN}` created and independently retrieved an unpaid test Checkout as `requires_action`; browser state was not payment truth. Application runtime remains disabled. |",
)
replace_once(
    status,
    "| PayPal | **SOURCE INTEGRATED / MANAGED PROOF ARMED** | External sandbox proof already succeeded; RC8 will create and independently retrieve one unapproved sandbox order without capture or browser-authoritative payment truth. Application runtime remains disabled. |",
    f"| PayPal | **MANAGED SANDBOX PROVEN / APPLICATION RUNTIME DISABLED** | Exact-main RC8 run `{RUN}` created and independently retrieved an unapproved sandbox order as `requires_action`; no capture or browser-authoritative payment truth occurred. Application runtime remains disabled. |",
)

# Live ledger: preserve failed evidence and record the terminal closure receipt.
ledger = "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
replace_once(
    ledger,
    "### RC8 runtime proof — IMPLEMENTED_GATED / MANAGED PROOF ARMED",
    "### RC8 runtime proof — CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY",
)
replace_once(
    ledger,
    "Provider-neutral adapters and immutable reconciliation were merged through PR #454 at `6098b71f89d62fa059de298be11a8d9d8539c25e`. The application payment registry remains intentionally disabled. A one-shot exact-main private Cloud Run Job is armed for the existing MTN MoMo, Stripe and PayPal sandbox credentials; real money remains disabled:",
    f"Provider-neutral adapters and immutable reconciliation were merged through PR #454. Exact source `{SOURCE}` passed private managed run `{RUN}` with artifact `{ARTIFACT}` (`{DIGEST}`). MTN Request to Pay/status, Stripe unpaid Checkout retrieval, PayPal unapproved-order retrieval, balanced immutable reconciliation, duplicate suppression, mismatch review, two-person adjustment planning and temporary-job cleanup all passed. The application payment registry and real money remain disabled:",
)
insert_once(
    ledger,
    "Suggested routing intent:\n",
    f"Managed evidence history:\n\n- attempt `30238926656/1` failed before image build/provider mutation because deployer secret metadata access was absent; artifact `8642560395` (`sha256:d64d9d1fc1934448a00c29ee6924ee34442d92a114ebdf2bb46bfb918404912e`);\n- attempt `30238926656/2` reached the private job but MTN returned HTTP 500; artifact `8642921752` (`sha256:f78da1c133b7d7dfa0e8397657052bc178250dbe7322c2e5a5404234ba9e80d6`);\n- terminal run `{RUN}` passed on `{SOURCE}`; artifact `{ARTIFACT}` (`{DIGEST}`).\n\nEvery attempt preserved sanitized evidence, deleted any temporary job that was created, and kept participant data, production authorization, real money and customer-to-provider payments false.\n\n",
)
replace_once(
    ledger,
    "10. RC8 sandbox-only payment adapters/evidence reconciliation — **IMPLEMENTED_GATED / MANAGED PROOF ARMED**; source merged at `6098b71f89d62fa059de298be11a8d9d8539c25e`; MTN/Stripe/PayPal private proof pending; DPO/Airtel/Flutterwave runtime disabled.",
    f"10. RC8 sandbox-only payment adapters/evidence reconciliation — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**; exact source `{SOURCE}`; run `{RUN}`; artifact `{ARTIFACT}` (`{DIGEST}`); MTN/Stripe/PayPal and immutable reconciliation passed; DPO/Airtel/Flutterwave and application runtime remain disabled; real money false.",
)

# Implementation document: terminal state and exact receipt, preserving both prior failures.
implementation = "docs/integrations/RC8_SANDBOX_PAYMENTS_IMPLEMENTATION.md"
replace_once(implementation, "**State:** IMPLEMENTED_GATED / MANAGED PROOF ARMED", "**State:** CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY")
replace_once(
    implementation,
    "| MTN MoMo Collections | Sandbox proven | Source adapter implemented and source-tested behind an unbound runtime gate; managed sandbox execution remains pending. |",
    f"| MTN MoMo Collections | Managed sandbox proven | Exact-main run `{RUN}` proved Request to Pay plus independent success; application runtime remains disabled. |",
)
replace_once(
    implementation,
    "| Stripe Checkout | Sandbox proven | Source adapter implemented and source-tested for test Checkout Session creation and independent server retrieval; runtime remains unbound. |",
    f"| Stripe Checkout | Managed sandbox proven | Exact-main run `{RUN}` proved unpaid Checkout creation plus independent `requires_action` retrieval; application runtime remains disabled. |",
)
replace_once(
    implementation,
    "| PayPal Orders | Sandbox proven | Source adapter implemented and source-tested for order creation, server capture and independent order retrieval; runtime remains unbound. |",
    f"| PayPal Orders | Managed sandbox proven | Exact-main run `{RUN}` proved unapproved order creation plus independent `requires_action` retrieval without capture; application runtime remains disabled. |",
)
replace_once(implementation, "## Managed runtime proof — armed", "## Managed runtime proof — closed")
insert_once(
    implementation,
    "### Preserved exact-main managed attempt 2\n",
    """### Preserved exact-main managed attempt 1

Exact-main run `30238926656/1` authenticated through WIF but failed before image build or provider mutation because the GitHub deployer lacked secret-container metadata access. Artifact `8642560395` (`sha256:d64d9d1fc1934448a00c29ee6924ee34442d92a114ebdf2bb46bfb918404912e`) preserves the sanitized failure receipt. No temporary provider transaction occurred; cleanup succeeded; real money, participant data, production authorization and customer-to-provider payments remained false.

""",
)
insert_once(
    implementation,
    "## Merge and runtime gates\n",
    f"""### Terminal managed closure receipt

Exact source `{SOURCE}` passed run `{RUN}`. Artifact `{ARTIFACT}` (`{DIGEST}`) proves:

- least-privilege numeric Secret Manager versions and no deployer secret-value reads;
- MTN Request to Pay followed by independent authoritative `succeeded` status with transaction id, amount and currency agreement;
- Stripe unpaid Checkout independently remained `requires_action`, with browser redirect state non-authoritative;
- PayPal unapproved order independently remained `requires_action`, with no capture and browser approval non-authoritative;
- append-only transition planning, balanced ledger posting, immutable observation deduplication, mismatch case creation and two-independent-approver adjustment planning;
- no requester self-approval, direct ledger mutation, historical payment/ledger rewrite or trust/ranking mutation;
- DPO, Airtel and Flutterwave runtime binding false;
- provider credentials/raw payloads absent from evidence;
- temporary Cloud Run Job deleted and `cleanup_failed=false`;
- `managed_result=PASS`, while production authorization, participant data, real money and customer-to-provider payments remained false.

The one-shot trigger is consumed and automatic main-push execution is removed. RC8 closes without registering a payment provider in the application runtime.

""",
)

# Consume the one-shot trigger and pin the closure receipt.
trigger = "docs/integrations/RC8_PAYMENTS_MANAGED_TRIGGER.md"
replace_once(trigger, "STATUS=ARMED", "STATUS=CONSUMED")
insert_once(
    trigger,
    "This one-shot trigger authorizes",
    f"SOURCE_SHA={SOURCE}\nMANAGED_RUN={RUN}\nARTIFACT_ID={ARTIFACT}\nARTIFACT_DIGEST={DIGEST}\nCONSUMED_AT=2026-07-27T05:57:50Z\n\n",
)
replace_once(
    trigger,
    "After terminal managed evidence is recorded, the closure change must replace `STATUS=ARMED` with `STATUS=CONSUMED` and remove automatic main-push execution so the sandbox proof cannot repeat unintentionally.",
    f"Terminal evidence is recorded from exact source `{SOURCE}`, run `{RUN}`, artifact `{ARTIFACT}` (`{DIGEST}`). `STATUS=CONSUMED` and removal of automatic main-push execution prevent unintended repetition. Any future diagnostic rerun requires a reviewed source change that explicitly rearms the trigger; it cannot authorize production, participant or real-money use.",
)

# Managed workflow: no automatic push repeat; PR contract recognizes consumed state.
workflow = ".github/workflows/rc8-payments-managed.yml"
push_block = """  push:
    branches:
      - main
    paths:
      - ".github/workflows/rc8-payments-managed.yml"
      - "scripts/rc8/run-payments-managed.sh"
      - "scripts/rc8/bootstrap-payments-managed.sh"
      - "scripts/rc8/verify-payments-contract.py"
      - "backend/direkt-api/src/commercial/rc8-payment-canary.ts"
      - "backend/direkt-api/src/commercial/*sandbox-payment-provider*"
      - "backend/direkt-api/src/commercial/sandbox-payment-reconciliation.ts"
      - "backend/direkt-api/test/unit/*sandbox-payment*"
      - "docs/integrations/RC8_PAYMENTS_MANAGED_TRIGGER.md"
      - "docs/integrations/RC8_SANDBOX_PAYMENTS_IMPLEMENTATION.md"
      - "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
      - "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
      - "WORKSTREAM_LOCK.md"
"""
replace_once(workflow, push_block, "")
replace_once(workflow, "grep -Fxq 'STATUS=ARMED' docs/integrations/RC8_PAYMENTS_MANAGED_TRIGGER.md", "grep -Fxq 'STATUS=CONSUMED' docs/integrations/RC8_PAYMENTS_MANAGED_TRIGGER.md")
replace_once(workflow, "if: github.event_name != 'pull_request'", "if: github.event_name == 'workflow_dispatch'")
# Keep the managed exact-source step fail-closed: a future manual execution still requires an explicit rearm commit.
replace_once(
    workflow,
    "          grep -Fxq 'STATUS=CONSUMED' docs/integrations/RC8_PAYMENTS_MANAGED_TRIGGER.md\n          grep -Fxq 'CONFIRMATION=RUN-DIREKT-RC8-PAYMENTS-MANAGED' docs/integrations/RC8_PAYMENTS_MANAGED_TRIGGER.md\n          python3 scripts/rc8/verify-payments-contract.py",
    "          grep -Fxq 'STATUS=CONSUMED' docs/integrations/RC8_PAYMENTS_MANAGED_TRIGGER.md\n          grep -Fxq 'CONFIRMATION=RUN-DIREKT-RC8-PAYMENTS-MANAGED' docs/integrations/RC8_PAYMENTS_MANAGED_TRIGGER.md\n          python3 scripts/rc8/verify-payments-contract.py",
)
# The exact-source managed step contains the second occurrence; restore its ARMED precondition so consumed source cannot execute.
text = (ROOT / workflow).read_text(encoding="utf-8")
needle = "grep -Fxq 'STATUS=CONSUMED' docs/integrations/RC8_PAYMENTS_MANAGED_TRIGGER.md"
positions = [i for i in range(len(text)) if text.startswith(needle, i)]
if len(positions) != 2:
    raise AssertionError(f"{workflow}: expected two consumed trigger checks, found {len(positions)}")
second = positions[1]
text = text[:second] + "grep -Fxq 'STATUS=ARMED' docs/integrations/RC8_PAYMENTS_MANAGED_TRIGGER.md" + text[second + len(needle):]
(ROOT / workflow).write_text(text, encoding="utf-8")

# Permanent verifier: enforce closure, consumed trigger, immutable receipt, and no automatic execution.
verifier = "scripts/rc8/verify-payments-contract.py"
replace_once(verifier, 'require(LOCK, "CLAIMED — RC8 sandbox payment runtime closure")', 'require(LOCK, "| Status | RELEASED |")')
replace_once(verifier, 'require(LOCK, "RC8 implementation contract — CLAIMED")', 'require(LOCK, "RC8 implementation contract — CLOSED AND PRESERVED")')
replace_once(verifier, 'require(LOCK, "RC8 is the sole active repository write lane")', 'require(LOCK, "No repository write lane is active")')
replace_once(verifier, 'require(IMPLEMENTATION, "Managed runtime proof — armed")', 'require(IMPLEMENTATION, "Managed runtime proof — closed")')
replace_once(verifier, 'require(IMPLEMENTATION, "IMPLEMENTED_GATED / MANAGED PROOF ARMED")', 'require(IMPLEMENTATION, "CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY")')
replace_once(verifier, 'require(STATUS, "RC8 sandbox provider runtime proof | **IMPLEMENTED_GATED / MANAGED PROOF ARMED**")', 'require(STATUS, "RC8 sandbox provider runtime proof | **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**")')
replace_once(verifier, 'require(LEDGER, "RC8 runtime proof — IMPLEMENTED_GATED / MANAGED PROOF ARMED")', 'require(LEDGER, "RC8 runtime proof — CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY")')
replace_once(verifier, 'require(MANAGED_WORKFLOW, "push:")', 'reject(MANAGED_WORKFLOW, "  push:\\n")')
replace_once(verifier, 'require(MANAGED_WORKFLOW, "branches:\\n      - main")', 'require(MANAGED_WORKFLOW, "workflow_dispatch:")')
replace_once(verifier, 'require(TRIGGER, "STATUS=ARMED")', 'require(TRIGGER, "STATUS=CONSUMED")')
insert_once(
    verifier,
    'require(TRIGGER, "CONFIRMATION=RUN-DIREKT-RC8-PAYMENTS-MANAGED")\n',
    f'''for receipt_file in (LOCK, PROJECT if False else LOCK):
    pass
require(LOCK, "{SOURCE}")
require(LOCK, "{RUN}")
require(LOCK, "{ARTIFACT}")
require(LOCK, "{DIGEST}")
require(PROJECT, "{SOURCE}")
require(PROJECT, "{RUN}")
require(PROJECT, "{ARTIFACT}")
require(STATUS, "{RUN}")
require(STATUS, "{ARTIFACT}")
require(LEDGER, "{SOURCE}")
require(LEDGER, "{RUN}")
require(LEDGER, "{ARTIFACT}")
require(LEDGER, "{DIGEST}")
require(IMPLEMENTATION, "{SOURCE}")
require(IMPLEMENTATION, "{RUN}")
require(IMPLEMENTATION, "{ARTIFACT}")
require(IMPLEMENTATION, "{DIGEST}")
require(TRIGGER, "SOURCE_SHA={SOURCE}")
require(TRIGGER, "MANAGED_RUN={RUN}")
require(TRIGGER, "ARTIFACT_ID={ARTIFACT}")
require(TRIGGER, "ARTIFACT_DIGEST={DIGEST}")
''',
)
# Add PROJECT constant used by closure receipt assertions.
replace_once(
    verifier,
    'STATUS = ROOT / "docs/integrations/CURRENT_INTEGRATION_STATUS.md"\n',
    'STATUS = ROOT / "docs/integrations/CURRENT_INTEGRATION_STATUS.md"\nPROJECT = ROOT / "PROJECT_STATUS.md"\n',
)
# Remove harmless placeholder introduced to keep the generated block structurally simple.
replace_once(verifier, 'for receipt_file in (LOCK, PROJECT if False else LOCK):\n    pass\n', '')
replace_once(verifier, 'print("runtime_checkpoint_pending=true")', 'print("runtime_checkpoint_pending=false")')
replace_once(verifier, 'print("managed_trigger=armed")', 'print("managed_trigger=consumed")')
insert_once(verifier, 'print("application_provider_mode=disabled")\n', 'print("rc8_closed=true")\n')

print("RC8_MANAGED_CLOSURE_PATCH|PASS")
