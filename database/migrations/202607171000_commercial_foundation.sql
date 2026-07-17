CREATE SCHEMA IF NOT EXISTS commercial;

CREATE FUNCTION commercial.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

INSERT INTO authz.permissions (permission_key, description) VALUES
  ('commercial.products.read', 'Read the approved commercial product and price catalogue.'),
  ('commercial.products.manage', 'Activate or retire commercial products and prices.'),
  ('commercial.subscriptions.read', 'Read provider-scoped subscription and entitlement state.'),
  ('commercial.subscriptions.manage', 'Create and transition provider-scoped subscriptions.'),
  ('commercial.invoices.read', 'Read provider-scoped invoices and safe receipts.'),
  ('commercial.payments.read', 'Read provider-scoped payment intent state.'),
  ('commercial.payments.initiate', 'Create retry-safe provider-scoped payment intents.'),
  ('commercial.reconciliation.read', 'Read commercial reconciliation and exception queues.'),
  ('commercial.reconciliation.manage', 'Investigate and transition commercial reconciliation cases.'),
  ('commercial.adjustments.request', 'Request a bounded commercial adjustment or synthetic refund.'),
  ('commercial.adjustments.approve', 'Approve or reject a high-risk commercial adjustment under separation of duties.')
ON CONFLICT (permission_key) DO NOTHING;

WITH grants(role_key, permission_key) AS (
  VALUES
    ('provider_owner', 'commercial.products.read'),
    ('provider_owner', 'commercial.subscriptions.read'),
    ('provider_owner', 'commercial.subscriptions.manage'),
    ('provider_owner', 'commercial.invoices.read'),
    ('provider_owner', 'commercial.payments.read'),
    ('provider_owner', 'commercial.payments.initiate'),
    ('provider_member', 'commercial.products.read'),
    ('provider_member', 'commercial.subscriptions.read'),
    ('provider_member', 'commercial.invoices.read'),
    ('provider_member', 'commercial.payments.read'),
    ('provider_responder', 'commercial.products.read'),
    ('finance', 'commercial.products.read'),
    ('finance', 'commercial.products.manage'),
    ('finance', 'commercial.subscriptions.read'),
    ('finance', 'commercial.subscriptions.manage'),
    ('finance', 'commercial.invoices.read'),
    ('finance', 'commercial.payments.read'),
    ('finance', 'commercial.reconciliation.read'),
    ('finance', 'commercial.reconciliation.manage'),
    ('finance', 'commercial.adjustments.request'),
    ('finance', 'commercial.adjustments.approve'),
    ('auditor', 'commercial.products.read'),
    ('auditor', 'commercial.subscriptions.read'),
    ('auditor', 'commercial.invoices.read'),
    ('auditor', 'commercial.payments.read'),
    ('auditor', 'commercial.reconciliation.read'),
    ('admin', 'commercial.products.read'),
    ('admin', 'commercial.products.manage'),
    ('admin', 'commercial.subscriptions.read'),
    ('admin', 'commercial.subscriptions.manage'),
    ('admin', 'commercial.invoices.read'),
    ('admin', 'commercial.payments.read'),
    ('admin', 'commercial.payments.initiate'),
    ('admin', 'commercial.reconciliation.read'),
    ('admin', 'commercial.reconciliation.manage'),
    ('admin', 'commercial.adjustments.request'),
    ('admin', 'commercial.adjustments.approve')
)
INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM grants
JOIN authz.roles AS roles USING (role_key)
JOIN authz.permissions AS permissions USING (permission_key)
ON CONFLICT DO NOTHING;

CREATE TABLE commercial.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  policy_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  retired_at timestamptz,
  CONSTRAINT products_key_format CHECK (product_key ~ '^[a-z][a-z0-9_]{2,63}$'),
  CONSTRAINT products_name_length CHECK (length(btrim(name)) BETWEEN 3 AND 120),
  CONSTRAINT products_description_length CHECK (length(btrim(description)) BETWEEN 20 AND 500),
  CONSTRAINT products_status_allowed CHECK (status IN ('active', 'retired')),
  CONSTRAINT products_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  CONSTRAINT products_retirement_consistent CHECK (
    (status = 'active' AND retired_at IS NULL)
    OR (status = 'retired' AND retired_at IS NOT NULL)
  )
);

