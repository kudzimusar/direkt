CREATE SCHEMA IF NOT EXISTS evidence;
CREATE SCHEMA IF NOT EXISTS verification;

CREATE TABLE evidence.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  requirement_id uuid NOT NULL REFERENCES catalog.requirements(id) ON DELETE RESTRICT,
  submitted_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'draft',
  retention_class text NOT NULL DEFAULT 'standard',
  current_version_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revocation_reason text,
  CONSTRAINT evidence_items_status_allowed CHECK (
    status IN (
      'draft',
      'processing',
      'ready_for_review',
      'correction_required',
      'approved',
      'rejected',
      'revoked',
      'expired'
    )
  ),
  CONSTRAINT evidence_items_retention_allowed CHECK (
    retention_class IN ('short', 'standard', 'regulated', 'legal_hold')
  ),
  CONSTRAINT evidence_items_revocation_consistent CHECK (
    (status = 'revoked' AND revoked_at IS NOT NULL AND length(btrim(revocation_reason)) >= 8)
    OR (status <> 'revoked' AND revoked_at IS NULL AND revocation_reason IS NULL)
  )
);

CREATE INDEX evidence_items_provider_status_idx
  ON evidence.items (provider_id, status, updated_at DESC);

CREATE TABLE evidence.upload_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  requirement_id uuid NOT NULL REFERENCES catalog.requirements(id) ON DELETE RESTRICT,
  created_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  replacement_for_evidence_id uuid REFERENCES evidence.items(id) ON DELETE RESTRICT,
  evidence_class text NOT NULL,
  document_type text NOT NULL,
  object_key text NOT NULL UNIQUE,
  expected_content_type text NOT NULL,
  max_bytes bigint NOT NULL,
  consent_confirmed boolean NOT NULL,
  status text NOT NULL DEFAULT 'requested',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT evidence_upload_class_allowed CHECK (
    evidence_class IN (
      'contact',
      'identity',
      'business',
      'qualification',
      'licence',
      'experience',
      'location',
      'premises',
      'field'
    )
  ),
  CONSTRAINT evidence_upload_document_type_format CHECK (
    document_type ~ '^[a-z][a-z0-9_]{2,63}$'
  ),
  CONSTRAINT evidence_upload_object_key_opaque CHECK (
    object_key ~ '^private/[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}$'
    AND object_key !~ '[[:space:]@]'
  ),
  CONSTRAINT evidence_upload_content_type_allowed CHECK (
    expected_content_type IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')
  ),
  CONSTRAINT evidence_upload_size_valid CHECK (max_bytes BETWEEN 1024 AND 20971520),
  CONSTRAINT evidence_upload_consent_required CHECK (consent_confirmed = true),
  CONSTRAINT evidence_upload_status_allowed CHECK (
    status IN ('requested', 'uploaded', 'completed', 'expired', 'cancelled')
  ),
  CONSTRAINT evidence_upload_expiry_valid CHECK (expires_at > created_at),
  CONSTRAINT evidence_upload_completion_consistent CHECK (
    (status = 'completed' AND completed_at IS NOT NULL)
    OR (status <> 'completed' AND completed_at IS NULL)
  )
);

CREATE INDEX evidence_upload_sessions_provider_idx
  ON evidence.upload_sessions (provider_id, expires_at DESC);

CREATE TABLE evidence.versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id uuid NOT NULL REFERENCES evidence.items(id) ON DELETE RESTRICT,
  version_number integer NOT NULL,
  upload_session_id uuid NOT NULL UNIQUE REFERENCES evidence.upload_sessions(id) ON DELETE RESTRICT,
  supersedes_version_id uuid REFERENCES evidence.versions(id) ON DELETE RESTRICT,
  object_key text NOT NULL UNIQUE,
  evidence_class text NOT NULL,
  document_type text NOT NULL,
  content_type text NOT NULL,
  size_bytes bigint NOT NULL,
  sha256 character(64) NOT NULL,
  issuing_authority text,
  issued_at date,
  valid_from date,
  expires_at timestamptz,
  processing_status text NOT NULL DEFAULT 'clean',
  submitted_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT evidence_versions_number_positive CHECK (version_number > 0),
  CONSTRAINT evidence_versions_object_key_opaque CHECK (
    object_key ~ '^private/[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}$'
    AND object_key !~ '[[:space:]@]'
  ),
  CONSTRAINT evidence_versions_class_allowed CHECK (
    evidence_class IN (
      'contact',
      'identity',
      'business',
      'qualification',
      'licence',
      'experience',
      'location',
      'premises',
      'field'
    )
  ),
  CONSTRAINT evidence_versions_document_type_format CHECK (
    document_type ~ '^[a-z][a-z0-9_]{2,63}$'
  ),
  CONSTRAINT evidence_versions_content_type_allowed CHECK (
    content_type IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')
  ),
  CONSTRAINT evidence_versions_size_valid CHECK (size_bytes BETWEEN 1 AND 20971520),
  CONSTRAINT evidence_versions_sha256_format CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  CONSTRAINT evidence_versions_dates_valid CHECK (
    (valid_from IS NULL OR issued_at IS NULL OR valid_from >= issued_at)
    AND (expires_at IS NULL OR expires_at > created_at)
  ),
  CONSTRAINT evidence_versions_processing_allowed CHECK (
    processing_status IN ('pending_scan', 'clean', 'rejected')
  ),
  CONSTRAINT evidence_versions_supersedes_different CHECK (
    supersedes_version_id IS NULL OR supersedes_version_id <> id
  ),
  UNIQUE (evidence_id, version_number)
);

