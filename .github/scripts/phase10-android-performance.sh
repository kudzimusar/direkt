#!/usr/bin/env bash
set -euo pipefail

: "${ANDROID_HOME:?ANDROID_HOME is required}"
: "${APK_PATH:?APK_PATH is required}"
: "${APK_SIZE_BYTES:?APK_SIZE_BYTES is required}"
: "${APK_SIZE_BUDGET_BYTES:?APK_SIZE_BUDGET_BYTES is required}"
: "${ANDROID_BUILD_DURATION_SECONDS:?ANDROID_BUILD_DURATION_SECONDS is required}"
: "${DIREKT_DEBUG_PACKAGE:?DIREKT_DEBUG_PACKAGE is required}"
: "${DIREKT_MAIN_ACTIVITY:?DIREKT_MAIN_ACTIVITY is required}"
: "${COLD_LAUNCH_MEDIAN_BUDGET_MS:?COLD_LAUNCH_MEDIAN_BUDGET_MS is required}"
: "${COLD_LAUNCH_P95_BUDGET_MS:?COLD_LAUNCH_P95_BUDGET_MS is required}"

artifact_dir="${GITHUB_WORKSPACE}/artifacts/phase10"
diagnostic_file="${artifact_dir}/android-performance-debug.txt"
results="${RUNNER_TEMP}/direkt-cold-launch-ms.txt"
avd_name="direkt-phase10-api35"
avd_home="${RUNNER_TEMP}/direkt-android-avd"
component="${DIREKT_DEBUG_PACKAGE}/${DIREKT_MAIN_ACTIVITY}"
sdkmanager="${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager"
avdmanager="${ANDROID_HOME}/cmdline-tools/latest/bin/avdmanager"
emulator="${ANDROID_HOME}/emulator/emulator"
adb="${ANDROID_HOME}/platform-tools/adb"

mkdir -p "${artifact_dir}" "${avd_home}"
: > "${diagnostic_file}"
: > "${results}"
export ANDROID_AVD_HOME="${avd_home}"

log_stage() {
  printf '\n=== %s ===\n' "$1" | tee -a "${diagnostic_file}"
}

log_stage "verify Android SDK tools"
test -x "${sdkmanager}"
test -x "${avdmanager}"
test -f "${APK_PATH}"

log_stage "install emulator and API 35 system image"
yes | "${sdkmanager}" --licenses >/dev/null 2>&1 || true
"${sdkmanager}" \
  "platform-tools" \
  "emulator" \
  "system-images;android-35;google_apis;x86_64" \
  >> "${diagnostic_file}" 2>&1

test -x "${emulator}"
test -x "${adb}"
"${emulator}" -version >> "${diagnostic_file}" 2>&1
"${adb}" version >> "${diagnostic_file}" 2>&1

log_stage "create deterministic AVD"
"${avdmanager}" create avd \
  --force \
  --name "${avd_name}" \
  --package "system-images;android-35;google_apis;x86_64" \
  --device pixel_2 \
  --path "${avd_home}/${avd_name}.avd" \
  >> "${diagnostic_file}" 2>&1 \
  <<< "no"

"${emulator}" -list-avds | tee -a "${diagnostic_file}"
"${emulator}" -list-avds | grep -Fx "${avd_name}" >/dev/null

log_stage "launch emulator"
"${adb}" kill-server >/dev/null 2>&1 || true
"${adb}" start-server >> "${diagnostic_file}" 2>&1
stdbuf -oL -eL "${emulator}" "@${avd_name}" \
  -no-window \
  -no-audio \
  -no-boot-anim \
  -no-snapshot \
  -gpu swiftshader_indirect \
  -camera-back none \
  -accel on \
  >> "${diagnostic_file}" 2>&1 &
emulator_pid="$!"
trap 'kill "${emulator_pid}" >/dev/null 2>&1 || true' EXIT

sleep 5
if ! kill -0 "${emulator_pid}" >/dev/null 2>&1; then
  set +e
  wait "${emulator_pid}"
  emulator_exit="$?"
  set -e
  echo "Emulator exited before ADB connection with status ${emulator_exit}." | tee -a "${diagnostic_file}"
  exit 1
fi

