#!/usr/bin/env bash
set -euo pipefail

ANDROID_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
REPO_ROOT="$(git -C "${ANDROID_ROOT}" rev-parse --show-toplevel)"
REPO_ROOT="$(cd "${REPO_ROOT}" && pwd -P)"
VERSION_FILE="${ANDROID_ROOT}/release/version.properties"

fail() {
  echo "Phase 12A release contract violation: $*" >&2
  exit 1
}

read_single_property() {
  local key="$1"
  local count
  local value

  count="$(awk -F= -v key="${key}" '$1 == key { count += 1 } END { print count + 0 }' "${VERSION_FILE}")"
  [[ "${count}" == "1" ]] || fail "${key} must appear exactly once in release/version.properties"

  value="$(awk -F= -v key="${key}" '$1 == key { sub(/^[^=]*=/, ""); print; exit }' "${VERSION_FILE}")"
  [[ -n "${value}" ]] || fail "${key} must not be empty"
  printf '%s' "${value}"
}

[[ -f "${VERSION_FILE}" ]] || fail "release/version.properties is missing"

VERSION_CODE="$(read_single_property DIREKT_RELEASE_VERSION_CODE)"
VERSION_NAME="$(read_single_property DIREKT_RELEASE_VERSION_NAME)"
RELEASE_CHANNEL="$(read_single_property DIREKT_RELEASE_CHANNEL)"

[[ "${VERSION_CODE}" =~ ^[0-9]+$ ]] || fail "DIREKT_RELEASE_VERSION_CODE must be numeric"
(( VERSION_CODE >= 1 && VERSION_CODE <= 2100000000 )) || fail "DIREKT_RELEASE_VERSION_CODE is outside Android's supported range"
[[ "${VERSION_NAME}" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z][0-9A-Za-z.-]*)?$ ]] || fail "DIREKT_RELEASE_VERSION_NAME must use the approved SemVer-like format"

case "${RELEASE_CHANNEL}" in
  preauthorization)
    [[ "${VERSION_NAME}" == *preauth* ]] || fail "preauthorization versionName must contain 'preauth'"
    ;;
  release-candidate)
    [[ "${VERSION_NAME}" == *rc* ]] || fail "release-candidate versionName must contain 'rc'"
    ;;
  production)
    [[ "${VERSION_NAME}" != *preauth* && "${VERSION_NAME}" != *rc* ]] || fail "production versionName must not contain preauth/rc labels"
    ;;
  *)
    fail "unsupported DIREKT_RELEASE_CHANNEL '${RELEASE_CHANNEL}'"
    ;;
esac

if git -C "${REPO_ROOT}" ls-files | grep -E '\.(jks|keystore|p12|pfx)$' >/dev/null; then
  fail "signing key material is tracked by git"
fi

if git -C "${REPO_ROOT}" ls-files | grep -E '(^|/)google-services\.json$' >/dev/null; then
  fail "google-services.json must not be tracked in the public repository"
fi

SIGNING_ENABLED="${DIREKT_RELEASE_SIGNING_ENABLED:-false}"
[[ "${SIGNING_ENABLED}" == "true" || "${SIGNING_ENABLED}" == "false" ]] || fail "DIREKT_RELEASE_SIGNING_ENABLED must be exactly true or false"

if [[ "${SIGNING_ENABLED}" == "true" ]]; then
  [[ "${RELEASE_CHANNEL}" != "preauthorization" ]] || fail "preauthorization builds can never enable release signing"

  for name in \
    DIREKT_UPLOAD_KEYSTORE_PATH \
    DIREKT_UPLOAD_KEYSTORE_PASSWORD \
    DIREKT_UPLOAD_KEY_ALIAS \
    DIREKT_UPLOAD_KEY_PASSWORD; do
    [[ -n "${!name:-}" ]] || fail "signing enabled but protected input ${name} is missing"
  done

  [[ "${DIREKT_UPLOAD_KEYSTORE_PATH}" = /* ]] || fail "DIREKT_UPLOAD_KEYSTORE_PATH must be absolute"
  [[ -f "${DIREKT_UPLOAD_KEYSTORE_PATH}" ]] || fail "protected upload keystore path is not a readable file"

  KEYSTORE_REAL="$(python3 - "${DIREKT_UPLOAD_KEYSTORE_PATH}" <<'PY'
import os
import sys
print(os.path.realpath(sys.argv[1]))
PY
)"
  case "${KEYSTORE_REAL}" in
    "${REPO_ROOT}"|"${REPO_ROOT}"/*)
      fail "protected upload keystore must resolve outside the repository checkout"
      ;;
  esac
fi

printf 'release_version_code=%s\n' "${VERSION_CODE}"
printf 'release_version_name=%s\n' "${VERSION_NAME}"
printf 'release_channel=%s\n' "${RELEASE_CHANNEL}"
printf 'release_signing_enabled=%s\n' "${SIGNING_ENABLED}"