ALTER TABLE evidence.items
  ADD CONSTRAINT evidence_items_current_version_fk
  FOREIGN KEY (current_version_id) REFERENCES evidence.versions(id) ON DELETE RESTRICT;

CREATE INDEX evidence_versions_evidence_idx
  ON evidence.versions (evidence_id, version_number DESC);
CREATE INDEX evidence_versions_expiry_idx
  ON evidence.versions (expires_at)
  WHERE expires_at IS NOT NULL;

CREATE FUNCTION evidence.validate_item_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'draft' AND NEW.status IN ('processing', 'revoked'))
    OR (OLD.status = 'processing' AND NEW.status IN ('ready_for_review', 'rejected', 'correction_required', 'revoked'))
    OR (OLD.status = 'ready_for_review' AND NEW.status IN ('approved', 'rejected', 'correction_required', 'revoked', 'expired'))
    OR (OLD.status = 'correction_required' AND NEW.status IN ('processing', 'ready_for_review', 'revoked'))
    OR (OLD.status = 'approved' AND NEW.status IN ('correction_required', 'revoked', 'expired'))
    OR (OLD.status IN ('rejected', 'revoked', 'expired') AND NEW.status = 'processing')
  ) THEN
    RAISE EXCEPTION 'Invalid evidence transition from % to %', OLD.status, NEW.status;
  END IF;

  IF NEW.status = 'revoked' THEN
    NEW.revoked_at := COALESCE(NEW.revoked_at, now());
    IF NEW.revocation_reason IS NULL OR length(btrim(NEW.revocation_reason)) < 8 THEN
      RAISE EXCEPTION 'Evidence revocation requires a reason';
    END IF;
  ELSE
    NEW.revoked_at := NULL;
    NEW.revocation_reason := NULL;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER evidence_items_validate_transition
BEFORE UPDATE OF status, current_version_id, revocation_reason ON evidence.items
FOR EACH ROW
EXECUTE FUNCTION evidence.validate_item_transition();

CREATE TRIGGER evidence_versions_immutable
BEFORE UPDATE OR DELETE ON evidence.versions
FOR EACH ROW
EXECUTE FUNCTION platform.reject_immutable_mutation();

CREATE FUNCTION evidence.validate_version_linkage()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  item_provider uuid;
  item_submitter uuid;
  session_provider uuid;
  session_submitter uuid;
  session_requirement uuid;
  session_object_key text;
  replacement_target uuid;
  previous_version integer;
BEGIN
  SELECT provider_id, submitted_by_identity_id
  INTO item_provider, item_submitter
  FROM evidence.items
  WHERE id = NEW.evidence_id;

  SELECT provider_id,
         created_by_identity_id,
         requirement_id,
         object_key,
         replacement_for_evidence_id
  INTO session_provider,
       session_submitter,
       session_requirement,
       session_object_key,
       replacement_target
  FROM evidence.upload_sessions
  WHERE id = NEW.upload_session_id;

  IF item_provider IS DISTINCT FROM session_provider
     OR item_submitter IS DISTINCT FROM session_submitter
     OR NEW.object_key IS DISTINCT FROM session_object_key THEN
    RAISE EXCEPTION 'Evidence version does not match its private upload session';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM evidence.items
    WHERE id = NEW.evidence_id AND requirement_id = session_requirement
  ) THEN
    RAISE EXCEPTION 'Evidence requirement does not match the upload session';
  END IF;

  IF replacement_target IS NOT NULL AND replacement_target IS DISTINCT FROM NEW.evidence_id THEN
    RAISE EXCEPTION 'Replacement upload session targets a different evidence item';
  END IF;

  SELECT max(version_number) INTO previous_version
  FROM evidence.versions
  WHERE evidence_id = NEW.evidence_id;

  IF previous_version IS NULL AND NEW.version_number <> 1 THEN
    RAISE EXCEPTION 'First evidence version must be version 1';
  END IF;

  IF previous_version IS NOT NULL AND NEW.version_number <> previous_version + 1 THEN
    RAISE EXCEPTION 'Evidence versions must increase sequentially';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER evidence_versions_validate_linkage
BEFORE INSERT ON evidence.versions
FOR EACH ROW
EXECUTE FUNCTION evidence.validate_version_linkage();

CREATE TABLE verification.reason_codes (
  code text PRIMARY KEY,
  outcome text NOT NULL,
  description text NOT NULL,
  requires_correction boolean NOT NULL DEFAULT false,
  public_safe boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT verification_reason_code_format CHECK (code ~ '^[A-Z][A-Z0-9_]{2,63}$'),
  CONSTRAINT verification_reason_outcome_allowed CHECK (
    outcome IN ('approve', 'reject', 'correction', 'revoke', 'field_visit')
  ),
  CONSTRAINT verification_reason_description_not_blank CHECK (length(btrim(description)) >= 8)
);

