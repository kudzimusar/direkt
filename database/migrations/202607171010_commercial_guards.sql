CREATE FUNCTION commercial.has_global_permission(
  actor_identity_uuid uuid,
  required_permission text
)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM authz.role_assignments AS assignments
    JOIN authz.roles AS roles ON roles.id = assignments.role_id
    JOIN authz.role_permissions AS role_permissions ON role_permissions.role_id = roles.id
    JOIN authz.permissions AS permissions ON permissions.id = role_permissions.permission_id
    WHERE assignments.identity_id = actor_identity_uuid
      AND assignments.scope_type = 'global'
      AND assignments.provider_id IS NULL
      AND assignments.revoked_at IS NULL
      AND assignments.starts_at <= now()
      AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
      AND permissions.permission_key = required_permission
  );
$$;

CREATE FUNCTION commercial.has_provider_permission(
  actor_identity_uuid uuid,
  scoped_provider_uuid uuid,
  required_permission text
)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM authz.role_assignments AS assignments
    JOIN authz.roles AS roles ON roles.id = assignments.role_id
    JOIN authz.role_permissions AS role_permissions ON role_permissions.role_id = roles.id
    JOIN authz.permissions AS permissions ON permissions.id = role_permissions.permission_id
    WHERE assignments.identity_id = actor_identity_uuid
      AND assignments.scope_type = 'provider'
      AND assignments.provider_id = scoped_provider_uuid
      AND assignments.revoked_at IS NULL
      AND assignments.starts_at <= now()
      AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
      AND permissions.permission_key = required_permission
  );
$$;

CREATE FUNCTION commercial.require_global_permission(
  actor_identity_uuid uuid,
  required_permission text
)
RETURNS void
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF NOT commercial.has_global_permission(actor_identity_uuid, required_permission) THEN
    RAISE EXCEPTION 'Commercial actor is not authorized for permission %', required_permission;
  END IF;
END;
$$;

CREATE FUNCTION commercial.require_provider_permission(
  actor_identity_uuid uuid,
  scoped_provider_uuid uuid,
  required_permission text
)
RETURNS void
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF NOT commercial.has_provider_permission(
    actor_identity_uuid,
    scoped_provider_uuid,
    required_permission
  ) THEN
    RAISE EXCEPTION 'Commercial actor is not authorized for the provider scope';
  END IF;
END;
$$;

CREATE FUNCTION commercial.prevent_append_only_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Commercial history is append-only';
END;
$$;

CREATE FUNCTION commercial.prevent_material_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Commercial material records cannot be deleted';
END;
$$;

