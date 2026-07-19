import { createHash } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { runMigrations } from './migration-lib';
import { databaseUrl } from './runtime-config';

const POLICY_VERSION = 'synthetic-demo-v1';
const POLICY_KEY = 'pilot_participation_notice';
const POLICY_ID = '11000000-0000-4000-8000-000000000001';
const REVIEWER_ID = '11090000-0000-4000-8000-000000000001';
const CLAIM_VALID_UNTIL = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

interface CategoryConfig {
  key: string;
  name: string;
  categoryId: string;
  requirementVersionId: string;
  earlyWave: 1 | 2;
}

interface ProviderFixture {
  providerId: string;
  ownerIdentityId: string;
  publicProviderId: string;
  category: CategoryConfig;
  pathway: 'registered_business' | 'qualified_individual' | 'experienced_informal';
  wave: 1 | 2 | 3;
  locality: 'Kabwata Ward, Lusaka' | 'Chilenje Ward, Lusaka';
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'plumbing',
    name: 'Plumbing',
    categoryId: '00000000-0000-4000-8000-000000003001',
    requirementVersionId: '00000000-0000-4000-8000-000000003101',
    earlyWave: 1,
  },
  {
    key: 'mechanics',
    name: 'Mechanics',
    categoryId: '00000000-0000-4000-8000-000000003003',
    requirementVersionId: '00000000-0000-4000-8000-000000003103',
    earlyWave: 1,
  },
  {
    key: 'electrical_repairs',
    name: 'Electrical repairs',
    categoryId: '00000000-0000-4000-8000-000000003002',
    requirementVersionId: '00000000-0000-4000-8000-000000003102',
    earlyWave: 2,
  },
  {
    key: 'appliance_repairs',
    name: 'Appliance and electronics repair',
    categoryId: '00000000-0000-4000-8000-000000003004',
    requirementVersionId: '00000000-0000-4000-8000-000000003104',
    earlyWave: 2,
  },
];

const PATHWAYS: ProviderFixture['pathway'][] = [
  'registered_business',
  'registered_business',
  'qualified_individual',
  'experienced_informal',
  'qualified_individual',
  'experienced_informal',
];

function deterministicUuid(prefix: string, index: number): string {
  if (!/^[0-9a-f]{8}$/.test(prefix)) {
    throw new Error(`Invalid deterministic UUID prefix: ${prefix}`);
  }
  return `${prefix}-0000-4000-8000-${index.toString().padStart(12, '0')}`;
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function requireSyntheticActivation(): void {
  const dataMode = process.env.DIREKT_DATA_MODE;
  const activation = process.env.PHASE11_SYNTHETIC_PILOT_ACTIVATION;
  const pilotEntryApproved = process.env.PILOT_ENTRY_APPROVED;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Phase 11 synthetic pilot seeding is prohibited in NODE_ENV=production.');
  }
  if (dataMode !== 'synthetic-only') {
    throw new Error(
      'Phase 11 synthetic pilot seeding requires explicit DIREKT_DATA_MODE=synthetic-only.',
    );
  }
  if (pilotEntryApproved !== 'false') {
    throw new Error(
      'Phase 11 synthetic pilot seeding requires explicit PILOT_ENTRY_APPROVED=false.',
    );
  }
  if (activation !== 'true') {
    throw new Error(
      'Set PHASE11_SYNTHETIC_PILOT_ACTIVATION=true to seed the bounded synthetic cohort.',
    );
  }
}

async function assertCleanSyntheticTarget(client: PoolClient): Promise<void> {
  const counts = await client.query<{ identities: string; providers: string; enquiries: string }>(
    `SELECT
       (SELECT count(*) FROM account.identities)::text AS identities,
       (SELECT count(*) FROM provider.organizations)::text AS providers,
       (SELECT count(*) FROM interaction.enquiries)::text AS enquiries`,
  );
  const row = counts.rows[0];
  if (!row) {
    throw new Error('Unable to inspect the target database before synthetic activation.');
  }
  if (Number(row.identities) !== 0 || Number(row.providers) !== 0 || Number(row.enquiries) !== 0) {
    throw new Error(
      'Phase 11 synthetic activation requires an empty participant/provider/interaction target. Refusing to mix demo data with existing records.',
    );
  }
}

