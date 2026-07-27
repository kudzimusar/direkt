#!/usr/bin/env bash
set -euo pipefail

MODE="${1:---check}"
case "${MODE}" in
  --write|--check) ;;
  *)
    echo "Usage: $0 [--write|--check]" >&2
    exit 64
    ;;
esac

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MANIFEST="${ROOT}/clients/generator/openapi-generator.json"
KOTLIN_CONFIG="${ROOT}/clients/generator/kotlin.json"
TYPESCRIPT_CONFIG="${ROOT}/clients/generator/typescript-fetch.json"
SPEC="${ROOT}/backend/direkt-api/artifacts/openapi.json"
DEST_ROOT="${ROOT}/clients/generated"
DEST_KOTLIN="${DEST_ROOT}/kotlin/src/main/kotlin"
DEST_TYPESCRIPT="${DEST_ROOT}/typescript/src"
DEST_RECEIPT="${DEST_ROOT}/GENERATION_RECEIPT.json"

for required in "${MANIFEST}" "${KOTLIN_CONFIG}" "${TYPESCRIPT_CONFIG}" "${SPEC}"; do
  if [[ ! -f "${required}" ]]; then
    echo "Missing required RC9A input: ${required#${ROOT}/}" >&2
    exit 1
  fi
done

read_manifest_value() {
  local key="$1"
  python3 - "${MANIFEST}" "${key}" <<'PY'
import json
from pathlib import Path
import sys

manifest = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
value = manifest
for segment in sys.argv[2].split("."):
    value = value[segment]
print(value)
PY
}

GENERATOR_VERSION="$(read_manifest_value version)"
GENERATOR_URL="$(read_manifest_value jarUrl)"
GENERATOR_SHA256="$(read_manifest_value sha256)"
CACHE_ROOT="${OPENAPI_GENERATOR_CACHE_DIR:-${HOME}/.cache/direkt/openapi-generator}"
GENERATOR_JAR="${CACHE_ROOT}/openapi-generator-cli-${GENERATOR_VERSION}.jar"
mkdir -p "${CACHE_ROOT}"

if [[ ! -f "${GENERATOR_JAR}" ]] || ! printf '%s  %s\n' "${GENERATOR_SHA256}" "${GENERATOR_JAR}" | sha256sum --check --status; then
  tmp_jar="${GENERATOR_JAR}.tmp"
  rm -f "${tmp_jar}"
  curl --fail --silent --show-error --location "${GENERATOR_URL}" --output "${tmp_jar}"
  printf '%s  %s\n' "${GENERATOR_SHA256}" "${tmp_jar}" | sha256sum --check --status
  mv "${tmp_jar}" "${GENERATOR_JAR}"
fi
printf '%s  %s\n' "${GENERATOR_SHA256}" "${GENERATOR_JAR}" | sha256sum --check --status
actual_version="$(java -jar "${GENERATOR_JAR}" version | tr -d '\r\n')"
if [[ "${actual_version}" != "${GENERATOR_VERSION}" ]]; then
  echo "OpenAPI Generator version mismatch: expected ${GENERATOR_VERSION}, got ${actual_version}" >&2
  exit 1
fi

tmp_root="$(mktemp -d)"
trap 'rm -rf "${tmp_root}"' EXIT
kotlin_full="${tmp_root}/kotlin-full"
typescript_full="${tmp_root}/typescript-full"
normalized="${tmp_root}/normalized"
normalized_kotlin="${normalized}/kotlin/src/main/kotlin"
normalized_typescript="${normalized}/typescript/src"
normalized_receipt="${normalized}/GENERATION_RECEIPT.json"
mkdir -p "${normalized_kotlin}" "${normalized_typescript}"

java -jar "${GENERATOR_JAR}" generate \
  --input-spec "${SPEC}" \
  --generator-name kotlin \
  --library jvm-retrofit2 \
  --config "${KOTLIN_CONFIG}" \
  --output "${kotlin_full}" \
  --global-property apiDocs=false,modelDocs=false,apiTests=false,modelTests=false \
  --skip-validate-spec >/dev/null

java -jar "${GENERATOR_JAR}" generate \
  --input-spec "${SPEC}" \
  --generator-name typescript-fetch \
  --config "${TYPESCRIPT_CONFIG}" \
  --output "${typescript_full}" \
  --global-property apiDocs=false,modelDocs=false,apiTests=false,modelTests=false \
  --skip-validate-spec >/dev/null

if [[ ! -d "${kotlin_full}/src/main/kotlin" ]] || [[ ! -d "${typescript_full}/src" ]]; then
  echo "OpenAPI Generator did not produce the expected source directories." >&2
  exit 1
fi
cp -a "${kotlin_full}/src/main/kotlin/." "${normalized_kotlin}/"
cp -a "${typescript_full}/src/." "${normalized_typescript}/"

# Generator templates contain deterministic but repository-invalid trailing spaces
# and extra blank lines at EOF. Normalize before hashing, compiling and comparing
# so the committed tree remains reproducible and passes git diff --check.
python3 - "${normalized_kotlin}" "${normalized_typescript}" <<'PY'
from pathlib import Path
import sys

