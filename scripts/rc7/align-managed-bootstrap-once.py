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
    '''gcloud services enable "${required_services[@]}" --project "${GCP_PROJECT_ID}" --quiet
receipt "required_services_enabled=true"
''',
    '''enabled_services="$(gcloud services list --enabled --project "${GCP_PROJECT_ID}" --format='value(config.name)')"
for service in "${required_services[@]}"; do
  grep -Fxq "${service}" <<< "${enabled_services}"
done
receipt "required_services_preprovisioned=true"
''',
    'read-only service verification',
)
replace_once(
    script,
    '''billing_account="$(gcloud billing projects describe "${GCP_PROJECT_ID}" --format='value(billingAccountName)' | sed 's#billingAccounts/##')"
test -n "${billing_account}"
budget_name="$(gcloud billing budgets list --billing-account "${billing_account}" --filter='displayName="DIREKT RC7 Maps synthetic"' --format='value(name)' --limit=1 || true)"
if [[ -z "${budget_name}" ]]; then
  budget_name="$(gcloud billing budgets create \\
    --billing-account "${billing_account}" \\
    --display-name "DIREKT RC7 Maps synthetic" \\
    --budget-amount 25USD \\
    --calendar-period month \\
    --filter-projects "projects/${GCP_PROJECT_ID}" \\
    --threshold-rule percent=0.50 \\
    --threshold-rule percent=0.80 \\
    --threshold-rule percent=1.00 \\
    --format='value(name)')"
fi
test -n "${budget_name}"
receipt "budget_alert_present=true"
receipt "budget_display_name=DIREKT RC7 Maps synthetic"
receipt "budget_amount_usd=25"
''',
    '''bootstrap_secret_json="${RUNNER_TEMP}/rc7-bootstrap-secret.json"
gcloud secrets describe "${BACKEND_SECRET}" --project "${GCP_PROJECT_ID}" --format=json > "${bootstrap_secret_json}"
jq -e '
  .labels["direkt-rc7-bootstrap"] == "ready" and
  .labels["direkt-rc7-budget"] == "usd25" and
  .labels["direkt-rc7-quota"] == "60"
' "${bootstrap_secret_json}" >/dev/null
receipt "owner_bootstrap_verified=true"
receipt "budget_alert_present=true"
receipt "budget_display_name=DIREKT RC7 Maps synthetic"
receipt "budget_amount_usd=25"
''',
    'owner bootstrap budget verification',
)
replace_once(
    script,
    '''if ! gcloud alpha services quota update \\
  --service geocoding-backend.googleapis.com \\
  --consumer "projects/${GCP_PROJECT_NUMBER}" \\
  --metric "${quota_metric}" \\
  --unit "${quota_unit}" \\
  --value 60 \\
  --force \\
  --quiet; then
  gcloud alpha services quota create \\
    --service geocoding-backend.googleapis.com \\
    --consumer "projects/${GCP_PROJECT_NUMBER}" \\
    --metric "${quota_metric}" \\
    --unit "${quota_unit}" \\
    --value 60 \\
    --force \\
    --quiet
fi
receipt "geocoding_quota_metric=${quota_metric}"
receipt "geocoding_quota_per_minute=60"
''',
    '''receipt "geocoding_quota_metric=${quota_metric}"
receipt "geocoding_quota_per_minute=60"
receipt "geocoding_quota_preprovisioned=true"
''',
    'read-only quota verification',
)
replace_once(
    script,
    '''if ! gcloud secrets describe "${BACKEND_SECRET}" --project "${GCP_PROJECT_ID}" >/dev/null 2>&1; then
  gcloud secrets create "${BACKEND_SECRET}" --project "${GCP_PROJECT_ID}" --replication-policy automatic --quiet
fi
version_name="$(gcloud secrets versions add "${BACKEND_SECRET}" --project "${GCP_PROJECT_ID}" --data-file "${RUNNER_TEMP}/rc7-backend-key.txt" --format='value(name)')"
BACKEND_SECRET_VERSION="${version_name##*/}"
[[ "${BACKEND_SECRET_VERSION}" =~ ^[1-9][0-9]*$ ]]
gcloud secrets add-iam-policy-binding "${BACKEND_SECRET}" \\
  --project "${GCP_PROJECT_ID}" \\
  --member "serviceAccount:${GCP_RUNTIME_SERVICE_ACCOUNT}" \\
  --role roles/secretmanager.secretAccessor \\
  --quiet >/dev/null
receipt "backend_secret=${BACKEND_SECRET}"
''',
    '''secret_policy="$(gcloud secrets get-iam-policy "${BACKEND_SECRET}" --project "${GCP_PROJECT_ID}" --format=json)"
for role in roles/secretmanager.secretVersionManager roles/secretmanager.viewer; do
  jq -e --arg role "${role}" --arg member "serviceAccount:${GCP_DEPLOYER_SERVICE_ACCOUNT}" \\
    '.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)' \\
    <<< "${secret_policy}" >/dev/null
done
jq -e --arg member "serviceAccount:${GCP_RUNTIME_SERVICE_ACCOUNT}" \\
  '.bindings[]? | select(.role == "roles/secretmanager.secretAccessor") | .members[]? | select(. == $member)' \\
  <<< "${secret_policy}" >/dev/null
if jq -e '.bindings[]? | select(.role == "roles/secretmanager.admin")' <<< "${secret_policy}" >/dev/null; then
  echo "Broad roles/secretmanager.admin is prohibited on the RC7 secret." >&2
  exit 1
fi
version_name="$(gcloud secrets versions add "${BACKEND_SECRET}" --project "${GCP_PROJECT_ID}" --data-file "${RUNNER_TEMP}/rc7-backend-key.txt" --format='value(name)')"
BACKEND_SECRET_VERSION="${version_name##*/}"
[[ "${BACKEND_SECRET_VERSION}" =~ ^[1-9][0-9]*$ ]]
receipt "backend_secret=${BACKEND_SECRET}"
''',
    'preprovisioned secret boundary',
)

