#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-direkt-dev-502701}"
PROJECT_NUMBER="${GCP_PROJECT_NUMBER:-264358173369}"
REGION="${GCP_REGION:-asia-northeast1}"
DEPLOYER_SA="${GCP_DEPLOYER_SERVICE_ACCOUNT:-direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com}"
RUNTIME_SA="${GCP_RUNTIME_SERVICE_ACCOUNT:-direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com}"
SECRET_NAME="direkt-google-maps-geocoding-api-key"
NETWORK="direkt-maps-egress"
SUBNET="direkt-maps-egress-${REGION}"
SUBNET_RANGE="10.27.0.0/26"
BUDGET_DISPLAY_NAME="DIREKT RC7 Maps synthetic"
TEMPORARY_HOURS="${RC7_TEMPORARY_IAM_HOURS:-8}"

[[ "${PROJECT_ID}" == "direkt-dev-502701" ]]
[[ "${PROJECT_NUMBER}" == "264358173369" ]]
[[ "${REGION}" == "asia-northeast1" ]]
[[ "${DEPLOYER_SA}" == "direkt-github-deployer@${PROJECT_ID}.iam.gserviceaccount.com" ]]
[[ "${RUNTIME_SA}" == "direkt-api-runtime@${PROJECT_ID}.iam.gserviceaccount.com" ]]
[[ "${TEMPORARY_HOURS}" =~ ^[1-9][0-9]?$ ]]

active_account="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n 1)"
test -n "${active_account}"
gcloud projects describe "${PROJECT_ID}" --format='value(projectId)' | grep -Fxq "${PROJECT_ID}"

gcloud services enable \
  apikeys.googleapis.com \
  artifactregistry.googleapis.com \
  billingbudgets.googleapis.com \
  cloudbilling.googleapis.com \
  compute.googleapis.com \
  geocoding-backend.googleapis.com \
  maps-android-backend.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  serviceusage.googleapis.com \
  --project "${PROJECT_ID}" \
  --quiet

if gcloud services list --enabled --project "${PROJECT_ID}" --format='value(config.name)' | grep -Eq '^(places(-backend)?|routes(-backend)?)\.googleapis\.com$'; then
  echo "RC7 bootstrap refuses to continue while Places or Routes is enabled." >&2
  exit 1
fi

if ! gcloud compute networks describe "${NETWORK}" --project "${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud compute networks create "${NETWORK}" \
    --project "${PROJECT_ID}" \
    --subnet-mode custom \
    --quiet
fi
if ! gcloud compute networks subnets describe "${SUBNET}" --project "${PROJECT_ID}" --region "${REGION}" >/dev/null 2>&1; then
  gcloud compute networks subnets create "${SUBNET}" \
    --project "${PROJECT_ID}" \
    --region "${REGION}" \
    --network "${NETWORK}" \
    --range "${SUBNET_RANGE}" \
    --enable-private-ip-google-access \
    --quiet
fi
actual_range="$(gcloud compute networks subnets describe "${SUBNET}" --project "${PROJECT_ID}" --region "${REGION}" --format='value(ipCidrRange)')"
test "${actual_range}" = "${SUBNET_RANGE}"

if ! gcloud secrets describe "${SECRET_NAME}" --project "${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud secrets create "${SECRET_NAME}" \
    --project "${PROJECT_ID}" \
    --replication-policy automatic \
    --labels direkt-rc7-bootstrap=preparing \
    --quiet
fi

expires_at="$(date -u -d "+${TEMPORARY_HOURS} hours" '+%Y-%m-%dT%H:%M:%SZ')"
condition_file="$(mktemp)"
trap 'rm -f "${condition_file}"' EXIT
cat > "${condition_file}" <<EOF
expression: request.time < timestamp("${expires_at}")
title: direkt_rc7_maps_temporary
description: Temporary least-privilege authority for the exact-main synthetic RC7 managed proof.
EOF

for role in \
  roles/serviceusage.apiKeysAdmin \
  roles/serviceusage.serviceUsageViewer \
  roles/compute.networkAdmin \
  roles/logging.viewer; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member "serviceAccount:${DEPLOYER_SA}" \
    --role "${role}" \
    --condition-from-file "${condition_file}" \
    --quiet >/dev/null
done

for role in roles/secretmanager.secretVersionManager roles/secretmanager.viewer; do
  gcloud secrets add-iam-policy-binding "${SECRET_NAME}" \
    --project "${PROJECT_ID}" \
    --member "serviceAccount:${DEPLOYER_SA}" \
    --role "${role}" \
    --condition-from-file "${condition_file}" \
    --quiet >/dev/null
