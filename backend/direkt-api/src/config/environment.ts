import * as Joi from 'joi';

export type NodeEnvironment = 'development' | 'test' | 'production';

export interface DirektEnvironment {
  NODE_ENV: NodeEnvironment;
  PORT: number;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  DATABASE_URL: string;
  CORS_ORIGINS: string;
}

export const environmentSchema = Joi.object<DirektEnvironment>({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .default('postgresql://direkt:direkt_dev@localhost:5432/direkt'),
  CORS_ORIGINS: Joi.string().allow('').default(''),
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
