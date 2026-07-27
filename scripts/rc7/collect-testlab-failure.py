#!/usr/bin/env python3
"""Collect a bounded, credential-free Firebase Test Lab failure receipt."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import subprocess
import urllib.error
import urllib.request

OPAQUE_LONG_VALUE = re.compile(r"[0-9A-Za-z_+=/.:-]{80,}")
OAUTH_TOKEN = re.compile(r"ya29\.[0-9A-Za-z._-]{20,}")
API_KEY = re.compile(r"AIza[0-9A-Za-z_-]{20,}")
AUTHORIZATION = re.compile(r"(?i)(Bearer|Authorization:)\s+\S+")


def sanitize_text(value: object, *, limit: int = 4000) -> str:
    text = str(value or "").strip()
    text = OAUTH_TOKEN.sub("[REDACTED_OAUTH_TOKEN]", text)
    text = API_KEY.sub("[REDACTED_API_KEY]", text)
    text = AUTHORIZATION.sub(r"\1 [REDACTED]", text)
    text = OPAQUE_LONG_VALUE.sub("[REDACTED_LONG_VALUE]", text)
    return text[:limit]


def access_token() -> str:
    completed = subprocess.run(
        ["gcloud", "auth", "print-access-token"],
        check=True,
        capture_output=True,
        text=True,
    )
    token = completed.stdout.strip()
    if len(token) < 20:
        raise RuntimeError("Google access token was unavailable.")
    return token


def get_json(url: str, token: str) -> dict[str, object]:
    request = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = response.read().decode("utf-8")
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"Google diagnostic API returned HTTP {error.code}.") from error
    parsed = json.loads(payload)
    if not isinstance(parsed, dict):
        raise RuntimeError("Google diagnostic API returned a non-object response.")
    return parsed


def sanitize_issue(issue: object) -> dict[str, object]:
    if not isinstance(issue, dict):
        return {}
    stack = issue.get("stackTrace")
    return {
        "errorMessage": sanitize_text(issue.get("errorMessage"), limit=1200),
        "severity": sanitize_text(issue.get("severity"), limit=80),
        "type": sanitize_text(issue.get("type"), limit=120),
        "category": sanitize_text(issue.get("category"), limit=120),
        "stackTrace": sanitize_text(
            stack.get("exception") if isinstance(stack, dict) else "",
            limit=6000,
        ),
    }


def sanitize_test_case(test_case: object) -> dict[str, object]:
    if not isinstance(test_case, dict):
        return {}
    reference = test_case.get("testCaseReference")
    reference = reference if isinstance(reference, dict) else {}
    stack_traces = test_case.get("stackTraces")
    stack_traces = stack_traces if isinstance(stack_traces, list) else []
    return {
        "testCaseId": sanitize_text(test_case.get("testCaseId"), limit=200),
        "status": sanitize_text(test_case.get("status"), limit=80),
        "className": sanitize_text(reference.get("className"), limit=300),
        "name": sanitize_text(reference.get("name"), limit=300),
        "testSuiteName": sanitize_text(reference.get("testSuiteName"), limit=300),
        "stackTraces": [
            sanitize_text(trace.get("exception"), limit=8000)
            for trace in stack_traces
            if isinstance(trace, dict) and trace.get("exception")
        ][:5],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", required=True)
    parser.add_argument("--matrix", required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    if not re.fullmatch(r"[a-z][a-z0-9-]{5,62}", args.project):
        raise SystemExit("Invalid Test Lab project id.")
    if not re.fullmatch(r"matrix-[a-z0-9]+", args.matrix):
        raise SystemExit("Invalid Test Lab matrix id.")

    token = access_token()
    matrix = get_json(
        f"https://testing.googleapis.com/v1/projects/{args.project}/testMatrices/{args.matrix}",
        token,
    )
    result_storage = matrix.get("resultStorage")
    result_storage = result_storage if isinstance(result_storage, dict) else {}
    tool_results = result_storage.get("toolResultsExecution")
    tool_results = tool_results if isinstance(tool_results, dict) else {}
    history_id = sanitize_text(tool_results.get("historyId"), limit=200)
    execution_id = sanitize_text(tool_results.get("executionId"), limit=200)

    sanitized_executions: list[dict[str, object]] = []
    for execution in matrix.get("testExecutions", []) if isinstance(matrix.get("testExecutions"), list) else []:
        if not isinstance(execution, dict):
            continue
        tool_execution = execution.get("toolExecution")
        tool_execution = tool_execution if isinstance(tool_execution, dict) else {}
        outcome = tool_execution.get("outcome")
        outcome = outcome if isinstance(outcome, dict) else {}
        sanitized_executions.append(
            {
                "id": sanitize_text(execution.get("id"), limit=200),
                "state": sanitize_text(execution.get("state"), limit=80),
                "outcomeSummary": sanitize_text(outcome.get("summary"), limit=80),
                "testDetails": sanitize_text(execution.get("testDetails"), limit=1200),
                "testIssues": [
                    sanitize_issue(issue)
                    for issue in tool_execution.get("testIssues", [])
                    if isinstance(tool_execution.get("testIssues"), list)
                ][:20],
            }
        )

    sanitized_steps: list[dict[str, object]] = []
    if history_id and execution_id:
        base = (
            "https://toolresults.googleapis.com/toolresults/v1beta3/"
            f"projects/{args.project}/histories/{history_id}/executions/{execution_id}"
        )
        steps_payload = get_json(f"{base}/steps", token)
        steps = steps_payload.get("steps")
        steps = steps if isinstance(steps, list) else []
        for step in steps[:20]:
            if not isinstance(step, dict):
                continue
            step_id = sanitize_text(step.get("stepId"), limit=200)
            outcome = step.get("outcome")
            outcome = outcome if isinstance(outcome, dict) else {}
            test_step = step.get("testExecutionStep")
            test_step = test_step if isinstance(test_step, dict) else {}
            cases: list[dict[str, object]] = []
            if step_id:
                cases_payload = get_json(f"{base}/steps/{step_id}/testCases?pageSize=100", token)
                raw_cases = cases_payload.get("testCases")
                raw_cases = raw_cases if isinstance(raw_cases, list) else []
                cases = [sanitize_test_case(case) for case in raw_cases[:100]]
            sanitized_steps.append(
                {
                    "stepId": step_id,
                    "name": sanitize_text(step.get("name"), limit=300),
                    "state": sanitize_text(step.get("state"), limit=80),
                    "outcomeSummary": sanitize_text(outcome.get("summary"), limit=80),
                    "infrastructureFailure": bool(outcome.get("infrastructureFailure", False)),
                    "testIssues": [
                        sanitize_issue(issue)
                        for issue in test_step.get("testIssues", [])
                        if isinstance(test_step.get("testIssues"), list)
                    ][:20],
                    "testCases": cases,
                }
            )

    output = {
        "schema": "direkt.rc7.testlab-failure.v1",
        "rawLogsIncluded": False,
        "credentialIncluded": False,
        "apiKeyIncluded": False,
        "coordinateValuesIncluded": False,
        "participantDataIncluded": False,
        "matrixId": args.matrix,
        "matrixState": sanitize_text(matrix.get("state"), limit=80),
        "outcomeSummary": sanitize_text(matrix.get("outcomeSummary"), limit=80),
        "invalidMatrixDetails": sanitize_text(matrix.get("invalidMatrixDetails"), limit=300),
        "historyId": history_id,
        "executionId": execution_id,
        "testExecutions": sanitized_executions,
        "steps": sanitized_steps,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    print("RC7_TESTLAB_FAILURE_EVIDENCE|PASS")
    print(f"matrix_id={args.matrix}")
    print(f"step_count={len(sanitized_steps)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
