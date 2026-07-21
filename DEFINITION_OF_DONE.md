# DIREKT Definition of Done

“Done” means implemented, verified, documented, secure enough for its stage and operable by the next responsible person. Code existing in a branch is not completion.

## Universal task completion

A task is done only when:

- acceptance criteria are demonstrably met;
- relevant automated tests pass;
- failure and negative cases are covered;
- authorization is enforced server-side;
- security, privacy, accessibility and offline impact are reviewed;
- migrations are forward-only and tested;
- API/data/design/AI documents match behaviour;
- no secrets or real personal data are committed;
- the diff contains no unrelated changes;
- an atomic commit exists;
- `PROJECT_STATUS.md` and the handoff identify the next task;
- the workstream lock is released.

## Android feature completion

- UI follows `design.md`, `docs/design/DESIGN_SYSTEM.md`, the approved VC Design DNA and Material 3 rules.
- Loading, empty, error, permission-denied and offline states exist.
- State survives expected configuration/process conditions.
- TalkBack semantics, 48dp-class touch targets, contrast and 200% font scaling/reflow are checked.
- Network and local-storage behaviour is tested.
- Analytics events contain no sensitive evidence.
- Screens do not claim verification beyond backend-derived facts.
- Device-matrix impact is recorded.
- Production-facing UI contains no developer/workstream/API labels or primitive placeholder icons.
- Applicable screens have synthetic-safe visual-reference evidence.

## Web/PWA feature completion

- Uses canonical API/BFF/session boundaries and does not bypass backend authorization.
- Responsive behavior is intentional across compact/medium/expanded layouts.
- Keyboard, focus, screen-reader and 200% scaling behavior are checked.
- Loading, empty, error, offline/cache and retry states exist.
- Service-worker/cache behavior does not retain prohibited private material.
- Android parity is preserved where the feature is shared.
- Approved visual-reference evidence exists for VC work.

## Operations feature completion

- Authorization is role/scope enforced server-side.
- Desktop evidence-review work is not reduced to an unsafe mobile/table layout.
- Queue, case, evidence, decision and audit context remain clear.
- Private evidence access is short-lived/audited/revocable where required.
- Keyboard/focus/accessibility is checked.
- AI assistance, where present, remains visually and functionally secondary to canonical facts and human decisions.

## Backend feature completion

- OpenAPI contract exists and is versioned.
- Validation, authentication, authorization and rate limits are considered.
- Idempotency exists for retried writes where required.
- Database constraints defend critical invariants.
- Audit events cover privileged and trust-affecting actions.
- Structured errors use the common problem-details shape.
- Unit and integration tests include cross-tenant/cross-role denial.
- Observability does not log secrets, documents or precise private location.

## Verification feature completion

- Required evidence and check scope are explicit.
- Valid state transitions are enforced.
- Reviewer action requires reason codes where applicable.
- Decision history is immutable/auditable.
- Expiry, revocation and resubmission are handled.
- Public copy states exactly what was checked and what was not.
- Payment cannot influence the result.
- Evidence access controls are tested.
- AI assistance cannot directly create/approve/reject/revoke/suspend a public trust claim.

## AI feature completion

An AI feature is not done because a model returns a plausible demo.

Required:

- source-controlled use-case purpose and human-decision boundary;
- allowed/prohibited data classes documented;
- backend-owned model/provider integration; no client-held secrets;
- model/provider/version and prompt/template version recorded;
- manual/deterministic fallback exists for core tasks;
- structured output is schema-validated where application logic consumes it;
- every tool/function call is allow-listed and server-authorized;
- evaluation dataset exists using synthetic or explicitly approved data;
- offline quality/grounding thresholds pass;
- prompt-injection/indirect-injection tests pass;
- sensitive-information disclosure tests pass;
- excessive-agency/tool-authorization tests pass where tools exist;
- fairness/bias slices are evaluated where the use case can affect ranking/triage;
- cost/latency/rate limits exist;
- observability and kill switch exist;
- user disclosure/confirmation is present where AI materially shapes a recommendation or submitted content;
- no restricted evidence is sent to an unapproved model/provider;
- exact-head affected-platform regression passes.

## Visual/VC feature completion

For VC1–VC8 work:

- implementation matches the approved Design DNA/reference with documented platform adaptations;
- typography, iconography, imagery and spacing are coherent;
- trust remains check-specific and proof-led;
- payment/commercial styling cannot be mistaken for verification;
- responsive/adaptive layouts are intentional;
- loading/empty/error/offline/AI-fallback states are represented;
- accessibility gates pass;
- low-bandwidth behavior is tested;
- synthetic-safe screenshots/visual comparisons are recorded;
- no real participant/evidence/private-coordinate data appears in visual fixtures;
- predecessor Android/backend/database/OpenAPI/PWA/operations/security gates remain green.

## Documentation completion

- one H1 title;
- purpose and intended audience;
- concrete rules and examples;
- no unresolved placeholder text for blocking requirements;
- links resolve in the Pages build;
- terminology matches `GLOSSARY.md` where applicable;
- decisions are linked to source requirements;
- world-class/VC/AI direction is reconciled where the change affects it;
- documentation validation passes.

## Phase/workstream completion

A phase/workstream additionally requires:

- all deliverables present;
- exit criteria signed off;
- risks and decisions updated;
- no open critical/high defect unless owner formally accepts it;
- a stable checkpoint on `main`;
- test/evaluation/visual evidence and release notes as applicable;
- next phase/workstream explicitly authorized.

VC2 requires explicit owner design approval. VC8 completion does not automatically authorize Phase 11 real pilot or Phase 12 production release.

## Release completion

- signed artifacts are reproducible;
- current Play policies are checked;
- data-safety and privacy declarations match behaviour;
- backup/restore has been demonstrated;
- incident and rollback procedures are tested;
- support and verification operations are staffed;
- monitoring and alerts are active;
- staged rollout and stop criteria are documented;
- any production AI capability has approved provider/data processing, evaluations, security evidence, monitoring, fallback/kill switch and human-accountability boundaries.