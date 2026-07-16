CREATE FUNCTION operations.is_public_safe_text(p_value text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT p_value IS NULL OR (
    p_value !~* '(latitude|longitude)[[:space:]]*[:=]?[[:space:]]*[-+]?[0-9]{1,3}(\.[0-9]{4,})?'
    AND p_value !~* '[-+]?[0-9]{1,3}\.[0-9]{4,}[[:space:]]*[,/][[:space:]]*[-+]?[0-9]{1,3}\.[0-9]{4,}'
    AND p_value !~* 'geo:[[:space:]]*[-+]?[0-9]'
    AND p_value !~* 'private/[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}'
    AND p_value !~* 'https?://[^[:space:]/]*storage[^[:space:]]*/'
    AND p_value !~* '(object[_ ]?key|sha256)'
  );
$$;

ALTER TABLE operations.field_work_items
  ADD CONSTRAINT operations_field_assignment_reason_public_safe
  CHECK (operations.is_public_safe_text(assignment_reason)),
  ADD CONSTRAINT operations_field_terminal_reason_public_safe
  CHECK (operations.is_public_safe_text(terminal_reason));

ALTER TABLE operations.field_inspection_submissions
  ADD CONSTRAINT operations_field_submission_summary_public_safe
  CHECK (operations.is_public_safe_text(public_safe_summary)),
  ADD CONSTRAINT operations_field_submission_observations_public_safe
  CHECK (operations.is_public_safe_text(observations::text));

CREATE OR REPLACE FUNCTION operations.validate_incident_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IN ('resolved', 'dismissed') THEN
    IF ROW(
      OLD.status,
      OLD.resolution_code,
      OLD.resolution_summary,
      OLD.resolved_by_identity_id,
      OLD.resolved_at
    ) IS DISTINCT FROM ROW(
      NEW.status,
      NEW.resolution_code,
      NEW.resolution_summary,
      NEW.resolved_by_identity_id,
      NEW.resolved_at
    ) THEN
      RAISE EXCEPTION 'Resolved operations incident records are immutable';
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

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

  IF NEW.status IN ('resolved', 'dismissed')
     AND NEW.resolved_by_identity_id IS DISTINCT FROM OLD.owner_identity_id
     AND NOT EXISTS (
       SELECT 1
       FROM authz.role_assignments AS assignments
       JOIN authz.roles AS roles ON roles.id = assignments.role_id
       WHERE assignments.identity_id = NEW.resolved_by_identity_id
         AND assignments.scope_type = 'global'
         AND assignments.revoked_at IS NULL
         AND assignments.starts_at <= now()
         AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
         AND roles.role_key IN ('trust_supervisor', 'admin')
     ) THEN
    RAISE EXCEPTION 'Operations incident resolution requires the owner, a trust supervisor or an administrator';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION operations.is_public_safe_text(text) IS
  'Rejects precise coordinates, private object paths, storage URLs and checksums from operations text returned through public-safe API fields.';
