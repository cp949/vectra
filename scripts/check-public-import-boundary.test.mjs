import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const scriptPath = path.join(repoRoot, 'scripts/check-public-import-boundary.mjs');
// 기대 개수는 커밋된 baseline에서 읽는다. 소스 변경마다 시험 숫자를 따로 고치지 않는다.
const committedBaseline = JSON.parse(
  readFileSync(path.join(repoRoot, 'scripts/fixtures/public-import-boundary-baseline.json'), 'utf8')
);
const expectedValueCount = committedBaseline.valueImports.length;
const expectedTypeOnlyCount = committedBaseline.typeOnlyImports.length;

test('import-boundary snapshot can be written and used as check baseline', async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'vectra-import-boundary-'));
  const baselinePath = path.join(tempDir, 'baseline.json');

  try {
    execFileSync('node', [scriptPath, '--write', '--baseline', baselinePath], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
    assert.ok(Array.isArray(baseline.valueImports));
    assert.ok(Array.isArray(baseline.typeOnlyImports));
    assert.equal(baseline.valueImports.length, expectedValueCount);
    assert.equal(baseline.typeOnlyImports.length, expectedTypeOnlyCount);

    const output = execFileSync('node', [scriptPath, '--baseline', baselinePath], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    assert.match(output, new RegExp(`value imports: ${expectedValueCount} / ${expectedValueCount}`));
    assert.match(output, new RegExp(`type-only imports: ${expectedTypeOnlyCount} / ${expectedTypeOnlyCount}`));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('import-boundary check fails when snapshot entries differ', async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'vectra-import-boundary-'));
  const baselinePath = path.join(tempDir, 'baseline.json');

  try {
    execFileSync('node', [scriptPath, '--write', '--baseline', baselinePath], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
    baseline.valueImports.pop();
    writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);

    assert.throws(
      () =>
        execFileSync('node', [scriptPath, '--baseline', baselinePath], {
          cwd: repoRoot,
          encoding: 'utf8',
          stdio: 'pipe',
        }),
      /Command failed/
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('package exposes import-boundary:update command', () => {
  const packageJson = JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
  assert.equal(packageJson.scripts['import-boundary:update'], 'node scripts/check-public-import-boundary.mjs --write');
});
