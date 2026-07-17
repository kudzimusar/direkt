import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CommercialFinancePage from '../src/app/operations/finance/page';
import { visibleNavigation } from '../src/lib/navigation';
import { syntheticFinanceSession, syntheticSupervisorSession } from '../src/lib/session';

describe('Stage 9 commercial operations workspace', () => {
  it('renders products subscriptions payments reconciliation and separated approvals', () => {
    const markup = renderToStaticMarkup(<CommercialFinancePage />);

    expect(markup).toContain('Commercial finance and reconciliation');
    expect(markup).toContain('Provider subscriptions and entitlements');
    expect(markup).toContain('Backend-confirmed payments and ledger state');
    expect(markup).toContain('Separated commercial adjustment approvals');
    expect(markup).toContain('Signature, freshness, scope and replay checks first');
    expect(markup).toContain('Two-sided append-only posting');
    expect(markup).toContain('Requester excluded; two independent approvals');
    expect(markup).toContain('/api/v1/operations/commercial');
    expect(markup).toContain('/api/v1/operations/commercial/reconciliation/case-id/transitions');
    expect(markup).not.toContain('cardNumber');
    expect(markup).not.toContain('mobileMoneyPin');
    expect(markup).not.toContain('service_role');
    expect(markup).not.toContain('customerContact');
    expect(markup).not.toContain('rawPayload');
  });

  it('exposes commercial navigation only to the dedicated permission family', () => {
    expect(visibleNavigation(syntheticFinanceSession).map((item) => item.label)).toContain(
      'Commercial finance',
    );
    expect(visibleNavigation(syntheticSupervisorSession).map((item) => item.label)).not.toContain(
      'Commercial finance',
    );
  });

  it('states critical loading empty stale and denied recovery semantics', () => {
    const markup = renderToStaticMarkup(<CommercialFinancePage />);

    expect(markup).toContain('Commercial workspace loading');
    expect(markup).toContain('No commercial records');
    expect(markup).toContain('Commercial state changed');
    expect(markup).toContain('Finance permission required');
    expect(markup).toContain('No direct PostgreSQL, Supabase or payment-provider client');
  });
});
