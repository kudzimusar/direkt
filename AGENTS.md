# DIREKT Agent Operating Contract

This file is mandatory for every human or AI implementation agent. It governs the entire repository unless a more specific `AGENTS.md` exists deeper in a directory.

## 1. Product truth

DIREKT is an **Android-first, verification-led local-service marketplace for Zambia** with three deliberately separated user surfaces:

1. **Native Android** — primary Version 1 customer/provider client.
2. **Responsive installable customer/provider PWA** — owner-authorized companion client for desktop/tablet/mobile remote testing and eventual browser access through the same canonical API boundaries.
3. **Internal operations portal** — privileged verification/moderation/field/support/finance/audit web interface.

The following are non-negotiable:

1. Android remains the primary Version 1 customer/provider client; the PWA complements it rather than replacing native Android.
2. The PWA may be publicly reachable in **synthetic remote-review mode** before production, but public reachability never authorizes real participant processing or protected API access.
3. The operations portal is a separate privileged web application and must never be published as public PWA/Pages content.
4. iOS implementation remains deferred; portability is achieved through API/domain boundaries, not cross-platform UI substitution.
5. Payment cannot purchase verification, publication, ranking or a higher trust score.
6. No generic “safe”, “guaranteed”, “government-approved” or “100% verified” claim may be shown.
7. Sensitive identity, certificate, premises and exact-location evidence is private by default.
8. Public repository fixtures, screenshots, prototypes and synthetic PWA content use fictional/non-personal data only.
9. Legal/regulatory assumptions remain explicitly subject to qualified Zambian review.
10. Android, PWA and operations UI are clients of the canonical DIREKT REST/OpenAPI backend. No client directly becomes the database, authorization or trust authority.

## 2. Authoritative current-state rule

Before answering questions about what is “active”, “integrated”, “deployed” or “ready”, read:

1. `MASTER_BUILD_PLAN.md`
2. `PROJECT_STATUS.md`
3. `WORKSTREAM_LOCK.md`
4. `DECISION_LOG.md`
5. `docs/integrations/CURRENT_INTEGRATION_STATUS.md`
6. `DEFINITION_OF_DONE.md`
7. relevant product/design/architecture/security/test documents
8. latest commit/PR/workflow evidence for the assigned scope

Do **not** infer current state from an old plan, provider account, dashboard screenshot, file name or previous assistant answer alone.

For external integrations, distinguish these states exactly:

- `ACTIVE`
- `IMPLEMENTED_GATED`
- `EXTERNALLY_PROVISIONED`
- `PLANNED`
- `DISABLED`
- `SUPERSEDED`

Creating a provider account, DNS record, API key or secret does not prove runtime application integration. Runtime-active claims require source/configuration plus appropriate managed execution evidence.

## 3. Current canonical domain and remote-test truth

- Canonical public domain: `https://direkt.forum/`.
- Public customer/provider synthetic PWA route: `https://direkt.forum/app/`.
- The historical `kudzimusar.github.io/direkt` URL is not the owner-facing canonical entry point.
- Cloudflare currently provides authoritative DNS for the domain; GitHub Pages remains the public static documentation/synthetic-UI publication path.
- Vercel remains the domain registrar and is not the current protected API/portal runtime.
- Native Android remote testing uses GitHub Actions artifacts and Firebase App Distribution.
- Privileged API/portal staging remains IAM-private on Google Cloud Run.

## 4. Single-lane workflow and GitHub lifecycle

The project uses one coherent implementation lane rather than unrelated feature branches.

- `main`: stable documentation, phase checkpoints, public synthetic UI/review baseline and release baselines.
- `build/android-v1`: sequential implementation lane (historical name retained until a deliberate branch-policy decision changes it).
- One agent owns an active overlapping write scope at a time.
- An agent claims work in `WORKSTREAM_LOCK.md` before editing shared paths.
- Parallel read-only investigation is allowed; parallel overlapping writes are prohibited.
- A conflicting active lock must be reconciled explicitly; never overwrite it based on assumption.

The repository owner authorizes the active AI agent to manage routine GitHub lifecycle without manual owner clicks:

1. preserve/synchronize the approved implementation lane without force-pushing;
2. implement coherent bounded work;
3. create a checkpoint PR to `main` when acceptance is met;
4. verify exact PR head, changed files, checks, review findings and mergeability;
5. merge only when mandatory gates pass and no owner-only/external decision remains;
6. use expected head SHA or equivalent moved-head protection;
7. update/close linked issues only when evidence is complete;
8. leave legal, credential, field, participant and other external-evidence issues open until genuine evidence exists.

Feature-branch proliferation and history rewriting remain prohibited. A temporary conflict-containment branch may exist only when an already-claimed lane makes direct safe writes impossible, and it must be reconciled/removed rather than becoming a parallel product line.

## 5. Required task sequence

For every material task:

