CREATE TABLE operations.evidence_access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES verification.cases(id) ON DELETE RESTRICT,
  evidence_id uuid NOT NULL REFERENCES evidence.items(id) ON DELETE RESTRICT,
  evidence_version_id uuid NOT NULL REFERENCES evidence.versions(id) ON DELETE RESTRICT,
  assignment_id uuid NOT NULL REFERENCES verification.assignments(id) ON DELETE RESTRICT,
  grantee_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  granted_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  purpose text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  ended_at timestamptz,
  ended_by_identity_id uuid REFERENCES account.identities(id) ON DELETE RESTRICT,
  end_reason text,
  CONSTRAINT operations_evidence_access_status_allowed CHECK (
    status IN ('active', 'revoked', 'expired')
  ),
  CONSTRAINT operations_evidence_access_purpose_not_blank CHECK (
    length(btrim(purpose)) BETWEEN 8 AND 160
  ),
  CONSTRAINT operations_evidence_access_self_issued CHECK (
    grantee_identity_id = granted_by_identity_id
  ),
  CONSTRAINT operations_evidence_access_short_lived CHECK (
    expires_at > issued_at
    AND expires_at <= issued_at + interval '5 minutes'
  ),
  CONSTRAINT operations_evidence_access_end_consistent CHECK (
    (status = 'active'
      AND ended_at IS NULL
      AND ended_by_identity_id IS NULL
      AND end_reason IS NULL)
    OR (status <> 'active'
      AND ended_at IS NOT NULL
      AND length(btrim(end_reason)) >= 8)
  )
);

CREATE UNIQUE INDEX operations_evidence_access_one_active_context_idx
  ON operations.evidence_access_grants (
    case_id,
    evidence_id,
    grantee_identity_id
  )
  WHERE status = 'active';
CREATE INDEX operations_evidence_access_grantee_idx
  ON operations.evidence_access_grants (
    grantee_identity_id,
    status,
    expires_at
  );
CREATE INDEX operations_evidence_access_assignment_idx
  ON operations.evidence_access_grants (assignment_id, status);