async function seedPolicy(client: PoolClient): Promise<void> {
  await client.query(
    `INSERT INTO account.policy_versions (
       id, policy_key, version, document_hash, published_at, effective_at
     ) VALUES ($1, $2, $3, $4, now(), now())`,
    [
      POLICY_ID,
      POLICY_KEY,
      POLICY_VERSION,
      sha256(
        'DIREKT Phase 11 synthetic demo participation notice — not approved for real participants',
      ),
    ],
  );
}

async function assignGlobalRole(
  client: PoolClient,
  identityId: string,
  roleKey: string,
  reason: string,
): Promise<void> {
  await client.query(
    `INSERT INTO authz.role_assignments (
       identity_id, role_id, scope_type, assigned_by_identity_id, reason
     )
     SELECT $1, id, 'global', $1, $3
     FROM authz.roles
     WHERE role_key = $2`,
    [identityId, roleKey, reason],
  );
}

async function seedReviewer(client: PoolClient): Promise<void> {
  await client.query('INSERT INTO account.identities (id) VALUES ($1)', [REVIEWER_ID]);
  await assignGlobalRole(
    client,
    REVIEWER_ID,
    'reviewer',
    'Independent synthetic reviewer for Phase 11 controlled-pilot simulation',
  );
  await client.query(
    `INSERT INTO platform.audit_events (
       actor_type, actor_id, action, resource_type, resource_id, outcome, metadata
     ) VALUES ('system', $1, 'phase11_synthetic_reviewer_seeded', 'phase11_synthetic_actor', $1, 'success', $2::jsonb)`,
    [
      REVIEWER_ID,
      JSON.stringify({ synthetic: true, evidenceClass: 'SYNTHETIC', role: 'reviewer' }),
    ],
  );
}

async function seedCustomers(client: PoolClient): Promise<string[]> {
  const customerIds: string[] = [];
  for (let index = 1; index <= 60; index += 1) {
    const identityId = deterministicUuid('11030000', index);
    const wave = (Math.floor((index - 1) / 20) + 1) as 1 | 2 | 3;
    const locality = index % 2 === 0 ? 'Chilenje Ward, Lusaka' : 'Kabwata Ward, Lusaka';
    const persona = [
      'standard',
      'location_denied',
      'low_bandwidth',
      'large_text',
      'restart_recovery',
    ][(index - 1) % 5];
    customerIds.push(identityId);
    await client.query('INSERT INTO account.identities (id) VALUES ($1)', [identityId]);
    await client.query(
      `INSERT INTO account.customer_profiles (identity_id, display_name)
       VALUES ($1, $2)`,
      [identityId, `P11 Demo Customer ${index.toString().padStart(3, '0')}`],
    );
    await assignGlobalRole(
      client,
      identityId,
      'customer',
      'Phase 11 synthetic controlled-pilot customer fixture',
    );
    await client.query(
      `INSERT INTO account.consents (identity_id, policy_version_id, status, source)
       VALUES ($1, $2, 'accepted', 'phase11-synthetic-seed')`,
      [identityId, POLICY_ID],
    );
    await client.query(
      `INSERT INTO platform.audit_events (
         actor_type, actor_id, action, resource_type, resource_id, outcome, metadata
       ) VALUES ('system', $1, 'phase11_synthetic_customer_seeded', 'phase11_synthetic_participant', $1, 'success', $2::jsonb)`,
      [
        identityId,
        JSON.stringify({
          synthetic: true,
          evidenceClass: 'SYNTHETIC',
          participantCode: `P11-DEMO-CUST-${index.toString().padStart(3, '0')}`,
          participantType: 'customer',
          wave,
          locality,
          persona,
          rawContactStored: false,
        }),
      ],
    );
  }
  return customerIds;
}

function providerWave(category: CategoryConfig, slot: number): 1 | 2 | 3 {
  return slot <= 4 ? category.earlyWave : 3;
}

function operatingModel(slot: number): 'mobile' | 'fixed_premises' | 'hybrid' {
  return (['mobile', 'fixed_premises', 'hybrid'] as const)[(slot - 1) % 3] ?? 'mobile';
}

