# DIREKT Responsive Operations and Admin Design

## Purpose

Define the world-class privileged operations experience for verification, evidence, field work, complaints, incidents, reviews, commercial exceptions, audit and system health.

The operations portal is not a generic SaaS dashboard and must not imitate the customer marketplace UI. It shares DIREKT brand/trust semantics while optimizing for secure evidence review, decision quality, speed, keyboard efficiency and auditability.

Read with:

- `docs/product/WORLD_CLASS_PRODUCT_AND_AI_PLAN.md`;
- `docs/design/VISUAL_COMPLETION_PLAN.md`;
- `docs/design/DESIGN_SYSTEM.md`;
- `docs/architecture/AI_PRODUCT_ARCHITECTURE.md`.

## Primary devices

Desktop/laptop is primary for evidence review and consequential decisions.

Tablet supports selected queue/case/field tasks.

Mobile supports field operations, incident acknowledgement and bounded urgent triage, not every administrative function.

Never squeeze a desktop evidence table/viewer into a narrow mobile canvas.

## Core desktop composition

Primary verification workflow:

```text
┌────────────────┬────────────────────────┬─────────────────────────────┐
│ Queue / Saved  │ Case / Check Context   │ Evidence + Decision         │
│ Views          │                        │                             │
│                │ Provider facts         │ Secure evidence viewer      │
│ Priority/SLA   │ Requirement/policy     │ Metadata/history            │
│ Assignment     │ Trust/publication      │ Checklist/reasons            │
│ Filters        │ Timeline/audit          │ Decision/escalation          │
└────────────────┴────────────────────────┴─────────────────────────────┘
```

Pane widths may adapt, but the reviewer must retain context between queue, canonical facts, evidence and action.

## Navigation and information architecture

Primary groups may include, according to role:

- Mission Control;
- Verification;
- Field;
- Providers;
- Complaints/Incidents;
- Reviews/Appeals;
- Commercial/Reconciliation;
- Reporting;
- Configuration;
- Audit;
- System Health.

Navigation visibility is convenience only. Server-side authorization remains authoritative.

Do not expose development stage/workstream/API route labels in production-facing navigation or case content.

## Responsive layout

### Desktop/expanded

- persistent navigation sidebar;
- queue + case + evidence/decision multi-pane where task benefits;
- resizable/controlled panes only if accessibility and persistence are tested;
- keyboard shortcuts limited to safe, discoverable actions;
- high-risk action cannot be triggered by a single accidental shortcut.

### Tablet/medium

- collapsible navigation;
- queue → detail with optional secondary evidence pane;
- preserve case identity/context when switching panes;
- touch targets remain 44–48 CSS px class.

### Mobile/compact

Task-focused single column for:

- field assignments;
- visit/checklist tasks;
- urgent incident acknowledgement;
- bounded triage/status review;
- safe escalation/contact actions.

Final evidence decisions, dense reconciliation and broad configuration remain desktop/tablet tasks unless explicitly redesigned and authorized.

## Mission Control

Dashboard prioritizes operational action, not decorative metrics.

Show, role-permitting:

- overdue/SLA-risk verification cases;
- action-required/resubmission backlog;
- expiring claims/evidence;
- serious complaints/incidents;
- field assignments requiring attention;
- review/appeal backlog;
- payment/reconciliation exceptions only when active;
- integration/system queue health;
- clear ownership and next action.

Metrics link to the exact filtered work queue.

## Queue design

Columns/fields as applicable:

- case/reference;
- provider/check;
- priority/severity/risk;
- age/SLA;
- evidence completeness;
- assignment/owner;
- status;
- updated time.

Requirements:

- fast filtering/search/saved views;
- overdue/critical items cannot be accidentally hidden by default views;
- bulk actions are narrowly scoped and confirmation-protected;
- row selection and keyboard focus remain distinct;
- queue data never exposes evidence contents.

## Case workspace

Case header provides:

- provider/check identity;
- pathway/category/requirement version;
- current canonical state;
- publication impact where relevant;
- assignment/SLA;
- escalation status.

Case body provides:

- canonical provider/check facts;
- timeline/history;
- current and prior evidence versions as authorized;
- related field/registry context where authorized;
- prior immutable decisions;
- linked complaint/review/incident context only when role/purpose permits.

## Secure evidence viewer

