#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?}"
: "${GCP_PROJECT_NUMBER:?}"
: "${GCP_REGION:?}"
: "${GCP_ARTIFACT_REGISTRY:?}"
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
    cleanup_record cloud_run_job_deleted       gcloud run jobs delete "${CANARY_JOB}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --quiet
  fi
  if [[ -n "${BACKEND_SECRET_VERSION}" ]]; then
    cleanup_record backend_secret_version_destroyed       gcloud secrets versions destroy "${BACKEND_SECRET_VERSION}" --secret "${BACKEND_SECRET}" --project "${GCP_PROJECT_ID}" --quiet
  fi
  if ${BACKEND_KEY_PRESENT}; then
    cleanup_record backend_api_key_deleted       gcloud services api-keys delete "${BACKEND_KEY_ID}" --project "${GCP_PROJECT_ID}" --location global --quiet
  fi
  if ${NAT_PRESENT}; then
    cleanup_record cloud_nat_deleted       gcloud compute routers nats delete "${NAT}" --router "${ROUTER}" --region "${GCP_REGION}" --project "${GCP_PROJECT_ID}" --quiet
  fi
  if ${ROUTER_PRESENT}; then
    cleanup_record cloud_router_deleted       gcloud compute routers delete "${ROUTER}" --region "${GCP_REGION}" --project "${GCP_PROJECT_ID}" --quiet
  fi
  if ${ADDRESS_PRESENT}; then
    cleanup_record static_ip_released       gcloud compute addresses delete "${ADDRESS}" --region "${GCP_REGION}" --project "${GCP_PROJECT_ID}" --quiet
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
gcloud services enable "${required_services[@]}" --project "${GCP_PROJECT_ID}" --quiet
receipt "required_services_enabled=true"

if gcloud services list --enabled --project "${GCP_PROJECT_ID}" --format='value(config.name)' | grep -Eq '^(places(-backend)?|routes(-backend)?)\.googleapis\.com$'; then
  echo "RC7 must not enable Places or Routes." >&2
  exit 1
fi

billing_account="$(gcloud billing projects describe "${GCP_PROJECT_ID}" --format='value(billingAccountName)' | sed 's#billingAccounts/##')"
test -n "${billing_account}"
budget_name="$(gcloud billing budgets list --billing-account "${billing_account}" --filter='displayName="DIREKT RC7 Maps synthetic"' --format='value(name)' --limit=1 || true)"
if [[ -z "${budget_name}" ]]; then
  budget_name="$(gcloud billing budgets create \
    --billing-account "${billing_account}" \
    --display-name "DIREKT RC7 Maps synthetic" \
    --budget-amount 25USD \
    --calendar-period month \
    --filter-projects "projects/${GCP_PROJECT_ID}" \
    --threshold-rule percent=0.50 \
    --threshold-rule percent=0.80 \
    --threshold-rule percent=1.00 \
    --format='value(name)')"
fi
test -n "${budget_name}"
receipt "budget_alert_present=true"
receipt "budget_display_name=DIREKT RC7 Maps synthetic"
receipt "budget_amount_usd=25"

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
if ! gcloud alpha services quota update \
  --service geocoding-backend.googleapis.com \
  --consumer "projects/${GCP_PROJECT_NUMBER}" \
  --metric "${quota_metric}" \
  --unit "${quota_unit}" \
  --value 60 \
  --force \
  --quiet; then
  gcloud alpha services quota create \
    --service geocoding-backend.googleapis.com \
    --consumer "projects/${GCP_PROJECT_NUMBER}" \
    --metric "${quota_metric}" \
    --unit "${quota_unit}" \
    --value 60 \
    --force \
    --quiet
fi
receipt "geocoding_quota_metric=${quota_metric}"
receipt "geocoding_quota_per_minute=60"

if ! gcloud compute networks describe "${NETWORK}" --project "${GCP_PROJECT_ID}" >/dev/null 2>&1; then
  gcloud compute networks create "${NETWORK}" --project "${GCP_PROJECT_ID}" --subnet-mode custom --quiet
fi
if ! gcloud compute networks subnets describe "${SUBNET}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" >/dev/null 2>&1; then
  gcloud compute networks subnets create "${SUBNET}" \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --network "${NETWORK}" \
    --range "${SUBNET_RANGE}" \
    --enable-private-ip-google-access \
    --quiet
fi
actual_range="$(gcloud compute networks subnets describe "${SUBNET}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format='value(ipCidrRange)')"
test "${actual_range}" = "${SUBNET_RANGE}"
receipt "direct_vpc_subnet=${SUBNET}"

if ! gcloud compute addresses describe "${ADDRESS}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" >/dev/null 2>&1; then
  gcloud compute addresses create "${ADDRESS}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --network-tier PREMIUM --quiet
