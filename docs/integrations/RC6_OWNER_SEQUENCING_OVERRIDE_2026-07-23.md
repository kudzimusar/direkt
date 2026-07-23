# RC6 owner sequencing override — 2026-07-23

## Decision

The repository owner explicitly authorizes RC6 WhatsApp Cloud API source/runtime implementation to proceed before RC5 Firebase Test Lab reaches its final managed-proof closure.

This changes execution order only. It does **not** close RC5, waive RC5 evidence, authorize production WhatsApp delivery, or weaken the single-writer repository model.

## Reason

RC5 reached an owner-controlled Google Cloud boundary. The least-privilege custom roles and dedicated Test Lab results bucket were created and partial verification passed, but the owner’s Google Cloud Shell became temporarily unavailable because its usage quota was exceeded. The reset timing is outside repository control.

Blocking all independent runtime integration work on that external shell availability would unnecessarily stall the programme even though RC6 can be implemented behind fail-closed provider and production-delivery gates without depending on Test Lab completion.

## Alternatives considered

1. **Stop all runtime integration work until Cloud Shell returns.** Rejected because it creates an unnecessary programme-wide stall at an external tooling boundary.
2. **Falsely mark RC5 complete and continue normally.** Rejected because managed Test Lab proof, sanitized artifact evidence and final status reconciliation are still mandatory.
3. **Proceed with RC6 as an undocumented parallel branch while UIA/RC5 remain active.** Rejected because it violates the single-writer model and creates ambiguous ownership.
4. **Explicitly park RC5 and UIA, transfer the sole active write lane to RC6, and preserve all unfinished acceptance gates.** Approved.

## RC5 preserved state

RC5 remains `IMPLEMENTED_GATED / MANAGED MATRIX PENDING`.

Preserved evidence/resources include:

- RC5 source PR #377;
- RC5 IAM correction PR #379;
- dedicated results bucket `gs://direkt-test-lab-results-264358173369`;
- custom roles `direktTestLabRunner` and `direktTestLabResultsWriter`;
- partial owner-side verification showing exact role equality and dedicated bucket/uniform-access checks;
- draft proof bridge PR #378.

Still mandatory before RC5 closure:

- final owner-side read-only IAM/storage/lifecycle/API verification;
- exact-current-main managed Firebase Test Lab matrix execution;
- sanitized result/artifact evidence;
- permanent verifier/status/ledger closeout.

## UIA preserved state

UIA promotion PR #385 is merged at `fed6db8ab7c479b5e47095b4f0a752514122a4f6`. Issue #354 remains open for remaining owner-access acceptance evidence. UIA is parked/read-only while RC6 owns the source lane; approved VC1–VC8 Design DNA and protected browser/Android/operations boundaries remain regression-protected.

## RC6 authorized boundary

RC6 may implement only the application-managed WhatsApp Cloud API runtime path required by the authoritative integration plan:

- backend/provider-neutral adapter through the transactional outbox;
- consent-at-send and channel opt-out enforcement;
- approved/template-governed messages where Meta policy requires templates;
- signed webhook verification;
- idempotency, bounded retries and durable delivery/read/failure receipts;
- privacy-safe payload minimization;
- provider kill switch / fail-closed configuration;
- synthetic managed canary only where current provider configuration permits.

RC6 does **not** authorize:

- real participant or production WhatsApp delivery;
- identity documents, certificates, raw evidence, exact private coordinates, auth tokens or reviewer notes in provider payloads;
- client-side provider credentials or direct Android/browser provider authority;
- bypassing consent after a message was queued;
- RC7 Maps, RC8 payments, production auth, Phase 11 exit or Phase 12 production release.

## Security, privacy, migration and compatibility impact

- No database/API/client authority may be weakened to accommodate WhatsApp.
- Any schema changes must be forward migrations and preserve outbox/audit truth.
- Webhook state is authoritative only after signature verification and idempotent processing.
- Existing Resend/FCM outbox semantics should be reused rather than creating a second asynchronous truth system.
- Existing Android/PWA/operations clients remain provider-credential-free.
- Production delivery remains fail-closed until separate business, phone identity, template, provider, privacy/legal and release approvals are evidenced.

## Handoff rule

RC6 becomes the sole active repository write lane after this coordination checkpoint is merged. RC5 and UIA may continue only read-only/external evidence activity that does not modify overlapping source. After RC6 closure, the next lane must explicitly decide whether to resume RC5, finish UIA acceptance, or proceed under another owner-approved coordination decision.