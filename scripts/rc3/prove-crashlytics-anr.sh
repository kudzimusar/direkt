#!/usr/bin/env bash
set -euo pipefail

: "${ADB_BIN:?ADB_BIN is required}"
: "${FIREBASE_PACKAGE_NAME:?FIREBASE_PACKAGE_NAME is required}"
: "${RUNNER_TEMP:?RUNNER_TEMP is required}"

component="${FIREBASE_PACKAGE_NAME}/com.kudzimusar.direkt.MainActivity"
delivery_pattern='Crashlytics report successfully enqueued to DataTransport|Crashlytics report upload complete'
monitor_fifo="${RUNNER_TEMP}/rc3-am-monitor.in"
monitor_log="${RUNNER_TEMP}/rc3-am-monitor.log"
exit_info_log="${RUNNER_TEMP}/rc3-anr-exit-info.log"
monitor_pid=""
monitor_fd_open=false

cleanup() {
  if [[ "${monitor_fd_open}" == "true" ]]; then
    exec 9>&- || true
    monitor_fd_open=false
  fi
  if [[ -n "${monitor_pid}" ]] && kill -0 "${monitor_pid}" >/dev/null 2>&1; then
    kill "${monitor_pid}" >/dev/null 2>&1 || true
    wait "${monitor_pid}" 2>/dev/null || true
  fi
  rm -f "${monitor_fifo}"
}
trap cleanup EXIT

rm -f "${monitor_fifo}" "${monitor_log}" "${exit_info_log}"
mkfifo "${monitor_fifo}"

"${ADB_BIN}" logcat -c
"${ADB_BIN}" shell am force-stop "${FIREBASE_PACKAGE_NAME}" || true
# Keep the post-ANR ApplicationExitInfo assertion unambiguous. Android CTS uses the
# same shell command before validating REASON_ANR historical exit records.
"${ADB_BIN}" shell am clear-exit-info --user all "${FIREBASE_PACKAGE_NAME}" || true

# Register an ActivityManager controller before launching the canary. Continue the early
# ANR first so Android can collect normal traces, then wait for the full ANR callback and
# request the kill there, matching the CTS ApplicationExitInfo REASON_ANR sequence.
"${ADB_BIN}" shell am monitor -s -p "${FIREBASE_PACKAGE_NAME}" \
  < "${monitor_fifo}" > "${monitor_log}" 2>&1 &
monitor_pid=$!
exec 9>"${monitor_fifo}"
monitor_fd_open=true

monitor_ready=false
for _ in $(seq 1 20); do
  if grep -Fq 'Monitoring activity manager' "${monitor_log}" 2>/dev/null; then
    monitor_ready=true
    break
  fi
  sleep 1
done
test "${monitor_ready}" = "true"

"${ADB_BIN}" shell am start -n "${component}" --es direkt_rc3_crashlytics_canary anr >/dev/null
anr_process_started=false
for _ in $(seq 1 20); do
  if "${ADB_BIN}" shell pidof "${FIREBASE_PACKAGE_NAME}" >/dev/null 2>&1; then
    anr_process_started=true
    break
  fi
  sleep 1
done
test "${anr_process_started}" = "true"

# Wait until the debug-only canary confirms a focused Activity and emits its marker
# immediately before blocking the main looper. Persist the marker before later logcat
# snapshots can rotate it away.
block_started=false
for _ in $(seq 1 40); do
  "${ADB_BIN}" logcat -d > "${RUNNER_TEMP}/rc3-anr-system.log" || true
  if grep -Fq 'DIREKT_RC3_ANR_BLOCK_BEGIN' "${RUNNER_TEMP}/rc3-anr-system.log"; then
    grep -F 'DIREKT_RC3_ANR_BLOCK_BEGIN' "${RUNNER_TEMP}/rc3-anr-system.log" \
      | tail -n 4 > "${RUNNER_TEMP}/rc3-anr-block-marker.log" || true
    test -s "${RUNNER_TEMP}/rc3-anr-block-marker.log"
    block_started=true
    break
  fi
  sleep 1
done
test "${block_started}" = "true"

# A normal `input tap` uses WAIT_FOR_FINISH injection and can couple the shell command to
# the intentionally blocked app. Use an asynchronous key event instead: it is dispatched
# to the focused DIREKT window but the shell returns immediately, leaving this controller
# free to service Android's early/full ANR callbacks deterministically.
"${ADB_BIN}" shell input keyevent --async KEYCODE_DPAD_CENTER

