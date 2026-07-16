CREATE TABLE operations.incident_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_type text NOT NULL,
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  case_id uuid REFERENCES verification.cases(id) ON DELETE RESTRICT,
  evidence_id uuid REFERENCES evidence.items(id) ON DELETE RESTRICT,
  source text NOT NULL DEFAULT 'operations_internal',
  category_code text NOT NULL,
  severity text NOT NULL,
  summary text NOT NULL,
  private_details text,
  status text NOT NULL DEFAULT 'open',
  reported_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  owner_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  due_at timestamptz NOT NULL,
  policy_version text NOT NULL,
  resolution_code text,
  resolution_summary text,
  resolved_by_identity_id uuid REFERENCES account.identities(id) ON DELETE RESTRICT,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT operations_incident_type_allowed CHECK (
    record_type IN ('operations_complaint', 'operations_incident')
  ),
  CONSTRAINT operations_incident_source_fixed CHECK (source = 'operations_internal'),
  CONSTRAINT operations_incident_category_format CHECK (
    category_code ~ '^[A-Z][A-Z0-9_]{2,63}$'
  ),
  CONSTRAINT operations_incident_severity_allowed CHECK (
    severity IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT operations_incident_summary_not_blank CHECK (length(btrim(summary)) >= 20),
  CONSTRAINT operations_incident_private_detail_limit CHECK (
    private_details IS NULL OR length(btrim(private_details)) BETWEEN 8 AND 4000
  ),
  CONSTRAINT operations_incident_status_allowed CHECK (
    status IN ('open', 'investigating', 'resolved', 'dismissed')
  ),
  CONSTRAINT operations_incident_due_future CHECK (due_at > created_at),
  CONSTRAINT operations_incident_policy_not_blank CHECK (length(btrim(policy_version)) >= 3),
  CONSTRAINT operations_incident_resolution_consistent CHECK (
    (status IN ('open', 'investigating')
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

CREATE INDEX operations_incident_queue_idx
  ON operations.incident_records (status, severity, due_at, created_at);
CREATE INDEX operations_incident_provider_idx
  ON operations.incident_records (provider_id, created_at DESC);
CREATE INDEX operations_incident_case_idx
  ON operations.incident_records (case_id, created_at DESC)
  WHERE case_id IS NOT NULL;

CREATE FUNCTION operations.validate_incident_record()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  linked_case_provider uuid;
  linked_evidence_provider uuid;
BEGIN
  IF NEW.case_id IS NOT NULL THEN
    SELECT provider_id INTO linked_case_provider
    FROM verification.cases
    WHERE id = NEW.case_id;

    IF linked_case_provider IS NULL OR linked_case_provider IS DISTINCT FROM NEW.provider_id THEN
      RAISE EXCEPTION 'Operations incident case does not match the provider scope';
    END IF;
  END IF;

  IF NEW.evidence_id IS NOT NULL THEN
    SELECT provider_id INTO linked_evidence_provider
    FROM evidence.items
    WHERE id = NEW.evidence_id;

    IF linked_evidence_provider IS NULL OR linked_evidence_provider IS DISTINCT FROM NEW.provider_id THEN
      RAISE EXCEPTION 'Operations incident evidence does not match the provider scope';
    END IF;

    IF NEW.case_id IS NOT NULL AND NOT EXISTS (
      SELECT 1
      FROM verification.case_evidence
      WHERE case_id = NEW.case_id AND evidence_id = NEW.evidence_id
    ) THEN
      RAISE EXCEPTION 'Operations incident evidence is not linked to the referenced case';
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM authz.role_assignments AS assignments
    JOIN authz.roles AS roles ON roles.id = assignments.role_id
    WHERE assignments.identity_id = NEW.owner_identity_id
      AND assignments.scope_type = 'global'
      AND assignments.revoked_at IS NULL
      AND assignments.starts_at <= now()
      AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
      AND roles.role_key IN ('support', 'trust_supervisor', 'admin')
  ) THEN
    RAISE EXCEPTION 'Operations incident owner must hold an active support, supervisor or administrator role';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_incident_records_validate
BEFORE INSERT OR UPDATE OF provider_id, case_id, evidence_id, owner_identity_id
ON operations.incident_records
FOR EACH ROW
EXECUTE FUNCTION operations.validate_incident_record();

CREATE FUNCTION operations.validate_incident_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'open' AND NEW.status IN ('investigating', 'resolved', 'dismissed'))
    OR (OLD.status = 'investigating' AND NEW.status IN ('resolved', 'dismissed'))
  ) THEN
    RAISE EXCEPTION 'Invalid operations incident transition from % to %', OLD.status, NEW.status;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER operations_incident_records_validate_transition
BEFORE UPDATE OF status ON operations.incident_records
FOR EACH ROW
EXECUTE FUNCTION operations.validate_incident_transition();

CREATE VIEW operations.expiry_renewal_dashboard AS
SELECT
  'evidence'::text AS record_type,
  items.provider_id,
  profiles.display_name AS provider_display_name,
  items.id AS record_id,
  requirements.requirement_key AS record_key,
  requirements.label AS record_label,
  items.status,
  versions.expires_at,
  floor(EXTRACT(EPOCH FROM (versions.expires_at - now())) / 86400)::integer AS days_remaining,
  CASE
    WHEN versions.expires_at <= now() OR items.status = 'expired' THEN 'renew_now'
    WHEN versions.expires_at <= now() + interval '30 days' THEN 'due_soon'
    ELSE 'current'
  END AS action_state
