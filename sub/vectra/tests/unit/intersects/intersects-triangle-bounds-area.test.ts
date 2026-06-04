import { describe, expect, test } from 'vitest';
import { intersectsBoundsTriangle } from '../../../src/intersects/intersects-bounds-triangle';

// 기준 삼각형: a(0,0) b(4,0) c(0,4) — CCW
const tri = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };

describe('intersectsBounds', () => {
  describe('miss', () => {
    test('완전히 떨어진 triangle과 bounds는 false를 반환한다', () => {
      const bounds = { min: { x: 10, y: 10 }, max: { x: 15, y: 15 } };
      expect(intersectsBoundsTriangle(bounds, tri)).toBe(false);
    });

    test('degenerate triangle은 false를 반환한다', () => {
      const degenerate = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
      const bounds = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
      expect(intersectsBoundsTriangle(bounds, degenerate)).toBe(false);
    });

    test('empty bounds (maxX < minX)이면 false를 반환한다', () => {
      const bounds = { min: { x: 5, y: 0 }, max: { x: 0, y: 5 } };
      expect(intersectsBoundsTriangle(bounds, tri)).toBe(false);
    });

    test('empty bounds (maxY < minY)이면 false를 반환한다', () => {
      const bounds = { min: { x: 0, y: 5 }, max: { x: 5, y: 0 } };
      expect(intersectsBoundsTriangle(bounds, tri)).toBe(false);
    });
  });

  describe('containment', () => {
    test('bounds가 triangle 안에 완전히 포함되면 true를 반환한다', () => {
      const bounds = { min: { x: 0.5, y: 0.5 }, max: { x: 1.5, y: 1.5 } };
      expect(intersectsBoundsTriangle(bounds, tri)).toBe(true);
    });

    test('triangle이 bounds 안에 완전히 포함되면 true를 반환한다', () => {
      const bounds = { min: { x: -1, y: -1 }, max: { x: 10, y: 10 } };
      expect(intersectsBoundsTriangle(bounds, tri)).toBe(true);
    });
  });

  describe('edge touch', () => {
    test('triangle vertex가 bounds edge 위에 있으면 true를 반환한다 (closed boundary)', () => {
      // tri vertex (4,0)이 bounds 왼쪽 edge x=4 위에 있음
      const bounds = { min: { x: 4, y: -1 }, max: { x: 9, y: 3 } };
      expect(intersectsBoundsTriangle(bounds, tri)).toBe(true);
    });

    test('bounds corner가 triangle edge 위에 있으면 true를 반환한다 (closed boundary)', () => {
      // bounds corner (2,2) → tri 빗변 x+y=4: 2+2=4 → boundary touch
      const bounds = { min: { x: 2, y: 2 }, max: { x: 7, y: 7 } };
      expect(intersectsBoundsTriangle(bounds, tri)).toBe(true);
    });
  });

  describe('crossing', () => {
    test('triangle edge가 bounds를 가로지르면 true를 반환한다', () => {
      const bounds = { min: { x: 1, y: 1 }, max: { x: 4, y: 4 } };
      expect(intersectsBoundsTriangle(bounds, tri)).toBe(true);
    });
  });

  describe('input forms', () => {
    test('tuple TriangleLike에서도 동작한다', () => {
      const t = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: 4 },
      ] as const;
      const bounds = { min: { x: 1, y: 1 }, max: { x: 4, y: 4 } };
      expect(intersectsBoundsTriangle(bounds, t)).toBe(true);
    });

    test('tuple BoundsLike에서도 동작한다', () => {
      expect(
        intersectsBoundsTriangle(
          [
            { x: 1, y: 1 },
            { x: 4, y: 4 },
          ],
          tri
        )
      ).toBe(true);
    });

    test('tuple XY in tuple bounds에서도 동작한다', () => {
      expect(
        intersectsBoundsTriangle(
          [
            [1, 1],
            [4, 4],
          ],
          tri
        )
      ).toBe(true);
    });
  });
});
