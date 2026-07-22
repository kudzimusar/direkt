#!/usr/bin/env python3
from pathlib import Path

workflow_path = Path('.github/workflows/firebase-fcm-canary.yml')
verifier_path = Path('scripts/verify-integration-runtime-contract.py')

workflow = workflow_path.read_text(encoding='utf-8')

replacements = [
    (
        '      GCP_FCM_VERIFIER_ROLE_ID: direktFcmBootstrapVerifier\n',
        '      GCP_FCM_VERIFIER_ROLE_ID: direktFcmBootstrapVerifier\n'
        '      GCP_FCM_CANARY_SECRET: direkt-fcm-canary-token\n',
    ),
    (
        '          test "${GCP_FCM_VERIFIER_ROLE_ID}" = "direktFcmBootstrapVerifier"\n',
        '          test "${GCP_FCM_VERIFIER_ROLE_ID}" = "direktFcmBootstrapVerifier"\n'
        '          test "${GCP_FCM_CANARY_SECRET}" = "direkt-fcm-canary-token"\n',
    ),
    (
        '''      - name: Store synthetic FCM token as one-run Secret Manager secret\n        shell: bash\n        run: |\n          set -euo pipefail\n          secret_name="direkt-fcm-canary-token-${GITHUB_RUN_ID}"\n          gcloud secrets create "${secret_name}" \\\n            --project "${GCP_PROJECT_ID}" \\\n            --replication-policy automatic \\\n            --quiet\n          gcloud secrets versions add "${secret_name}" \\\n            --project "${GCP_PROJECT_ID}" \\\n            --data-file "${RUNNER_TEMP}/fcm-device-token" \\\n            --quiet >/dev/null\n          rm -f "${RUNNER_TEMP}/fcm-device-token"\n          gcloud secrets add-iam-policy-binding "${secret_name}" \\\n            --project "${GCP_PROJECT_ID}" \\\n            --member "serviceAccount:${GCP_RUNTIME_SERVICE_ACCOUNT}" \\\n            --role roles/secretmanager.secretAccessor \\\n            --quiet >/dev/null\n          echo "FCM_TOKEN_SECRET=${secret_name}" >> "${GITHUB_ENV}"\n''',
        '''      - name: Store synthetic FCM token as one-run Secret Manager version\n        shell: bash\n        run: |\n          set -euo pipefail\n          secret_name="${GCP_FCM_CANARY_SECRET}"\n\n          # The secret container and its secret-scoped IAM bindings are owner-provisioned.\n          # CI may add/destroy versions only; it may not create arbitrary secrets or mutate IAM.\n          existing_enabled="$(gcloud secrets versions list "${secret_name}" \\\n            --project "${GCP_PROJECT_ID}" \\\n            --filter='state=ENABLED' \\\n            --format='value(name)' | sed '/^$/d' | wc -l | tr -d ' ')"\n          test "${existing_enabled}" = "0"\n\n          record="$(gcloud secrets versions add "${secret_name}" \\\n            --project "${GCP_PROJECT_ID}" \\\n            --data-file "${RUNNER_TEMP}/fcm-device-token" \\\n            --format=json \\\n            --quiet)"\n          version="$(jq -r '.name | split("/") | last' <<< "${record}")"\n          state="$(jq -r '.state // empty' <<< "${record}")"\n          [[ "${version}" =~ ^[1-9][0-9]*$ ]]\n          test "${state}" = "ENABLED"\n          rm -f "${RUNNER_TEMP}/fcm-device-token"\n          echo "FCM_TOKEN_SECRET=${secret_name}" >> "${GITHUB_ENV}"\n          echo "FCM_TOKEN_SECRET_VERSION=${version}" >> "${GITHUB_ENV}"\n''',
    ),
    (
        '--set-secrets "DATABASE_URL=direkt-database-url:${DIREKT_DATABASE_URL_SECRET_VERSION},FCM_SYNTHETIC_DEVICE_TOKEN=${FCM_TOKEN_SECRET}:1"',
        '--set-secrets "DATABASE_URL=direkt-database-url:${DIREKT_DATABASE_URL_SECRET_VERSION},FCM_SYNTHETIC_DEVICE_TOKEN=${FCM_TOKEN_SECRET}:${FCM_TOKEN_SECRET_VERSION}"',
    ),
    (
        '''          grep -Fq "${FCM_TOKEN_SECRET}" "${job_export}"\n          grep -Fq "PUSH_PROVIDER_MODE" "${job_export}"\n''',
        '''          grep -Fq "${FCM_TOKEN_SECRET}" "${job_export}"\n          grep -Eq "key:[[:space:]]*['\\\"]?${FCM_TOKEN_SECRET_VERSION}['\\\"]?[[:space:]]*$" "${job_export}"\n          grep -Fq "PUSH_PROVIDER_MODE" "${job_export}"\n''',
    ),
    (
        '- FCM token: temporary one-run Secret Manager value; not logged or retained in artifacts',
        '- FCM token: temporary one-run version of the fixed Secret Manager canary container; exact numeric version only; not logged or retained in artifacts',
    ),
    (
        '''      - name: Cleanup temporary FCM token and canary job\n        if: always()\n        shell: bash\n        run: |\n          set +e\n          rm -f "${RUNNER_TEMP}/fcm-device-token"\n          if [[ -n "${FCM_TOKEN_SECRET:-}" ]]; then\n            gcloud secrets delete "${FCM_TOKEN_SECRET}" --project "${GCP_PROJECT_ID}" --quiet\n          fi\n          gcloud run jobs delete "${GCP_CANARY_JOB}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --quiet\n''',
        '''      - name: Cleanup temporary FCM token version and canary job\n        if: always()\n        shell: bash\n        run: |\n          set +e\n          cleanup_failed=false\n          rm -f "${RUNNER_TEMP}/fcm-device-token"\n\n          if gcloud run jobs describe "${GCP_CANARY_JOB}" \\\n            --project "${GCP_PROJECT_ID}" \\\n            --region "${GCP_REGION}" >/dev/null 2>&1; then\n            if ! gcloud run jobs delete "${GCP_CANARY_JOB}" \\\n              --project "${GCP_PROJECT_ID}" \\\n              --region "${GCP_REGION}" \\\n              --quiet; then\n              cleanup_failed=true\n            fi\n          fi\n\n          if [[ -n "${FCM_TOKEN_SECRET:-}" && -n "${FCM_TOKEN_SECRET_VERSION:-}" ]]; then\n            if ! gcloud secrets versions destroy "${FCM_TOKEN_SECRET_VERSION}" \\\n              --secret "${FCM_TOKEN_SECRET}" \\\n              --project "${GCP_PROJECT_ID}" \\\n              --quiet; then\n              cleanup_failed=true\n            else\n              state="$(gcloud secrets versions describe "${FCM_TOKEN_SECRET_VERSION}" \\\n                --secret "${FCM_TOKEN_SECRET}" \\\n                --project "${GCP_PROJECT_ID}" \\\n                --format='value(state)' 2>/dev/null || true)"\n              [[ "${state}" = "DESTROYED" ]] || cleanup_failed=true\n            fi\n          fi\n\n          test "${cleanup_failed}" = "false"\n''',
    ),
]

