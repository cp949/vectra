import { describe, expect, test } from 'vitest';
import { intersectsEllipseCircle } from '../../../src/intersects/intersects-ellipse-circle';
import { intersectsEllipseTriangle } from '../../../src/intersects/intersects-ellipse-triangle';

describe('ellipse.intersectsCircle - 기본 교차 판정', () => {
  test('empty ellipse는 false를 반환한다', () => {
    expect(
      intersectsEllipseCircle({ center: { x: 0, y: 0 }, radiusX: 0, radiusY: 1 }, { center: { x: 0, y: 0 }, radius: 5 })
    ).toBe(false);
    expect(
      intersectsEllipseCircle({ center: { x: 0, y: 0 }, radiusX: 2, radiusY: 0 }, { center: { x: 0, y: 0 }, radius: 5 })
    ).toBe(false);
  });

  test('empty circle (radius <= 0)은 false를 반환한다', () => {
    expect(
      intersectsEllipseCircle({ center: { x: 0, y: 0 }, radiusX: 2, radiusY: 1 }, { center: { x: 0, y: 0 }, radius: 0 })
    ).toBe(false);
    expect(
      intersectsEllipseCircle(
        { center: { x: 0, y: 0 }, radiusX: 2, radiusY: 1 },
        { center: { x: 0, y: 0 }, radius: -1 }
      )
    ).toBe(false);
  });

  test('완전히 분리된 경우 false를 반환한다', () => {
    // ellipse (0,0) rx=2 ry=1, circle center (10,0) r=1 — 완전 분리
    expect(
      intersectsEllipseCircle(
        { center: { x: 0, y: 0 }, radiusX: 2, radiusY: 1 },
        { center: { x: 10, y: 0 }, radius: 1 }
      )
    ).toBe(false);
  });

  test('원의 중심이 ellipse 내부에 있으면 true를 반환한다', () => {
    // ellipse (0,0) rx=5 ry=3, circle center (1,0) r=0.1 — 원 중심이 ellipse 내부
    expect(
      intersectsEllipseCircle(
        { center: { x: 0, y: 0 }, radiusX: 5, radiusY: 3 },
        { center: { x: 1, y: 0 }, radius: 0.1 }
      )
    ).toBe(true);
  });

  test('ellipse 중심이 원 내부에 있으면 true를 반환한다', () => {
    // ellipse (0,0) rx=0.5 ry=0.3, circle center (0,0) r=10 — ellipse 전체가 원 안
    expect(
      intersectsEllipseCircle(
        { center: { x: 0, y: 0 }, radiusX: 0.5, radiusY: 0.3 },
        { center: { x: 0, y: 0 }, radius: 10 }
      )
    ).toBe(true);
  });

  test('경계가 crossing하면 true를 반환한다', () => {
    // ellipse (0,0) rx=4 ry=2, circle center (5,0) r=2 — 경계 교차
    expect(
      intersectsEllipseCircle({ center: { x: 0, y: 0 }, radiusX: 4, radiusY: 2 }, { center: { x: 5, y: 0 }, radius: 2 })
    ).toBe(true);
  });

  test('접촉(tangent)은 true를 반환한다', () => {
    // ellipse (0,0) rx=3 ry=2, circle center (5,0) r=2 — 오른쪽 경계 (3,0)에서 접촉
    expect(
      intersectsEllipseCircle({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }, { center: { x: 5, y: 0 }, radius: 2 })
    ).toBe(true);
  });

  test('tuple 입력을 지원한다', () => {
    // ellipse tuple, circle tuple — 교차
    expect(intersectsEllipseCircle([[0, 0], 5, 3], [{ x: 1, y: 0 }, 0.5])).toBe(true);
    // 완전 분리 tuple
    expect(intersectsEllipseCircle([[0, 0], 1, 1], [{ x: 10, y: 0 }, 1])).toBe(false);
  });
});

