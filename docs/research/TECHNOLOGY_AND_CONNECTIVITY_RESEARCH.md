# DIREKT Technology and Connectivity Research

**Status:** Open; no final minimum SDK, device profile or network assumption approved.

## Decisions controlled

- minimum supported Android version;
- target device performance class;
- app download and update size budgets;
- image capture and compression rules;
- offline draft and sync requirements;
- upload retry/resume behaviour;
- map caching and low-bandwidth presentation;
- OTP/session recovery behaviour;
- accessibility and input methods;
- remote tester distribution feasibility.

## Participant data to collect

Collect only with consent and without device identifiers:

- manufacturer/model family or broad device class;
- Android version, if known;
- RAM/storage constraints described or observed;
- available storage band;
- camera capability and common image problems;
- screen size and font scaling;
- battery/charging reliability;
- number of SIMs and network switching;
- shared-device behaviour;
- primary connection type;
- data-bundle and Wi-Fi availability;
- frequency/duration of offline periods;
- app-update behaviour;
- digital confidence and accessibility needs.

Do not collect advertising IDs, IMEI, SIM serial numbers, contact lists or unrelated diagnostics.

## Field task set

Use synthetic content to measure:

1. open app from cold start;
2. select area/category;
3. load list and map results;
4. inspect provider and trust details;
5. create a structured enquiry;
6. capture two document pages and one premises photo;
7. interrupt the upload by disabling connectivity;
8. resume or correct the upload;
9. recover after process death or device restart;
10. enlarge text and navigate with accessibility settings where relevant.

## Metrics

Record bands rather than false precision during research:

- time to first useful content;
- search result load time;
- image upload time;
- data used per task;
- upload failure/retry count;
- storage required;
- steps requiring assistance;
- permission-denial recovery;
- completion rate;
- participant confidence;
- device heat/battery concern;
- offline recovery success.

## Design hypotheses to validate

- list view must remain useful when map tiles are unavailable;
- location can be manually selected without GPS;
- images should be compressed before upload while preserving evidence readability;
- uploads require persistent progress, retry and action-required states;
- provider onboarding must save drafts locally;
- customer search should cache recent areas/categories without presenting stale availability as current;
- large media should load only on demand;
- text and icons must remain usable with font scaling;
- notifications are helpful but cannot be the only way to retrieve status;
- phone-number changes need recovery and re-verification rules;
- shared-device sessions require explicit sign-out and privacy protection.

## Minimum SDK decision template

| Candidate minimum | Estimated coverage | Capability benefit | Exclusion risk | Security/maintenance impact | Evidence IDs |
|---|---|---|---|---|---|
| Pending |  |  |  |  |  |

The final decision must use observed target devices and current Android/Play requirements. It must not be copied from another project.

## Performance budgets to approve later

| Budget | Research input needed | Approved value |
|---|---|---|
| Initial download size | data-cost and storage findings | Pending |
| Cold start on low-end reference device | device sample | Pending |
| Search payload | bandwidth tests | Pending |
| Thumbnail size | readability/data trade-off | Pending |
| Evidence image upload | document readability tests | Pending |
| Offline draft storage | provider workflow | Pending |
| Retry backoff | connectivity patterns | Pending |

## Connectivity research questions

- Which mobile networks are used in the candidate area?
- How often do participants switch SIMs for cost or coverage?
- Is Wi-Fi available to providers?
- Are outages brief, frequent or prolonged?
- Can SMS arrive when mobile data is unavailable?
- Are OTP delays or recycled numbers common concerns?
- Are data bundles purchased daily, weekly or monthly?
- Do users disable background data?
- Do app stores update automatically?
- Are devices shared between business staff or household members?

## Remote testing sequence

1. static synthetic prototype through GitHub Pages;
2. Android CI artifact to the core technical team;
3. Firebase App Distribution after package-name and credentials approval;
4. controlled low-end device cohort;
5. Google Play internal/closed testing later.

Firebase distribution is not a substitute for field device coverage; testers need Google/Firebase access and may differ from ordinary users.

## Exit requirement

Phase 1A must produce enough evidence to define constraints for Phase 1B prototypes. Final build values may be fixed in Phase 2 only after observed device data, prototype performance and current platform requirements are reviewed.