CREATE TRIGGER products_touch_updated_at
BEFORE UPDATE ON commercial.products
FOR EACH ROW EXECUTE FUNCTION commercial.touch_updated_at();

CREATE TABLE commercial.prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES commercial.products(id) ON DELETE RESTRICT,
  price_key text NOT NULL UNIQUE,
  currency text NOT NULL,
  amount_minor bigint NOT NULL,
  billing_interval text NOT NULL,
  interval_count integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active',
  effective_from timestamptz NOT NULL DEFAULT now(),
  retired_at timestamptz,
  policy_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prices_key_format CHECK (price_key ~ '^[a-z][a-z0-9_]{2,79}$'),
  CONSTRAINT prices_currency_format CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT prices_amount_positive CHECK (amount_minor > 0),
  CONSTRAINT prices_interval_allowed CHECK (billing_interval IN ('monthly', 'annual', 'one_time')),
  CONSTRAINT prices_interval_count_valid CHECK (interval_count BETWEEN 1 AND 24),
  CONSTRAINT prices_status_allowed CHECK (status IN ('active', 'retired')),
  CONSTRAINT prices_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  CONSTRAINT prices_retirement_consistent CHECK (
    (status = 'active' AND retired_at IS NULL)
    OR (status = 'retired' AND retired_at IS NOT NULL AND retired_at > effective_from)
  )
);

CREATE UNIQUE INDEX prices_one_active_scope_idx
  ON commercial.prices (product_id, currency, billing_interval, interval_count)
  WHERE status = 'active';

CREATE TRIGGER prices_touch_updated_at
BEFORE UPDATE ON commercial.prices
FOR EACH ROW EXECUTE FUNCTION commercial.touch_updated_at();

CREATE TABLE commercial.product_entitlements (
  product_id uuid NOT NULL REFERENCES commercial.products(id) ON DELETE RESTRICT,
  entitlement_key text NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  limit_value bigint,
  limit_unit text,
  status text NOT NULL DEFAULT 'active',
  policy_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  retired_at timestamptz,
  PRIMARY KEY (product_id, entitlement_key),
  CONSTRAINT product_entitlements_key_format CHECK (
    entitlement_key ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'
  ),
  CONSTRAINT product_entitlements_name_length CHECK (length(btrim(display_name)) BETWEEN 3 AND 120),
  CONSTRAINT product_entitlements_description_length CHECK (length(btrim(description)) BETWEEN 12 AND 500),
  CONSTRAINT product_entitlements_limit_valid CHECK (
    (limit_value IS NULL AND limit_unit IS NULL)
    OR (limit_value > 0 AND length(btrim(limit_unit)) BETWEEN 1 AND 40)
  ),
  CONSTRAINT product_entitlements_status_allowed CHECK (status IN ('active', 'retired')),
  CONSTRAINT product_entitlements_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  CONSTRAINT product_entitlements_retirement_consistent CHECK (
    (status = 'active' AND retired_at IS NULL)
    OR (status = 'retired' AND retired_at IS NOT NULL)
  )
);

