/**
 * polygonBoundaryClosest / polygonBoundaryDistance의 분기 경계를 고정하는 characterization test.
 *
 * closest-point-into / distance-to-point / classify-point / sdf-polygon 등에서 간접 검증되지만,
 * tie-break(같은 거리의 edge가 여럿일 때 더 작은 index 채택)와 zero-length edge 처리는
 * 직접 exercise된 적이 없다.
 */

import { describe, expect, test } from 'vitest';
import {
  type PolygonClosestScratch,
  polygonBoundaryClosest,
  polygonBoundaryDistance,
} from '../../../src/internal/polygon-boundary-closest.internal';

function makeScratch(): PolygonClosestScratch {
  return { cx: Number.NaN, cy: Number.NaN };
}

describe('polygonBoundaryDistance / polygonBoundaryClosest', () => {
  test('squared distance(polygonBoundaryClosest) = distance(polygonBoundaryDistance)^2 다', () => {
    // 이등변삼각형 A=(0,10) B=(-5,-5) C=(5,-5), query=(0,0) → 변 AB 위 최근접점(-3,1), distance=sqrt(10)
    const triangle = [
      [0, 10],
      [-5, -5],
      [5, -5],
    ] as const;

    const distance = polygonBoundaryDistance(triangle, 0, 0, null);
    const squared = polygonBoundaryClosest(triangle, 0, 0, null);

    expect(distance).toBeCloseTo(Math.sqrt(10), 10);
    expect(squared).toBeCloseTo(10, 8);
  });

  test('두 edge가 동일한 최소 거리를 가지면 더 작은 edge index의 closest를 채택한다(strict less-than tie-break)', () => {
    // 이등변삼각형 A=(0,10) B=(-5,-5) C=(5,-5), query=(0,0).
    // edge0(A-B)와 edge2(C-A)가 정확히 sqrt(10)로 동률이고, closest는 각각 (-3,1)/(3,1)로 다르다.
    // edge0이 먼저 evaluate되므로 strict `<` 비교에서 edge2로 덮어써지지 않고 edge0의 (-3,1)이 남는다.
    const triangle = [
      [0, 10],
      [-5, -5],
      [5, -5],
    ] as const;
    const scratch = makeScratch();

    polygonBoundaryDistance(triangle, 0, 0, scratch);

    expect(scratch).toEqual({ cx: -3, cy: 1 });
  });

  test('zero-length edge(반복 vertex)는 해당 vertex를 closest로 사용하고 NaN을 만들지 않는다', () => {
    // 두 edge가 모두 (0,0)-(0,0)인 zero-length polygon이다. query=(0,3)에서 zero-length
    // 분기를 제거하면 모든 edge의 distance가 NaN이 되어 Infinity가 그대로 반환된다.
    const degenerate = [
      [0, 0],
      [0, 0],
    ] as const;
    const scratch = makeScratch();

    const distance = polygonBoundaryDistance(degenerate, 0, 3, scratch);

    expect(distance).toBe(3);
    expect(scratch).toEqual({ cx: 0, cy: 0 });
  });

  test('outScratch에 null을 넘기면 좌표를 기록하지 않고 거리만 계산한다', () => {
    const triangle = [
      [0, 10],
      [-5, -5],
      [5, -5],
    ] as const;

    expect(() => polygonBoundaryDistance(triangle, 0, 0, null)).not.toThrow();
  });
});
