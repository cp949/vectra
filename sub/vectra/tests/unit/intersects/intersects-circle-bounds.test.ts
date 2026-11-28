/** 원과 bounds의 포함, 접촉, 분리를 확인한다. */
import { describe, expect, test } from 'vitest';
import { intersectsCircleBounds } from '../../../src/intersects/intersects-circle-bounds';

describe('intersectsBounds', () => {
  describe('miss', () => {
    test('circle이 bounds 오른쪽에 완전히 떨어져 있으면 false를 반환한다', () => {
      const circle = { cx: 0, cy: 0, r: 2 };
      const bounds = { minX: 5, minY: -3, maxX: 10, maxY: 3 };
      expect(intersectsCircleBounds(circle, bounds)).toBe(false);
    });

    test('circle이 bounds 위쪽에 완전히 떨어져 있으면 false를 반환한다', () => {
      const circle = { cx: 0, cy: 10, r: 2 };
      const bounds = { minX: -3, minY: 0, maxX: 3, maxY: 5 };
      expect(intersectsCircleBounds(circle, bounds)).toBe(false);
    });

    test('corner zone에서 corner 밖에 머무르면 false를 반환한다', () => {
      // bounds [0,0,5,5], circle center (-3,-4) → closest=(0,0), distSq=25 > r²=16
      const circle = { cx: -3, cy: -4, r: 4 };
      const bounds = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
      expect(intersectsCircleBounds(circle, bounds)).toBe(false);
    });

    test('empty circle (r=0)이면 false를 반환한다', () => {
      const circle = { cx: 0, cy: 0, r: 0 };
      const bounds = { minX: -5, minY: -5, maxX: 5, maxY: 5 };
      expect(intersectsCircleBounds(circle, bounds)).toBe(false);
    });

    test('empty circle (r<0)이면 false를 반환한다', () => {
      const circle = { cx: 0, cy: 0, r: -1 };
      const bounds = { minX: -5, minY: -5, maxX: 5, maxY: 5 };
      expect(intersectsCircleBounds(circle, bounds)).toBe(false);
    });

    test('empty bounds (maxX < minX)이면 false를 반환한다', () => {
      const circle = { cx: 0, cy: 0, r: 5 };
      const bounds = { minX: 5, minY: 0, maxX: 0, maxY: 5 };
      expect(intersectsCircleBounds(circle, bounds)).toBe(false);
    });

    test('empty bounds (maxY < minY)이면 false를 반환한다', () => {
      const circle = { cx: 0, cy: 0, r: 5 };
      const bounds = { minX: 0, minY: 5, maxX: 5, maxY: 0 };
      expect(intersectsCircleBounds(circle, bounds)).toBe(false);
    });
  });

  describe('overlap', () => {
    test('circle center가 bounds 안에 있으면 true를 반환한다', () => {
      const circle = { cx: 2, cy: 2, r: 1 };
      const bounds = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
      expect(intersectsCircleBounds(circle, bounds)).toBe(true);
    });

    test('circle이 bounds 안쪽 edge와 교차하면 true를 반환한다', () => {
      // closest point = (5, 0), dist = 5 = radius
      const circle = { cx: 0, cy: 0, r: 5 };
      const bounds = { minX: 5, minY: -3, maxX: 10, maxY: 3 };
      expect(intersectsCircleBounds(circle, bounds)).toBe(true);
    });

    test('circle이 bounds 전체를 포함하면 true를 반환한다', () => {
      const circle = { cx: 0, cy: 0, r: 20 };
      const bounds = { minX: -5, minY: -5, maxX: 5, maxY: 5 };
      expect(intersectsCircleBounds(circle, bounds)).toBe(true);
    });
  });

  describe('edge touch', () => {
    test('edge tangent이면 true를 반환한다 (closed boundary)', () => {
      // closest point = (5, 0), dist = 5 = radius
      const circle = { cx: 0, cy: 0, r: 5 };
      const bounds = { minX: 5, minY: -3, maxX: 10, maxY: 3 };
      expect(intersectsCircleBounds(circle, bounds)).toBe(true);
    });

    test('corner tangent이면 true를 반환한다 (closed boundary)', () => {
      // bounds [0,0,5,5], center (-3,-4) → closest=(0,0), distSq=25 = r²=25
      const circle = { cx: -3, cy: -4, r: 5 };
      const bounds = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
      expect(intersectsCircleBounds(circle, bounds)).toBe(true);
    });
  });
});
