import { describe, expect, test } from 'vitest';
import { intersectsCircleBounds } from '../../../src/intersects/intersects-circle-bounds';

describe('intersectsBounds', () => {
  describe('miss', () => {
    test('circle이 bounds 오른쪽에 완전히 떨어져 있으면 false를 반환한다', () => {
      const circle = { center: { x: 0, y: 0 }, radius: 2 };
      const bounds = { min: { x: 5, y: -3 }, max: { x: 10, y: 3 } };
      expect(intersectsCircleBounds(circle, bounds)).toBe(false);
    });

    test('circle이 bounds 위쪽에 완전히 떨어져 있으면 false를 반환한다', () => {
      const circle = { center: { x: 0, y: 10 }, radius: 2 };
      const bounds = { min: { x: -3, y: 0 }, max: { x: 3, y: 5 } };
      expect(intersectsCircleBounds(circle, bounds)).toBe(false);
    });

    test('corner zone에서 corner 밖에 머무르면 false를 반환한다', () => {
      // bounds [0,0,5,5], circle center (-3,-4) → closest=(0,0), distSq=25 > r²=16
      const circle = { center: { x: -3, y: -4 }, radius: 4 };
      const bounds = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
      expect(intersectsCircleBounds(circle, bounds)).toBe(false);
    });

    test('empty circle (radius=0)이면 false를 반환한다', () => {
      const circle = { center: { x: 0, y: 0 }, radius: 0 };
      const bounds = { min: { x: -5, y: -5 }, max: { x: 5, y: 5 } };
      expect(intersectsCircleBounds(circle, bounds)).toBe(false);
    });

    test('empty circle (radius<0)이면 false를 반환한다', () => {
      const circle = { center: { x: 0, y: 0 }, radius: -1 };
      const bounds = { min: { x: -5, y: -5 }, max: { x: 5, y: 5 } };
      expect(intersectsCircleBounds(circle, bounds)).toBe(false);
    });

    test('empty bounds (maxX < minX)이면 false를 반환한다', () => {
      const circle = { center: { x: 0, y: 0 }, radius: 5 };
      const bounds = { min: { x: 5, y: 0 }, max: { x: 0, y: 5 } };
      expect(intersectsCircleBounds(circle, bounds)).toBe(false);
    });

    test('empty bounds (maxY < minY)이면 false를 반환한다', () => {
      const circle = { center: { x: 0, y: 0 }, radius: 5 };
      const bounds = { min: { x: 0, y: 5 }, max: { x: 5, y: 0 } };
      expect(intersectsCircleBounds(circle, bounds)).toBe(false);
    });
  });

  describe('overlap', () => {
    test('circle center가 bounds 안에 있으면 true를 반환한다', () => {
      const circle = { center: { x: 2, y: 2 }, radius: 1 };
      const bounds = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
      expect(intersectsCircleBounds(circle, bounds)).toBe(true);
    });

    test('circle이 bounds 안쪽 edge와 교차하면 true를 반환한다', () => {
      // closest point = (5, 0), dist = 5 = radius
      const circle = { center: { x: 0, y: 0 }, radius: 5 };
      const bounds = { min: { x: 5, y: -3 }, max: { x: 10, y: 3 } };
      expect(intersectsCircleBounds(circle, bounds)).toBe(true);
    });

    test('circle이 bounds 전체를 포함하면 true를 반환한다', () => {
      const circle = { center: { x: 0, y: 0 }, radius: 20 };
      const bounds = { min: { x: -5, y: -5 }, max: { x: 5, y: 5 } };
      expect(intersectsCircleBounds(circle, bounds)).toBe(true);
    });
  });

  describe('edge touch', () => {
    test('edge tangent이면 true를 반환한다 (closed boundary)', () => {
      // closest point = (5, 0), dist = 5 = radius
      const circle = { center: { x: 0, y: 0 }, radius: 5 };
      const bounds = { min: { x: 5, y: -3 }, max: { x: 10, y: 3 } };
      expect(intersectsCircleBounds(circle, bounds)).toBe(true);
    });

    test('corner tangent이면 true를 반환한다 (closed boundary)', () => {
      // bounds [0,0,5,5], center (-3,-4) → closest=(0,0), distSq=25 = r²=25
      const circle = { center: { x: -3, y: -4 }, radius: 5 };
      const bounds = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
      expect(intersectsCircleBounds(circle, bounds)).toBe(true);
    });
  });

  describe('input forms', () => {
    test('tuple center에서도 동작한다', () => {
      const circle = { center: [0, 0] as const, radius: 5 };
      const bounds = { min: { x: 5, y: -3 }, max: { x: 10, y: 3 } };
      expect(intersectsCircleBounds(circle, bounds)).toBe(true);
    });

    test('tuple shorthand CircleLike에서도 동작한다', () => {
      const circle = [[0, 0], 5] as const;
      const bounds = { min: { x: 5, y: -3 }, max: { x: 10, y: 3 } };
      expect(intersectsCircleBounds(circle, bounds)).toBe(true);
    });

    test('tuple bounds에서도 동작한다', () => {
      const circle = { center: { x: 0, y: 0 }, radius: 5 };
      expect(
        intersectsCircleBounds(circle, [
          { x: 5, y: -3 },
          { x: 10, y: 3 },
        ])
      ).toBe(true);
    });

    test('tuple XY in tuple bounds에서도 동작한다', () => {
      const circle = { center: { x: 0, y: 0 }, radius: 5 };
      expect(
        intersectsCircleBounds(circle, [
          [5, -3],
          [10, 3],
        ])
      ).toBe(true);
    });
  });
});
