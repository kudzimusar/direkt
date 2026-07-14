CREATE SCHEMA IF NOT EXISTS account;
CREATE SCHEMA IF NOT EXISTS authz;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE FUNCTION account.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE account.identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  suspended_at timestamptz,
  deleted_at timestamptz,
  CONSTRAINT identities_status_allowed CHECK (status IN ('active', 'suspended', 'deleted')),
  CONSTRAINT identities_state_consistent CHECK (
    (status = 'active' AND suspended_at IS NULL AND deleted_at IS NULL)
    OR (status = 'suspended' AND suspended_at IS NOT NULL AND deleted_at IS NULL)
    OR (status = 'deleted' AND deleted_at IS NOT NULL)
  )
);

CREATE TRIGGER identities_touch_updated_at
BEFORE UPDATE ON account.identities
FOR EACH ROW
EXECUTE FUNCTION account.touch_updated_at();

CREATE TABLE account.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  channel text NOT NULL,
  value_hash character(64) NOT NULL,
  display_hint text NOT NULL,
  encrypted_value bytea,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contacts_channel_allowed CHECK (channel IN ('email', 'phone')),
  CONSTRAINT contacts_hash_format CHECK (value_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT contacts_hint_not_blank CHECK (length(btrim(display_hint)) BETWEEN 3 AND 120),
  UNIQUE (channel, value_hash)
);

CREATE INDEX contacts_identity_idx ON account.contacts (identity_id, created_at);

CREATE TRIGGER contacts_touch_updated_at
BEFORE UPDATE ON account.contacts
FOR EACH ROW
EXECUTE FUNCTION account.touch_updated_at();

CREATE TABLE account.authentication_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL,
  contact_hash character(64) NOT NULL,
  display_hint text NOT NULL,
  code_hash character(64) NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  failed_attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  request_fingerprint character(64),
  CONSTRAINT challenges_channel_allowed CHECK (channel IN ('email', 'phone')),
  CONSTRAINT challenges_contact_hash_format CHECK (contact_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT challenges_code_hash_format CHECK (code_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT challenges_fingerprint_format CHECK (
    request_fingerprint IS NULL OR request_fingerprint ~ '^[0-9a-f]{64}$'
  ),
  CONSTRAINT challenges_expiry_after_request CHECK (expires_at > requested_at),
  CONSTRAINT challenges_attempts_valid CHECK (
    failed_attempts >= 0 AND max_attempts BETWEEN 1 AND 10 AND failed_attempts <= max_attempts
  )
);

CREATE INDEX authentication_challenges_lookup_idx
  ON account.authentication_challenges (id, expires_at)
  WHERE consumed_at IS NULL;
CREATE INDEX authentication_challenges_contact_idx
  ON account.authentication_challenges (contact_hash, requested_at DESC);

CREATE TABLE account.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  family_id uuid NOT NULL,
  refresh_token_hash character(64) NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revocation_reason text,
  replacement_session_id uuid REFERENCES account.sessions(id) DEFERRABLE INITIALLY DEFERRED,
  reuse_detected_at timestamptz,
  device_label text NOT NULL DEFAULT 'Unknown device',
  user_agent_hash character(64),
  ip_hash character(64),
  requires_step_up boolean NOT NULL DEFAULT false,
  mfa_satisfied_at timestamptz,
  CONSTRAINT sessions_refresh_hash_format CHECK (refresh_token_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT sessions_user_agent_hash_format CHECK (
    user_agent_hash IS NULL OR user_agent_hash ~ '^[0-9a-f]{64}$'
  ),
  CONSTRAINT sessions_ip_hash_format CHECK (ip_hash IS NULL OR ip_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT sessions_expiry_after_creation CHECK (expires_at > created_at),
  CONSTRAINT sessions_replacement_is_different CHECK (
    replacement_session_id IS NULL OR replacement_session_id <> id
  ),
  CONSTRAINT sessions_revocation_reason_consistent CHECK (
    (revoked_at IS NULL AND revocation_reason IS NULL)
    OR (revoked_at IS NOT NULL AND length(btrim(revocation_reason)) > 0)
  )
);

CREATE INDEX sessions_identity_active_idx
  ON account.sessions (identity_id, expires_at DESC)
  WHERE revoked_at IS NULL;
CREATE INDEX sessions_family_idx ON account.sessions (family_id, created_at);

CREATE TABLE account.policy_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_key text NOT NULL,
  version text NOT NULL,
  document_hash character(64) NOT NULL,
  published_at timestamptz NOT NULL,
  effective_at timestamptz NOT NULL,
  retired_at timestamptz,
  CONSTRAINT policy_key_not_blank CHECK (length(btrim(policy_key)) > 0),
  CONSTRAINT policy_version_not_blank CHECK (length(btrim(version)) > 0),
  CONSTRAINT policy_hash_format CHECK (document_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT policy_dates_valid CHECK (
    effective_at >= published_at AND (retired_at IS NULL OR retired_at > effective_at)
  ),
  UNIQUE (policy_key, version)
);

CREATE TABLE account.consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  policy_version_id uuid NOT NULL REFERENCES account.policy_versions(id) ON DELETE RESTRICT,
  status text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  source text NOT NULL,
  request_id uuid,
  CONSTRAINT consents_status_allowed CHECK (status IN ('accepted', 'declined', 'revoked')),
  CONSTRAINT consents_source_not_blank CHECK (length(btrim(source)) > 0),
  CONSTRAINT consents_revocation_consistent CHECK (
    (status = 'revoked' AND revoked_at IS NOT NULL)
    OR (status <> 'revoked' AND revoked_at IS NULL)
  )
);

CREATE INDEX consents_identity_policy_idx
  ON account.consents (identity_id, policy_version_id, recorded_at DESC);

CREATE TABLE authz.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL UNIQUE,
  name text NOT NULL,
  scope_kind text NOT NULL,
  privileged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT roles_key_format CHECK (role_key ~ '^[a-z][a-z0-9_]{2,63}$'),
  CONSTRAINT roles_name_not_blank CHECK (length(btrim(name)) > 0),
  CONSTRAINT roles_scope_allowed CHECK (scope_kind IN ('global', 'provider'))
);

