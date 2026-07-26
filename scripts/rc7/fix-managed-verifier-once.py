#!/usr/bin/env python3
from pathlib import Path

path = Path('scripts/rc7/verify-maps-contract.py')
text = path.read_text(encoding='utf-8')
old = '        "refs/heads/main",\n'
new = '        "branches:\\n      - main",\n'
if text.count(old) != 1:
    raise SystemExit('expected one managed-main verifier needle')
path.write_text(text.replace(old, new, 1), encoding='utf-8')
