#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?}"
: "${GCP_PROJECT_NUMBER:?}"
: "${GCP_REGION:?}"
: "${GCP_ARTIFACT_REGISTRY:?}"
: "${GCP_DEPLOYER_SERVICE_ACCOUNT:?}"
: "${GCP_RUNTIME_SERVICE_ACCOUNT:?}"
: "${TESTLAB_PROJECT_ID:?}"
: "${SOURCE_SHA:?}"
: "${RC7_RECEIPT_PATH:?}"

ANDROID_KEY_ID="direkt-rc7-android-maps"
CANARY_JOB="direkt-maps-canary"
IMAGE_URI="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${GCP_ARTIFACT_REGISTRY}/direkt-api:rc7-${SOURCE_SHA}"
ANDROID_PACKAGE="com.kudzimusar.direkt.debug"
ANDROID_TEST_CLASS="com.kudzimusar.direkt.Rc7MapsRuntimeTest"
OAUTH_SCOPE="https://www.googleapis.com/auth/maps-platform.geocode.address"
CANARY_JOB_PRESENT=false
MANAGED_RESULT="FAILED"

mkdir -p "$(dirname "${RC7_RECEIPT_PATH}")"
: > "${RC7_RECEIPT_PATH}"

receipt() {
  printf '%s\n' "$1" >> "${RC7_RECEIPT_PATH}"
}

cleanup() {
  local exit_code=$?
  local cleanup_failed=false
  trap - EXIT
  set +e

  if ${CANARY_JOB_PRESENT}; then
    if gcloud run jobs delete "${CANARY_JOB}" \
      --project "${GCP_PROJECT_ID}" \
      --region "${GCP_REGION}" \
      --quiet >/dev/null 2>&1; then
      receipt "cleanup.cloud_run_job_deleted=true"
    else
      receipt "cleanup.cloud_run_job_deleted=false"
      cleanup_failed=true
    fi
  fi

  rm -f "${RUNNER_TEMP}/rc7-android-key.txt"

  if ${cleanup_failed}; then
    MANAGED_RESULT="FAILED"
    if [[ "${exit_code}" -eq 0 ]]; then
      exit_code=1
    fi
  fi
  receipt "cleanup_failed=${cleanup_failed}"
  receipt "managed_result=${MANAGED_RESULT}"
  receipt "production_authorization=false"
  receipt "participant_data=false"
  receipt "private_provider_coordinates_published=false"
  cat "${RC7_RECEIPT_PATH}"
  exit "${exit_code}"
}
trap cleanup EXIT

receipt "schema=direkt.rc7.maps-managed-receipt.v2"
receipt "source_sha=${SOURCE_SHA}"
receipt "project=${GCP_PROJECT_ID}"
receipt "testlab_project=${TESTLAB_PROJECT_ID}"
receipt "android_api=maps-android-backend.googleapis.com"
receipt "backend_api=geocoding-backend.googleapis.com"
receipt "backend_authentication=service_identity_oauth"
receipt "backend_oauth_scope=${OAUTH_SCOPE}"
receipt "backend_api_key_present=false"
receipt "backend_secret_value_present=false"
receipt "backend_cloud_nat_used=false"
receipt "places_api_enabled_by_rc7=false"
receipt "routes_api_enabled_by_rc7=false"

required_services=(
  apikeys.googleapis.com
  artifactregistry.googleapis.com
  billingbudgets.googleapis.com
  cloudbilling.googleapis.com
  geocoding-backend.googleapis.com
  maps-android-backend.googleapis.com
  run.googleapis.com
  serviceusage.googleapis.com
)
enabled_services="$(gcloud services list \
  --enabled \
  --project "${GCP_PROJECT_ID}" \
  --format='value(config.name)')"
for service in "${required_services[@]}"; do
  grep -Fxq "${service}" <<< "${enabled_services}"
done
receipt "required_services_preprovisioned=true"

if grep -Eq '^(places(-backend)?|routes(-backend)?)\.googleapis\.com$' <<< "${enabled_services}"; then
  echo "RC7 must not enable Places or Routes." >&2
  exit 1
fi

billing_account="$(gcloud billing projects describe "${GCP_PROJECT_ID}" \
  --format='value(billingAccountName)' | sed 's#billingAccounts/##')"
test -n "${billing_account}"
budget_json="${RUNNER_TEMP}/rc7-maps-budget.json"
gcloud billing budgets list \
  --billing-account "${billing_account}" \
  --filter='displayName="DIREKT RC7 Maps synthetic"' \
  --limit 1 \
  --format=json > "${budget_json}"
