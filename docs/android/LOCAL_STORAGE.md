# DIREKT Android Local Storage

## Technologies

- Room for structured cache, drafts and queued operations;
- DataStore for small preferences;
- Android Keystore-backed encryption for sensitive tokens/keys;
- app-private files for temporary evidence;
- no sensitive data on shared external storage.

## Stored data

Allowed:

- taxonomy;
- selected search area;
- cached public provider summaries;
- own profile drafts;
- pending operation metadata;
- notification/enquiry cache;
- session metadata through approved secure approach.

Restricted:

- identity/certificate files only temporarily for submission;
- private coordinates only where needed for own active workflow;
- complaint evidence only under explicit policy.

## Cleanup

- logout/account switch;
- successful upload and retention timeout;
- expired caches;
- deleted drafts;
- low-storage handling;
- app upgrade migrations.

## Database migrations

Room migrations are explicit and tested from supported versions. Destructive migration is not used in production for user drafts without approved recovery.

## Backup

Exclude tokens, evidence and sensitive databases from cloud backup where required. Document Android backup rules in manifest.
