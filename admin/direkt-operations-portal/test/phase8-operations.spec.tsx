import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CustomerComplaintsPage from '../src/app/operations/complaints/page';
import InteractionHistoryPage from '../src/app/operations/interactions/page';
import ReviewModerationPage from '../src/app/operations/reviews/page';

describe('Stage 8 operations workspaces', () => {
  it('renders privacy-safe interaction history through the operations API boundary', () => {
    const markup = renderToStaticMarkup(<InteractionHistoryPage />);

    expect(markup).toContain('Interaction history');
    expect(markup).toContain('Privacy-safe tracked interactions');
    expect(markup).toContain('/api/v1/operations/interactions');
    expect(markup).toContain('Customer identity');
    expect(markup).toContain('Excluded');
    expect(markup).not.toContain('customerIdentityId');
    expect(markup).not.toContain('contactDisplayHint');
    expect(markup).not.toContain('object_key');
  });

  it('renders reasoned moderation, optimistic revision and appeal recovery controls', () => {
    const markup = renderToStaticMarkup(<ReviewModerationPage />);

    expect(markup).toContain('Review moderation and appeals');
    expect(markup).toContain('Expected revision required');
    expect(markup).toContain('Restores the original withheld or removed state');
    expect(markup).toContain('/api/v1/operations/reviews');
    expect(markup).toContain('/api/v1/operations/review-appeals/appeal-id/decisions');
    expect(markup).not.toContain('customer_identity_id');
    expect(markup).not.toContain('reviewerIdentityId');
  });

  it('keeps customer complaints separate from Phase 7 internal incidents', () => {
    const markup = renderToStaticMarkup(<CustomerComplaintsPage />);

    expect(markup).toContain('Customer complaints');
    expect(markup).toContain('separate state machine from Phase 7 internal incidents');
    expect(markup).toContain('/api/v1/operations/interaction-complaints');
    expect(markup).toContain('/api/v1/operations/incidents');
    expect(markup).toContain('Phase 7 incidents');
    expect(markup).toContain('Not joined or exposed');
    expect(markup).not.toContain('private_detail');
    expect(markup).not.toContain('evidence_content');
  });
});
