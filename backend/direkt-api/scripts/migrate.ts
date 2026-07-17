import { runMigrations } from './migration-lib';
import { directDatabaseUrl } from './runtime-config';

async function main(): Promise<void> {
  const result = await runMigrations(directDatabaseUrl());
  process.stdout.write(
    `${JSON.stringify({ event: 'migrations_completed', ...result }, null, 2)}\n`,
  );
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown migration failure';
  process.stderr.write(`${JSON.stringify({ event: 'migrations_failed', message })}\n`);
  process.exitCode = 1;
});
