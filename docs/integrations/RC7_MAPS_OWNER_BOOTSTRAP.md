# RC7 Google Maps owner bootstrap

RC7 requires **one serious owner-scoped Cloud Shell action** before the source PR is merged. This mirrors the established RC6 Secret Manager boundary: GitHub automation may add and destroy a secret version, but it must not create secret containers or grant itself IAM.

The bootstrap is source-controlled at `scripts/rc7/bootstrap-maps-managed.sh`. It performs only the infrastructure preparation that requires owner authority:

- enables Maps SDK for Android, Geocoding, API Keys, Compute, Cloud Run, Secret Manager and billing-budget APIs;
- refuses to continue if Places or Routes is enabled;
- creates the stable no-recurring-cost RC7 VPC and `/26` Direct VPC subnet;
- creates the empty `direkt-google-maps-geocoding-api-key` Secret Manager container without adding a secret value;
- creates or lowers/verifies a monthly RC7 budget of 1 unit in the billing account’s fixed currency with 50%, 80% and 100% thresholds;
- sets the Geocoding request ceiling to 60 requests per minute;
- grants the existing GitHub deployer only time-limited API-key, network, service-viewer and log-viewer authority;
- grants time-limited secret-version/viewer access to the deployer and time-limited secret accessor access to the private runtime identity;
- labels the empty secret container as the owner-controlled bootstrap receipt.

The 1-unit billing-currency budget is an alerting guardrail, not an automatic billing shutoff. The fail-closed runtime switches, 60-request/minute quota, API/key restrictions and post-proof resource cleanup remain the enforceable cost controls.

The temporary IAM condition expires automatically, by default eight hours after execution. The script never creates, reads or prints an API-key value and never creates a secret version.

## Exact Cloud Shell execution

From an authenticated Google Cloud Shell with owner-equivalent authority for `direkt-dev-502701`, run:

```bash
set -euo pipefail
rm -rf ~/direkt-rc7-bootstrap
git clone https://github.com/kudzimusar/direkt.git ~/direkt-rc7-bootstrap
cd ~/direkt-rc7-bootstrap
git fetch origin integration/runtime-closure-261
git checkout --detach origin/integration/runtime-closure-261
bash scripts/rc7/bootstrap-maps-managed.sh
```

A valid terminal receipt begins with:

```text
RC7_MAPS_BOOTSTRAP|PASS
```

and includes `secret_value_created=false`, the budget amount, detected billing currency, and quota controls, the temporary-authority expiry timestamp, and `production_authorization=false`.

Do not paste any credential or secret value into GitHub, ChatGPT, the repository, or the Cloud Shell command. The script does not request one.
