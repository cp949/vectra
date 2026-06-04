import { readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = dirname(fileURLToPath(import.meta.url));
const sourceRoot = join(packageRoot, 'src');
const knownDomainOrder = [
  'types',
  'vec',
  'segment',
  'rect',
  'bounds',
  'capsule',
  'circle',
  'ellipse',
  'matrix',
  'polyline',
  'polygon',
  'triangle',
  'oriented-rect',
  'intersects',
  'random',
  'random-state',
  'path',
  'math',
  'curve',
  'svg-path',
  'infinite-line',
  'ray',
  'angle',
  'interpolation',
  'easing',
  'editor-geometry',
  'linalg',
  'calculus',
  'statistics',
];

function toPosixPath(path: string): string {
  return path.split(sep).join('/');
}

function sourcePathFor(filePath: string): string {
  return toPosixPath(relative(packageRoot, filePath));
}

function isPublicSourceFile(filePath: string): boolean {
  const sourcePath = sourcePathFor(filePath);

  if (!sourcePath.startsWith('src/')) {
    return false;
  }
  if (!sourcePath.endsWith('.ts') || sourcePath.endsWith('.d.ts')) {
    return false;
  }
  if (sourcePath.includes('.internal.')) {
    return false;
  }
  if (sourcePath.startsWith('src/internal/')) {
    return false;
  }
  const segments = sourcePath.split('/');

  if (segments.length === 2) {
    return sourcePath === 'src/index.ts';
  }

  return segments.length === 3;
}

function listPublicSourceFiles(dirPath: string): string[] {
  return readdirSync(dirPath)
    .flatMap((entry) => {
      const entryPath = join(dirPath, entry);
      const stats = statSync(entryPath);

      if (stats.isDirectory()) {
        return listPublicSourceFiles(entryPath);
      }
      if (stats.isFile() && isPublicSourceFile(entryPath)) {
        return [sourcePathFor(entryPath)];
      }

      return [];
    })
    .sort((a, b) => a.localeCompare(b));
}

function entrypointRank(sourcePath: string): [number, number, string] {
  if (sourcePath === 'src/index.ts') {
    return [0, -1, sourcePath];
  }

  const [, domain, fileName] = sourcePath.split('/');
  const domainIndex = knownDomainOrder.indexOf(domain);
  const normalizedDomainIndex = domainIndex === -1 ? knownDomainOrder.length : domainIndex;

  if (fileName === 'index.ts') {
    return [1, normalizedDomainIndex, sourcePath];
  }

  return [2, normalizedDomainIndex, sourcePath];
}

export function buildEntrypoints(): string[] {
  return listPublicSourceFiles(sourceRoot).sort((a, b) => {
    const [aKind, aDomain, aPath] = entrypointRank(a);
    const [bKind, bDomain, bPath] = entrypointRank(b);

    return aKind - bKind || aDomain - bDomain || aPath.localeCompare(bPath);
  });
}
