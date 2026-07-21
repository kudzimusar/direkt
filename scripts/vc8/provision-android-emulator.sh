#!/usr/bin/env bash
set -euxo pipefail

: "${RUNNER_TEMP:?RUNNER_TEMP is required}"
: "${GITHUB_WORKSPACE:?GITHUB_WORKSPACE is required}"

exec > >(tee "${RUNNER_TEMP}/vc8-provision.log") 2>&1
: > "${RUNNER_TEMP}/vc8-emulator.log"

sdk_root="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"
if [[ -z "${sdk_root}" || ! -d "${sdk_root}" ]]; then
  echo "Android SDK root is unavailable." >&2
  exit 1
fi

sdkmanager="$(find "${sdk_root}/cmdline-tools" -type f -name sdkmanager 2>/dev/null | sort | tail -n 1 || true)"
avdmanager="$(find "${sdk_root}/cmdline-tools" -type f -name avdmanager 2>/dev/null | sort | tail -n 1 || true)"
[[ -n "${sdkmanager}" ]] || sdkmanager="$(command -v sdkmanager || true)"
[[ -n "${avdmanager}" ]] || avdmanager="$(command -v avdmanager || true)"
emulator="${sdk_root}/emulator/emulator"

printf 'SDK root: %s\nSDK manager: %s\nAVD manager: %s\nEmulator: %s\n' \
  "${sdk_root}" "${sdkmanager:-<missing>}" "${avdmanager:-<missing>}" "${emulator}"

for tool in "${sdkmanager}" "${avdmanager}" "${emulator}"; do
  if [[ -z "${tool}" || ! -x "${tool}" ]]; then
    echo "Required Android emulator tool unavailable: ${tool:-<empty>}" >&2
    find "${sdk_root}" -maxdepth 5 -type f \( -name sdkmanager -o -name avdmanager -o -name emulator \) -print || true
    exit 1
  fi
done

printf 'y\n' | "${sdkmanager}" --licenses >/dev/null || true
"${sdkmanager}" --install \
  "platform-tools" \
  "emulator" \
  "system-images;android-35;google_apis;x86_64"

echo no | "${avdmanager}" create avd \
  --force \
  --name direkt-vc8 \
  --package "system-images;android-35;google_apis;x86_64"

if [[ -e /dev/kvm ]]; then
  sudo chmod 666 /dev/kvm || true
fi

adb kill-server || true
adb start-server
nohup "${emulator}" \
  -avd direkt-vc8 \
  -no-window \
  -no-audio \
  -no-boot-anim \
  -gpu swiftshader_indirect \
  -no-snapshot \
  -no-metrics \
  > "${RUNNER_TEMP}/vc8-emulator.log" 2>&1 &

echo $! > "${RUNNER_TEMP}/vc8-emulator.pid"
adb wait-for-device

for attempt in $(seq 1 120); do
  boot_completed="$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)"
  if [[ "${boot_completed}" == "1" ]]; then
    break
  fi
  if ! kill -0 "$(cat "${RUNNER_TEMP}/vc8-emulator.pid")" 2>/dev/null; then
    echo "Android emulator process exited before boot completion." >&2
    cat "${RUNNER_TEMP}/vc8-emulator.log" >&2 || true
    exit 1
  fi
  if [[ "${attempt}" == "120" ]]; then
    echo "Android emulator did not finish booting within the bounded timeout." >&2
    cat "${RUNNER_TEMP}/vc8-emulator.log" >&2 || true
    exit 1
  fi
  sleep 2
done

adb shell input keyevent 82 || true
adb shell settings put global window_animation_scale 0
adb shell settings put global transition_animation_scale 0
adb shell settings put global animator_duration_scale 0

apk="${GITHUB_WORKSPACE}/android/direkt-app/app/build/outputs/apk/debug/app-debug.apk"
test -f "${apk}"
adb install -r "${apk}"
adb shell pm list packages | grep -F 'package:com.kudzimusar.direkt.debug'
