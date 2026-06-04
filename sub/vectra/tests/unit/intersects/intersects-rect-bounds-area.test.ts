import { describe, expect, test } from 'vitest';
import { intersectsRectBounds } from '../../../src/intersects/intersects-rect-bounds';

describe('intersectsBounds', () => {
  describe('miss', () => {
    test('rect가 bounds 오른쪽에 완전히 떨어져 있으면 false를 반환한다', () => {
      const rect = { x: 10, y: 0, width: 5, height: 5 };
      const bounds = { min: { x: 0, y: 0 }, max: { x: 4, y: 5 } };
      expect(intersectsRectBounds(rect, bounds)).toBe(false);
    });

    test('rect가 bounds 위쪽에 완전히 떨어져 있으면 false를 반환한다', () => {
      const rect = { x: 0, y: 10, width: 5, height: 5 };
      const bounds = { min: { x: 0, y: 0 }, max: { x: 5, y: 4 } };
      expect(intersectsRectBounds(rect, bounds)).toBe(false);
    });

    test('empty rect (width=0)이면 false를 반환한다', () => {
      const rect = { x: 0, y: 0, width: 0, height: 5 };
      const bounds = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
      expect(intersectsRectBounds(rect, bounds)).toBe(false);
    });

    test('empty rect (height=0)이면 false를 반환한다', () => {
      const rect = { x: 0, y: 0, width: 5, height: 0 };
      const bounds = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
      expect(intersectsRectBounds(rect, bounds)).toBe(false);
    });

    test('empty rect (width<0)이면 false를 반환한다', () => {
      const rect = { x: 0, y: 0, width: -1, height: 5 };
      const bounds = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
      expect(intersectsRectBounds(rect, bounds)).toBe(false);
    });

    test('empty bounds (maxX < minX)이면 false를 반환한다', () => {
      const rect = { x: 0, y: 0, width: 5, height: 5 };
      const bounds = { min: { x: 5, y: 0 }, max: { x: 0, y: 5 } };
      expect(intersectsRectBounds(rect, bounds)).toBe(false);
    });

    test('empty bounds (maxY < minY)이면 false를 반환한다', () => {
      const rect = { x: 0, y: 0, width: 5, height: 5 };
      const bounds = { min: { x: 0, y: 5 }, max: { x: 5, y: 0 } };
      expect(intersectsRectBounds(rect, bounds)).toBe(false);
    });
  });

  describe('overlap', () => {
    test('rect와 bounds가 부분적으로 겹치면 true를 반환한다', () => {
      const rect = { x: 0, y: 0, width: 5, height: 5 };
      const bounds = { min: { x: 3, y: 3 }, max: { x: 8, y: 8 } };
      expect(intersectsRectBounds(rect, bounds)).toBe(true);
    });

    test('rect가 bounds 안에 완전히 포함되면 true를 반환한다', () => {
      const rect = { x: 1, y: 1, width: 2, height: 2 };
      const bounds = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
      expect(intersectsRectBounds(rect, bounds)).toBe(true);
    });

    test('bounds가 rect 안에 완전히 포함되면 true를 반환한다', () => {
      const rect = { x: 0, y: 0, width: 10, height: 10 };
      const bounds = { min: { x: 2, y: 2 }, max: { x: 4, y: 4 } };
      expect(intersectsRectBounds(rect, bounds)).toBe(true);
    });
  });

  describe('edge touch', () => {
    test('rect 오른쪽 edge가 bounds 왼쪽 edge에 닿으면 true를 반환한다 (closed boundary)', () => {
      // rect [0,0,5,5]: right edge x=5, bounds minX=5
      const rect = { x: 0, y: 0, width: 5, height: 5 };
      const bounds = { min: { x: 5, y: 0 }, max: { x: 10, y: 5 } };
      expect(intersectsRectBounds(rect, bounds)).toBe(true);
    });

    test('rect 아래쪽 edge가 bounds 위쪽 edge에 닿으면 true를 반환한다 (closed boundary)', () => {
      // rect [0,0,5,5]: bottom y=5, bounds minY=5
      const rect = { x: 0, y: 0, width: 5, height: 5 };
      const bounds = { min: { x: 0, y: 5 }, max: { x: 5, y: 10 } };
      expect(intersectsRectBounds(rect, bounds)).toBe(true);
    });
  });

  describe('input forms', () => {
    test('tuple rect에서도 동작한다', () => {
      expect(intersectsRectBounds([0, 0, 5, 5], { min: { x: 3, y: 3 }, max: { x: 8, y: 8 } })).toBe(true);
    });

    test('tuple bounds에서도 동작한다', () => {
      const rect = { x: 0, y: 0, width: 5, height: 5 };
      expect(
        intersectsRectBounds(rect, [
          { x: 3, y: 3 },
          { x: 8, y: 8 },
        ])
      ).toBe(true);
    });

    test('tuple center XY in bounds에서도 동작한다', () => {
      expect(
        intersectsRectBounds(
          [0, 0, 5, 5],
          [
            [3, 3],
            [8, 8],
          ]
        )
      ).toBe(true);
    });
  });
});
