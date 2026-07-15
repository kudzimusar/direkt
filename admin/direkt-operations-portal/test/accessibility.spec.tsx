import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { OperationsShell } from '../src/components/operations-shell';
import { syntheticReviewerSession, type OperationsSession } from '../src/lib/session';

describe('OperationsShell accessibility contract', () => {
  it('renders skip navigation, labelled navigation, main landmark and status warning', () => {
    const markup = renderToStaticMarkup(
      <OperationsShell session={syntheticReviewerSession}>
        <h1>Test content</h1>
      </OperationsShell>,
    );

    expect(markup).toContain('href="#main-content"');
    expect(markup).toContain('aria-label="Operations navigation"');
    expect(markup).toContain('id="main-content"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('Synthetic interface only');
    expect(markup).toContain('href="/operations/verification"');
  });

  it('marks planned navigation as disabled instead of linking to unavailable work', () => {
    const fieldAgentSession: OperationsSession = {
      ...syntheticReviewerSession,
      role: 'field_agent',
      permissions: ['operations.portal.access', 'verification.field_visit.record'],
    };
    const markup = renderToStaticMarkup(
      <OperationsShell session={fieldAgentSession}>
        <h1>Field test content</h1>
      </OperationsShell>,
    );

    expect(markup).toContain('Field visits');
    expect(markup).toContain('aria-disabled="true"');
    expect(markup).not.toContain('href="/operations/field-visits"');
  });
});
