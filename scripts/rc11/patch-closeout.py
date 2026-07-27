#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"RC11 closeout missing expected text in {path.relative_to(ROOT)}: {old}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")

lock = ROOT / "WORKSTREAM_LOCK.md"
for old, new in (
    ("| Status | CLAIMED — RC11 FINAL INTEGRATION CLOSURE |", "| Status | RELEASED — RC11 CLOSED AND PRESERVED |"),
    ("| Owner/agent | Active repository agent — Issue #261 RC11 final integration closure. |", "| Owner/agent | None. Runtime integration closure is complete. |"),
    ("| Authorized scope | RC11A combined regression, RC11B managed evidence index, RC11C ledger/status reconciliation and RC11D closure/handoff only. No new provider activation or participant processing. |", "| Authorized scope | No active repository write scope. A new explicit claim is required for Phase 11C–11J preparation or any later source change. |"),
    ("| Implementation branch | `docs/rc11-final-integration-closure`, based on RC11 claim merge `main@7f0b6b76a78572b6bb90694814037c370935e3b9`. |", "| Implementation branch | None. RC11 implementation PR #505 merged at `87f567fccfa92244c7951432436c7163c71d5fc7`. |"),
    ("| Stable baseline | `main@7f0b6b76a78572b6bb90694814037c370935e3b9` contains the reviewed RC11 claim and immutable RC0–RC10 closure evidence. |", "| Stable baseline | `main@87f567fccfa92244c7951432436c7163c71d5fc7` contains the reviewed RC11A–RC11C reconciliation and immutable RC0–RC10 closure evidence. |"),
    ("| Current task | RC11A–RC11C reconciliation implemented; exact-head regression and RC11D closure/handoff remain pending. |", "| Current task | None. Phase 11C–11J execution preparation is next but unclaimed; real participant execution remains blocked by the Phase 11 entry gates. |"),
    ("| Governing issue | Issue #261 — Runtime integration closure after W8. RC11 is the sole active repository write lane; UIA Issue #354 remains parked/read-only. |", "| Governing issue | Issue #261 — completed by RC11 closure. Phase 11 remains governed by Issue #112; UIA Issue #354 remains separately open. |"),
    ("## RC11 implementation contract — CLAIMED", "## RC11 implementation contract — CLOSED AND PRESERVED"),
    ("10. The clean handoff names Phase 11C–11J execution preparation as next, but real pilot activity remains prohibited until the Phase 11 entry checklist is genuinely satisfied.", "10. RC11 is `CLOSED — FINAL INTEGRATION RECONCILIATION / LANE RELEASED`: PR #505 exact head `66626d315a8d132dbf8f34749a2679e42c609d7c` passed the complete combined matrix and squash-merged at `87f567fccfa92244c7951432436c7163c71d5fc7`. The clean handoff names Phase 11C–11J execution preparation as next, while real pilot activity remains prohibited until the Phase 11 entry checklist is genuinely satisfied."),
    ("- RC11 — combined integration regression, managed evidence index, live ledger/status reconciliation and lane release. **IMPLEMENTED — RC11A–RC11C RECONCILED / EXACT-HEAD REGRESSION AND RC11D CLOSEOUT PENDING.**", "- RC11 — combined integration regression, managed evidence index, live ledger/status reconciliation and lane release. **CLOSED — FINAL INTEGRATION RECONCILIATION / LANE RELEASED — PR #505 head `66626d315a8d132dbf8f34749a2679e42c609d7c`, merge `87f567fccfa92244c7951432436c7163c71d5fc7`.**"),
    ("The repository write lane is CLAIMED by RC11 final integration closure. RC0–RC10 evidence remains immutable/regression-protected, UIA Issue #354 remains parked/read-only, and no overlapping Phase 11 participant or later source work may begin until RC11 releases or formally hands off the lane. Real-money, participant and production authorization remain blocked.", "The repository write lane is RELEASED. RC0–RC11 evidence remains immutable/regression-protected. Phase 11C–11J preparation or any later source work requires a new explicit claim. Real-money, participant and production authorization remain blocked.")
):
    replace(lock, old, new)

