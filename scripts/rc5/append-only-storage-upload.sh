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
case "${bucket_name}" in
  "direkt-test-lab-results-${project_number}")
    [[ "${object_name}" == rc5/preflight/* ]]
    ;;
  "direkt-test-lab-inputs-${project_number}")
    [[ "${object_name}" == rc5/inputs/* ]]
    [[ "${object_name}" == *.apk ]]
    ;;
  *)
    echo "RC5 upload target escaped the dedicated results/input buckets." >&2
    exit 1
    ;;
esac
test -s "${source_file}"

content_type="application/json"
if [[ "${source_file}" == *.apk ]]; then
  content_type="application/vnd.android.package-archive"
fi

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
  --header "Content-Type: ${content_type}" \
  --data-binary "@${source_file}" \
  "https://storage.googleapis.com/upload/storage/v1/b/${bucket_name}/o?uploadType=media&name=${encoded_object_name}&ifGenerationMatch=0" \
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
