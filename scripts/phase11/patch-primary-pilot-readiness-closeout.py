#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Phase 11 readiness closeout missing text in {path.relative_to(ROOT)}: {old}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


def normalize(path: Path) -> None:
    lines = path.read_text(encoding="utf-8").splitlines()
    path.write_text("\n".join(line.rstrip() for line in lines) + "\n", encoding="utf-8")


lock = ROOT / "WORKSTREAM_LOCK.md"
for old, new in (
    ("| Status | CLAIMED — PHASE 11C–11J EXECUTION READINESS |", "| Status | RELEASED — PHASE 11C–11J READINESS CLOSED AND PRESERVED |"),
    ("| Owner/agent | Active repository agent — Issue #112 Phase 11 primary-pilot readiness. |", "| Owner/agent | None. Phase 11C–11J execution readiness is closed; Issue #112 remains open for real entry and participant-backed evidence. |"),
    ("| Authorized scope | Build the canonical 11C–11J wave protocol, blocker/evidence registers, metrics, stop rules, correction intake and exit-decision instruments. No real participant recruitment, data processing or provider activation. |", "| Authorized scope | No active repository write scope. A new explicit claim is required for Wave 0 real-entry evidence reconciliation or any later source change. |"),
    ("| Implementation branch | `phase11/primary-pilot-readiness`, based on readiness claim merge `main@e79d8c4794c27ee16deaefdb56856d97cd5933a5`. |", "| Implementation branch | None. Phase 11 readiness PR #508 merged at `2bf58c2c5df40aa76742730ec4a49644c2506a89`. |"),
    ("| Stable baseline | `main@e79d8c4794c27ee16deaefdb56856d97cd5933a5` contains closed RC0–RC11 evidence and the formal Phase 11C–11J readiness claim. |", "| Stable baseline | `main@2bf58c2c5df40aa76742730ec4a49644c2506a89` contains the reviewed Phase 11C–11J execution-readiness package and closed RC0–RC11 evidence. |"),
    ("| Current task | Phase 11C–11J execution-readiness package implemented; exact-head regression, status promotion and handoff remain pending. `PILOT_ENTRY_APPROVED` remains false and the PRIMARY-PILOT evidence register remains empty. |", "| Current task | None. Wave 0 real-entry evidence reconciliation is next but unclaimed. `PILOT_ENTRY_APPROVED` remains false and PRIMARY-PILOT evidence count remains 0. |"),
    ("| Governing issue | Issue #112 — Phase 11 controlled Zambia pilot and primary validation. Issue #261 remains closed; UIA Issue #354 remains separately open. |", "| Governing issue | Issue #112 remains open for external entry gates, Wave 0 authorization, real 11C–11H evidence, 11I corrections and 11J decision. |"),
    ("## Phase 11C–11J execution-readiness contract — CLAIMED", "## Phase 11C–11J execution-readiness contract — CLOSED AND PRESERVED"),
    ("10. Closure requires authoritative status reconciliation, permanent verifier success, exact-head regression and an Issue #112 handoff that clearly states execution ready but real entry blocked.", "10. The readiness package is `CLOSED — EXECUTION READY / REAL ENTRY BLOCKED / NO PRIMARY-PILOT EVIDENCE`: PR #508 exact head `ae4fcb0350be4023f82e2be8df88c18cca583695` passed the complete preserved matrix and squash-merged at `2bf58c2c5df40aa76742730ec4a49644c2506a89`. Issue #112 remains open; Wave 0 real-entry evidence reconciliation requires a new explicit claim."),
    ("The repository write lane is CLAIMED for Phase 11C–11J execution readiness only. RC0–RC11 evidence remains immutable/regression-protected. Real participants, real participant data, real money and production authorization remain blocked until the explicit Phase 11 entry checklist is satisfied.", "The repository write lane is RELEASED. RC0–RC11 and Phase 11C–11J readiness evidence remain immutable/regression-protected. Wave 0 real-entry evidence reconciliation requires a new explicit claim. Real participants, real participant data, real money and production authorization remain blocked until the explicit Phase 11 entry checklist is satisfied.")
):
    replace(lock, old, new)

project = ROOT / "PROJECT_STATUS.md"
replace(project, "**Active repository write lane:** Phase 11C–11J execution readiness under Issue #112", "**Active repository write lane:** none; Phase 11C–11J readiness is closed and Wave 0 real-entry evidence reconciliation is next but unclaimed")
replace(project, "- Phase 11 11C–11J execution package — **EXECUTION READY / REAL ENTRY BLOCKED / NO PRIMARY-PILOT EVIDENCE**;", "- Phase 11 11C–11J execution-readiness package — **CLOSED AND PRESERVED — EXECUTION READY / REAL ENTRY BLOCKED / NO PRIMARY-PILOT EVIDENCE**;")
replace(project,
    "RC10 is closed on implementation PR #502 exact head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`, squash-merged at `620a99ba5465ad38ce012df0a8fa15e458de6505`. RC11 closed through PR #505 exact head `66626d315a8d132dbf8f34749a2679e42c609d7c`, squash-merged at `87f567fccfa92244c7951432436c7163c71d5fc7`. Phase 11C–11J execution readiness is the active repository lane from claim merge `e79d8c4794c27ee16deaefdb56856d97cd5933a5`; the operating instruments are implemented, but real entry and all primary evidence remain externally blocked.",
    "RC10 is closed on implementation PR #502 exact head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`, squash-merged at `620a99ba5465ad38ce012df0a8fa15e458de6505`. RC11 closed through PR #505 exact head `66626d315a8d132dbf8f34749a2679e42c609d7c`, squash-merged at `87f567fccfa92244c7951432436c7163c71d5fc7`. Phase 11C–11J execution readiness closed through PR #508 exact head `ae4fcb0350be4023f82e2be8df88c18cca583695`, squash-merged at `2bf58c2c5df40aa76742730ec4a49644c2506a89`. The lane is released; real entry and all PRIMARY-PILOT evidence remain externally blocked."
)

