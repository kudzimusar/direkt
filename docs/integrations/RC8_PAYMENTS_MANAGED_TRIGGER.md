# RC8 managed sandbox payment proof trigger

STATUS=CONSUMED
CONFIRMATION=RUN-DIREKT-RC8-PAYMENTS-MANAGED

SOURCE_SHA=ccc4e9463d810ddf554182b1607c22d3a7c8c8d3
MANAGED_RUN=30241092949/1
ARTIFACT_ID=8643323319
ARTIFACT_DIGEST=sha256:bbb4600eb5a062552947e91c878dd09c6d1e4dc307ae4783c7fa1fb4cf6e4935
CONSUMED_AT=2026-07-27T05:57:50Z

This one-shot trigger authorizes an exact-current-main, private Cloud Run Job proof using only existing reviewed sandbox/test credentials for MTN MoMo Collections, Stripe Checkout and PayPal Orders.

The job may create only bounded synthetic sandbox objects:

- one MTN sandbox Request to Pay using the provider test MSISDN and independent status verification;
- one unpaid Stripe test Checkout Session followed by independent server retrieval;
- one unapproved PayPal sandbox order followed by independent server retrieval;
- in-memory provider-neutral reconciliation plans covering success, duplicate suppression, mismatch review and immutable refund adjustment review.

DPO remains runtime-disabled because no DIREKT private sandbox credential is provisioned in Secret Manager. Airtel remains provider-pending. Flutterwave remains deferred and excluded.

This trigger does not authorize real money, participant data, production credentials or endpoints, browser/client payment truth, customer-to-provider service payments, escrow, wallets, marketplace payouts, direct ledger mutation, verification/publication/ranking influence, Phase 11 exit or production release.

Terminal evidence is recorded from exact source `ccc4e9463d810ddf554182b1607c22d3a7c8c8d3`, run `30241092949/1`, artifact `8643323319` (`sha256:bbb4600eb5a062552947e91c878dd09c6d1e4dc307ae4783c7fa1fb4cf6e4935`). `STATUS=CONSUMED` and removal of automatic main-push execution prevent unintended repetition. Any future diagnostic rerun requires a reviewed source change that explicitly rearms the trigger; it cannot authorize production, participant or real-money use.
