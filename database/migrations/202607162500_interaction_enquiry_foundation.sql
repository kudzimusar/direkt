CREATE SCHEMA IF NOT EXISTS interaction;

INSERT INTO authz.permissions (permission_key, description) VALUES
  ('interaction.enquiry.create', 'Create a structured enquiry against an eligible public provider publication.'),
  ('interaction.enquiry.read_own', 'Read structured enquiries owned by the authenticated customer.'),
  ('interaction.enquiry.cancel_own', 'Cancel a non-terminal enquiry owned by the authenticated customer.'),
  ('interaction.handoff.create', 'Create a consent-scoped contact handoff for an owned accepted enquiry.'),
  ('interaction.review.create', 'Create a review from an owned qualifying tracked interaction.'),
  ('interaction.review.read_own', 'Read reviews and appeals owned by the authenticated customer.'),
  ('provider.enquiries.read', 'Read enquiries within the assigned provider scope.'),
  ('provider.reviews.respond', 'Respond to reviews within the assigned provider scope.'),
  ('operations.interactions.read', 'Read privacy-safe tracked interaction projections.'),
  ('operations.reviews.read', 'Read moderation-safe review and appeal projections.'),
  ('operations.reviews.manage', 'Moderate reviews and decide review appeals with an audit reason.')
ON CONFLICT (permission_key) DO NOTHING;

WITH grants(role_key, permission_key) AS (
  VALUES
    ('customer', 'interaction.enquiry.create'),
    ('customer', 'interaction.enquiry.read_own'),
    ('customer', 'interaction.enquiry.cancel_own'),
    ('customer', 'interaction.handoff.create'),
    ('customer', 'interaction.review.create'),
    ('customer', 'interaction.review.read_own'),
    ('provider_owner', 'provider.enquiries.read'),
    ('provider_owner', 'provider.enquiries.respond'),
    ('provider_owner', 'provider.reviews.respond'),
    ('provider_member', 'provider.enquiries.read'),
    ('provider_member', 'provider.enquiries.respond'),
    ('provider_member', 'provider.reviews.respond'),
    ('provider_responder', 'provider.enquiries.read'),
    ('provider_responder', 'provider.enquiries.respond'),
    ('provider_responder', 'provider.reviews.respond'),
    ('support', 'operations.interactions.read'),
    ('support', 'operations.reviews.read'),
    ('trust_supervisor', 'operations.interactions.read'),
    ('trust_supervisor', 'operations.reviews.read'),
    ('trust_supervisor', 'operations.reviews.manage'),
    ('auditor', 'operations.interactions.read'),
    ('auditor', 'operations.reviews.read'),
    ('admin', 'interaction.enquiry.create'),
    ('admin', 'interaction.enquiry.read_own'),
    ('admin', 'interaction.enquiry.cancel_own'),
    ('admin', 'interaction.handoff.create'),
    ('admin', 'interaction.review.create'),
    ('admin', 'interaction.review.read_own'),
    ('admin', 'provider.enquiries.read'),
    ('admin', 'provider.enquiries.respond'),
    ('admin', 'provider.reviews.respond'),
    ('admin', 'operations.interactions.read'),
    ('admin', 'operations.reviews.read'),
    ('admin', 'operations.reviews.manage')
)
INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM grants
JOIN authz.roles AS roles USING (role_key)
JOIN authz.permissions AS permissions USING (permission_key)
ON CONFLICT DO NOTHING;

