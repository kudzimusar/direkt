# Phase 10 Supabase development activation

**Project:** `direct-app`  
**Project ref:** `aeeuscifrxcjmnswqwnq`  
**Region:** `ap-northeast-1`  
**Data boundary:** synthetic-only development data; no Phase 11 participant data

## Activation checkpoint

The protected `DIREKT Supabase development activation` workflow was run from reviewed `main` source `47ec3e6d44055be76d7902971173b5797056aad3`.

Independent live inspection confirmed:

- the project identity and Tokyo-region binding are correct;
- PostgreSQL is healthy;
- `PostGIS_Version()` succeeds;
- all 33 repository migrations through `202607171050_commercial_adjustment_integrity.sql` are recorded once with valid checksums;
- the required DIREKT schemas and platform tables exist;
- `provider-evidence`, `provider-media-private`, `provider-media-public`, and `system-exports` exist and are private;
- the storage object count is zero.

This cleared the original Cloud Run readiness cause: PostGIS and the DIREKT schema are now available.

## Security-advisor hardening

The first live advisor review found two exposed-schema errors:

1. RLS disabled on the DIREKT-owned `public.direkt_schema_migrations` ledger;
2. RLS disabled on PostGIS-owned `public.spatial_ref_sys`.

The DIREKT migration ledger is application-owned and is hardened by `202607180925_supabase_exposed_schema_hardening.sql`:

- enable RLS;
- remove privileges from browser-facing `anon` and `authenticated` roles;
- preserve trusted database migration/runtime access.

## Managed PostGIS ownership boundary

`public.spatial_ref_sys` and the PostGIS extension are owned by Supabase's managed `supabase_admin` role. The repository migration role is `postgres` and is not a member of that owner role.

A protected activation attempt against merge commit `2d516ce485df06345a965663f81c388e1da719c4` correctly failed before recording the new migration with:

```text
must be owner of table spatial_ref_sys
```

No partial migration was committed. The repository migration was corrected so it no longer attempts to alter or revoke privileges on a Supabase-managed extension table.

The remaining `spatial_ref_sys` advisor finding is therefore a managed-platform exception, not an application-owned migration failure. Resolution requires one of the supported paths:

- Supabase Support performs a managed PostGIS schema relocation; or
- a separately approved backup/drop/recreate/restore operation moves PostGIS from `public` to a non-exposed schema.

DIREKT must not perform the destructive relocation during Phase 10 without a tested backup, dependency inventory, restore exercise, and explicit approval.

## Promotion condition

Before Cloud Run is rerun:

1. merge the ownership-safe hardening correction;
2. rerun the protected Supabase activation from the exact merged `main` SHA;
3. confirm the custom migration ledger contains the hardening migration exactly once;
4. confirm RLS and revoked browser-role grants on `public.direkt_schema_migrations`;
5. reconfirm PostGIS, required schemas, all four private buckets, and zero unintended objects;
6. retain the managed `spatial_ref_sys` exception in the Phase 10 risk/decision record.

Phase 11 remains blocked.
