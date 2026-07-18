# Phase 10 Supabase development activation

**Project:** `direct-app`  
**Project ref:** `aeeuscifrxcjmnswqwnq`  
**Region:** `ap-northeast-1`  
**Data boundary:** synthetic-only development data; no Phase 11 participant data

## Final activation checkpoint

The initial protected `DIREKT Supabase development activation` workflow was run from reviewed `main` source `47ec3e6d44055be76d7902971173b5797056aad3`. The ownership-safe security hardening was subsequently merged and activated from `7ac464055b18cb66b871eaa935e9f0f9903b6f94`.

Independent live inspection confirmed:

- the project identity and Tokyo-region binding are correct;
- PostgreSQL is healthy;
- `PostGIS_Version()` succeeds;
- 34 distinct repository migrations through `202607180925_supabase_exposed_schema_hardening.sql` are recorded once with valid checksums;
- the required DIREKT schemas and platform tables exist;
- `provider-evidence`, `provider-media-private`, `provider-media-public`, and `system-exports` exist and are private;
- the storage object count is zero;
- RLS is enabled on `public.direkt_schema_migrations`;
- browser-facing `anon` and `authenticated` roles have no table privileges on the migration ledger.

This clears the original Cloud Run readiness cause: PostGIS and the complete DIREKT schema are available.

## Security-advisor hardening

The first live advisor review found two exposed-schema errors:

1. RLS disabled on the DIREKT-owned `public.direkt_schema_migrations` ledger;
2. RLS disabled on PostGIS-owned `public.spatial_ref_sys`.

The DIREKT migration ledger is application-owned and was hardened by `202607180925_supabase_exposed_schema_hardening.sql`:

- RLS enabled;
- privileges removed from browser-facing `anon` and `authenticated` roles;
- trusted database migration/runtime access preserved.

The ledger error is resolved. The resulting advisor information notice that RLS has no policies is intentional because browser roles have no grants and the table is not an application-facing API resource.

## Managed PostGIS ownership boundary

`public.spatial_ref_sys` and the PostGIS extension are owned by Supabase's managed `supabase_admin` role. The repository migration role is `postgres` and is not a member of that owner role.

A protected activation attempt against merge commit `2d516ce485df06345a965663f81c388e1da719c4` correctly failed before recording the new migration with:

```text
must be owner of table spatial_ref_sys
```

No partial migration was committed. The repository migration was corrected so it no longer attempts to alter or revoke privileges on a Supabase-managed extension table.

The remaining `spatial_ref_sys` advisor finding is a managed-platform exception, not an application-owned migration failure. Resolution requires one of the supported paths:

- Supabase Support performs a managed PostGIS schema relocation; or
- a separately approved backup/drop/recreate/restore operation moves PostGIS from `public` to a non-exposed schema.

DIREKT must not perform the destructive relocation during Phase 10 without a tested backup, dependency inventory, restore exercise, and explicit approval.

## Supabase promotion result

The Supabase development activation gate is complete for Phase 10 synthetic-only infrastructure. Cloud Run recovery may proceed subject to its independent pinned-secret, private-IAM, and readiness controls documented in `docs/phase10/CLOUD_RUN_DEVELOPMENT_RECOVERY.md`.

Phase 11 remains blocked.
