import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Discovery eligibility' };

const syntheticEligibility = [
  {
    provider: 'Synthetic Woodlands Plumbing',
    category: 'Plumbing',
    operatingModel: 'Fixed premises',
    locality: 'Woodlands, Lusaka',
    locationState: 'Consented public premises and public service area',
    claimsState: '2 of 2 mandatory scoped claims current',
    publicationState: 'Published',
    eligible: true,
  },
  {
    provider: 'Synthetic Mobile Plumber',
    category: 'Plumbing',
    operatingModel: 'Mobile service',
    locality: 'Lusaka Central service area',
    locationState: 'Public service area only; private base excluded',
    claimsState: '2 of 2 mandatory scoped claims current',
    publicationState: 'Published',
    eligible: true,
  },
  {
    provider: 'Synthetic Expired Repairs',
    category: 'Plumbing',
    operatingModel: 'Hybrid',
    locality: 'Kabulonga, Lusaka',
    locationState: 'Consented public premises and public service area',
    claimsState: 'Mandatory identity claim expired',
    publicationState: 'Excluded dynamically',
    eligible: false,
  },
] as const;

export default function DiscoveryEligibilityPage() {
  return (
    <section aria-labelledby="discovery-eligibility-heading">
      <p className="eyebrow">Phase 5 synthetic publication policy</p>
      <h1 id="discovery-eligibility-heading">Discovery eligibility</h1>
      <p className="lede">
        Inspect whether fictional provider/category projections satisfy current publication policy.
        This page contains no private coordinates, original evidence, storage references or customer
        location.
      </p>

      <div className="queue-grid" aria-label="Synthetic discovery eligibility queue">
        {syntheticEligibility.map((item) => (
          <article className="queue-card" key={`${item.provider}-${item.category}`}>
            <div className="queue-card__header">
              <div>
                <p className="eyebrow">{item.category}</p>
                <h2>{item.provider}</h2>
              </div>
              <span className={item.eligible ? 'status-chip status-chip--ok' : 'status-chip'}>
                {item.publicationState}
              </span>
            </div>
            <dl className="detail-list">
              <div>
                <dt>Operating model</dt>
                <dd>{item.operatingModel}</dd>
              </div>
              <div>
                <dt>Public locality</dt>
                <dd>{item.locality}</dd>
              </div>
              <div>
                <dt>Location projection</dt>
                <dd>{item.locationState}</dd>
              </div>
              <div>
                <dt>Mandatory claims</dt>
                <dd>{item.claimsState}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <section className="control-panel" aria-labelledby="discovery-controls-heading">
        <h2 id="discovery-controls-heading">Publication controls</h2>
        <ul>
          <li>Publication is evaluated by an audited database policy function.</li>
          <li>Direct row edits, payment and profile completion cannot publish a provider.</li>
          <li>Stale or revoked mandatory claims remove the provider from public search.</li>
          <li>Mobile providers expose service areas, never distance from a private base.</li>
          <li>Search and Android receive public identifiers and allowlisted safe fields only.</li>
        </ul>
      </section>
    </section>
  );
}
