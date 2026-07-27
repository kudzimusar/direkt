#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?}"
: "${GCP_REGION:?}"
: "${GCP_ARTIFACT_REGISTRY:?}"
: "${GCP_DEPLOYER_SERVICE_ACCOUNT:?}"
: "${GCP_RUNTIME_SERVICE_ACCOUNT:?}"
: "${SOURCE_SHA:?}"
: "${RC8_RECEIPT_PATH:?}"
: "${GITHUB_RUN_ID:?}"
: "${GITHUB_RUN_ATTEMPT:?}"

CANARY_JOB="direkt-rc8-pay-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}"
IMAGE_URI="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${GCP_ARTIFACT_REGISTRY}/direkt-api:rc8-${SOURCE_SHA}"
CANARY_JOB_PRESENT=false
MANAGED_RESULT="FAILED"

mkdir -p "$(dirname "${RC8_RECEIPT_PATH}")"
: > "${RC8_RECEIPT_PATH}"

receipt() {
  printf '%s\n' "$1" >> "${RC8_RECEIPT_PATH}"
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

  rm -f \
    "${RUNNER_TEMP}/rc8-payments-raw-logs.json" \
    "${RUNNER_TEMP}/rc8-payments-execution.stderr"

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
  receipt "real_money=false"
  receipt "customer_to_provider_payments=false"
  cat "${RC8_RECEIPT_PATH}"
  exit "${exit_code}"
}
trap cleanup EXIT

receipt "schema=direkt.rc8.payments-managed-receipt.v1"
receipt "source_sha=${SOURCE_SHA}"
receipt "project=${GCP_PROJECT_ID}"
receipt "environment=sandbox"
receipt "runtime_surface=private_cloud_run_job"
receipt "application_payment_provider_mode=disabled"
receipt "dpo_runtime_bound=false"
receipt "airtel_runtime_bound=false"
receipt "flutterwave_included=false"
receipt "provider_credentials_exposed=false"
receipt "raw_provider_payload_included=false"

required_services=(
  artifactregistry.googleapis.com
  iam.googleapis.com
  logging.googleapis.com
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

secret_names=(
  direkt-mtn-momo-collections-subscription-key
  direkt-mtn-momo-api-user
  direkt-mtn-momo-api-key
  direkt-stripe-sandbox-secret-key
  direkt-paypal-sandbox-client-id
  direkt-paypal-sandbox-client-secret
)

latest_enabled_version() {
  local secret_name="$1"
  gcloud secrets versions list "${secret_name}" \
    --project "${GCP_PROJECT_ID}" \
    --filter='state=ENABLED' \
    --sort-by='~name' \
    --limit=1 \
    --format='value(name)' | awk -F/ '{print $NF}'
}

for secret_name in "${secret_names[@]}"; do
  gcloud secrets describe "${secret_name}" --project "${GCP_PROJECT_ID}" >/dev/null
  policy="$(gcloud secrets get-iam-policy "${secret_name}" --project "${GCP_PROJECT_ID}" --format=json)"
  if ! jq -e --arg member "serviceAccount:${GCP_RUNTIME_SERVICE_ACCOUNT}" '
    .bindings[]?
    | select(.role == "roles/secretmanager.secretAccessor")
    | .members[]?
    | select(. == $member)
  ' <<< "${policy}" >/dev/null; then
    receipt "owner_bootstrap_verified=false"
    receipt "missing_runtime_secret_accessor=${secret_name}"
    echo "RC8 owner bootstrap is required for ${secret_name}." >&2
    exit 1
  fi
  if jq -e '.bindings[]? | select(.role == "roles/secretmanager.admin")' <<< "${policy}" >/dev/null; then
    echo "Broad roles/secretmanager.admin is prohibited on ${secret_name}." >&2
    exit 1
  fi
done

mtn_subscription_version="$(latest_enabled_version direkt-mtn-momo-collections-subscription-key)"
mtn_user_version="$(latest_enabled_version direkt-mtn-momo-api-user)"
mtn_key_version="$(latest_enabled_version direkt-mtn-momo-api-key)"
stripe_version="$(latest_enabled_version direkt-stripe-sandbox-secret-key)"
paypal_client_id_version="$(latest_enabled_version direkt-paypal-sandbox-client-id)"
paypal_client_secret_version="$(latest_enabled_version direkt-paypal-sandbox-client-secret)"

for version in \
  "${mtn_subscription_version}" \
  "${mtn_user_version}" \
  "${mtn_key_version}" \
  "${stripe_version}" \
  "${paypal_client_id_version}" \
  "${paypal_client_secret_version}"; do
  [[ "${version}" =~ ^[1-9][0-9]*$ ]]
done

test "${mtn_subscription_version}" = "1"
test "${mtn_user_version}" = "1"
test "${mtn_key_version}" = "1"
test "${stripe_version}" = "2"

receipt "owner_bootstrap_verified=true"
receipt "secret_values_read_by_deployer=false"
receipt "mtn_subscription_version=${mtn_subscription_version}"
receipt "mtn_user_version=${mtn_user_version}"
receipt "mtn_key_version=${mtn_key_version}"
receipt "stripe_version=${stripe_version}"
receipt "paypal_client_id_version=${paypal_client_id_version}"
receipt "paypal_client_secret_version=${paypal_client_secret_version}"

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
  --args dist/commercial/rc8-payment-canary.js
  --tasks 1
  --parallelism 1
  --max-retries 0
  --task-timeout 10m
  --cpu 1
  --memory 512Mi
  --set-env-vars "NODE_ENV=test,DIREKT_ENVIRONMENT=staging,DIREKT_DATA_MODE=synthetic-only,DIREKT_TRAFFIC_MODE=internal,PAYMENT_PROVIDER_MODE=disabled,RC8_PAYMENT_CANARY_APPROVED=true,RC8_CANARY_RUN_ID=${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT},RC8_MTN_SYNTHETIC_MSISDN=260971000001,RC8_MTN_CALLBACK_URL=https://app.direkt.forum/rc8-sandbox-callback-disabled,RC8_STRIPE_SUCCESS_URL=https://app.direkt.forum/rc8-sandbox-success,RC8_STRIPE_CANCEL_URL=https://app.direkt.forum/rc8-sandbox-cancel,RC8_PAYPAL_RETURN_URL=https://app.direkt.forum/rc8-sandbox-return,RC8_PAYPAL_CANCEL_URL=https://app.direkt.forum/rc8-sandbox-cancel"
  --set-secrets "RC8_MTN_COLLECTION_SUBSCRIPTION_KEY=direkt-mtn-momo-collections-subscription-key:${mtn_subscription_version},RC8_MTN_API_USER=direkt-mtn-momo-api-user:${mtn_user_version},RC8_MTN_API_KEY=direkt-mtn-momo-api-key:${mtn_key_version},RC8_STRIPE_SECRET_KEY=direkt-stripe-sandbox-secret-key:${stripe_version},RC8_PAYPAL_CLIENT_ID=direkt-paypal-sandbox-client-id:${paypal_client_id_version},RC8_PAYPAL_CLIENT_SECRET=direkt-paypal-sandbox-client-secret:${paypal_client_secret_version}"
  --labels 'direkt-environment=staging,direkt-data-mode=synthetic-only,direkt-integration=payments-rc8'
  --quiet
)

