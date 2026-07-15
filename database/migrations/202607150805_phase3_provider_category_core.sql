CREATE SCHEMA IF NOT EXISTS provider;
CREATE SCHEMA IF NOT EXISTS catalog;

CREATE TABLE account.customer_profiles (
  identity_id uuid PRIMARY KEY REFERENCES account.identities(id) ON DELETE CASCADE,
  preferred_name text NOT NULL,
  locale text NOT NULL DEFAULT 'en-ZM',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by_identity_id uuid NOT NULL REFERENCES account.identities(id),
  CONSTRAINT customer_profiles_name_not_blank CHECK (length(btrim(preferred_name)) BETWEEN 2 AND 80),
  CONSTRAINT customer_profiles_locale_allowed CHECK (locale IN ('en-ZM', 'bem-ZM', 'nya-ZM'))
);

CREATE TRIGGER customer_profiles_touch_updated_at
BEFORE UPDATE ON account.customer_profiles
FOR EACH ROW EXECUTE FUNCTION account.touch_updated_at();

CREATE TABLE provider.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway text NOT NULL,
  created_by_identity_id uuid NOT NULL REFERENCES account.identities(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT provider_pathway_allowed CHECK (
    pathway IN ('registered_business', 'qualified_individual', 'experienced_informal')
  )
);

CREATE TABLE provider.profiles (
  provider_id uuid PRIMARY KEY REFERENCES provider.organizations(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  operating_model text NOT NULL,
  service_area_label text,
  premises_label text,
  description text NOT NULL DEFAULT '',
  profile_state text NOT NULL DEFAULT 'draft',
  discoverability_state text NOT NULL DEFAULT 'blocked',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by_identity_id uuid NOT NULL REFERENCES account.identities(id),
  CONSTRAINT provider_profiles_display_name_not_blank CHECK (length(btrim(display_name)) BETWEEN 2 AND 120),
  CONSTRAINT provider_operating_model_allowed CHECK (operating_model IN ('fixed', 'mobile', 'hybrid')),
  CONSTRAINT provider_profile_state_allowed CHECK (profile_state IN ('draft', 'complete', 'archived')),
  CONSTRAINT provider_discoverability_blocked_phase3 CHECK (discoverability_state = 'blocked'),
  CONSTRAINT provider_profile_version_positive CHECK (version > 0),
  CONSTRAINT provider_mobile_area_required CHECK (
    operating_model = 'fixed'
    OR (service_area_label IS NOT NULL AND length(btrim(service_area_label)) >= 2)
  ),
  CONSTRAINT provider_premises_required CHECK (
    operating_model = 'mobile'
    OR (premises_label IS NOT NULL AND length(btrim(premises_label)) >= 2)
  ),
  CONSTRAINT provider_description_bounded CHECK (length(description) <= 1200)
);

CREATE TRIGGER provider_profiles_touch_updated_at
BEFORE UPDATE ON provider.profiles
FOR EACH ROW EXECUTE FUNCTION account.touch_updated_at();

CREATE TABLE catalog.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_key text NOT NULL UNIQUE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_key_format CHECK (category_key ~ '^[a-z][a-z0-9_]{2,63}$'),
  CONSTRAINT categories_name_not_blank CHECK (length(btrim(name)) BETWEEN 2 AND 100),
  CONSTRAINT categories_status_allowed CHECK (status IN ('active', 'retired'))
);

CREATE TABLE catalog.category_requirement_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES catalog.categories(id) ON DELETE RESTRICT,
  version integer NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  requirements jsonb NOT NULL,
  created_by_identity_id uuid REFERENCES account.identities(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz,
  retired_at timestamptz,
  CONSTRAINT category_requirement_version_positive CHECK (version > 0),
  CONSTRAINT category_requirement_status_allowed CHECK (status IN ('draft', 'active', 'retired')),
  CONSTRAINT category_requirements_are_array CHECK (jsonb_typeof(requirements) = 'array'),
  CONSTRAINT category_requirement_activation_consistent CHECK (
    (status = 'draft' AND activated_at IS NULL AND retired_at IS NULL)
    OR (status = 'active' AND activated_at IS NOT NULL AND retired_at IS NULL)
    OR (status = 'retired' AND activated_at IS NOT NULL AND retired_at IS NOT NULL)
  ),
  UNIQUE (category_id, version),
  UNIQUE (id, category_id)
);

