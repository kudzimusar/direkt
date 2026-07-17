CREATE FUNCTION interaction.validate_tracked_interaction_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.enquiry_id <> OLD.enquiry_id
     OR NEW.customer_identity_id <> OLD.customer_identity_id
     OR NEW.publication_id <> OLD.publication_id
     OR NEW.provider_id <> OLD.provider_id
     OR NEW.category_id <> OLD.category_id
     OR NEW.policy_version <> OLD.policy_version
     OR NEW.started_at <> OLD.started_at
     OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Tracked interaction scope is immutable';
  END IF;
  IF (NEW.status, NEW.revision, NEW.completed_at, NEW.cancelled_at,
      NEW.review_eligible_from, NEW.review_eligible_until, NEW.updated_at)
     IS DISTINCT FROM
     (OLD.status, OLD.revision, OLD.completed_at, OLD.cancelled_at,
      OLD.review_eligible_from, OLD.review_eligible_until, OLD.updated_at)
     AND current_setting('direkt.tracked_transition', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Tracked interaction lifecycle is server controlled';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER tracked_interactions_validate_mutation
BEFORE UPDATE ON interaction.tracked_interactions
FOR EACH ROW EXECUTE FUNCTION interaction.validate_tracked_interaction_mutation();

CREATE FUNCTION interaction.validate_contact_consent_scope()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE tracked interaction.tracked_interactions; enquiry interaction.enquiries; contact account.contacts;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.interaction_id <> OLD.interaction_id OR NEW.enquiry_id <> OLD.enquiry_id
       OR NEW.customer_identity_id <> OLD.customer_identity_id OR NEW.provider_id <> OLD.provider_id
       OR NEW.contact_id <> OLD.contact_id OR NEW.channel <> OLD.channel
       OR NEW.contact_display_hint <> OLD.contact_display_hint OR NEW.policy_version <> OLD.policy_version
       OR NEW.idempotency_key_hash <> OLD.idempotency_key_hash
       OR NEW.request_fingerprint <> OLD.request_fingerprint
       OR NEW.consented_at <> OLD.consented_at OR NEW.expires_at <> OLD.expires_at THEN
      RAISE EXCEPTION 'Contact consent scope is immutable';
    END IF;
    IF (NEW.status, NEW.revoked_at) IS DISTINCT FROM (OLD.status, OLD.revoked_at)
       AND current_setting('direkt.handoff_revoke', true) IS DISTINCT FROM 'on' THEN
      RAISE EXCEPTION 'Contact consent revocation is server controlled';
    END IF;
    RETURN NEW;
  END IF;
  SELECT * INTO tracked FROM interaction.tracked_interactions WHERE id = NEW.interaction_id;
  SELECT * INTO enquiry FROM interaction.enquiries WHERE id = NEW.enquiry_id;
  SELECT * INTO contact FROM account.contacts WHERE id = NEW.contact_id;
  IF tracked.id IS NULL OR enquiry.id IS NULL OR contact.id IS NULL
     OR tracked.enquiry_id <> enquiry.id OR tracked.status <> 'active'
     OR enquiry.status <> 'accepted'
     OR NEW.customer_identity_id <> enquiry.customer_identity_id
     OR NEW.provider_id <> enquiry.provider_id
     OR NEW.interaction_id <> tracked.id
     OR contact.identity_id <> NEW.customer_identity_id
     OR contact.channel <> 'phone' OR contact.verified_at IS NULL
     OR NEW.contact_display_hint <> contact.display_hint THEN
    RAISE EXCEPTION 'Contact consent requires an accepted owned interaction and verified phone contact';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER contact_consents_validate_scope
BEFORE INSERT OR UPDATE ON interaction.contact_consents
FOR EACH ROW EXECUTE FUNCTION interaction.validate_contact_consent_scope();

CREATE FUNCTION interaction.validate_handoff_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.consent_id <> OLD.consent_id OR NEW.interaction_id <> OLD.interaction_id
     OR NEW.enquiry_id <> OLD.enquiry_id OR NEW.customer_identity_id <> OLD.customer_identity_id
     OR NEW.provider_id <> OLD.provider_id OR NEW.channel <> OLD.channel
     OR NEW.contact_display_hint <> OLD.contact_display_hint OR NEW.delivery_state <> OLD.delivery_state
     OR NEW.expires_at <> OLD.expires_at OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Contact handoff scope is immutable';
  END IF;
  IF (NEW.status, NEW.revoked_at) IS DISTINCT FROM (OLD.status, OLD.revoked_at)
     AND current_setting('direkt.handoff_revoke', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Contact handoff revocation is server controlled';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER contact_handoffs_validate_mutation
BEFORE UPDATE ON interaction.contact_handoffs
FOR EACH ROW EXECUTE FUNCTION interaction.validate_handoff_mutation();

CREATE FUNCTION interaction.validate_review_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.interaction_id <> OLD.interaction_id OR NEW.customer_identity_id <> OLD.customer_identity_id
     OR NEW.publication_id <> OLD.publication_id OR NEW.provider_id <> OLD.provider_id
     OR NEW.category_id <> OLD.category_id OR NEW.rating <> OLD.rating
     OR NEW.title <> OLD.title OR NEW.body <> OLD.body OR NEW.policy_version <> OLD.policy_version
     OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Review authorship and content are immutable';
  END IF;
  IF (NEW.moderation_status, NEW.revision, NEW.updated_at, NEW.published_at, NEW.withheld_at, NEW.removed_at)
     IS DISTINCT FROM
     (OLD.moderation_status, OLD.revision, OLD.updated_at, OLD.published_at, OLD.withheld_at, OLD.removed_at)
     AND current_setting('direkt.review_moderation', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Review moderation is server controlled';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER reviews_validate_mutation
BEFORE UPDATE ON interaction.reviews
FOR EACH ROW EXECUTE FUNCTION interaction.validate_review_mutation();

CREATE FUNCTION interaction.validate_appeal_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.review_id <> OLD.review_id OR NEW.appellant_scope <> OLD.appellant_scope
     OR NEW.appellant_identity_id <> OLD.appellant_identity_id
     OR NEW.provider_id IS DISTINCT FROM OLD.provider_id OR NEW.reason <> OLD.reason
     OR NEW.policy_version <> OLD.policy_version OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Review appeal scope and reason are immutable';
  END IF;
  IF (NEW.status, NEW.decided_at, NEW.decided_by_identity_id, NEW.decision_reason_code, NEW.decision_reason)
     IS DISTINCT FROM
     (OLD.status, OLD.decided_at, OLD.decided_by_identity_id, OLD.decision_reason_code, OLD.decision_reason)
     AND current_setting('direkt.appeal_decision', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Review appeal decisions are server controlled';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER review_appeals_validate_mutation
BEFORE UPDATE ON interaction.review_appeals
FOR EACH ROW EXECUTE FUNCTION interaction.validate_appeal_mutation();

CREATE FUNCTION interaction.validate_complaint_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.interaction_id <> OLD.interaction_id OR NEW.customer_identity_id <> OLD.customer_identity_id
     OR NEW.provider_id <> OLD.provider_id OR NEW.category_id <> OLD.category_id
     OR NEW.complaint_type <> OLD.complaint_type OR NEW.summary <> OLD.summary
     OR NEW.policy_version <> OLD.policy_version OR NEW.idempotency_key_hash <> OLD.idempotency_key_hash
     OR NEW.request_fingerprint <> OLD.request_fingerprint OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Complaint scope and submitted content are immutable';
  END IF;
  IF (NEW.status, NEW.revision, NEW.updated_at, NEW.terminal_at)
     IS DISTINCT FROM (OLD.status, OLD.revision, OLD.updated_at, OLD.terminal_at)
     AND current_setting('direkt.complaint_transition', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Complaint lifecycle is server controlled';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER complaints_validate_mutation
BEFORE UPDATE ON interaction.complaints
FOR EACH ROW EXECUTE FUNCTION interaction.validate_complaint_mutation();

COMMENT ON TABLE interaction.contact_consents IS
  'Channel-specific, expiring customer consent. Stores only verified contact reference and masked hint, never raw contact values.';
COMMENT ON TABLE interaction.contact_handoffs IS
  'Synthetic disabled-delivery handoff. No external call or message is attempted.';
COMMENT ON TABLE interaction.tracked_interactions IS
  'Accepted enquiry lifecycle used for contact consent, review eligibility and complaint linkage.';
COMMENT ON TABLE interaction.reviews IS
  'One bounded review per qualifying tracked interaction. Review state cannot alter verification, publication or ranking.';
COMMENT ON TABLE interaction.complaints IS
  'Customer complaints linked to owned interactions and intentionally separate from Phase 7 internal incidents.';
