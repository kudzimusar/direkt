# DIREKT Supabase Development Integration

**Environment:** Development  
**Project name:** `direkt-app`  
**Project ref:** `aeeuscifrxcjmnswqwnq`  
**Project URL:** `https://aeeuscifrxcjmnswqwnq.supabase.co`  
**Region:** `ap-northeast-1` — Tokyo  
**Runtime owner:** DIREKT NestJS API only

## 1. Security boundary

Android and browser clients must call the DIREKT API. They must not connect directly to PostgreSQL or Supabase Storage and must never receive a database password or `service_role` key.

DIREKT does not use Supabase Auth, Realtime, Edge Functions or direct client data access in this integration. The existing NestJS authentication, authorization, audit and policy model remains authoritative.

The Supabase publishable key is therefore not required by Android, the operations portal or the NestJS runtime at this checkpoint.

## 2. Immediate credential response

A database password was previously shared outside an approved secret manager. Treat that password as compromised and rotate it in the Supabase Dashboard before linking or migrating the project.

After rotation:

1. invalidate every local connection string containing the old password;
2. replace it only in local ignored `.env` files and approved secret stores;
3. do not paste the replacement into issues, pull requests, chat, source files or command history;
4. review Supabase database and API logs for unexpected access.

## 3. Repository integration

The repository contains:

- `supabase/config.toml` for safe local Supabase CLI configuration;
- checksummed DIREKT migrations in `database/migrations`;
- `DIRECT_DATABASE_URL` support for migration and administrative traffic;
- pooled `DATABASE_URL` support for normal API traffic;
- a backend-only Supabase private evidence-storage adapter;
- private bucket provisioning that safely skips ordinary PostGIS CI;
- a remote integration verification command;
- ignored Supabase CLI local-link state.

The existing DIREKT migration runner remains the schema authority. Do not create a second migration history under `supabase/migrations`, and do not use `supabase db push` or `supabase db pull` as the normal DIREKT schema workflow.

## 4. Supabase CLI link

Run from the repository root:

```bash
supabase login
supabase link --project-ref aeeuscifrxcjmnswqwnq
```

`supabase init` has already been represented by the committed `supabase/config.toml`. Do not rerun it in a way that overwrites the reviewed configuration.

The CLI stores its local project link under `supabase/.temp/`, which is ignored by Git.

## 5. Required database connections

Obtain both connection strings from **Supabase Dashboard → Connect** after rotating the password.

| Variable | Use | Placement |
|---|---|---|
| `DATABASE_URL` | Normal NestJS API traffic through the recommended Supabase pooler | local ignored `.env`; later Google Secret Manager |
| `DIRECT_DATABASE_URL` | migrations, restore checks and administrative operations | local ignored `.env`; later protected deployment/migration secret |

Use TLS. The connection string should include `sslmode=require` when the supplied Dashboard connection string does not already enforce TLS.

Do not use the direct database connection as the normal Cloud Run application pool. Cloud Run can create many instances; normal runtime traffic must use the Supabase connection pooler and the API's bounded pool.

## 6. Required backend configuration

Create `backend/direkt-api/.env` from `.env.example` and supply the rotated values locally:

```text
DATABASE_URL=<Supabase pooled connection string>
DIRECT_DATABASE_URL=<Supabase direct connection string>
EVIDENCE_STORAGE_PROVIDER=supabase
SUPABASE_URL=https://aeeuscifrxcjmnswqwnq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server-only service-role key>
SUPABASE_EVIDENCE_BUCKET=provider-evidence
SUPABASE_PRIVATE_MEDIA_BUCKET=provider-media-private
SUPABASE_PUBLIC_MEDIA_BUCKET=provider-media-public
SUPABASE_SYSTEM_EXPORTS_BUCKET=system-exports
```

The `.env` file is ignored. Never commit it.

## 7. Schema and bucket provisioning

From `backend/direkt-api`:

```bash
npm ci
npm run migration:up:env
npm run supabase:check
```

The migration command applies every checksummed repository migration through `DIRECT_DATABASE_URL`. It also provisions these buckets when the Supabase `storage` schema is available:

