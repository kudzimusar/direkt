#!/usr/bin/env python3
"""Apply the reviewed RC9 Android transport additions to the Play/Data Safety inventory."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VERIFY = ROOT / "scripts/verify-phase12-play-readiness.py"
INVENTORY = ROOT / "docs/phase12/play/data_safety_inventory.json"


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected one replacement in {path.relative_to(ROOT)}, found {count}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


replace_once(
    VERIFY,
    'VERSION_FILE = ROOT / "android" / "direkt-app" / "release" / "version.properties"\nANDROID_NS',
    'VERSION_FILE = ROOT / "android" / "direkt-app" / "release" / "version.properties"\n'
    'GENERATED_AUTH_CLIENT = ROOT / "android" / "direkt-app" / "app" / "src" / "main" / "java" / "com" / "kudzimusar" / "direkt" / "auth" / "GeneratedPilotSessionExchangeClient.kt"\n'
    'ANDROID_NS',
)
replace_once(
    VERIFY,
    '    "com.google.maps.android:maps-compose",\n    "org.jetbrains.kotlin:kotlin-stdlib",',
    '    "com.google.maps.android:maps-compose",\n'
    '    "com.squareup.okhttp3:logging-interceptor",\n'
    '    "com.squareup.retrofit2:converter-kotlinx-serialization",\n'
    '    "com.squareup.retrofit2:converter-scalars",\n'
    '    "com.squareup.retrofit2:retrofit",\n'
    '    "org.jetbrains.kotlin:kotlin-stdlib",\n'
    '    "org.jetbrains.kotlinx:kotlinx-serialization-json",',
)
replace_once(
    VERIFY,
    '        "libs.google.maps.compose": "com.google.maps.android:maps-compose",\n    }',
    '        "libs.google.maps.compose": "com.google.maps.android:maps-compose",\n'
    '        "libs.kotlinx.serialization.json": "org.jetbrains.kotlinx:kotlinx-serialization-json",\n'
    '        "libs.retrofit.core": "com.squareup.retrofit2:retrofit",\n'
    '        "libs.retrofit.kotlinx.serialization": "com.squareup.retrofit2:converter-kotlinx-serialization",\n'
    '        "libs.retrofit.scalars": "com.squareup.retrofit2:converter-scalars",\n'
    '        "libs.okhttp.logging": "com.squareup.okhttp3:logging-interceptor",\n'
    '    }',
)
replace_once(
    VERIFY,
    '        "implementation(libs.google.maps.compose)",\n        "DIREKT_CRASHLYTICS_CANARY_ENABLED",',
    '        "implementation(libs.google.maps.compose)",\n'
    '        "implementation(libs.kotlinx.serialization.json)",\n'
    '        "implementation(libs.retrofit.core)",\n'
    '        "implementation(libs.retrofit.kotlinx.serialization)",\n'
    '        "implementation(libs.retrofit.scalars)",\n'
    '        "implementation(libs.okhttp.logging)",\n'
    '        "sourceSets[\\"main\\"].kotlin.srcDir",\n'
    '        "DIREKT_CRASHLYTICS_CANARY_ENABLED",',
)
replace_once(
    VERIFY,
    '    if "Google Maps SDK for Android" not in sdk_names:\n        fail("Maps Compose dependency exists but Maps SDK is absent from Data Safety SDK inventory")\n',
    '    if "Google Maps SDK for Android" not in sdk_names:\n'
    '        fail("Maps Compose dependency exists but Maps SDK is absent from Data Safety SDK inventory")\n'
    '    if "DIREKT generated Retrofit transport" not in sdk_names:\n'
    '        fail("RC9 Retrofit/serialization dependencies exist but the generated transport is absent from the Data Safety SDK inventory")\n',
)
replace_once(
    VERIFY,
    '    if maps_inventory.get("exact_private_provider_coordinates_transmitted") is not False:\n        fail("RC7 Maps must not transmit exact private provider coordinates")\n\n    data_entries = data_safety.get("play_data_types", [])',
    '    if maps_inventory.get("exact_private_provider_coordinates_transmitted") is not False:\n'
    '        fail("RC7 Maps must not transmit exact private provider coordinates")\n\n'
    '    generated_auth = GENERATED_AUTH_CLIENT.read_text(encoding="utf-8")\n'
    '    for required in (\n'
    '        "okHttpClientBuilder = safeHttpClient",\n'
    '        "followRedirects(false)",\n'
    '        "followSslRedirects(false)",\n'
    '        "retryOnConnectionFailure(false)",\n'
    '        "DIREKT API base URL must use HTTPS",\n'
    '    ):\n'
    '        if required not in generated_auth:\n'
    '            fail(f"RC9 Android generated transport boundary missing: {required}")\n'
    '    if ".setLogger(" in generated_auth or "HttpLoggingInterceptor" in generated_auth:\n'
    '        fail("RC9 Android wrapper must not activate generated HTTP body logging")\n\n'
    '    transport_inventory = next(\n'
    '        (item for item in data_safety.get("sdk_inventory", []) if item.get("sdk") == "DIREKT generated Retrofit transport"),\n'
    '        None,\n'
    '    )\n'
    '    if not isinstance(transport_inventory, dict):\n'
    '        fail("RC9 generated transport SDK inventory entry is invalid")\n'
    '    expected_transport_dependencies = {\n'
    '        "com.squareup.okhttp3:logging-interceptor",\n'
    '        "com.squareup.retrofit2:converter-kotlinx-serialization",\n'
    '        "com.squareup.retrofit2:converter-scalars",\n'
    '        "com.squareup.retrofit2:retrofit",\n'
    '        "org.jetbrains.kotlinx:kotlinx-serialization-json",\n'
    '    }\n'
    '    if set(transport_inventory.get("dependencies", [])) != expected_transport_dependencies:\n'
    '        fail("RC9 generated transport Data Safety dependency inventory is incomplete")\n'
    '    for key, expected in (\n'
    '        ("http_body_logging_active", False),\n'
    '        ("generated_default_logger_bypassed_by_direkt_owned_client", True),\n'
    '        ("automatic_retries", False),\n'
    '        ("redirects", False),\n'
    '        ("https_only", True),\n'
    '        ("third_party_endpoint", False),\n'
    '        ("browser_or_provider_direct_access", False),\n'
    '    ):\n'
    '        if transport_inventory.get(key) is not expected:\n'
    '            fail(f"RC9 generated transport inventory must record {key}={str(expected).lower()}")\n\n'
    '    data_entries = data_safety.get("play_data_types", [])',
)
replace_once(
    VERIFY,
    '    print("maps_participant_or_production_authorized=false")\n    print("account_deletion_end_to_end=false")',
    '    print("maps_participant_or_production_authorized=false")\n'
    '    print("rc9_generated_transport_inventory_present=true")\n'
    '    print("rc9_http_body_logging_active=false")\n'
    '    print("rc9_automatic_retries=false")\n'
    '    print("rc9_redirects=false")\n'
    '    print("rc9_https_only=true")\n'
    '    print("account_deletion_end_to_end=false")',
)

inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
inventory["schema_version"] = 4
inventory["artifact_scope"]["note"] = (
    "This inventory describes the current Android Firebase Authentication, RC3 Crashlytics, RC4 Firebase Cloud "
    "Messaging, RC7 Google Maps SDK and RC9 generated Retrofit/Kotlin serialization transport source integrations. "
    "Crashlytics collection, FCM auto-init and Maps runtime activation are disabled by default. RC9 uses the generated "
    "client only for the Firebase-to-DIREKT session exchange behind a DIREKT-owned HTTPS-only, no-redirect, no-retry "
    "OkHttp wrapper; generated HTTP body logging is not activated. Only exact-source synthetic managed canaries may "
    "explicitly activate provider integrations before later participant and production authorization."
)
transport = {
    "sdk": "DIREKT generated Retrofit transport",
    "dependencies": [
        "com.squareup.okhttp3:logging-interceptor",
        "com.squareup.retrofit2:converter-kotlinx-serialization",
        "com.squareup.retrofit2:converter-scalars",
        "com.squareup.retrofit2:retrofit",
        "org.jetbrains.kotlinx:kotlinx-serialization-json",
    ],
    "active_use": "RC9 bounded Firebase-to-DIREKT session exchange only; generated request/response models run behind the DIREKT-owned Android wrapper.",
    "automatic_collection": [],
    "application_supplied_processing": [
        "Firebase ID token, approved notice version, affirmative consent flag and bounded device label sent only to the private DIREKT API",
        "DIREKT identity/session response parsed into the existing encrypted app-private session store",
    ],
    "http_body_logging_active": False,
    "generated_default_logger_bypassed_by_direkt_owned_client": True,
    "automatic_retries": False,
    "redirects": False,
    "https_only": True,
    "third_party_endpoint": False,
    "browser_or_provider_direct_access": False,
    "sharing_assessment": "No third-party SDK collection or sharing is introduced by these transport/serialization libraries. They carry application-supplied authentication data only to the private DIREKT API; final Play answers remain subject to exact-release revalidation.",
}
sdk_inventory = inventory.get("sdk_inventory", [])
sdk_inventory = [item for item in sdk_inventory if item.get("sdk") != transport["sdk"]]
sdk_inventory.append(transport)
inventory["sdk_inventory"] = sdk_inventory
not_collected = inventory.get("not_collected_by_current_android_release_path", [])
logging_statement = (
    "authentication/session payloads through HTTP body logging; RC9 supplies a DIREKT-owned OkHttp builder and does not activate the generated default BODY logger"
)
if logging_statement not in not_collected:
    not_collected.append(logging_statement)
inventory["not_collected_by_current_android_release_path"] = not_collected
INVENTORY.write_text(json.dumps(inventory, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

print("RC9_PLAY_SDK_INVENTORY_PATCH|PASS")
