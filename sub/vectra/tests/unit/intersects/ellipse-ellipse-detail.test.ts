/**
 * ellipseEllipseDetail 단위 테스트.
 *
 * S10-RM-005: 두 axis-aligned ellipse boundary 교차 관계 detail의
 * none/point/two-point/multi-point/overlap/contains 분기, 좌표/parameter 값,
 * ordering, residual 가드, numeric 경계(near-tangent band·극단 scale)를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { ellipseEllipseDetail } from '../../../src/intersects/ellipse-ellipse-detail';
import type { EllipseEllipseDetail, EllipseLike } from '../../../src/types';

const EPS = 1e-9;

/** object ellipse helper */
function E(cx: number, cy: number, rx: number, ry: number): EllipseLike {
  return { center: { x: cx, y: cy }, radiusX: rx, radiusY: ry };
}

/** 정규화 ellipse 방정식 residual */
function residual(x: number, y: number, cx: number, cy: number, rx: number, ry: number): number {
  return Math.abs(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 - 1);
}

/** points 배열을 가진 detail의 모든 점이 양쪽 ellipse 방정식 residual 가드를 통과하는지 확인 */
function expectPointsOnBothBoundaries(
  detail: EllipseEllipseDetail,
  a: { cx: number; cy: number; rx: number; ry: number },
  b: { cx: number; cy: number; rx: number; ry: number },
  tol = 1e-6
): void {
  const pts =
    detail.kind === 'point'
      ? [detail.point]
      : detail.kind === 'two-point' || detail.kind === 'multi-point'
        ? detail.points
        : [];
  for (const p of pts) {
    expect(residual(p.x, p.y, a.cx, a.cy, a.rx, a.ry)).toBeLessThanOrEqual(tol);
    expect(residual(p.x, p.y, b.cx, b.cy, b.rx, b.ry)).toBeLessThanOrEqual(tol);
  }
}

/** ellipse a 정규화 좌표 turn 오름차순 정렬 invariant */
function expectTurnAscending(
  points: ReadonlyArray<{ x: number; y: number }>,
  a: { cx: number; cy: number; rx: number; ry: number }
): void {
  const turns = points.map((p) => {
    let t = Math.atan2((p.y - a.cy) / a.ry, (p.x - a.cx) / a.rx) / (2 * Math.PI);
    t -= Math.floor(t);
    return t < 1 ? t : 0;
  });
  for (let i = 1; i < turns.length; i++) {
    expect(turns[i]).toBeGreaterThanOrEqual(turns[i - 1] as number);
  }
}

describe('ellipseEllipseDetail — overlap 분기', () => {
  test('T1 같은 ellipse는 overlap', () => {
    expect(ellipseEllipseDetail(E(0, 0, 3, 2), E(0, 0, 3, 2))).toEqual({ kind: 'overlap' });
  });

  test('T2 epsilon 이내 같은 radius는 overlap', () => {
    expect(ellipseEllipseDetail(E(0, 0, 3, 2), E(0, 0, 3, 2 + EPS / 2))).toEqual({ kind: 'overlap' });
  });
});

describe('ellipseEllipseDetail — none 분기', () => {
  test('T3 empty ellipse(radiusX=0)는 none', () => {
    expect(ellipseEllipseDetail(E(0, 0, 0, 2), E(0, 0, 1, 1))).toEqual({ kind: 'none' });
  });

  test('T4 empty ellipse(radiusY<0)는 none', () => {
    expect(ellipseEllipseDetail(E(0, 0, 1, 1), E(0, 0, 1, -1))).toEqual({ kind: 'none' });
  });

  test('T5 분리된 ellipse는 none', () => {
    expect(ellipseEllipseDetail(E(0, 0, 1, 1), E(10, 0, 1, 1))).toEqual({ kind: 'none' });
  });

  test('T5b bbox는 겹치지만 실제로는 분리된 ellipse는 none', () => {
    // C5 disjoint의 bbox-overlap 서브케이스.
    // A bbox x[-1,1] y[-1,1], B bbox x[0.5,2.5] y[0.5,2.5]가 x[0.5,1] y[0.5,1]에서 겹치지만
    // 두 단위원 center 거리 √(1.5²+1.5²)≈2.12 > 2이므로 boundary 교점 0개, 어느 쪽도 포함 안 함.
    expect(ellipseEllipseDetail(E(0, 0, 1, 1), E(1.5, 1.5, 1, 1))).toEqual({ kind: 'none' });
  });
});

