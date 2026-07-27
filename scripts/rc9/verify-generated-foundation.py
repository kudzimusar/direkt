#!/usr/bin/env python3
"""Verify RC9 generated-source integrity and bounded runtime adoption."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "clients/generator/openapi-generator.json"
KOTLIN_CONFIG = ROOT / "clients/generator/kotlin.json"
TYPESCRIPT_CONFIG = ROOT / "clients/generator/typescript-fetch.json"
RECEIPT = ROOT / "clients/generated/GENERATION_RECEIPT.json"
KOTLIN_SOURCE = ROOT / "clients/generated/kotlin/src/main/kotlin"
TYPESCRIPT_SOURCE = ROOT / "clients/generated/typescript/src"
KOTLIN_BUILD = ROOT / "clients/generated/kotlin/build.gradle.kts"
KOTLIN_SETTINGS = ROOT / "clients/generated/kotlin/settings.gradle.kts"
TYPESCRIPT_TSCONFIG = ROOT / "clients/generated/typescript/tsconfig.json"
GENERATOR_SCRIPT = ROOT / "scripts/rc9/generate-clients.sh"
ANDROID_SOURCE = ROOT / "android/direkt-app/app/src"
ANDROID_GENERATED_ADAPTER = (
    ANDROID_SOURCE
    / "main/java/com/kudzimusar/direkt/auth/GeneratedPilotSessionExchangeClient.kt"
)
WEB_SOURCE = ROOT / "web/direkt-app"
WEB_GENERATED_ADAPTER = WEB_SOURCE / "lib/server/generated-auth-contracts.ts"

EXPECTED_VERSION = "7.22.0"
EXPECTED_JAR_SHA256 = "3f1e6ce5c6ad4f15242c6170ab43aad4bad771622617eeece4a7d4f72ffaf329"
HEX64 = re.compile(r"^[0-9a-f]{64}$")
IGNORED_RUNTIME_ARTIFACT_PARTS = frozenset({"node_modules", ".next", "coverage", "dist", "build"})
IGNORED_RUNTIME_ARTIFACT_SUFFIXES = frozenset({
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".jar",
    ".class",
    ".tsbuildinfo",
})


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def tree_receipt(root: Path) -> tuple[int, str]:
    digest = hashlib.sha256()
    files = [path for path in root.rglob("*") if path.is_file()]
    for path in sorted(files, key=lambda candidate: candidate.relative_to(root).as_posix()):
        relative = path.relative_to(root).as_posix().encode("utf-8")
        digest.update(relative)
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    return len(files), digest.hexdigest()


def require_file(path: Path) -> None:
    if not path.is_file():
        raise SystemExit(f"RC9 generated foundation missing {path.relative_to(ROOT)}")


def require_text(path: Path, needle: str) -> None:
    content = path.read_text(encoding="utf-8")
    if needle not in content:
        raise SystemExit(f"RC9 generated foundation missing {needle!r} in {path.relative_to(ROOT)}")


def reject_tree(
    root: Path,
    patterns: tuple[str, ...],
    label: str,
    *,
    allowed_paths: frozenset[Path] = frozenset(),
) -> None:
    allowed = {path.resolve() for path in allowed_paths}
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(root)
        if any(part in IGNORED_RUNTIME_ARTIFACT_PARTS for part in relative.parts):
            continue
        if path.suffix.lower() in IGNORED_RUNTIME_ARTIFACT_SUFFIXES:
            continue
        content = path.read_text(encoding="utf-8", errors="ignore")
        for pattern in patterns:
            if pattern in content and path.resolve() not in allowed:
                raise SystemExit(
                    f"RC9 {label} contains prohibited marker {pattern!r} in {path.relative_to(ROOT)}"
                )


for path in (
    MANIFEST,
    KOTLIN_CONFIG,
    TYPESCRIPT_CONFIG,
    RECEIPT,
    KOTLIN_BUILD,
    KOTLIN_SETTINGS,
    TYPESCRIPT_TSCONFIG,
    GENERATOR_SCRIPT,
    ANDROID_GENERATED_ADAPTER,
    WEB_GENERATED_ADAPTER,
):
    require_file(path)
if not KOTLIN_SOURCE.is_dir() or not TYPESCRIPT_SOURCE.is_dir():
    raise SystemExit("RC9 generated source directories are missing")

manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
receipt = json.loads(RECEIPT.read_text(encoding="utf-8"))
if manifest.get("version") != EXPECTED_VERSION:
    raise SystemExit("RC9 generator version is not pinned to 7.22.0")
if manifest.get("sha256") != EXPECTED_JAR_SHA256:
    raise SystemExit("RC9 generator JAR SHA-256 changed without contract review")
if receipt.get("generator", {}).get("version") != EXPECTED_VERSION:
    raise SystemExit("RC9 receipt generator version mismatch")
if receipt.get("generator", {}).get("sha256") != EXPECTED_JAR_SHA256:
    raise SystemExit("RC9 receipt generator checksum mismatch")

canonical_sha = receipt.get("canonicalOpenApi", {}).get("sha256", "")
if not isinstance(canonical_sha, str) or not HEX64.fullmatch(canonical_sha):
    raise SystemExit("RC9 canonical OpenAPI SHA-256 is invalid")
if receipt.get("config", {}).get("kotlinSha256") != sha256(KOTLIN_CONFIG):
    raise SystemExit("RC9 Kotlin configuration checksum mismatch")
if receipt.get("config", {}).get("typescriptSha256") != sha256(TYPESCRIPT_CONFIG):
    raise SystemExit("RC9 TypeScript configuration checksum mismatch")

kotlin_count, kotlin_digest = tree_receipt(KOTLIN_SOURCE)
typescript_count, typescript_digest = tree_receipt(TYPESCRIPT_SOURCE)
kotlin_receipt = receipt.get("outputs", {}).get("kotlin", {})
typescript_receipt = receipt.get("outputs", {}).get("typescript", {})
if kotlin_count < 50 or typescript_count < 50:
    raise SystemExit("RC9 generated source set is unexpectedly incomplete")
if kotlin_receipt.get("sourceFiles") != kotlin_count or kotlin_receipt.get("treeSha256") != kotlin_digest:
    raise SystemExit("RC9 Kotlin generated tree does not match its immutable receipt")
if (
    typescript_receipt.get("sourceFiles") != typescript_count
    or typescript_receipt.get("treeSha256") != typescript_digest
):
    raise SystemExit("RC9 TypeScript generated tree does not match its immutable receipt")

# The generation receipt is an immutable RC9A build receipt. Runtime adoption is
# verified separately below and must remain restricted to the reviewed adapters.
for output in (kotlin_receipt, typescript_receipt):
    if output.get("runtimeWired") is not False:
        raise SystemExit("RC9A generation receipt must retain runtimeWired=false")
if typescript_receipt.get("serverBffOnly") is not True:
    raise SystemExit("RC9 TypeScript contract must preserve the server-only BFF boundary")
for key in ("productionAuthorization", "participantData", "privilegedClientCredentials"):
    if receipt.get(key) is not False:
        raise SystemExit(f"RC9 receipt must keep {key}=false")

for needle in (
    '"version": "7.22.0"',
    EXPECTED_JAR_SHA256,
    "--global-property apiDocs=false,modelDocs=false,apiTests=false,modelTests=false",
    "RC9A_GENERATED_CLIENTS|DRIFT|PASS",
):
    require_text(GENERATOR_SCRIPT if needle.startswith("--") or needle.startswith("RC9A") else MANIFEST, needle)
for needle in (
    'kotlin("jvm") version "2.2.20"',
    'kotlin("plugin.serialization") version "2.2.20"',
    "kotlinx-serialization-json:1.9.0",
    "logging-interceptor:5.1.0",
    "retrofit:3.0.0",
    "converter-kotlinx-serialization:3.0.0",
):
    require_text(KOTLIN_BUILD, needle)
for needle in ('"strict": true', '"noEmit": true', '"moduleResolution": "Bundler"'):
    require_text(TYPESCRIPT_TSCONFIG, needle)

prohibited_generated = (
    "DATABASE_URL",
    "SUPABASE_SERVICE_ROLE",
    "service_role",
    "sk_live_",
    "sk_test_",
    "PAYPAL_CLIENT_SECRET",
    "MTN_MOMO_API_KEY",
    "WHATSAPP_ACCESS_TOKEN",
    "GOOGLE_MAPS_SERVER_API_KEY",
    "BEGIN PRIVATE KEY",
)
reject_tree(KOTLIN_SOURCE, prohibited_generated, "Kotlin output")
reject_tree(TYPESCRIPT_SOURCE, prohibited_generated, "TypeScript output")

reject_tree(
    ANDROID_SOURCE,
    ("com.kudzimusar.direkt.generated.api",),
    "Android runtime",
    allowed_paths=frozenset({ANDROID_GENERATED_ADAPTER}),
)
for needle in (
    "AuthenticationApi",
    "FirebaseSessionExchangeDto",
    "AuthenticatedSessionResponseDto",
    "followRedirects(false)",
    "followSslRedirects(false)",
    "retryOnConnectionFailure(false)",
    "normalizeHttpsBaseUrl",
):
    require_text(ANDROID_GENERATED_ADAPTER, needle)

reject_tree(
    WEB_SOURCE,
    (
        "@direkt/generated-api",
        "clients/generated/typescript",
    ),
    "web runtime",
    allowed_paths=frozenset({WEB_GENERATED_ADAPTER}),
)
for needle in (
    "AuthenticatedSessionResponseDto",
    "FirebaseSessionExchangeDto",
    "normalizeWireDateTime",
):
    require_text(WEB_GENERATED_ADAPTER, needle)

print("RC9_GENERATED_FOUNDATION|PASS")
print(f"generator_version={EXPECTED_VERSION}")
print(f"generator_sha256={EXPECTED_JAR_SHA256}")
print(f"canonical_openapi_sha256={canonical_sha}")
print(f"kotlin_source_files={kotlin_count}")
print(f"kotlin_tree_sha256={kotlin_digest}")
print(f"typescript_source_files={typescript_count}")
print(f"typescript_tree_sha256={typescript_digest}")
print("foundation_receipt_runtime_wired=false")
print("bounded_runtime_adoption=true")
print("android_generated_import_points=1")
print("typescript_generated_import_points=1")
print("browser_direct_private_api=false")
print("privileged_client_credentials=false")
print("production_authorization=false")
