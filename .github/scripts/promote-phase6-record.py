from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one match, found {count}")
    return text.replace(old, new, 1)


status_path = Path("PROJECT_STATUS.md")
status = status_path.read_text()
status = replace_once(
    status,
    "**Updated:** 2026-07-15  ",
    "**Updated:** 2026-07-16  ",
    "project status date",
)
status = replace_once(
    status,
    "**Current programme state:** Phase 5 Android customer discovery is complete and stable. Phase 6 Android provider workspace is active under Issue #25.",
    "**Current programme state:** Phase 5 Android customer discovery is complete and stable. Phase 6 Android provider workspace is review-complete on an exact green implementation head and is awaiting final record validation and merge through PR #26.",
    "project programme state",
)
status = replace_once(
    status,
    "| Phase 6 Android provider workspace | Active; Issue #25 |",
    "| Phase 6 Android provider workspace | Review complete; PR #26 final record validation pending |",
    "phase 6 status row",
)
status = replace_once(
    status,
    "Issue #25 is the sole active implementation tracker. Issue #5 remains a deliberate later validation obligation and is not a current implementation blocker.",
    "Issue #25 remains the sole active implementation tracker until PR #26 merges. Issue #5 remains a deliberate later validation obligation and is not a current implementation blocker.",
    "active issue line",
)
phase6_record = r'''

### Phase 6 — Android provider workspace

```text
PR #26
reviewed implementation head: aa10d727091c4e742f0a26c41b00daa07c5000ad
merge commit: pending final record validation
Issue #25: pending automatic closure on merge
```

Exact reviewed-head evidence:

| Gate | Run | Result | Artifact SHA-256 |
|---|---:|---|---|
| Backend/PostGIS | #484 | Passed | `03f3997a885482443f74e0a5ce7c2a349c8068d00572d9aae4dcb97f0ab8462c` |
| Android reports | #274 | Passed | `17937634afd4030b039d1de8b1155d483042892af51c053887e0e534027ffe0e` |
| Operations portal | #259 | Passed | `a24e51790fcfda7d28398be71dffd033a84287497b71e30e8929021bc0fc6790` |
| Documentation quality | #850 | Passed | `8b274470105372b1ed9c8e5b255d5693dec7350e3caa636ae22a06c25564e6d6` |

Retained Android artifacts:

| Artifact | SHA-256 |
|---|---|
| Debug APK | `bc5ea200789d66554fbd6ec213ee827c4012743c622fbc1fd07c68814a4c8952` |
| Compose test APK | `c4ec8ce2d659527a55a1b4ba9414dc65846993ae2f257b7a3aff684c0b1f199c` |

Phase 6 delivers actor-resolved provider scope, profile/services/location and availability management, private case/check-specific evidence capture, idempotent interrupted-upload recovery, provider-safe verification timeline, explicit Phase 8/9 read-only boundaries, native Android provider states, aggregate operations visibility and regression-tested confirmation/publication/privacy controls.
'''
status = replace_once(
    status,
    "\n## Active Phase 6 scope\n",
    phase6_record + "\n## Phase 6 delivered scope\n",
    "phase 6 checkpoint insertion",
)
status_path.write_text(status)

lock_path = Path("WORKSTREAM_LOCK.md")
lock = lock_path.read_text()
lock = replace_once(lock, "| Status | CLAIMED |", "| Status | FINAL_VALIDATION |", "lock status")
lock = replace_once(
    lock,
    "| Task | Implement provider-scoped workspace contracts, profile/services/service areas, evidence capture, verification timeline, availability, recoverable uploads and bounded future-feature surfaces |",
    "| Task | Validate the promoted Phase 6 programme record, merge reviewed PR #26, close Issue #25 and synchronize the implementation branch |",
    "lock task",
)
lock = replace_once(
    lock,
    "| Expected handoff | Reviewed synthetic provider workspace with server-resolved scope, private case/check evidence capture, safe verification timeline, independent availability, idempotent upload recovery, bounded Phase 8/9 placeholders and green permanent CI |",
    "| Expected handoff | Merged and recorded provider workspace with server-resolved scope, private evidence recovery, safe timeline, independent availability, bounded Phase 8/9 surfaces and synchronized branches |",
    "lock handoff",
)
lock = replace_once(
    lock,
    "| Last clean checkpoint | `11541db4d5ea856404f8fee03c0ca55cf6bab36c` |\n| Governing issue | Issue #25 |",
    "| Last clean checkpoint | `11541db4d5ea856404f8fee03c0ca55cf6bab36c` |\n| Reviewed implementation head | `aa10d727091c4e742f0a26c41b00daa07c5000ad` |\n| Governing issue | Issue #25 |",
    "lock reviewed head",
)
review_evidence = r'''

## Reviewed checkpoint evidence

The Phase 6 implementation was reviewed and verified on exact source head `aa10d727091c4e742f0a26c41b00daa07c5000ad`.

| Gate | Run | Result | Artifact SHA-256 |
|---|---:|---|---|
| Backend/PostGIS | #484 | Passed | `03f3997a885482443f74e0a5ce7c2a349c8068d00572d9aae4dcb97f0ab8462c` |
| Android reports | #274 | Passed | `17937634afd4030b039d1de8b1155d483042892af51c053887e0e534027ffe0e` |
| Operations portal | #259 | Passed | `a24e51790fcfda7d28398be71dffd033a84287497b71e30e8929021bc0fc6790` |
| Documentation quality | #850 | Passed | `8b274470105372b1ed9c8e5b255d5693dec7350e3caa636ae22a06c25564e6d6` |

Review findings are recorded in `docs/testing/PHASE_6_REVIEW_REGRESSIONS.md`. The current mutation promotes only the programme record and lock state; permanent CI must pass again on the resulting exact head before merge.
'''
lock = replace_once(
    lock,
    "\n## Acceptance criteria\n",
    review_evidence + "\n## Acceptance criteria\n",
    "lock evidence insertion",
)
lock_path.write_text(lock)
