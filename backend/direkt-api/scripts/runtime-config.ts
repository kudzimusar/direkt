const DEVELOPMENT_DATABASE_URL = 'postgresql://direkt:direkt_dev@localhost:5432/direkt';

export function databaseUrl(): string {
  const configured = process.env.DATABASE_URL?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is required in production.');
  }

  return DEVELOPMENT_DATABASE_URL;
}

export function directDatabaseUrl(): string {
  const configured = process.env.DIRECT_DATABASE_URL?.trim();
  if (configured) {
    return configured;
  }

  return databaseUrl();
}
