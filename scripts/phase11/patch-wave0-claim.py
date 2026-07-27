#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Wave 0 claim missing expected text in {path.relative_to(ROOT)}: {old}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


lock = ROOT / "WORKSTREAM_LOCK.md"
replace(lock, "| Status | RELEASED — PHASE 11C–11J READINESS CLOSED AND PRESERVED |", "| Status | CLAIMED — PHASE 11 WAVE 0 FINISHING-LINE RECONCILIATION |")
replace(lock, "| Owner/agent | None. Phase 11C–11J execution readiness is closed; Issue #112 remains open for real entry and participant-backed evidence. |", "| Owner/agent | Active repository agent — Issue #112 Wave 0 finishing-line reconciliation. |")
replace(lock, "| Authorized scope | No active repository write scope. A new explicit claim is required for Wave 0 real-entry evidence reconciliation or any later source change. |", "| Authorized scope | Reconcile every repository-clearable real-entry gate, refresh official-source evidence, create machine-enforced evidence intake/owner decision controls, prove the protected pre-entry environment, and publish the truthful terminal handoff. No participant recruitment, processing, provider activation, real money or production release. |")
replace(lock, "| Implementation branch | None. Phase 11 readiness PR #508 merged at `2bf58c2c5df40aa76742730ec4a49644c2506a89`. |", "| Implementation branch | `phase11/wave0-finishing-line`, based on exact `main@b02ae4ea2d6136b2122e978177ccc4957e167f34`. |")
replace(lock, "| Stable baseline | `main@1c32171ddc46c8f5c0e8176b2be14c4d4f4d355c` contains the reviewed Phase 11C–11J readiness package, its exact closeout receipt and closed RC0–RC11 evidence. |", "| Stable baseline | `main@b02ae4ea2d6136b2122e978177ccc4957e167f34` contains the reviewed Phase 11C–11J readiness package, exact closeout receipt and closed RC0–RC11 evidence. |")
replace(lock, "| Current task | None. Wave 0 real-entry evidence reconciliation is next but unclaimed. `PILOT_ENTRY_APPROVED` remains false and PRIMARY-PILOT evidence count remains 0. |", "| Current task | Wave 0 finishing-line reconciliation only. `PILOT_ENTRY_APPROVED` remains false and PRIMARY-PILOT evidence count remains 0 unless actual external authority and owner evidence is supplied and separately approved. |")
replace(lock, "## Runtime integration closure contract", """## Phase 11 Wave 0 finishing-line contract — CLAIMED

1. This lane may close repository-clearable preparation and verification only; it may not claim that regulator, counsel, provider, owner or participant evidence exists when it has not been supplied.
2. `PILOT_ENTRY_APPROVED` remains false. No workflow, deployment, source document or local command may set it true in this lane.
3. PRIMARY-PILOT evidence and findings remain at zero; synthetic, secondary, sandbox or managed-canary evidence remains separately labelled.
4. Official-source Zambia privacy, controller/processor, overseas-storage/transfer and consumer-protection research may be refreshed, but cannot close P11-G01 through P11-G06 without the required accountable authority.
5. The lane must produce a structured evidence-intake manifest, hash/reference rules, accountable-owner attestations and a deterministic gate evaluator that fails closed on missing, expired, mismatched or unreviewed evidence.
6. Repository-clearable technical preflight must verify exact source, migrations, private storage boundaries, Firebase fail-closed configuration, communication/Maps/telemetry/AI/payment exclusions, support/incident templates and zero unresolved repository critical/high defects.
7. Real participant Firebase, invitation, consent, withdrawal, deletion and private-storage canaries remain blocked until legal/privacy/owner gates are actually closed; synthetic negative-path proof may not be relabelled as a real canary.
8. The terminal Wave 0 decision must be one of `ENTRY_APPROVED`, `ENTRY_BLOCKED_EXTERNAL`, `ENTRY_BLOCKED_TECHNICAL` or `STOP`, with exact unresolved gate IDs and no ambiguous partial activation.
9. If external evidence is absent, the finishing line for this lane is a verified `ENTRY_BLOCKED_EXTERNAL` receipt and a minimal owner/manual action packet—not false Phase 11 closure.
10. Closure requires exact-head regression, permanent Wave 0 verifier success, authoritative status/blocker reconciliation, receipt publication, lane release and Issue #112 handoff.

## Runtime integration closure contract""")

project = ROOT / "PROJECT_STATUS.md"
replace(project, "**Active repository write lane:** none; Phase 11C–11J readiness is closed and Wave 0 real-entry evidence reconciliation is next but unclaimed", "**Active repository write lane:** Phase 11 Wave 0 finishing-line reconciliation under Issue #112")

print("PHASE11_WAVE0_CLAIM_PATCH|PASS")
