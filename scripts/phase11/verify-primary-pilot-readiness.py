#!/usr/bin/env python3
"""Verify Phase 11C–11J execution readiness without claiming real pilot activity."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCK = ROOT / "WORKSTREAM_LOCK.md"
PROJECT = ROOT / "PROJECT_STATUS.md"
CONTROL = ROOT / "docs/phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md"
PROTOCOL = ROOT / "docs/phase11/PHASE11C_11J_EXECUTION_PROTOCOL.md"
EVIDENCE = ROOT / "docs/phase11/PRIMARY_PILOT_EVIDENCE_REGISTER.md"
RUNBOOK = ROOT / "docs/phase11/PHASE11_WAVE_RUNBOOK.md"
BLOCKERS = ROOT / "docs/phase11/PHASE11_REAL_ENTRY_BLOCKER_REGISTER_2026-07-28.md"
FINDINGS = ROOT / "docs/phase11/PHASE11_FINDINGS_AND_CORRECTIONS_REGISTER.md"
DECISION = ROOT / "docs/phase11/PHASE11_11J_DECISION_TEMPLATE.md"
ENVIRONMENT = ROOT / "backend/direkt-api/src/config/environment.ts"


def require(path: Path, needle: str) -> None:
    text = path.read_text(encoding="utf-8")
    if needle not in text:
        raise SystemExit(f"Phase 11 readiness missing {needle!r} in {path.relative_to(ROOT)}")


def reject(path: Path, needle: str) -> None:
    text = path.read_text(encoding="utf-8")
    if needle in text:
        raise SystemExit(f"Phase 11 readiness prohibits {needle!r} in {path.relative_to(ROOT)}")


for path in (
    LOCK,
    PROJECT,
    CONTROL,
    PROTOCOL,
    EVIDENCE,
    RUNBOOK,
    BLOCKERS,
    FINDINGS,
    DECISION,
    ENVIRONMENT,
):
    if not path.is_file():
        raise SystemExit(f"Phase 11 readiness missing file {path.relative_to(ROOT)}")

for needle in (
    "CLAIMED — PHASE 11C–11J EXECUTION READINESS",
    "Phase 11C–11J execution-readiness contract — CLAIMED",
    "No real participant recruitment, data processing or provider activation",
    "PRIMARY-PILOT evidence register remains empty",
):
    require(LOCK, needle)

require(PROJECT, "Active repository write lane:** Phase 11C–11J execution readiness")
require(PROJECT, "EXECUTION READY / REAL ENTRY BLOCKED / NO PRIMARY-PILOT EVIDENCE")
require(CONTROL, "Primary-pilot execution-readiness package")
require(CONTROL, "NO PRIMARY-PILOT EVIDENCE RECORDED")

for stage in ("11C", "11D", "11E", "11F", "11G", "11H", "11I", "11J"):
    require(PROTOCOL, f"## {stage}")

for needle in (
    "EXECUTION READY / REAL ENTRY BLOCKED / NO PRIMARY-PILOT EVIDENCE",
    "at most 8 providers",
    "at most 20 customers",
    "Only observations from approved, consenting participants",
    "Payment status must not affect verification, publication or ranking",
    "Synthetic, secondary or sandbox evidence",
):
    require(PROTOCOL, needle)

for needle in (
    "NO PRIMARY-PILOT EVIDENCE RECORDED",
    "`PRIMARY-PILOT` | 0",
    "_EMPTY_",
    "raw Firebase UID",
    "exact private provider base coordinates",
):
    require(EVIDENCE, needle)

for needle in (
    "Wave 0 — hard-gate preflight",
    "Immediate stop conditions",
    "Mandatory pause conditions",
    "unexpected real-money movement",
    "No operator may directly edit a terminal trust state",
):
    require(RUNBOOK, needle)

for gate in (
    "P11-G01",
    "P11-G02",
    "P11-G03",
    "P11-G05",
    "P11-G08",
    "P11-G09",
    "P11-G10",
    "P11-G11",
    "P11-G14",
):
    require(BLOCKERS, gate)
require(BLOCKERS, "**State:** REAL ENTRY BLOCKED")
require(BLOCKERS, "**`PILOT_ENTRY_APPROVED`:** false")

for needle in (
    "NO PRIMARY-PILOT FINDINGS RECORDED",
    "DEFECT",
    "ASSUMPTION",
    "REQUEST",
    "INCIDENT",
    "No direct database status edits",
):
    require(FINDINGS, needle)

for needle in (
    "TEMPLATE ONLY / NO 11J DECISION",
    "STOP / REPEAT / NARROW / PROCEED",
    "Phase 12 production authorization: FALSE",
    "Synthetic, sandbox, secondary or managed-canary evidence",
):
    require(DECISION, needle)

require(ENVIRONMENT, "PILOT_ENTRY_APPROVED: Joi.boolean().truthy('true').falsy('false').default(false)")
reject(PROJECT, "Phase 11 real pilot — **complete**")
reject(CONTROL, "PRIMARY-PILOT evidence complete")

for workflow in (ROOT / ".github" / "workflows").glob("*.yml"):
    reject(workflow, "PILOT_ENTRY_APPROVED: true")
    reject(workflow, "PILOT_ENTRY_APPROVED=true")

print("PHASE11_PRIMARY_PILOT_READINESS|PASS")
print("state=execution_ready_real_entry_blocked")
print("primary_pilot_evidence_count=0")
print("pilot_entry_approved=false")
print("participant_processing=false")
print("payment_runtime=false")
print("phase12_authorization=false")
