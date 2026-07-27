#!/usr/bin/env python3
"""Fail-closed Phase 11 Wave 0 evidence and entry-gate evaluator."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "docs/phase11/PHASE11_WAVE0_EVIDENCE_MANIFEST.json"
SCHEMA = ROOT / "docs/phase11/PHASE11_WAVE0_EVIDENCE_MANIFEST.schema.json"
EVIDENCE = ROOT / "docs/phase11/PRIMARY_PILOT_EVIDENCE_REGISTER.md"
ENVIRONMENT = ROOT / "backend/direkt-api/src/config/environment.ts"

HARD_IDS = {f"P11-G{i:02d}" for i in range(1, 15)}
CONDITIONAL_IDS = {f"P11-C{i:02d}" for i in range(1, 8)}
EXTERNAL_IDS = {f"P11-G{i:02d}" for i in range(1, 12)} | {"P11-G13"}
TECHNICAL_IDS = {"P11-G12", "P11-G14"}
INDEPENDENT_REVIEW_IDS = {"P11-G03", "P11-G04", "P11-G05", "P11-G06"}
SHA256 = re.compile(r"^[0-9a-f]{64}$")
SHA40 = re.compile(r"^[0-9a-f]{40}$")


def fail(message: str) -> None:
    raise SystemExit(f"PHASE11_WAVE0_GATE_EVALUATOR|FAIL|{message}")


for path in (MANIFEST, SCHEMA, EVIDENCE, ENVIRONMENT):
    if not path.is_file():
        fail(f"missing={path.relative_to(ROOT)}")

manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
schema = json.loads(SCHEMA.read_text(encoding="utf-8"))

if schema.get("properties", {}).get("pilot_entry_approved", {}).get("const") is not False:
    fail("schema_must_pin_pilot_entry_approved_false")
if manifest.get("schema_version") != 1:
    fail("schema_version")
if not SHA40.fullmatch(str(manifest.get("source_baseline", ""))):
    fail("source_baseline")
if manifest.get("pilot_entry_approved") is not False:
    fail("pilot_entry_approved_must_remain_false")
if manifest.get("primary_pilot_evidence_count") != 0:
    fail("primary_pilot_evidence_count_must_be_zero")

primary = EVIDENCE.read_text(encoding="utf-8")
for marker in ("NO PRIMARY-PILOT EVIDENCE RECORDED", "`PRIMARY-PILOT` | 0", "_EMPTY_"):
    if marker not in primary:
        fail(f"primary_evidence_marker={marker}")

environment = ENVIRONMENT.read_text(encoding="utf-8")
if "PILOT_ENTRY_APPROVED: Joi.boolean().truthy('true').falsy('false').default(false)" not in environment:
    fail("environment_latch_not_fail_closed")

entries = manifest.get("gates")
if not isinstance(entries, list):
    fail("gates_not_array")
by_id = {entry.get("id"): entry for entry in entries if isinstance(entry, dict)}
if set(by_id) != HARD_IDS | CONDITIONAL_IDS:
    missing = sorted((HARD_IDS | CONDITIONAL_IDS) - set(by_id))
    extra = sorted(set(by_id) - (HARD_IDS | CONDITIONAL_IDS))
    fail(f"gate_inventory_missing={missing}_extra={extra}")
if len(by_id) != len(entries):
    fail("duplicate_gate_id")

allowed_states = {"OPEN", "CLOSED", "NOT_APPLICABLE", "DISABLED", "FAILED"}
for gate_id, gate in sorted(by_id.items()):
    expected_class = "HARD" if gate_id in HARD_IDS else "CONDITIONAL"
    if gate.get("class") != expected_class:
        fail(f"class={gate_id}")
    if gate.get("state") not in allowed_states:
        fail(f"state={gate_id}")
    if gate_id in HARD_IDS and gate.get("state") in {"NOT_APPLICABLE", "DISABLED"}:
        fail(f"hard_gate_cannot_be_{gate.get('state').lower()}={gate_id}")
    if gate.get("state") == "CLOSED":
        required = ("authority", "evidence_reference", "evidence_sha256", "scope", "decision_owner", "decision_at")
        missing = [field for field in required if not gate.get(field)]
        if missing:
            fail(f"closed_gate_missing={gate_id}:{','.join(missing)}")
        if not SHA256.fullmatch(str(gate.get("evidence_sha256"))):
            fail(f"closed_gate_bad_sha256={gate_id}")
        if gate_id in INDEPENDENT_REVIEW_IDS and not gate.get("independent_reviewer"):
            fail(f"closed_gate_missing_independent_review={gate_id}")
    elif gate.get("evidence_sha256") is not None and not SHA256.fullmatch(str(gate.get("evidence_sha256"))):
        fail(f"bad_optional_sha256={gate_id}")

open_hard = sorted(gate_id for gate_id in HARD_IDS if by_id[gate_id]["state"] != "CLOSED")
open_external = sorted(set(open_hard) & EXTERNAL_IDS)
open_technical = sorted(set(open_hard) & TECHNICAL_IDS)
decision = manifest.get("decision")
preflight = manifest.get("technical_preflight")

if decision == "ENTRY_APPROVED":
    if open_hard:
        fail(f"entry_approved_with_open_hard={open_hard}")
    if preflight != "PASSED":
        fail("entry_approved_without_technical_preflight")
    fail("entry_approved_prohibited_while_latch_false")
elif decision == "ENTRY_BLOCKED_EXTERNAL":
    if not open_external:
        fail("external_block_without_external_gate")
    if preflight == "FAILED":
        fail("external_block_cannot_hide_failed_technical_preflight")
elif decision == "ENTRY_BLOCKED_TECHNICAL":
    if not open_technical and preflight != "FAILED":
        fail("technical_block_without_technical_gate")
elif decision == "STOP":
    if not any(by_id[gate_id]["state"] == "FAILED" for gate_id in HARD_IDS):
        fail("stop_requires_failed_hard_gate")
else:
    fail("unknown_decision")

print("PHASE11_WAVE0_GATE_EVALUATOR|PASS")
print(f"decision={decision}")
print(f"technical_preflight={preflight}")
print(f"open_hard={','.join(open_hard)}")
print(f"open_external={','.join(open_external)}")
print(f"open_technical={','.join(open_technical)}")
print("pilot_entry_approved=false")
print("primary_pilot_evidence_count=0")
print("participant_processing=false")
print("real_money=false")
print("phase12_authorization=false")
