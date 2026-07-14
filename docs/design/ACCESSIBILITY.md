# DIREKT Accessibility

## Standard

DIREKT targets inclusive Android and web experiences consistent with platform accessibility guidance and WCAG 2.2 AA principles where applicable.

## Android requirements

- meaningful TalkBack labels and traversal;
- no status conveyed only by colour;
- 48dp touch targets;
- content scales without clipping at large font settings;
- list alternative to every map;
- keyboard/switch navigation considered;
- system back and focus restoration work;
- input labels persist beyond placeholder text;
- errors are associated with fields and announced;
- countdowns allow retry and do not create unnecessary pressure;
- motion respects preferences;
- images have descriptions where informative;
- decorative imagery is ignored by assistive technology.

## Cognitive and literacy support

- short sentences;
- concrete check names;
- explain technical terms;
- progressive disclosure;
- consistent button labels;
- one primary next action;
- visible progress in provider onboarding;
- examples for evidence capture;
- avoid shame-based rejection wording.

## Web operations portal

- keyboard-accessible queues and evidence controls;
- visible focus;
- semantic tables/forms;
- zoom and responsive use;
- evidence image controls with labels;
- no hover-only actions;
- status text and icon;
- safe timeout warnings.

## Testing

- automated lint/accessibility scans;
- manual TalkBack pass on critical Android flows;
- manual keyboard pass for operations;
- font scale and display size tests;
- colour contrast checks;
- user research including participants with disabilities when feasible.

Accessibility defects blocking trust comprehension are release-blocking.
