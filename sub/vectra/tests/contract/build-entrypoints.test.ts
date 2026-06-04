import { describe, expect, test } from 'vitest';
import { buildEntrypoints } from '../../build-entrypoints';
import packageJson from '../../package.json' with { type: 'json' };

function importTargetToSourcePattern(importPath: string): string {
  return importPath.replace('./dist/', 'src/').replace(/\.js$/, '.ts');
}

describe('build entrypoints', () => {
  test('package export contract는 root/domain barrel entry만 공개한다', () => {
    const sourcePatterns = Object.values(packageJson.exports).map(({ import: importPath }) =>
      importTargetToSourcePattern(importPath)
    );

    expect(sourcePatterns.every((pattern) => !pattern.includes('*'))).toBe(true);
    expect(sourcePatterns.every((pattern) => pattern === 'src/index.ts' || pattern.endsWith('/index.ts'))).toBe(true);
  });

  test('package export contract의 exact source entry가 실제 build entry에 있다', () => {
    const exactSourcePatterns = Object.values(packageJson.exports)
      .map(({ import: importPath }) => importTargetToSourcePattern(importPath))
      .filter((pattern) => !pattern.includes('*'));

    expect(exactSourcePatterns.filter((pattern) => !buildEntrypoints().includes(pattern))).toEqual([]);
  });

  test('internal source file을 public build entry로 노출하지 않는다', () => {
    expect(buildEntrypoints()).not.toContain('src/internal/xy.ts');
    expect(buildEntrypoints()).not.toContain('src/meta.internal.ts');
    expect(buildEntrypoints()).not.toContain('src/random/entropy.internal.ts');
  });
});
