# RC7 Google Maps owner bootstrap

RC7 requires **one serious owner-scoped Cloud Shell action** before the corrective source PR is merged. GitHub automation must not grant itself IAM, enable APIs, create budget controls or alter quotas.

The source-controlled bootstrap is `scripts/rc7/bootstrap-maps-managed.sh`. It performs only the owner-authorized preparation needed by the exact-main synthetic proof:

- enables Maps SDK for Android, Geocoding API v4, API Keys, Cloud Run, service-usage and billing-budget dependencies;
- refuses to continue if Places or Routes is enabled;
- creates or lowers/verifies a monthly RC7 budget of 1 unit in the billing account's fixed currency with 50%, 80% and 100% thresholds;
- sets the Geocoding request ceiling to 60 requests per minute;
- grants the existing GitHub deployer time-limited API-key administration only for the restricted Android synthetic key, plus service-usage and log viewing;
- grants the assigned Cloud Run runtime service account time-limited `roles/serviceusage.serviceUsageConsumer` authority for the OAuth-authenticated Geocoding v4 canary;
- creates no backend Maps API key, Secret Manager value, VPC, subnet, router, Cloud NAT gateway or static egress address.

Backend Geocoding uses the user-managed Cloud Run service identity. The application requests an OAuth access token from the Google metadata server with `enforce_scopes=true` and the single scope `https://www.googleapis.com/auth/maps-platform.geocode.address`.

The 1-unit billing-currency budget is an alerting guardrail, not an automatic billing shutoff. The fail-closed runtime switches, 60-request/minute quota, restricted Android key, downscoped backend OAuth token and post-proof Cloud Run Job deletion are the enforceable controls.

The temporary IAM condition expires automatically, by default eight hours after execution. The bootstrap never creates, reads or prints any credential value.

## Exact Cloud Shell execution

From an authenticated Google Cloud Shell with owner-equivalent authority for `direkt-dev-502701`, run the corrective branch exactly:

```bash
set -euo pipefail
rm -rf ~/direkt-rc7-bootstrap
git clone https://github.com/kudzimusar/direkt.git ~/direkt-rc7-bootstrap
cd ~/direkt-rc7-bootstrap
git fetch origin fix/rc7-service-identity-oauth
git checkout --detach origin/fix/rc7-service-identity-oauth
bash scripts/rc7/bootstrap-maps-managed.sh
```

A valid terminal receipt begins with:

```text
RC7_MAPS_BOOTSTRAP|PASS
```

It must also include:

```text
backend_authentication=service_identity_oauth
backend_api_key_created=false
backend_secret_value_created=false
backend_cloud_nat_created=false
production_authorization=false
```

Do not paste any credential or secret value into GitHub, ChatGPT, the repository or the Cloud Shell command. The script does not request one.
