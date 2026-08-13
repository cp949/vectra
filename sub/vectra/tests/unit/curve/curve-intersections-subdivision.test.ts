/**
 * curve-intersections.internal의 splitCubic/splitQuadratic/subdivideCurves 단위 테스트.
 *
 * cubic-cubic/cubic-self/quadratic-cubic/quadratic-quadratic 4개 파일에 중복돼 있던
 * split/subdivide kernel을 승격한 뒤 direct test가 없던 상태를 characterization golden으로
 * 고정한다. subdivideCurves는 fake adapter로 trunk(hull-bounds 조기 종료/span 분기/재귀/
 * maxDepth)만 분리해서 검증하고, 마지막 test에서 실제 cubic adapter로 배선해 leaf golden과
 * 동일한 교차점을 재현한다.
 */

import { describe, expect, test } from 'vitest';
import {
  type CubicFlat,
  classifyIntersectionKind,
  cubicHullBounds,
  cubicTangent,
  pushHitIfNewAB,
  SUBDIVISION_DEDUPE_T_FACTOR,
  SUBDIVISION_KIND_EPSILON_FACTOR,
  splitCubic,
  splitQuadratic,
  subdivideCurves,
} from '../../../src/curve/curve-intersections.internal';
import type { IntersectionHit } from '../../../src/types';

describe('splitCubic', () => {
  test('직선형 cubic — De Casteljau 중점이 등간격으로 나뉜다', () => {
    const [left, right] = splitCubic(0, 0, 1, 0, 2, 0, 3, 0);
    expect(left).toEqual([0, 0, 0.5, 0, 1, 0, 1.5, 0]);
    expect(right).toEqual([1.5, 0, 2, 0, 2.5, 0, 3, 0]);
  });

  test('원본 시작/끝점을 보존하고, 두 half가 t=0.5에서 연속이다', () => {
    const [left, right] = splitCubic(0, 0, 2, 3, -2, 3, 4, 0);
    expect([left[0], left[1]]).toEqual([0, 0]);
    expect([right[6], right[7]]).toEqual([4, 0]);
    expect([left[6], left[7]]).toEqual([right[0], right[1]]);
  });
});

describe('splitQuadratic', () => {
  test('직선형 quadratic — De Casteljau 중점이 등간격으로 나뉜다', () => {
    const [left, right] = splitQuadratic(0, 0, 2, 0, 4, 0);
    expect(left).toEqual([0, 0, 1, 0, 2, 0]);
    expect(right).toEqual([2, 0, 3, 0, 4, 0]);
  });

  test('원본 시작/끝점을 보존하고, 두 half가 t=0.5에서 연속이다', () => {
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

describe('subdivideCurves — trunk 분기', () => {
  test('hull-bounds가 겹치지 않으면 onConverge를 호출하지 않는다', () => {
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
});

describe('subdivideCurves — 실제 cubic adapter 배선', () => {
  test('두 transversal cubic 교차점을 leaf golden과 동일하게 재현한다', () => {
    // cubic-cubic-intersections-into.test.ts의 '두 transversal 교차점을 각각 한 hit로
    // 반환한다' 케이스와 동일 입력 — y≈0.5에서 2개 hit.
    const origA: CubicFlat = [0, 0, 0.3, 1, 0.7, 1, 1, 0];
    const bSub: CubicFlat = [0, 0.5, 0.3, 0.5, 0.7, 0.5, 1, 0.5];
    const outHits: IntersectionHit[] = [];

    function onConverge(
      hits: IntersectionHit[],
      tA0: number,
      tA1: number,
      tB0: number,
      tB1: number,
      oA: CubicFlat,
      b: CubicFlat,
      epsilon: number,
      epsilonT: number,
      makePoint: () => IntersectionHit['point']
    ): void {
      const tAMid = (tA0 + tA1) * 0.5;
      const tBMid = (tB0 + tB1) * 0.5;
      const spanA = tA1 - tA0;
      const spanB = tB1 - tB0;
      const [oA0x, oA0y, oA1x, oA1y, oA2x, oA2y, oA3x, oA3y] = oA;
      const mt = 1 - tAMid;
      const mt2 = mt * mt;
      const mt3 = mt2 * mt;
      const t2 = tAMid * tAMid;
      const t3 = t2 * tAMid;
      const px = mt3 * oA0x + 3 * mt2 * tAMid * oA1x + 3 * mt * t2 * oA2x + t3 * oA3x;
      const py = mt3 * oA0y + 3 * mt2 * tAMid * oA1y + 3 * mt * t2 * oA2y + t3 * oA3y;
      const [taxDx, taxDy] = cubicTangent(oA0x, oA0y, oA1x, oA1y, oA2x, oA2y, oA3x, oA3y, tAMid);
      const [tbxDx, tbxDy] = cubicTangent(b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7], 0.5);
      const kindEpsilon = Math.max(epsilon, SUBDIVISION_KIND_EPSILON_FACTOR * Math.max(spanA, spanB));
      const kind = classifyIntersectionKind(taxDx, taxDy, tbxDx, tbxDy, kindEpsilon);
      const dedupeT = Math.max(epsilonT, SUBDIVISION_DEDUPE_T_FACTOR * Math.max(spanA, spanB));
      pushHitIfNewAB(hits, px, py, kind, tAMid, tBMid, dedupeT, makePoint);
    }

    subdivideCurves<CubicFlat, CubicFlat, IntersectionHit['point']>(
      outHits,
      origA,
      0,
      1,
      bSub,
      0,
      1,
      origA,
      1e-9,
      1e-10,
      32,
      0,
      () => ({ x: 0, y: 0 }),
      {
        hullBoundsA: (sub) => cubicHullBounds(...sub),
        hullBoundsB: (sub) => cubicHullBounds(...sub),
        splitA: (sub) => splitCubic(...sub),
        splitB: (sub) => splitCubic(...sub),
        onConverge,
      }
    );

    expect(outHits).toHaveLength(2);
    expect(outHits[0].point.y).toBeCloseTo(0.5, 4);
    expect(outHits[1].point.y).toBeCloseTo(0.5, 4);
  });
});