gcloud run jobs create "${CANARY_JOB}" "${job_args[@]}"
CANARY_JOB_PRESENT=true
receipt "runtime_service_identity=${GCP_RUNTIME_SERVICE_ACCOUNT}"
receipt "sandbox_secret_binding=least_privilege_numeric_versions"

execution_json="${RUNNER_TEMP}/rc8-payments-execution.json"
execution_stderr="${RUNNER_TEMP}/rc8-payments-execution.stderr"
execution_details="${RUNNER_TEMP}/rc8-payments-execution-details.json"
raw_logs="${RUNNER_TEMP}/rc8-payments-raw-logs.json"
san_failure="${RUNNER_TEMP}/rc8-payments-canary-failure.json"
san_receipt="${RUNNER_TEMP}/rc8-payments-canary.json"

set +e
gcloud run jobs execute "${CANARY_JOB}" \
  --project "${GCP_PROJECT_ID}" \
  --region "${GCP_REGION}" \
  --wait \
  --format=json > "${execution_json}" 2> "${execution_stderr}"
execution_code=$?
set -e

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
  "resource.type=\"cloud_run_job\" AND resource.labels.job_name=\"${CANARY_JOB}\" AND (textPayload:\"RC8_PAYMENTS_\" OR jsonPayload.message:\"RC8_PAYMENTS_\")" \
  --project "${GCP_PROJECT_ID}" \
  --freshness 30m \
  --limit 20 \
  --format=json > "${raw_logs}" || printf '[]' > "${raw_logs}"

if [[ "${execution_code}" -ne 0 ]]; then
  python3 - "${execution_details}" "${raw_logs}" "${san_failure}" <<'PYFAIL'
from __future__ import annotations

import json
from pathlib import Path
import re
import sys

execution_path, logs_path, output_path = map(Path, sys.argv[1:])


def load(path: Path, fallback: object) -> object:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return fallback


def sanitize(value: object) -> str:
    text = str(value or "").strip()
    text = re.sub(r"(?i)(Bearer|Basic|Authorization:)\s+\S+", r"\1 [REDACTED]", text)
    text = re.sub(r"[0-9A-Za-z_+=/.:-]{80,}", "[REDACTED_LONG_VALUE]", text)
    return text[:1000]


details = load(execution_path, {})
logs = load(logs_path, [])
status = details.get("status", {}) if isinstance(details, dict) else {}
conditions = []
for condition in status.get("conditions", []) if isinstance(status, dict) else []:
    if isinstance(condition, dict):
        conditions.append(
            {
                "type": sanitize(condition.get("type")),
                "status": sanitize(condition.get("status")),
                "reason": sanitize(condition.get("reason")),
                "message": sanitize(condition.get("message")),
            }
        )
