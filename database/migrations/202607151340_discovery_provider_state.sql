CREATE OR REPLACE VIEW discovery.public_provider_cards AS
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
JOIN provider.organizations AS organizations ON organizations.id = publications.provider_id
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
  AND organizations.status = 'ready_for_verification'
  AND discovery.required_claims_current(
    publications.provider_id,
    publications.category_id,
    publications.requirement_version_id,
    now()
  );

COMMENT ON VIEW discovery.public_provider_cards IS
  'Allowlisted public discovery projection; inactive providers, private bases, evidence, reviewer and storage fields are absent.';
