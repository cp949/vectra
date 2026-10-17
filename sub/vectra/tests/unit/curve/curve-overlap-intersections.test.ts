/**
 * curve × curve 교차 kernel의 overlap 계약을 검증한다.
 *
 * 같은 기하 곡선 위에서 구간이 겹치면 subdivision이 겹침 전체를 hit로 쪼개지 않고
 * 겹침 구간 양 끝점을 `kind: 'overlap'` hit 2건으로 기록해야 한다.
 * 대상: quadraticQuadratic / quadraticCubic / cubicCubic kernel과 curveCurve facade.
 */

import { describe, expect, test } from 'vitest';
import { cubicCubicIntersectionsInto } from '../../../src/curve/cubic-cubic-intersections-into';
import { cubicSplit } from '../../../src/curve/cubic-split';
import { quadraticCubicIntersectionsInto } from '../../../src/curve/quadratic-cubic-intersections-into';
import { quadraticElevateToCubic } from '../../../src/curve/quadratic-elevate-to-cubic';
import { quadraticQuadraticIntersectionsInto } from '../../../src/curve/quadratic-quadratic-intersections-into';
import { curveCurveIntersectionsInto } from '../../../src/intersects/curve-curve-intersections-into';
import type { CurveIntersectionHit, IntersectionHit } from '../../../src/types';

// y = x² parabola 위 quadratic. x 구간 [a, b]의 control point는 ((a+b)/2, a·b)다.
const PARABOLA_0_2 = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 4 },
] as const;
const PARABOLA_1_3 = [
  { x: 1, y: 1 },
  { x: 2, y: 3 },
  { x: 3, y: 9 },
] as const;
const PARABOLA_2_3 = [
  { x: 2, y: 4 },
  { x: 2.5, y: 6 },
  { x: 3, y: 9 },
] as const;

// 자기 교차 loop를 가진 cubic. loop 교차 parameter는 약 0.1727, 0.8273이다.
const LOOP_CUBIC = [
  { x: 0, y: 0 },
  { x: 3, y: 2 },
  { x: -1, y: 2 },
  { x: 2, y: 0 },
] as const;

const S_CUBIC = [
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 2, y: -1 },
  { x: 3, y: 1 },
] as const;

/**
 * hit 순서는 계약이 아니므로 tA 오름차순으로 정렬한 사본을 만든다.
 * 같은 tA면 tB로 정렬해 비교 대상 순서를 고정한다.
 */
function sortByTA<T extends { tA?: number; tB?: number }>(hits: readonly T[]): T[] {
  return [...hits].sort((a, b) => (a.tA ?? 0) - (b.tA ?? 0) || (a.tB ?? 0) - (b.tB ?? 0));
}

/**
 * cubic을 [t0, t1] 구간으로 잘라 같은 기하의 sub-curve control point를 만든다.
 * 부분 겹침 fixture를 손 계산 없이 만들기 위해 쓴다.
 */
function cubicSubCurve(points: typeof LOOP_CUBIC, t0: number, t1: number) {
  const { left } = cubicSplit(points[0], points[1], points[2], points[3], t1);
  const { right } = cubicSplit(left.p0, left.p1, left.p2, left.p3, t0 / t1);
  return [right.p0, right.p1, right.p2, right.p3] as const;
}

