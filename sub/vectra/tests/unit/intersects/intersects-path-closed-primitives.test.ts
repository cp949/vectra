/**
 * path와 circle, triangle 사이의 boolean 교차 판정을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { intersectsPathCircle } from '../../../src/intersects/intersects-path-circle';
import { intersectsPathTriangle } from '../../../src/intersects/intersects-path-triangle';
import { bigSquarePath, squareClosedPath, squarePath } from './_helpers/path-intersection-fixtures';

describe('intersectsPathCircle', () => {
  describe('edge 교차', () => {
    test('circle이 path edge를 교차하면 true를 반환한다', () => {
      // circle 중심 (5, 2), 반지름 2: (4,0)->(4,4) edge와 교차
      const circle = { cx: 5, cy: 2, r: 2 };
      expect(intersectsPathCircle(squarePath, circle)).toBe(true);
    });

    test('circle이 closed path edge를 교차하면 true를 반환한다', () => {
      const circle = { cx: 5, cy: 2, r: 2 };
      expect(intersectsPathCircle(squareClosedPath, circle)).toBe(true);
    });
  });

  describe('path 점이 circle 내부', () => {
    test('path vertex가 circle 내부에 있으면 true를 반환한다', () => {
      // circle 중심 (4, 0.5), 반지름 1: vertex (4,0)이 내부에 있다
      const circle = { cx: 4, cy: 0.5, r: 1 };
      expect(intersectsPathCircle(squarePath, circle)).toBe(true);
    });
  });

  describe('circle이 path 내부에 포함', () => {
    test('circle 전체가 closed path 내부에 있으면 true를 반환한다', () => {
      // bigSquarePath (0,0)-(10,10) 안에 circle 중심 (5,5), 반지름 2
      const circle = { cx: 5, cy: 5, r: 2 };
      expect(intersectsPathCircle(bigSquarePath, circle)).toBe(true);
    });
  });

  describe('교차 miss', () => {
    test('circle이 path와 완전히 떨어져 있으면 false를 반환한다', () => {
      const circle = { cx: 20, cy: 20, r: 2 };
      expect(intersectsPathCircle(squarePath, circle)).toBe(false);
    });

    test('empty circle (r <= 0)은 false를 반환한다', () => {
      const circle = { cx: 2, cy: 2, r: 0 };
      expect(intersectsPathCircle(squarePath, circle)).toBe(false);
    });

    test('open path 내부 가상 영역에 circle이 있어도 edge 미접촉이면 false를 반환한다', () => {
      // circle 중심 (2,2) 반지름 0.5: path 점이 circle 내부에 없고 edge 미교차
      const circle = { cx: 2, cy: 2, r: 0.5 };
      expect(intersectsPathCircle(squarePath, circle)).toBe(false);
    });
  });

  describe('empty path', () => {
    test('empty path는 false를 반환한다', () => {
      const circle = { cx: 2, cy: 2, r: 2 };
      expect(intersectsPathCircle([], circle)).toBe(false);
    });
  });

  describe('boundary touch', () => {
    test('circle boundary가 path vertex를 touch하면 true를 반환한다', () => {
      // circle 중심 (6, 0), 반지름 2: vertex (4,0)이 경계 위
      const circle = { cx: 6, cy: 0, r: 2 };
      expect(intersectsPathCircle(squarePath, circle)).toBe(true);
    });
  });
});

describe('intersectsPathTriangle', () => {
  describe('edge 교차', () => {
    test('triangle edge가 path edge를 가로지르면 true를 반환한다', () => {
      // triangle (3,-1)-(5,-1)-(4,3)이 squarePath (4,0)->(4,4) edge와 교차
      const tri = { x1: 3, y1: -1, x2: 5, y2: -1, x3: 4, y3: 3 };
      expect(intersectsPathTriangle(squarePath, tri)).toBe(true);
    });

    test('triangle이 closed path edge를 교차하면 true를 반환한다', () => {
      const tri = { x1: 3, y1: -1, x2: 5, y2: -1, x3: 4, y3: 3 };
      expect(intersectsPathTriangle(squareClosedPath, tri)).toBe(true);
    });
  });

  describe('path 점이 triangle 내부', () => {
    test('path vertex가 triangle 내부에 있으면 true를 반환한다', () => {
      // triangle이 path vertex (4,4)를 감싸는 경우
      const tri = { x1: 3, y1: 3, x2: 5, y2: 3, x3: 4, y3: 6 };
      expect(intersectsPathTriangle(squarePath, tri)).toBe(true);
    });
  });

  describe('triangle이 path 내부에 포함', () => {
    test('triangle 전체가 closed path 내부에 있으면 true를 반환한다', () => {
      // bigSquarePath (0,0)-(10,10) 안에 triangle (3,3)-(7,3)-(5,7)
      const tri = { x1: 3, y1: 3, x2: 7, y2: 3, x3: 5, y3: 7 };
      expect(intersectsPathTriangle(bigSquarePath, tri)).toBe(true);
    });
  });

  describe('교차 miss', () => {
    test('triangle이 path와 완전히 떨어져 있으면 false를 반환한다', () => {
      const tri = { x1: 20, y1: 20, x2: 25, y2: 20, x3: 22, y3: 25 };
      expect(intersectsPathTriangle(squarePath, tri)).toBe(false);
    });

    test('degenerate triangle은 false를 반환한다', () => {
      const tri = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
      expect(intersectsPathTriangle(squarePath, tri)).toBe(false);
    });

    test('open path 내부 가상 영역에 triangle이 있어도 edge 미접촉이면 false를 반환한다', () => {
      // triangle (1,1)-(3,1)-(2,3): path 점 미포함, edge 미교차
      const tri = { x1: 1, y1: 1, x2: 3, y2: 1, x3: 2, y3: 3 };
      expect(intersectsPathTriangle(squarePath, tri)).toBe(false);
    });
  });

  describe('empty path', () => {
    test('empty path는 false를 반환한다', () => {
      const tri = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 4 };
      expect(intersectsPathTriangle([], tri)).toBe(false);
    });
  });

  describe('boundary touch', () => {
    test('triangle vertex가 path vertex와 일치하면 true를 반환한다', () => {
      // triangle vertex (4,0)이 squarePath vertex (4,0)과 일치
      const tri = { x1: 4, y1: 0, x2: 6, y2: 0, x3: 5, y3: 2 };
      expect(intersectsPathTriangle(squarePath, tri)).toBe(true);
    });
  });
});
