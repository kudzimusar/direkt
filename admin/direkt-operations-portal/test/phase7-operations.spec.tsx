import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import EvidenceReviewPage from '../src/app/operations/evidence-review/page';
import EscalationsPage from '../src/app/operations/escalations/page';
import FieldWorkPage from '../src/app/operations/field-work/page';
import IncidentsPage from '../src/app/operations/incidents/page';
import OperationsPage from '../src/app/operations/page';
import ReportingPage from '../src/app/operations/reporting/page';
import TriagePage from '../src/app/operations/triage/page';

const pages = [
  ['mission control', OperationsPage],
  ['triage', TriagePage],
  ['evidence review', EvidenceReviewPage],
  ['field work', FieldWorkPage],
  ['escalations', EscalationsPage],
  ['incidents', IncidentsPage],
  ['reporting', ReportingPage],
] as const;

describe('Phase 7 operations portal', () => {
  it.each(pages)('renders the %s workspace as synthetic and API-only', (_, Page) => {
    const markup = renderToStaticMarkup(<Page />);

    expect(markup).toContain('Synthetic');
    expect(markup).toContain('API');
    expect(markup).not.toContain('postgres://');
    expect(markup).not.toContain('service_role');
    expect(markup).not.toContain('private/00000000');
  });

  it('renders focusable triage rows and all documented queue states', () => {
    const markup = renderToStaticMarkup(<TriagePage />);

    expect(markup).toContain('data-operations-filter="true"');
    expect(markup).toContain('data-queue-row="true"');
    expect(markup).toContain('data-workflow-state="loading"');
    expect(markup).toContain('data-workflow-state="empty"');
    expect(markup).toContain('data-workflow-state="overdue"');
    expect(markup).toContain('data-workflow-state="access_denied"');
  });

  it('keeps evidence review storage-safe and revocation-aware', () => {
    const markup = renderToStaticMarkup(<EvidenceReviewPage />);

    expect(markup).toContain('Request 5-minute access');
    expect(markup).toContain('Revoke active grant');
    expect(markup).toContain('data-workflow-state="revoked_assignment"');
    expect(markup).toContain('data-workflow-state="expired_grant"');
    expect(markup).not.toContain('objectKey');
    expect(markup).not.toContain('persistent URL');
  });

  it('labels field observations advisory and non-decisional', () => {
    const markup = renderToStaticMarkup(<FieldWorkPage />);

    expect(markup).toContain('Advisory only');
    expect(markup).toContain('cannot create claims or final decisions');
    expect(markup).toContain('Unable to verify');
    expect(markup).toContain('Missed');
    expect(markup).not.toContain('Publish provider');
  });

  it('shows two independent override approvals without implying a decision', () => {
    const markup = renderToStaticMarkup(<EscalationsPage />);

    expect(markup).toContain('Four-eyes approval');
    expect(markup).toContain('Approver 1');
    expect(markup).toContain('Approver 2');
    expect(markup).toContain('None until a separate decision');
    expect(markup).toContain('Duplicate approver');
  });

  it('keeps incidents bounded and reports aggregate-only exports', () => {
    const incidents = renderToStaticMarkup(<IncidentsPage />);
    const reporting = renderToStaticMarkup(<ReportingPage />);

    expect(incidents).toContain('does not implement customer reviews');
    expect(incidents).toContain('Private details');
    expect(incidents).toContain('never returned');
    expect(reporting).toContain('Fixed export allowlist');
    expect(reporting).toContain('Always excluded');
    expect(reporting).not.toContain('Identity number:');
  });
});