FROM evidence.items AS items
JOIN evidence.versions AS versions ON versions.id = items.current_version_id
JOIN catalog.requirements AS requirements ON requirements.id = items.requirement_id
JOIN provider.profiles AS profiles ON profiles.provider_id = items.provider_id
WHERE versions.expires_at IS NOT NULL
  AND items.status NOT IN ('draft', 'revoked')

UNION ALL

SELECT
  'claim'::text AS record_type,
  claims.provider_id,
  profiles.display_name AS provider_display_name,
  claims.id AS record_id,
  claims.claim_key AS record_key,
  claims.claim_statement AS record_label,
  claims.status,
  claims.valid_until AS expires_at,
  floor(EXTRACT(EPOCH FROM (claims.valid_until - now())) / 86400)::integer AS days_remaining,
  CASE
    WHEN claims.valid_until <= now() OR claims.status = 'expired' THEN 'renew_now'
    WHEN claims.valid_until <= now() + interval '30 days' THEN 'due_soon'
    ELSE 'current'
  END AS action_state
FROM verification.claims AS claims
JOIN provider.profiles AS profiles ON profiles.provider_id = claims.provider_id
WHERE claims.status <> 'revoked';

CREATE VIEW operations.operational_metrics_snapshot AS
SELECT
  now() AS generated_at,
  (SELECT count(*) FROM operations.verification_triage_queue)::integer AS triage_total,
  (
    SELECT count(*) FROM operations.verification_triage_queue
    WHERE sla_state = 'overdue'
  )::integer AS triage_overdue,
  (
    SELECT count(*) FROM operations.verification_triage_queue
    WHERE sla_state = 'breached'
  )::integer AS triage_breached,
  (
    SELECT count(*) FROM verification.decisions
    WHERE created_at >= now() - interval '30 days'
  )::integer AS decisions_last_30_days,
  (
    SELECT count(*) FROM verification.decisions
    WHERE result = 'correction_required'
      AND created_at >= now() - interval '30 days'
  )::integer AS corrections_last_30_days,
  (
    SELECT count(*) FROM operations.field_work_items
    WHERE state IN ('scheduled', 'accepted', 'in_progress')
  )::integer AS field_work_active,
  (
    SELECT count(*) FROM operations.field_work_items
    WHERE state = 'submitted'
      AND ended_at >= now() - interval '30 days'
  )::integer AS field_work_completed_last_30_days,
  (
    SELECT count(*) FROM operations.case_escalations
    WHERE status IN ('open', 'in_progress')
  )::integer AS escalations_active,
  (
    SELECT count(*) FROM operations.incident_records
    WHERE status IN ('open', 'investigating')
  )::integer AS incidents_active,
  (
    SELECT count(*) FROM operations.expiry_renewal_dashboard
    WHERE record_type = 'evidence' AND action_state IN ('due_soon', 'renew_now')
  )::integer AS evidence_due,
  (
    SELECT count(*) FROM operations.expiry_renewal_dashboard
    WHERE record_type = 'claim' AND action_state IN ('due_soon', 'renew_now')
  )::integer AS claims_due;

INSERT INTO authz.permissions (permission_key, description) VALUES
  ('operations.incidents.read', 'Read bounded internal operations complaint and incident records.'),
  ('operations.incidents.manage', 'Create, investigate and resolve bounded operations incident records.'),
  ('operations.reporting.read', 'Read privacy-safe expiry and aggregate operations reporting.'),
  ('operations.reporting.export', 'Export allowlisted aggregate operations metrics without private identifiers.')
ON CONFLICT (permission_key) DO NOTHING;

WITH grants(role_key, permission_key) AS (
  VALUES
    ('support', 'operations.incidents.read'),
    ('support', 'operations.incidents.manage'),
    ('trust_supervisor', 'operations.incidents.read'),
    ('trust_supervisor', 'operations.incidents.manage'),
    ('trust_supervisor', 'operations.reporting.read'),
    ('auditor', 'operations.incidents.read'),
    ('auditor', 'operations.reporting.read'),
    ('auditor', 'operations.reporting.export'),
    ('admin', 'operations.incidents.read'),
    ('admin', 'operations.incidents.manage'),
    ('admin', 'operations.reporting.read'),
    ('admin', 'operations.reporting.export')
)
INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM grants
JOIN authz.roles AS roles USING (role_key)
JOIN authz.permissions AS permissions USING (permission_key)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE operations.incident_records IS
  'Bounded internal complaint and incident records. They are not customer reviews, enquiries, moderation appeals or tracked interaction history.';
COMMENT ON VIEW operations.expiry_renewal_dashboard IS
  'Internal evidence and claim expiry projection without document content, object keys, private coordinates or reviewer notes.';
COMMENT ON VIEW operations.operational_metrics_snapshot IS
  'Aggregate privacy-safe operations metrics suitable for allowlisted reporting and export.';
