# Phase 11 Wave 0 Technical Preflight

**State:** IMPLEMENTED — EXACT-HEAD EVIDENCE PENDING  
**Baseline:** `6b9e7cabeebd5ade9b998b8a54bcd2c888e6bfe4`  
**Pilot-entry latch:** false  
**PRIMARY-PILOT evidence:** 0

## Repository-clearable controls

The finishing-line implementation must prove on one exact head:

1. **Authorization and data boundary**
   - backend authorization remains authoritative;
   - browser and Android clients receive no provider, database, payment or telemetry-admin credentials;
   - private evidence and exact private provider coordinates remain protected;
   - no client-selected provider scope or terminal trust state.

2. **Pilot-entry fail-closed state**
   - `PILOT_ENTRY_APPROVED` defaults false;
   - no workflow assigns the protected latch true;
   - controlled-pilot participant processing cannot start with missing legal/privacy/owner evidence;
   - PRIMARY-PILOT evidence and findings remain empty.

3. **Authentication and consent**
   - Firebase exchange remains server-verified, invite-only and bound to the active notice version;
   - raw Firebase UID is not retained as the DIREKT identity authority;
   - DIREKT sessions remain canonical;
   - over-cap, expired, revoked, wrong-wave and unconsented admission fail closed.

4. **Storage and rights**
   - private storage remains least-privilege and non-public;
   - synthetic tests cover access/revocation/deletion boundaries where available;
   - real private-storage and withdrawal/deletion canaries remain blocked until authorization.

5. **Explicit Wave 1 exclusions**
   - manual area/list fallback remains available without participant Maps;
   - participant Sentry/Crashlytics remains disabled;
   - external participant email/push/WhatsApp remains disabled;
   - production AI remains disabled;
   - payment provider and real money remain disabled;
   - automated registry access remains unauthorized;
   - field claims remain excluded unless separately authorized.

6. **Source and delivery integrity**
   - deterministic OpenAPI-generated Kotlin and TypeScript clients;
   - Android unit/lint/assembly/dependency checks;
   - backend format/lint/type/tests/build/OpenAPI;
   - forward-only migration/current-schema checks;
   - customer/provider PWA and W7/W8 contracts;
   - runtime integration RC5–RC11 preservation;
   - supply-chain and documentation quality.

## Evidence binding rule

The implementation PR closeout must replace this pending state with:

- exact clean source SHA;
- implementation PR and merge SHA;
- complete workflow run IDs;
- confirmed `technical_preflight: PASSED` in the Wave 0 manifest;
- P11-G14 closed for that exact source only;
- any remaining P11-G12 deployment/revision evidence still open until a real Wave 1 candidate is deployed.

A green repository matrix does not close regulator, counsel, owner, Firebase-console or participant-canary gates.