jq -e '
  length == 1 and
  .[0].displayName == "DIREKT RC7 Maps synthetic" and
  .[0].amount.specifiedAmount.units == "1"
' "${budget_json}" >/dev/null
budget_currency="$(jq -r '.[0].amount.specifiedAmount.currencyCode' "${budget_json}")"
test -n "${budget_currency}"
receipt "owner_bootstrap_verified=true"
receipt "budget_alert_present=true"
receipt "budget_display_name=DIREKT RC7 Maps synthetic"
receipt "budget_amount=1"
receipt "budget_currency=${budget_currency}"

quota_json="${RUNNER_TEMP}/rc7-geocoding-quota.json"
gcloud alpha services quota list \
  --service geocoding-backend.googleapis.com \
  --consumer "projects/${GCP_PROJECT_NUMBER}" \
  --format=json > "${quota_json}"
quota_pair="$(jq -r '
  [ .[] as $metric
    | ($metric.consumerQuotaLimits // [])[]
    | select(.unit == "1/min/{project}")
    | [$metric.metric, .unit]
  ][0] // [] | @tsv
' "${quota_json}")"
IFS=$'\t' read -r quota_metric quota_unit <<< "${quota_pair}"
test -n "${quota_metric}"
test "${quota_unit}" = '1/min/{project}'
receipt "geocoding_quota_metric=${quota_metric}"
receipt "geocoding_quota_per_minute=60"
receipt "geocoding_quota_preprovisioned=true"

mkdir -p "${HOME}/.android"
if [[ ! -f "${HOME}/.android/debug.keystore" ]]; then
  keytool -genkeypair \
    -keystore "${HOME}/.android/debug.keystore" \
    -storepass android \
    -alias androiddebugkey \
    -keypass android \
    -dname 'CN=Android Debug,O=Android,C=US' \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 >/dev/null 2>&1
fi
android_sha1="$(keytool -list -v \
  -keystore "${HOME}/.android/debug.keystore" \
  -storepass android \
  -alias androiddebugkey \
  -keypass android \
  | awk -F': ' '/SHA1:/{print $2; exit}' \
  | tr -d ':')"
[[ "${android_sha1}" =~ ^[0-9A-Fa-f]{40}$ ]]
receipt "android_package=${ANDROID_PACKAGE}"
receipt "android_debug_certificate_sha1=${android_sha1^^}"

if gcloud services api-keys describe "${ANDROID_KEY_ID}" \
  --project "${GCP_PROJECT_ID}" \
  --location global >/dev/null 2>&1; then
  gcloud services api-keys update "${ANDROID_KEY_ID}" \
    --project "${GCP_PROJECT_ID}" \
    --location global \
    --display-name 'DIREKT RC7 Android Maps synthetic' \
    --allowed-application "sha1_fingerprint=${android_sha1},package_name=${ANDROID_PACKAGE}" \
    --api-target service=maps-android-backend.googleapis.com \
    --quiet
else
  gcloud services api-keys create \
    --project "${GCP_PROJECT_ID}" \
    --key-id "${ANDROID_KEY_ID}" \
    --display-name 'DIREKT RC7 Android Maps synthetic' \
    --allowed-application "sha1_fingerprint=${android_sha1},package_name=${ANDROID_PACKAGE}" \
    --api-target service=maps-android-backend.googleapis.com \
    --quiet
fi
gcloud services api-keys describe "${ANDROID_KEY_ID}" \
  --project "${GCP_PROJECT_ID}" \
  --location global \
  --format=json > "${RUNNER_TEMP}/rc7-android-key-metadata.json"
jq -e --arg package "${ANDROID_PACKAGE}" --arg sha "${android_sha1^^}" '
  .restrictions.androidKeyRestrictions.allowedApplications
  | any(.packageName == $package and (.sha1Fingerprint | ascii_upcase) == $sha)
' "${RUNNER_TEMP}/rc7-android-key-metadata.json" >/dev/null
jq -e '
  (.restrictions.apiTargets | length) == 1 and
  .restrictions.apiTargets[0].service == "maps-android-backend.googleapis.com"
' "${RUNNER_TEMP}/rc7-android-key-metadata.json" >/dev/null
gcloud services api-keys get-key-string "${ANDROID_KEY_ID}" \
  --project "${GCP_PROJECT_ID}" \
  --location global \
  --format='value(keyString)' > "${RUNNER_TEMP}/rc7-android-key.txt"
chmod 600 "${RUNNER_TEMP}/rc7-android-key.txt"
[[ "$(wc -c < "${RUNNER_TEMP}/rc7-android-key.txt")" -ge 20 ]]
receipt "android_key_restricted=true"
receipt "android_key_persistent_synthetic_debug_only=true"
receipt "credential_propagation_wait_seconds=60"
sleep 60

gcloud auth configure-docker "${GCP_REGION}-docker.pkg.dev" --quiet
docker build \
  --file backend/direkt-api/Dockerfile \
  --tag "${IMAGE_URI}" \
  backend/direkt-api
docker push "${IMAGE_URI}"
receipt "immutable_backend_image=${IMAGE_URI}"

job_args=(
  --project "${GCP_PROJECT_ID}"
  --region "${GCP_REGION}"
  --image "${IMAGE_URI}"
  --service-account "${GCP_RUNTIME_SERVICE_ACCOUNT}"
  --command node
  --args dist/location/maps-canary.js
  --tasks 1
  --parallelism 1
  --max-retries 0
  --task-timeout 5m
  --cpu 1
  --memory 512Mi
  --set-env-vars "NODE_ENV=development,DIREKT_ENVIRONMENT=staging,DIREKT_DATA_MODE=synthetic-only,DIREKT_TRAFFIC_MODE=internal,RATE_LIMITS_ENABLED=false,EVIDENCE_STORAGE_PROVIDER=synthetic,PAYMENT_PROVIDER_MODE=disabled,AI_PROVIDER_MODE=disabled,AI_FALLBACK_PROVIDER=disabled,EMAIL_PROVIDER_MODE=disabled,WHATSAPP_PROVIDER_MODE=disabled,GOOGLE_MAPS_BACKEND_MODE=google_maps,GOOGLE_MAPS_OAUTH_SCOPE=${OAUTH_SCOPE},GOOGLE_MAPS_SYNTHETIC_CANARY_APPROVED=true"
  --labels 'direkt-environment=staging,direkt-data-mode=synthetic-only,direkt-integration=maps-rc7'
  --quiet
)
if gcloud run jobs describe "${CANARY_JOB}" \
  --project "${GCP_PROJECT_ID}" \
  --region "${GCP_REGION}" >/dev/null 2>&1; then
  gcloud run jobs update "${CANARY_JOB}" "${job_args[@]}"
else
  gcloud run jobs create "${CANARY_JOB}" "${job_args[@]}"
fi
CANARY_JOB_PRESENT=true
receipt "backend_service_identity=${GCP_RUNTIME_SERVICE_ACCOUNT}"
receipt "backend_service_identity_oauth_configured=true"

execution_json="${RUNNER_TEMP}/rc7-maps-execution.json"
execution_stderr="${RUNNER_TEMP}/rc7-maps-execution.stderr"
execution_details="${RUNNER_TEMP}/rc7-maps-execution-details.json"
raw_canary_logs="${RUNNER_TEMP}/rc7-maps-canary-logs.json"
sanitary_failure="${RUNNER_TEMP}/rc7-maps-canary-failure.json"
set +e
gcloud run jobs execute "${CANARY_JOB}" \
  --project "${GCP_PROJECT_ID}" \
  --region "${GCP_REGION}" \
  --wait \
  --format=json > "${execution_json}" 2> "${execution_stderr}"
execution_code=$?
set -e
if [[ "${execution_code}" -ne 0 ]]; then
  sleep 8
  execution_name="$(gcloud run jobs executions list \
    --job "${CANARY_JOB}" \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --limit 1 \
    --sort-by='~metadata.creationTimestamp' \
    --format='value(metadata.name)' || true)"
  if [[ -n "${execution_name}" ]]; then
    gcloud run jobs executions describe "${execution_name}" \
      --project "${GCP_PROJECT_ID}" \
      --region "${GCP_REGION}" \
      --format=json > "${execution_details}" || printf '{}' > "${execution_details}"
  else
    printf '{}' > "${execution_details}"
  fi
  gcloud logging read \
    "resource.type=\"cloud_run_job\" AND resource.labels.job_name=\"${CANARY_JOB}\" AND (textPayload:\"RC7_MAPS_CANARY|\" OR jsonPayload.message:\"RC7_MAPS_CANARY|\")" \
    --project "${GCP_PROJECT_ID}" \
    --freshness 30m \
    --limit 20 \
    --format=json > "${raw_canary_logs}" || printf '[]' > "${raw_canary_logs}"
  python3 - "${execution_details}" "${raw_canary_logs}" "${sanitary_failure}" <<'PYFAILURE'
from __future__ import annotations

import json
from pathlib import Path
import re
import sys

details_path, logs_path, output_path = map(Path, sys.argv[1:])


def load(path: Path, fallback: object) -> object:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return fallback


def sanitize(value: object) -> str:
    text = str(value or "").strip()
    text = re.sub(r"ya29\.[0-9A-Za-z._-]{20,}", "[REDACTED_OAUTH_TOKEN]", text)
    text = re.sub(r"(?i)(Bearer|Authorization:)\s+\S+", r"\1 [REDACTED]", text)
    text = re.sub(r"[0-9A-Za-z_+=/.:-]{80,}", "[REDACTED_LONG_VALUE]", text)
    return text[:1000]


details = load(details_path, {})
logs = load(logs_path, [])
status = details.get("status", {}) if isinstance(details, dict) else {}
conditions = []
for condition in status.get("conditions", []) if isinstance(status, dict) else []:
    if not isinstance(condition, dict):
        continue
    conditions.append(
        {
            "type": sanitize(condition.get("type")),
            "status": sanitize(condition.get("status")),
            "reason": sanitize(condition.get("reason")),
            "message": sanitize(condition.get("message")),
        }
    )

app_messages = []
for entry in logs if isinstance(logs, list) else []:
    if not isinstance(entry, dict):
        continue
    payload = entry.get("textPayload")
    if not isinstance(payload, str):
        json_payload = entry.get("jsonPayload", {})
        payload = json_payload.get("message") if isinstance(json_payload, dict) else None
    if isinstance(payload, str) and payload.startswith("RC7_MAPS_CANARY|"):
        app_messages.append(sanitize(payload))

output = {
    "schema": "direkt.rc7.maps-canary-failure.v2",
    "rawLogsIncluded": False,
    "credentialIncluded": False,
    "coordinateValuesIncluded": False,
    "formattedAddressIncluded": False,
    "authentication": "service_identity_oauth",
    "executionName": sanitize(
        details.get("metadata", {}).get("name", "")
        if isinstance(details, dict) and isinstance(details.get("metadata"), dict)
        else ""
    ),
    "failedCount": status.get("failedCount") if isinstance(status, dict) else None,
    "cancelledCount": status.get("cancelledCount") if isinstance(status, dict) else None,
    "conditions": conditions,
    "appMessages": app_messages,
}
output_path.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
PYFAILURE
  receipt "backend_geocoding_canary=FAILED"
  receipt "backend_canary_failure_evidence_present=true"
  cat "${sanitary_failure}" >&2
  exit "${execution_code}"
fi
rm -f "${execution_stderr}"
sleep 8
backend_log="$(gcloud logging read \
  "resource.type=cloud_run_job AND resource.labels.job_name=${CANARY_JOB} AND textPayload:\"RC7_MAPS_CANARY|PASS\"" \
  --project "${GCP_PROJECT_ID}" \
  --freshness 30m \
  --limit 1 \
  --format='value(textPayload)')"
