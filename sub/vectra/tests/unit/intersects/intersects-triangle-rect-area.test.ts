/**
 * 삼각형과 rect 영역 교차를 검증한다.
 * 분리, 포함, 경계 접촉, 변 교차, 퇴화 삼각형과 빈 영역을 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { intersectsRectTriangle } from '../../../src/intersects/intersects-rect-triangle';

// 기준 삼각형: (0,0), (4,0), (0,4) — CCW
const tri = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 4 };

describe('intersectsRect', () => {
  describe('miss', () => {
    test('완전히 떨어진 triangle과 rect는 false를 반환한다', () => {
      const rect = { x: 10, y: 10, width: 5, height: 5 };
      expect(intersectsRectTriangle(rect, tri)).toBe(false);
    });

    test('degenerate triangle은 false를 반환한다', () => {
      const degenerate = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
      const rect = { x: 0, y: 0, width: 5, height: 5 };
      expect(intersectsRectTriangle(rect, degenerate)).toBe(false);
    });

    test('empty rect (width=0)이면 false를 반환한다', () => {
      const rect = { x: 0, y: 0, width: 0, height: 5 };
      expect(intersectsRectTriangle(rect, tri)).toBe(false);
    });

    test('empty rect (height=0)이면 false를 반환한다', () => {
      const rect = { x: 0, y: 0, width: 5, height: 0 };
      expect(intersectsRectTriangle(rect, tri)).toBe(false);
    });

    test('empty rect (width<0)이면 false를 반환한다', () => {
      const rect = { x: 0, y: 0, width: -1, height: 5 };
      expect(intersectsRectTriangle(rect, tri)).toBe(false);
    });

    test('rect가 SAT axis로 분리되는 경우 false를 반환한다', () => {
      // triangle 빗변 normal 방향으로 분리
      const rect = { x: 5, y: 5, width: 3, height: 3 };
      expect(intersectsRectTriangle(rect, tri)).toBe(false);
    });
  });

  describe('containment', () => {
    test('rect가 triangle 안에 완전히 포함되면 true를 반환한다', () => {
      const rect = { x: 0.5, y: 0.5, width: 1, height: 1 };
      expect(intersectsRectTriangle(rect, tri)).toBe(true);
    });

    test('triangle이 rect 안에 완전히 포함되면 true를 반환한다', () => {
      const rect = { x: -1, y: -1, width: 10, height: 10 };
      expect(intersectsRectTriangle(rect, tri)).toBe(true);
    });
  });

  describe('edge touch', () => {
    test('triangle vertex가 rect edge 위에 있으면 true를 반환한다 (closed boundary)', () => {
      // tri vertex (4,0)이 rect 왼쪽 edge x=4 위에 있음
      const rect = { x: 4, y: -1, width: 5, height: 3 };
      expect(intersectsRectTriangle(rect, tri)).toBe(true);
    });

    test('rect corner가 triangle edge 위에 있으면 true를 반환한다 (closed boundary)', () => {
      // rect corner (2,2) → tri 빗변 x+y=4 위: 2+2=4 → true
      const rect = { x: 2, y: 2, width: 5, height: 5 };
      expect(intersectsRectTriangle(rect, tri)).toBe(true);
    });
  });

  describe('crossing', () => {
    test('triangle edge가 rect를 가로지르면 true를 반환한다', () => {
      const rect = { x: 1, y: 1, width: 3, height: 3 };
      expect(intersectsRectTriangle(rect, tri)).toBe(true);
    });
  });
});
