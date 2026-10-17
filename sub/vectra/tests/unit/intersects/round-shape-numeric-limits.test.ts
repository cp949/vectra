/**
 * circle·ellipse 교차 계산이 수치 한계에서 쓰는 fallback 경로를 확인하는 테스트.
 * 좌표 복원 중 overflow, 비유한 교점 후보, 각도 turn의 1.0 접힘, quartic solver의 빈 근 반환을 다룬다.
 * 극단 입력의 결과는 현재 구현의 documented fallback을 고정한 것이다.
 */
import { describe, expect, test } from 'vitest';
import { circleCircleAreaOverlapDetail } from '../../../src/intersects/circle-circle-area-overlap-detail';
import { circleCircleDetail } from '../../../src/intersects/circle-circle-detail';
import { circleCircleIntersectionsInto } from '../../../src/intersects/circle-circle-intersections-into';
import { ellipseCircleIntersectionsInto } from '../../../src/intersects/ellipse-circle-intersections-into';
import { ellipseEllipseDetail } from '../../../src/intersects/ellipse-ellipse-detail';
import { solveQuarticReal } from '../../../src/intersects/ellipse-ellipse-solver.internal';

const BIG = Number.MAX_VALUE;

/** 중심과 반지름으로 circle 입력을 만든다. */
function circle(x: number, y: number, radius: number) {
  return { center: { x, y }, radius };
}

/** 중심과 두 반지름으로 ellipse 입력을 만든다. */
function ellipse(x: number, y: number, radiusX: number, radiusY: number) {
  return { center: { x, y }, radiusX, radiusY };
}

describe('circle 교점 좌표 복원 overflow', () => {
  // A는 중심 (0, MAX/2), 반지름 MAX. B는 중심 (0, MAX), 반지름 MAX/2.
  // 두 원은 내접하며 접점은 (0, MAX/2 + MAX)이라 double 범위를 넘는다.
  const outer = circle(0, BIG / 2, BIG);
  const innerTangent = circle(0, BIG, BIG / 2);

  test('circleCircleDetail은 접점 좌표가 overflow하면 none을 반환한다', () => {
    expect(circleCircleDetail(outer, innerTangent)).toEqual({ kind: 'none' });
  });

  test('circleCircleAreaOverlapDetail은 접점 좌표가 overflow하면 none을 반환한다', () => {
    expect(circleCircleAreaOverlapDetail(outer, innerTangent)).toEqual({ kind: 'none' });
  });

  test('circleCircleIntersectionsInto는 접점 좌표가 overflow하면 빈 배열을 반환한다', () => {
    const out = [{ x: 9, y: 9 }];
    expect(circleCircleIntersectionsInto(out, outer, innerTangent)).toEqual([]);
  });

  test('circleCircleDetail은 두 교점 좌표가 overflow하면 none을 반환한다', () => {
    // 두 원은 x로 1만 어긋나 두 점에서 만나고 교점 y가 double 범위를 넘는다.
    const shifted = circle(1, BIG / 2, BIG);
    expect(circleCircleDetail(outer, shifted)).toEqual({ kind: 'none' });
  });
});

describe('turn 접힘', () => {
  test('circleCircleDetail은 접점의 각도가 음의 미소각이면 turn을 0으로 접는다', () => {
    // 접점 (1, -5e-19)의 각도는 -8e-20 turn이라 [0, 1) 정규화에서 1.0으로 반올림된다.
    const detail = circleCircleDetail(circle(0, 0, 1), circle(2, -1e-18, 1));
    expect(detail.kind).toBe('point');
    if (detail.kind === 'point') {
      expect(detail.tA).toBe(0);
      expect(detail.tB).toBe(0.5);
    }
  });

  test('ellipseEllipseDetail은 음의 미소각 교점의 turn을 0으로 접어 첫 번째로 정렬한다', () => {
    // 교점 (1, -9.7e-17)의 turn이 1.0으로 반올림되면 접히지 않은 채 마지막으로 밀린다.
    const detail = ellipseEllipseDetail(ellipse(0, 0, 1, 1), ellipse(1, 1, 1, 1));
    expect(detail.kind).toBe('two-point');
    if (detail.kind === 'two-point') {
      expect(detail.points[0].x).toBeCloseTo(1, 12);
      expect(detail.points[0].y).toBeCloseTo(0, 12);
      expect(detail.points[1].x).toBeCloseTo(0, 12);
      expect(detail.points[1].y).toBeCloseTo(1, 12);
    }
  });
});

