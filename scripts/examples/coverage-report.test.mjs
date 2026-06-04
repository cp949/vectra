import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { buildCoverageReport, renderMarkdownReport } from './coverage-report.mjs';

async function writeFixtureFile(root, relativePath, contents) {
  const filePath = path.join(root, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents, 'utf8');
}

async function createFixtureRepo() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'vectra-coverage-'));

  await writeFixtureFile(
    root,
    'sub/vectra/src/vec/index.ts',
    [
      "export { add } from './add';",
      "export { addInto } from './add-into';",
      "export { distance } from './distance';",
      "export { copyInto } from './copy-into';",
    ].join('\n')
  );

  await writeFixtureFile(
    root,
    'sub/vectra/src/circle/index.ts',
    ["export { pointAtAngleInto } from './point-at-angle-into';"].join('\n')
  );

  await writeFixtureFile(root, 'sub/vectra/src/vec/add.ts', 'export function add() {}\n');
  await writeFixtureFile(root, 'sub/vectra/src/vec/add-into.ts', 'export function addInto() {}\n');
  await writeFixtureFile(root, 'sub/vectra/src/vec/distance.ts', 'export function distance() {}\n');
  await writeFixtureFile(root, 'sub/vectra/src/vec/copy-into.ts', 'export function copyInto() {}\n');
  await writeFixtureFile(
    root,
    'sub/vectra/src/circle/point-at-angle-into.ts',
    'export function pointAtAngleInto() {}\n'
  );

  await writeFixtureFile(
    root,
    'apps/canvas-demo/src/examples/quick-start/index.ts',
    [
      "import code from './source.exam.ts?raw';",
      'export const quickStartExample = {',
      "  id: 'quick-start',",
      "  source: { language: 'ts', code },",
      '};',
    ].join('\n')
  );

  await writeFixtureFile(
    root,
    'apps/canvas-demo/src/examples/quick-start/source.exam.ts',
    [
      "import { add, distance } from '@cp949/vectra/vec';",
      'export function draw() {',
      '  add({}, {}, {});',
      '  distance({}, {});',
      '}',
    ].join('\n')
  );

  await writeFixtureFile(
    root,
    'apps/pixi-demo/src/examples/orbit-segment/index.ts',
    [
      "import code from './source.exam.ts?raw';",
      'export const orbitSegmentExample = {',
      "  id: 'orbit-segment',",
      "  source: { language: 'ts', code },",
      '};',
    ].join('\n')
  );

  await writeFixtureFile(
    root,
    'apps/pixi-demo/src/examples/orbit-segment/source.exam.ts',
    [
      "import * as Circles from '@cp949/vectra/circle';",
      'export function setup() {',
      '  Circles.pointAtAngleInto({}, {}, 0);',
      '}',
    ].join('\n')
  );

  await writeFixtureFile(
    root,
    'docs/internal/examples/coverage-exceptions.json',
    JSON.stringify(
      {
        common: [
          {
            leaf: '@cp949/vectra/vec/copy-into',
            reason: '기본 output helper라 대부분 예제에서 반복될 수 있다.',
          },
        ],
      },
      null,
      2
    )
  );

  return root;
}

test('public leaf별 사용 예제와 예외 상태를 만든다', async () => {
  const repoRoot = await createFixtureRepo();

  const report = await buildCoverageReport({ repoRoot });

  assert.deepEqual(
    report.rows.map((row) => ({
      leaf: row.leaf,
      exportName: row.exportName,
      exampleIds: row.exampleIds,
      exception: row.exception,
      status: row.status,
    })),
    [
      {
        leaf: '@cp949/vectra/circle/point-at-angle-into',
        exportName: 'pointAtAngleInto',
        exampleIds: ['pixi:orbit-segment'],
        exception: '',
        status: 'covered',
      },
      {
        leaf: '@cp949/vectra/vec/add',
        exportName: 'add',
        exampleIds: ['canvas:quick-start'],
        exception: '',
        status: 'covered',
      },
      {
        leaf: '@cp949/vectra/vec/add-into',
        exportName: 'addInto',
        exampleIds: ['canvas:quick-start'],
        exception: '',
        status: 'covered',
      },
      {
        leaf: '@cp949/vectra/vec/copy-into',
        exportName: 'copyInto',
        exampleIds: [],
        exception: 'common',
        status: 'excepted',
      },
      {
        leaf: '@cp949/vectra/vec/distance',
        exportName: 'distance',
        exampleIds: ['canvas:quick-start'],
        exception: '',
        status: 'covered',
      },
    ]
  );
});

test('markdown 표를 렌더링한다', async () => {
  const repoRoot = await createFixtureRepo();
  const report = await buildCoverageReport({ repoRoot });

  const markdown = renderMarkdownReport(report);

  assert.match(markdown, /# 예제 커버리지/);
  assert.match(markdown, /\| Public leaf \| Export name \| 사용 예제 ID \| 예외 \| 상태 \|/);
  assert.match(markdown, /`@cp949\/vectra\/vec\/add-into` \| `addInto` \| `canvas:quick-start`/);
  assert.match(markdown, /`@cp949\/vectra\/vec\/copy-into` \| `copyInto` \| {2}\| common \| excepted/);

  const outputPath = path.join(repoRoot, 'docs/internal/examples/coverage.md');
  await writeFile(outputPath, markdown, 'utf8');
  assert.match(await readFile(outputPath, 'utf8'), /생성 명령/);
});