describe('ellipseEllipseDetail — contains 분기', () => {
  test('T6 a가 b 내부면 contains', () => {
    expect(ellipseEllipseDetail(E(0, 0, 1, 1), E(0, 0, 5, 5))).toEqual({ kind: 'contains' });
  });

  test('T7 b가 a 내부면 contains', () => {
    expect(ellipseEllipseDetail(E(0, 0, 5, 5), E(0, 0, 1, 1))).toEqual({ kind: 'contains' });
  });

  test('서로 다른 axis ratio의 내부 포함도 contains', () => {
    expect(ellipseEllipseDetail(E(0, 0, 1, 0.5), E(0, 0, 5, 4))).toEqual({ kind: 'contains' });
  });
});

describe('ellipseEllipseDetail — point(tangent) 분기', () => {
  test('T8 외접 tangent는 point이며 좌표/parameter가 정확하다', () => {
    const detail = ellipseEllipseDetail(E(0, 0, 2, 2), E(4, 0, 2, 2));
    expect(detail.kind).toBe('point');
    if (detail.kind !== 'point') throw new Error('point 아님');
    expect(detail.point.x).toBeCloseTo(2, 9);
    expect(detail.point.y).toBeCloseTo(0, 9);
    expect(detail.tA).toBeGreaterThanOrEqual(0);
    expect(detail.tA).toBeLessThan(1);
    expect(detail.tB).toBeGreaterThanOrEqual(0);
    expect(detail.tB).toBeLessThan(1);
    expectPointsOnBothBoundaries(detail, { cx: 0, cy: 0, rx: 2, ry: 2 }, { cx: 4, cy: 0, rx: 2, ry: 2 });
  });

  test('T9 내접 tangent는 point', () => {
    // r3 원 안에 r2 원이 (1,0)에 중심 → (3,0)에서 내접
    const detail = ellipseEllipseDetail(E(0, 0, 3, 3), E(1, 0, 2, 2));
    expect(detail.kind).toBe('point');
    if (detail.kind !== 'point') throw new Error('point 아님');
    expect(detail.point.x).toBeCloseTo(3, 9);
    expect(detail.point.y).toBeCloseTo(0, 9);
    expectPointsOnBothBoundaries(detail, { cx: 0, cy: 0, rx: 3, ry: 3 }, { cx: 1, cy: 0, rx: 2, ry: 2 });
  });
});

describe('ellipseEllipseDetail — two-point 분기', () => {
  test('T10 한 축을 공유하는 concentric ellipse는 concentric 접촉 2점(two-point)', () => {
    // rx 공유(=2), ry 다름 → (±2, 0)에서 양쪽 gradient가 평행한 접촉 쌍.
    // transversal crossing이 아니라 concentric 접촉 2점이며 결과 kind는 two-point로 정확.
    // 진짜 transversal symmetric two-point는 아래 'offset 동일 반지름 원' 케이스가 담당한다.
    const detail = ellipseEllipseDetail(E(0, 0, 2, 1), E(0, 0, 2, 3));
    expect(detail.kind).toBe('two-point');
    if (detail.kind !== 'two-point') throw new Error('two-point 아님');
    expect(detail.points).toHaveLength(2);
    expectTurnAscending(detail.points, { cx: 0, cy: 0, rx: 2, ry: 1 });
    expectPointsOnBothBoundaries(detail, { cx: 0, cy: 0, rx: 2, ry: 1 }, { cx: 0, cy: 0, rx: 2, ry: 3 });
  });

  test('offset 동일 반지름 원은 two-point', () => {
    const detail = ellipseEllipseDetail(E(0, 0, 2, 2), E(2, 0, 2, 2));
    expect(detail.kind).toBe('two-point');
    if (detail.kind !== 'two-point') throw new Error('two-point 아님');
    expect(detail.points).toHaveLength(2);
    expectTurnAscending(detail.points, { cx: 0, cy: 0, rx: 2, ry: 2 });
  });
});

