CREATE SCHEMA IF NOT EXISTS provider;
CREATE SCHEMA IF NOT EXISTS catalog;

CREATE TABLE account.customer_profiles (
  identity_id uuid PRIMARY KEY REFERENCES account.identities(id) ON DELETE RESTRICT,
  display_name text NOT NULL,
  profile_status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customer_profiles_display_name_not_blank CHECK (length(btrim(display_name)) BETWEEN 2 AND 120),
  CONSTRAINT customer_profiles_status_allowed CHECK (profile_status IN ('active', 'suspended', 'closed'))
);

CREATE TABLE provider.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway text NOT NULL,
  created_by_identity_id uuid NOT NULL REFERENCES account.identities(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'draft',
  discoverable boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT provider_organizations_pathway_allowed CHECK (
    pathway IN ('registered_business', 'qualified_individual', 'experienced_informal')
  ),
  CONSTRAINT provider_organizations_status_allowed CHECK (
    status IN ('draft', 'ready_for_verification', 'suspended', 'archived')
  ),
  CONSTRAINT provider_organizations_not_discoverable CHECK (discoverable = false)
);

CREATE TABLE provider.profiles (
  provider_id uuid PRIMARY KEY REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  display_name text NOT NULL,
  operating_model text NOT NULL,
  locality_summary text,
  service_area_summary text NOT NULL,
  registered_business_name text,
  qualification_summary text,
  experience_summary text,
  revision integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT provider_profiles_display_name_not_blank CHECK (length(btrim(display_name)) BETWEEN 2 AND 160),
  CONSTRAINT provider_profiles_operating_model_allowed CHECK (
    operating_model IN ('fixed_premises', 'mobile', 'hybrid')
  ),
  CONSTRAINT provider_profiles_service_area_not_blank CHECK (
    length(btrim(service_area_summary)) BETWEEN 2 AND 240
  ),
  CONSTRAINT provider_profiles_locality_required CHECK (
    operating_model = 'mobile'
    OR (locality_summary IS NOT NULL AND length(btrim(locality_summary)) BETWEEN 2 AND 160)
  ),
  CONSTRAINT provider_profiles_revision_positive CHECK (revision > 0)
);

CREATE FUNCTION provider.validate_profile_pathway()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  selected_pathway text;
BEGIN
  SELECT pathway INTO selected_pathway
  FROM provider.organizations
  WHERE id = NEW.provider_id;

  IF selected_pathway IS NULL THEN
    RAISE EXCEPTION 'Unknown provider organization';
  END IF;

  IF selected_pathway = 'registered_business'
     AND (NEW.registered_business_name IS NULL OR length(btrim(NEW.registered_business_name)) < 2) THEN
    RAISE EXCEPTION 'Registered-business pathway requires a registered business name';
  END IF;

  IF selected_pathway = 'qualified_individual'
     AND (NEW.qualification_summary IS NULL OR length(btrim(NEW.qualification_summary)) < 8) THEN
    RAISE EXCEPTION 'Qualified-individual pathway requires a qualification summary';
  END IF;

  IF selected_pathway = 'experienced_informal'
     AND (NEW.experience_summary IS NULL OR length(btrim(NEW.experience_summary)) < 8) THEN
    RAISE EXCEPTION 'Experienced-informal pathway requires an experience summary';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER provider_profiles_validate_pathway
BEFORE INSERT OR UPDATE OF registered_business_name, qualification_summary, experience_summary
ON provider.profiles
FOR EACH ROW
EXECUTE FUNCTION provider.validate_profile_pathway();

CREATE FUNCTION provider.validate_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'draft' AND NEW.status IN ('ready_for_verification', 'archived'))
    OR (OLD.status = 'ready_for_verification' AND NEW.status IN ('draft', 'suspended', 'archived'))
    OR (OLD.status = 'suspended' AND NEW.status IN ('draft', 'archived'))
  ) THEN
    RAISE EXCEPTION 'Invalid provider status transition from % to %', OLD.status, NEW.status;
  END IF;

  IF NEW.discoverable THEN
    RAISE EXCEPTION 'Phase 3 cannot make a provider discoverable';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER provider_organizations_validate_transition
