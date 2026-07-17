ALTER TABLE interaction.review_appeals
  ADD COLUMN appealed_from_status text,
  ADD COLUMN appealed_from_at timestamptz;

ALTER TABLE interaction.review_appeals
  ADD CONSTRAINT review_appeals_origin_consistent CHECK (
    (appealed_from_status IS NULL AND appealed_from_at IS NULL)
    OR (appealed_from_status IN ('withheld', 'removed') AND appealed_from_at IS NOT NULL)
  );

ALTER TABLE interaction.review_moderation_events
  ADD CONSTRAINT review_moderation_policy_not_blank
  CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80);

ALTER TABLE interaction.complaint_events
  ADD CONSTRAINT complaint_events_policy_not_blank
  CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80);

CREATE FUNCTION interaction.identity_has_global_permission(
  identity_uuid uuid,
  required_permission text
)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM authz.role_assignments AS assignments
    JOIN authz.roles AS roles ON roles.id = assignments.role_id
    JOIN authz.role_permissions AS role_permissions ON role_permissions.role_id = roles.id
    JOIN authz.permissions AS permissions ON permissions.id = role_permissions.permission_id
    WHERE assignments.identity_id = identity_uuid
      AND assignments.scope_type = 'global'
      AND assignments.revoked_at IS NULL
      AND assignments.starts_at <= now()
      AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
      AND permissions.permission_key = required_permission
  );
$$;

CREATE OR REPLACE FUNCTION interaction.validate_review_appeal_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  review interaction.reviews;
  provider_authorized boolean;
BEGIN
  SELECT * INTO review
  FROM interaction.reviews
  WHERE id = NEW.review_id
  FOR UPDATE;

  IF review.id IS NULL OR review.moderation_status NOT IN ('withheld', 'removed') THEN
    RAISE EXCEPTION 'Only withheld or removed reviews can be appealed';
  END IF;

  IF NEW.appellant_scope = 'customer' THEN
    IF NEW.appellant_identity_id <> review.customer_identity_id OR NEW.provider_id IS NOT NULL THEN
      RAISE EXCEPTION 'Customer appeal scope does not match the review';
    END IF;
  ELSE
    IF NEW.provider_id IS DISTINCT FROM review.provider_id THEN
      RAISE EXCEPTION 'Provider appeal scope does not match the review';
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM authz.role_assignments AS assignments
      JOIN authz.roles AS roles ON roles.id = assignments.role_id
      WHERE assignments.identity_id = NEW.appellant_identity_id
        AND assignments.provider_id = review.provider_id
        AND assignments.scope_type = 'provider'
        AND assignments.revoked_at IS NULL
        AND assignments.starts_at <= now()
        AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
        AND roles.role_key IN ('provider_owner', 'provider_member', 'provider_responder')
    ) INTO provider_authorized;

    IF NOT provider_authorized THEN
      RAISE EXCEPTION 'Provider appeal actor is not authorized';
    END IF;
  END IF;

  NEW.appealed_from_status := review.moderation_status;
  NEW.appealed_from_at := CASE
    WHEN review.moderation_status = 'withheld' THEN review.withheld_at
    ELSE review.removed_at
  END;

  PERFORM set_config('direkt.review_moderation', 'on', true);
  UPDATE interaction.reviews
  SET moderation_status = 'appealed',
      revision = revision + 1,
      updated_at = now(),
      published_at = NULL,
      withheld_at = NULL,
      removed_at = NULL
  WHERE id = review.id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION interaction.moderate_review(
  review_uuid uuid,
  operator_identity_uuid uuid,
  target_status text,
  moderation_reason_code text,
  moderation_reason text,
  moderation_policy_version text,
  expected_revision integer
)
RETURNS interaction.reviews
LANGUAGE plpgsql
AS $$
DECLARE
  current_review interaction.reviews;
  previous_status text;
  next_sequence integer;
