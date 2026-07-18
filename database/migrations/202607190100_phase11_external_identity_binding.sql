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

CREATE TABLE account.pilot_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_hash character(64) NOT NULL,
  display_hint text NOT NULL,
  participant_type text NOT NULL,
  cohort_wave smallint NOT NULL,
  policy_version_id uuid NOT NULL REFERENCES account.policy_versions(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  created_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_identity_id uuid REFERENCES account.identities(id) ON DELETE RESTRICT,
  claimed_at timestamptz,
  revoked_at timestamptz,
  revocation_reason text,
  CONSTRAINT pilot_invitations_contact_hash_format CHECK (contact_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT pilot_invitations_display_hint_not_blank CHECK (length(btrim(display_hint)) BETWEEN 3 AND 120),
  CONSTRAINT pilot_invitations_participant_type_allowed CHECK (
    participant_type IN ('customer', 'provider')
  ),
  CONSTRAINT pilot_invitations_wave_valid CHECK (cohort_wave BETWEEN 1 AND 3),
  CONSTRAINT pilot_invitations_status_allowed CHECK (
    status IN ('pending', 'claimed', 'revoked', 'expired')
  ),
  CONSTRAINT pilot_invitations_expiry_after_creation CHECK (expires_at > created_at),
  CONSTRAINT pilot_invitations_state_consistent CHECK (
    (status = 'pending' AND claimed_identity_id IS NULL AND claimed_at IS NULL AND revoked_at IS NULL AND revocation_reason IS NULL)
    OR (status = 'claimed' AND claimed_identity_id IS NOT NULL AND claimed_at IS NOT NULL AND revoked_at IS NULL AND revocation_reason IS NULL)
    OR (status = 'revoked' AND claimed_identity_id IS NULL AND claimed_at IS NULL AND revoked_at IS NOT NULL AND length(btrim(revocation_reason)) >= 8)
    OR (status = 'expired' AND claimed_identity_id IS NULL AND claimed_at IS NULL AND revoked_at IS NULL AND revocation_reason IS NULL)
  )
);

CREATE UNIQUE INDEX pilot_invitations_pending_contact_unique_idx
  ON account.pilot_invitations (contact_hash)
  WHERE status = 'pending';
CREATE INDEX pilot_invitations_status_expiry_idx
  ON account.pilot_invitations (status, expires_at, cohort_wave);
CREATE INDEX pilot_invitations_claimed_identity_idx
  ON account.pilot_invitations (claimed_identity_id, claimed_at DESC)
  WHERE claimed_identity_id IS NOT NULL;

COMMENT ON TABLE account.pilot_invitations IS
  'Invite-only admission records for the bounded Phase 11 cohort. Contact identifiers are stored as server-HMAC digests plus masked display hints and each invite is bound to an approved canonical policy version.';

INSERT INTO authz.permissions (permission_key, description)
VALUES (
  'pilot.invitations.manage',
  'Create, list and revoke bounded controlled-pilot invitations without exposing raw contact identifiers.'
)
ON CONFLICT (permission_key) DO NOTHING;

INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM authz.roles AS roles
CROSS JOIN authz.permissions AS permissions
WHERE roles.role_key IN ('admin', 'support')
  AND permissions.permission_key = 'pilot.invitations.manage'
ON CONFLICT (role_id, permission_id) DO NOTHING;
