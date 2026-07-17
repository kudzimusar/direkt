from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text()
    if text.count(old) != 1:
        raise SystemExit(f"Expected one marker in {path}; found {text.count(old)}")
    file.write_text(text.replace(old, new))


replace_once(
    "docs/INDEX.md",
    "- [Phase 10 Handoff from Phase 9](phase10/HANDOFF_FROM_PHASE9.md)",
    "- [Phase 10 Handoff from Phase 9](phase10/HANDOFF_FROM_PHASE9.md)\n- [Phase 10 Infrastructure Activation Contract](phase10/INFRASTRUCTURE_ACTIVATION_CONTRACT.md)",
)

replace_once(
    "docs/operations/CI_CD.md",
    "## Later product pipelines\n\n### Backend",
    "## Managed development deployment pipelines\n\n### Supabase development activation\n\n`.github/workflows/supabase-development-activate.yml` is manual, main-only and protected by the `development` Environment. It verifies the exact DIREKT project, an exact source commit, migrations, PostGIS, private buckets and sanitized advisor evidence.\n\n### Cloud Run development API\n\n`.github/workflows/cloud-run-development-deploy.yml` is manual, main-only and protected by the `development` Environment. It uses GitHub OIDC/Workload Identity Federation, verifies an exact source commit, builds an immutable SHA-tagged image, binds runtime secret references, deploys the synthetic-only API and runs readiness smoke tests. Private invocation is the default; `public-synthetic` is an explicit protected-Vercel integration mode and does not authorize real data or a pilot.\n\n### Vercel Preview/Staging portal\n\nThe Vercel project is configured in the provider dashboard with root `admin/direkt-operations-portal`, Preview deployment and deployment protection. Phase 10 URLs remain no-indexed and use only the server-side DIREKT API base URL and portal session configuration. No database or Supabase server credential enters the browser or Vercel client bundle.\n\n## Later product pipelines\n\n### Backend",
)
replace_once(
    "docs/operations/CI_CD.md",
    "- Production deployments require manual approval and current-head verification.\n- Database migrations are explicit and environment-specific.",
    "- Synthetic-only managed development and protected staging deployment are authorized during Phase 10.\n- A development/staging URL is not a Phase 11 pilot or Phase 12 production release.\n- Bootstrap workflows that require the default branch may be promoted through a narrow reviewed PR and synchronized back without force-pushing.\n- Production deployments require manual approval and current-head verification.\n- Database migrations are explicit and environment-specific.",
)
