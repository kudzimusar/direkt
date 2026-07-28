#!/usr/bin/env python3
"""Verify the Phase 11 Wave 0 finishing-line package and fail-closed boundaries."""
from pathlib import Path
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
LOCK = ROOT / "WORKSTREAM_LOCK.md"
PROJECT = ROOT / "PROJECT_STATUS.md"
BLOCKERS = ROOT / "docs/phase11/PHASE11_REAL_ENTRY_BLOCKER_REGISTER_2026-07-28.md"
OFFICIAL = ROOT / "docs/phase11/PHASE11_WAVE0_OFFICIAL_SOURCE_EVIDENCE_2026-07-28.md"
MANIFEST = ROOT / "docs/phase11/PHASE11_WAVE0_EVIDENCE_MANIFEST.json"
SCHEMA = ROOT / "docs/phase11/PHASE11_WAVE0_EVIDENCE_MANIFEST.schema.json"
OWNER = ROOT / "docs/phase11/PHASE11_WAVE0_OWNER_ACTION_PACKET.md"
PREFLIGHT = ROOT / "docs/phase11/PHASE11_WAVE0_TECHNICAL_PREFLIGHT.md"
RECEIPT = ROOT / "docs/phase11/PHASE11_WAVE0_TERMINAL_RECEIPT.md"
EVALUATOR = ROOT / "scripts/phase11/evaluate-wave0-gates.py"


def require(path: Path, needle: str) -> None:
    if needle not in path.read_text(encoding="utf-8"):
        raise SystemExit(f"Wave 0 finishing line missing {needle!r} in {path.relative_to(ROOT)}")


def reject(path: Path, needle: str) -> None:
    if needle in path.read_text(encoding="utf-8"):
        raise SystemExit(f"Wave 0 finishing line prohibits {needle!r} in {path.relative_to(ROOT)}")


for path in (LOCK, PROJECT, BLOCKERS, OFFICIAL, MANIFEST, SCHEMA, OWNER, PREFLIGHT, RECEIPT, EVALUATOR):
    if not path.is_file():
        raise SystemExit(f"Wave 0 finishing line missing file {path.relative_to(ROOT)}")

for needle in (
    "Phase 11 Wave 0 finishing-line contract — CLOSED AND PRESERVED",
    "PILOT_ENTRY_APPROVED` remains false",
    "PRIMARY-PILOT evidence and findings remain at zero",
    "ENTRY_BLOCKED_EXTERNAL",
):
    require(LOCK, needle)

require(PROJECT, "Active repository write lane:** none;")
require(PROJECT, "Phase 11 Wave 0 finishing-line controls — **CLOSED AND PRESERVED")
require(PROJECT, "closed through PR #513 exact head `1e4291ef669ca01eb4f639b2f1734a85d8448a63`")
require(LOCK, "Stable baseline | `main@632dd0bdbb2a3b8c24bd285918deff3e54bd3ba9`")

for needle in (
    "OFFICIAL-SOURCE RESEARCH ONLY",
    "separate authorization is required",
    "P11-G01 remains OPEN",
    "P11-G02 remains OPEN",
    "P11-G04 remains OPEN",
    "Published fee discrepancy requires direct confirmation",
):
    require(OFFICIAL, needle)

for needle in (
    "Zambia DPC controller/processor registration",
    "Overseas storage and transfer authorization",
    "Qualified Zambia legal review",
    "Configure Firebase Zambia phone authentication",
    "Do not send regulator certificates",
):
    require(OWNER, needle)

for needle in (
    "PASSED — EXACT-HEAD TECHNICAL PREFLIGHT CLOSED",
    "Explicit Wave 1 exclusions",
    "P11-G14 is closed for that exact repository source only",
):
    require(PREFLIGHT, needle)

for needle in (
    "Decision:** ENTRY_BLOCKED_EXTERNAL",
    "P11-G01 through P11-G13 remain open",
    "does not close Phase 11",
    "maximum truthful repository completion",
    "P11-G14 is CLOSED",
    "Closeout PR/head:** #513 / `1e4291ef669ca01eb4f639b2f1734a85d8448a63`",
    "Closeout merge:** `632dd0bdbb2a3b8c24bd285918deff3e54bd3ba9`",
):
    require(RECEIPT, needle)

manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
if manifest["decision"] != "ENTRY_BLOCKED_EXTERNAL":
    raise SystemExit("Wave 0 manifest must remain ENTRY_BLOCKED_EXTERNAL without external authority evidence")
if manifest["technical_preflight"] != "PASSED":
    raise SystemExit("Wave 0 technical preflight must be PASSED after closeout")
if next(g for g in manifest["gates"] if g["id"] == "P11-G14")["state"] != "CLOSED":
    raise SystemExit("Wave 0 P11-G14 must be CLOSED for exact source after closeout")
if manifest["pilot_entry_approved"] is not False or manifest["primary_pilot_evidence_count"] != 0:
    raise SystemExit("Wave 0 manifest falsely activates pilot or primary evidence")

for workflow in (ROOT / ".github" / "workflows").glob("*.yml"):
    reject(workflow, "PILOT_ENTRY_APPROVED: true")
    reject(workflow, 'PILOT_ENTRY_APPROVED: "true"')

result = subprocess.run([sys.executable, str(EVALUATOR)], cwd=ROOT, text=True, capture_output=True)
if result.returncode:
    print(result.stdout, end="")
    print(result.stderr, end="", file=sys.stderr)
    raise SystemExit(result.returncode)
print(result.stdout, end="")

print("PHASE11_WAVE0_FINISHING_LINE|PASS")
print("decision=ENTRY_BLOCKED_EXTERNAL")
print("official_source_research=refreshed")
print("evidence_manifest=fail_closed")
print("owner_action_packet=ready")
print("participant_processing=false")
print("primary_pilot_evidence_count=0")
print("real_money=false")
print("phase12_authorization=false")
