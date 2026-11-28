/** 원과 삼각형의 포함, 접촉, 분리와 퇴화를 확인한다. */
import { describe, expect, test } from 'vitest';
import { intersectsCircleTriangle } from '../../../src/intersects/intersects-circle-triangle';

// 기준 삼각형: a(0,0) b(4,0) c(0,4) — CCW
const tri = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 4 };

describe('intersectsCircle', () => {
  describe('miss', () => {
    test('circle이 triangle과 완전히 떨어져 있으면 false를 반환한다', () => {
      const circle = { cx: 10, cy: 10, r: 2 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(false);
    });

    test('degenerate triangle이면 false를 반환한다', () => {
      const degenerate = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
      const circle = { cx: 2, cy: 0, r: 5 };
      expect(intersectsCircleTriangle(circle, degenerate)).toBe(false);
    });

    test('empty circle (radius=0)이면 false를 반환한다', () => {
      const circle = { cx: 2, cy: 1, r: 0 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(false);
    });

    test('empty circle (radius<0)이면 false를 반환한다', () => {
      const circle = { cx: 2, cy: 1, r: -1 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(false);
    });

    test('circle이 triangle 인접 corner 외부에서 분리되면 false를 반환한다', () => {
      // corner (4,0)에서 대각선 방향, 거리 > r
      const circle = { cx: 6, cy: 2, r: 1 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(false);
    });
  });

  describe('center containment', () => {
    test('circle center가 triangle 내부에 있으면 true를 반환한다', () => {
      const circle = { cx: 1, cy: 1, r: 0.5 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(true);
    });

    test('circle이 triangle을 완전히 포함하면 true를 반환한다', () => {
      const circle = { cx: 0, cy: 0, r: 20 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(true);
    });
  });

  describe('edge distance', () => {
    test('circle이 triangle edge에 접하면 true를 반환한다 (closed boundary)', () => {
      // 밑변 (y=0, x in [0,4])에 tangent: center (2,-5), r=5
      const circle = { cx: 2, cy: -5, r: 5 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(true);
    });

    test('circle이 triangle edge를 교차하면 true를 반환한다', () => {
      const circle = { cx: 2, cy: -2, r: 3 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(true);
    });

    test('circle이 triangle vertex 근처에서 접하면 true를 반환한다', () => {
      // vertex (4,0)에서 거리 r=2
      const circle = { cx: 6, cy: 0, r: 2 };
      expect(intersectsCircleTriangle(circle, tri)).toBe(true);
    });
  });
});