async function seedProvider(
  client: PoolClient,
  category: CategoryConfig,
  categoryIndex: number,
  slot: number,
  globalIndex: number,
): Promise<ProviderFixture> {
  const ownerIdentityId = deterministicUuid('11010000', globalIndex);
  const providerId = deterministicUuid('11020000', globalIndex);
  const pathway = PATHWAYS[slot - 1];
  if (!pathway) {
    throw new Error(`Missing provider pathway for slot ${slot}.`);
  }
  const wave = providerWave(category, slot);
  const locality = globalIndex % 2 === 0 ? 'Chilenje Ward, Lusaka' : 'Kabwata Ward, Lusaka';
  const model = operatingModel(slot);
  const displayName = `P11 Demo ${category.name} ${slot.toString().padStart(2, '0')}`;

  await client.query('INSERT INTO account.identities (id) VALUES ($1)', [ownerIdentityId]);
  await client.query(
    `INSERT INTO account.consents (identity_id, policy_version_id, status, source)
     VALUES ($1, $2, 'accepted', 'phase11-synthetic-seed')`,
    [ownerIdentityId, POLICY_ID],
  );
  await client.query(
    `INSERT INTO provider.organizations (id, pathway, created_by_identity_id, status)
     VALUES ($1, $2, $3, 'ready_for_verification')`,
    [providerId, pathway, ownerIdentityId],
  );
  await client.query(
    `INSERT INTO provider.profiles (
       provider_id, display_name, operating_model, locality_summary, service_area_summary,
       registered_business_name, qualification_summary, experience_summary
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      providerId,
      displayName,
      model,
      locality,
      `${locality}; synthetic service area for ${category.name}`,
      pathway === 'registered_business' ? `${displayName} Limited (Synthetic)` : null,
      pathway === 'qualified_individual'
        ? 'Synthetic trade qualification fixture; no real credential or authority claim.'
        : null,
      pathway === 'experienced_informal'
        ? 'Synthetic experience fixture; no licence or qualification is implied.'
        : null,
    ],
  );
  await client.query(
    `INSERT INTO authz.role_assignments (
       identity_id, role_id, scope_type, provider_id, assigned_by_identity_id, reason
     )
     SELECT $1, id, 'provider', $2, $1, $3
     FROM authz.roles
     WHERE role_key = 'provider_owner'`,
    [ownerIdentityId, providerId, 'Phase 11 synthetic provider owner fixture'],
  );
  await client.query(
    `INSERT INTO provider.category_selections (provider_id, category_id, requirement_version_id)
     VALUES ($1, $2, $3)`,
    [providerId, category.categoryId, category.requirementVersionId],
  );

  const longitude = 28.3 + categoryIndex * 0.015 + slot * 0.001;
  const latitude = -15.46 + categoryIndex * 0.008 + slot * 0.001;
  const hasPublicPremises = model !== 'mobile';
  await client.query(
    `INSERT INTO discovery.provider_locations (
       provider_id, public_premises, public_premises_consent, public_locality,
       service_area, source, confidence, confirmed_at
     ) VALUES (
       $1,
       CASE WHEN $2::boolean THEN ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography ELSE NULL END,
       $2,
       $5,
       ST_GeogFromText('POLYGON((28.20 -15.60, 28.55 -15.60, 28.55 -15.25, 28.20 -15.25, 28.20 -15.60))'),
       'synthetic',
       'high',
       now()
     )`,
    [providerId, hasPublicPremises, longitude, latitude, locality],
  );
  await client.query(
    `INSERT INTO discovery.provider_availability (provider_id, category_id, state, next_available_at)
     VALUES ($1, $2, $3, $4)`,
    [
      providerId,
      category.categoryId,
      slot % 4 === 0 ? 'limited' : 'available',
      slot % 4 === 0 ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() : null,
    ],
  );

  const requirements = await client.query<{
    id: string;
    requirement_key: string;
    requirement_kind: string;
  }>(
    `SELECT id, requirement_key, requirement_kind
     FROM catalog.requirements
     WHERE requirement_version_id = $1
     ORDER BY requirement_key`,
    [category.requirementVersionId],
  );
  if (requirements.rows.length === 0) {
    throw new Error(`No active requirements found for ${category.key}.`);
  }

  for (const requirement of requirements.rows) {
    const lifecycleIndex = globalIndex * 10 + requirements.rows.indexOf(requirement) + 1;
    const caseId = deterministicUuid('11040000', lifecycleIndex);
    const uploadSessionId = deterministicUuid('11080000', lifecycleIndex);
    const evidenceId = deterministicUuid('11081000', lifecycleIndex);
    const evidenceVersionId = deterministicUuid('11082000', lifecycleIndex);
    const objectKey = `private/${providerId}/${uploadSessionId}/${evidenceVersionId}`;
    const evidenceSha256 = sha256(
      `phase11-synthetic-evidence:${providerId}:${requirement.requirement_key}`,
    );
    const documentType = `${requirement.requirement_key}_fixture`;

    await client.query(
      `INSERT INTO verification.cases (
       id, provider_id, category_id, requirement_version_id, requirement_id,
       check_key, check_family, policy_version, created_by_identity_id
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        caseId,
        providerId,
        category.categoryId,
        category.requirementVersionId,
        requirement.id,
        `${requirement.requirement_key}_check`,
        requirement.requirement_kind === 'identity'
          ? 'representative_identity'
          : 'category_eligibility',
        POLICY_VERSION,
        ownerIdentityId,
      ],
    );
    await client.query(
      `UPDATE verification.cases
     SET status = 'awaiting_evidence'
     WHERE id = $1 AND status = 'draft'`,
      [caseId],
    );

    await client.query(
      `INSERT INTO evidence.upload_sessions (
       id, provider_id, requirement_id, created_by_identity_id, evidence_class,
       document_type, object_key, expected_content_type, max_bytes,
       consent_confirmed, status, expires_at, completed_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, 'application/pdf', 4096,
       true, 'completed', now() + interval '1 hour', now()
     )`,
      [
        uploadSessionId,
        providerId,
        requirement.id,
        ownerIdentityId,
        requirement.requirement_kind,
        documentType,
        objectKey,
      ],
    );
    await client.query(
      `INSERT INTO evidence.items (
       id, provider_id, requirement_id, submitted_by_identity_id, status, retention_class
     ) VALUES ($1, $2, $3, $4, 'processing', 'short')`,
      [evidenceId, providerId, requirement.id, ownerIdentityId],
    );
    await client.query(
      `INSERT INTO evidence.versions (
       id, evidence_id, version_number, upload_session_id, object_key, evidence_class,
       document_type, content_type, size_bytes, sha256, processing_status,
       submitted_by_identity_id
     ) VALUES (
       $1, $2, 1, $3, $4, $5, $6, 'application/pdf', 2048, $7, 'clean', $8
     )`,
      [
        evidenceVersionId,
        evidenceId,
        uploadSessionId,
        objectKey,
        requirement.requirement_kind,
        documentType,
        evidenceSha256,
        ownerIdentityId,
      ],
    );
    await client.query(
      `UPDATE evidence.items
     SET current_version_id = $2, status = 'ready_for_review'
     WHERE id = $1 AND status = 'processing'`,
      [evidenceId, evidenceVersionId],
    );
    await client.query(
      `INSERT INTO verification.case_evidence (case_id, evidence_id, linked_by_identity_id)
     VALUES ($1, $2, $3)`,
      [caseId, evidenceId, ownerIdentityId],
    );
    await client.query(
      `UPDATE verification.cases
     SET status = 'ready_for_review'
     WHERE id = $1 AND status = 'awaiting_evidence'`,
      [caseId],
    );
    await client.query(
      `INSERT INTO verification.assignments (
       case_id, assignee_identity_id, assignment_kind, assigned_by_identity_id, reason
     ) VALUES ($1, $2, 'reviewer', $2, $3)`,
      [caseId, REVIEWER_ID, 'Independent Phase 11 synthetic review assignment'],
    );
    await client.query(
      `UPDATE verification.cases
     SET status = 'assigned'
     WHERE id = $1 AND status = 'ready_for_review'`,
      [caseId],
    );
    await client.query(
      `UPDATE verification.cases
     SET status = 'in_review'
     WHERE id = $1 AND status = 'assigned'`,
      [caseId],
    );
    await client.query(
      `INSERT INTO verification.recommendations (
       case_id, reviewer_identity_id, result, reason_code, rationale,
       limitation, recommended_valid_until
     ) VALUES ($1, $2, 'approve', 'CHECK_PASSED', $3, $4, $5)`,
      [
        caseId,
        REVIEWER_ID,
        `Synthetic reviewer recommendation for ${requirement.requirement_key}; functional validation only.`,
        'Synthetic-only evidence fixture; no real-world competence, licence, identity or field-visit guarantee.',
        CLAIM_VALID_UNTIL,
      ],
    );
    await client.query(
      `SELECT verification.record_decision(
       $1, $2, 'approved', 'CHECK_PASSED', $3, $4, $5, $6, $7, $8
     )`,
      [
        caseId,
        REVIEWER_ID,
        `Synthetic scoped ${requirement.requirement_key} check passed for functional validation only.`,
        `${requirement.requirement_key}_checked`,
        `${requirement.requirement_key.replaceAll('_', ' ')} checked in synthetic demo`,
        'Synthetic functional evidence only; this is not a real-world guarantee, licence or participant finding.',
        CLAIM_VALID_UNTIL,
        POLICY_VERSION,
      ],
    );
  }

  const publication = await client.query<{ publication_id: string }>(
    `SELECT discovery.refresh_publication($1, $2, $3, now()) AS publication_id`,
    [providerId, category.key, POLICY_VERSION],
  );
  const publicProviderId = publication.rows[0]?.publication_id;
  if (!publicProviderId) {
    throw new Error(`Synthetic publication was not created for ${displayName}.`);
  }

  await client.query(
    `INSERT INTO platform.audit_events (
       actor_type, actor_id, provider_id, action, resource_type, resource_id, outcome, metadata
     ) VALUES ('system', $1, $2, 'phase11_synthetic_provider_seeded', 'phase11_synthetic_participant', $2, 'success', $3::jsonb)`,
    [
      ownerIdentityId,
      providerId,
      JSON.stringify({
        synthetic: true,
        evidenceClass: 'SYNTHETIC',
        participantCode: `P11-DEMO-PROV-${globalIndex.toString().padStart(3, '0')}`,
        participantType: 'provider',
        category: category.key,
        pathway,
        wave,
        locality,
        operatingModel: model,
        rawContactStored: false,
        fieldVisitedClaim: false,
      }),
    ],
  );

  return { providerId, ownerIdentityId, publicProviderId, category, pathway, wave, locality };
}

