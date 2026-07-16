import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { KeyboardShortcuts } from '../src/components/keyboard-shortcuts';
import { OperationsShell } from '../src/components/operations-shell';
import { PermissionAction } from '../src/components/operations-workspace';
import type { OperationsSession } from '../src/lib/session';

function session(permissions: readonly string[]): OperationsSession {
  return {
    synthetic: true,
    identityId: '00000000-0000-4000-8000-000000000801',
    sessionId: '00000000-0000-4000-8000-000000000802',
    displayName: 'Synthetic accessibility operator',
    role: 'support',
    permissions,
    expiresAt: '2026-07-16T23:00:00.000Z',
    stepUpRequired: true,
  };
}

describe('Phase 7 permission controls and accessibility', () => {
  it('disables actions when the server permission snapshot lacks the required key', () => {
    const markup = renderToStaticMarkup(
      <PermissionAction
        session={session([])}
        permission="operations.reporting.export"
        label="Export metrics"
        deniedLabel="Export permission required"
      />,
    );

    expect(markup).toContain('disabled=""');
    expect(markup).toContain('aria-disabled="true"');
    expect(markup).toContain('Export permission required');
    expect(markup).toContain('Requires operations.reporting.export');
  });

  it('renders enabled native controls when the permission is present', () => {
    const markup = renderToStaticMarkup(
      <PermissionAction
        session={session(['operations.incidents.manage'])}
        permission="operations.incidents.manage"
        label="Create internal record"
      />,
    );

    expect(markup).toContain('Create internal record');
    expect(markup).toContain('aria-disabled="false"');
    expect(markup).not.toContain('disabled=""');
  });

  it('documents keyboard navigation with accessible disclosure semantics', () => {
    const markup = renderToStaticMarkup(<KeyboardShortcuts />);

    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('aria-controls="keyboard-shortcut-help"');
    expect(markup).toContain('<kbd>?</kbd>');
  });

  it('retains a skip link, named navigation and focusable main region', () => {
    const markup = renderToStaticMarkup(
      <OperationsShell session={session(['operations.portal.access'])}>
        <h1>Accessible synthetic content</h1>
      </OperationsShell>,
    );

    expect(markup).toContain('href="#main-content"');
    expect(markup).toContain('aria-label="Operations navigation"');
    expect(markup).toContain('id="main-content"');
    expect(markup).toContain('tabindex="-1"');
  });
});
