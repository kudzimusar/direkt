# Phase 6 review regressions

Phase 6 was reviewed before merge against the server-owned provider scope, private evidence, publication, location and future-phase boundaries. Valid findings were repaired with permanent regressions rather than waived.

## Reviewed implementation head

```text
aa10d727091c4e742f0a26c41b00daa07c5000ad
```

| Gate | Run | Result | Artifact SHA-256 |
|---|---:|---|---|
| Backend/PostGIS | #484 | Passed | `03f3997a885482443f74e0a5ce7c2a349c8068d00572d9aae4dcb97f0ab8462c` |
| Android reports | #274 | Passed | `17937634afd4030b039d1de8b1155d483042892af51c053887e0e534027ffe0e` |
| Operations portal | #259 | Passed | `a24e51790fcfda7d28398be71dffd033a84287497b71e30e8929021bc0fc6790` |
| Documentation quality | #850 | Passed | `8b274470105372b1ed9c8e5b255d5693dec7350e3caa636ae22a06c25564e6d6` |

Retained Android packages:

| Artifact | SHA-256 |
|---|---|
| Debug APK | `bc5ea200789d66554fbd6ec213ee827c4012743c622fbc1fd07c68814a4c8952` |
| Compose test APK | `c4ec8ce2d659527a55a1b4ba9414dc65846993ae2f257b7a3aff684c0b1f199c` |

## Closed findings

### Evidence confirmation accepted an unrelated case

The original confirmation flow relied on provider-level scope but did not require the selected verification case to match the evidence requirement and active case lifecycle.

The database trigger now requires:

- an existing case and evidence item;
- identical provider and requirement scope;
- case status `awaiting_evidence` or `correction_required`.

A mismatch raises inside the confirmation transaction, rolling back the evidence item, immutable version, case link and upload-session completion. `evidence-confirmation-scope.e2e.spec.ts` proves both rollback and the valid matching path.

### Timeline read evidence metadata from the mutable item

Evidence class, expiry and submission time belong to the immutable evidence version, not `evidence.items`. The provider timeline now joins `items.current_version_id` to `evidence.versions` and derives safe metadata from that version.

The timeline regression proves the event is returned without reviewer identity, private rationale, object key or document content.

### Upload fixtures bypassed the provider lifecycle

The recoverable-upload fixture initially created an awaiting-evidence case while its provider remained in draft. The fixture now transitions the synthetic provider to `ready_for_verification` through the real state-transition endpoint before opening the case.

This retains the production lifecycle rather than weakening the case guard.

### Privacy assertions matched explicit non-exposure flags

Several serialization tests searched for broad words such as `objectKey` or `privateRationale`, which also appeared in fields explicitly set to `false` to document non-exposure.

The assertions now reject actual serialized private-field keys while allowing the explicit safety flags. This avoids false failures without reducing the privacy boundary.

### Operations overstated publication eligibility

The aggregate operations projection originally counted a selected service with current claims but did not fully mirror the discovery publication policy.

`publicationEligibleServices` now also requires:

- provider status `ready_for_verification`;
- an existing location record and service area;
- mobile operating model or a consented public-premises point;
- the current selected requirement version;
- current mandatory scoped claims.

`provider-workspace-operations.repository.spec.ts` locks these SQL predicates so the operations console cannot present a provider as publication-ready when public discovery would reject it.

## Threshold policy

No formatting, lint, type, migration, coverage, Android lint, portal isolation or documentation threshold was reduced. Every permanent gate passed with the repository's existing settings.
