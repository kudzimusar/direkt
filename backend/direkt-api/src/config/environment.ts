import * as Joi from 'joi';

export type NodeEnvironment = 'development' | 'test' | 'production';
export type EvidenceStorageProvider = 'synthetic' | 'supabase';

export interface DirektEnvironment {
  NODE_ENV: NodeEnvironment;
  PORT: number;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  DATABASE_URL: string;
  DIRECT_DATABASE_URL?: string;
  CORS_ORIGINS: string;
  AUTH_CHALLENGE_MODE: 'synthetic' | 'disabled';
  ACCESS_TOKEN_SECRET: string;
  CONTACT_HASH_PEPPER: string;
  CHALLENGE_HASH_PEPPER: string;
  ACCESS_TOKEN_TTL_SECONDS: number;
  REFRESH_TOKEN_TTL_DAYS: number;
  CHALLENGE_TTL_SECONDS: number;
  EVIDENCE_STORAGE_PROVIDER: EvidenceStorageProvider;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_EVIDENCE_BUCKET: string;
  SUPABASE_PRIVATE_MEDIA_BUCKET: string;
  SUPABASE_PUBLIC_MEDIA_BUCKET: string;
  SUPABASE_SYSTEM_EXPORTS_BUCKET: string;
}

const databaseUrlSchema = Joi.string().uri({ scheme: ['postgresql', 'postgres'] });
const longSecret = Joi.string().min(64).max(512);
const bucketName = Joi.string().pattern(/^[a-z0-9][a-z0-9-]{1,62}$/);

export const environmentSchema = Joi.object<DirektEnvironment>({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
  DATABASE_URL: databaseUrlSchema.when('NODE_ENV', {
    is: 'production',
    then: databaseUrlSchema.required(),
    otherwise: databaseUrlSchema.default('postgresql://direkt:direkt_dev@localhost:5432/direkt'),
  }),
  DIRECT_DATABASE_URL: databaseUrlSchema.optional(),
  CORS_ORIGINS: Joi.string().allow('').default(''),
  AUTH_CHALLENGE_MODE: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.valid('disabled').default('disabled'),
    otherwise: Joi.valid('synthetic', 'disabled').default('synthetic'),
  }),
  ACCESS_TOKEN_SECRET: longSecret.when('NODE_ENV', {
    is: 'production',
    then: longSecret.required(),
    otherwise: longSecret.default(
      'direkt-development-access-token-secret-not-for-production-000000000001',
    ),
  }),
  CONTACT_HASH_PEPPER: longSecret.when('NODE_ENV', {
    is: 'production',
    then: longSecret.required(),
    otherwise: longSecret.default(
      'direkt-development-contact-hash-pepper-not-for-production-000000001',
    ),
  }),
  CHALLENGE_HASH_PEPPER: longSecret.when('NODE_ENV', {
    is: 'production',
    then: longSecret.required(),
    otherwise: longSecret.default(
      'direkt-development-challenge-hash-pepper-not-for-production-0000001',
    ),
  }),
  ACCESS_TOKEN_TTL_SECONDS: Joi.number().integer().min(60).max(900).default(600),
  REFRESH_TOKEN_TTL_DAYS: Joi.number().integer().min(1).max(90).default(30),
  CHALLENGE_TTL_SECONDS: Joi.number().integer().min(60).max(600).default(300),
  EVIDENCE_STORAGE_PROVIDER: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.valid('supabase').default('supabase'),
    otherwise: Joi.valid('synthetic', 'supabase').default('synthetic'),
  }),
  SUPABASE_URL: Joi.string()
    .uri({ scheme: ['https'] })
    .when('EVIDENCE_STORAGE_PROVIDER', {
      is: 'supabase',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().min(20).max(2048).when('EVIDENCE_STORAGE_PROVIDER', {
    is: 'supabase',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  SUPABASE_EVIDENCE_BUCKET: bucketName.default('provider-evidence'),
  SUPABASE_PRIVATE_MEDIA_BUCKET: bucketName.default('provider-media-private'),
  SUPABASE_PUBLIC_MEDIA_BUCKET: bucketName.default('provider-media-public'),
  SUPABASE_SYSTEM_EXPORTS_BUCKET: bucketName.default('system-exports'),
});

export function parseCorsOrigins(value: string | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
