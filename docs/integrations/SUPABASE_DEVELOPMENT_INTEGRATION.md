# DIREKT Supabase Development Integration

**Environment:** Development  
**Project name:** `direkt-app`  
**Project ref:** `aeeuscifrxcjmnswqwnq`  
**Project URL:** `https://aeeuscifrxcjmnswqwnq.supabase.co`  
**Region:** `ap-northeast-1` — Tokyo  
**Runtime owner:** DIREKT NestJS API only  
**Phase baseline:** Phase 8 complete and synchronized

## 1. Security boundary

Android and browser clients call the DIREKT API. They do not connect directly to PostgreSQL or Supabase Storage and never receive database credentials, Supabase secret keys or legacy `service_role` keys.

DIREKT does not use Supabase Auth, Realtime, Edge Functions or direct client data access in this integration. The existing NestJS authentication, authorization, audit and policy model remains authoritative.

The supplied publishable key is intentionally unused because DIREKT has no direct client-to-Supabase path.

## 2. Credential incident status

The database password that was previously shared outside an approved secret manager has been rotated.

Retained controls:

1. the old connection string must remain invalid;
2. the replacement belongs only in ignored local environment files, GitHub Environment secrets and later Google Secret Manager;
3. credentials must not be pasted into issues, pull requests, chat, source files or command history;
4. Supabase database and API logs should be reviewed for unexpected access around the exposure window.

## 3. Repository integration

The repository contains:

- `supabase/config.toml` for safe Supabase CLI configuration;
- checksummed DIREKT migrations in `database/migrations`;
- `DIRECT_DATABASE_URL` support for migration and administrative traffic;
- pooled `DATABASE_URL` support for normal API traffic;
- a backend-only Supabase private evidence-storage adapter;
- support for preferred Supabase secret API keys and temporary legacy `service_role` compatibility;
- private bucket provisioning that safely skips ordinary PostGIS CI;
- a remote integration verification command;
- a protected GitHub Actions activation workflow;
- ignored Supabase CLI local-link state.

The existing DIREKT migration runner remains the schema authority. Do not create a second migration history under `supabase/migrations`, and do not use `supabase db push` or `supabase db pull` as the normal DIREKT schema workflow.

## 4. Phase 8 reconciliation

Phase 8 is complete. The Supabase integration branch was reconciled with the Phase 8 stable `main` through a true two-parent merge commit. Supabase activation therefore includes all Phase 8 database migrations and does not target the earlier Phase 7-only snapshot.

The remote activation workflow runs the complete current migration chain and verifies idempotency after application.

## 5. Local Supabase CLI link

Run from the repository root:

```bash
supabase login
supabase link --project-ref aeeuscifrxcjmnswqwnq
```

`supabase init` is already represented by the committed `supabase/config.toml`. Do not rerun it in a way that overwrites the reviewed configuration.

The CLI stores its local project link under `supabase/.temp/`, which is ignored by Git.

## 6. Required database connections

Obtain connection strings from **Supabase Dashboard → Connect**.

| Variable | Use | Placement |
|---|---|---|
| `DATABASE_URL` | Normal NestJS API traffic through the recommended Supabase pooler | local ignored `.env`; later Google Secret Manager |
| `DIRECT_DATABASE_URL` | migrations, restore checks and administrative operations | local ignored `.env`; protected deployment/migration environment |

Use TLS. Prefer the Session pooler connection for GitHub-hosted activation because it is compatible with IPv4 GitHub runners. Normal Cloud Run traffic must use the appropriate Supabase pooler and the API's bounded pool.

## 7. Required backend configuration

Create `backend/direkt-api/.env` from `.env.example` and supply values locally:

```text
DATABASE_URL=<Supabase pooled connection string>
DIRECT_DATABASE_URL=<Supabase migration connection string>
EVIDENCE_STORAGE_PROVIDER=supabase
SUPABASE_URL=https://aeeuscifrxcjmnswqwnq.supabase.co
SUPABASE_SECRET_KEY=<dedicated server-side secret API key>
SUPABASE_EVIDENCE_BUCKET=provider-evidence
SUPABASE_PRIVATE_MEDIA_BUCKET=provider-media-private
SUPABASE_PUBLIC_MEDIA_BUCKET=provider-media-public
SUPABASE_SYSTEM_EXPORTS_BUCKET=system-exports
```

`SUPABASE_SECRET_KEY` is preferred. `SUPABASE_SERVICE_ROLE_KEY` remains a temporary legacy fallback only.

The `.env` file is ignored. Never commit it.

## 8. Schema and bucket provisioning

From `backend/direkt-api`:

```bash
npm ci
npm run migration:up:env
npm run supabase:check
```

The migration command applies every checksummed repository migration through `DIRECT_DATABASE_URL`. It provisions these buckets when the Supabase `storage` schema is available:

| Bucket | Maximum object size | Allowed content | Public |
|---|---:|---|---|
| `provider-evidence` | 20 MiB | PDF, JPEG, PNG, WebP | No |
| `provider-media-private` | 10 MiB | JPEG, PNG, WebP | No |
| `provider-media-public` | 10 MiB | JPEG, PNG, WebP | No — remains private until publication policy explicitly changes |
| `system-exports` | 100 MiB | JSON, CSV, PDF, ZIP | No |

No broad `anon` or `authenticated` Storage policy is introduced. The backend uses a server-side key only to issue narrow, expiring signed URLs after DIREKT authorization succeeds.

## 9. Evidence-storage behavior

When `EVIDENCE_STORAGE_PROVIDER=supabase`:

