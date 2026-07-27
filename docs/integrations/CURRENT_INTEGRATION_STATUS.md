# DIREKT Current Integration Status Register

**Authoritative as-of date:** 2026-07-27 (Asia/Tokyo)
**Scope:** repository `kudzimusar/direkt`, managed development/staging evidence, live Supabase verification and owner-configured external services
**Purpose:** prevent external provisioning, source integration and runtime activation from being conflated.
**Detailed live receipts:** `LIVE_INTEGRATION_LEDGER.md`

## Status vocabulary

- **ACTIVE** — source/configuration and managed execution evidence prove approved runtime use.
- **IMPLEMENTED_GATED** — application/domain code exists, but broader/provider-backed activation remains fail-closed.
- **EXTERNALLY_PROVISIONED** — account/domain/credential exists, but application runtime use is not proven.
- **SANDBOX_PROVEN** — a real provider sandbox flow succeeded, but DIREKT runtime/live activation is not approved.
- **PENDING_PROVIDER** — provider approval or credential issuance remains pending.
- **PLANNED** — approved direction exists; implementation/runtime binding incomplete.
- **DISABLED** — intentionally off in the approved environment.
- **SUPERSEDED** — historical/fallback direction.
- **BLOCKED** — external/legal/commercial/repository gate prevents progression.

No integration becomes ACTIVE merely because an account, DNS record, API key, SDK, model name or secret exists.

## Domain and public edge

| Integration | State | Current role |
|---|---|---|
| `direkt.forum` | **ACTIVE** | Canonical owner-controlled root/domain. |
| `app.direkt.forum` | **ACTIVE synthetic-review host** | Canonical functional customer/provider browser/BFF host; W8 DNS/TLS/runtime/PWA/BFF/session/privacy verification passed. Real-participant/production activation remains gated. |
| Vercel Domains | **ACTIVE — registrar only** | Domain registration only. |
| Cloudflare DNS | **ACTIVE** | Authoritative DNS edge. |
| GitHub Pages | **ACTIVE public static origin** | Documentation and synthetic/non-sensitive preview content. |
| Cloudflare Email Routing | **EXTERNALLY_PROVISIONED** | Role/support aliases; not outbound application delivery. |
| Cloudflare Turnstile | **RC10 CLAIMED — THREAT MODEL / NOT ACTIVE** | Conditional decision only. No site key, secret, widget, package or runtime binding is approved before a specific public-flow threat model justifies it. |

## Core data/backend infrastructure

| Integration | State | Current role |
|---|---|---|
| Supabase PostgreSQL | **ACTIVE** | System of record behind the API; project `aeeuscifrxcjmnswqwnq`. |
| PostGIS | **ACTIVE** | Spatial/service-area foundation. |
| Supabase Storage | **ACTIVE infrastructure** | Private evidence/media/export storage through server-side grants. |
| Supabase Data API/PostgREST | **QUARANTINED** | Not a privileged client application path. |
| NestJS DIREKT API | **ACTIVE private staging** | Canonical REST/OpenAPI trust boundary; direct unauthenticated access denied. |
| Artifact Registry | **ACTIVE** | Immutable container images. |
| Cloud Run | **ACTIVE managed runtime** | IAM-private API/operations plus public synthetic-only customer/provider browser/BFF runtime. |
| Secret Manager | **ACTIVE** | Runtime secret authority. |
| GitHub Workload Identity Federation | **ACTIVE** | Keyless GitHub Actions → Google Cloud identity. |
| Cloud Logging/Monitoring | **ACTIVE** | Authoritative infrastructure/runtime observability. |
| GitHub Actions | **ACTIVE** | CI, security, release and infrastructure gates. |

Managed application project: `direkt-dev-502701` (`264358173369`), region `asia-northeast1`. Dedicated synthetic Test Lab project: `direkt-testlab-502701-20260726` (`482116157386`), Spark plan/billing disabled; broad Test Lab execution authority is isolated there only.

Live Supabase hardening remains proven through migration `202607191200_integration_runtime_privilege_hardening.sql`: browser application-schema usage `0`, browser/PUBLIC executable application functions `0`, application `SECURITY DEFINER` functions `0`, required Storage buckets private.

