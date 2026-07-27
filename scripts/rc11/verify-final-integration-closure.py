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
CLOSURE = ROOT / "docs/integrations/RC11_CLOSURE_RECEIPT.md"


def require(path: Path, needle: str) -> None:
    text = path.read_text(encoding="utf-8")
    if needle not in text:
        raise SystemExit(f"RC11 contract missing {needle!r} in {path.relative_to(ROOT)}")


for path in (LOCK, PROJECT, STATUS, LEDGER, PLAN, INDEX, RECORD, CLOSURE):
    if not path.is_file():
        raise SystemExit(f"RC11 contract missing file {path.relative_to(ROOT)}")

for needle in (
    "RELEASED — RC11 CLOSED AND PRESERVED",
    "RC11 implementation contract — CLOSED AND PRESERVED",
    "RC11A requires the combined",
    "RC11B maintains one managed evidence index",
    "RC11C reconciles the live ledger",
    "RC11D requires a dedicated exact-head closure receipt",
    "The repository write lane is RELEASED",
):
    require(LOCK, needle)

require(PROJECT, "Active repository write lane:** none; RC0–RC11 are closed")
require(PROJECT, "runtime integration closure — **RC0–RC11 are closed")
require(STATUS, "CLOSED — FINAL INTEGRATION RECONCILIATION / LANE RELEASED")
require(LEDGER, "RC11 final integration reconciliation")
require(LEDGER, "New state: CLOSED — FINAL INTEGRATION RECONCILIATION / LANE RELEASED")

for needle in (
    "combined Android/backend/database/OpenAPI/web/portal integration regression",
    "managed canary/device evidence index",
    "blocked/provider-pending items explicitly retained",
    "no false `ACTIVE` claims",
):
    require(PLAN, needle)

for needle in (
    "CLOSED — RC11A–RC11D COMPLETE / LANE RELEASED",
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
    "CLOSED — FINAL INTEGRATION RECONCILIATION / LANE RELEASED",
    "RC11A — combined regression",
    "RC11B — evidence index",
    "RC11C — ledger and status reconciliation",
    "RC11D — closure and handoff",
    "DPC controller registration",
    "actual consenting participants and PRIMARY-PILOT evidence",
):
    require(RECORD, needle)

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

print("RC11_FINAL_INTEGRATION_CONTRACT|PASS")
print("state=closed")
print("workstream_lane=released")
print("managed_evidence_index=reconciled")
print("blocked_provider_states=preserved")
print("false_active_claims=false")
print("participant_processing=false")
print("production_authorization=false")
