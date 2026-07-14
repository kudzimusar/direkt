import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts', 'scripts/**/*.ts'],
      exclude: [
        'src/main.ts',
        'src/app.module.ts',
        'src/**/*.module.ts',
        'src/**/request-context.ts',
        'scripts/check-*.ts',
        'scripts/generate-openapi.ts',
        'scripts/migrate.ts',
        'scripts/seed-synthetic.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        statements: 70,
        branches: 50,
      },
    },
    restoreMocks: true,
    clearMocks: true,
  },
});