## Android, identity and Firebase runtime

| Integration | State | Current role |
|---|---|---|
| Native Android | **ACTIVE implementation / controlled distribution** | Primary customer/provider native client. |
| Firebase project | **ACTIVE foundation** | Attached to `direkt-dev-502701`. |
| Firebase App Distribution | **ACTIVE** | Controlled Android delivery to `direkt-internal-testers`. |
| Firebase Authentication / phone OTP | **IMPLEMENTED_GATED** | Phone-possession proof/session exchange behind invite/consent/Phase 11 gates. |
| Firebase Crashlytics | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY** | RC3 exact-source managed proof succeeded for `9098f7eb333baf096163f1564b3d8e5e5da3fcf0` through bridge run `29885635547`: fatal delivery, focused package-scoped input-dispatch ANR, historical `REASON_ANR`, restart pickup and Crashlytics/DataTransport delivery all passed. Automatic collection remains default-off, Analytics is absent, and participant/production crash telemetry remains disabled. |
| FCM | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY** | RC4 exact-main managed run `29916381754` on source `f05ff19105cb8dc7c4621c044c110b6029f63300` proved backend-owned transactional-outbox delivery through FCM HTTP v1 to Android in both foreground and background. The fixed `direkt-fcm-canary-token` container uses secret-scoped least privilege and a temporary numeric version that was destroyed after the private Cloud Run Job was deleted. Participant registration and participant/production push remain disabled. |
| Firebase Test Lab | **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX** | Dedicated Spark project `direkt-testlab-502701-20260726`; exact source `c3744430a7beb1cd47246d858df9ac1379a068ac` passed managed run `30183466799` on `MediumPhone.arm` API 26, 33 and 36 with zero flaky retries. Artifact `8626329335` digest `sha256:03a40951a23c937d8b0fd2990a7d2652afbd1172631c0b480af756aebd92a843` was schema-validated. Results use Firebase-managed default storage inside the isolated project. Participant/production authorization remains false. |
| Google Play | **IMPLEMENTED_GATED** | Release engineering prepared; no production release authorized. |

RC3 closure does not authorize participant/production crash telemetry. Crashlytics remains fail-closed by default outside the debug-only, exact-source-bound `synthetic-only` proof path. RC4 does not authorize participant/production push: participant token registration remains disabled. The fixed `direkt-fcm-canary-token` container grants only secret-scoped `roles/secretmanager.secretVersionManager` to the GitHub deployer and `roles/secretmanager.secretAccessor` to the runtime identity; proof runs may add one temporary numeric version, pin that exact version into the private Cloud Run Job, delete the job, then destroy only that version.

## AI provider foundation and current AI behavior

| Integration / use case | State | Current role |
|---|---|---|
| Provider-neutral backend `AiProvider` contract | **IMPLEMENTED_GATED** | Gemini primary + Groq fallback adapters, backend-only credentials, timeout/failover and non-authoritative AI boundary. |
| Gemini Developer API | **SANDBOX_PROVEN / DIREKT RUNTIME NOT BOUND** | Synthetic provider canary succeeded; server-only Secret Manager key exists. |
| Groq open-model fallback | **SANDBOX_PROVEN / DIREKT RUNTIME NOT BOUND** | Synthetic provider canary succeeded; server-only Secret Manager key exists. |
| Customer discovery/category assistance | **IMPLEMENTED / FAIL-CLOSED** | Deterministic matching always available; model path requires explicit synthetic switch and provider binding. |
| Grounded public Help | **IMPLEMENTED / FAIL-CLOSED** | Approved public facts/source identifiers; deterministic help fallback. |
| Provider onboarding/readiness guidance | **IMPLEMENTED / FAIL-CLOSED** | Model path synthetic-only; deterministic readiness fallback. |
| Provider public-profile drafting | **IMPLEMENTED / FAIL-CLOSED** | Editable draft only; provider confirmation required; manual fallback. |
| Restricted operations case summary / evidence OCR | **DISABLED / RESTRICTED-GATED** | Separate privacy/security/data-processing/provider approval and dedicated runtime proof required. |
| Client-direct AI SDK/API calls | **PROHIBITED** | Credentials/system prompts/tool authority remain backend-owned. |
| Production AI | **DISABLED** | AI cannot become verification/trust/payment/dispute/publication/authorization authority. |

