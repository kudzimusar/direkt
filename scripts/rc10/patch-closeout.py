#!/usr/bin/env python3
"""Reconcile the permanent RC10 closure receipt and release the repository lane."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one closeout target in {path.relative_to(ROOT)}; found {count}")
    path.write_text(text.replace(old, new), encoding="utf-8")


lock = ROOT / "WORKSTREAM_LOCK.md"
project = ROOT / "PROJECT_STATUS.md"
status = ROOT / "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
ledger = ROOT / "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
decision = ROOT / "docs/integrations/RC10_TURNSTILE_DECISION.md"
closure = ROOT / "docs/integrations/RC10_CLOSURE_RECEIPT.md"
verifier = ROOT / "scripts/rc10/verify-turnstile-decision.py"

replace_once(
    lock,
    """| Status | CLAIMED — RC10 TURNSTILE THREAT-MODEL DECISION |
| Owner/agent | Active repository agent — Issue #261 RC10 abuse-control checkpoint. |
| Authorized scope | Audit every public mutating or provider-cost-bearing flow and either implement Turnstile on one specifically justified browser flow or close it as `NOT CURRENTLY REQUIRED`. Existing fail-closed rate limits may be strengthened. Global CAPTCHA installation, Android challenges and unrelated provider activation are prohibited. |
| Protected surface | Closed RC0–RC9 evidence, canonical OpenAPI authorization/privacy checks, Android auth/session and Firebase controls, customer/provider web BFF/private Cloud Run IAM, operations portal, RC8 payment boundaries, UIA Issue #354, VC1–VC8 Design DNA and Phase 11/12 gates. |
| Implementation branch | `feat/rc10-turnstile-decision`, based on the RC10 claim merge `main@e0ee52564eef16cdec1d8eb0a85f17da456cb5b1`. |
| Stable baseline | `main@e0ee52564eef16cdec1d8eb0a85f17da456cb5b1` contains RC0–RC9 closure and the formal RC10 conditional-decision claim. No Turnstile runtime is active. |
| Current task | RC10B — `NOT CURRENTLY REQUIRED` decision and public POST rate-limit coverage are implemented; focused and full exact-head regression remain before closure. |
| Governing issue | Issue #261 — Runtime integration closure after W8. RC10 is the sole active repository write lane; UIA Issue #354 remains parked/read-only. |""",
    """| Status | RELEASED — RC10 CLOSED AND PRESERVED |
| Owner/agent | None. RC10 is closed; RC11 remains unclaimed. |
| Authorized scope | No active repository write scope. A new explicit claim is required before RC11 or any other source change. |
| Protected surface | Closed RC0–RC10 evidence, canonical OpenAPI authorization/privacy checks, Android auth/session and Firebase controls, customer/provider web BFF/private Cloud Run IAM, operations portal, RC8 payment boundaries, UIA Issue #354, VC1–VC8 Design DNA and Phase 11/12 gates. |
| Implementation branch | None. RC10 implementation PR #502 merged at `620a99ba5465ad38ce012df0a8fa15e458de6505`. |
| Stable baseline | `main@620a99ba5465ad38ce012df0a8fa15e458de6505` contains the reviewed RC10 implementation; this closeout preserves that exact bounded result and releases the lane. |
| Current task | None. RC11 combined integration reconciliation is next but unclaimed. |
| Governing issue | Issue #261 — Runtime integration closure after W8. RC10 is closed; UIA Issue #354 remains parked/read-only. |""",
)
replace_once(lock, "## RC10 implementation contract — CLAIMED", "## RC10 implementation contract — CLOSED AND PRESERVED")
replace_once(
    lock,
    "10. RC10 closes only after project status, live ledger, current integration register, permanent verifier, dedicated decision receipt and Issue #261 agree; RC11 remains unclaimed until then.",
    "10. RC10 is `CLOSED — NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE`: PR #502 exact head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38` passed the complete backend, container, generated-client, PWA/W7/W8, runtime-audit, recovery, staging, Phase 11 synthetic, RC5–RC10 and documentation matrix, then squash-merged at `620a99ba5465ad38ce012df0a8fa15e458de6505`. The three public POST helper gaps are protected by the existing fail-closed database rate limiter; no Turnstile credential, widget, package or runtime binding exists. RC11 remains unclaimed.",
)
replace_once(
    lock,
    "- RC10 — Turnstile threat-model decision; implement only if a reviewed public abuse-sensitive flow requires it, otherwise close as not currently justified.\n- RC11 — combined integration regression, managed evidence index, live ledger/status reconciliation and lane release.",
    "- RC10 — Turnstile threat-model decision. **CLOSED — NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE — PR #502 exact head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`, merge `620a99ba5465ad38ce012df0a8fa15e458de6505`; first-party rate-limit gaps closed; production authorization false.**\n- RC11 — combined integration regression, managed evidence index, live ledger/status reconciliation and lane release. **NEXT BUT UNCLAIMED.**",
)
replace_once(
    lock,
    "The repository write lane is RELEASED. RC0–RC9 evidence remains immutable/regression-protected, UIA Issue #354 remains parked/read-only, and RC10+ source work must not begin until a new explicit claim is recorded from current `main`. Real-money, participant and production authorization remain blocked.",
    "The repository write lane is RELEASED. RC0–RC10 evidence remains immutable/regression-protected, UIA Issue #354 remains parked/read-only, and RC11 or any later source work must not begin until a new explicit claim is recorded from current `main`. Real-money, participant and production authorization remain blocked.",
)

