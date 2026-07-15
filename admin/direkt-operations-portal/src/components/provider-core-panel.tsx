import {
  pathwayLabel,
  summarizeProviderCore,
  type ProviderCoreFixture,
} from '@/lib/provider-core';

export function ProviderCorePanel({ fixtures }: { fixtures: ProviderCoreFixture[] }) {
  const summary = summarizeProviderCore(fixtures);
  return (
    <section aria-labelledby="provider-core-title" className="panel stack">
      <div className="stack stack-tight">
        <p className="eyebrow">Phase 3 · synthetic operations state</p>
        <h1 id="provider-core-title">Provider and category core</h1>
        <p>
          These fictional records exercise profile pathways, operating models and category
          selection. They are not verification cases and cannot become public listings.
        </p>
      </div>

      <dl className="metric-grid" aria-label="Synthetic provider profile summary">
        <div><dt>Total drafts</dt><dd>{summary.total}</dd></div>
        <div><dt>Editing</dt><dd>{summary.drafts}</dd></div>
        <div><dt>Profile complete</dt><dd>{summary.complete}</dd></div>
        <div><dt>Discoverable</dt><dd>{summary.discoverable}</dd></div>
      </dl>

      <div className="notice" role="status">
        <strong>Publication blocked.</strong> Profile completion is self-asserted and creates no
        trust claim or public discoverability.
      </div>

      <div className="table-wrap">
        <table>
          <caption>Fictional Phase 3 provider drafts</caption>
          <thead><tr><th scope="col">Provider</th><th scope="col">Pathway</th><th scope="col">Model</th><th scope="col">Categories</th><th scope="col">State</th></tr></thead>
          <tbody>
            {fixtures.map((fixture) => (
              <tr key={fixture.providerId}>
                <th scope="row">{fixture.displayName}</th>
                <td>{pathwayLabel(fixture.pathway)}</td>
                <td>{fixture.operatingModel}</td>
                <td>{fixture.categories.join(', ') || 'None selected'}</td>
                <td><span className="status-badge">{fixture.profileState}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