echo "Emulator process ${emulator_pid} is alive; waiting for ADB." >> "${diagnostic_file}"
timeout 180 "${adb}" wait-for-device

log_stage "wait for Android boot completion"
booted=false
for attempt in $(seq 1 120); do
  boot_completed="$(${adb} shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)"
  if [[ "${boot_completed}" == "1" ]]; then
    booted=true
    break
  fi
  if ! kill -0 "${emulator_pid}" >/dev/null 2>&1; then
    echo "Emulator exited before Android reported boot completion." | tee -a "${diagnostic_file}"
    break
  fi
  sleep 2
done
test "${booted}" = "true"
"${adb}" shell getprop ro.build.version.release >> "${diagnostic_file}"
"${adb}" shell getprop ro.build.version.sdk >> "${diagnostic_file}"

log_stage "install DIREKT and capture cold launches"
"${adb}" shell settings put global window_animation_scale 0
"${adb}" shell settings put global transition_animation_scale 0
"${adb}" shell settings put global animator_duration_scale 0
"${adb}" install -r "${APK_PATH}" | tee -a "${diagnostic_file}"
"${adb}" shell pm path "${DIREKT_DEBUG_PACKAGE}" | tee -a "${diagnostic_file}"
"${adb}" shell pm clear "${DIREKT_DEBUG_PACKAGE}" | tee -a "${diagnostic_file}"

for sample in 1 2 3 4 5; do
  set +e
  output="$(${adb} shell am start -W -S -n "${component}" 2>&1)"
  start_exit="$?"
  set -e
  printf 'sample=%s exit=%s\n%s\n' "${sample}" "${start_exit}" "${output}" >> "${diagnostic_file}"
  test "${start_exit}" -eq 0

  total_ms="$(printf '%s\n' "${output}" | awk -F: '/TotalTime/ { gsub(/[[:space:]]/, "", $2); print $2 }')"
  [[ "${total_ms}" =~ ^[0-9]+$ ]]
  echo "${total_ms}" >> "${results}"
  "${adb}" shell am force-stop "${DIREKT_DEBUG_PACKAGE}"
  sleep 1
done

sort -n "${results}" > "${results}.sorted"
median_ms="$(sed -n '3p' "${results}.sorted")"
p95_ms="$(tail -n 1 "${results}.sorted")"
test "${median_ms}" -le "${COLD_LAUNCH_MEDIAN_BUDGET_MS}"
test "${p95_ms}" -le "${COLD_LAUNCH_P95_BUDGET_MS}"
samples_json="$(jq -Rsc 'split("\n") | map(select(length > 0) | tonumber)' "${results}")"

jq -n \
  --arg sourceSha "${GITHUB_SHA}" \
  --arg packageName "${DIREKT_DEBUG_PACKAGE}" \
  --arg component "${component}" \
  --arg emulatorApi "35" \
  --argjson apkSizeBytes "${APK_SIZE_BYTES}" \
  --argjson apkSizeBudgetBytes "${APK_SIZE_BUDGET_BYTES}" \
  --argjson buildDurationSeconds "${ANDROID_BUILD_DURATION_SECONDS}" \
  --argjson samples "${samples_json}" \
  --argjson medianMs "${median_ms}" \
  --argjson p95Ms "${p95_ms}" \
  --argjson medianBudgetMs "${COLD_LAUNCH_MEDIAN_BUDGET_MS}" \
  --argjson p95BudgetMs "${COLD_LAUNCH_P95_BUDGET_MS}" \
  '{
    schemaVersion: 1,
    sourceSha: $sourceSha,
    dataClassification: "synthetic-local-only",
    packageName: $packageName,
    component: $component,
    emulatorApi: $emulatorApi,
    apk: {
      sizeBytes: $apkSizeBytes,
      sizeBudgetBytes: $apkSizeBudgetBytes,
      buildDurationSeconds: $buildDurationSeconds
    },
    coldLaunch: {
      samplesMs: $samples,
      medianMs: $medianMs,
      p95Ms: $p95Ms,
      medianBudgetMs: $medianBudgetMs,
      p95BudgetMs: $p95BudgetMs
    }
  }' > "${artifact_dir}/android-performance-evidence.json"