CREATE TABLE commercial.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  product_id uuid NOT NULL REFERENCES commercial.products(id) ON DELETE RESTRICT,
  price_id uuid NOT NULL REFERENCES commercial.prices(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending',
  revision integer NOT NULL DEFAULT 1,
  current_period_start timestamptz,
  current_period_end timestamptz,
  grace_ends_at timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  cancelled_at timestamptz,
  expired_at timestamptz,
  policy_version text NOT NULL,
  idempotency_key_hash character(64) NOT NULL,
  request_fingerprint character(64) NOT NULL,
  created_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_status_allowed CHECK (
    status IN ('pending', 'active', 'grace', 'past_due', 'cancelled', 'expired')
  ),
  CONSTRAINT subscriptions_revision_positive CHECK (revision >= 1),
  CONSTRAINT subscriptions_period_consistent CHECK (
    (current_period_start IS NULL AND current_period_end IS NULL)
    OR (current_period_start IS NOT NULL AND current_period_end > current_period_start)
  ),
  CONSTRAINT subscriptions_grace_consistent CHECK (
    grace_ends_at IS NULL OR (current_period_end IS NOT NULL AND grace_ends_at > current_period_end)
  ),
  CONSTRAINT subscriptions_cancelled_consistent CHECK (
    (status = 'cancelled' AND cancelled_at IS NOT NULL AND expired_at IS NULL)
    OR (status <> 'cancelled' AND cancelled_at IS NULL)
  ),
  CONSTRAINT subscriptions_expired_consistent CHECK (
    (status = 'expired' AND expired_at IS NOT NULL)
    OR (status <> 'expired' AND expired_at IS NULL)
  ),
  CONSTRAINT subscriptions_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  CONSTRAINT subscriptions_key_hash_format CHECK (idempotency_key_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT subscriptions_fingerprint_format CHECK (request_fingerprint ~ '^[0-9a-f]{64}$'),
  UNIQUE (provider_id, idempotency_key_hash)
);

CREATE UNIQUE INDEX subscriptions_one_current_product_idx
  ON commercial.subscriptions (provider_id, product_id)
  WHERE status IN ('pending', 'active', 'grace', 'past_due');
CREATE INDEX subscriptions_provider_idx
  ON commercial.subscriptions (provider_id, updated_at DESC);
CREATE INDEX subscriptions_operations_idx
  ON commercial.subscriptions (status, updated_at DESC);

CREATE TRIGGER subscriptions_touch_updated_at
BEFORE UPDATE ON commercial.subscriptions
FOR EACH ROW EXECUTE FUNCTION commercial.touch_updated_at();

CREATE TABLE commercial.subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES commercial.subscriptions(id) ON DELETE RESTRICT,
  sequence integer NOT NULL,
  from_status text,
  to_status text NOT NULL,
  actor_kind text NOT NULL,
  actor_identity_id uuid REFERENCES account.identities(id) ON DELETE RESTRICT,
  reason text NOT NULL,
  policy_version text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  safe_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT subscription_events_actor_allowed CHECK (actor_kind IN ('provider', 'operations', 'system')),
  CONSTRAINT subscription_events_actor_consistent CHECK (
    (actor_kind = 'system' AND actor_identity_id IS NULL)
    OR (actor_kind <> 'system' AND actor_identity_id IS NOT NULL)
  ),
  CONSTRAINT subscription_events_reason_length CHECK (length(btrim(reason)) BETWEEN 12 AND 1000),
  CONSTRAINT subscription_events_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  UNIQUE (subscription_id, sequence)
);

CREATE TABLE commercial.entitlement_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES commercial.subscriptions(id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  product_id uuid NOT NULL,
  entitlement_key text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  limit_value bigint,
  limit_unit text,
  effective_from timestamptz NOT NULL,
  effective_until timestamptz,
  granted_at timestamptz NOT NULL DEFAULT now(),
  suspended_at timestamptz,
  expired_at timestamptz,
  policy_version text NOT NULL,
  FOREIGN KEY (product_id, entitlement_key)
    REFERENCES commercial.product_entitlements(product_id, entitlement_key) ON DELETE RESTRICT,
  CONSTRAINT entitlement_grants_status_allowed CHECK (
    status IN ('active', 'limited', 'suspended', 'expired', 'revoked')
  ),
  CONSTRAINT entitlement_grants_window_valid CHECK (
    effective_until IS NULL OR effective_until > effective_from
  ),
  CONSTRAINT entitlement_grants_limit_valid CHECK (
    (limit_value IS NULL AND limit_unit IS NULL)
    OR (limit_value > 0 AND length(btrim(limit_unit)) BETWEEN 1 AND 40)
  ),
  CONSTRAINT entitlement_grants_suspension_consistent CHECK (
    (status = 'suspended' AND suspended_at IS NOT NULL)
    OR (status <> 'suspended' AND suspended_at IS NULL)
  ),
  CONSTRAINT entitlement_grants_expiry_consistent CHECK (
    (status = 'expired' AND expired_at IS NOT NULL)
    OR (status <> 'expired' AND expired_at IS NULL)
  ),
  CONSTRAINT entitlement_grants_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  UNIQUE (subscription_id, entitlement_key)
);

