/**
 * Package public surface runtime/export 계약 테스트.
 */

import { describe, expect, test } from 'vitest';
import packageJson from '../../package.json' with { type: 'json' };
import { linalgLeafExports } from './_fixtures/linalg-leaf-exports';
import { statisticsLeafExports } from './_fixtures/statistics-leaf-exports';

describe('public surface 계약', () => {
  test('MVP package subpath exports가 도메인 leaf 패턴으로 선언된다', () => {
    const expectedKeys = [
      '.',
      './types',
      './vec',
      './segment',
      './rect',
      './bounds',
      './capsule',
      './circle',
      './ellipse',
      './matrix',
      './polyline',
      './polygon',
      './triangle',
      './oriented-rect',
      './pose2',
      './intersects',
      './random',
      './random-state',
      './path',
      './math',
      './curve',
      './svg-path',
      './infinite-line',
      './ray',
      './angle',
      './interpolation',
      './easing',
      './adapter',
      './editor-geometry',
      './linalg',
      './calculus',
      './statistics',
      './grid',
      './hex-grid',
      './motion',
      './noise',
      './sdf',
      './fitting',
    ];
    expect(Object.keys(packageJson.exports)).toEqual(expectedKeys);
  });

  test('root entry가 패키지 이름 상수를 export한다', async () => {
    const root = await import('../../src/index');

    expect(root.VECTRA_PACKAGE_NAME).toBe('@cp949/vectra');
  });

  test('MVP 도메인 barrel 모듈이 모두 import 가능하다', async () => {
    const domains = [];

    domains.push(await import('../../src/vec/index'));
    domains.push(await import('../../src/segment/index'));
    domains.push(await import('../../src/rect/index'));
    domains.push(await import('../../src/bounds/index'));
    domains.push(await import('../../src/capsule/index'));
    domains.push(await import('../../src/circle/index'));
    domains.push(await import('../../src/ellipse/index'));
    domains.push(await import('../../src/matrix/index'));
    domains.push(await import('../../src/polyline/index'));
    domains.push(await import('../../src/polygon/index'));
    domains.push(await import('../../src/triangle/index'));
    domains.push(await import('../../src/oriented-rect/index'));
    domains.push(await import('../../src/pose2/index'));
    domains.push(await import('../../src/random/index'));
    domains.push(await import('../../src/path/index'));
    domains.push(await import('../../src/math/index'));
    domains.push(await import('../../src/curve/index'));
    domains.push(await import('../../src/svg-path/index'));
    domains.push(await import('../../src/ray/index'));
    domains.push(await import('../../src/infinite-line/index'));
    domains.push(await import('../../src/intersects/index'));
    domains.push(await import('../../src/angle/index'));
    domains.push(await import('../../src/interpolation/index'));
    domains.push(await import('../../src/easing/index'));
    domains.push(await import('../../src/adapter/index'));
    domains.push(await import('../../src/editor-geometry/index'));
    domains.push(await import('../../src/linalg/index'));
    domains.push(await import('../../src/calculus/index'));
    domains.push(await import('../../src/statistics/index'));
    domains.push(await import('../../src/grid/index'));
    domains.push(await import('../../src/hex-grid/index'));
    domains.push(await import('../../src/motion/index'));
    domains.push(await import('../../src/noise/index'));
    domains.push(await import('../../src/sdf/index'));
    domains.push(await import('../../src/fitting/index'));

    expect(domains).toHaveLength(35);
  }, 30_000);

  test('linalg barrel이 vector/sparse helper와 matrix shape/access/factory/arithmetic/product/query/norm helper를 export한다', async () => {
    const barrel = await import('../../src/linalg/index');
    const fnKeys = Object.keys(barrel as Record<string, unknown>)
      .filter((k) => typeof (barrel as Record<string, unknown>)[k] === 'function')
      .sort();
    const expectedFnKeys = linalgLeafExports.map(({ fnName }) => fnName).sort();
    expect(fnKeys).toEqual(expectedFnKeys);
  });

  test('statistics barrel이 descriptive helper를 export한다', async () => {
    const barrel = await import('../../src/statistics/index');
    const fnKeys = Object.keys(barrel as Record<string, unknown>)
      .filter((k) => typeof (barrel as Record<string, unknown>)[k] === 'function')
      .sort();
    const expectedFnKeys = statisticsLeafExports.map(({ fnName }) => fnName).sort();
    expect(fnKeys).toEqual(expectedFnKeys);
  });
});