1. the authenticated provider requests an upload session from the DIREKT API;
2. the API authorizes the provider and requirement scope;
3. the API requests a signed private upload URL from Supabase;
4. the client uploads directly to the signed URL using the returned required headers;
5. the client submits size and SHA-256 to the DIREKT API;
6. the API downloads the private object through a short-lived signed URL and verifies actual byte size, MIME type and SHA-256;
7. only then does DIREKT accept the evidence metadata;
8. assigned reviewers receive separate short-lived, audited read grants.

The server key, object key and permanent storage URL are never returned to Android or the portal.

## 10. Protected GitHub remote activation

Workflow:

```text
.github/workflows/supabase-development-activate.yml
```

The workflow is manual-only, runs only from `main`, uses the GitHub `development` Environment and requires this exact confirmation input:

```text
ACTIVATE-DIREKT-DEVELOPMENT
```

### 10.1 Create the GitHub Environment

Open:

```text
GitHub repository → Settings → Environments → New environment
```

Create:

```text
development
```

Recommended protection:

- deployment branches limited to `main`;
- required reviewer enabled where the repository plan supports it;
- prevent administrators from bypassing protection where appropriate.

### 10.2 Add environment secrets

Add exactly these two secrets to the `development` Environment:

```text
SUPABASE_ACCESS_TOKEN
SUPABASE_DATABASE_URL
```

`SUPABASE_ACCESS_TOKEN` is a Supabase personal access token created under **Supabase Account → Access Tokens**. It must belong to a user who can administer project `aeeuscifrxcjmnswqwnq`.

`SUPABASE_DATABASE_URL` is the **Session pooler** connection string copied from **Supabase Dashboard → Connect**, containing the rotated database password. Add it directly in GitHub; do not paste it into chat.

The project ref and URL are non-secret and remain committed in the workflow.

### 10.3 What the workflow performs

The workflow:

1. verifies the project name, ref and Tokyo region through the Supabase Management API;
2. links the Supabase CLI non-interactively;
3. retrieves a temporary elevated API key through the Management API and masks it immediately;
4. prefers a modern secret API key and falls back to legacy `service_role` only when necessary;
5. applies every DIREKT migration and reruns the migration check for idempotency;
6. verifies PostGIS and all four private Storage buckets;
7. captures a Supabase database inspection report;
8. captures security and performance advisor reports;
9. uploads only sanitized evidence artifacts for 14 days;
10. publishes a run summary containing counts, commit SHA and verification status.

API keys, database URLs and passwords are never included in uploaded artifacts.

### 10.4 Run the activation

After the Supabase integration PR is merged:

```text
GitHub repository → Actions → DIREKT Supabase development activation → Run workflow
```

Select `main`, enter the confirmation phrase and approve the `development` Environment deployment when prompted.

## 11. Credential placement

### Local development

Store in `backend/direkt-api/.env`, which is ignored:

```text
DATABASE_URL
DIRECT_DATABASE_URL
SUPABASE_URL
SUPABASE_SECRET_KEY
```

### Google Secret Manager

This becomes the backend runtime authority during the Google Cloud integration:

```text
DATABASE_URL
DIRECT_DATABASE_URL
SUPABASE_URL
SUPABASE_SECRET_KEY
```

Use a dedicated secret API key for the DIREKT API runtime so it can be rotated independently.

### GitHub Environment

Store only:

```text
SUPABASE_ACCESS_TOKEN
SUPABASE_DATABASE_URL
```

The activation workflow resolves the temporary server key itself. Do not add the server key to GitHub.

### Android

Add no Supabase database, publishable, secret or service-role credentials. Android communicates with the DIREKT API only.

### Vercel

Add no Supabase database or server credentials. The Next.js server boundary communicates with the DIREKT API only.

## 12. Supabase Dashboard requirements

Complete and verify:

- project name and ref match this document;
- region is Tokyo (`ap-northeast-1`);
- database password has been rotated;
- PostGIS is enabled and `PostGIS_Version()` succeeds;
- all repository migrations are present in `public.direkt_schema_migrations`;
- all four buckets exist and remain private;
- no permissive Storage policy grants direct client access;
- database network restrictions are reviewed before staging/production;
- backups and point-in-time recovery expectations are documented for the selected plan;
- database, API and Storage logs are available to the operating team;
- budget and usage alerts are configured in the Supabase organization;
- production will use a separate Supabase project and credentials.

## 13. ChatGPT connector access

GitHub authentication and Supabase authentication are independent. Adding GitHub credentials does not grant ChatGPT access to a Supabase organization.

The earlier Supabase connector was authenticated to an account that exposed only CarUp projects. In the current workspace session, no Supabase management plugin is available. This is why direct project operations were denied even though the project ref was correct.

The GitHub activation workflow is the authoritative remote-activation route and does not require a ChatGPT Supabase connector.

Where a Supabase plugin is available in ChatGPT, connect it from **Settings → Plugins/Apps**, sign in with the Supabase account that owns `direkt-app`, and authorize the organization containing project `aeeuscifrxcjmnswqwnq`. This is optional and is not a prerequisite for the protected workflow.

## 14. Completion evidence

Supabase is complete for the development checkpoint only when all of the following are true:

- database password rotated;
- Phase 8 and Supabase histories reconciled;
- protected GitHub Environment configured;
- activation workflow completed successfully on `main`;
- CLI linked to `aeeuscifrxcjmnswqwnq`;
- repository migrations applied successfully;
- PostGIS readiness succeeds;
- four private buckets verified;
- `npm run supabase:check` passes;
- security and performance advisors captured and reviewed;
- synthetic storage remains the default for tests;
- real Supabase storage is enabled only through backend configuration;
- no secret appears in Git history, Actions logs, Android, Vercel or documentation.
