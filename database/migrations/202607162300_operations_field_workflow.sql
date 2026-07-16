CREATE TABLE operations.field_inspection_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL,
  version integer NOT NULL,
  check_family text NOT NULL,
  title text NOT NULL,
  sections jsonb NOT NULL,
  policy_version text NOT NULL,
  effective_from timestamptz NOT NULL DEFAULT now(),
  effective_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT operations_field_template_key_format CHECK (
    template_key ~ '^[a-z][a-z0-9_]{2,63}$'
  ),
  CONSTRAINT operations_field_template_version_positive CHECK (version > 0),
  CONSTRAINT operations_field_template_family_allowed CHECK (
    check_family IN (
      'contact',
      'representative_identity',
      'business',
      'qualification',
      'licence',
      'location',
      'premises',
      'field_visit',
      'category_eligibility',
      'good_standing'
    )
  ),
  CONSTRAINT operations_field_template_title_not_blank CHECK (length(btrim(title)) >= 8),
  CONSTRAINT operations_field_template_sections_array CHECK (
    jsonb_typeof(sections) = 'array' AND jsonb_array_length(sections) BETWEEN 1 AND 40
  ),
  CONSTRAINT operations_field_template_policy_not_blank CHECK (length(btrim(policy_version)) >= 3),
  CONSTRAINT operations_field_template_effective_range CHECK (
    effective_until IS NULL OR effective_until > effective_from
  ),
  UNIQUE (template_key, version)
);

CREATE TRIGGER operations_field_inspection_templates_immutable
BEFORE UPDATE OR DELETE ON operations.field_inspection_templates
FOR EACH ROW
EXECUTE FUNCTION platform.reject_immutable_mutation();

INSERT INTO operations.field_inspection_templates (
  template_key,
  version,
  check_family,
  title,
  sections,
  policy_version,
  effective_from
) VALUES (
  'standard_field_inspection',
  1,
  'field_visit',
  'Standard synthetic field inspection',
  '[
    {"key":"arrival_and_safety","label":"Arrival and safety conditions","required":true},
    {"key":"provider_presence","label":"Provider or representative presence","required":true},
    {"key":"premises_observation","label":"Premises or service capability observation","required":true},
    {"key":"evidence_consistency","label":"Consistency with assigned verification evidence","required":true}
  ]'::jsonb,
  'phase7-v1',
  timestamptz '2026-07-16 00:00:00+00'
);

