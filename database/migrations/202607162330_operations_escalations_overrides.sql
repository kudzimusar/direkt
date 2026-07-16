CREATE TABLE operations.case_escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES verification.cases(id) ON DELETE RESTRICT,
  severity text NOT NULL,
  reason_code text NOT NULL,
  summary text NOT NULL,
  owner_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  due_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'open',
  policy_version text NOT NULL,
  created_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  resolution_code text,
  resolution_summary text,
  resolved_by_identity_id uuid REFERENCES account.identities(id) ON DELETE RESTRICT,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT operations_escalation_severity_allowed CHECK (
    severity IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT operations_escalation_reason_format CHECK (
    reason_code ~ '^[A-Z][A-Z0-9_]{2,63}$'
  ),
  CONSTRAINT operations_escalation_summary_not_blank CHECK (length(btrim(summary)) >= 20),
  CONSTRAINT operations_escalation_due_future CHECK (due_at > created_at),
  CONSTRAINT operations_escalation_status_allowed CHECK (
    status IN ('open', 'in_progress', 'resolved', 'dismissed')
  ),
  CONSTRAINT operations_escalation_policy_not_blank CHECK (length(btrim(policy_version)) >= 3),
  CONSTRAINT operations_escalation_resolution_consistent CHECK (
    (status IN ('open', 'in_progress')
      AND resolution_code IS NULL
      AND resolution_summary IS NULL
      AND resolved_by_identity_id IS NULL
      AND resolved_at IS NULL)
    OR (status IN ('resolved', 'dismissed')
      AND resolution_code ~ '^[A-Z][A-Z0-9_]{2,63}$'
      AND length(btrim(resolution_summary)) >= 20
      AND resolved_by_identity_id IS NOT NULL
      AND resolved_at IS NOT NULL)
  )
);

CREATE INDEX operations_case_escalations_queue_idx
  ON operations.case_escalations (status, severity, due_at, created_at);
CREATE INDEX operations_case_escalations_case_idx
  ON operations.case_escalations (case_id, created_at DESC);

CREATE FUNCTION operations.validate_escalation_owner()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM authz.role_assignments AS assignments
    JOIN authz.roles AS roles ON roles.id = assignments.role_id
    WHERE assignments.identity_id = NEW.owner_identity_id
      AND assignments.scope_type = 'global'
      AND assignments.revoked_at IS NULL
      AND assignments.starts_at <= now()
      AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
      AND roles.role_key IN ('trust_supervisor', 'admin')
  ) THEN
    RAISE EXCEPTION 'Escalation owner must hold an active supervisor or administrator role';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_case_escalations_validate_owner
BEFORE INSERT OR UPDATE OF owner_identity_id
ON operations.case_escalations
FOR EACH ROW
EXECUTE FUNCTION operations.validate_escalation_owner();

CREATE FUNCTION operations.validate_escalation_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;
  IF NOT (
    (OLD.status = 'open' AND NEW.status IN ('in_progress', 'resolved', 'dismissed'))
    OR (OLD.status = 'in_progress' AND NEW.status IN ('resolved', 'dismissed'))
  ) THEN
    RAISE EXCEPTION 'Invalid escalation transition from % to %', OLD.status, NEW.status;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_case_escalations_validate_transition
BEFORE UPDATE OF status ON operations.case_escalations
FOR EACH ROW
EXECUTE FUNCTION operations.validate_escalation_transition();

CREATE FUNCTION operations.mandatory_evidence_complete(p_case_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM verification.cases AS cases
    JOIN catalog.requirements AS required_requirement
      ON required_requirement.requirement_version_id = cases.requirement_version_id
     AND required_requirement.required = true
    WHERE cases.id = p_case_id
      AND NOT EXISTS (
        SELECT 1
        FROM evidence.items AS items
        JOIN evidence.versions AS versions ON versions.id = items.current_version_id
        WHERE items.provider_id = cases.provider_id
          AND items.requirement_id = required_requirement.id
          AND items.status IN ('ready_for_review', 'approved')
          AND versions.processing_status = 'clean'
          AND (versions.expires_at IS NULL OR versions.expires_at > now())
      )
  );
