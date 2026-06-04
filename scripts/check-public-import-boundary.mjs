#!/usr/bin/env node

import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const srcRoot = path.join(repoRoot, 'sub/vectra/src');
const defaultBaselinePath = path.join(repoRoot, 'scripts/fixtures/public-import-boundary-baseline.json');
const companionDelegationAliases = new Map([
  ['matrix/scaling.ts', 'matrix/scaling-matrix-into.ts'],
  ['matrix/scale.ts', 'matrix/append-scale-into.ts'],
  ['matrix/rotate.ts', 'matrix/append-rotate-into.ts'],
  ['matrix/translate.ts', 'matrix/append-translate-into.ts'],
  ['matrix/translation.ts', 'matrix/translation-matrix-into.ts'],
]);

function parseArgs(argv) {
  const options = {
    baselinePath: defaultBaselinePath,
    write: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--write') {
      options.write = true;
      continue;
    }
    if (arg === '--baseline') {
      const value = argv[index + 1];
      if (value === undefined) {
        throw new Error('--baseline requires a path');
      }
      options.baselinePath = path.resolve(repoRoot, value);
      index += 1;
      continue;
    }
    throw new Error(`unknown option: ${arg}`);
  }

  return options;
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const filePath = path.join(dir, entry);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath, files);
      continue;
    }
    if (filePath.endsWith('.ts') && !filePath.endsWith('.d.ts')) {
      files.push(filePath);
    }
  }
  return files;
}

function isPublicLeaf(filePath) {
  return (
    !filePath.includes(`${path.sep}internal${path.sep}`) &&
    !filePath.endsWith('.internal.ts') &&
    !filePath.endsWith('.types.internal.ts') &&
    !filePath.endsWith(`${path.sep}index.ts`) &&
    !filePath.endsWith(`${path.sep}types.ts`)
  );
}

function resolveRelativeImport(fromFile, specifier) {
  if (!specifier.startsWith('.')) return undefined;
  const resolved = path.normalize(path.join(path.dirname(fromFile), specifier));
  return resolved.endsWith('.ts') ? resolved : `${resolved}.ts`;
}

function isCompanionDelegation(fromFile, toFile) {
  const fromBase = path.basename(fromFile, '.ts');
  const toBase = path.basename(toFile, '.ts');
  if (!fromBase.endsWith('-into') && toBase === `${fromBase}-into`) return true;
  const fromRelative = path.relative(srcRoot, fromFile).replaceAll(path.sep, '/');
  const toRelative = path.relative(srcRoot, toFile).replaceAll(path.sep, '/');
  return companionDelegationAliases.get(fromRelative) === toRelative;
}

const files = walk(srcRoot);
const publicLeaves = new Set(files.filter(isPublicLeaf).map((filePath) => path.normalize(filePath)));
const violations = [];

for (const filePath of files) {
  const normalizedFrom = path.normalize(filePath);
  if (!publicLeaves.has(normalizedFrom)) continue;

  const source = readFileSync(filePath, 'utf8');
  const importPattern = /^import\s+(type\s+)?[^'\n]*from\s+['"]([^'"]+)['"]/gm;

  for (const match of source.matchAll(importPattern)) {
    const toFile = resolveRelativeImport(filePath, match[2]);
    if (toFile === undefined) continue;

    const normalizedTo = path.normalize(toFile);
    if (!publicLeaves.has(normalizedTo)) continue;
    if (isCompanionDelegation(filePath, toFile)) continue;

    const statement = match[0];
    const typeOnly = Boolean(match[1]) || /^import\s*\{\s*type\b/.test(statement);
    violations.push({
      from: path.relative(srcRoot, filePath),
      to: path.relative(srcRoot, toFile),
      typeOnly,
    });
  }
}

function normalizeViolations(items) {
  return items
    .map((item) => ({
      from: item.from.replaceAll(path.sep, '/'),
      to: item.to.replaceAll(path.sep, '/'),
    }))
    .sort((left, right) => {
      const leftKey = `${left.from}\t${left.to}`;
      const rightKey = `${right.from}\t${right.to}`;
      return leftKey.localeCompare(rightKey);
    });
}

function snapshotFromViolations(items) {
  return {
    generatedBy: 'scripts/check-public-import-boundary.mjs --write',
    valueImports: normalizeViolations(items.filter((violation) => !violation.typeOnly)),
    typeOnlyImports: normalizeViolations(items.filter((violation) => violation.typeOnly)),
  };
}

function readBaseline(filePath) {
  const parsed = JSON.parse(readFileSync(filePath, 'utf8'));
  if (!Array.isArray(parsed.valueImports) || !Array.isArray(parsed.typeOnlyImports)) {
    throw new Error(`invalid import-boundary baseline: ${filePath}`);
  }
  return {
    valueImports: normalizeViolations(parsed.valueImports),
    typeOnlyImports: normalizeViolations(parsed.typeOnlyImports),
  };
}

function writeBaseline(filePath, snapshot) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(`${filePath}`, `${JSON.stringify(snapshot, null, 2)}\n`);
}

function diffEntries(actual, expected) {
  const expectedKeys = new Set(expected.map((entry) => `${entry.from}\t${entry.to}`));
  const actualKeys = new Set(actual.map((entry) => `${entry.from}\t${entry.to}`));
  return {
    added: actual.filter((entry) => !expectedKeys.has(`${entry.from}\t${entry.to}`)),
    removed: expected.filter((entry) => !actualKeys.has(`${entry.from}\t${entry.to}`)),
  };
}

function printEntries(label, entries, type) {
  if (entries.length === 0) return;
  console.log(label);
  for (const entry of entries.slice(0, 20)) {
    console.log(`${type}\t${entry.from}\t${entry.to}`);
  }
}

const options = parseArgs(process.argv.slice(2));
const actualSnapshot = snapshotFromViolations(violations);

if (options.write) {
  writeBaseline(options.baselinePath, actualSnapshot);
}

const baseline = options.write ? actualSnapshot : readBaseline(options.baselinePath);
const valueDiff = diffEntries(actualSnapshot.valueImports, baseline.valueImports);
const typeOnlyDiff = diffEntries(actualSnapshot.typeOnlyImports, baseline.typeOnlyImports);

console.log('# Public Import Boundary Check');
console.log('');
console.log(`baseline: ${path.relative(repoRoot, options.baselinePath)}`);
console.log(`value imports: ${actualSnapshot.valueImports.length} / ${baseline.valueImports.length}`);
console.log(`type-only imports: ${actualSnapshot.typeOnlyImports.length} / ${baseline.typeOnlyImports.length}`);

if (options.write) {
  console.log('');
  console.log(`baseline written: ${path.relative(repoRoot, options.baselinePath)}`);
}

if (
  valueDiff.added.length > 0 ||
  valueDiff.removed.length > 0 ||
  typeOnlyDiff.added.length > 0 ||
  typeOnlyDiff.removed.length > 0
) {
  console.log('');
  printEntries('new public leaf value imports detected', valueDiff.added, 'value');
  printEntries('removed public leaf value imports detected', valueDiff.removed, 'value');
  printEntries('new public leaf type-only imports detected', typeOnlyDiff.added, 'type');
  printEntries('removed public leaf type-only imports detected', typeOnlyDiff.removed, 'type');
  process.exitCode = 1;
}
