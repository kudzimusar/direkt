# DIREKT Agent Operating Contract

This file is mandatory for every human or AI implementation agent. It governs the entire repository unless a more specific `AGENTS.md` exists deeper in a future directory.

## 1. Product truth

DIREKT is an Android-first marketplace for Zambia. It connects customers with nearby providers using check-specific verification, reliable location data, controlled evidence, reviews and platform-tracked interactions. Native Android remains the primary Version 1 customer/provider client; an owner-authorized responsive installable PWA is an additive companion for desktop/tablet/mobile remote review and future browser use through the same canonical API boundaries.

The following are non-negotiable:

1. Native Android remains the primary Version 1 customer/provider client and Play release target.
2. A customer/provider PWA companion is authorized; its public pre-release mode is synthetic-only until a separate live-browser security/access gate passes.
3. The internal operations portal is a separate privileged web application and must never be exposed as public PWA/Pages content.
4. iOS implementation is deferred; portability is achieved through API and domain boundaries, not cross-platform UI substitution.
5. Payment cannot purchase verification or a higher trust score.
6. No generic “safe”, “guaranteed”, “government-approved” or “100% verified” claim may be shown.
7. Sensitive identity, certificate, premises and exact-location evidence is private by default.
8. Public repository fixtures, screenshots, prototypes and synthetic PWA content use fictional/non-personal data only.
9. Legal or regulatory assumptions must be marked for qualified Zambian review.
10. Android, PWA and operations clients do not become the authorization, database or trust authority; canonical backend controls remain server-side.

## 2. Read before changing anything

Read, in order:

1. `MASTER_BUILD_PLAN.md`
2. `PROJECT_STATUS.md`
3. `WORKSTREAM_LOCK.md`
4. `DECISION_LOG.md`
5. `DEFINITION_OF_DONE.md`
6. `docs/REPOSITORY_RECONCILIATION_2026-07-19.md`
7. `docs/integrations/CURRENT_INTEGRATION_STATUS.md`
8. the relevant product, design, architecture, security and test documents
9. the latest commit/PR/workflow evidence for the assigned scope

Do not infer current state from filenames, old plans, provider dashboards or prior assistant answers alone. Verify code, migrations, automated checks, managed runtime evidence and current documentation.

For external integrations, distinguish provisioning from runtime activation. Use the status taxonomy in `docs/integrations/CURRENT_INTEGRATION_STATUS.md`: `ACTIVE`, `IMPLEMENTED_GATED`, `EXTERNALLY_PROVISIONED`, `PLANNED`, `DISABLED`, `SUPERSEDED`.

## 3. Single-lane workflow and GitHub lifecycle

The project uses one coherent implementation lane rather than unrelated feature branches.

- `main`: stable documentation, phase checkpoints, public synthetic review surfaces and release baselines.
- `build/android-v1`: sequential long-lived implementation lane; the historical branch name does not prohibit the approved PWA companion.
- One agent owns an active overlapping write scope at a time.
- An agent claims work in `WORKSTREAM_LOCK.md` before editing shared/overlapping paths.
- The previous agent must leave a complete handoff and clean working tree/branch state.
- Parallel read-only investigation is allowed; parallel overlapping writes are not.
- A temporary conflict-containment branch is allowed only when an already-active locked lane would otherwise be overwritten; it must be reconciled and removed rather than becoming a parallel product line.

The repository owner authorizes the active AI agent to manage the normal GitHub lifecycle without requiring manual owner clicks:

1. push coherent, tested work to the approved implementation/reconciliation branch;
2. create a checkpoint pull request to `main` when the bounded task or phase gate is ready;
3. verify the exact PR head, changed files, required checks, unresolved review comments and mergeability;
4. merge the PR when all mandatory gates pass and no owner-only decision is outstanding;
5. use the expected head SHA when merging so a moved PR cannot be merged accidentally;
6. update and close linked issues automatically when their committed acceptance evidence is complete;
7. leave human-fieldwork, legal, credentials, payment-provider and other external-evidence issues open until the required owner or field evidence exists.

Normal checkpoint PR management is therefore an agent responsibility. The owner should not need to open, run or merge routine PRs manually. Feature-branch proliferation remains prohibited. Force-pushing and history rewriting remain prohibited.

A PR must not be merged automatically when:

- required CI is failing or unavailable;
- the PR head changed after verification;
- a critical or high-risk review finding is unresolved;
- a migration or production action needs explicit approval;
- the task depends on field evidence, legal advice, secrets or an unmade product decision;
- the acceptance criteria are not evidenced.

## 4. Required task sequence

For every task:

1. **Orient** — read the control documents and current code/evidence.
2. **Verify** — run or inspect the existing validation baseline before modifying files where the execution environment permits.
3. **Claim** — update/reconcile `WORKSTREAM_LOCK.md` with scope and affected modules before overlapping writes.
4. **Plan** — identify acceptance criteria, dependencies, migrations and tests.
5. **Implement** — make the smallest coherent change.
6. **Test** — run all relevant unit, integration, UI, security and documentation checks.
7. **Inspect** — review the diff for secrets, unrelated edits, stale claims and policy violations.
8. **Document** — update specifications, decision/integration status and API/data contracts where applicable.
9. **Commit** — create atomic commits with clear conventional messages.
10. **Checkpoint** — when the task gate is complete, create, verify and merge the checkpoint PR automatically.
11. **Resolve tracking** — update or close linked issues only when their acceptance evidence is complete.
12. **Handoff** — update current status/lock and identify the exact next approved task.

## 5. Change control

An agent may not silently change:

- approved technology/client scope;
- Android minimum or target SDK policy;
- API versioning;
- verification levels or status semantics;
- database identifiers or state machines;
- public/private location rules;
- trust-score inputs;
- evidence retention periods;
- subscription entitlements;
- user-role permissions;
- release workflow;
- integration provider authority or secret-placement boundaries.

A material change requires:

1. a documented reason;
2. alternatives considered;
3. security, privacy, migration and compatibility impact;
4. a new entry in `DECISION_LOG.md` or architecture/reconciliation decision record;
5. owner approval where the decision materially affects cost, trust or scope.

The owner’s 2026-07-19 instruction explicitly authorizes the customer/provider PWA companion and current-state documentation/integration reconciliation. It does **not** authorize real participant pilot entry or production release.

## 6. Coding expectations

- Kotlin and TypeScript must compile with warnings treated seriously.
- Public PWA JavaScript/static assets must pass syntax/static-safety validation and contain no privileged runtime material.
- Domain rules must not live only in UI components.
- Backend authorization is mandatory even when Android, PWA or portal hides an action.
- Database changes use forward migrations; never edit an applied migration.
- Public IDs must not expose sequential database keys.
- API errors use the common problem-details contract.
- Network calls must define timeout, retry and idempotency behaviour.
- Offline actions must be explicit; do not pretend an action succeeded before durable acknowledgement.
- Every verification decision and administrative override must be auditable.
- Time is stored in UTC and presented in the user’s locale.
- Monetary values use integer minor units plus currency code.
- Phone numbers are normalized to E.164 where possible.
- Coordinates are never logged at unnecessary precision.
- A public synthetic PWA must not call the IAM-private API or cache auth, contact, private evidence or participant data.
- Any future live PWA must use canonical REST/OpenAPI contracts and an approved browser authentication/session/gateway boundary; no direct privileged Supabase/database access.

## 7. Testing expectations

A task is incomplete without evidence appropriate to its risk:

- domain unit tests;
- database and API integration tests;
- Android ViewModel and Compose tests;
- PWA/static/browser syntax, responsive, accessibility and offline tests where relevant;
- authorization tests for every protected action;
- offline/retry tests for sync behaviour;
- upload and file-access tests for evidence;
- accessibility checks for customer-facing screens;
- negative cases and fraud/abuse scenarios;
- documentation validation.

Never remove a failing test to make CI green. Quarantine only with an issue, owner, reason and expiry date.

## 8. Security and public-repository rules

Never commit:

- real identity documents or certificates;
- real customer/provider personal data;
- exact private coordinates;
- API keys, passwords, tokens or service-account files;
- production environment files;
- unredacted logs;
- proprietary third-party datasets;
- private evidence/object URLs or real tester/contact lists.

Use `.env.example` with placeholders. Assume every committed byte and public Pages/PWA asset is permanently public.

## 9. Integration truth rule

`docs/integrations/CURRENT_INTEGRATION_STATUS.md` is the detailed current integration-status source of truth.

Update it whenever provider/domain provisioning, SDK/adapter implementation, Secret Manager/runtime binding, managed canary evidence, legal/privacy approval, fallback/kill switch or production authorization changes.

Do not call Resend, Maps, Sentry, Turnstile, WhatsApp, push, payments or any other provider runtime-active merely because an account, domain, API key or secret exists.

## 10. Completion evidence

Each handoff must state:

- task and phase/workstream;
- exact commit and merged checkpoint PR, when applicable;
- files/modules changed;
- migrations added;
- commands/checks and results;
- integration/runtime evidence changed;
- linked issues updated or closed;
- known limitations;
- security/privacy implications;
- next approved task;
- clean/synchronized branch state.

Use `docs/operations/AGENT_HANDOFF_TEMPLATE.md`.

## 11. Stop conditions

Stop the unsafe action and document the blocker instead of guessing when:

- a legal requirement is unclear;
- a payment, mapping, communications or other provider is not approved/runtime-proven;
- production credentials would be required outside an approved protected flow;
- a migration could destroy data;
- verification policy conflicts with public copy;
- source documents are stale or contradictory and cannot be reconciled safely;
- an active overlapping lock cannot be resolved without losing work;
- an existing failure cannot be isolated;
- the assigned phase/action is not authorized.

A stop condition does not prevent safe adjacent work: complete every non-destructive, non-conflicting, evidence-backed portion and record the exact residual blocker.
