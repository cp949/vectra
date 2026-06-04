import { spawn } from 'node:child_process';
import { describe, expect, test } from 'vitest';
import { angleLeafExports } from './_fixtures/angle-leaf-exports';
import { boundsLeafExports } from './_fixtures/bounds-leaf-exports';
import { calculusLeafExports } from './_fixtures/calculus-leaf-exports';
import { circleLeafExports } from './_fixtures/circle-leaf-exports';
import { curveLeafExports } from './_fixtures/curve-leaf-exports';
import { easingLeafExports } from './_fixtures/easing-leaf-exports';
import { editorGeometryLeafExports } from './_fixtures/editor-geometry-leaf-exports';
import { ellipseLeafExports } from './_fixtures/ellipse-leaf-exports';
import { fittingLeafExports } from './_fixtures/fitting-leaf-exports';
import { gridLeafExports } from './_fixtures/grid-leaf-exports';
import { hexGridLeafExports } from './_fixtures/hex-grid-leaf-exports';
import { infiniteLineLeafExports } from './_fixtures/infinite-line-leaf-exports';
import { interpolationLeafExports } from './_fixtures/interpolation-leaf-exports';
import { intersectsLeafExports } from './_fixtures/intersects-leaf-exports';
import { linalgLeafExports } from './_fixtures/linalg-leaf-exports';
import { mathLeafExports } from './_fixtures/math-leaf-exports';
import { matrixLeafExports } from './_fixtures/matrix-leaf-exports';
import { motionLeafExports } from './_fixtures/motion-leaf-exports';
import { noiseLeafExports } from './_fixtures/noise-leaf-exports';
import { pathLeafExports } from './_fixtures/path-leaf-exports';
import { polygonLeafExports } from './_fixtures/polygon-leaf-exports';
import { polylineLeafExports } from './_fixtures/polyline-leaf-exports';
import { pose2LeafExports } from './_fixtures/pose2-leaf-exports';
import { randomLeafExports } from './_fixtures/random-leaf-exports';
import { randomStateLeafExports } from './_fixtures/random-state-leaf-exports';
import { rayLeafExports } from './_fixtures/ray-leaf-exports';
import { rectLeafExports } from './_fixtures/rect-leaf-exports';
import { sdfLeafExports } from './_fixtures/sdf-leaf-exports';
import { segmentLeafExports } from './_fixtures/segment-leaf-exports';
import { statisticsLeafExports } from './_fixtures/statistics-leaf-exports';
import { svgPathLeafExports } from './_fixtures/svg-path-leaf-exports';
import { triangleLeafExports } from './_fixtures/triangle-leaf-exports';
import { vecLeafExports } from './_fixtures/vec-leaf-exports';

// built dist 파일과 package self-reference specifier resolution을 Node native ESM import로 검증한다.
// 이 파일의 테스트는 `pnpm --filter @cp949/vectra build` 이후에 실행해야 한다.

type FunctionLeafExport = {
  readonly fnName: string;
  readonly leafPath: string;
};

type TypedLeafExport = {
  readonly exportName: string;
  readonly leafPath: string;
  readonly kind: string;
};

type ImportAssertion = {
  readonly modulePath: string;
  readonly exportName?: string;
  readonly kind?: string;
};

type PackageSpecifierAssertion = {
  readonly specifier: string;
  readonly exportName?: string;
  readonly kind?: string;
};

function addFunctionDomainAssertions(
  assertions: ImportAssertion[],
  distPath: string,
  entries: readonly FunctionLeafExport[],
  checkBarrel = true
): void {
  if (checkBarrel) {
    for (const { fnName } of entries) {
      assertions.push({ modulePath: `${distPath}/index.js`, exportName: fnName, kind: 'function' });
    }
  } else {
    assertions.push({ modulePath: `${distPath}/index.js` });
  }

  for (const { fnName, leafPath } of entries) {
    assertions.push({ modulePath: `${distPath}/${leafPath}.js`, exportName: fnName, kind: 'function' });
  }
}

