/**
 * circle·ellipse 교차 계산이 수치 한계에서 쓰는 fallback 경로를 확인하는 테스트.
 * 좌표 복원 중 overflow, 비유한 교점 후보, 각도 turn의 1.0 접힘을 다룬다.
 * 극단 입력의 결과는 현재 구현의 documented fallback을 고정한 것이다.
 */
import { describe, expect, test } from 'vitest';
import { circleCircleAreaOverlapDetail } from '../../../src/intersects/circle-circle-area-overlap-detail';
import { circleCircleDetail } from '../../../src/intersects/circle-circle-detail';
import { circleCircleIntersectionsInto } from '../../../src/intersects/circle-circle-intersections-into';
import { ellipseCircleIntersectionsInto } from '../../../src/intersects/ellipse-circle-intersections-into';
import { ellipseEllipseDetail } from '../../../src/intersects/ellipse-ellipse-detail';

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
  test('ellipseEllipseDetail은 반지름 격차가 1e154인 동심 입력에서 계수가 overflow해도 contains를 반환한다', () => {
    expect(ellipseEllipseDetail(ellipse(0, 0, 1, 1), ellipse(0, 0, 1, 1e154))).toEqual({ kind: 'contains' });
  });

  test('ellipseEllipseDetail은 반지름 격차가 1e154이고 x 반지름도 다른 동심 입력에서 contains를 반환한다', () => {
    expect(ellipseEllipseDetail(ellipse(0, 0, 1, 1), ellipse(0, 0, 2, 1e154))).toEqual({ kind: 'contains' });
  });

  test('ellipseEllipseDetail은 Newton 보정이 비유한 값이 되는 후보를 버리고 none을 반환한다', () => {
    // a의 x 반지름 1e-200은 정규화 후 제곱의 역수가 Infinity라 Newton 보정이 NaN이 된다.
    expect(ellipseEllipseDetail(ellipse(0, 0, 1e-200, 1), ellipse(0, -10, 1e-7, 1e-4))).toEqual({ kind: 'none' });
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