CREATE UNIQUE INDEX category_one_active_requirement_version_idx
  ON catalog.category_requirement_versions(category_id)
  WHERE status = 'active';

CREATE TABLE provider.profile_categories (
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES catalog.categories(id) ON DELETE RESTRICT,
  requirement_version_id uuid NOT NULL,
  selected_by_identity_id uuid NOT NULL REFERENCES account.identities(id),
  selected_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider_id, category_id),
  FOREIGN KEY (requirement_version_id, category_id)
    REFERENCES catalog.category_requirement_versions(id, category_id)
    ON DELETE RESTRICT
);

CREATE FUNCTION provider.validate_profile_state_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.profile_state = OLD.profile_state THEN
    RETURN NEW;
  END IF;

  IF OLD.profile_state = 'draft' AND NEW.profile_state IN ('complete', 'archived') THEN
    RETURN NEW;
  END IF;

  IF OLD.profile_state = 'complete' AND NEW.profile_state IN ('draft', 'archived') THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Invalid provider profile transition from % to %', OLD.profile_state, NEW.profile_state
    USING ERRCODE = 'check_violation';
END;
$$;

CREATE TRIGGER provider_profiles_validate_state_transition
BEFORE UPDATE OF profile_state ON provider.profiles
FOR EACH ROW EXECUTE FUNCTION provider.validate_profile_state_transition();

CREATE FUNCTION catalog.protect_activated_requirement_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.status IN ('active', 'retired') THEN
    RAISE EXCEPTION 'Activated category requirement versions are immutable'
      USING ERRCODE = 'check_violation';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IN ('active', 'retired') THEN
    IF NEW.category_id IS DISTINCT FROM OLD.category_id
      OR NEW.version IS DISTINCT FROM OLD.version
      OR NEW.requirements IS DISTINCT FROM OLD.requirements
      OR NEW.created_by_identity_id IS DISTINCT FROM OLD.created_by_identity_id
      OR NEW.created_at IS DISTINCT FROM OLD.created_at
      OR (OLD.status = 'retired' AND NEW IS DISTINCT FROM OLD)
    THEN
      RAISE EXCEPTION 'Activated category requirement versions are immutable'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER category_requirement_versions_immutable
BEFORE UPDATE OR DELETE ON catalog.category_requirement_versions
FOR EACH ROW EXECUTE FUNCTION catalog.protect_activated_requirement_version();

