#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = "1befa902def70d2c997aaba260e0d8e2a5d4b12d"
MERGE = "f561658d140aaf214fa6eaca99c80bcc98ee284f"
EVIDENCE_SHA256 = "7480a398c6ed7a612ce1c2e44706221f1722e626a2841fe0598662d62471bdf9"
RUNS = "30307945800, 30307945818, 30307945934, 30307945768, 30307945872, 30307945906, 30307945756, 30307945870, 30307945784, 30307945769, 30307945849, 30307945921, 30307945959, 30307945868, 30307945894, 30307945776, 30307945858, 30307945856"


def replace(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Wave 0 closeout missing expected text in {path.relative_to(ROOT)}: {old}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


manifest_path = ROOT / "docs/phase11/PHASE11_WAVE0_EVIDENCE_MANIFEST.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
manifest["as_of"] = "2026-07-28T06:46:00+09:00"
manifest["source_baseline"] = SOURCE
manifest["technical_preflight"] = "PASSED"
for gate in manifest["gates"]:
    if gate["id"] == "P11-G14":
        gate.update({
            "state": "CLOSED",
            "authority": "GitHub Actions exact-head regression matrix",
            "evidence_reference": f"PHASE11_WAVE0_TECHNICAL_PREFLIGHT.md; source {SOURCE}; runs {RUNS}",
            "evidence_sha256": EVIDENCE_SHA256,
            "scope": f"repository source {SOURCE}; technical pre-entry controls only; excludes Wave 1 deployment and participant runtime",
            "decision_owner": "DIREKT repository owner",
            "decision_at": "2026-07-28T06:46:00+09:00",
            "independent_reviewer": None,
            "expires_at": None,
            "blocks": [],
        })
        break
else:
    raise SystemExit("Wave 0 closeout missing P11-G14")
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

preflight = ROOT / "docs/phase11/PHASE11_WAVE0_TECHNICAL_PREFLIGHT.md"
replace(preflight, "**State:** IMPLEMENTED — EXACT-HEAD EVIDENCE PENDING  ", "**State:** PASSED — EXACT-HEAD TECHNICAL PREFLIGHT CLOSED  ")
replace(preflight, "**Baseline:** `6b9e7cabeebd5ade9b998b8a54bcd2c888e6bfe4`  ", f"**Exact source:** `{SOURCE}`  \n**Implementation PR/merge:** #512 / `{MERGE}`  \n**Evidence SHA-256:** `{EVIDENCE_SHA256}`  ")
replace(
    preflight,
    "The implementation PR closeout must replace this pending state with:\n\n- exact clean source SHA;\n- implementation PR and merge SHA;\n- complete workflow run IDs;\n- confirmed `technical_preflight: PASSED` in the Wave 0 manifest;\n- P11-G14 closed for that exact source only;\n- any remaining P11-G12 deployment/revision evidence still open until a real Wave 1 candidate is deployed.",
    f"The technical preflight is bound to exact source `{SOURCE}` and implementation merge `{MERGE}`. The complete preserved matrix passed through runs `{RUNS}`. The Wave 0 manifest records `technical_preflight: PASSED`, and P11-G14 is closed for that exact repository source only. P11-G12 remains open until a real Wave 1 candidate has an immutable deployment revision, image digest, migration checksums and configuration receipt.",
)

receipt = ROOT / "docs/phase11/PHASE11_WAVE0_TERMINAL_RECEIPT.md"
replace(receipt, "**State:** IMPLEMENTED — EXACT-HEAD CLOSEOUT PENDING  ", "**State:** CLOSED AND PRESERVED — MAXIMUM REPOSITORY COMPLETION  ")
replace(receipt, "**Claim merge:** `6b9e7cabeebd5ade9b998b8a54bcd2c888e6bfe4`  ", f"**Claim merge:** `6b9e7cabeebd5ade9b998b8a54bcd2c888e6bfe4`  \n**Implementation PR/head:** #512 / `{SOURCE}`  \n**Implementation merge:** `{MERGE}`  \n**Technical evidence SHA-256:** `{EVIDENCE_SHA256}`  ")
replace(receipt, "- P11-G14 remains open until the implementation exact-head matrix is bound by closeout.", f"- P11-G14 is CLOSED for repository source `{SOURCE}` after the complete exact-head matrix passed; this does not close P11-G12 or any external gate.")
replace(receipt, "## Closeout rule\n\nThe implementation closeout may mark the technical preflight passed and P11-G14 closed for the exact reviewed source. It must keep the terminal decision `ENTRY_BLOCKED_EXTERNAL` unless actual external evidence is supplied, reviewed and entered through the protected manifest process.", f"## Exact-head evidence\n\nThe finishing-line implementation passed Wave 0, readiness, RC11, W7 Android/backend/database/OpenAPI, deterministic generated clients, customer/provider PWA, W8, supply-chain, documentation and RC5–RC10 contracts through runs `{RUNS}`.\n\n## Closeout rule\n\nThe repository lane is released. The terminal decision remains `ENTRY_BLOCKED_EXTERNAL` unless actual external evidence is supplied, independently reviewed where required and entered through the protected manifest process. A later evidence-reconciliation lane requires a new explicit claim.")

blockers = ROOT / "docs/phase11/PHASE11_REAL_ENTRY_BLOCKER_REGISTER_2026-07-28.md"
replace(blockers, "| P11-G14 | Critical/high entry defects | OPEN until final review | zero unresolved critical/high defects or explicit authorized stop/narrow decision | product/security/privacy owners | wave start |", f"| P11-G14 | Critical/high repository entry defects | CLOSED for `{SOURCE}` | exact-head matrix passed; evidence SHA-256 `{EVIDENCE_SHA256}` | DIREKT repository owner | no longer blocks repository readiness; P11-G12 still blocks wave start |")
replace(blockers, "| P11-C01 | Zambia field lead | OPEN | any real field-visit or equivalent claim is enabled | named trained field lead, safety protocol, assignment/audit process and owner approval |", "| P11-C01 | Zambia field lead | NOT APPLICABLE to initial no-field-claim wave | any real field-visit or equivalent claim is enabled | named trained field lead, safety protocol, assignment/audit process and owner approval |")
replace(blockers, "| P11-C07 | Automated registry access | NOT AUTHORIZED | an automated authority/registry lookup is proposed | formal lawful API/access agreement and evidence-handling approval |", "| P11-C07 | Automated registry access | NOT APPLICABLE to initial wave | an automated authority/registry lookup is proposed | formal lawful API/access agreement and evidence-handling approval |")

lock = ROOT / "WORKSTREAM_LOCK.md"
replace(lock, "| Status | CLAIMED — PHASE 11 WAVE 0 FINISHING-LINE RECONCILIATION |", "| Status | RELEASED — PHASE 11 WAVE 0 FINISHING LINE CLOSED AND PRESERVED |")
replace(lock, "| Owner/agent | Active repository agent — Issue #112 Wave 0 finishing-line reconciliation. |", "| Owner/agent | None. Wave 0 repository finishing-line work is closed; Issue #112 remains open for actual external evidence and participant-backed execution. |")
replace(lock, "| Authorized scope | Reconcile every repository-clearable real-entry gate, refresh official-source evidence, create machine-enforced evidence intake/owner decision controls, prove the protected pre-entry environment, and publish the truthful terminal handoff. No participant recruitment, processing, provider activation, real money or production release. |", "| Authorized scope | No active repository write scope. A new explicit claim is required to reconcile actual regulator, counsel, owner, provider-console or managed real-environment evidence. |")
replace(lock, "| Implementation branch | `phase11/wave0-finishing-line-implementation`, based on claim merge `main@6b9e7cabeebd5ade9b998b8a54bcd2c888e6bfe4`. |", f"| Implementation branch | None. Wave 0 implementation PR #512 merged at `{MERGE}`. |")
replace(lock, "| Stable baseline | `main@6b9e7cabeebd5ade9b998b8a54bcd2c888e6bfe4` contains the verified Wave 0 claim, reviewed Phase 11C–11J readiness package and closed RC0–RC11 evidence. |", f"| Stable baseline | `main@{MERGE}` contains the verified Wave 0 finishing-line controls, technical preflight and closed RC0–RC11/readiness evidence. |")
replace(lock, "| Current task | Wave 0 finishing-line controls implemented; exact-head technical preflight, terminal receipt binding and lane release remain pending. Current decision is `ENTRY_BLOCKED_EXTERNAL`; `PILOT_ENTRY_APPROVED` remains false and PRIMARY-PILOT evidence count remains 0. |", "| Current task | None. Terminal decision is `ENTRY_BLOCKED_EXTERNAL`. P11-G01–P11-G13 remain open, `PILOT_ENTRY_APPROVED` remains false and PRIMARY-PILOT evidence count remains 0. |")
replace(lock, "## Phase 11 Wave 0 finishing-line contract — CLAIMED", "## Phase 11 Wave 0 finishing-line contract — CLOSED AND PRESERVED")
replace(lock, "10. Closure requires exact-head regression, permanent Wave 0 verifier success, authoritative status/blocker reconciliation, receipt publication, lane release and Issue #112 handoff.", f"10. Wave 0 repository finishing-line work is `CLOSED — ENTRY_BLOCKED_EXTERNAL / TECHNICAL PREFLIGHT PASSED`: PR #512 exact head `{SOURCE}` passed the complete matrix and squash-merged at `{MERGE}`. P11-G14 is closed for that source only; P11-G01–P11-G13 remain open, Issue #112 remains open and any later evidence lane requires a new explicit claim.")
replace(lock, "The repository write lane is RELEASED. RC0–RC11 and Phase 11C–11J readiness evidence remain immutable/regression-protected. Wave 0 real-entry evidence reconciliation requires a new explicit claim. Real participants, real participant data, real money and production authorization remain blocked until the explicit Phase 11 entry checklist is satisfied.", "The repository write lane is RELEASED. RC0–RC11, Phase 11C–11J readiness and Wave 0 finishing-line evidence remain immutable/regression-protected. Real participants, participant data, real money and production authorization remain blocked until the explicit Phase 11 entry checklist is satisfied.")

project = ROOT / "PROJECT_STATUS.md"
replace(project, "**Active repository write lane:** Phase 11 Wave 0 finishing-line reconciliation under Issue #112", "**Active repository write lane:** none; Wave 0 finishing-line controls are closed and actual external-evidence reconciliation is next but unclaimed")
replace(project, "- Phase 11 Wave 0 finishing-line controls — **IMPLEMENTED / EXACT-HEAD PREFLIGHT PENDING / ENTRY_BLOCKED_EXTERNAL**;", "- Phase 11 Wave 0 finishing-line controls — **CLOSED AND PRESERVED / TECHNICAL PREFLIGHT PASSED / ENTRY_BLOCKED_EXTERNAL**;")
replace(project, "Wave 0 is the active lane from claim merge `6b9e7cabeebd5ade9b998b8a54bcd2c888e6bfe4`. The deterministic evidence manifest, official-source research, gate evaluator, technical preflight, owner action packet and blocked terminal receipt are implemented; exact-head proof and closeout remain pending. Real entry and all PRIMARY-PILOT evidence remain externally blocked.", f"Wave 0 finishing-line controls closed through PR #512 exact head `{SOURCE}`, squash-merged at `{MERGE}`. Technical preflight passed and P11-G14 is closed for that exact source. The lane is released; P11-G01–P11-G13, real entry and all PRIMARY-PILOT evidence remain externally blocked.")

verifier = ROOT / "scripts/phase11/verify-wave0-finishing-line.py"
replace(verifier, '    "Phase 11 Wave 0 finishing-line contract — CLAIMED",', '    "Phase 11 Wave 0 finishing-line contract — CLOSED AND PRESERVED",')
replace(verifier, 'require(PROJECT, "Active repository write lane:** Phase 11 Wave 0 finishing-line reconciliation")', 'require(PROJECT, "Active repository write lane:** none; Wave 0 finishing-line controls are closed")')
replace(verifier, '    "IMPLEMENTED — EXACT-HEAD EVIDENCE PENDING",', '    "PASSED — EXACT-HEAD TECHNICAL PREFLIGHT CLOSED",')
replace(verifier, '    "P11-G14 closed for that exact source only",', '    "P11-G14 is closed for that exact repository source only",')
replace(verifier, '    "maximum truthful repository completion",', '    "maximum truthful repository completion",\n    "P11-G14 is CLOSED",')
replace(verifier, 'if manifest["pilot_entry_approved"] is not False or manifest["primary_pilot_evidence_count"] != 0:', 'if manifest["technical_preflight"] != "PASSED":\n    raise SystemExit("Wave 0 technical preflight must be PASSED after closeout")\nif next(g for g in manifest["gates"] if g["id"] == "P11-G14")["state"] != "CLOSED":\n    raise SystemExit("Wave 0 P11-G14 must be CLOSED for exact source after closeout")\nif manifest["pilot_entry_approved"] is not False or manifest["primary_pilot_evidence_count"] != 0:')

print("PHASE11_WAVE0_CLOSEOUT_PATCH|PASS")
