import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProviderCorePanel } from '../src/components/provider-core-panel';
import {
  pathwayLabel,
  summarizeProviderCore,
  syntheticProviderCoreFixtures,
} from '../src/lib/provider-core';

describe('Phase 3 provider core portal surface', () => {
  it('reports that every synthetic provider remains blocked from discovery', () => {
    expect(summarizeProviderCore(syntheticProviderCoreFixtures)).toEqual({
      total: 2,
      drafts: 1,
      complete: 1,
      discoverable: 0,
    });
  });

  it('uses explicit human-readable pathway labels', () => {
    expect(pathwayLabel('registered_business')).toBe('Registered business');
    expect(pathwayLabel('qualified_individual')).toBe('Qualified individual');
    expect(pathwayLabel('experienced_informal')).toBe('Experienced informal provider');
  });

  it('renders an accessible synthetic-only table and publication warning', () => {
    const html = renderToStaticMarkup(
      <ProviderCorePanel fixtures={syntheticProviderCoreFixtures} />,
    );
    expect(html).toContain('Phase 3 · synthetic operations state');
    expect(html).toContain('Publication blocked');
    expect(html).toContain('<caption>Fictional Phase 3 provider drafts</caption>');
    expect(html).toContain('Discoverable</dt><dd>0</dd>');
    expect(html).not.toContain('verified provider');
  });
});