# Mirror Android CTS ordering: wait for early ANR, continue it so traces are collected,
# then wait separately for the full ANR. Keep independent budgets because full ANR trace
# collection on the cold API-35 emulator can complete well after the 20-second block ends.
early_anr_seen=false
for _ in $(seq 1 30); do
  if grep -Fq "** EARLY PROCESS NOT RESPONDING: ${FIREBASE_PACKAGE_NAME}" "${monitor_log}" 2>/dev/null; then
    early_anr_seen=true
    break
  fi
  sleep 1
done
test "${early_anr_seen}" = "true"
printf 'c\n' >&9

controller_anr_seen=false
for _ in $(seq 1 90); do
  if grep -Fq "** PROCESS NOT RESPONDING: ${FIREBASE_PACKAGE_NAME}" "${monitor_log}" 2>/dev/null; then
    controller_anr_seen=true
    break
  fi
  sleep 1
done
test "${controller_anr_seen}" = "true"

anr_seen=false
for _ in $(seq 1 30); do
  "${ADB_BIN}" logcat -d > "${RUNNER_TEMP}/rc3-anr-system.log" || true
  if grep -Eqi "ANR in ${FIREBASE_PACKAGE_NAME}|ANR.*${FIREBASE_PACKAGE_NAME}" "${RUNNER_TEMP}/rc3-anr-system.log" \
    && grep -Eqi 'Input dispatching timed out' "${RUNNER_TEMP}/rc3-anr-system.log"; then
    anr_seen=true
    break
  fi
  sleep 1
done
test "${anr_seen}" = "true"

# Kill through ActivityManager's full-ANR controller, not am force-stop. Send only the
# kill result first and wait until ActivityManager has consumed it and the app process is
# gone; only then terminate the interactive monitor.
printf 'k\n' >&9

anr_process_gone=false
for _ in $(seq 1 30); do
  if ! "${ADB_BIN}" shell pidof "${FIREBASE_PACKAGE_NAME}" >/dev/null 2>&1; then
    anr_process_gone=true
    break
  fi
  sleep 1
done
test "${anr_process_gone}" = "true"

printf 'q\n' >&9 || true
exec 9>&-
monitor_fd_open=false
for _ in $(seq 1 10); do
  if ! kill -0 "${monitor_pid}" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
if kill -0 "${monitor_pid}" >/dev/null 2>&1; then
  kill "${monitor_pid}" >/dev/null 2>&1 || true
fi
wait "${monitor_pid}" 2>/dev/null || true
monitor_pid=""

# Crashlytics Android 11+ collects ANRs from historical process exit reasons. Prove the
# OS recorded this exact process death as reason 6 (ANR) before starting the flush process.
exit_reason_seen=false
for _ in $(seq 1 30); do
  "${ADB_BIN}" shell dumpsys activity exit-info "${FIREBASE_PACKAGE_NAME}" > "${exit_info_log}" || true
  if grep -Fq "process=${FIREBASE_PACKAGE_NAME} reason=6 (ANR)" "${exit_info_log}"; then
    exit_reason_seen=true
    break
  fi
  sleep 1
done
test "${exit_reason_seen}" = "true"

"${ADB_BIN}" logcat -c
"${ADB_BIN}" shell am start -n "${component}" --es direkt_rc3_crashlytics_canary flush >/dev/null
flush_started=false
for _ in $(seq 1 20); do
  if "${ADB_BIN}" shell pidof "${FIREBASE_PACKAGE_NAME}" >/dev/null 2>&1; then
    flush_started=true
    break
  fi
  sleep 1
done
test "${flush_started}" = "true"

delivered=false
for _ in $(seq 1 60); do
  "${ADB_BIN}" logcat -d -s FirebaseCrashlytics > "${RUNNER_TEMP}/rc3-anr-upload.log" || true
  if grep -Eqi "${delivery_pattern}" "${RUNNER_TEMP}/rc3-anr-upload.log"; then
    delivered=true
    break
  fi
  sleep 2
done
test "${delivered}" = "true"

"${ADB_BIN}" shell am start -n "${component}" --es direkt_rc3_crashlytics_canary disable >/dev/null || true
cat "${RUNNER_TEMP}/rc3-anr-block-marker.log"
grep -Ei "ANR in ${FIREBASE_PACKAGE_NAME}|ANR.*${FIREBASE_PACKAGE_NAME}|Input dispatching timed out" \
  "${RUNNER_TEMP}/rc3-anr-system.log" | tail -n 12
cat "${exit_info_log}"
grep -Ei "${delivery_pattern}" "${RUNNER_TEMP}/rc3-anr-upload.log" | tail -n 10
