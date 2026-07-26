#!/usr/bin/env python3
from pathlib import Path


def replace_once(path: str, old: str, new: str, label: str) -> None:
    target = Path(path)
    text = target.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise AssertionError(f'{label}: expected one match, found {count}')
    target.write_text(text.replace(old, new, 1), encoding='utf-8')


script = 'scripts/rc7/run-maps-managed.sh'
replace_once(
    script,
    'BACKEND_KEY_ID="direkt-rc7-backend-geocoding"\n',
    'BACKEND_KEY_ID="direkt-rc7-backend-${GITHUB_RUN_ID:-manual}-${GITHUB_RUN_ATTEMPT:-1}"\n',
    'rerun-safe backend key id',
)
replace_once(
    script,
    '''cleanup() {
  local exit_code=$?
  trap - EXIT
  set +e

  if ${CANARY_JOB_PRESENT}; then
    gcloud run jobs delete "${CANARY_JOB}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --quiet >/dev/null 2>&1
    receipt "cleanup.cloud_run_job_deleted=true"
  fi
  if [[ -n "${BACKEND_SECRET_VERSION}" ]]; then
    gcloud secrets versions destroy "${BACKEND_SECRET_VERSION}" --secret "${BACKEND_SECRET}" --project "${GCP_PROJECT_ID}" --quiet >/dev/null 2>&1
    receipt "cleanup.backend_secret_version_destroyed=true"
  fi
  if ${BACKEND_KEY_PRESENT}; then
    gcloud services api-keys delete "${BACKEND_KEY_ID}" --project "${GCP_PROJECT_ID}" --location global --quiet >/dev/null 2>&1
    receipt "cleanup.backend_api_key_deleted=true"
  fi
  if ${NAT_PRESENT}; then
    gcloud compute routers nats delete "${NAT}" --router "${ROUTER}" --region "${GCP_REGION}" --project "${GCP_PROJECT_ID}" --quiet >/dev/null 2>&1
    receipt "cleanup.cloud_nat_deleted=true"
  fi
  if ${ROUTER_PRESENT}; then
    gcloud compute routers delete "${ROUTER}" --region "${GCP_REGION}" --project "${GCP_PROJECT_ID}" --quiet >/dev/null 2>&1
    receipt "cleanup.cloud_router_deleted=true"
  fi
  if ${ADDRESS_PRESENT}; then
    gcloud compute addresses delete "${ADDRESS}" --region "${GCP_REGION}" --project "${GCP_PROJECT_ID}" --quiet >/dev/null 2>&1
    receipt "cleanup.static_ip_released=true"
  fi
  rm -f "${RUNNER_TEMP}/rc7-android-key.txt" "${RUNNER_TEMP}/rc7-backend-key.txt"

  receipt "managed_result=${MANAGED_RESULT}"
  receipt "production_authorization=false"
  receipt "participant_data=false"
  receipt "private_provider_coordinates_published=false"
  cat "${RC7_RECEIPT_PATH}"
  exit "${exit_code}"
}
''',
    '''cleanup() {
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
      gcloud run jobs delete "${CANARY_JOB}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --quiet
  fi
  if [[ -n "${BACKEND_SECRET_VERSION}" ]]; then
    cleanup_record backend_secret_version_destroyed \
      gcloud secrets versions destroy "${BACKEND_SECRET_VERSION}" --secret "${BACKEND_SECRET}" --project "${GCP_PROJECT_ID}" --quiet
  fi
  if ${BACKEND_KEY_PRESENT}; then
    cleanup_record backend_api_key_deleted \
      gcloud services api-keys delete "${BACKEND_KEY_ID}" --project "${GCP_PROJECT_ID}" --location global --quiet
  fi
  if ${NAT_PRESENT}; then
    cleanup_record cloud_nat_deleted \
      gcloud compute routers nats delete "${NAT}" --router "${ROUTER}" --region "${GCP_REGION}" --project "${GCP_PROJECT_ID}" --quiet
  fi
  if ${ROUTER_PRESENT}; then
    cleanup_record cloud_router_deleted \
      gcloud compute routers delete "${ROUTER}" --region "${GCP_REGION}" --project "${GCP_PROJECT_ID}" --quiet
  fi
  if ${ADDRESS_PRESENT}; then
    cleanup_record static_ip_released \
      gcloud compute addresses delete "${ADDRESS}" --region "${GCP_REGION}" --project "${GCP_PROJECT_ID}" --quiet
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
''',
    'truthful cleanup enforcement',
)
replace_once(
    script,
    "if gcloud services list --enabled --project \"${GCP_PROJECT_ID}\" --format='value(config.name)' | grep -Eq '^(places|places-backend|places.googleapis.com|routes|routes-backend|routes.googleapis.com)$'; then\n",
    "if gcloud services list --enabled --project \"${GCP_PROJECT_ID}\" --format='value(config.name)' | grep -Eq '^(places(-backend)?|routes(-backend)?)\\.googleapis\\.com$'; then\n",
    'fully-qualified Places Routes prohibition',
)
replace_once(
    script,
    '''gcloud compute networks subnets add-iam-policy-binding "${SUBNET}" \\
  --project "${GCP_PROJECT_ID}" \\
  --region "${GCP_REGION}" \\
  --member "serviceAccount:service-${GCP_PROJECT_NUMBER}@serverless-robot-prod.iam.gserviceaccount.com" \\
  --role roles/compute.networkUser \\
  --quiet >/dev/null
''',
    '',
    'unnecessary subnet IAM mutation',
)
replace_once(
    script,
    '''receipt "backend_secret=${BACKEND_SECRET}"
receipt "backend_secret_numeric_version=${BACKEND_SECRET_VERSION}"

rm -f "${RUNNER_TEMP}/rc7-backend-key.txt"
''',
    '''receipt "backend_secret=${BACKEND_SECRET}"
receipt "backend_secret_numeric_version=${BACKEND_SECRET_VERSION}"
receipt "credential_propagation_wait_seconds=60"
sleep 60

rm -f "${RUNNER_TEMP}/rc7-backend-key.txt"
''',
    'credential propagation window',
)

verifier = 'scripts/rc7/verify-maps-contract.py'
replace_once(
    verifier,
    '        "direkt-rc7-backend-geocoding",\n',
    '        "direkt-rc7-backend-${GITHUB_RUN_ID",\n',
    'dynamic backend key verifier',
)
replace_once(
    verifier,
    '''        "cleanup.backend_api_key_deleted=true",
        "cleanup.backend_secret_version_destroyed=true",
        "cleanup.cloud_nat_deleted=true",
        "cleanup.static_ip_released=true",
''',
    '''        "cleanup_record backend_api_key_deleted",
        "cleanup_record backend_secret_version_destroyed",
        "cleanup_record cloud_nat_deleted",
        "cleanup_record static_ip_released",
        "cleanup_failed=${cleanup_failed}",
''',
    'truthful cleanup verifier',
)
replace_once(
    verifier,
    '''    prohibit(managed_script, r"set\\s+-[^\\n]*x", "shell trace that could expose key material")
''',
    '''    prohibit(managed_script, r"set\\s+-[^\\n]*x", "shell trace that could expose key material")
    prohibit(
        managed_script,
        r"networks\\s+subnets\\s+add-iam-policy-binding",
        "unnecessary persistent subnet IAM mutation",
    )
''',
    'subnet IAM prohibition',
)

print('RC7 managed proof hardening applied.')
