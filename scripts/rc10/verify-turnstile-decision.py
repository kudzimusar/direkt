#!/usr/bin/env python3
"""Verify the RC10 conditional Turnstile decision and abuse-control implementation."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCK = ROOT / "WORKSTREAM_LOCK.md"
PROJECT = ROOT / "PROJECT_STATUS.md"
STATUS = ROOT / "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
LEDGER = ROOT / "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
PLAN = ROOT / "docs/integrations/RUNTIME_INTEGRATION_CLOSURE_PLAN.md"
DECISION = ROOT / "docs/integrations/RC10_TURNSTILE_DECISION.md"
POLICIES = ROOT / "backend/direkt-api/src/platform/security/abuse-control.policies.ts"
POLICY_TEST = ROOT / "backend/direkt-api/test/unit/platform/security/abuse-control.policies.spec.ts"
MIDDLEWARE = ROOT / "backend/direkt-api/src/platform/security/abuse-control.middleware.ts"
AUTH = ROOT / "backend/direkt-api/src/auth/auth.controller.ts"
DISCOVERY = ROOT / "backend/direkt-api/src/discovery/discovery.controller.ts"
SUPPORT = ROOT / "backend/direkt-api/src/ai/public-support.controller.ts"
INTERACTION = ROOT / "backend/direkt-api/src/interaction/interaction.controller.ts"
REVIEW = ROOT / "backend/direkt-api/src/interaction/review.controller.ts"
COMPLAINT = ROOT / "backend/direkt-api/src/interaction/complaint.controller.ts"
BACKEND_PACKAGE = ROOT / "backend/direkt-api/package.json"
BACKEND_ENVIRONMENT = ROOT / "backend/direkt-api/src/config/environment.ts"
WEB_PACKAGE = ROOT / "web/direkt-app/package.json"
ANDROID_BUILD = ROOT / "android/direkt-app/app/build.gradle.kts"


def require(path: Path, needle: str) -> None:
    text = path.read_text(encoding="utf-8")
    if needle not in text:
        raise SystemExit(f"RC10 contract missing {needle!r} in {path.relative_to(ROOT)}")


def reject(path: Path, needle: str) -> None:
    text = path.read_text(encoding="utf-8")
    if needle.lower() in text.lower():
        raise SystemExit(f"RC10 contract prohibits {needle!r} in {path.relative_to(ROOT)}")


for path in (
    LOCK,
    PROJECT,
    STATUS,
    LEDGER,
    PLAN,
    DECISION,
    POLICIES,
    POLICY_TEST,
    MIDDLEWARE,
    AUTH,
    DISCOVERY,
    SUPPORT,
    INTERACTION,
    REVIEW,
    COMPLAINT,
    BACKEND_PACKAGE,
    BACKEND_ENVIRONMENT,
    WEB_PACKAGE,
    ANDROID_BUILD,
):
    if not path.is_file():
        raise SystemExit(f"RC10 contract missing file {path.relative_to(ROOT)}")

for needle in (
    "CLAIMED — RC10 TURNSTILE THREAT-MODEL DECISION",
    "RC10 implementation contract — CLAIMED",
    "Turnstile is conditional abuse control",
    "NOT CURRENTLY REQUIRED",
    "RC10 is the sole active repository write lane",
    "RC10B",
):
    require(LOCK, needle)
require(PROJECT, "RC10 is implemented as `NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE`")
require(STATUS, "RC10 IMPLEMENTED — NOT CURRENTLY REQUIRED / NOT ACTIVE / REGRESSION PENDING")
require(LEDGER, "IMPLEMENTED / NOT CURRENTLY REQUIRED / RUNTIME NOT ACTIVE / EXACT-HEAD REGRESSION PENDING")
require(PLAN, "Turnstile is not a completeness checkbox")
require(PLAN, "document `NOT CURRENTLY REQUIRED` with threat-model rationale")

for needle in (
    "**Decision:** `NOT CURRENTLY REQUIRED`",
    "no Cloudflare Turnstile site key or secret exists",
    "public_discovery_assist",
    "public_support_assist",
    "public_search_area_normalize",
    "Re-evaluation triggers",
    "server-side verification",
    "Android and other non-browser clients remain unaffected",
    "Production authorization:** false",
):
    require(DECISION, needle)

for needle in (
    "security.consume_rate_limit",
    "createHmac('sha256'",
    "The abuse-control service is unavailable; the protected operation failed closed.",
    "RATE_LIMITS_ENABLED",
):
    require(MIDDLEWARE, needle)
for needle in (
    "key: 'public_discovery_assist'",
    "pathPattern: /^\/api\/v1\/public\/discovery\/assist$/",
    "key: 'public_search_area_normalize'",
    "pathPattern: /^\/api\/v1\/public\/discovery\/search-area\/normalize$/",
    "key: 'public_support_assist'",
    "pathPattern: /^\/api\/v1\/public\/support\/assist$/",
    "requestLimit: 20",
    "windowSeconds: 300",
):
    require(POLICIES, needle)
for needle in (
    "protects $path without a browser challenge",
    "keeps every abuse-control key unique",
    "public_discovery_assist",
    "public_search_area_normalize",
    "public_support_assist",
):
    require(POLICY_TEST, needle)

for path, needle in (
    (AUTH, "@PublicRoute()"),
    (DISCOVERY, "public/discovery/assist"),
    (DISCOVERY, "public/discovery/search-area/normalize"),
    (SUPPORT, "public/support"),
    (INTERACTION, "@ApiBearerAuth()"),
    (REVIEW, "@RequirePermission(PERMISSIONS.INTERACTION_REVIEW_CREATE)"),
    (COMPLAINT, "@RequirePermission(PERMISSIONS.INTERACTION_COMPLAINT_CREATE)"),
):
    require(path, needle)

for path in (BACKEND_PACKAGE, BACKEND_ENVIRONMENT, WEB_PACKAGE, ANDROID_BUILD):
    for prohibited in ("turnstile", "captcha", "cf-turnstile", "TURNSTILE_SECRET"):
        reject(path, prohibited)

print("RC10_TURNSTILE_DECISION_CONTRACT|PASS")
print("state=implemented_regression_pending")
print("decision=not_currently_required")
print("public_post_rate_limit_gaps=closed")
print("turnstile_runtime_active=false")
print("turnstile_credentials=false")
print("global_widget=false")
print("android_challenge=false")
print("production_authorization=false")
