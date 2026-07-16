CREATE SCHEMA IF NOT EXISTS operations;

CREATE TABLE operations.triage_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_family text NOT NULL,
  high_risk boolean NOT NULL,
  review_sla_minutes integer NOT NULL,
  escalation_sla_minutes integer NOT NULL,
  base_priority integer NOT NULL,
  policy_version text NOT NULL,
  effective_from timestamptz NOT NULL DEFAULT now(),
  effective_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT operations_triage_family_allowed CHECK (
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
  CONSTRAINT operations_triage_review_sla_positive CHECK (review_sla_minutes > 0),
  CONSTRAINT operations_triage_escalation_after_review CHECK (
    escalation_sla_minutes > review_sla_minutes
  ),
  CONSTRAINT operations_triage_priority_range CHECK (base_priority BETWEEN 1 AND 1000),
  CONSTRAINT operations_triage_policy_not_blank CHECK (length(btrim(policy_version)) >= 3),
  CONSTRAINT operations_triage_effective_range CHECK (
    effective_until IS NULL OR effective_until > effective_from
  ),
  UNIQUE (check_family, high_risk, policy_version)
);

CREATE INDEX operations_triage_policy_lookup_idx
  ON operations.triage_policies (
    check_family,
    high_risk,
    effective_from DESC
  );

CREATE TRIGGER operations_triage_policies_immutable
BEFORE UPDATE OR DELETE ON operations.triage_policies
FOR EACH ROW
EXECUTE FUNCTION platform.reject_immutable_mutation();

WITH families(check_family, normal_sla, normal_escalation, normal_priority) AS (
  VALUES
    ('contact', 720, 1440, 220),
    ('representative_identity', 720, 1440, 300),
    ('business', 1440, 2880, 260),
    ('qualification', 1440, 2880, 260),
    ('licence', 720, 1440, 320),
    ('location', 1440, 2880, 240),
    ('premises', 1440, 2880, 240),
    ('field_visit', 2880, 4320, 280),
    ('category_eligibility', 1440, 2880, 250),
    ('good_standing', 720, 1440, 340)
), risk(high_risk) AS (
  VALUES (false), (true)
)
INSERT INTO operations.triage_policies (
  check_family,
  high_risk,
  review_sla_minutes,
  escalation_sla_minutes,
  base_priority,
  policy_version,
  effective_from
)
SELECT
  families.check_family,
  risk.high_risk,
  CASE WHEN risk.high_risk THEN GREATEST(120, families.normal_sla / 2) ELSE families.normal_sla END,
  CASE
    WHEN risk.high_risk THEN GREATEST(240, families.normal_escalation / 2)
    ELSE families.normal_escalation
  END,
  families.normal_priority + CASE WHEN risk.high_risk THEN 200 ELSE 0 END,
  'phase7-v1',
  now()
FROM families
CROSS JOIN risk;

CREATE VIEW operations.verification_triage_queue AS
SELECT
  cases.id AS case_id,
  cases.provider_id,
  profiles.display_name AS provider_display_name,
  categories.category_key,
  categories.name AS category_name,
  requirements.requirement_key,
  requirements.label AS requirement_label,
  cases.check_key,
  cases.check_family,
  cases.status,
  cases.high_risk,
  cases.policy_version AS case_policy_version,
  policies.policy_version AS triage_policy_version,
  policies.review_sla_minutes,
  policies.escalation_sla_minutes,
  cases.created_at,
  cases.updated_at,
  floor(EXTRACT(EPOCH FROM (now() - cases.created_at)) / 60)::integer AS age_minutes,
  floor(EXTRACT(EPOCH FROM (now() - cases.updated_at)) / 60)::integer AS waiting_minutes,
  cases.updated_at + make_interval(mins => policies.review_sla_minutes) AS review_due_at,
  cases.updated_at + make_interval(mins => policies.escalation_sla_minutes) AS escalation_due_at,
  CASE
    WHEN now() >= cases.updated_at + make_interval(mins => policies.escalation_sla_minutes)
      THEN 'breached'
    WHEN now() >= cases.updated_at + make_interval(mins => policies.review_sla_minutes)
      THEN 'overdue'
    WHEN now() >= cases.updated_at + make_interval(mins => (policies.review_sla_minutes * 3) / 4)
      THEN 'due_soon'
    ELSE 'on_track'
  END AS sla_state,
  assignment.id AS active_assignment_id,
  assignment.assignee_identity_id,
  assignment.assignment_kind,
  assignment.assigned_at,
  CASE
    WHEN assignment.id IS NULL THEN 'unassigned'
    ELSE 'assigned'
  END AS assignment_state,
  COALESCE(evidence_summary.evidence_count, 0)::integer AS evidence_count,
  COALESCE(evidence_summary.ready_evidence_count, 0)::integer AS ready_evidence_count,
  COALESCE(evidence_summary.correction_evidence_count, 0)::integer AS correction_evidence_count,
  (
    policies.base_priority
    + CASE cases.status
        WHEN 'appealed' THEN 400
        WHEN 'correction_required' THEN 300
        WHEN 'ready_for_review' THEN 240
        WHEN 'assigned' THEN 180
        WHEN 'in_review' THEN 120
        ELSE 0
      END
    + CASE
        WHEN now() >= cases.updated_at + make_interval(mins => policies.escalation_sla_minutes)
          THEN 300
        WHEN now() >= cases.updated_at + make_interval(mins => policies.review_sla_minutes)
          THEN 180
        WHEN now() >= cases.updated_at + make_interval(mins => (policies.review_sla_minutes * 3) / 4)
          THEN 80
        ELSE 0
      END
    + LEAST(120, floor(EXTRACT(EPOCH FROM (now() - cases.created_at)) / 3600)::integer)
  ) AS priority_score,
  CASE
    WHEN cases.high_risk
      AND now() >= cases.updated_at + make_interval(mins => policies.review_sla_minutes)
      THEN true
    WHEN now() >= cases.updated_at + make_interval(mins => policies.escalation_sla_minutes)
      THEN true
    ELSE false
  END AS escalation_required
