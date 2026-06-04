import { describe, expect, test } from 'vitest';
import { intersectsCircleTriangle } from '../../../src/intersects/intersects-circle-triangle';

// 기준 삼각형: a(0,0) b(4,0) c(0,4) — CCW
const tri = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };

describe('intersectsCircle', () => {
  describe('miss', () => {
    test('circle이 triangle과 완전히 떨어져 있으면 false를 반환한다', () => {
      const circle = { center: { x: 10, y: 10 }, radius: 2 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(false);
    });

    test('degenerate triangle이면 false를 반환한다', () => {
      const degenerate = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
      const circle = { center: { x: 2, y: 0 }, radius: 5 };
      expect(intersectsCircleTriangle(circle, degenerate)).toBe(false);
    });

    test('empty circle (radius=0)이면 false를 반환한다', () => {
      const circle = { center: { x: 2, y: 1 }, radius: 0 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(false);
    });

    test('empty circle (radius<0)이면 false를 반환한다', () => {
      const circle = { center: { x: 2, y: 1 }, radius: -1 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(false);
    });

    test('circle이 triangle 인접 corner 외부에서 분리되면 false를 반환한다', () => {
      // corner (4,0)에서 대각선 방향, 거리 > r
      const circle = { center: { x: 6, y: 2 }, radius: 1 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(false);
    });
  });

  describe('center containment', () => {
    test('circle center가 triangle 내부에 있으면 true를 반환한다', () => {
      const circle = { center: { x: 1, y: 1 }, radius: 0.5 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(true);
    });

    test('circle이 triangle을 완전히 포함하면 true를 반환한다', () => {
      const circle = { center: { x: 0, y: 0 }, radius: 20 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(true);
    });
  });

  describe('edge distance', () => {
    test('circle이 triangle edge에 접하면 true를 반환한다 (closed boundary)', () => {
      // 밑변 (y=0, x in [0,4])에 tangent: center (2,-5), r=5
      const circle = { center: { x: 2, y: -5 }, radius: 5 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(true);
    });

    test('circle이 triangle edge를 교차하면 true를 반환한다', () => {
      const circle = { center: { x: 2, y: -2 }, radius: 3 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(true);
    });

    test('circle이 triangle vertex 근처에서 접하면 true를 반환한다', () => {
      // vertex (4,0)에서 거리 r=2
      const circle = { center: { x: 6, y: 0 }, radius: 2 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(true);
    });
  });

  describe('input forms', () => {
    test('tuple TriangleLike에서도 동작한다', () => {
      const t = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: 4 },
      ] as const;
      const circle = { center: { x: 1, y: 1 }, radius: 0.5 };
      expect(intersectsCircleTriangle(circle, t)).toBe(true);
    });

    test('tuple center에서도 동작한다', () => {
      const circle = { center: [2, -5] as const, radius: 5 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(true);
    });

    test('tuple shorthand CircleLike에서도 동작한다', () => {
      const circle = [[2, -5], 5] as const;
      expect(intersectsCircleTriangle(circle, tri)).toBe(true);
    });
  });
});
