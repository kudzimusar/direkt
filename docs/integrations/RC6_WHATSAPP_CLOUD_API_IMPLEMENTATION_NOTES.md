# RC6 WhatsApp Cloud API implementation notes

## Current state

`IMPLEMENTED_GATED / MANAGED CANARY PENDING`

RC6 source integration is implemented behind fail-closed runtime controls. This document does not claim provider-backed activation, real participant delivery, production authorization or RC6 closure.

The 2026-07-23 owner sequencing override permits RC6 implementation while RC5 Firebase Test Lab remains parked at an external Google Cloud Shell quota boundary. RC5 remains open and its managed Test Lab evidence is still mandatory later.

## Architecture

WhatsApp remains application-managed and backend-owned.

- Android, browser and operations clients do not receive Meta credentials and do not call Meta directly.
- `WhatsAppProviderPort` is the provider-neutral boundary.
- `MetaWhatsAppProviderAdapter` is the current Meta Cloud API adapter.
- Outbound work uses the existing `platform.outbox_events` transactional-outbox foundation rather than creating a second asynchronous truth system.
- Provider delivery state is persisted separately in `platform.whatsapp_message_deliveries` and signed webhook receipts in `platform.whatsapp_delivery_receipts`.
- Provider mode defaults to `disabled`.

## Fail-closed provider configuration

`WHATSAPP_PROVIDER_MODE=meta_cloud` is accepted only outside production and only with `DIREKT_DATA_MODE=synthetic-only` plus the explicit `WHATSAPP_SYNTHETIC_SEND_APPROVED=true` technical latch.

Meta activation requires all of the following protected runtime values:

