#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE_MERGE = "6098b71f89d62fa059de298be11a8d9d8539c25e"


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
replace_once(
    lock,
    "| Implementation branch | `integration/rc8-sandbox-payments`, replayed from source checkpoint PR #454 onto the current RC7-closed baseline after this claim merges. |",
    "| Implementation branch | `feat/rc8-managed-sandbox-proof`, based on the merged source checkpoint `main@6098b71f89d62fa059de298be11a8d9d8539c25e`. |",
)
replace_once(
    lock,
    "| Stable baseline | RC5 and RC6 remain closed. RC7 is closed at exact source `47285575862cbf08845eaeabe093afea1ea79bd1` through managed run `30234521983/1` and artifact `8641270327` (`sha256:24da53c0bd6fa885fa4a6814f70af090096192e6c5b7a03c89fba51416877fde`). UIA Issue #354 remains parked/open. Production and participant activation remain disabled. |",
    "| Stable baseline | RC5–RC7 remain closed. RC8 source checkpoint PR #454 is merged at `6098b71f89d62fa059de298be11a8d9d8539c25e`; all provider adapters remain application-runtime disabled. UIA Issue #354 remains parked/open. Production, participant and real-money activation remain disabled. |",
)
replace_once(
    lock,
    "| Current task | RC8 — promote the existing sandbox adapter/reconciliation source checkpoint, then implement least-privilege runtime binding and managed synthetic provider evidence before formal closure. |",
    "| Current task | RC8 — prove MTN MoMo, Stripe and PayPal through one exact-main private synthetic Cloud Run Job, preserve DPO/Airtel/Flutterwave runtime blocks, then reconcile and close the checkpoint. |",
)
replace_once(
    lock,
    "3. Source checkpoint PR #454 must be replayed onto current `main@e4011bc789b3464043d7f5078108c1285a561fdf` without overwriting RC0–RC7 closure evidence and must pass the complete exact-head regression matrix before merge.",
    f"3. Source checkpoint PR #454 was replayed onto the RC8-claimed baseline and merged at `{SOURCE_MERGE}` after the complete exact-head regression matrix passed without overwriting RC0–RC7 closure evidence.",
)
replace_once(
    lock,
    "8. MTN MoMo, DPO, Stripe and PayPal may be proven only against reviewed sandbox/test environments. Airtel remains provider-pending and Flutterwave remains deferred/excluded.",
    "8. Managed proof may bind only the existing reviewed MTN MoMo, Stripe and PayPal sandbox/test credentials. DPO remains source-integrated and externally sandbox-proven but runtime-unbound because no DIREKT private sandbox credential exists; Airtel remains provider-pending and Flutterwave remains deferred/excluded.",
)
replace_once(
    lock,
    "- RC8 — sandbox-only payment-provider adapter closure/reconciliation for already proven MTN, DPO, Stripe and PayPal rails; Airtel remains provider-pending and Flutterwave deferred; real money remains disabled. **CLAIMED — source checkpoint promotion, bounded runtime binding and managed synthetic evidence in progress.**",
    f"- RC8 — sandbox-only payment-provider adapter closure/reconciliation. **CLAIMED — source checkpoint merged at `{SOURCE_MERGE}`; exact-main private managed proof is armed for MTN MoMo, Stripe and PayPal; DPO runtime-unbound, Airtel provider-pending, Flutterwave deferred; real money remains disabled.**",
)

