CREATE OR REPLACE FUNCTION commercial.record_webhook_receipt(
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
  event_policy_version text;
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
    IF existing_receipt.event_fingerprint <> target_event_fingerprint
      OR existing_receipt.event_type <> target_event_type
      OR existing_receipt.payment_intent_id IS DISTINCT FROM target_payment_intent_id THEN
      RAISE EXCEPTION 'Webhook event identifier was reused with a different payload';
    END IF;
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
  event_policy_version := COALESCE(
    NULLIF(btrim(target_safe_metadata ->> 'policyVersion'), ''),
    'phase9-v1'
  );

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
    event_policy_version,
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

CREATE FUNCTION commercial.validate_webhook_processing_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  payment_record commercial.payment_intents;
  recorded_target_status text;
  recorded_amount_minor bigint;
  recorded_currency text;
BEGIN
  IF NEW.processing_outcome = 'processed'
    AND OLD.processing_outcome IS DISTINCT FROM 'processed' THEN
    IF NOT NEW.signature_verified OR NOT NEW.timestamp_verified THEN
      RAISE EXCEPTION 'Processed webhook receipt must have verified signature and timestamp';
    END IF;
    IF NEW.payment_intent_id IS NULL THEN
      RAISE EXCEPTION 'Processed webhook receipt must reference a payment intent';
    END IF;
    IF NEW.rejection_code IS NOT NULL THEN
      RAISE EXCEPTION 'Processed webhook receipt cannot retain a rejection code';
    END IF;

    recorded_target_status := NEW.safe_metadata ->> 'targetStatus';
    recorded_currency := NEW.safe_metadata ->> 'currency';
    IF recorded_target_status IS NULL
      OR recorded_currency IS NULL
      OR NOT (NEW.safe_metadata ? 'amountMinor') THEN
      RAISE EXCEPTION 'Processed webhook receipt is missing canonical safe metadata';
    END IF;
    recorded_amount_minor := (NEW.safe_metadata ->> 'amountMinor')::bigint;

    SELECT * INTO payment_record
    FROM commercial.payment_intents
    WHERE id = NEW.payment_intent_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Processed webhook payment intent was not found';
    END IF;
    IF payment_record.status <> recorded_target_status THEN
      RAISE EXCEPTION 'Processed webhook target status does not match the canonical receipt';
    END IF;
    IF payment_record.amount_minor <> recorded_amount_minor
      OR payment_record.currency <> recorded_currency THEN
      RAISE EXCEPTION 'Processed webhook amount or currency does not match the payment intent';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER webhook_receipts_validate_processing
BEFORE UPDATE ON commercial.webhook_receipts
FOR EACH ROW EXECUTE FUNCTION commercial.validate_webhook_processing_update();
