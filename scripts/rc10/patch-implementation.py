#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(
            f"Expected exactly one replacement in {path.relative_to(ROOT)}; found {count}: {old!r}"
        )
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


lock = ROOT / "WORKSTREAM_LOCK.md"
replace_once(
    lock,
    "| Implementation branch | `feat/rc10-turnstile-decision`, based on `main@c1960e7bf38a81ad48c8046dd90cd008ede7bb6e`. |",
    "| Implementation branch | `feat/rc10-turnstile-decision`, based on the RC10 claim merge `main@e0ee52564eef16cdec1d8eb0a85f17da456cb5b1`. |",
)
replace_once(
    lock,
    "| Stable baseline | `main@c1960e7bf38a81ad48c8046dd90cd008ede7bb6e` contains RC0–RC9 closure, the RC9D exact-main receipt and no active Turnstile runtime. |",
    "| Stable baseline | `main@e0ee52564eef16cdec1d8eb0a85f17da456cb5b1` contains RC0–RC9 closure and the formal RC10 conditional-decision claim. No Turnstile runtime is active. |",
)
replace_once(
    lock,
    "| Current task | RC10A — complete the public-flow threat model, close uncovered rate-limit gaps, make the conditional Turnstile decision and prove it through exact-head regression. |",
    "| Current task | RC10B — `NOT CURRENTLY REQUIRED` decision and public POST rate-limit coverage are implemented; focused and full exact-head regression remain before closure. |",
)

project = ROOT / "PROJECT_STATUS.md"
replace_once(
    project,
    "- runtime integration closure — **RC1–RC9 are closed at their documented bounded boundaries. RC10 is claimed from `main@c1960e7bf38a81ad48c8046dd90cd008ede7bb6e` for the conditional Turnstile threat-model decision; no Turnstile runtime is active.**",
    "- runtime integration closure — **RC1–RC9 are closed at their documented bounded boundaries. RC10 is implemented as `NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE`, with explicit first-party rate limits added for public discovery assistance, public Help and search-area normalization; exact-head regression and closeout remain pending.**",
)
replace_once(
    project,
    "RC10 is the sole active repository write lane. It must inventory public abuse-sensitive flows and either implement a narrowly justified server-verified browser challenge or record `NOT CURRENTLY REQUIRED` with re-evaluation triggers. RC8 and RC9 boundaries remain unchanged; no participant, production, privileged-direct-access, payment-provider or real-money activation is authorized.",
    "RC10 is the sole active repository write lane. The threat model records `NOT CURRENTLY REQUIRED`, no Turnstile runtime or credential exists, and the uncovered public POST routes now use the existing fail-closed database abuse-control boundary. RC10 must remain claimed until exact-head regression, receipt reconciliation and closeout pass. RC8 and RC9 boundaries remain unchanged.",
)

status = ROOT / "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
replace_once(
    status,
    "| Cloudflare Turnstile | **RC10 CLAIMED — THREAT MODEL / NOT ACTIVE** | Conditional decision only. No site key, secret, widget, package or runtime binding is approved before a specific public-flow threat model justifies it. |",
    "| Cloudflare Turnstile | **RC10 IMPLEMENTED — NOT CURRENTLY REQUIRED / NOT ACTIVE / REGRESSION PENDING** | The reviewed threat model found no current anonymous browser flow with residual risk that justifies a challenge. Public discovery assistance, public Help and search-area normalization now have explicit fail-closed database rate limits. No site key, secret, widget, package or runtime binding exists. |",
)

ledger = ROOT / "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
replace_once(
    ledger,
    "12. RC10 Turnstile decision — **CLAIMED / THREAT MODEL IN PROGRESS / RUNTIME NOT ACTIVE** from `main@c1960e7bf38a81ad48c8046dd90cd008ede7bb6e`. The checkpoint must either bind Turnstile to one specifically reviewed browser public flow or close `NOT CURRENTLY REQUIRED`; global installation and Android challenges are prohibited.",
    "12. RC10 Turnstile decision — **IMPLEMENTED / NOT CURRENTLY REQUIRED / RUNTIME NOT ACTIVE / EXACT-HEAD REGRESSION PENDING** from claim merge `e0ee52564eef16cdec1d8eb0a85f17da456cb5b1`. The threat model and first-party rate-limit closure are recorded in `RC10_TURNSTILE_DECISION.md`; no site key, secret, widget, package or runtime binding exists.",
)

verifier = ROOT / "scripts/rc10/verify-turnstile-decision.py"
verifier.write_text(
    '''#!/usr/bin/env python3
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
POLICY_TEST = ROOT / "backend/direkt-api/src/platform/security/abuse-control.policies.spec.ts"
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
    "pathPattern: /^\\/api\\/v1\\/public\\/discovery\\/assist$/",
    "key: 'public_search_area_normalize'",
    "pathPattern: /^\\/api\\/v1\\/public\\/discovery\\/search-area\\/normalize$/",
    "key: 'public_support_assist'",
    "pathPattern: /^\\/api\\/v1\\/public\\/support\\/assist$/",
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
''',
    encoding="utf-8",
)

print("RC10_IMPLEMENTATION_PATCH|PASS")
