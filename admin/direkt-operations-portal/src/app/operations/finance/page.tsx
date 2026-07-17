import type { Metadata } from 'next';
import {
  DenseTableRegion,
  MetricCard,
  PermissionAction,
  StatusPill,
  WorkflowStateCard,
  WorkspaceIntro,
} from '@/components/operations-workspace';
import { operationsEndpoints } from '@/lib/operations-api';
import { syntheticFinanceSession } from '@/lib/session';

export const metadata: Metadata = { title: 'Commercial finance' };

const subscriptions = [
  {
    id: 'SUB-S9-001',
    provider: 'Synthetic Copperbelt Repairs',
    product: 'Provider workspace core',
    status: 'Active',
    tone: 'success' as const,
    revision: 2,
    entitlement: 'Active',
    nextBoundary: '2026-08-17',
  },
  {
    id: 'SUB-S9-002',
    provider: 'Synthetic Garden Care',
    product: 'Provider workspace core',
    status: 'Grace',
    tone: 'warning' as const,
    revision: 4,
    entitlement: 'Limited',
    nextBoundary: 'Grace ends in 4 days',
  },
  {
    id: 'SUB-S9-003',
    provider: 'Synthetic Mobile Mechanic',
    product: 'Provider workspace core',
    status: 'Past due',
    tone: 'danger' as const,
    revision: 5,
    entitlement: 'Suspended',
    nextBoundary: 'Recovery required',
  },
] as const;

const payments = [
  {
    id: 'PAY-S9-001',
    invoice: 'SYN-20260717-DEMO0001',
    provider: 'Synthetic Copperbelt Repairs',
    amount: 'ZMW 150.00',
    status: 'Succeeded',
    tone: 'success' as const,
    ledger: 'Balanced',
    reconciliation: 'None',
  },
  {
    id: 'PAY-S9-002',
    invoice: 'SYN-20260717-DEMO0002',
    provider: 'Synthetic Garden Care',
    amount: 'ZMW 150.00',
    status: 'Reversed',
    tone: 'warning' as const,
    ledger: 'Balanced reversal',
    reconciliation: 'None',
  },
  {
    id: 'PAY-S9-003',
    invoice: 'SYN-20260717-DEMO0003',
    provider: 'Synthetic Mobile Mechanic',
    amount: 'ZMW 149.99 observed',
    status: 'Requires action',
    tone: 'info' as const,
    ledger: 'No posting',
    reconciliation: 'Amount mismatch open',
  },
] as const;

const adjustments = [
  {
    id: 'ADJ-S9-001',
    provider: 'Synthetic Garden Care',
    type: 'Synthetic refund',
    amount: 'ZMW 10.00',
    status: 'Requested',
    tone: 'info' as const,
    approvals: '1 of 2',
  },
  {
    id: 'ADJ-S9-002',
    provider: 'Synthetic Copperbelt Repairs',
    type: 'Credit',
    amount: 'ZMW 5.00',
    status: 'Applied',
    tone: 'success' as const,
    approvals: '2 of 2',
  },
] as const;