CREATE FUNCTION operations.validate_evidence_access_grant()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status <> 'active' THEN
    RAISE EXCEPTION 'New evidence access grants must begin active';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM verification.assignments AS assignments
    JOIN verification.cases AS cases ON cases.id = assignments.case_id
    JOIN verification.case_evidence AS links
      ON links.case_id = cases.id
     AND links.evidence_id = NEW.evidence_id
    JOIN evidence.items AS items
      ON items.id = links.evidence_id
     AND items.current_version_id = NEW.evidence_version_id
    WHERE assignments.id = NEW.assignment_id
      AND assignments.case_id = NEW.case_id
      AND assignments.assignee_identity_id = NEW.grantee_identity_id
      AND assignments.assignment_kind IN ('reviewer', 'supervisor')
      AND assignments.status = 'active'
      AND cases.status IN ('assigned', 'in_review')
      AND items.status IN ('ready_for_review', 'approved')
  ) THEN
    RAISE EXCEPTION 'Evidence access grant requires a live assigned review context';
  END IF;

  PERFORM verification.validate_reviewer_independence(
    NEW.case_id,
    NEW.grantee_identity_id
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_evidence_access_validate
BEFORE INSERT ON operations.evidence_access_grants
FOR EACH ROW
EXECUTE FUNCTION operations.validate_evidence_access_grant();

CREATE FUNCTION operations.validate_evidence_access_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.case_id IS DISTINCT FROM OLD.case_id
     OR NEW.evidence_id IS DISTINCT FROM OLD.evidence_id
     OR NEW.evidence_version_id IS DISTINCT FROM OLD.evidence_version_id
     OR NEW.assignment_id IS DISTINCT FROM OLD.assignment_id
     OR NEW.grantee_identity_id IS DISTINCT FROM OLD.grantee_identity_id
     OR NEW.granted_by_identity_id IS DISTINCT FROM OLD.granted_by_identity_id
     OR NEW.purpose IS DISTINCT FROM OLD.purpose
     OR NEW.issued_at IS DISTINCT FROM OLD.issued_at
     OR NEW.expires_at IS DISTINCT FROM OLD.expires_at THEN
    RAISE EXCEPTION 'Evidence access grant scope and expiry are immutable';
  END IF;

  IF OLD.status <> 'active' OR NEW.status NOT IN ('revoked', 'expired') THEN
    RAISE EXCEPTION 'Evidence access grants may only transition from active to revoked or expired';
  END IF;

  NEW.ended_at := COALESCE(NEW.ended_at, now());
  IF NEW.end_reason IS NULL OR length(btrim(NEW.end_reason)) < 8 THEN
    RAISE EXCEPTION 'Evidence access grant closure requires a reason';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_evidence_access_transition
BEFORE UPDATE ON operations.evidence_access_grants
FOR EACH ROW
EXECUTE FUNCTION operations.validate_evidence_access_transition();
CREATE TRIGGER operations_evidence_access_no_delete
BEFORE DELETE ON operations.evidence_access_grants
FOR EACH ROW
EXECUTE FUNCTION platform.reject_immutable_mutation();

CREATE FUNCTION operations.revoke_evidence_access_for_assignment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'active' AND NEW.status <> 'active' THEN
    UPDATE operations.evidence_access_grants
    SET status = 'revoked',
        ended_at = now(),
        end_reason = 'Review assignment ended before evidence access expiry'
    WHERE assignment_id = NEW.id
      AND status = 'active';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_evidence_access_assignment_end
AFTER UPDATE OF status ON verification.assignments
FOR EACH ROW
EXECUTE FUNCTION operations.revoke_evidence_access_for_assignment();

CREATE FUNCTION operations.revoke_evidence_access_for_context_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.current_version_id IS DISTINCT FROM OLD.current_version_id
     OR NEW.status NOT IN ('ready_for_review', 'approved') THEN
    UPDATE operations.evidence_access_grants
    SET status = 'revoked',
        ended_at = now(),
        end_reason = 'Evidence version or review state changed before access expiry'
    WHERE evidence_id = NEW.id
      AND status = 'active';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_evidence_access_context_change
AFTER UPDATE OF status, current_version_id ON evidence.items
FOR EACH ROW
EXECUTE FUNCTION operations.revoke_evidence_access_for_context_change();

CREATE FUNCTION operations.audit_evidence_access_grant()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  provider_id_value uuid;
  action_name text;
  actor_id_value uuid;
BEGIN
  SELECT provider_id INTO provider_id_value
  FROM verification.cases
  WHERE id = NEW.case_id;

  action_name := CASE
    WHEN TG_OP = 'INSERT' THEN 'private_evidence_authorization_issued'
    WHEN NEW.status = 'expired' THEN 'private_evidence_authorization_expired'
    ELSE 'private_evidence_authorization_revoked'
  END;
  actor_id_value := COALESCE(
    NEW.ended_by_identity_id,
    NEW.granted_by_identity_id,
    NEW.grantee_identity_id
  );

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
    actor_id_value,
    provider_id_value,
    action_name,
    'evidence_access_grant',
    NEW.id,
    'success',
    jsonb_build_object(
      'caseId', NEW.case_id,
      'evidenceId', NEW.evidence_id,
      'evidenceVersionId', NEW.evidence_version_id,
      'assignmentId', NEW.assignment_id,
      'status', NEW.status,
      'expiresAt', NEW.expires_at,
      'accessUrlStored', false,
      'objectKeyStored', false,
      'evidenceBytesLogged', false
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_evidence_access_audit_insert
AFTER INSERT ON operations.evidence_access_grants
FOR EACH ROW
EXECUTE FUNCTION operations.audit_evidence_access_grant();
CREATE TRIGGER operations_evidence_access_audit_status
AFTER UPDATE OF status ON operations.evidence_access_grants
FOR EACH ROW
EXECUTE FUNCTION operations.audit_evidence_access_grant();

INSERT INTO authz.permissions (permission_key, description) VALUES
  (
    'operations.evidence_access.revoke',
    'Revoke a private evidence access authorization within an assigned review or supervisory scope.'
  )
ON CONFLICT (permission_key) DO NOTHING;

WITH grants(role_key, permission_key) AS (
  VALUES
    ('reviewer', 'operations.evidence_access.revoke'),
    ('trust_supervisor', 'operations.evidence_access.revoke'),
    ('admin', 'operations.evidence_access.revoke')
)
INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM grants
JOIN authz.roles AS roles USING (role_key)
JOIN authz.permissions AS permissions USING (permission_key)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE operations.evidence_access_grants IS
  'Short-lived revocable authorization records for assigned private evidence review. URLs and storage object keys are never persisted here.';