Current managed DIREKT runtime does **not** bind Gemini/Groq as active application providers. AI modes default fail-closed and the backend rejects non-synthetic model requests. Current AI-capable surfaces therefore use deterministic/manual behavior unless a reviewed synthetic environment explicitly enables both the use case and provider binding.

## Location and maps

| Integration | State | Current role |
|---|---|---|
| PostGIS location model | **ACTIVE** | Canonical location/service-area semantics. |
| Manual area/list fallback | **ACTIVE** | Provider-independent privacy/accessibility fallback. |
| Google Maps Platform | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY** | RC7 closed on exact source `47285575862cbf08845eaeabe093afea1ea79bd1` through managed run `30234521983/1`. Backend Geocoding v4 passed under the assigned Cloud Run service identity and address-only OAuth scope; the Android key was restricted to the final packaged APK certificate and Maps SDK target; API 36 Test Lab passed 1/1 with zero flaky retries; cleanup passed. Artifact `8641270327` has digest `sha256:24da53c0bd6fa885fa4a6814f70af090096192e6c5b7a03c89fba51416877fde`. Manual/list fallback remains active; production/participant Maps and private-coordinate publication remain disabled. |
| Private-coordinate map publication | **DISABLED** | Exact private provider bases must not become public markers/ranking inputs. |

## Communications and notifications

| Integration | State | Current role |
|---|---|---|
| Transactional outbox | **ACTIVE domain foundation** | Durable asynchronous-event source of truth. |
| Resend | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY** | Cloud Run execution `direkt-resend-canary-ct9mp` proved outbox → Resend → durable `published`; key is sending-only/domain-restricted to verified `notify.direkt.forum`. |
| Firebase phone OTP | **IMPLEMENTED_GATED** | Current pilot phone-possession direction. |
| WhatsApp Cloud API | **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY** | RC6 exact-current-main managed run `30137700769` on source `8838b7a6d726a5aed44ce21a39506c1265a98d15` passed backend transactional outbox → Meta `hello_world` test-template send → authentic signed webhook receipt on retry. The initial pre-provider Google Cloud CLI setup failure remains preserved in Issue #404. Backend-only credentials, hashed opt-out, template-only payloads, HMAC verification, durable idempotent receipts/retries and kill switches remain enforced. Participant/production delivery remains disabled. |
| FCM push | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY** | Exact-main run `29916381754` on `f05ff19105cb8dc7c4621c044c110b6029f63300` passed synthetic Firebase registration, immutable backend image/private Cloud Run Job deployment, foreground and background outbox → FCM → Android receipt proof, sanitized artifact publication and ordered cleanup. Artifact `rc4-fcm-canary-29916381754` digest `sha256:f45d1924ee6138f86ec15a222e97f28ff67bbe9c610ff75f57666fd03929526c`. Participant registration and participant/production push remain disabled. |
| Cloud Tasks / Pub/Sub / Scheduler | **PLANNED ON DEMAND** | Add only for a justified retry/fan-out/scheduling need. |

Continuous, controlled-pilot participant and production external email remain disabled. Participant/production push remains disabled after RC4 synthetic proof; participant/production WhatsApp delivery remains disabled after RC6 synthetic proof. Any participant activation requires later explicit provider/business/legal/privacy/release authorization. The 2026-07-22 owner bootstrap verified the fixed FCM canary secret container and its secret-scoped least-privilege bindings without creating, reading or printing a secret value.

## Observability

