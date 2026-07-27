# RC11 Managed Integration Evidence Index

**Governing issue:** #261  
**Claim merge:** `7f0b6b76a78572b6bb90694814037c370935e3b9`  
**State:** RC11B COMPLETE / RC11A AND RC11D EXACT-HEAD CLOSURE PENDING  
**Production authorization:** false

## Purpose

This index is the final cross-provider receipt for the DIREKT runtime-integration closure programme. It records only the bounded state actually proven by repository source, managed execution and permanent controls. An account, secret, dashboard, SDK or provider sandbox does not become production-active by appearing here.

## Managed and deterministic evidence

| Checkpoint | Bounded state | Exact source / managed evidence | Retained boundary |
|---|---|---|---|
| RC0 | Closed repository/integration audit | PR #263; live ledger and permanent runtime-truth controls | No provider activation |
| AI0 | Closed provider-neutral foundation; runtime gated | PR #265 merge `eafee4e5f54df9b216365cf2b8217b9a52cb1ada`; Gemini and Groq synthetic HTTP 200 canaries | No DIREKT runtime provider binding; production AI disabled |
| RC1 Resend | Active synthetic-only managed canary | exact source `8e367f47f16b3f9f28a26a62ee8bdd305a286153`; Cloud Run execution `direkt-resend-canary-ct9mp` | Participant and production email disabled |
| RC2 Sentry API/portal | Active synthetic-only managed canary | source merge `15210c5b0bf1832e32f8c33a7618c69f61f65275`; managed canary #1 SUCCESS in 4m15s | Separate DSNs; auth token CI-only; participant telemetry disabled |
| RC3 Crashlytics | Active synthetic-only managed canary | exact source `9098f7eb333baf096163f1564b3d8e5e5da3fcf0`; bridge run `29885635547` | Default collection off; no Analytics or participant ID |
| RC4 FCM | Active synthetic-only managed canary | exact source `f05ff19105cb8dc7c4621c044c110b6029f63300`; run `29916381754`; artifact digest `sha256:f45d1924ee6138f86ec15a222e97f28ff67bbe9c610ff75f57666fd03929526c` | Participant registration and production push disabled |
| RC5 Test Lab | Closed synthetic-only managed matrix | exact source `c3744430a7beb1cd47246d858df9ac1379a068ac`; run `30183466799`; artifact `8626329335`, digest `sha256:03a40951a23c937d8b0fd2990a7d2652afbd1172631c0b480af756aebd92a843` | Isolated Spark project; API 26/33/36; production authorization false |
| RC6 WhatsApp | Closed synthetic-only managed canary | exact source `8838b7a6d726a5aed44ce21a39506c1265a98d15`; run `30137700769` succeeded on retry | Test template/recipient only; participant delivery disabled |
| RC7 Maps | Closed synthetic-only managed canary | exact source `47285575862cbf08845eaeabe093afea1ea79bd1`; run `30234521983/1`; artifact `8641270327`, digest `sha256:24da53c0bd6fa885fa4a6814f70af090096192e6c5b7a03c89fba51416877fde` | Manual/list fallback active; private coordinates and participant Maps disabled |
| RC8 Payments | Closed synthetic-only managed canary | exact source `ccc4e9463d810ddf554182b1607c22d3a7c8c8d3`; run `30241092949/1`; artifact `8643323319`, digest `sha256:bbb4600eb5a062552947e91c878dd09c6d1e4dc307ae4783c7fa1fb4cf6e4935` | MTN/Stripe/PayPal sandbox proof only; application runtime and real money disabled |
| RC9 Generated clients | Closed deterministic bounded adoption | implementation PR #497 head `04ef57f31414ec5165e353abba74afb8dfdcc901`; merge `70de95c73128e921cd4d7c667de0e5a442a9e0c0`; generator 7.22.0 | Generated imports limited to reviewed Android auth wrapper and server-only BFF adapter |
| RC10 Turnstile decision | Closed — not currently required | PR #502 head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`; merge `620a99ba5465ad38ce012df0a8fa15e458de6505` | No key, secret, widget or runtime; first-party rate limits protect public helper POSTs |

## RC11A combined regression baseline

The RC11 claim exact head `16b3a411b3eb089b6b8ab166683b782c647d5ab9` passed the preserved combined matrix before the final reconciliation change:

- W7 Android/backend/database/OpenAPI/cross-client regression: `30282896500`;
- deterministic OpenAPI generation, Kotlin compilation and TypeScript checking: `30282896476`;
- functional customer/provider PWA: `30282896434`;
- customer/provider PWA CI: `30282893588`;
- W8 canonical-domain contract: `30282893546`;
- documentation: `30282894599`;
- RC5 closure and isolated contracts: `30282896409`, `30282894462`;
- RC6: `30282893551`;
- RC7: `30282893421`;
- RC8 contract and managed-proof preservation: `30282896449`, `30282893512`;
- RC9: `30282893411`;
- RC10: `30282893358`.

RC11 closure still requires the permanent verifier and applicable full matrix to pass on the exact final reconciliation head.

## Truthful non-active and blocked states

| Capability | Final RC11 state | Reason / next gate |
|---|---|---|
| Firebase real-participant phone authentication | `IMPLEMENTED_GATED` | DPC/legal/notice/provider configuration and real canary required |
| Participant email, push and WhatsApp | `DISABLED / GATED` | Consent, provider, legal, pilot and release approval required |
| Participant Crashlytics/Sentry | `DISABLED` | Approved privacy boundary and real-data telemetry decision required |
| Participant Maps/geocoding | `DISABLED / MANUAL FALLBACK ACTIVE` | Pilot privacy/provider approval and real canary required |
| Gemini/Groq application runtime | `IMPLEMENTED_GATED / NOT BOUND` | Use-case, data, evaluation, privacy and runtime approval required |
| Airtel Money Zambia | `PENDING_PROVIDER` | TEST approval and credentials pending |
| DPO application runtime | `SOURCE INTEGRATED / RUNTIME DISABLED` | Private DIREKT sandbox/commercial credential and managed proof required |
| Flutterwave | `BLOCKED / DEFERRED` | Onboarding unavailable/deferred |
| Payment application runtime and real money | `DISABLED` | Legal, commercial, provider, pilot and release gates required |
| Escrow/customer-to-provider payments | `PLANNED LATER / NOT MVP` | Separate regulatory, payout, dispute and KYC architecture required |
| Cloudflare Turnstile | `NOT CURRENTLY REQUIRED / NOT ACTIVE` | Re-evaluate only on documented abuse trigger |
| Automated registry APIs | `NOT AUTHORIZED` | Formal lawful access required |
| Real Phase 11 participants/evidence | `BLOCKED` | Phase 11 entry checklist and external approvals incomplete |
| Formal Phase 12 production release | `NOT AUTHORIZED` | Actual Phase 11 evidence, 11J decision and global release gates required |

## Security and authority preservation

- Backend/API authorization remains authoritative.
- Browser and Android clients contain no provider, payment, database or telemetry-admin credentials.
- Exact private provider coordinates and original evidence remain private.
- Payment never creates verification, publication or ranking authority.
- AI never becomes verification, trust, payment, dispute, legal or authorization authority.
- Synthetic, sandbox and managed-canary evidence is not PRIMARY-PILOT evidence.