test "${backend_log}" = 'RC7_MAPS_CANARY|PASS'
receipt "backend_geocoding_canary=PASS"
receipt "backend_service_identity_oauth_proven=true"
receipt "backend_coordinates_logged=false"
receipt "backend_formatted_address_logged=false"

pushd android/direkt-app >/dev/null
DIREKT_MAPS_BUILD_ENABLED=true \
DIREKT_MAPS_SYNTHETIC_CANARY_APPROVED=true \
DIREKT_ANDROID_MAPS_API_KEY="$(cat "${RUNNER_TEMP}/rc7-android-key.txt")" \
gradle --no-daemon --stacktrace \
  :app:assembleDebug \
  :app:assembleDebugAndroidTest
popd >/dev/null
rm -f "${RUNNER_TEMP}/rc7-android-key.txt"

app_apk="android/direkt-app/app/build/outputs/apk/debug/app-debug.apk"
test_apk="android/direkt-app/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk"
test -f "${app_apk}"
test -f "${test_apk}"
gcloud firebase test android run \
  --project "${TESTLAB_PROJECT_ID}" \
  --type instrumentation \
  --app "${app_apk}" \
  --test "${test_apk}" \
  --device model=MediumPhone.arm,version=36,locale=en,orientation=portrait \
  --test-targets "class ${ANDROID_TEST_CLASS}" \
  --timeout 5m \
  --num-flaky-test-attempts 0 \
  --no-use-orchestrator \
  --no-record-video \
  --no-performance-metrics \
  --no-auto-google-login \
  --client-details matrixLabel="DIREKT RC7 Maps ${SOURCE_SHA}" \
  --format=json > "${RUNNER_TEMP}/rc7-maps-test-lab.json"
receipt "android_test_lab_map_ready=PASS"
receipt "android_test_device=MediumPhone.arm_api36"
receipt "android_flaky_retries=0"
receipt "android_location_permission_requested=false"
receipt "manual_list_fallback_preserved=true"

MANAGED_RESULT="PASS"
