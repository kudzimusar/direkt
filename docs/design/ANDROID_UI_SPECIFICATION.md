# DIREKT Android UI Specification

## Platform

- Kotlin;
- Jetpack Compose;
- Material 3;
- edge-to-edge layout;
- Navigation Compose;
- adaptive layout where device width permits;
- Android system patterns over custom imitations.

## Screen architecture

Each route owns:

- immutable UI state;
- user intents/events;
- side effects separated from state;
- ViewModel;
- navigation contract;
- loading/empty/error/offline states;
- analytics hooks;
- previews with synthetic data;
- Compose UI tests for critical behaviour.

Composable functions must not directly perform network/database work.

## Layout

- compact phones are primary;
- support larger phones/tablets without stretched single-column content;
- use navigation rail only after adaptive testing;
- bottom navigation labels remain visible;
- maps never obstruct essential list/filter access;
- sheets/dialogs respect system insets and back behaviour.

## Forms

- validate on submit and appropriate field transitions;
- retain user input after recoverable errors;
- mask sensitive values;
- use camera/document capture guidance;
- display upload size/type requirements before selection;
- never silently compress beyond readability;
- declarations require explicit acceptance.

## Permissions

- explain value before system prompt;
- request only at point of use;
- support denial and “don’t ask again”;
- no background location in Version 1;
- camera/media choices follow current Android permission model;
- notifications are optional except in-app centre.

## Images

- Coil;
- server-generated thumbnails;
- placeholder and retry;
- no evidence image in public cache;
- strip unnecessary metadata on approved upload path;
- cache public images with versioned URLs.

## Themes

- light theme required;
- dark theme supported before public release unless product decision records a justified deferment;
- dynamic colour evaluated but must not weaken trust semantics;
- screenshot tests cover semantic status states.

## Test identifiers

Use stable semantic tags/accessibility content rather than implementation-specific coordinates.
