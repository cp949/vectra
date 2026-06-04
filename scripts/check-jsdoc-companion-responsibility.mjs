#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const srcRoot = path.join(repoRoot, 'sub/vectra/src');
const strict = process.argv.includes('--strict');

const ignoredDomains = new Set(['index.ts', 'internal', 'types']);

const companionNameOverrides = new Map([
  ['bounds/copyInto', 'boundsFrom'],
  ['circle/copyInto', 'circleFrom'],
  ['ellipse/copyInto', 'ellipseFrom'],
  ['infinite-line/copyInto', 'infiniteLineFrom'],
  ['ray/copyInto', 'rayFrom'],
  ['rect/copyInto', 'rectFrom'],
  ['segment/copyInto', 'segmentFrom'],
  ['triangle/copyInto', 'triangleFrom'],
  ['vec/copyInto', 'vecFrom'],
]);

const responsibilityPatterns = {
  finite: /(NaN|Infinity|finite|non-finite|Number\.isFinite|유한|무한|검증 없이|검증하지|RangeError)/i,
  degenerate: /(degenerate|zero-length|empty|0이면|0 이하|음수|빈|collapse|singular|rank)/i,
  clamp: /(clamp|unclamped|wrap|normalize|정규화|canonical|보정|fallback|pass-through|pass through|전파)/i,
  tolerance: /(tolerance|epsilon|eps|near|근사|반복|iteration|converge)/i,
  caller: /(caller|호출자|가정|책임|보장|upstream)/i,
};

async function readDomainExports(domain) {
  const indexPath = path.join(srcRoot, domain, 'index.ts');
  const source = await readFile(indexPath, 'utf8');
  const exports = [];
  const exportPattern = /^export \{ ([^}]+) \} from '\.\/([^']+)';$/gm;

  for (const match of source.matchAll(exportPattern)) {
    const names = match[1].split(',').map((name) => name.trim());
    const leafPath = match[2];

    for (const name of names) {
      exports.push({ domain, fnName: name, leafPath });
    }
  }

  return exports;
}

async function readAllExports() {
  const entries = await readdir(srcRoot, { withFileTypes: true });
  const domains = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((domain) => !ignoredDomains.has(domain))
    .sort();

  const exportLists = await Promise.all(domains.map((domain) => readDomainExports(domain)));
  return exportLists.flat();
}

function getFunctionJsdoc(source, fnName) {
  const functionIndex = source.indexOf(`export function ${fnName}`);
  if (functionIndex < 0) {
    return '';
  }

  const beforeFunction = source.slice(0, functionIndex);
  const start = beforeFunction.lastIndexOf('/**');
  const end = beforeFunction.lastIndexOf('*/');

  if (start < 0 || end < start) {
    return '';
  }

  return beforeFunction
    .slice(start, end + 2)
    .replace(/^\s*\/\*\*|\*\/\s*$/g, '')
    .split('\n')
    .map((line) => line.replace(/^\s*\* ?/, ''))
    .join('\n')
    .trim();
}

function matchedCategories(jsdoc) {
  return Object.entries(responsibilityPatterns)
    .filter(([, pattern]) => pattern.test(jsdoc))
    .map(([category]) => category);
}

async function reportCompanionResponsibilityCandidates(exports) {
  const byDomainAndName = new Map(exports.map((item) => [`${item.domain}/${item.fnName}`, item]));
  const rows = [];

  for (const item of exports.filter(({ fnName }) => fnName.endsWith('Into'))) {
    const key = `${item.domain}/${item.fnName}`;
    const companionName = companionNameOverrides.get(key) ?? item.fnName.slice(0, -4);
    const companion = byDomainAndName.get(`${item.domain}/${companionName}`);

    if (companion === undefined) {
      continue;
    }

    const intoSource = await readFile(path.join(srcRoot, item.domain, `${item.leafPath}.ts`), 'utf8');
    const companionSource = await readFile(path.join(srcRoot, companion.domain, `${companion.leafPath}.ts`), 'utf8');
    const intoCategories = matchedCategories(getFunctionJsdoc(intoSource, item.fnName));
    const companionCategories = matchedCategories(getFunctionJsdoc(companionSource, companionName));
    const missingCategories = intoCategories.filter((category) => !companionCategories.includes(category));

    if (missingCategories.length === 0) {
      continue;
    }

    rows.push({
      domain: item.domain,
      into: item.fnName,
      companion: companionName,
      missing: missingCategories.join(','),
    });
  }

  return rows;
}

function printTable(rows) {
  console.log('# JSDoc Companion Responsibility Report');
  console.log('');
  console.log(`mode: ${strict ? 'strict' : 'read-only'}`);
  console.log(`exit: ${strict ? '1 on candidates' : 'always 0'}`);
  console.log('source: sub/vectra/src/*/index.ts');
  console.log('');
  console.log('This report flags `*Into` caller-responsibility keywords missing from allocating companion JSDoc.');
  console.log('');
  console.log('domain\tinto\tcompanion\tmissingCategories');

  if (rows.length === 0) {
    console.log('none');
    return;
  }

  for (const row of rows) {
    console.log(`${row.domain}\t${row.into}\t${row.companion}\t${row.missing}`);
  }
}

const exports = await readAllExports();
const rows = await reportCompanionResponsibilityCandidates(exports);

printTable(rows);

if (strict && rows.length > 0) {
  process.exitCode = 1;
}
