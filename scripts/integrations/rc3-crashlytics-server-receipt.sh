#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?GCP_PROJECT_ID is required}"
: "${DIREKT_FIREBASE_APP_ID:?DIREKT_FIREBASE_APP_ID is required}"
: "${SOURCE_SHA:?SOURCE_SHA is required}"
: "${RUNNER_TEMP:?RUNNER_TEMP is required}"

mode="${1:-}"
case "${mode}" in
  preflight)
    ;;
  receipt)
    : "${2:?canary kind is required}"
    : "${3:?error type is required}"
    : "${4:?canary start time is required}"
    ;;
  *)
    echo "Usage: $0 preflight | receipt <crash|anr> <FATAL|ANR> <RFC3339-start>" >&2
    exit 2
    ;;
esac

api_root="https://firebasecrashlytics.googleapis.com/v1alpha"
app_parent="projects/${GCP_PROJECT_ID}/apps/${DIREKT_FIREBASE_APP_ID}"
reports_url="${api_root}/${app_parent}/reports"

access_token() {
  local token
  token="$(gcloud auth print-access-token)"
  echo "::add-mask::${token}" >&2
  printf '%s' "${token}"
}

sanitize_error_receipt() {
  local source_file="$1"
  local output_file="$2"
  local http_code="$3"
  local message
  message="$(jq -r '.error.message // empty' "${source_file}" 2>/dev/null || true)"
  message="${message//${GCP_PROJECT_ID}/[project-id]}"
  message="${message//${DIREKT_FIREBASE_APP_ID}/[firebase-app-id]}"
  message="$(printf '%s' "${message}" | cut -c1-500)"
  jq -n \
    --arg http "${http_code}" \
    --arg code "$(jq -r '.error.code // empty' "${source_file}" 2>/dev/null || true)" \
    --arg status "$(jq -r '.error.status // empty' "${source_file}" 2>/dev/null || true)" \
    --arg message "${message}" \
    '{httpStatus:$http,errorCode:($code|select(length>0)),errorStatus:($status|select(length>0)),errorMessage:($message|select(length>0))}' \
    > "${output_file}"
}

resolve_top_issues_report() {
  local token response http_code report_name
  token="$(access_token)"
  response="${RUNNER_TEMP}/rc3-reports-list.json"
  http_code="$(curl --silent --show-error \
    --output "${response}" \
    --write-out '%{http_code}' \
    --header "Authorization: Bearer ${token}" \
    "${reports_url}")"
  if [[ "${http_code}" != "200" ]]; then
    sanitize_error_receipt "${response}" "${RUNNER_TEMP}/rc3-server-read-preflight-receipt.json" "${http_code}"
    cat "${RUNNER_TEMP}/rc3-server-read-preflight-receipt.json" >&2
    return 1
  fi

  report_name="$(jq -r '[.reports[]? | select(.name | endswith("/reports/topIssues"))][0].name // empty' "${response}")"
  if [[ -z "${report_name}" ]]; then
    jq -n --arg http "${http_code}" '{httpStatus:$http,readBoundary:"REPORTS_LIST_OK",topIssuesReport:"MISSING"}' \
      > "${RUNNER_TEMP}/rc3-server-read-preflight-receipt.json"
    cat "${RUNNER_TEMP}/rc3-server-read-preflight-receipt.json" >&2
    return 1
  fi
  printf '%s' "${report_name}"
}

if [[ "${mode}" == "preflight" ]]; then
  top_issues_report="$(resolve_top_issues_report)"
  jq -n \
    --arg report "${top_issues_report}" \
    '{httpStatus:"200",readBoundary:"PASS",method:"reports.list",topIssuesReport:($report | split("/") | last)}' \
    > "${RUNNER_TEMP}/rc3-server-read-preflight-receipt.json"
  cat "${RUNNER_TEMP}/rc3-server-read-preflight-receipt.json"
  exit 0
fi

canary_kind="$2"
error_type="$3"
canary_start_time="$4"
top_issues_report="$(resolve_top_issues_report)"
top_issues_url="${api_root}/${top_issues_report}"
events_url="${api_root}/${app_parent}/events"
receipt_file="${RUNNER_TEMP}/rc3-${canary_kind}-event-receipt.json"
report_file="${RUNNER_TEMP}/rc3-${canary_kind}-top-issues.json"
events_file="${RUNNER_TEMP}/rc3-${canary_kind}-events.json"

processed=false
for _ in $(seq 1 90); do
  token="$(access_token)"
  end_time="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  curl --fail --silent --show-error --get \
    --header "Authorization: Bearer ${token}" \
    --data-urlencode "pageSize=100" \
    --data-urlencode "filter.interval.startTime=${canary_start_time}" \
    --data-urlencode "filter.interval.endTime=${end_time}" \
    --data-urlencode "filter.issue.errorTypes=${error_type}" \
    "${top_issues_url}" > "${report_file}"

  mapfile -t issue_ids < <(jq -r '.groups[]?.issue.id // empty' "${report_file}" | sort -u)
  for issue_id in "${issue_ids[@]:-}"; do
    [[ -n "${issue_id}" ]] || continue
    curl --fail --silent --show-error --get \
      --header "Authorization: Bearer ${token}" \
      --data-urlencode "pageSize=100" \
      --data-urlencode "filter.issue.id=${issue_id}" \
      --data-urlencode "filter.interval.startTime=${canary_start_time}" \
      --data-urlencode "filter.interval.endTime=${end_time}" \
      "${events_url}" > "${events_file}"

    jq -c \
      --arg sha "${SOURCE_SHA}" \
      --arg kind "${canary_kind}" \
      --arg start "${canary_start_time}" \
      '[.events[]? | select(.customKeys.direkt_source_sha == $sha and .customKeys.direkt_canary_kind == $kind and .receivedTime >= $start)][0] // empty' \
      "${events_file}" > "${RUNNER_TEMP}/rc3-${canary_kind}-event-match.json"

    if jq -e 'type == "object" and (.name | type == "string")' "${RUNNER_TEMP}/rc3-${canary_kind}-event-match.json" >/dev/null 2>&1; then
      jq '{name,eventId,eventTime,receivedTime,issueTitle,issueSubtitle,crashlyticsSdkVersion,customKeys:{direkt_data_mode:.customKeys.direkt_data_mode,direkt_source_sha:.customKeys.direkt_source_sha,direkt_release_channel:.customKeys.direkt_release_channel,direkt_canary_kind:.customKeys.direkt_canary_kind}}' \
        "${RUNNER_TEMP}/rc3-${canary_kind}-event-match.json" > "${receipt_file}"
      processed=true
      break 2
    fi
  done
  sleep 2
done

test "${processed}" = "true"
jq '{name,eventId,eventTime,receivedTime,customKeys}' "${receipt_file}"