| Integration | State | Current role |
|---|---|---|
| Cloud Logging / Monitoring | **ACTIVE** | Authoritative infrastructure/runtime telemetry. |
| Sentry API/portal | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY** | RC2 source + managed API/private-portal canary proven with separate DSNs, exact release SHA, PII minimization and kill switch. |
| Sentry Android | **NOT DEFAULT / NOT ACTIVE** | Android crash/ANR ownership is Firebase Crashlytics under RC3. |
| Firebase Crashlytics | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY** | Exact-source RC3 proof on `9098f7eb333baf096163f1564b3d8e5e5da3fcf0` passed through managed bridge run `29885635547`; default collection remains off, Firebase Analytics is absent, and production/participant telemetry is not authorized. |

Participant/production Sentry telemetry remains disabled.

No telemetry provider may receive raw evidence, tokens, cookies, contact data, exact private coordinates or unnecessary free text. RC3 does not set a stable participant/user identifier and does not add Firebase Analytics.

## Payments and verification authorities

| Integration | State | Current role |
|---|---|---|
| Subscription/payment domain | **ACTIVE implementation** | Products, subscriptions, invoices, intents, ledger/reconciliation contracts. |
| Synthetic payment adapter | **ACTIVE tests only** | Lifecycle/idempotency testing without real money. |
| RC8 sandbox provider runtime proof | **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY** | Exact source `ccc4e9463d810ddf554182b1607c22d3a7c8c8d3` passed run `30241092949/1` with artifact `8643323319` (`sha256:bbb4600eb5a062552947e91c878dd09c6d1e4dc307ae4783c7fa1fb4cf6e4935`). MTN, Stripe, PayPal and immutable reconciliation passed in one private temporary job; cleanup passed. The application registry remains disabled; DPO is runtime-unbound, Airtel provider-pending and Flutterwave excluded. |
| MTN MoMo Collections API | **MANAGED SANDBOX PROVEN / APPLICATION RUNTIME DISABLED** | Exact-main RC8 run `30241092949/1` proved Request to Pay plus independent `succeeded` status with amount/currency and transaction-id agreement. Application runtime remains disabled. |
| MTN Collection Widget / QR / USSD | **EXTERNALLY_PROVISIONED / RUNTIME DISABLED** | Runtime feature not wired. |
| Airtel Money Zambia Cash-In API | **PENDING_PROVIDER / DISABLED** | TEST application/Cash-In exists; approval/credentials pending. |
| DPO Pay / Network | **SOURCE INTEGRATED / RUNTIME DISABLED** | External sandbox proof and source adapter exist, but no DIREKT private sandbox credential is provisioned in Secret Manager; RC8 managed runtime binding remains prohibited. |
| Stripe Checkout | **MANAGED SANDBOX PROVEN / APPLICATION RUNTIME DISABLED** | Exact-main RC8 run `30241092949/1` created and independently retrieved an unpaid test Checkout as `requires_action`; browser state was not payment truth. Application runtime remains disabled. |
| Stripe Link | **EXTERNALLY_PROVISIONED / NOT EXPLICITLY PROVEN** | Dedicated Link evidence optional/outstanding. |
| PayPal | **MANAGED SANDBOX PROVEN / APPLICATION RUNTIME DISABLED** | Exact-main RC8 run `30241092949/1` created and independently retrieved an unapproved sandbox order as `requires_action`; no capture or browser-authoritative payment truth occurred. Application runtime remains disabled. |
| Flutterwave | **BLOCKED / DEFERRED** | Zambia onboarding unavailable/deferred. |
| Real money movement | **DISABLED** | Separate legal/commercial/provider/pilot/release gates required. |
| Escrow/customer-to-provider payments | **PLANNED LATER / NOT MVP** | Separate legal/regulatory/payout/dispute/KYC architecture required. |
| PACRA | **MANUAL EVIDENCE SOURCE** | No fabricated API access/scraping. |
| NCC | **MANUAL EVIDENCE SOURCE** | Manual evidence where applicable. |
| TEVETA | **MANUAL EVIDENCE SOURCE** | Manual qualification/training evidence. |
| Automated registry APIs | **NOT AUTHORIZED** | Formal lawful access required. |

Clients never decide payment success. Payment state cannot create verification/publication/ranking authority. AI output cannot create payment or registry authority.

