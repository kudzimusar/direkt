CREATE SCHEMA IF NOT EXISTS provider_workspace;

CREATE TABLE provider_workspace.upload_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  created_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  case_id uuid NOT NULL REFERENCES verification.cases(id) ON DELETE RESTRICT,
  requirement_id uuid NOT NULL REFERENCES catalog.requirements(id) ON DELETE RESTRICT,
  client_intent_key text NOT NULL,
  evidence_class text NOT NULL,
  document_type text NOT NULL,
  content_type text NOT NULL,
  max_bytes bigint NOT NULL,
  consent_confirmed boolean NOT NULL,
  replacement_for_evidence_id uuid REFERENCES evidence.items(id) ON DELETE RESTRICT,
  state text NOT NULL DEFAULT 'queued',
  attempt_count integer NOT NULL DEFAULT 0,
  active_upload_session_id uuid REFERENCES evidence.upload_sessions(id) ON DELETE RESTRICT,
  submitted_evidence_id uuid REFERENCES evidence.items(id) ON DELETE RESTRICT,
  last_error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  cancelled_at timestamptz,
  CONSTRAINT provider_workspace_upload_intent_key_format CHECK (
    client_intent_key ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$'
  ),
  CONSTRAINT provider_workspace_upload_evidence_class_allowed CHECK (
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
  CONSTRAINT provider_workspace_upload_document_type_format CHECK (
    document_type ~ '^[a-z][a-z0-9_]{2,63}$'
  ),
  CONSTRAINT provider_workspace_upload_content_type_allowed CHECK (
    content_type IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')
  ),
  CONSTRAINT provider_workspace_upload_size_valid CHECK (max_bytes BETWEEN 1024 AND 20971520),
  CONSTRAINT provider_workspace_upload_consent_required CHECK (consent_confirmed = true),
  CONSTRAINT provider_workspace_upload_state_allowed CHECK (
    state IN (
      'queued',
      'uploading',
      'interrupted',
      'retryable',
      'submitted',
      'terminal_failure',
      'cancelled'
    )
  ),
  CONSTRAINT provider_workspace_upload_attempt_count_valid CHECK (attempt_count >= 0),
  CONSTRAINT provider_workspace_upload_error_code_format CHECK (
    last_error_code IS NULL OR last_error_code ~ '^[A-Z][A-Z0-9_]{2,63}$'
  ),
  CONSTRAINT provider_workspace_upload_terminal_state_consistent CHECK (
    (state = 'submitted'
      AND submitted_evidence_id IS NOT NULL
      AND submitted_at IS NOT NULL
      AND cancelled_at IS NULL)
    OR (state = 'cancelled'
      AND submitted_evidence_id IS NULL
      AND submitted_at IS NULL
      AND cancelled_at IS NOT NULL)
    OR (state NOT IN ('submitted', 'cancelled')
      AND submitted_evidence_id IS NULL
      AND submitted_at IS NULL
      AND cancelled_at IS NULL)
  ),
  UNIQUE (provider_id, created_by_identity_id, client_intent_key)
);

CREATE UNIQUE INDEX provider_workspace_upload_active_session_unique
  ON provider_workspace.upload_intents (active_upload_session_id)
  WHERE active_upload_session_id IS NOT NULL;
CREATE INDEX provider_workspace_upload_provider_state_idx
  ON provider_workspace.upload_intents (provider_id, state, updated_at DESC);
CREATE INDEX provider_workspace_upload_case_idx
  ON provider_workspace.upload_intents (case_id, created_at DESC);

CREATE TABLE provider_workspace.upload_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_intent_id uuid NOT NULL REFERENCES provider_workspace.upload_intents(id) ON DELETE RESTRICT,
  upload_session_id uuid NOT NULL UNIQUE REFERENCES evidence.upload_sessions(id) ON DELETE RESTRICT,
  attempt_number integer NOT NULL,
  state text NOT NULL DEFAULT 'uploading',
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  interrupted_at timestamptz,
  completed_at timestamptz,
  CONSTRAINT provider_workspace_upload_attempt_number_positive CHECK (attempt_number > 0),
  CONSTRAINT provider_workspace_upload_attempt_state_allowed CHECK (
    state IN ('uploading', 'interrupted', 'completed', 'cancelled', 'terminal_failure')
  ),
  CONSTRAINT provider_workspace_upload_attempt_error_code_format CHECK (
    error_code IS NULL OR error_code ~ '^[A-Z][A-Z0-9_]{2,63}$'
  ),
  CONSTRAINT provider_workspace_upload_attempt_dates_consistent CHECK (
    (state = 'uploading' AND interrupted_at IS NULL AND completed_at IS NULL)
    OR (state = 'interrupted' AND interrupted_at IS NOT NULL AND completed_at IS NULL)
    OR (state = 'completed' AND completed_at IS NOT NULL)
    OR (state IN ('cancelled', 'terminal_failure') AND completed_at IS NOT NULL)
  ),
  UNIQUE (upload_intent_id, attempt_number)
);

CREATE INDEX provider_workspace_upload_attempt_intent_idx
  ON provider_workspace.upload_attempts (upload_intent_id, attempt_number DESC);

