#!/usr/bin/env bash
set -euo pipefail

project_id="${1:?project id is required}"
deployer_member="${2:?deployer member is required}"

[[ "${project_id}" =~ ^[a-z][a-z0-9-]{5,29}$ ]]
[[ "${deployer_member}" == serviceAccount:*@*.iam.gserviceaccount.com ]]

project_policy="$(gcloud projects get-iam-policy "${project_id}" --format=json)"
mapfile -t project_roles < <(
  jq -r --arg member "${deployer_member}" \
    '.bindings[]? | select((.members // []) | index($member)) | .role' \
    <<< "${project_policy}" \
    | sort -u
)

for role in "${project_roles[@]}"; do
  permissions=""
  case "${role}" in
    roles/*)
      permissions="$(gcloud iam roles describe "${role}" --format='value(includedPermissions)' 2>/dev/null || true)"
      ;;
    projects/${project_id}/roles/*)
      role_id="${role##*/}"
      permissions="$(gcloud iam roles describe "${role_id}" --project "${project_id}" --format='value(includedPermissions)' 2>/dev/null || true)"
      ;;
    organizations/*/roles/*)
      organization_id="${role#organizations/}"
      organization_id="${organization_id%%/*}"
      role_id="${role##*/}"
      permissions="$(gcloud iam roles describe "${role_id}" --organization "${organization_id}" --format='value(includedPermissions)' 2>/dev/null || true)"
      ;;
    *)
      echo "Unable to classify project IAM role ${role}; refusing to claim a bucket-only Storage boundary." >&2
      exit 1
      ;;
  esac

  if [[ -z "${permissions}" ]]; then
    echo "Unable to inspect permissions for project IAM role ${role}; refusing to claim a bucket-only Storage boundary." >&2
    exit 1
  fi

  if tr ';' '\n' <<< "${permissions}" | grep -Eq '^storage\.'; then
    echo "Project-scoped role ${role} bound to ${deployer_member} contains prohibited Cloud Storage permissions." >&2
    exit 1
  fi
done

printf 'Project-scoped Storage-role boundary verified for %s.\n' "${deployer_member}"
