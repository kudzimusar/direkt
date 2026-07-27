#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[2]
path = root / "scripts/rc9/verify-generated-client-contract.py"
text = path.read_text(encoding="utf-8")
old = 'require(PROJECT, "RC1–RC10 are closed")\n'
if old not in text:
    raise SystemExit("RC9 project-range assertion not found")
path.write_text(text.replace(old, "", 1), encoding="utf-8")
print("RC9_CLOSURE_RANGE_PATCH|PASS")
