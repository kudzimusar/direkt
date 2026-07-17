import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const reportPath =
  process.env.PROTECTED_LITERAL_REPORT ?? 'artifacts/security/protected-literal-review.json';

const prohibitedRules = [
  {
    name: 'private-key',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  },
  {
    name: 'google-api-key',
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/,
  },
  {
    name: 'github-token',
    pattern: /\bgh[pousr]_[0-9A-Za-z]{20,}\b/,
  },
  {
    name: 'supabase-token',
    pattern: /\bsb(?:p|_secret)_[0-9A-Za-z_-]{12,}\b/,
  },
  {
    name: 'service-account-private-key',
    pattern: /"private_key"\s*:\s*"-----BEGIN/,
  },
  {
    name: 'credential-bearing-url',
    pattern: /\b(?:postgres(?:ql)?|https?):\/\/[^\s/:@]+:[^\s/@]+@/,
  },
];

function isSafeCredentialExample(line) {
  const disposableTarget =
    /(?:localhost|127\.0\.0\.1|direkt-postgres-readiness|@postgres(?::|\/))/i.test(line);
  const explicitPlaceholder = /(?:placeholder|YOUR[-_]PASSWORD|not-for-production)/i.test(line);
  const syntheticCredential = /direkt_(?:dev|ci|[a-z0-9_]*_ci)/i.test(line);
  const runtimeOnlyPostgresVariables =
    /\$\{POSTGRES_USER\}/.test(line) && /\$\{POSTGRES_PASSWORD\}/.test(line);
  return (
    explicitPlaceholder ||
    (disposableTarget && (syntheticCredential || runtimeOnlyPostgresVariables))
  );
}

function trackedFiles() {
  return execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter(Boolean);
}

const violations = [];
const safeExamples = [];
let scannedFiles = 0;

for (const file of trackedFiles()) {
  let content;
  try {
    content = await readFile(file, 'utf8');
  } catch {
    continue;
  }
  if (content.includes('\0')) {
    continue;
  }

  scannedFiles += 1;
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.includes('not-for-production')) {
      safeExamples.push({
        file,
        line: index + 1,
        classification: 'explicit-synthetic-placeholder',
      });
    }

    for (const rule of prohibitedRules) {
      if (!rule.pattern.test(line)) {
        continue;
      }
      if (rule.name === 'credential-bearing-url' && isSafeCredentialExample(line)) {
        safeExamples.push({
          file,
          line: index + 1,
          classification: 'synthetic-or-placeholder-credential-url',
        });
        continue;
      }
      violations.push({ file, line: index + 1, rule: rule.name });
    }
  });
}

const report = {
  schemaVersion: 1,
  scannedFiles,
  safeSyntheticExamples: safeExamples,
  violations,
};

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

for (const violation of violations) {
  console.error(
    `Protected-literal violation: ${violation.rule} at ${violation.file}:${violation.line}`,
  );
}

console.log(
  `Protected-literal review scanned ${scannedFiles} tracked files; ${safeExamples.length} explicit synthetic/example locations; ${violations.length} violations.`,
);

if (violations.length > 0) {
  process.exitCode = 1;
}
