import Link from 'next/link';
import type { ReactNode } from 'react';
import { visibleNavigation } from '@/lib/navigation';
import type { OperationsSession } from '@/lib/session';

export interface OperationsShellProps {
  session: OperationsSession;
  children: ReactNode;
}

export function OperationsShell({ session, children }: OperationsShellProps) {
  const items = visibleNavigation(session);

  return (
    <div className="portal-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="topbar">
        <div>
          <strong>DIREKT Operations</strong>
          <span className="environment-chip">Synthetic Phase 2C</span>
        </div>
        <div className="session-summary" aria-label="Current synthetic session">
          <span>{session.displayName}</span>
          <span>{session.role.replaceAll('_', ' ')}</span>
        </div>
      </header>
      <div className="portal-grid">
        <aside className="sidebar">
          <nav aria-label="Operations navigation">
            <ul>
              {items.map((item) => (
                <li key={item.permission}>
                  {item.status === 'available' ? (
                    <Link href={item.href}>{item.label}</Link>
                  ) : (
                    <span aria-disabled="true">
                      {item.label} <small>Planned</small>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <section aria-labelledby="session-policy-heading" className="policy-card">
            <h2 id="session-policy-heading">Session policy</h2>
            <p>Roles are resolved by the backend. Hidden navigation never grants access.</p>
            <p>
              Step-up required: <strong>{session.stepUpRequired ? 'Yes' : 'No'}</strong>
            </p>
          </section>
        </aside>
        <main id="main-content" tabIndex={-1}>
          <div className="synthetic-banner" role="status">
            Synthetic interface only. No real accounts, evidence, decisions or production systems.
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
