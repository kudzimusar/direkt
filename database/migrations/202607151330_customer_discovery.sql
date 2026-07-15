CREATE SCHEMA IF NOT EXISTS discovery;

CREATE TABLE discovery.provider_locations (
  provider_id uuid PRIMARY KEY REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  private_base geography(Point, 4326),
  public_premises geography(Point, 4326),
  public_premises_consent boolean NOT NULL DEFAULT false,
  public_locality text NOT NULL,
  service_area geography(Polygon, 4326) NOT NULL,
  source text NOT NULL,
  confidence text NOT NULL,
  confirmed_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT discovery_location_locality_not_blank CHECK (
    length(btrim(public_locality)) BETWEEN 2 AND 160
  ),
  CONSTRAINT discovery_location_source_allowed CHECK (
    source IN ('provider_declared', 'public_premises', 'field_review', 'synthetic')
  ),
  CONSTRAINT discovery_location_confidence_allowed CHECK (
    confidence IN ('low', 'medium', 'high')
  ),
  CONSTRAINT discovery_public_premises_consent_consistent CHECK (
    (public_premises IS NULL AND public_premises_consent = false)
    OR (public_premises IS NOT NULL AND public_premises_consent = true)
  ),
  CONSTRAINT discovery_service_area_valid CHECK (
    ST_IsValid(service_area::geometry)
    AND NOT ST_IsEmpty(service_area::geometry)
  )
);

CREATE INDEX discovery_provider_locations_service_area_gix
  ON discovery.provider_locations USING gist (service_area);
CREATE INDEX discovery_provider_locations_public_premises_gix
  ON discovery.provider_locations USING gist (public_premises)
  WHERE public_premises IS NOT NULL;

CREATE TABLE discovery.provider_availability (
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  category_id uuid NOT NULL REFERENCES catalog.service_categories(id) ON DELETE RESTRICT,
  state text NOT NULL DEFAULT 'unknown',
  next_available_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider_id, category_id),
  CONSTRAINT discovery_availability_state_allowed CHECK (
    state IN ('available', 'limited', 'unavailable', 'unknown')
  ),
  CONSTRAINT discovery_availability_time_consistent CHECK (
    next_available_at IS NULL OR next_available_at > updated_at
  )
);

CREATE TABLE discovery.public_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  category_id uuid REFERENCES catalog.service_categories(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'approved',
  low_bandwidth_url text,
  standard_url text,
  alt_text text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT discovery_public_media_status_allowed CHECK (
    status IN ('approved', 'hidden', 'retired')
  ),
  CONSTRAINT discovery_public_media_url_consistent CHECK (
    low_bandwidth_url IS NOT NULL OR standard_url IS NOT NULL
  ),
  CONSTRAINT discovery_public_media_alt_not_blank CHECK (
    length(btrim(alt_text)) BETWEEN 4 AND 200
  ),
  CONSTRAINT discovery_public_media_sort_nonnegative CHECK (sort_order >= 0)
);

CREATE INDEX discovery_public_media_provider_idx
  ON discovery.public_media (provider_id, category_id, status, sort_order, created_at);

CREATE TABLE discovery.publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  category_id uuid NOT NULL REFERENCES catalog.service_categories(id) ON DELETE RESTRICT,
  requirement_version_id uuid NOT NULL REFERENCES catalog.requirement_versions(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'published',
  public_display_name text NOT NULL,
  operating_model text NOT NULL,
  public_locality text NOT NULL,
  public_premises geography(Point, 4326),
  service_area geography(Polygon, 4326) NOT NULL,
  policy_version text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  hidden_at timestamptz,
  refreshed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, category_id),
  CONSTRAINT discovery_publication_status_allowed CHECK (
    status IN ('published', 'hidden')
  ),
  CONSTRAINT discovery_publication_name_not_blank CHECK (
    length(btrim(public_display_name)) BETWEEN 2 AND 160
  ),
  CONSTRAINT discovery_publication_operating_model_allowed CHECK (
    operating_model IN ('fixed_premises', 'mobile', 'hybrid')
  ),
  CONSTRAINT discovery_publication_locality_not_blank CHECK (
    length(btrim(public_locality)) BETWEEN 2 AND 160
  ),
  CONSTRAINT discovery_publication_policy_not_blank CHECK (
    length(btrim(policy_version)) BETWEEN 3 AND 80
  ),
  CONSTRAINT discovery_publication_hidden_consistent CHECK (
    (status = 'published' AND hidden_at IS NULL)
    OR (status = 'hidden' AND hidden_at IS NOT NULL)
  ),
  CONSTRAINT discovery_publication_location_consistent CHECK (
    service_area IS NOT NULL
    AND (
      operating_model = 'mobile'
      OR public_premises IS NOT NULL
    )
  )
);