project = ROOT / "PROJECT_STATUS.md"
replace(project, "**Active repository write lane:** RC11 final integration closure under Issue #261", "**Active repository write lane:** none; RC0–RC11 are closed")
replace(project,
    "- runtime integration closure — **RC1–RC10 are closed at their documented bounded boundaries. RC11 final reconciliation is implemented with a managed evidence index and truthful blocked/provider-state preservation; exact-head regression and closeout remain pending.**",
    "- runtime integration closure — **RC0–RC11 are closed. The final managed evidence index, combined regressions and truthful blocked/provider-state reconciliation are preserved; the repository write lane is released.**")
replace(project,
    "RC10 is closed on implementation PR #502 exact head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`, squash-merged at `620a99ba5465ad38ce012df0a8fa15e458de6505`. RC11 is the sole active lane: its final evidence/status reconciliation is implemented, but closure still requires exact-head regression, receipt promotion, Issue #261 completion and lane release. Real Phase 11 evidence remains externally gated.",
    "RC10 is closed on implementation PR #502 exact head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`, squash-merged at `620a99ba5465ad38ce012df0a8fa15e458de6505`. RC11 closed through PR #505 exact head `66626d315a8d132dbf8f34749a2679e42c609d7c`, squash-merged at `87f567fccfa92244c7951432436c7163c71d5fc7`. The integration lane is released; Phase 11C–11J execution preparation is next but unclaimed, and real Phase 11 evidence remains externally gated.")

status = ROOT / "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
replace(status,
    "13. RC11 combined integration regression/evidence index/lane release — **RC11 IMPLEMENTED — FINAL RECONCILIATION / REGRESSION PENDING**; managed evidence index and blocked/provider-state reconciliation are complete, while exact-head matrix, closure receipt and lane release remain pending.",
    "13. RC11 combined integration regression/evidence index/lane release — **CLOSED — FINAL INTEGRATION RECONCILIATION / LANE RELEASED**; PR #505 exact head `66626d315a8d132dbf8f34749a2679e42c609d7c`, merge `87f567fccfa92244c7951432436c7163c71d5fc7`; managed evidence index and truthful blocked/provider-state reconciliation preserved.")

ledger = ROOT / "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
replace(ledger,
    "13. RC11 full combined regression and lane release — **IMPLEMENTED — EXACT-HEAD REGRESSION AND CLOSEOUT PENDING**. `RC11_MANAGED_EVIDENCE_INDEX.md` records RC0–RC10 evidence and retained blocked/provider states; the permanent RC11 verifier and exact-head matrix must pass before release.",
    "13. RC11 full combined regression and lane release — **CLOSED — FINAL INTEGRATION RECONCILIATION / LANE RELEASED**. PR #505 exact head `66626d315a8d132dbf8f34749a2679e42c609d7c` passed the complete matrix and merged at `87f567fccfa92244c7951432436c7163c71d5fc7`; `RC11_MANAGED_EVIDENCE_INDEX.md` and `RC11_CLOSURE_RECEIPT.md` are canonical.")
replace(ledger, "New state: IMPLEMENTED — EXACT-HEAD REGRESSION AND CLOSEOUT PENDING", "New state: CLOSED — FINAL INTEGRATION RECONCILIATION / LANE RELEASED")
replace(ledger, "Next exact step: pass the exact final-head matrix, publish RC11D closure receipt, close Issue #261 and release the lane to Phase 11C–11J execution preparation", "Next exact step: separately claim Phase 11C–11J execution preparation under Issue #112; do not start real participants until every hard entry gate passes")

index = ROOT / "docs/integrations/RC11_MANAGED_EVIDENCE_INDEX.md"
replace(index, "**State:** RC11B COMPLETE / RC11A AND RC11D EXACT-HEAD CLOSURE PENDING", "**State:** CLOSED — RC11A–RC11D COMPLETE / LANE RELEASED")
replace(index, "RC11 closure still requires the permanent verifier and applicable full matrix to pass on the exact final reconciliation head.", "RC11 closure is bound to PR #505 exact head `66626d315a8d132dbf8f34749a2679e42c609d7c`, whose applicable permanent matrix passed before merge `87f567fccfa92244c7951432436c7163c71d5fc7`.")

