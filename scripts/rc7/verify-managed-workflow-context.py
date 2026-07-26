#!/usr/bin/env python3
"""Reject RC7 workflow expressions in contexts unavailable before job startup."""

from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = ROOT / ".github/workflows/rc7-maps-managed.yml"


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
    if required_runtime_export not in workflow:
        raise AssertionError(
            "RC7 managed workflow must initialize RC7_RECEIPT_PATH from RUNNER_TEMP "
            "inside a running step."
        )

    if workflow.count(required_runtime_export) != 1:
        raise AssertionError("RC7 receipt path must be initialized exactly once.")

    resolve_step = workflow.find("- name: Resolve exact-main execution inputs")
    checkout_step = workflow.find("- name: Check out exact reviewed source")
    export_step = workflow.find(required_runtime_export)
    if not (0 <= resolve_step < export_step < checkout_step):
        raise AssertionError(
            "RC7 receipt path must be initialized in the exact-main controls step "
            "before checkout and managed execution."
        )

    print("RC7_MANAGED_WORKFLOW_CONTEXT|PASS")
    print("job_level_runner_context=false")
    print("receipt_path_runtime_initialized=true")
    print("gcp_behavior_changed=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