describe('ellipse.intersectsTriangle - 기본 교차 판정', () => {
  test('empty ellipse는 false를 반환한다', () => {
    const tri = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 3 } };
    expect(intersectsEllipseTriangle({ center: { x: 0, y: 0 }, radiusX: 0, radiusY: 2 }, tri)).toBe(false);
    expect(intersectsEllipseTriangle({ center: { x: 0, y: 0 }, radiusX: 2, radiusY: 0 }, tri)).toBe(false);
  });

  test('degenerate triangle (collinear)이면 false를 반환한다', () => {
    // collinear: a(0,0), b(1,0), c(2,0)
    expect(
      intersectsEllipseTriangle(
        { center: { x: 0, y: 0 }, radiusX: 5, radiusY: 3 },
        { a: { x: 0, y: 0 }, b: { x: 1, y: 0 }, c: { x: 2, y: 0 } }
      )
    ).toBe(false);
  });

  test('완전히 분리된 경우 false를 반환한다', () => {
    // ellipse (0,0) rx=1 ry=1, triangle 멀리 (20,20),(21,20),(20,21)
    expect(
      intersectsEllipseTriangle(
        { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 1 },
        { a: { x: 20, y: 20 }, b: { x: 21, y: 20 }, c: { x: 20, y: 21 } }
      )
    ).toBe(false);
  });

  test('ellipse 중심이 triangle 내부에 있으면 true를 반환한다', () => {
    // large triangle (-10,-10),(10,-10),(0,10), ellipse (0,0) rx=0.5 ry=0.5
    expect(
      intersectsEllipseTriangle(
        { center: { x: 0, y: 0 }, radiusX: 0.5, radiusY: 0.5 },
        { a: { x: -10, y: -10 }, b: { x: 10, y: -10 }, c: { x: 0, y: 10 } }
      )
    ).toBe(true);
  });

  test('triangle vertex가 ellipse 내부에 있으면 true를 반환한다', () => {
    // ellipse (0,0) rx=5 ry=3, triangle vertex (1,0) 내부
    expect(
      intersectsEllipseTriangle(
        { center: { x: 0, y: 0 }, radiusX: 5, radiusY: 3 },
        { a: { x: 1, y: 0 }, b: { x: 10, y: 0 }, c: { x: 10, y: 10 } }
      )
    ).toBe(true);
  });

  test('triangle edge가 ellipse boundary를 crossing하면 true를 반환한다', () => {
    // ellipse (0,0) rx=3 ry=2, triangle 중심은 ellipse 밖이지만 edge가 crossing
    expect(
      intersectsEllipseTriangle(
        { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 },
        { a: { x: 5, y: -5 }, b: { x: 5, y: 5 }, c: { x: -5, y: 0 } }
      )
    ).toBe(true);
  });

  test('ellipse 중심이 triangle 밖이고 vertex가 모두 ellipse 밖이지만 edge가 boundary를 가로지르면 true를 반환한다', () => {
    // ellipse (0,0) rx=5 ry=1
    // triangle a(4,3) b(4,-3) c(20,0) — 모든 vertex outside, center outside
    // edge a-b (x=4)가 ellipse boundary (4, ±0.6)에서 교차
    expect(
      intersectsEllipseTriangle(
        { center: { x: 0, y: 0 }, radiusX: 5, radiusY: 1 },
        { a: { x: 4, y: 3 }, b: { x: 4, y: -3 }, c: { x: 20, y: 0 } }
      )
    ).toBe(true);
  });

  test('tuple 입력을 지원한다', () => {
    // TriangleTuple: readonly [XYInput, XYInput, XYInput]
    // ellipse tuple, triangle tuple — ellipse center inside triangle
    expect(
      intersectsEllipseTriangle(
        [[0, 0], 0.5, 0.5] as const,
        [
          [-10, -10],
          [10, -10],
          [0, 10],
        ] as const
      )
    ).toBe(true);
    // 완전 분리
    expect(
      intersectsEllipseTriangle(
        [[0, 0], 1, 1] as const,
        [
          [20, 20],
          [21, 20],
          [20, 21],
        ] as const
      )
    ).toBe(false);
  });
});
