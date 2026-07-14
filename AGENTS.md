# DIREKT Agent Operating Contract

This file is mandatory for every human or AI implementation agent. It governs the entire repository unless a more specific `AGENTS.md` exists deeper in a future directory.

## 1. Product truth

DIREKT is a native Android-first marketplace for Zambia. It connects customers with nearby providers using check-specific verification, reliable location data, controlled evidence, reviews and platform-tracked interactions.

The following are non-negotiable:

1. Version 1 is Android-only for customers and providers.
2. The internal operations portal may be web-based.
3. iOS implementation is deferred; portability is achieved through API and domain boundaries, not cross-platform UI.
4. Payment cannot purchase verification or a higher trust score.
5. No generic “safe”, “guaranteed”, “government-approved” or “100% verified” claim may be shown.
6. Sensitive identity, certificate, premises and exact-location evidence is private by default.
7. Public repository fixtures, screenshots and prototypes use synthetic data only.
8. Legal or regulatory assumptions must be marked for qualified Zambian review.

## 2. Read before changing anything

Read, in order:

1. `MASTER_BUILD_PLAN.md`
2. `PROJECT_STATUS.md`
3. `WORKSTREAM_LOCK.md`
4. `DECISION_LOG.md`
5. `DEFINITION_OF_DONE.md`
6. the relevant product, design, architecture, security and test documents
7. the latest commit history for the assigned phase

Do not infer current state from filenames alone. Verify the code, database migrations, automated checks and current documentation.

## 3. Single-lane workflow and GitHub lifecycle

The project uses one coherent implementation lane rather than unrelated feature branches.

- `main`: stable documentation, phase checkpoints, testable prototypes and release baselines.
- `build/android-v1`: sequential implementation lane.
- One agent owns an active task at a time.
- An agent claims work in `WORKSTREAM_LOCK.md` before editing.
- The previous agent must leave a complete handoff and clean working tree.
- Parallel read-only investigation is allowed; parallel writes are not.

The repository owner authorizes the active AI agent to manage the normal GitHub lifecycle without requiring manual owner clicks:

1. push coherent, tested work to `build/android-v1`;
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

1. **Orient** — read the control documents and current code.
2. **Verify** — run the existing validation commands before modifying files.
3. **Claim** — update `WORKSTREAM_LOCK.md` with scope and affected modules.
4. **Plan** — identify acceptance criteria, dependencies, migrations and tests.
5. **Implement** — make the smallest coherent change.
6. **Test** — run all relevant unit, integration, UI, security and documentation checks.
7. **Inspect** — review the diff for secrets, unrelated edits and policy violations.
8. **Document** — update specifications, decision log and API/data contracts where applicable.
9. **Commit** — create atomic commits with clear conventional messages.
10. **Checkpoint** — when the task gate is complete, create, verify and merge the checkpoint PR automatically.
11. **Resolve tracking** — update or close linked issues only when their acceptance evidence is complete.
12. **Handoff** — update `PROJECT_STATUS.md`, release the lock and identify the exact next approved task.

## 5. Change control

An agent may not silently change:

- approved technology choices;
- Android minimum or target SDK policy;
- API versioning;
- verification levels or status semantics;
- database identifiers or state machines;
- public/private location rules;
- trust-score inputs;
- evidence retention periods;
- subscription entitlements;
- user-role permissions;
- release workflow.

A change requires:

1. a documented reason;
2. alternatives considered;
3. security, privacy, migration and compatibility impact;
4. a new entry in `DECISION_LOG.md` or architecture decision record;
5. owner approval where the decision materially affects cost, trust or scope.

## 6. Coding expectations

- Kotlin and TypeScript must compile with warnings treated seriously.
- Domain rules must not live only in UI components.
- Backend authorization is mandatory even when Android hides an action.
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

## 7. Testing expectations

A task is incomplete without evidence appropriate to its risk:

- domain unit tests;
- database and API integration tests;
- Android ViewModel and Compose tests;
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
- proprietary third-party datasets.

Use `.env.example` with placeholders. Assume every committed byte is permanently public.

## 9. Completion evidence

Each handoff must state:

- task and phase;
- exact commit and merged checkpoint PR, when applicable;
- files/modules changed;
- migrations added;
- commands run and results;
- linked issues updated or closed;
- known limitations;
- security/privacy implications;
- next approved task;
- whether the working tree is clean.

Use `docs/operations/AGENT_HANDOFF_TEMPLATE.md`.

## 10. Stop conditions

Stop and document the blocker instead of guessing when:

- a legal requirement is unclear;
- a payment or mapping provider has not been approved;
- production credentials would be required;
- a migration could destroy data;
- verification policy conflicts with public copy;
- source documents are stale or contradictory;
- an existing failure cannot be isolated;
- the assigned phase is not authorized.