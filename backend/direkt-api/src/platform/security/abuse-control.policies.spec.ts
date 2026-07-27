import { describe, expect, it } from 'vitest';
import { abuseControlPolicies, abuseControlPolicy } from './abuse-control.policies';

describe('abuseControlPolicy', () => {
  it.each([
    {
      method: 'POST',
      path: '/api/v1/public/discovery/assist',
      key: 'public_discovery_assist',
      requestLimit: 30,
      windowSeconds: 300,
    },
    {
      method: 'POST',
      path: '/api/v1/public/discovery/search-area/normalize',
      key: 'public_search_area_normalize',
      requestLimit: 20,
      windowSeconds: 300,
    },
    {
      method: 'POST',
      path: '/api/v1/public/support/assist',
      key: 'public_support_assist',
      requestLimit: 30,
      windowSeconds: 300,
    },
  ])('protects $path without a browser challenge', (expected) => {
    expect(abuseControlPolicy(expected.method, expected.path)).toMatchObject(expected);
  });

  it('normalizes the request method and leaves unrelated public reads outside the bounded policies', () => {
    expect(abuseControlPolicy('post', '/api/v1/public/support/assist')?.key).toBe(
      'public_support_assist',
    );
    expect(abuseControlPolicy('GET', '/api/v1/public/categories')).toBeNull();
  });

  it('keeps every abuse-control key unique', () => {
    const keys = abuseControlPolicies().map((policy) => policy.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