CREATE TABLE interaction.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  publication_id uuid NOT NULL REFERENCES discovery.publications(id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  category_id uuid NOT NULL REFERENCES catalog.service_categories(id) ON DELETE RESTRICT,
  requirement_version_id uuid NOT NULL REFERENCES catalog.requirement_versions(id) ON DELETE RESTRICT,
  service_summary text NOT NULL,
  timing text NOT NULL,
  requested_for timestamptz,
  locality_summary text NOT NULL,
  preferred_channel text NOT NULL,
  status text NOT NULL DEFAULT 'received',
  revision integer NOT NULL DEFAULT 1,
  policy_version text NOT NULL,
  idempotency_key_hash character(64) NOT NULL,
  request_fingerprint character(64) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  terminal_at timestamptz,
  CONSTRAINT enquiries_service_summary_length CHECK (length(btrim(service_summary)) BETWEEN 20 AND 1000),
  CONSTRAINT enquiries_timing_allowed CHECK (timing IN ('urgent', 'within_week', 'flexible', 'scheduled')),
  CONSTRAINT enquiries_requested_for_consistent CHECK (
    (timing = 'scheduled' AND requested_for IS NOT NULL AND requested_for > created_at)
    OR (timing <> 'scheduled' AND requested_for IS NULL)
  ),
  CONSTRAINT enquiries_locality_length CHECK (length(btrim(locality_summary)) BETWEEN 3 AND 160),
  CONSTRAINT enquiries_preferred_channel_allowed CHECK (preferred_channel IN ('call', 'whatsapp', 'none')),
  CONSTRAINT enquiries_status_allowed CHECK (
    status IN ('received', 'acknowledged', 'needs_information', 'accepted', 'declined', 'closed', 'cancelled')
  ),
  CONSTRAINT enquiries_revision_positive CHECK (revision >= 1),
  CONSTRAINT enquiries_policy_version_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  CONSTRAINT enquiries_key_hash_format CHECK (idempotency_key_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT enquiries_request_fingerprint_format CHECK (request_fingerprint ~ '^[0-9a-f]{64}$'),
  CONSTRAINT enquiries_terminal_consistent CHECK (
    (status IN ('declined', 'closed', 'cancelled') AND terminal_at IS NOT NULL)
    OR (status NOT IN ('declined', 'closed', 'cancelled') AND terminal_at IS NULL)
  ),
  UNIQUE (customer_identity_id, idempotency_key_hash)
);

CREATE INDEX enquiries_customer_created_idx
  ON interaction.enquiries (customer_identity_id, created_at DESC);
CREATE INDEX enquiries_provider_status_idx
  ON interaction.enquiries (provider_id, status, updated_at DESC);
CREATE INDEX enquiries_publication_idx
  ON interaction.enquiries (publication_id, created_at DESC);

CREATE TABLE interaction.enquiry_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id uuid NOT NULL REFERENCES interaction.enquiries(id) ON DELETE RESTRICT,
  sequence integer NOT NULL,
  event_type text NOT NULL,
  from_status text,
  to_status text NOT NULL,
  actor_kind text NOT NULL,
  actor_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  reason text NOT NULL,
  policy_version text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT enquiry_events_sequence_positive CHECK (sequence >= 1),
  CONSTRAINT enquiry_events_type_allowed CHECK (event_type IN ('created', 'status_changed')),
  CONSTRAINT enquiry_events_actor_kind_allowed CHECK (actor_kind IN ('customer', 'provider', 'system')),
  CONSTRAINT enquiry_events_reason_length CHECK (length(btrim(reason)) BETWEEN 8 AND 500),
  CONSTRAINT enquiry_events_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  CONSTRAINT enquiry_events_metadata_object CHECK (jsonb_typeof(metadata) = 'object'),
  UNIQUE (enquiry_id, sequence)
);

CREATE INDEX enquiry_events_history_idx
  ON interaction.enquiry_events (enquiry_id, sequence);

CREATE FUNCTION interaction.prevent_history_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Interaction history is append-only';
END;
$$;

CREATE TRIGGER enquiry_events_immutable
BEFORE UPDATE OR DELETE ON interaction.enquiry_events
FOR EACH ROW
EXECUTE FUNCTION interaction.prevent_history_mutation();

