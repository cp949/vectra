import { describe, expect, test } from 'vitest';
import { intersectsEllipseBounds } from '../../../src/intersects/intersects-ellipse-bounds';

// 기준 ellipse: center(0,0) rx=3 ry=2
const ellipse = { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 };

describe('intersectsBounds', () => {
  describe('miss', () => {
    test('ellipse AABB와 bounds가 겹치지 않으면 false를 반환한다', () => {
      // ellipse AABB: [-3,-2,3,2], bounds [10,0,15,5] → AABB miss
      const bounds = { min: { x: 10, y: 0 }, max: { x: 15, y: 5 } };
      expect(intersectsEllipseBounds(ellipse, bounds)).toBe(false);
    });

    test('empty ellipse (radiusX=0)이면 false를 반환한다', () => {
      const e = { center: { x: 0, y: 0 }, radiusX: 0, radiusY: 2 };
      const bounds = { min: { x: -5, y: -5 }, max: { x: 5, y: 5 } };
      expect(intersectsEllipseBounds(e, bounds)).toBe(false);
    });

    test('empty ellipse (radiusY<0)이면 false를 반환한다', () => {
      const e = { center: { x: 0, y: 0 }, radiusX: 3, radiusY: -1 };
      const bounds = { min: { x: -5, y: -5 }, max: { x: 5, y: 5 } };
      expect(intersectsEllipseBounds(e, bounds)).toBe(false);
    });

    test('empty bounds (maxX < minX)이면 false를 반환한다', () => {
      const bounds = { min: { x: 5, y: 0 }, max: { x: 0, y: 5 } };
      expect(intersectsEllipseBounds(ellipse, bounds)).toBe(false);
    });

    test('empty bounds (maxY < minY)이면 false를 반환한다', () => {
      const bounds = { min: { x: 0, y: 5 }, max: { x: 5, y: 0 } };
      expect(intersectsEllipseBounds(ellipse, bounds)).toBe(false);
    });
  });

  describe('ellipse center inside bounds', () => {
    test('ellipse center가 bounds 안에 있으면 true를 반환한다', () => {
      const bounds = { min: { x: -1, y: -1 }, max: { x: 1, y: 1 } };
      expect(intersectsEllipseBounds(ellipse, bounds)).toBe(true);
    });
  });

  describe('bounds corner inside ellipse', () => {
    test('bounds corner가 ellipse 안에 있으면 true를 반환한다', () => {
      // bounds corner (1,1): (1/3)² + (1/2)² < 1 → inside
      const bounds = { min: { x: 1, y: 1 }, max: { x: 6, y: 6 } };
      expect(intersectsEllipseBounds(ellipse, bounds)).toBe(true);
    });

    test('bounds corner가 ellipse 경계 위에 있으면 true를 반환한다 (closed boundary)', () => {
      // corner (0,2): (0/3)² + (2/2)² = 1 → on boundary
      const bounds = { min: { x: 0, y: 2 }, max: { x: 5, y: 7 } };
      expect(intersectsEllipseBounds(ellipse, bounds)).toBe(true);
    });
  });

  describe('bounds contains ellipse', () => {
    test('bounds가 ellipse 전체를 포함하면 true를 반환한다 (ellipse center가 bounds 안)', () => {
      const bounds = { min: { x: -5, y: -5 }, max: { x: 5, y: 5 } };
      expect(intersectsEllipseBounds(ellipse, bounds)).toBe(true);
    });
  });

  describe('arc crossing', () => {
    test('ellipse arc가 bounds 수직 edge를 crossing하면 true를 반환한다', () => {
      // 얇은 수평 ellipse: center(0,0), rx=5, ry=1
      // bounds: minX=4, minY=-5, maxX=6, maxY=5 (minX edge x=4를 crossing)
      const e = { center: { x: 0, y: 0 }, radiusX: 5, radiusY: 1 };
      const b = { min: { x: 4, y: -5 }, max: { x: 6, y: 5 } };
      expect(intersectsEllipseBounds(e, b)).toBe(true);
    });

    test('ellipse arc가 bounds 수평 edge를 crossing하면 true를 반환한다', () => {
      // 얇은 수직 ellipse: center(0,0), rx=1, ry=5
      // bounds top edge y=4를 crossing
      const e = { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 5 };
      const b = { min: { x: -5, y: 4 }, max: { x: 5, y: 6 } };
      expect(intersectsEllipseBounds(e, b)).toBe(true);
    });

    test('ellipse arc가 bounds edge에 접선(tangent)이면 true를 반환한다 (closed boundary)', () => {
      // center(0,0), rx=3, ry=2. bounds left edge x=3에서 ellipse 접선
      const e = { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 };
      const b = { min: { x: 3, y: -1 }, max: { x: 5, y: 1 } };
      expect(intersectsEllipseBounds(e, b)).toBe(true);
    });

    test('ellipse arc가 bounds edge 근처에 있지만 실제 crossing 없으면 false를 반환한다', () => {
      // center(0,0), rx=3, ry=2. bounds minX=3.1 (ellipse가 닿지 않음)
      const e = { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 };
      const b = { min: { x: 3.1, y: -5 }, max: { x: 5, y: 5 } };
      expect(intersectsEllipseBounds(e, b)).toBe(false);
    });
  });

  describe('input forms', () => {
    test('tuple center에서도 동작한다', () => {
      const e = { center: [0, 0] as const, radiusX: 3, radiusY: 2 };
      const bounds = { min: { x: -1, y: -1 }, max: { x: 1, y: 1 } };
      expect(intersectsEllipseBounds(e, bounds)).toBe(true);
    });

    test('tuple shorthand EllipseLike에서도 동작한다', () => {
      const e = [[0, 0], 3, 2] as const;
      const bounds = { min: { x: -1, y: -1 }, max: { x: 1, y: 1 } };
      expect(intersectsEllipseBounds(e, bounds)).toBe(true);
    });

    test('tuple BoundsLike에서도 동작한다', () => {
      expect(
        intersectsEllipseBounds(ellipse, [
          { x: -1, y: -1 },
          { x: 1, y: 1 },
        ])
      ).toBe(true);
    });

    test('tuple XY in tuple bounds에서도 동작한다', () => {
      expect(
        intersectsEllipseBounds(ellipse, [
          [-1, -1],
          [1, 1],
        ])
      ).toBe(true);
    });
  });
});
