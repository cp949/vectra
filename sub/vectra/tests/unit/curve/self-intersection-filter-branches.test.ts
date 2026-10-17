/**
 * cubicSelfIntersectionsInto의 후보 필터 분기 테스트.
 *
 * 검증 항목:
 *  1. p0 = p3인 닫힌 loop의 끝점 근방 후보를 epsilonT에 따라 남기거나 버린다.
 *  2. parameter 허용 오차를 0으로 낮춰 수렴한 후보도 거리 필터를 거친다.
 *  3. maxDepth에서 멈춘 후보는 수렴 판정과 거리 필터의 조합에 따라 남거나 버려진다.
 *
 * 설계 메모:
 *  - 3번 입력은 무작위 탐색으로 고른 것이다. 필터 조건을 하나씩 바꾼 변이가 각각 다른 결과를 내는 최소 입력이다.
 *  - 기대값은 현재 동작이다. 닫힌 loop의 끝점 근방 cross처럼 알고리즘이 바뀌면 달라질 수 있다.
 */
import { describe, expect, test } from 'vitest';
import { cubicSelfIntersectionsInto } from '../../../src/curve/cubic-self-intersections-into';
import type { IntersectionHit, XYInput } from '../../../src/types';

/** [x, y] 쌍 네 개로 cubic 제어점을 만든다. */
function controlPoints(coords: readonly (readonly [number, number])[]): XYInput[] {
  return coords.map(([x, y]) => ({ x, y }));
}

/** 제어점 배열로 자기 교차를 구한다. */
function selfHits(p: readonly XYInput[], options?: { epsilon?: number; epsilonT?: number; maxDepth?: number }) {
  const hits: IntersectionHit[] = [];
  return cubicSelfIntersectionsInto(hits, p[0], p[1], p[2], p[3], options);
}

/** hit 목록을 [tA, tB] 쌍으로 줄여 비교하기 쉽게 만든다. */
function params(hits: readonly IntersectionHit[]): number[][] {
  return hits.map((h) => [h.tA, h.tB]);
}

const closedLoop = controlPoints([
  [0, 0],
  [5, 5],
  [-3, 5],
  [0, 0],
]);
const openLoop = controlPoints([
  [0, 0],
  [4, 3],
  [-1, 3],
  [3, 0],
]);
const TIGHT = { epsilon: 1e-300, epsilonT: 0, maxDepth: 1000 };

describe('닫힌 loop의 끝점 필터', () => {
  test('기본 옵션이면 t = 0과 t = 1 근방의 cross 하나를 돌려준다', () => {
    const hits = selfHits(closedLoop);
    expect(hits).toHaveLength(1);
    expect(hits[0].kind).toBe('cross');
    expect(hits[0].tA).toBeLessThan(1e-4);
    expect(hits[0].tB).toBeGreaterThan(1 - 1e-4);
  });

  test('epsilonT가 끝점 근방을 덮으면 그 후보를 버린다', () => {
    expect(selfHits(closedLoop, { epsilonT: 1e-3 })).toEqual([]);
  });
});

describe('parameter 허용 오차 0의 거리 필터', () => {
  test('열린 loop는 수렴한 교점을 t = (3 ∓ √3) / 6 근방에서 하나 돌려준다', () => {
    const hits = selfHits(openLoop, TIGHT);
    expect(hits).toHaveLength(1);
    expect(hits[0].kind).toBe('cross');
    expect(hits[0].tA).toBeCloseTo(0.2113248654051871, 9);
    expect(hits[0].tB).toBeCloseTo(0.7886751345948129, 9);
  });

  test('닫힌 loop는 끝점 근방 후보가 거리 필터에서 사라진다', () => {
    expect(selfHits(closedLoop, TIGHT)).toEqual([]);
  });
});

describe('maxDepth에서 멈춘 후보 필터', () => {
  test('한 쪽 폭만 epsilonT 이하이면 수렴으로 보지 않아 후보를 모두 남긴다', () => {
    const loop = controlPoints([
      [-1.5, 5],
      [2, 1.5],
      [0, 2],
      [-1.5, 5],
    ]);
    const hits = selfHits(loop, { epsilonT: 0.1, maxDepth: 5, epsilon: 1 });
    expect(hits).toHaveLength(2);
    expect(params(hits)[0][0]).toBeCloseTo(0.09375, 12);
    expect(params(hits)[0][1]).toBeCloseTo(0.6875, 12);
    expect(params(hits)[1][0]).toBeCloseTo(0.6768867317062364, 9);
  });

  test('tA와 tB가 모두 끝점 근방인 후보만 끝점 필터로 버린다', () => {
    const loop = controlPoints([
      [-1, 0.5],
      [2.5, 0],
      [2.5, 0.5],
      [-1, 0.5],
    ]);
    const hits = selfHits(loop, { epsilonT: 0.1, maxDepth: 5, epsilon: 0.1 });
    expect(hits).toHaveLength(1);
    expect(hits[0].tA).toBeCloseTo(0.4479867228009278, 9);
  });

  test('tB만 끝점 근방인 후보는 끝점 필터에 걸리지 않는다', () => {
    const loop = controlPoints([
      [2, 3],
      [0.5, 4.5],
      [2, 1],
      [2, 3],
    ]);
    const hits = selfHits(loop, { epsilonT: 0.01, maxDepth: 14, epsilon: 0.1 });
    expect(params(hits)[0]).toEqual([0.00390625, 0.98046875]);
    expect(hits).toHaveLength(3);
  });

  test('tA만 끝점 근방이 아닌 후보는 끝점 필터에 걸리지 않는다', () => {
    const loop = controlPoints([
      [1, 5.5],
      [-1, 3.5],
      [1, 1.5],
      [1, 5.5],
    ]);
    expect(params(selfHits(loop, { epsilonT: 0.2, maxDepth: 14, epsilon: 1 }))).toEqual([[0.3125, 0.8125]]);
  });

  test('maxDepth에서 멈춘 후보는 거리 필터를 건너뛰고 남긴다', () => {
    const loop = controlPoints([
      [0, 2],
      [1, 3.5],
      [6, 0],
      [0, 2],
    ]);
    expect(params(selfHits(loop, { epsilonT: 0.001, maxDepth: 5 }))).toEqual([[0.03125, 0.9375]]);
  });

  test('수렴한 후보라도 거리가 epsilon 이내이면 남긴다', () => {
    const loop = controlPoints([
      [-1.5, 0],
      [0, 3],
      [-0.5, 5],
      [-1.5, 0],
    ]);
    const hits = selfHits(loop, { epsilonT: 0.1, maxDepth: 6, epsilon: 1 });
    expect(hits).toHaveLength(3);
    expect(params(hits)[0]).toEqual([0.21875, 0.71875]);
  });
});
