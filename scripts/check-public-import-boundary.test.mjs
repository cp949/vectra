import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const scriptPath = path.join(repoRoot, 'scripts/check-public-import-boundary.mjs');

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
    assert.equal(baseline.valueImports.length, 235);
    assert.equal(baseline.typeOnlyImports.length, 71);

    const output = execFileSync('node', [scriptPath, '--baseline', baselinePath], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    assert.match(output, /value imports: 235 \/ 235/);
    assert.match(output, /type-only imports: 71 \/ 71/);
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