CREATE INDEX entitlement_grants_provider_idx
  ON commercial.entitlement_grants (provider_id, status, effective_until);

CREATE TABLE commercial.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  subscription_id uuid REFERENCES commercial.subscriptions(id) ON DELETE RESTRICT,
  invoice_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'open',
  revision integer NOT NULL DEFAULT 1,
  currency text NOT NULL,
  subtotal_minor bigint NOT NULL,
  total_minor bigint NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz NOT NULL,
  paid_at timestamptz,
  voided_at timestamptz,
  uncollectible_at timestamptz,
  policy_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoices_number_format CHECK (invoice_number ~ '^SYN-[0-9]{8}-[A-Z0-9]{8,20}$'),
  CONSTRAINT invoices_status_allowed CHECK (status IN ('open', 'paid', 'void', 'uncollectible')),
  CONSTRAINT invoices_revision_positive CHECK (revision >= 1),
  CONSTRAINT invoices_currency_format CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT invoices_amounts_valid CHECK (
    subtotal_minor > 0 AND total_minor > 0 AND total_minor >= subtotal_minor
  ),
  CONSTRAINT invoices_due_after_issue CHECK (due_at > issued_at),
  CONSTRAINT invoices_terminal_consistent CHECK (
    (status = 'open' AND paid_at IS NULL AND voided_at IS NULL AND uncollectible_at IS NULL)
    OR (status = 'paid' AND paid_at IS NOT NULL AND voided_at IS NULL AND uncollectible_at IS NULL)
    OR (status = 'void' AND paid_at IS NULL AND voided_at IS NOT NULL AND uncollectible_at IS NULL)
    OR (status = 'uncollectible' AND paid_at IS NULL AND voided_at IS NULL AND uncollectible_at IS NOT NULL)
  ),
  CONSTRAINT invoices_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80)
);

CREATE INDEX invoices_provider_idx ON commercial.invoices (provider_id, issued_at DESC);
CREATE INDEX invoices_operations_idx ON commercial.invoices (status, due_at);

CREATE TRIGGER invoices_touch_updated_at
BEFORE UPDATE ON commercial.invoices
FOR EACH ROW EXECUTE FUNCTION commercial.touch_updated_at();

CREATE TABLE commercial.invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES commercial.invoices(id) ON DELETE RESTRICT,
  line_key text NOT NULL,
  description text NOT NULL,
  product_id uuid REFERENCES commercial.products(id) ON DELETE RESTRICT,
  price_id uuid REFERENCES commercial.prices(id) ON DELETE RESTRICT,
  quantity integer NOT NULL,
  unit_amount_minor bigint NOT NULL,
  line_total_minor bigint GENERATED ALWAYS AS (quantity::bigint * unit_amount_minor) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoice_lines_key_format CHECK (line_key ~ '^[a-z][a-z0-9_]{2,79}$'),
  CONSTRAINT invoice_lines_description_length CHECK (length(btrim(description)) BETWEEN 3 AND 300),
  CONSTRAINT invoice_lines_quantity_positive CHECK (quantity BETWEEN 1 AND 1000),
  CONSTRAINT invoice_lines_amount_positive CHECK (unit_amount_minor > 0),
  UNIQUE (invoice_id, line_key)
);

