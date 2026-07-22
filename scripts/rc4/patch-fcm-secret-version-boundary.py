#!/usr/bin/env python3
import re
from pathlib import Path

workflow_path = Path('.github/workflows/firebase-fcm-canary.yml')
verifier_path = Path('scripts/verify-integration-runtime-contract.py')

workflow = workflow_path.read_text(encoding='utf-8')


def replace_literal(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'{label} anchor missing')
    return text.replace(old, new, 1)


workflow = replace_literal(
    workflow,
    '      GCP_FCM_VERIFIER_ROLE_ID: direktFcmBootstrapVerifier\n',
    '      GCP_FCM_VERIFIER_ROLE_ID: direktFcmBootstrapVerifier\n'
    '      GCP_FCM_CANARY_SECRET: direkt-fcm-canary-token\n',
    'FCM secret env',
)
workflow = replace_literal(
    workflow,
    '          test "${GCP_FCM_VERIFIER_ROLE_ID}" = "direktFcmBootstrapVerifier"\n',
    '          test "${GCP_FCM_VERIFIER_ROLE_ID}" = "direktFcmBootstrapVerifier"\n'
    '          test "${GCP_FCM_CANARY_SECRET}" = "direkt-fcm-canary-token"\n',
    'FCM bootstrap assertion',
)

secret_step = '''      - name: Store synthetic FCM token as one-run Secret Manager version
        shell: bash
        run: |
          set -euo pipefail
          secret_name="${GCP_FCM_CANARY_SECRET}"

          # The secret container and its secret-scoped IAM bindings are owner-provisioned.
          # CI may add/destroy versions only; it may not create arbitrary secrets or mutate IAM.
          existing_enabled="$(gcloud secrets versions list "${secret_name}" \
            --project "${GCP_PROJECT_ID}" \
            --filter='state=ENABLED' \
            --format='value(name)' | sed '/^$/d' | wc -l | tr -d ' ')"
          test "${existing_enabled}" = "0"

          record="$(gcloud secrets versions add "${secret_name}" \
            --project "${GCP_PROJECT_ID}" \
            --data-file "${RUNNER_TEMP}/fcm-device-token" \
            --format=json \
            --quiet)"
          version="$(jq -r '.name | split("/") | last' <<< "${record}")"
          state="$(jq -r '.state // empty' <<< "${record}")"
          [[ "${version}" =~ ^[1-9][0-9]*$ ]]
          test "${state}" = "ENABLED"
          rm -f "${RUNNER_TEMP}/fcm-device-token"
          echo "FCM_TOKEN_SECRET=${secret_name}" >> "${GITHUB_ENV}"
          echo "FCM_TOKEN_SECRET_VERSION=${version}" >> "${GITHUB_ENV}"

'''
workflow, count = re.subn(
    r'      - name: Store synthetic FCM token as one-run Secret Manager secret\n.*?(?=      - name: Configure Artifact Registry authentication\n)',
    lambda _: secret_step,
    workflow,
    count=1,
    flags=re.S,
)
if count != 1:
    raise SystemExit(f'secret handoff step replacement count={count}')

workflow = replace_literal(
    workflow,
    '--set-secrets "DATABASE_URL=direkt-database-url:${DIREKT_DATABASE_URL_SECRET_VERSION},FCM_SYNTHETIC_DEVICE_TOKEN=${FCM_TOKEN_SECRET}:1"',
    '--set-secrets "DATABASE_URL=direkt-database-url:${DIREKT_DATABASE_URL_SECRET_VERSION},FCM_SYNTHETIC_DEVICE_TOKEN=${FCM_TOKEN_SECRET}:${FCM_TOKEN_SECRET_VERSION}"',
    'exact secret version binding',
)
workflow = replace_literal(
    workflow,
    '          grep -Fq "${FCM_TOKEN_SECRET}" "${job_export}"\n',
    '          grep -Fq "${FCM_TOKEN_SECRET}" "${job_export}"\n'
    '          grep -Eq "key:[[:space:]]*[\\\"\\\x27]?${FCM_TOKEN_SECRET_VERSION}[\\\"\\\x27]?[[:space:]]*$" "${job_export}"\n',
    'deployed secret verification',
)
workflow = replace_literal(
    workflow,
    '- FCM token: temporary one-run Secret Manager value; not logged or retained in artifacts',
    '- FCM token: temporary one-run version of the fixed Secret Manager canary container; exact numeric version only; not logged or retained in artifacts',
    'summary secret wording',
)