describe('ellipseEllipseDetail — multi-point 분기', () => {
  test('T11 4점 교차는 multi-point(length=4)', () => {
    const detail = ellipseEllipseDetail(E(0, 0, 3, 1), E(0, 0, 1, 3));
    expect(detail.kind).toBe('multi-point');
    if (detail.kind !== 'multi-point') throw new Error('multi-point 아님');
    expect(detail.points).toHaveLength(4);
    expectTurnAscending(detail.points, { cx: 0, cy: 0, rx: 3, ry: 1 });
    expectPointsOnBothBoundaries(detail, { cx: 0, cy: 0, rx: 3, ry: 1 }, { cx: 0, cy: 0, rx: 1, ry: 3 });
  });

  test('T12 3점 교차는 multi-point(length=3)', () => {
    // 원 r1 + (0,1) 중심 ellipse(1,2): (0,-1) tangent + (±0.9428, 0.3333) 교차
    const detail = ellipseEllipseDetail(E(0, 0, 1, 1), E(0, 1, 1, 2));
    expect(detail.kind).toBe('multi-point');
    if (detail.kind !== 'multi-point') throw new Error('multi-point 아님');
    expect(detail.points).toHaveLength(3);
    expectTurnAscending(detail.points, { cx: 0, cy: 0, rx: 1, ry: 1 });
    expectPointsOnBothBoundaries(detail, { cx: 0, cy: 0, rx: 1, ry: 1 }, { cx: 0, cy: 1, rx: 1, ry: 2 });
  });
});

describe('ellipseEllipseDetail — 입력 형식', () => {
  test('T13/T14 tuple 입력과 object 입력 결과가 동일하다', () => {
    const objResult = ellipseEllipseDetail(E(0, 0, 3, 2), E(1, 0, 2, 2));
    const tupResult = ellipseEllipseDetail([[0, 0], 3, 2], [[1, 0], 2, 2]);
    expect(tupResult).toEqual(objResult);
  });
});

describe('ellipseEllipseDetail — non-finite 입력', () => {
  test('T15 center.x가 NaN이면 none', () => {
    expect(ellipseEllipseDetail(E(Number.NaN, 0, 1, 1), E(0, 0, 1, 1))).toEqual({ kind: 'none' });
  });

  test('T16 radiusX가 Infinity면 none', () => {
    expect(ellipseEllipseDetail(E(0, 0, 1, 1), E(0, 0, Number.POSITIVE_INFINITY, 1))).toEqual({
      kind: 'none',
    });
  });

  test('T17 center.y가 -Infinity면 none', () => {
    expect(ellipseEllipseDetail(E(0, Number.NEGATIVE_INFINITY, 1, 1), E(0, 0, 1, 1))).toEqual({
      kind: 'none',
    });
  });

  test('radiusY가 NaN이면 none', () => {
    expect(ellipseEllipseDetail(E(0, 0, 1, 1), E(0, 0, 1, Number.NaN))).toEqual({ kind: 'none' });
  });
});

describe('ellipseEllipseDetail — near-tangent epsilon band', () => {
  test('T18 접점 안쪽 밴드는 교차(two-point)', () => {
    // 외접 tangent(centers dist 2)에서 안쪽으로 1e-6 더 가까이 → 2점 교차
    const detail = ellipseEllipseDetail(E(0, 0, 1, 1), E(2 - 1e-6, 0, 1, 1), EPS);
    expect(detail.kind).toBe('two-point');
  });

  test('T19 접점 바깥쪽 밴드는 분리(none)', () => {
    const detail = ellipseEllipseDetail(E(0, 0, 1, 1), E(2 + 1e-6, 0, 1, 1), EPS);
    expect(detail.kind).toBe('none');
  });
});

describe('ellipseEllipseDetail — residual 가드 / ordering / 결과 신선도', () => {
  test('T20 모든 반환 점이 양쪽 ellipse residual 가드를 통과한다', () => {
    const configs: ReadonlyArray<[EllipseLike, EllipseLike]> = [
      [E(0, 0, 2, 2), E(4, 0, 2, 2)],
      [E(0, 0, 2, 1), E(0, 0, 2, 3)],
      [E(0, 0, 3, 1), E(0, 0, 1, 3)],
      [E(0, 0, 1, 1), E(0, 1, 1, 2)],
      [E(0, 0, 2, 2), E(2, 0, 2, 2)],
    ];
    for (const [a, b] of configs) {
      const detail = ellipseEllipseDetail(a, b);
      const ao = a as { center: { x: number; y: number }; radiusX: number; radiusY: number };
      const bo = b as { center: { x: number; y: number }; radiusX: number; radiusY: number };
      expectPointsOnBothBoundaries(
        detail,
        { cx: ao.center.x, cy: ao.center.y, rx: ao.radiusX, ry: ao.radiusY },
        { cx: bo.center.x, cy: bo.center.y, rx: bo.radiusX, ry: bo.radiusY }
      );
    }
  });

  test('T21 two-point/multi-point의 points는 ellipse a turn 오름차순이다', () => {
    const two = ellipseEllipseDetail(E(0, 0, 2, 1), E(0, 0, 2, 3));
    if (two.kind === 'two-point') expectTurnAscending(two.points, { cx: 0, cy: 0, rx: 2, ry: 1 });
    const multi = ellipseEllipseDetail(E(0, 0, 3, 1), E(0, 0, 1, 3));
    if (multi.kind === 'multi-point') expectTurnAscending(multi.points, { cx: 0, cy: 0, rx: 3, ry: 1 });
  });

  test('T22 같은 입력 2회 호출이 매번 새 point object를 반환한다', () => {
    const center = { x: 0, y: 0 };
    const a: EllipseLike = { center, radiusX: 2, radiusY: 2 };
    const r1 = ellipseEllipseDetail(a, E(2, 0, 2, 2));
    const r2 = ellipseEllipseDetail(a, E(2, 0, 2, 2));
    if (r1.kind !== 'two-point' || r2.kind !== 'two-point') throw new Error('two-point 아님');
    expect(r1.points[0]).not.toBe(r2.points[0]);
    expect(r1.points[0]).not.toBe(center);
  });
});

