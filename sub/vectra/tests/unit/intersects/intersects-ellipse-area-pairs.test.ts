/** 타원과 원·삼각형의 교차 판정을 확인한다. */
import { describe, expect, test } from 'vitest';
import { intersectsEllipseCircle } from '../../../src/intersects/intersects-ellipse-circle';
import { intersectsEllipseTriangle } from '../../../src/intersects/intersects-ellipse-triangle';

describe('ellipse.intersectsCircle - 기본 교차 판정', () => {
  test('empty ellipse는 false를 반환한다', () => {
    expect(intersectsEllipseCircle({ cx: 0, cy: 0, rx: 0, ry: 1 }, { cx: 0, cy: 0, r: 5 })).toBe(false);
    expect(intersectsEllipseCircle({ cx: 0, cy: 0, rx: 2, ry: 0 }, { cx: 0, cy: 0, r: 5 })).toBe(false);
  });

  test('empty circle (r <= 0)은 false를 반환한다', () => {
    expect(intersectsEllipseCircle({ cx: 0, cy: 0, rx: 2, ry: 1 }, { cx: 0, cy: 0, r: 0 })).toBe(false);
    expect(intersectsEllipseCircle({ cx: 0, cy: 0, rx: 2, ry: 1 }, { cx: 0, cy: 0, r: -1 })).toBe(false);
  });

  test('circle 중심이 ellipse 밖이어도 ellipse 중심이 circle 안에 있으면 true를 반환한다', () => {
    // 큰 circle (0,0) r=5가 작은 ellipse (3,0) rx=1 ry=1을 통째로 포함한다. circle 중심은 ellipse 밖이다.
    expect(intersectsEllipseCircle({ cx: 3, cy: 0, rx: 1, ry: 1 }, { cx: 0, cy: 0, r: 5 })).toBe(true);
  });

  test('완전히 분리된 경우 false를 반환한다', () => {
    // ellipse (0,0) rx=2 ry=1, circle center (10,0) r=1 — 완전 분리
    expect(intersectsEllipseCircle({ cx: 0, cy: 0, rx: 2, ry: 1 }, { cx: 10, cy: 0, r: 1 })).toBe(false);
  });

  test('원의 중심이 ellipse 내부에 있으면 true를 반환한다', () => {
    // ellipse (0,0) rx=5 ry=3, circle center (1,0) r=0.1 — 원 중심이 ellipse 내부
    expect(intersectsEllipseCircle({ cx: 0, cy: 0, rx: 5, ry: 3 }, { cx: 1, cy: 0, r: 0.1 })).toBe(true);
  });

  test('ellipse 중심이 원 내부에 있으면 true를 반환한다', () => {
    // ellipse (0,0) rx=0.5 ry=0.3, circle center (0,0) r=10 — ellipse 전체가 원 안
    expect(intersectsEllipseCircle({ cx: 0, cy: 0, rx: 0.5, ry: 0.3 }, { cx: 0, cy: 0, r: 10 })).toBe(true);
  });

  test('경계가 crossing하면 true를 반환한다', () => {
    // ellipse (0,0) rx=4 ry=2, circle center (5,0) r=2 — 경계 교차
    expect(intersectsEllipseCircle({ cx: 0, cy: 0, rx: 4, ry: 2 }, { cx: 5, cy: 0, r: 2 })).toBe(true);
  });

  test('접촉(tangent)은 true를 반환한다', () => {
    // ellipse (0,0) rx=3 ry=2, circle center (5,0) r=2 — 오른쪽 경계 (3,0)에서 접촉
    expect(intersectsEllipseCircle({ cx: 0, cy: 0, rx: 3, ry: 2 }, { cx: 5, cy: 0, r: 2 })).toBe(true);
  });
});

describe('ellipse.intersectsTriangle - 기본 교차 판정', () => {
  test('empty ellipse는 false를 반환한다', () => {
    const tri = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 3 };
    expect(intersectsEllipseTriangle({ cx: 0, cy: 0, rx: 0, ry: 2 }, tri)).toBe(false);
    expect(intersectsEllipseTriangle({ cx: 0, cy: 0, rx: 2, ry: 0 }, tri)).toBe(false);
  });

  test('degenerate triangle (collinear)이면 false를 반환한다', () => {
    // collinear: a(0,0), b(1,0), c(2,0)
    expect(
      intersectsEllipseTriangle({ cx: 0, cy: 0, rx: 5, ry: 3 }, { x1: 0, y1: 0, x2: 1, y2: 0, x3: 2, y3: 0 })
    ).toBe(false);
  });

  test('완전히 분리된 경우 false를 반환한다', () => {
    // ellipse (0,0) rx=1 ry=1, triangle 멀리 (20,20),(21,20),(20,21)
    expect(
      intersectsEllipseTriangle({ cx: 0, cy: 0, rx: 1, ry: 1 }, { x1: 20, y1: 20, x2: 21, y2: 20, x3: 20, y3: 21 })
    ).toBe(false);
  });

  test('ellipse 중심이 triangle 내부에 있으면 true를 반환한다', () => {
    // large triangle (-10,-10),(10,-10),(0,10), ellipse (0,0) rx=0.5 ry=0.5
    expect(
      intersectsEllipseTriangle(
        { cx: 0, cy: 0, rx: 0.5, ry: 0.5 },
        { x1: -10, y1: -10, x2: 10, y2: -10, x3: 0, y3: 10 }
      )
    ).toBe(true);
  });

  test('triangle vertex가 ellipse 내부에 있으면 true를 반환한다', () => {
    // ellipse (0,0) rx=5 ry=3, triangle vertex (1,0) 내부
    expect(
      intersectsEllipseTriangle({ cx: 0, cy: 0, rx: 5, ry: 3 }, { x1: 1, y1: 0, x2: 10, y2: 0, x3: 10, y3: 10 })
    ).toBe(true);
  });

  test('triangle edge가 ellipse boundary를 crossing하면 true를 반환한다', () => {
    // ellipse (0,0) rx=3 ry=2, triangle 중심은 ellipse 밖이지만 edge가 crossing
    expect(
      intersectsEllipseTriangle({ cx: 0, cy: 0, rx: 3, ry: 2 }, { x1: 5, y1: -5, x2: 5, y2: 5, x3: -5, y3: 0 })
    ).toBe(true);
  });

  test('ellipse 중심이 triangle 밖이고 vertex가 모두 ellipse 밖이지만 edge가 boundary를 가로지르면 true를 반환한다', () => {
    // ellipse (0,0) rx=5 ry=1
    // triangle a(4,3) b(4,-3) c(20,0) — 모든 vertex outside, center outside
    // edge a-b (x=4)가 ellipse boundary (4, ±0.6)에서 교차
    expect(
      intersectsEllipseTriangle({ cx: 0, cy: 0, rx: 5, ry: 1 }, { x1: 4, y1: 3, x2: 4, y2: -3, x3: 20, y3: 0 })
    ).toBe(true);
  });
});
