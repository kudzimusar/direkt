import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mission control' };

const summaryCards = [
  {
    label: 'Verification cases',
    value: '0',
    note: 'No evidence engine is connected in Phase 2C.',
  },
  {
    label: 'Field visits',
    value: '0',
    note: 'Assignments begin only after the verification phase.',
  },
  {
    label: 'Open incidents',
    value: '0',
    note: 'Synthetic shell with no production incident feed.',
  },
] as const;

export default function OperationsPage() {
  return (
    <section aria-labelledby="mission-control-heading">
      <p className="eyebrow">Operations foundation</p>
      <h1 id="mission-control-heading">Mission control</h1>
      <p className="lede">
        This checkpoint proves privileged navigation, session states and accessibility. It does not
        expose provider evidence or permit verification decisions.
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
        <h2 id="controls-heading">Phase 2C controls</h2>
        <ul>
          <li>Backend roles and permissions are deny-by-default.</li>
          <li>Provider scope is checked separately from global role membership.</li>
          <li>Refresh sessions rotate and token reuse revokes the family.</li>
          <li>Privileged actions require a reason and append-only audit event.</li>
          <li>The portal has no direct database or object-storage connector.</li>
        </ul>
      </section>
    </section>
  );
}
