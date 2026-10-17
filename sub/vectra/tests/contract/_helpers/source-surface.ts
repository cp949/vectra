import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { type BindingPattern, type ModuleExportName, parseSync } from 'oxc-parser';

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

function exportedBindingNames(pattern: BindingPattern | null): string[] {
  if (!pattern) {
    return [];
  }

  switch (pattern.type) {
    case 'Identifier':
      return [pattern.name];
    case 'ObjectPattern':
      return pattern.properties.flatMap((property) =>
        exportedBindingNames(property.type === 'RestElement' ? property.argument : property.value)
      );
    case 'ArrayPattern':
      return pattern.elements.flatMap((element) =>
        exportedBindingNames(element?.type === 'RestElement' ? element.argument : element)
      );
    case 'AssignmentPattern':
      return exportedBindingNames(pattern.left);
    default:
      return [];
  }
}

function moduleExportName(name: ModuleExportName): string {
  return name.type === 'Identifier' ? name.name : name.value;
}

function runtimeExportNamesFromSource(filePath: string): string[] {
  const sourceText = readFileSync(filePath, 'utf8');
  const { program } = parseSync(filePath, sourceText);
  const exportNames: string[] = [];

  for (const statement of program.body) {
    // `export *`는 이름을 알 수 없으므로 건너뛴다. 타입 전용 export도 건너뛴다.
    if (statement.type !== 'ExportNamedDeclaration' || statement.exportKind === 'type') {
      continue;
    }

    for (const specifier of statement.specifiers) {
      if (specifier.exportKind !== 'type') {
        exportNames.push(moduleExportName(specifier.exported));
      }
    }

    const declaration = statement.declaration;

    if (!declaration) {
      continue;
    }

    switch (declaration.type) {
      case 'FunctionDeclaration':
      case 'TSDeclareFunction':
      case 'ClassDeclaration':
      case 'TSEnumDeclaration':
        if (declaration.id) {
          exportNames.push(declaration.id.name);
        }
        break;
      case 'VariableDeclaration':
        for (const declarator of declaration.declarations) {
          exportNames.push(...exportedBindingNames(declarator.id));
        }
        break;
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

// 같은 파일 안에서 fixture와 테스트가 같은 domain을 반복 파싱한다. 결과를 domain별로 재사용한다.
const sourceLeafExportsCache = new Map<string, LeafExportEntry[]>();

export function deriveSourceLeafExportsForDomain(domain: string): LeafExportEntry[] {
  let entries = sourceLeafExportsCache.get(domain);

  if (!entries) {
    entries = parseSourceLeafExportsForDomain(domain);
    sourceLeafExportsCache.set(domain, entries);
  }

  return [...entries];
}

function parseSourceLeafExportsForDomain(domain: string): LeafExportEntry[] {
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
