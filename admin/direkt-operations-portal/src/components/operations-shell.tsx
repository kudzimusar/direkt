import Link from 'next/link';
import type { ReactNode } from 'react';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { visibleNavigation } from '@/lib/navigation';
import type { OperationsSession } from '@/lib/session';

export interface OperationsShellProps {
  session: OperationsSession;
  children: ReactNode;
}

export function OperationsShell({ session, children }: OperationsShellProps) {
  const items = visibleNavigation(session);

  return (
    <div className="portal-shell operations-world-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="topbar operations-topbar">
        <div className="operations-brand">
          <span className="operations-brand-mark" aria-hidden="true">
            D
          </span>
          <span>
            <strong>DIREKT Operations</strong>
            <small>Trust, safety and marketplace operations</small>
          </span>
          <span className="environment-chip">Synthetic review environment</span>
        </div>
        <div className="session-summary" aria-label="Current operations session">
          <span>{session.displayName}</span>
          <span>{session.role.replaceAll('_', ' ')}</span>
          <KeyboardShortcuts />
        </div>
      </header>
      <div className="portal-grid">
        <aside className="sidebar operations-sidebar">
          <nav aria-label="Operations navigation">
            <p className="sidebar-section-label">Workspaces</p>
            <ul>
              {items.map((item) => (
                <li key={item.permission}>
                  {item.status === 'available' ? (
                    <Link href={item.href} title={item.description}>
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <span aria-disabled="true" title={item.description}>
                      {item.label} <small>Planned</small>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <section
            aria-labelledby="session-policy-heading"
            className="policy-card operations-session-card"
          >
            <h2 id="session-policy-heading">Access context</h2>
            <p>Permissions are resolved by the backend. Navigation never grants authority.</p>
            <dl>
              <div>
                <dt>Step-up</dt>
                <dd>{session.stepUpRequired ? 'Required' : 'Not required'}</dd>
              </div>
              <div>
                <dt>Session ends</dt>
                <dd>
                  <time dateTime={session.expiresAt}>{session.expiresAt}</time>
                </dd>
              </div>
            </dl>
          </section>
        </aside>
        <main id="main-content" tabIndex={-1}>
          <div className="synthetic-banner operations-environment-banner" role="status">
            Synthetic review environment — no real participant records, private evidence, decisions
            or production actions are available here.
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
