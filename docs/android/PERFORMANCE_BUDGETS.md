# DIREKT Android Performance Budgets

Budgets are initial targets and must be measured on pilot devices.

| Area | Initial target |
|---|---|
| Warm usable start | ≤ 2 seconds median pilot device |
| Cold usable start | ≤ 4 seconds median pilot device |
| Frame rendering | no sustained jank in critical lists/maps |
| APK/AAB growth | reviewed per feature; unnecessary SDKs rejected |
| Search first result | API/network dependent; progressive feedback by 1 second |
| Public thumbnail | size-tiered and compressed |
| Memory | no evidence bitmap retained at full size unnecessarily |
| Battery | no continuous/background location; bounded workers |
| Data | list text/trust loads before large images |
| ANR/crash | within current Play quality expectations, with stricter internal trend gate |

## Practices

Baseline profiles after measurement, lazy lists, paging, image downsampling, cancellation, database indexes, startup dependency control and release monitoring.

Performance regressions in discovery, evidence upload or sign-in block release.