describe('ellipse 교차의 수치 한계 fallback', () => {
  test('ellipseEllipseDetail은 반지름 격차가 1e154인 동심 입력의 비유한 후보를 버리고 contains를 반환한다', () => {
    expect(ellipseEllipseDetail(ellipse(0, 0, 1, 1), ellipse(0, 0, 1, 1e154))).toEqual({ kind: 'contains' });
  });

  test('ellipseEllipseDetail은 Newton 보정이 비유한 값이 되는 후보를 버리고 contains를 반환한다', () => {
    expect(ellipseEllipseDetail(ellipse(0, 0, 1, 1), ellipse(0, 0, 2, 1e154))).toEqual({ kind: 'contains' });
  });

  test('ellipseEllipseDetail은 복원한 교점 좌표가 비유한이면 none을 반환한다', () => {
    const a = ellipse(BIG / 2, 0, BIG, BIG);
    const b = ellipse(BIG / 2, BIG / 2, BIG, BIG);
    expect(ellipseEllipseDetail(a, b)).toEqual({ kind: 'none' });
  });

  test('ellipseEllipseDetail은 b의 중심이 a 안에 있고 교점이 없으면 contains를 반환한다', () => {
    // a의 중심은 b 밖이라 첫 검사를 지나고, b의 중심이 a 안이라 두 번째 검사에서 contains가 된다.
    expect(ellipseEllipseDetail(ellipse(0, 0, 10, 5), ellipse(3, 0, 1, 1))).toEqual({ kind: 'contains' });
  });

  test('ellipseCircleIntersectionsInto는 네 점에서 만나면 4개 교점을 모두 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    ellipseCircleIntersectionsInto(out, ellipse(0, 0, 5, 2), circle(0, 0, 3));
    expect(out).toHaveLength(4);
    for (const p of out) {
      expect(Math.hypot(p.x, p.y)).toBeCloseTo(3, 9);
      expect((p.x / 5) ** 2 + (p.y / 2) ** 2).toBeCloseTo(1, 9);
    }
  });
});

describe('solveQuarticReal의 빈 근 반환', () => {
  const EPS = 1e-12;

  test('biquadratic에서 z가 모두 음수이면 실근이 없다', () => {
    // x⁴ + 5x² + 4: z = x²의 근이 -1, -4라 실근이 없다.
    expect(solveQuarticReal(1, 0, 5, 0, 4, EPS)).toEqual([]);
  });
});

describe('solveQuarticReal의 작은 resolvent 근', () => {
  const EPS = 1e-12;

  test('q가 eps를 간신히 넘어 resolvent 양수근이 eps 이하여도 실근을 잃지 않는다', () => {
    // x⁴ + x² + 1e-11 x = x (x³ + x + 1e-11)의 실근은 0과 약 -1e-11이다.
    // q=1e-11이 eps 위라 일반 경로로 가지만 resolvent 양수근이 1e-22 규모라 cubic solver가 못 구한다.
    // 두 실근이 1e-11 안에 붙어 있어 근 하나(약 -5e-12)로 합쳐 돌려준다.
    const roots = solveQuarticReal(1, 0, 1, 1e-11, 0, EPS);
    expect(roots).toHaveLength(1);
    expect(Math.abs(roots[0])).toBeLessThanOrEqual(1e-11);
  });

  test('작은 resolvent 근 경로에서도 큰 실근 한 쌍은 그대로 구한다', () => {
    // x⁴ - x² + 1e-11 x의 실근은 약 -1, 0, 1이다. resolvent 근이 작아도 세 근이 모두 나온다.
    const roots = solveQuarticReal(1, 0, -1, 1e-11, 0, EPS).sort((a, b) => a - b);
    expect(roots).toHaveLength(3);
    expect(roots[0]).toBeCloseTo(-1, 9);
    expect(Math.abs(roots[1])).toBeLessThanOrEqual(1e-11);
    expect(roots[2]).toBeCloseTo(1, 9);
  });

  test('p² - 4r이 0이면 q를 무시한 biquadratic으로 처리한다', () => {
    // (x² + 0.5)² + 1.2e-12 x: p² - 4r = 0이라 resolvent 근이 q/√2 ≈ 8.5e-13으로 eps 아래다.
    // 근의 작은 값 근사가 성립하지 않아 biquadratic으로 보내며, 실근이 없다.
    expect(solveQuarticReal(1, 0, 1, 1.2e-12, 0.25, EPS)).toEqual([]);
  });

  test('실근이 없는 quartic은 작은 resolvent 근 경로에서도 빈 근을 반환한다', () => {
    // x⁴ + x² + 1e-11 x + 1은 모든 x에서 양수다.
    expect(solveQuarticReal(1, 0, 1, 1e-11, 1, EPS)).toEqual([]);
  });
});