project = "PROJECT_STATUS.md"
replace_once(
    project,
    "- runtime integration closure — **RC1–RC7 are closed at synthetic-only managed boundaries; RC8 sandbox payment source promotion and managed evidence are active**.",
    f"- runtime integration closure — **RC1–RC7 are closed at synthetic-only managed boundaries; RC8 source merged at `{SOURCE_MERGE}` and exact-main managed sandbox evidence is armed**.",
)
replace_once(
    project,
    "RC8 execution order is:\n\n1. replay the reviewed PR #454 source checkpoint onto the current RC7-closed `main`;\n2. require the complete exact-head backend, Android, web, portal, integration, supply-chain and documentation regression matrix before source promotion;\n3. bind only reviewed sandbox/test provider credentials through least-privilege server-side controls;\n4. execute bounded synthetic provider and reconciliation evidence with real money, participant data and production authorization false;\n5. close RC8 only after status/ledger reconciliation, trigger consumption, exact-head regressions and workstream release.",
    f"RC8 source promotion is complete through PR #454 at `{SOURCE_MERGE}`. The active completion order is:\n\n1. verify numeric Secret Manager versions and secret-scoped runtime access for the existing MTN MoMo, Stripe and PayPal sandbox credentials without reading values through CI;\n2. build an immutable exact-main backend image and execute one private synthetic Cloud Run Job;\n3. prove MTN independent success, Stripe unpaid Checkout retrieval, PayPal unapproved-order retrieval, immutable reconciliation, duplicate suppression, mismatch review and two-person adjustment planning;\n4. preserve DPO/Airtel/Flutterwave runtime blocks and keep real money, participant data and production authorization false;\n5. close RC8 only after terminal evidence, status/ledger reconciliation, trigger consumption, exact-head regressions and workstream release.",
)

status = "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
replace_once(
    status,
    "| Synthetic payment adapter | **ACTIVE tests only** | Lifecycle/idempotency testing without real money. |",
    f"| Synthetic payment adapter | **ACTIVE tests only** | Lifecycle/idempotency testing without real money. |\n| RC8 sandbox provider runtime proof | **IMPLEMENTED_GATED / MANAGED PROOF ARMED** | Source PR #454 merged at `{SOURCE_MERGE}`. One exact-main private Cloud Run Job is armed for MTN MoMo, Stripe and PayPal using numeric Secret Manager versions; the application registry remains disabled. DPO is runtime-unbound, Airtel provider-pending and Flutterwave excluded. |",
)
replace_once(
    status,
    "| MTN MoMo Collections API | **SANDBOX_PROVEN / RUNTIME DISABLED** | OAuth, Request to Pay and authoritative status verification succeeded. |",
    "| MTN MoMo Collections API | **SOURCE INTEGRATED / MANAGED PROOF ARMED** | External sandbox proof already succeeded; RC8 now has a fail-closed source adapter and one private exact-main Request-to-Pay/status proof armed. Application runtime remains disabled. |",
)
replace_once(
    status,
    "| DPO Pay / Network | **SANDBOX_PROVEN / RUNTIME DISABLED** | Sandbox create/checkout/verify paid flow succeeded. |",
    "| DPO Pay / Network | **SOURCE INTEGRATED / RUNTIME DISABLED** | External sandbox proof and source adapter exist, but no DIREKT private sandbox credential is provisioned in Secret Manager; RC8 managed runtime binding remains prohibited. |",
)
replace_once(
    status,
    "| Stripe Checkout | **SANDBOX_PROVEN / RUNTIME DISABLED** | Sandbox Checkout/payment verification succeeded. |",
    "| Stripe Checkout | **SOURCE INTEGRATED / MANAGED PROOF ARMED** | External sandbox proof already succeeded; RC8 will create and independently retrieve one unpaid test Checkout without treating browser state as payment truth. Application runtime remains disabled. |",
)
replace_once(
    status,
    "| PayPal | **SANDBOX_PROVEN / RUNTIME DISABLED** | OAuth/order/approval/capture/verification succeeded. |",
    "| PayPal | **SOURCE INTEGRATED / MANAGED PROOF ARMED** | External sandbox proof already succeeded; RC8 will create and independently retrieve one unapproved sandbox order without capture or browser-authoritative payment truth. Application runtime remains disabled. |",
)