function addTypedDomainAssertions(
  assertions: ImportAssertion[],
  distPath: string,
  entries: readonly TypedLeafExport[]
): void {
  for (const { exportName, kind } of entries) {
    assertions.push({ modulePath: `${distPath}/index.js`, exportName, kind });
  }

  for (const { exportName, leafPath, kind } of entries) {
    assertions.push({ modulePath: `${distPath}/${leafPath}.js`, exportName, kind });
  }
}

function createImportAssertions(): ImportAssertion[] {
  const assertions: ImportAssertion[] = [{ modulePath: 'types/index.js' }];

  addFunctionDomainAssertions(assertions, 'angle', angleLeafExports);
  addFunctionDomainAssertions(assertions, 'bounds', boundsLeafExports);
  addFunctionDomainAssertions(assertions, 'calculus', calculusLeafExports);
  addFunctionDomainAssertions(assertions, 'circle', circleLeafExports);
  addFunctionDomainAssertions(assertions, 'curve', curveLeafExports);
  addFunctionDomainAssertions(assertions, 'easing', easingLeafExports);
  addFunctionDomainAssertions(assertions, 'editor-geometry', editorGeometryLeafExports);
  addFunctionDomainAssertions(assertions, 'ellipse', ellipseLeafExports);
  addFunctionDomainAssertions(assertions, 'fitting', fittingLeafExports);
  addFunctionDomainAssertions(assertions, 'grid', gridLeafExports);
  addFunctionDomainAssertions(assertions, 'hex-grid', hexGridLeafExports);
  addFunctionDomainAssertions(assertions, 'infinite-line', infiniteLineLeafExports);
  addFunctionDomainAssertions(assertions, 'interpolation', interpolationLeafExports);
  addFunctionDomainAssertions(assertions, 'intersects', intersectsLeafExports);
  addFunctionDomainAssertions(assertions, 'linalg', linalgLeafExports, false);
  addFunctionDomainAssertions(assertions, 'math', mathLeafExports);
  addFunctionDomainAssertions(assertions, 'matrix', matrixLeafExports);
  addFunctionDomainAssertions(assertions, 'motion', motionLeafExports);
  addFunctionDomainAssertions(assertions, 'noise', noiseLeafExports);
  addFunctionDomainAssertions(assertions, 'path', pathLeafExports);
  addFunctionDomainAssertions(assertions, 'polygon', polygonLeafExports);
  addFunctionDomainAssertions(assertions, 'polyline', polylineLeafExports);
  addFunctionDomainAssertions(assertions, 'pose2', pose2LeafExports);
  addFunctionDomainAssertions(assertions, 'random', randomLeafExports);
  addTypedDomainAssertions(assertions, 'random-state', randomStateLeafExports);
  addFunctionDomainAssertions(assertions, 'ray', rayLeafExports);
  addFunctionDomainAssertions(assertions, 'rect', rectLeafExports);
  addFunctionDomainAssertions(assertions, 'sdf', sdfLeafExports);
  addFunctionDomainAssertions(assertions, 'segment', segmentLeafExports);
  addFunctionDomainAssertions(assertions, 'statistics', statisticsLeafExports);
  addFunctionDomainAssertions(assertions, 'svg-path', svgPathLeafExports);
  addFunctionDomainAssertions(assertions, 'triangle', triangleLeafExports);
  addFunctionDomainAssertions(assertions, 'vec', vecLeafExports);

  return assertions;
}

