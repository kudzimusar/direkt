CREATE UNIQUE INDEX invoices_one_open_subscription_idx
  ON commercial.invoices (subscription_id)
  WHERE subscription_id IS NOT NULL AND status = 'open';

CREATE UNIQUE INDEX payment_intents_one_current_invoice_idx
  ON commercial.payment_intents (invoice_id)
  WHERE status IN ('pending', 'requires_action', 'processing');

CREATE FUNCTION commercial.resolve_provider_context(
  actor_identity_uuid uuid,
  required_permission text
)
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  resolved_provider_id uuid;
  provider_count integer;
BEGIN
  SELECT count(DISTINCT assignments.provider_id), min(assignments.provider_id)
  INTO provider_count, resolved_provider_id
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

  IF provider_count <> 1 OR resolved_provider_id IS NULL THEN
    RAISE EXCEPTION 'An unambiguous active commercial provider workspace was not found';
  END IF;
  RETURN resolved_provider_id;
END;
$$;

CREATE FUNCTION commercial.append_subscription_event(
  target_subscription_id uuid,
  previous_status text,
  target_status text,
  target_actor_kind text,
  target_actor_identity_id uuid,
  target_reason text,
  target_policy_version text,
  target_safe_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  created_event_id uuid;
  next_sequence integer;
BEGIN
  SELECT COALESCE(max(sequence), 0) + 1
  INTO next_sequence
  FROM commercial.subscription_events
  WHERE subscription_id = target_subscription_id;

  PERFORM set_config('direkt.commercial_event_write', 'on', true);
  INSERT INTO commercial.subscription_events (
    subscription_id,
    sequence,
    from_status,
    to_status,
    actor_kind,
    actor_identity_id,
    reason,
    policy_version,
    safe_metadata
  ) VALUES (
    target_subscription_id,
    next_sequence,
    previous_status,
    target_status,
    target_actor_kind,
    target_actor_identity_id,
    target_reason,
    target_policy_version,
    COALESCE(target_safe_metadata, '{}'::jsonb)
  )
  RETURNING id INTO created_event_id;
  RETURN created_event_id;
END;
$$;

CREATE FUNCTION commercial.append_payment_event(
  target_payment_intent_id uuid,
  previous_status text,
  target_status text,
  target_event_source text,
  target_external_event_id text,
  target_reason_code text,
  target_safe_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  created_event_id uuid;
  next_sequence integer;
BEGIN
  SELECT COALESCE(max(sequence), 0) + 1
  INTO next_sequence
  FROM commercial.payment_events
  WHERE payment_intent_id = target_payment_intent_id;

  PERFORM set_config('direkt.commercial_event_write', 'on', true);
  INSERT INTO commercial.payment_events (
    payment_intent_id,
    sequence,
    from_status,
    to_status,
    event_source,
    external_event_id,
    reason_code,
    safe_metadata
  ) VALUES (
    target_payment_intent_id,
    next_sequence,
    previous_status,
    target_status,
    target_event_source,
    target_external_event_id,
    target_reason_code,
    COALESCE(target_safe_metadata, '{}'::jsonb)
  )
  RETURNING id INTO created_event_id;
  RETURN created_event_id;
END;
$$;

CREATE FUNCTION commercial.refresh_subscription_entitlements(
  target_subscription_id uuid,
  target_policy_version text
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  current_subscription commercial.subscriptions;
  target_grant_status text;
  target_effective_until timestamptz;
BEGIN
  SELECT * INTO current_subscription
  FROM commercial.subscriptions
  WHERE id = target_subscription_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;

  target_grant_status := CASE current_subscription.status
    WHEN 'active' THEN 'active'
    WHEN 'grace' THEN 'limited'
    WHEN 'past_due' THEN 'suspended'
    WHEN 'cancelled' THEN 'revoked'
    WHEN 'expired' THEN 'expired'
    ELSE 'suspended'
  END;
  target_effective_until := CASE
    WHEN current_subscription.status = 'grace' THEN current_subscription.grace_ends_at
    ELSE current_subscription.current_period_end
  END;

  PERFORM set_config('direkt.commercial_write', 'on', true);

  IF current_subscription.status IN ('active', 'grace', 'past_due') THEN
    INSERT INTO commercial.entitlement_grants (
      subscription_id,
      provider_id,
      product_id,
      entitlement_key,
      status,
      limit_value,
      limit_unit,
      effective_from,
      effective_until,
      suspended_at,
      expired_at,
      policy_version
    )
    SELECT
      current_subscription.id,
      current_subscription.provider_id,
      current_subscription.product_id,
      entitlements.entitlement_key,
      target_grant_status,
      entitlements.limit_value,
      entitlements.limit_unit,
      COALESCE(current_subscription.current_period_start, now()),
      target_effective_until,
      CASE WHEN target_grant_status = 'suspended' THEN now() ELSE NULL END,
      CASE WHEN target_grant_status = 'expired' THEN now() ELSE NULL END,
      target_policy_version
    FROM commercial.product_entitlements AS entitlements
    WHERE entitlements.product_id = current_subscription.product_id
      AND entitlements.status = 'active'
    ON CONFLICT (subscription_id, entitlement_key) DO UPDATE
    SET
      status = EXCLUDED.status,
      limit_value = EXCLUDED.limit_value,
      limit_unit = EXCLUDED.limit_unit,
      effective_from = EXCLUDED.effective_from,
      effective_until = EXCLUDED.effective_until,
      suspended_at = EXCLUDED.suspended_at,
      expired_at = EXCLUDED.expired_at,
      policy_version = EXCLUDED.policy_version;
  ELSE
    UPDATE commercial.entitlement_grants
    SET
      status = target_grant_status,
      effective_until = COALESCE(effective_until, now()),
      suspended_at = CASE WHEN target_grant_status = 'suspended' THEN now() ELSE NULL END,
      expired_at = CASE WHEN target_grant_status = 'expired' THEN now() ELSE NULL END,
      policy_version = target_policy_version
    WHERE subscription_id = current_subscription.id
      AND status IS DISTINCT FROM target_grant_status;
  END IF;
END;
$$;

CREATE FUNCTION commercial.subscription_period_end(
  period_start timestamptz,
  billing_interval_value text,
  interval_count_value integer
)
RETURNS timestamptz
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF billing_interval_value = 'monthly' THEN
    RETURN period_start + make_interval(months => interval_count_value);
  END IF;
  IF billing_interval_value = 'annual' THEN
    RETURN period_start + make_interval(years => interval_count_value);
  END IF;
  RAISE EXCEPTION 'One-time prices cannot create recurring subscriptions';
END;
$$;

CREATE FUNCTION commercial.create_subscription(
  actor_identity_uuid uuid,
  requested_product_key text,
  requested_price_key text,
  requested_policy_version text,
  requested_idempotency_key_hash character(64),
  requested_fingerprint character(64),
  target_request_id uuid DEFAULT NULL
)
RETURNS commercial.subscriptions
LANGUAGE plpgsql
AS $$
DECLARE
  resolved_provider_id uuid;
  product_record commercial.products;
  price_record commercial.prices;
  existing_subscription commercial.subscriptions;
  created_subscription commercial.subscriptions;
BEGIN
  resolved_provider_id := commercial.resolve_provider_context(
    actor_identity_uuid,
    'commercial.subscriptions.manage'
  );

  PERFORM pg_advisory_xact_lock(
    hashtextextended(resolved_provider_id::text || ':' || requested_idempotency_key_hash, 0)
  );

  SELECT * INTO existing_subscription
  FROM commercial.subscriptions
  WHERE provider_id = resolved_provider_id
    AND idempotency_key_hash = requested_idempotency_key_hash
  FOR UPDATE;

  IF FOUND THEN
    IF existing_subscription.request_fingerprint <> requested_fingerprint THEN
      RAISE EXCEPTION 'Subscription idempotency key was reused with a different request';
    END IF;
    RETURN existing_subscription;
  END IF;

  SELECT * INTO product_record
  FROM commercial.products
  WHERE product_key = requested_product_key
    AND status = 'active';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active commercial product not found';
  END IF;

  SELECT * INTO price_record
  FROM commercial.prices
  WHERE price_key = requested_price_key
    AND product_id = product_record.id
    AND status = 'active';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active product price not found';
  END IF;
  IF price_record.billing_interval = 'one_time' THEN
    RAISE EXCEPTION 'One-time price cannot create a subscription';
  END IF;

  PERFORM set_config('direkt.commercial_write', 'on', true);
  INSERT INTO commercial.subscriptions (
    provider_id,
    product_id,
    price_id,
    status,
    policy_version,
    idempotency_key_hash,
    request_fingerprint,
    created_by_identity_id
  ) VALUES (
    resolved_provider_id,
    product_record.id,
    price_record.id,
    'pending',
    requested_policy_version,
    requested_idempotency_key_hash,
    requested_fingerprint,
    actor_identity_uuid
  )
  RETURNING * INTO created_subscription;

  PERFORM commercial.append_subscription_event(
    created_subscription.id,
    NULL,
    'pending',
    'provider',
    actor_identity_uuid,
    'Provider created one retry-safe pending commercial subscription.',
    requested_policy_version,
    jsonb_build_object(
      'productKey', product_record.product_key,
      'priceKey', price_record.price_key,
      'currency', price_record.currency,
      'amountMinor', price_record.amount_minor
    )
  );
  PERFORM commercial.append_event(
    'subscription',
    created_subscription.id,
    'subscription_created',
    'provider',
    actor_identity_uuid,
    resolved_provider_id,
    'Provider created one retry-safe pending commercial subscription.',
    requested_policy_version,
    jsonb_build_object('status', 'pending', 'productKey', product_record.product_key)
  );
  PERFORM commercial.audit_action(
    target_request_id,
    actor_identity_uuid,
    resolved_provider_id,
    'commercial_subscription_created',
    'commercial_subscription',
    created_subscription.id,
    jsonb_build_object(
      'productKey', product_record.product_key,
      'priceKey', price_record.price_key,
      'trustMutation', false,
      'publicationMutation', false,
      'rankingMutation', false
    )
  );
  RETURN created_subscription;
END;
$$;

CREATE FUNCTION commercial.apply_subscription_status(
  target_subscription_id uuid,
  target_status text,
  target_actor_kind text,
  target_actor_identity_id uuid,
  target_reason text,
  target_policy_version text,
  expected_revision integer DEFAULT NULL
)
RETURNS commercial.subscriptions
LANGUAGE plpgsql
AS $$
DECLARE
  current_subscription commercial.subscriptions;
  price_record commercial.prices;
  previous_status text;
  next_period_start timestamptz;
  next_period_end timestamptz;
BEGIN
  SELECT * INTO current_subscription
  FROM commercial.subscriptions
  WHERE id = target_subscription_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;
  IF expected_revision IS NOT NULL AND current_subscription.revision <> expected_revision THEN
    RAISE EXCEPTION 'Subscription revision conflict';
  END IF;
  IF current_subscription.status = target_status THEN
    RAISE EXCEPTION 'Subscription is already in the target state';
  END IF;
  IF NOT (
    (current_subscription.status = 'pending' AND target_status IN ('active', 'cancelled', 'expired'))
    OR (current_subscription.status = 'active' AND target_status IN ('grace', 'past_due', 'cancelled', 'expired'))
    OR (current_subscription.status = 'grace' AND target_status IN ('active', 'past_due', 'cancelled', 'expired'))
    OR (current_subscription.status = 'past_due' AND target_status IN ('active', 'grace', 'cancelled', 'expired'))
  ) THEN
    RAISE EXCEPTION 'Subscription transition is not allowed';
  END IF;

  SELECT * INTO price_record
  FROM commercial.prices
  WHERE id = current_subscription.price_id;
  previous_status := current_subscription.status;

  IF target_status = 'active' THEN
    next_period_start := now();
    next_period_end := commercial.subscription_period_end(
      next_period_start,
      price_record.billing_interval,
      price_record.interval_count
    );
  ELSE
    next_period_start := current_subscription.current_period_start;
    next_period_end := current_subscription.current_period_end;
  END IF;

  PERFORM set_config('direkt.commercial_write', 'on', true);
  UPDATE commercial.subscriptions
  SET
    status = target_status,
    revision = revision + 1,
    current_period_start = next_period_start,
    current_period_end = next_period_end,
    grace_ends_at = CASE
      WHEN target_status = 'grace' THEN COALESCE(next_period_end, now()) + interval '7 days'
      WHEN target_status = 'active' THEN NULL
      ELSE grace_ends_at
    END,
    cancel_at_period_end = CASE WHEN target_status IN ('cancelled', 'expired') THEN false ELSE cancel_at_period_end END,
    cancelled_at = CASE WHEN target_status = 'cancelled' THEN now() ELSE NULL END,
    expired_at = CASE WHEN target_status = 'expired' THEN now() ELSE NULL END,
    policy_version = target_policy_version
  WHERE id = target_subscription_id
  RETURNING * INTO current_subscription;

  PERFORM commercial.refresh_subscription_entitlements(
    current_subscription.id,
    target_policy_version
  );
  PERFORM commercial.append_subscription_event(
    current_subscription.id,
    previous_status,
    target_status,
    target_actor_kind,
    target_actor_identity_id,
    target_reason,
    target_policy_version,
    jsonb_build_object(
      'revision', current_subscription.revision,
      'currentPeriodEnd', current_subscription.current_period_end,
      'graceEndsAt', current_subscription.grace_ends_at
    )
  );
  PERFORM commercial.append_event(
    'subscription',
    current_subscription.id,
    'subscription_transitioned',
    target_actor_kind,
    target_actor_identity_id,
    current_subscription.provider_id,
    target_reason,
    target_policy_version,
    jsonb_build_object('fromStatus', previous_status, 'toStatus', target_status)
  );
  RETURN current_subscription;
END;
$$;

CREATE FUNCTION commercial.cancel_provider_subscription(
  actor_identity_uuid uuid,
  target_subscription_id uuid,
  expected_revision integer,
  cancellation_reason text,
  cancellation_policy_version text,
  target_request_id uuid DEFAULT NULL
)
RETURNS commercial.subscriptions
LANGUAGE plpgsql
AS $$
DECLARE
  resolved_provider_id uuid;
  subscription_record commercial.subscriptions;
BEGIN
  resolved_provider_id := commercial.resolve_provider_context(
    actor_identity_uuid,
    'commercial.subscriptions.manage'
  );
  SELECT * INTO subscription_record
  FROM commercial.subscriptions
  WHERE id = target_subscription_id
    AND provider_id = resolved_provider_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Provider-scoped subscription not found';
  END IF;

  subscription_record := commercial.apply_subscription_status(
    target_subscription_id,
    'cancelled',
    'provider',
    actor_identity_uuid,
    cancellation_reason,
    cancellation_policy_version,
    expected_revision
  );
  PERFORM commercial.audit_action(
    target_request_id,
    actor_identity_uuid,
    resolved_provider_id,
    'commercial_subscription_cancelled',
    'commercial_subscription',
    target_subscription_id,
    jsonb_build_object('trustMutation', false, 'publicationMutation', false)
  );
  RETURN subscription_record;
END;
$$;

CREATE FUNCTION commercial.transition_subscription_operations(
  actor_identity_uuid uuid,
  target_subscription_id uuid,
  target_status text,
  expected_revision integer,
  transition_reason text,
  transition_policy_version text,
  target_request_id uuid DEFAULT NULL
)
RETURNS commercial.subscriptions
LANGUAGE plpgsql
AS $$
DECLARE
  subscription_record commercial.subscriptions;
BEGIN
  PERFORM commercial.require_global_permission(
    actor_identity_uuid,
    'commercial.subscriptions.manage'
  );
  subscription_record := commercial.apply_subscription_status(
    target_subscription_id,
    target_status,
    'operations',
    actor_identity_uuid,
    transition_reason,
    transition_policy_version,
    expected_revision
  );
  PERFORM commercial.audit_action(
    target_request_id,
    actor_identity_uuid,
    subscription_record.provider_id,
    'commercial_subscription_transitioned',
    'commercial_subscription',
    target_subscription_id,
    jsonb_build_object('targetStatus', target_status, 'trustMutation', false)
  );
  RETURN subscription_record;
END;
$$;

CREATE FUNCTION commercial.issue_subscription_invoice(
  actor_identity_uuid uuid,
  target_subscription_id uuid,
  invoice_policy_version text,
  target_request_id uuid DEFAULT NULL
)
RETURNS commercial.invoices
LANGUAGE plpgsql
AS $$
DECLARE
  resolved_provider_id uuid;
  subscription_record commercial.subscriptions;
  product_record commercial.products;
  price_record commercial.prices;
  existing_invoice commercial.invoices;
  created_invoice commercial.invoices;
  generated_invoice_number text;
  ledger_transaction_id uuid;
BEGIN
  resolved_provider_id := commercial.resolve_provider_context(
    actor_identity_uuid,
    'commercial.subscriptions.manage'
  );
  SELECT * INTO subscription_record
  FROM commercial.subscriptions
  WHERE id = target_subscription_id
    AND provider_id = resolved_provider_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Provider-scoped subscription not found';
  END IF;
  IF subscription_record.status NOT IN ('pending', 'active', 'grace', 'past_due') THEN
    RAISE EXCEPTION 'Subscription state does not permit invoice issuance';
  END IF;

  SELECT * INTO existing_invoice
  FROM commercial.invoices
  WHERE subscription_id = subscription_record.id
    AND status = 'open'
  ORDER BY issued_at DESC
  LIMIT 1;
  IF FOUND THEN
    RETURN existing_invoice;
  END IF;

  SELECT * INTO product_record FROM commercial.products WHERE id = subscription_record.product_id;
  SELECT * INTO price_record FROM commercial.prices WHERE id = subscription_record.price_id;
  generated_invoice_number := 'SYN-' || to_char(now(), 'YYYYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));

  PERFORM set_config('direkt.commercial_write', 'on', true);
  INSERT INTO commercial.invoices (
    provider_id,
    subscription_id,
    invoice_number,
    status,
    currency,
    subtotal_minor,
    total_minor,
    due_at,
    policy_version
  ) VALUES (
    resolved_provider_id,
    subscription_record.id,
    generated_invoice_number,
    'open',
    price_record.currency,
    price_record.amount_minor,
    price_record.amount_minor,
    now() + interval '7 days',
    invoice_policy_version
  )
  RETURNING * INTO created_invoice;

  INSERT INTO commercial.invoice_lines (
    invoice_id,
    line_key,
    description,
    product_id,
    price_id,
    quantity,
    unit_amount_minor
  ) VALUES (
    created_invoice.id,
    'subscription_charge',
    product_record.name || ' — ' || price_record.billing_interval || ' synthetic subscription charge',
    product_record.id,
    price_record.id,
    1,
    price_record.amount_minor
  );

  ledger_transaction_id := commercial.post_balanced_ledger_transaction(
    resolved_provider_id,
    created_invoice.id,
    NULL,
    'invoice_issued',
    created_invoice.invoice_number,
    created_invoice.currency,
    created_invoice.total_minor,
    'accounts_receivable',
    'deferred_subscription_revenue',
    invoice_policy_version
  );

  PERFORM commercial.append_event(
    'invoice',
    created_invoice.id,
    'invoice_issued',
    'provider',
    actor_identity_uuid,
    resolved_provider_id,
    'Provider issued one immutable synthetic subscription invoice.',
    invoice_policy_version,
    jsonb_build_object(
      'invoiceNumber', created_invoice.invoice_number,
      'currency', created_invoice.currency,
      'totalMinor', created_invoice.total_minor,
      'ledgerTransactionId', ledger_transaction_id
    )
  );
  PERFORM commercial.audit_action(
    target_request_id,
    actor_identity_uuid,
    resolved_provider_id,
    'commercial_invoice_issued',
    'commercial_invoice',
    created_invoice.id,
    jsonb_build_object('currency', created_invoice.currency, 'totalMinor', created_invoice.total_minor)
  );
  RETURN created_invoice;
END;
$$;

CREATE FUNCTION commercial.create_payment_intent(
  actor_identity_uuid uuid,
  target_invoice_id uuid,
  requested_policy_version text,
  requested_idempotency_key_hash character(64),
  requested_fingerprint character(64),
  target_request_id uuid DEFAULT NULL
)
RETURNS commercial.payment_intents
LANGUAGE plpgsql
AS $$
DECLARE
  resolved_provider_id uuid;
  invoice_record commercial.invoices;
  existing_intent commercial.payment_intents;
  created_intent commercial.payment_intents;
  generated_reference text;
BEGIN
  resolved_provider_id := commercial.resolve_provider_context(
    actor_identity_uuid,
    'commercial.payments.initiate'
  );
  PERFORM pg_advisory_xact_lock(
    hashtextextended(resolved_provider_id::text || ':' || requested_idempotency_key_hash, 0)
  );

  SELECT * INTO existing_intent
  FROM commercial.payment_intents
  WHERE provider_id = resolved_provider_id
    AND idempotency_key_hash = requested_idempotency_key_hash
  FOR UPDATE;
  IF FOUND THEN
    IF existing_intent.request_fingerprint <> requested_fingerprint THEN
      RAISE EXCEPTION 'Payment idempotency key was reused with a different request';
    END IF;
    RETURN existing_intent;
  END IF;

  SELECT * INTO invoice_record
  FROM commercial.invoices
  WHERE id = target_invoice_id
    AND provider_id = resolved_provider_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Provider-scoped invoice not found';
  END IF;
  IF invoice_record.status <> 'open' THEN
    RAISE EXCEPTION 'Only open invoices can create a payment intent';
  END IF;

  generated_reference := 'SYN-PAY-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16));
  PERFORM set_config('direkt.commercial_write', 'on', true);
  INSERT INTO commercial.payment_intents (
    provider_id,
    invoice_id,
    provider_key,
    external_reference,
    status,
    currency,
    amount_minor,
    idempotency_key_hash,
    request_fingerprint,
    created_by_identity_id,
    expires_at,
    policy_version
  ) VALUES (
    resolved_provider_id,
    invoice_record.id,
    'synthetic',
    generated_reference,
    'requires_action',
    invoice_record.currency,
    invoice_record.total_minor,
    requested_idempotency_key_hash,
    requested_fingerprint,
    actor_identity_uuid,
    now() + interval '30 minutes',
    requested_policy_version
  )
  RETURNING * INTO created_intent;

  PERFORM commercial.append_payment_event(
    created_intent.id,
    NULL,
    created_intent.status,
    'provider',
    NULL,
    'PAYMENT_INTENT_CREATED',
    jsonb_build_object('externalReference', created_intent.external_reference)
  );
  PERFORM commercial.append_event(
    'payment_intent',
    created_intent.id,
    'payment_intent_created',
    'provider',
    actor_identity_uuid,
    resolved_provider_id,
    'Provider created one retry-safe synthetic payment intent.',
    requested_policy_version,
    jsonb_build_object(
      'status', created_intent.status,
      'currency', created_intent.currency,
      'amountMinor', created_intent.amount_minor,
      'externalReference', created_intent.external_reference
    )
  );
  PERFORM commercial.audit_action(
    target_request_id,
    actor_identity_uuid,
    resolved_provider_id,
    'commercial_payment_intent_created',
    'commercial_payment_intent',
    created_intent.id,
    jsonb_build_object('providerKey', 'synthetic', 'credentialStored', false)
  );
  RETURN created_intent;
END;
$$;

CREATE FUNCTION commercial.cancel_provider_payment_intent(
  actor_identity_uuid uuid,
  target_payment_intent_id uuid,
  expected_revision integer,
  cancellation_policy_version text,
  target_request_id uuid DEFAULT NULL
)
RETURNS commercial.payment_intents
LANGUAGE plpgsql
AS $$
DECLARE
  resolved_provider_id uuid;
  payment_record commercial.payment_intents;
  previous_status text;
BEGIN
  resolved_provider_id := commercial.resolve_provider_context(
    actor_identity_uuid,
    'commercial.payments.initiate'
  );
  SELECT * INTO payment_record
  FROM commercial.payment_intents
  WHERE id = target_payment_intent_id
    AND provider_id = resolved_provider_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Provider-scoped payment intent not found';
  END IF;
  IF payment_record.revision <> expected_revision THEN
    RAISE EXCEPTION 'Payment intent revision conflict';
  END IF;
  IF payment_record.status NOT IN ('pending', 'requires_action', 'processing') THEN
    RAISE EXCEPTION 'Payment intent cannot be cancelled from its current state';
  END IF;
  previous_status := payment_record.status;

  PERFORM set_config('direkt.commercial_write', 'on', true);
  UPDATE commercial.payment_intents
  SET
    status = 'cancelled',
    revision = revision + 1,
    completed_at = now(),
    last_error_code = 'PROVIDER_CANCELLED',
    policy_version = cancellation_policy_version
  WHERE id = payment_record.id
  RETURNING * INTO payment_record;

  PERFORM commercial.append_payment_event(
    payment_record.id,
    previous_status,
    'cancelled',
    'provider',
    NULL,
    'PROVIDER_CANCELLED',
    '{}'::jsonb
  );
  PERFORM commercial.append_event(
    'payment_intent',
    payment_record.id,
    'payment_intent_cancelled',
    'provider',
    actor_identity_uuid,
    resolved_provider_id,
    'Provider cancelled one non-terminal synthetic payment intent.',
    cancellation_policy_version,
    jsonb_build_object('fromStatus', previous_status, 'toStatus', 'cancelled')
  );
  PERFORM commercial.audit_action(
    target_request_id,
    actor_identity_uuid,
    resolved_provider_id,
    'commercial_payment_intent_cancelled',
    'commercial_payment_intent',
    payment_record.id,
    '{}'::jsonb
  );
  RETURN payment_record;
END;
$$;

CREATE FUNCTION commercial.record_webhook_receipt(
  target_provider_key text,
  target_external_event_id text,
  target_event_type text,
  target_event_fingerprint character(64),
  target_signature_verified boolean,
  target_timestamp_verified boolean,
  target_payment_intent_id uuid,
  target_occurred_at timestamptz,
  target_safe_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS commercial.webhook_receipts
LANGUAGE plpgsql
AS $$
DECLARE
  existing_receipt commercial.webhook_receipts;
  created_receipt commercial.webhook_receipts;
  initial_outcome text;
  initial_rejection_code text;
BEGIN
  PERFORM pg_advisory_xact_lock(
    hashtextextended(target_provider_key || ':' || target_external_event_id, 0)
  );
  SELECT * INTO existing_receipt
  FROM commercial.webhook_receipts
  WHERE provider_key = target_provider_key
    AND external_event_id = target_external_event_id
  FOR UPDATE;
  IF FOUND THEN
    RETURN existing_receipt;
  END IF;

  initial_outcome := CASE
    WHEN target_signature_verified AND target_timestamp_verified THEN 'received'
    ELSE 'rejected'
  END;
  initial_rejection_code := CASE
    WHEN NOT target_signature_verified THEN 'SIGNATURE_INVALID'
    WHEN NOT target_timestamp_verified THEN 'TIMESTAMP_INVALID'
    ELSE NULL
  END;

  PERFORM set_config('direkt.commercial_write', 'on', true);
  INSERT INTO commercial.webhook_receipts (
    provider_key,
    external_event_id,
    event_type,
    event_fingerprint,
    signature_verified,
    timestamp_verified,
    payment_intent_id,
    occurred_at,
    processed_at,
    processing_outcome,
    rejection_code,
    safe_metadata
  ) VALUES (
    target_provider_key,
    target_external_event_id,
    target_event_type,
    target_event_fingerprint,
    target_signature_verified,
    target_timestamp_verified,
    target_payment_intent_id,
    target_occurred_at,
    CASE WHEN initial_outcome = 'rejected' THEN now() ELSE NULL END,
    initial_outcome,
    initial_rejection_code,
    COALESCE(target_safe_metadata, '{}'::jsonb)
  )
  RETURNING * INTO created_receipt;

  PERFORM commercial.append_event(
    'webhook',
    created_receipt.id,
    CASE WHEN initial_outcome = 'received' THEN 'webhook_received' ELSE 'webhook_rejected' END,
    'synthetic_webhook',
    NULL,
    NULL,
    CASE
      WHEN initial_outcome = 'received' THEN 'Verified synthetic webhook receipt was accepted for processing.'
      ELSE 'Synthetic webhook receipt was rejected before business-state processing.'
    END,
    'phase9-v1',
    jsonb_build_object(
      'providerKey', target_provider_key,
      'eventType', target_event_type,
      'outcome', initial_outcome,
      'rejectionCode', initial_rejection_code,
      'rawPayloadStored', false
    )
  );
  RETURN created_receipt;
END;
$$;

CREATE FUNCTION commercial.open_reconciliation_case(
  target_provider_id uuid,
  target_invoice_id uuid,
  target_payment_intent_id uuid,
  target_ledger_transaction_id uuid,
  target_mismatch_code text,
  target_expected_amount_minor bigint,
  target_observed_amount_minor bigint,
  target_currency text,
  target_policy_version text
)
RETURNS commercial.reconciliation_cases
LANGUAGE plpgsql
AS $$
DECLARE
  existing_case commercial.reconciliation_cases;
  created_case commercial.reconciliation_cases;
BEGIN
  SELECT * INTO existing_case
  FROM commercial.reconciliation_cases
  WHERE provider_id = target_provider_id
    AND payment_intent_id IS NOT DISTINCT FROM target_payment_intent_id
    AND mismatch_code = target_mismatch_code
    AND status IN ('open', 'investigating')
  ORDER BY opened_at DESC
  LIMIT 1;
  IF FOUND THEN
    RETURN existing_case;
  END IF;

  PERFORM set_config('direkt.commercial_write', 'on', true);
  INSERT INTO commercial.reconciliation_cases (
    provider_id,
    invoice_id,
    payment_intent_id,
    ledger_transaction_id,
    mismatch_code,
    expected_amount_minor,
    observed_amount_minor,
    currency,
    status,
    policy_version
  ) VALUES (
    target_provider_id,
    target_invoice_id,
    target_payment_intent_id,
    target_ledger_transaction_id,
    target_mismatch_code,
    target_expected_amount_minor,
    target_observed_amount_minor,
    target_currency,
    'open',
    target_policy_version
  )
  RETURNING * INTO created_case;

  PERFORM commercial.append_event(
    'reconciliation',
    created_case.id,
    'reconciliation_case_opened',
    'system',
    NULL,
    target_provider_id,
    'System opened a bounded commercial reconciliation exception.',
    target_policy_version,
    jsonb_build_object(
      'mismatchCode', target_mismatch_code,
      'expectedAmountMinor', target_expected_amount_minor,
      'observedAmountMinor', target_observed_amount_minor
    )
  );
  RETURN created_case;
END;
$$;

CREATE FUNCTION commercial.reconcile_payment_intent(
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
    max(id)
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

CREATE FUNCTION commercial.process_verified_payment_webhook(
  target_webhook_receipt_id uuid,
  target_status text,
  target_reason_code text,
  target_policy_version text
)
RETURNS commercial.payment_intents
LANGUAGE plpgsql
AS $$
DECLARE
  receipt_record commercial.webhook_receipts;
  payment_record commercial.payment_intents;
  invoice_record commercial.invoices;
  subscription_record commercial.subscriptions;
  previous_status text;
  ledger_transaction_id uuid;
BEGIN
  SELECT * INTO receipt_record
  FROM commercial.webhook_receipts
  WHERE id = target_webhook_receipt_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Webhook receipt not found';
  END IF;
  IF receipt_record.processing_outcome = 'processed' THEN
    SELECT * INTO payment_record
    FROM commercial.payment_intents
    WHERE id = receipt_record.payment_intent_id;
    RETURN payment_record;
  END IF;
  IF receipt_record.processing_outcome <> 'received'
    OR NOT receipt_record.signature_verified
    OR NOT receipt_record.timestamp_verified THEN
    RAISE EXCEPTION 'Webhook receipt is not verified for business-state processing';
  END IF;
  IF receipt_record.payment_intent_id IS NULL THEN
    RAISE EXCEPTION 'Webhook receipt is not linked to a payment intent';
  END IF;

  SELECT * INTO payment_record
  FROM commercial.payment_intents
  WHERE id = receipt_record.payment_intent_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment intent not found';
  END IF;
  IF NOT (
    (payment_record.status IN ('pending', 'requires_action') AND target_status IN ('processing', 'succeeded', 'failed', 'cancelled', 'expired'))
    OR (payment_record.status = 'processing' AND target_status IN ('succeeded', 'failed'))
    OR (payment_record.status = 'succeeded' AND target_status = 'reversed')
  ) THEN
    RAISE EXCEPTION 'Payment webhook transition is not allowed';
  END IF;

  previous_status := payment_record.status;
  PERFORM set_config('direkt.commercial_write', 'on', true);
  UPDATE commercial.payment_intents
  SET
    status = target_status,
    revision = revision + 1,
    completed_at = CASE
      WHEN target_status IN ('succeeded', 'failed', 'cancelled', 'expired', 'reversed') THEN now()
      ELSE NULL
    END,
    last_error_code = CASE
      WHEN target_status IN ('failed', 'cancelled', 'expired', 'reversed') THEN target_reason_code
      ELSE NULL
    END,
    policy_version = target_policy_version
  WHERE id = payment_record.id
  RETURNING * INTO payment_record;

  PERFORM commercial.append_payment_event(
    payment_record.id,
    previous_status,
    target_status,
    'synthetic_webhook',
    receipt_record.external_event_id,
    target_reason_code,
    jsonb_build_object('webhookReceiptId', receipt_record.id)
  );

  SELECT * INTO invoice_record
  FROM commercial.invoices
  WHERE id = payment_record.invoice_id
  FOR UPDATE;

  IF target_status = 'succeeded' THEN
    IF invoice_record.status <> 'open' THEN
      RAISE EXCEPTION 'Successful payment requires an open invoice';
    END IF;
    UPDATE commercial.invoices
    SET
      status = 'paid',
      revision = revision + 1,
      paid_at = now(),
      voided_at = NULL,
      uncollectible_at = NULL,
      policy_version = target_policy_version
    WHERE id = invoice_record.id
    RETURNING * INTO invoice_record;

    ledger_transaction_id := commercial.post_balanced_ledger_transaction(
      payment_record.provider_id,
      invoice_record.id,
      payment_record.id,
      'payment_received',
      receipt_record.external_event_id,
      payment_record.currency,
      payment_record.amount_minor,
      'cash_clearing',
      'accounts_receivable',
      target_policy_version
    );

    IF invoice_record.subscription_id IS NOT NULL THEN
      SELECT * INTO subscription_record
      FROM commercial.subscriptions
      WHERE id = invoice_record.subscription_id;
      IF subscription_record.status IN ('pending', 'grace', 'past_due') THEN
        PERFORM commercial.apply_subscription_status(
          subscription_record.id,
          'active',
          'system',
          NULL,
          'Verified synthetic payment activated the commercial subscription.',
          target_policy_version,
          subscription_record.revision
        );
      END IF;
    END IF;
  ELSIF target_status = 'reversed' THEN
    IF invoice_record.status <> 'paid' THEN
      RAISE EXCEPTION 'Payment reversal requires a paid invoice';
    END IF;
    UPDATE commercial.invoices
    SET
      status = 'open',
      revision = revision + 1,
      paid_at = NULL,
      policy_version = target_policy_version
    WHERE id = invoice_record.id
    RETURNING * INTO invoice_record;

    ledger_transaction_id := commercial.post_balanced_ledger_transaction(
      payment_record.provider_id,
      invoice_record.id,
      payment_record.id,
      'payment_reversed',
      receipt_record.external_event_id,
      payment_record.currency,
      payment_record.amount_minor,
      'accounts_receivable',
      'cash_clearing',
      target_policy_version
    );

    IF invoice_record.subscription_id IS NOT NULL THEN
      SELECT * INTO subscription_record
      FROM commercial.subscriptions
      WHERE id = invoice_record.subscription_id;
      IF subscription_record.status = 'active' THEN
        PERFORM commercial.apply_subscription_status(
          subscription_record.id,
          'grace',
          'system',
          NULL,
          'Synthetic payment reversal moved the subscription into a bounded grace period.',
          target_policy_version,
          subscription_record.revision
        );
      END IF;
    END IF;
  END IF;

  UPDATE commercial.webhook_receipts
  SET
    processing_outcome = 'processed',
    processed_at = now(),
    rejection_code = NULL,
    safe_metadata = safe_metadata || jsonb_build_object(
      'targetStatus', target_status,
      'ledgerTransactionId', ledger_transaction_id
    )
  WHERE id = receipt_record.id;

  PERFORM commercial.append_event(
    'payment_intent',
    payment_record.id,
    'payment_webhook_processed',
    'synthetic_webhook',
    NULL,
    payment_record.provider_id,
    'Verified synthetic webhook changed backend-confirmed payment state.',
    target_policy_version,
    jsonb_build_object(
      'fromStatus', previous_status,
      'toStatus', target_status,
      'webhookReceiptId', receipt_record.id,
      'ledgerTransactionId', ledger_transaction_id
    )
  );
  PERFORM commercial.reconcile_payment_intent(payment_record.id, target_policy_version);
  RETURN payment_record;
END;
$$;

CREATE FUNCTION commercial.transition_reconciliation_case(
  actor_identity_uuid uuid,
  target_reconciliation_case_id uuid,
  target_status text,
  expected_revision integer,
  target_reason_code text,
  target_reason text,
  target_policy_version text,
  target_request_id uuid DEFAULT NULL
)
RETURNS commercial.reconciliation_cases
LANGUAGE plpgsql
AS $$
DECLARE
  case_record commercial.reconciliation_cases;
  previous_status text;
  next_sequence integer;
BEGIN
  PERFORM commercial.require_global_permission(
    actor_identity_uuid,
    'commercial.reconciliation.manage'
  );
  SELECT * INTO case_record
  FROM commercial.reconciliation_cases
  WHERE id = target_reconciliation_case_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reconciliation case not found';
  END IF;
  IF case_record.revision <> expected_revision THEN
    RAISE EXCEPTION 'Reconciliation revision conflict';
  END IF;
  IF NOT (
    (case_record.status = 'open' AND target_status IN ('investigating', 'resolved'))
    OR (case_record.status = 'investigating' AND target_status = 'resolved')
    OR (case_record.status = 'resolved' AND target_status = 'closed')
  ) THEN
    RAISE EXCEPTION 'Reconciliation transition is not allowed';
  END IF;
  previous_status := case_record.status;

  PERFORM set_config('direkt.commercial_write', 'on', true);
  UPDATE commercial.reconciliation_cases
  SET
    status = target_status,
    revision = revision + 1,
    assigned_to_identity_id = CASE
      WHEN target_status = 'investigating' THEN actor_identity_uuid
      ELSE assigned_to_identity_id
    END,
    resolution_code = CASE WHEN target_status IN ('resolved', 'closed') THEN target_reason_code ELSE NULL END,
    policy_version = target_policy_version,
    resolved_at = CASE WHEN target_status IN ('resolved', 'closed') THEN COALESCE(resolved_at, now()) ELSE NULL END,
    closed_at = CASE WHEN target_status = 'closed' THEN now() ELSE NULL END
  WHERE id = case_record.id
  RETURNING * INTO case_record;

  SELECT COALESCE(max(sequence), 0) + 1
  INTO next_sequence
  FROM commercial.reconciliation_events
  WHERE reconciliation_case_id = case_record.id;
  PERFORM set_config('direkt.commercial_event_write', 'on', true);
  INSERT INTO commercial.reconciliation_events (
    reconciliation_case_id,
    sequence,
    from_status,
    to_status,
    actor_identity_id,
    reason_code,
    reason,
    policy_version
  ) VALUES (
    case_record.id,
    next_sequence,
    previous_status,
    target_status,
    actor_identity_uuid,
    target_reason_code,
    target_reason,
    target_policy_version
  );

  PERFORM commercial.append_event(
    'reconciliation',
    case_record.id,
    'reconciliation_transitioned',
    'operations',
    actor_identity_uuid,
    case_record.provider_id,
    target_reason,
    target_policy_version,
    jsonb_build_object('fromStatus', previous_status, 'toStatus', target_status, 'reasonCode', target_reason_code)
  );
  PERFORM commercial.audit_action(
    target_request_id,
    actor_identity_uuid,
    case_record.provider_id,
    'commercial_reconciliation_transitioned',
    'commercial_reconciliation',
    case_record.id,
    jsonb_build_object('targetStatus', target_status, 'reasonCode', target_reason_code)
  );
  RETURN case_record;
END;
$$;

CREATE FUNCTION commercial.request_adjustment(
  actor_identity_uuid uuid,
  target_provider_id uuid,
  target_invoice_id uuid,
  target_payment_intent_id uuid,
  target_adjustment_type text,
  target_currency text,
  target_amount_minor bigint,
  target_reason text,
  target_policy_version text,
  target_request_id uuid DEFAULT NULL
)
RETURNS commercial.adjustment_requests
LANGUAGE plpgsql
AS $$
DECLARE
  created_request commercial.adjustment_requests;
BEGIN
  PERFORM commercial.require_global_permission(
    actor_identity_uuid,
    'commercial.adjustments.request'
  );
  IF target_invoice_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM commercial.invoices
    WHERE id = target_invoice_id AND provider_id = target_provider_id
  ) THEN
    RAISE EXCEPTION 'Adjustment invoice scope does not match the provider';
  END IF;
  IF target_payment_intent_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM commercial.payment_intents
    WHERE id = target_payment_intent_id AND provider_id = target_provider_id
  ) THEN
    RAISE EXCEPTION 'Adjustment payment scope does not match the provider';
  END IF;

  PERFORM set_config('direkt.commercial_write', 'on', true);
  INSERT INTO commercial.adjustment_requests (
    provider_id,
    invoice_id,
    payment_intent_id,
    adjustment_type,
    currency,
    amount_minor,
    status,
    requested_by_identity_id,
    request_reason,
    policy_version
  ) VALUES (
    target_provider_id,
    target_invoice_id,
    target_payment_intent_id,
    target_adjustment_type,
    target_currency,
    target_amount_minor,
    'requested',
    actor_identity_uuid,
    target_reason,
    target_policy_version
  )
  RETURNING * INTO created_request;

  PERFORM commercial.append_event(
    'adjustment',
    created_request.id,
    'adjustment_requested',
    'operations',
    actor_identity_uuid,
    target_provider_id,
    target_reason,
    target_policy_version,
    jsonb_build_object(
      'adjustmentType', target_adjustment_type,
      'currency', target_currency,
      'amountMinor', target_amount_minor
    )
  );
  PERFORM commercial.audit_action(
    target_request_id,
    actor_identity_uuid,
    target_provider_id,
    'commercial_adjustment_requested',
    'commercial_adjustment',
    created_request.id,
    jsonb_build_object('adjustmentType', target_adjustment_type, 'amountMinor', target_amount_minor)
  );
  RETURN created_request;
END;
$$;

CREATE FUNCTION commercial.decide_adjustment(
  actor_identity_uuid uuid,
  target_adjustment_request_id uuid,
  target_decision text,
  target_reason text,
  target_policy_version text,
  target_request_id uuid DEFAULT NULL
)
RETURNS commercial.adjustment_requests
LANGUAGE plpgsql
AS $$
DECLARE
  request_record commercial.adjustment_requests;
  approval_count integer;
BEGIN
  PERFORM commercial.require_global_permission(
    actor_identity_uuid,
    'commercial.adjustments.approve'
  );
  SELECT * INTO request_record
  FROM commercial.adjustment_requests
  WHERE id = target_adjustment_request_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Adjustment request not found';
  END IF;
  IF request_record.status <> 'requested' THEN
    RAISE EXCEPTION 'Adjustment request is no longer awaiting approvals';
  END IF;
  IF request_record.requested_by_identity_id = actor_identity_uuid THEN
    RAISE EXCEPTION 'Adjustment requester cannot approve their own request';
  END IF;

  PERFORM set_config('direkt.commercial_event_write', 'on', true);
  INSERT INTO commercial.adjustment_approvals (
    adjustment_request_id,
    approver_identity_id,
    decision,
    reason,
    policy_version
  ) VALUES (
    request_record.id,
    actor_identity_uuid,
    target_decision,
    target_reason,
    target_policy_version
  );

  IF target_decision = 'rejected' THEN
    PERFORM set_config('direkt.commercial_write', 'on', true);
    UPDATE commercial.adjustment_requests
    SET
      status = 'rejected',
      revision = revision + 1,
      decided_at = now(),
      policy_version = target_policy_version
    WHERE id = request_record.id
    RETURNING * INTO request_record;
  ELSE
    SELECT count(DISTINCT approver_identity_id)
    INTO approval_count
    FROM commercial.adjustment_approvals
    WHERE adjustment_request_id = request_record.id
      AND decision = 'approved';
    IF approval_count >= 2 THEN
      PERFORM set_config('direkt.commercial_write', 'on', true);
      UPDATE commercial.adjustment_requests
      SET
        status = 'approved',
        revision = revision + 1,
        decided_at = now(),
        policy_version = target_policy_version
      WHERE id = request_record.id
      RETURNING * INTO request_record;
    END IF;
  END IF;

  PERFORM commercial.append_event(
    'adjustment',
    request_record.id,
    'adjustment_decision_recorded',
    'operations',
    actor_identity_uuid,
    request_record.provider_id,
    target_reason,
    target_policy_version,
    jsonb_build_object(
      'decision', target_decision,
      'approvalCount', COALESCE(approval_count, 0),
      'requestStatus', request_record.status
    )
  );
  PERFORM commercial.audit_action(
    target_request_id,
    actor_identity_uuid,
    request_record.provider_id,
    'commercial_adjustment_decision_recorded',
    'commercial_adjustment',
    request_record.id,
    jsonb_build_object('decision', target_decision, 'requestStatus', request_record.status)
  );
  RETURN request_record;
END;
$$;

CREATE FUNCTION commercial.apply_adjustment(
  actor_identity_uuid uuid,
  target_adjustment_request_id uuid,
  target_policy_version text,
  target_request_id uuid DEFAULT NULL
)
RETURNS commercial.adjustment_requests
LANGUAGE plpgsql
AS $$
DECLARE
  request_record commercial.adjustment_requests;
  ledger_transaction_id uuid;
  debit_account text;
  credit_account text;
BEGIN
  PERFORM commercial.require_global_permission(
    actor_identity_uuid,
    'commercial.adjustments.approve'
  );
  SELECT * INTO request_record
  FROM commercial.adjustment_requests
  WHERE id = target_adjustment_request_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Adjustment request not found';
  END IF;
  IF request_record.status <> 'approved' THEN
    RAISE EXCEPTION 'Only an approved adjustment can be applied';
  END IF;

  debit_account := CASE request_record.adjustment_type
    WHEN 'debit' THEN 'accounts_receivable'
    WHEN 'synthetic_refund' THEN 'synthetic_refund_expense'
    ELSE 'commercial_adjustments'
  END;
  credit_account := CASE request_record.adjustment_type
    WHEN 'debit' THEN 'commercial_adjustments'
    WHEN 'synthetic_refund' THEN 'cash_clearing'
    ELSE 'accounts_receivable'
  END;

  ledger_transaction_id := commercial.post_balanced_ledger_transaction(
    request_record.provider_id,
    request_record.invoice_id,
    request_record.payment_intent_id,
    CASE WHEN request_record.adjustment_type = 'synthetic_refund' THEN 'refund' ELSE 'adjustment' END,
    'SYN-ADJ-' || upper(substr(replace(request_record.id::text, '-', ''), 1, 16)),
    request_record.currency,
    request_record.amount_minor,
    debit_account,
    credit_account,
    target_policy_version
  );

  PERFORM set_config('direkt.commercial_write', 'on', true);
  UPDATE commercial.adjustment_requests
  SET
    status = 'applied',
    revision = revision + 1,
    applied_at = now(),
    policy_version = target_policy_version
  WHERE id = request_record.id
  RETURNING * INTO request_record;

  PERFORM commercial.append_event(
    'adjustment',
    request_record.id,
    'adjustment_applied',
    'operations',
    actor_identity_uuid,
    request_record.provider_id,
    'Authorized commercial adjustment was posted through the balanced append-only ledger.',
    target_policy_version,
    jsonb_build_object('ledgerTransactionId', ledger_transaction_id, 'adjustmentType', request_record.adjustment_type)
  );
  PERFORM commercial.audit_action(
    target_request_id,
    actor_identity_uuid,
    request_record.provider_id,
    'commercial_adjustment_applied',
    'commercial_adjustment',
    request_record.id,
    jsonb_build_object('ledgerTransactionId', ledger_transaction_id)
  );
  RETURN request_record;
END;
$$;

CREATE FUNCTION commercial.transition_product(
  actor_identity_uuid uuid,
  target_product_id uuid,
  target_status text,
  target_reason text,
  target_policy_version text,
  target_request_id uuid DEFAULT NULL
)
RETURNS commercial.products
LANGUAGE plpgsql
AS $$
DECLARE
  product_record commercial.products;
  previous_status text;
BEGIN
  PERFORM commercial.require_global_permission(actor_identity_uuid, 'commercial.products.manage');
  SELECT * INTO product_record
  FROM commercial.products
  WHERE id = target_product_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Commercial product not found';
  END IF;
  IF target_status NOT IN ('active', 'retired') OR product_record.status = target_status THEN
    RAISE EXCEPTION 'Commercial product transition is not allowed';
  END IF;
  previous_status := product_record.status;

  PERFORM set_config('direkt.commercial_write', 'on', true);
  UPDATE commercial.products
  SET
    status = target_status,
    retired_at = CASE WHEN target_status = 'retired' THEN now() ELSE NULL END,
    policy_version = target_policy_version
  WHERE id = product_record.id
  RETURNING * INTO product_record;

  IF target_status = 'retired' THEN
    UPDATE commercial.prices
    SET status = 'retired', retired_at = now(), policy_version = target_policy_version
    WHERE product_id = product_record.id AND status = 'active';
    UPDATE commercial.product_entitlements
    SET status = 'retired', retired_at = now(), policy_version = target_policy_version
    WHERE product_id = product_record.id AND status = 'active';
  END IF;

  PERFORM commercial.append_event(
    'product',
    product_record.id,
    'product_transitioned',
    'operations',
    actor_identity_uuid,
    NULL,
    target_reason,
    target_policy_version,
    jsonb_build_object('fromStatus', previous_status, 'toStatus', target_status)
  );
  PERFORM commercial.audit_action(
    target_request_id,
    actor_identity_uuid,
    NULL,
    'commercial_product_transitioned',
    'commercial_product',
    product_record.id,
    jsonb_build_object('fromStatus', previous_status, 'toStatus', target_status)
  );
  RETURN product_record;
END;
$$;

CREATE FUNCTION commercial.apply_subscription_time_transitions(
  as_of timestamptz,
  transition_policy_version text
)
RETURNS TABLE(grace_started integer, past_due_started integer)
LANGUAGE plpgsql
AS $$
DECLARE
  subscription_record commercial.subscriptions;
BEGIN
  grace_started := 0;
  past_due_started := 0;

  FOR subscription_record IN
    SELECT *
    FROM commercial.subscriptions
    WHERE status = 'active'
      AND current_period_end IS NOT NULL
      AND current_period_end <= as_of
    ORDER BY id
    FOR UPDATE
  LOOP
    PERFORM commercial.apply_subscription_status(
      subscription_record.id,
      'grace',
      'system',
      NULL,
      'System started the deterministic post-period commercial grace window.',
      transition_policy_version,
      subscription_record.revision
    );
    grace_started := grace_started + 1;
  END LOOP;

  FOR subscription_record IN
    SELECT *
    FROM commercial.subscriptions
    WHERE status = 'grace'
      AND grace_ends_at IS NOT NULL
      AND grace_ends_at <= as_of
    ORDER BY id
    FOR UPDATE
  LOOP
    PERFORM commercial.apply_subscription_status(
      subscription_record.id,
      'past_due',
      'system',
      NULL,
      'System ended the grace window and suspended commercial entitlements.',
      transition_policy_version,
      subscription_record.revision
    );
    past_due_started := past_due_started + 1;
  END LOOP;

  RETURN NEXT;
END;
$$;

CREATE FUNCTION commercial.expire_payment_intents(
  as_of timestamptz,
  transition_policy_version text
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  payment_record commercial.payment_intents;
  expired_count integer := 0;
BEGIN
  FOR payment_record IN
    SELECT *
    FROM commercial.payment_intents
    WHERE status IN ('pending', 'requires_action')
      AND expires_at <= as_of
    ORDER BY id
    FOR UPDATE
  LOOP
    PERFORM set_config('direkt.commercial_write', 'on', true);
    UPDATE commercial.payment_intents
    SET
      status = 'expired',
      revision = revision + 1,
      completed_at = as_of,
      last_error_code = 'PAYMENT_INTENT_EXPIRED',
      policy_version = transition_policy_version
    WHERE id = payment_record.id;
    PERFORM commercial.append_payment_event(
      payment_record.id,
      payment_record.status,
      'expired',
      'system',
      NULL,
      'PAYMENT_INTENT_EXPIRED',
      '{}'::jsonb
    );
    expired_count := expired_count + 1;
  END LOOP;
  RETURN expired_count;
END;
$$;

CREATE VIEW commercial.current_entitlements AS
SELECT
  grants.id,
  grants.subscription_id,
  grants.provider_id,
  grants.product_id,
  grants.entitlement_key,
  entitlements.display_name,
  entitlements.description,
  grants.status,
  grants.limit_value,
  grants.limit_unit,
  grants.effective_from,
  grants.effective_until,
  grants.policy_version
FROM commercial.entitlement_grants AS grants
JOIN commercial.product_entitlements AS entitlements
  ON entitlements.product_id = grants.product_id
 AND entitlements.entitlement_key = grants.entitlement_key
WHERE grants.status IN ('active', 'limited')
  AND grants.effective_from <= now()
  AND (grants.effective_until IS NULL OR grants.effective_until > now());

CREATE VIEW commercial.safe_receipts AS
SELECT
  invoices.id AS invoice_id,
  invoices.provider_id,
  invoices.subscription_id,
  invoices.invoice_number,
  invoices.currency,
  invoices.total_minor,
  invoices.paid_at,
  payment_intents.id AS payment_intent_id,
  payment_intents.provider_key,
  payment_intents.external_reference,
  payment_intents.completed_at,
  false AS payment_credential_included,
  false AS customer_contact_included,
  false AS trust_or_ranking_mutation
FROM commercial.invoices AS invoices
JOIN commercial.payment_intents
  ON payment_intents.invoice_id = invoices.id
 AND payment_intents.status = 'succeeded'
WHERE invoices.status = 'paid';
