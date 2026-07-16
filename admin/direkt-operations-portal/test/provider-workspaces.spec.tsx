import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ProviderWorkspacesPage from '../src/app/operations/provider-workspaces/page';

describe('ProviderWorkspacesPage', () => {
  it('shows aggregate readiness and upload recovery without private evidence or coordinates', () => {
    const markup = renderToStaticMarkup(<ProviderWorkspacesPage />);

    expect(markup).toContain('Provider workspaces');
    expect(markup).toContain('Synthetic Copperbelt Repairs');
    expect(markup).toContain('Interrupted · retryable');
    expect(markup).toContain('Location and evidence boundary');
    expect(markup).toContain('does not expose private or public coordinate values');
    expect(markup).toContain('Stage 8 enquiries and review responses use separate actor-scoped API workspaces');
    expect(markup).toContain('Subscription status remains a Phase 9');

    expect(markup).not.toContain('object_key');
    expect(markup).not.toContain('private-evidence/');
    expect(markup).not.toContain('sha256');
    expect(markup).not.toContain('reviewerIdentityId');
    expect(markup).not.toContain('-15.');
    expect(markup).not.toContain('28.');
  });
});
