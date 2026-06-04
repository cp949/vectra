import { describe, expect, test } from 'vitest';
import { intersectsEllipseRect } from '../../../src/intersects/intersects-ellipse-rect';

// 기준 ellipse: center(0,0) rx=3 ry=2
const ellipse = { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 };

describe('intersectsRect', () => {
  describe('miss', () => {
    test('ellipse AABB와 rect가 겹치지 않으면 false를 반환한다', () => {
      // ellipse AABB: [-3,-2,3,2], rect [10,0,5,5] → AABB miss
      const rect = { x: 10, y: 0, width: 5, height: 5 };
      expect(intersectsEllipseRect(ellipse, rect)).toBe(false);
    });

    test('empty ellipse (radiusX=0)이면 false를 반환한다', () => {
      const e = { center: { x: 0, y: 0 }, radiusX: 0, radiusY: 2 };
      const rect = { x: -5, y: -5, width: 10, height: 10 };
      expect(intersectsEllipseRect(e, rect)).toBe(false);
    });

    test('empty ellipse (radiusX<0)이면 false를 반환한다', () => {
      const e = { center: { x: 0, y: 0 }, radiusX: -1, radiusY: 2 };
      const rect = { x: -5, y: -5, width: 10, height: 10 };
      expect(intersectsEllipseRect(e, rect)).toBe(false);
    });

    test('empty ellipse (radiusY=0)이면 false를 반환한다', () => {
      const e = { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 0 };
      const rect = { x: -5, y: -5, width: 10, height: 10 };
      expect(intersectsEllipseRect(e, rect)).toBe(false);
    });

    test('empty rect (width=0)이면 false를 반환한다', () => {
      const rect = { x: 0, y: -2, width: 0, height: 4 };
      expect(intersectsEllipseRect(ellipse, rect)).toBe(false);
    });

    test('empty rect (height=0)이면 false를 반환한다', () => {
      const rect = { x: -3, y: 0, width: 6, height: 0 };
      expect(intersectsEllipseRect(ellipse, rect)).toBe(false);
    });
  });

  describe('ellipse center inside rect', () => {
    test('ellipse center가 rect 안에 있으면 true를 반환한다', () => {
      const rect = { x: -1, y: -1, width: 2, height: 2 };
      expect(intersectsEllipseRect(ellipse, rect)).toBe(true);
    });
  });

  describe('rect corner inside ellipse', () => {
    test('rect corner가 ellipse 안에 있으면 true를 반환한다', () => {
      // rect corner (1,1): (1/3)² + (1/2)² = 1/9 + 1/4 < 1 → inside
      const rect = { x: 1, y: 1, width: 5, height: 5 };
      expect(intersectsEllipseRect(ellipse, rect)).toBe(true);
    });

    test('rect corner가 ellipse 경계 위에 있으면 true를 반환한다 (closed boundary)', () => {
      // corner (3,0): (3/3)² + (0/2)² = 1 → on boundary
      const rect = { x: 3, y: 0, width: 5, height: 5 };
      expect(intersectsEllipseRect(ellipse, rect)).toBe(true);
    });
  });

  describe('rect contains ellipse', () => {
    test('rect가 ellipse 전체를 포함하면 true를 반환한다 (ellipse center가 rect 안)', () => {
      const rect = { x: -5, y: -5, width: 10, height: 10 };
      expect(intersectsEllipseRect(ellipse, rect)).toBe(true);
    });
  });

  describe('arc crossing', () => {
    test('ellipse arc가 rect 수직 edge를 crossing하면 true를 반환한다', () => {
      // 얇은 수평 ellipse: center(0,0), rx=5, ry=1
      // rect: x=4, y=-5, width=2, height=10 (AABB 겹침, center=0이 rect 밖, corner 4개가 ellipse 밖)
      // ellipse right edge(5,0) 부근 arc가 rect left edge x=4를 crossing
      const e = { center: { x: 0, y: 0 }, radiusX: 5, radiusY: 1 };
      const r = { x: 4, y: -5, width: 2, height: 10 };
      expect(intersectsEllipseRect(e, r)).toBe(true);
    });

    test('ellipse arc가 rect 수평 edge를 crossing하면 true를 반환한다', () => {
      // 얇은 수직 ellipse: center(0,0), rx=1, ry=5
      // rect: y=4, x=-5, height=2, width=10 (top edge y=4를 crossing)
      const e = { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 5 };
      const r = { x: -5, y: 4, width: 10, height: 2 };
      expect(intersectsEllipseRect(e, r)).toBe(true);
    });

    test('ellipse arc가 rect edge에 접선(tangent)이면 true를 반환한다 (closed boundary)', () => {
      // center(0,0), rx=3, ry=2. rect left edge가 x=3에서 ellipse에 접선
      // rect: x=3, y=-5, width=2, height=10 → ellipse boundary (3,0)이 corner
      const e = { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 };
      const r = { x: 3, y: -1, width: 2, height: 2 };
      expect(intersectsEllipseRect(e, r)).toBe(true);
    });

    test('ellipse arc가 rect edge 근처에 있지만 실제 crossing 없으면 false를 반환한다', () => {
      // center(0,0), rx=3, ry=2. rect right edge x=2.9 (ellipse가 닿지 않음)
      const e = { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 };
      const r = { x: 3.1, y: -5, width: 2, height: 10 };
      expect(intersectsEllipseRect(e, r)).toBe(false);
    });
  });

  describe('input forms', () => {
    test('tuple center에서도 동작한다', () => {
      const e = { center: [0, 0] as const, radiusX: 3, radiusY: 2 };
      const rect = { x: -1, y: -1, width: 2, height: 2 };
      expect(intersectsEllipseRect(e, rect)).toBe(true);
    });

    test('tuple shorthand EllipseLike에서도 동작한다', () => {
      const e = [[0, 0], 3, 2] as const;
      const rect = { x: -1, y: -1, width: 2, height: 2 };
      expect(intersectsEllipseRect(e, rect)).toBe(true);
    });

    test('tuple RectLike에서도 동작한다', () => {
      expect(intersectsEllipseRect(ellipse, [-1, -1, 2, 2])).toBe(true);
    });
  });
});
