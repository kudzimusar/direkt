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
component="${DIREKT_DEBUG_PACKAGE}/${DIREKT_MAIN_ACTIVITY}"
sdkmanager="${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager"
avdmanager="${ANDROID_HOME}/cmdline-tools/latest/bin/avdmanager"
emulator="${ANDROID_HOME}/emulator/emulator"

mkdir -p "${artifact_dir}"
: > "${diagnostic_file}"
: > "${results}"

test -x "${sdkmanager}"
test -x "${avdmanager}"
test -f "${APK_PATH}"

yes | "${sdkmanager}" --licenses >/dev/null 2>&1 || true
"${sdkmanager}" \
  "platform-tools" \
  "emulator" \
  "system-images;android-35;google_apis;x86_64" \
  >> "${diagnostic_file}" 2>&1

test -x "${emulator}"
"${avdmanager}" create avd \
  --force \
  --name "${avd_name}" \
  --package "system-images;android-35;google_apis;x86_64" \
  --device pixel_2 \
  >> "${diagnostic_file}" 2>&1 \
  <<< "no"

test -f "${HOME}/.android/avd/${avd_name}.ini"
"${emulator}" "@${avd_name}" \
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

adb wait-for-device
booted=false
for attempt in $(seq 1 120); do
  boot_completed="$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)"
  if [[ "${boot_completed}" == "1" ]]; then
    booted=true
    break
  fi
  if ! kill -0 "${emulator_pid}" >/dev/null 2>&1; then
    echo "Emulator exited before Android reported boot completion." >> "${diagnostic_file}"
    break
  fi
  sleep 2
done
test "${booted}" = "true"

adb shell settings put global window_animation_scale 0
adb shell settings put global transition_animation_scale 0
adb shell settings put global animator_duration_scale 0
adb install -r "${APK_PATH}" | tee -a "${diagnostic_file}"
adb shell pm path "${DIREKT_DEBUG_PACKAGE}" | tee -a "${diagnostic_file}"
adb shell pm clear "${DIREKT_DEBUG_PACKAGE}" | tee -a "${diagnostic_file}"

for sample in 1 2 3 4 5; do
  set +e
  output="$(adb shell am start -W -S -n "${component}" 2>&1)"
  start_exit="$?"
  set -e
  printf 'sample=%s exit=%s\n%s\n' "${sample}" "${start_exit}" "${output}" >> "${diagnostic_file}"
  test "${start_exit}" -eq 0

  total_ms="$(printf '%s\n' "${output}" | awk -F: '/TotalTime/ { gsub(/[[:space:]]/, "", $2); print $2 }')"
  [[ "${total_ms}" =~ ^[0-9]+$ ]]
  echo "${total_ms}" >> "${results}"
  adb shell am force-stop "${DIREKT_DEBUG_PACKAGE}"
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
