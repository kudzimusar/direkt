CREATE OR REPLACE FUNCTION interaction.validate_appeal_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.review_id <> OLD.review_id
     OR NEW.appellant_scope <> OLD.appellant_scope
     OR NEW.appellant_identity_id <> OLD.appellant_identity_id
     OR NEW.provider_id IS DISTINCT FROM OLD.provider_id
     OR NEW.reason <> OLD.reason
     OR NEW.policy_version <> OLD.policy_version
     OR NEW.appealed_from_status IS DISTINCT FROM OLD.appealed_from_status
     OR NEW.appealed_from_at IS DISTINCT FROM OLD.appealed_from_at
     OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Review appeal scope, origin and reason are immutable';
  END IF;

  IF (
       NEW.status,
       NEW.decided_at,
       NEW.decided_by_identity_id,
       NEW.decision_reason_code,
       NEW.decision_reason
     ) IS DISTINCT FROM (
       OLD.status,
       OLD.decided_at,
       OLD.decided_by_identity_id,
       OLD.decision_reason_code,
       OLD.decision_reason
     )
     AND current_setting('direkt.appeal_decision', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Review appeal decisions are server controlled';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON COLUMN interaction.review_appeals.appealed_from_at IS
  'Original moderation-state timestamp captured at appeal creation and immutable thereafter.';