BEFORE UPDATE OF status, discoverable ON provider.organizations
FOR EACH ROW
EXECUTE FUNCTION provider.validate_status_transition();

CREATE TABLE catalog.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT service_categories_key_format CHECK (category_key ~ '^[a-z][a-z0-9_]*$'),
  CONSTRAINT service_categories_name_not_blank CHECK (length(btrim(name)) BETWEEN 2 AND 100),
  CONSTRAINT service_categories_description_not_blank CHECK (length(btrim(description)) BETWEEN 8 AND 500),
  CONSTRAINT service_categories_status_allowed CHECK (status IN ('active', 'retired'))
);

CREATE TABLE catalog.requirement_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES catalog.service_categories(id) ON DELETE RESTRICT,
  version integer NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  effective_at timestamptz,
  retired_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT requirement_versions_version_positive CHECK (version > 0),
  CONSTRAINT requirement_versions_status_allowed CHECK (status IN ('draft', 'active', 'retired')),
  CONSTRAINT requirement_versions_activation_consistent CHECK (
    (status = 'draft' AND effective_at IS NULL AND retired_at IS NULL)
    OR (status = 'active' AND effective_at IS NOT NULL AND retired_at IS NULL)
    OR (status = 'retired' AND effective_at IS NOT NULL AND retired_at IS NOT NULL)
  ),
  UNIQUE (category_id, version)
);

CREATE UNIQUE INDEX requirement_versions_one_active_idx
  ON catalog.requirement_versions (category_id)
  WHERE status = 'active';

CREATE TABLE catalog.requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_version_id uuid NOT NULL REFERENCES catalog.requirement_versions(id) ON DELETE RESTRICT,
  requirement_key text NOT NULL,
  label text NOT NULL,
  requirement_kind text NOT NULL,
  required boolean NOT NULL DEFAULT true,
  guidance text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT requirements_key_format CHECK (requirement_key ~ '^[a-z][a-z0-9_]*$'),
  CONSTRAINT requirements_label_not_blank CHECK (length(btrim(label)) BETWEEN 2 AND 140),
  CONSTRAINT requirements_kind_allowed CHECK (
    requirement_kind IN ('identity', 'registration', 'qualification', 'experience', 'location', 'premises')
  ),
  CONSTRAINT requirements_guidance_not_blank CHECK (length(btrim(guidance)) BETWEEN 8 AND 500),
  UNIQUE (requirement_version_id, requirement_key)
);

CREATE FUNCTION catalog.reject_active_requirement_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  version_id uuid;
  version_status text;
BEGIN
  version_id := COALESCE(NEW.requirement_version_id, OLD.requirement_version_id);
  SELECT status INTO version_status
  FROM catalog.requirement_versions
  WHERE id = version_id;

  IF version_status IN ('active', 'retired') THEN
    RAISE EXCEPTION 'Requirements belonging to an activated version are immutable';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER requirements_reject_activated_mutation
BEFORE UPDATE OR DELETE ON catalog.requirements
FOR EACH ROW
EXECUTE FUNCTION catalog.reject_active_requirement_mutation();

CREATE FUNCTION catalog.validate_requirement_version_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    IF OLD.status <> 'draft' AND ROW(OLD.*) IS DISTINCT FROM ROW(NEW.*) THEN
      RAISE EXCEPTION 'Activated category requirement versions are immutable';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status = 'draft' AND NEW.status = 'active' THEN
    NEW.effective_at := COALESCE(NEW.effective_at, now());
    NEW.retired_at := NULL;
    RETURN NEW;
  END IF;

  IF OLD.status = 'active' AND NEW.status = 'retired' THEN
    NEW.retired_at := COALESCE(NEW.retired_at, now());
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Invalid requirement-version transition from % to %', OLD.status, NEW.status;
END;
$$;

CREATE TRIGGER requirement_versions_validate_transition
BEFORE UPDATE ON catalog.requirement_versions
FOR EACH ROW
EXECUTE FUNCTION catalog.validate_requirement_version_transition();