CREATE INDEX discovery_publications_status_category_idx
  ON discovery.publications (status, category_id, public_display_name, id);
CREATE INDEX discovery_publications_service_area_gix
  ON discovery.publications USING gist (service_area)
  WHERE status = 'published';
CREATE INDEX discovery_publications_public_premises_gix
  ON discovery.publications USING gist (public_premises)
  WHERE status = 'published' AND public_premises IS NOT NULL;

CREATE TABLE account.saved_public_providers (
  identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  publication_id uuid NOT NULL REFERENCES discovery.publications(id) ON DELETE RESTRICT,
  saved_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (identity_id, publication_id)
);

CREATE INDEX saved_public_providers_identity_time_idx
  ON account.saved_public_providers (identity_id, saved_at DESC);

CREATE FUNCTION discovery.guard_publication_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('direkt.discovery_policy', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Discovery publications may only change through the publication policy function';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Discovery publication history cannot be deleted';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER discovery_publications_guard
BEFORE INSERT OR UPDATE OR DELETE ON discovery.publications
FOR EACH ROW
EXECUTE FUNCTION discovery.guard_publication_mutation();

CREATE FUNCTION discovery.required_claims_current(
  p_provider_id uuid,
  p_category_id uuid,
  p_requirement_version_id uuid,
  p_as_of timestamptz DEFAULT now()
)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM catalog.requirements AS requirements
    WHERE requirements.requirement_version_id = p_requirement_version_id
      AND requirements.required = true
      AND NOT EXISTS (
        SELECT 1
        FROM verification.cases AS cases
        JOIN verification.claims AS claims ON claims.case_id = cases.id
        WHERE cases.provider_id = p_provider_id
          AND cases.category_id = p_category_id
          AND cases.requirement_version_id = p_requirement_version_id
          AND cases.requirement_id = requirements.id
          AND cases.status = 'approved'
          AND claims.status = 'active'
          AND claims.valid_until > p_as_of
      )
  );
$$;

