CREATE TABLE platform.push_device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id uuid REFERENCES account.identities(id) ON DELETE CASCADE,
  installation_id uuid NOT NULL,
  token text NOT NULL,
  token_hash character(64) NOT NULL,
  platform text NOT NULL DEFAULT 'android',
  data_classification text NOT NULL,
  app_version text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  invalidated_at timestamptz,
  CONSTRAINT push_token_not_blank CHECK (length(btrim(token)) BETWEEN 20 AND 4096),
  CONSTRAINT push_token_hash_shape CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT push_token_platform_allowed CHECK (platform = 'android'),
  CONSTRAINT push_token_classification_allowed CHECK (
    data_classification IN ('synthetic', 'controlled-pilot')
  ),
  CONSTRAINT push_token_identity_boundary CHECK (
    (data_classification = 'synthetic' AND identity_id IS NULL)
    OR (data_classification = 'controlled-pilot' AND identity_id IS NOT NULL)
  ),
  UNIQUE (token_hash),
  UNIQUE (identity_id, installation_id)
);

CREATE INDEX push_device_tokens_identity_active_idx
  ON platform.push_device_tokens (identity_id, updated_at DESC)
  WHERE invalidated_at IS NULL AND identity_id IS NOT NULL;

CREATE INDEX push_device_tokens_installation_active_idx
  ON platform.push_device_tokens (installation_id)
  WHERE invalidated_at IS NULL;

COMMENT ON TABLE platform.push_device_tokens IS
  'Server-only FCM registration tokens. Tokens are identity-bound outside bounded synthetic canaries and must never be logged or exposed through browser/client-direct data access.';
COMMENT ON COLUMN platform.push_device_tokens.token IS
  'Sensitive provider endpoint token used only by the backend FCM adapter. Never include in logs, audit metadata or API responses.';