$$;

CREATE TABLE operations.high_risk_override_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES verification.cases(id) ON DELETE RESTRICT,
  requested_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  requested_result text NOT NULL,
  reason_code text NOT NULL REFERENCES verification.reason_codes(code) ON DELETE RESTRICT,
  rationale text NOT NULL,
  evidence_version_ids uuid[] NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  due_at timestamptz NOT NULL,
  policy_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  CONSTRAINT operations_override_result_allowed CHECK (
    requested_result IN ('approved', 'rejected', 'correction_required', 'revoked')
  ),
  CONSTRAINT operations_override_rationale_not_blank CHECK (length(btrim(rationale)) >= 30),
  CONSTRAINT operations_override_evidence_required CHECK (cardinality(evidence_version_ids) > 0),
  CONSTRAINT operations_override_status_allowed CHECK (
    status IN ('pending', 'approved', 'rejected', 'cancelled')
  ),
  CONSTRAINT operations_override_due_future CHECK (due_at > created_at),
  CONSTRAINT operations_override_policy_not_blank CHECK (length(btrim(policy_version)) >= 3),
  CONSTRAINT operations_override_resolution_consistent CHECK (
    (status = 'pending' AND resolved_at IS NULL)
    OR (status <> 'pending' AND resolved_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX operations_override_one_pending_case_idx
  ON operations.high_risk_override_requests (case_id)
  WHERE status = 'pending';
CREATE INDEX operations_override_status_due_idx
  ON operations.high_risk_override_requests (status, due_at, created_at);

CREATE FUNCTION operations.validate_high_risk_override_request()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  case_provider_id uuid;
  case_category_id uuid;
  case_requirement_version_id uuid;
  case_status text;
  case_high_risk boolean;
  provider_creator_id uuid;
  reason_outcome text;
  expected_outcome text;
BEGIN
  SELECT
    cases.provider_id,
    cases.category_id,
    cases.requirement_version_id,
    cases.status,
    cases.high_risk,
    organizations.created_by_identity_id
  INTO
    case_provider_id,
    case_category_id,
    case_requirement_version_id,
    case_status,
    case_high_risk,
    provider_creator_id
  FROM verification.cases AS cases
  JOIN provider.organizations AS organizations ON organizations.id = cases.provider_id
  WHERE cases.id = NEW.case_id;

  IF case_provider_id IS NULL
     OR case_high_risk IS DISTINCT FROM true
     OR case_status NOT IN ('assigned', 'in_review') THEN
    RAISE EXCEPTION 'Override request requires an active high-risk review case';
  END IF;

  IF NEW.requested_by_identity_id = provider_creator_id OR EXISTS (
    SELECT 1
    FROM verification.case_evidence AS links
    JOIN evidence.items AS items ON items.id = links.evidence_id
    WHERE links.case_id = NEW.case_id
      AND items.submitted_by_identity_id = NEW.requested_by_identity_id
  ) THEN
    RAISE EXCEPTION 'Provider creators and evidence submitters cannot request an override';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM verification.assignments
    WHERE case_id = NEW.case_id
      AND assignee_identity_id = NEW.requested_by_identity_id
      AND assignment_kind IN ('reviewer', 'supervisor')
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Override requester must hold an active review assignment';
  END IF;

  SELECT outcome INTO reason_outcome
  FROM verification.reason_codes
  WHERE code = NEW.reason_code AND active = true;

  expected_outcome := CASE NEW.requested_result
    WHEN 'approved' THEN 'approve'
    WHEN 'rejected' THEN 'reject'
    WHEN 'correction_required' THEN 'correction'
    ELSE 'revoke'
  END;

  IF reason_outcome IS NULL OR reason_outcome <> expected_outcome THEN
    RAISE EXCEPTION 'Override reason code is incompatible with the requested result';
  END IF;

  IF NOT operations.mandatory_evidence_complete(NEW.case_id) THEN
    RAISE EXCEPTION 'Override cannot bypass missing mandatory evidence';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(NEW.evidence_version_ids) AS supplied(version_id)
    WHERE NOT EXISTS (
      SELECT 1
      FROM evidence.versions AS versions
      JOIN evidence.items AS items
        ON items.id = versions.evidence_id
       AND items.current_version_id = versions.id
      JOIN catalog.requirements AS requirements ON requirements.id = items.requirement_id
      WHERE versions.id = supplied.version_id
        AND items.provider_id = case_provider_id
        AND requirements.requirement_version_id = case_requirement_version_id
        AND items.status IN ('ready_for_review', 'approved')
        AND versions.processing_status = 'clean'
        AND (versions.expires_at IS NULL OR versions.expires_at > now())
    )
  ) THEN
    RAISE EXCEPTION 'Override evidence snapshot is outside the current provider/category scope';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM provider.category_selections
    WHERE provider_id = case_provider_id
      AND category_id = case_category_id
      AND requirement_version_id = case_requirement_version_id
      AND status = 'selected'
  ) THEN
    RAISE EXCEPTION 'Override cannot bypass a removed provider category';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_high_risk_override_requests_validate