async function seedProviders(client: PoolClient): Promise<ProviderFixture[]> {
  const providers: ProviderFixture[] = [];
  let globalIndex = 0;
  for (const [categoryIndex, category] of CATEGORIES.entries()) {
    for (let slot = 1; slot <= 6; slot += 1) {
      globalIndex += 1;
      providers.push(await seedProvider(client, category, categoryIndex, slot, globalIndex));
    }
  }
  return providers;
}

async function seedInteractions(
  client: PoolClient,
  customerIds: string[],
  providers: ProviderFixture[],
): Promise<void> {
  for (let index = 0; index < customerIds.length; index += 1) {
    const customerId = customerIds[index];
    const provider = providers[index % providers.length];
    if (!customerId || !provider) {
      throw new Error('Synthetic interaction fixture mapping failed.');
    }
    const enquiryId = deterministicUuid('11050000', index + 1);
    const keyHash = sha256(`phase11-enquiry-key-${index + 1}`);
    const fingerprint = sha256(
      JSON.stringify({ customerId, publicProviderId: provider.publicProviderId, index: index + 1 }),
    );
    await client.query(
      `INSERT INTO interaction.enquiries (
         id, customer_identity_id, publication_id, provider_id, category_id,
         requirement_version_id, service_summary, timing, locality_summary,
         preferred_channel, policy_version, idempotency_key_hash, request_fingerprint
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'within_week', $8, 'none', $9, $10, $11)`,
      [
        enquiryId,
        customerId,
        provider.publicProviderId,
        provider.providerId,
        provider.category.categoryId,
        provider.category.requirementVersionId,
        `Synthetic Phase 11 service enquiry ${index + 1} exercises the tracked accountability workflow without real contact handoff.`,
        provider.locality,
        POLICY_VERSION,
        keyHash,
        fingerprint,
      ],
    );

    if (index < 36) {
      await transitionEnquiry(
        client,
        enquiryId,
        provider.ownerIdentityId,
        'acknowledged',
        1,
        index,
      );
      await transitionEnquiry(client, enquiryId, provider.ownerIdentityId, 'accepted', 2, index);
      await transitionEnquiry(client, enquiryId, provider.ownerIdentityId, 'closed', 3, index);
    } else if (index < 48) {
      await transitionEnquiry(
        client,
        enquiryId,
        provider.ownerIdentityId,
        'acknowledged',
        1,
        index,
      );
      await transitionEnquiry(client, enquiryId, provider.ownerIdentityId, 'accepted', 2, index);
    } else if (index < 54) {
      await transitionEnquiry(client, enquiryId, provider.ownerIdentityId, 'declined', 1, index);
    }
  }

  const completed = await client.query<{
    interaction_id: string;
    enquiry_id: string;
    customer_identity_id: string;
    publication_id: string;
    provider_id: string;
    category_id: string;
  }>(
    `SELECT id AS interaction_id, enquiry_id, customer_identity_id, publication_id, provider_id, category_id
     FROM interaction.tracked_interactions
     WHERE status = 'completed'
     ORDER BY enquiry_id
     LIMIT 24`,
  );

  for (const [index, interaction] of completed.rows.entries()) {
    await client.query(
      `INSERT INTO interaction.reviews (
         id, interaction_id, customer_identity_id, publication_id, provider_id, category_id,
         rating, title, body, moderation_status, policy_version
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10)`,
      [
        deterministicUuid('11060000', index + 1),
        interaction.interaction_id,
        interaction.customer_identity_id,
        interaction.publication_id,
        interaction.provider_id,
        interaction.category_id,
        (index % 5) + 1,
        `Synthetic review ${index + 1}`,
        `This synthetic review ${index + 1} validates review eligibility and moderation without representing a real customer opinion.`,
        POLICY_VERSION,
      ],
    );
    if (index < 6) {
      await client.query(
        `INSERT INTO interaction.complaints (
           id, interaction_id, customer_identity_id, provider_id, category_id,
           complaint_type, summary, policy_version, idempotency_key_hash, request_fingerprint
         ) VALUES ($1, $2, $3, $4, $5, 'other', $6, $7, $8, $9)`,
        [
          deterministicUuid('11070000', index + 1),
          interaction.interaction_id,
          interaction.customer_identity_id,
          interaction.provider_id,
          interaction.category_id,
          `Synthetic complaint ${index + 1} validates complaint intake and escalation routing without alleging real misconduct.`,
          POLICY_VERSION,
          sha256(`phase11-complaint-key-${index + 1}`),
          sha256(`phase11-complaint-fingerprint-${index + 1}`),
        ],
      );
    }
  }
}

