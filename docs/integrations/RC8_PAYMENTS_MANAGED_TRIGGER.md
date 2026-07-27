# RC8 managed sandbox payment proof trigger

STATUS=ARMED
CONFIRMATION=RUN-DIREKT-RC8-PAYMENTS-MANAGED

This one-shot trigger authorizes an exact-current-main, private Cloud Run Job proof using only existing reviewed sandbox/test credentials for MTN MoMo Collections, Stripe Checkout and PayPal Orders.

The job may create only bounded synthetic sandbox objects:

- one MTN sandbox Request to Pay using the provider test MSISDN and independent status verification;
- one unpaid Stripe test Checkout Session followed by independent server retrieval;
- one unapproved PayPal sandbox order followed by independent server retrieval;
- in-memory provider-neutral reconciliation plans covering success, duplicate suppression, mismatch review and immutable refund adjustment review.

DPO remains runtime-disabled because no DIREKT private sandbox credential is provisioned in Secret Manager. Airtel remains provider-pending. Flutterwave remains deferred and excluded.

This trigger does not authorize real money, participant data, production credentials or endpoints, browser/client payment truth, customer-to-provider service payments, escrow, wallets, marketplace payouts, direct ledger mutation, verification/publication/ranking influence, Phase 11 exit or production release.

After terminal managed evidence is recorded, the closure change must replace `STATUS=ARMED` with `STATUS=CONSUMED` and remove automatic main-push execution so the sandbox proof cannot repeat unintentionally.
