export function normalizeWireDateTime(value: Date | string): string {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("DIREKT auth response returned an invalid date-time");
  }
  return parsed.toISOString();
}