replace_once(
    project,
    "**Active repository write lane:** RC10 Turnstile threat-model decision under Issue #261; RC1–RC9 remain closed",
    "**Active repository write lane:** none; RC1–RC10 are closed and RC11 is next but unclaimed",
)
replace_once(
    project,
    "- runtime integration closure — **RC1–RC9 are closed at their documented bounded boundaries. RC10 is implemented as `NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE`, with explicit first-party rate limits added for public discovery assistance, public Help and search-area normalization; exact-head regression and closeout remain pending.**",
    "- runtime integration closure — **RC1–RC10 are closed at their documented bounded boundaries. RC10 is `CLOSED — NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE`; explicit first-party rate limits protect public discovery assistance, public Help and search-area normalization. RC11 is next but unclaimed.**",
)
replace_once(
    project,
    "RC10 is the sole active repository write lane. The threat model records `NOT CURRENTLY REQUIRED`, no Turnstile runtime or credential exists, and the uncovered public POST routes now use the existing fail-closed database abuse-control boundary. RC10 must remain claimed until exact-head regression, receipt reconciliation and closeout pass. RC8 and RC9 boundaries remain unchanged.",
    "RC10 is closed on implementation PR #502 exact head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`, squash-merged at `620a99ba5465ad38ce012df0a8fa15e458de6505`. Turnstile remains not active and unprovisioned; the uncovered public POST routes use the existing fail-closed database abuse-control boundary. The repository write lane is released and RC11 remains unclaimed.",
)

replace_once(
    status,
    "| Cloudflare Turnstile | **RC10 IMPLEMENTED — NOT CURRENTLY REQUIRED / NOT ACTIVE / REGRESSION PENDING** | The reviewed threat model found no current anonymous browser flow with residual risk that justifies a challenge. Public discovery assistance, public Help and search-area normalization now have explicit fail-closed database rate limits. No site key, secret, widget, package or runtime binding exists. |",
    "| Cloudflare Turnstile | **RC10 CLOSED — NOT CURRENTLY REQUIRED / NOT ACTIVE** | PR #502 exact head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38` passed the complete exact-head matrix and squash-merged at `620a99ba5465ad38ce012df0a8fa15e458de6505`. Public discovery assistance, public Help and search-area normalization use explicit fail-closed database rate limits. No site key, secret, widget, package or runtime binding exists. |",
)
replace_once(
    status,
    "12. RC10 Turnstile threat-model decision.\n13. RC11 combined integration regression/evidence index/lane release.",
    "12. RC10 Turnstile threat-model decision — **CLOSED — NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE**; PR #502 exact head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`, merge `620a99ba5465ad38ce012df0a8fa15e458de6505`; public POST rate-limit gaps closed.\n13. RC11 combined integration regression/evidence index/lane release — **NEXT BUT UNCLAIMED**.",
)