for old, new in replacements:
    if old not in workflow:
        raise SystemExit(f'workflow replacement anchor missing:\n{old[:300]}')
    workflow = workflow.replace(old, new, 1)

for forbidden in ('gcloud secrets create', 'gcloud secrets delete', 'direkt-fcm-canary-token-${GITHUB_RUN_ID}'):
    if forbidden in workflow:
        raise SystemExit(f'forbidden self-bootstrap pattern remains: {forbidden}')

workflow_path.write_text(workflow, encoding='utf-8')

verifier = verifier_path.read_text(encoding='utf-8')
old = '''        "direkt-fcm-canary-token-${GITHUB_RUN_ID}",\n        "PUSH_PROVIDER_MODE=fcm",\n'''
new = '''        "GCP_FCM_CANARY_SECRET: direkt-fcm-canary-token",\n        "gcloud secrets versions add",\n        "FCM_TOKEN_SECRET_VERSION",\n        "gcloud secrets versions destroy",\n        "PUSH_PROVIDER_MODE=fcm",\n'''
if old not in verifier:
    raise SystemExit('verifier FCM secret invariant anchor missing')
verifier = verifier.replace(old, new, 1)

anchor = '''    prohibit(\n        fcm_canary,\n        r"roles/firebasecloudmessaging\\.admin",\n        "broad predefined FCM admin role",\n    )\n'''
insert = anchor + '''    prohibit(fcm_canary, r"gcloud\\s+secrets\\s+create", "CI-created Secret Manager containers")\n    prohibit(fcm_canary, r"gcloud\\s+secrets\\s+delete", "CI-deleted Secret Manager containers")\n    require(\n        fcm_canary,\n        "FCM_SYNTHETIC_DEVICE_TOKEN=${FCM_TOKEN_SECRET}:${FCM_TOKEN_SECRET_VERSION}",\n        "exact numeric FCM canary secret-version binding",\n    )\n'''
if anchor not in verifier:
    raise SystemExit('verifier FCM admin prohibition anchor missing')
verifier = verifier.replace(anchor, insert, 1)
verifier_path.write_text(verifier, encoding='utf-8')

print('RC4 fixed-container/version-only Secret Manager patch prepared.')
