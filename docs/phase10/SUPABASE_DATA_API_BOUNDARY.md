# Supabase Data API boundary

DIREKT uses direct PostgreSQL from the backend and the separate Supabase Storage API. The application does not rely on PostgREST or GraphQL database endpoints.

Phase 10 therefore keeps a deliberately empty `direkt_api_disabled` schema as the only permitted PostgREST exposure target. The 13 DIREKT application schemas remain inaccessible to the `anon` and `authenticated` database roles, and the application migration ledger remains private.

The hosted PostgREST schema setting is a managed-platform control and must be applied through a protected operation after the empty schema migration exists. Live verification must also prove that `public.spatial_ref_sys` is not reachable through the Data API. Supabase-managed PostGIS ownership is not modified by DIREKT migrations.

RLS is not enabled blindly on backend-only application tables. Before any future architecture exposes a DIREKT schema directly through the Supabase Data API, that change requires a dedicated RLS policy design, tenant-isolation review and regression suite.
