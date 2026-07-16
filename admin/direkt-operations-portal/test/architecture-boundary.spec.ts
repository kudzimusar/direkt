import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(path)
      : ['.ts', '.tsx'].includes(extname(entry.name))
        ? [path]
        : [];
  });
}

describe('operations portal architecture boundary', () => {
  it('contains no direct backend, database or object-storage imports', () => {
    const root = join(process.cwd(), 'src');
    const violations = sourceFiles(root).flatMap((path) => {
      const source = readFileSync(path, 'utf8');
      const prohibited = [
        /from\s+['"][^'"]*backend\//,
        /from\s+['"][^'"]*database/,
        /from\s+['"][^'"]*(?:supabase|postgres|postgis|pg)['"]/, 
        /from\s+['"][^'"]*(?:s3|object-storage|storage-adapter)['"]/, 
      ];
      return prohibited.some((pattern) => pattern.test(source))
        ? [relative(process.cwd(), path)]
        : [];
    });

    expect(violations).toEqual([]);
  });

  it('defines all Stage 7 data access through versioned API routes', () => {
    const client = readFileSync(join(process.cwd(), 'src/lib/operations-api.ts'), 'utf8');

    expect(client).toContain('/api/v1/operations/verification-queue');
    expect(client).toContain('/api/v1/operations/field-work-items');
    expect(client).toContain('/api/v1/operations/escalations');
    expect(client).toContain('/api/v1/operations/incidents');
    expect(client).toContain('/api/v1/operations/reporting/metrics');
    expect(client).not.toContain('DATABASE_URL');
    expect(client).not.toContain('objectKey');
  });
});
