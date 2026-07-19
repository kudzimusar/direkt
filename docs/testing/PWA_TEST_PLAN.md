# DIREKT PWA Test Plan

## Current gate: public synthetic remote review

The initial PWA is static/synthetic. Tests must prove public remote review cannot accidentally become a participant/runtime path.

### Static contract

- `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js`, icon asset exist;
- manifest is valid JSON, `display=standalone`, scope/start URL remain inside the app path;
- service worker caches only same-origin public static assets;
- page contains `noindex,nofollow,noarchive` pre-release metadata;
- synthetic/no-real-submission banner is present;
- no database URL, Supabase secret key, access token, service-account material or private evidence path exists.

### Product coverage

Customer synthetic flows: discover/area/categories; provider results/profile; trust states; saves; enquiries; account/pilot-gate explanation.

Provider synthetic flows: overview/readiness; evidence status/timeline; enquiries; account/subscription state.

### Responsive review matrix

- 1440×900 desktop;
- 1024×768 tablet/desktop;
- 768×1024 tablet portrait;
- 390×844 compact mobile.

No essential action may be hover-only or clipped.

### Accessibility

- keyboard traversal and visible focus;
- skip link;
- button names;
- modal dialog semantics;
- status text/icons independent of color;
- 200% zoom/reflow spot check;
- reduced motion.

### Offline/PWA

- first online load registers service worker;
- reload after cache works offline;
- network-status label changes;
- no real write is queued/represented successful offline;
- install prompt is progressive/optional.

## Future live API gate

Before any live backend connection, add browser E2E/regression coverage for exact OpenAPI compatibility; sign-in/session expiry/logout; CSRF/CORS/origin policy; server-side permission revocation; provider-scope isolation; private evidence/coordinate non-leakage; enquiry idempotency/revision conflict; consent expiry/revocation; review eligibility; commercial/trust separation; offline/retry semantics; accessibility; and rate/abuse controls.

No live API test may require making IAM-private staging publicly invokable as a shortcut.