describe('quadraticQuadraticIntersectionsInto overlap', () => {
  test('완전히 같은 두 quadratic은 양 끝점 overlap hit 2건만 기록한다', () => {
    const hits: IntersectionHit[] = [];
    quadraticQuadraticIntersectionsInto(hits, ...PARABOLA_0_2, ...PARABOLA_0_2);

    expect(hits).toHaveLength(2);
    const [start, end] = sortByTA(hits);
    expect(start.kind).toBe('overlap');
    expect(start.tA).toBe(0);
    expect(start.tB).toBe(0);
    expect(start.point).toEqual({ x: 0, y: 0 });
    expect(end.kind).toBe('overlap');
    expect(end.tA).toBe(1);
    expect(end.tB).toBe(1);
    expect(end.point).toEqual({ x: 2, y: 4 });
  });

  test('같은 parabola 위 부분 구간이 겹치면 겹침 구간 양 끝점을 기록한다', () => {
    // A는 x∈[0,2], B는 x∈[1,3]. 겹침은 x∈[1,2]로 tA∈[0.5,1], tB∈[0,0.5]다.
    const hits: IntersectionHit[] = [];
    quadraticQuadraticIntersectionsInto(hits, ...PARABOLA_0_2, ...PARABOLA_1_3);

    expect(hits).toHaveLength(2);
    const [start, end] = sortByTA(hits);
    expect(start.kind).toBe('overlap');
    expect(start.tA).toBeCloseTo(0.5, 9);
    expect(start.tB).toBe(0);
    expect(start.point.x).toBeCloseTo(1, 9);
    expect(start.point.y).toBeCloseTo(1, 9);
    expect(end.kind).toBe('overlap');
    expect(end.tA).toBe(1);
    expect(end.tB).toBeCloseTo(0.5, 9);
    expect(end.point.x).toBeCloseTo(2, 9);
    expect(end.point.y).toBeCloseTo(4, 9);
  });

  test('같은 parabola 위에서 끝점만 맞닿으면 overlap이 아니라 hit 1건이다', () => {
    // A는 x∈[0,2], B는 x∈[2,3]. 공유점 (2,4) 하나뿐이다.
    const hits: IntersectionHit[] = [];
    quadraticQuadraticIntersectionsInto(hits, ...PARABOLA_0_2, ...PARABOLA_2_3);

    expect(hits).toHaveLength(1);
    expect(hits[0].kind).not.toBe('overlap');
    expect(hits[0].tA).toBe(1);
    expect(hits[0].tB).toBe(0);
    expect(hits[0].point.x).toBeCloseTo(2, 9);
    expect(hits[0].point.y).toBeCloseTo(4, 9);
  });

  test('양 끝점을 공유하지만 모양이 다른 두 quadratic은 overlap으로 판정하지 않는다', () => {
    const hits: IntersectionHit[] = [];
    quadraticQuadraticIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: -2 },
      { x: 2, y: 0 }
    );

    expect(hits).toHaveLength(2);
    expect(hits.every((hit) => hit.kind !== 'overlap')).toBe(true);
  });
});

describe('cubicCubicIntersectionsInto overlap', () => {
  test('완전히 같은 두 cubic은 양 끝점 overlap hit 2건만 기록한다', () => {
    const hits: IntersectionHit[] = [];
    cubicCubicIntersectionsInto(hits, ...S_CUBIC, ...S_CUBIC);

    expect(hits).toHaveLength(2);
    const [start, end] = sortByTA(hits);
    expect(start).toMatchObject({ kind: 'overlap', tA: 0, tB: 0, point: { x: 0, y: 0 } });
    expect(end).toMatchObject({ kind: 'overlap', tA: 1, tB: 1, point: { x: 3, y: 1 } });
  });

  test('방향이 반대인 같은 cubic은 tA와 tB가 반대로 대응한다', () => {
    const reversed = [S_CUBIC[3], S_CUBIC[2], S_CUBIC[1], S_CUBIC[0]] as const;
    const hits: IntersectionHit[] = [];
    cubicCubicIntersectionsInto(hits, ...S_CUBIC, ...reversed);

    expect(hits).toHaveLength(2);
    const [start, end] = sortByTA(hits);
    expect(start).toMatchObject({ kind: 'overlap', tA: 0, tB: 1 });
    expect(end).toMatchObject({ kind: 'overlap', tA: 1, tB: 0 });
  });

  test('시작점과 끝점이 같은 closed cubic도 같으면 양 끝점 overlap hit 2건만 기록한다', () => {
    // endpoint projection이 t=0/t=1 동점이 되는 경우다. 대응 parameter 쌍을 둘 다 후보로 봐야 한다.
    const closed = [
      { x: 0, y: 0 },
      { x: 3, y: 2 },
      { x: -3, y: 2 },
      { x: 0, y: 0 },
    ] as const;
    const hits: IntersectionHit[] = [];
    cubicCubicIntersectionsInto(hits, ...closed, ...closed);

    expect(hits).toHaveLength(2);
    const [start, end] = sortByTA(hits);
    expect(start).toMatchObject({ kind: 'overlap', tA: 0, tB: 0 });
    expect(end).toMatchObject({ kind: 'overlap', tA: 1, tB: 1 });
  });

  test('부분 겹침과 별도 loop 교차가 함께 있으면 overlap 2건과 cross 1건을 기록한다', () => {
    // A = C[0, 0.6], B = C[0.4, 1]. 겹침은 C[0.4, 0.6]이고 loop 교차는 A·B에 하나씩 걸친다.
    const a = cubicSubCurve(LOOP_CUBIC, 0, 0.6);
    const b = cubicSubCurve(LOOP_CUBIC, 0.4, 1);
    const hits: IntersectionHit[] = [];
    cubicCubicIntersectionsInto(hits, ...a, ...b);

    const overlaps = sortByTA(hits.filter((hit) => hit.kind === 'overlap'));
    const others = hits.filter((hit) => hit.kind !== 'overlap');
    expect(overlaps).toHaveLength(2);
    expect(overlaps[0].tA).toBeCloseTo(0.4 / 0.6, 6);
    expect(overlaps[0].tB).toBeCloseTo(0, 6);
    expect(overlaps[1].tA).toBeCloseTo(1, 6);
    expect(overlaps[1].tB).toBeCloseTo(0.2 / 0.6, 6);
    expect(others).toHaveLength(1);
    expect(others[0].kind).toBe('cross');
    expect(others[0].point.x).toBeCloseTo(1, 3);
    expect(others[0].point.y).toBeCloseTo(0.857, 3);
  });
});