CREATE TABLE commercial.payment_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  invoice_id uuid NOT NULL REFERENCES commercial.invoices(id) ON DELETE RESTRICT,
  provider_key text NOT NULL DEFAULT 'synthetic',
  external_reference text,
  status text NOT NULL DEFAULT 'pending',
  revision integer NOT NULL DEFAULT 1,
  currency text NOT NULL,
  amount_minor bigint NOT NULL,
  idempotency_key_hash character(64) NOT NULL,
  request_fingerprint character(64) NOT NULL,
  created_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  expires_at timestamptz NOT NULL,
  completed_at timestamptz,
  last_error_code text,
  policy_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_intents_provider_allowed CHECK (provider_key = 'synthetic'),
  CONSTRAINT payment_intents_external_reference_length CHECK (
    external_reference IS NULL OR length(btrim(external_reference)) BETWEEN 8 AND 160
  ),
  CONSTRAINT payment_intents_status_allowed CHECK (
    status IN ('pending', 'requires_action', 'processing', 'succeeded', 'failed', 'cancelled', 'expired', 'reversed')
  ),
  CONSTRAINT payment_intents_revision_positive CHECK (revision >= 1),
  CONSTRAINT payment_intents_currency_format CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT payment_intents_amount_positive CHECK (amount_minor > 0),
  CONSTRAINT payment_intents_key_hash_format CHECK (idempotency_key_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT payment_intents_fingerprint_format CHECK (request_fingerprint ~ '^[0-9a-f]{64}$'),
  CONSTRAINT payment_intents_expiry_after_creation CHECK (expires_at > created_at),
  CONSTRAINT payment_intents_completion_consistent CHECK (
    (status IN ('succeeded', 'failed', 'cancelled', 'expired', 'reversed') AND completed_at IS NOT NULL)
    OR (status IN ('pending', 'requires_action', 'processing') AND completed_at IS NULL)
  ),
  CONSTRAINT payment_intents_error_length CHECK (
    last_error_code IS NULL OR last_error_code ~ '^[A-Z][A-Z0-9_]{2,79}$'
  ),
  CONSTRAINT payment_intents_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  UNIQUE (provider_id, idempotency_key_hash),
  UNIQUE (provider_key, external_reference)
);

CREATE INDEX payment_intents_provider_idx
  ON commercial.payment_intents (provider_id, created_at DESC);
CREATE INDEX payment_intents_operations_idx
  ON commercial.payment_intents (status, updated_at DESC);

CREATE TRIGGER payment_intents_touch_updated_at
BEFORE UPDATE ON commercial.payment_intents
FOR EACH ROW EXECUTE FUNCTION commercial.touch_updated_at();

CREATE TABLE commercial.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_intent_id uuid NOT NULL REFERENCES commercial.payment_intents(id) ON DELETE RESTRICT,
  sequence integer NOT NULL,
  from_status text,
  to_status text NOT NULL,
  event_source text NOT NULL,
  external_event_id text,
  reason_code text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  safe_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT payment_events_source_allowed CHECK (event_source IN ('provider', 'operations', 'synthetic_webhook', 'system')),
  CONSTRAINT payment_events_external_id_length CHECK (
    external_event_id IS NULL OR length(btrim(external_event_id)) BETWEEN 8 AND 160
  ),
  CONSTRAINT payment_events_reason_format CHECK (reason_code ~ '^[A-Z][A-Z0-9_]{2,79}$'),
  UNIQUE (payment_intent_id, sequence)
);

CREATE TABLE commercial.webhook_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key text NOT NULL,
  external_event_id text NOT NULL,
  event_type text NOT NULL,
  event_fingerprint character(64) NOT NULL,
  signature_verified boolean NOT NULL,
  timestamp_verified boolean NOT NULL,
  payment_intent_id uuid REFERENCES commercial.payment_intents(id) ON DELETE RESTRICT,
  occurred_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processing_outcome text NOT NULL DEFAULT 'received',
  rejection_code text,
  safe_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT webhook_receipts_provider_allowed CHECK (provider_key = 'synthetic'),
  CONSTRAINT webhook_receipts_external_id_length CHECK (length(btrim(external_event_id)) BETWEEN 8 AND 160),
  CONSTRAINT webhook_receipts_event_type_format CHECK (event_type ~ '^[a-z][a-z0-9_.]{2,79}$'),
  CONSTRAINT webhook_receipts_fingerprint_format CHECK (event_fingerprint ~ '^[0-9a-f]{64}$'),
  CONSTRAINT webhook_receipts_outcome_allowed CHECK (
    processing_outcome IN ('received', 'processed', 'rejected', 'duplicate', 'failed')
  ),
  CONSTRAINT webhook_receipts_rejection_consistent CHECK (
    (processing_outcome IN ('rejected', 'failed') AND rejection_code IS NOT NULL)
    OR (processing_outcome NOT IN ('rejected', 'failed') AND rejection_code IS NULL)
  ),
  CONSTRAINT webhook_receipts_rejection_format CHECK (
    rejection_code IS NULL OR rejection_code ~ '^[A-Z][A-Z0-9_]{2,79}$'
  ),
  UNIQUE (provider_key, external_event_id)
);

