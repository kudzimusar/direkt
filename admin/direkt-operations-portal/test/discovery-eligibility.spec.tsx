import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DiscoveryEligibilityPage from '../src/app/operations/discovery/page';

describe('DiscoveryEligibilityPage', () => {
  it('shows synthetic eligibility without private location evidence or publish bypasses', () => {
    const markup = renderToStaticMarkup(<DiscoveryEligibilityPage />);

    expect(markup).toContain('Synthetic Woodlands Plumbing');
    expect(markup).toContain('Synthetic Mobile Plumber');
    expect(markup).toContain('Mandatory identity claim expired');
    expect(markup).toContain('Public service area only; private base excluded');
    expect(markup).toContain('Direct row edits, payment and profile completion cannot publish');
    expect(markup).not.toContain('private_base');
    expect(markup).not.toContain('latitude');
    expect(markup).not.toContain('longitude');
    expect(markup).not.toContain('objectKey');
    expect(markup).not.toContain('evidenceId');
    expect(markup).not.toContain('reviewer notes');
  });
});
