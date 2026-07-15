# Phase 6 Android provider workspace

## Delivered experience

Provider mode now has four synthetic workspace sections mapped onto the shared bottom navigation:

| Destination | Provider section |
|---|---|
| Discover | Workspace dashboard and prioritized tasks |
| Saved | Private evidence capture and interrupted-upload recovery |
| Enquiries | Provider-safe verification timeline |
| Account | Profile, services, location, availability and later-phase boundaries |

The customer mode remains available in the same native Android application. Switching mode changes presentation context only; backend identity, provider scope and permissions remain authoritative.

## Dashboard

The dashboard presents:

- actor role and operating model;
- readiness percentage;
- required/submitted evidence counts;
- corrections and current scoped claims;
- prioritized task cards;
- safe location configuration summary;
- minimal availability;
- trust-boundary copy.

It never displays a blanket verified-provider flag.

## Upload recovery state machine

The Android synthetic upload state is:

```text
NotStarted
  → Uploading
      → Submitted
      → Interrupted → Uploading (new attempt)
      → Cancelled
```

The persisted snapshot contains only:

- logical intent ID;
- safe document label;
- state and attempt count;
- active synthetic session ID;
- safe error code;
- update timestamp.

It contains no file bytes, content URI, hash, object key, signed URL, identity number, private address or reviewer data.

### Process recreation

`SharedPreferencesProviderUploadPersistence` stores the encoded safe snapshot. `ProviderUploadRecoveryStore` restores it when the activity is recreated.

The Compose instrumentation test proves:

1. start attempt one;
2. mark the upload interrupted;
3. recreate the activity;
4. re-open provider evidence;
5. restore the same logical intent and interrupted state;
6. retry as attempt two with a different session ID.

The pure unit test repeats the same flow with an in-memory persistence adapter.

## Low-bandwidth behavior

The provider workspace remains useful without images or document previews:

- cards are text-first;
- no map SDK or background location is loaded;
- upload recovery uses state and safe error codes;
- timeline events use concise allowlisted messages;
- later-phase surfaces are plain read-only status rows.

## Accessibility

The implementation includes:

- stable Compose test tags for critical workspace and upload actions;
- semantic descriptions for upload state and location privacy boundaries;
- visible text labels rather than icon-only actions;
- Material components with standard focus and touch behavior;
- content that remains understandable without color.

Before a controlled pilot, TalkBack and keyboard behavior still require representative-device validation.

## Synthetic boundaries

The Android workspace is deliberately disconnected from:

- production authentication or API networking;
- real documents and private storage;
- maps, geocoding or background location;
- enquiries, call or WhatsApp handoff;
- reviews and moderation;
- subscriptions and payments;
- production analytics or public traffic.
