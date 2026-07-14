# DIREKT Android Product Specification

## Scope

One native Android application provides customer and provider modes. Operations portal is not bundled into the consumer app, except a later dedicated field-agent experience if approved.

## Platform baseline

- Kotlin;
- Jetpack Compose/Material 3;
- min SDK provisionally 24 pending Zambia device research;
- compile/target SDK set to current stable and Play requirements at implementation/release;
- portrait-first, adaptive landscape/tablet support;
- English initial language with localization-ready resources.

## Application capabilities

### Shared
Authentication, session/device management, consent, notifications, account, support and mode switching.

### Customer
Area/category discovery, map/list, provider/trust profile, saves, enquiries, contact handoff, reviews and reports.

### Provider
Resumable onboarding, services/areas, evidence capture/upload, verification timeline, availability, enquiries, reviews, subscription and members.

## Data usage

- show data-size-aware images;
- no continuous location;
- explain camera/location/notification use;
- cache only necessary public/own data;
- private evidence in app-private temporary storage;
- wipe appropriate data on logout/account removal.

## Safety

- private address never displayed due to client guess;
- backend supplies public-safe location;
- external call/message warning;
- block/report;
- no “verified” client inference;
- screenshot/screen-security policy assessed for evidence capture.

## Release channels

Local/debug → internal test → closed Play test → open test where appropriate → staged production.

## Acceptance

Critical journeys pass on device matrix, offline transitions, TalkBack and current Play policy checks.
