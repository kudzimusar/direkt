import type { PublicAvailability, PublicOperatingModel } from "../contracts/discovery";

const CATEGORY_OR_CLAIM = /^[a-z][a-z0-9_]{2,63}$/;
const OPERATING_MODELS = new Set<PublicOperatingModel>(["fixed_premises", "mobile", "hybrid"]);
const AVAILABILITY = new Set<PublicAvailability>([
  "available",
  "limited",
  "unavailable",
  "unknown",
]);
const ALLOWED_KEYS = new Set([
  "q",
  "category",
  "area",
  "latitude",
  "longitude",
  "radiusKm",
  "operatingModel",
  "availability",
  "claim",
  "limit",
  "cursor",
]);

export class DiscoveryQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DiscoveryQueryError";
  }
}

export function sanitizeDiscoverySearchParams(input: URLSearchParams): URLSearchParams {
  for (const key of input.keys()) {
    if (!ALLOWED_KEYS.has(key)) {
      throw new DiscoveryQueryError(`Unsupported discovery query parameter: ${key}`);
    }
  }

  const output = new URLSearchParams();
  copyBoundedString(input, output, "q", 1, 120);
  copyPattern(input, output, "category", CATEGORY_OR_CLAIM);
  copyBoundedString(input, output, "area", 2, 160);
  copyPattern(input, output, "claim", CATEGORY_OR_CLAIM);
  copyBoundedString(input, output, "cursor", 4, 500);

  const latitude = optionalNumber(input, "latitude", -90, 90);
  const longitude = optionalNumber(input, "longitude", -180, 180);
  if ((latitude === null) !== (longitude === null)) {
    throw new DiscoveryQueryError("Latitude and longitude must be supplied together");
  }
  if (latitude !== null && longitude !== null) {
    output.set("latitude", String(latitude));
    output.set("longitude", String(longitude));
  }

  const radiusKm = optionalNumber(input, "radiusKm", 1, 100, 1);
  if (radiusKm !== null) output.set("radiusKm", String(radiusKm));

  const operatingModel = optionalSingle(input, "operatingModel");
  if (operatingModel) {
    if (!OPERATING_MODELS.has(operatingModel as PublicOperatingModel)) {
      throw new DiscoveryQueryError("Unsupported operatingModel value");
    }
    output.set("operatingModel", operatingModel);
  }

  const availability = optionalSingle(input, "availability");
  if (availability) {
    if (!AVAILABILITY.has(availability as PublicAvailability)) {
      throw new DiscoveryQueryError("Unsupported availability value");
    }
    output.set("availability", availability);
  }

  const limit = optionalInteger(input, "limit", 1, 50);
  if (limit !== null) output.set("limit", String(limit));

  return output;
}

function optionalSingle(input: URLSearchParams, key: string): string | null {
  const values = input.getAll(key);
  if (values.length > 1) throw new DiscoveryQueryError(`${key} may be supplied only once`);
  const value = values[0]?.trim() ?? "";
  return value || null;
}

function copyBoundedString(
  input: URLSearchParams,
  output: URLSearchParams,
  key: string,
  min: number,
  max: number,
) {
  const value = optionalSingle(input, key);
  if (value === null) return;
  if (value.length < min || value.length > max) {
    throw new DiscoveryQueryError(`${key} must be ${min}-${max} characters`);
  }
  output.set(key, value);
}

function copyPattern(
  input: URLSearchParams,
  output: URLSearchParams,
  key: string,
  pattern: RegExp,
) {
  const value = optionalSingle(input, key);
  if (value === null) return;
  if (!pattern.test(value)) throw new DiscoveryQueryError(`${key} has an invalid format`);
  output.set(key, value);
}

function optionalNumber(
  input: URLSearchParams,
  key: string,
  min: number,
  max: number,
  maxDecimalPlaces?: number,
): number | null {
  const value = optionalSingle(input, key);
  if (value === null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new DiscoveryQueryError(`${key} must be a number from ${min} to ${max}`);
  }
  if (maxDecimalPlaces !== undefined) {
    const scale = 10 ** maxDecimalPlaces;
    if (Math.round(parsed * scale) !== parsed * scale) {
      throw new DiscoveryQueryError(`${key} supports at most ${maxDecimalPlaces} decimal place`);
    }
  }
  return parsed;
}

function optionalInteger(
  input: URLSearchParams,
  key: string,
  min: number,
  max: number,
): number | null {
  const value = optionalSingle(input, key);
  if (value === null) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new DiscoveryQueryError(`${key} must be an integer from ${min} to ${max}`);
  }
  return parsed;
}