## Browser/application surfaces

| Surface | State | Current role |
|---|---|---|
| Next.js operations portal | **ACTIVE private staging** | Privileged operator UI through canonical API. |
| Vercel portal hosting | **SUPERSEDED for current staging** | Not current protected runtime. |
| Customer/provider functional PWA | **ACTIVE synthetic-only functional review runtime** | `https://app.direkt.forum`; reviewed BFF/private API boundary. |
| Preserved synthetic preview | **ACTIVE static review surface** | `https://direkt.forum/preview/`. |

## API/client contract tooling

| Integration | State | Current role |
|---|---|---|
| OpenAPI | **ACTIVE** | Canonical backend contract generated/drift-checked in CI. |
| Android API boundary | **ACTIVE implementation** | Backend API only; no privileged direct Supabase path. |
| TypeScript/PWA API boundary | **ACTIVE reviewed BFF architecture** | Canonical API remains IAM-private. |
| Fully generated Kotlin/TypeScript client packages | **RC9 CLOSED — DETERMINISTIC / BOUNDED RUNTIME ADOPTION** | Generator 7.22.0 JAR `3f1e6ce5c6ad4f15242c6170ab43aad4bad771622617eeece4a7d4f72ffaf329` produces committed source from canonical OpenAPI `1c13b69a34c30b84347b02ecddcf4f5b55c21e1958f036d4dc29c9106784e063`. Kotlin has 111 files/tree `ba3e4b7ab4f2eeaf3fafd96bdf2bbbddfd2feb8ebbbe71f4f309c825eb7991cc`; TypeScript has 98 files/tree `04cecfb32400eac04d5818ee1bb22e8394d822e2d350c8cfcc4f3a64eee982fe`. Android imports the generated auth/session client only through its reviewed safe wrapper; TypeScript generated auth types remain server-only behind the BFF. |

## Runtime integration sequence

1. RC0 audit/ledger/payment evidence — **CLOSED**.
2. AI0 provider-neutral AI foundation — **CLOSED / RUNTIME GATED**.
3. RC1 Resend — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**.
4. RC2 Sentry API/portal — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**.
5. RC3 Firebase Crashlytics — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**.
6. RC4 FCM — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**; exact-main managed proof run `29916381754` succeeded on `f05ff19105cb8dc7c4621c044c110b6029f63300` for foreground/background delivery and cleanup; participant/production push remains disabled.
7. RC5 Firebase Test Lab — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX**; isolated project `direkt-testlab-502701-20260726`, exact source `c3744430a7beb1cd47246d858df9ac1379a068ac`, managed run `30183466799`, API 26/33/36, zero flaky retries and production authorization false.
8. RC6 WhatsApp Cloud API application adapter — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY**; exact-current-main run `30137700769` on `8838b7a6d726a5aed44ce21a39506c1265a98d15` passed outbox → Meta `hello_world` test-template send → authentic signed webhook receipt on retry; first-attempt setup failure remains preserved in Issue #404. Production phone/templates and participant/live WhatsApp traffic remain disabled/gated.
9. RC7 Google Maps runtime.
10. RC8 sandbox payment adapters/reconciliation.
11. RC9 generated Kotlin/TypeScript clients — **CLOSED — DETERMINISTIC / BOUNDED RUNTIME ADOPTION**; PR #497 exact head `04ef57f31414ec5165e353abba74afb8dfdcc901` passed the full matrix and merged at `70de95c73128e921cd4d7c667de0e5a442a9e0c0`.
12. RC10 Turnstile threat-model decision.
13. RC11 combined integration regression/evidence index/lane release.

W8 and VC1–VC8 are closed. Runtime integration work does not authorize real participants, production external communications, real money, Phase 11 exit or Phase 12 production release.

## Change-control rule

Update this register and `LIVE_INTEGRATION_LEDGER.md` whenever provider/model provisioning, source adapter/SDK, secret/runtime binding, managed canary, privacy/legal approval, AI evaluation, fallback/kill switch or production authorization changes. External provisioning alone is never enough to mark an integration ACTIVE.
