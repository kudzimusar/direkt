import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import ts from 'typescript';

const HTTP_DECORATORS = new Set([
  'All',
  'Delete',
  'Get',
  'Head',
  'Options',
  'Patch',
  'Post',
  'Put',
]);

interface RoutePolicyRecord {
  file: string;
  className: string;
  methodName: string;
  httpDecorators: string[];
  policy: 'public' | 'permission';
  permissionExpression: string | null;
}

interface Violation {
  file: string;
  symbol: string;
  message: string;
}

function decoratorName(decorator: ts.Decorator): string | null {
  const expression = decorator.expression;
  if (ts.isCallExpression(expression)) {
    return ts.isIdentifier(expression.expression) ? expression.expression.text : null;
  }
  return ts.isIdentifier(expression) ? expression.text : null;
}

function decorators(node: ts.Node): readonly ts.Decorator[] {
  return ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : [];
}

function permissionExpression(nodeDecorators: readonly ts.Decorator[]): string | null {
  const decorator = nodeDecorators.find(
    (candidate) => decoratorName(candidate) === 'RequirePermission',
  );
  if (!decorator || !ts.isCallExpression(decorator.expression)) {
    return null;
  }
  return decorator.expression.arguments[0]?.getText() ?? null;
}

async function controllerFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map(async (entry) => {
      const path = join(root, entry.name);
      if (entry.isDirectory()) {
        return controllerFiles(path);
      }
      return entry.isFile() && entry.name.endsWith('.controller.ts') ? [path] : [];
    }),
  );
  return paths.flat().sort();
}

async function main(): Promise<void> {
  const sourceRoot = join(process.cwd(), 'src');
  const files = await controllerFiles(sourceRoot);
  const records: RoutePolicyRecord[] = [];
  const violations: Violation[] = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    const displayFile = relative(process.cwd(), file);

    for (const statement of sourceFile.statements) {
      if (!ts.isClassDeclaration(statement) || !statement.name) {
        continue;
      }
      const classDecorators = decorators(statement);
      const classPublic = classDecorators.some((item) => decoratorName(item) === 'PublicRoute');
      const classPermission = permissionExpression(classDecorators);

      for (const member of statement.members) {
        if (!ts.isMethodDeclaration(member) || !member.name) {
          continue;
        }
        const methodDecorators = decorators(member);
        const httpDecorators = methodDecorators
          .map(decoratorName)
          .filter((name): name is string => name !== null && HTTP_DECORATORS.has(name));
        if (httpDecorators.length === 0) {
          continue;
        }

        const methodName = member.name.getText(sourceFile);
        const symbol = `${statement.name.text}.${methodName}`;
        const methodPublic = methodDecorators.some((item) => decoratorName(item) === 'PublicRoute');
        const methodPermission = permissionExpression(methodDecorators);
        const isPublic = methodPublic || classPublic;
        const permission = methodPermission ?? classPermission;

        if (isPublic && permission) {
          violations.push({
            file: displayFile,
            symbol,
            message: 'Route declares both public and permission policies.',
          });
          continue;
        }
        if (!isPublic && !permission) {
          violations.push({
            file: displayFile,
            symbol,
            message: 'Route has no explicit public or permission policy.',
          });
          continue;
        }
        if (permission && !permission.startsWith('PERMISSIONS.')) {
          violations.push({
            file: displayFile,
            symbol,
            message: `Permission must use the PERMISSIONS registry: ${permission}`,
          });
          continue;
        }

        records.push({
          file: displayFile,
          className: statement.name.text,
          methodName,
          httpDecorators,
          policy: isPublic ? 'public' : 'permission',
          permissionExpression: permission,
        });
      }
    }
  }

  const outputPath = join(process.cwd(), 'artifacts/diagnostics/authorization-policies.json');
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        controllerFiles: files.length,
        routePolicies: records,
        violations,
      },
      null,
      2,
    )}\n`,
  );

  if (violations.length > 0) {
    for (const violation of violations) {
      process.stderr.write(`${violation.file} ${violation.symbol}: ${violation.message}\n`);
    }
    throw new Error(`Authorization policy check found ${violations.length} violation(s).`);
  }

  process.stdout.write(
    `${JSON.stringify({ event: 'authorization_policy_check_passed', controllerFiles: files.length, routeCount: records.length })}\n`,
  );
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown authorization policy failure';
  process.stderr.write(
    `${JSON.stringify({ event: 'authorization_policy_check_failed', message })}\n`,
  );
  process.exitCode = 1;
});
