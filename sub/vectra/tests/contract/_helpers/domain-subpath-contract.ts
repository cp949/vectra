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

type NormalizedSubpathExport = SubpathExport & {
  readonly displayName: string;
};

type DomainSubpathExportOptions = {
  readonly domain: string;
  readonly sourceBarrel: ModuleExports;
  readonly leafExports: readonly SubpathExport[];
  readonly includeDist?: boolean;
  readonly dedupeExpectedExports?: boolean;
  readonly timeout?: number;
  readonly barrelCheckMode?: 'each' | 'all';
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

export function assertDomainSubpathExports({
  domain,
  sourceBarrel,
  leafExports,
  includeDist = false,
  dedupeExpectedExports = false,
  timeout,
  barrelCheckMode = 'each',
  compareTestName = 'barrel이 fixture에 없는 함수를 추가로 export하지 않는다',
}: DomainSubpathExportOptions): void {
  const exports = leafExports.map(({ exportName, leafPath, kind }) => ({
    exportName,
    leafPath,
    kind,
    displayName: exportName,
  }));

  describe(`${domain} subpath export surface`, () => {
    if (exports.length > 0) {
      describe(`@cp949/vectra/${domain} domain barrel`, () => {
        testBarrelExports(sourceBarrel, exports, barrelCheckMode, 'barrel', timeout);
      });

      describe('leaf module source-level import', () => {
        testLeafSourceExports(domain, exports);
      });

      if (includeDist) {
        describe('built dist barrel import', () => {
          testBarrelImporter(
            () => import(/* @vite-ignore */ `../../../dist/${domain}/index.js`) as Promise<ModuleExports>,
            exports,
            barrelCheckMode,
            `dist/${domain}/index.js`,
            timeout
          );
        });

        describe('built dist leaf import', () => {
          test.each(exports)('$leafPath built leaf module이 $displayName를 export한다', async ({
            exportName,
            leafPath,
            kind,
          }) => {
            const leaf = await import(/* @vite-ignore */ `../../../dist/${domain}/${leafPath}.js`);
            expect(typeof (leaf as ModuleExports)[exportName]).toBe(kind);
          });
        });
      }
    }

    describe('barrel export 집합과 fixture 집합 양방향 일치', () => {
      test(
        compareTestName,
        async () => {
          const barrelKeys = Object.keys(sourceBarrel)
            .filter((key) => shouldIncludeBarrelKey(sourceBarrel, exports, key))
            .sort();
          const expectedKeys = getExpectedExportKeys(exports, dedupeExpectedExports);
          expect(barrelKeys).toEqual(expectedKeys);
        },
        timeout
      );
    });
  });
}

function testLeafSourceExports(domain: string, exports: readonly NormalizedSubpathExport[]): void {
  test.each(exports)('$leafPath leaf module이 $displayName를 export한다', async ({ exportName, leafPath, kind }) => {
    const leaf = await import(/* @vite-ignore */ `../../../src/${domain}/${leafPath}`);
    expect(typeof (leaf as ModuleExports)[exportName]).toBe(kind);
  });
}

function testBarrelExports(
  barrel: ModuleExports,
  exports: readonly NormalizedSubpathExport[],
  mode: 'each' | 'all',
  label: string,
  timeout: number | undefined
): void {
  if (mode === 'all') {
    test(
      `fixture의 모든 함수가 ${label}에 존재한다`,
      async () => {
        for (const { exportName, kind } of exports) {
          expect(typeof barrel[exportName]).toBe(kind);
        }
      },
      timeout
    );
    return;
  }

  test.each(exports)('$displayName가 함수로 존재한다', async ({ exportName, kind }) => {
    expect(typeof barrel[exportName]).toBe(kind);
  });
}

function testBarrelImporter(
  importBarrel: () => Promise<ModuleExports>,
  exports: readonly NormalizedSubpathExport[],
  mode: 'each' | 'all',
  label: string,
  timeout: number | undefined
): void {
  if (mode === 'all') {
    test(
      `fixture의 모든 함수가 ${label}에 존재한다`,
      async () => {
        const barrel = await importBarrel();
        for (const { exportName, kind } of exports) {
          expect(typeof barrel[exportName]).toBe(kind);
        }
      },
      timeout
    );
    return;
  }

  test.each(exports)(`$displayName가 ${label}에 존재한다`, async ({ exportName, kind }) => {
    const barrel = await importBarrel();
    expect(typeof barrel[exportName]).toBe(kind);
  });
}

function shouldIncludeBarrelKey(
  sourceBarrel: ModuleExports,
  exports: readonly NormalizedSubpathExport[],
  key: string
): boolean {
  const expected = exports.find(({ exportName }) => exportName === key);
  if (expected === undefined) {
    return exports.every(({ kind }) => kind === 'function') ? typeof sourceBarrel[key] === 'function' : true;
  }
  return typeof sourceBarrel[key] === expected.kind;
}

function getExpectedExportKeys(exports: readonly NormalizedSubpathExport[], dedupeExpectedExports: boolean): string[] {
  const keys = exports.map(({ exportName }) => exportName);
  return (dedupeExpectedExports ? [...new Set(keys)] : keys).sort();
}
