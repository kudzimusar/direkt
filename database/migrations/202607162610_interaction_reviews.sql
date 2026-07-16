CREATE TABLE interaction.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id uuid NOT NULL UNIQUE REFERENCES interaction.tracked_interactions(id) ON DELETE RESTRICT,
  customer_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  publication_id uuid NOT NULL REFERENCES discovery.publications(id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  category_id uuid NOT NULL REFERENCES catalog.service_categories(id) ON DELETE RESTRICT,
  rating smallint NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  moderation_status text NOT NULL DEFAULT 'pending',
  revision integer NOT NULL DEFAULT 1,
  policy_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  withheld_at timestamptz,
  removed_at timestamptz,
  CONSTRAINT reviews_rating_range CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT reviews_title_length CHECK (length(btrim(title)) BETWEEN 5 AND 120),
  CONSTRAINT reviews_body_length CHECK (length(btrim(body)) BETWEEN 20 AND 2000),
  CONSTRAINT reviews_status_allowed CHECK (moderation_status IN ('pending', 'published', 'withheld', 'removed', 'appealed')),
  CONSTRAINT reviews_revision_positive CHECK (revision >= 1),
  CONSTRAINT reviews_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  CONSTRAINT reviews_state_dates CHECK (
    (moderation_status = 'published' AND published_at IS NOT NULL AND withheld_at IS NULL AND removed_at IS NULL)
    OR (moderation_status IN ('pending', 'appealed') AND published_at IS NULL AND withheld_at IS NULL AND removed_at IS NULL)
    OR (moderation_status = 'withheld' AND withheld_at IS NOT NULL AND removed_at IS NULL)
    OR (moderation_status = 'removed' AND removed_at IS NOT NULL)
  )
);

CREATE INDEX reviews_provider_status_idx ON interaction.reviews (provider_id, moderation_status, created_at DESC);
CREATE INDEX reviews_customer_idx ON interaction.reviews (customer_identity_id, created_at DESC);

CREATE TABLE interaction.provider_review_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL UNIQUE REFERENCES interaction.reviews(id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  responder_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  body text NOT NULL,
  policy_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT provider_review_response_body_length CHECK (length(btrim(body)) BETWEEN 10 AND 1000),
  CONSTRAINT provider_review_response_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80)
);

CREATE TABLE interaction.review_moderation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES interaction.reviews(id) ON DELETE RESTRICT,
  sequence integer NOT NULL,
  from_status text NOT NULL,
  to_status text NOT NULL,
  operator_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  reason_code text NOT NULL,
  reason text NOT NULL,
  policy_version text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT review_moderation_reason_code CHECK (reason_code ~ '^[A-Z][A-Z0-9_]{2,63}$'),
  CONSTRAINT review_moderation_reason_length CHECK (length(btrim(reason)) BETWEEN 12 AND 1000),
  UNIQUE (review_id, sequence)
);

CREATE TRIGGER review_moderation_events_immutable
BEFORE UPDATE OR DELETE ON interaction.review_moderation_events
FOR EACH ROW EXECUTE FUNCTION interaction.prevent_history_mutation();

CREATE TABLE interaction.review_appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES interaction.reviews(id) ON DELETE RESTRICT,
  appellant_scope text NOT NULL,
  appellant_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  provider_id uuid REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  policy_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  decided_by_identity_id uuid REFERENCES account.identities(id) ON DELETE RESTRICT,
  decision_reason_code text,
  decision_reason text,
  CONSTRAINT review_appeals_scope_allowed CHECK (appellant_scope IN ('customer', 'provider')),
  CONSTRAINT review_appeals_reason_length CHECK (length(btrim(reason)) BETWEEN 20 AND 1000),
  CONSTRAINT review_appeals_status_allowed CHECK (status IN ('submitted', 'upheld', 'denied')),
  CONSTRAINT review_appeals_policy_not_blank CHECK (length(btrim(policy_version)) BETWEEN 3 AND 80),
  CONSTRAINT review_appeals_decision_consistent CHECK (
    (status = 'submitted' AND decided_at IS NULL AND decided_by_identity_id IS NULL
      AND decision_reason_code IS NULL AND decision_reason IS NULL)
    OR (status IN ('upheld', 'denied') AND decided_at IS NOT NULL AND decided_by_identity_id IS NOT NULL
      AND decision_reason_code ~ '^[A-Z][A-Z0-9_]{2,63}$'
      AND length(btrim(decision_reason)) BETWEEN 12 AND 1000)
  )
);

CREATE UNIQUE INDEX review_appeals_one_open_scope
  ON interaction.review_appeals (review_id, appellant_scope)
  WHERE status = 'submitted';

CREATE TABLE interaction.review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES interaction.reviews(id) ON DELETE RESTRICT,
  reporter_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  reason_code text NOT NULL,
  detail text NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  CONSTRAINT review_reports_reason_allowed CHECK (reason_code IN ('SPAM', 'PRIVACY', 'ABUSE', 'FRAUD', 'OTHER')),
  CONSTRAINT review_reports_detail_length CHECK (length(btrim(detail)) BETWEEN 12 AND 1000),
  CONSTRAINT review_reports_status_allowed CHECK (status IN ('submitted', 'triaged', 'resolved')),
  UNIQUE (review_id, reporter_identity_id)
);
