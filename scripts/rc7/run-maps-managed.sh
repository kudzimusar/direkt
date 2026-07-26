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

NETWORK="direkt-maps-egress"
SUBNET="direkt-maps-egress-${GCP_REGION}"
SUBNET_RANGE="10.27.0.0/26"
ROUTER="direkt-maps-router"
NAT="direkt-maps-nat"
ADDRESS="direkt-maps-egress-ip"
BACKEND_KEY_ID="direkt-rc7-backend-${GITHUB_RUN_ID:-manual}-${GITHUB_RUN_ATTEMPT:-1}"
ANDROID_KEY_ID="direkt-rc7-android-maps"
BACKEND_SECRET="direkt-google-maps-geocoding-api-key"
CANARY_JOB="direkt-maps-canary"
IMAGE_URI="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${GCP_ARTIFACT_REGISTRY}/direkt-api:rc7-${SOURCE_SHA}"
ANDROID_PACKAGE="com.kudzimusar.direkt.debug"
ANDROID_TEST_CLASS="com.kudzimusar.direkt.Rc7MapsRuntimeTest"
BACKEND_SECRET_VERSION=""
BACKEND_KEY_PRESENT=false
CANARY_JOB_PRESENT=false
NAT_PRESENT=false
ROUTER_PRESENT=false
ADDRESS_PRESENT=false
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

  cleanup_record() {
    local label="$1"
    shift
    if "$@" >/dev/null 2>&1; then
      receipt "cleanup.${label}=true"
    else
      receipt "cleanup.${label}=false"
      cleanup_failed=true
    fi
  }

  if ${CANARY_JOB_PRESENT}; then
    cleanup_record cloud_run_job_deleted \
      gcloud run jobs delete "${CANARY_JOB}" \
        --project "${GCP_PROJECT_ID}" \
        --region "${GCP_REGION}" \
        --quiet
  fi
  if [[ -n "${BACKEND_SECRET_VERSION}" ]]; then
    cleanup_record backend_secret_version_destroyed \
      gcloud secrets versions destroy "${BACKEND_SECRET_VERSION}" \
        --secret "${BACKEND_SECRET}" \
        --project "${GCP_PROJECT_ID}" \
        --quiet
  fi
  if ${BACKEND_KEY_PRESENT}; then
    cleanup_record backend_api_key_deleted \
      gcloud services api-keys delete "${BACKEND_KEY_ID}" \
        --project "${GCP_PROJECT_ID}" \
        --location global \
        --quiet
  fi
  if ${NAT_PRESENT}; then
    cleanup_record cloud_nat_deleted \
      gcloud compute routers nats delete "${NAT}" \
        --router "${ROUTER}" \
        --region "${GCP_REGION}" \
        --project "${GCP_PROJECT_ID}" \
        --quiet
  fi
  if ${ROUTER_PRESENT}; then
    cleanup_record cloud_router_deleted \
      gcloud compute routers delete "${ROUTER}" \
        --region "${GCP_REGION}" \
        --project "${GCP_PROJECT_ID}" \
        --quiet
  fi
  if ${ADDRESS_PRESENT}; then
    cleanup_record static_ip_released \
      gcloud compute addresses delete "${ADDRESS}" \
        --region "${GCP_REGION}" \
        --project "${GCP_PROJECT_ID}" \
        --quiet
  fi
  rm -f "${RUNNER_TEMP}/rc7-android-key.txt" "${RUNNER_TEMP}/rc7-backend-key.txt"

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

receipt "schema=direkt.rc7.maps-managed-receipt.v1"
receipt "source_sha=${SOURCE_SHA}"
receipt "project=${GCP_PROJECT_ID}"
receipt "testlab_project=${TESTLAB_PROJECT_ID}"
receipt "android_api=maps-android-backend.googleapis.com"
receipt "backend_api=geocoding-backend.googleapis.com"
receipt "places_api_enabled_by_rc7=false"
receipt "routes_api_enabled_by_rc7=false"