CREATE TABLE operations.field_work_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES verification.cases(id) ON DELETE RESTRICT,
  verification_assignment_id uuid NOT NULL UNIQUE REFERENCES verification.assignments(id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  category_id uuid NOT NULL REFERENCES catalog.service_categories(id) ON DELETE RESTRICT,
  requirement_id uuid NOT NULL REFERENCES catalog.requirements(id) ON DELETE RESTRICT,
  field_agent_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  template_id uuid NOT NULL REFERENCES operations.field_inspection_templates(id) ON DELETE RESTRICT,
  state text NOT NULL DEFAULT 'scheduled',
  scheduled_for timestamptz NOT NULL,
  due_at timestamptz NOT NULL,
  assignment_reason text NOT NULL,
  policy_version text NOT NULL,
  assigned_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  accepted_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  terminal_reason text,
  replaced_by_work_item_id uuid REFERENCES operations.field_work_items(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT operations_field_work_state_allowed CHECK (
    state IN (
      'scheduled',
      'accepted',
      'in_progress',
      'submitted',
      'missed',
      'unable_to_verify',
      'safety_abort',
      'cancelled',
      'reassigned'
    )
  ),
  CONSTRAINT operations_field_work_schedule_valid CHECK (due_at > scheduled_for),
  CONSTRAINT operations_field_work_reason_not_blank CHECK (length(btrim(assignment_reason)) >= 12),
  CONSTRAINT operations_field_work_policy_not_blank CHECK (length(btrim(policy_version)) >= 3),
  CONSTRAINT operations_field_work_terminal_consistent CHECK (
    (state IN ('scheduled', 'accepted', 'in_progress') AND ended_at IS NULL AND terminal_reason IS NULL)
    OR (state IN ('submitted', 'missed', 'unable_to_verify', 'safety_abort', 'cancelled', 'reassigned')
      AND ended_at IS NOT NULL
      AND terminal_reason IS NOT NULL
      AND length(btrim(terminal_reason)) >= 8)
  ),
  CONSTRAINT operations_field_work_replacement_consistent CHECK (
    (state = 'reassigned' AND replaced_by_work_item_id IS NOT NULL)
    OR (state <> 'reassigned' AND replaced_by_work_item_id IS NULL)
  )
);

CREATE UNIQUE INDEX operations_field_work_one_active_case_idx
  ON operations.field_work_items (case_id)
  WHERE state IN ('scheduled', 'accepted', 'in_progress');
CREATE INDEX operations_field_work_agent_state_idx
  ON operations.field_work_items (field_agent_identity_id, state, scheduled_for);
CREATE INDEX operations_field_work_due_idx
  ON operations.field_work_items (state, due_at)
  WHERE state IN ('scheduled', 'accepted', 'in_progress');

CREATE FUNCTION operations.validate_field_work_item()
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
  assignment_kind text;
  assignment_status text;
  template_family text;
BEGIN
  SELECT provider_id, category_id, requirement_id, check_family, status
  INTO case_provider_id, case_category_id, case_requirement_id, case_check_family, case_status
  FROM verification.cases
  WHERE id = NEW.case_id;

  SELECT case_id, assignee_identity_id, assignment_kind, status
  INTO assignment_case_id, assignment_agent_id, assignment_kind, assignment_status
  FROM verification.assignments
  WHERE id = NEW.verification_assignment_id;

  SELECT check_family
  INTO template_family
  FROM operations.field_inspection_templates
  WHERE id = NEW.template_id
    AND effective_from <= now()
    AND (effective_until IS NULL OR effective_until > now());

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
     OR assignment_kind <> 'field_agent'
     OR assignment_status <> 'active' THEN
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

CREATE TRIGGER operations_field_work_items_validate
BEFORE INSERT OR UPDATE OF
  case_id,
  verification_assignment_id,
  provider_id,
  category_id,
  requirement_id,
  field_agent_identity_id,
  template_id
ON operations.field_work_items
FOR EACH ROW
EXECUTE FUNCTION operations.validate_field_work_item();

CREATE FUNCTION operations.validate_field_work_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.state = NEW.state THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.state = 'scheduled' AND NEW.state IN ('accepted', 'missed', 'cancelled', 'reassigned'))
    OR (OLD.state = 'accepted' AND NEW.state IN ('in_progress', 'missed', 'cancelled', 'reassigned'))
    OR (OLD.state = 'in_progress' AND NEW.state IN ('submitted', 'unable_to_verify', 'safety_abort', 'cancelled'))
  ) THEN
    RAISE EXCEPTION 'Invalid field work transition from % to %', OLD.state, NEW.state;
  END IF;

  IF NEW.state = 'accepted' THEN
    NEW.accepted_at := COALESCE(NEW.accepted_at, now());
  END IF;
  IF NEW.state = 'in_progress' THEN
    NEW.accepted_at := COALESCE(NEW.accepted_at, now());
    NEW.started_at := COALESCE(NEW.started_at, now());
  END IF;
  IF NEW.state IN ('submitted', 'missed', 'unable_to_verify', 'safety_abort', 'cancelled', 'reassigned') THEN
    NEW.ended_at := COALESCE(NEW.ended_at, now());
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_field_work_items_validate_transition
BEFORE UPDATE OF state ON operations.field_work_items
FOR EACH ROW
EXECUTE FUNCTION operations.validate_field_work_transition();

CREATE TABLE operations.field_inspection_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id uuid NOT NULL REFERENCES operations.field_work_items(id) ON DELETE RESTRICT,
  case_id uuid NOT NULL REFERENCES verification.cases(id) ON DELETE RESTRICT,
  assignment_id uuid NOT NULL REFERENCES verification.assignments(id) ON DELETE RESTRICT,
  field_visit_id uuid NOT NULL UNIQUE REFERENCES verification.field_visits(id) ON DELETE RESTRICT,
  submitted_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  client_submission_key text NOT NULL,
  payload_hash text NOT NULL,
  outcome text NOT NULL,
  checklist_version text NOT NULL,
  public_safe_summary text NOT NULL,
  private_notes text,
  observations jsonb NOT NULL,
  evidence_references jsonb NOT NULL DEFAULT '[]'::jsonb,
  policy_version text NOT NULL,
  occurred_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  advisory_only boolean NOT NULL DEFAULT true,
  CONSTRAINT operations_field_submission_key_format CHECK (
    client_submission_key ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$'
  ),
  CONSTRAINT operations_field_submission_hash_format CHECK (payload_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT operations_field_submission_outcome_allowed CHECK (
    outcome IN (
      'completed',
      'inconclusive',
      'unable_to_access',
      'safety_abort',
      'missed',
      'unable_to_verify'
    )
  ),
  CONSTRAINT operations_field_submission_checklist_not_blank CHECK (
    length(btrim(checklist_version)) >= 3
  ),
  CONSTRAINT operations_field_submission_summary_not_blank CHECK (
    length(btrim(public_safe_summary)) >= 12
  ),
  CONSTRAINT operations_field_submission_observations_array CHECK (
    jsonb_typeof(observations) = 'array' AND jsonb_array_length(observations) BETWEEN 1 AND 80
  ),
  CONSTRAINT operations_field_submission_evidence_array CHECK (
    jsonb_typeof(evidence_references) = 'array' AND jsonb_array_length(evidence_references) <= 20
  ),
  CONSTRAINT operations_field_submission_safe_payload CHECK (
    observations::text !~* '(latitude|longitude|object[_]?key|sha256|identity[_]?number|signature)'
  ),
  CONSTRAINT operations_field_submission_policy_not_blank CHECK (length(btrim(policy_version)) >= 3),
  CONSTRAINT operations_field_submission_time_valid CHECK (occurred_at <= recorded_at),
  CONSTRAINT operations_field_submission_advisory CHECK (advisory_only = true),
  UNIQUE (work_item_id, client_submission_key)
);

