#!/usr/bin/env python3
"""Select a small, deterministic DIREKT RC5 matrix from the live Test Lab virtual catalog."""

from __future__ import annotations

import argparse
import json
import tempfile
from pathlib import Path
from typing import Any

MIN_SDK = 23
NOTIFICATION_API = 33
MAX_CURRENT_API = 36
MIN_CURRENT_API = 35
MAX_DEVICES = 3


def _versions(model: dict[str, Any]) -> list[int]:
    raw = model.get("supportedVersionIds") or model.get("supported_version_ids") or []
    if isinstance(raw, str):
        raw = raw.replace(";", ",").split(",")
    versions: set[int] = set()
    for value in raw:
        text = str(value).strip()
        if text.isdigit():
            versions.add(int(text))
    return sorted(versions)


def _model_id(model: dict[str, Any]) -> str:
    return str(model.get("id") or model.get("modelId") or "").strip()


def _tags(model: dict[str, Any]) -> list[str]:
    raw = model.get("tags") or []
    if isinstance(raw, str):
        raw = raw.replace(";", ",").split(",")
    return [str(tag).strip().lower() for tag in raw if str(tag).strip()]


def _form_factor(model: dict[str, Any]) -> str:
    return str(model.get("formFactor") or model.get("form_factor") or "").strip().lower()


def _eligible_models(models: list[dict[str, Any]]) -> list[dict[str, Any]]:
    usable = [model for model in models if _model_id(model) and _versions(model)]
    phone_declared = [model for model in usable if _form_factor(model) in {"phone", "handset"}]
    if phone_declared:
        usable = phone_declared
    return usable


def _pick_model(models: list[dict[str, Any]], version: int) -> dict[str, Any]:
    candidates = [model for model in models if version in _versions(model)]
    if not candidates:
        raise ValueError(f"No live virtual Test Lab model supports Android API {version}.")

    def sort_key(model: dict[str, Any]) -> tuple[int, int, str]:
        tags = _tags(model)
        degraded = any("reduced_stability" in tag or "deprecated" in tag for tag in tags)
        default = any(tag == "default" for tag in tags)
        return (1 if degraded else 0, 0 if default else 1, _model_id(model))

    return sorted(candidates, key=sort_key)[0]


def select_matrix(models: list[dict[str, Any]]) -> dict[str, Any]:
    eligible = _eligible_models(models)
    if not eligible:
        raise ValueError("The live virtual Test Lab catalog returned no eligible Android models.")

    available_versions = sorted({version for model in eligible for version in _versions(model)})
    if NOTIFICATION_API not in available_versions:
        raise ValueError("Android API 33 is unavailable in the live virtual catalog; RC5 notification-era coverage cannot be claimed.")

    current_versions = [version for version in available_versions if MIN_CURRENT_API <= version <= MAX_CURRENT_API]
    if not current_versions:
        raise ValueError("No live virtual Test Lab version in the current API 35-36 baseline is available.")
    current_api = max(current_versions)

    compatibility_versions = [version for version in available_versions if MIN_SDK <= version < NOTIFICATION_API]
    compatibility_api = MIN_SDK if MIN_SDK in compatibility_versions else (min(compatibility_versions) if compatibility_versions else None)

    targets: list[dict[str, Any]] = []

    def add_target(purpose: str, version: int, note: str) -> None:
        model = _pick_model(eligible, version)
        targets.append(
            {
                "purpose": purpose,
                "model": _model_id(model),
                "version": str(version),
                "locale": "en",
                "orientation": "portrait",
                "note": note,
            }
        )

    if compatibility_api is not None:
        compatibility_note = (
            "Exact minSdk boundary."
            if compatibility_api == MIN_SDK
            else f"Lowest currently available virtual API above minSdk {MIN_SDK}."
        )
        add_target("minimum-compatibility", compatibility_api, compatibility_note)

    add_target("android-13-notification", NOTIFICATION_API, "Android 13 runtime notification-permission boundary.")
    add_target("current-platform", current_api, "Highest live virtual API within DIREKT target/compile baseline through API 36.")

    unique: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for target in targets:
        key = (target["model"], target["version"])
        if key not in seen:
            seen.add(key)
            unique.append(target)

    if not 2 <= len(unique) <= MAX_DEVICES:
        raise ValueError(f"RC5 matrix must contain 2-{MAX_DEVICES} unique device/version pairs; selected {len(unique)}.")

    return {
        "schema": "direkt.rc5.test-lab-matrix.v1",
        "catalogPolicy": "live-virtual-only",
        "deviceCount": len(unique),
        "minSdk": MIN_SDK,
        "notificationApi": NOTIFICATION_API,
        "currentApi": current_api,
        "minimumCompatibilityApi": compatibility_api,
        "targets": unique,
    }


def run_self_test() -> None:
    fixtures = [
        {"id": "virtual-a", "formFactor": "PHONE", "supportedVersionIds": ["23", "33", "35"], "tags": ["virtual", "default"]},
        {"id": "virtual-b", "formFactor": "PHONE", "supportedVersionIds": ["33", "36"], "tags": ["virtual"]},
        {"id": "tv", "formFactor": "TV", "supportedVersionIds": ["33", "36"], "tags": ["virtual"]},
    ]
    matrix = select_matrix(fixtures)
    assert matrix["deviceCount"] == 3
    assert [target["version"] for target in matrix["targets"]] == ["23", "33", "36"]
    assert all(target["model"] != "tv" for target in matrix["targets"])

    fallback = [
        {"id": "virtual-c", "formFactor": "PHONE", "supportedVersionIds": ["24", "33", "35"], "tags": ["virtual"]},
    ]
    matrix = select_matrix(fallback)
    assert matrix["minimumCompatibilityApi"] == 24
    assert matrix["deviceCount"] == 3

    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "matrix.json"
        path.write_text(json.dumps(matrix, sort_keys=True), encoding="utf-8")
        assert json.loads(path.read_text(encoding="utf-8"))["schema"] == "direkt.rc5.test-lab-matrix.v1"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--models", type=Path, help="JSON output from `gcloud firebase test android models list --filter=virtual --format=json`.")
    parser.add_argument("--output", type=Path, help="Path for the selected sanitized matrix JSON.")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        run_self_test()
        print("RC5 Test Lab matrix selector self-test passed.")
        return 0

    if args.models is None or args.output is None:
        parser.error("--models and --output are required unless --self-test is used")

    raw = json.loads(args.models.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raise SystemExit("Expected Test Lab models JSON to be a list.")
    matrix = select_matrix([item for item in raw if isinstance(item, dict)])
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(matrix, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(matrix, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
