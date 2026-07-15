import { describe, expect, it } from 'vitest';
import { canTransitionProfile, validateOperatingModel } from '../../src/phase3/provider-policy';

describe('Phase 3 provider policy', () => {
  it('allows only documented non-public profile transitions', () => {
    expect(canTransitionProfile('draft', 'complete')).toBe(true);
    expect(canTransitionProfile('complete', 'draft')).toBe(true);
    expect(canTransitionProfile('draft', 'archived')).toBe(true);
    expect(canTransitionProfile('archived', 'draft')).toBe(false);
    expect(canTransitionProfile('complete', 'complete')).toBe(true);
  });

  it('requires a service area for mobile operations', () => {
    expect(validateOperatingModel({ operatingModel: 'mobile' })).toEqual([
      'Mobile and hybrid providers require a service area.',
    ]);
    expect(
      validateOperatingModel({ operatingModel: 'mobile', serviceAreaLabel: 'Lusaka Central' }),
    ).toEqual([]);
  });

  it('requires a private premises label for fixed operations', () => {
    expect(validateOperatingModel({ operatingModel: 'fixed' })).toEqual([
      'Fixed and hybrid providers require a private premises label.',
    ]);
    expect(
      validateOperatingModel({ operatingModel: 'fixed', premisesLabel: 'Workshop reference' }),
    ).toEqual([]);
  });

  it('requires both operating references for hybrid operations', () => {
    expect(validateOperatingModel({ operatingModel: 'hybrid' })).toHaveLength(2);
    expect(
      validateOperatingModel({
        operatingModel: 'hybrid',
        serviceAreaLabel: 'Lusaka Central',
        premisesLabel: 'Private workshop reference',
      }),
    ).toEqual([]);
  });
});