CREATE FUNCTION provider_workspace.validate_upload_intent_linkage()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  case_provider_id uuid;
  case_requirement_id uuid;
  case_status text;
  session_provider_id uuid;
  session_requirement_id uuid;
  session_creator_id uuid;
  replacement_provider_id uuid;
BEGIN
  SELECT provider_id, requirement_id, status
  INTO case_provider_id, case_requirement_id, case_status
  FROM verification.cases
  WHERE id = NEW.case_id;

  IF case_provider_id IS NULL
     OR case_provider_id IS DISTINCT FROM NEW.provider_id
     OR case_requirement_id IS DISTINCT FROM NEW.requirement_id THEN
    RAISE EXCEPTION 'Upload intent must match its provider verification case and requirement';
  END IF;

  IF case_status IN ('approved', 'rejected', 'revoked', 'expired', 'cancelled', 'closed') THEN
    RAISE EXCEPTION 'Terminal verification cases cannot accept provider upload intents';
  END IF;

  IF NEW.replacement_for_evidence_id IS NOT NULL THEN
    SELECT provider_id
    INTO replacement_provider_id
    FROM evidence.items
    WHERE id = NEW.replacement_for_evidence_id
      AND requirement_id = NEW.requirement_id;

    IF replacement_provider_id IS NULL OR replacement_provider_id IS DISTINCT FROM NEW.provider_id THEN
      RAISE EXCEPTION 'Replacement evidence does not match the provider upload intent';
    END IF;
  END IF;

  IF NEW.active_upload_session_id IS NOT NULL THEN
    SELECT provider_id, requirement_id, created_by_identity_id
    INTO session_provider_id, session_requirement_id, session_creator_id
    FROM evidence.upload_sessions
    WHERE id = NEW.active_upload_session_id;

    IF session_provider_id IS NULL
       OR session_provider_id IS DISTINCT FROM NEW.provider_id
       OR session_requirement_id IS DISTINCT FROM NEW.requirement_id
       OR session_creator_id IS DISTINCT FROM NEW.created_by_identity_id THEN
      RAISE EXCEPTION 'Active upload session does not match the provider upload intent';
    END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER provider_workspace_upload_intents_validate_linkage
BEFORE INSERT OR UPDATE OF
  provider_id,
  created_by_identity_id,
  case_id,
  requirement_id,
  replacement_for_evidence_id,
  active_upload_session_id,
  state,
  submitted_evidence_id
ON provider_workspace.upload_intents
FOR EACH ROW
EXECUTE FUNCTION provider_workspace.validate_upload_intent_linkage();

CREATE FUNCTION provider_workspace.validate_upload_attempt_linkage()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  intent_provider_id uuid;
  intent_creator_id uuid;
  intent_requirement_id uuid;
  session_provider_id uuid;
  session_creator_id uuid;
  session_requirement_id uuid;
BEGIN
  SELECT provider_id, created_by_identity_id, requirement_id
  INTO intent_provider_id, intent_creator_id, intent_requirement_id
  FROM provider_workspace.upload_intents
  WHERE id = NEW.upload_intent_id;

  SELECT provider_id, created_by_identity_id, requirement_id
  INTO session_provider_id, session_creator_id, session_requirement_id
  FROM evidence.upload_sessions
  WHERE id = NEW.upload_session_id;

  IF intent_provider_id IS NULL
     OR session_provider_id IS NULL
     OR intent_provider_id IS DISTINCT FROM session_provider_id
     OR intent_creator_id IS DISTINCT FROM session_creator_id
     OR intent_requirement_id IS DISTINCT FROM session_requirement_id THEN
    RAISE EXCEPTION 'Upload attempt does not match its logical provider upload intent';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER provider_workspace_upload_attempts_validate_linkage
BEFORE INSERT OR UPDATE OF upload_intent_id, upload_session_id
ON provider_workspace.upload_attempts
FOR EACH ROW
EXECUTE FUNCTION provider_workspace.validate_upload_attempt_linkage();

INSERT INTO authz.permissions (permission_key, description) VALUES
  ('provider.evidence.manage', 'Create and recover private evidence uploads for the authenticated provider workspace.'),
  ('provider.availability.manage', 'Update minimal availability independently of provider trust and publication.');

WITH grants(role_key, permission_key) AS (
  VALUES
    ('provider_owner', 'provider.evidence.manage'),
    ('provider_member', 'provider.evidence.manage'),
    ('provider_owner', 'provider.availability.manage'),
    ('provider_member', 'provider.availability.manage'),
    ('admin', 'provider.evidence.manage'),
    ('admin', 'provider.availability.manage')
)
INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM grants
JOIN authz.roles AS roles USING (role_key)
JOIN authz.permissions AS permissions USING (permission_key);

COMMENT ON SCHEMA provider_workspace IS
  'Authenticated provider-workspace recovery metadata. It stores no evidence bytes, private object keys, reviewer notes, enquiry workflow or commercial state.';
COMMENT ON TABLE provider_workspace.upload_intents IS
  'Idempotent logical provider upload intents linked to one provider case and requirement. Retry metadata is safe and excludes private object keys. Attempts cannot create duplicate versions because each evidence upload session remains unique in evidence.versions.';
COMMENT ON TABLE provider_workspace.upload_attempts IS
  'Append-like upload attempt history for process-recreation and interrupted-upload recovery. Private storage object keys remain in evidence.upload_sessions only.';
