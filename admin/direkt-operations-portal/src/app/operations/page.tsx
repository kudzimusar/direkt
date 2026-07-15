import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mission control' };

const summaryCards = [
  {
    label: 'Provider drafts',
    value: '2',
    note: 'Synthetic private profiles only; public discoverability remains structurally blocked.',
  },
  {
    label: 'Verification cases',
    value: '2',
    note: 'Separate fictional checks with assignment, evidence-version and reason-code history.',
  },
  {
    label: 'Active scoped claims',
    value: '1',
    note: 'Derived from one synthetic decision, with an explicit limitation and expiry.',
  },
] as const;

export default function OperationsPage() {
  return (
    <section aria-labelledby="mission-control-heading">
      <p className="eyebrow">Phase 4 operations foundation</p>
      <h1 id="mission-control-heading">Mission control</h1>
      <p className="lede">
        This checkpoint adds a bounded private verification queue while preserving server-owned
        sessions, provider scope, case assignments and deny-by-default authorization.
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
        <h2 id="controls-heading">Phase 4 controls</h2>
        <ul>
          <li>Evidence metadata and original private objects have separate access boundaries.</li>
          <li>Only an actively assigned reviewer or supervisor may request private access.</li>
          <li>Recommendations, decisions and evidence versions are append-only.</li>
          <li>Reason codes, limitations, policy version and expiry accompany each scoped claim.</li>
          <li>Expired or revoked evidence degrades dependent claims deterministically.</li>
          <li>The portal has no direct database or object-storage connector.</li>
          <li>Provider discovery and production integrations remain disabled.</li>
        </ul>
      </section>
    </section>
  );
}