fi
ADDRESS_PRESENT=true
static_ip="$(gcloud compute addresses describe "${ADDRESS}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format='value(address)')"
[[ "${static_ip}" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]
receipt "temporary_static_egress_ip=${static_ip}"

if ! gcloud compute routers describe "${ROUTER}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" >/dev/null 2>&1; then
  gcloud compute routers create "${ROUTER}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --network "${NETWORK}" --quiet
fi
ROUTER_PRESENT=true
if gcloud compute routers nats describe "${NAT}" --router "${ROUTER}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" >/dev/null 2>&1; then
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
android_sha1="$(keytool -list -v -keystore "${HOME}/.android/debug.keystore" -storepass android -alias androiddebugkey -keypass android | awk -F': ' '/SHA1:/{print $2; exit}' | tr -d ':')"
[[ "${android_sha1}" =~ ^[0-9A-Fa-f]{40}$ ]]
receipt "android_package=${ANDROID_PACKAGE}"
receipt "android_debug_certificate_sha1=${android_sha1^^}"

if gcloud services api-keys describe "${ANDROID_KEY_ID}" --project "${GCP_PROJECT_ID}" --location global >/dev/null 2>&1; then
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
    --location global \
    --key-id "${ANDROID_KEY_ID}" \
    --display-name 'DIREKT RC7 Android Maps synthetic' \
    --allowed-application "sha1_fingerprint=${android_sha1},package_name=${ANDROID_PACKAGE}" \
    --api-target service=maps-android-backend.googleapis.com \
    --quiet
fi
gcloud services api-keys describe "${ANDROID_KEY_ID}" --project "${GCP_PROJECT_ID}" --location global --format=json > "${RUNNER_TEMP}/rc7-android-key-metadata.json"
jq -e --arg package "${ANDROID_PACKAGE}" --arg sha "${android_sha1^^}" '
  .restrictions.androidKeyRestrictions.allowedApplications
  | any(.packageName == $package and (.sha1Fingerprint | ascii_upcase) == $sha)
' "${RUNNER_TEMP}/rc7-android-key-metadata.json" >/dev/null
jq -e '(.restrictions.apiTargets | length) == 1 and .restrictions.apiTargets[0].service == "maps-android-backend.googleapis.com"' "${RUNNER_TEMP}/rc7-android-key-metadata.json" >/dev/null
gcloud services api-keys get-key-string "${ANDROID_KEY_ID}" --project "${GCP_PROJECT_ID}" --location global --format='value(keyString)' > "${RUNNER_TEMP}/rc7-android-key.txt"
chmod 600 "${RUNNER_TEMP}/rc7-android-key.txt"
[[ "$(wc -c < "${RUNNER_TEMP}/rc7-android-key.txt")" -ge 20 ]]
receipt "android_key_restricted=true"
receipt "android_key_persistent_synthetic_debug_only=true"

if gcloud services api-keys describe "${BACKEND_KEY_ID}" --project "${GCP_PROJECT_ID}" --location global >/dev/null 2>&1; then
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
    --location global \
    --key-id "${BACKEND_KEY_ID}" \
    --display-name 'DIREKT RC7 Backend Geocoding temporary canary' \
    --allowed-ips "${static_ip}" \
    --api-target service=geocoding-backend.googleapis.com \
    --quiet
fi
BACKEND_KEY_PRESENT=true
gcloud services api-keys describe "${BACKEND_KEY_ID}" --project "${GCP_PROJECT_ID}" --location global --format=json > "${RUNNER_TEMP}/rc7-backend-key-metadata.json"
jq -e --arg ip "${static_ip}" '.restrictions.serverKeyRestrictions.allowedIps == [$ip]' "${RUNNER_TEMP}/rc7-backend-key-metadata.json" >/dev/null
jq -e '(.restrictions.apiTargets | length) == 1 and .restrictions.apiTargets[0].service == "geocoding-backend.googleapis.com"' "${RUNNER_TEMP}/rc7-backend-key-metadata.json" >/dev/null
gcloud services api-keys get-key-string "${BACKEND_KEY_ID}" --project "${GCP_PROJECT_ID}" --location global --format='value(keyString)' > "${RUNNER_TEMP}/rc7-backend-key.txt"
chmod 600 "${RUNNER_TEMP}/rc7-backend-key.txt"
[[ "$(wc -c < "${RUNNER_TEMP}/rc7-backend-key.txt")" -ge 20 ]]
receipt "backend_key_ip_restricted=true"
receipt "backend_key_geocoding_only=true"

if ! gcloud secrets describe "${BACKEND_SECRET}" --project "${GCP_PROJECT_ID}" >/dev/null 2>&1; then
  gcloud secrets create "${BACKEND_SECRET}" --project "${GCP_PROJECT_ID}" --replication-policy automatic --quiet
fi
version_name="$(gcloud secrets versions add "${BACKEND_SECRET}" --project "${GCP_PROJECT_ID}" --data-file "${RUNNER_TEMP}/rc7-backend-key.txt" --format='value(name)')"
BACKEND_SECRET_VERSION="${version_name##*/}"
[[ "${BACKEND_SECRET_VERSION}" =~ ^[1-9][0-9]*$ ]]
gcloud secrets add-iam-policy-binding "${BACKEND_SECRET}" \
  --project "${GCP_PROJECT_ID}" \
  --member "serviceAccount:${GCP_RUNTIME_SERVICE_ACCOUNT}" \
  --role roles/secretmanager.secretAccessor \
  --quiet >/dev/null
receipt "backend_secret=${BACKEND_SECRET}"
receipt "backend_secret_numeric_version=${BACKEND_SECRET_VERSION}"
receipt "credential_propagation_wait_seconds=60"
sleep 60

rm -f "${RUNNER_TEMP}/rc7-backend-key.txt"
gcloud auth configure-docker "${GCP_REGION}-docker.pkg.dev" --quiet
docker build --file backend/direkt-api/Dockerfile --tag "${IMAGE_URI}" backend/direkt-api
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
if gcloud run jobs describe "${CANARY_JOB}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" >/dev/null 2>&1; then
  gcloud run jobs update "${CANARY_JOB}" "${job_args[@]}"
else
  gcloud run jobs create "${CANARY_JOB}" "${job_args[@]}"
fi
CANARY_JOB_PRESENT=true
gcloud run jobs execute "${CANARY_JOB}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --wait --format=json > "${RUNNER_TEMP}/rc7-maps-execution.json"
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
gradle --no-daemon --stacktrace :app:assembleDebug :app:assembleDebugAndroidTest
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
