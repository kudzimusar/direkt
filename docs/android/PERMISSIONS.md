# DIREKT Android Permissions

## Location

Use foreground approximate/precise location only for current-area search or authorized field workflow. Customer can choose area manually. No background location in Version 1.

## Camera

Request when capturing evidence or portfolio image. Explain purpose. Support approved file picker alternatives where policy allows.

## Photos/media

Use current Android photo picker/scoped access rather than broad storage permission where possible.

## Notifications

Request after explaining enquiries, verification and expiry value. In-app notification centre remains usable when denied.

## Phone/SMS

Do not request call-log/SMS permissions. Launch dialer or external message intent after consent. OTP auto-fill uses approved platform mechanisms without broad message access.

## Contacts

Not required for MVP.

## Biometrics

Optional local re-authentication for sensitive operations may be added; backend session policy remains authoritative.

## Permission states

For each permission define:

- not requested;
- granted;
- denied;
- permanently denied;
- unavailable;
- rationale;
- settings route;
- functional fallback.

## Testing

Test every state, API-level differences and revoked permission while app is running.