messages = []
for entry in logs if isinstance(logs, list) else []:
    if not isinstance(entry, dict):
        continue
    payload = entry.get("textPayload")
    if not isinstance(payload, str):
        json_payload = entry.get("jsonPayload", {})
        payload = json_payload.get("message") if isinstance(json_payload, dict) else None
    if isinstance(payload, str) and payload.startswith("RC8_PAYMENTS_CANARY|"):
        messages.append(sanitize(payload))
output = {
    "schema": "direkt.rc8.payments-canary-failure.v1",
    "rawLogsIncluded": False,
    "credentialIncluded": False,
    "providerReferenceIncluded": False,
    "executionName": sanitize(
        details.get("metadata", {}).get("name", "")
        if isinstance(details, dict) and isinstance(details.get("metadata"), dict)
        else ""
    ),
    "conditions": conditions,
    "appMessages": messages,
    "productionAuthorization": False,
    "participantData": False,
    "realMoney": False,
}
output_path.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
PYFAIL
  receipt "provider_canary=FAILED"
  receipt "provider_canary_failure_evidence_present=true"
  cat "${san_failure}" >&2
  exit "${execution_code}"
fi

python3 - "${raw_logs}" "${san_receipt}" <<'PYSUCCESS'
from __future__ import annotations

import json
from pathlib import Path
import sys

logs_path, output_path = map(Path, sys.argv[1:])
logs = json.loads(logs_path.read_text(encoding="utf-8"))
pass_seen = False
receipt = None
for entry in logs if isinstance(logs, list) else []:
    if not isinstance(entry, dict):
        continue
    payload = entry.get("textPayload")
    if not isinstance(payload, str):
        json_payload = entry.get("jsonPayload", {})
        payload = json_payload.get("message") if isinstance(json_payload, dict) else None
    if payload == "RC8_PAYMENTS_CANARY|PASS":
        pass_seen = True
    if isinstance(payload, str) and payload.startswith("RC8_PAYMENTS_RECEIPT|"):
        receipt = json.loads(payload.split("|", 1)[1])
if not pass_seen or not isinstance(receipt, dict):
    raise SystemExit("RC8 managed canary success markers are missing.")
assert receipt.get("schema") == "direkt.rc8.payments-canary.v1"
assert receipt.get("environment") == "sandbox"
assert receipt.get("runtimeSurface") == "private_cloud_run_job"
assert receipt.get("mtn") == {
    "initiationStatus": "processing",
    "verificationStatus": "succeeded",
    "independentlyVerified": True,
    "transactionIdPresent": True,
    "amountMatched": True,
    "currencyMatched": True,
}
assert receipt.get("stripe") == {
    "initiationStatus": "requires_action",
    "verificationStatus": "requires_action",
    "independentlyVerified": True,
    "paymentIntentPresent": False,
    "browserRedirectCreatesTruth": False,
}
assert receipt.get("paypal") == {
    "initiationStatus": "requires_action",
    "verificationStatus": "requires_action",
    "independentlyVerified": True,
    "captureAttempted": False,
    "browserApprovalCreatesTruth": False,
}
reconciliation = receipt.get("reconciliation")
assert reconciliation == {
    "successfulOutcome": "transition_planned",
    "balancedLedgerPosting": True,
    "duplicateOutcome": "duplicate",
    "mismatchOutcome": "reconciliation_required",
    "mismatchCode": "PROVIDER_AMOUNT_MISMATCH",
    "adjustmentOutcome": "adjustment_required",
    "requiresTwoIndependentApprovers": True,
    "requesterMayApprove": False,
    "historicalPaymentRewritten": False,
    "historicalLedgerRewritten": False,
    "trustOrRankingMutation": False,
}
for field in (
    "dpoRuntimeBound",
    "airtelRuntimeBound",
    "flutterwaveIncluded",
    "credentialIncluded",
    "rawProviderPayloadIncluded",
    "participantDataIncluded",
    "productionAuthorization",
    "realMoneyApproved",
    "customerToProviderPayments",
):
    assert receipt.get(field) is False, field
output_path.write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
PYSUCCESS

rm -f "${raw_logs}" "${execution_stderr}"
receipt "provider_canary=PASS"
receipt "mtn_request_to_pay=PASS"
receipt "mtn_independent_status=succeeded"
receipt "stripe_unpaid_checkout_verified=requires_action"
receipt "paypal_unapproved_order_verified=requires_action"
receipt "browser_redirect_creates_payment_truth=false"
receipt "reconciliation_transition=transition_planned"
receipt "reconciliation_balanced_ledger=true"
receipt "reconciliation_duplicate=duplicate"
receipt "reconciliation_mismatch=reconciliation_required"
receipt "reconciliation_adjustment=adjustment_required"
receipt "adjustment_two_person_approval=true"
receipt "adjustment_requester_may_approve=false"
receipt "historical_payment_rewritten=false"
receipt "historical_ledger_rewritten=false"
receipt "trust_or_ranking_mutation=false"
receipt "sandbox_objects_created=mtn_request,stripe_checkout,paypal_order"
MANAGED_RESULT="PASS"