CREATE INDEX webhook_receipts_processing_idx
  ON commercial.webhook_receipts (processing_outcome, received_at);

CREATE TABLE commercial.ledger_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  invoice_id uuid REFERENCES commercial.invoices(id) ON DELETE RESTRICT,
  payment_intent_id uuid REFERENCES commercial.payment_intents(id) ON DELETE RESTRICT,
  transaction_type text NOT NULL,
  external_reference text,
  currency text NOT NULL,
  amount_minor bigint NOT NULL,
  policy_version text NOT NULL,
  posted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ledger_transactions_type_allowed CHECK (
    transaction_type IN ('invoice_issued', 'payment_received', 'payment_reversed', 'adjustment', 'refund')
  ),
  CONSTRAINT ledger_transactions_external_reference_length CHECK (
    external_reference IS NULL OR length(btrim(external_reference)) BETWEEN 8 AND 160
  ),
  CONSTRAINT ledger_transactions_currency_format CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT ledger_transactions_amount_positive CHECK (amount_minor > 0),
  CONSTRAINT ledger_transactions_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80)
);

CREATE INDEX ledger_transactions_provider_idx
  ON commercial.ledger_transactions (provider_id, posted_at DESC);

CREATE TABLE commercial.ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_transaction_id uuid NOT NULL REFERENCES commercial.ledger_transactions(id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  account_key text NOT NULL,
  currency text NOT NULL,
  debit_minor bigint NOT NULL DEFAULT 0,
  credit_minor bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ledger_entries_account_format CHECK (account_key ~ '^[a-z][a-z0-9_]{2,79}$'),
  CONSTRAINT ledger_entries_currency_format CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT ledger_entries_amount_valid CHECK (
    debit_minor >= 0 AND credit_minor >= 0
    AND ((debit_minor > 0 AND credit_minor = 0) OR (credit_minor > 0 AND debit_minor = 0))
  )
);

CREATE INDEX ledger_entries_provider_idx
  ON commercial.ledger_entries (provider_id, created_at DESC);

CREATE TABLE commercial.reconciliation_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  invoice_id uuid REFERENCES commercial.invoices(id) ON DELETE RESTRICT,
  payment_intent_id uuid REFERENCES commercial.payment_intents(id) ON DELETE RESTRICT,
  ledger_transaction_id uuid REFERENCES commercial.ledger_transactions(id) ON DELETE RESTRICT,
  mismatch_code text NOT NULL,
  expected_amount_minor bigint,
  observed_amount_minor bigint,
  currency text,
  status text NOT NULL DEFAULT 'open',
  revision integer NOT NULL DEFAULT 1,
  assigned_to_identity_id uuid REFERENCES account.identities(id) ON DELETE RESTRICT,
  resolution_code text,
  policy_version text NOT NULL,
  opened_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  closed_at timestamptz,
  CONSTRAINT reconciliation_cases_mismatch_format CHECK (mismatch_code ~ '^[A-Z][A-Z0-9_]{2,79}$'),
  CONSTRAINT reconciliation_cases_amounts_valid CHECK (
    expected_amount_minor IS NULL OR expected_amount_minor >= 0
  ),
  CONSTRAINT reconciliation_cases_observed_valid CHECK (
    observed_amount_minor IS NULL OR observed_amount_minor >= 0
  ),
  CONSTRAINT reconciliation_cases_currency_format CHECK (
    currency IS NULL OR currency ~ '^[A-Z]{3}$'
  ),
  CONSTRAINT reconciliation_cases_status_allowed CHECK (
    status IN ('open', 'investigating', 'resolved', 'closed')
  ),
  CONSTRAINT reconciliation_cases_revision_positive CHECK (revision >= 1),
  CONSTRAINT reconciliation_cases_resolution_format CHECK (
    resolution_code IS NULL OR resolution_code ~ '^[A-Z][A-Z0-9_]{2,79}$'
  ),
  CONSTRAINT reconciliation_cases_terminal_consistent CHECK (
    (status IN ('open', 'investigating') AND resolved_at IS NULL AND closed_at IS NULL)
    OR (status = 'resolved' AND resolved_at IS NOT NULL AND closed_at IS NULL)
    OR (status = 'closed' AND resolved_at IS NOT NULL AND closed_at IS NOT NULL)
  ),
  CONSTRAINT reconciliation_cases_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80)
);