function createPackageSpecifierAssertions(): PackageSpecifierAssertion[] {
  return [
    { specifier: '@cp949/vectra' },
    { specifier: '@cp949/vectra/types' },
    { specifier: '@cp949/vectra/editor-geometry', exportName: 'connectorLineInto', kind: 'function' },
    { specifier: '@cp949/vectra/pose2', exportName: 'poseFromTranslationRotationInto', kind: 'function' },
    { specifier: '@cp949/vectra/grid', exportName: 'gridCellInto', kind: 'function' },
    { specifier: '@cp949/vectra/hex-grid', exportName: 'hexAxialToCube', kind: 'function' },
    { specifier: '@cp949/vectra/motion', exportName: 'finalVelocity', kind: 'function' },
    { specifier: '@cp949/vectra/motion', exportName: 'moveTowardByElapsed', kind: 'function' },
    { specifier: '@cp949/vectra/motion', exportName: 'moveTowardAngleByElapsed', kind: 'function' },
    { specifier: '@cp949/vectra/motion', exportName: 'displacementVectorInto', kind: 'function' },
    { specifier: '@cp949/vectra/noise', exportName: 'perlinNoise2', kind: 'function' },
    { specifier: '@cp949/vectra/noise', exportName: 'createNoise2', kind: 'function' },
    { specifier: '@cp949/vectra/noise', exportName: 'fbm2', kind: 'function' },
    { specifier: '@cp949/vectra/noise', exportName: 'ridgedFbm2', kind: 'function' },
    { specifier: '@cp949/vectra/sdf', exportName: 'sdfAnnulus', kind: 'function' },
    { specifier: '@cp949/vectra/sdf', exportName: 'sdfCapsule', kind: 'function' },
    { specifier: '@cp949/vectra/sdf', exportName: 'sdfCircle', kind: 'function' },
    { specifier: '@cp949/vectra/sdf', exportName: 'sdfOrientedRect', kind: 'function' },
    { specifier: '@cp949/vectra/sdf', exportName: 'sdfPolygon', kind: 'function' },
    { specifier: '@cp949/vectra/sdf', exportName: 'sdfRect', kind: 'function' },
    { specifier: '@cp949/vectra/sdf', exportName: 'sdfRoundedRect', kind: 'function' },
    { specifier: '@cp949/vectra/sdf', exportName: 'sdfSegment', kind: 'function' },
    { specifier: '@cp949/vectra/fitting', exportName: 'principalDirectionsInto', kind: 'function' },
    { specifier: '@cp949/vectra/fitting', exportName: 'principalDirections', kind: 'function' },
    { specifier: '@cp949/vectra/fitting', exportName: 'fitLineToPointsInto', kind: 'function' },
    { specifier: '@cp949/vectra/fitting', exportName: 'fitLineToPoints', kind: 'function' },
    { specifier: '@cp949/vectra/fitting', exportName: 'fitCircleToPointsInto', kind: 'function' },
    { specifier: '@cp949/vectra/fitting', exportName: 'fitCircleToPoints', kind: 'function' },
    { specifier: '@cp949/vectra/fitting', exportName: 'fitMinimumAreaRectInto', kind: 'function' },
    { specifier: '@cp949/vectra/fitting', exportName: 'fitMinimumAreaRect', kind: 'function' },
    { specifier: '@cp949/vectra/rect', exportName: 'normalizePointInto', kind: 'function' },
    { specifier: '@cp949/vectra/rect', exportName: 'denormalizePointInto', kind: 'function' },
    { specifier: '@cp949/vectra/rect', exportName: 'clampPointInto', kind: 'function' },
    { specifier: '@cp949/vectra/rect', exportName: 'aspectRatio', kind: 'function' },
    { specifier: '@cp949/vectra/rect', exportName: 'rectAlignToInto', kind: 'function' },
    { specifier: '@cp949/vectra/rect', exportName: 'rectAlignTo', kind: 'function' },
    { specifier: '@cp949/vectra/linalg' },
    { specifier: '@cp949/vectra/calculus' },
    { specifier: '@cp949/vectra/statistics' },
  ];
}