CREATE TABLE authz.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_key text NOT NULL UNIQUE,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT permissions_key_format CHECK (
    permission_key ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'
  ),
  CONSTRAINT permissions_description_not_blank CHECK (length(btrim(description)) > 0)
);

CREATE TABLE authz.role_permissions (
  role_id uuid NOT NULL REFERENCES authz.roles(id) ON DELETE RESTRICT,
  permission_id uuid NOT NULL REFERENCES authz.permissions(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE authz.role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  role_id uuid NOT NULL REFERENCES authz.roles(id) ON DELETE RESTRICT,
  scope_type text NOT NULL,
  provider_id uuid,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  revoked_at timestamptz,
  assigned_by_identity_id uuid REFERENCES account.identities(id) ON DELETE RESTRICT,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT role_assignments_scope_allowed CHECK (scope_type IN ('global', 'provider')),
  CONSTRAINT role_assignments_scope_consistent CHECK (
    (scope_type = 'global' AND provider_id IS NULL)
    OR (scope_type = 'provider' AND provider_id IS NOT NULL)
  ),
  CONSTRAINT role_assignments_dates_valid CHECK (
    (ends_at IS NULL OR ends_at > starts_at)
    AND (revoked_at IS NULL OR revoked_at >= starts_at)
  ),
  CONSTRAINT role_assignments_reason_not_blank CHECK (length(btrim(reason)) >= 8)
);

ALTER TABLE authz.role_assignments
  ADD CONSTRAINT role_assignments_no_time_overlap
  EXCLUDE USING gist (
    identity_id WITH =,
    role_id WITH =,
    scope_type WITH =,
    (COALESCE(provider_id, '00000000-0000-0000-0000-000000000000'::uuid)) WITH =,
    tstzrange(starts_at, COALESCE(ends_at, 'infinity'::timestamptz), '[)') WITH &&
  )
  WHERE (revoked_at IS NULL);
CREATE INDEX role_assignments_identity_idx
  ON authz.role_assignments (identity_id, starts_at DESC);
CREATE INDEX role_assignments_provider_idx
  ON authz.role_assignments (provider_id, identity_id)
  WHERE provider_id IS NOT NULL AND revoked_at IS NULL;

CREATE FUNCTION authz.validate_role_assignment_scope()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  expected_scope text;
BEGIN
  SELECT scope_kind INTO expected_scope
  FROM authz.roles
  WHERE id = NEW.role_id;

  IF expected_scope IS NULL THEN
    RAISE EXCEPTION 'Unknown role for role assignment';
  END IF;

  IF expected_scope <> NEW.scope_type THEN
    RAISE EXCEPTION 'Role scope % does not permit % assignment', expected_scope, NEW.scope_type;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER role_assignments_validate_scope
BEFORE INSERT OR UPDATE OF role_id, scope_type, provider_id
ON authz.role_assignments
FOR EACH ROW
EXECUTE FUNCTION authz.validate_role_assignment_scope();

CREATE FUNCTION authz.audit_role_assignment_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  assignment authz.role_assignments;
  audit_action text;
BEGIN
  assignment := COALESCE(NEW, OLD);
  audit_action := CASE
    WHEN TG_OP = 'INSERT' THEN 'role_assignment_created'
    WHEN TG_OP = 'DELETE' THEN 'role_assignment_deleted'
    WHEN NEW.revoked_at IS NOT NULL AND OLD.revoked_at IS NULL THEN 'role_assignment_revoked'
    ELSE 'role_assignment_changed'
  END;

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
    CASE WHEN assignment.assigned_by_identity_id IS NULL THEN 'system' ELSE 'identity' END,
    assignment.assigned_by_identity_id,
    assignment.provider_id,
    audit_action,
    'role_assignment',
    assignment.id,
    'success',
    jsonb_build_object(
      'identityId', assignment.identity_id,
      'roleId', assignment.role_id,
      'scopeType', assignment.scope_type,
      'syntheticSchemaEvent', true
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER role_assignments_audit
AFTER INSERT OR UPDATE OR DELETE ON authz.role_assignments
FOR EACH ROW
EXECUTE FUNCTION authz.audit_role_assignment_change();

CREATE FUNCTION account.audit_contact_verification()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.verified_at IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.verified_at IS DISTINCT FROM NEW.verified_at) THEN
    INSERT INTO platform.audit_events (
      actor_type,
      actor_id,
      action,
      resource_type,
      resource_id,
      outcome,
      metadata
    ) VALUES (
      'identity',
      NEW.identity_id,
      'contact_verified',
      'contact',
      NEW.id,
      'success',
      jsonb_build_object('channel', NEW.channel, 'displayHint', NEW.display_hint)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER contacts_audit_verification
AFTER INSERT OR UPDATE OF verified_at ON account.contacts
FOR EACH ROW
EXECUTE FUNCTION account.audit_contact_verification();

INSERT INTO authz.roles (role_key, name, scope_kind, privileged) VALUES
  ('customer', 'Customer', 'global', false),
  ('provider_owner', 'Provider owner', 'provider', true),
  ('provider_member', 'Provider member', 'provider', false),
  ('provider_responder', 'Provider responder', 'provider', false),
  ('field_agent', 'Field agent', 'global', true),
  ('reviewer', 'Verification reviewer', 'global', true),
  ('support', 'Support', 'global', true),
  ('trust_supervisor', 'Trust supervisor', 'global', true),
  ('finance', 'Finance', 'global', true),
  ('auditor', 'Auditor', 'global', true),
  ('admin', 'Administrator', 'global', true);

INSERT INTO authz.permissions (permission_key, description) VALUES
  ('account.sessions.manage', 'List and revoke sessions belonging to the authenticated identity.'),
  ('operations.portal.access', 'Access the internal operations portal shell.'),
  ('provider.profile.manage', 'Manage a provider profile within the assigned provider scope.'),
  ('provider.enquiries.respond', 'Respond to provider enquiries within the assigned provider scope.'),
  ('verification.field_visit.record', 'Record an assigned field-visit outcome without granting final approval.'),
  ('verification.case.review', 'Review verification cases without bypassing separation of duties.'),
  ('verification.final_decision', 'Submit a final verification decision subject to self-approval controls.'),
  ('support.ticket.manage', 'Manage support tickets within approved scope.'),
  ('trust.provider.suspend', 'Suspend or reinstate a provider with a reason and audit event.'),
  ('finance.ledger.read', 'Read approved commercial ledger information.'),
  ('audit.read', 'Read immutable audit records.'),
  ('admin.roles.manage', 'Assign or revoke privileged platform roles.'),
  ('admin.emergency_action', 'Record a reasoned emergency administrative action.');

WITH grants(role_key, permission_key) AS (
  VALUES
    ('customer', 'account.sessions.manage'),
    ('provider_owner', 'account.sessions.manage'),
    ('provider_owner', 'provider.profile.manage'),
    ('provider_owner', 'provider.enquiries.respond'),
    ('provider_member', 'account.sessions.manage'),
    ('provider_member', 'provider.profile.manage'),
    ('provider_member', 'provider.enquiries.respond'),
    ('provider_responder', 'account.sessions.manage'),
    ('provider_responder', 'provider.enquiries.respond'),
    ('field_agent', 'account.sessions.manage'),
    ('field_agent', 'operations.portal.access'),
    ('field_agent', 'verification.field_visit.record'),
    ('reviewer', 'account.sessions.manage'),
    ('reviewer', 'operations.portal.access'),
    ('reviewer', 'verification.case.review'),
    ('reviewer', 'verification.final_decision'),
    ('support', 'account.sessions.manage'),
    ('support', 'operations.portal.access'),
    ('support', 'support.ticket.manage'),
    ('trust_supervisor', 'account.sessions.manage'),
    ('trust_supervisor', 'operations.portal.access'),
    ('trust_supervisor', 'verification.case.review'),
    ('trust_supervisor', 'verification.final_decision'),
    ('trust_supervisor', 'support.ticket.manage'),
    ('trust_supervisor', 'trust.provider.suspend'),
    ('trust_supervisor', 'audit.read'),
    ('finance', 'account.sessions.manage'),
    ('finance', 'operations.portal.access'),
    ('finance', 'finance.ledger.read'),
    ('auditor', 'account.sessions.manage'),
    ('auditor', 'operations.portal.access'),
    ('auditor', 'audit.read'),
    ('admin', 'account.sessions.manage'),
    ('admin', 'operations.portal.access'),
    ('admin', 'provider.profile.manage'),
    ('admin', 'provider.enquiries.respond'),
    ('admin', 'verification.case.review'),
    ('admin', 'verification.final_decision'),
    ('admin', 'support.ticket.manage'),
    ('admin', 'trust.provider.suspend'),
    ('admin', 'finance.ledger.read'),
    ('admin', 'audit.read'),
    ('admin', 'admin.roles.manage'),
    ('admin', 'admin.emergency_action')
)
INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM grants
JOIN authz.roles AS roles USING (role_key)
JOIN authz.permissions AS permissions USING (permission_key);

COMMENT ON SCHEMA account IS
  'Identity, verified-contact, consent, challenge and revocable-session contracts.';
COMMENT ON SCHEMA authz IS
  'Deny-by-default role and permission contracts. Client claims never grant authorization.';
COMMENT ON TABLE account.contacts IS
  'Contact lookup hashes and public-safe hints. Raw contact values are not stored by Phase 2C.';
COMMENT ON TABLE account.authentication_challenges IS
  'Short-lived passwordless challenges. Only challenge and contact hashes are persisted.';
COMMENT ON TABLE account.sessions IS
  'Rotating refresh-session families. Raw refresh tokens must never be stored.';
