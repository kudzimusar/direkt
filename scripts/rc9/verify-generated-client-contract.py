#!/usr/bin/env python3
"""Verify the permanent RC9 generated-client architecture and claim contract."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCK = ROOT / "WORKSTREAM_LOCK.md"
PROJECT = ROOT / "PROJECT_STATUS.md"
STATUS = ROOT / "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
LEDGER = ROOT / "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
PLAN = ROOT / "docs/integrations/RUNTIME_INTEGRATION_CLOSURE_PLAN.md"
IMPLEMENTATION = ROOT / "docs/integrations/RC9_GENERATED_CLIENTS_IMPLEMENTATION.md"
BACKEND_PACKAGE = ROOT / "backend/direkt-api/package.json"
OPENAPI_GENERATOR = ROOT / "backend/direkt-api/scripts/generate-openapi.ts"
OPENAPI_CHECK = ROOT / "backend/direkt-api/scripts/check-openapi.ts"
BACKEND_WORKFLOW = ROOT / ".github/workflows/backend-ci.yml"
ANDROID_BUILD = ROOT / "android/direkt-app/app/build.gradle.kts"
ANDROID_AUTH = ROOT / "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/auth/PilotAuthenticationCoordinator.kt"
WEB_PACKAGE = ROOT / "web/direkt-app/package.json"
WEB_PUBLIC_CLIENT = ROOT / "web/direkt-app/lib/server/direkt-api-client.ts"
WEB_AUTH_CLIENT = ROOT / "web/direkt-app/lib/server/direkt-auth-api.ts"
WORKFLOW = ROOT / ".github/workflows/rc9-generated-clients-contract.yml"


def require(path: Path, needle: str) -> None:
    content = path.read_text(encoding="utf-8")
    if needle not in content:
        raise SystemExit(f"RC9 contract missing {needle!r} in {path.relative_to(ROOT)}")


def reject(path: Path, needle: str) -> None:
    content = path.read_text(encoding="utf-8")
    if needle in content:
        raise SystemExit(f"RC9 contract prohibits {needle!r} in {path.relative_to(ROOT)}")


require(LOCK, "CLAIMED — RC9 OpenAPI-generated client adoption")
require(LOCK, "RC9 implementation contract — CLAIMED")
require(LOCK, "RC9 is the sole active repository write lane")
require(LOCK, "RC8 implementation contract — CLOSED AND PRESERVED")
require(LOCK, "030cd577e179863b70f24d99ab237e74660b4325")
require(PROJECT, "Active repository write lane:** RC9 OpenAPI-generated Kotlin/TypeScript client adoption")
require(PROJECT, "RC9 is now the sole active repository lane")
require(STATUS, "RC9 CLAIMED / DETERMINISTIC FOUNDATION PENDING")
require(STATUS, "RC9 generated Kotlin/TypeScript clients — **CLAIMED")
require(LEDGER, "RC9 OpenAPI generated Kotlin/TypeScript client adoption decision/migration — **CLAIMED**")

require(PLAN, "decide generator/versioning strategy")
require(PLAN, "generated code deterministic and CI drift-controlled")
require(PLAN, "incremental Kotlin migration preserving Android behavior")
require(PLAN, "TypeScript adoption only where it improves the reviewed BFF/API boundary")
require(PLAN, "no direct privileged backend access")
require(PLAN, "cross-client compatibility/regression evidence")

for needle in (
    "OpenAPI Generator `7.22.0`",
    "hideGenerationTimestamp=true",
    "jvm-retrofit2",
    "kotlinx_serialization",
    "Firebase-to-DIREKT session exchange",
    "server-only BFF",
    "byte-for-byte drift",
    "No generated browser transport is approved",
    "Production authorization",
    "False.",
):
    require(IMPLEMENTATION, needle)

require(BACKEND_PACKAGE, '"openapi:generate"')
require(BACKEND_PACKAGE, '"openapi:check"')
require(OPENAPI_GENERATOR, "artifacts/openapi.json")
require(OPENAPI_GENERATOR, "JSON.stringify(document, null, 2)")
require(OPENAPI_CHECK, "Expected an OpenAPI 3.x document")
require(OPENAPI_CHECK, "Protected operation is missing bearer security")
require(OPENAPI_CHECK, "Private lifecycle routes were exposed publicly")
require(OPENAPI_CHECK, "Unapproved payment-provider paths were exposed")
require(OPENAPI_CHECK, "Sensitive payment fields entered OpenAPI")
require(BACKEND_WORKFLOW, "npm run openapi:check")
require(BACKEND_WORKFLOW, "backend/direkt-api/artifacts/openapi.json")

require(ANDROID_BUILD, 'buildConfigField("String", "DIREKT_PILOT_API_BASE_URL"')
require(ANDROID_AUTH, "HttpsURLConnection")
require(ANDROID_AUTH, "JSONObject")
require(ANDROID_AUTH, "/api/v1/auth/firebase/exchange")
require(ANDROID_AUTH, "PilotSessionStore")
require(ANDROID_AUTH, "PushRegistrationCoordinator")
reject(ANDROID_BUILD, "openapi-generator")
reject(ANDROID_BUILD, "retrofit")

require(WEB_PACKAGE, '"next": "16.2.10"')
require(WEB_PUBLIC_CLIENT, "getCloudRunIdentityToken")
require(WEB_PUBLIC_CLIENT, 'headers["X-Serverless-Authorization"]')
require(WEB_PUBLIC_CLIENT, 'cache: "no-store"')
require(WEB_PUBLIC_CLIENT, 'redirect: "error"')
require(WEB_AUTH_CLIENT, "getCloudRunIdentityToken")
require(WEB_AUTH_CLIENT, 'headers.authorization = `Bearer ${options.accessToken}`')
require(WEB_AUTH_CLIENT, 'headers["idempotency-key"]')
require(WEB_AUTH_CLIENT, "response.status >= 500 ? undefined : problem")
reject(WEB_PACKAGE, "@supabase")

for path in (ANDROID_BUILD, ANDROID_AUTH, WEB_PACKAGE, WEB_PUBLIC_CLIENT, WEB_AUTH_CLIENT):
    reject(path, "DATABASE_URL")
    reject(path, "service_role")
    reject(path, "paymentProviderSecret")

require(WORKFLOW, "python3 scripts/rc9/verify-generated-client-contract.py")
require(WORKFLOW, "python3 scripts/rc8/verify-payments-contract.py")
require(WORKFLOW, '"PROJECT_STATUS.md"')
require(WORKFLOW, '"WORKSTREAM_LOCK.md"')
require(WORKFLOW, '"backend/direkt-api/**"')
require(WORKFLOW, '"android/direkt-app/**"')
require(WORKFLOW, '"web/direkt-app/**"')

print("RC9_GENERATED_CLIENT_CONTRACT|PASS")
print("claim_base=030cd577e179863b70f24d99ab237e74660b4325")
print("generator_version=7.22.0")
print("deterministic_generation_pending=true")
print("kotlin_runtime_migration_pending=true")
print("typescript_bff_contract_adoption_pending=true")
print("browser_direct_private_api=false")
print("privileged_client_credentials=false")
print("production_authorization=false")