cleanup_step = '''      - name: Cleanup temporary FCM token version and canary job
        if: always()
        shell: bash
        run: |
          set +e
          cleanup_failed=false
          rm -f "${RUNNER_TEMP}/fcm-device-token"

          if gcloud run jobs describe "${GCP_CANARY_JOB}" \
            --project "${GCP_PROJECT_ID}" \
            --region "${GCP_REGION}" >/dev/null 2>&1; then
            if ! gcloud run jobs delete "${GCP_CANARY_JOB}" \
              --project "${GCP_PROJECT_ID}" \
              --region "${GCP_REGION}" \
              --quiet; then
              cleanup_failed=true
            fi
          fi

          if [[ -n "${FCM_TOKEN_SECRET:-}" && -n "${FCM_TOKEN_SECRET_VERSION:-}" ]]; then
            if ! gcloud secrets versions destroy "${FCM_TOKEN_SECRET_VERSION}" \
              --secret "${FCM_TOKEN_SECRET}" \
              --project "${GCP_PROJECT_ID}" \
              --quiet; then
              cleanup_failed=true
            else
              state="$(gcloud secrets versions describe "${FCM_TOKEN_SECRET_VERSION}" \
                --secret "${FCM_TOKEN_SECRET}" \
                --project "${GCP_PROJECT_ID}" \
                --format='value(state)' 2>/dev/null || true)"
              [[ "${state}" = "DESTROYED" ]] || cleanup_failed=true
            fi
          fi

          test "${cleanup_failed}" = "false"
'''
workflow, count = re.subn(
    r'      - name: Cleanup temporary FCM token and canary job\n.*\Z',
    lambda _: cleanup_step,
    workflow,
    count=1,
    flags=re.S,
)
if count != 1:
    raise SystemExit(f'cleanup step replacement count={count}')

for forbidden in ('gcloud secrets create', 'gcloud secrets delete', 'direkt-fcm-canary-token-${GITHUB_RUN_ID}'):
    if forbidden in workflow:
        raise SystemExit(f'forbidden self-bootstrap pattern remains: {forbidden}')

workflow_path.write_text(workflow, encoding='utf-8')

verifier = verifier_path.read_text(encoding='utf-8')
verifier = replace_literal(
    verifier,
    '        "direkt-fcm-canary-token-${GITHUB_RUN_ID}",\n        "PUSH_PROVIDER_MODE=fcm",\n',
    '        "GCP_FCM_CANARY_SECRET: direkt-fcm-canary-token",\n'
    '        "gcloud secrets versions add",\n'
    '        "FCM_TOKEN_SECRET_VERSION",\n'
    '        "gcloud secrets versions destroy",\n'
    '        "PUSH_PROVIDER_MODE=fcm",\n',
    'verifier FCM secret invariants',
)
anchor = '''    prohibit(
        fcm_canary,
        r"roles/firebasecloudmessaging\\.admin",
        "broad predefined FCM admin role",
    )
'''
insert = anchor + '''    prohibit(fcm_canary, r"gcloud\\s+secrets\\s+create", "CI-created Secret Manager containers")
    prohibit(fcm_canary, r"gcloud\\s+secrets\\s+delete", "CI-deleted Secret Manager containers")
    require(
        fcm_canary,
        "FCM_SYNTHETIC_DEVICE_TOKEN=${FCM_TOKEN_SECRET}:${FCM_TOKEN_SECRET_VERSION}",
        "exact numeric FCM canary secret-version binding",
    )
'''
verifier = replace_literal(verifier, anchor, insert, 'verifier FCM admin prohibition')
verifier_path.write_text(verifier, encoding='utf-8')

print('RC4 fixed-container/version-only Secret Manager patch prepared.')