async function transitionEnquiry(
  client: PoolClient,
  enquiryId: string,
  providerOwnerId: string,
  targetStatus: 'acknowledged' | 'accepted' | 'closed' | 'declined',
  expectedRevision: number,
  index: number,
): Promise<void> {
  await client.query(`SELECT interaction.transition_enquiry($1, $2, 'provider', $3, $4, $5, $6)`, [
    enquiryId,
    providerOwnerId,
    targetStatus,
    expectedRevision,
    `Synthetic Phase 11 transition ${targetStatus} for scenario ${index + 1}`,
    POLICY_VERSION,
  ]);
}

async function validateSyntheticCohort(client: PoolClient): Promise<Record<string, unknown>> {
  const counts = await client.query<{
    customers: string;
    providers: string;
    consents: string;
    publications: string;
    cases: string;
    approved_cases: string;
    upload_sessions: string;
    evidence_items: string;
    evidence_versions: string;
    case_evidence_links: string;
    assignments: string;
    recommendations: string;
    claims: string;
    enquiries: string;
    completed_interactions: string;
    reviews: string;
    complaints: string;
    field_visits: string;
    payment_intents: string;
  }>(
    `SELECT
       (SELECT count(*) FROM account.customer_profiles WHERE display_name LIKE 'P11 Demo Customer %')::text AS customers,
       (SELECT count(*) FROM platform.audit_events WHERE action = 'phase11_synthetic_provider_seeded')::text AS providers,
       (SELECT count(*) FROM account.consents WHERE policy_version_id = $1 AND status = 'accepted')::text AS consents,
       (SELECT count(*) FROM discovery.publications WHERE policy_version = $2 AND status = 'published')::text AS publications,
       (SELECT count(*) FROM verification.cases WHERE policy_version = $2)::text AS cases,
       (SELECT count(*) FROM verification.cases WHERE policy_version = $2 AND status = 'approved')::text AS approved_cases,
       (SELECT count(*) FROM evidence.upload_sessions WHERE status = 'completed' AND object_key LIKE 'private/1102%')::text AS upload_sessions,
       (SELECT count(*) FROM evidence.items WHERE status = 'approved' AND provider_id::text LIKE '11020000-%')::text AS evidence_items,
       (SELECT count(*) FROM evidence.versions WHERE processing_status = 'clean' AND object_key LIKE 'private/1102%')::text AS evidence_versions,
       (SELECT count(*) FROM verification.case_evidence AS links JOIN verification.cases AS cases ON cases.id = links.case_id WHERE cases.policy_version = $2)::text AS case_evidence_links,
       (SELECT count(*) FROM verification.assignments AS assignments JOIN verification.cases AS cases ON cases.id = assignments.case_id WHERE cases.policy_version = $2 AND assignments.assignment_kind = 'reviewer')::text AS assignments,
       (SELECT count(*) FROM verification.recommendations AS recommendations JOIN verification.cases AS cases ON cases.id = recommendations.case_id WHERE cases.policy_version = $2 AND recommendations.result = 'approve')::text AS recommendations,
       (SELECT count(*) FROM verification.claims WHERE policy_version = $2 AND status = 'active')::text AS claims,
       (SELECT count(*) FROM interaction.enquiries WHERE policy_version = $2)::text AS enquiries,
       (SELECT count(*) FROM interaction.tracked_interactions WHERE policy_version = $2 AND status = 'completed')::text AS completed_interactions,
       (SELECT count(*) FROM interaction.reviews WHERE policy_version = $2)::text AS reviews,
       (SELECT count(*) FROM interaction.complaints WHERE policy_version = $2)::text AS complaints,
       (SELECT count(*) FROM verification.field_visits)::text AS field_visits,
       (SELECT count(*) FROM commercial.payment_intents)::text AS payment_intents`,
    [POLICY_ID, POLICY_VERSION],
  );
  const row = counts.rows[0];
  if (!row) {
    throw new Error('Synthetic pilot validation returned no counts.');
  }
  const expected: Record<string, number> = {
    customers: 60,
    providers: 24,
    consents: 84,
    publications: 24,
    cases: 48,
    approved_cases: 48,
    upload_sessions: 48,
    evidence_items: 48,
    evidence_versions: 48,
    case_evidence_links: 48,
    assignments: 48,
    recommendations: 48,
    claims: 48,
    enquiries: 60,
    completed_interactions: 36,
    reviews: 24,
    complaints: 6,
    field_visits: 0,
    payment_intents: 0,
  };
  for (const [key, value] of Object.entries(expected)) {
    if (Number(row[key as keyof typeof row]) !== value) {
      throw new Error(
        `Synthetic pilot invariant failed for ${key}: expected ${value}, received ${row[key as keyof typeof row]}.`,
      );
    }
  }

  const waveCounts = await client.query<{ participant_type: string; wave: number; count: string }>(
    `SELECT
       metadata->>'participantType' AS participant_type,
       (metadata->>'wave')::int AS wave,
       count(*)::text AS count
     FROM platform.audit_events
     WHERE action IN ('phase11_synthetic_provider_seeded', 'phase11_synthetic_customer_seeded')
     GROUP BY metadata->>'participantType', (metadata->>'wave')::int
     ORDER BY participant_type, wave`,
  );
  const waveMap = new Map(
    waveCounts.rows.map((item) => [`${item.participant_type}:${item.wave}`, Number(item.count)]),
  );
  for (const wave of [1, 2, 3]) {
    if (waveMap.get(`provider:${wave}`) !== 8 || waveMap.get(`customer:${wave}`) !== 20) {
      throw new Error(`Synthetic wave ${wave} must contain exactly 8 providers and 20 customers.`);
    }
  }

  const categoryMix = await client.query<{
    category: string;
    pathway: string;
    count: string;
  }>(
    `SELECT metadata->>'category' AS category, metadata->>'pathway' AS pathway, count(*)::text AS count
     FROM platform.audit_events
     WHERE action = 'phase11_synthetic_provider_seeded'
     GROUP BY metadata->>'category', metadata->>'pathway'
     ORDER BY category, pathway`,
  );
  for (const category of CATEGORIES) {
    for (const pathway of ['registered_business', 'qualified_individual', 'experienced_informal']) {
      const match = categoryMix.rows.find(
        (rowItem) => rowItem.category === category.key && rowItem.pathway === pathway,
      );
      if (Number(match?.count ?? 0) !== 2) {
        throw new Error(
          `Synthetic category/pathway invariant failed for ${category.key}/${pathway}; expected 2.`,
        );
      }
    }
  }

  const waveOneSupply = await client.query<{ category: string; count: string }>(
    `SELECT metadata->>'category' AS category, count(*)::text AS count
     FROM platform.audit_events
     WHERE action = 'phase11_synthetic_provider_seeded'
       AND (metadata->>'wave')::int = 1
     GROUP BY metadata->>'category'
     ORDER BY category`,
  );
  for (const category of ['plumbing', 'mechanics']) {
    const count = Number(waveOneSupply.rows.find((item) => item.category === category)?.count ?? 0);
    if (count < 3) {
      throw new Error(`Wave 1 supply-before-demand invariant failed for ${category}.`);
    }
  }

  return {
    event: 'phase11_synthetic_pilot_activated',
    evidenceClass: 'SYNTHETIC',
    primaryPilotEvidence: false,
    policyVersion: POLICY_VERSION,
    geography: ['Kabwata Ward, Lusaka', 'Chilenje Ward, Lusaka'],
    comparisonArea: 'Matero (not activated)',
    categories: CATEGORIES.map((category) => category.key),
    counts: Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Number(value)])),
    waves: { providersPerWave: 8, customersPerWave: 20, totalWaves: 3 },
    runtimeBoundaries: {
      maps: 'disabled/manual-first',
      sentryRealParticipantTelemetry: 'disabled',
      productionWhatsAppOrCallDelivery: 'disabled',
      payments: 'disabled',
      fieldVisitedClaim: 'disabled',
      realFirebaseParticipantActivation: 'external-gated',
    },
    phase11Stages: {
      '11C': 'synthetic functional coverage established; PRIMARY-PILOT pending',
      '11D': 'synthetic discovery/trust coverage established; PRIMARY-PILOT pending',
      '11E': 'synthetic enquiry/review/complaint coverage established; PRIMARY-PILOT pending',
      '11F':
        'synthetic operations state coverage established; real field/capacity evidence pending',
      '11G': 'automated device/network contract coverage only; real-device PRIMARY-PILOT pending',
      '11H': 'scenario modelling only; willingness-to-pay PRIMARY-PILOT pending',
    },
    externalGatesRemainPending: [
      'DPC controller registration evidence',
      'DPC overseas storage/transfer authorization',
      'qualified Zambia legal/privacy/consumer sign-off',
    ],
    phase12Authorized: false,
  };
}

async function main(): Promise<void> {
  requireSyntheticActivation();
  const url = databaseUrl();
  await runMigrations(url);
  const pool = new Pool({ connectionString: url, max: 2 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await assertCleanSyntheticTarget(client);
    await seedPolicy(client);
    await seedReviewer(client);
    const customers = await seedCustomers(client);
    const providers = await seedProviders(client);
    await seedInteractions(client, customers, providers);
    const report = await validateSyntheticCohort(client);
    await client.query('COMMIT');
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'Unknown Phase 11 synthetic activation failure';
  process.stderr.write(
    `${JSON.stringify({ event: 'phase11_synthetic_pilot_failed', evidenceClass: 'SYNTHETIC', message })}\n`,
  );
  process.exitCode = 1;
});
