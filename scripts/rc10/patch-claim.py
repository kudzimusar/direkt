#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one replacement in {path.relative_to(ROOT)}; found {count}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


lock = ROOT / "WORKSTREAM_LOCK.md"
old_lock = """| Field | Value |
|---|---|
| Status | RELEASED — RC9 CLOSED AND PRESERVED |
| Owner/agent | None. RC9 is closed under Issue #261; RC10 is next but remains unclaimed. |
| Authorized scope | No active repository write lane. Any RC10 Turnstile decision or later integration work requires a new explicit claim from current `main`. |
| Protected surface | Closed RC0–RC9 evidence, including RC5 run `30183466799`, RC6 run `30137700769`, RC7 run `30234521983/1`, RC8 run `30241092949/1`, RC9 exact-head matrix on `04ef57f31414ec5165e353abba74afb8dfdcc901` and implementation merge `70de95c73128e921cd4d7c667de0e5a442a9e0c0`; canonical OpenAPI authorization/privacy checks; Android auth/session storage, signing, Maps/FCM/Crashlytics and Play/Data Safety; customer/provider web BFF/private Cloud Run IAM; operations portal; UIA Issue #354; VC1–VC8 Design DNA; Phase 11/12 gates. |
| Implementation branch | None. PR #497 and RC9D closeout PR #498 are merged; no repository write lane is active. |
| Stable baseline | `main@957b19192443b2511f1bf784595591b25b5e7a2e` contains the complete RC9 implementation and closeout receipt. OpenAPI Generator `7.22.0` remains checksum-pinned; canonical OpenAPI SHA-256 is `1c13b69a34c30b84347b02ecddcf4f5b55c21e1958f036d4dc29c9106784e063`; generated Kotlin/TypeScript trees remain deterministic and bounded runtime adoption is enforced. |
| Current task | None. RC9 is complete and preserved; RC10 remains unclaimed and requires a new explicit claim from current `main`. |
| Governing issue | Issue #261 — Runtime integration closure after W8. RC9 is closed; UIA Issue #354 remains parked/read-only; RC10 is unclaimed. |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized. |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates. |
"""
new_lock = """| Field | Value |
|---|---|
| Status | CLAIMED — RC10 TURNSTILE THREAT-MODEL DECISION |
| Owner/agent | Active repository agent — Issue #261 RC10 abuse-control checkpoint. |
| Authorized scope | Audit every public mutating or provider-cost-bearing flow and either implement Turnstile on one specifically justified browser flow or close it as `NOT CURRENTLY REQUIRED`. Existing fail-closed rate limits may be strengthened. Global CAPTCHA installation, Android challenges and unrelated provider activation are prohibited. |
| Protected surface | Closed RC0–RC9 evidence, canonical OpenAPI authorization/privacy checks, Android auth/session and Firebase controls, customer/provider web BFF/private Cloud Run IAM, operations portal, RC8 payment boundaries, UIA Issue #354, VC1–VC8 Design DNA and Phase 11/12 gates. |
| Implementation branch | `feat/rc10-turnstile-decision`, based on `main@c1960e7bf38a81ad48c8046dd90cd008ede7bb6e`. |
| Stable baseline | `main@c1960e7bf38a81ad48c8046dd90cd008ede7bb6e` contains RC0–RC9 closure, the RC9D exact-main receipt and no active Turnstile runtime. |
| Current task | RC10A — complete the public-flow threat model, close uncovered rate-limit gaps, make the conditional Turnstile decision and prove it through exact-head regression. |
| Governing issue | Issue #261 — Runtime integration closure after W8. RC10 is the sole active repository write lane; UIA Issue #354 remains parked/read-only. |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized. |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates. |
"""
replace_once(lock, old_lock, new_lock)
contract_marker = "## Runtime integration closure contract"
contract = """## RC10 implementation contract — CLAIMED

1. Turnstile is conditional abuse control, not a completeness checkbox. It may be introduced only for a specifically reviewed browser-accessible public flow whose risk is not adequately controlled by authentication, admission gates, quotas and rate limiting.
2. RC10 inventories all public mutating or provider-cost-bearing routes, including challenge issuance/verification, public Help, discovery assistance, discovery-area normalization and public discovery reads.
3. Database-backed rate limiting remains backend authoritative, fail-closed and keyed by an HMAC of the network subject. Raw IP addresses, challenge tokens and provider payloads must not be stored in durable rate-limit evidence.
4. If Turnstile is justified, verification is server-side with hostname/action binding, expiry and replay resistance; the secret remains server-only; the browser token is short-lived, single-use and never logged; accessibility fallback and a kill switch are mandatory.
5. Turnstile must not become authentication, identity, verification, trust, payment, publication or authorization authority. It must not be installed globally or required by Android/native flows.
6. If no current flow justifies Turnstile, RC10 closes as `NOT CURRENTLY REQUIRED` with a written threat model and explicit re-evaluation triggers. Any uncovered first-party rate-limit gap must still be repaired.
7. No Cloudflare Turnstile widget, site key, secret, package or runtime binding is provisioned merely to close RC10.
8. Real participants, production authentication, production communications, real money and production release remain separately blocked.
9. Exact-head evidence must include backend formatting/lint/type/tests/build/OpenAPI, abuse-policy tests, RC5–RC10 permanent contracts, PWA/W7/W8, runtime audit, supply-chain and documentation gates as applicable.
10. RC10 closes only after project status, live ledger, current integration register, permanent verifier, dedicated decision receipt and Issue #261 agree; RC11 remains unclaimed until then.

"""
text = lock.read_text(encoding="utf-8")
if contract not in text:
    if contract_marker not in text:
        raise SystemExit("RC10 contract insertion marker missing")
    lock.write_text(text.replace(contract_marker, contract + contract_marker, 1), encoding="utf-8")

