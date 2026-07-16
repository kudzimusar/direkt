# Phase 7 Operations Security and Privacy

## Authorization

- Roles and permissions are resolved server-side from active assignments.
- Navigation visibility is advisory; every endpoint and action is independently authorized.
- Reviewer evidence access requires an active matching assignment.
- Field work is visible to the assigned field agent or an authorized manager.
- Escalation and incident ownership is enforced without disclosing unrelated records.
- High-risk override approval requires two distinct eligible identities.

## Private evidence

Private evidence remains adapter-backed and non-public. Operations responses do not include:

- evidence bytes;
- persistent or signed URLs beyond the bounded review grant contract;
- object keys;
- checksums;
- identity numbers or signatures;
- reviewer private notes.

Evidence grants are assigned, short-lived, audited, revocable and immediately invalid after assignment revocation or expiry.

## Field safety and public-safe text

Field agents may record structured observations, but cannot create recommendations, final decisions, claims or publication. Public-returning field strings are checked at the PostgreSQL boundary and reject:

- precise coordinate pairs;
- latitude/longitude labels with precise values;
- `geo:` references;
- private storage object paths;
- storage URLs;
- object-key or checksum markers.

Private operational notes remain separate from public-safe summaries and are not serialized into portal responses.

## Incident and complaint boundary

Phase 7 incidents are internal operations controls. They contain no customer interaction history and do not create reviews, moderation actions or appeals. Resolution is limited to the assigned owner, an active global trust supervisor or an administrator. Terminal resolution values are immutable.

## Reporting privacy

Expiry and reporting projections use explicit allowlists and non-exposure flags. Aggregate export contains no provider identifiers, evidence identifiers, record IDs, object keys, private coordinates or document content.

## Portal isolation

Permanent portal CI rejects imports from backend, database or storage modules. The internal web application uses the versioned HTTP API only and includes no production credentials, real data or direct private-storage integration.

## Production stop gates

Before real data or deployment, DIREKT still requires approved production authentication, private storage, malware/MIME scanning, CSP/cookie review, secret management, monitoring, incident response, qualified legal/privacy review and controlled pilot authorization.
