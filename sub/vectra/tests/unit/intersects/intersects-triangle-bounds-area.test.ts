import { describe, expect, test } from 'vitest';
import { intersectsBoundsTriangle } from '../../../src/intersects/intersects-bounds-triangle';

// 기준 삼각형: a(0,0) b(4,0) c(0,4) — CCW
const tri = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 4 };

describe('intersectsBounds', () => {
  describe('miss', () => {
    test('완전히 떨어진 triangle과 bounds는 false를 반환한다', () => {
      const bounds = { minX: 10, minY: 10, maxX: 15, maxY: 15 };
      expect(intersectsBoundsTriangle(bounds, tri)).toBe(false);
    });

    test('degenerate triangle은 false를 반환한다', () => {
      const degenerate = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
      const bounds = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
      expect(intersectsBoundsTriangle(bounds, degenerate)).toBe(false);
    });

    test('empty bounds (maxX < minX)이면 false를 반환한다', () => {
      const bounds = { minX: 5, minY: 0, maxX: 0, maxY: 5 };
      expect(intersectsBoundsTriangle(bounds, tri)).toBe(false);
    });

    test('empty bounds (maxY < minY)이면 false를 반환한다', () => {
      const bounds = { minX: 0, minY: 5, maxX: 5, maxY: 0 };
      expect(intersectsBoundsTriangle(bounds, tri)).toBe(false);
    });
  });

  describe('containment', () => {
    test('bounds가 triangle 안에 완전히 포함되면 true를 반환한다', () => {
      const bounds = { minX: 0.5, minY: 0.5, maxX: 1.5, maxY: 1.5 };
      expect(intersectsBoundsTriangle(bounds, tri)).toBe(true);
    });

    test('triangle이 bounds 안에 완전히 포함되면 true를 반환한다', () => {
      const bounds = { minX: -1, minY: -1, maxX: 10, maxY: 10 };
      expect(intersectsBoundsTriangle(bounds, tri)).toBe(true);
    });
  });

  describe('edge touch', () => {
    test('triangle vertex가 bounds edge 위에 있으면 true를 반환한다 (closed boundary)', () => {
      // tri vertex (4,0)이 bounds 왼쪽 edge x=4 위에 있음
      const bounds = { minX: 4, minY: -1, maxX: 9, maxY: 3 };
      expect(intersectsBoundsTriangle(bounds, tri)).toBe(true);
    });

    test('bounds corner가 triangle edge 위에 있으면 true를 반환한다 (closed boundary)', () => {
      // bounds corner (2,2) → tri 빗변 x+y=4: 2+2=4 → boundary touch
      const bounds = { minX: 2, minY: 2, maxX: 7, maxY: 7 };
      expect(intersectsBoundsTriangle(bounds, tri)).toBe(true);
    });
  });

  describe('crossing', () => {
    test('triangle edge가 bounds를 가로지르면 true를 반환한다', () => {
      const bounds = { minX: 1, minY: 1, maxX: 4, maxY: 4 };
      expect(intersectsBoundsTriangle(bounds, tri)).toBe(true);
    });
  });
});