describe('ellipseEllipseDetail — 권장 numeric 회귀', () => {
  test('T23 epsilon-thin band stratified — 안쪽은 교차, 바깥쪽은 분리', () => {
    const eps = 1e-9;
    // 외접 tangent: centers dist 2, 두 단위원. offset>0이면 더 멀어져 분리, offset<0이면 겹침.
    for (const k of [0.5, 1, 2]) {
      const inside = ellipseEllipseDetail(E(0, 0, 1, 1), E(2 - k * 1e-6, 0, 1, 1), eps);
      expect(inside.kind === 'two-point' || inside.kind === 'point').toBe(true);
      const outside = ellipseEllipseDetail(E(0, 0, 1, 1), E(2 + k * 1e-6, 0, 1, 1), eps);
      expect(outside.kind === 'none' || outside.kind === 'point').toBe(true);
    }
    // 안쪽 두 점의 residual invariant
    const detail = ellipseEllipseDetail(E(0, 0, 1, 1), E(2 - 1e-5, 0, 1, 1), eps);
    expectPointsOnBothBoundaries(detail, { cx: 0, cy: 0, rx: 1, ry: 1 }, { cx: 2 - 1e-5, cy: 0, rx: 1, ry: 1 }, 1e-5);
  });

  test('T24 작은 계수 quartic — tangent 근방에서 중근/distinct 오판 없음', () => {
    // 접점에서 멀어질수록 distinct 2점, 가까울수록 1점으로 수렴해야 한다.
    const far = ellipseEllipseDetail(E(0, 0, 1, 1), E(1.9, 0, 1, 1));
    expect(far.kind).toBe('two-point');
    const exact = ellipseEllipseDetail(E(0, 0, 1, 1), E(2, 0, 1, 1));
    expect(exact.kind).toBe('point');
    const beyond = ellipseEllipseDetail(E(0, 0, 1, 1), E(2.1, 0, 1, 1));
    expect(beyond.kind).toBe('none');
  });

  test('T25 극단 scale — 차분 우선 정규화가 local offset을 유지한다', () => {
    const big = 1e8;
    const detail = ellipseEllipseDetail(E(big, big, 1e-2, 1e-2), E(big + 1.5e-2, big, 1e-2, 1e-2));
    expect(detail.kind).toBe('two-point');
    if (detail.kind !== 'two-point') throw new Error('two-point 아님');
    // 좌표 크기 1e8, radius 1e-2이면 float64 분해능이 residual을 약 2e-6 수준으로 제한한다.
    // (1e8 × 2⁻⁵² / 1e-2 ≈ 2e-6). 차분-우선 정규화가 동작했는지(two-point)와 그 분해능
    // 한계 안에서의 residual invariant만 검증한다.
    expectPointsOnBothBoundaries(
      detail,
      { cx: big, cy: big, rx: 1e-2, ry: 1e-2 },
      { cx: big + 1.5e-2, cy: big, rx: 1e-2, ry: 1e-2 },
      1e-4
    );
  });
});

