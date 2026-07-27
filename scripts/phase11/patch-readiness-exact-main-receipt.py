#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Phase 11 exact-main receipt missing text in {path.relative_to(ROOT)}: {old}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


def normalize(path: Path) -> None:
    lines = path.read_text(encoding="utf-8").splitlines()
    path.write_text("\n".join(line.rstrip() for line in lines) + "\n", encoding="utf-8")


lock = ROOT / "WORKSTREAM_LOCK.md"
replace(
    lock,
    "| Stable baseline | `main@2bf58c2c5df40aa76742730ec4a49644c2506a89` contains the reviewed Phase 11C–11J execution-readiness package and closed RC0–RC11 evidence. |",
    "| Stable baseline | `main@1c32171ddc46c8f5c0e8176b2be14c4d4f4d355c` contains the reviewed Phase 11C–11J readiness package, its exact closeout receipt and closed RC0–RC11 evidence. |",
)

receipt = ROOT / "docs/phase11/PHASE11_PRIMARY_PILOT_READINESS_RECEIPT.md"
replace(
    receipt,
    "**Implementation merge:** `2bf58c2c5df40aa76742730ec4a49644c2506a89`  \n**`PILOT_ENTRY_APPROVED`:** false",
    "**Implementation merge:** `2bf58c2c5df40aa76742730ec4a49644c2506a89`  \n**Closeout PR/head:** #509 / `311937bc08770c3ab664f15b1896fc4d5ec2f40a`  \n**Closeout merge:** `1c32171ddc46c8f5c0e8176b2be14c4d4f4d355c`  \n**`PILOT_ENTRY_APPROVED`:** false",
)

project = ROOT / "PROJECT_STATUS.md"
replace(
    project,
    "Phase 11C–11J execution readiness closed through PR #508 exact head `ae4fcb0350be4023f82e2be8df88c18cca583695`, squash-merged at `2bf58c2c5df40aa76742730ec4a49644c2506a89`. The lane is released; real entry and all PRIMARY-PILOT evidence remain externally blocked.",
    "Phase 11C–11J execution readiness implemented through PR #508 exact head `ae4fcb0350be4023f82e2be8df88c18cca583695`, squash-merged at `2bf58c2c5df40aa76742730ec4a49644c2506a89`, and closed through PR #509 exact head `311937bc08770c3ab664f15b1896fc4d5ec2f40a`, squash-merged at `1c32171ddc46c8f5c0e8176b2be14c4d4f4d355c`. The lane is released; real entry and all PRIMARY-PILOT evidence remain externally blocked.",
)

verifier = ROOT / "scripts/phase11/verify-primary-pilot-readiness.py"
text = verifier.read_text(encoding="utf-8")
old = '''    "Implementation merge:** `2bf58c2c5df40aa76742730ec4a49644c2506a89`",
    "PRIMARY-PILOT evidence count:** 0",
'''
new = '''    "Implementation merge:** `2bf58c2c5df40aa76742730ec4a49644c2506a89`",
    "Closeout PR/head:** #509 / `311937bc08770c3ab664f15b1896fc4d5ec2f40a`",
    "Closeout merge:** `1c32171ddc46c8f5c0e8176b2be14c4d4f4d355c`",
    "PRIMARY-PILOT evidence count:** 0",
'''
if old not in text:
    raise SystemExit("Phase 11 exact-main verifier receipt block did not match")
verifier.write_text(text.replace(old, new, 1), encoding="utf-8")

for target in (lock, receipt, project, verifier):
    normalize(target)

print("PHASE11_READINESS_EXACT_MAIN_RECEIPT_PATCH|PASS")
