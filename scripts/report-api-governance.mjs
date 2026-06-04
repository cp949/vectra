#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const srcRoot = path.join(repoRoot, 'sub/vectra/src');

const ignoredDomains = new Set(['index.ts', 'internal', 'types']);

const knownIntoOnlyLeafs = new Set([
  'bounds/cornersInto',
  'bounds/sidesInto',
  'curve/arcFlattenInto',
  'curve/arcToCubicInto',
  'curve/cubicFlattenInto',
  'curve/cubicSplitInto',
  'curve/quadraticFlattenInto',
  'curve/quadraticSplitInto',
  'path/circleCommandsInto',
  'path/ellipseCommandsInto',
  'path/equalizeSegmentsInto',
  'path/flattenInto',
  'path/lineCommandsInto',
  'path/normalizeCommandsInto',
  'path/polygonCommandsInto',
  'path/polylineCommandsInto',
  'path/rectCommandsInto',
  'path/removeCollinearCommandsInto',
  'path/reverseCommandsInto',
  'path/splitSubpathsInto',
  'path/transformCommandsInto',
  'polygon/reversePointsInto',
  'polygon/transformPointsInto',
  'polygon/translatePointsInto',
  'polyline/reversePointsInto',
  'polyline/transformPointsInto',
  'polyline/translatePointsInto',
  'random/rangePermutationInto',
  'random/sampleInto',
  'random/shuffleInto',
  'rect/cornersInto',
  'rect/sidesInto',
  'svg-path/parsePathDataInto',
  'triangle/interiorAnglesInto',
]);

const knownCompanionReviewCandidates = new Set([
  'bounds/centerInto',
  'bounds/emptyInto',
  'bounds/expandByInto',
  'bounds/expandToIncludeBoundsInto',
  'bounds/expandToIncludePointInto',
  'bounds/highInto',
  'bounds/lowInto',
  'bounds/translateInto',
  'curve/arcBoundsInto',
  'curve/arcPointAtTInto',
  'curve/arcTangentAtInto',
  'curve/cubicBoundsInto',
  'curve/cubicCubicIntersectionsInto',
  'curve/cubicDerivativeAtInto',
  'curve/cubicLineIntersectionsInto',
  'curve/cubicNormalAtInto',
  'curve/cubicPointAtTInto',
  'curve/cubicSecondDerivativeAtInto',
  'curve/cubicSelfIntersectionsInto',
  'curve/cubicTangentAtInto',
  'curve/quadraticCubicIntersectionsInto',
  'curve/quadraticDerivativeAtInto',
  'curve/quadraticLineIntersectionsInto',
  'curve/quadraticNormalAtInto',
  'curve/quadraticQuadraticIntersectionsInto',
  'curve/quadraticTangentAtInto',
  'editor-geometry/alignmentGuidesInto',
  'editor-geometry/distributeEquallyInto',
  'editor-geometry/distributeGuidesInto',
  'editor-geometry/resizeHandlesInto',
  'editor-geometry/rotateHandlesInto',
  'matrix/appendRotateInto',
  'matrix/appendScaleInto',
  'matrix/appendTranslateInto',
  'matrix/copyInto',
  'matrix/identityInto',
  'matrix/preMultiplyInto',
  'matrix/rotationMatrixInto',
  'matrix/scalingMatrixInto',
  'matrix/translationMatrixInto',
  'rect/bottomLeftInto',
  'rect/bottomRightInto',
  'rect/centerInto',
  'rect/expandToIncludePointInto',
  'rect/expandToIncludeRectInto',
  'rect/fromCenterInto',
  'rect/fromPointsInto',
  'rect/inflateInto',
  'rect/scaleInto',
  'rect/sizeInto',
  'rect/toBoundsInto',
  'rect/topLeftInto',
  'rect/topRightInto',
  'rect/translateInto',
  'segment/boundsInto',
]);

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

function kebabToCamel(input) {
  return input.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

async function readDomainExports(domain) {
  const indexPath = path.join(srcRoot, domain, 'index.ts');
  const source = await readFile(indexPath, 'utf8');
  const exports = [];
  const exportPattern = /^export \{ ([^}]+) \} from '\.\/([^']+)';$/gm;

  for (const match of source.matchAll(exportPattern)) {
    const names = match[1].split(',').map((name) => name.trim());
    const leafPath = match[2];

    for (const name of names) {
      exports.push({
        domain,
        fnName: name,
        leafPath,
      });
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

function reportCompanionCandidates(exports) {
  const byDomainAndName = new Set(exports.map(({ domain, fnName }) => `${domain}/${fnName}`));
  const intoExports = exports.filter(({ fnName }) => fnName.endsWith('Into'));
  const rows = [];

  for (const item of intoExports) {
    const key = `${item.domain}/${item.fnName}`;
    const companion = companionNameOverrides.get(key) ?? item.fnName.slice(0, -4);
    const companionKey = `${item.domain}/${companion}`;

    if (knownIntoOnlyLeafs.has(key)) {
      continue;
    }

    if (!byDomainAndName.has(companionKey)) {
      rows.push({
        domain: item.domain,
        into: item.fnName,
        suggestedCompanion: companion,
        note: 'review against API-007/API-008',
      });
    }
  }

  return rows;
}

function reportShapeDomainIntersects(exports) {
  const rows = [];

  for (const item of exports) {
    if (item.domain === 'intersects') {
      continue;
    }

    if (!/^intersects[A-Z]/.test(item.fnName)) {
      continue;
    }

    rows.push({
      domain: item.domain,
      leaf: item.fnName,
      note: 'move canonical owner to intersects; shape-domain leaf is legacy/deprecation candidate',
    });
  }

  return rows;
}

function printTable(title, rows, columns) {
  console.log(`\n## ${title}`);

  if (rows.length === 0) {
    console.log('none');
    return;
  }

  console.log(columns.join('\t'));
  for (const row of rows) {
    console.log(columns.map((column) => row[column]).join('\t'));
  }
}

const exports = await readAllExports();
const companionCandidates = reportCompanionCandidates(exports);
const shapeDomainIntersects = reportShapeDomainIntersects(exports);
const strict = process.argv.includes('--strict');
const newCompanionCandidates = companionCandidates.filter(
  ({ domain, into }) => !knownCompanionReviewCandidates.has(`${domain}/${into}`)
);

console.log('# API Governance Report');
console.log('');
console.log(`mode: ${strict ? 'strict' : 'read-only'}`);
console.log(`exit: ${strict ? '1 on new candidates' : 'always 0'}`);
console.log('source: sub/vectra/src/*/index.ts');
console.log('');
console.log('This report lists review candidates. It does not enforce policy.');

printTable('Companion Review Candidates', companionCandidates, ['domain', 'into', 'suggestedCompanion', 'note']);
printTable('Shape-domain intersects* Candidates', shapeDomainIntersects, ['domain', 'leaf', 'note']);

if (strict && (newCompanionCandidates.length > 0 || shapeDomainIntersects.length > 0)) {
  printTable('New Companion Review Candidates', newCompanionCandidates, [
    'domain',
    'into',
    'suggestedCompanion',
    'note',
  ]);
  process.exitCode = 1;
}