BEFORE INSERT ON operations.high_risk_override_requests
FOR EACH ROW
EXECUTE FUNCTION operations.validate_high_risk_override_request();

CREATE FUNCTION operations.guard_override_request_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.case_id IS DISTINCT FROM NEW.case_id
     OR OLD.requested_by_identity_id IS DISTINCT FROM NEW.requested_by_identity_id
     OR OLD.requested_result IS DISTINCT FROM NEW.requested_result
     OR OLD.reason_code IS DISTINCT FROM NEW.reason_code
     OR OLD.rationale IS DISTINCT FROM NEW.rationale
     OR OLD.evidence_version_ids IS DISTINCT FROM NEW.evidence_version_ids
     OR OLD.due_at IS DISTINCT FROM NEW.due_at
     OR OLD.policy_version IS DISTINCT FROM NEW.policy_version
     OR OLD.created_at IS DISTINCT FROM NEW.created_at THEN
    RAISE EXCEPTION 'High-risk override request evidence and rationale are immutable';
  END IF;
  IF OLD.status <> 'pending' OR NEW.status NOT IN ('approved', 'rejected', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid high-risk override request transition';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_high_risk_override_requests_guard
BEFORE UPDATE ON operations.high_risk_override_requests
FOR EACH ROW
EXECUTE FUNCTION operations.guard_override_request_update();

CREATE TABLE operations.high_risk_override_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  override_request_id uuid NOT NULL REFERENCES operations.high_risk_override_requests(id) ON DELETE RESTRICT,
  approver_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  decision text NOT NULL,
  rationale text NOT NULL,
  policy_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT operations_override_approval_decision_allowed CHECK (decision IN ('approve', 'reject')),
  CONSTRAINT operations_override_approval_rationale_not_blank CHECK (length(btrim(rationale)) >= 20),
  CONSTRAINT operations_override_approval_policy_not_blank CHECK (length(btrim(policy_version)) >= 3),
  UNIQUE (override_request_id, approver_identity_id)
);

CREATE TRIGGER operations_high_risk_override_approvals_immutable
BEFORE UPDATE OR DELETE ON operations.high_risk_override_approvals
FOR EACH ROW
EXECUTE FUNCTION platform.reject_immutable_mutation();

CREATE FUNCTION operations.validate_override_approval()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  request_case_id uuid;
  requester_id uuid;
  request_status text;
  provider_creator_id uuid;
