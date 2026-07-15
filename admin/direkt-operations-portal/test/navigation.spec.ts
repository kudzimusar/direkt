import { describe, expect, it } from 'vitest';
import { visibleNavigation } from '../src/lib/navigation';
import type { OperationsSession } from '../src/lib/session';

function session(
  role: OperationsSession['role'],
  permissions: readonly string[],
): OperationsSession {
  return {
    synthetic: true,
    identityId: '00000000-0000-4000-8000-000000000501',
    sessionId: '00000000-0000-4000-8000-000000000502',
    displayName: 'Synthetic operator',
    role,
    permissions,
    expiresAt: '2026-07-15T23:00:00.000Z',
    stepUpRequired: true,
  };
}

describe('visibleNavigation', () => {
  it('shows verification, discovery and workspace queues only to an authorized reviewer', () => {
    const items = visibleNavigation(
      session('reviewer', [
        'operations.portal.access',
        'operations.providers.read',
        'verification.case.review',
        'verification.final_decision',
        'discovery.publication.read',
      ]),
    );

    expect(items.map((item) => item.label)).toEqual([
      'Mission control',
      'Provider drafts',
      'Provider workspaces',
      'Verification queue',
      'Discovery eligibility',
    ]);
    expect(items.find((item) => item.label === 'Provider workspaces')?.status).toBe('available');
    expect(items.find((item) => item.label === 'Verification queue')?.status).toBe('available');
    expect(items.find((item) => item.label === 'Discovery eligibility')?.status).toBe('available');
    expect(items.map((item) => item.label)).not.toContain('Finance');
  });

  it('keeps finance out of provider verification and discovery controls', () => {
    const labels = visibleNavigation(
      session('finance', ['operations.portal.access', 'finance.ledger.read']),
    ).map((item) => item.label);

    expect(labels).toEqual(['Mission control', 'Finance']);
    expect(labels).not.toContain('Provider drafts');
    expect(labels).not.toContain('Provider workspaces');
    expect(labels).not.toContain('Verification queue');
    expect(labels).not.toContain('Discovery eligibility');
  });

  it('uses server permissions rather than the displayed role label', () => {
    const labels = visibleNavigation(session('admin', [])).map((item) => item.label);
    expect(labels).toEqual([]);
  });
});
