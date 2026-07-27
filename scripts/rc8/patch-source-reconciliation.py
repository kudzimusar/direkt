#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = "54d0129027b7f324272c4bcc94a0f2109318fd18"


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise AssertionError(f"{path}: expected one occurrence, found {count}: {old!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


doc = "docs/integrations/RC8_SANDBOX_PAYMENTS_IMPLEMENTATION.md"
replace_once(
    doc,
    "**Governing issue:** #261  \n**Branch:** `integration/rc8-sandbox-payments`  \n**Base:** `main@b6d4a204ff8493e826f28c7dd27f71c993d213a3`  \n**State:** RC8A foundation green; RC8B MTN green; RC8C Stripe, PayPal and DPO green; RC8D reconciliation source green; RC7 managed proof remains open in parallel",
    f"**Governing issue:** #261\n**Branch:** `integration/rc8-sandbox-payments`\n**Replayed base:** `main@{BASE}`\n**State:** SOURCE CHECKPOINT READY FOR PROMOTION — runtime binding and managed sandbox evidence remain pending",
)
replace_once(
    doc,
    "## Sequencing exception\n\nThe owner explicitly authorized RC8 source development while RC7 managed Maps proof remains pending. This does not close RC7. RC8 stays isolated from `main` until merging cannot invalidate RC7's exact-main evidence.\n\nWhen RC7 posts a terminal result, the repository must immediately preserve failure evidence and repair it, or promote the PASS and cleanup receipt, consume the RC7 trigger, reconcile the ledger/status documents and then complete the RC8 handoff.\n\n",
    f"## Source replay receipt\n\nRC7 closed through PR #487, and RC8 became the sole bounded repository lane through PR #488. The original PR #454 source checkpoint was replayed losslessly as one commit over `main@{BASE}`: all 16 net RC8 files were preserved, while stale pre-RC7 history was removed.\n\nThis source checkpoint remains fail-closed. It adds no application registration, runtime credential binding, controller route, webhook endpoint, database executor or managed provider transaction. Runtime binding and managed sandbox evidence remain separate RC8 checkpoints.\n\n",
)
replace_once(
    doc,
    "RC8 source may be reviewed and tested in parallel, but no RC8 merge or managed provider execution may invalidate RC7 exact-main proof. Before any provider adapter becomes executable, the change must also prove:",
    "The source checkpoint may merge only after the replayed exact head passes all applicable repository regressions and review confirms that no provider is runtime-bound. Before any provider adapter becomes executable, a separate least-privilege change must also prove:",
)

verifier = "scripts/rc8/verify-payments-contract.py"
replace_once(
    verifier,
    'LEDGER = ROOT / "docs/integrations/LIVE_INTEGRATION_LEDGER.md"\n',
    'LEDGER = ROOT / "docs/integrations/LIVE_INTEGRATION_LEDGER.md"\nLOCK = ROOT / "WORKSTREAM_LOCK.md"\nIMPLEMENTATION = ROOT / "docs/integrations/RC8_SANDBOX_PAYMENTS_IMPLEMENTATION.md"\n',
)
replace_once(
    verifier,
    'for provider in ("mtn_momo", "airtel_money", "dpo", "stripe", "paypal"):\n    require(PORT, f"\'{provider}\'")\n    require(REGISTRY, f"{provider}:")\n\n',
    f'''for provider in ("mtn_momo", "airtel_money", "dpo", "stripe", "paypal"):\n    require(PORT, f"'{{provider}}'")\n    require(REGISTRY, f"{{provider}}:")\n\nrequire(LOCK, "CLAIMED — RC8 sandbox payment runtime closure")\nrequire(LOCK, "RC8 implementation contract — CLAIMED")\nrequire(LOCK, "RC8 is the sole active repository write lane")\nrequire(IMPLEMENTATION, "SOURCE CHECKPOINT READY FOR PROMOTION")\nrequire(IMPLEMENTATION, "Replayed base: `main@{BASE}`")\nrequire(IMPLEMENTATION, "runtime binding and managed sandbox evidence remain pending")\n\n''',
)
replace_once(
    verifier,
    'print("participant_data=false")\n',
    'print("participant_data=false")\nprint("source_checkpoint_replayed=true")\nprint("runtime_checkpoint_pending=true")\n',
)

print("RC8_SOURCE_RECONCILIATION_PATCH|PASS")