CREATE FUNCTION provider.audit_phase3_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  action_name text;
BEGIN
  action_name := CASE
    WHEN TG_OP = 'INSERT' THEN 'provider_profile_created'
    WHEN NEW.profile_state IS DISTINCT FROM OLD.profile_state THEN 'provider_profile_state_changed'
    ELSE 'provider_profile_updated'
  END;

  INSERT INTO platform.audit_events (
    actor_type, actor_id, action, resource_type, resource_id, outcome, metadata
  ) VALUES (
    'identity', NEW.updated_by_identity_id, action_name, 'provider_profile', NEW.provider_id, 'success',
    jsonb_build_object(
      'profileState', NEW.profile_state,
      'discoverabilityState', NEW.discoverability_state,
      'syntheticSchemaEvent', true
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER provider_profiles_audit
AFTER INSERT OR UPDATE ON provider.profiles
FOR EACH ROW EXECUTE FUNCTION provider.audit_phase3_change();

CREATE FUNCTION account.audit_customer_profile_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO platform.audit_events (
    actor_type, actor_id, action, resource_type, resource_id, outcome, metadata
  ) VALUES (
    'identity', NEW.updated_by_identity_id,
    CASE WHEN TG_OP = 'INSERT' THEN 'customer_profile_created' ELSE 'customer_profile_updated' END,
    'customer_profile', NEW.identity_id, 'success',
    jsonb_build_object('locale', NEW.locale, 'syntheticSchemaEvent', true)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER customer_profiles_audit
AFTER INSERT OR UPDATE ON account.customer_profiles
FOR EACH ROW EXECUTE FUNCTION account.audit_customer_profile_change();

INSERT INTO catalog.categories (category_key, name) VALUES
  ('plumbing', 'Plumbing'),
  ('electrical_repair', 'Electrical repair'),
  ('motor_vehicle_mechanics', 'Motor-vehicle mechanics'),
  ('appliance_electronics_repair', 'Appliance and electronics repair')
ON CONFLICT (category_key) DO NOTHING;

INSERT INTO catalog.category_requirement_versions (
  category_id, version, status, requirements, activated_at
)
SELECT
  id,
  1,
  'active',
  CASE category_key
    WHEN 'plumbing' THEN '[{"key":"identity","label":"Identity","kind":"identity"},{"key":"skills","label":"Relevant plumbing skills or qualification","kind":"qualification"}]'::jsonb
    WHEN 'electrical_repair' THEN '[{"key":"identity","label":"Identity","kind":"identity"},{"key":"skills","label":"Relevant electrical skills or qualification","kind":"qualification"}]'::jsonb
    WHEN 'motor_vehicle_mechanics' THEN '[{"key":"identity","label":"Identity","kind":"identity"},{"key":"work_history","label":"Relevant mechanical work history","kind":"experience"}]'::jsonb
    ELSE '[{"key":"identity","label":"Identity","kind":"identity"},{"key":"skills","label":"Relevant repair skills or work history","kind":"qualification_or_experience"}]'::jsonb
  END,
  now()
FROM catalog.categories
ON CONFLICT (category_id, version) DO NOTHING;

INSERT INTO authz.permissions (permission_key, description) VALUES
  ('account.profile.read', 'Read the authenticated identity customer profile.'),
  ('account.profile.manage', 'Create or update the authenticated identity customer profile.'),
  ('provider.profile.create', 'Create a non-public provider profile draft.'),
  ('provider.profile.read', 'Read a provider profile within an assigned provider scope.'),
  ('provider.profile.manage', 'Update a provider profile within an assigned provider scope.'),
  ('provider.representatives.manage', 'Assign provider representatives within an owned provider scope.'),
  ('provider.categories.manage', 'Select categories for an assigned provider profile.'),
  ('provider.profile.transition', 'Move an assigned provider profile through approved non-public states.'),
  ('catalog.categories.read', 'Read active categories and their active requirement versions.'),
  ('catalog.categories.manage', 'Create and activate versioned category requirements.')
ON CONFLICT (permission_key) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authz.roles r
JOIN authz.permissions p ON p.permission_key IN (
  'account.profile.read', 'account.profile.manage', 'provider.profile.create', 'catalog.categories.read'
)
WHERE r.role_key = 'customer'
ON CONFLICT DO NOTHING;

INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authz.roles r
JOIN authz.permissions p ON p.permission_key IN (
  'provider.profile.read', 'provider.profile.manage', 'provider.representatives.manage',
  'provider.categories.manage', 'provider.profile.transition', 'catalog.categories.read'
)
WHERE r.role_key = 'provider_owner'
ON CONFLICT DO NOTHING;

INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authz.roles r
JOIN authz.permissions p ON p.permission_key IN (
  'provider.profile.read', 'provider.profile.manage', 'provider.categories.manage', 'catalog.categories.read'
)
WHERE r.role_key IN ('provider_member', 'provider_responder')
ON CONFLICT DO NOTHING;

INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authz.roles r
JOIN authz.permissions p ON p.permission_key IN (
  'provider.profile.read', 'catalog.categories.read', 'catalog.categories.manage'
)
WHERE r.role_key IN ('trust_supervisor', 'admin')
ON CONFLICT DO NOTHING;