replace_once(
    ledger,
    "12. RC10 Turnstile decision — **IMPLEMENTED / NOT CURRENTLY REQUIRED / RUNTIME NOT ACTIVE / EXACT-HEAD REGRESSION PENDING** from claim merge `e0ee52564eef16cdec1d8eb0a85f17da456cb5b1`. The threat model and first-party rate-limit closure are recorded in `RC10_TURNSTILE_DECISION.md`; no site key, secret, widget, package or runtime binding exists.\n13. RC11 full combined regression and lane release.",
    "12. RC10 Turnstile decision — **CLOSED — NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE**. Claim merge `e0ee52564eef16cdec1d8eb0a85f17da456cb5b1`; implementation PR #502 exact head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`; squash merge `620a99ba5465ad38ce012df0a8fa15e458de6505`. Public discovery assistance, public Help and search-area normalization use explicit fail-closed database rate limits; no site key, secret, widget, package or runtime binding exists.\n13. RC11 full combined regression and lane release — **NEXT BUT UNCLAIMED**.",
)
receipt = """
### RC10 Turnstile closure receipt

```text
Integration: Cloudflare Turnstile threat-model decision and public abuse-control closure (RC10)
Previous state: IMPLEMENTED / NOT CURRENTLY REQUIRED / RUNTIME NOT ACTIVE / EXACT-HEAD REGRESSION PENDING
New state: CLOSED — NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE
Claim merge: e0ee52564eef16cdec1d8eb0a85f17da456cb5b1
Implementation PR/head: #502 / cdab6622e0cc06e35cddca2bb5bc8ea70c027b38
Implementation merge: 620a99ba5465ad38ce012df0a8fa15e458de6505
External provisioning: none; no Turnstile site key, secret, widget, package, hostname binding or Cloudflare challenge runtime was created
Repo/source changes: explicit fail-closed database rate policies and focused tests for public discovery assistance 30/300s, public Help assistance 30/300s and search-area normalization 20/300s; written threat model and re-evaluation triggers
Secret Manager names/versions: none
Runtime binding: existing DIREKT abuse-control middleware and security.consume_rate_limit database authority only; Turnstile runtime false
Exact-head evidence: RC10 30279827057; backend 30279827068; backend container 30279826976; runtime audit 30279831964; deterministic clients 30279826827; RC9 30279829353; W7 30279829473; W8 30279826788; functional PWA 30279829352; PWA 30279826525; recovery 30279826679; staging 30279826805; Phase 11 synthetic 30279829444; RC5 30279829654/30279829433; RC6 30279829956; RC7 30279829618; RC8 30279826638/30279829561; documentation 30279827241
Privacy/security checks: raw IP addresses are not durable keys; network subjects are HMAC-SHA-256 hashed; protected-route dependency failure returns 503; exhaustion returns 429; no challenge token or new third-party browser data exists
Fallback/kill switch: first-party rate controls, authenticated scope, provider kill switches, deterministic/manual Help and discovery fallbacks remain authoritative; future Turnstile activation requires a new claim and can be omitted entirely
Production authorization: NOT AUTHORIZED; real participants, production authentication, external communications, production AI/Maps, payment-provider activation, real money and formal Phase 12 release remain blocked
Known blockers: none for RC10 bounded closure; Phase 11 real evidence, 11J, legal/privacy and production-release gates remain externally open
Next exact step: RC11 combined integration regression/evidence index, only after a new explicit claim
Ledger updated: YES
```

"""
replace_once(ledger, "## Evidence / receipt discipline", receipt + "## Evidence / receipt discipline")

