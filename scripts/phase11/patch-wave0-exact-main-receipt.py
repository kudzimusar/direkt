#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CLOSEOUT_HEAD = "1e4291ef669ca01eb4f639b2f1734a85d8448a63"
CLOSEOUT_MERGE = "632dd0bdbb2a3b8c24bd285918deff3e54bd3ba9"


def replace(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Wave 0 exact-main receipt missing text in {path.relative_to(ROOT)}: {old}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


lock = ROOT / "WORKSTREAM_LOCK.md"
replace(
    lock,
    "| Implementation branch | None. Wave 0 implementation PR #512 merged at `f561658d140aaf214fa6eaca99c80bcc98ee284f`. |",
    f"| Implementation branch | None. Wave 0 implementation PR #512 merged at `f561658d140aaf214fa6eaca99c80bcc98ee284f`; closeout PR #513 exact head `{CLOSEOUT_HEAD}` merged at `{CLOSEOUT_MERGE}`. |",
)
replace(
    lock,
    "| Stable baseline | `main@f561658d140aaf214fa6eaca99c80bcc98ee284f` contains the verified Wave 0 finishing-line controls, technical preflight and closed RC0–RC11/readiness evidence. |",
    f"| Stable baseline | `main@{CLOSEOUT_MERGE}` contains the verified Wave 0 finishing-line controls, exact closeout receipt, technical preflight and closed RC0–RC11/readiness evidence. |",
)

receipt = ROOT / "docs/phase11/PHASE11_WAVE0_TERMINAL_RECEIPT.md"
replace(
    receipt,
    "**Implementation merge:** `f561658d140aaf214fa6eaca99c80bcc98ee284f`",
    f"**Implementation merge:** `f561658d140aaf214fa6eaca99c80bcc98ee284f`\n**Closeout PR/head:** #513 / `{CLOSEOUT_HEAD}`\n**Closeout merge:** `{CLOSEOUT_MERGE}`",
)

project = ROOT / "PROJECT_STATUS.md"
replace(
    project,
    "Wave 0 finishing-line controls closed through PR #512 exact head `1befa902def70d2c997aaba260e0d8e2a5d4b12d`, squash-merged at `f561658d140aaf214fa6eaca99c80bcc98ee284f`. Technical preflight passed and P11-G14 is closed for that exact source. The lane is released; P11-G01–P11-G13, real entry and all PRIMARY-PILOT evidence remain externally blocked.",
    f"Wave 0 finishing-line controls implemented through PR #512 exact head `1befa902def70d2c997aaba260e0d8e2a5d4b12d`, squash-merged at `f561658d140aaf214fa6eaca99c80bcc98ee284f`, and closed through PR #513 exact head `{CLOSEOUT_HEAD}`, squash-merged at `{CLOSEOUT_MERGE}`. Technical preflight passed and P11-G14 is closed for the implementation source. The lane is released; P11-G01–P11-G13, real entry and all PRIMARY-PILOT evidence remain externally blocked.",
)

verifier = ROOT / "scripts/phase11/verify-wave0-finishing-line.py"
replace(
    verifier,
    '    "P11-G14 is CLOSED",',
    f'    "P11-G14 is CLOSED",\n    "Closeout PR/head:** #513 / `{CLOSEOUT_HEAD}`",\n    "Closeout merge:** `{CLOSEOUT_MERGE}`",',
)
replace(
    verifier,
    'require(PROJECT, "Active repository write lane:** none; Wave 0 finishing-line controls are closed")',
    f'require(PROJECT, "Active repository write lane:** none; Wave 0 finishing-line controls are closed")\nrequire(PROJECT, "closed through PR #513 exact head `{CLOSEOUT_HEAD}`")\nrequire(LOCK, "Stable baseline | `main@{CLOSEOUT_MERGE}`")',
)

print("PHASE11_WAVE0_EXACT_MAIN_RECEIPT_PATCH|PASS")