const importContractScript = `
let input = "";
for await (const chunk of process.stdin) {
  input += chunk;
}

const assertions = JSON.parse(input);
const distRoot = new URL(process.env.VECTRA_DIST_ROOT);
const moduleCache = new Map();

for (const assertion of assertions) {
  const moduleUrl = new URL(assertion.modulePath, distRoot).href;
  let mod = moduleCache.get(moduleUrl);

  if (mod === undefined) {
    mod = await import(moduleUrl);
    moduleCache.set(moduleUrl, mod);
  }

  if (assertion.exportName === undefined) {
    continue;
  }

  const actualKind = typeof mod[assertion.exportName];
  if (actualKind !== assertion.kind) {
    throw new Error(
      moduleUrl + ": " + assertion.exportName + " expected " + assertion.kind + ", got " + actualKind
    );
  }
}
`;

const packageSpecifierContractScript = `
let input = "";
for await (const chunk of process.stdin) {
  input += chunk;
}

const assertions = JSON.parse(input);
const moduleCache = new Map();

for (const assertion of assertions) {
  let mod = moduleCache.get(assertion.specifier);

  if (mod === undefined) {
    mod = await import(assertion.specifier);
    moduleCache.set(assertion.specifier, mod);
  }

  if (assertion.exportName === undefined) {
    continue;
  }

  const actualKind = typeof mod[assertion.exportName];
  if (actualKind !== assertion.kind) {
    throw new Error(
      assertion.specifier + ": " + assertion.exportName + " expected " + assertion.kind + ", got " + actualKind
    );
  }
}
`;

async function runNodeImportAssertions(assertions: readonly ImportAssertion[]): Promise<{ stderr: string }> {
  const child = spawn(process.execPath, ['--input-type=module', '--eval', importContractScript], {
    env: {
      ...process.env,
      VECTRA_DIST_ROOT: new URL('../../dist/', import.meta.url).href,
    },
    stdio: ['pipe', 'ignore', 'pipe'],
  });
  let stderr = '';

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk: string) => {
    stderr += chunk;
  });

  child.stdin.end(JSON.stringify(assertions));

  return await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stderr });
        return;
      }

      reject(new Error(`node import contract failed with exit code ${code}\n${stderr}`));
    });
  });
}

async function runNodePackageSpecifierAssertions(
  assertions: readonly PackageSpecifierAssertion[]
): Promise<{ stderr: string }> {
  const child = spawn(process.execPath, ['--input-type=module', '--eval', packageSpecifierContractScript], {
    cwd: new URL('../..', import.meta.url),
    stdio: ['pipe', 'ignore', 'pipe'],
  });
  let stderr = '';

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk: string) => {
    stderr += chunk;
  });

  child.stdin.end(JSON.stringify(assertions));

  return await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stderr });
        return;
      }

      reject(new Error(`node package specifier contract failed with exit code ${code}\n${stderr}`));
    });
  });
}

describe('package built dist import contract', () => {
  test('@cp949/vectra dist barrel과 leaf module이 import되고 expected export를 노출한다', async () => {
    const { stderr } = await runNodeImportAssertions(createImportAssertions());

    expect(stderr).toBe('');
  }, 30_000);

  test('@cp949/vectra package specifier가 package exports로 resolve된다', async () => {
    const { stderr } = await runNodePackageSpecifierAssertions(createPackageSpecifierAssertions());

    expect(stderr).toBe('');
  }, 30_000);

  test('@cp949/vectra package leaf specifier는 package exports에서 막힌다', async () => {
    const child = spawn(
      process.execPath,
      ['--input-type=module', '--eval', "await import('@cp949/vectra/curve/cubic-point-at-t-into');"],
      {
        cwd: new URL('../..', import.meta.url),
        stdio: ['ignore', 'ignore', 'pipe'],
      }
    );
    let stderr = '';

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });

    const code = await new Promise<number | null>((resolve, reject) => {
      child.on('error', reject);
      child.on('close', (code) => {
        resolve(code);
      });
    });
    expect(code).not.toBe(0);
    expect(stderr).toContain('Package subpath');
  }, 30_000);
});
