CREATE TABLE platform.communication_channel_opt_outs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id uuid REFERENCES account.identities(id) ON DELETE RESTRICT,
  contact_hash character(64) NOT NULL,
  channel text NOT NULL,
  source text NOT NULL,
  opted_out_at timestamptz NOT NULL DEFAULT now(),
  request_id uuid,
  CONSTRAINT communication_channel_opt_outs_hash_format
    CHECK (contact_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT communication_channel_opt_outs_channel_allowed
    CHECK (channel IN ('whatsapp')),
  CONSTRAINT communication_channel_opt_outs_source_not_blank
    CHECK (length(btrim(source)) BETWEEN 3 AND 80),
  UNIQUE (contact_hash, channel)
);

CREATE INDEX communication_channel_opt_outs_identity_idx
  ON platform.communication_channel_opt_outs (identity_id, channel, opted_out_at DESC)
  WHERE identity_id IS NOT NULL;

CREATE TABLE platform.whatsapp_message_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outbox_event_id uuid NOT NULL UNIQUE REFERENCES platform.outbox_events(id) ON DELETE RESTRICT,
  recipient_hash character(64) NOT NULL,
  template_key text NOT NULL,
  template_language text NOT NULL,
  provider_message_id text UNIQUE,
  status text NOT NULL DEFAULT 'queued',
  status_rank smallint NOT NULL DEFAULT 0,
  provider_status_at timestamptz,
  failure_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT whatsapp_message_deliveries_hash_format
    CHECK (recipient_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT whatsapp_message_deliveries_template_key_format
    CHECK (template_key ~ '^[a-z][a-z0-9_]{2,79}$'),
  CONSTRAINT whatsapp_message_deliveries_language_format
    CHECK (template_language ~ '^[a-z]{2,3}(_[A-Z]{2})?$'),
  CONSTRAINT whatsapp_message_deliveries_status_allowed
    CHECK (status IN ('queued', 'accepted', 'sent', 'delivered', 'read', 'failed')),
  CONSTRAINT whatsapp_message_deliveries_rank_valid CHECK (status_rank BETWEEN 0 AND 5),
  CONSTRAINT whatsapp_message_deliveries_failure_consistent CHECK (
    (status = 'failed' AND failure_code IS NOT NULL)
    OR (status <> 'failed')
  )
);

CREATE INDEX whatsapp_message_deliveries_status_idx
  ON platform.whatsapp_message_deliveries (status, updated_at DESC);

CREATE TABLE platform.whatsapp_delivery_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_message_id text NOT NULL,
  status text NOT NULL,
  status_rank smallint NOT NULL,
  provider_timestamp timestamptz NOT NULL,
  failure_code text,
  received_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT whatsapp_delivery_receipts_status_allowed
    CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  CONSTRAINT whatsapp_delivery_receipts_rank_valid CHECK (status_rank BETWEEN 1 AND 5),
  CONSTRAINT whatsapp_delivery_receipts_failure_consistent CHECK (
    (status = 'failed' AND failure_code IS NOT NULL)
    OR (status <> 'failed')
  ),
  UNIQUE (provider_message_id, status, provider_timestamp)
);

CREATE INDEX whatsapp_delivery_receipts_message_idx
  ON platform.whatsapp_delivery_receipts (provider_message_id, provider_timestamp DESC);
