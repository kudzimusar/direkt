#!/usr/bin/env python3
"""Verify the permanent RC9 generated-client architecture and closure contract."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCK = ROOT / "WORKSTREAM_LOCK.md"
PROJECT = ROOT / "PROJECT_STATUS.md"
STATUS = ROOT / "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
LEDGER = ROOT / "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
PLAN = ROOT / "docs/integrations/RUNTIME_INTEGRATION_CLOSURE_PLAN.md"
IMPLEMENTATION = ROOT / "docs/integrations/RC9_GENERATED_CLIENTS_IMPLEMENTATION.md"
CLOSURE = ROOT / "docs/integrations/RC9_CLOSURE_RECEIPT.md"
BACKEND_PACKAGE = ROOT / "backend/direkt-api/package.json"
OPENAPI_GENERATOR = ROOT / "backend/direkt-api/scripts/generate-openapi.ts"
OPENAPI_CHECK = ROOT / "backend/direkt-api/scripts/check-openapi.ts"
BACKEND_WORKFLOW = ROOT / ".github/workflows/backend-ci.yml"
ANDROID_BUILD = ROOT / "android/direkt-app/app/build.gradle.kts"
ANDROID_AUTH = ROOT / "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/auth/PilotAuthenticationCoordinator.kt"
ANDROID_GENERATED_AUTH = (
    ROOT
    / "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/auth/GeneratedPilotSessionExchangeClient.kt"
)
ANDROID_GENERATED_AUTH_TEST = (
    ROOT
    / "android/direkt-app/app/src/test/java/com/kudzimusar/direkt/auth/GeneratedPilotSessionExchangeClientTest.kt"
)
WEB_PACKAGE = ROOT / "web/direkt-app/package.json"
WEB_PUBLIC_CLIENT = ROOT / "web/direkt-app/lib/server/direkt-api-client.ts"
WEB_AUTH_CLIENT = ROOT / "web/direkt-app/lib/server/direkt-auth-api.ts"
WEB_GENERATED_CONTRACTS = ROOT / "web/direkt-app/lib/server/generated-auth-contracts.ts"
WEB_WIRE_DATETIME = ROOT / "web/direkt-app/lib/server/wire-date-time.ts"
WEB_GENERATED_CONTRACT_TEST = ROOT / "web/direkt-app/scripts/verify-generated-auth-adapter.mjs"
WORKFLOW = ROOT / ".github/workflows/rc9-generated-clients-contract.yml"


def require(path: Path, needle: str) -> None:
    content = path.read_text(encoding="utf-8")
    if needle not in content:
        raise SystemExit(f"RC9 contract missing {needle!r} in {path.relative_to(ROOT)}")


def require_any(path: Path, needles: tuple[str, ...], label: str) -> None:
    content = path.read_text(encoding="utf-8")
    if not any(needle in content for needle in needles):
        raise SystemExit(
            f"RC9 contract missing a supported {label} in {path.relative_to(ROOT)}: {needles!r}"
        )


def reject(path: Path, needle: str) -> None:
    content = path.read_text(encoding="utf-8")
    if needle in content:
        raise SystemExit(f"RC9 contract prohibits {needle!r} in {path.relative_to(ROOT)}")


for path in (
    LOCK,
    PROJECT,
    STATUS,
    LEDGER,
    PLAN,
    IMPLEMENTATION,
    CLOSURE,
    BACKEND_PACKAGE,
    OPENAPI_GENERATOR,
    OPENAPI_CHECK,
    BACKEND_WORKFLOW,
    ANDROID_BUILD,
    ANDROID_AUTH,
    ANDROID_GENERATED_AUTH,
    ANDROID_GENERATED_AUTH_TEST,
    WEB_PACKAGE,
    WEB_PUBLIC_CLIENT,
    WEB_AUTH_CLIENT,
    WEB_GENERATED_CONTRACTS,
    WEB_WIRE_DATETIME,
    WEB_GENERATED_CONTRACT_TEST,
    WORKFLOW,
):
    if not path.is_file():
        raise SystemExit(f"RC9 contract missing file {path.relative_to(ROOT)}")

require(LOCK, "RC9 implementation contract — CLOSED AND PRESERVED")
require(LOCK, "RC10 implementation contract — CLAIMED")
require(LOCK, "RC8 implementation contract — CLOSED AND PRESERVED")
require(LOCK, "70de95c73128e921cd4d7c667de0e5a442a9e0c0")
require(PROJECT, "RC1–RC9 are closed")
require(PROJECT, "Active repository write lane:** RC10 Turnstile threat-model decision")
require(STATUS, "Fully generated Kotlin/TypeScript client packages")
require(STATUS, "RC9 CLOSED — DETERMINISTIC / BOUNDED RUNTIME ADOPTION")
require(STATUS, "RC9 generated Kotlin/TypeScript clients — **CLOSED")
require(LEDGER, "RC9 OpenAPI generated Kotlin/TypeScript client adoption — **CLOSED")
require(LEDGER, "### RC9 generated-client closure receipt")
for needle in (
    "State:** CLOSED — DETERMINISTIC GENERATED CLIENTS / BOUNDED RUNTIME ADOPTION",
    "Implementation PR:** #497",
    "04ef57f31414ec5165e353abba74afb8dfdcc901",
    "70de95c73128e921cd4d7c667de0e5a442a9e0c0",
    "957b19192443b2511f1bf784595591b25b5e7a2e",
    "30273733920",
    "30273729323",
    "30273725051",
    "browser-direct private API: false",
    "production authentication/release authorization: false",
    "RC10 is next but unclaimed",
):
    require(CLOSURE, needle)

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
    "A generated browser transport is not approved",
    "Production authorization",
    "False.",
):
    require(IMPLEMENTATION, needle)

require(BACKEND_PACKAGE, '"openapi:generate"')
require(BACKEND_PACKAGE, '"openapi:check"')
require(OPENAPI_GENERATOR, "'artifacts'")
require(OPENAPI_GENERATOR, "'openapi.json'")
require(OPENAPI_GENERATOR, "JSON.stringify(document, null, 2)")
require(OPENAPI_CHECK, "Expected an OpenAPI 3.x document")
require(OPENAPI_CHECK, "Protected operation is missing bearer security")
require(OPENAPI_CHECK, "Private lifecycle routes were exposed publicly")
require(OPENAPI_CHECK, "Unapproved payment-provider paths were exposed")
require(OPENAPI_CHECK, "Sensitive payment fields entered OpenAPI")
require(BACKEND_WORKFLOW, "npm run openapi:check")
require(BACKEND_WORKFLOW, "backend/direkt-api/artifacts/openapi.json")

require(ANDROID_BUILD, 'buildConfigField("String", "DIREKT_PILOT_API_BASE_URL"')
require(ANDROID_BUILD, 'sourceSets["main"].kotlin.srcDir')
require(ANDROID_BUILD, "isCoreLibraryDesugaringEnabled = true")
require(ANDROID_BUILD, "implementation(libs.retrofit.core)")
require(ANDROID_BUILD, "implementation(libs.retrofit.kotlinx.serialization)")
require(ANDROID_BUILD, "coreLibraryDesugaring(libs.desugar.jdk.libs)")
require(ANDROID_AUTH, "sessionExchangeClient.exchange")
require(ANDROID_AUTH, "PilotSessionStore")
require(ANDROID_AUTH, "PushRegistrationCoordinator")
reject(ANDROID_AUTH, "HttpsURLConnection")
reject(ANDROID_AUTH, "JSONObject")
reject(ANDROID_BUILD, "openapi-generator")
for needle in (
    "AuthenticationApi",
    "FirebaseSessionExchangeDto",
    "AuthenticatedSessionResponseDto",
    "connectTimeout(10, TimeUnit.SECONDS)",
    "readTimeout(10, TimeUnit.SECONDS)",
    "writeTimeout(10, TimeUnit.SECONDS)",
    "followRedirects(false)",
    "followSslRedirects(false)",
    "retryOnConnectionFailure(false)",
    "DIREKT API base URL must use HTTPS",
):
    require(ANDROID_GENERATED_AUTH, needle)
for needle in (
    "rejects non-HTTPS base URLs",
    "maps the approved request and preserves rejection semantics",
    "consentAccepted",
    "noticeVersion",
):
    require(ANDROID_GENERATED_AUTH_TEST, needle)

require(WEB_PACKAGE, '"next": "16.2.10"')
require(WEB_PACKAGE, '"verify:generated-auth"')
require(WEB_PUBLIC_CLIENT, "getCloudRunIdentityToken")
require(WEB_PUBLIC_CLIENT, 'headers["X-Serverless-Authorization"]')
require(WEB_PUBLIC_CLIENT, 'cache: "no-store"')
require(WEB_PUBLIC_CLIENT, 'redirect: "error"')
require(WEB_AUTH_CLIENT, "getCloudRunIdentityToken")
require(WEB_AUTH_CLIENT, 'headers.authorization = `Bearer ${options.accessToken}`')
require(WEB_AUTH_CLIENT, 'headers["idempotency-key"]')
require(WEB_AUTH_CLIENT, "response.status >= 500 ? undefined : problem")
require(WEB_AUTH_CLIENT, "toDirektAuthenticatedSession")
require(WEB_GENERATED_CONTRACTS, "AuthenticatedSessionResponseDto")
require(WEB_GENERATED_CONTRACTS, "FirebaseSessionExchangeDto")
require(WEB_GENERATED_CONTRACTS, "normalizeWireDateTime")
require(WEB_WIRE_DATETIME, "value instanceof Date")
require(WEB_WIRE_DATETIME, "new Date(value)")
require(WEB_GENERATED_CONTRACT_TEST, "normalizes raw JSON date-time strings")
require(WEB_GENERATED_CONTRACT_TEST, "rejects invalid date-time values")
reject(WEB_PACKAGE, "@supabase")
reject(WEB_PUBLIC_CLIENT, "clients/generated/typescript")

for path in (
    ANDROID_BUILD,
    ANDROID_AUTH,
    ANDROID_GENERATED_AUTH,
    WEB_PACKAGE,
    WEB_PUBLIC_CLIENT,
    WEB_AUTH_CLIENT,
    WEB_GENERATED_CONTRACTS,
    WEB_WIRE_DATETIME,
):
    reject(path, "DATABASE_URL")
    reject(path, "service_role")
    reject(path, "paymentProviderSecret")

require(WORKFLOW, "python3 scripts/rc9/verify-generated-foundation.py")
require(WORKFLOW, "python3 scripts/rc9/verify-generated-client-contract.py")
require(WORKFLOW, "python3 scripts/rc8/verify-payments-contract.py")
require(WORKFLOW, '"PROJECT_STATUS.md"')
require(WORKFLOW, '"WORKSTREAM_LOCK.md"')
require(WORKFLOW, '"backend/direkt-api/**"')
require(WORKFLOW, '"android/direkt-app/**"')
require(WORKFLOW, '"web/direkt-app/**"')

print("RC9_GENERATED_CLIENT_CONTRACT|PASS")
print("claim_base=030cd577e179863b70f24d99ab237e74660b4325")
print("implementation_merge=70de95c73128e921cd4d7c667de0e5a442a9e0c0")
print("closeout_merge=957b19192443b2511f1bf784595591b25b5e7a2e")
print("closure_state=closed")
print("rc9_closure_preserved=true")
print("later_checkpoint=rc10_claimed")
print("generator_version=7.22.0")
print("generator_strategy_pinned=true")
print("kotlin_runtime_migration_pending=false")
print("typescript_bff_contract_adoption_pending=false")
print("bounded_generated_imports=true")
print("browser_direct_private_api=false")
print("privileged_client_credentials=false")
print("production_authorization=false")
