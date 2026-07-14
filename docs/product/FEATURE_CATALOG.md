# DIREKT Feature Catalog

Priority: **M** mandatory MVP, **S** should, **C** could, **L** later.

| Area | Feature | Priority | Dependency |
|---|---|---:|---|
| Identity | Phone/email account verification | M | Approved provider |
| Identity | Device/session management | M | Auth foundation |
| Identity | Privileged MFA | M | Operations roles |
| Customer | Manual/current area selection | M | Location architecture |
| Customer | Category/text discovery | M | Taxonomy/search |
| Customer | Map/list results | M | Map provider |
| Customer | Verification filters | M | Verification engine |
| Customer | Saved providers | S | Account |
| Customer | Share/deep link | S | Public profile |
| Provider | Profile and operating model | M | Provider domain |
| Provider | Services and service areas | M | Taxonomy/PostGIS |
| Provider | Local draft onboarding | M | Android storage |
| Provider | Evidence upload | M | Private storage |
| Provider | Verification timeline | M | Verification engine |
| Provider | Availability | S | Provider domain |
| Trust | Check-specific cases | M | Data model |
| Trust | Expiry/revocation | M | Jobs/queue |
| Trust | Field visits | M for selected categories | Operations |
| Trust | Fraud flags | M | Trust operations |
| Trust | Explainable trust summary | M | Approved checks |
| Enquiries | Structured enquiry | M | Customer/provider |
| Enquiries | Provider response state | M | Notifications |
| Enquiries | External call/message handoff | M | Consent |
| Messaging | Full in-app chat | L unless research elevates | Moderation |
| Reviews | Interaction eligibility | M | Enquiries |
| Reviews | Rating/text/provider response | M | Moderation |
| Complaints | Reporting and triage | M | Operations |
| Admin | Verification queue | M | Admin portal |
| Admin | Evidence viewer/audit | M | Private storage |
| Admin | Field assignment | M | Field workflow |
| Admin | Category/evidence config | M | Governance |
| Payments | Subscription catalogue | M before monetization | Billing domain |
| Payments | Mobile-money adapter | S/pilot dependent | Provider approval |
| Payments | Reconciliation | M with payments | Ledger |
| Analytics | Product/operations events | M | Event taxonomy |
| Analytics | Provider insights | S | Sufficient data |
| Institutional | Saved supplier lists | C | Core discovery |
| Institutional | Compliance expiry alerts | L | Institutional model |
| Platform | Offline drafts/retry | M | Android/queue |
| Platform | Push notification centre | M | FCM |
| Platform | SMS/email fallbacks | S | Approved vendors |
| Platform | Public Pages docs/prototypes | M for programme | GitHub Actions |
| Expansion | Native iOS | L | Post-Android gate |
| Expansion | Escrow | L | Legal/payment maturity |