CREATE TRIGGER verification_reason_codes_immutable
BEFORE UPDATE OR DELETE ON verification.reason_codes
FOR EACH ROW
EXECUTE FUNCTION platform.reject_immutable_mutation();

CREATE TABLE verification.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  category_id uuid NOT NULL REFERENCES catalog.service_categories(id) ON DELETE RESTRICT,
  requirement_version_id uuid NOT NULL REFERENCES catalog.requirement_versions(id) ON DELETE RESTRICT,
  requirement_id uuid NOT NULL REFERENCES catalog.requirements(id) ON DELETE RESTRICT,
  check_key text NOT NULL,
  check_family text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  high_risk boolean NOT NULL DEFAULT false,
  policy_version text NOT NULL,
  created_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  CONSTRAINT verification_cases_check_key_format CHECK (check_key ~ '^[a-z][a-z0-9_]{2,63}$'),
  CONSTRAINT verification_cases_family_allowed CHECK (
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
  CONSTRAINT verification_cases_status_allowed CHECK (
    status IN (
      'draft',
      'awaiting_evidence',
      'ready_for_review',
      'assigned',
      'in_review',
      'correction_required',
      'approved',
      'rejected',
      'revoked',
      'expired',
      'renewal_required',
      'appealed',
      'cancelled',
      'closed'
    )
  ),
  CONSTRAINT verification_cases_policy_not_blank CHECK (length(btrim(policy_version)) >= 3),
  CONSTRAINT verification_cases_closed_consistent CHECK (
    (status IN ('cancelled', 'closed') AND closed_at IS NOT NULL)
    OR (status NOT IN ('cancelled', 'closed') AND closed_at IS NULL)
  )
);

CREATE UNIQUE INDEX verification_cases_one_active_check_idx
  ON verification.cases (provider_id, requirement_id, check_key)
  WHERE status NOT IN ('rejected', 'revoked', 'expired', 'cancelled', 'closed');
CREATE INDEX verification_cases_queue_idx
  ON verification.cases (status, high_risk DESC, updated_at);
CREATE INDEX verification_cases_provider_idx
  ON verification.cases (provider_id, created_at DESC);

CREATE FUNCTION verification.validate_case_definition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  selected_category uuid;
  version_category uuid;
  requirement_version uuid;
  provider_status text;
BEGIN
  SELECT category_id INTO selected_category
  FROM provider.category_selections
  WHERE provider_id = NEW.provider_id
    AND category_id = NEW.category_id
    AND status = 'selected';

  SELECT category_id INTO version_category
  FROM catalog.requirement_versions
  WHERE id = NEW.requirement_version_id;

  SELECT requirement_version_id INTO requirement_version
  FROM catalog.requirements
  WHERE id = NEW.requirement_id;

  SELECT status INTO provider_status
  FROM provider.organizations
  WHERE id = NEW.provider_id;

  IF selected_category IS NULL
     OR version_category IS DISTINCT FROM NEW.category_id
     OR requirement_version IS DISTINCT FROM NEW.requirement_version_id THEN
    RAISE EXCEPTION 'Verification case does not match the provider category requirement version';
  END IF;

  IF provider_status <> 'ready_for_verification' THEN
    RAISE EXCEPTION 'Provider must be ready for verification before opening a case';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER verification_cases_validate_definition
BEFORE INSERT ON verification.cases
FOR EACH ROW
EXECUTE FUNCTION verification.validate_case_definition();

CREATE FUNCTION verification.validate_case_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'draft' AND NEW.status IN ('awaiting_evidence', 'cancelled'))
    OR (OLD.status = 'awaiting_evidence' AND NEW.status IN ('ready_for_review', 'cancelled'))
    OR (OLD.status = 'ready_for_review' AND NEW.status IN ('assigned', 'correction_required', 'cancelled'))
    OR (OLD.status = 'assigned' AND NEW.status IN ('in_review', 'ready_for_review', 'cancelled'))
    OR (OLD.status = 'in_review' AND NEW.status IN ('correction_required', 'approved', 'rejected', 'revoked'))
    OR (OLD.status = 'correction_required' AND NEW.status IN ('awaiting_evidence', 'ready_for_review', 'cancelled'))
    OR (OLD.status = 'approved' AND NEW.status IN ('revoked', 'expired', 'appealed'))
    OR (OLD.status IN ('rejected', 'revoked', 'expired') AND NEW.status IN ('appealed', 'renewal_required', 'closed'))
    OR (OLD.status = 'renewal_required' AND NEW.status IN ('awaiting_evidence', 'closed'))
    OR (OLD.status = 'appealed' AND NEW.status IN ('assigned', 'in_review', 'closed'))
  ) THEN
    RAISE EXCEPTION 'Invalid verification case transition from % to %', OLD.status, NEW.status;
  END IF;

  IF NEW.status IN ('cancelled', 'closed') THEN
    NEW.closed_at := COALESCE(NEW.closed_at, now());
  ELSE
    NEW.closed_at := NULL;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER verification_cases_validate_transition
BEFORE UPDATE OF status ON verification.cases
FOR EACH ROW
EXECUTE FUNCTION verification.validate_case_transition();

