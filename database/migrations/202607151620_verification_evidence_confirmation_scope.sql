CREATE OR REPLACE FUNCTION verification.validate_case_evidence_link()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  case_provider uuid;
  case_requirement uuid;
  case_status text;
  evidence_provider uuid;
  evidence_requirement uuid;
BEGIN
  SELECT provider_id, requirement_id, status
  INTO case_provider, case_requirement, case_status
  FROM verification.cases
  WHERE id = NEW.case_id;

  SELECT provider_id, requirement_id
  INTO evidence_provider, evidence_requirement
  FROM evidence.items
  WHERE id = NEW.evidence_id;

  IF case_provider IS NULL OR evidence_provider IS NULL THEN
    RAISE EXCEPTION 'Evidence confirmation requires an existing case and evidence item';
  END IF;

  IF case_provider IS DISTINCT FROM evidence_provider
     OR case_requirement IS DISTINCT FROM evidence_requirement THEN
    RAISE EXCEPTION 'Evidence cannot be linked across provider or requirement scope';
  END IF;

  IF case_status NOT IN ('awaiting_evidence', 'correction_required') THEN
    RAISE EXCEPTION 'Evidence can only be confirmed into a case awaiting evidence or correction';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION verification.validate_case_evidence_link() IS
  'Enforces provider, requirement and open-case scope when confirmation links a private evidence item to a verification case. A failure rolls back the evidence version and upload-session completion in the same transaction.';
