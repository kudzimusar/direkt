#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[2]
for relative in (
    "docs/integrations/RC11_MANAGED_EVIDENCE_INDEX.md",
    "docs/integrations/RC11_RECONCILIATION_RECORD.md",
):
    path = root / relative
    lines = path.read_text(encoding="utf-8").splitlines()
    path.write_text("\n".join(line.rstrip() for line in lines) + "\n", encoding="utf-8")
print("RC11_CLOSEOUT_WHITESPACE_PATCH|PASS")