| Bucket | Maximum object size | Allowed content | Public |
|---|---:|---|---|
| `provider-evidence` | 20 MiB | PDF, JPEG, PNG, WebP | No |
| `provider-media-private` | 10 MiB | JPEG, PNG, WebP | No |
| `provider-media-public` | 10 MiB | JPEG, PNG, WebP | No — remains private until publication policy explicitly changes |
| `system-exports` | 100 MiB | JSON, CSV, PDF, ZIP | No |

No broad `anon` or `authenticated` Storage policy is introduced. The backend uses the service role only to issue narrow, expiring signed URLs after DIREKT authorization succeeds.

## 8. Evidence-storage behavior

When `EVIDENCE_STORAGE_PROVIDER=supabase`:

1. the authenticated provider requests an upload session from the DIREKT API;
2. the API authorizes the provider and requirement scope;
3. the API requests a signed private upload URL from Supabase;
4. the client uploads directly to the signed URL using the returned required headers;
5. the client submits size and SHA-256 to the DIREKT API;
6. the API downloads the private object through a short-lived signed URL and verifies actual byte size, MIME type and SHA-256;
7. only then does DIREKT accept the evidence metadata;
8. assigned reviewers receive separate short-lived, audited read grants.

The service-role key, object key and permanent storage URL are never returned to Android or the portal.

## 9. Credential placement

### Local development

Store in `backend/direkt-api/.env`, which is ignored:

```text
DATABASE_URL
DIRECT_DATABASE_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

### Google Secret Manager

This becomes the backend runtime authority during the Google Cloud integration:

```text
DATABASE_URL
DIRECT_DATABASE_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Bucket names may be normal environment configuration, although keeping all backend integration configuration together in Secret Manager is acceptable.

### GitHub Environments

For a future approved migration workflow, prefer:

```text
Variable: SUPABASE_PROJECT_REF=aeeuscifrxcjmnswqwnq
Secret:   SUPABASE_ACCESS_TOKEN
Secret:   SUPABASE_DB_PASSWORD
```

Use the `development` GitHub Environment with approval and branch restrictions. Do not add these to repository files. Do not add the service-role key to GitHub unless a reviewed workflow demonstrably requires it.

### Android

Add none of the Supabase database, publishable or service-role credentials. Android communicates with the DIREKT API only.

### Vercel

Add none of the Supabase database or service-role credentials. The Next.js server boundary communicates with the DIREKT API only.

## 10. Supabase Dashboard requirements

Complete and verify:

- project name and ref match this document;
- region is Tokyo (`ap-northeast-1`);
- database password has been rotated;
- PostGIS is enabled and `PostGIS_Version()` succeeds;
- all repository migrations are present in `public.direkt_schema_migrations`;
- all four buckets exist and remain private;
- no permissive Storage policy grants direct client access;
- database network restrictions are reviewed before staging/production;
- backups and point-in-time recovery expectations are documented for the paid plan selected later;
- database, API and Storage logs are available to the operating team;
- budget and usage alerts are configured in the Supabase organization;
- production will use a separate Supabase project and credentials.

## 11. Workspace connector status

The Supabase connector currently available to this ChatGPT workspace does not have access to project `aeeuscifrxcjmnswqwnq`; attempts to inspect migrations return a permission error. Authorize the Supabase account or organization that owns `direkt-app` before asking the connector to apply migrations, inspect logs or run security/performance advisors.

The project ref is not an organization ID. Confirm the actual organization ID in **Supabase Dashboard → Organization Settings** before recording it in the programme register.

## 12. Completion evidence

Supabase is complete for the development checkpoint only when all of the following are true:

- compromised database password rotated;
- CLI linked to `aeeuscifrxcjmnswqwnq`;
- pooled and direct connections configured outside Git;
- repository migrations applied successfully;
- PostGIS readiness succeeds;
- four private buckets verified;
- `npm run supabase:check` passes;
- synthetic storage remains the default for tests;
- real Supabase storage is enabled only through backend configuration;
- security and performance advisors reviewed after migration;
- no secret appears in Git history, Actions logs, Android, Vercel or documentation.