BEGIN
  IF NOT interaction.identity_has_global_permission(
    operator_identity_uuid,
    'operations.reviews.manage'
  ) THEN
    RAISE EXCEPTION 'Review moderation actor is not authorized';
  END IF;

  SELECT * INTO current_review
  FROM interaction.reviews
  WHERE id = review_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review not found';
  END IF;

  IF current_review.revision <> expected_revision THEN
    RAISE EXCEPTION 'Review revision conflict';
  END IF;

  IF target_status NOT IN ('published', 'withheld', 'removed') THEN
    RAISE EXCEPTION 'Review moderation target is not allowed';
  END IF;

  IF NOT (
    (current_review.moderation_status IN ('pending', 'appealed')
      AND target_status IN ('published', 'withheld', 'removed'))
    OR (current_review.moderation_status = 'published'
      AND target_status IN ('withheld', 'removed'))
    OR (current_review.moderation_status = 'withheld'
      AND target_status IN ('published', 'removed'))
  ) THEN
    RAISE EXCEPTION 'Review moderation transition is not allowed';
  END IF;

  previous_status := current_review.moderation_status;

  SELECT COALESCE(max(sequence), 0) + 1 INTO next_sequence
  FROM interaction.review_moderation_events
  WHERE review_id = review_uuid;

  PERFORM set_config('direkt.review_moderation', 'on', true);
  UPDATE interaction.reviews
  SET moderation_status = target_status,
      revision = revision + 1,
      updated_at = now(),
      published_at = CASE WHEN target_status = 'published' THEN now() ELSE NULL END,
      withheld_at = CASE WHEN target_status = 'withheld' THEN now() ELSE NULL END,
      removed_at = CASE WHEN target_status = 'removed' THEN now() ELSE NULL END
  WHERE id = review_uuid
  RETURNING * INTO current_review;

  INSERT INTO interaction.review_moderation_events (
    review_id,
    sequence,
    from_status,
    to_status,
    operator_identity_id,
    reason_code,
    reason,
    policy_version
  ) VALUES (
    review_uuid,
    next_sequence,
    previous_status,
    target_status,
    operator_identity_uuid,
    moderation_reason_code,
    moderation_reason,
    moderation_policy_version
  );

  PERFORM interaction.append_interaction_event(
    current_review.interaction_id,
    'review_moderated',
    'operations',
    operator_identity_uuid,
    moderation_reason,
    moderation_policy_version,
    jsonb_build_object(
      'fromStatus', previous_status,
      'toStatus', target_status,
      'reasonCode', moderation_reason_code
    )
  );

  RETURN current_review;
END;
$$;

CREATE OR REPLACE FUNCTION interaction.decide_review_appeal(
  appeal_uuid uuid,
  operator_identity_uuid uuid,
  decision_status text,
  decision_code text,
  decision_reason_text text,
  decision_policy_version text
)
RETURNS interaction.review_appeals
LANGUAGE plpgsql
AS $$
DECLARE
  appeal interaction.review_appeals;
  review interaction.reviews;
  restore_status text;
  restore_at timestamptz;
BEGIN
  IF NOT interaction.identity_has_global_permission(
    operator_identity_uuid,
    'operations.reviews.manage'
  ) THEN
    RAISE EXCEPTION 'Review appeal decision actor is not authorized';
  END IF;

  SELECT * INTO appeal
  FROM interaction.review_appeals
  WHERE id = appeal_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appeal not found';
  END IF;

  IF appeal.status <> 'submitted' THEN
    RAISE EXCEPTION 'Appeal is already terminal';
  END IF;

  IF decision_status NOT IN ('upheld', 'denied') THEN
    RAISE EXCEPTION 'Appeal decision is not allowed';
  END IF;

  SELECT * INTO review
  FROM interaction.reviews
  WHERE id = appeal.review_id
  FOR UPDATE;

  PERFORM set_config('direkt.appeal_decision', 'on', true);
  UPDATE interaction.review_appeals
  SET status = decision_status,
      decided_at = now(),
      decided_by_identity_id = operator_identity_uuid,
      decision_reason_code = decision_code,
      decision_reason = decision_reason_text
  WHERE id = appeal_uuid
  RETURNING * INTO appeal;

  PERFORM set_config('direkt.review_moderation', 'on', true);
  IF decision_status = 'upheld' THEN
    UPDATE interaction.reviews
    SET moderation_status = 'pending',
        revision = revision + 1,
        published_at = NULL,
        withheld_at = NULL,
        removed_at = NULL,
        updated_at = now()
    WHERE id = review.id;
  ELSE
    restore_status := COALESCE(appeal.appealed_from_status, 'withheld');
    restore_at := COALESCE(appeal.appealed_from_at, now());

    UPDATE interaction.reviews
    SET moderation_status = restore_status,
        revision = revision + 1,
        published_at = NULL,
        withheld_at = CASE WHEN restore_status = 'withheld' THEN restore_at ELSE NULL END,
        removed_at = CASE WHEN restore_status = 'removed' THEN restore_at ELSE NULL END,
        updated_at = now()
    WHERE id = review.id;
  END IF;

  PERFORM interaction.append_interaction_event(
    review.interaction_id,
    'appeal_decided',
    'operations',
    operator_identity_uuid,
    decision_reason_text,
    decision_policy_version,
    jsonb_build_object(
      'appealId', appeal.id,
      'decision', decision_status,
      'reasonCode', decision_code,
      'restoredStatus', CASE
        WHEN decision_status = 'denied' THEN COALESCE(appeal.appealed_from_status, 'withheld')
        ELSE NULL
      END
    )
  );

  RETURN appeal;
