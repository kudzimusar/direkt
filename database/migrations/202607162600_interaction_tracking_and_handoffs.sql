INSERT INTO authz.permissions (permission_key, description) VALUES
  ('interaction.report.create', 'Report a published review using a bounded reason and safe detail.'),
  ('interaction.complaint.create', 'Create a complaint linked to an owned tracked interaction.'),
  ('interaction.complaint.read_own', 'Read complaints owned by the authenticated customer.'),
  ('operations.complaints.read', 'Read privacy-safe customer complaint projections.'),
  ('operations.complaints.manage', 'Apply reasoned customer complaint lifecycle transitions.')
ON CONFLICT (permission_key) DO NOTHING;

WITH grants(role_key, permission_key) AS (
  VALUES
    ('customer', 'interaction.report.create'),
    ('customer', 'interaction.complaint.create'),
    ('customer', 'interaction.complaint.read_own'),
    ('support', 'operations.complaints.read'),
    ('support', 'operations.complaints.manage'),
    ('trust_supervisor', 'operations.complaints.read'),
    ('trust_supervisor', 'operations.complaints.manage'),
    ('auditor', 'operations.complaints.read'),
    ('admin', 'interaction.report.create'),
    ('admin', 'interaction.complaint.create'),
    ('admin', 'interaction.complaint.read_own'),
    ('admin', 'operations.complaints.read'),
    ('admin', 'operations.complaints.manage')
)
INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM grants
JOIN authz.roles AS roles USING (role_key)
JOIN authz.permissions AS permissions USING (permission_key)
ON CONFLICT DO NOTHING;

CREATE TABLE interaction.tracked_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id uuid NOT NULL UNIQUE REFERENCES interaction.enquiries(id) ON DELETE RESTRICT,
  customer_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  publication_id uuid NOT NULL REFERENCES discovery.publications(id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  category_id uuid NOT NULL REFERENCES catalog.service_categories(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active',
  revision integer NOT NULL DEFAULT 1,
  policy_version text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  cancelled_at timestamptz,
  review_eligible_from timestamptz,
  review_eligible_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tracked_interactions_status_allowed CHECK (status IN ('active', 'completed', 'cancelled')),
  CONSTRAINT tracked_interactions_revision_positive CHECK (revision >= 1),
  CONSTRAINT tracked_interactions_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  CONSTRAINT tracked_interactions_state_consistent CHECK (
    (status = 'active' AND completed_at IS NULL AND cancelled_at IS NULL
      AND review_eligible_from IS NULL AND review_eligible_until IS NULL)
    OR (status = 'completed' AND completed_at IS NOT NULL AND cancelled_at IS NULL
      AND review_eligible_from IS NOT NULL AND review_eligible_until > review_eligible_from)
    OR (status = 'cancelled' AND completed_at IS NULL AND cancelled_at IS NOT NULL
      AND review_eligible_from IS NULL AND review_eligible_until IS NULL)
  )
);

CREATE INDEX tracked_interactions_customer_idx
  ON interaction.tracked_interactions (customer_identity_id, updated_at DESC);
CREATE INDEX tracked_interactions_provider_idx
  ON interaction.tracked_interactions (provider_id, status, updated_at DESC);

CREATE TABLE interaction.interaction_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id uuid NOT NULL REFERENCES interaction.tracked_interactions(id) ON DELETE RESTRICT,
  sequence integer NOT NULL,
  event_type text NOT NULL,
  actor_kind text NOT NULL,
  actor_identity_id uuid REFERENCES account.identities(id) ON DELETE RESTRICT,
  reason text NOT NULL,
  policy_version text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT interaction_events_sequence_positive CHECK (sequence >= 1),
  CONSTRAINT interaction_events_type_allowed CHECK (
    event_type IN (
      'accepted', 'handoff_created', 'handoff_revoked', 'completed', 'cancelled',
      'review_submitted', 'provider_response_submitted', 'review_moderated',
      'appeal_submitted', 'appeal_decided', 'complaint_submitted', 'complaint_linked'
    )
  ),
  CONSTRAINT interaction_events_actor_allowed CHECK (actor_kind IN ('customer', 'provider', 'operations', 'system')),
  CONSTRAINT interaction_events_actor_consistent CHECK (
    (actor_kind = 'system' AND actor_identity_id IS NULL)
    OR (actor_kind <> 'system' AND actor_identity_id IS NOT NULL)
  ),
  CONSTRAINT interaction_events_reason_length CHECK (length(btrim(reason)) BETWEEN 8 AND 500),
  CONSTRAINT interaction_events_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  CONSTRAINT interaction_events_metadata_object CHECK (jsonb_typeof(metadata) = 'object'),
  UNIQUE (interaction_id, sequence)
);

