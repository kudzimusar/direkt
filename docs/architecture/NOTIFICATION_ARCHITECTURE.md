# DIREKT Notification Architecture

## Channels

- in-app notification centre;
- Android push via FCM;
- SMS for approved authentication/critical cases;
- email for approved receipts/long-form operational notices.

The in-app record is authoritative for non-OTP business notifications.

## Event flow

Domain event → notification policy → template/version → recipient preference/legal basis → channel job → provider → delivery state.

## Categories

- authentication/security;
- verification action/decision/expiry;
- enquiry/response;
- review/complaint;
- subscription/payment;
- platform incident;
- optional marketing.

Marketing consent is separate from required service/safety communication.

## Privacy

Push/SMS lock-screen content must avoid document names, complaint allegations, precise locations and sensitive identity. Use “Open DIREKT to review an update.”

## Reliability

- idempotent notification key;
- retry/backoff;
- provider delivery status;
- dead-letter queue;
- invalid token cleanup;
- user preference and quiet-hour support where appropriate;
- no duplicate storm during job replay.

## Templates

Versioned, localized and reviewed for trust/legal accuracy. Store rendered communication audit for critical decisions.
