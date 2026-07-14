CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS platform;

CREATE TABLE platform.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  request_id uuid,
  actor_type text NOT NULL,
  actor_id uuid,
  provider_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  outcome text NOT NULL DEFAULT 'success',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT audit_actor_type_not_blank CHECK (length(btrim(actor_type)) > 0),
  CONSTRAINT audit_action_not_blank CHECK (length(btrim(action)) > 0),
  CONSTRAINT audit_resource_type_not_blank CHECK (length(btrim(resource_type)) > 0),
  CONSTRAINT audit_outcome_allowed CHECK (outcome IN ('success', 'denied', 'failed')),
  CONSTRAINT audit_metadata_object CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE INDEX audit_events_occurred_at_idx
  ON platform.audit_events (occurred_at DESC);
CREATE INDEX audit_events_provider_time_idx
  ON platform.audit_events (provider_id, occurred_at DESC)
  WHERE provider_id IS NOT NULL;
CREATE INDEX audit_events_request_idx
  ON platform.audit_events (request_id)
  WHERE request_id IS NOT NULL;

CREATE FUNCTION platform.reject_immutable_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'platform.audit_events is append-only';
END;
$$;

CREATE TRIGGER audit_events_immutable
BEFORE UPDATE OR DELETE ON platform.audit_events
FOR EACH ROW
EXECUTE FUNCTION platform.reject_immutable_mutation();

CREATE TABLE platform.outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  available_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id uuid,
  payload jsonb NOT NULL,
  headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  locked_at timestamptz,
  locked_by text,
  published_at timestamptz,
  last_error text,
  CONSTRAINT outbox_event_type_not_blank CHECK (length(btrim(event_type)) > 0),
  CONSTRAINT outbox_aggregate_type_not_blank CHECK (length(btrim(aggregate_type)) > 0),
  CONSTRAINT outbox_payload_object CHECK (jsonb_typeof(payload) = 'object'),
  CONSTRAINT outbox_headers_object CHECK (jsonb_typeof(headers) = 'object'),
  CONSTRAINT outbox_status_allowed CHECK (status IN ('pending', 'processing', 'published', 'failed')),
  CONSTRAINT outbox_attempts_nonnegative CHECK (attempts >= 0),
  CONSTRAINT outbox_published_state_consistent CHECK (
    (status = 'published' AND published_at IS NOT NULL)
    OR (status <> 'published' AND published_at IS NULL)
  )
);

CREATE INDEX outbox_pending_delivery_idx
  ON platform.outbox_events (available_at, occurred_at)
  WHERE status IN ('pending', 'failed');
CREATE INDEX outbox_aggregate_idx
  ON platform.outbox_events (aggregate_type, aggregate_id, occurred_at)
  WHERE aggregate_id IS NOT NULL;

CREATE TABLE platform.idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL,
  key_hash character(64) NOT NULL,
  request_fingerprint character(64) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  response_status integer,
  response_headers jsonb,
  response_body jsonb,
  CONSTRAINT idempotency_scope_not_blank CHECK (length(btrim(scope)) > 0),
  CONSTRAINT idempotency_expiry_after_creation CHECK (expires_at > created_at),
  CONSTRAINT idempotency_response_status_valid CHECK (
    response_status IS NULL OR response_status BETWEEN 100 AND 599
  ),
  CONSTRAINT idempotency_response_headers_object CHECK (
    response_headers IS NULL OR jsonb_typeof(response_headers) = 'object'
  ),
  CONSTRAINT idempotency_response_body_valid CHECK (
    response_body IS NULL OR jsonb_typeof(response_body) IN ('object', 'array', 'string', 'number', 'boolean', 'null')
  ),
  UNIQUE (scope, key_hash)
);

CREATE INDEX idempotency_expiry_idx
  ON platform.idempotency_keys (expires_at);

COMMENT ON SCHEMA platform IS
  'Cross-cutting infrastructure only; domain modules own their own schemas and contracts.';
COMMENT ON TABLE platform.audit_events IS
  'Append-only security and operational audit events. This table is not an analytics dump.';
COMMENT ON TABLE platform.outbox_events IS
  'Durable transactional event handoff for approved asynchronous processing.';
COMMENT ON TABLE platform.idempotency_keys IS
  'Request replay protection. Raw idempotency keys must never be stored.';