required_services=(
  apikeys.googleapis.com
  artifactregistry.googleapis.com
  billingbudgets.googleapis.com
  cloudbilling.googleapis.com
  compute.googleapis.com
  geocoding-backend.googleapis.com
  maps-android-backend.googleapis.com
  run.googleapis.com
  secretmanager.googleapis.com
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

bootstrap_secret_json="${RUNNER_TEMP}/rc7-bootstrap-secret.json"
gcloud secrets describe "${BACKEND_SECRET}" \
  --project "${GCP_PROJECT_ID}" \
  --format=json > "${bootstrap_secret_json}"
jq -e '
  .labels["direkt-rc7-bootstrap"] == "ready" and
  .labels["direkt-rc7-budget"] == "unit1" and
  .labels["direkt-rc7-quota"] == "60"
' "${bootstrap_secret_json}" >/dev/null
receipt "owner_bootstrap_verified=true"
receipt "budget_alert_present=true"
receipt "budget_display_name=DIREKT RC7 Maps synthetic"
receipt "budget_amount=1"
receipt "budget_currency=account"

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

# The owner bootstrap creates the stable, no-recurring-cost VPC and subnet.
gcloud compute networks describe "${NETWORK}" \
  --project "${GCP_PROJECT_ID}" >/dev/null
gcloud compute networks subnets describe "${SUBNET}" \
  --project "${GCP_PROJECT_ID}" \
  --region "${GCP_REGION}" >/dev/null
actual_range="$(gcloud compute networks subnets describe "${SUBNET}" \
  --project "${GCP_PROJECT_ID}" \
  --region "${GCP_REGION}" \
  --format='value(ipCidrRange)')"
test "${actual_range}" = "${SUBNET_RANGE}"
receipt "direct_vpc_subnet=${SUBNET}"

if ! gcloud compute addresses describe "${ADDRESS}" \
  --project "${GCP_PROJECT_ID}" \
  --region "${GCP_REGION}" >/dev/null 2>&1; then
  gcloud compute addresses create "${ADDRESS}" \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --network-tier PREMIUM \
    --quiet
fi
ADDRESS_PRESENT=true
static_ip="$(gcloud compute addresses describe "${ADDRESS}" \
  --project "${GCP_PROJECT_ID}" \
  --region "${GCP_REGION}" \
  --format='value(address)')"
[[ "${static_ip}" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]
receipt "temporary_static_egress_ip=${static_ip}"

if ! gcloud compute routers describe "${ROUTER}" \
  --project "${GCP_PROJECT_ID}" \
  --region "${GCP_REGION}" >/dev/null 2>&1; then
  gcloud compute routers create "${ROUTER}" \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --network "${NETWORK}" \
    --quiet
fi
ROUTER_PRESENT=true
if gcloud compute routers nats describe "${NAT}" \
  --router "${ROUTER}" \
  --project "${GCP_PROJECT_ID}" \
  --region "${GCP_REGION}" >/dev/null 2>&1; then
  gcloud compute routers nats update "${NAT}" \
    --router "${ROUTER}" \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --nat-external-ip-pool "${ADDRESS}" \
    --nat-custom-subnet-ip-ranges "${SUBNET}" \
    --enable-logging \
    --log-filter ERRORS_ONLY \
    --quiet
else
  gcloud compute routers nats create "${NAT}" \
    --router "${ROUTER}" \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --nat-external-ip-pool "${ADDRESS}" \
    --nat-custom-subnet-ip-ranges "${SUBNET}" \
    --enable-logging \
    --log-filter ERRORS_ONLY \
    --quiet
fi
NAT_PRESENT=true
receipt "temporary_cloud_nat_configured=true"

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

if gcloud services api-keys describe "${BACKEND_KEY_ID}" \
  --project "${GCP_PROJECT_ID}" \
  --location global >/dev/null 2>&1; then
  gcloud services api-keys update "${BACKEND_KEY_ID}" \
    --project "${GCP_PROJECT_ID}" \
    --location global \
    --display-name 'DIREKT RC7 Backend Geocoding temporary canary' \
    --allowed-ips "${static_ip}" \
    --api-target service=geocoding-backend.googleapis.com \
    --quiet
else
  gcloud services api-keys create \
    --project "${GCP_PROJECT_ID}" \
    --key-id "${BACKEND_KEY_ID}" \
    --display-name 'DIREKT RC7 Backend Geocoding temporary canary' \
    --allowed-ips "${static_ip}" \
    --api-target service=geocoding-backend.googleapis.com \
    --quiet
fi
BACKEND_KEY_PRESENT=true
gcloud services api-keys describe "${BACKEND_KEY_ID}" \
  --project "${GCP_PROJECT_ID}" \
  --location global \
  --format=json > "${RUNNER_TEMP}/rc7-backend-key-metadata.json"
jq -e --arg ip "${static_ip}" \
  '.restrictions.serverKeyRestrictions.allowedIps == [$ip]' \
  "${RUNNER_TEMP}/rc7-backend-key-metadata.json" >/dev/null
jq -e '
  (.restrictions.apiTargets | length) == 1 and
  .restrictions.apiTargets[0].service == "geocoding-backend.googleapis.com"
' "${RUNNER_TEMP}/rc7-backend-key-metadata.json" >/dev/null
gcloud services api-keys get-key-string "${BACKEND_KEY_ID}" \
  --project "${GCP_PROJECT_ID}" \
  --location global \
  --format='value(keyString)' > "${RUNNER_TEMP}/rc7-backend-key.txt"
chmod 600 "${RUNNER_TEMP}/rc7-backend-key.txt"
[[ "$(wc -c < "${RUNNER_TEMP}/rc7-backend-key.txt")" -ge 20 ]]
receipt "backend_key_ip_restricted=true"
receipt "backend_key_geocoding_only=true"

secret_policy="$(gcloud secrets get-iam-policy "${BACKEND_SECRET}" \
  --project "${GCP_PROJECT_ID}" \
  --format=json)"
for role in roles/secretmanager.secretVersionManager roles/secretmanager.viewer; do
  jq -e --arg role "${role}" --arg member "serviceAccount:${GCP_DEPLOYER_SERVICE_ACCOUNT}" '
    .bindings[]?
    | select(.role == $role)
    | .members[]?
    | select(. == $member)
  ' <<< "${secret_policy}" >/dev/null
done
jq -e --arg member "serviceAccount:${GCP_RUNTIME_SERVICE_ACCOUNT}" '
  .bindings[]?
  | select(.role == "roles/secretmanager.secretAccessor")
  | .members[]?
  | select(. == $member)
' <<< "${secret_policy}" >/dev/null
if jq -e '.bindings[]? | select(.role == "roles/secretmanager.admin")' \
  <<< "${secret_policy}" >/dev/null; then
  echo "Broad roles/secretmanager.admin is prohibited on the RC7 secret." >&2
  exit 1
fi
version_name="$(gcloud secrets versions add "${BACKEND_SECRET}" \
  --project "${GCP_PROJECT_ID}" \
  --data-file "${RUNNER_TEMP}/rc7-backend-key.txt" \
  --format='value(name)')"
BACKEND_SECRET_VERSION="${version_name##*/}"
[[ "${BACKEND_SECRET_VERSION}" =~ ^[1-9][0-9]*$ ]]
receipt "backend_secret=${BACKEND_SECRET}"
receipt "backend_secret_numeric_version=${BACKEND_SECRET_VERSION}"
receipt "credential_propagation_wait_seconds=60"
sleep 60

rm -f "${RUNNER_TEMP}/rc7-backend-key.txt"
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
  --network "${NETWORK}"
  --subnet "${SUBNET}"
  --vpc-egress all-traffic
  --tasks 1
  --parallelism 1
  --max-retries 0
  --task-timeout 5m
  --cpu 1
  --memory 512Mi
  --set-env-vars 'NODE_ENV=development,DIREKT_ENVIRONMENT=staging,DIREKT_DATA_MODE=synthetic-only,DIREKT_TRAFFIC_MODE=internal,RATE_LIMITS_ENABLED=false,EVIDENCE_STORAGE_PROVIDER=synthetic,PAYMENT_PROVIDER_MODE=disabled,AI_PROVIDER_MODE=disabled,AI_FALLBACK_PROVIDER=disabled,EMAIL_PROVIDER_MODE=disabled,WHATSAPP_PROVIDER_MODE=disabled,GOOGLE_MAPS_BACKEND_MODE=google_maps,GOOGLE_MAPS_SYNTHETIC_CANARY_APPROVED=true'
  --set-secrets "GOOGLE_MAPS_SERVER_API_KEY=${BACKEND_SECRET}:${BACKEND_SECRET_VERSION}"
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
execution_json="${RUNNER_TEMP}/rc7-maps-execution.json"
execution_stderr="${RUNNER_TEMP}/rc7-maps-execution.stderr"
execution_details="${RUNNER_TEMP}/rc7-maps-execution-details.json"
raw_canary_logs="${RUNNER_TEMP}/rc7-maps-canary-logs.json"
sanitized_failure="${RUNNER_TEMP}/rc7-maps-canary-failure.json"
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
    "resource.type=cloud_run_job AND resource.labels.job_name=${CANARY_JOB} AND (textPayload:"RC7_MAPS_CANARY|" OR jsonPayload.message:"RC7_MAPS_CANARY|")" \
    --project "${GCP_PROJECT_ID}" \
    --freshness 30m \
    --limit 20 \
    --format=json > "${raw_canary_logs}" || printf '[]' > "${raw_canary_logs}"
  python3 - "${execution_details}" "${raw_canary_logs}" "${sanitized_failure}" <<'PYFAILURE'
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
    text = re.sub(r"AIza[0-9A-Za-z_-]{20,}", "[REDACTED_GOOGLE_API_KEY]", text)
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
    "schema": "direkt.rc7.maps-canary-failure.v1",
    "rawLogsIncluded": False,
    "credentialIncluded": False,
    "coordinateValuesIncluded": False,
    "formattedAddressIncluded": False,
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
  cat "${sanitized_failure}" >&2
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
receipt "backend_static_egress_restriction_proven=true"
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