describe('quadraticCubicIntersectionsInto overlap', () => {
  test('quadratic과 그 차수 올림 cubic은 양 끝점 overlap hit 2건만 기록한다', () => {
    const cubic = quadraticElevateToCubic(...PARABOLA_0_2);
    const hits: IntersectionHit[] = [];
    quadraticCubicIntersectionsInto(hits, ...PARABOLA_0_2, cubic.p0, cubic.p1, cubic.p2, cubic.p3);

    expect(hits).toHaveLength(2);
    const [start, end] = sortByTA(hits);
    expect(start).toMatchObject({ kind: 'overlap', tA: 0, tB: 0 });
    expect(end).toMatchObject({ kind: 'overlap', tA: 1, tB: 1 });
  });
});

describe('curveCurveIntersectionsInto overlap', () => {
  test('facade도 overlap kind를 그대로 노출한다', () => {
    const out: CurveIntersectionHit[] = [];
    curveCurveIntersectionsInto(
      out,
      { kind: 'cubic', p0: S_CUBIC[0], p1: S_CUBIC[1], p2: S_CUBIC[2], p3: S_CUBIC[3] },
      { kind: 'cubic', p0: S_CUBIC[0], p1: S_CUBIC[1], p2: S_CUBIC[2], p3: S_CUBIC[3] }
    );

    expect(sortByTA(out)).toEqual([
      { x: 0, y: 0, kind: 'overlap', tA: 0, tB: 0 },
      { x: 3, y: 1, kind: 'overlap', tA: 1, tB: 1 },
    ]);
  });

  test('(cubic, quadratic) 순서에서도 overlap hit의 tA/tB가 caller 순서를 따른다', () => {
    // cubic은 PARABOLA_1_3의 차수 올림이고 quadratic은 PARABOLA_0_2다. 겹침은 x∈[1,2]다.
    const cubic = quadraticElevateToCubic(...PARABOLA_1_3);
    const out: CurveIntersectionHit[] = [];
    curveCurveIntersectionsInto(
      out,
      { kind: 'cubic', ...cubic },
      { kind: 'quadratic', p0: PARABOLA_0_2[0], p1: PARABOLA_0_2[1], p2: PARABOLA_0_2[2] }
    );

    expect(out).toHaveLength(2);
    const [start, end] = sortByTA(out);
    expect(start.kind).toBe('overlap');
    expect(start.tA).toBeCloseTo(0, 9);
    expect(start.tB).toBeCloseTo(0.5, 9);
    expect(end.kind).toBe('overlap');
    expect(end.tA).toBeCloseTo(0.5, 9);
    expect(end.tB).toBeCloseTo(1, 9);
  });
});