CREATE INDEX interaction_events_history_idx
  ON interaction.interaction_events (interaction_id, sequence);

CREATE TRIGGER interaction_events_immutable
BEFORE UPDATE OR DELETE ON interaction.interaction_events
FOR EACH ROW EXECUTE FUNCTION interaction.prevent_history_mutation();

CREATE FUNCTION interaction.append_interaction_event(
  interaction_uuid uuid,
  event_name text,
  event_actor_kind text,
  event_actor_identity_id uuid,
  event_reason text,
  event_policy_version text,
  event_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS interaction.interaction_events
LANGUAGE plpgsql
AS $$
DECLARE
  next_sequence integer;
  inserted_event interaction.interaction_events;
BEGIN
  PERFORM 1 FROM interaction.tracked_interactions WHERE id = interaction_uuid FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tracked interaction not found';
  END IF;
  SELECT COALESCE(max(sequence), 0) + 1 INTO next_sequence
  FROM interaction.interaction_events WHERE interaction_id = interaction_uuid;
  INSERT INTO interaction.interaction_events (
    interaction_id, sequence, event_type, actor_kind, actor_identity_id,
    reason, policy_version, metadata
  ) VALUES (
    interaction_uuid, next_sequence, event_name, event_actor_kind, event_actor_identity_id,
    event_reason, event_policy_version, COALESCE(event_metadata, '{}'::jsonb)
  ) RETURNING * INTO inserted_event;
  RETURN inserted_event;
END;
$$;

CREATE FUNCTION interaction.sync_tracked_interaction_from_enquiry()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  tracked interaction.tracked_interactions;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
    INSERT INTO interaction.tracked_interactions (
      enquiry_id, customer_identity_id, publication_id, provider_id, category_id, policy_version
    ) VALUES (
      NEW.id, NEW.customer_identity_id, NEW.publication_id, NEW.provider_id, NEW.category_id, NEW.policy_version
    )
    ON CONFLICT (enquiry_id) DO NOTHING
    RETURNING * INTO tracked;
    IF tracked.id IS NOT NULL THEN
      PERFORM interaction.append_interaction_event(
        tracked.id, 'accepted', 'system', NULL,
        'Provider accepted the structured enquiry and opened a tracked interaction.',
        NEW.policy_version, jsonb_build_object('enquiryRevision', NEW.revision)
      );
    END IF;
  END IF;
  SELECT * INTO tracked FROM interaction.tracked_interactions WHERE enquiry_id = NEW.id FOR UPDATE;
  IF tracked.id IS NULL THEN RETURN NEW; END IF;
  IF NEW.status = 'closed' AND tracked.status = 'active' THEN
    PERFORM set_config('direkt.tracked_transition', 'on', true);
    UPDATE interaction.tracked_interactions
    SET status = 'completed', revision = revision + 1, completed_at = now(),
        review_eligible_from = now(), review_eligible_until = now() + interval '30 days',
        updated_at = now()
    WHERE id = tracked.id;
    PERFORM interaction.append_interaction_event(
      tracked.id, 'completed', 'system', NULL,
      'Provider closed the accepted enquiry and completed the tracked interaction.',
      NEW.policy_version, jsonb_build_object('reviewWindowDays', 30)
    );
  ELSIF NEW.status = 'cancelled' AND tracked.status = 'active' THEN
    PERFORM set_config('direkt.tracked_transition', 'on', true);
    UPDATE interaction.tracked_interactions
    SET status = 'cancelled', revision = revision + 1, cancelled_at = now(), updated_at = now()
    WHERE id = tracked.id;
    PERFORM interaction.append_interaction_event(
      tracked.id, 'cancelled', 'customer', NEW.customer_identity_id,
      'Customer cancelled the accepted enquiry and tracked interaction.',
      NEW.policy_version, '{}'::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enquiries_sync_tracked_interaction
AFTER UPDATE OF status ON interaction.enquiries
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION interaction.sync_tracked_interaction_from_enquiry();

CREATE TABLE interaction.contact_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id uuid NOT NULL REFERENCES interaction.tracked_interactions(id) ON DELETE RESTRICT,
  enquiry_id uuid NOT NULL REFERENCES interaction.enquiries(id) ON DELETE RESTRICT,
  customer_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  contact_id uuid NOT NULL REFERENCES account.contacts(id) ON DELETE RESTRICT,
  channel text NOT NULL,
  contact_display_hint text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  policy_version text NOT NULL,
  idempotency_key_hash character(64) NOT NULL,
  request_fingerprint character(64) NOT NULL,
  consented_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  CONSTRAINT contact_consents_channel_allowed CHECK (channel IN ('call', 'whatsapp')),
  CONSTRAINT contact_consents_hint_length CHECK (length(btrim(contact_display_hint)) BETWEEN 3 AND 120),
  CONSTRAINT contact_consents_status_allowed CHECK (status IN ('active', 'revoked')),
  CONSTRAINT contact_consents_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  CONSTRAINT contact_consents_key_hash_format CHECK (idempotency_key_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT contact_consents_fingerprint_format CHECK (request_fingerprint ~ '^[0-9a-f]{64}$'),
  CONSTRAINT contact_consents_expiry CHECK (expires_at > consented_at AND expires_at <= consented_at + interval '24 hours'),
  CONSTRAINT contact_consents_revocation_consistent CHECK (
    (status = 'active' AND revoked_at IS NULL) OR (status = 'revoked' AND revoked_at IS NOT NULL)
  ),
  UNIQUE (customer_identity_id, idempotency_key_hash)
);

CREATE INDEX contact_consents_interaction_idx
  ON interaction.contact_consents (interaction_id, channel, expires_at DESC);

ALTER TABLE interaction.contact_consents ADD CONSTRAINT contact_consents_no_overlap
EXCLUDE USING gist (
  interaction_id WITH =,
  channel WITH =,
  tstzrange(consented_at, expires_at, '[)') WITH &&
) WHERE (status = 'active');

CREATE TABLE interaction.contact_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_id uuid NOT NULL UNIQUE REFERENCES interaction.contact_consents(id) ON DELETE RESTRICT,
  interaction_id uuid NOT NULL REFERENCES interaction.tracked_interactions(id) ON DELETE RESTRICT,
  enquiry_id uuid NOT NULL REFERENCES interaction.enquiries(id) ON DELETE RESTRICT,
  customer_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  channel text NOT NULL,
  contact_display_hint text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  delivery_state text NOT NULL DEFAULT 'disabled',
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contact_handoffs_channel_allowed CHECK (channel IN ('call', 'whatsapp')),
  CONSTRAINT contact_handoffs_status_allowed CHECK (status IN ('active', 'revoked')),
  CONSTRAINT contact_handoffs_delivery_disabled CHECK (delivery_state = 'disabled'),
  CONSTRAINT contact_handoffs_hint_length CHECK (length(btrim(contact_display_hint)) BETWEEN 3 AND 120),
  CONSTRAINT contact_handoffs_revocation_consistent CHECK (
    (status = 'active' AND revoked_at IS NULL) OR (status = 'revoked' AND revoked_at IS NOT NULL)
  )
);

CREATE INDEX contact_handoffs_provider_idx
  ON interaction.contact_handoffs (provider_id, enquiry_id, expires_at DESC);

CREATE FUNCTION interaction.validate_contact_handoff_scope()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  consent interaction.contact_consents;
  tracked interaction.tracked_interactions;
  enquiry interaction.enquiries;
  contact account.contacts;
BEGIN
  SELECT * INTO consent FROM interaction.contact_consents WHERE id = NEW.consent_id;
  SELECT * INTO tracked FROM interaction.tracked_interactions WHERE id = NEW.interaction_id;
  SELECT * INTO enquiry FROM interaction.enquiries WHERE id = NEW.enquiry_id;
  SELECT * INTO contact FROM account.contacts WHERE id = consent.contact_id;
  IF consent.id IS NULL OR tracked.id IS NULL OR enquiry.id IS NULL OR contact.id IS NULL THEN
    RAISE EXCEPTION 'Contact handoff scope is incomplete';
  END IF;
  IF consent.interaction_id <> tracked.id OR consent.enquiry_id <> enquiry.id
     OR consent.customer_identity_id <> enquiry.customer_identity_id
     OR consent.provider_id <> enquiry.provider_id
     OR tracked.enquiry_id <> enquiry.id OR tracked.status <> 'active'
     OR enquiry.status <> 'accepted'
     OR contact.identity_id <> enquiry.customer_identity_id
     OR contact.channel <> 'phone' OR contact.verified_at IS NULL
     OR consent.status <> 'active' OR consent.expires_at <= now() THEN
    RAISE EXCEPTION 'Contact handoff requires accepted enquiry, active interaction and current verified consent';
  END IF;
  IF NEW.interaction_id <> consent.interaction_id OR NEW.enquiry_id <> consent.enquiry_id
     OR NEW.customer_identity_id <> consent.customer_identity_id
     OR NEW.provider_id <> consent.provider_id OR NEW.channel <> consent.channel
     OR NEW.contact_display_hint <> consent.contact_display_hint
     OR NEW.expires_at <> consent.expires_at THEN
    RAISE EXCEPTION 'Contact handoff must match its consent scope';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER contact_handoffs_validate_scope
BEFORE INSERT ON interaction.contact_handoffs
FOR EACH ROW EXECUTE FUNCTION interaction.validate_contact_handoff_scope();

CREATE FUNCTION interaction.revoke_contact_handoff(
  handoff_uuid uuid,
  customer_identity_uuid uuid,
  revocation_reason text,
  revocation_policy_version text
)
RETURNS interaction.contact_handoffs
LANGUAGE plpgsql
AS $$
DECLARE
  handoff interaction.contact_handoffs;
  consent interaction.contact_consents;
BEGIN
  SELECT * INTO handoff FROM interaction.contact_handoffs
  WHERE id = handoff_uuid AND customer_identity_id = customer_identity_uuid
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Contact handoff not found'; END IF;
  SELECT * INTO consent FROM interaction.contact_consents WHERE id = handoff.consent_id FOR UPDATE;
  IF handoff.status = 'revoked' THEN RETURN handoff; END IF;
  PERFORM set_config('direkt.handoff_revoke', 'on', true);
  UPDATE interaction.contact_consents SET status = 'revoked', revoked_at = now() WHERE id = consent.id;
  UPDATE interaction.contact_handoffs SET status = 'revoked', revoked_at = now()
  WHERE id = handoff.id RETURNING * INTO handoff;
  PERFORM interaction.append_interaction_event(
    handoff.interaction_id, 'handoff_revoked', 'customer', customer_identity_uuid,
    revocation_reason, revocation_policy_version,
    jsonb_build_object('channel', handoff.channel, 'rawContactIncluded', false)
  );
  RETURN handoff;
END;
$$;