CREATE TABLE provider.category_selections (
  provider_id uuid NOT NULL REFERENCES provider.organizations(id) ON DELETE RESTRICT,
  category_id uuid NOT NULL REFERENCES catalog.service_categories(id) ON DELETE RESTRICT,
  requirement_version_id uuid NOT NULL REFERENCES catalog.requirement_versions(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'selected',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider_id, category_id),
  CONSTRAINT provider_category_selection_status_allowed CHECK (status IN ('selected', 'removed'))
);

CREATE FUNCTION provider.validate_category_selection_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  selected_category uuid;
  selected_status text;
BEGIN
  SELECT category_id, status INTO selected_category, selected_status
  FROM catalog.requirement_versions
  WHERE id = NEW.requirement_version_id;

  IF selected_category IS DISTINCT FROM NEW.category_id OR selected_status <> 'active' THEN
    RAISE EXCEPTION 'Provider category selection requires the active version for the selected category';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER provider_category_selections_validate_version
BEFORE INSERT OR UPDATE OF category_id, requirement_version_id, status
ON provider.category_selections
FOR EACH ROW
EXECUTE FUNCTION provider.validate_category_selection_version();

ALTER TABLE authz.role_assignments
  ADD CONSTRAINT role_assignments_provider_fk
  FOREIGN KEY (provider_id) REFERENCES provider.organizations(id) ON DELETE RESTRICT;

CREATE VIEW provider.public_directory AS
SELECT
  organizations.id AS provider_id,
  profiles.display_name,
  profiles.operating_model,
  profiles.service_area_summary
FROM provider.organizations AS organizations
JOIN provider.profiles AS profiles ON profiles.provider_id = organizations.id
WHERE organizations.discoverable = true;

CREATE FUNCTION provider.audit_domain_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  record_id uuid;
  provider_scope uuid;
  action_name text;
  resource_name text;
BEGIN
  IF TG_TABLE_NAME = 'organizations' THEN
    record_id := COALESCE(NEW.id, OLD.id);
    provider_scope := record_id;
    resource_name := 'provider_organization';
  ELSIF TG_TABLE_NAME = 'profiles' THEN
    record_id := COALESCE(NEW.provider_id, OLD.provider_id);
    provider_scope := record_id;
    resource_name := 'provider_profile';
  ELSE
    record_id := COALESCE(NEW.provider_id, OLD.provider_id);
    provider_scope := record_id;
    resource_name := 'provider_category_selection';
  END IF;

  action_name := CASE
    WHEN TG_OP = 'INSERT' THEN resource_name || '_created'
    WHEN TG_OP = 'DELETE' THEN resource_name || '_deleted'
    ELSE resource_name || '_changed'
  END;

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
    provider_scope,
    action_name,
    resource_name,
    record_id,
    'success',
    jsonb_build_object('phase', '3', 'syntheticSchemaEvent', true)
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER provider_organizations_audit
AFTER INSERT OR UPDATE OR DELETE ON provider.organizations
FOR EACH ROW EXECUTE FUNCTION provider.audit_domain_change();
CREATE TRIGGER provider_profiles_audit
AFTER INSERT OR UPDATE OR DELETE ON provider.profiles
FOR EACH ROW EXECUTE FUNCTION provider.audit_domain_change();
CREATE TRIGGER provider_category_selections_audit
AFTER INSERT OR UPDATE OR DELETE ON provider.category_selections
FOR EACH ROW EXECUTE FUNCTION provider.audit_domain_change();

INSERT INTO authz.permissions (permission_key, description) VALUES
  ('account.profile.manage', 'Create and update the authenticated identity customer profile.'),
  ('provider.profile.create', 'Create a non-public provider draft and become its provider owner.'),
  ('provider.profile.read', 'Read a provider draft within an assigned provider scope.'),
  ('provider.representatives.manage', 'Assign or revoke provider representatives within an owned provider scope.'),
  ('catalog.categories.read', 'Read active service categories and requirement versions.'),
  ('operations.providers.read', 'Read non-public provider drafts through the operations API.');

