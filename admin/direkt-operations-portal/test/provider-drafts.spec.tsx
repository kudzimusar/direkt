import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ProviderDraftsPage from '../src/app/operations/providers/page';

describe('ProviderDraftsPage', () => {
  it('labels all records synthetic and non-discoverable', () => {
    const markup = renderToStaticMarkup(<ProviderDraftsPage />);

    expect(markup).toContain('Synthetic Copperbelt Repairs');
    expect(markup).toContain('Experienced informal provider');
    expect(markup).toContain('Discoverable');
    expect(markup).toContain('<strong>No</strong>');
    expect(markup).toContain('cannot publish a provider');
    expect(markup).not.toContain('Approve evidence');
    expect(markup).not.toContain('Publish provider');
  });
}