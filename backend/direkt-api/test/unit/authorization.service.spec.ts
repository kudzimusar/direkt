import { describe, expect, it, vi } from 'vitest';
import type { AuthorizationRepository } from '../../src/authorization/authorization.repository';
import { AuthorizationService } from '../../src/authorization/authorization.service';
import { PERMISSIONS } from '../../src/authorization/permissions';
import type { AuditService } from '../../src/platform/audit/audit.service';

const actor = {
  identityId: '00000000-0000-4000-8000-000000000301',
  sessionId: '00000000-0000-4000-8000-000000000302',
};

function subject(permissions: string[]) {
  const snapshot = vi.fn().mockResolvedValue({ roles: [], permissions });
  const record = vi.fn().mockResolvedValue(undefined);
  const service = new AuthorizationService(
    { snapshot } as unknown as AuthorizationRepository,
    { record } as unknown as AuditService,
  );
  return { service, snapshot, record };
}

describe('AuthorizationService', () => {
  it('denies permissions not granted by the server-side repository', async () => {
    const { service, record } = subject([PERMISSIONS.ACCOUNT_SESSIONS_MANAGE]);

    await expect(
      service.assertPermission(actor, PERMISSIONS.OPERATIONS_PORTAL_ACCESS),
    ).rejects.toThrow(/not permitted/i);
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'authorization_denied',
        outcome: 'denied',
      }),
    );
  });

  it('passes provider scope to the repository instead of trusting a client role', async () => {
    const { service, snapshot } = subject([PERMISSIONS.PROVIDER_PROFILE_MANAGE]);
    const providerId = '00000000-0000-4000-8000-000000000303';

    await service.assertPermission(actor, PERMISSIONS.PROVIDER_PROFILE_MANAGE, { providerId });
    expect(snapshot).toHaveBeenCalledWith(actor.identityId, providerId);
  });

  it('denies evidence self-approval even when a role has final-decision permission', async () => {
    const { service, record } = subject([PERMISSIONS.VERIFICATION_FINAL_DECISION]);

    await expect(
      service.assertEvidenceDecision(
        actor,
        actor.identityId,
        '00000000-0000-4000-8000-000000000304',
      ),
    ).rejects.toThrow(/cannot approve/i);
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'self_approval_denied' }),
    );
  });

  it('keeps field-agent and finance roles from final verification decisions', async () => {
    for (const permissions of [
      [PERMISSIONS.VERIFICATION_FIELD_VISIT_RECORD],
      [PERMISSIONS.FINANCE_LEDGER_READ],
    ]) {
      const { service } = subject(permissions);
      await expect(
        service.assertEvidenceDecision(
          actor,
          '00000000-0000-4000-8000-000000000305',
          '00000000-0000-4000-8000-000000000306',
        ),
      ).rejects.toThrow(/not permitted/i);
    }
  });

  it('requires a specific reason for emergency administration', async () => {
    const { service } = subject([PERMISSIONS.ADMIN_EMERGENCY_ACTION]);

    await expect(service.assertEmergencyAction(actor, 'short')).rejects.toThrow(/specific reason/i);
    await expect(
      service.assertEmergencyAction(actor, 'Synthetic incident-response exercise'),
    ).resolves.toBeUndefined();
  });
});