project = ROOT / "PROJECT_STATUS.md"
replace_once(
    project,
    "**Active repository write lane:** none — RC1–RC9 are closed under Issue #261; RC10 is next but unclaimed",
    "**Active repository write lane:** RC10 Turnstile threat-model decision under Issue #261; RC1–RC9 remain closed",
)
replace_once(
    project,
    "- runtime integration closure — **RC1–RC9 are closed at their documented bounded boundaries. RC9 deterministic Kotlin/TypeScript generation and bounded Android/server-only BFF adoption merged at `main@70de95c73128e921cd4d7c667de0e5a442a9e0c0`, using canonical OpenAPI `1c13b69a34c30b84347b02ecddcf4f5b55c21e1958f036d4dc29c9106784e063` and pinned generator JAR `3f1e6ce5c6ad4f15242c6170ab43aad4bad771622617eeece4a7d4f72ffaf329`**.",
    "- runtime integration closure — **RC1–RC9 are closed at their documented bounded boundaries. RC10 is claimed from `main@c1960e7bf38a81ad48c8046dd90cd008ede7bb6e` for the conditional Turnstile threat-model decision; no Turnstile runtime is active.**",
)
replace_once(
    project,
    "No repository write lane is active. RC10 Turnstile threat-model work is next in sequence but unclaimed and must begin only through a new lock from current `main`. RC8 remains closed and does not authorize application payment-provider activation, participant payment data, production credentials/endpoints, real money, customer-to-provider payments, escrow, wallets or payouts. RC9 does not authorize browser-direct private API access, privileged client credentials, participant/production auth or release.",
    "RC10 is the sole active repository write lane. It must inventory public abuse-sensitive flows and either implement a narrowly justified server-verified browser challenge or record `NOT CURRENTLY REQUIRED` with re-evaluation triggers. RC8 and RC9 boundaries remain unchanged; no participant, production, privileged-direct-access, payment-provider or real-money activation is authorized.",
)

status = ROOT / "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
replace_once(
    status,
    "| Cloudflare Turnstile | **PLANNED / NOT ACTIVE** | RC10 threat-model decision only. |",
    "| Cloudflare Turnstile | **RC10 CLAIMED — THREAT MODEL / NOT ACTIVE** | Conditional decision only. No site key, secret, widget, package or runtime binding is approved before a specific public-flow threat model justifies it. |",
)

ledger = ROOT / "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
replace_once(
    ledger,
    "12. RC10 Turnstile only if justified.",
    "12. RC10 Turnstile decision — **CLAIMED / THREAT MODEL IN PROGRESS / RUNTIME NOT ACTIVE** from `main@c1960e7bf38a81ad48c8046dd90cd008ede7bb6e`. The checkpoint must either bind Turnstile to one specifically reviewed browser public flow or close `NOT CURRENTLY REQUIRED`; global installation and Android challenges are prohibited.",
)

rc9 = ROOT / "scripts/rc9/verify-generated-client-contract.py"
replace_once(
    rc9,
    '''require(LOCK, "RELEASED — RC9 CLOSED AND PRESERVED")
require(LOCK, "RC9 implementation contract — CLOSED AND PRESERVED")
require(LOCK, "The repository write lane is RELEASED")
require(LOCK, "RC10 is next but remains unclaimed")
require(LOCK, "RC8 implementation contract — CLOSED AND PRESERVED")
require(LOCK, "70de95c73128e921cd4d7c667de0e5a442a9e0c0")
require(PROJECT, "Active repository write lane:** none")
require(PROJECT, "RC1–RC9 are closed")
require(PROJECT, "RC10 is next but unclaimed")
''',
    '''require(LOCK, "RC9 implementation contract — CLOSED AND PRESERVED")
require(LOCK, "RC10 implementation contract — CLAIMED")
require(LOCK, "RC8 implementation contract — CLOSED AND PRESERVED")
require(LOCK, "70de95c73128e921cd4d7c667de0e5a442a9e0c0")
require(PROJECT, "RC1–RC9 are closed")
require(PROJECT, "Active repository write lane:** RC10 Turnstile threat-model decision")
''',
)
replace_once(rc9, 'print("workstream_lane=released")\nprint("rc10_claimed=false")', 'print("rc9_closure_preserved=true")\nprint("later_checkpoint=rc10_claimed")')

rc10 = ROOT / "scripts/rc10/verify-turnstile-decision.py"
rc10.write_text(
    '''#!/usr/bin/env python3
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
''',
    encoding="utf-8",
)

workflow = ROOT / ".github/workflows/rc10-turnstile-contract.yml"
workflow.write_text(
    '''name: DIREKT RC10 Turnstile decision contract

on:
  pull_request:
    paths:
      - "WORKSTREAM_LOCK.md"
      - "PROJECT_STATUS.md"
      - "docs/integrations/**"
      - "scripts/rc9/**"
      - "scripts/rc10/**"
      - "backend/direkt-api/src/platform/security/**"
      - "backend/direkt-api/src/auth/**"
      - "backend/direkt-api/src/discovery/**"
      - "backend/direkt-api/src/ai/**"
      - "backend/direkt-api/src/interaction/**"
      - "backend/direkt-api/package.json"
      - ".github/workflows/rc10-turnstile-contract.yml"

permissions:
  contents: read

jobs:
  contract:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-python@v6
        with:
          python-version: "3.12"
      - name: Verify RC9 preservation and RC10 decision boundary
        run: |
          python3 scripts/rc9/verify-generated-client-contract.py
          python3 scripts/rc10/verify-turnstile-decision.py
          python3 scripts/rc8/verify-payments-contract.py
''',
    encoding="utf-8",
)

print("RC10_CLAIM_PATCH|PASS")
