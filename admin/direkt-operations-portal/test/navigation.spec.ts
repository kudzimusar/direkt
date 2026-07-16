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
    expiresAt: '2026-07-16T23:00:00.000Z',
    stepUpRequired: true,
  };
}

describe('visibleNavigation', () => {
  it('shows only reviewer-authorized Phase 7 and inherited verification workspaces', () => {
    const items = visibleNavigation(
      session('reviewer', [
        'operations.portal.access',
        'operations.providers.read',
        'operations.triage.read',
        'evidence.read.private',
        'verification.case.review',
        'discovery.publication.read',
      ]),
    );

    expect(items.map((item) => item.label)).toEqual([
      'Mission control',
      'Triage queue',
      'Evidence review',
      'Provider drafts',
      'Provider workspaces',
      'Discovery eligibility',
    ]);
    expect(items.map((item) => item.label)).not.toContain('Field workflow');
    expect(items.map((item) => item.label)).not.toContain('Incidents and complaints');
    expect(items.map((item) => item.label)).not.toContain('Finance');
  });

  it('shows the complete Stage 7 workspace set to a permissioned trust supervisor', () => {
    const labels = visibleNavigation(
      session('trust_supervisor', [
        'operations.portal.access',
        'operations.triage.read',
        'evidence.read.private',
        'operations.field_work.read',
        'operations.escalations.read',
        'operations.incidents.read',
        'operations.reporting.read',
      ]),
    ).map((item) => item.label);

    expect(labels).toEqual([
      'Mission control',
      'Triage queue',
      'Evidence review',
      'Field workflow',
      'Escalations and overrides',
      'Incidents and complaints',
      'Expiry and reporting',
    ]);
  });

  it('keeps finance outside verification, field, incident and reporting controls', () => {
    const labels = visibleNavigation(
      session('finance', ['operations.portal.access', 'finance.ledger.read']),
    ).map((item) => item.label);

    expect(labels).toEqual(['Mission control', 'Finance']);
    expect(labels).not.toContain('Triage queue');
    expect(labels).not.toContain('Evidence review');
    expect(labels).not.toContain('Field workflow');
    expect(labels).not.toContain('Incidents and complaints');
  });

  it('uses server permissions rather than the displayed role label', () => {
    const labels = visibleNavigation(session('admin', [])).map((item) => item.label);
    expect(labels).toEqual([]);
  });
});