CREATE TABLE verification.case_evidence (
  case_id uuid NOT NULL REFERENCES verification.cases(id) ON DELETE RESTRICT,
  evidence_id uuid NOT NULL REFERENCES evidence.items(id) ON DELETE RESTRICT,
  linked_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  linked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (case_id, evidence_id)
);

CREATE FUNCTION verification.validate_case_evidence_link()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  case_provider uuid;
  case_requirement uuid;
  evidence_provider uuid;
  evidence_requirement uuid;
BEGIN
  SELECT provider_id, requirement_id INTO case_provider, case_requirement
  FROM verification.cases
  WHERE id = NEW.case_id;

  SELECT provider_id, requirement_id INTO evidence_provider, evidence_requirement
  FROM evidence.items
  WHERE id = NEW.evidence_id;

  IF case_provider IS DISTINCT FROM evidence_provider
     OR case_requirement IS DISTINCT FROM evidence_requirement THEN
    RAISE EXCEPTION 'Evidence cannot be linked across provider or requirement scope';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER verification_case_evidence_validate_link
BEFORE INSERT ON verification.case_evidence
FOR EACH ROW
EXECUTE FUNCTION verification.validate_case_evidence_link();

CREATE TABLE verification.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES verification.cases(id) ON DELETE RESTRICT,
  assignee_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  assignment_kind text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  assigned_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  reason text NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  CONSTRAINT verification_assignments_kind_allowed CHECK (
    assignment_kind IN ('reviewer', 'field_agent', 'supervisor')
  ),
  CONSTRAINT verification_assignments_status_allowed CHECK (
    status IN ('active', 'completed', 'revoked')
  ),
  CONSTRAINT verification_assignments_reason_not_blank CHECK (length(btrim(reason)) >= 12),
  CONSTRAINT verification_assignments_end_consistent CHECK (
    (status = 'active' AND ended_at IS NULL)
    OR (status <> 'active' AND ended_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX verification_assignments_one_active_kind_idx
  ON verification.assignments (case_id, assignment_kind)
  WHERE status = 'active';
CREATE INDEX verification_assignments_assignee_idx
  ON verification.assignments (assignee_identity_id, status, assigned_at DESC);

CREATE FUNCTION verification.validate_assignment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  provider_creator uuid;
  expected_roles text[];
BEGIN
  SELECT organizations.created_by_identity_id
  INTO provider_creator
  FROM verification.cases AS cases
  JOIN provider.organizations AS organizations ON organizations.id = cases.provider_id
  WHERE cases.id = NEW.case_id;

  IF NEW.assignee_identity_id = provider_creator THEN
    RAISE EXCEPTION 'A provider creator cannot be assigned to review their own provider';
  END IF;

  expected_roles := CASE NEW.assignment_kind
    WHEN 'reviewer' THEN ARRAY['reviewer', 'trust_supervisor', 'admin']
    WHEN 'field_agent' THEN ARRAY['field_agent']
    ELSE ARRAY['trust_supervisor', 'admin']
  END;

  IF NOT EXISTS (
    SELECT 1
    FROM authz.role_assignments AS assignments
    JOIN authz.roles AS roles ON roles.id = assignments.role_id
    WHERE assignments.identity_id = NEW.assignee_identity_id
      AND assignments.scope_type = 'global'
      AND assignments.revoked_at IS NULL
      AND assignments.starts_at <= now()
      AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
      AND roles.role_key = ANY(expected_roles)
  ) THEN
    RAISE EXCEPTION 'Assignee does not hold the required active verification role';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER verification_assignments_validate
BEFORE INSERT OR UPDATE OF assignee_identity_id, assignment_kind, status
ON verification.assignments
FOR EACH ROW
EXECUTE FUNCTION verification.validate_assignment();

CREATE TABLE verification.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES verification.cases(id) ON DELETE RESTRICT,
  reviewer_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  result text NOT NULL,
  reason_code text NOT NULL REFERENCES verification.reason_codes(code) ON DELETE RESTRICT,
  rationale text NOT NULL,
  limitation text,
  recommended_valid_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT verification_recommendations_result_allowed CHECK (
    result IN ('approve', 'reject', 'correction_required', 'revoke')
  ),
  CONSTRAINT verification_recommendations_rationale_not_blank CHECK (length(btrim(rationale)) >= 20),
  CONSTRAINT verification_recommendations_expiry_future CHECK (
    recommended_valid_until IS NULL OR recommended_valid_until > created_at
  )
);

CREATE TABLE verification.decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES verification.cases(id) ON DELETE RESTRICT,
  decided_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  result text NOT NULL,
  reason_code text NOT NULL REFERENCES verification.reason_codes(code) ON DELETE RESTRICT,
  rationale text NOT NULL,
  claim_key text,
  claim_statement text,
  limitation text,
  valid_until timestamptz,
  policy_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT verification_decisions_result_allowed CHECK (
    result IN ('approved', 'rejected', 'correction_required', 'revoked')
  ),
  CONSTRAINT verification_decisions_rationale_not_blank CHECK (length(btrim(rationale)) >= 20),
  CONSTRAINT verification_decisions_claim_key_format CHECK (
    claim_key IS NULL OR claim_key ~ '^[a-z][a-z0-9_]{2,63}$'
  ),
  CONSTRAINT verification_decisions_policy_not_blank CHECK (length(btrim(policy_version)) >= 3),
  CONSTRAINT verification_decisions_approval_consistent CHECK (
    (result = 'approved'
      AND claim_key IS NOT NULL
      AND length(btrim(claim_statement)) >= 8
      AND length(btrim(limitation)) >= 8
      AND valid_until IS NOT NULL
      AND valid_until > created_at)
    OR (result <> 'approved' AND claim_key IS NULL AND claim_statement IS NULL AND valid_until IS NULL)
  )
);

