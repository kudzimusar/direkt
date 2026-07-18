import { describe, expect, it } from 'vitest';
import { environmentSchema } from '../../src/config/environment';

const approvedPilotConfig = {
  NODE_ENV: 'test',
  DIREKT_ENVIRONMENT: 'pilot',
  DIREKT_DATA_MODE: 'controlled-pilot',
  DIREKT_TRAFFIC_MODE: 'disabled',
  PILOT_ENTRY_APPROVED: true,
  AUTH_CHALLENGE_MODE: 'disabled',
  EVIDENCE_STORAGE_PROVIDER: 'supabase',
  SUPABASE_URL: 'https://aeeuscifrxcjmnswqwnq.supabase.co',
  SUPABASE_SECRET_KEY: 'phase11-test-secret-key-value',
  PAYMENT_PROVIDER_MODE: 'disabled',
} as const;

function validationMessage(overrides: Record<string, unknown>): string {
  const result = environmentSchema.validate({
    ...approvedPilotConfig,
    ...overrides,
  });
  return result.error?.message ?? '';
}

describe('Phase 11 controlled-pilot configuration', () => {
  it('accepts only the traffic-disabled, approved pilot preparation boundary', () => {
    const result = environmentSchema.validate(approvedPilotConfig);
    expect(result.error).toBeUndefined();
    expect(result.value.PILOT_ENTRY_APPROVED).toBe(true);
    expect(result.value.DIREKT_DATA_MODE).toBe('controlled-pilot');
  });

  it('rejects controlled-pilot data mode without the explicit entry latch', () => {
    expect(validationMessage({ PILOT_ENTRY_APPROVED: false })).toContain(
      'Controlled-pilot data mode requires the explicit PILOT_ENTRY_APPROVED technical latch.',
    );
  });

  it('rejects a stale approval latch outside controlled-pilot data mode', () => {
    expect(validationMessage({ DIREKT_DATA_MODE: 'synthetic-only' })).toContain(
      'PILOT_ENTRY_APPROVED may be true only with DIREKT_DATA_MODE=controlled-pilot.',
    );
  });

  it('rejects controlled-pilot mode outside the dedicated pilot environment', () => {
    expect(validationMessage({ DIREKT_ENVIRONMENT: 'staging' })).toContain(
      'Controlled-pilot data mode requires DIREKT_ENVIRONMENT=pilot.',
    );
  });

  it('rejects synthetic evidence storage for controlled-pilot data', () => {
    expect(validationMessage({ EVIDENCE_STORAGE_PROVIDER: 'synthetic' })).toContain(
      'Controlled-pilot data mode requires the approved private Supabase storage boundary.',
    );
  });

  it('rejects synthetic authentication challenges for controlled-pilot mode', () => {
    expect(validationMessage({ AUTH_CHALLENGE_MODE: 'synthetic' })).toContain(
      'Controlled-pilot data mode cannot use synthetic authentication challenges.',
    );
  });

  it('rejects synthetic payment mode for controlled-pilot mode', () => {
    expect(validationMessage({ PAYMENT_PROVIDER_MODE: 'synthetic' })).toContain(
      'Controlled-pilot data mode requires payments to remain disabled until separately approved.',
    );
  });

  it('keeps controlled-pilot traffic disabled until participant access and auth are approved', () => {
    expect(validationMessage({ DIREKT_TRAFFIC_MODE: 'internal' })).toContain(
      'Controlled-pilot data mode remains traffic-disabled until an approved participant access and authentication path is implemented.',
    );
  });
});