ledger = "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
replace_once(
    ledger,
    "### Payment runtime closure still required\n\nThe repository payment port remains intentionally synthetic/disabled. Runtime closure must use provider-neutral adapters and keep real money disabled:",
    f"### RC8 runtime proof — IMPLEMENTED_GATED / MANAGED PROOF ARMED\n\nProvider-neutral adapters and immutable reconciliation were merged through PR #454 at `{SOURCE_MERGE}`. The application payment registry remains intentionally disabled. A one-shot exact-main private Cloud Run Job is armed for the existing MTN MoMo, Stripe and PayPal sandbox credentials; real money remains disabled:",
)
replace_once(
    ledger,
    "No payment provider secret is attached to Cloud Run until adapter/config/runtime allowlist and regression gates are reviewed.",
    "No payment provider secret is attached to the API service or public application runtime. The RC8 proof may attach only pinned numeric MTN, Stripe and PayPal sandbox secret versions to one private temporary Cloud Run Job using the existing runtime service account, followed by enforced job cleanup. DPO, Airtel and Flutterwave remain runtime-unbound.",
)
replace_once(
    ledger,
    "7. RC5 Firebase Test Lab — **ACTIVE RESUMED / NOT CLOSED — IMPLEMENTED_GATED / MANAGED MATRIX PENDING**. Source integration, local instrumentation and least-privilege resources are preserved; final owner-side verification plus exact-current-main managed matrix evidence remain required before closure.",
    "7. RC5 Firebase Test Lab — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX**. Exact source `c3744430a7beb1cd47246d858df9ac1379a068ac`; run `30183466799`; API 26/33/36; zero flaky retries.",
)
replace_once(
    ledger,
    "9. RC7 Google Maps runtime.\n10. RC8 sandbox-only payment adapters/evidence reconciliation.",
    f"9. RC7 Google Maps runtime — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY** through run `30234521983/1`.\n10. RC8 sandbox-only payment adapters/evidence reconciliation — **IMPLEMENTED_GATED / MANAGED PROOF ARMED**; source merged at `{SOURCE_MERGE}`; MTN/Stripe/PayPal private proof pending; DPO/Airtel/Flutterwave runtime disabled.",
)

implementation = "docs/integrations/RC8_SANDBOX_PAYMENTS_IMPLEMENTATION.md"
replace_once(
    implementation,
    "**State:** SOURCE CHECKPOINT READY FOR PROMOTION — runtime binding and managed sandbox evidence remain pending",
    "**State:** IMPLEMENTED_GATED / MANAGED PROOF ARMED",
)
replace_once(
    implementation,
    "This source checkpoint remains fail-closed. It adds no application registration, runtime credential binding, controller route, webhook endpoint, database executor or managed provider transaction. Runtime binding and managed sandbox evidence remain separate RC8 checkpoints.",
    f"The source checkpoint was promoted through PR #454 at `{SOURCE_MERGE}`. It remains fail-closed in the application: no provider is registered as runtime-enabled, no API service secret binding, controller route, webhook endpoint or database executor was introduced. Managed proof is isolated to one private temporary Cloud Run Job.",
)
managed_block = f"""## Managed runtime proof — armed\n\nThe reviewed runtime slice is source-controlled on `feat/rc8-managed-sandbox-proof` from `{SOURCE_MERGE}`. It:\n\n- validates existing Secret Manager containers and pinned numeric versions without reading values through GitHub CI;\n- requires secret-scoped `roles/secretmanager.secretAccessor` only for `direkt-api-runtime`;\n- builds an immutable exact-main backend image;\n- creates one private, synthetic-only Cloud Run Job with zero retries and bounded timeout;\n- activates cloned descriptors only inside the canary process while `PAYMENT_PROVIDER_MODE=disabled` remains true for the application;\n- proves MTN Request to Pay plus independent successful status;\n- proves an unpaid Stripe Checkout and unapproved PayPal order remain `requires_action`;\n- proves append-only success planning, balanced posting, duplicate suppression, mismatch review and immutable two-person refund adjustment planning;\n- emits only sanitized receipts and deletes the temporary job on every outcome.\n\nDPO remains runtime-unbound because no DIREKT private sandbox credential exists. Airtel remains provider-pending. Flutterwave remains deferred/excluded. No PayPal capture, browser approval, real money, participant data, production endpoint, customer-to-provider payment, escrow, wallet, payout or direct ledger mutation is authorized.\n\n"""
insert_once(implementation, "## Merge and runtime gates", managed_block)
replace_once(
    implementation,
    "The source checkpoint may merge only after the replayed exact head passes all applicable repository regressions and review confirms that no provider is runtime-bound. Before any provider adapter becomes executable, a separate least-privilege change must also prove:",
    "The source checkpoint is merged. The managed proof may execute only after the runtime-source exact head passes all applicable repository regressions and the following controls remain enforced:",
)