CREATE TABLE verification.field_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES verification.cases(id) ON DELETE RESTRICT,
  assignment_id uuid NOT NULL REFERENCES verification.assignments(id) ON DELETE RESTRICT,
  field_agent_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  outcome text NOT NULL,
  checklist_version text NOT NULL,
  public_safe_summary text NOT NULL,
  private_notes text,
  occurred_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT verification_field_visit_outcome_allowed CHECK (
    outcome IN ('completed', 'inconclusive', 'unable_to_access', 'safety_abort')
  ),
  CONSTRAINT verification_field_visit_checklist_not_blank CHECK (length(btrim(checklist_version)) >= 3),
  CONSTRAINT verification_field_visit_summary_not_blank CHECK (length(btrim(public_safe_summary)) >= 12),
  CONSTRAINT verification_field_visit_time_valid CHECK (occurred_at <= recorded_at)
);

CREATE TRIGGER verification_recommendations_immutable
BEFORE UPDATE OR DELETE ON verification.recommendations
FOR EACH ROW EXECUTE FUNCTION platform.reject_immutable_mutation();
CREATE TRIGGER verification_decisions_immutable
BEFORE UPDATE OR DELETE ON verification.decisions
FOR EACH ROW EXECUTE FUNCTION platform.reject_immutable_mutation();
CREATE TRIGGER verification_field_visits_immutable
BEFORE UPDATE OR DELETE ON verification.field_visits
FOR EACH ROW EXECUTE FUNCTION platform.reject_immutable_mutation();

CREATE FUNCTION verification.validate_reviewer_independence(
  p_case_id uuid,
  p_actor_identity_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  provider_creator uuid;
BEGIN
  SELECT organizations.created_by_identity_id
  INTO provider_creator
  FROM verification.cases AS cases
  JOIN provider.organizations AS organizations ON organizations.id = cases.provider_id
  WHERE cases.id = p_case_id;

  IF provider_creator IS NULL THEN
    RAISE EXCEPTION 'Unknown verification case';
  END IF;

  IF provider_creator = p_actor_identity_id THEN
    RAISE EXCEPTION 'A reviewer cannot assess their own provider';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM verification.case_evidence AS links
    JOIN evidence.items AS items ON items.id = links.evidence_id
    WHERE links.case_id = p_case_id
      AND items.submitted_by_identity_id = p_actor_identity_id
  ) THEN
    RAISE EXCEPTION 'A reviewer cannot assess evidence they submitted';
  END IF;
END;
$$;