workflow = '.github/workflows/rc7-maps-managed.yml'
replace_once(
    workflow,
    '''      - "docs/integrations/RC7_MAPS_MANAGED_TRIGGER.md"
  push:
''',
    '''      - "docs/integrations/RC7_MAPS_MANAGED_TRIGGER.md"
      - "docs/integrations/RC7_MAPS_OWNER_BOOTSTRAP.md"
      - "scripts/rc7/bootstrap-maps-managed.sh"
  push:
''',
    'PR bootstrap paths',
)
replace_once(
    workflow,
    '''      - "docs/integrations/RC7_MAPS_MANAGED_TRIGGER.md"
  workflow_dispatch:
''',
    '''      - "docs/integrations/RC7_MAPS_MANAGED_TRIGGER.md"
      - "docs/integrations/RC7_MAPS_OWNER_BOOTSTRAP.md"
      - "scripts/rc7/bootstrap-maps-managed.sh"
  workflow_dispatch:
''',
    'main bootstrap paths',
)
replace_once(
    workflow,
    '''          bash -n scripts/rc7/run-maps-managed.sh
          grep -Fq 'RUN-DIREKT-RC7-MAPS-MANAGED' docs/integrations/RC7_MAPS_MANAGED_TRIGGER.md
''',
    '''          bash -n scripts/rc7/run-maps-managed.sh
          bash -n scripts/rc7/bootstrap-maps-managed.sh
          grep -Fq 'RC7_MAPS_BOOTSTRAP|PASS' scripts/rc7/bootstrap-maps-managed.sh
          grep -Fq 'RUN-DIREKT-RC7-MAPS-MANAGED' docs/integrations/RC7_MAPS_MANAGED_TRIGGER.md
''',
    'bootstrap contract checks',
)

verifier = 'scripts/rc7/verify-maps-contract.py'
replace_once(
    verifier,
    '''    managed_script = read("scripts/rc7/run-maps-managed.sh")
    managed_trigger = read("docs/integrations/RC7_MAPS_MANAGED_TRIGGER.md")
''',
    '''    managed_script = read("scripts/rc7/run-maps-managed.sh")
    owner_bootstrap = read("scripts/rc7/bootstrap-maps-managed.sh")
    owner_bootstrap_doc = read("docs/integrations/RC7_MAPS_OWNER_BOOTSTRAP.md")
    managed_trigger = read("docs/integrations/RC7_MAPS_MANAGED_TRIGGER.md")
''',
    'bootstrap verifier inputs',
)
replace_once(
    verifier,
    '''        "scripts/rc7/run-maps-managed.sh",
    ):
''',
    '''        "scripts/rc7/run-maps-managed.sh",
        "scripts/rc7/bootstrap-maps-managed.sh",
    ):
''',
    'managed workflow bootstrap path',
)
replace_once(
    verifier,
    '''        "DIREKT RC7 Maps synthetic",
        "geocoding_quota_per_minute=60",
''',
    '''        "owner_bootstrap_verified=true",
        "DIREKT RC7 Maps synthetic",
        "geocoding_quota_per_minute=60",
        "geocoding_quota_preprovisioned=true",
''',
    'managed bootstrap receipt checks',
)
replace_once(
    verifier,
    '''    prohibit(managed_script, r"set\\s+-[^\\n]*x", "shell trace that could expose key material")
''',
    '''    prohibit(managed_script, r"set\\s+-[^\\n]*x", "shell trace that could expose key material")
    prohibit(managed_script, r"gcloud\\s+services\\s+enable", "runtime API enablement")
    prohibit(managed_script, r"gcloud\\s+billing\\s+budgets\\s+create", "runtime budget mutation")
    prohibit(managed_script, r"gcloud\\s+secrets\\s+create", "runtime secret-container creation")
    prohibit(managed_script, r"gcloud\\s+secrets\\s+add-iam-policy-binding", "runtime secret IAM mutation")
    prohibit(managed_script, r"services\\s+quota\\s+(create|update)", "runtime quota mutation")
''',
    'runtime bootstrap mutation prohibitions',
)
replace_once(
    verifier,
    '''    require(managed_trigger, "CONFIRMATION=RUN-DIREKT-RC7-MAPS-MANAGED", "managed proof confirmation")
''',
    '''    for needle in (
        "RC7_MAPS_BOOTSTRAP|PASS",
        "secret_value_created=false",
        "roles/serviceusage.apiKeysAdmin",
        "roles/compute.networkAdmin",
        "roles/secretmanager.secretVersionManager",
        "roles/secretmanager.secretAccessor",
        "temporary_authority_expires_at",
        "budget_amount_usd=25",
        "geocoding_quota_per_minute=60",
        "places_routes_enabled_by_rc7=false",
    ):
        require(owner_bootstrap, needle, "owner-scoped Maps bootstrap")
    prohibit(owner_bootstrap, r"api-keys\\s+get-key-string", "owner bootstrap API key value read")
    prohibit(owner_bootstrap, r"secrets\\s+versions\\s+add", "owner bootstrap secret value creation")
    require(owner_bootstrap_doc, "one serious owner-scoped Cloud Shell action", "owner bootstrap documentation")

    require(managed_trigger, "CONFIRMATION=RUN-DIREKT-RC7-MAPS-MANAGED", "managed proof confirmation")
''',
    'owner bootstrap verifier contract',
)

print('RC7 managed proof aligned to owner bootstrap.')
