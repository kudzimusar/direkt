#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[2]
lock = root / "WORKSTREAM_LOCK.md"
text = lock.read_text(encoding="utf-8")
replacements = {
    "| Status | RELEASED — RC11 CLOSED AND PRESERVED |": "| Status | CLAIMED — PHASE 11C–11J EXECUTION READINESS |",
    "| Owner/agent | None. Runtime integration closure is complete. |": "| Owner/agent | Active repository agent — Issue #112 Phase 11 primary-pilot readiness. |",
    "| Authorized scope | No active repository write scope. A new explicit claim is required for Phase 11C–11J preparation or any later source change. |": "| Authorized scope | Build the canonical 11C–11J wave protocol, blocker/evidence registers, metrics, stop rules, correction intake and exit-decision instruments. No real participant recruitment, data processing or provider activation. |",
    "| Implementation branch | None. RC11 implementation PR #505 merged at `87f567fccfa92244c7951432436c7163c71d5fc7`. |": "| Implementation branch | `phase11/primary-pilot-readiness`, based on `main@321e74f56e48f239011fe1bba4d430e360709bc4`. |",
    "| Stable baseline | `main@87f567fccfa92244c7951432436c7163c71d5fc7` contains the reviewed RC11A–RC11C reconciliation and immutable RC0–RC10 closure evidence. |": "| Stable baseline | `main@321e74f56e48f239011fe1bba4d430e360709bc4` contains closed RC0–RC11 evidence and the released integration programme. |",
    "| Current task | None. Phase 11C–11J execution preparation is next but unclaimed; real participant execution remains blocked by the Phase 11 entry gates. |": "| Current task | Phase 11C–11J execution-readiness package only. `PILOT_ENTRY_APPROVED` remains false and the PRIMARY-PILOT evidence register remains empty. |",
    "| Governing issue | Issue #261 — completed by RC11 closure. Phase 11 remains governed by Issue #112; UIA Issue #354 remains separately open. |": "| Governing issue | Issue #112 — Phase 11 controlled Zambia pilot and primary validation. Issue #261 remains closed; UIA Issue #354 remains separately open. |",
    "The repository write lane is RELEASED. RC0–RC11 evidence remains immutable/regression-protected. Phase 11C–11J preparation or any later source work requires a new explicit claim. Real-money, participant and production authorization remain blocked.": "The repository write lane is CLAIMED for Phase 11C–11J execution readiness only. RC0–RC11 evidence remains immutable/regression-protected. Real participants, real participant data, real money and production authorization remain blocked until the explicit Phase 11 entry checklist is satisfied."
}
for old, new in replacements.items():
    if old not in text:
        raise SystemExit(f"missing expected Phase 11 claim source: {old}")
    text = text.replace(old, new, 1)
lock.write_text(text, encoding="utf-8")
print("PHASE11_PRIMARY_PILOT_READINESS_CLAIM_PATCH|PASS")