1. **Orient** — read control documents and current code/evidence.
2. **Verify baseline** — inspect existing CI/managed evidence and run available checks before modification where the execution environment permits.
3. **Claim or reconcile lock** — never overwrite active work silently.
4. **Plan** — define acceptance, dependencies, migrations, integrations and tests.
5. **Implement** — smallest coherent change that preserves trust/privacy boundaries.
6. **Test** — unit/integration/UI/security/docs appropriate to risk.
7. **Inspect** — diff for secrets, unrelated edits, stale claims and regressions.
8. **Document** — update contracts/status/decisions/integration register.
9. **Commit** — atomic conventional commits.
10. **Checkpoint** — create/verify/merge routine PR automatically when safe.
11. **Resolve tracking** — update/close linked issues only with evidence.
12. **Handoff** — update `PROJECT_STATUS.md`, release/transfer lock and identify next approved task.

## 6. Change control

An agent may not silently change:

- approved client/platform scope;
- Android minimum/target SDK policy;
- API versioning or canonical backend boundary;
- verification levels/status semantics;
- database identifiers/state machines;
- public/private location rules;
- trust-score inputs or publication rules;
- evidence retention;
- subscription entitlements;
- user-role permissions;
- release/signing workflow;
- integration provider authority or secret-placement boundary.

A material change requires documented context/problem, chosen option/alternatives, security/privacy/migration/compatibility impact, a decision/architecture record and owner approval where scope, trust, cost or external obligations materially change.

The owner’s 2026-07-19 instruction explicitly authorizes the customer/provider PWA companion client and current-state documentation reconciliation. It does **not** authorize real pilot entry or production release.

## 7. Coding expectations

- Kotlin and TypeScript must compile with warnings treated seriously.
- Browser JavaScript/static PWA code must pass repository static validation and contain no privileged runtime material.
- Domain rules must not live only in UI components.
- Backend authorization is mandatory even when Android/PWA/portal hides an action.
- Database changes use forward migrations; never edit an applied migration.
- Public IDs must not expose sequential database keys.
- API errors use the common problem-details contract.
- Network calls define timeout/retry/idempotency behavior.
- Offline actions are explicit; never pretend a write succeeded before durable acknowledgement.
- Every verification decision and administrative override is auditable.
- Time is stored in UTC and presented in user locale.
- Monetary values use integer minor units plus currency.
- Phone numbers are normalized to E.164 where possible.
- Coordinates are never logged at unnecessary precision.

### PWA-specific

- Public synthetic PWA must not call the private API or include credentials.
- Future live PWA must use canonical REST/OpenAPI contracts and an approved browser session/auth boundary.
- Never place refresh/session tokens in `localStorage` for a live privileged session design.
- Service-worker caches must not contain private evidence/contact/session data.
- Offline mode cannot upgrade trust state or fabricate successful writes.

## 8. Testing expectations

A task is incomplete without evidence appropriate to risk:

- domain unit tests;
- database/API integration tests;
- Android ViewModel/Compose tests;
- PWA/browser static, accessibility, responsive and offline tests;
- operations portal tests;
- authorization negative tests for protected actions;
- offline/retry behavior;
- evidence upload/access tests;
- accessibility checks for customer-facing screens;
- fraud/abuse cases;
- documentation validation.

Never remove a failing test to make CI green. Quarantine only with an issue, owner, reason and expiry.

## 9. Security and public-repository rules

Never commit real identity documents/certificates, customer/provider personal data, exact private coordinates, API keys/passwords/tokens/service-account files, production environment files, unredacted logs, proprietary third-party datasets, private evidence/object URLs or real tester/contact lists.

Use placeholders in examples. Assume every committed byte and every public Pages/PWA asset is permanently public.

## 10. Integration evidence rule

`docs/integrations/CURRENT_INTEGRATION_STATUS.md` is the detailed status source of truth.

Update it whenever external provider/domain provisioning, SDK/adapter implementation, Secret Manager/runtime binding, managed smoke/canary evidence, legal/privacy approval, kill switch/fallback or production authorization changes.

Do not describe Resend, Maps, Sentry, Turnstile, WhatsApp, payments or any other provider as runtime-active unless the required evidence tier exists.

## 11. Completion evidence

Each handoff states task/workstream, exact commit and merged PR, files/modules changed, migrations, checks/results, integration/runtime evidence changed, linked issues, known limitations, security/privacy implications, next approved task and clean/synchronized branch state.

Use `docs/operations/AGENT_HANDOFF_TEMPLATE.md`.

## 12. Stop conditions

Stop the unsafe action and document the blocker instead of guessing when legal/regulatory interpretation is unclear, provider approval/credentials are missing, a migration could destroy data, trust policy conflicts with public copy, source documents cannot be reconciled, an active overlapping lock cannot be safely resolved, or a requested action would bypass Phase 11/12 gates.

A stop condition does not mean abandoning safe adjacent work: complete every non-destructive, non-conflicting, evidence-backed portion and record the exact residual blocker.