export default function CommercialFinancePage() {
  return (
    <section aria-labelledby="commercial-finance-heading">
      <WorkspaceIntro
        eyebrow="Stage 9D–9F · synthetic commercial controls"
        title="Commercial finance and reconciliation"
        description="Operate products, subscriptions, immutable invoices, signed synthetic payment events, balanced ledger postings and reconciliation without affecting verification, publication, reviews or ranking."
        headingId="commercial-finance-heading"
      >
        <PermissionAction
          session={syntheticFinanceSession}
          permission="commercial.reconciliation.manage"
          label="Open reconciliation action"
          deniedLabel="Reconciliation denied"
          accessKey="r"
        />
      </WorkspaceIntro>

      <div className="metric-grid" aria-label="Commercial control summary">
        <MetricCard
          label="Active subscriptions"
          value="1"
          note="Entitlements are product-scoped and never represent verification."
          tone="success"
        />
        <MetricCard
          label="Grace or past due"
          value="2"
          note="Grace limits access; past due suspends commercial entitlements only."
          tone="warning"
        />
        <MetricCard
          label="Open reconciliation"
          value="1"
          note="Mismatched webhook amounts do not mutate payment state or ledger."
          tone="danger"
        />
        <MetricCard
          label="Trust mutations"
          value="0"
          note="Commercial state cannot create claims, publication or ranking."
          tone="neutral"
        />
      </div>

      <DenseTableRegion label="Synthetic subscription lifecycle queue">
        <table>
          <caption>Provider subscriptions and entitlements</caption>
          <thead>
            <tr>
              <th scope="col">Subscription</th>
              <th scope="col">Provider</th>
              <th scope="col">Product</th>
              <th scope="col">Status</th>
              <th scope="col">Revision</th>
              <th scope="col">Entitlement</th>
              <th scope="col">Next boundary</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
              <tr key={subscription.id} data-queue-row tabIndex={0}>
                <th scope="row">{subscription.id}</th>
                <td>{subscription.provider}</td>
                <td>{subscription.product}</td>
                <td>
                  <StatusPill tone={subscription.tone}>{subscription.status}</StatusPill>
                </td>
                <td>{subscription.revision}</td>
                <td>{subscription.entitlement}</td>
                <td>{subscription.nextBoundary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DenseTableRegion>

      <DenseTableRegion label="Synthetic invoice payment and reconciliation queue">
        <table>
          <caption>Backend-confirmed payments and ledger state</caption>
          <thead>
            <tr>
              <th scope="col">Payment</th>
              <th scope="col">Invoice</th>
              <th scope="col">Provider</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
              <th scope="col">Ledger</th>
              <th scope="col">Reconciliation</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} data-queue-row tabIndex={0}>
                <th scope="row">{payment.id}</th>
                <td>{payment.invoice}</td>
                <td>{payment.provider}</td>
                <td>{payment.amount}</td>
                <td>
                  <StatusPill tone={payment.tone}>{payment.status}</StatusPill>
                </td>
                <td>{payment.ledger}</td>
                <td>{payment.reconciliation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DenseTableRegion>

      <DenseTableRegion label="Separated commercial adjustment approvals">
        <table>
          <caption>Adjustment and synthetic refund controls</caption>
          <thead>
            <tr>
              <th scope="col">Adjustment</th>
              <th scope="col">Provider</th>
              <th scope="col">Type</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
              <th scope="col">Independent approvals</th>
            </tr>
          </thead>
          <tbody>
            {adjustments.map((adjustment) => (
              <tr key={adjustment.id} data-queue-row tabIndex={0}>
                <th scope="row">{adjustment.id}</th>
                <td>{adjustment.provider}</td>
                <td>{adjustment.type}</td>
                <td>{adjustment.amount}</td>
                <td>
                  <StatusPill tone={adjustment.tone}>{adjustment.status}</StatusPill>
                </td>
                <td>{adjustment.approvals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DenseTableRegion>

      <section className="workspace-panel" aria-labelledby="commercial-contract-heading">
        <h2 id="commercial-contract-heading">Commercial trust contract</h2>
        <dl className="definition-grid">
          <div>
            <dt>Provider mode</dt>
            <dd>Synthetic or disabled only</dd>
          </div>
          <div>
            <dt>Amounts</dt>
            <dd>Immutable currency and minor-unit snapshots</dd>
          </div>
          <div>
            <dt>Webhook acceptance</dt>
            <dd>Signature, freshness, scope and replay checks first</dd>
          </div>
          <div>
            <dt>Ledger</dt>
            <dd>Two-sided append-only posting</dd>
          </div>
          <div>
            <dt>Adjustment approval</dt>
            <dd>Requester excluded; two independent approvals</dd>
          </div>
          <div>
            <dt>Trust effect</dt>
            <dd>None</dd>
          </div>
        </dl>
      </section>

      <div className="workflow-state-grid" aria-label="Commercial critical states">
        <WorkflowStateCard
          state="loading"
          title="Commercial workspace loading"
          description="Loading shells contain no credential, contact, evidence or raw webhook data."
          tone="info"
        />
        <WorkflowStateCard
          state="empty"
          title="No commercial records"
          description="An empty provider subscription or reconciliation queue is valid."
          tone="neutral"
        />
        <WorkflowStateCard
          state="stale_revision"
          title="Commercial state changed"
          description="Refresh the current subscription, payment or reconciliation revision before acting."
          tone="warning"
        />
        <WorkflowStateCard
          state="access_denied"
          title="Finance permission required"
          description="Trust supervisors and reviewers cannot post ledger entries or approve adjustments."
          tone="danger"
        />
      </div>

      <p className="api-boundary-note">
        API-only boundaries: <code>{operationsEndpoints.commercial}</code>,{' '}
        <code>{operationsEndpoints.commercialSubscriptionTransition('subscription-id')}</code>,{' '}
        <code>{operationsEndpoints.commercialReconciliationTransition('case-id')}</code> and{' '}
        <code>{operationsEndpoints.commercialAdjustmentDecision('adjustment-id')}</code>. No direct
        PostgreSQL, Supabase or payment-provider client is imported by this portal.
      </p>
    </section>
  );
}
