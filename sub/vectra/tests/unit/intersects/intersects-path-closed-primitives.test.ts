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
      const circle = { center: { x: 5, y: 2 }, radius: 2 };
      expect(intersectsPathCircle(squarePath, circle)).toBe(true);
    });

    test('circle이 closed path edge를 교차하면 true를 반환한다', () => {
      const circle = { center: { x: 5, y: 2 }, radius: 2 };
      expect(intersectsPathCircle(squareClosedPath, circle)).toBe(true);
    });
  });

  describe('path 점이 circle 내부', () => {
    test('path vertex가 circle 내부에 있으면 true를 반환한다', () => {
      // circle 중심 (4, 0.5), 반지름 1: vertex (4,0)이 내부에 있다
      const circle = { center: { x: 4, y: 0.5 }, radius: 1 };
      expect(intersectsPathCircle(squarePath, circle)).toBe(true);
    });
  });

  describe('circle이 path 내부에 포함', () => {
    test('circle 전체가 closed path 내부에 있으면 true를 반환한다', () => {
      // bigSquarePath (0,0)-(10,10) 안에 circle 중심 (5,5), 반지름 2
      const circle = { center: { x: 5, y: 5 }, radius: 2 };
      expect(intersectsPathCircle(bigSquarePath, circle)).toBe(true);
    });
  });

  describe('교차 miss', () => {
    test('circle이 path와 완전히 떨어져 있으면 false를 반환한다', () => {
      const circle = { center: { x: 20, y: 20 }, radius: 2 };
      expect(intersectsPathCircle(squarePath, circle)).toBe(false);
    });

    test('empty circle (radius <= 0)은 false를 반환한다', () => {
      const circle = { center: { x: 2, y: 2 }, radius: 0 };
      expect(intersectsPathCircle(squarePath, circle)).toBe(false);
    });

    test('open path 내부 가상 영역에 circle이 있어도 edge 미접촉이면 false를 반환한다', () => {
      // circle 중심 (2,2) 반지름 0.5: path 점이 circle 내부에 없고 edge 미교차
      const circle = { center: { x: 2, y: 2 }, radius: 0.5 };
      expect(intersectsPathCircle(squarePath, circle)).toBe(false);
    });
  });

  describe('empty path', () => {
    test('empty path는 false를 반환한다', () => {
      const circle = { center: { x: 2, y: 2 }, radius: 2 };
      expect(intersectsPathCircle([], circle)).toBe(false);
    });
  });

  describe('boundary touch', () => {
    test('circle boundary가 path vertex를 touch하면 true를 반환한다', () => {
      // circle 중심 (6, 0), 반지름 2: vertex (4,0)이 경계 위
      const circle = { center: { x: 6, y: 0 }, radius: 2 };
      expect(intersectsPathCircle(squarePath, circle)).toBe(true);
    });
  });
});

describe('intersectsPathTriangle', () => {
  describe('edge 교차', () => {
    test('triangle edge가 path edge를 가로지르면 true를 반환한다', () => {
      // triangle (3,-1)-(5,-1)-(4,3)이 squarePath (4,0)->(4,4) edge와 교차
      const tri = { a: { x: 3, y: -1 }, b: { x: 5, y: -1 }, c: { x: 4, y: 3 } };
      expect(intersectsPathTriangle(squarePath, tri)).toBe(true);
    });

    test('triangle이 closed path edge를 교차하면 true를 반환한다', () => {
      const tri = { a: { x: 3, y: -1 }, b: { x: 5, y: -1 }, c: { x: 4, y: 3 } };
      expect(intersectsPathTriangle(squareClosedPath, tri)).toBe(true);
    });
  });

  describe('path 점이 triangle 내부', () => {
    test('path vertex가 triangle 내부에 있으면 true를 반환한다', () => {
      // triangle이 path vertex (4,4)를 감싸는 경우
      const tri = { a: { x: 3, y: 3 }, b: { x: 5, y: 3 }, c: { x: 4, y: 6 } };
      expect(intersectsPathTriangle(squarePath, tri)).toBe(true);
    });
  });

  describe('triangle이 path 내부에 포함', () => {
    test('triangle 전체가 closed path 내부에 있으면 true를 반환한다', () => {
      // bigSquarePath (0,0)-(10,10) 안에 triangle (3,3)-(7,3)-(5,7)
      const tri = { a: { x: 3, y: 3 }, b: { x: 7, y: 3 }, c: { x: 5, y: 7 } };
      expect(intersectsPathTriangle(bigSquarePath, tri)).toBe(true);
    });
  });

  describe('교차 miss', () => {
    test('triangle이 path와 완전히 떨어져 있으면 false를 반환한다', () => {
      const tri = { a: { x: 20, y: 20 }, b: { x: 25, y: 20 }, c: { x: 22, y: 25 } };
      expect(intersectsPathTriangle(squarePath, tri)).toBe(false);
    });

    test('degenerate triangle은 false를 반환한다', () => {
      const tri = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
      expect(intersectsPathTriangle(squarePath, tri)).toBe(false);
    });

    test('open path 내부 가상 영역에 triangle이 있어도 edge 미접촉이면 false를 반환한다', () => {
      // triangle (1,1)-(3,1)-(2,3): path 점 미포함, edge 미교차
      const tri = { a: { x: 1, y: 1 }, b: { x: 3, y: 1 }, c: { x: 2, y: 3 } };
      expect(intersectsPathTriangle(squarePath, tri)).toBe(false);
    });
  });

  describe('empty path', () => {
    test('empty path는 false를 반환한다', () => {
      const tri = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 4 } };
      expect(intersectsPathTriangle([], tri)).toBe(false);
    });
  });

  describe('boundary touch', () => {
    test('triangle vertex가 path vertex와 일치하면 true를 반환한다', () => {
      // triangle vertex (4,0)이 squarePath vertex (4,0)과 일치
      const tri = { a: { x: 4, y: 0 }, b: { x: 6, y: 0 }, c: { x: 5, y: 2 } };
      expect(intersectsPathTriangle(squarePath, tri)).toBe(true);
    });
  });
});
