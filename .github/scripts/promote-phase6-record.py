from pathlib import Path
import re


REVIEWED_HEAD = "aa10d727091c4e742f0a26c41b00daa07c5000ad"


status_path = Path("PROJECT_STATUS.md")
status = status_path.read_text()
status = re.sub(r"\*\*Updated:\*\* \d{4}-\d{2}-\d{2}  ", "**Updated:** 2026-07-16  ", status, count=1)
status = re.sub(
    r"\*\*Current programme state:\*\*.*",
    "**Current programme state:** Phase 5 Android customer discovery is complete and stable. Phase 6 Android provider workspace is review-complete on an exact green implementation head and is awaiting final record validation and merge through PR #26.",
    status,
    count=1,
)
status = re.sub(
    r"\| Phase 6 Android provider workspace \|.*\|",
    "| Phase 6 Android provider workspace | Review complete; PR #26 final record validation pending |",
    status,
    count=1,
)
status = re.sub(
    r"Issue #25 .*?Issue #5 remains a deliberate later validation obligation and is not a current implementation blocker\.",
    "Issue #25 remains the sole active implementation tracker until PR #26 merges. Issue #5 remains a deliberate later validation obligation and is not a current implementation blocker.",
    status,
    count=1,
)
phase6_record = f'''

### Phase 6 — Android provider workspace

```text
PR #26
reviewed implementation head: {REVIEWED_HEAD}
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
if "### Phase 6 — Android provider workspace" not in status:
    marker = "\n## Active Phase 6 scope\n"
    if marker not in status:
        raise RuntimeError("Phase 6 scope marker was not found in PROJECT_STATUS.md")
    status = status.replace(marker, phase6_record + "\n## Phase 6 delivered scope\n", 1)
else:
    status = status.replace("\n## Active Phase 6 scope\n", "\n## Phase 6 delivered scope\n", 1)
status_path.write_text(status)

lock_path = Path("WORKSTREAM_LOCK.md")
lock = lock_path.read_text()
lock = re.sub(r"\| Status \| .*? \|", "| Status | FINAL_VALIDATION |", lock, count=1)
lock = re.sub(
    r"\| Task \| .*? \|",
    "| Task | Validate the promoted Phase 6 programme record, merge reviewed PR #26, close Issue #25 and synchronize the implementation branch |",
    lock,
    count=1,
)
lock = re.sub(
    r"\| Expected handoff \| .*? \|",
    "| Expected handoff | Merged and recorded provider workspace with server-resolved scope, private evidence recovery, safe timeline, independent availability, bounded Phase 8/9 surfaces and synchronized branches |",
    lock,
    count=1,
)
if "| Reviewed implementation head |" not in lock:
    lock = re.sub(
        r"(\| Last clean checkpoint \| `[^`]+` \|\n)",
        rf"\1| Reviewed implementation head | `{REVIEWED_HEAD}` |\n",
        lock,
        count=1,
    )
review_evidence = f'''

## Reviewed checkpoint evidence

The Phase 6 implementation was reviewed and verified on exact source head `{REVIEWED_HEAD}`.

| Gate | Run | Result | Artifact SHA-256 |
|---|---:|---|---|
| Backend/PostGIS | #484 | Passed | `03f3997a885482443f74e0a5ce7c2a349c8068d00572d9aae4dcb97f0ab8462c` |
| Android reports | #274 | Passed | `17937634afd4030b039d1de8b1155d483042892af51c053887e0e534027ffe0e` |
| Operations portal | #259 | Passed | `a24e51790fcfda7d28398be71dffd033a84287497b71e30e8929021bc0fc6790` |
| Documentation quality | #850 | Passed | `8b274470105372b1ed9c8e5b255d5693dec7350e3caa636ae22a06c25564e6d6` |

Review findings are recorded in `docs/testing/PHASE_6_REVIEW_REGRESSIONS.md`. The current mutation promotes only the programme record and lock state; permanent CI must pass again on the resulting exact head before merge.
'''
if "## Reviewed checkpoint evidence" not in lock:
    marker = "\n## Acceptance criteria\n"
    if marker not in lock:
        raise RuntimeError("Acceptance criteria marker was not found in WORKSTREAM_LOCK.md")
    lock = lock.replace(marker, review_evidence + marker, 1)
lock_path.write_text(lock)
