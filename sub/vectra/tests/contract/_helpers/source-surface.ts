import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

export type LeafExportEntry = {
  exportName: string;
  leafPath: string;
};

export type FunctionLeafExportEntry = {
  readonly fnName: string;
  readonly leafPath: string;
};

export type DomainSurface = {
  domain: string;
  sourceLeafExports: LeafExportEntry[];
  fixtureLeafExports: LeafExportEntry[];
};

const helperDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = dirname(dirname(dirname(helperDir)));
const sourceRoot = join(packageRoot, 'src');
const fixtureDir = join(dirname(helperDir), '_fixtures');

function toPosixPath(path: string): string {
  return path.split(sep).join('/');
}

function listFiles(dirPath: string): string[] {
  return readdirSync(dirPath).flatMap((entry) => {
    const entryPath = join(dirPath, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      return listFiles(entryPath);
    }
    if (stats.isFile()) {
      return [entryPath];
    }

    return [];
  });
}

function isRuntimeExportModifier(statement: ts.Statement): boolean {
  return (
    ts.canHaveModifiers(statement) &&
    (ts.getModifiers(statement) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
  );
}

function exportedBindingNames(name: ts.BindingName): string[] {
  if (ts.isIdentifier(name)) {
    return [name.text];
  }

  return name.elements.flatMap((element) => {
    if (ts.isOmittedExpression(element)) {
      return [];
    }

    return exportedBindingNames(element.name);
  });
}

function runtimeExportNamesFromSource(filePath: string): string[] {
  const sourceText = readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const exportNames: string[] = [];

  for (const statement of sourceFile.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (statement.isTypeOnly || !statement.exportClause || !ts.isNamedExports(statement.exportClause)) {
        continue;
      }

      for (const element of statement.exportClause.elements) {
        if (!element.isTypeOnly) {
          exportNames.push(element.name.text);
        }
      }
      continue;
    }

    if (!isRuntimeExportModifier(statement)) {
      continue;
    }

    if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement) || ts.isEnumDeclaration(statement)) {
      if (statement.name) {
        exportNames.push(statement.name.text);
      }
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        exportNames.push(...exportedBindingNames(declaration.name));
      }
    }
  }

  return Array.from(new Set(exportNames)).sort();
}

function isPublicLeafSourceFile(filePath: string): boolean {
  const fileName = filePath.split(sep).pop() ?? '';

  return (
    fileName.endsWith('.ts') &&
    !fileName.endsWith('.d.ts') &&
    fileName !== 'index.ts' &&
    !fileName.includes('.internal.')
  );
}

export function deriveSourceLeafExportsForDomain(domain: string): LeafExportEntry[] {
  const domainRoot = join(sourceRoot, domain);

  return listFiles(domainRoot)
    .filter(isPublicLeafSourceFile)
    .flatMap((filePath) => {
      const leafPath = toPosixPath(relative(domainRoot, filePath)).replace(/\.ts$/, '');

      return runtimeExportNamesFromSource(filePath).map((exportName) => ({ exportName, leafPath }));
    })
    .sort(compareLeafExportEntry);
}

export function deriveFunctionLeafExportsForDomain(domain: string): FunctionLeafExportEntry[] {
  return deriveSourceLeafExportsForDomain(domain).map(({ exportName, leafPath }) => ({
    fnName: exportName,
    leafPath,
  }));
}

function compareLeafExportEntry(a: LeafExportEntry, b: LeafExportEntry): number {
  return a.leafPath.localeCompare(b.leafPath) || a.exportName.localeCompare(b.exportName);
}

function fixtureDomainFromFileName(fileName: string): string {
  return fileName.replace(/-leaf-exports\.ts$/, '');
}

async function loadFixtureLeafExports(filePath: string): Promise<LeafExportEntry[]> {
  const fixtureModule = (await import(pathToFileURL(filePath).href)) as Record<string, unknown>;
  const fixtureValue = Object.values(fixtureModule).find(Array.isArray);

  if (!fixtureValue) {
    throw new Error(`fixture export array를 찾을 수 없다: ${filePath}`);
  }

  return fixtureValue
    .map((entry) => {
      const record = entry as { fnName?: string; exportName?: string; leafPath?: string };
      const exportName = record.fnName ?? record.exportName;

      if (!exportName || !record.leafPath) {
        throw new Error(`fixture entry shape가 잘못됐다: ${filePath}`);
      }

      return { exportName, leafPath: record.leafPath };
    })
    .sort(compareLeafExportEntry);
}

export async function deriveDomainSurfaces(): Promise<DomainSurface[]> {
  const fixtureFiles = readdirSync(fixtureDir)
    .filter((fileName) => fileName.endsWith('-leaf-exports.ts'))
    .sort();
  const surfaces: DomainSurface[] = [];

  for (const fileName of fixtureFiles) {
    const domain = fixtureDomainFromFileName(fileName);
    const fixturePath = join(fixtureDir, fileName);

    surfaces.push({
      domain,
      sourceLeafExports: deriveSourceLeafExportsForDomain(domain),
      fixtureLeafExports: await loadFixtureLeafExports(fixturePath),
    });
  }

  return surfaces;
}

export function deriveBarrelRuntimeExportNames(domain: string): string[] {
  return runtimeExportNamesFromSource(join(sourceRoot, domain, 'index.ts'));
}
