const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const ZAMBIA_PHONE = /(?:\+?260|0)?9[567]\d{7}\b/g;
const BEARER = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const JWT = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const COORDINATES = /-?\d{1,3}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}/g;

export function redactTelemetryText(value: string): string {
  return value
    .replace(EMAIL, '[redacted-email]')
    .replace(ZAMBIA_PHONE, '[redacted-phone]')
    .replace(BEARER, 'Bearer [redacted-token]')
    .replace(JWT, '[redacted-token]')
    .replace(COORDINATES, '[redacted-coordinates]')
    .slice(0, 500);
}

export function sanitizeTelemetryError(error: unknown): Error {
  if (error instanceof Error) {
    const sanitized = new Error(redactTelemetryText(error.message));
    sanitized.name = error.name;
    return sanitized;
  }

  return new Error('Non-Error exception captured.');
}
