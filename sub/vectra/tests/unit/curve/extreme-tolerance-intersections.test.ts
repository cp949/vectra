/**
 * 허용 오차를 극단으로 낮춘 curve 교차 테스트.
 *
 * epsilonT를 0, maxDepth를 1000으로 두면 subdivision이 인접 부동소수점까지 좁혀져
 * curve B의 parameter 구간 폭이 0이 된다. 이때도 tangent 판정이 NaN 없이 끝나야 한다.
 *
 * 설계 메모:
 *  - 구간 폭이 0이면 B 구간이 한 점으로 퇴화해 tangent가 영벡터다. 판정은 항상 cross다.
 *  - 그래서 `spanB > 0 ? … : 0.5`의 대안 값은 결과를 바꾸지 않는다. 변이로 구분되지 않는다.
 *  - 이 테스트는 분기 도달, 종료, 유한한 cross 결과를 고정한다.
 *  - 한 테스트가 1–2초 걸리므로 timeout을 늘려 둔다.
 */
import { describe, expect, test } from 'vitest';
import { cubicCubicIntersectionsInto } from '../../../src/curve/cubic-cubic-intersections-into';
import { quadraticCubicIntersectionsInto } from '../../../src/curve/quadratic-cubic-intersections-into';
import { quadraticQuadraticIntersectionsInto } from '../../../src/curve/quadratic-quadratic-intersections-into';
import type { IntersectionHit } from '../../../src/types';

const EXTREME = { epsilon: 1e-300, epsilonT: 0, maxDepth: 1000 };

/**
 * 모든 hit가 유한한 cross이고, parameter가 기대한 근 중 하나에 모이는지 확인한다.
 * epsilonT가 0이면 dedupe가 정확히 같은 parameter만 합치므로 같은 교점이 여러 번 나올 수 있다.
 * 그래서 hit 개수가 아니라 값의 성질을 단언한다.
 */
function expectCrossingsAt(hits: IntersectionHit[], roots: readonly number[]): void {
  expect(hits.length).toBeGreaterThan(0);
  for (const hit of hits) {
    expect(hit.kind).toBe('cross');
    expect(Number.isFinite(hit.point.x)).toBe(true);
    expect(Number.isFinite(hit.point.y)).toBe(true);
    expect(roots.some((root) => Math.abs(hit.tA - root) < 1e-9 && Math.abs(hit.tB - root) < 1e-9)).toBe(true);
  }
  for (const root of roots) {
    expect(hits.some((hit) => Math.abs(hit.tA - root) < 1e-9)).toBe(true);
  }
}

describe('parameter 허용 오차 0 교차', () => {
  test('cubic과 cubic이 X자로 만나면 t = 0.5의 cross만 돌려준다', () => {
    const hits = cubicCubicIntersectionsInto(
      [],
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 0, y: 3 },
      { x: 1, y: 2.1 },
      { x: 2, y: 0.9 },
      { x: 3, y: 0 },
      EXTREME
    );
    expectCrossingsAt(hits, [0.5]);
  }, 30000);

  test('quadratic과 quadratic이 두 점에서 만나면 두 근 모두 cross로 돌려준다', () => {
    const hits = quadraticQuadraticIntersectionsInto(
      [],
      { x: 0, y: 0 },
      { x: 1.5, y: 3 },
      { x: 3, y: 0 },
      { x: 0, y: 3 },
      { x: 1.5, y: -1 },
      { x: 3, y: 3 },
      EXTREME
    );
    expectCrossingsAt(hits, [0.3110177634953864, 0.6889822365046137]);
  }, 30000);

  test('quadratic과 cubic이 한 점에서 만나면 t = 0.5의 cross만 돌려준다', () => {
    const hits = quadraticCubicIntersectionsInto(
      [],
      { x: 0, y: 0 },
      { x: 1.5, y: 3 },
      { x: 3, y: 0 },
      { x: 0, y: 3 },
      { x: 1, y: 2 },
      { x: 2, y: 1 },
      { x: 3, y: 0 },
      EXTREME
    );
    expectCrossingsAt(hits, [0.5]);
  }, 30000);
});
