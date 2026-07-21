# DIREKT Feature Catalog

Priority: **M** mandatory MVP/core, **S** should, **C** could, **L** later.

The world-class visual/product modernization and AI direction is governed by `WORLD_CLASS_PRODUCT_AND_AI_PLAN.md`. AI features are assistive unless explicitly stated; consequential trust, authorization, payment and legal decisions remain deterministic/human-accountable.

| Area | Feature | Priority | Dependency |
|---|---|---:|---|
| Identity | Phone/email account verification | M | Approved provider |
| Identity | Device/session management | M | Auth foundation |
| Identity | Privileged MFA | M | Operations roles |
| Customer | Manual/current area selection | M | Location architecture |
| Customer | Category/text discovery | M | Taxonomy/search |
| Customer | Natural-language service-need entry | S / VC7 | AI use-case registry + search fallback |
| Customer | AI clarifying questions and query/category expansion | S / VC7 | Intent evaluation + manual fallback |
| Customer | Optional photo/voice-assisted service intent | C | Approved data/privacy/model capability |
| Customer | Map/list results | M | Map provider |
| Customer | Verification filters | M | Verification engine |
| Customer | Explainable provider relevance | S | Search/ranking policy |
| Customer | AI-assisted provider comparison summary | S / VC7 | Public-safe facts + evaluation |
| Customer | Saved providers | S | Account |
| Customer | Share/deep link | S | Public profile |
| Provider | Profile and operating model | M | Provider domain |
| Provider | Services and service areas | M | Taxonomy/PostGIS |
| Provider | Local draft onboarding | M | Android storage |
| Provider | AI onboarding/requirements copilot | S / VC7 | Approved public/provider-safe context |
| Provider | AI-assisted public profile/service copy draft | S / VC7 | Provider confirmation required |
| Provider | Evidence upload | M | Private storage |
| Provider | Evidence quality guidance | S | Local/deterministic checks; AI only after approval |
| Provider | OCR/document field extraction assistance | C / gated | Restricted-data AI approval + human confirmation |
| Provider | Verification timeline | M | Verification engine |
| Provider | Availability | S | Provider domain |
| Trust | Check-specific cases | M | Data model |
| Trust | Expiry/revocation | M | Jobs/queue |
| Trust | Field visits | M for selected categories | Operations |
| Trust | Fraud flags | M | Trust operations |
| Trust | AI/ML anomaly risk signals | S / gated | Bias/security/evaluation + human review |
| Trust | Explainable trust summary | M | Approved checks |
| Enquiries | Structured enquiry | M | Customer/provider |
| Enquiries | Provider response state | M | Notifications |
| Enquiries | External call/message handoff | M | Consent |
| Messaging | Full in-app chat | L unless research elevates | Moderation |
| Reviews | Interaction eligibility | M | Enquiries |
| Reviews | Rating/text/provider response | M | Moderation |
| Reviews | AI-assisted spam/toxicity/theme moderation | S / VC7 | Human moderation + evaluation |
| Complaints | Reporting and triage | M | Operations |
| Complaints | AI-assisted complaint summarization/triage signals | S / gated | Human decision authority |
| Admin | Verification queue | M | Admin portal |
| Admin | Evidence viewer/audit | M | Private storage |
| Admin | Field assignment | M | Field workflow |
| Admin | Category/evidence config | M | Governance |
| Admin | AI case summary/checklist assistant | S / VC7 | Role scope + human review |
| Admin | AI draft action-required/support explanation | S / VC7 | Reason-code semantics + human edit |
| Support | Documentation-grounded AI help assistant | S / VC7 | Approved knowledge base + manual escalation |
| Search | Semantic candidate generation | S / VC7 | Deterministic eligibility first |
| Search | ML/AI re-ranking | C / gated | Offline/shadow evaluation + explainability |
| Payments | Subscription catalogue | M before monetization | Billing domain |
| Payments | Mobile-money adapter | S/pilot dependent | Provider approval |
| Payments | Reconciliation | M with payments | Ledger |
| Analytics | Product/operations events | M | Event taxonomy |
| Analytics | Provider insights | S | Sufficient data |
| Analytics | AI demand/support/taxonomy insight proposals | S / VC7 | Aggregated/minimized analytics |
| Institutional | Saved supplier lists | C | Core discovery |
| Institutional | Compliance expiry alerts | L | Institutional model |
| Platform | Offline drafts/retry | M | Android/queue |
| Platform | Push notification centre | M | FCM |
| Platform | SMS/email fallbacks | S | Approved vendors |
| Platform | Public Pages docs/prototypes | M for programme | GitHub Actions |
| AI platform | Backend AI orchestration boundary | M before production AI | Canonical API/security |
| AI platform | Use-case registry and prompt/version control | M before production AI | Source control |
| AI platform | Model-provider abstraction | M before production AI | Approved provider(s) |
| AI platform | Structured-output validation | M before production AI | Schemas |
| AI platform | AI evaluation/security suites | M before production AI | Synthetic/approved datasets |
| AI platform | Cost/latency/rate controls and kill switches | M before production AI | Observability/configuration |
| Expansion | Native iOS | L | Post-Android gate |
| Expansion | Escrow | L | Legal/payment maturity |