FROM verification.cases AS cases
JOIN provider.profiles AS profiles ON profiles.provider_id = cases.provider_id
JOIN catalog.service_categories AS categories ON categories.id = cases.category_id
JOIN catalog.requirements AS requirements ON requirements.id = cases.requirement_id
JOIN LATERAL (
  SELECT policies.*
  FROM operations.triage_policies AS policies
  WHERE policies.check_family = cases.check_family
    AND policies.high_risk = cases.high_risk
    AND policies.effective_from <= now()
    AND (policies.effective_until IS NULL OR policies.effective_until > now())
  ORDER BY policies.effective_from DESC, policies.id DESC
  LIMIT 1
) AS policies ON true
LEFT JOIN LATERAL (
  SELECT
    assignments.id,
    assignments.assignee_identity_id,
    assignments.assignment_kind,
    assignments.assigned_at
  FROM verification.assignments AS assignments
  WHERE assignments.case_id = cases.id
    AND assignments.status = 'active'
    AND assignments.assignment_kind IN ('reviewer', 'supervisor')
  ORDER BY
    CASE assignments.assignment_kind WHEN 'supervisor' THEN 0 ELSE 1 END,
    assignments.assigned_at DESC,
    assignments.id
  LIMIT 1
) AS assignment ON true
LEFT JOIN LATERAL (
  SELECT
    count(*) AS evidence_count,
    count(*) FILTER (WHERE items.status IN ('ready_for_review', 'approved')) AS ready_evidence_count,
    count(*) FILTER (WHERE items.status = 'correction_required') AS correction_evidence_count
  FROM verification.case_evidence AS links
  JOIN evidence.items AS items ON items.id = links.evidence_id
  WHERE links.case_id = cases.id
) AS evidence_summary ON true
WHERE cases.status IN (
  'ready_for_review',
  'assigned',
  'in_review',
  'correction_required',
  'appealed'
);

INSERT INTO authz.permissions (permission_key, description) VALUES
  ('operations.triage.read', 'Read role-scoped verification triage queues and privacy-safe operational metadata.')
ON CONFLICT (permission_key) DO NOTHING;

WITH grants(role_key, permission_key) AS (
  VALUES
    ('reviewer', 'operations.triage.read'),
    ('trust_supervisor', 'operations.triage.read'),
    ('auditor', 'operations.triage.read'),
    ('admin', 'operations.triage.read')
)
INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM grants
JOIN authz.roles AS roles USING (role_key)
JOIN authz.permissions AS permissions USING (permission_key)
ON CONFLICT DO NOTHING;

COMMENT ON SCHEMA operations IS
  'Privacy-safe internal workflow projections, triage policy, escalations, incidents and operational reporting.';
COMMENT ON TABLE operations.triage_policies IS
  'Immutable policy-versioned SLA and priority inputs for deterministic verification triage.';
COMMENT ON VIEW operations.verification_triage_queue IS
  'Internal triage projection. It contains case and assignment metadata but no evidence object keys, document content, private coordinates or reviewer notes.';