CREATE FUNCTION commercial.require_controlled_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('direkt.commercial_write', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Commercial state must be changed through an authorized state machine';
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION commercial.require_controlled_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('direkt.commercial_write', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Commercial records must be created through an authorized state machine';
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION commercial.require_event_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('direkt.commercial_event_write', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Commercial events must be appended by an authorized state machine';
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION commercial.require_ledger_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('direkt.commercial_ledger_write', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Commercial ledger rows must be posted through the balanced ledger function';
  END IF;
  RETURN NEW;
END;
$$;

ALTER TABLE commercial.subscription_events
  ADD CONSTRAINT subscription_events_safe_metadata CHECK (
    jsonb_typeof(safe_metadata) = 'object'
    AND safe_metadata::text !~* '(contact|phone|email|evidence|object.?key|coordinate|review|complaint)'
  );
ALTER TABLE commercial.payment_events
  ADD CONSTRAINT payment_events_safe_metadata CHECK (
    jsonb_typeof(safe_metadata) = 'object'
    AND safe_metadata::text !~* '(contact|phone|email|evidence|object.?key|coordinate|review|complaint)'
  );
ALTER TABLE commercial.webhook_receipts
  ADD CONSTRAINT webhook_receipts_safe_metadata CHECK (
    jsonb_typeof(safe_metadata) = 'object'
    AND safe_metadata::text !~* '(contact|phone|email|evidence|object.?key|coordinate|review|complaint|raw.?payload)'
  );
ALTER TABLE commercial.commercial_events
  ADD CONSTRAINT commercial_events_safe_metadata CHECK (
    jsonb_typeof(safe_metadata) = 'object'
    AND safe_metadata::text !~* '(contact|phone|email|evidence|object.?key|coordinate|review|complaint|raw.?payload)'
  );

CREATE TRIGGER products_controlled_update
BEFORE UPDATE ON commercial.products
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_update();
CREATE TRIGGER products_no_delete
BEFORE DELETE ON commercial.products
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_material_delete();

CREATE TRIGGER prices_controlled_update
BEFORE UPDATE ON commercial.prices
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_update();
CREATE TRIGGER prices_no_delete
BEFORE DELETE ON commercial.prices
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_material_delete();

CREATE TRIGGER product_entitlements_controlled_update
BEFORE UPDATE ON commercial.product_entitlements
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_update();
CREATE TRIGGER product_entitlements_no_delete
BEFORE DELETE ON commercial.product_entitlements
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_material_delete();

CREATE TRIGGER subscriptions_controlled_insert
BEFORE INSERT ON commercial.subscriptions
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_insert();
CREATE TRIGGER subscriptions_controlled_update
BEFORE UPDATE ON commercial.subscriptions
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_update();
CREATE TRIGGER subscriptions_no_delete
BEFORE DELETE ON commercial.subscriptions
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_material_delete();

CREATE TRIGGER subscription_events_controlled_insert
BEFORE INSERT ON commercial.subscription_events
FOR EACH ROW EXECUTE FUNCTION commercial.require_event_insert();
CREATE TRIGGER subscription_events_immutable
BEFORE UPDATE OR DELETE ON commercial.subscription_events
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_append_only_mutation();

CREATE TRIGGER entitlement_grants_controlled_insert
BEFORE INSERT ON commercial.entitlement_grants
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_insert();
CREATE TRIGGER entitlement_grants_controlled_update
BEFORE UPDATE ON commercial.entitlement_grants
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_update();
CREATE TRIGGER entitlement_grants_no_delete
BEFORE DELETE ON commercial.entitlement_grants
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_material_delete();

CREATE TRIGGER invoices_controlled_insert
BEFORE INSERT ON commercial.invoices
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_insert();
CREATE TRIGGER invoices_controlled_update
BEFORE UPDATE ON commercial.invoices
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_update();
CREATE TRIGGER invoices_no_delete
BEFORE DELETE ON commercial.invoices
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_material_delete();

CREATE TRIGGER invoice_lines_controlled_insert
BEFORE INSERT ON commercial.invoice_lines
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_insert();
CREATE TRIGGER invoice_lines_immutable
BEFORE UPDATE OR DELETE ON commercial.invoice_lines
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_append_only_mutation();

CREATE TRIGGER payment_intents_controlled_insert
BEFORE INSERT ON commercial.payment_intents
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_insert();
CREATE TRIGGER payment_intents_controlled_update
BEFORE UPDATE ON commercial.payment_intents
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_update();
CREATE TRIGGER payment_intents_no_delete
BEFORE DELETE ON commercial.payment_intents
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_material_delete();

CREATE TRIGGER payment_events_controlled_insert
BEFORE INSERT ON commercial.payment_events
FOR EACH ROW EXECUTE FUNCTION commercial.require_event_insert();
CREATE TRIGGER payment_events_immutable
BEFORE UPDATE OR DELETE ON commercial.payment_events
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_append_only_mutation();

CREATE TRIGGER webhook_receipts_controlled_insert
BEFORE INSERT ON commercial.webhook_receipts
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_insert();
CREATE TRIGGER webhook_receipts_controlled_update
BEFORE UPDATE ON commercial.webhook_receipts
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_update();
CREATE TRIGGER webhook_receipts_no_delete
BEFORE DELETE ON commercial.webhook_receipts
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_material_delete();

CREATE TRIGGER ledger_transactions_controlled_insert
BEFORE INSERT ON commercial.ledger_transactions
FOR EACH ROW EXECUTE FUNCTION commercial.require_ledger_insert();
CREATE TRIGGER ledger_transactions_immutable
BEFORE UPDATE OR DELETE ON commercial.ledger_transactions
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_append_only_mutation();

CREATE TRIGGER ledger_entries_controlled_insert
BEFORE INSERT ON commercial.ledger_entries
FOR EACH ROW EXECUTE FUNCTION commercial.require_ledger_insert();
CREATE TRIGGER ledger_entries_immutable
BEFORE UPDATE OR DELETE ON commercial.ledger_entries
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_append_only_mutation();

CREATE TRIGGER reconciliation_cases_controlled_insert
BEFORE INSERT ON commercial.reconciliation_cases
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_insert();
CREATE TRIGGER reconciliation_cases_controlled_update
BEFORE UPDATE ON commercial.reconciliation_cases
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_update();
CREATE TRIGGER reconciliation_cases_no_delete
BEFORE DELETE ON commercial.reconciliation_cases
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_material_delete();

CREATE TRIGGER reconciliation_events_controlled_insert
BEFORE INSERT ON commercial.reconciliation_events
FOR EACH ROW EXECUTE FUNCTION commercial.require_event_insert();
CREATE TRIGGER reconciliation_events_immutable
BEFORE UPDATE OR DELETE ON commercial.reconciliation_events
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_append_only_mutation();

CREATE TRIGGER adjustment_requests_controlled_insert
BEFORE INSERT ON commercial.adjustment_requests
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_insert();
CREATE TRIGGER adjustment_requests_controlled_update
BEFORE UPDATE ON commercial.adjustment_requests
FOR EACH ROW EXECUTE FUNCTION commercial.require_controlled_update();
CREATE TRIGGER adjustment_requests_no_delete
BEFORE DELETE ON commercial.adjustment_requests
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_material_delete();

CREATE TRIGGER adjustment_approvals_controlled_insert
BEFORE INSERT ON commercial.adjustment_approvals
FOR EACH ROW EXECUTE FUNCTION commercial.require_event_insert();
CREATE TRIGGER adjustment_approvals_immutable
BEFORE UPDATE OR DELETE ON commercial.adjustment_approvals
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_append_only_mutation();

CREATE TRIGGER commercial_events_controlled_insert
BEFORE INSERT ON commercial.commercial_events
FOR EACH ROW EXECUTE FUNCTION commercial.require_event_insert();
CREATE TRIGGER commercial_events_immutable
BEFORE UPDATE OR DELETE ON commercial.commercial_events
FOR EACH ROW EXECUTE FUNCTION commercial.prevent_append_only_mutation();

CREATE FUNCTION commercial.next_entity_sequence(
  target_entity_type text,
  target_entity_id uuid
)
RETURNS integer
LANGUAGE sql
AS $$
  SELECT COALESCE(max(sequence), 0) + 1
  FROM commercial.commercial_events
  WHERE entity_type = target_entity_type
    AND entity_id = target_entity_id;
$$;

CREATE FUNCTION commercial.append_event(
  target_entity_type text,
  target_entity_id uuid,
  target_event_type text,
  target_actor_kind text,
  target_actor_identity_id uuid,
  target_provider_id uuid,
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
  next_sequence := commercial.next_entity_sequence(target_entity_type, target_entity_id);
  PERFORM set_config('direkt.commercial_event_write', 'on', true);
  INSERT INTO commercial.commercial_events (
    entity_type,
    entity_id,
    sequence,
    event_type,
    actor_kind,
    actor_identity_id,
    provider_id,
    reason,
    policy_version,
    safe_metadata
  ) VALUES (
    target_entity_type,
    target_entity_id,
    next_sequence,
    target_event_type,
    target_actor_kind,
    target_actor_identity_id,
    target_provider_id,
    target_reason,
    target_policy_version,
    COALESCE(target_safe_metadata, '{}'::jsonb)
  )
  RETURNING id INTO created_event_id;
  RETURN created_event_id;
END;
$$;

CREATE FUNCTION commercial.post_balanced_ledger_transaction(
  target_provider_id uuid,
  target_invoice_id uuid,
  target_payment_intent_id uuid,
  target_transaction_type text,
  target_external_reference text,
  target_currency text,
  target_amount_minor bigint,
  target_debit_account text,
  target_credit_account text,
  target_policy_version text
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  created_transaction_id uuid;
BEGIN
  IF target_amount_minor <= 0 THEN
    RAISE EXCEPTION 'Ledger amount must be positive';
  END IF;
  IF target_debit_account = target_credit_account THEN
    RAISE EXCEPTION 'Ledger debit and credit accounts must be different';
  END IF;

  PERFORM set_config('direkt.commercial_ledger_write', 'on', true);
  INSERT INTO commercial.ledger_transactions (
    provider_id,
    invoice_id,
    payment_intent_id,
    transaction_type,
    external_reference,
    currency,
    amount_minor,
    policy_version
  ) VALUES (
    target_provider_id,
    target_invoice_id,
    target_payment_intent_id,
    target_transaction_type,
    target_external_reference,
    target_currency,
    target_amount_minor,
    target_policy_version
  )
  RETURNING id INTO created_transaction_id;

  INSERT INTO commercial.ledger_entries (
    ledger_transaction_id,
    provider_id,
    account_key,
    currency,
    debit_minor,
    credit_minor
  ) VALUES
    (
      created_transaction_id,
      target_provider_id,
      target_debit_account,
      target_currency,
      target_amount_minor,
      0
    ),
    (
      created_transaction_id,
      target_provider_id,
      target_credit_account,
      target_currency,
      0,
      target_amount_minor
    );

  RETURN created_transaction_id;
END;
$$;

CREATE FUNCTION commercial.assert_ledger_transaction_balanced()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  transaction_record commercial.ledger_transactions;
  entry_count integer;
  total_debit bigint;
  total_credit bigint;
  wrong_scope_count integer;
BEGIN
  SELECT * INTO transaction_record
  FROM commercial.ledger_transactions
  WHERE id = NEW.ledger_transaction_id;

  SELECT
    count(*),
    COALESCE(sum(debit_minor), 0),
    COALESCE(sum(credit_minor), 0),
    count(*) FILTER (
      WHERE provider_id <> transaction_record.provider_id
        OR currency <> transaction_record.currency
    )
  INTO entry_count, total_debit, total_credit, wrong_scope_count
  FROM commercial.ledger_entries
  WHERE ledger_transaction_id = NEW.ledger_transaction_id;

  IF entry_count <> 2
    OR total_debit <> transaction_record.amount_minor
    OR total_credit <> transaction_record.amount_minor
    OR wrong_scope_count <> 0 THEN
    RAISE EXCEPTION 'Commercial ledger transaction is not balanced or scope-consistent';
  END IF;
  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER ledger_entries_assert_balanced
AFTER INSERT ON commercial.ledger_entries
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION commercial.assert_ledger_transaction_balanced();

CREATE FUNCTION commercial.audit_action(
  target_request_id uuid,
  target_actor_identity_id uuid,
  target_provider_id uuid,
  target_action text,
  target_resource_type text,
  target_resource_id uuid,
  target_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO platform.audit_events (
    request_id,
    actor_type,
    actor_id,
    provider_id,
    action,
    resource_type,
    resource_id,
    outcome,
    metadata
  ) VALUES (
    target_request_id,
    CASE WHEN target_actor_identity_id IS NULL THEN 'system' ELSE 'identity' END,
    target_actor_identity_id,
    target_provider_id,
    target_action,
    target_resource_type,
    target_resource_id,
    'success',
    COALESCE(target_metadata, '{}'::jsonb)
  );
END;
$$;
