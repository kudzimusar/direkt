import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mission control' };

const summaryCards = [
  {
    label: 'Provider drafts',
    value: '2',
    note: 'Synthetic private profiles only; public discoverability is structurally blocked.',
  },
  {
    label: 'Active category versions',
    value: '4',
    note: 'Planning requirements are versioned and immutable after activation.',
  },
  {
    label: 'Verification cases',
    value: '0',
    note: 'No evidence engine or verification decision exists before Phase 4.',
  },
] as const;

export default function OperationsPage() {
  return (
    <section aria-labelledby="mission-control-heading">
      <p className="eyebrow">Phase 3 operations foundation</p>
      <h1 id="mission-control-heading">Mission control</h1>
      <p className="lede">
        This checkpoint adds a bounded internal provider-draft view while preserving the Phase 2C
        session, provider-scope and deny-by-default authorization boundaries.
      </p>

      <div className="summary-grid" aria-label="Synthetic operations summary">
        {summaryCards.map((card) => (
          <article className="summary-card" key={card.label}>
            <h2>{card.label}</h2>
            <strong>{card.value}</strong>
            <p>{card.note}</p>
          </article>
        ))}
      </div>

      <section className="control-panel" aria-labelledby="controls-heading">
        <h2 id="controls-heading">Phase 3 controls</h2>
        <ul>
          <li>Human identities and provider organizations are separate aggregates.</li>
          <li>Provider reads and mutations require a server-owned provider scope.</li>
          <li>Provider pathways and operating models are validated at the database boundary.</li>
          <li>Category selections pin the active immutable requirement version.</li>
          <li>All provider drafts remain non-public until Phase 4 evidence-derived publication.</li>
          <li>The portal has no direct database or object-storage connector.</li>
        </ul>
      </section>
    </section>
  );
}