control = ROOT / "docs/phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md"
replace(control, "**Status:** PRIMARY-PILOT EXECUTION READINESS IMPLEMENTED — REAL PARTICIPANT PILOT STILL EXTERNALLY BLOCKED", "**Status:** PRIMARY-PILOT EXECUTION READINESS CLOSED AND PRESERVED — REAL PARTICIPANT PILOT STILL EXTERNALLY BLOCKED")
anchor = "This package makes execution operationally ready but does not start 11C, create participant evidence or change the real-entry decision. The primary evidence count remains zero. `PILOT_ENTRY_APPROVED=true` remains prohibited until every applicable hard gate is supported by actual evidence and explicit owner authorization."
replace(control, anchor, anchor + "\n\nThe exact package is bound to PR #508 head `ae4fcb0350be4023f82e2be8df88c18cca583695`, merged at `2bf58c2c5df40aa76742730ec4a49644c2506a89`, with the complete regression matrix recorded in `PHASE11_PRIMARY_PILOT_READINESS_RECEIPT.md`. The repository readiness lane is released; Issue #112 remains open for real-entry evidence and execution.")

verifier = ROOT / "scripts/phase11/verify-primary-pilot-readiness.py"
text = verifier.read_text(encoding="utf-8")
text = text.replace('ENVIRONMENT = ROOT / "backend/direkt-api/src/config/environment.ts"', 'ENVIRONMENT = ROOT / "backend/direkt-api/src/config/environment.ts"\nRECEIPT = ROOT / "docs/phase11/PHASE11_PRIMARY_PILOT_READINESS_RECEIPT.md"', 1)
text = text.replace('    ENVIRONMENT,\n):', '    ENVIRONMENT,\n    RECEIPT,\n):', 1)
old = '''for needle in (
    "CLAIMED — PHASE 11C–11J EXECUTION READINESS",
    "Phase 11C–11J execution-readiness contract — CLAIMED",
    "No real participant recruitment, data processing or provider activation",
    "PRIMARY-PILOT evidence register remains empty",
):
    require(LOCK, needle)

require(PROJECT, "Active repository write lane:** Phase 11C–11J execution readiness")
require(PROJECT, "EXECUTION READY / REAL ENTRY BLOCKED / NO PRIMARY-PILOT EVIDENCE")
'''
new = '''for needle in (
    "Phase 11C–11J execution-readiness contract — CLOSED AND PRESERVED",
    "This lane creates execution instruments only",
    "PRIMARY_PILOT_EVIDENCE_REGISTER.md` remains explicitly empty",
    "PR #508 exact head `ae4fcb0350be4023f82e2be8df88c18cca583695`",
):
    require(LOCK, needle)

require(PROJECT, "CLOSED AND PRESERVED — EXECUTION READY / REAL ENTRY BLOCKED / NO PRIMARY-PILOT EVIDENCE")
'''
if old not in text:
    raise SystemExit("Phase 11 readiness verifier state block did not match")
text = text.replace(old, new, 1)
insert = '''
for needle in (
    "State:** CLOSED — EXECUTION READY / REAL ENTRY BLOCKED / NO PRIMARY-PILOT EVIDENCE",
    "Implementation PR/head:** #508 / `ae4fcb0350be4023f82e2be8df88c18cca583695`",
    "Implementation merge:** `2bf58c2c5df40aa76742730ec4a49644c2506a89`",
    "PRIMARY-PILOT evidence count:** 0",
    "30287771078",
    "30287771096",
    "30287771050",
    "Wave 0 real-entry evidence reconciliation",
):
    require(RECEIPT, needle)
'''
text = text.replace('\nprint("PHASE11_PRIMARY_PILOT_READINESS|PASS")', insert + '\nprint("PHASE11_PRIMARY_PILOT_READINESS|PASS")', 1)
text = text.replace('print("state=execution_ready_real_entry_blocked")', 'print("state=closed_execution_ready_real_entry_blocked")\nprint("readiness_closure_preserved=true")\nprint("later_lane_ownership_not_asserted=true")', 1)
verifier.write_text(text, encoding="utf-8")

for target in (lock, project, control, verifier):
    normalize(target)

print("PHASE11_PRIMARY_PILOT_READINESS_CLOSEOUT_PATCH|PASS")
