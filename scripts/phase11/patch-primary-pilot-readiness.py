#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Phase 11 readiness patch missing text in {path.relative_to(ROOT)}: {old}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


def normalize(path: Path) -> None:
    lines = path.read_text(encoding="utf-8").splitlines()
    path.write_text("\n".join(line.rstrip() for line in lines) + "\n", encoding="utf-8")


lock = ROOT / "WORKSTREAM_LOCK.md"
replace(
    lock,
    "| Protected surface | Closed RC0–RC10 evidence, canonical OpenAPI authorization/privacy checks, Android auth/session and Firebase controls, customer/provider web BFF/private Cloud Run IAM, operations portal, RC8 payment boundaries, UIA Issue #354, VC1–VC8 Design DNA and Phase 11/12 gates. |",
    "| Protected surface | Closed RC0–RC11 evidence, canonical OpenAPI authorization/privacy checks, Android auth/session and Firebase controls, customer/provider web BFF/private Cloud Run IAM, operations portal, RC8 payment boundaries, UIA Issue #354, VC1–VC8 Design DNA and Phase 11/12 gates. |",
)
replace(
    lock,
    "| Implementation branch | `phase11/primary-pilot-readiness`, based on `main@321e74f56e48f239011fe1bba4d430e360709bc4`. |",
    "| Implementation branch | `phase11/primary-pilot-readiness`, based on readiness claim merge `main@e79d8c4794c27ee16deaefdb56856d97cd5933a5`. |",
)
replace(
    lock,
    "| Stable baseline | `main@321e74f56e48f239011fe1bba4d430e360709bc4` contains closed RC0–RC11 evidence and the released integration programme. |",
    "| Stable baseline | `main@e79d8c4794c27ee16deaefdb56856d97cd5933a5` contains closed RC0–RC11 evidence and the formal Phase 11C–11J readiness claim. |",
)
replace(
    lock,
    "| Current task | Phase 11C–11J execution-readiness package only. `PILOT_ENTRY_APPROVED` remains false and the PRIMARY-PILOT evidence register remains empty. |",
    "| Current task | Phase 11C–11J execution-readiness package implemented; exact-head regression, status promotion and handoff remain pending. `PILOT_ENTRY_APPROVED` remains false and the PRIMARY-PILOT evidence register remains empty. |",
)
replace(
    lock,
    "## Runtime integration closure contract",
    """## Phase 11C–11J execution-readiness contract — CLAIMED

1. This lane creates execution instruments only; it does not authorize participant recruitment, admission, data processing, external communication, provider activation, payment or production traffic.
2. `PILOT_ENTRY_APPROVED` remains false and fail-closed. No workflow, deployment or documentation change may set it true in this lane.
3. `PRIMARY_PILOT_EVIDENCE_REGISTER.md` remains explicitly empty until approved, consenting participants generate evidence in the authorized pilot environment.
4. The protocol must cover 11C provider onboarding/evidence, 11D discovery/location/trust, 11E enquiries/handoff/reviews, 11F operations/field capacity, 11G devices/connectivity, 11H pricing/economics, 11I canonical corrections and 11J exit decision.
5. The real-entry blocker register preserves DPC, transfer, qualified legal/privacy/consumer, notice/consent, Firebase real-canary, private-storage and deletion/withdrawal gates as open until actual evidence closes them.
6. Wave ceilings remain at most 8 providers and 20 customers; actual approved counts may be lower and must be recorded before invitations.
7. Immediate stop rules protect consent, authorization, private evidence, exact private coordinates, participant safety, credentials, data integrity, unsupported trust claims and real-money boundaries.
8. Every 11I correction uses canonical production code, forward-only migrations, backend authorization, OpenAPI/client boundaries and full regression; pilot-only shortcuts are prohibited.
9. The 11J instrument must require exactly one evidence-backed STOP, REPEAT, NARROW or PROCEED decision and must keep Phase 12 authorization false unless separately approved.
10. Closure requires authoritative status reconciliation, permanent verifier success, exact-head regression and an Issue #112 handoff that clearly states execution ready but real entry blocked.

## Runtime integration closure contract""",
)

project = ROOT / "PROJECT_STATUS.md"
replace(
    project,
    "**Active repository write lane:** none; RC0–RC11 are closed",
    "**Active repository write lane:** Phase 11C–11J execution readiness under Issue #112",
)
replace(
    project,
    "- Phase 11 real 11C–11H evidence and 11J — **pending / externally gated**;",
    "- Phase 11 11C–11J execution package — **EXECUTION READY / REAL ENTRY BLOCKED / NO PRIMARY-PILOT EVIDENCE**;",
)
replace(
    project,
    "RC10 is closed on implementation PR #502 exact head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`, squash-merged at `620a99ba5465ad38ce012df0a8fa15e458de6505`. RC11 closed through PR #505 exact head `66626d315a8d132dbf8f34749a2679e42c609d7c`, squash-merged at `87f567fccfa92244c7951432436c7163c71d5fc7`. The integration lane is released; Phase 11C–11J execution preparation is next but unclaimed, and real Phase 11 evidence remains externally gated.",
    "RC10 is closed on implementation PR #502 exact head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`, squash-merged at `620a99ba5465ad38ce012df0a8fa15e458de6505`. RC11 closed through PR #505 exact head `66626d315a8d132dbf8f34749a2679e42c609d7c`, squash-merged at `87f567fccfa92244c7951432436c7163c71d5fc7`. Phase 11C–11J execution readiness is the active repository lane from claim merge `e79d8c4794c27ee16deaefdb56856d97cd5933a5`; the operating instruments are implemented, but real entry and all primary evidence remain externally blocked.",
)

control = ROOT / "docs/phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md"
replace(
    control,
    "**Status:** SYNTHETIC FUNCTIONAL READINESS COMPLETE — REAL PARTICIPANT PILOT STILL EXTERNALLY BLOCKED  ",
    "**Status:** PRIMARY-PILOT EXECUTION READINESS IMPLEMENTED — REAL PARTICIPANT PILOT STILL EXTERNALLY BLOCKED",
)
replace(
    control,
    "## Phase 12 boundary",
    """## Primary-pilot execution-readiness package

The repository now contains one canonical preparation package for the real evidence stages:

- `PHASE11C_11J_EXECUTION_PROTOCOL.md` — goals, evidence, metrics and exit conditions for 11C–11J;
- `PRIMARY_PILOT_EVIDENCE_REGISTER.md` — minimized evidence schema with **NO PRIMARY-PILOT EVIDENCE RECORDED**;
- `PHASE11_WAVE_RUNBOOK.md` — Wave 0 preflight, participant/operations steps, daily review, stop/pause and end-of-wave controls;
- `PHASE11_REAL_ENTRY_BLOCKER_REGISTER_2026-07-28.md` — hard and conditional real-entry gates;
- `PHASE11_FINDINGS_AND_CORRECTIONS_REGISTER.md` — defect/assumption/request/incident classification and canonical 11I correction path;
- `PHASE11_11J_DECISION_TEMPLATE.md` — evidence-backed STOP / REPEAT / NARROW / PROCEED decision instrument.

This package makes execution operationally ready but does not start 11C, create participant evidence or change the real-entry decision. The primary evidence count remains zero. `PILOT_ENTRY_APPROVED=true` remains prohibited until every applicable hard gate is supported by actual evidence and explicit owner authorization.

## Phase 12 boundary""",
)

for target in (lock, project, control):
    normalize(target)

print("PHASE11_PRIMARY_PILOT_READINESS_PATCH|PASS")