CREATE TRIGGER operations_field_inspection_submissions_immutable
BEFORE UPDATE OR DELETE ON operations.field_inspection_submissions
FOR EACH ROW
EXECUTE FUNCTION platform.reject_immutable_mutation();

CREATE FUNCTION operations.validate_field_inspection_submission()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  item_case_id uuid;
  item_assignment_id uuid;
  item_agent_id uuid;
  item_state text;
  visit_case_id uuid;
  visit_assignment_id uuid;
  visit_agent_id uuid;
BEGIN
  SELECT case_id, verification_assignment_id, field_agent_identity_id, state
  INTO item_case_id, item_assignment_id, item_agent_id, item_state
  FROM operations.field_work_items
  WHERE id = NEW.work_item_id;

  SELECT case_id, assignment_id, field_agent_identity_id
  INTO visit_case_id, visit_assignment_id, visit_agent_id
  FROM verification.field_visits
  WHERE id = NEW.field_visit_id;

  IF item_case_id IS NULL
     OR item_case_id IS DISTINCT FROM NEW.case_id
     OR item_assignment_id IS DISTINCT FROM NEW.assignment_id
     OR item_agent_id IS DISTINCT FROM NEW.submitted_by_identity_id
     OR item_state NOT IN ('accepted', 'in_progress') THEN
    RAISE EXCEPTION 'Field inspection submission requires the active assigned field work item';
  END IF;

  IF visit_case_id IS NULL
     OR visit_case_id IS DISTINCT FROM NEW.case_id
     OR visit_assignment_id IS DISTINCT FROM NEW.assignment_id
     OR visit_agent_id IS DISTINCT FROM NEW.submitted_by_identity_id THEN
    RAISE EXCEPTION 'Field inspection submission does not match its immutable field visit';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements_text(NEW.evidence_references) AS reference(value)
    WHERE NOT EXISTS (
      SELECT 1
      FROM verification.case_evidence
      WHERE case_evidence.case_id = NEW.case_id
        AND case_evidence.evidence_id = reference.value::uuid
    )
  ) THEN
    RAISE EXCEPTION 'Field inspection evidence reference is outside the assigned case';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_field_inspection_submissions_validate
BEFORE INSERT ON operations.field_inspection_submissions
FOR EACH ROW
EXECUTE FUNCTION operations.validate_field_inspection_submission();

INSERT INTO authz.permissions (permission_key, description) VALUES
  ('operations.field_work.read', 'Read role-scoped field assignments and safe inspection summaries.'),
  ('operations.field_work.manage', 'Create, reassign or cancel scoped field work items.')
ON CONFLICT (permission_key) DO NOTHING;

WITH grants(role_key, permission_key) AS (
  VALUES
    ('field_agent', 'operations.field_work.read'),
    ('trust_supervisor', 'operations.field_work.read'),
    ('trust_supervisor', 'operations.field_work.manage'),
    ('admin', 'operations.field_work.read'),
    ('admin', 'operations.field_work.manage')
)
INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM grants
JOIN authz.roles AS roles USING (role_key)
JOIN authz.permissions AS permissions USING (permission_key)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE operations.field_inspection_templates IS
  'Immutable policy-versioned templates for structured synthetic field observations.';
COMMENT ON TABLE operations.field_work_items IS
  'Operational lifecycle layered over one verification field-agent assignment. It stores no private coordinates.';
COMMENT ON TABLE operations.field_inspection_submissions IS
  'Immutable idempotent advisory inspection submissions. They cannot create decisions, claims or publication.';
