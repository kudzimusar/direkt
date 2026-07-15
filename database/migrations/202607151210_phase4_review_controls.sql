CREATE FUNCTION verification.validate_reason_semantics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  expected_outcome text;
  submitted_outcome text;
BEGIN
  SELECT outcome INTO expected_outcome
  FROM verification.reason_codes
  WHERE code = NEW.reason_code
    AND active = true;

  IF expected_outcome IS NULL THEN
    RAISE EXCEPTION 'Verification reason code is inactive or unknown';
  END IF;

  submitted_outcome := CASE
    WHEN TG_TABLE_NAME = 'recommendations' THEN
      CASE NEW.result
        WHEN 'approve' THEN 'approve'
        WHEN 'reject' THEN 'reject'
        WHEN 'correction_required' THEN 'correction'
        ELSE 'revoke'
      END
    ELSE
      CASE NEW.result
        WHEN 'approved' THEN 'approve'
        WHEN 'rejected' THEN 'reject'
        WHEN 'correction_required' THEN 'correction'
        ELSE 'revoke'
      END
  END;

  IF submitted_outcome IS DISTINCT FROM expected_outcome THEN
    RAISE EXCEPTION 'Reason code outcome % does not match submitted result %',
      expected_outcome,
      NEW.result;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER verification_recommendations_reason_semantics
BEFORE INSERT ON verification.recommendations
FOR EACH ROW
EXECUTE FUNCTION verification.validate_reason_semantics();

CREATE TRIGGER verification_decisions_reason_semantics
BEFORE INSERT ON verification.decisions
FOR EACH ROW
EXECUTE FUNCTION verification.validate_reason_semantics();

CREATE FUNCTION verification.validate_decision_lifecycle()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  current_case_status text;
BEGIN
  SELECT status INTO current_case_status
  FROM verification.cases
  WHERE id = NEW.case_id
  FOR UPDATE;

  IF current_case_status IS NULL THEN
    RAISE EXCEPTION 'Unknown verification case';
  END IF;

  IF current_case_status <> 'in_review' THEN
    RAISE EXCEPTION 'Final decisions require a verification case in in_review state';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER verification_decisions_lifecycle
BEFORE INSERT ON verification.decisions
FOR EACH ROW
EXECUTE FUNCTION verification.validate_decision_lifecycle();

COMMENT ON FUNCTION verification.validate_reason_semantics() IS
  'Prevents recommendation and decision outcomes from contradicting their immutable reason code.';
COMMENT ON FUNCTION verification.validate_decision_lifecycle() IS
  'Allows one final decision only while a case is actively in review; appeals or renewals must re-enter review explicitly.';