verifier = "scripts/rc8/verify-payments-contract.py"
replace_once(
    verifier,
    'IMPLEMENTATION = ROOT / "docs/integrations/RC8_SANDBOX_PAYMENTS_IMPLEMENTATION.md"\n',
    'IMPLEMENTATION = ROOT / "docs/integrations/RC8_SANDBOX_PAYMENTS_IMPLEMENTATION.md"\nCANARY = ROOT / "backend/direkt-api/src/commercial/rc8-payment-canary.ts"\nMANAGED_WORKFLOW = ROOT / ".github/workflows/rc8-payments-managed.yml"\nMANAGED_RUNNER = ROOT / "scripts/rc8/run-payments-managed.sh"\nBOOTSTRAP = ROOT / "scripts/rc8/bootstrap-payments-managed.sh"\nTRIGGER = ROOT / "docs/integrations/RC8_PAYMENTS_MANAGED_TRIGGER.md"\n',
)
replace_once(
    verifier,
    'require(IMPLEMENTATION, "runtime binding and managed sandbox evidence remain pending")\n\n',
    f'''require(IMPLEMENTATION, "IMPLEMENTED_GATED / MANAGED PROOF ARMED")\nrequire(IMPLEMENTATION, "private temporary Cloud Run Job")\nrequire(STATUS, "RC8 sandbox provider runtime proof | **IMPLEMENTED_GATED / MANAGED PROOF ARMED**")\nrequire(LEDGER, "RC8 runtime proof — IMPLEMENTED_GATED / MANAGED PROOF ARMED")\nrequire(CANARY, "RC8_PAYMENT_CANARY_APPROVED")\nrequire(CANARY, "PAYMENT_PROVIDER_MODE !== 'disabled'")\nrequire(CANARY, "runtimeEnabled: true")\nrequire(CANARY, "MtnMomoSandboxPaymentProviderAdapter")\nrequire(CANARY, "StripeSandboxPaymentProviderAdapter")\nrequire(CANARY, "PayPalSandboxPaymentProviderAdapter")\nrequire(CANARY, "reconcileSandboxPaymentObservation")\nrequire(CANARY, "captureAttempted: false")\nrequire(CANARY, "dpoRuntimeBound: false")\nrequire(CANARY, "RC8_PAYMENTS_CANARY|PASS")\nrequire(CANARY, "RC8_PAYMENTS_RECEIPT|")\nreject(CANARY, ".completeAction(")\nrequire(MANAGED_WORKFLOW, "push:")\nrequire(MANAGED_WORKFLOW, "branches:\\n      - main")\nrequire(MANAGED_WORKFLOW, "google-github-actions/auth@v3")\nrequire(MANAGED_WORKFLOW, "test \"$(git rev-parse origin/main)\" = \"${{SOURCE_SHA}}\"")\nrequire(MANAGED_WORKFLOW, "bash scripts/rc8/run-payments-managed.sh")\nrequire(MANAGED_RUNNER, "--max-retries 0")\nrequire(MANAGED_RUNNER, "--set-secrets")\nrequire(MANAGED_RUNNER, "direkt-stripe-sandbox-secret-key:${{stripe_version}}")\nrequire(MANAGED_RUNNER, "cleanup.cloud_run_job_deleted=true")\nrequire(MANAGED_RUNNER, "PAYMENT_PROVIDER_MODE=disabled")\nrequire(MANAGED_RUNNER, "dpo_runtime_bound=false")\nrequire(BOOTSTRAP, "roles/secretmanager.secretAccessor")\nrequire(BOOTSTRAP, "roles/secretmanager.viewer")\nrequire(BOOTSTRAP, "RC8_PAYMENTS_BOOTSTRAP|PASS")\nreject(BOOTSTRAP, "secrets versions access")\nreject(BOOTSTRAP, "secrets versions add")\nreject(BOOTSTRAP, "roles/secretmanager.admin --quiet")\nrequire(TRIGGER, "STATUS=ARMED")\nrequire(TRIGGER, "CONFIRMATION=RUN-DIREKT-RC8-PAYMENTS-MANAGED")\n\n''',
)
replace_once(
    verifier,
    'print("runtime_checkpoint_pending=true")\n',
    'print("runtime_checkpoint_pending=true")\nprint("managed_runtime_source=true")\nprint("managed_trigger=armed")\nprint("application_provider_mode=disabled")\n',
)

print("RC8_MANAGED_SOURCE_PATCH|PASS")