WITH grants(role_key, permission_key) AS (
  VALUES
    ('customer', 'account.profile.manage'),
    ('customer', 'provider.profile.create'),
    ('customer', 'catalog.categories.read'),
    ('provider_owner', 'provider.profile.read'),
    ('provider_owner', 'provider.representatives.manage'),
    ('provider_owner', 'catalog.categories.read'),
    ('provider_member', 'provider.profile.read'),
    ('provider_member', 'catalog.categories.read'),
    ('provider_responder', 'provider.profile.read'),
    ('provider_responder', 'catalog.categories.read'),
    ('reviewer', 'operations.providers.read'),
    ('support', 'operations.providers.read'),
    ('trust_supervisor', 'operations.providers.read'),
    ('auditor', 'operations.providers.read'),
    ('admin', 'provider.profile.create'),
    ('admin', 'provider.profile.read'),
    ('admin', 'provider.representatives.manage'),
    ('admin', 'catalog.categories.read'),
    ('admin', 'operations.providers.read')
)
INSERT INTO authz.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM grants
JOIN authz.roles AS roles USING (role_key)
JOIN authz.permissions AS permissions USING (permission_key);

INSERT INTO catalog.service_categories (id, category_key, name, description) VALUES
  ('00000000-0000-4000-8000-000000003001', 'plumbing', 'Plumbing', 'Installation, leak repair, drainage and water-system services.'),
  ('00000000-0000-4000-8000-000000003002', 'electrical_repairs', 'Electrical repairs', 'Domestic and small-business electrical diagnosis and repair services.'),
  ('00000000-0000-4000-8000-000000003003', 'mechanics', 'Mechanics', 'Vehicle diagnosis, maintenance and repair services.'),
  ('00000000-0000-4000-8000-000000003004', 'appliance_repairs', 'Appliance and electronics repair', 'Household appliance and small-electronics diagnosis and repair services.');

INSERT INTO catalog.requirement_versions (id, category_id, version, status, effective_at) VALUES
  ('00000000-0000-4000-8000-000000003101', '00000000-0000-4000-8000-000000003001', 1, 'active', now()),
  ('00000000-0000-4000-8000-000000003102', '00000000-0000-4000-8000-000000003002', 1, 'active', now()),
  ('00000000-0000-4000-8000-000000003103', '00000000-0000-4000-8000-000000003003', 1, 'active', now()),
  ('00000000-0000-4000-8000-000000003104', '00000000-0000-4000-8000-000000003004', 1, 'active', now());

INSERT INTO catalog.requirements (
  requirement_version_id,
  requirement_key,
  label,
  requirement_kind,
  required,
  guidance
) VALUES
  ('00000000-0000-4000-8000-000000003101', 'identity', 'Identity evidence', 'identity', true, 'Identity evidence will be defined and privately reviewed during Phase 4.'),
  ('00000000-0000-4000-8000-000000003101', 'service_experience', 'Plumbing experience or qualification', 'experience', true, 'Provide a qualification or structured experience record in the later evidence workflow.'),
  ('00000000-0000-4000-8000-000000003102', 'identity', 'Identity evidence', 'identity', true, 'Identity evidence will be defined and privately reviewed during Phase 4.'),
  ('00000000-0000-4000-8000-000000003102', 'technical_qualification', 'Electrical qualification', 'qualification', true, 'Provide an applicable technical qualification in the later evidence workflow.'),
  ('00000000-0000-4000-8000-000000003103', 'identity', 'Identity evidence', 'identity', true, 'Identity evidence will be defined and privately reviewed during Phase 4.'),
  ('00000000-0000-4000-8000-000000003103', 'workshop_or_mobile_model', 'Workshop or mobile operating model', 'location', true, 'Declare the operating model without publishing private location precision.'),
  ('00000000-0000-4000-8000-000000003104', 'identity', 'Identity evidence', 'identity', true, 'Identity evidence will be defined and privately reviewed during Phase 4.'),
  ('00000000-0000-4000-8000-000000003104', 'repair_experience', 'Repair experience or qualification', 'experience', true, 'Provide a qualification or structured experience record in the later evidence workflow.');

COMMENT ON SCHEMA provider IS
  'Non-public provider organizations, drafts, operating models and category selections. Phase 3 cannot publish providers.';
COMMENT ON SCHEMA catalog IS
  'Versioned service categories and immutable activated requirement definitions.';
COMMENT ON VIEW provider.public_directory IS
  'Reserved publication boundary. The Phase 3 discoverable=false constraint guarantees this view is empty.';