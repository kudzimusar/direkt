#!/usr/bin/env python3
"""Reject RC7 workflow startup contexts and interactive gcloud component setup."""

from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = ROOT / ".github/workflows/rc7-maps-managed.yml"


def require_once(workflow: str, value: str, message: str) -> int:
    count = workflow.count(value)
    if count != 1:
        raise AssertionError(f"{message} Expected exactly once, found {count}.")
    return workflow.find(value)


def main() -> int:
    workflow = WORKFLOW.read_text(encoding="utf-8")

    forbidden_job_env = re.compile(
        r"^\s{6}RC7_RECEIPT_PATH:\s*\$\{\{\s*runner\.temp\s*\}\}\s*$",
        flags=re.MULTILINE,
    )
    if forbidden_job_env.search(workflow):
        raise AssertionError(
            "RC7_RECEIPT_PATH cannot use runner.temp in job-level env; "
            "the runner context does not exist before job startup."
        )

    required_runtime_export = (
        'echo "RC7_RECEIPT_PATH=${RUNNER_TEMP}/rc7-maps-managed-receipt.txt" '
        '>> "${GITHUB_ENV}"'
    )
    export_step = require_once(
        workflow,
        required_runtime_export,
        "RC7 must initialize its receipt path from RUNNER_TEMP inside a running step.",
    )

    resolve_step = workflow.find("- name: Resolve exact-main execution inputs")
    checkout_step = workflow.find("- name: Check out exact reviewed source")
    if not (0 <= resolve_step < export_step < checkout_step):
        raise AssertionError(
            "RC7 receipt path must be initialized in the exact-main controls step "
            "before checkout and managed execution."
        )

    require_once(
        workflow,
        'CLOUDSDK_CORE_DISABLE_PROMPTS: "1"',
        "RC7 must disable Cloud SDK prompts in the managed job.",
    )
    alpha_step = require_once(
        workflow,
        "- name: Install matching gcloud alpha component noninteractively",
        "RC7 must explicitly install the alpha component before quota inspection.",
    )
    alpha_command = require_once(
        workflow,
        "run: gcloud components install alpha --quiet",
        "RC7 alpha component installation must be noninteractive.",
    )
    setup_gcloud = workflow.find("- name: Set up Google Cloud CLI")
    managed_execution = workflow.find("- name: Execute bounded managed proof")
    if not (0 <= setup_gcloud < alpha_step <= alpha_command < managed_execution):
        raise AssertionError(
            "RC7 must install the matching alpha component after setup-gcloud and "
            "before the managed proof script executes."
        )

    print("RC7_MANAGED_WORKFLOW_CONTEXT|PASS")
    print("job_level_runner_context=false")
    print("receipt_path_runtime_initialized=true")
    print("cloudsdk_prompts_disabled=true")
    print("gcloud_alpha_noninteractive=true")
    print("gcp_authority_changed=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
