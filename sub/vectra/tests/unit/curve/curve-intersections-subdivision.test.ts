/**
 * curve.subdivideCurves — 커브 교차 subdivision kernel의 계산 계약을 검증한다.
 *
 * 대상 함수:
 *  - splitCubic       : t=0.5 De Casteljau 분할
 *  - splitQuadratic   : t=0.5 De Casteljau 분할
 *  - subdivideCurves  : bounds 조기 종료, span 재귀, maxDepth 수렴, 콜백 데이터 흐름
 */

import { describe, expect, test } from 'vitest';
import { splitCubic, splitQuadratic, subdivideCurves } from '../../../src/curve/curve-intersections.internal';
import type { IntersectionHit } from '../../../src/types';

describe('curve subdivision - splitCubic', () => {
  test('직선형 cubic — De Casteljau 중점이 등간격으로 나뉜다', () => {
    // 손으로 계산 가능한 직선형 control point로 각 half의 전체 좌표를 고정한다.
    const [left, right] = splitCubic(0, 0, 1, 0, 2, 0, 3, 0);
    expect(left).toEqual([0, 0, 0.5, 0, 1, 0, 1.5, 0]);
    expect(right).toEqual([1.5, 0, 2, 0, 2.5, 0, 3, 0]);
  });

  test('원본 시작/끝점을 보존하고, 두 half가 t=0.5에서 연속이다', () => {
    // 비대칭 control point에서도 endpoint 보존과 half 연결점 연속성을 함께 확인한다.
    const [left, right] = splitCubic(0, 0, 2, 3, -2, 3, 4, 0);
    expect([left[0], left[1]]).toEqual([0, 0]);
    expect([right[6], right[7]]).toEqual([4, 0]);
    expect([left[6], left[7]]).toEqual([right[0], right[1]]);
  });
});

describe('curve subdivision - splitQuadratic', () => {
  test('직선형 quadratic — De Casteljau 중점이 등간격으로 나뉜다', () => {
    // 손으로 계산 가능한 직선형 control point로 각 half의 전체 좌표를 고정한다.
    const [left, right] = splitQuadratic(0, 0, 2, 0, 4, 0);
    expect(left).toEqual([0, 0, 1, 0, 2, 0]);
    expect(right).toEqual([2, 0, 3, 0, 4, 0]);
  });

  test('원본 시작/끝점을 보존하고, 두 half가 t=0.5에서 연속이다', () => {
    // 굽은 quadratic에서도 endpoint 보존과 half 연결점 연속성을 함께 확인한다.
    const [left, right] = splitQuadratic(0, 0, 2, 4, 4, 0);
    expect([left[0], left[1]]).toEqual([0, 0]);
    expect([right[4], right[5]]).toEqual([4, 0]);
    expect([left[4], left[5]]).toEqual([right[0], right[1]]);
  });
});

/** subdivideCurves trunk만 분리 검증하기 위한 1차원 [lo, hi] range adapter. */
type Range = [number, number];

function rangeHullBounds(sub: Range): [number, number, number, number] {
  return [sub[0], 0, sub[1], 0];
}

function splitRange(sub: Range): [Range, Range] {
  const mid = (sub[0] + sub[1]) * 0.5;
  return [
    [sub[0], mid],
    [mid, sub[1]],
  ];
}

