#!/usr/bin/env bash
set -euo pipefail

: "${SOURCE_SHA:?SOURCE_SHA is required}"
: "${RUNNER_TEMP:?RUNNER_TEMP is required}"

output_dir="${VC8_ANDROID_EVIDENCE_DIR:-visual-evidence/android}"
diagnostics_dir="${RUNNER_TEMP}/vc8-android-capture"
mkdir -p "${output_dir}" "${diagnostics_dir}"
exec > >(tee "${diagnostics_dir}/capture.log") 2>&1

capture_diagnostics() {
  local label="$1"
  adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 || true
  adb pull /sdcard/window.xml "${diagnostics_dir}/${label}-window.xml" >/dev/null 2>&1 || true
  adb exec-out screencap -p > "${diagnostics_dir}/${label}-screen.png" 2>/dev/null || true
}

on_error() {
  local exit_code=$?
  capture_diagnostics "error"
  echo "Native evidence capture failed with exit code ${exit_code}." >&2
  exit "${exit_code}"
}
trap on_error ERR

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

target = ' '.join(os.environ['TARGET'].split())
root = ET.parse(os.path.join(os.environ['RUNNER_TEMP'], 'window.xml')).getroot()

for node in root.iter('node'):
    candidates = [
        ' '.join((node.attrib.get('text') or '').split()),
        ' '.join((node.attrib.get('content-desc') or '').split()),
    ]
    if any(candidate == target or target in candidate for candidate in candidates if candidate):
        match = re.match(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', node.attrib.get('bounds', ''))
        if match:
            x1, y1, x2, y2 = map(int, match.groups())
            print((x1 + x2) // 2, (y1 + y2) // 2)
            raise SystemExit(0)
raise SystemExit(f'Unable to find Android accessibility node containing: {target}')
PY
      then
        return 0
      fi
    fi
    sleep 1
  done
  return 1
}

print_visible_labels() {
  if [[ -f "${RUNNER_TEMP}/window.xml" ]]; then
    python - "${RUNNER_TEMP}/window.xml" <<'PY' || true
import sys
import xml.etree.ElementTree as ET
root = ET.parse(sys.argv[1]).getroot()
values = []
for node in root.iter('node'):
    for key in ('text', 'content-desc'):
        value = ' '.join((node.attrib.get(key) or '').split())
        if value and value not in values:
            values.append(value)
print('Visible accessibility labels: ' + ' | '.join(values[:160]))
PY
  fi
}

tap_target() {
  local target="$1"
  local slug
  slug="$(printf '%s' "${target}" | tr '[:upper:] ' '[:lower:]-')"
  if ! find_target_coords "${target}"; then
    capture_diagnostics "missing-${slug}"
    echo "Unable to locate Android UI target after retries: ${target}" >&2
    print_visible_labels >&2
    return 1
  fi
  read -r x y < "${RUNNER_TEMP}/coords.txt"
  echo "Tapping ${target} at ${x},${y}"
  adb shell input tap "${x}" "${y}"
  sleep 2
  capture_diagnostics "after-${slug}"
}

adb shell am force-stop com.kudzimusar.direkt.debug || true
if ! adb shell monkey -p com.kudzimusar.direkt.debug -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; then
  launch_component="$(adb shell cmd package resolve-activity --brief com.kudzimusar.direkt.debug | tr -d '\r' | tail -n 1)"
  test -n "${launch_component}"
  adb shell am start -n "${launch_component}" >/dev/null
fi

capture_diagnostics "startup-initial"
if ! find_target_coords "Customer"; then
  capture_diagnostics "app-startup-timeout"
  echo "DIREKT Compose UI did not expose the expected Customer mode after launch." >&2
  print_visible_labels >&2
  exit 1
fi
capture_diagnostics "customer-discovery"
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

trap - ERR