CREATE FUNCTION interaction.validate_enquiry_scope()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  publication_scope record;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF (
      NEW.status <> OLD.status
      OR NEW.revision <> OLD.revision
      OR NEW.updated_at <> OLD.updated_at
      OR NEW.terminal_at IS DISTINCT FROM OLD.terminal_at
    ) AND current_setting('direkt.interaction_transition', true) IS DISTINCT FROM 'on' THEN
      RAISE EXCEPTION 'Enquiry lifecycle may only change through the transition function';
    END IF;

    IF NEW.customer_identity_id <> OLD.customer_identity_id
       OR NEW.publication_id <> OLD.publication_id
       OR NEW.provider_id <> OLD.provider_id
       OR NEW.category_id <> OLD.category_id
       OR NEW.requirement_version_id <> OLD.requirement_version_id
       OR NEW.service_summary <> OLD.service_summary
       OR NEW.timing <> OLD.timing
       OR NEW.requested_for IS DISTINCT FROM OLD.requested_for
       OR NEW.locality_summary <> OLD.locality_summary
       OR NEW.preferred_channel <> OLD.preferred_channel
       OR NEW.policy_version <> OLD.policy_version
       OR NEW.idempotency_key_hash <> OLD.idempotency_key_hash
       OR NEW.request_fingerprint <> OLD.request_fingerprint
       OR NEW.created_at <> OLD.created_at THEN
      RAISE EXCEPTION 'Enquiry scope and submitted brief are immutable';
    END IF;
    RETURN NEW;
  END IF;

  SELECT
    publications.provider_id,
    publications.category_id,
    publications.requirement_version_id
  INTO publication_scope
  FROM discovery.publications AS publications
  JOIN provider.organizations AS organizations
    ON organizations.id = publications.provider_id
   AND organizations.status = 'ready_for_verification'
  JOIN provider.category_selections AS selections
    ON selections.provider_id = publications.provider_id
   AND selections.category_id = publications.category_id
   AND selections.requirement_version_id = publications.requirement_version_id
   AND selections.status = 'selected'
  WHERE publications.id = NEW.publication_id
    AND publications.status = 'published'
    AND discovery.required_claims_current(
      publications.provider_id,
      publications.category_id,
      publications.requirement_version_id,
      now()
    );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Enquiries require a currently eligible public provider publication';
  END IF;

  IF NEW.provider_id <> publication_scope.provider_id
     OR NEW.category_id <> publication_scope.category_id
     OR NEW.requirement_version_id <> publication_scope.requirement_version_id THEN
    RAISE EXCEPTION 'Enquiry provider and category scope must match the public publication';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enquiries_validate_scope
BEFORE INSERT OR UPDATE ON interaction.enquiries
FOR EACH ROW
EXECUTE FUNCTION interaction.validate_enquiry_scope();

