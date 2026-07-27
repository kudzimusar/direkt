#!/usr/bin/env python3
"""Verify the permanent RC10 Turnstile decision and closure contract."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCK = ROOT / "WORKSTREAM_LOCK.md"
PROJECT = ROOT / "PROJECT_STATUS.md"
STATUS = ROOT / "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
LEDGER = ROOT / "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
PLAN = ROOT / "docs/integrations/RUNTIME_INTEGRATION_CLOSURE_PLAN.md"
DECISION = ROOT / "docs/integrations/RC10_TURNSTILE_DECISION.md"
CLOSURE = ROOT / "docs/integrations/RC10_CLOSURE_RECEIPT.md"
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
    LOCK, PROJECT, STATUS, LEDGER, PLAN, DECISION, CLOSURE, POLICIES, POLICY_TEST,
    MIDDLEWARE, AUTH, DISCOVERY, SUPPORT, INTERACTION, REVIEW, COMPLAINT,
    BACKEND_PACKAGE, BACKEND_ENVIRONMENT, WEB_PACKAGE, ANDROID_BUILD,
):
    if not path.is_file():
        raise SystemExit(f"RC10 contract missing file {path.relative_to(ROOT)}")

for needle in (
    "RELEASED — RC10 CLOSED AND PRESERVED",
    "RC10 implementation contract — CLOSED AND PRESERVED",
    "Turnstile is conditional abuse control",
    "CLOSED — NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE",
    "RC11 remains unclaimed",
    "The repository write lane is RELEASED",
):
    require(LOCK, needle)
require(PROJECT, "Active repository write lane:** none")
require(PROJECT, "RC1–RC10 are closed")
require(PROJECT, "RC11 is next but unclaimed")
require(STATUS, "RC10 CLOSED — NOT CURRENTLY REQUIRED / NOT ACTIVE")
require(LEDGER, "RC10 Turnstile closure receipt")
require(LEDGER, "New state: CLOSED — NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE")
require(PLAN, "Turnstile is not a completeness checkbox")
require(PLAN, "document `NOT CURRENTLY REQUIRED` with threat-model rationale")

for needle in (
    "**Closure state:** `CLOSED — NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE`",
    "**Implementation PR/head:** #502 / `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`",
    "**Implementation merge:** `620a99ba5465ad38ce012df0a8fa15e458de6505`",
    "no Cloudflare Turnstile site key or secret exists",
    "public_discovery_assist", "public_support_assist", "public_search_area_normalize",
    "Re-evaluation triggers", "server-side verification",
    "Android and other non-browser clients remain unaffected",
    "Production authorization:** false", "## Closure evidence",
):
    require(DECISION, needle)

for needle in (
    "State:** CLOSED — NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE",
    "cdab6622e0cc06e35cddca2bb5bc8ea70c027b38",
    "620a99ba5465ad38ce012df0a8fa15e458de6505",
    "30279827057", "30279827068", "30279826976", "30279831964",
    "30279826827", "30279829353", "30279829473", "30279826788",
    "30279829352", "30279826525", "30279826679", "30279826805",
    "30279829444", "30279829654", "30279829433", "30279829956",
    "30279829618", "30279826638", "30279829561", "30279827241",
    "The repository write lane is released", "RC11 is next but unclaimed",
):
    require(CLOSURE, needle)

for needle in (
    "security.consume_rate_limit", "createHmac('sha256'",
    "The abuse-control service is unavailable; the protected operation failed closed.",
    "RATE_LIMITS_ENABLED",
):
    require(MIDDLEWARE, needle)
for needle in (
    "key: 'public_discovery_assist'",
    r"pathPattern: /^\/api\/v1\/public\/discovery\/assist$/",
    "key: 'public_search_area_normalize'",
    r"pathPattern: /^\/api\/v1\/public\/discovery\/search-area\/normalize$/",
    "key: 'public_support_assist'",
    r"pathPattern: /^\/api\/v1\/public\/support\/assist$/",
    "requestLimit: 20", "windowSeconds: 300",
):
    require(POLICIES, needle)
for needle in (
    "protects $path without a browser challenge",
    "keeps every abuse-control key unique",
    "public_discovery_assist", "public_search_area_normalize", "public_support_assist",
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
print("state=closed")
print("decision=not_currently_required")
print("public_post_rate_limit_gaps=closed")
print("turnstile_runtime_active=false")
print("turnstile_credentials=false")
print("global_widget=false")
print("android_challenge=false")
print("workstream_lane=released")
print("rc11_claimed=false")
print("production_authorization=false")
