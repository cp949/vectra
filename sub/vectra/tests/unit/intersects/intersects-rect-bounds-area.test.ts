/** 직사각형과 경계 상자의 교차와 경계 접촉을 검증한다. */
import { describe, expect, test } from 'vitest';
import { intersectsRectBounds } from '../../../src/intersects/intersects-rect-bounds';

describe('intersectsBounds', () => {
  describe('miss', () => {
    test('rect가 bounds 오른쪽에 완전히 떨어져 있으면 false를 반환한다', () => {
      const rect = { x: 10, y: 0, width: 5, height: 5 };
      const bounds = { minX: 0, minY: 0, maxX: 4, maxY: 5 };
      expect(intersectsRectBounds(rect, bounds)).toBe(false);
    });

    test('rect가 bounds 위쪽에 완전히 떨어져 있으면 false를 반환한다', () => {
      const rect = { x: 0, y: 10, width: 5, height: 5 };
      const bounds = { minX: 0, minY: 0, maxX: 5, maxY: 4 };
      expect(intersectsRectBounds(rect, bounds)).toBe(false);
    });

    test('empty rect (width=0)이면 false를 반환한다', () => {
      const rect = { x: 0, y: 0, width: 0, height: 5 };
      const bounds = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
      expect(intersectsRectBounds(rect, bounds)).toBe(false);
    });

    test('empty rect (height=0)이면 false를 반환한다', () => {
      const rect = { x: 0, y: 0, width: 5, height: 0 };
      const bounds = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
      expect(intersectsRectBounds(rect, bounds)).toBe(false);
    });

    test('empty rect (width<0)이면 false를 반환한다', () => {
      const rect = { x: 0, y: 0, width: -1, height: 5 };
      const bounds = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
      expect(intersectsRectBounds(rect, bounds)).toBe(false);
    });

    test('empty bounds (maxX < minX)이면 false를 반환한다', () => {
      const rect = { x: 0, y: 0, width: 5, height: 5 };
      const bounds = { minX: 5, minY: 0, maxX: 0, maxY: 5 };
      expect(intersectsRectBounds(rect, bounds)).toBe(false);
    });

    test('empty bounds (maxY < minY)이면 false를 반환한다', () => {
      const rect = { x: 0, y: 0, width: 5, height: 5 };
      const bounds = { minX: 0, minY: 5, maxX: 5, maxY: 0 };
      expect(intersectsRectBounds(rect, bounds)).toBe(false);
    });
  });

  describe('overlap', () => {
    test('rect와 bounds가 부분적으로 겹치면 true를 반환한다', () => {
      const rect = { x: 0, y: 0, width: 5, height: 5 };
      const bounds = { minX: 3, minY: 3, maxX: 8, maxY: 8 };
      expect(intersectsRectBounds(rect, bounds)).toBe(true);
    });

    test('rect가 bounds 안에 완전히 포함되면 true를 반환한다', () => {
      const rect = { x: 1, y: 1, width: 2, height: 2 };
      const bounds = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
      expect(intersectsRectBounds(rect, bounds)).toBe(true);
    });

    test('bounds가 rect 안에 완전히 포함되면 true를 반환한다', () => {
      const rect = { x: 0, y: 0, width: 10, height: 10 };
      const bounds = { minX: 2, minY: 2, maxX: 4, maxY: 4 };
      expect(intersectsRectBounds(rect, bounds)).toBe(true);
    });
  });

  describe('edge touch', () => {
    test('rect 오른쪽 edge가 bounds 왼쪽 edge에 닿으면 true를 반환한다 (closed boundary)', () => {
      // rect [0,0,5,5]: right edge x=5, bounds minX=5
      const rect = { x: 0, y: 0, width: 5, height: 5 };
      const bounds = { minX: 5, minY: 0, maxX: 10, maxY: 5 };
      expect(intersectsRectBounds(rect, bounds)).toBe(true);
    });

    test('rect 아래쪽 edge가 bounds 위쪽 edge에 닿으면 true를 반환한다 (closed boundary)', () => {
      // rect [0,0,5,5]: bottom y=5, bounds minY=5
      const rect = { x: 0, y: 0, width: 5, height: 5 };
      const bounds = { minX: 0, minY: 5, maxX: 5, maxY: 10 };
      expect(intersectsRectBounds(rect, bounds)).toBe(true);
    });
  });
});
