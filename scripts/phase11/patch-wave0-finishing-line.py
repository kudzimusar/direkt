#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Wave 0 publisher missing expected text in {path.relative_to(ROOT)}: {old}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


lock = ROOT / "WORKSTREAM_LOCK.md"
replace(
    lock,
    "| Implementation branch | `phase11/wave0-finishing-line`, based on exact `main@b02ae4ea2d6136b2122e978177ccc4957e167f34`. |",
    "| Implementation branch | `phase11/wave0-finishing-line-implementation`, based on claim merge `main@6b9e7cabeebd5ade9b998b8a54bcd2c888e6bfe4`. |",
)
replace(
    lock,
    "| Stable baseline | `main@b02ae4ea2d6136b2122e978177ccc4957e167f34` contains the reviewed Phase 11C–11J readiness package, exact closeout receipt and closed RC0–RC11 evidence. |",
    "| Stable baseline | `main@6b9e7cabeebd5ade9b998b8a54bcd2c888e6bfe4` contains the verified Wave 0 claim, reviewed Phase 11C–11J readiness package and closed RC0–RC11 evidence. |",
)
replace(
    lock,
    "| Current task | Wave 0 finishing-line reconciliation only. `PILOT_ENTRY_APPROVED` remains false and PRIMARY-PILOT evidence count remains 0 unless actual external authority and owner evidence is supplied and separately approved. |",
    "| Current task | Wave 0 finishing-line controls implemented; exact-head technical preflight, terminal receipt binding and lane release remain pending. Current decision is `ENTRY_BLOCKED_EXTERNAL`; `PILOT_ENTRY_APPROVED` remains false and PRIMARY-PILOT evidence count remains 0. |",
)

project = ROOT / "PROJECT_STATUS.md"
replace(
    project,
    "- Phase 11 11C–11J execution-readiness package — **CLOSED AND PRESERVED — EXECUTION READY / REAL ENTRY BLOCKED / NO PRIMARY-PILOT EVIDENCE**;",
    "- Phase 11 11C–11J execution-readiness package — **CLOSED AND PRESERVED — EXECUTION READY / REAL ENTRY BLOCKED / NO PRIMARY-PILOT EVIDENCE**;\n- Phase 11 Wave 0 finishing-line controls — **IMPLEMENTED / EXACT-HEAD PREFLIGHT PENDING / ENTRY_BLOCKED_EXTERNAL**;",
)
replace(
    project,
    "The lane is released; real entry and all PRIMARY-PILOT evidence remain externally blocked.",
    "Wave 0 is the active lane from claim merge `6b9e7cabeebd5ade9b998b8a54bcd2c888e6bfe4`. The deterministic evidence manifest, official-source research, gate evaluator, technical preflight, owner action packet and blocked terminal receipt are implemented; exact-head proof and closeout remain pending. Real entry and all PRIMARY-PILOT evidence remain externally blocked.",
)

control = ROOT / "docs/phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md"
replace(
    control,
    "## Phase 12 boundary",
    """## Wave 0 finishing-line reconciliation

The repository now also contains a deterministic terminal control package:

- `PHASE11_WAVE0_OFFICIAL_SOURCE_EVIDENCE_2026-07-28.md` — current official-source DPC, Data Protection Act, CCPC and Firebase evidence without false legal authority;
- `PHASE11_WAVE0_EVIDENCE_MANIFEST.schema.json` and `PHASE11_WAVE0_EVIDENCE_MANIFEST.json` — exact gate inventory, accountable evidence fields and machine-readable terminal state;
- `PHASE11_WAVE0_OWNER_ACTION_PACKET.md` — only the regulator, counsel, owner and protected-console actions that cannot be completed by repository automation;
- `PHASE11_WAVE0_TECHNICAL_PREFLIGHT.md` — one exact-head technical acceptance contract;
- `PHASE11_WAVE0_TERMINAL_RECEIPT.md` — truthful terminal `ENTRY_BLOCKED_EXTERNAL` receipt;
- `evaluate-wave0-gates.py` and `verify-wave0-finishing-line.py` — fail-closed permanent enforcement.

The current hard-gate result is `ENTRY_BLOCKED_EXTERNAL`. Repository work has not supplied an entity-specific DPC registration outcome, overseas storage/transfer authorization, qualified Zambia legal/consumer review, final approved notice/lifecycle schedule, signed Wave 1 authorization, approved Firebase Zambia console receipt or authorized real-environment canaries. Therefore `PILOT_ENTRY_APPROVED` remains false, PRIMARY-PILOT evidence remains zero and Phase 11 is not closed.

## Phase 12 boundary""",
)

blockers = ROOT / "docs/phase11/PHASE11_REAL_ENTRY_BLOCKER_REGISTER_2026-07-28.md"
replace(
    blockers,
    "**`PILOT_ENTRY_APPROVED`:** false",
    "**`PILOT_ENTRY_APPROVED`:** false  \n**Wave 0 terminal decision:** `ENTRY_BLOCKED_EXTERNAL`  \n**Machine-readable register:** `PHASE11_WAVE0_EVIDENCE_MANIFEST.json`  \n**Official-source refresh:** `PHASE11_WAVE0_OFFICIAL_SOURCE_EVIDENCE_2026-07-28.md`",
)
replace(
    blockers,
    "No gate may be changed to `CLOSED` using an agent-generated assertion alone.",
    "No gate may be changed to `CLOSED` using an agent-generated assertion alone. The permanent evaluator requires authority, reference, SHA-256, exact scope, accountable owner and decision time for every closed gate; P11-G03 through P11-G06 additionally require independent review. Until those fields are supported by actual evidence, the terminal decision remains `ENTRY_BLOCKED_EXTERNAL`.",
)

print("PHASE11_WAVE0_FINISHING_LINE_PATCH|PASS")