CREATE FUNCTION discovery.refresh_publication(
  p_provider_id uuid,
  p_category_key text,
  p_policy_version text,
  p_as_of timestamptz DEFAULT now()
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  publication_id uuid;
  selected_category_id uuid;
  selected_requirement_version_id uuid;
  provider_status text;
  provider_name text;
  provider_operating_model text;
  location_record discovery.provider_locations;
BEGIN
  SELECT
    selections.category_id,
    selections.requirement_version_id,
    organizations.status,
    profiles.display_name,
    profiles.operating_model
  INTO
    selected_category_id,
    selected_requirement_version_id,
    provider_status,
    provider_name,
    provider_operating_model
  FROM provider.category_selections AS selections
  JOIN catalog.service_categories AS categories ON categories.id = selections.category_id
  JOIN provider.organizations AS organizations ON organizations.id = selections.provider_id
  JOIN provider.profiles AS profiles ON profiles.provider_id = selections.provider_id
  WHERE selections.provider_id = p_provider_id
    AND selections.status = 'selected'
    AND categories.category_key = p_category_key;

  IF selected_category_id IS NULL THEN
    RAISE EXCEPTION 'Selected provider category was not found';
  END IF;

  IF provider_status <> 'ready_for_verification' THEN
    RAISE EXCEPTION 'Only a provider ready for verification may be evaluated for publication';
  END IF;

  SELECT * INTO location_record
  FROM discovery.provider_locations
  WHERE provider_id = p_provider_id;

  IF location_record.provider_id IS NULL THEN
    RAISE EXCEPTION 'Publication requires a public-safe location and service area';
  END IF;

  IF provider_operating_model IN ('fixed_premises', 'hybrid')
     AND location_record.public_premises IS NULL THEN
    RAISE EXCEPTION 'Fixed or hybrid publication requires a consented public premises point';
  END IF;

  IF NOT discovery.required_claims_current(
    p_provider_id,
    selected_category_id,
    selected_requirement_version_id,
    p_as_of
  ) THEN
    RAISE EXCEPTION 'Publication requires current mandatory scoped claims';
  END IF;

  PERFORM set_config('direkt.discovery_policy', 'on', true);

  INSERT INTO discovery.publications (
    provider_id,
    category_id,
    requirement_version_id,
    status,
    public_display_name,
    operating_model,
    public_locality,
    public_premises,
    service_area,
    policy_version,
    published_at,
    hidden_at,
    refreshed_at
  ) VALUES (
    p_provider_id,
    selected_category_id,
    selected_requirement_version_id,
    'published',
    provider_name,
    provider_operating_model,
    location_record.public_locality,
    location_record.public_premises,
    location_record.service_area,
    p_policy_version,
    p_as_of,
    NULL,
    p_as_of
  )
  ON CONFLICT (provider_id, category_id) DO UPDATE
  SET requirement_version_id = EXCLUDED.requirement_version_id,
      status = 'published',
      public_display_name = EXCLUDED.public_display_name,
      operating_model = EXCLUDED.operating_model,
      public_locality = EXCLUDED.public_locality,
      public_premises = EXCLUDED.public_premises,
      service_area = EXCLUDED.service_area,
      policy_version = EXCLUDED.policy_version,
      hidden_at = NULL,
      refreshed_at = EXCLUDED.refreshed_at
  RETURNING id INTO publication_id;

  INSERT INTO platform.audit_events (
    actor_type,
    provider_id,
    action,
    resource_type,
    resource_id,
    outcome,
    metadata
  ) VALUES (
    'system',
    p_provider_id,
    'discovery_publication_refreshed',
    'discovery_publication',
    publication_id,
    'success',
    jsonb_build_object(
      'categoryKey', p_category_key,
      'policyVersion', p_policy_version,
      'containsPrivateLocation', false,
      'paymentInfluence', false
    )
  );

  RETURN publication_id;
END;
$$;

CREATE FUNCTION discovery.hide_publication(
  p_publication_id uuid,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  publication_provider_id uuid;
BEGIN
  IF length(btrim(p_reason)) < 12 THEN
    RAISE EXCEPTION 'Publication hide reason is too short';
  END IF;

  SELECT provider_id INTO publication_provider_id
  FROM discovery.publications
  WHERE id = p_publication_id
  FOR UPDATE;

  IF publication_provider_id IS NULL THEN
    RAISE EXCEPTION 'Discovery publication was not found';
  END IF;

  PERFORM set_config('direkt.discovery_policy', 'on', true);

  UPDATE discovery.publications
  SET status = 'hidden',
      hidden_at = now(),
      refreshed_at = now()
  WHERE id = p_publication_id;

  INSERT INTO platform.audit_events (
    actor_type,
    provider_id,
    action,
    resource_type,
    resource_id,
    outcome,
    metadata
  ) VALUES (
    'system',
    publication_provider_id,
    'discovery_publication_hidden',
    'discovery_publication',
    p_publication_id,
    'success',
    jsonb_build_object('reason', p_reason)
  );
END;
$$;

CREATE VIEW discovery.public_provider_cards AS
SELECT
  publications.id AS public_provider_id,
  categories.category_key,
  categories.name AS category_name,
  publications.public_display_name,
  publications.operating_model,
  publications.public_locality,
  CASE
    WHEN publications.public_premises IS NULL THEN NULL
    ELSE ST_Y(publications.public_premises::geometry)
  END AS public_latitude,
  CASE
    WHEN publications.public_premises IS NULL THEN NULL
    ELSE ST_X(publications.public_premises::geometry)
  END AS public_longitude,
  ST_AsGeoJSON(publications.service_area::geometry)::jsonb AS service_area_geojson,
  COALESCE(availability.state, 'unknown') AS availability_state,
  availability.next_available_at,
  media.low_bandwidth_url,
  media.standard_url,
  media.alt_text,
  publications.policy_version,
  publications.published_at,
  publications.refreshed_at
FROM discovery.publications AS publications
JOIN catalog.service_categories AS categories ON categories.id = publications.category_id
LEFT JOIN discovery.provider_availability AS availability
  ON availability.provider_id = publications.provider_id
 AND availability.category_id = publications.category_id
LEFT JOIN LATERAL (
  SELECT
    public_media.low_bandwidth_url,
    public_media.standard_url,
    public_media.alt_text
  FROM discovery.public_media
  WHERE public_media.provider_id = publications.provider_id
    AND (public_media.category_id IS NULL OR public_media.category_id = publications.category_id)
    AND public_media.status = 'approved'
  ORDER BY public_media.sort_order, public_media.created_at, public_media.id
  LIMIT 1
) AS media ON true
WHERE publications.status = 'published'
  AND discovery.required_claims_current(
    publications.provider_id,
    publications.category_id,
    publications.requirement_version_id,
    now()
  );

CREATE VIEW discovery.publication_eligibility AS
SELECT
  organizations.id AS provider_id,
  categories.category_key,
  profiles.display_name,
  profiles.operating_model,
  organizations.status AS provider_status,
  selections.status AS category_status,
  locations.public_locality,
  locations.public_premises IS NOT NULL AS has_public_premises,
  locations.service_area IS NOT NULL AS has_service_area,
  discovery.required_claims_current(
    organizations.id,
    categories.id,
    selections.requirement_version_id,
    now()
  ) AS mandatory_claims_current,
  publications.id AS public_provider_id,
  publications.status AS publication_status,
  publications.refreshed_at
FROM provider.organizations AS organizations
JOIN provider.profiles AS profiles ON profiles.provider_id = organizations.id
JOIN provider.category_selections AS selections ON selections.provider_id = organizations.id
JOIN catalog.service_categories AS categories ON categories.id = selections.category_id
LEFT JOIN discovery.provider_locations AS locations ON locations.provider_id = organizations.id
LEFT JOIN discovery.publications AS publications
  ON publications.provider_id = organizations.id
 AND publications.category_id = categories.id;

INSERT INTO authz.permissions (permission_key, description) VALUES
  ('discovery.publication.manage', 'Evaluate, refresh or hide public-safe provider discovery publication.'),
  ('discovery.publication.read', 'Read internal publication eligibility without private evidence or coordinates.'),
  ('discovery.saves.manage', 'Save and remove public provider discovery profiles for the authenticated identity.')
ON CONFLICT (permission_key) DO NOTHING;

WITH grants(role_key, permission_key) AS (
  VALUES
    ('customer', 'discovery.saves.manage'),
    ('reviewer', 'discovery.publication.read'),
    ('support', 'discovery.publication.read'),
    ('trust_supervisor', 'discovery.publication.manage'),
    ('trust_supervisor', 'discovery.publication.read'),
    ('auditor', 'discovery.publication.read'),
    ('admin', 'discovery.publication.manage'),
    ('admin', 'discovery.publication.read'),
    ('admin', 'discovery.saves.manage')
)
INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM grants
JOIN authz.roles AS roles USING (role_key)
JOIN authz.permissions AS permissions USING (permission_key)
ON CONFLICT DO NOTHING;

COMMENT ON SCHEMA discovery IS
  'Public-safe provider publication and customer search. Private evidence and exact private bases are excluded.';
COMMENT ON TABLE discovery.provider_locations IS
  'Separates private base, consented public premises and non-private service-area geometry.';
COMMENT ON VIEW discovery.public_provider_cards IS
  'Allowlisted public discovery projection; private base, evidence, reviewer and storage fields are absent.';
COMMENT ON VIEW discovery.publication_eligibility IS
  'Internal eligibility summary without private coordinates or evidence details.';
