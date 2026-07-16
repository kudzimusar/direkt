CREATE OR REPLACE FUNCTION operations.validate_override_approval()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  request_case_id uuid;
  requester_id uuid;
  request_status text;
  request_policy_version text;
  provider_creator_id uuid;
BEGIN
  SELECT requests.case_id,
         requests.requested_by_identity_id,
         requests.status,
         requests.policy_version,
         organizations.created_by_identity_id
  INTO request_case_id,
       requester_id,
       request_status,
       request_policy_version,
       provider_creator_id
  FROM operations.high_risk_override_requests AS requests
  JOIN verification.cases AS cases ON cases.id = requests.case_id
  JOIN provider.organizations AS organizations ON organizations.id = cases.provider_id
  WHERE requests.id = NEW.override_request_id;

  IF request_case_id IS NULL OR request_status <> 'pending' THEN
    RAISE EXCEPTION 'Override approval requires a pending request';
  END IF;
  IF NEW.policy_version IS DISTINCT FROM request_policy_version THEN
    RAISE EXCEPTION 'Override approval policy version must match the request';
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

CREATE OR REPLACE FUNCTION operations.resolve_override_after_approval()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  approval_count integer;
BEGIN
  PERFORM 1
  FROM operations.high_risk_override_requests
  WHERE id = NEW.override_request_id
  FOR UPDATE;

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

COMMENT ON FUNCTION operations.resolve_override_after_approval() IS
  'Serializes approval resolution on the override request row so concurrent distinct approvals cannot leave a valid request pending.';