for root_value in sys.argv[1:]:
    root = Path(root_value)
    for path in sorted(candidate for candidate in root.rglob("*") if candidate.is_file()):
        text = path.read_text(encoding="utf-8")
        lines = [line.rstrip(" \t") for line in text.splitlines()]
        while lines and lines[-1] == "":
            lines.pop()
        path.write_text("\n".join(lines) + "\n", encoding="utf-8")
PY

python3 - \
  "${SPEC}" \
  "${KOTLIN_CONFIG}" \
  "${TYPESCRIPT_CONFIG}" \
  "${normalized_kotlin}" \
  "${normalized_typescript}" \
  "${normalized_receipt}" \
  "${GENERATOR_VERSION}" \
  "${GENERATOR_SHA256}" <<'PY'
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import sys

(
    spec_path,
    kotlin_config_path,
    typescript_config_path,
    kotlin_root,
    typescript_root,
    receipt_path,
    generator_version,
    generator_sha256,
) = sys.argv[1:]


def file_sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def tree_receipt(root: Path) -> tuple[int, str]:
    digest = hashlib.sha256()
    files = [path for path in root.rglob("*") if path.is_file()]
    for path in sorted(files, key=lambda candidate: candidate.relative_to(root).as_posix()):
        relative = path.relative_to(root).as_posix().encode("utf-8")
        digest.update(relative)
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    return len(files), digest.hexdigest()

spec = Path(spec_path)
kotlin = Path(kotlin_root)
typescript = Path(typescript_root)
kotlin_count, kotlin_digest = tree_receipt(kotlin)
typescript_count, typescript_digest = tree_receipt(typescript)
receipt = {
    "schemaVersion": 1,
    "generator": {
        "name": "OpenAPI Generator CLI",
        "version": generator_version,
        "sha256": generator_sha256,
    },
    "canonicalOpenApi": {
        "path": "backend/direkt-api/artifacts/openapi.json",
        "sha256": file_sha(spec),
    },
    "config": {
        "kotlinSha256": file_sha(Path(kotlin_config_path)),
        "typescriptSha256": file_sha(Path(typescript_config_path)),
    },
    "outputs": {
        "kotlin": {
            "generator": "kotlin",
            "library": "jvm-retrofit2",
            "serializationLibrary": "kotlinx_serialization",
            "sourceFiles": kotlin_count,
            "treeSha256": kotlin_digest,
            "runtimeWired": False,
        },
        "typescript": {
            "generator": "typescript-fetch",
            "sourceFiles": typescript_count,
            "treeSha256": typescript_digest,
            "runtimeWired": False,
            "serverBffOnly": True,
        },
    },
    "productionAuthorization": False,
    "participantData": False,
    "privilegedClientCredentials": False,
}
Path(receipt_path).write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
PY

scan_output() {
  local directory="$1"
  if grep -RIE --binary-files=without-match \
    '(DATABASE_URL|SUPABASE_SERVICE_ROLE|service_role|sk_live_|sk_test_|PAYPAL_CLIENT_SECRET|MTN_MOMO_API_KEY|WHATSAPP_ACCESS_TOKEN|GOOGLE_MAPS_SERVER_API_KEY|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY)' \
    "${directory}" >/dev/null; then
    echo "Generated source contains a prohibited credential or privileged-runtime marker: ${directory}" >&2
    exit 1
  fi
}
scan_output "${normalized_kotlin}"
scan_output "${normalized_typescript}"

if [[ "${MODE}" == "--write" ]]; then
  rm -rf "${DEST_ROOT}/kotlin/src" "${DEST_ROOT}/typescript/src"
  mkdir -p "$(dirname "${DEST_KOTLIN}")" "$(dirname "${DEST_TYPESCRIPT}")"
  cp -a "${normalized_kotlin}/." "${DEST_KOTLIN}/"
  cp -a "${normalized_typescript}/." "${DEST_TYPESCRIPT}/"
  cp "${normalized_receipt}" "${DEST_RECEIPT}"
  echo "RC9A_GENERATED_CLIENTS|WRITE|PASS"
else
  for committed in "${DEST_KOTLIN}" "${DEST_TYPESCRIPT}" "${DEST_RECEIPT}"; do
    if [[ ! -e "${committed}" ]]; then
      echo "Committed generated output is missing: ${committed#${ROOT}/}" >&2
      exit 1
    fi
  done
  diff -ruN "${normalized_kotlin}" "${DEST_KOTLIN}"
  diff -ruN "${normalized_typescript}" "${DEST_TYPESCRIPT}"
  cmp "${normalized_receipt}" "${DEST_RECEIPT}"
  echo "RC9A_GENERATED_CLIENTS|DRIFT|PASS"
fi

python3 - "${normalized_receipt}" <<'PY'
import json
from pathlib import Path
import sys

receipt = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
print(f"generator_version={receipt['generator']['version']}")
print(f"generator_sha256={receipt['generator']['sha256']}")
print(f"canonical_openapi_sha256={receipt['canonicalOpenApi']['sha256']}")
print(f"kotlin_source_files={receipt['outputs']['kotlin']['sourceFiles']}")
print(f"kotlin_tree_sha256={receipt['outputs']['kotlin']['treeSha256']}")
print(f"typescript_source_files={receipt['outputs']['typescript']['sourceFiles']}")
print(f"typescript_tree_sha256={receipt['outputs']['typescript']['treeSha256']}")
print("runtime_wired=false")
print("production_authorization=false")
PY
