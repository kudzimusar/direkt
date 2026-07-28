#!/usr/bin/env python3
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
LOCK = ROOT / "WORKSTREAM_LOCK.md"
PROJECT = ROOT / "PROJECT_STATUS.md"
RECEIPT = ROOT / "docs/phase11/PHASE11_TERMINAL_ADMINISTRATIVE_DISPOSITION.md"


def require(path: Path, needle: str) -> None:
    if needle not in path.read_text(encoding="utf-8"):
        raise SystemExit(f"Phase 11 terminal disposition missing {needle!r} in {path.relative_to(ROOT)}")


for path in (LOCK, PROJECT, RECEIPT):
    if not path.is_file():
        raise SystemExit(f"Phase 11 terminal disposition missing {path.relative_to(ROOT)}")

for needle in (
    "RELEASED — PHASE 11 TRACKER CLOSED NOT PLANNED",
    "P11-G01–P11-G13 remain unsatisfied",
    "PILOT_ENTRY_APPROVED` remains false",
    "PRIMARY-PILOT evidence count remains 0",
    "The real Phase 11 pilot was not run and is not complete",
    "No primary pilot evidence or evidence-backed 11J `PROCEED` exists",
):
    require(LOCK, needle)

for needle in (
    "Active repository write lane:** none;",
    "Phase 11 controlled Zambia pilot — **NOT RUN / STOPPED BEFORE ENTRY / TRACKER CLOSED NOT PLANNED**",
    "Administrative closure of Issue #112 does not mean Phase 11 completed",
):
    require(PROJECT, needle)

for needle in (
    "STOPPED BEFORE ENTRY / TRACKER CLOSED NOT PLANNED",
    "Real controlled pilot:** not run",
    "Primary-pilot evidence count:** 0",
    "PILOT_ENTRY_APPROVED:** false",
    "Phase 12 production authorization:** false",
    "not an evidence-backed Phase 11J STOP decision",
    "new governing issue",
    "Issue #112 may close as **not planned** only",
):
    require(RECEIPT, needle)

for script in (
    "scripts/rc11/verify-final-integration-closure.py",
    "scripts/phase11/verify-primary-pilot-readiness.py",
    "scripts/phase11/evaluate-wave0-gates.py",
    "scripts/phase11/verify-wave0-finishing-line.py",
    "scripts/uia/verify-current-main-owner-review.py",
):
    result = subprocess.run([sys.executable, script], cwd=ROOT)
    if result.returncode:
        raise SystemExit(result.returncode)

print("PHASE11_TERMINAL_ADMINISTRATIVE_DISPOSITION|PASS")
print("decision=STOPPED_BEFORE_ENTRY")
print("issue_closure=NOT_PLANNED")
print("phase11_completed=false")
print("pilot_entry_approved=false")
print("primary_pilot_evidence_count=0")
print("participant_processing=false")
print("real_money=false")
print("phase12_authorization=false")
