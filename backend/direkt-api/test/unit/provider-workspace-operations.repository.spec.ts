import { describe, expect, it, vi } from 'vitest';
import { ProviderWorkspaceOperationsRepository } from '../../src/operations/provider-workspace-operations.repository';
import type { DatabaseService } from '../../src/platform/database/database.service';

describe('ProviderWorkspaceOperationsRepository', () => {
  it('mirrors provider status, location and current-claim publication gates', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new ProviderWorkspaceOperationsRepository({
      query,
    } as unknown as DatabaseService);

    await expect(repository.list()).resolves.toEqual([]);

    const sql = String(query.mock.calls[0]?.[0]);
    expect(sql).toContain("organizations.status = 'ready_for_verification'");
    expect(sql).toContain('locations.provider_id IS NOT NULL');
    expect(sql).toContain('locations.service_area IS NOT NULL');
    expect(sql).toContain("profiles.operating_model = 'mobile'");
    expect(sql).toContain('locations.public_premises IS NOT NULL');
    expect(sql).toContain('discovery.required_claims_current');
  });
});
