#!/usr/bin/env bash
set -euo pipefail

if [[ "$#" -ne 4 ]]; then
  echo "Usage: $0 <project-number> <bucket-name> <object-name> <source-file>" >&2
  exit 64
fi

project_number="$1"
bucket_name="$2"
object_name="$3"
source_file="$4"

[[ "${project_number}" =~ ^[1-9][0-9]*$ ]]
[[ "${bucket_name}" =~ ^[a-z0-9][a-z0-9._-]*[a-z0-9]$ ]]
[[ "${object_name}" == rc5/preflight/* ]]
test -s "${source_file}"

access_token="$(gcloud auth print-access-token)"
response_file="$(mktemp)"
trap 'rm -f "${response_file}"; unset access_token' EXIT

encoded_object_name="$(python - "${object_name}" <<'PY'
import sys
from urllib.parse import quote
print(quote(sys.argv[1], safe=""))
PY
)"

curl --fail --silent --show-error \
  --request POST \
  --header "Authorization: Bearer ${access_token}" \
  --header "Content-Type: application/json" \
  --data-binary "@${source_file}" \
  "https://storage.googleapis.com/upload/storage/v1/b/${bucket_name}/o?uploadType=media&name=${encoded_object_name}&ifGenerationMatch=0&userProject=${project_number}" \
  > "${response_file}"

returned_name="$(jq -r '.name // empty' "${response_file}")"
returned_generation="$(jq -r '.generation // empty' "${response_file}")"
returned_bucket="$(jq -r '.bucket // empty' "${response_file}")"

test "${returned_name}" = "${object_name}"
test "${returned_bucket}" = "${bucket_name}"
[[ "${returned_generation}" =~ ^[1-9][0-9]*$ ]]

printf 'append_only_object_insert=verified\n'
printf 'object_name=%s\n' "${returned_name}"
printf 'object_generation=%s\n' "${returned_generation}"
