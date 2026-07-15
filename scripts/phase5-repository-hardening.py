from pathlib import Path

path = Path('backend/direkt-api/src/discovery/discovery.repository.ts')
text = path.read_text()

text = text.replace(
    "    const conditions = [\n      `publications.status = 'published'`,",
    "    const conditions = [\n      `publications.status = 'published'`,\n      `organizations.status = 'ready_for_verification'`,",
    1,
)

text = text.replace(
    "       FROM discovery.publications AS publications\n       JOIN catalog.service_categories AS categories",
    "       FROM discovery.publications AS publications\n       JOIN provider.organizations AS organizations ON organizations.id = publications.provider_id\n       JOIN catalog.service_categories AS categories",
)

text = text.replace(
    "       WHERE publications.id = $1\n         AND publications.status = 'published'\n         AND discovery.required_claims_current(",
    "       WHERE publications.id = $1\n         AND publications.status = 'published'\n         AND organizations.status = 'ready_for_verification'\n         AND discovery.required_claims_current(",
    1,
)

text = text.replace(
    "       FROM discovery.publications AS publications\n       JOIN verification.cases AS cases",
    "       FROM discovery.publications AS publications\n       JOIN provider.organizations AS organizations ON organizations.id = publications.provider_id\n       JOIN verification.cases AS cases",
    1,
)
text = text.replace(
    "       WHERE publications.id = $1\n         AND publications.status = 'published'\n         AND claims.status = 'active'",
    "       WHERE publications.id = $1\n         AND publications.status = 'published'\n         AND organizations.status = 'ready_for_verification'\n         AND discovery.required_claims_current(\n           publications.provider_id,\n           publications.category_id,\n           publications.requirement_version_id,\n           now()\n         )\n         AND claims.status = 'active'",
    1,
)

start = text.index('  async save(identityId: string, publicProviderId: string): Promise<SavedProviderView> {')
end = text.index('\n\n  async unsave', start)
replacement = """  async save(identityId: string, publicProviderId: string): Promise<SavedProviderView> {
    const eligible = await this.database.query<{ id: string }>(
      `SELECT publications.id
       FROM discovery.publications AS publications
       JOIN provider.organizations AS organizations ON organizations.id = publications.provider_id
       WHERE publications.id = $1
         AND publications.status = 'published'
         AND organizations.status = 'ready_for_verification'
         AND discovery.required_claims_current(
           publications.provider_id,
           publications.category_id,
           publications.requirement_version_id,
           now()
         )`,
      [publicProviderId],
    );
    if (!eligible.rows[0]) {
      throw new NotFoundException('Eligible public provider profile was not found.');
    }

    await this.database.query(
      `INSERT INTO account.saved_public_providers (identity_id, publication_id)
       VALUES ($1, $2)
       ON CONFLICT (identity_id, publication_id) DO NOTHING`,
      [identityId, publicProviderId],
    );

    const result = await this.database.query<{
      public_provider_id: string;
      public_display_name: string;
      category_name: string;
      public_locality: string;
      saved_at: Date;
    }>(
      `SELECT
         publications.id AS public_provider_id,
         publications.public_display_name,
         categories.name AS category_name,
         publications.public_locality,
         saved.saved_at
       FROM account.saved_public_providers AS saved
       JOIN discovery.publications AS publications ON publications.id = saved.publication_id
       JOIN catalog.service_categories AS categories ON categories.id = publications.category_id
       WHERE saved.identity_id = $1
         AND saved.publication_id = $2`,
      [identityId, publicProviderId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Saved public provider was not found.');
    }
    return this.savedView(row);
  }"""
text = text[:start] + replacement + text[end:]

text = text.replace(
    "       JOIN discovery.publications AS publications ON publications.id = saved.publication_id\n       JOIN catalog.service_categories AS categories",
    "       JOIN discovery.publications AS publications ON publications.id = saved.publication_id\n       JOIN provider.organizations AS organizations ON organizations.id = publications.provider_id\n       JOIN catalog.service_categories AS categories",
    1,
)
text = text.replace(
    "       WHERE saved.identity_id = $1\n         AND publications.status = 'published'",
    "       WHERE saved.identity_id = $1\n         AND publications.status = 'published'\n         AND organizations.status = 'ready_for_verification'",
    1,
)

path.write_text(text)
print('Phase 5 repository hardening staged.')