CREATE FUNCTION interaction.create_enquiry_event()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO interaction.enquiry_events (
    enquiry_id,
    sequence,
    event_type,
    from_status,
    to_status,
    actor_kind,
    actor_identity_id,
    reason,
    policy_version,
    metadata
  ) VALUES (
    NEW.id,
    1,
    'created',
    NULL,
    NEW.status,
    'customer',
    NEW.customer_identity_id,
    'Customer submitted a structured service enquiry.',
    NEW.policy_version,
    jsonb_build_object('preferredChannel', NEW.preferred_channel, 'structuredBrief', true)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER enquiries_create_history
AFTER INSERT ON interaction.enquiries
FOR EACH ROW
EXECUTE FUNCTION interaction.create_enquiry_event();

CREATE FUNCTION interaction.transition_enquiry(
  enquiry_uuid uuid,
  actor_identity_uuid uuid,
  actor_scope text,
  target_status text,
  expected_revision integer,
  transition_reason text,
  transition_policy_version text
)
RETURNS interaction.enquiries
LANGUAGE plpgsql
AS $$
DECLARE
  current_enquiry interaction.enquiries;
  previous_status text;
  provider_authorized boolean;
  next_sequence integer;
BEGIN
  SELECT * INTO current_enquiry
  FROM interaction.enquiries
  WHERE id = enquiry_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Enquiry not found';
  END IF;

  IF current_enquiry.revision <> expected_revision THEN
    RAISE EXCEPTION 'Enquiry revision conflict';
  END IF;

  IF actor_scope = 'customer' THEN
    IF current_enquiry.customer_identity_id <> actor_identity_uuid THEN
      RAISE EXCEPTION 'Enquiry not found';
    END IF;
    IF target_status <> 'cancelled'
       OR current_enquiry.status NOT IN ('received', 'acknowledged', 'needs_information', 'accepted') THEN
      RAISE EXCEPTION 'Customer enquiry transition is not allowed';
    END IF;
  ELSIF actor_scope = 'provider' THEN
    SELECT EXISTS (
      SELECT 1
      FROM authz.role_assignments AS assignments
      JOIN authz.roles AS roles ON roles.id = assignments.role_id
      WHERE assignments.identity_id = actor_identity_uuid
        AND assignments.scope_type = 'provider'
        AND assignments.provider_id = current_enquiry.provider_id
        AND assignments.revoked_at IS NULL
        AND assignments.starts_at <= now()
        AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
        AND roles.role_key IN ('provider_owner', 'provider_member', 'provider_responder')
    ) INTO provider_authorized;

    IF NOT provider_authorized THEN
      RAISE EXCEPTION 'Enquiry not found';
    END IF;

    IF NOT (
      (current_enquiry.status = 'received'
       AND target_status IN ('acknowledged', 'needs_information', 'accepted', 'declined'))
      OR (current_enquiry.status = 'acknowledged'
          AND target_status IN ('needs_information', 'accepted', 'declined'))
      OR (current_enquiry.status = 'needs_information'
          AND target_status IN ('acknowledged', 'accepted', 'declined'))
      OR (current_enquiry.status = 'accepted' AND target_status = 'closed')
    ) THEN
      RAISE EXCEPTION 'Provider enquiry transition is not allowed';
    END IF;
  ELSE
    RAISE EXCEPTION 'Unknown enquiry actor scope';
  END IF;

  previous_status := current_enquiry.status;

  SELECT COALESCE(max(sequence), 0) + 1 INTO next_sequence
  FROM interaction.enquiry_events
  WHERE enquiry_id = enquiry_uuid;

  PERFORM set_config('direkt.interaction_transition', 'on', true);

  UPDATE interaction.enquiries
  SET status = target_status,
      revision = revision + 1,
      updated_at = now(),
      terminal_at = CASE
        WHEN target_status IN ('declined', 'closed', 'cancelled') THEN now()
        ELSE NULL
      END
  WHERE id = enquiry_uuid
  RETURNING * INTO current_enquiry;

  INSERT INTO interaction.enquiry_events (
    enquiry_id,
    sequence,
    event_type,
    from_status,
    to_status,
    actor_kind,
    actor_identity_id,
    reason,
    policy_version,
    metadata
  ) VALUES (
    enquiry_uuid,
    next_sequence,
    'status_changed',
    previous_status,
    target_status,
    actor_scope,
    actor_identity_uuid,
    transition_reason,
    transition_policy_version,
    jsonb_build_object('expectedRevision', expected_revision, 'newRevision', current_enquiry.revision)
  );

  RETURN current_enquiry;
END;
$$;

COMMENT ON SCHEMA interaction IS
  'Tracked enquiries, consent-scoped handoff, interaction history, reviews and complaint linkage.';
COMMENT ON TABLE interaction.enquiries IS
  'Bounded structured service enquiries. This table is not a chat/message store.';
COMMENT ON TABLE interaction.enquiry_events IS
  'Append-only enquiry lifecycle history with actor, reason and policy version.';
