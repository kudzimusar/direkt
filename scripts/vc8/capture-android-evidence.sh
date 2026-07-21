#!/usr/bin/env bash
set -euo pipefail

: "${SOURCE_SHA:?SOURCE_SHA is required}"
: "${RUNNER_TEMP:?RUNNER_TEMP is required}"

output_dir="${VC8_ANDROID_EVIDENCE_DIR:-visual-evidence/android}"
diagnostics_dir="${RUNNER_TEMP}/vc8-android-capture"
mkdir -p "${output_dir}" "${diagnostics_dir}"

capture_diagnostics() {
  local label="$1"
  adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 || true
  adb pull /sdcard/window.xml "${diagnostics_dir}/${label}-window.xml" >/dev/null 2>&1 || true
  adb exec-out screencap -p > "${diagnostics_dir}/${label}-screen.png" 2>/dev/null || true
}

find_target_coords() {
  local target="$1"
  local attempt
  for attempt in $(seq 1 12); do
    adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 || true
    if adb pull /sdcard/window.xml "${RUNNER_TEMP}/window.xml" >/dev/null 2>&1; then
      if TARGET="${target}" RUNNER_TEMP="${RUNNER_TEMP}" python - <<'PY' > "${RUNNER_TEMP}/coords.txt" 2> "${RUNNER_TEMP}/coords.err"
import os
import re
import xml.etree.ElementTree as ET

target = os.environ['TARGET'].strip()
root = ET.parse(os.path.join(os.environ['RUNNER_TEMP'], 'window.xml')).getroot()

def normalized(value: str | None) -> str:
    return ' '.join((value or '').split())

for node in root.iter('node'):
    candidates = [normalized(node.attrib.get('text')), normalized(node.attrib.get('content-desc'))]
    if target in candidates:
        match = re.match(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', node.attrib.get('bounds', ''))
        if match:
            x1, y1, x2, y2 = map(int, match.groups())
            print((x1 + x2) // 2, (y1 + y2) // 2)
            raise SystemExit(0)
raise SystemExit(f'Unable to find Android accessibility node: {target}')
PY
      then
        return 0
      fi
    fi
    sleep 1
  done
  return 1
}

tap_target() {
  local target="$1"
  local slug
  slug="$(printf '%s' "${target}" | tr '[:upper:] ' '[:lower:]-')"
  if ! find_target_coords "${target}"; then
    capture_diagnostics "missing-${slug}"
    echo "Unable to locate Android UI target after retries: ${target}" >&2
    if [[ -f "${RUNNER_TEMP}/window.xml" ]]; then
      python - "${RUNNER_TEMP}/window.xml" <<'PY' >&2 || true
import sys
import xml.etree.ElementTree as ET
root = ET.parse(sys.argv[1]).getroot()
values = []
for node in root.iter('node'):
    for key in ('text', 'content-desc'):
        value = ' '.join((node.attrib.get(key) or '').split())
        if value and value not in values:
            values.append(value)
print('Visible accessibility labels: ' + ' | '.join(values[:120]))
PY
    fi
    return 1
  fi
  read -r x y < "${RUNNER_TEMP}/coords.txt"
  adb shell input tap "${x}" "${y}"
  sleep 2
}

adb shell monkey -p com.kudzimusar.direkt.debug -c android.intent.category.LAUNCHER 1 >/dev/null

if ! find_target_coords "Customer"; then
  capture_diagnostics "app-startup"
  echo "DIREKT Compose UI did not become accessible after launch." >&2
  exit 1
fi

adb exec-out screencap -p > "${output_dir}/android-customer-discovery.png"

tap_target "Provider"
tap_target "Overview"
adb exec-out screencap -p > "${output_dir}/android-provider-overview.png"
tap_target "Evidence"
adb exec-out screencap -p > "${output_dir}/android-provider-evidence.png"

cat > "${output_dir}/metadata.json" <<EOF
{
  "sourceSha": "${SOURCE_SHA}",
  "data": "synthetic review data only",
  "device": "Pixel 2 class emulator / Android API 35",
  "captures": [
    {"file":"android-customer-discovery.png","state":"customer discovery"},
    {"file":"android-provider-overview.png","state":"provider overview"},
    {"file":"android-provider-evidence.png","state":"provider evidence/recovery"}
  ]
}
EOF
