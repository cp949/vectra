import { describe, expect, test } from 'vitest';

type ModuleExports = Record<string, unknown>;

export type FunctionLeafExport = {
  readonly fnName: string;
  readonly leafPath: string;
};

export type SubpathExport = {
  readonly exportName: string;
  readonly leafPath: string;
  readonly kind: string;
};

type DomainSubpathExportOptions = {
  readonly domain: string;
  readonly sourceBarrel: ModuleExports;
  readonly leafExports: readonly SubpathExport[];
  readonly includeDist?: boolean;
  readonly dedupeExpectedExports?: boolean;
  readonly timeout?: number;
  readonly compareTestName?: string;
};

type FunctionDomainSubpathExportOptions = Omit<DomainSubpathExportOptions, 'leafExports'> & {
  readonly leafExports: readonly FunctionLeafExport[];
};

export function assertFunctionDomainSubpathExports(options: FunctionDomainSubpathExportOptions): void {
  assertDomainSubpathExports({
    ...options,
    leafExports: options.leafExports.map(({ fnName, leafPath }) => ({
      exportName: fnName,
      leafPath,
      kind: 'function',
    })),
  });
}

// domain barrel과 generated fixture catalog의 동기화(drift)를 검증한다.
// leaf별 import/kind 반복 검증은 package-imports.test.ts의 dist import contract가 커버하므로
// 여기서는 barrel kind smoke, (필요 시) dist barrel smoke, 양방향 key 일치만 유지한다.
export function assertDomainSubpathExports({
  domain,
  sourceBarrel,
  leafExports,
  includeDist = false,
  dedupeExpectedExports = false,
  timeout,
  compareTestName = 'barrel이 fixture에 없는 함수를 추가로 export하지 않는다',
}: DomainSubpathExportOptions): void {
  describe(`${domain} subpath export surface`, () => {
    if (leafExports.length > 0) {
      test(
        'fixture의 모든 export가 source barrel에 kind대로 존재한다',
        () => {
          for (const { exportName, kind } of leafExports) {
            expect(typeof sourceBarrel[exportName]).toBe(kind);
          }
        },
        timeout
      );

      if (includeDist) {
        test(
          'built dist barrel이 fixture export를 노출한다',
          async () => {
            const barrel = (await import(/* @vite-ignore */ `../../../dist/${domain}/index.js`)) as ModuleExports;
            for (const { exportName, kind } of leafExports) {
              expect(typeof barrel[exportName]).toBe(kind);
            }
          },
          timeout
        );
      }
    }

    test(
      compareTestName,
      () => {
        const barrelKeys = Object.keys(sourceBarrel)
          .filter((key) => shouldIncludeBarrelKey(sourceBarrel, leafExports, key))
          .sort();
        const expectedKeys = getExpectedExportKeys(leafExports, dedupeExpectedExports);
        expect(barrelKeys).toEqual(expectedKeys);
      },
      timeout
    );
  });
}

function shouldIncludeBarrelKey(sourceBarrel: ModuleExports, exports: readonly SubpathExport[], key: string): boolean {
  const expected = exports.find(({ exportName }) => exportName === key);
  if (expected === undefined) {
    return exports.every(({ kind }) => kind === 'function') ? typeof sourceBarrel[key] === 'function' : true;
  }
  return typeof sourceBarrel[key] === expected.kind;
}

function getExpectedExportKeys(exports: readonly SubpathExport[], dedupeExpectedExports: boolean): string[] {
  const keys = exports.map(({ exportName }) => exportName);
  return (dedupeExpectedExports ? [...new Set(keys)] : keys).sort();
}