- `WHATSAPP_ACCESS_TOKEN`;
- `WHATSAPP_PHONE_NUMBER_ID`;
- `WHATSAPP_BUSINESS_ACCOUNT_ID`;
- `WHATSAPP_APP_SECRET`;
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`;
- `WHATSAPP_GRAPH_API_VERSION`;
- bounded synthetic `WHATSAPP_SYNTHETIC_RECIPIENT`;
- approved `WHATSAPP_SYNTHETIC_TEMPLATE_NAME`;
- `WHATSAPP_SYNTHETIC_TEMPLATE_LANGUAGE`.

The Graph API version has no source-code default. The managed environment must provide the explicitly reviewed provider version so a stale guessed version cannot silently become runtime truth.

Production mode rejects Meta activation. Controlled-pilot data mode also rejects WhatsApp activation until separate participant/provider/legal/privacy approval exists.

## Template and payload boundary

The current adapter sends template requests only.

The source does not implement arbitrary WhatsApp free-form text, document, image or raw evidence delivery. Identity documents, certificates, raw verification evidence, auth tokens, exact private provider coordinates and reviewer notes must not enter provider payloads.

The synthetic outbox payload stores:

- a keyed recipient hash;
- approved internal template key;
- `synthetic` data classification;
- exact source SHA.

It does not persist the raw synthetic phone number in `platform.outbox_events`.

## Consent and opt-out

The existing Phase 8 contact-handoff model remains authoritative for participant handoff consent:

- channel-specific `call` / `whatsapp` consent;
- explicit consent expiry at 24 hours;
- revocation support;
- masked/hashed contact presentation;
- `externalDeliveryAttempted: false` and `deliveryState: disabled` remain preserved for participant handoffs.

RC6 adds a channel opt-out table and authenticated `/communications/whatsapp/opt-out` route. The opt-out stores verified phone hashes only.

Every current synthetic delivery re-checks immediately before provider send:

1. synthetic-only data mode;
2. explicit synthetic-send approval latch;
3. exact recipient-hash binding;
4. current WhatsApp opt-out state.

A queued event therefore cannot bypass a later opt-out or withdrawal of the synthetic-send latch.

## Deliberate participant-delivery stop gate

The canonical identity/contact flow currently persists protected contact hashes and masked display hints, not a general-purpose raw participant phone value that the WhatsApp adapter can safely retrieve for provider delivery.

RC6 does **not** weaken that privacy boundary by adding plaintext phone storage merely to enable WhatsApp.

Participant WhatsApp sending therefore remains intentionally unavailable until a separately reviewed recipient-resolution/storage design proves:

- lawful and consented purpose;
- encryption/access controls and retention;
- send-time consent and opt-out enforcement;
- least-privilege runtime access;
- no browser/client exposure;
- auditability and deletion/revocation behavior.

This is a deliberate security/privacy stop condition, not an implementation omission to bypass.

## Webhook authenticity and receipt truth

Nest retains the exact raw HTTP body for webhook signature verification.

`POST /api/v1/communications/whatsapp/webhook` requires `X-Hub-Signature-256` HMAC-SHA256 verification with the protected app secret before receipt state may change.

The webhook handler:

- accepts only `whatsapp_business_account` message status changes;
- filters to the configured phone-number ID;
- applies only known provider message IDs;
- persists idempotent receipt rows;
- handles `sent`, `delivered`, `read` and `failed` states;
- uses provider timestamps and status rank to guard duplicate/out-of-order updates;
- stores bounded failure codes rather than raw provider error payloads;
- does not log raw webhook bodies.

The GET verification challenge uses the protected verify token with timing-safe comparison.

## Retry and idempotency

The WhatsApp outbox uses:

- bounded `WHATSAPP_MAX_ATTEMPTS`;
- lock expiry through `WHATSAPP_OUTBOX_LOCK_TIMEOUT_MS`;
- `FOR UPDATE SKIP LOCKED` claims;
- bounded exponential backoff;
- stable outbox event identity;
- provider message ID persistence before final outbox publication where possible;
- no re-send when an already accepted provider message ID is found for the same outbox event.

Provider 429/5xx/network failures remain retryable. Non-retryable provider rejection, payload/consent rejection or attempt exhaustion terminates the delivery as failed without fabricating delivery success.

## Database migration

`202607230230_rc6_whatsapp_runtime.sql` adds:

- `platform.communication_channel_opt_outs`;
- `platform.whatsapp_message_deliveries`;
- `platform.whatsapp_delivery_receipts`.

The migration stores recipient/contact hashes, provider message identifiers, bounded status/failure metadata and receipt timestamps. It does not add plaintext participant phone storage.

## Tests and permanent gate

RC6 adds unit coverage for:

- bounded Meta template request construction;
- provider retryable vs terminal failures;
- raw-body webhook signature verification;
- configured phone-number filtering;
- durable status receipt processing;
- invalid-signature rejection before database mutation;
- outbox raw-contact exclusion;
- send-time opt-out enforcement;
- environment fail-closed behavior including production rejection.

`scripts/rc6/verify-whatsapp-contract.py` and `.github/workflows/rc6-whatsapp-contract.yml` permanently enforce the source/security boundary, including client-tree scanning for privileged Meta credentials/send endpoints.

## Managed proof still required

RC6 must not be called ACTIVE or closed until applicable managed evidence proves the exact configured provider state.

Before a synthetic Meta canary is authorized, verify without exposing secrets:

- correct Meta business/WABA ownership;
- configured phone-number ID and test/synthetic recipient eligibility;
- current reviewed Graph API version;
- access-token storage and least-privilege runtime binding;
- app-secret and webhook verify-token storage;
- approved synthetic template name/language/status;
- webhook callback reachability and signed receipt path;
- exact-current-main source identity;
- no real participant/production delivery authority.

If these provider prerequisites are not available, RC6 remains `IMPLEMENTED_GATED / MANAGED CANARY PENDING`; provider absence must not be papered over with a fake success.

## Production boundary

RC6 does not authorize:

- real participant WhatsApp sends;
- production WhatsApp delivery;
- unrestricted free-form messaging;
- private evidence/document/media payloads;
- Maps, payments or later RC checkpoints;
- production auth, Phase 11 exit or Phase 12 production release.

Production/participant delivery requires separate business/phone/template/provider approvals, legal/privacy approval, reviewed participant recipient-resolution architecture, managed runtime evidence and later release authorization.