CREATE INDEX reconciliation_cases_queue_idx
  ON commercial.reconciliation_cases (status, opened_at);

CREATE TRIGGER reconciliation_cases_touch_updated_at
BEFORE UPDATE ON commercial.reconciliation_cases
FOR EACH ROW EXECUTE FUNCTION commercial.touch_updated_at();

CREATE TABLE commercial.reconciliation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_case_id uuid NOT NULL REFERENCES commercial.reconciliation_cases(id) ON DELETE RESTRICT,
  sequence integer NOT NULL,
  from_status text,
  to_status text NOT NULL,
  actor_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  reason_code text NOT NULL,
  reason text NOT NULL,
  policy_version text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reconciliation_events_reason_code_format CHECK (reason_code ~ '^[A-Z][A-Z0-9_]{2,79}$'),
  CONSTRAINT reconciliation_events_reason_length CHECK (length(btrim(reason)) BETWEEN 12 AND 1000),
  CONSTRAINT reconciliation_events_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  UNIQUE (reconciliation_case_id, sequence)
);

CREATE TABLE commercial.adjustment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  invoice_id uuid REFERENCES commercial.invoices(id) ON DELETE RESTRICT,
  payment_intent_id uuid REFERENCES commercial.payment_intents(id) ON DELETE RESTRICT,
  adjustment_type text NOT NULL,
  currency text NOT NULL,
  amount_minor bigint NOT NULL,
  status text NOT NULL DEFAULT 'requested',
  revision integer NOT NULL DEFAULT 1,
  requested_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  request_reason text NOT NULL,
  policy_version text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  applied_at timestamptz,
  CONSTRAINT adjustment_requests_type_allowed CHECK (
    adjustment_type IN ('credit', 'debit', 'synthetic_refund')
  ),
  CONSTRAINT adjustment_requests_currency_format CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT adjustment_requests_amount_positive CHECK (amount_minor > 0),
  CONSTRAINT adjustment_requests_status_allowed CHECK (
    status IN ('requested', 'approved', 'rejected', 'applied')
  ),
  CONSTRAINT adjustment_requests_revision_positive CHECK (revision >= 1),
  CONSTRAINT adjustment_requests_reason_length CHECK (length(btrim(request_reason)) BETWEEN 20 AND 1000),
  CONSTRAINT adjustment_requests_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  CONSTRAINT adjustment_requests_terminal_consistent CHECK (
    (status = 'requested' AND decided_at IS NULL AND applied_at IS NULL)
    OR (status IN ('approved', 'rejected') AND decided_at IS NOT NULL AND applied_at IS NULL)
    OR (status = 'applied' AND decided_at IS NOT NULL AND applied_at IS NOT NULL)
  )
);

CREATE INDEX adjustment_requests_queue_idx
  ON commercial.adjustment_requests (status, requested_at);

CREATE TRIGGER adjustment_requests_touch_updated_at
BEFORE UPDATE ON commercial.adjustment_requests
FOR EACH ROW EXECUTE FUNCTION commercial.touch_updated_at();

CREATE TABLE commercial.adjustment_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_request_id uuid NOT NULL REFERENCES commercial.adjustment_requests(id) ON DELETE RESTRICT,
  approver_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  decision text NOT NULL,
  reason text NOT NULL,
  policy_version text NOT NULL,
  decided_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT adjustment_approvals_decision_allowed CHECK (decision IN ('approved', 'rejected')),
  CONSTRAINT adjustment_approvals_reason_length CHECK (length(btrim(reason)) BETWEEN 12 AND 1000),
  CONSTRAINT adjustment_approvals_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  UNIQUE (adjustment_request_id, approver_identity_id)
);

