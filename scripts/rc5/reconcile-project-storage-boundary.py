#!/usr/bin/env python3
"""Temporary deterministic patcher for the final RC5 project-scoped Storage-role review fix."""

from pathlib import Path


def replace_once(path: str, old: str, new: str, label: str) -> None:
    file = Path(path)
    text = file.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one match, found {count}")
    file.write_text(text.replace(old, new, 1), encoding="utf-8")


workflow_old = """          done

          runner_permissions="$(gcloud iam roles describe direktTestLabRunner --project "${GCP_PROJECT_ID}" --format='value(includedPermissions)' | tr ';' '\\n' | sed '/^$/d' | sort -u)"
"""
workflow_new = """          done

          bash scripts/rc5/verify-no-project-storage-roles.sh "${GCP_PROJECT_ID}" "${member}"

          runner_permissions="$(gcloud iam roles describe direktTestLabRunner --project "${GCP_PROJECT_ID}" --format='value(includedPermissions)' | tr ';' '\\n' | sed '/^$/d' | sort -u)"
"""
replace_once(
    ".github/workflows/firebase-test-lab.yml",
    workflow_old,
    workflow_new,
    "managed workflow Storage boundary insertion",
)

bootstrap_old = """done

bucket_policy="$(gcloud storage buckets get-iam-policy "${bucket_uri}" --format=json)"
"""
bootstrap_new = """done

bash scripts/rc5/verify-no-project-storage-roles.sh "${project_id}" "${deployer_member}"

bucket_policy="$(gcloud storage buckets get-iam-policy "${bucket_uri}" --format=json)"
"""
replace_once(
    "scripts/rc5/bootstrap-test-lab.sh",
    bootstrap_old,
    bootstrap_new,
    "owner bootstrap Storage boundary insertion",
)

verifier_path = Path("scripts/rc5/verify-test-lab-contract.py")
verifier = verifier_path.read_text(encoding="utf-8")

old_read = '    selector = read("scripts/rc5/select-test-lab-matrix.py")\n    notes = read("docs/integrations/RC5_FIREBASE_TEST_LAB_IMPLEMENTATION_NOTES.md")\n'
new_read = '    selector = read("scripts/rc5/select-test-lab-matrix.py")\n    storage_boundary = read("scripts/rc5/verify-no-project-storage-roles.sh")\n    notes = read("docs/integrations/RC5_FIREBASE_TEST_LAB_IMPLEMENTATION_NOTES.md")\n'
if verifier.count(old_read) != 1:
    raise SystemExit(f"verifier helper read insertion: expected one match, found {verifier.count(old_read)}")
verifier = verifier.replace(old_read, new_read, 1)

old_workflow_requirement = '        "serviceusage.services.get",\n        "retention-days: 30",\n'
new_workflow_requirement = '        "serviceusage.services.get",\n        \'bash scripts/rc5/verify-no-project-storage-roles.sh "${GCP_PROJECT_ID}" "${member}"\',\n        "retention-days: 30",\n'
if verifier.count(old_workflow_requirement) != 1:
    raise SystemExit(
        f"verifier managed helper requirement: expected one match, found {verifier.count(old_workflow_requirement)}"
    )
verifier = verifier.replace(old_workflow_requirement, new_workflow_requirement, 1)

old_bootstrap_requirement = '        "gcloud storage buckets add-iam-policy-binding",\n        "roles/cloudtestservice.testAdmin",\n'
new_bootstrap_requirement = '        "gcloud storage buckets add-iam-policy-binding",\n        \'bash scripts/rc5/verify-no-project-storage-roles.sh "${project_id}" "${deployer_member}"\',\n        "roles/cloudtestservice.testAdmin",\n'
if verifier.count(old_bootstrap_requirement) != 1:
    raise SystemExit(
        f"verifier bootstrap helper requirement: expected one match, found {verifier.count(old_bootstrap_requirement)}"
    )
verifier = verifier.replace(old_bootstrap_requirement, new_bootstrap_requirement, 1)

anchor = '    prohibit(bootstrap, r"--role\\s+roles/(owner|editor)(?:\\s|$)", "broad owner/editor grant")\n\n'
helper_checks = '''    for needle in (
        "gcloud projects get-iam-policy",
        "gcloud iam roles describe",
        "organizations/*/roles/*",
        "Project-scoped role ${role}",
        "contains prohibited Cloud Storage permissions",
        "grep -Eq '^storage\\.'",
    ):
        require(storage_boundary, needle, "project-scoped Storage-role verifier")

'''
if verifier.count(anchor) != 1:
    raise SystemExit(f"verifier helper-check anchor: expected one match, found {verifier.count(anchor)}")
verifier = verifier.replace(anchor, anchor + helper_checks, 1)
verifier_path.write_text(verifier, encoding="utf-8")

notes_path = Path("docs/integrations/RC5_FIREBASE_TEST_LAB_IMPLEMENTATION_NOTES.md")
notes = notes_path.read_text(encoding="utf-8")
old_note = "- binds `direktTestLabResultsWriter` only on the dedicated results bucket and explicitly fails if that role is present for the deployer at project scope;\n"
new_note = old_note + "- enumerates every direct project IAM role bound to the GitHub deployer, resolves its live permissions, and fails closed if any project-scoped role contains `storage.*`; the dedicated results role remains bucket-only and absent from project scope;\n"
if notes.count(old_note) != 1:
    raise SystemExit(f"implementation notes Storage-role insertion: expected one match, found {notes.count(old_note)}")
notes_path.write_text(notes.replace(old_note, new_note, 1), encoding="utf-8")

print("RC5 project-scoped Storage-role reconciliation patch applied deterministically.")