CREATE FUNCTION verification.validate_recommendation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM verification.validate_reviewer_independence(NEW.case_id, NEW.reviewer_identity_id);

  IF NOT EXISTS (
    SELECT 1
    FROM verification.assignments
    WHERE case_id = NEW.case_id
      AND assignee_identity_id = NEW.reviewer_identity_id
      AND assignment_kind IN ('reviewer', 'supervisor')
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Reviewer is not actively assigned to the verification case';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER verification_recommendations_validate
BEFORE INSERT ON verification.recommendations
FOR EACH ROW EXECUTE FUNCTION verification.validate_recommendation();

CREATE FUNCTION verification.validate_decision()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  is_high_risk boolean;
  has_final_role boolean;
BEGIN
  PERFORM verification.validate_reviewer_independence(NEW.case_id, NEW.decided_by_identity_id);

  SELECT high_risk INTO is_high_risk
  FROM verification.cases
  WHERE id = NEW.case_id;

  SELECT EXISTS (
    SELECT 1
    FROM authz.role_assignments AS assignments
    JOIN authz.roles AS roles ON roles.id = assignments.role_id
    WHERE assignments.identity_id = NEW.decided_by_identity_id
      AND assignments.scope_type = 'global'
      AND assignments.revoked_at IS NULL
      AND assignments.starts_at <= now()
      AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
      AND roles.role_key IN (
        CASE WHEN is_high_risk THEN 'trust_supervisor' ELSE 'reviewer' END,
        'trust_supervisor',
        'admin'
      )
  ) INTO has_final_role;

  IF NOT has_final_role THEN
    RAISE EXCEPTION 'Decision actor does not hold an active final-decision role';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM verification.assignments
    WHERE case_id = NEW.case_id
      AND assignee_identity_id = NEW.decided_by_identity_id
      AND assignment_kind IN ('reviewer', 'supervisor')
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Decision actor is not actively assigned to the verification case';
  END IF;

  IF is_high_risk AND NOT EXISTS (
    SELECT 1
    FROM verification.recommendations
    WHERE case_id = NEW.case_id
      AND reviewer_identity_id <> NEW.decided_by_identity_id
  ) THEN
    RAISE EXCEPTION 'High-risk decisions require an independent prior recommendation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER verification_decisions_validate
BEFORE INSERT ON verification.decisions
FOR EACH ROW EXECUTE FUNCTION verification.validate_decision();

CREATE FUNCTION verification.validate_field_visit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM verification.assignments
    WHERE id = NEW.assignment_id
      AND case_id = NEW.case_id
      AND assignee_identity_id = NEW.field_agent_identity_id
      AND assignment_kind = 'field_agent'
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Field visit requires an active matching assignment';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER verification_field_visits_validate
BEFORE INSERT ON verification.field_visits
FOR EACH ROW EXECUTE FUNCTION verification.validate_field_visit();

CREATE TABLE verification.claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  case_id uuid NOT NULL REFERENCES verification.cases(id) ON DELETE RESTRICT,
  created_by_decision_id uuid NOT NULL REFERENCES verification.decisions(id) ON DELETE RESTRICT,
  claim_key text NOT NULL,
  claim_statement text NOT NULL,
  limitation text NOT NULL,
  evidence_class text NOT NULL,
  checked_at timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  policy_version text NOT NULL,
  degraded_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT verification_claim_key_format CHECK (claim_key ~ '^[a-z][a-z0-9_]{2,63}$'),
  CONSTRAINT verification_claim_statement_not_blank CHECK (length(btrim(claim_statement)) >= 8),
  CONSTRAINT verification_claim_limitation_not_blank CHECK (length(btrim(limitation)) >= 8),
  CONSTRAINT verification_claim_evidence_class_allowed CHECK (
    evidence_class IN (
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
  CONSTRAINT verification_claim_status_allowed CHECK (
    status IN ('active', 'degraded', 'revoked', 'expired')
  ),
  CONSTRAINT verification_claim_validity CHECK (valid_until > checked_at),
  CONSTRAINT verification_claim_state_consistent CHECK (
    (status = 'active' AND degraded_at IS NULL AND revoked_at IS NULL)
    OR (status IN ('degraded', 'expired') AND degraded_at IS NOT NULL AND revoked_at IS NULL)
    OR (status = 'revoked' AND revoked_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX verification_claims_one_active_key_idx
  ON verification.claims (provider_id, claim_key)
  WHERE status = 'active';
CREATE INDEX verification_claims_expiry_idx
  ON verification.claims (valid_until, status);

CREATE FUNCTION verification.guard_claim_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  decision_setting text;
  expiry_setting text;
BEGIN
  decision_setting := current_setting('direkt.claim_decision_id', true);
  expiry_setting := current_setting('direkt.claim_expiry_job', true);

  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Verification claims cannot be deleted';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF decision_setting IS NULL OR decision_setting <> NEW.created_by_decision_id::text THEN
      RAISE EXCEPTION 'Verification claims may only be derived from a validated decision';
    END IF;
  ELSIF decision_setting IS NULL AND expiry_setting IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Verification claims may only change through decision or expiry processing';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER verification_claims_guard
BEFORE INSERT OR UPDATE OR DELETE ON verification.claims
FOR EACH ROW EXECUTE FUNCTION verification.guard_claim_mutation();

CREATE VIEW verification.safe_claim_cards AS
SELECT
  provider_id,
  claim_key,
  claim_statement,
  limitation,
  evidence_class,
  checked_at,
  valid_until,
  status,
  policy_version
FROM verification.claims;

CREATE FUNCTION verification.record_decision(
  p_case_id uuid,
  p_decided_by_identity_id uuid,
  p_result text,
  p_reason_code text,
  p_rationale text,
  p_claim_key text DEFAULT NULL,
  p_claim_statement text DEFAULT NULL,
  p_limitation text DEFAULT NULL,
  p_valid_until timestamptz DEFAULT NULL,
  p_policy_version text DEFAULT 'phase4-v1'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  new_decision_id uuid := gen_random_uuid();
  case_provider_id uuid;
  case_family text;
  mapped_case_status text;
BEGIN
  SELECT provider_id, check_family
  INTO case_provider_id, case_family
  FROM verification.cases
  WHERE id = p_case_id
  FOR UPDATE;

  IF case_provider_id IS NULL THEN
    RAISE EXCEPTION 'Unknown verification case';
  END IF;

  INSERT INTO verification.decisions (
    id,
    case_id,
    decided_by_identity_id,
    result,
    reason_code,
    rationale,
    claim_key,
    claim_statement,
    limitation,
    valid_until,
    policy_version
  ) VALUES (
    new_decision_id,
    p_case_id,
    p_decided_by_identity_id,
    p_result,
    p_reason_code,
    p_rationale,
    p_claim_key,
    p_claim_statement,
    p_limitation,
    p_valid_until,
    p_policy_version
  );

  mapped_case_status := CASE p_result
    WHEN 'approved' THEN 'approved'
    WHEN 'rejected' THEN 'rejected'
    WHEN 'correction_required' THEN 'correction_required'
    ELSE 'revoked'
  END;

  UPDATE verification.cases
  SET status = mapped_case_status
  WHERE id = p_case_id;

  PERFORM set_config('direkt.claim_decision_id', new_decision_id::text, true);

  IF p_result = 'approved' THEN
    UPDATE verification.claims
    SET status = 'revoked',
        revoked_at = now()
    WHERE provider_id = case_provider_id
      AND claim_key = p_claim_key
      AND status = 'active';

    INSERT INTO verification.claims (
      provider_id,
      case_id,
      created_by_decision_id,
      claim_key,
      claim_statement,
      limitation,
      evidence_class,
      checked_at,
      valid_until,
      status,
      policy_version
    ) VALUES (
      case_provider_id,
      p_case_id,
      new_decision_id,
      p_claim_key,
      p_claim_statement,
      p_limitation,
      case_family,
      now(),
      p_valid_until,
      'active',
      p_policy_version
    );

    UPDATE evidence.items AS items
    SET status = 'approved'
    FROM verification.case_evidence AS links
    WHERE links.case_id = p_case_id
      AND links.evidence_id = items.id
      AND items.status = 'ready_for_review';
  ELSE
    UPDATE verification.claims
    SET status = CASE WHEN p_result = 'revoked' THEN 'revoked' ELSE 'degraded' END,
        revoked_at = CASE WHEN p_result = 'revoked' THEN now() ELSE NULL END,
        degraded_at = CASE WHEN p_result = 'revoked' THEN degraded_at ELSE now() END
    WHERE case_id = p_case_id
      AND status = 'active';

    UPDATE evidence.items AS items
    SET status = CASE
          WHEN p_result = 'correction_required' THEN 'correction_required'
          WHEN p_result = 'rejected' THEN 'rejected'
          ELSE 'revoked'
        END,
        revocation_reason = CASE
          WHEN p_result = 'revoked' THEN p_rationale
          ELSE NULL
        END
    FROM verification.case_evidence AS links
    WHERE links.case_id = p_case_id
      AND links.evidence_id = items.id
      AND items.status IN ('ready_for_review', 'approved');
  END IF;

  INSERT INTO platform.audit_events (
    actor_type,
    actor_id,
    provider_id,
    action,
    resource_type,
    resource_id,
    outcome,
    metadata
  ) VALUES (
    'identity',
    p_decided_by_identity_id,
    case_provider_id,
    'verification_decision_recorded',
    'verification_decision',
    new_decision_id,
    'success',
    jsonb_build_object(
      'caseId', p_case_id,
      'result', p_result,
      'reasonCode', p_reason_code,
      'claimKey', p_claim_key,
      'policyVersion', p_policy_version
    )
  );

  RETURN new_decision_id;
END;
$$;

CREATE FUNCTION verification.degrade_expired_claims(
  p_as_of timestamptz DEFAULT now()
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  affected integer;
BEGIN
  PERFORM set_config('direkt.claim_expiry_job', 'on', true);

  UPDATE evidence.items AS items
  SET status = 'expired'
  FROM evidence.versions AS versions
  WHERE items.current_version_id = versions.id
    AND versions.expires_at IS NOT NULL
    AND versions.expires_at <= p_as_of
    AND items.status IN ('ready_for_review', 'approved');

  UPDATE verification.claims AS claims
  SET status = 'expired',
      degraded_at = p_as_of
  WHERE claims.status = 'active'
    AND (
      claims.valid_until <= p_as_of
      OR EXISTS (
        SELECT 1
        FROM verification.case_evidence AS links
        JOIN evidence.items AS items ON items.id = links.evidence_id
        WHERE links.case_id = claims.case_id
          AND items.status IN ('expired', 'revoked')
      )
    );

  GET DIAGNOSTICS affected = ROW_COUNT;

  UPDATE verification.cases AS cases
  SET status = 'expired'
  WHERE cases.status = 'approved'
    AND EXISTS (
      SELECT 1
      FROM verification.claims
      WHERE claims.case_id = cases.id
        AND claims.status = 'expired'
    );

  INSERT INTO platform.audit_events (
    actor_type,
    action,
    resource_type,
    outcome,
    metadata
  ) VALUES (
    'system',
    'verification_claim_expiry_processed',
    'verification_claim_batch',
    'success',
    jsonb_build_object('asOf', p_as_of, 'affectedClaims', affected)
  );

  RETURN affected;
END;
$$;

CREATE FUNCTION evidence.audit_evidence_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  evidence_record evidence.items;
  action_name text;
BEGIN
  IF TG_TABLE_NAME = 'versions' THEN
    SELECT * INTO evidence_record
    FROM evidence.items
    WHERE id = NEW.evidence_id;
    action_name := 'evidence_version_created';
  ELSE
    evidence_record := COALESCE(NEW, OLD);
    action_name := CASE
      WHEN TG_OP = 'INSERT' THEN 'evidence_item_created'
      ELSE 'evidence_item_changed'
    END;
  END IF;

  INSERT INTO platform.audit_events (
    actor_type,
    actor_id,
    provider_id,
    action,
    resource_type,
    resource_id,
    outcome,
    metadata
  ) VALUES (
    'identity',
    evidence_record.submitted_by_identity_id,
    evidence_record.provider_id,
    action_name,
    CASE WHEN TG_TABLE_NAME = 'versions' THEN 'evidence_version' ELSE 'evidence_item' END,
    CASE WHEN TG_TABLE_NAME = 'versions' THEN NEW.id ELSE evidence_record.id END,
    'success',
    jsonb_build_object('phase', 4, 'containsEvidenceBytes', false)
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER evidence_items_audit
AFTER INSERT OR UPDATE ON evidence.items
FOR EACH ROW EXECUTE FUNCTION evidence.audit_evidence_change();
CREATE TRIGGER evidence_versions_audit
AFTER INSERT ON evidence.versions
FOR EACH ROW EXECUTE FUNCTION evidence.audit_evidence_change();

INSERT INTO verification.reason_codes (
  code,
  outcome,
  description,
  requires_correction,
  public_safe
) VALUES
  ('CHECK_PASSED', 'approve', 'The scoped verification check passed against the reviewed evidence.', false, true),
  ('SOURCE_CONFIRMED', 'approve', 'The authorized source confirmed the scoped fact under review.', false, true),
  ('DOCUMENT_UNREADABLE', 'correction', 'The submitted evidence is incomplete or not readable enough for review.', true, true),
  ('NAME_MISMATCH', 'correction', 'The submitted name does not reasonably match the provider or representative.', true, false),
  ('FIELD_VISIT_REQUIRED', 'field_visit', 'The case requires an assignment-bound physical field visit.', true, true),
  ('EXPIRED_EVIDENCE', 'reject', 'The submitted evidence is outside its permitted validity period.', false, true),
  ('UNSUPPORTED_EVIDENCE', 'reject', 'The submitted evidence class is not accepted for this requirement version.', false, true),
  ('EVIDENCE_REVOKED', 'revoke', 'A previously accepted evidence source or document was revoked.', false, true),
  ('RENEWAL_DUE', 'correction', 'The scoped verification check requires current renewal evidence.', true, true),
  ('POLICY_EXCEPTION', 'correction', 'The case requires supervisor review under an explicit policy exception.', true, false);

INSERT INTO authz.permissions (permission_key, description) VALUES
  ('evidence.upload.create', 'Create an authorized private evidence upload session within provider scope.'),
  ('evidence.read.own', 'Read private evidence metadata within an assigned provider scope.'),
  ('evidence.read.private', 'View private evidence metadata for an actively assigned verification case.'),
  ('evidence.manage', 'Confirm, replace or revoke evidence within an assigned provider scope.'),
  ('verification.case.create', 'Open a verification case for an assigned provider and selected requirement.'),
  ('verification.case.read', 'Read verification cases within an assigned provider scope.'),
  ('verification.case.assign', 'Assign reviewers, field agents or supervisors to verification cases.'),
  ('verification.claim.read', 'Read safe scoped claim-card output.'),
  ('verification.claim.expire', 'Run deterministic claim expiry processing.')
ON CONFLICT (permission_key) DO NOTHING;

WITH grants(role_key, permission_key) AS (
  VALUES
    ('provider_owner', 'evidence.upload.create'),
    ('provider_owner', 'evidence.read.own'),
    ('provider_owner', 'evidence.manage'),
    ('provider_owner', 'verification.case.create'),
    ('provider_owner', 'verification.case.read'),
    ('provider_owner', 'verification.claim.read'),
    ('provider_member', 'evidence.upload.create'),
    ('provider_member', 'evidence.read.own'),
    ('provider_member', 'evidence.manage'),
    ('provider_member', 'verification.case.create'),
    ('provider_member', 'verification.case.read'),
    ('provider_member', 'verification.claim.read'),
    ('reviewer', 'evidence.read.private'),
    ('reviewer', 'verification.case.read'),
    ('reviewer', 'verification.claim.read'),
    ('field_agent', 'verification.case.read'),
    ('trust_supervisor', 'evidence.read.private'),
    ('trust_supervisor', 'verification.case.read'),
    ('trust_supervisor', 'verification.case.assign'),
    ('trust_supervisor', 'verification.claim.read'),
    ('trust_supervisor', 'verification.claim.expire'),
    ('auditor', 'verification.case.read'),
    ('auditor', 'verification.claim.read'),
    ('admin', 'evidence.upload.create'),
    ('admin', 'evidence.read.own'),
    ('admin', 'evidence.read.private'),
    ('admin', 'evidence.manage'),
    ('admin', 'verification.case.create'),
    ('admin', 'verification.case.read'),
    ('admin', 'verification.case.assign'),
    ('admin', 'verification.claim.read'),
    ('admin', 'verification.claim.expire')
)
INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM grants
JOIN authz.roles AS roles USING (role_key)
JOIN authz.permissions AS permissions USING (permission_key)
ON CONFLICT DO NOTHING;

COMMENT ON SCHEMA evidence IS
  'Private evidence metadata and immutable versions. Evidence bytes remain in private adapter-backed storage.';
COMMENT ON SCHEMA verification IS
  'Separate verification cases, assignments, immutable review history, decisions and scoped claim derivation.';
COMMENT ON VIEW verification.safe_claim_cards IS
  'Safe claim-card projection only. It intentionally excludes evidence objects, identifiers, notes and reviewer identity.';