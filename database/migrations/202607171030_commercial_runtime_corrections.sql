ALTER TABLE commercial.subscription_events
  DROP CONSTRAINT subscription_events_safe_metadata;
ALTER TABLE commercial.payment_events
  DROP CONSTRAINT payment_events_safe_metadata;
ALTER TABLE commercial.webhook_receipts
  DROP CONSTRAINT webhook_receipts_safe_metadata;
ALTER TABLE commercial.commercial_events
  DROP CONSTRAINT commercial_events_safe_metadata;

ALTER TABLE commercial.subscription_events
  ADD CONSTRAINT subscription_events_safe_metadata CHECK (
    jsonb_typeof(safe_metadata) = 'object'
    AND safe_metadata::text !~* '"(contact|phone|email|evidence|objectKey|coordinates|review|complaint|rawPayload|rawBody|payload)"[[:space:]]*:'
  );
ALTER TABLE commercial.payment_events
  ADD CONSTRAINT payment_events_safe_metadata CHECK (
    jsonb_typeof(safe_metadata) = 'object'
    AND safe_metadata::text !~* '"(contact|phone|email|evidence|objectKey|coordinates|review|complaint|rawPayload|rawBody|payload)"[[:space:]]*:'
  );
ALTER TABLE commercial.webhook_receipts
  ADD CONSTRAINT webhook_receipts_safe_metadata CHECK (
    jsonb_typeof(safe_metadata) = 'object'
    AND safe_metadata::text !~* '"(contact|phone|email|evidence|objectKey|coordinates|review|complaint|rawPayload|rawBody|payload)"[[:space:]]*:'
  );
ALTER TABLE commercial.commercial_events
  ADD CONSTRAINT commercial_events_safe_metadata CHECK (
    jsonb_typeof(safe_metadata) = 'object'
    AND safe_metadata::text !~* '"(contact|phone|email|evidence|objectKey|coordinates|review|complaint|rawPayload|rawBody|payload)"[[:space:]]*:'
  );

CREATE OR REPLACE FUNCTION commercial.resolve_provider_context(
  actor_identity_uuid uuid,
  required_permission text
)
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  provider_ids uuid[];
BEGIN
  SELECT array_agg(DISTINCT assignments.provider_id ORDER BY assignments.provider_id)
  INTO provider_ids
  FROM authz.role_assignments AS assignments
  JOIN authz.roles AS roles ON roles.id = assignments.role_id
  JOIN authz.role_permissions AS role_permissions ON role_permissions.role_id = roles.id
  JOIN authz.permissions AS permissions ON permissions.id = role_permissions.permission_id
  WHERE assignments.identity_id = actor_identity_uuid
    AND assignments.scope_type = 'provider'
    AND assignments.provider_id IS NOT NULL
    AND assignments.revoked_at IS NULL
    AND assignments.starts_at <= now()
    AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
    AND permissions.permission_key = required_permission;

  IF COALESCE(cardinality(provider_ids), 0) <> 1 THEN
    RAISE EXCEPTION 'An unambiguous active commercial provider workspace was not found';
  END IF;
  RETURN provider_ids[1];
END;
$$;

CREATE OR REPLACE FUNCTION commercial.reconcile_payment_intent(
  target_payment_intent_id uuid,
  target_policy_version text
)
RETURNS commercial.reconciliation_cases
LANGUAGE plpgsql
AS $$
DECLARE
  payment_record commercial.payment_intents;
  invoice_record commercial.invoices;
  received_total bigint;
  reversed_total bigint;
  expected_net bigint;
  observed_net bigint;
  latest_transaction_id uuid;
  reconciliation_record commercial.reconciliation_cases;
BEGIN
  SELECT * INTO payment_record
  FROM commercial.payment_intents
  WHERE id = target_payment_intent_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment intent not found';
  END IF;
  SELECT * INTO invoice_record FROM commercial.invoices WHERE id = payment_record.invoice_id;

  SELECT
    COALESCE(sum(amount_minor) FILTER (WHERE transaction_type = 'payment_received'), 0),
    COALESCE(sum(amount_minor) FILTER (WHERE transaction_type = 'payment_reversed'), 0),
    (array_agg(id ORDER BY posted_at DESC, id DESC))[1]
  INTO received_total, reversed_total, latest_transaction_id
  FROM commercial.ledger_transactions
  WHERE payment_intent_id = payment_record.id;

  expected_net := CASE
    WHEN payment_record.status = 'succeeded' THEN payment_record.amount_minor
    WHEN payment_record.status = 'reversed' THEN 0
    ELSE 0
  END;
  observed_net := received_total - reversed_total;

  IF payment_record.amount_minor <> invoice_record.total_minor THEN
    reconciliation_record := commercial.open_reconciliation_case(
      payment_record.provider_id,
      invoice_record.id,
      payment_record.id,
      latest_transaction_id,
      'PAYMENT_INVOICE_AMOUNT_MISMATCH',
      invoice_record.total_minor,
      payment_record.amount_minor,
      payment_record.currency,
      target_policy_version
    );
    RETURN reconciliation_record;
  END IF;

  IF payment_record.status IN ('succeeded', 'reversed') AND observed_net <> expected_net THEN
    reconciliation_record := commercial.open_reconciliation_case(
      payment_record.provider_id,
      invoice_record.id,
      payment_record.id,
      latest_transaction_id,
      'PAYMENT_LEDGER_NET_MISMATCH',
      expected_net,
      observed_net,
      payment_record.currency,
      target_policy_version
    );
    RETURN reconciliation_record;
  END IF;

  IF (payment_record.status = 'succeeded' AND invoice_record.status <> 'paid')
    OR (payment_record.status = 'reversed' AND invoice_record.status <> 'open') THEN
    reconciliation_record := commercial.open_reconciliation_case(
      payment_record.provider_id,
      invoice_record.id,
      payment_record.id,
      latest_transaction_id,
      'PAYMENT_INVOICE_STATE_MISMATCH',
      payment_record.amount_minor,
      observed_net,
      payment_record.currency,
      target_policy_version
    );
    RETURN reconciliation_record;
  END IF;

  RETURN NULL;
END;
$$;