CREATE TABLE commercial.commercial_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  sequence integer NOT NULL,
  event_type text NOT NULL,
  actor_kind text NOT NULL,
  actor_identity_id uuid REFERENCES account.identities(id) ON DELETE RESTRICT,
  provider_id uuid REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  reason text NOT NULL,
  policy_version text NOT NULL,
  safe_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT commercial_events_entity_allowed CHECK (
    entity_type IN ('product', 'subscription', 'invoice', 'payment_intent', 'webhook', 'reconciliation', 'adjustment')
  ),
  CONSTRAINT commercial_events_event_format CHECK (event_type ~ '^[a-z][a-z0-9_]{2,79}$'),
  CONSTRAINT commercial_events_actor_allowed CHECK (actor_kind IN ('provider', 'operations', 'system', 'synthetic_webhook')),
  CONSTRAINT commercial_events_actor_consistent CHECK (
    (actor_kind IN ('system', 'synthetic_webhook') AND actor_identity_id IS NULL)
    OR (actor_kind IN ('provider', 'operations') AND actor_identity_id IS NOT NULL)
  ),
  CONSTRAINT commercial_events_reason_length CHECK (length(btrim(reason)) BETWEEN 12 AND 1000),
  CONSTRAINT commercial_events_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  UNIQUE (entity_type, entity_id, sequence)
);

INSERT INTO commercial.products (
  product_key,
  name,
  description,
  status,
  policy_version
) VALUES (
  'provider_workspace_core',
  'Provider workspace core',
  'Synthetic non-ranking provider workspace productivity and commercial record access.',
  'active',
  'phase9-v1'
)
ON CONFLICT (product_key) DO NOTHING;

INSERT INTO commercial.prices (
  product_id,
  price_key,
  currency,
  amount_minor,
  billing_interval,
  interval_count,
  status,
  effective_from,
  policy_version
)
SELECT
  products.id,
  'provider_workspace_core_monthly_zmw',
  'ZMW',
  15000,
  'monthly',
  1,
  'active',
  '2026-07-17T00:00:00Z'::timestamptz,
  'phase9-v1'
FROM commercial.products AS products
WHERE products.product_key = 'provider_workspace_core'
ON CONFLICT (price_key) DO NOTHING;

INSERT INTO commercial.product_entitlements (
  product_id,
  entitlement_key,
  display_name,
  description,
  status,
  policy_version
)
SELECT
  products.id,
  entitlements.entitlement_key,
  entitlements.display_name,
  entitlements.description,
  'active',
  'phase9-v1'
FROM commercial.products AS products
CROSS JOIN (
  VALUES
    (
      'provider.workspace.subscription_management',
      'Subscription management',
      'Manage the provider commercial subscription without changing provider trust or publication.'
    ),
    (
      'provider.workspace.invoice_history',
      'Invoice history',
      'Read provider-scoped commercial invoices and safe backend-confirmed receipts.'
    ),
    (
      'provider.workspace.productivity_summary',
      'Productivity summary',
      'View non-ranking workspace productivity summaries that do not create evidence-backed trust.'
    )
) AS entitlements(entitlement_key, display_name, description)
WHERE products.product_key = 'provider_workspace_core'
ON CONFLICT (product_id, entitlement_key) DO NOTHING;

COMMENT ON SCHEMA commercial IS
  'Provider commercial products, subscriptions, invoices, synthetic payments, append-only ledger and reconciliation. Commercial state never creates trust.';
COMMENT ON TABLE commercial.products IS
  'Commercial catalogue products. No product may represent or purchase verification, claim validity or discovery ranking.';
COMMENT ON TABLE commercial.entitlement_grants IS
  'Provider product access only. Entitlements do not alter verification, publication, reviews, complaints or ranking.';
COMMENT ON TABLE commercial.payment_intents IS
  'Retry-safe synthetic payment-intent state. No credentials, PINs, card data or private interaction contacts are stored.';
COMMENT ON TABLE commercial.webhook_receipts IS
  'Bounded webhook fingerprints and safe metadata only. Raw provider payload storage is deferred to an approved encrypted retention-controlled system.';
COMMENT ON TABLE commercial.ledger_entries IS
  'Append-only double-entry commercial ledger rows written only by controlled state-machine functions.';
