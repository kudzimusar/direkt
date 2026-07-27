#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[2]
lock = root / "WORKSTREAM_LOCK.md"
text = lock.read_text(encoding="utf-8")
replacements = {
    "| Status | RELEASED — RC10 CLOSED AND PRESERVED |": "| Status | CLAIMED — RC11 FINAL INTEGRATION CLOSURE |",
    "| Owner/agent | None. RC10 is closed; RC11 remains unclaimed. |": "| Owner/agent | Active repository agent — Issue #261 RC11 final integration closure. |",
    "| Authorized scope | No active repository write scope. A new explicit claim is required before RC11 or any other source change. |": "| Authorized scope | RC11A combined regression, RC11B managed evidence index, RC11C ledger/status reconciliation and RC11D closure/handoff only. No new provider activation or participant processing. |",
    "| Implementation branch | None. RC10 implementation PR #502 merged at `620a99ba5465ad38ce012df0a8fa15e458de6505`. |": "| Implementation branch | `chore/rc11-final-integration-closure`, based on `main@feead13e1650e8326f86c372ab4be2b8c9bf544b`. |",
    "| Stable baseline | `main@620a99ba5465ad38ce012df0a8fa15e458de6505` contains the reviewed RC10 implementation; this closeout preserves that exact bounded result and releases the lane. |": "| Stable baseline | `main@feead13e1650e8326f86c372ab4be2b8c9bf544b` contains closed RC0–RC10 evidence and the RC10 closeout receipt. |",
    "| Current task | None. RC11 combined integration reconciliation is next but unclaimed. |": "| Current task | RC11A–RC11D — prove combined regressions, index managed evidence, reconcile truthful statuses and hand off cleanly to Phase 11 real-pilot preparation. |",
    "| Governing issue | Issue #261 — Runtime integration closure after W8. RC10 is closed; UIA Issue #354 remains parked/read-only. |": "| Governing issue | Issue #261 — Runtime integration closure after W8. RC11 is the sole active repository write lane; UIA Issue #354 remains parked/read-only. |",
    "- RC11 — combined integration regression, managed evidence index, live ledger/status reconciliation and lane release. **NEXT BUT UNCLAIMED.**": "- RC11 — combined integration regression, managed evidence index, live ledger/status reconciliation and lane release. **CLAIMED — RC11A–RC11D IN PROGRESS from `main@feead13e1650e8326f86c372ab4be2b8c9bf544b`.**",
    "The repository write lane is RELEASED. RC0–RC10 evidence remains immutable/regression-protected, UIA Issue #354 remains parked/read-only, and RC11 or any later source work must not begin until a new explicit claim is recorded from current `main`. Real-money, participant and production authorization remain blocked.": "The repository write lane is CLAIMED by RC11 final integration closure. RC0–RC10 evidence remains immutable/regression-protected, UIA Issue #354 remains parked/read-only, and no overlapping Phase 11 participant or later source work may begin until RC11 releases or formally hands off the lane. Real-money, participant and production authorization remain blocked."
}
for old, new in replacements.items():
    if old not in text:
        raise SystemExit(f"missing expected RC11 claim source: {old}")
    text = text.replace(old, new, 1)
lock.write_text(text, encoding="utf-8")
print("RC11_CLAIM_PATCH|PASS")
