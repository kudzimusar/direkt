# DIREKT Android UI Specification

## Purpose

Define the native Android presentation contract for the world-class VC1–VC8 modernization while preserving Jetpack Compose/Material 3, canonical backend authority, trust semantics, privacy, offline resilience and AI safety.

Read with:

- `docs/product/WORLD_CLASS_PRODUCT_AND_AI_PLAN.md`;
- `docs/design/VISUAL_COMPLETION_PLAN.md`;
- `docs/design/DESIGN_SYSTEM.md`;
- `docs/architecture/AI_PRODUCT_ARCHITECTURE.md`.

## Platform

- Kotlin;
- Jetpack Compose;
- Material 3;
- edge-to-edge layout;
- Navigation Compose;
- adaptive layouts using tested window-size behavior;
- Android system patterns over custom imitations;
- Android remains the primary Version 1 customer/provider client.

## Product composition

### Customer compact/mobile

Use a clear bottom-navigation model with approved vector icons and visible labels. Primary journey hierarchy:

1. Discover;
2. Saved/enquiries according to approved IA;
3. activity/notifications where implemented;
4. account/mode access.

Discover should prioritize service need, area, categories and relevant providers rather than development/status content.

### Provider compact/mobile

Use the same product Design DNA with a task-oriented workspace:

- readiness/next action;
- services/areas/availability;
- verification/evidence;
- enquiries;
- business/account/commercial state.

Trust/publication state and payment/commercial state remain visually distinct.

### Medium/expanded Android

Use adaptive navigation rail/two-pane composition where it improves task completion. Do not simply stretch a phone column across tablets/foldables.

Examples:

- results list + selected provider detail;
- provider inbox + enquiry detail;
- provider requirements + selected evidence task.

## Screen architecture

Each route owns:

- immutable UI state;
- user intents/events;
- side effects separated from state;
- ViewModel;
- navigation contract;
- loading/empty/error/offline states;
- AI unavailable/manual-fallback state where AI applies;
- analytics hooks;
- previews with synthetic/public-safe data;
- Compose UI tests for critical behaviour.

Composable functions must not directly perform network/database/model-provider work.

No Android client contains model-provider secrets, privileged prompts, unrestricted tool credentials or trust-decision logic.

## World-class visual rules

- Follow the owner-approved VC Design DNA after VC2.
- Use approved Material Symbols/vector iconography, never letter/glyph placeholders for production navigation.
- Use clear typography hierarchy rather than repeated equal-weight cards/text.
- Use provider/category/work imagery as contextual marketplace content, not as proof of trust.
- Present check-specific trust state with scope, currentness, date/expiry and limitations.
- Remove development/workstream/API/test language from production-facing UI.
- Keep primary task/action visible without oversized marketing hero content.
- Use whitespace, hierarchy and semantic surfaces rather than excessive borders/cards.

## Layout

- compact phones are primary;
- support larger phones/tablets/foldables without stretched single-column content;
- bottom-navigation labels remain visible where bottom nav is used;
- maps never obstruct essential list/filter access;
- map has an accessible list equivalent;
- sheets/dialogs respect system insets, predictive/back behaviour and keyboard/IME;
- sticky actions must not cover content at large text scales;
- operations-only desktop patterns are not copied into customer/provider Android.

## Discovery and AI need entry

Customer discovery supports:

- standard keyword/category search;
- manual/current area selection;
- optional bounded `Describe what you need` AI assistance when activated;
- clarifying questions as editable/confirmable suggestions;
- deterministic/manual category selection fallback;
- results that remain usable when AI is unavailable.

AI UI must distinguish:

1. user-entered facts;
2. AI suggestion/summary;
3. canonical public trust facts;
4. user-confirmed submission.

Do not let a sparkle/robot affordance imply correctness or authority.

## Results, provider cards and trust

Provider cards should support:

- public-safe work/premises thumbnail where available;
- provider/service identity;
- locality/service-area relevance;
- availability;
- concise current check-specific trust information;
- review summary only after approved threshold;
- clear primary action.

Provider profile hierarchy:

1. identity/service/locality/coverage;
2. check-specific trust summary/details;
3. availability and enquiry/contact action;
4. reviews/work imagery/supporting information.

AI `Why this result` or comparison summaries use public-safe approved facts and never replace the visible canonical trust cards.

## Forms

- validate on submit and appropriate field transitions;
- retain user input after recoverable errors;
- mask sensitive values;
- use camera/document capture guidance only when the required Android capability is approved/implemented;
- display upload size/type requirements before selection;
- never silently compress beyond readability;
- declarations require explicit acceptance;
- AI-generated draft text is editable and requires user confirmation before consequential submission/publication;
- never silently auto-fill high-impact declarations from model output.

## Provider onboarding and evidence

- show a clear readiness/next-action hierarchy;
- replace raw category keys, coordinate pairs and WKT with human-safe controls;
- explain why each requirement exists;
- show capture/upload/progress/retry/resume/correction states;
- separate public portfolio imagery from private evidence;
- machine-assisted quality/extraction feedback, when approved, is labelled as assistance and never as an approval.

## Permissions

- explain value before system prompt;
- request only at point of use;
- support denial and `don't ask again`;
- no background location in Version 1;
- camera/media choices follow current Android permission model and actual manifest/runtime status;
- notifications remain optional except the in-app centre as product source of truth;
- photo/voice AI input is not shown as active until the permission, model/data-processing and integration gates are genuinely active.

## Images

- Coil or approved repository image stack;
- server-generated thumbnails/variants;
- placeholder and retry;
- no evidence image in public cache;
- strip unnecessary metadata on approved upload path;
- cache public images with versioned URLs;
- provide low-bandwidth image tiers;
- meaningful content descriptions where imagery conveys information;
- decorative images remain non-semantic.

## Offline and resilience

Core customer/provider tasks must define:

- cached/stale state with timestamp where appropriate;
- retry;
- recoverable draft behavior;
- interrupted upload recovery;
- manual location/search fallback;
- AI unavailable/timeout fallback without blocking the core journey.

Never display an optimistic success state before durable acknowledgement for consequential writes.

## Themes

- light theme required;
- dark theme supported before public release unless an explicit product decision records a justified deferment;
- dynamic colour may be evaluated but must not weaken trust/status semantics or brand consistency;
- semantic state screenshot/visual tests cover light/dark where applicable.

## Accessibility

Required:

- TalkBack semantics;
- logical traversal/focus;
- 48dp-class touch targets;
- contrast;
- status not colour-only;
- 200% font scaling/reflow;
- reduced motion;
- map/list equivalence;
- form error announcement/focus;
- accessible labels for AI suggestion/confirmation/fallback states.

## Visual and test identifiers

Use stable semantic tags/accessibility content rather than implementation-specific coordinates.

For VC1–VC8, critical flagship screens must also record:

- approved design reference;
- device/window class;
- synthetic-safe screenshot or visual comparison;
- loading/empty/error/offline state evidence;
- accessibility state;
- deliberate Android-specific adaptation.

## Completion gate

An Android VC slice is complete only when:

- it matches the approved Design DNA with documented native adaptations;
- no canonical API/domain/trust rule moved into Compose;
- manual/non-AI fallback works for core AI-assisted flows;
- private evidence/location/contact boundaries remain intact;
- relevant unit/ViewModel/Compose/lint/assembly/accessibility checks pass on the exact head;
- applicable backend/OpenAPI regression remains green;
- synthetic-safe visual-reference evidence is recorded.