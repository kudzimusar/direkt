#!/usr/bin/env python3
"""Verify the RC10 conditional Turnstile threat-model claim."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCK = ROOT / "WORKSTREAM_LOCK.md"
PROJECT = ROOT / "PROJECT_STATUS.md"
STATUS = ROOT / "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
LEDGER = ROOT / "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
PLAN = ROOT / "docs/integrations/RUNTIME_INTEGRATION_CLOSURE_PLAN.md"
POLICIES = ROOT / "backend/direkt-api/src/platform/security/abuse-control.policies.ts"
MIDDLEWARE = ROOT / "backend/direkt-api/src/platform/security/abuse-control.middleware.ts"
AUTH = ROOT / "backend/direkt-api/src/auth/auth.controller.ts"
DISCOVERY = ROOT / "backend/direkt-api/src/discovery/discovery.controller.ts"
SUPPORT = ROOT / "backend/direkt-api/src/ai/public-support.controller.ts"
INTERACTION = ROOT / "backend/direkt-api/src/interaction/interaction.controller.ts"
REVIEW = ROOT / "backend/direkt-api/src/interaction/review.controller.ts"
COMPLAINT = ROOT / "backend/direkt-api/src/interaction/complaint.controller.ts"
PACKAGE = ROOT / "backend/direkt-api/package.json"


def require(path: Path, needle: str) -> None:
    text = path.read_text(encoding="utf-8")
    if needle not in text:
        raise SystemExit(f"RC10 contract missing {needle!r} in {path.relative_to(ROOT)}")


for path in (LOCK, PROJECT, STATUS, LEDGER, PLAN, POLICIES, MIDDLEWARE, AUTH, DISCOVERY, SUPPORT, INTERACTION, REVIEW, COMPLAINT, PACKAGE):
    if not path.is_file():
        raise SystemExit(f"RC10 contract missing file {path.relative_to(ROOT)}")

for needle in (
    "CLAIMED — RC10 TURNSTILE THREAT-MODEL DECISION",
    "RC10 implementation contract — CLAIMED",
    "Turnstile is conditional abuse control",
    "NOT CURRENTLY REQUIRED",
    "RC10 is the sole active repository write lane",
):
    require(LOCK, needle)
require(PROJECT, "Active repository write lane:** RC10 Turnstile threat-model decision")
require(STATUS, "RC10 CLAIMED — THREAT MODEL / NOT ACTIVE")
require(LEDGER, "CLAIMED / THREAT MODEL IN PROGRESS / RUNTIME NOT ACTIVE")
require(PLAN, "Turnstile is not a completeness checkbox")
require(PLAN, "document `NOT CURRENTLY REQUIRED` with threat-model rationale")

for needle in (
    "security.consume_rate_limit",
    "createHmac('sha256'",
    "The abuse-control service is unavailable; the protected operation failed closed.",
    "RATE_LIMITS_ENABLED",
):
    require(MIDDLEWARE, needle)
for needle in (
    "auth_challenge_request",
    "auth_challenge_verify",
    "auth_firebase_exchange",
    "public_discovery_search",
    "interaction_enquiry_create",
):
    require(POLICIES, needle)
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

package = PACKAGE.read_text(encoding="utf-8").lower()
for prohibited in ("turnstile", "captcha"):
    if prohibited in package:
        raise SystemExit(f"RC10 claim must not install {prohibited} before the decision")

print("RC10_TURNSTILE_DECISION_CONTRACT|PASS")
print("state=claimed")
print("turnstile_runtime_active=false")
print("decision_pending=true")
print("global_widget=false")
print("android_challenge=false")
print("production_authorization=false")
