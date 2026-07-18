CREATE TABLE account.external_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE CASCADE,
  provider text NOT NULL,
  subject_hash character(64) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT external_identity_provider_supported CHECK (provider IN ('firebase')),
  CONSTRAINT external_identity_subject_hash_format CHECK (subject_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT external_identity_provider_subject_unique UNIQUE (provider, subject_hash),
  CONSTRAINT external_identity_provider_per_identity_unique UNIQUE (identity_id, provider)
);

CREATE INDEX external_identities_identity_idx
  ON account.external_identities (identity_id, provider);

COMMENT ON TABLE account.external_identities IS
  'Privacy-minimized bindings between DIREKT identities and approved external authentication subjects. Raw provider subject identifiers are never stored.';
COMMENT ON COLUMN account.external_identities.subject_hash IS
  'HMAC-SHA256 of provider and external subject using a server-only pepper; never a raw Firebase UID.';
