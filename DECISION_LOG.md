# DIREKT Decision Log

This log records product and technical decisions with long-term impact.

| ID | Date | Decision | Rationale | Status |
|---|---|---|---|---|
| D-001 | 2026-07-14 | Version 1 customer/provider client is native Android | Android-first delivery matches the stated strategy and avoids premature cross-platform compromise | Accepted |
| D-002 | 2026-07-14 | iOS is deferred, but API/domain contracts remain client-neutral | Preserves future expansion without introducing iOS scope now | Accepted |
| D-003 | 2026-07-14 | One Android app supports customer and provider modes | Shared identity and interaction history reduce duplication; role switching remains controlled | Accepted for Phase 2; re-evaluate after pilot |
| D-004 | 2026-07-14 | Operations portal is an internal web application | Evidence review and queue operations require desktop-friendly workflows | Accepted |
| D-005 | 2026-07-14 | Backend begins as a NestJS modular monolith | Strong module boundaries with lower operational complexity than microservices | Accepted |
| D-006 | 2026-07-14 | PostgreSQL/PostGIS is the system of record | Required for relational integrity and geospatial search | Accepted |
| D-007 | 2026-07-14 | Supabase is an initial managed-infrastructure candidate, not the domain layer | Provides managed data/storage options while preserving API ownership | Provisional |
| D-008 | 2026-07-14 | Verification is check-specific and evidence-backed | Prevents misleading blanket trust claims | Accepted |
| D-009 | 2026-07-14 | Commercial status cannot alter verification status or trust scoring | Protects marketplace integrity | Accepted |
| D-010 | 2026-07-14 | Exact private locations are hidden by default | Reduces safety and privacy risk for home/mobile providers | Accepted |
| D-011 | 2026-07-14 | Reviews require a platform-tracked interaction | Reduces fake and unrelated reviews | Accepted |
| D-012 | 2026-07-14 | GitHub Pages hosts only static, synthetic, non-sensitive content | Pages is suitable for documentation/testing but not secure backend operations | Accepted |
| D-013 | 2026-07-14 | Initial implementation uses one sequential branch rather than feature PRs | User requires coherent agent execution from start to finish | Accepted |
| D-014 | 2026-07-14 | Production claims and pilot launch require later Zambia validation | Real operating constraints must be tested before public use, even though design may start from a provisional baseline | Accepted |
| D-015 | 2026-07-14 | Remote testing is split across Pages, Actions and Firebase App Distribution | Pages supports static review, Actions verifies/packages Android builds, Firebase distributes controlled installations | Accepted |
| D-016 | 2026-07-14 | The permanent Android package name must be approved before Firebase registration | Firebase Android registration is tied to an exact package name; premature registration creates migration risk | Accepted |
| D-017 | 2026-07-14 | Research uses explicit evidence classifications and an assumptions register | Prevents sources and founder preference from becoming unlabelled product truth | Accepted |
| D-018 | 2026-07-14 | Raw participant data and real evidence remain outside the public repository | The repository and Pages are public | Accepted |
| D-019 | 2026-07-14 | Lusaka District is the provisional design and pilot-market context | It has Zambia's strongest population concentration and the lowest initial operational dispersion | Accepted for design; exact neighbourhood boundary deferred |
| D-020 | 2026-07-14 | PACRA, NCC and TEVETA are candidate evidence sources, not automatic integrations | Their official systems support relevant claims, but access, coverage, legal use and matching reliability remain unconfirmed | Accepted |
| D-021 | 2026-07-14 | Primary field research is retained for later pilot validation | Real interviews and observations remain valuable but cannot be completed under current circumstances | Deferred to Phases 10 and 11 |
| D-022 | 2026-07-14 | The active AI agent manages routine PR merging and eligible issue closure | The owner does not want manual GitHub administration | Accepted |
| D-023 | 2026-07-14 | Phase 1A may exit on current official and credible secondary research with accepted limitations | Waiting indefinitely for manual recruitment would block progress without producing evidence; explicit provisional status preserves honesty | Accepted |
| D-024 | 2026-07-14 | Initial design categories are plumbing, electrical repair, motor-vehicle mechanics and appliance/electronics repair | They cover urgent and planned local services plus fixed/mobile/hybrid operating models | Provisional; final pilot supply and legal screening deferred |
| D-025 | 2026-07-14 | MVP customer payment and escrow are deferred | DIREKT's first proof is trusted discovery and tracked enquiry; payments add regulatory, reconciliation and support complexity | Accepted |
| D-026 | 2026-07-14 | MVP communication is tracked enquiry followed by consent-aware call or WhatsApp handoff | Preserves platform accountability without prematurely building full chat | Accepted for MVP; validate in pilot |
| D-027 | 2026-07-14 | Area, landmark, map pin and optional Plus Code are supported location inputs | They provide resilience where conventional street addressing is incomplete | Accepted for design |
| D-028 | 2026-07-14 | Phase 1B uses a dependency-free synthetic Pages prototype | Avoids hosting cost, credentials and framework overhead while preserving interactive remote review | Accepted |
| D-029 | 2026-07-14 | Android namespace and production application ID are `com.kudzimusar.direkt` | The identifier is unique, valid, tied to the owner-controlled identity and avoids a temporary `com.example` migration | Accepted |
| D-030 | 2026-07-14 | Phase 1B passes with accepted limitations and Phase 2 is authorized | Customer, provider and operations structures are coherent enough to scaffold; native and real-user validation remain later obligations | Accepted |
| D-031 | 2026-07-14 | Development builds may use an application ID suffix while production retains the exact approved ID | Allows parallel debug/staging installs without changing the production identity | Accepted |
| D-032 | 2026-07-14 | Phase 2A pins Gradle 9.4.0, AGP 9.0.0, Kotlin 2.3.0, Compose BOM 2025.09.01 and API 36 | These values match the current Google Android `nowinandroid` reference inspected for the phase and provide a reproducible modern baseline | Accepted; recheck at release gates |
| D-033 | 2026-07-14 | Phase 2A begins with a single `:app` module | Empty module proliferation would add complexity before domain and data contracts exist; modules will split only at stable boundaries | Accepted |
| D-034 | 2026-07-14 | Phase 2A contains no network, Firebase, payment, regulator or real-evidence integration | The first APK must prove native buildability, design tokens, state boundaries and CI without creating premature security or vendor commitments | Accepted |
| D-035 | 2026-07-14 | The CI runner bootstraps the standard Gradle wrapper JAR from the pinned Gradle distribution | Binary wrapper transfer was unavailable through the initial repository-writing path; the pinned distribution and SHA preserve reproducibility until the generated JAR is committed in a later maintenance step | Accepted with documented limitation |
| D-036 | 2026-07-14 | Phase 2B pins Node.js 24, npm 11, NestJS 11.1.x, TypeScript 5.9.x and PostgreSQL 18/PostGIS 3.6 | Establishes a current LTS runtime and reproducible geospatial backend aligned with the approved architecture | Accepted; recheck at release gates |
| D-037 | 2026-07-14 | Normal backend CI installs a committed npm lockfile with `npm ci` | Dependency resolution must be reviewable and identical across clean runners rather than regenerated during every build | Accepted |
| D-038 | 2026-07-14 | Database migrations are forward-only, SHA-256 checksummed, advisory-locked and transactional per file | Prevents concurrent application, silent alteration and partial schema changes | Accepted |
| D-039 | 2026-07-14 | The first database migration contains only platform audit, outbox and idempotency foundations | Domain tables require an owning module and stable contract; introducing them prematurely would couple future phases | Accepted |
| D-040 | 2026-07-14 | Audit events are append-only at the database layer | Security and operational history must not be silently rewritten by application code | Accepted |
| D-041 | 2026-07-14 | Only hashed idempotency keys may be persisted | Raw retry keys can act as sensitive bearer-like values and are unnecessary for replay protection | Accepted |
| D-042 | 2026-07-14 | Phase 2B exposes only health and API documentation operations | Authentication, provider, evidence, verification and payment surfaces remain prohibited until their phase-specific controls exist | Accepted |
| D-043 | 2026-07-14 | Reusable backend logic has coverage thresholds; command wrappers and empty module declarations are verified by CI but excluded from unit coverage targets | Coverage should measure testable logic rather than penalize deterministic launch wrappers already executed by the pipeline | Accepted |
| D-044 | 2026-07-15 | Contact verification is separate from provider membership and provider trust claims | Possession of a phone or email channel must never be misrepresented as professional, business, location or safety verification | Accepted |
| D-045 | 2026-07-15 | Access tokens contain only identity/session references; roles and permissions are resolved server-side | Prevents client claim tampering and makes role revocation effective without waiting for a role-bearing token to expire | Accepted |
| D-046 | 2026-07-15 | Refresh tokens are stored only as hashes, rotate on use and revoke the full family after reuse | Limits replay exposure and provides an explicit compromised-session response | Accepted |
| D-047 | 2026-07-15 | Phase 2C passwordless delivery is synthetic and automatically disabled in production configuration | Establishes a testable contract without implying that an OTP vendor, legal basis or abuse controls have been approved | Accepted with production stop gate |
| D-048 | 2026-07-15 | Role grants are global or provider-scoped and may not overlap for the same identity/role/scope interval | Enforces tenant scope while permitting an expired bounded assignment to be granted again | Accepted |
| D-049 | 2026-07-15 | The operations portal uses Next.js 16/React 19 and consumes only the versioned backend API | Prevents privileged browser code from bypassing domain authorization or private-storage controls | Accepted |
| D-050 | 2026-07-15 | Phase 2C exposes only synthetic identity/session and operations-policy surfaces | Provider creation, evidence, verification decisions, trust publication and production administration remain later-phase concerns | Accepted |
| D-051 | 2026-07-15 | Human account identities and provider organizations are separate aggregates | One person may represent multiple providers, and a provider may have multiple representatives without conflating people and businesses | Accepted |
| D-052 | 2026-07-15 | Provider pathways are explicit values: registered business, qualified individual or experienced informal provider | Missing registration or qualification evidence must not silently classify a provider; each pathway has a distinct later evidence burden | Accepted; pilot validation remains required |
| D-053 | 2026-07-15 | Fixed-premises, mobile and hybrid operating models are first-class fields with public-safe locality summaries | Supports Zambia's varied service delivery patterns without exposing precise private coordinates | Accepted |
| D-054 | 2026-07-15 | Provider category selections pin an immutable activated requirement version | Historical evidence and decisions must remain interpretable after category requirements evolve | Accepted |
| D-055 | 2026-07-15 | Phase 3 provider states are draft, ready for verification, suspended and archived; none is publicly discoverable | Profile completeness and operator action cannot substitute for evidence-derived publication | Accepted |
| D-056 | 2026-07-15 | The Phase 3 public-directory view is structurally empty and no public provider API exists | Makes the publication stop gate testable at database, API, Android and portal layers | Accepted |
| D-057 | 2026-07-15 | Evidence bytes remain in adapter-backed private object storage while PostgreSQL stores opaque references and review-safe metadata | Limits database exposure and allows the synthetic adapter to be replaced by managed private storage without changing verification-domain contracts | Accepted; production adapter remains gated |
| D-058 | 2026-07-15 | Verification decisions are immutable and may be recorded only while a case is actively in review | Prevents repeat decisions from rewriting a completed lifecycle; appeals and renewals must explicitly re-enter an auditable review step | Accepted |
| D-059 | 2026-07-15 | Shared requirement keys require category scope whenever a provider has multiple matching selected categories | Preserves deterministic evidence-to-requirement meaning without duplicating provider evidence or silently choosing a category | Accepted |
| D-060 | 2026-07-15 | Recommendation and decision results must match the immutable reason-code outcome at the database boundary | Prevents contradictory audit history and unsafe claim derivation from semantically invalid decisions | Accepted |
| D-061 | 2026-07-15 | Public trust output consists only of safe scoped claim cards derived by validated decision and expiry functions | Original evidence, blanket verified flags, payment state, direct row edits and client assertions cannot create or strengthen public trust claims | Accepted |
| D-062 | 2026-07-15 | Public discovery uses an explicit policy-controlled provider/category publication record rather than profile completeness or a blanket discoverable flag | Makes publication auditable, reversible and dependent on current mandatory scoped claims | Accepted |
| D-063 | 2026-07-15 | Private base, consented public premises and non-private service area are separate location concepts | Prevents home/mobile-provider location leakage while supporting lawful point distance and service-area matching | Accepted |
| D-064 | 2026-07-15 | Mobile providers are never ranked by distance from a private base, and manual area selection remains a first-class customer path | Protects provider privacy and preserves access when device location is unavailable or declined | Accepted |
| D-065 | 2026-07-15 | Every public search, profile, claim and save read re-evaluates provider status, selected category/version and current mandatory claims | Prevents stale publication rows and saved entries from bypassing live enforcement or category removal | Accepted |
| D-066 | 2026-07-15 | Discovery ordering is deterministic and uses allowlisted evidence-backed explanations; payment cannot improve publication or ranking | Keeps customer-facing reasons interpretable and preserves commercial independence from trust | Accepted |
| D-067 | 2026-07-15 | Phase 5 retains a synthetic map/list abstraction and manual area fallback instead of activating production maps or location credentials | Allows product and privacy contracts to mature before vendor, cost and consent approval | Accepted with production stop gate |
| D-068 | 2026-07-16 | Provider workspace ownership is resolved from active server-side assignments and ambiguous multi-provider identities are rejected | Prevents client-selected tenant scope and avoids silently choosing a provider when one identity represents several organizations | Accepted |
| D-069 | 2026-07-16 | Recoverable evidence uploads use one logical intent with fresh private sessions per retry | Preserves idempotency across interruption and process recreation while keeping immutable evidence versions bound to one upload session | Accepted |
| D-070 | 2026-07-16 | Provider timeline and operations readiness use dedicated safe aggregate projections | Providers and operators need progress visibility without reviewer identities, private rationale, evidence identifiers, object keys or coordinates | Accepted |
| D-071 | 2026-07-16 | Availability is independently editable but cannot alter claims, publication or ranking | Operational capacity is useful to customers but must not be interpreted as trust or commercial preference | Accepted |
| D-072 | 2026-07-16 | Enquiry, review-response and subscription surfaces remain explicit read-only boundaries in Phase 6 | Makes Phase 8 and Phase 9 ownership testable and prevents accidental early coupling to messaging, moderation or payment logic | Accepted |
| D-073 | 2026-07-16 | Phase 7 operations queues and actions are authorized from live server-side permissions | Portal navigation is not an authorization boundary; revocation and role changes must take effect without trusting client state | Accepted |
| D-074 | 2026-07-16 | Private evidence review uses active assignment-scoped, short-lived, audited and revocable grants | Operators need controlled review access without persistent storage URLs or broad evidence visibility | Accepted |
| D-075 | 2026-07-16 | Field assignments and structured inspections remain advisory and cannot create decisions, claims or publication | Field observations support verification operations but cannot substitute for independent review authority | Accepted |
| D-076 | 2026-07-16 | High-risk overrides require two distinct eligible approvers and cannot bypass mandatory evidence or publication policy | Four-eyes review must add authorization without weakening the trust model | Accepted |
| D-077 | 2026-07-16 | Operations incidents are internal bounded records with owner-scoped resolution and immutable terminal data | Phase 7 needs operational control records without prematurely implementing Phase 8 customer complaint and review workflows | Accepted |
| D-078 | 2026-07-16 | Public-returning field text and aggregate reporting are constrained by database-level privacy allowlists | Precise coordinates, object paths, checksums and private evidence metadata must remain blocked even if an application caller is defective | Accepted |

## How to add a decision

Use the next ID and include:

- context and problem;
- chosen option;
- alternatives considered;
- security, privacy, migration and compatibility impact;
- approval status;
- reversal conditions.