BEGIN
  SELECT requests.case_id, requests.requested_by_identity_id, requests.status,
         organizations.created_by_identity_id
  INTO request_case_id, requester_id, request_status, provider_creator_id
  FROM operations.high_risk_override_requests AS requests
  JOIN verification.cases AS cases ON cases.id = requests.case_id
  JOIN provider.organizations AS organizations ON organizations.id = cases.provider_id
  WHERE requests.id = NEW.override_request_id;

  IF request_case_id IS NULL OR request_status <> 'pending' THEN
    RAISE EXCEPTION 'Override approval requires a pending request';
  END IF;
  IF NEW.approver_identity_id IN (requester_id, provider_creator_id) THEN
    RAISE EXCEPTION 'Override requester and provider creator cannot approve the request';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM verification.case_evidence AS links
    JOIN evidence.items AS items ON items.id = links.evidence_id
    WHERE links.case_id = request_case_id
      AND items.submitted_by_identity_id = NEW.approver_identity_id
  ) THEN
    RAISE EXCEPTION 'Evidence submitter cannot approve the override request';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM authz.role_assignments AS assignments
    JOIN authz.roles AS roles ON roles.id = assignments.role_id
    WHERE assignments.identity_id = NEW.approver_identity_id
      AND assignments.scope_type = 'global'
      AND assignments.revoked_at IS NULL
      AND assignments.starts_at <= now()
      AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
      AND roles.role_key IN ('trust_supervisor', 'admin')
  ) THEN
    RAISE EXCEPTION 'Override approver must hold an active supervisor or administrator role';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_high_risk_override_approvals_validate
BEFORE INSERT ON operations.high_risk_override_approvals
FOR EACH ROW
EXECUTE FUNCTION operations.validate_override_approval();

CREATE FUNCTION operations.resolve_override_after_approval()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  approval_count integer;
BEGIN
  IF NEW.decision = 'reject' THEN
    UPDATE operations.high_risk_override_requests
    SET status = 'rejected', resolved_at = now()
    WHERE id = NEW.override_request_id AND status = 'pending';
    RETURN NEW;
  END IF;

  SELECT count(DISTINCT approver_identity_id)
  INTO approval_count
  FROM operations.high_risk_override_approvals
  WHERE override_request_id = NEW.override_request_id
    AND decision = 'approve';

  IF approval_count >= 2 THEN
    UPDATE operations.high_risk_override_requests
    SET status = 'approved', resolved_at = now()
    WHERE id = NEW.override_request_id AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_high_risk_override_approvals_resolve
AFTER INSERT ON operations.high_risk_override_approvals
FOR EACH ROW
EXECUTE FUNCTION operations.resolve_override_after_approval();

INSERT INTO authz.permissions (permission_key, description) VALUES
  ('operations.escalations.read', 'Read scoped operations escalations without private evidence content.'),
  ('operations.escalations.manage', 'Create, own and resolve verification escalations.'),
  ('operations.override.request', 'Request an evidence-backed high-risk override authorization.'),
  ('operations.override.approve', 'Approve or reject a high-risk override under four-eyes controls.')
ON CONFLICT (permission_key) DO NOTHING;

WITH grants(role_key, permission_key) AS (
  VALUES
    ('reviewer', 'operations.escalations.read'),
    ('reviewer', 'operations.override.request'),
    ('trust_supervisor', 'operations.escalations.read'),
    ('trust_supervisor', 'operations.escalations.manage'),
    ('trust_supervisor', 'operations.override.request'),
    ('trust_supervisor', 'operations.override.approve'),
    ('auditor', 'operations.escalations.read'),
    ('admin', 'operations.escalations.read'),
    ('admin', 'operations.escalations.manage'),
    ('admin', 'operations.override.request'),
    ('admin', 'operations.override.approve')
)
INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM grants
JOIN authz.roles AS roles USING (role_key)
JOIN authz.permissions AS permissions USING (permission_key)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE operations.case_escalations IS
  'Explicit policy-versioned verification escalations with owner, severity, due date and auditable resolution.';
COMMENT ON TABLE operations.high_risk_override_requests IS
  'Evidence-backed high-risk authorization requests. Approval never creates a verification decision, claim or publication.';
COMMENT ON TABLE operations.high_risk_override_approvals IS
  'Immutable distinct-identity four-eyes approvals or rejections for high-risk authorization requests.';