record = ROOT / "docs/integrations/RC11_RECONCILIATION_RECORD.md"
replace(record, "**State:** IMPLEMENTED — EXACT-HEAD REGRESSION AND CLOSEOUT PENDING", "**State:** CLOSED — FINAL INTEGRATION RECONCILIATION / LANE RELEASED")
replace(record, "The final reconciliation head must independently pass the applicable permanent matrix before RC11 can close.", "The exact final reconciliation head `66626d315a8d132dbf8f34749a2679e42c609d7c` passed the applicable permanent matrix before merge `87f567fccfa92244c7951432436c7163c71d5fc7`.")

verifier = ROOT / "scripts/rc11/verify-final-integration-closure.py"
text = verifier.read_text(encoding="utf-8")
text = text.replace('RECORD = ROOT / "docs/integrations/RC11_RECONCILIATION_RECORD.md"', 'RECORD = ROOT / "docs/integrations/RC11_RECONCILIATION_RECORD.md"\nCLOSURE = ROOT / "docs/integrations/RC11_CLOSURE_RECEIPT.md"', 1)
text = text.replace('for path in (LOCK, PROJECT, STATUS, LEDGER, PLAN, INDEX, RECORD):', 'for path in (LOCK, PROJECT, STATUS, LEDGER, PLAN, INDEX, RECORD, CLOSURE):', 1)
old_block = '''for needle in (
    "CLAIMED — RC11 FINAL INTEGRATION CLOSURE",
    "RC11 implementation contract — CLAIMED",
    "RC11A combined regression",
    "RC11B managed evidence index",
    "RC11C ledger/status reconciliation",
    "RC11D closure/handoff",
    "No new provider activation or participant processing",
):
    require(LOCK, needle)

require(PROJECT, "Active repository write lane:** RC11 final integration closure")
require(PROJECT, "RC1–RC10 are closed")
require(PROJECT, "RC11 final reconciliation is implemented")
require(STATUS, "RC11 IMPLEMENTED — FINAL RECONCILIATION / REGRESSION PENDING")
require(LEDGER, "RC11 final integration reconciliation")
require(LEDGER, "New state: IMPLEMENTED — EXACT-HEAD REGRESSION AND CLOSEOUT PENDING")
'''
new_block = '''for needle in (
    "RELEASED — RC11 CLOSED AND PRESERVED",
    "RC11 implementation contract — CLOSED AND PRESERVED",
    "RC11A combined regression",
    "RC11B managed evidence index",
    "RC11C ledger/status reconciliation",
    "RC11D closure/handoff",
    "The repository write lane is RELEASED",
):
    require(LOCK, needle)

require(PROJECT, "Active repository write lane:** none; RC0–RC11 are closed")
require(PROJECT, "runtime integration closure — **RC0–RC11 are closed")
require(STATUS, "CLOSED — FINAL INTEGRATION RECONCILIATION / LANE RELEASED")
require(LEDGER, "RC11 final integration reconciliation")
require(LEDGER, "New state: CLOSED — FINAL INTEGRATION RECONCILIATION / LANE RELEASED")
'''
if old_block not in text:
    raise SystemExit("RC11 verifier state block did not match")
text = text.replace(old_block, new_block, 1)
text = text.replace('"RC11B COMPLETE / RC11A AND RC11D EXACT-HEAD CLOSURE PENDING",', '"CLOSED — RC11A–RC11D COMPLETE / LANE RELEASED",', 1)
text = text.replace('"IMPLEMENTED — EXACT-HEAD REGRESSION AND CLOSEOUT PENDING",', '"CLOSED — FINAL INTEGRATION RECONCILIATION / LANE RELEASED",', 1)
insert = '''
for needle in (
    "State:** CLOSED — FINAL INTEGRATION RECONCILIATION / LANE RELEASED",
    "Implementation PR/head:** #505 / `66626d315a8d132dbf8f34749a2679e42c609d7c`",
    "Implementation merge:** `87f567fccfa92244c7951432436c7163c71d5fc7`",
    "30283944687",
    "30283948914",
    "30283946774",
    "Phase 11C–11J execution preparation",
):
    require(CLOSURE, needle)
'''
text = text.replace('\nprint("RC11_FINAL_INTEGRATION_CONTRACT|PASS")', insert + '\nprint("RC11_FINAL_INTEGRATION_CONTRACT|PASS")', 1)
text = text.replace('print("state=implemented_regression_pending")', 'print("state=closed")\nprint("workstream_lane=released")', 1)
verifier.write_text(text, encoding="utf-8")

print("RC11_CLOSEOUT_PATCH|PASS")
