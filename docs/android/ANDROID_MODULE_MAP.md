# DIREKT Android Module Map

## Initial modules

| Module | Responsibility |
|---|---|
| `:app` | application, navigation shell, DI composition |
| `:core:model` | shared immutable domain models |
| `:core:designsystem` | themes/components/icons |
| `:core:network` | API client, auth, errors |
| `:core:database` | Room cache/drafts |
| `:core:datastore` | preferences/session metadata |
| `:core:security` | Keystore/encryption helpers |
| `:core:analytics` | privacy-reviewed events |
| `:core:testing` | fakes/fixtures |
| `:feature:auth` | onboarding/sign-in |
| `:feature:discover` | search/map/list/filter |
| `:feature:providerprofile` | public provider/trust detail |
| `:feature:enquiries` | customer/provider interaction |
| `:feature:reviews` | eligible reviews/reports |
| `:feature:provideronboarding` | provider profile/evidence |
| `:feature:verification` | check timeline/remediation |
| `:feature:providerdashboard` | provider overview |
| `:feature:account` | profile/security/preferences |
| `:feature:support` | tickets/help/safety |

## Dependency direction

Features depend on core contracts, not other feature implementations. Cross-feature navigation uses route contracts. Data interfaces live at appropriate stable boundary.

## Growth rule

Do not create a module for every screen. Split when ownership, build time or dependency boundaries justify it.