- private-access banner;
- synthetic-only committed visual fixtures;
- watermark/reference if required;
- zoom/rotate without default download;
- metadata in a separate structured panel;
- previous versions with explicit version labels;
- decision/checklist context accessible without losing evidence position;
- access audit;
- short-lived/revocable access contract;
- automatic session timeout appropriate to risk;
- no persistent public URL;
- no evidence copied into AI prompts/models unless that exact use case is separately approved.

## Decision design

- decision buttons separated from navigation/low-risk controls;
- reason code required where policy requires;
- no free-text-only final decision;
- confirmation for high-impact actions;
- four-eyes/supervisor flow where policy requires;
- provider-safe message preview;
- internal notes clearly marked and access-controlled;
- current evidence/checklist status visible before final action;
- decisions remain human/deterministic and auditable.

AI may draft provider-safe wording or highlight missing/conflicting items, but cannot enable or select a final outcome automatically.

## AI operations copilot

AI is a secondary assistive layer embedded beside canonical case data.

Allowed patterns, when the specific use case is activated:

- case-history summary;
- evidence metadata/field candidate summary;
- missing-checklist suggestions;
- inconsistency highlights;
- draft action-required explanation;
- complaint/review history summary;
- risk/anomaly advisory signals;
- audit/search assistance.

Visual rules:

- clearly label AI-generated synthesis;
- show canonical/source facts separately;
- make uncertainty/conflict visible;
- provide refresh/retry/manual fallback;
- allow human correction/editing;
- never style an AI suggestion like an approved decision;
- never hide source evidence behind an AI summary.

Authority rules:

AI cannot autonomously approve, reject, revoke, suspend, decide appeals/serious complaints, alter roles, move money or execute high-risk overrides.

Every tool/action is re-authorized by the backend and requires human confirmation where consequential.

## Complaints, incidents and appeals

Design for seriousness and procedural clarity:

- severity/SLA/owner prominent;
- immediate-danger guidance distinct from platform case handling;
- chronology and evidence separated from allegations/conclusions;
- provider/customer-safe communications controlled;
- interim restrictions clearly distinguished from final decisions;
- appeal history visible to authorized reviewers;
- AI summaries never become factual findings.

## Field workflow

Responsive field flow includes:

- assignment list;
- provider identity confirmation;
- safety details;
- approved navigation link;
- appointment/arrival/departure states;
- offline draft;
- photo/evidence guidance;
- structured checklist;
- explicit submit;
- sync/retry/conflict state.

Field observations are advisory evidence and cannot create public trust claims directly.

## Commercial, reporting and configuration

- commercial/payment state uses a visual family distinct from trust;
- reconciliation views display ledger/provider facts without implying trust;
- configuration changes are versioned/audited;
- taxonomy/evidence-rule changes require explicit governance;
- AI may propose trends or taxonomy improvements but cannot mutate configuration automatically;
- exports remain purpose/role restricted.

## Accessibility and efficiency

Required:

- complete keyboard access for desktop work;
- visible focus and logical order;
- screen-reader semantics;
- 200% zoom/reflow without losing critical actions;
- status not colour-only;
- 44–48 CSS px-class targets for touch-capable layouts;
- non-hover alternatives;
- no auto-advancing evidence/decision state;
- reduced-motion support;
- clear destructive/high-impact confirmations.

## Privacy and security presentation

- display only role/purpose-authorized data;
- mask/minimize sensitive identifiers unless operationally necessary;
- exact private coordinates appear only where the authorized task requires them;
- evidence and private notes never appear in public screenshots/fixtures;
- environment status is present where necessary but visually secondary;
- no direct privileged database/Supabase path;
- no client-held model-provider secrets/prompts.

## Visual completion evidence

For VC6/VC8 record synthetic-safe references for:

- mission control;
- verification queue;
- case/evidence/decision workspace;
- action-required/resubmission;
- complaint/incident;
- field compact flow;
- audit/history;
- loading/empty/error/session-expired states;
- AI active/fallback state where applicable;
- keyboard/focus and large-text/zoom behavior.

## Completion gate

An operations slice is complete only when:

- it follows approved Design DNA with appropriate operations density;
- reviewer context is clearer and safer than the current prototype/test-harness presentation;
- evidence access/authz/audit boundaries remain intact;
- AI remains advisory and human accountability is explicit;
- applicable portal/backend/database/OpenAPI/security/accessibility/AI-evaluation tests pass on the exact head;
- synthetic-safe visual-reference evidence is recorded.