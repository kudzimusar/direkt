#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
path = ROOT / "scripts/rc9/generate-clients.sh"
text = path.read_text(encoding="utf-8")
old = '''if [[ "${MODE}" == "--write" ]]; then
  rm -rf "${DEST_ROOT}/kotlin/src" "${DEST_ROOT}/typescript/src"
  mkdir -p "$(dirname "${DEST_KOTLIN}")" "$(dirname "${DEST_TYPESCRIPT}")"
  cp -a "${normalized}/kotlin/src" "${DEST_ROOT}/kotlin/src"
  cp -a "${normalized}/typescript/src" "${DEST_ROOT}/typescript/src"
  cp "${normalized_receipt}" "${DEST_RECEIPT}"
  echo "RC9A_GENERATED_CLIENTS|WRITE|PASS"
'''
new = '''if [[ "${MODE}" == "--write" ]]; then
  rm -rf "${DEST_ROOT}/kotlin/src" "${DEST_ROOT}/typescript/src"
  mkdir -p "${DEST_KOTLIN}" "${DEST_TYPESCRIPT}"
  cp -a "${normalized_kotlin}/." "${DEST_KOTLIN}/"
  cp -a "${normalized_typescript}/." "${DEST_TYPESCRIPT}/"
  cp "${normalized_receipt}" "${DEST_RECEIPT}"
  echo "RC9A_GENERATED_CLIENTS|WRITE|PASS"
'''
if text.count(old) != 1:
    raise SystemExit("RC9A generated write-layout block not found exactly once")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
print("RC9A_GENERATED_WRITE_LAYOUT_PATCH|PASS")
