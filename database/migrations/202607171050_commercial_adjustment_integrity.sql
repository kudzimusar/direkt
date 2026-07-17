CREATE FUNCTION commercial.validate_adjustment_references()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  invoice_record commercial.invoices;
  payment_record commercial.payment_intents;
BEGIN
  IF NEW.invoice_id IS NOT NULL THEN
    SELECT * INTO invoice_record
    FROM commercial.invoices
    WHERE id = NEW.invoice_id;
    IF NOT FOUND
      OR invoice_record.provider_id <> NEW.provider_id
      OR invoice_record.currency <> NEW.currency THEN
      RAISE EXCEPTION 'Adjustment invoice scope does not match the provider or currency';
    END IF;
  END IF;

  IF NEW.payment_intent_id IS NOT NULL THEN
    SELECT * INTO payment_record
    FROM commercial.payment_intents
    WHERE id = NEW.payment_intent_id;
    IF NOT FOUND
      OR payment_record.provider_id <> NEW.provider_id
      OR payment_record.currency <> NEW.currency THEN
      RAISE EXCEPTION 'Adjustment payment scope does not match the provider or currency';
    END IF;
    IF NEW.invoice_id IS NOT NULL AND payment_record.invoice_id <> NEW.invoice_id THEN
      RAISE EXCEPTION 'Adjustment invoice and payment scope does not match';
    END IF;
  END IF;

  IF NEW.adjustment_type = 'synthetic_refund' AND NEW.payment_intent_id IS NULL THEN
    RAISE EXCEPTION 'Synthetic refund adjustment requires a payment intent';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER adjustment_requests_validate_references
BEFORE INSERT OR UPDATE ON commercial.adjustment_requests
FOR EACH ROW EXECUTE FUNCTION commercial.validate_adjustment_references();
