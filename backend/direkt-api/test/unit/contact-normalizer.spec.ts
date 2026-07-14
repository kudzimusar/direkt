import { describe, expect, it } from 'vitest';
import { normalizeContact } from '../../src/auth/contact-normalizer';

describe('normalizeContact', () => {
  it('normalizes email without returning a public full-value hint', () => {
    expect(normalizeContact('email', ' Operator@Example.Invalid ')).toEqual({
      channel: 'email',
      value: 'operator@example.invalid',
      displayHint: 'o***@example.invalid',
    });
  });

  it('normalizes an international phone number', () => {
    expect(normalizeContact('phone', '+260 97 123 4567')).toEqual({
      channel: 'phone',
      value: '+260971234567',
      displayHint: '+260***567',
    });
  });

  it('rejects ambiguous local phone numbers', () => {
    expect(() => normalizeContact('phone', '0971234567')).toThrow(
      /international format/i,
    );
  });
});
