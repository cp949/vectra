/**
 * solveCubicInClosedUnit 단위 테스트.
 *
 * [0, 1] 구간 cubic 실근이 계수 scale과 근 간격에 상관없이 모두 나오는지 고정한다.
 * - 계수 전체를 1e-14배, 1e8배 해도 같은 근을 찾는다.
 * - 간격이 1e-4인 세 근과 0에 붙은 근을 하나로 합치지 않는다.
 * - 중근(접점)과 3중근을 놓치지 않는다. 판별식 반올림 잡음보다 임계가 작으면 중근이 단근으로 사라진다.
 */

import { describe, expect, test } from 'vitest';
import { solveCubicInClosedUnit } from '../../../src/curve/cubic-solve.internal';

/**
 * 근 r1, r2, r3을 갖는 k·(t - r1)(t - r2)(t - r3)의 계수 [a, b, c, d]를 만든다.
 * 근을 알고 있는 cubic으로 solver 결과를 비교한다.
 */
function cubicFromRoots(roots: readonly [number, number, number], k = 1): [number, number, number, number] {
  const [r1, r2, r3] = roots;
  return [k, -k * (r1 + r2 + r3), k * (r1 * r2 + r2 * r3 + r1 * r3), -k * r1 * r2 * r3];
}

/**
 * solver를 호출해 근을 오름차순으로 반환한다.
 * solver는 근 순서를 보장하지 않으므로 정렬해 비교한다.
 */
function solveSorted(coefficients: readonly [number, number, number, number]): number[] {
  const out: number[] = [];
  solveCubicInClosedUnit(out, ...coefficients);
  return out.sort((x, y) => x - y);
}

describe('solveCubicInClosedUnit', () => {
  test('계수 전체를 1e-14배 하거나 1e8배 해도 [0, 1] 근 3개를 찾는다', () => {
    for (const k of [1e-14, 1, 1e8]) {
      const roots = solveSorted(cubicFromRoots([0.2, 0.5, 0.8], k));
      expect(roots, `k=${k}`).toHaveLength(3);
      expect(roots[0]).toBeCloseTo(0.2, 12);
      expect(roots[1]).toBeCloseTo(0.5, 12);
      expect(roots[2]).toBeCloseTo(0.8, 12);
    }
  });

  test('간격 1e-4로 붙은 세 근을 하나로 합치지 않는다', () => {
    const roots = solveSorted(cubicFromRoots([0.5, 0.5001, 0.5002]));
    expect(roots).toHaveLength(3);
    expect(roots[0]).toBeCloseTo(0.5, 6);
    expect(roots[1]).toBeCloseTo(0.5001, 6);
    expect(roots[2]).toBeCloseTo(0.5002, 6);
  });

  test('0에 붙은 근 0, 1e-4, 2e-4를 모두 찾는다', () => {
    const roots = solveSorted(cubicFromRoots([0, 1e-4, 2e-4]));
    expect(roots).toHaveLength(3);
    expect(roots[0]).toBeCloseTo(0, 9);
    expect(roots[1]).toBeCloseTo(1e-4, 9);
    expect(roots[2]).toBeCloseTo(2e-4, 9);
  });

  test('[0, 1] 밖의 근은 넣지 않는다', () => {
    const roots = solveSorted(cubicFromRoots([-0.5, 0.5, 1.5]));
    expect(roots).toHaveLength(1);
    expect(roots[0]).toBeCloseTo(0.5, 12);
  });

  test('중근과 가까운 단근이 함께 있어도 중근을 놓치지 않는다', () => {
    // 직선이 곡선에 접하는 점(중근) 근처에 다른 교차점(단근)이 있는 경우다.
    for (const [double, single] of [
      [0.3, 0.35],
      [0.5, 0.501],
      [0.7, 0.62],
      [0.123, 0.2],
    ]) {
      const roots = solveSorted(cubicFromRoots([double, double, single]));
      const nearest = (t: number) => Math.min(...roots.map((r) => Math.abs(r - t)));
      expect(nearest(double), `double=${double}, single=${single}`).toBeLessThan(1e-6);
      expect(nearest(single), `double=${double}, single=${single}`).toBeLessThan(1e-6);
    }
  });

  test('3중근은 1e-9 이내로 찾는다', () => {
    for (const root of [0.3, 0.5, 0.77]) {
      const roots = solveSorted(cubicFromRoots([root, root, root]));
      expect(roots.length, `root=${root}`).toBeGreaterThan(0);
      for (const r of roots) expect(Math.abs(r - root), `root=${root}`).toBeLessThan(1e-9);
    }
  });
});