END;
$$;

CREATE OR REPLACE FUNCTION interaction.transition_complaint(
  complaint_uuid uuid,
  operator_identity_uuid uuid,
  target_status text,
  expected_revision integer,
  transition_reason text,
  transition_policy_version text
)
RETURNS interaction.complaints
LANGUAGE plpgsql
AS $$
DECLARE
  complaint interaction.complaints;
  previous_status text;
  next_sequence integer;
BEGIN
  IF NOT interaction.identity_has_global_permission(
    operator_identity_uuid,
    'operations.complaints.manage'
  ) THEN
    RAISE EXCEPTION 'Complaint transition actor is not authorized';
  END IF;

  SELECT * INTO complaint
  FROM interaction.complaints
  WHERE id = complaint_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Complaint not found';
  END IF;

  IF complaint.revision <> expected_revision THEN
    RAISE EXCEPTION 'Complaint revision conflict';
  END IF;

  IF NOT (
    (complaint.status = 'submitted' AND target_status IN ('triaged', 'resolved'))
    OR (complaint.status = 'triaged' AND target_status IN ('resolved', 'closed'))
    OR (complaint.status = 'resolved' AND target_status = 'closed')
  ) THEN
    RAISE EXCEPTION 'Complaint transition is not allowed';
  END IF;

  previous_status := complaint.status;

  SELECT COALESCE(max(sequence), 0) + 1 INTO next_sequence
  FROM interaction.complaint_events
  WHERE complaint_id = complaint_uuid;

  PERFORM set_config('direkt.complaint_transition', 'on', true);
  UPDATE interaction.complaints
  SET status = target_status,
      revision = revision + 1,
      updated_at = now(),
      terminal_at = CASE
        WHEN target_status IN ('resolved', 'closed') THEN COALESCE(terminal_at, now())
        ELSE NULL
      END
  WHERE id = complaint_uuid
  RETURNING * INTO complaint;

  INSERT INTO interaction.complaint_events (
    complaint_id,
    sequence,
    from_status,
    to_status,
    actor_kind,
    actor_identity_id,
    reason,
    policy_version
  ) VALUES (
    complaint_uuid,
    next_sequence,
    previous_status,
    target_status,
    'operations',
    operator_identity_uuid,
    transition_reason,
    transition_policy_version
  );

  RETURN complaint;
END;
$$;

CREATE TRIGGER enquiries_no_delete
BEFORE DELETE ON interaction.enquiries
FOR EACH ROW EXECUTE FUNCTION interaction.prevent_history_mutation();

CREATE TRIGGER tracked_interactions_no_delete
BEFORE DELETE ON interaction.tracked_interactions
FOR EACH ROW EXECUTE FUNCTION interaction.prevent_history_mutation();

CREATE TRIGGER contact_consents_no_delete
BEFORE DELETE ON interaction.contact_consents
FOR EACH ROW EXECUTE FUNCTION interaction.prevent_history_mutation();

CREATE TRIGGER contact_handoffs_no_delete
BEFORE DELETE ON interaction.contact_handoffs
FOR EACH ROW EXECUTE FUNCTION interaction.prevent_history_mutation();

CREATE TRIGGER reviews_no_delete
BEFORE DELETE ON interaction.reviews
FOR EACH ROW EXECUTE FUNCTION interaction.prevent_history_mutation();

CREATE TRIGGER provider_review_responses_immutable
BEFORE UPDATE OR DELETE ON interaction.provider_review_responses
FOR EACH ROW EXECUTE FUNCTION interaction.prevent_history_mutation();

CREATE TRIGGER review_appeals_no_delete
BEFORE DELETE ON interaction.review_appeals
FOR EACH ROW EXECUTE FUNCTION interaction.prevent_history_mutation();

CREATE TRIGGER review_reports_immutable
BEFORE UPDATE OR DELETE ON interaction.review_reports
FOR EACH ROW EXECUTE FUNCTION interaction.prevent_history_mutation();

CREATE TRIGGER complaints_no_delete
BEFORE DELETE ON interaction.complaints
FOR EACH ROW EXECUTE FUNCTION interaction.prevent_history_mutation();

COMMENT ON FUNCTION interaction.identity_has_global_permission(uuid, text) IS
  'Database boundary check used by operations review, appeal and complaint state machines.';
COMMENT ON COLUMN interaction.review_appeals.appealed_from_status IS
  'Original withheld or removed state restored when an appeal is denied.';
