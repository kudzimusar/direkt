CREATE OR REPLACE FUNCTION catalog.reject_active_requirement_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  version_id uuid;
  version_status text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    version_id := OLD.requirement_version_id;
  ELSE
    version_id := NEW.requirement_version_id;
  END IF;

  SELECT status INTO version_status
  FROM catalog.requirement_versions
  WHERE id = version_id;

  IF version_status IN ('active', 'retired') THEN
    RAISE EXCEPTION 'Requirements belonging to an activated version are immutable';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS requirements_reject_activated_mutation ON catalog.requirements;

CREATE TRIGGER requirements_reject_activated_mutation
BEFORE INSERT OR UPDATE OR DELETE ON catalog.requirements
FOR EACH ROW
EXECUTE FUNCTION catalog.reject_active_requirement_mutation();

COMMENT ON FUNCTION catalog.reject_active_requirement_mutation() IS
  'Prevents inserts, updates and deletes from changing requirements after their version is active or retired.';
