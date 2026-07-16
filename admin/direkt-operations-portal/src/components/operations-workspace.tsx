import type { ReactNode } from 'react';
import { hasPermission, type OperationsSession } from '@/lib/session';

export type StatusTone = 'neutral' | 'info' | 'warning' | 'danger' | 'success';

export interface WorkspaceIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  headingId: string;
  children?: ReactNode;
}

export function WorkspaceIntro({
  eyebrow,
  title,
  description,
  headingId,
  children,
}: WorkspaceIntroProps) {
  return (
    <header className="workspace-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 id={headingId}>{title}</h1>
        <p className="lede">{description}</p>
      </div>
      {children === undefined ? null : <div className="workspace-actions">{children}</div>}
    </header>
  );
}

export function StatusPill({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}

export interface MetricCardProps {
  label: string;
  value: string;
  note: string;
  tone?: StatusTone;
}

export function MetricCard({ label, value, note, tone = 'neutral' }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className="metric-card__heading">
        <h2>{label}</h2>
        <StatusPill tone={tone}>{tone}</StatusPill>
      </div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

export function PermissionAction({
  session,
  permission,
  label,
  deniedLabel = 'Access denied',
  accessKey,
}: {
  session: OperationsSession;
  permission: string;
  label: string;
  deniedLabel?: string;
  accessKey?: string;
}) {
  const allowed = hasPermission(session, permission);

  return (
    <button
      type="button"
      className="primary-action"
      disabled={!allowed}
      aria-disabled={!allowed}
      title={allowed ? label : `Requires ${permission}`}
      {...(accessKey === undefined ? {} : { accessKey })}
    >
      {allowed ? label : deniedLabel}
    </button>
  );
}

export function WorkflowStateCard({
  state,
  title,
  description,
  tone,
}: {
  state: string;
  title: string;
  description: string;
  tone: StatusTone;
}) {
  return (
    <article className="workflow-state-card" data-workflow-state={state}>
      <StatusPill tone={tone}>{state.replaceAll('_', ' ')}</StatusPill>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

export function DenseTableRegion({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="dense-table-region" role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  );
}
