# Phase 11 Wave 0 Technical Preflight

**State:** PASSED — EXACT-HEAD TECHNICAL PREFLIGHT CLOSED
**Exact source:** `1befa902def70d2c997aaba260e0d8e2a5d4b12d`
**Implementation PR/merge:** #512 / `f561658d140aaf214fa6eaca99c80bcc98ee284f`
**Evidence SHA-256:** `7480a398c6ed7a612ce1c2e44706221f1722e626a2841fe0598662d62471bdf9`
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

The technical preflight is bound to exact source `1befa902def70d2c997aaba260e0d8e2a5d4b12d` and implementation merge `f561658d140aaf214fa6eaca99c80bcc98ee284f`. The complete preserved matrix passed through runs `30307945800, 30307945818, 30307945934, 30307945768, 30307945872, 30307945906, 30307945756, 30307945870, 30307945784, 30307945769, 30307945849, 30307945921, 30307945959, 30307945868, 30307945894, 30307945776, 30307945858, 30307945856`. The Wave 0 manifest records `technical_preflight: PASSED`, and P11-G14 is closed for that exact repository source only. P11-G12 remains open until a real Wave 1 candidate has an immutable deployment revision, image digest, migration checksums and configuration receipt.

A green repository matrix does not close regulator, counsel, owner, Firebase-console or participant-canary gates.
