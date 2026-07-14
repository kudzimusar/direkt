# DIREKT Responsive Admin Design

## Primary devices

Desktop/laptop is primary for evidence review. Tablet and mobile layouts support field operations and urgent triage, not every administrative function.

## Breakpoints and layout

- desktop: navigation sidebar, queue, detail split view;
- tablet: collapsible navigation, queue-to-detail flow;
- mobile: task-focused single column for field assignments/incident acknowledgment.

## Queue design

Columns:

- case/reference;
- provider/check;
- risk/priority;
- age/SLA;
- evidence completeness;
- assignment;
- status.

Filters and saved views must not hide critical overdue cases.

## Evidence viewer

- private-access banner;
- watermark/reference if required;
- zoom/rotate without default download;
- metadata in separate structured panel;
- previous versions;
- decision checklist;
- access audit;
- automatic session timeout appropriate to risk.

## Decision design

- decision buttons separated from navigation;
- reason code required for action/rejection/revocation;
- confirmation for high-impact actions;
- four-eyes flow where policy requires;
- public provider message preview;
- internal notes clearly marked;
- no free-text-only decision.

## Field workflow

Responsive assignment list, provider identity confirmation, safety details, navigation link, offline draft, photo guidance, structured checklist and explicit submit.
