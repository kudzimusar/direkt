# Phase 6 provider workspace privacy and security controls

## Threats addressed

Phase 6 explicitly addresses:

- a client selecting another provider ID;
- a revoked representative retaining workspace access;
- ambiguous multi-provider ownership being silently resolved;
- private coordinates appearing in provider or operations responses;
- interrupted retries creating duplicate evidence versions;
- an upload session being confirmed into an unrelated or closed case;
- provider timelines leaking reviewer identity or private rationale;
- operations pages exposing evidence identifiers or object keys;
- later-phase enquiry, review or commercial mutations appearing early;
- Android persistence retaining document contents or bearer-like secrets.

## Authorization controls

Provider workspace authorization is resolved twice:

1. `PermissionGuard` verifies an active provider-scoped permission for the authenticated identity.
2. The command or read repository resolves the active provider assignment inside the transaction.

Client headers and body fields cannot select provider ownership. Zero assignments are denied. Multiple active provider assignments return a conflict until a future server-owned context-selection design is approved.

Role revocation and assignment dates are evaluated on every request.

## Evidence controls

Private evidence remains in adapter-backed object storage. PostgreSQL stores opaque references and review-safe metadata.

Logical upload intents add retry state without exposing storage details. Database triggers enforce:

- provider, creator, case and requirement consistency;
- one active upload session per logical intent;
- one attempt number per intent;
- one evidence version per upload session;
- valid terminal-state timestamps;
- provider-scoped replacement evidence.

Confirmation into a case uses the existing case/evidence trigger strengthened by Phase 6. The case must match provider and requirement and must be awaiting evidence or correction. A violation rolls back the complete confirmation transaction.

## Location controls

Private base, public premises and service area remain separate geography fields.

Provider workspace responses return only configuration booleans and public-safe locality. Operations responses return booleans only. Audit metadata explicitly records that coordinates are excluded.

Public premises coordinates require explicit consent. Mobile providers remain service-area matched and are not ranked from a private base.

## Timeline controls

Provider timeline output is allowlisted. It contains safe event type, scoped status, safe reason code, limitation and validity dates.

It excludes:

- reviewer, field-agent and operator identities;
- recommendation and decision rationale;
- evidence object keys, signed URLs and hashes;
- document content and issuing details;
- internal risk or fraud signals.

## Android persistence controls

The local synthetic upload snapshot stores state metadata only. It does not store:

- document bytes or content URI;
- checksum or identity-document value;
- private location;
- upload URL, object key or authorization header;
- access or refresh token;
- reviewer data.

The encoded value is a prototype recovery contract, not production secure storage. Before real evidence, Android must use approved encrypted local storage, scoped file access, secure deletion and production threat-model review.

## Operations controls

The operations API and page show aggregate counts and configuration flags. They do not provide evidence inspection. Private evidence remains accessible only through assigned, audited, short-lived review grants in the verification module.

## Deferred functionality

Phase 6 has no enquiry, review-response, subscription or payment mutation endpoint. Read-only boundary responses identify the owning future phase and return `mutationAllowed: false`.

## Remaining production gates

Before real provider evidence or deployment:

- approve a private storage provider and bucket policy;
- add malware, MIME and content validation;
- encrypt approved Android local state;
- approve retention and deletion schedules;
- add monitored upload/session cleanup;
- complete penetration and authorization testing;
- validate privacy notices and lawful bases with qualified Zambia counsel;
- validate TalkBack, device storage and connectivity behavior on representative devices.
