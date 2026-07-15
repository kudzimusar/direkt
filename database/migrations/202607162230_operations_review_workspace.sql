CREATE UNIQUE INDEX verification_assignments_one_active_review_context_idx
  ON verification.assignments (case_id, assignee_identity_id)
  WHERE status = 'active'
    AND assignment_kind IN ('reviewer', 'supervisor');

CREATE TABLE operations.evidence_review_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  case_id uuid NOT NULL REFERENCES verification.cases(id) ON DELETE RESTRICT,
  evidence_id uuid NOT NULL REFERENCES evidence.items(id) ON DELETE RESTRICT,
  evidence_version_id uuid NOT NULL REFERENCES evidence.versions(id) ON DELETE RESTRICT,
  assignment_id uuid NOT NULL REFERENCES verification.assignments(id) ON DELETE RESTRICT,
  grantee_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoked_by_identity_id uuid REFERENCES account.identities(id) ON DELETE RESTRICT,
  revoke_reason text,
  CONSTRAINT operations_review_grant_hash_format CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT operations_review_grant_status_allowed CHECK (status IN ('active', 'revoked')),
  CONSTRAINT operations_review_grant_expiry_valid CHECK (
    expires_at > created_at AND expires_at <= created_at + interval '10 minutes'
  ),
  CONSTRAINT operations_review_grant_revocation_consistent CHECK (
    (status = 'active'
      AND revoked_at IS NULL
      AND revoked_by_identity_id IS NULL
      AND revoke_reason IS NULL)
    OR (status = 'revoked'
      AND revoked_at IS NOT NULL
      AND revoke_reason IS NOT NULL
      AND length(btrim(revoke_reason)) >= 8)
  )
);

CREATE UNIQUE INDEX operations_evidence_review_grants_one_active_idx
  ON operations.evidence_review_grants (assignment_id, evidence_id, grantee_identity_id)
  WHERE status = 'active';
CREATE INDEX operations_evidence_review_grants_lookup_idx
  ON operations.evidence_review_grants (grantee_identity_id, status, expires_at);
CREATE INDEX operations_evidence_review_grants_case_idx
  ON operations.evidence_review_grants (case_id, created_at DESC);

CREATE FUNCTION operations.validate_evidence_review_grant()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  assignment_case_id uuid;
  assignment_identity_id uuid;
  assignment_kind text;
  assignment_status text;
  linked_version_id uuid;
  case_status text;
BEGIN
  SELECT
    assignments.case_id,
    assignments.assignee_identity_id,
    assignments.assignment_kind,
    assignments.status
  INTO
    assignment_case_id,
    assignment_identity_id,
    assignment_kind,
    assignment_status
  FROM verification.assignments AS assignments
  WHERE assignments.id = NEW.assignment_id;

  IF assignment_case_id IS NULL
     OR assignment_case_id IS DISTINCT FROM NEW.case_id
     OR assignment_identity_id IS DISTINCT FROM NEW.grantee_identity_id
     OR assignment_kind NOT IN ('reviewer', 'supervisor')
     OR assignment_status <> 'active' THEN
    RAISE EXCEPTION 'Evidence review grant requires one active assigned review context';
  END IF;

  SELECT items.current_version_id, cases.status
  INTO linked_version_id, case_status
  FROM verification.cases AS cases
  JOIN verification.case_evidence AS links ON links.case_id = cases.id
  JOIN evidence.items AS items ON items.id = links.evidence_id
  WHERE cases.id = NEW.case_id
    AND items.id = NEW.evidence_id
    AND items.status NOT IN ('draft', 'revoked', 'expired');

  IF linked_version_id IS NULL
     OR linked_version_id IS DISTINCT FROM NEW.evidence_version_id
     OR case_status NOT IN ('assigned', 'in_review', 'appealed') THEN
    RAISE EXCEPTION 'Evidence review grant does not match a current reviewable case version';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_evidence_review_grants_validate
BEFORE INSERT OR UPDATE OF
  case_id,
  evidence_id,
  evidence_version_id,
  assignment_id,
  grantee_identity_id,
  status
ON operations.evidence_review_grants
FOR EACH ROW
EXECUTE FUNCTION operations.validate_evidence_review_grant();

CREATE FUNCTION operations.revoke_review_grants_for_assignment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'active' AND NEW.status <> 'active' THEN
    UPDATE operations.evidence_review_grants
    SET status = 'revoked',
        revoked_at = now(),
        revoked_by_identity_id = NULL,
        revoke_reason = 'ASSIGNMENT_ENDED'
    WHERE assignment_id = NEW.id
      AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_revoke_review_grants_assignment
AFTER UPDATE OF status ON verification.assignments
FOR EACH ROW
EXECUTE FUNCTION operations.revoke_review_grants_for_assignment();

CREATE FUNCTION operations.revoke_review_grants_for_evidence_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.current_version_id IS DISTINCT FROM NEW.current_version_id
     OR NEW.status IN ('revoked', 'expired') THEN
    UPDATE operations.evidence_review_grants
    SET status = 'revoked',
        revoked_at = now(),
        revoked_by_identity_id = NULL,
        revoke_reason = 'EVIDENCE_CHANGED'
    WHERE evidence_id = NEW.id
      AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_revoke_review_grants_evidence
AFTER UPDATE OF current_version_id, status ON evidence.items
FOR EACH ROW
EXECUTE FUNCTION operations.revoke_review_grants_for_evidence_change();

INSERT INTO authz.permissions (permission_key, description) VALUES
  ('operations.evidence_access.revoke', 'Revoke an application-mediated private evidence review grant.')
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

COMMENT ON TABLE operations.evidence_review_grants IS
  'Application-mediated short-lived evidence review grants. Raw tokens are never persisted; every retrieval revalidates assignment, expiry, evidence version and revocation.';
