# DIREKT Android Module Map

## Current Phase 2A module

| Module | State | Responsibility |
|---|---|---|
| `:app` | Implemented | Android entry point, Material 3 theme, navigation shell, customer/provider preview modes, synthetic foundation content and smoke tests |

Phase 2A intentionally begins with one Android application module. This avoids creating empty modules before there are stable contracts to protect.

Current source boundaries inside `:app`:

```text
com.kudzimusar.direkt
├── MainActivity.kt
└── ui
    ├── DirektApp.kt
    ├── DirektAppState.kt
    └── theme/DirektTheme.kt
```

`DirektAppState` is a presentation state holder only. It does not represent authentication, authorization, verification or server state.

## Planned modules

| Module | Responsibility | Introduction trigger |
|---|---|---|
| `:core:model` | shared immutable domain models | first stable backend/domain contracts |
| `:core:designsystem` | themes, reusable components and icons | components are reused across two or more features |
| `:core:network` | API client, authentication transport and errors | Phase 2B backend contract is approved |
| `:core:database` | Room cache and drafts | offline data model is approved |
| `:core:datastore` | preferences and safe session metadata | persistent settings are introduced |
| `:core:security` | Keystore/encryption helpers | approved sensitive local storage appears |
| `:core:analytics` | privacy-reviewed events | event taxonomy and consent controls are implemented |
| `:core:testing` | fakes, fixtures and shared test rules | multiple modules require shared test infrastructure |
| `:feature:auth` | onboarding and sign-in | authentication backend contract exists |
| `:feature:discover` | search, map, list and filters | discovery vertical slice begins |
| `:feature:providerprofile` | public provider and trust details | provider domain contract stabilizes |
| `:feature:enquiries` | customer/provider interaction | tracked enquiry API is approved |
| `:feature:reviews` | eligible reviews and reports | interaction eligibility rules exist |
| `:feature:provideronboarding` | profile and evidence workflow | evidence schema and upload contract exist |
| `:feature:verification` | check timeline and remediation | verification state machine is implemented |
| `:feature:providerdashboard` | provider overview | provider operational data exists |
| `:feature:account` | profile, security and preferences | account-management contracts exist |
| `:feature:support` | tickets, help and safety | support case model is implemented |

## Dependency direction

Features depend on stable core contracts, not on other feature implementations. Cross-feature navigation uses route contracts. Backend authority is never duplicated inside UI modules.

```text
app → feature contracts → domain/core contracts → data implementations
```

Platform implementations may depend on Android APIs; pure models and domain rules must not.

## Growth rule

Do not create a module for every screen. Split only when at least one of these is true:

- ownership or release boundaries differ;
- dependency direction needs enforcement;
- test isolation materially improves;
- build time benefits are measurable;
- a stable API/implementation boundary exists;
- a feature can be replaced without changing its consumers.

Empty placeholder modules are prohibited.