done

gcloud secrets add-iam-policy-binding "${SECRET_NAME}" \
  --project "${PROJECT_ID}" \
  --member "serviceAccount:${RUNTIME_SA}" \
  --role roles/secretmanager.secretAccessor \
  --condition-from-file "${condition_file}" \
  --quiet >/dev/null

billing_account="$(gcloud billing projects describe "${PROJECT_ID}" --format='value(billingAccountName)' | sed 's#billingAccounts/##')"
test -n "${billing_account}"
budget_name="$(gcloud billing budgets list \
  --billing-account "${billing_account}" \
  --filter="displayName=\"${BUDGET_DISPLAY_NAME}\"" \
  --format='value(name)' \
  --limit=1 || true)"
if [[ -z "${budget_name}" ]]; then
  budget_name="$(gcloud billing budgets create \
    --billing-account "${billing_account}" \
    --display-name "${BUDGET_DISPLAY_NAME}" \
    --budget-amount 1USD \
    --calendar-period month \
    --filter-projects "projects/${PROJECT_ID}" \
    --threshold-rule percent=0.50 \
    --threshold-rule percent=0.80 \
    --threshold-rule percent=1.00 \
    --format='value(name)')"
else
  gcloud billing budgets update "${budget_name##*/}" \
    --billing-account "${billing_account}" \
    --budget-amount 1USD \
    --quiet >/dev/null
fi
test -n "${budget_name}"
actual_budget_units="$(gcloud billing budgets describe "${budget_name##*/}" \
  --billing-account "${billing_account}" \
  --format='value(amount.specifiedAmount.units)')"
test "${actual_budget_units}" = "1"

quota_json="$(mktemp)"
trap 'rm -f "${condition_file}" "${quota_json}"' EXIT
gcloud alpha services quota list \
  --service geocoding-backend.googleapis.com \
  --consumer "projects/${PROJECT_NUMBER}" \
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
  --consumer "projects/${PROJECT_NUMBER}" \
  --metric "${quota_metric}" \
  --unit "${quota_unit}" \
  --value 60 \
  --force \
  --quiet; then
  gcloud alpha services quota create \
    --service geocoding-backend.googleapis.com \
    --consumer "projects/${PROJECT_NUMBER}" \
    --metric "${quota_metric}" \
    --unit "${quota_unit}" \
    --value 60 \
    --force \
    --quiet
fi

gcloud secrets update "${SECRET_NAME}" \
  --project "${PROJECT_ID}" \
  --update-labels \
    direkt-rc7-bootstrap=ready,direkt-rc7-budget=usd1,direkt-rc7-quota=60 \
  --quiet

secret_policy="$(gcloud secrets get-iam-policy "${SECRET_NAME}" --project "${PROJECT_ID}" --format=json)"
for role in roles/secretmanager.secretVersionManager roles/secretmanager.viewer; do
  jq -e --arg role "${role}" --arg member "serviceAccount:${DEPLOYER_SA}" \
    '.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)' \
    <<< "${secret_policy}" >/dev/null
done
jq -e --arg member "serviceAccount:${RUNTIME_SA}" \
  '.bindings[]? | select(.role == "roles/secretmanager.secretAccessor") | .members[]? | select(. == $member)' \
  <<< "${secret_policy}" >/dev/null
if jq -e '.bindings[]? | select(.role == "roles/secretmanager.admin")' <<< "${secret_policy}" >/dev/null; then
  echo "Broad roles/secretmanager.admin is prohibited on the RC7 secret." >&2
  exit 1
fi

printf 'RC7_MAPS_BOOTSTRAP|PASS\n'
printf 'project=%s\n' "${PROJECT_ID}"
printf 'region=%s\n' "${REGION}"
printf 'secret_container=%s\n' "${SECRET_NAME}"
printf 'secret_value_created=false\n'
printf 'network=%s\n' "${NETWORK}"
printf 'subnet=%s\n' "${SUBNET}"
printf 'subnet_range=%s\n' "${SUBNET_RANGE}"
printf 'budget_alert=%s\n' "${BUDGET_DISPLAY_NAME}"
printf 'budget_amount_usd=1\n'
printf 'geocoding_quota_per_minute=60\n'
printf 'temporary_authority_expires_at=%s\n' "${expires_at}"
printf 'places_routes_enabled_by_rc7=false\n'
printf 'production_authorization=false\n'
printf 'participant_data=false\n'
