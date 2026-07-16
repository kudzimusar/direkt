CREATE OR REPLACE FUNCTION operations.validate_field_work_item()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  case_provider_id uuid;
  case_category_id uuid;
  case_requirement_id uuid;
  case_check_family text;
  case_status text;
  assignment_case_id uuid;
  assignment_agent_id uuid;
  assignment_kind_value text;
  assignment_status_value text;
  template_family text;
BEGIN
  SELECT provider_id, category_id, requirement_id, check_family, status
  INTO case_provider_id, case_category_id, case_requirement_id, case_check_family, case_status
  FROM verification.cases
  WHERE id = NEW.case_id;

  SELECT
    assignments.case_id,
    assignments.assignee_identity_id,
    assignments.assignment_kind,
    assignments.status
  INTO
    assignment_case_id,
    assignment_agent_id,
    assignment_kind_value,
    assignment_status_value
  FROM verification.assignments AS assignments
  WHERE assignments.id = NEW.verification_assignment_id;

  SELECT templates.check_family
  INTO template_family
  FROM operations.field_inspection_templates AS templates
  WHERE templates.id = NEW.template_id
    AND templates.effective_from <= now()
    AND (templates.effective_until IS NULL OR templates.effective_until > now());

  IF case_provider_id IS NULL
     OR case_provider_id IS DISTINCT FROM NEW.provider_id
     OR case_category_id IS DISTINCT FROM NEW.category_id
     OR case_requirement_id IS DISTINCT FROM NEW.requirement_id THEN
    RAISE EXCEPTION 'Field work item does not match its provider, category and requirement case scope';
  END IF;

  IF case_status IN ('approved', 'rejected', 'revoked', 'expired', 'cancelled', 'closed') THEN
    RAISE EXCEPTION 'Terminal verification cases cannot receive field work';
  END IF;

  IF assignment_case_id IS NULL
     OR assignment_case_id IS DISTINCT FROM NEW.case_id
     OR assignment_agent_id IS DISTINCT FROM NEW.field_agent_identity_id
     OR assignment_kind_value <> 'field_agent'
     OR assignment_status_value <> 'active' THEN
    RAISE EXCEPTION 'Field work requires one active matching field-agent assignment';
  END IF;

  IF template_family IS NULL
     OR template_family NOT IN ('field_visit', case_check_family) THEN
    RAISE EXCEPTION 'Field inspection template is not applicable to the verification case';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION operations.validate_field_work_item() IS
  'Validates field work against one active scoped assignment and an applicable immutable template without ambiguous PL/pgSQL column resolution.';
