import { describe, expect, it } from 'vitest';
import {
  abuseControlPolicies,
  abuseControlPolicy,
} from '../../src/platform/security/abuse-control.policies';

describe('Phase 10 abuse-control policies', () => {
  it.each([
    ['POST', '/api/v1/auth/challenges', 'auth_challenge_request'],
    ['POST', '/api/v1/auth/challenges/verify', 'auth_challenge_verify'],
    ['POST', '/api/v1/auth/sessions/rotate', 'auth_session_rotate'],
    ['GET', '/api/v1/public/providers/search', 'public_discovery_search'],
    ['POST', '/api/v1/enquiries', 'interaction_enquiry_create'],
    [
      'POST',
      '/api/v1/interactions/00000000-0000-4000-8000-000000000001/reviews',
      'interaction_review_create',
    ],
    [
      'POST',
      '/api/v1/reviews/00000000-0000-4000-8000-000000000001/reports',
      'interaction_review_report',
    ],
    [
      'POST',
      '/api/v1/interactions/00000000-0000-4000-8000-000000000001/complaints',
      'interaction_complaint_create',
    ],
    ['POST', '/api/v1/webhooks/payments/synthetic', 'synthetic_payment_webhook'],
  ])('maps %s %s to %s', (method, path, expectedPolicy) => {
    expect(abuseControlPolicy(method, path)?.key).toBe(expectedPolicy);
  });

  it('does not throttle unrelated reads or similar-looking invalid identifiers', () => {
    expect(abuseControlPolicy('GET', '/api/v1/enquiries')).toBeNull();
    expect(abuseControlPolicy('POST', '/api/v1/interactions/not-a-uuid/reviews')).toBeNull();
    expect(abuseControlPolicy('GET', '/api/v1/public/providers/search-extra')).toBeNull();
  });

  it('keeps every policy bounded and uniquely named', () => {
    const policies = abuseControlPolicies();
    expect(new Set(policies.map((policy) => policy.key)).size).toBe(policies.length);
    for (const policy of policies) {
      expect(policy.requestLimit).toBeGreaterThan(0);
      expect(policy.windowSeconds).toBeGreaterThan(0);
      expect(policy.windowSeconds).toBeLessThanOrEqual(86_400);
    }
  });
});
