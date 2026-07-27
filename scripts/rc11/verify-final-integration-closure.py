#!/usr/bin/env python3
"""Verify the RC11 final integration reconciliation contract."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCK = ROOT / "WORKSTREAM_LOCK.md"
PROJECT = ROOT / "PROJECT_STATUS.md"
STATUS = ROOT / "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
LEDGER = ROOT / "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
PLAN = ROOT / "docs/integrations/RUNTIME_INTEGRATION_CLOSURE_PLAN.md"
INDEX = ROOT / "docs/integrations/RC11_MANAGED_EVIDENCE_INDEX.md"
RECORD = ROOT / "docs/integrations/RC11_RECONCILIATION_RECORD.md"


def require(path: Path, needle: str) -> None:
    text = path.read_text(encoding="utf-8")
    if needle not in text:
        raise SystemExit(f"RC11 contract missing {needle!r} in {path.relative_to(ROOT)}")


for path in (LOCK, PROJECT, STATUS, LEDGER, PLAN, INDEX, RECORD):
    if not path.is_file():
        raise SystemExit(f"RC11 contract missing file {path.relative_to(ROOT)}")

for needle in (
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

for needle in (
    "combined Android/backend/database/OpenAPI/web/portal integration regression",
    "managed canary/device evidence index",
    "blocked/provider-pending items explicitly retained",
    "no false `ACTIVE` claims",
):
    require(PLAN, needle)

for needle in (
    "RC11B COMPLETE / RC11A AND RC11D EXACT-HEAD CLOSURE PENDING",
    "direkt-resend-canary-ct9mp",
    "29885635547",
    "29916381754",
    "30183466799",
    "30137700769",
    "30234521983/1",
    "30241092949/1",
    "04ef57f31414ec5165e353abba74afb8dfdcc901",
    "cdab6622e0cc06e35cddca2bb5bc8ea70c027b38",
    "Real Phase 11 participants/evidence",
    "Formal Phase 12 production release",
    "Synthetic, sandbox and managed-canary evidence is not PRIMARY-PILOT evidence",
):
    require(INDEX, needle)

for needle in (
    "IMPLEMENTED — EXACT-HEAD REGRESSION AND CLOSEOUT PENDING",
    "RC11A — combined regression",
    "RC11B — evidence index",
    "RC11C — ledger and status reconciliation",
    "RC11D — closure and handoff",
    "DPC controller registration",
    "actual consenting participants and PRIMARY-PILOT evidence",
):
    require(RECORD, needle)

print("RC11_FINAL_INTEGRATION_CONTRACT|PASS")
print("state=implemented_regression_pending")
print("managed_evidence_index=reconciled")
print("blocked_provider_states=preserved")
print("false_active_claims=false")
print("participant_processing=false")
print("production_authorization=false")
