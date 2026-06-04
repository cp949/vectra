/**
 * circle-circle 교점 collection / detail helper 단위 테스트.
 *
 * S10-RM-004: boolean intersectsCircleCircle로 손실되는 tangent / two-point /
 * containment / coincident 관계를 circleCircleDetail로 분리하고, circleCircleIntersectionsInto /
 * circleCircleIntersections collection helper가 detail의 point/two-point만 점으로 노출하는지
 * 검증한다. proper two-point, external/internal tangent, external disjoint, containment,
 * coincident, concentric unequal, radius ≤ 0, non-finite, tuple/object 입력 동등성,
 * 반환 point object의 fresh reference, out array clear/reference 보존을 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { circleCircleDetail } from '../../../src/intersects/circle-circle-detail';
import { circleCircleIntersections } from '../../../src/intersects/circle-circle-intersections';
import { circleCircleIntersectionsInto } from '../../../src/intersects/circle-circle-intersections-into';

function expectRelativeClose(actual: number, expected: number, relativeTolerance = 1e-12): void {
  expect(Number.isFinite(actual)).toBe(true);
  expect(Math.abs(actual - expected) / Math.max(1, Math.abs(expected))).toBeLessThanOrEqual(relativeTolerance);
}

describe('circleCircleDetail — two-point 분기', () => {
  test('proper two-point 교차는 circle a 기준 turn 오름차순 두 점을 반환한다', () => {
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 8, y: 0 }, radius: 5 };
    const result = circleCircleDetail(a, b);
    expect(result.kind).toBe('two-point');
    if (result.kind !== 'two-point') return;
    // turn(4,3)≈0.102 < turn(4,-3)≈0.898 이므로 오름차순은 (4,3) → (4,-3)
    expect(result.points[0].x).toBeCloseTo(4, 12);
    expect(result.points[0].y).toBeCloseTo(3, 12);
    expect(result.points[1].x).toBeCloseTo(4, 12);
    expect(result.points[1].y).toBeCloseTo(-3, 12);
  });

  test('두 교점은 매 호출 새 plain object다', () => {
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 8, y: 0 }, radius: 5 };
    const first = circleCircleDetail(a, b);
    const second = circleCircleDetail(a, b);
    expect(first).not.toBe(second);
    if (first.kind !== 'two-point' || second.kind !== 'two-point') return;
    expect(first.points[0]).not.toBe(second.points[0]);
    expect(first.points).toHaveLength(2);
  });

  test('대각선 배치 two-point도 circle a 기준 turn 오름차순이다 (swap 분기)', () => {
    // 중심 (0,0)/(3,4), 반지름 5/3. 자연 p0/p1 turn이 내림차순이라 swap 분기를 탄다.
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 3, y: 4 }, radius: 3 };
    const result = circleCircleDetail(a, b);
    expect(result.kind).toBe('two-point');
    if (result.kind !== 'two-point') return;
    // swap 후 오름차순: turn≈0.0505 점이 먼저, turn≈0.2446 점이 다음
    expect(result.points[0].x).toBeCloseTo(4.749459, 5);
    expect(result.points[0].y).toBeCloseTo(1.562906, 5);
    expect(result.points[1].x).toBeCloseTo(0.170541, 5);
    expect(result.points[1].y).toBeCloseTo(4.997094, 5);
    // 두 점 모두 양쪽 circle 위에 있다
    for (const p of result.points) {
      expect(Math.hypot(p.x - 0, p.y - 0)).toBeCloseTo(5, 9);
      expect(Math.hypot(p.x - 3, p.y - 4)).toBeCloseTo(3, 9);
    }
    const t0 = Math.atan2(result.points[0].y, result.points[0].x) / (2 * Math.PI);
    const t1 = Math.atan2(result.points[1].y, result.points[1].x) / (2 * Math.PI);
    expect(t0).toBeLessThanOrEqual(t1);
  });
});

describe('circleCircleDetail — point(tangent) 분기', () => {
  test('external tangent는 접점 한 점과 [0,1) parameter를 반환한다', () => {
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 10, y: 0 }, radius: 5 };
    const result = circleCircleDetail(a, b);
    expect(result.kind).toBe('point');
    if (result.kind !== 'point') return;
    expect(result.point.x).toBeCloseTo(5, 12);
    expect(result.point.y).toBeCloseTo(0, 12);
    expect(result.tA).toBeCloseTo(0, 12);
    expect(result.tB).toBeCloseTo(0.5, 12);
  });

  test('internal tangent는 접점 한 점을 반환한다', () => {
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 4, y: 0 }, radius: 1 };
    const result = circleCircleDetail(a, b);
    expect(result.kind).toBe('point');
    if (result.kind !== 'point') return;
    expect(result.point.x).toBeCloseTo(5, 12);
    expect(result.point.y).toBeCloseTo(0, 12);
  });

  test('rA < rB internal tangent (작은 a가 큰 b 안쪽)도 같은 식으로 접점을 구한다', () => {
    // 중심 (0,0)/(4,0), 반지름 1/5. a=(d²+rA²-rB²)/2d 가 음수라 접점이 a 중심 반대편이다.
    const a = { center: { x: 0, y: 0 }, radius: 1 };
    const b = { center: { x: 4, y: 0 }, radius: 5 };
    const result = circleCircleDetail(a, b);
    expect(result.kind).toBe('point');
    if (result.kind !== 'point') return;
    expect(result.point.x).toBeCloseTo(-1, 12);
    expect(result.point.y).toBeCloseTo(0, 12);
    expect(result.tA).toBeGreaterThanOrEqual(0);
    expect(result.tA).toBeLessThan(1);
    expect(result.tB).toBeGreaterThanOrEqual(0);
    expect(result.tB).toBeLessThan(1);
    // 접점 (-1,0)은 a 중심 기준 turn 0.5, b 중심 (4,0) 기준 turn 0.5
    expect(result.tA).toBeCloseTo(0.5, 12);
    expect(result.tB).toBeCloseTo(0.5, 12);
  });

  test('custom epsilon은 tangent 판정 임계값을 넓힌다', () => {
    // d=10.05, rSum=10. 기본 epsilon(1e-9)에서는 외부 분리(none), epsilon=0.1에서는 tangent.
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 10.05, y: 0 }, radius: 5 };
    expect(circleCircleDetail(a, b)).toEqual({ kind: 'none' });
    const widened = circleCircleDetail(a, b, 0.1);
    expect(widened.kind).toBe('point');
    if (widened.kind !== 'point') return;
    // a=(d²+rA²-rB²)/2d=101.0025/20.1=5.025, 접점 (5.025,0)
    expect(widened.point.x).toBeCloseTo(5.025, 12);
    expect(widened.point.y).toBeCloseTo(0, 12);
    expect(widened.tA).toBeCloseTo(0, 12);
    expect(widened.tB).toBeCloseTo(0.5, 12);
  });

  test('tangent point의 tA/tB는 [0,1) 범위다', () => {
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 10, y: 0 }, radius: 5 };
    const result = circleCircleDetail(a, b);
    expect(result.kind).toBe('point');
    if (result.kind !== 'point') return;
    expect(result.tA).toBeGreaterThanOrEqual(0);
    expect(result.tA).toBeLessThan(1);
    expect(result.tB).toBeGreaterThanOrEqual(0);
    expect(result.tB).toBeLessThan(1);
  });
});

describe('circleCircleDetail — none / overlap / contains 분기', () => {
  test('외부 분리는 none을 반환한다', () => {
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 11, y: 0 }, radius: 5 };
    expect(circleCircleDetail(a, b)).toEqual({ kind: 'none' });
  });

  test('한 circle이 다른 disk 내부에 있고 닿지 않으면 contains를 반환한다', () => {
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 2, y: 0 }, radius: 1 };
    expect(circleCircleDetail(a, b)).toEqual({ kind: 'contains' });
  });

  test('같은 중심 같은 반지름 coincident는 overlap을 반환한다', () => {
    const a = { center: { x: 3, y: -4 }, radius: 5 };
    const b = { center: { x: 3, y: -4 }, radius: 5 };
    expect(circleCircleDetail(a, b)).toEqual({ kind: 'overlap' });
  });

  test('같은 중심 다른 반지름 concentric는 contains를 반환한다', () => {
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 0, y: 0 }, radius: 3 };
    expect(circleCircleDetail(a, b)).toEqual({ kind: 'contains' });
  });

  test('radius 0이면 none을 반환한다', () => {
    const a = { center: { x: 0, y: 0 }, radius: 0 };
    const b = { center: { x: 5, y: 0 }, radius: 5 };
    expect(circleCircleDetail(a, b)).toEqual({ kind: 'none' });
  });

  test('radius 음수이면 none을 반환한다', () => {
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 5, y: 0 }, radius: -1 };
    expect(circleCircleDetail(a, b)).toEqual({ kind: 'none' });
  });
});

describe('circleCircleDetail — concentric 분기는 d===0으로 한정', () => {
  test('중심이 epsilon 내로 미세하게 떨어지고 반지름이 같으면 overlap이 아니다', () => {
    // 중심 (0,0)/(1e-10,0), 반지름 1/1. 옛 가드(d<=epsilonN)는 이 입력을 overlap으로
    // 오분류했다. 새 가드(d===0)는 d>0이므로 단축을 건너뛰고 일반 경로가 분류한다.
    // d(=1e-10)가 내접 tangent band(|d-rDiff|=1e-10 ≤ epsilonN=1e-9) 안이라 결과는 point다.
    const a = { center: { x: 0, y: 0 }, radius: 1 };
    const b = { center: { x: 1e-10, y: 0 }, radius: 1 };
    const result = circleCircleDetail(a, b);
    expect(result.kind).not.toBe('overlap');
    expect(result.kind).toBe('point');
  });

  test('중심이 epsilon band 밖으로 미세하게 떨어지고 반지름이 같으면 two-point를 반환한다', () => {
    // 중심 (0,0)/(1e-7,0), 반지름 1/1. d(=1e-7)가 epsilon band(1e-9)를 벗어나
    // 일반 two-point 경로가 (≈5e-8, ±1) 두 점을 circle a 기준 turn 오름차순으로 반환한다.
    const a = { center: { x: 0, y: 0 }, radius: 1 };
    const b = { center: { x: 1e-7, y: 0 }, radius: 1 };
    const result = circleCircleDetail(a, b);
    expect(result.kind).toBe('two-point');
    if (result.kind !== 'two-point') return;
    // turn(+x,+y)≈0.25 < turn(+x,-y)≈0.75 → 첫 점은 y>0, 둘째 점은 y<0
    expect(result.points[0].x).toBeCloseTo(5e-8, 9);
    expect(result.points[0].y).toBeCloseTo(1, 9);
    expect(result.points[1].x).toBeCloseTo(5e-8, 9);
    expect(result.points[1].y).toBeCloseTo(-1, 9);
    // circle a 기준 turn을 [0,1)로 fold해 오름차순을 확인한다(atan2/2π는 음수 turn을 줄 수 있다).
    const canon = (x: number, y: number) => {
      const t = Math.atan2(y, x) / (2 * Math.PI);
      const folded = t - Math.floor(t);
      return folded < 1 ? folded : 0;
    };
    const t0 = canon(result.points[0].x, result.points[0].y);
    const t1 = canon(result.points[1].x, result.points[1].y);
    expect(t0).toBeLessThanOrEqual(t1);
  });

  test('중심이 정확히 동일하고 반지름이 같으면 overlap을 반환한다 (대조군)', () => {
    const a = { center: { x: 0, y: 0 }, radius: 1 };
    const b = { center: { x: 0, y: 0 }, radius: 1 };
    expect(circleCircleDetail(a, b)).toEqual({ kind: 'overlap' });
  });

  test('중심이 정확히 동일하고 반지름이 다르면 contains를 반환한다 (대조군)', () => {
    const a = { center: { x: 0, y: 0 }, radius: 2 };
    const b = { center: { x: 0, y: 0 }, radius: 1 };
    expect(circleCircleDetail(a, b)).toEqual({ kind: 'contains' });
  });

  test('collection helper도 epsilon band 밖 동일 반지름 입력에서 점 2개를 반환한다', () => {
    const a = { center: { x: 0, y: 0 }, radius: 1 };
    const b = { center: { x: 1e-7, y: 0 }, radius: 1 };
    const out: { x: number; y: number }[] = [];
    expect(circleCircleIntersectionsInto(out, a, b)).toHaveLength(2);
    expect(circleCircleIntersections(a, b)).toHaveLength(2);
  });
});

describe('circleCircleDetail — non-finite 입력', () => {
  test.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
  ])('center.x %s는 none을 반환한다', (_label, x) => {
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x, y: 0 }, radius: 5 };
    expect(circleCircleDetail(a, b)).toEqual({ kind: 'none' });
  });

  test.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
  ])('center.y %s는 none을 반환한다', (_label, y) => {
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 5, y }, radius: 5 };
    expect(circleCircleDetail(a, b)).toEqual({ kind: 'none' });
  });

  test.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
  ])('radius %s는 none을 반환한다', (_label, r) => {
    const a = { center: { x: 0, y: 0 }, radius: r };
    const b = { center: { x: 5, y: 0 }, radius: 5 };
    expect(circleCircleDetail(a, b)).toEqual({ kind: 'none' });
  });

  test('반지름 합이 overflow해도 finite 교점은 정규화 계산으로 반환한다', () => {
    // rSum은 overflow하지만 정규화 좌표계에서는 안정적으로 two-point를 계산할 수 있다.
    const a = { center: { x: 0, y: 0 }, radius: 1e308 };
    const b = { center: { x: 1e307, y: 0 }, radius: 1e308 };
    const result = circleCircleDetail(a, b);
    expect(result.kind).toBe('two-point');
    if (result.kind !== 'two-point') return;
    const expectedY = Math.sqrt(0.9975) * 1e308;
    expectRelativeClose(result.points[0].x, 5e306);
    expectRelativeClose(result.points[0].y, expectedY);
    expectRelativeClose(result.points[1].x, 5e306);
    expectRelativeClose(result.points[1].y, -expectedY);
  });

  test('d² overflow(중간 반지름 + 큰 거리)도 finite 교점이면 반환한다', () => {
    // rSum은 finite지만 d²와 r²는 overflow한다. 정규화 계산은 finite 교점을 유지한다.
    const a = { center: { x: 0, y: 0 }, radius: 1e160 };
    const b = { center: { x: 1e160, y: 0 }, radius: 1e160 };
    const result = circleCircleDetail(a, b);
    expect(result.kind).toBe('two-point');
    if (result.kind !== 'two-point') return;
    const expectedY = Math.sqrt(0.75) * 1e160;
    expectRelativeClose(result.points[0].x, 5e159);
    expectRelativeClose(result.points[0].y, expectedY);
    expectRelativeClose(result.points[1].x, 5e159);
    expectRelativeClose(result.points[1].y, -expectedY);
  });

  // tangent 경로 overflow(none)는 정규화 구조상 도달 불가라 테스트를 두지 않는다.
  // scaledTangentDetail의 접점은 a 중심에서 ux 방향으로 a=(d²+rA²-rB²)/2d 만큼 떨어진
  // 두 원 사이의 한 점이다. 정규화 좌표에서 |접점| ≤ max(|center|, r) ≤ 1 이므로
  // scale 복원값 |접점*scale| ≤ scale = maxAbs(finite 입력) ≤ MAX_VALUE → 항상 finite다.
  // 외접/내접 양쪽 모두 좌표가 두 원 envelope 안에 머물러 px/py가 overflow하지 않는다.
});

describe('circleCircleDetail — 입력 형식과 reference', () => {
  test('tuple 입력과 object 입력은 같은 결과를 반환한다', () => {
    const aObj = { center: { x: 0, y: 0 }, radius: 5 };
    const bObj = { center: { x: 8, y: 0 }, radius: 5 };
    const aTuple = [[0, 0], 5] as const;
    const bTuple = [[8, 0], 5] as const;
    expect(circleCircleDetail(aTuple, bTuple)).toEqual(circleCircleDetail(aObj, bObj));
  });

  test('반환 point object는 입력 center object와 다른 reference다', () => {
    const sharedCenter = { x: 0, y: 0 };
    const a = { center: sharedCenter, radius: 5 };
    const b = { center: { x: 10, y: 0 }, radius: 5 };
    const result = circleCircleDetail(a, b);
    expect(result.kind).toBe('point');
    if (result.kind !== 'point') return;
    expect(result.point).not.toBe(sharedCenter);
  });
});

describe('circleCircleIntersectionsInto', () => {
  test('proper two-point는 두 점을 push하고 같은 outPoints reference를 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 8, y: 0 }, radius: 5 };
    const result = circleCircleIntersectionsInto(out, a, b);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out[0].x).toBeCloseTo(4, 12);
    expect(out[0].y).toBeCloseTo(3, 12);
    expect(out[1].x).toBeCloseTo(4, 12);
    expect(out[1].y).toBeCloseTo(-3, 12);
  });

  test('tangent는 한 점을 push한다', () => {
    const out: { x: number; y: number }[] = [];
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 10, y: 0 }, radius: 5 };
    circleCircleIntersectionsInto(out, a, b);
    expect(out).toHaveLength(1);
    expect(out[0].x).toBeCloseTo(5, 12);
    expect(out[0].y).toBeCloseTo(0, 12);
  });

  test('none은 빈 배열을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 11, y: 0 }, radius: 5 };
    expect(circleCircleIntersectionsInto(out, a, b)).toHaveLength(0);
  });

  test('contains는 빈 배열을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 2, y: 0 }, radius: 1 };
    expect(circleCircleIntersectionsInto(out, a, b)).toHaveLength(0);
  });

  test('overlap은 빈 배열을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 0, y: 0 }, radius: 5 };
    expect(circleCircleIntersectionsInto(out, a, b)).toHaveLength(0);
  });

  test('기존 out 내용을 clear한 뒤 결과만 남긴다', () => {
    const out = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
      { x: 77, y: 77 },
    ];
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 8, y: 0 }, radius: 5 };
    circleCircleIntersectionsInto(out, a, b);
    expect(out).toHaveLength(2);
    expect(out).not.toContainEqual({ x: 99, y: 99 });
  });

  test('push된 point는 입력 center object와 다른 reference다', () => {
    const sharedCenter = { x: 0, y: 0 };
    const out: { x: number; y: number }[] = [];
    const a = { center: sharedCenter, radius: 5 };
    const b = { center: { x: 8, y: 0 }, radius: 5 };
    circleCircleIntersectionsInto(out, a, b);
    for (const p of out) {
      expect(p).not.toBe(sharedCenter);
    }
  });

  test('tuple 입력과 object 입력은 같은 좌표를 반환한다', () => {
    const aObj = { center: { x: 0, y: 0 }, radius: 5 };
    const bObj = { center: { x: 8, y: 0 }, radius: 5 };
    const aTuple = [[0, 0], 5] as const;
    const bTuple = [[8, 0], 5] as const;
    const outObj: { x: number; y: number }[] = [];
    const outTuple: { x: number; y: number }[] = [];
    circleCircleIntersectionsInto(outObj, aObj, bObj);
    circleCircleIntersectionsInto(outTuple, aTuple, bTuple);
    expect(outTuple).toEqual(outObj);
  });
});

describe('circleCircleIntersections', () => {
  test('새 배열을 반환하고 Into와 같은 좌표를 반환한다', () => {
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 8, y: 0 }, radius: 5 };
    const into: { x: number; y: number }[] = [];
    circleCircleIntersectionsInto(into, a, b);
    const result = circleCircleIntersections(a, b);
    expect(result).not.toBe(into);
    expect(result).toEqual(into);
  });

  test('none은 빈 배열을 반환한다', () => {
    const a = { center: { x: 0, y: 0 }, radius: 5 };
    const b = { center: { x: 11, y: 0 }, radius: 5 };
    expect(circleCircleIntersections(a, b)).toEqual([]);
  });
});