describe('curve subdivision - subdivideCurves trunk', () => {
  test('hull-bounds가 겹치지 않으면 onConverge를 호출하지 않는다', () => {
    // 겹치지 않는 branch는 split과 수렴 콜백 전에 제거돼야 한다.
    const calls: Array<[number, number, number, number]> = [];
    const outHits: IntersectionHit[] = [];
    subdivideCurves<Range, Range, IntersectionHit['point']>(
      outHits,
      [0, 10],
      0,
      1,
      [20, 30],
      0,
      1,
      [0, 10],
      0,
      0.001,
      50,
      0,
      () => ({ x: 0, y: 0 }),
      {
        hullBoundsA: rangeHullBounds,
        hullBoundsB: rangeHullBounds,
        splitA: splitRange,
        splitB: splitRange,
        onConverge: (_outHits, tA0, tA1, tB0, tB1) => calls.push([tA0, tA1, tB0, tB1]),
      }
    );
    expect(calls).toHaveLength(0);
  });

  test('겹치는 range는 span이 epsilonT 이하로 수렴할 때까지 재귀한 뒤 onConverge를 호출한다', () => {
    // 한쪽 span만 계속 줄이는 회귀도 잡도록 양쪽 최종 span을 모두 검증한다.
    const calls: Array<[number, number, number, number]> = [];
    const outHits: IntersectionHit[] = [];
    subdivideCurves<Range, Range, IntersectionHit['point']>(
      outHits,
      [0, 10],
      0,
      1,
      [3, 13],
      0,
      1,
      [0, 10],
      0,
      0.001,
      50,
      0,
      () => ({ x: 0, y: 0 }),
      {
        hullBoundsA: rangeHullBounds,
        hullBoundsB: rangeHullBounds,
        splitA: splitRange,
        splitB: splitRange,
        onConverge: (_outHits, tA0, tA1, tB0, tB1) => calls.push([tA0, tA1, tB0, tB1]),
      }
    );
    expect(calls.length).toBeGreaterThan(0);
    for (const [tA0, tA1, tB0, tB1] of calls) {
      expect(tA1 - tA0).toBeLessThanOrEqual(0.001);
      expect(tB1 - tB0).toBeLessThanOrEqual(0.001);
    }
  });

  test('maxDepth 도달 시 span이 남아 있어도 즉시 onConverge를 호출한다', () => {
    // depth 제한은 epsilonT 수렴보다 우선하는 강제 종료 계약이다.
    const calls: Array<[number, number, number, number]> = [];
    const outHits: IntersectionHit[] = [];
    subdivideCurves<Range, Range, IntersectionHit['point']>(
      outHits,
      [0, 10],
      0,
      1,
      [3, 13],
      0,
      1,
      [0, 10],
      0,
      0.001,
      0,
      0,
      () => ({ x: 0, y: 0 }),
      {
        hullBoundsA: rangeHullBounds,
        hullBoundsB: rangeHullBounds,
        splitA: splitRange,
        splitB: splitRange,
        onConverge: (_outHits, tA0, tA1, tB0, tB1) => calls.push([tA0, tA1, tB0, tB1]),
      }
    );
    expect(calls).toEqual([[0, 1, 0, 1]]);
  });

  test('수렴 콜백에 불변 origA와 현재 depth의 bSub를 전달한다', () => {
    // B만 한 번 분할해 origA identity와 두 current B half를 독립적으로 관찰한다.
    const origA: Range = [100, 200];
    const converged: Array<{ origA: Range; bSub: Range }> = [];

    subdivideCurves<Range, Range, IntersectionHit['point']>(
      [],
      [2, 6],
      0,
      0.25,
      [0, 8],
      0,
      0.5,
      origA,
      0,
      0.25,
      10,
      0,
      () => ({ x: 0, y: 0 }),
      {
        hullBoundsA: rangeHullBounds,
        hullBoundsB: rangeHullBounds,
        splitA: splitRange,
        splitB: splitRange,
        onConverge: (_outHits, _tA0, _tA1, _tB0, _tB1, receivedOrigA, currentBSub) =>
          converged.push({ origA: receivedOrigA, bSub: currentBSub }),
      }
    );

    expect(converged).toHaveLength(2);
    expect(converged[0].origA).toBe(origA);
    expect(converged[1].origA).toBe(origA);
    expect(converged.map(({ bSub }) => bSub)).toEqual([
      [0, 4],
      [4, 8],
    ]);
  });
});
