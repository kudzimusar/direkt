#!/usr/bin/env bash
set -euo pipefail

: "${SOURCE_SHA:?SOURCE_SHA is required}"
: "${RUNNER_TEMP:?RUNNER_TEMP is required}"

output_dir="${VC8_ANDROID_EVIDENCE_DIR:-visual-evidence/android}"
mkdir -p "${output_dir}"

adb shell monkey -p com.kudzimusar.direkt.debug -c android.intent.category.LAUNCHER 1 >/dev/null
sleep 4
adb exec-out screencap -p > "${output_dir}/android-customer-discovery.png"

tap_text() {
  local target="$1"
  adb shell uiautomator dump /sdcard/window.xml >/dev/null
  adb pull /sdcard/window.xml "${RUNNER_TEMP}/window.xml" >/dev/null
  TARGET="${target}" RUNNER_TEMP="${RUNNER_TEMP}" python - <<'PY' > "${RUNNER_TEMP}/coords.txt"
import os
import re
import xml.etree.ElementTree as ET

target = os.environ['TARGET']
root = ET.parse(os.path.join(os.environ['RUNNER_TEMP'], 'window.xml')).getroot()
for node in root.iter('node'):
    if node.attrib.get('text') == target:
        match = re.match(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', node.attrib.get('bounds', ''))
        if match:
            x1, y1, x2, y2 = map(int, match.groups())
            print((x1 + x2) // 2, (y1 + y2) // 2)
            raise SystemExit(0)
raise SystemExit(f'Unable to find Android text node: {target}')
PY
  read -r x y < "${RUNNER_TEMP}/coords.txt"
  adb shell input tap "${x}" "${y}"
  sleep 2
}

tap_text "Provider"
tap_text "Overview"
adb exec-out screencap -p > "${output_dir}/android-provider-overview.png"
tap_text "Evidence"
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
