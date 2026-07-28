#!/usr/bin/env python3
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
LOCK = ROOT / "WORKSTREAM_LOCK.md"
PROJECT = ROOT / "PROJECT_STATUS.md"
RECEIPT = ROOT / "docs/design/UIA_CURRENT_MAIN_OWNER_REVIEW_RECEIPT.md"


def require(path: Path, needle: str) -> None:
    if needle not in path.read_text(encoding="utf-8"):
        raise SystemExit(f"UIA contract missing {needle!r} in {path.relative_to(ROOT)}")


for path in (LOCK, PROJECT, RECEIPT):
    if not path.is_file():
        raise SystemExit(f"UIA contract missing {path.relative_to(ROOT)}")
for needle in (
    "UIA owner-review promotion contract — CLOSED AND PRESERVED",
    "CURRENT-MAIN SYNTHETIC OWNER REVIEW PROVEN",
    "The repository write lane is RELEASED",
    "PILOT_ENTRY_APPROVED` remains false",
):
    require(LOCK, needle)
require(PROJECT, "Active repository write lane:** none;")
require(PROJECT, "UIA current-main owner-review access — **CLOSED AND PRESERVED")
for needle in (
    "Managed source:** `bb84968453b891dd511faddc093a8874fce8abc4`",
    "`30314869549`",
    "`30314870954`",
    "`30314872253`",
    "`30315044253`",
    "Real Phase 11 participant UAT — not run",
    "Production release — not authorized",
    "https://app.direkt.forum",
    "direkt-internal-testers",
    "direkt-operations-portal-staging",
):
    require(RECEIPT, needle)
for script in (
    "scripts/rc11/verify-final-integration-closure.py",
    "scripts/phase11/verify-primary-pilot-readiness.py",
    "scripts/phase11/evaluate-wave0-gates.py",
    "scripts/phase11/verify-wave0-finishing-line.py",
):
    result = subprocess.run([sys.executable, script], cwd=ROOT)
    if result.returncode:
        raise SystemExit(result.returncode)
print("UIA_CURRENT_MAIN_OWNER_REVIEW|PASS")
print("source=bb84968453b891dd511faddc093a8874fce8abc4")
print("browser_run=30314869549")
print("android_run=30314870954")
print("operations_run=30314872253")
print("canonical_run=30315044253")
print("participant_processing=false")
print("production_authorization=false")
