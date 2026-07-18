# Maps and Sentry Reconciliation — 2026-07-19

**Status:** EXTERNAL SETUP CLAIMED BY OWNER; RUNTIME SOURCE ACTIVATION NOT PROVEN  
**Purpose:** Reconcile integration claims with the exact source at the Phase 11 baseline without fabricating implementation evidence.

## Executive determination

The owner reports that Google Maps and Sentry setup has been completed externally. The current repository does not yet prove those services are active in the DIREKT runtime.

At the Phase 11 baseline:

- Android `app/build.gradle.kts` contains no Google Maps SDK, Places SDK, Firebase Crashlytics or Sentry dependency/configuration;
- the Android version catalog contains no Maps/Firebase/Sentry library coordinates;
- the customer discovery map path still renders `SyntheticMapCard` and explicitly states that no map SDK or production coordinates are connected;
- the NestJS API package has no Sentry SDK dependency;
- the Next.js operations portal package has no Sentry SDK dependency;
- the integration plan still describes Maps and Sentry as planned provider/runtime boundaries rather than verified active code.

Therefore:

> External account/project provisioning and application runtime integration are separate gates.

Do not mark Maps or Sentry `ACTIVE` until source, managed configuration and runtime evidence agree.

## Google Maps reconciliation

### Intended binding

Development Google Cloud project:

```text
direkt-dev-502701
project number: 264358173369
```

Android application IDs:

```text
Debug:      com.kudzimusar.direkt.debug
Production: com.kudzimusar.direkt
```

### Required key separation

Use separate credentials for separate trust boundaries:

| Credential | Allowed use | Required restriction direction |
|---|---|---|
| Android Maps key | native Maps SDK only | Android package + exact signing SHA certificate(s); API-restricted to required Android Maps SDKs |
| Backend Maps key | approved server-side geocoding/normalization only | server-only; API restricted; static egress/IP restriction where technically available, or another approved server credential pattern |

Never reuse a server key in Android or an Android key on the backend.

Google’s current Maps security guidance requires application and API restrictions, recommends separate keys per application, monitoring usage and deleting unused keys, and warns that unrestricted keys can create unauthorized billing. For Android, the restriction uses package name plus SHA-1 signing certificate fingerprint.

Official source:

- https://developers.google.com/maps/api-security-best-practices

### Activation evidence required

- [ ] Maps SDK/API names actually enabled in `direkt-dev-502701` are recorded.
- [ ] Debug Android key restriction includes only `com.kudzimusar.direkt.debug` plus the correct debug/test signing SHA used for the controlled pilot build.
- [ ] Production key is separate and remains unused until Phase 12/release approval.
- [ ] Each key has API restrictions limited to the APIs actually used.
- [ ] No Maps API key is committed to GitHub or bundled through an unrestricted plaintext source value.
- [ ] Quotas and budget alerts are documented with an owner.
- [ ] Usage/credential metrics are inspected before and after restriction changes.
- [ ] Backend key exists only if server-side geocoding is genuinely required; mobile clients never relay arbitrary backend web-service requests.
- [ ] Maps/privacy terms for the exact pilot use are approved before real location processing.
- [ ] Location permission denial preserves manual area/landmark/Plus Code search.
- [ ] Map/provider outage preserves list/manual fallback.
- [ ] Exact private provider base coordinates never become public markers.
- [ ] Only explicitly consented customer-facing premises may use public precise markers.
- [ ] Fixed/mobile/hybrid providers remain representable without inventing a precise public location.
- [ ] A runtime kill switch can disable Maps/provider calls without breaking core discovery.
- [ ] Android/backend tests prove fallback, permission denial and private-coordinate non-leakage.

### Current source decision

Until the above activation is implemented and evidenced, the authoritative runtime behavior remains the synthetic/manual location path. Do not change documentation to claim live Maps merely because Cloud APIs or credentials have been provisioned.

## Sentry reconciliation

### Intended separation

Use distinct monitoring boundaries:

- Android: repository plan currently prefers Firebase Crashlytics for crashes/ANRs; adding Sentry Android would require an explicit architecture/change-control decision rather than silent duplication;
- NestJS API: separate Sentry project/environment;
- operations portal: separate Sentry project/environment;
- Cloud Run infrastructure: Cloud Logging/Monitoring remains authoritative for service/infrastructure health.

The integration plan already reserves separate API and portal project variables. Do not collapse API and portal telemetry into one undifferentiated project if that would weaken access, release or alert ownership.

### Privacy requirements before activation

- [ ] `sendDefaultPii` or equivalent automatic PII capture remains disabled unless explicitly justified and approved.
- [ ] IP storage/scrubbing is configured consistently with the approved privacy model.
- [ ] Request bodies are not attached wholesale.
- [ ] Authorization/session tokens, cookies and secrets are scrubbed.
- [ ] Phone/email/contact values are scrubbed or excluded.
- [ ] Identity document/evidence metadata and object references are excluded unless a minimized safe identifier is explicitly approved.
- [ ] Precise latitude/longitude and private premises coordinates are excluded.
- [ ] Enquiry/complaint/review free text is not sent automatically.
- [ ] Provider/customer names are not added as user PII merely for convenience.
- [ ] Breadcrumbs and HTTP instrumentation are inspected for sensitive URL/query/header leakage.
- [ ] Server-side and project-level data scrubbing rules are enabled and tested with synthetic canaries.

Sentry supports organization/project privacy controls including data scrubbing, default scrubbers, sensitive-field rules and IP-address scrubbing. Runtime configuration must still minimize data before transmission rather than relying only on server-side cleanup.

Official source:

- https://docs.sentry.io/

### Release and source-map requirements

- [ ] environment tags distinguish development/staging/pilot/production;
- [ ] release identifiers bind events to immutable Git/source revisions;
- [ ] source maps are uploaded through protected CI credentials, never a client-exposed auth token;
- [ ] uploaded source maps match the deployed release before errors occur;
- [ ] source maps are not unintentionally published if they expose source content;
- [ ] Sentry auth tokens remain in protected build/deployment secrets only;
- [ ] API and portal alert ownership/escalation is documented;
- [ ] quota/cost limits are documented;
- [ ] kill switch/DSN disable behavior is tested;
- [ ] synthetic privacy canary tests prove protected values do not arrive in captured events.

### Current source decision

Sentry runtime integration is not present in the exact Phase 11 baseline packages. External organization/project provisioning may be retained, but production-shaped SDK integration must be a reviewed code change with privacy regressions before it is marked active.

## Phase 11 implementation rule

Maps/Sentry work must not become a reason to rewrite discovery or observability architecture.

When activated:

```text
existing domain/API contracts
        ↓
provider adapter / SDK boundary
        ↓
privacy minimization + fail-closed config
        ↓
manual/list/Cloud Logging fallback remains available
```

No real participant pilot may depend on an integration whose source, credentials restrictions, legal/privacy terms, kill switch and regression evidence are incomplete.