replace_once(
    decision,
    "**Claim merge:** `e0ee52564eef16cdec1d8eb0a85f17da456cb5b1`\n**Decision:** `NOT CURRENTLY REQUIRED`\n**Turnstile runtime:** not active\n**Production authorization:** false",
    "**Claim merge:** `e0ee52564eef16cdec1d8eb0a85f17da456cb5b1`\n**Implementation PR/head:** #502 / `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`\n**Implementation merge:** `620a99ba5465ad38ce012df0a8fa15e458de6505`\n**Closure state:** `CLOSED — NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE`\n**Decision:** `NOT CURRENTLY REQUIRED`\n**Turnstile runtime:** not active\n**Production authorization:** false",
)
closure_evidence = """

## Closure evidence

The exact implementation head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38` passed the complete required matrix before PR #502 was squash-merged at `620a99ba5465ad38ce012df0a8fa15e458de6505`:

- RC10 decision contract `30279827057`;
- backend CI/container `30279827068`, `30279826976`;
- runtime audit `30279831964`;
- deterministic generation and RC9 preservation `30279826827`, `30279829353`;
- W7/W8 and functional PWA `30279829473`, `30279826788`, `30279829352`, `30279826525`;
- recovery/staging/Phase 11 synthetic `30279826679`, `30279826805`, `30279829444`;
- RC5/RC6/RC7/RC8 preservation `30279829654`, `30279829433`, `30279829956`, `30279829618`, `30279826638`, `30279829561`;
- documentation quality `30279827241`.

RC10 is closed at this bounded decision and first-party abuse-control boundary. The repository write lane is released. RC11 is next but remains unclaimed.
"""
if "## Closure evidence" in decision.read_text(encoding="utf-8"):
    raise SystemExit("RC10 decision already contains closure evidence")
decision.write_text(decision.read_text(encoding="utf-8") + closure_evidence, encoding="utf-8")

closure.write_text(
    """# RC10 Closure Receipt

**State:** CLOSED — NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE
**Claim merge:** `e0ee52564eef16cdec1d8eb0a85f17da456cb5b1`
**Implementation PR/head:** #502 / `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`
**Implementation merge:** `620a99ba5465ad38ce012df0a8fa15e458de6505`
**Decision record:** `docs/integrations/RC10_TURNSTILE_DECISION.md`
**Production authorization:** false

RC10 is closed without provisioning or activating Cloudflare Turnstile. The reviewed threat model found no current anonymous browser flow whose residual risk justifies a third-party challenge. The audit instead closed three first-party policy gaps through the existing backend-authoritative, database-backed, fail-closed rate limiter:

- `public_discovery_assist`: `30/300s`;
- `public_support_assist`: `30/300s`;
- `public_search_area_normalize`: `20/300s`.

The exact implementation head passed RC10, backend/container, generated-client, W7/W8/PWA, runtime-audit, recovery, staging, Phase 11 synthetic, RC5–RC9 and documentation gates through runs `30279827057`, `30279827068`, `30279826976`, `30279831964`, `30279826827`, `30279829353`, `30279829473`, `30279826788`, `30279829352`, `30279826525`, `30279826679`, `30279826805`, `30279829444`, `30279829654`, `30279829433`, `30279829956`, `30279829618`, `30279826638`, `30279829561` and `30279827241`.

No site key, secret, widget, package, challenge token, hostname binding or runtime dependency exists. Android and machine-to-machine traffic are unaffected. Real participants, production authentication, external communications, production AI/Maps, payment-provider activation, real money and formal Phase 12 release remain blocked.

The repository write lane is released. RC11 is next but unclaimed.
""",
    encoding="utf-8",
)

verifier.write_text(
    r'''#!/usr/bin/env python3
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
''',
    encoding="utf-8",
)

print("RC10_CLOSEOUT_PATCH|PASS")
