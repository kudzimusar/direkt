#!/usr/bin/env python3
# Owner-authored retrigger after wording normalization.
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCK = ROOT / "WORKSTREAM_LOCK.md"
PROJECT = ROOT / "PROJECT_STATUS.md"
RECEIPT = ROOT / "docs/phase11/PHASE11_TERMINAL_ADMINISTRATIVE_DISPOSITION.md"
VERIFIER = ROOT / "scripts/phase11/verify-terminal-administrative-disposition.py"

PR_NUMBER = os.environ["PR_NUMBER"]
if not PR_NUMBER.isdigit():
    raise SystemExit(f"Invalid PR number: {PR_NUMBER}")


def replace(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Phase 11 terminal disposition missing expected text in {path.relative_to(ROOT)}: {old}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


replace(LOCK, "| Status | RELEASED — UIA CURRENT-MAIN OWNER REVIEW CLOSED AND PRESERVED |", "| Status | RELEASED — PHASE 11 TRACKER CLOSED NOT PLANNED / RE-ENTRY REQUIRES NEW AUTHORIZATION |")
replace(LOCK, "| Owner/agent | None. UIA current-main owner-review refresh is closed; Issue #112 remains the sole open programme issue. |", "| Owner/agent | None. Phase 11 controlled-pilot tracking is closed not planned before participant entry. |")
replace(LOCK, "| Authorized scope | No active repository write scope. A new explicit claim is required for actual Phase 11 external evidence, a formal STOP decision, or participant-backed execution. |", "| Authorized scope | No active repository write scope. Restarting the Zambia pilot requires a new issue, a new explicit claim, fresh owner authorization and satisfaction of every applicable external entry gate. |")
replace(LOCK, "| Implementation branch | None. UIA final closeout PR #520 records managed source `bb84968453b891dd511faddc093a8874fce8abc4` and the four approved owner-review runtimes. |", f"| Implementation branch | None. Phase 11 terminal administrative disposition PR #{PR_NUMBER} closes the tracker without claiming pilot completion. |")
replace(LOCK, "| Current task | None. UIA is closed. Phase 11 remains `ENTRY_BLOCKED_EXTERNAL`; P11-G01–P11-G13 remain open, `PILOT_ENTRY_APPROVED` remains false and PRIMARY-PILOT evidence count remains 0. |", "| Current task | None. The proposed controlled pilot is stopped before entry and the tracker is closed not planned. P11-G01–P11-G13 remain unsatisfied, `PILOT_ENTRY_APPROVED` remains false and PRIMARY-PILOT evidence count remains 0. |")
replace(LOCK, "| Governing issue | Issue #112 remains open for external entry gates and final programme disposition. Issue #354 is closed and preserved. |", "| Governing issue | Issue #112 is closed not planned after the terminal administrative receipt. Any future Zambia pilot requires a new governing issue. Issue #354 remains closed and preserved. |")
replace(LOCK, "| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized. |", "| Formal programme phase | The real Phase 11 pilot was not run and is not complete; its tracker is administratively closed not planned. Formal Phase 12 production release is not authorized. |")
replace(LOCK, "| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates. |", "| Production-release authorization | BLOCKED. No primary pilot evidence or evidence-backed 11J `PROCEED` exists, and all global release gates remain mandatory. |")

replace(PROJECT, "**Updated:** 2026-07-27 (Asia/Tokyo)", "**Updated:** 2026-07-28 (Asia/Tokyo)")
replace(PROJECT, "**Active repository write lane:** none; UIA current-main owner review is closed and final Phase 11 disposition is next but unclaimed", "**Active repository write lane:** none; the Phase 11 controlled-pilot tracker is closed not planned before entry and any restart requires a new authorization lane")
replace(PROJECT, "- Phase 11 Wave 0 finishing-line controls — **CLOSED AND PRESERVED / TECHNICAL PREFLIGHT PASSED / ENTRY_BLOCKED_EXTERNAL**;", "- Phase 11 Wave 0 finishing-line controls — **CLOSED AND PRESERVED / TECHNICAL PREFLIGHT PASSED / ENTRY_BLOCKED_EXTERNAL**;\n- Phase 11 controlled Zambia pilot — **NOT RUN / STOPPED BEFORE ENTRY / TRACKER CLOSED NOT PLANNED**;")
replace(PROJECT, "VC1–VC8 completion does not replace or weaken the remaining Phase 11 real-world evidence, privacy/legal, payment, external-communications or production-release gates.", "Administrative closure of Issue #112 does not mean Phase 11 completed. The real controlled pilot did not run, no primary evidence exists, and all privacy/legal/provider/participant/payment/production gates remain mandatory for any future re-entry.")

RECEIPT.parent.mkdir(parents=True, exist_ok=True)
RECEIPT.write_text(f"""# Phase 11 Terminal Administrative Disposition

**State:** STOPPED BEFORE ENTRY / TRACKER CLOSED NOT PLANNED  
**Governing issue:** #112  
**Disposition PR:** #{PR_NUMBER}  
**Decision date:** 2026-07-28 (Asia/Tokyo)  
**Real controlled pilot:** not run  
**Primary-pilot evidence count:** 0  
**PILOT_ENTRY_APPROVED:** false  
**Phase 12 production authorization:** false

## Owner direction

The owner directed the repository backlog to be cleared. Because the Zambia controlled pilot never received the required external entry evidence and never admitted or processed real participants, the only truthful terminal disposition is to stop the proposed pilot before entry and close the tracking issue as **not planned**.

This is an administrative programme disposition. It is not an evidence-backed Phase 11J STOP decision, does not claim that Phase 11 completed, and does not convert synthetic, sandbox, managed-canary or repository-readiness evidence into primary pilot evidence.

## Preserved facts

- P11-G01 through P11-G13 remain unsatisfied/open as entry requirements.
- The Wave 0 technical preflight remains passed for its exact historical source only.
- `PILOT_ENTRY_APPROVED` remains false.
- PRIMARY-PILOT observations, findings and metrics remain at zero.
- No participant recruitment, admission, consent, data processing, telemetry, Maps usage, communications or evidence handling occurred.
- No real payment moved and no payment state affected trust, verification, publication or ranking.
- No evidence-backed 11J `PROCEED` exists.
- Formal Phase 12 production release remains unauthorized.

## Re-entry rule

A future Zambia pilot may start only through a new governing issue and explicit workstream claim after all applicable requirements are supplied and independently reconciled, including:

1. Zambia DPC registration/controller-processor evidence;
2. overseas storage and transfer determination;
3. qualified Zambia legal/privacy/consumer/trust review;
4. final participant notice, consent, retention, deletion, withdrawal and complaint documents;
5. named pilot scope, cohort, geography, category, support, incident, privacy and operations owners;
6. real-environment invitation/authentication/private-storage/withdrawal/deletion canaries;
7. zero unresolved critical/high entry defects;
8. explicit owner authorization before changing `PILOT_ENTRY_APPROVED`.

## Final boundary

Issue #112 may close as **not planned** only. The repository remains safe, reviewable and execution-ready at the synthetic boundary, but it is not authorized for real participant pilot execution or production release.
""", encoding="utf-8")

VERIFIER.write_text('''#!/usr/bin/env python3
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
''', encoding="utf-8")

print("PHASE11_TERMINAL_ADMINISTRATIVE_DISPOSITION_PATCH|PASS")