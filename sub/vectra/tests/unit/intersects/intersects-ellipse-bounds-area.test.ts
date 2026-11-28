/** 타원과 사각 경계의 포함, 접촉, 분리를 확인한다. */
import { describe, expect, test } from 'vitest';
import { intersectsEllipseBounds } from '../../../src/intersects/intersects-ellipse-bounds';

// 기준 ellipse: center(0,0) rx=3 ry=2
const ellipse = { cx: 0, cy: 0, rx: 3, ry: 2 };

describe('intersectsBounds', () => {
  describe('miss', () => {
    test('ellipse AABB와 bounds가 겹치지 않으면 false를 반환한다', () => {
      // ellipse AABB: [-3,-2,3,2], bounds [10,0,15,5] → AABB miss
      const bounds = { minX: 10, minY: 0, maxX: 15, maxY: 5 };
      expect(intersectsEllipseBounds(ellipse, bounds)).toBe(false);
    });

    test('empty ellipse (rx=0)이면 false를 반환한다', () => {
      const e = { cx: 0, cy: 0, rx: 0, ry: 2 };
      const bounds = { minX: -5, minY: -5, maxX: 5, maxY: 5 };
      expect(intersectsEllipseBounds(e, bounds)).toBe(false);
    });

    test('empty ellipse (ry<0)이면 false를 반환한다', () => {
      const e = { cx: 0, cy: 0, rx: 3, ry: -1 };
      const bounds = { minX: -5, minY: -5, maxX: 5, maxY: 5 };
      expect(intersectsEllipseBounds(e, bounds)).toBe(false);
    });

    test('empty bounds (maxX < minX)이면 false를 반환한다', () => {
      const bounds = { minX: 5, minY: 0, maxX: 0, maxY: 5 };
      expect(intersectsEllipseBounds(ellipse, bounds)).toBe(false);
    });

    test('empty bounds (maxY < minY)이면 false를 반환한다', () => {
      const bounds = { minX: 0, minY: 5, maxX: 5, maxY: 0 };
      expect(intersectsEllipseBounds(ellipse, bounds)).toBe(false);
    });
  });

  describe('ellipse center inside bounds', () => {
    test('ellipse center가 bounds 안에 있으면 true를 반환한다', () => {
      const bounds = { minX: -1, minY: -1, maxX: 1, maxY: 1 };
      expect(intersectsEllipseBounds(ellipse, bounds)).toBe(true);
    });
  });

  describe('bounds corner inside ellipse', () => {
    test('bounds corner가 ellipse 안에 있으면 true를 반환한다', () => {
      // bounds corner (1,1): (1/3)² + (1/2)² < 1 → inside
      const bounds = { minX: 1, minY: 1, maxX: 6, maxY: 6 };
      expect(intersectsEllipseBounds(ellipse, bounds)).toBe(true);
    });

    test('bounds corner가 ellipse 경계 위에 있으면 true를 반환한다 (closed boundary)', () => {
      // corner (0,2): (0/3)² + (2/2)² = 1 → on boundary
      const bounds = { minX: 0, minY: 2, maxX: 5, maxY: 7 };
      expect(intersectsEllipseBounds(ellipse, bounds)).toBe(true);
    });
  });

  describe('bounds contains ellipse', () => {
    test('bounds가 ellipse 전체를 포함하면 true를 반환한다 (ellipse center가 bounds 안)', () => {
      const bounds = { minX: -5, minY: -5, maxX: 5, maxY: 5 };
      expect(intersectsEllipseBounds(ellipse, bounds)).toBe(true);
    });
  });

  describe('arc crossing', () => {
    test('ellipse arc가 bounds 수직 edge를 crossing하면 true를 반환한다', () => {
      // 얇은 수평 ellipse: center(0,0), rx=5, ry=1
      // bounds: minX=4, minY=-5, maxX=6, maxY=5 (minX edge x=4를 crossing)
      const e = { cx: 0, cy: 0, rx: 5, ry: 1 };
      const b = { minX: 4, minY: -5, maxX: 6, maxY: 5 };
      expect(intersectsEllipseBounds(e, b)).toBe(true);
    });

    test('ellipse arc가 bounds 수평 edge를 crossing하면 true를 반환한다', () => {
      // 얇은 수직 ellipse: center(0,0), rx=1, ry=5
      // bounds top edge y=4를 crossing
      const e = { cx: 0, cy: 0, rx: 1, ry: 5 };
      const b = { minX: -5, minY: 4, maxX: 5, maxY: 6 };
      expect(intersectsEllipseBounds(e, b)).toBe(true);
    });

    test('ellipse arc가 bounds edge에 접선(tangent)이면 true를 반환한다 (closed boundary)', () => {
      // center(0,0), rx=3, ry=2. bounds left edge x=3에서 ellipse 접선
      const e = { cx: 0, cy: 0, rx: 3, ry: 2 };
      const b = { minX: 3, minY: -1, maxX: 5, maxY: 1 };
      expect(intersectsEllipseBounds(e, b)).toBe(true);
    });

    test('ellipse arc가 bounds edge 근처에 있지만 실제 crossing 없으면 false를 반환한다', () => {
      // center(0,0), rx=3, ry=2. bounds minX=3.1 (ellipse가 닿지 않음)
      const e = { cx: 0, cy: 0, rx: 3, ry: 2 };
      const b = { minX: 3.1, minY: -5, maxX: 5, maxY: 5 };
      expect(intersectsEllipseBounds(e, b)).toBe(false);
    });
  });
});