describe('ellipseEllipseDetail — 작은 delta y 복원 회귀', () => {
  // δ = -2·B2·oy 이므로 두 ellipse가 거의 같은 y 위치(작은 oy)면 |δ|가 작다.
  // 이전 구현은 δ≠0 분기에서 y = -(P x²+Q x+R)/δ로 복원해 |δ|가 작을 때 catastrophic
  // cancellation으로 y가 0으로 붕괴, 실제 교점을 놓치고 contains로 오분류했다.
  // 양 분기 모두 ellipse a 방정식 ±복원을 쓰면 작은 δ에서도 교점을 보존해야 한다.
  test('T26 E(0,0,3,1) vs E(1, oy, 3,1) — 작은 oy 전 구간에서 two-point', () => {
    for (const oy of [1e-12, 1e-9, 1e-7, 1e-6]) {
      const detail = ellipseEllipseDetail(E(0, 0, 3, 1), E(1, oy, 3, 1), EPS);
      expect(detail.kind, `oy=${oy}`).toBe('two-point');
      expectPointsOnBothBoundaries(detail, { cx: 0, cy: 0, rx: 3, ry: 1 }, { cx: 1, cy: oy, rx: 3, ry: 1 });
    }
  });

  test('T27 E(0,0,3,1) vs E(0.2, oy, 1,3) — 작은 oy 전 구간에서 multi-point(4점)', () => {
    for (const oy of [1e-9, 1e-5, 1e-3]) {
      const detail = ellipseEllipseDetail(E(0, 0, 3, 1), E(0.2, oy, 1, 3), EPS);
      expect(detail.kind, `oy=${oy}`).toBe('multi-point');
      if (detail.kind !== 'multi-point') throw new Error('multi-point 아님');
      expect(detail.points, `oy=${oy}`).toHaveLength(4);
      expectPointsOnBothBoundaries(detail, { cx: 0, cy: 0, rx: 3, ry: 1 }, { cx: 0.2, cy: oy, rx: 1, ry: 3 });
    }
  });

  test('T28 대조군 oy=0(x축 정렬)은 기존 동작 유지', () => {
    // oy=0이면 δ≈0 분기. 회귀가 이 안정 경로를 깨지 않는지 확인.
    const two = ellipseEllipseDetail(E(0, 0, 3, 1), E(1, 0, 3, 1), EPS);
    expect(two.kind).toBe('two-point');
    expectPointsOnBothBoundaries(two, { cx: 0, cy: 0, rx: 3, ry: 1 }, { cx: 1, cy: 0, rx: 3, ry: 1 });

    const multi = ellipseEllipseDetail(E(0, 0, 3, 1), E(0.2, 0, 1, 3), EPS);
    expect(multi.kind).toBe('multi-point');
    if (multi.kind === 'multi-point') expect(multi.points).toHaveLength(4);
  });
});

describe('ellipseEllipseDetail — Newton polish 2점/다점 분류 회귀', () => {
  // pushFromX는 각 x-root에서 ellipse a 기준 +y/−y 두 seed를 push한다. wrong-sign seed가
  // Newton으로 실제 교점에 이주(migrate)할 수 있는데, 반복 상한이 부족하면 이주한 copy가
  // 참 교점에서 ~1e-7 떨어진 채 멈춰 dedupe가 두 copy를 못 합치고 distinct=3 → multi-point로
  // 오분류된다. 일반 위치 2-point 교차가 정확히 two-point로 분류되는지 검증한다.
  test('일반 위치 2-point 교차가 two-point로 분류된다', () => {
    const cases: ReadonlyArray<[EllipseLike, EllipseLike]> = [
      [E(0, 0, 2.4216, 0.5023), E(3.70117, -0.79243, 3.478, 0.5146)],
      [E(0, 0, 1.2564, 2.6471), E(2.76465, 2.99388, 2.6262, 1.1735)],
      [E(0, 0, 1.7108, 3.1214), E(-3.58704, 3.22338, 3.2531, 0.9065)],
      [E(0, 0, 2.2785, 2.7278), E(-0.92543, -3.92505, 2.4878, 1.3502)],
    ];
    for (const [a, b] of cases) {
      const detail = ellipseEllipseDetail(a, b, EPS);
      const ao = a as { center: { x: number; y: number }; radiusX: number; radiusY: number };
      const bo = b as { center: { x: number; y: number }; radiusX: number; radiusY: number };
      const label = `a=${JSON.stringify(ao)} b=${JSON.stringify(bo)}`;
      expect(detail.kind, label).toBe('two-point');
      expectPointsOnBothBoundaries(
        detail,
        { cx: ao.center.x, cy: ao.center.y, rx: ao.radiusX, ry: ao.radiusY },
        { cx: bo.center.x, cy: bo.center.y, rx: bo.radiusX, ry: bo.radiusY }
      );
    }
  });
});
