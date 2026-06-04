/**
 * path와 rect, bounds 사이의 boolean 교차 판정을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { intersectsPathBounds } from '../../../src/intersects/intersects-path-bounds';
import { intersectsPathRect } from '../../../src/intersects/intersects-path-rect';
import { bigSquarePath, squareClosedPath, squarePath } from './_helpers/path-intersection-fixtures';

describe('intersectsPathRect', () => {
  describe('edge 교차', () => {
    test('rect edge가 path edge를 가로지르면 true를 반환한다', () => {
      // rect (3,3)-(7,7)이 squarePath edge (4,0)->(4,4)와 교차
      const rect = { x: 3, y: 3, width: 4, height: 4 };
      expect(intersectsPathRect(squarePath, rect)).toBe(true);
    });

    test('rect가 closed path edge를 교차하면 true를 반환한다', () => {
      const rect = { x: 3, y: 3, width: 4, height: 4 };
      expect(intersectsPathRect(squareClosedPath, rect)).toBe(true);
    });
  });

  describe('path 점이 rect 내부', () => {
    test('path vertex가 rect 내부에 있으면 true를 반환한다', () => {
      // rect가 path vertex (4,0)을 포함
      const rect = { x: 3, y: -1, width: 2, height: 2 };
      expect(intersectsPathRect(squarePath, rect)).toBe(true);
    });
  });

  describe('rect가 path 내부에 포함', () => {
    test('rect 전체가 closed path 내부에 있으면 true를 반환한다', () => {
      // bigSquarePath (0,0)-(10,10) 안에 rect (3,3)-(6,6)
      const rect = { x: 3, y: 3, width: 3, height: 3 };
      expect(intersectsPathRect(bigSquarePath, rect)).toBe(true);
    });
  });

  describe('교차 miss', () => {
    test('rect가 path와 완전히 떨어져 있으면 false를 반환한다', () => {
      const rect = { x: 20, y: 20, width: 4, height: 4 };
      expect(intersectsPathRect(squarePath, rect)).toBe(false);
    });

    test('너비가 0인 degenerate rect는 false를 반환한다', () => {
      const rect = { x: 2, y: 2, width: 0, height: 2 };
      expect(intersectsPathRect(squarePath, rect)).toBe(false);
    });

    test('open path 내부 가상 영역에 rect가 있어도 edge 미접촉이면 false를 반환한다', () => {
      // open squarePath (0,0)-(4,0)-(4,4)-(0,4): closing edge 없음
      // rect (1,1)-(3,3): 가상 내부지만 edge와 미접촉, CloseCommand 없으므로 condition 3 미적용
      const rect = { x: 1, y: 1, width: 2, height: 2 };
      expect(intersectsPathRect(squarePath, rect)).toBe(false);
    });
  });

  describe('empty path', () => {
    test('empty path는 false를 반환한다', () => {
      const rect = { x: 0, y: 0, width: 4, height: 4 };
      expect(intersectsPathRect([], rect)).toBe(false);
    });
  });
});

describe('intersectsPathBounds', () => {
  describe('edge 교차', () => {
    test('bounds edge가 path edge를 가로지르면 true를 반환한다', () => {
      // bounds { min:(3,3), max:(7,7) }이 squarePath (4,0)->(4,4) edge와 교차
      const bounds = { min: { x: 3, y: 3 }, max: { x: 7, y: 7 } };
      expect(intersectsPathBounds(squarePath, bounds)).toBe(true);
    });

    test('tuple 형식 bounds도 동일하게 동작한다', () => {
      const bounds: [{ x: number; y: number }, { x: number; y: number }] = [
        { x: 3, y: 3 },
        { x: 7, y: 7 },
      ];
      expect(intersectsPathBounds(squarePath, bounds)).toBe(true);
    });
  });

  describe('path 점이 bounds 내부', () => {
    test('path vertex가 bounds 내부에 있으면 true를 반환한다', () => {
      // bounds가 path vertex (4,4)를 포함
      const bounds = { min: { x: 3, y: 3 }, max: { x: 5, y: 5 } };
      expect(intersectsPathBounds(squarePath, bounds)).toBe(true);
    });
  });

  describe('bounds가 path 내부에 포함', () => {
    test('bounds 전체가 closed path 내부에 있으면 true를 반환한다', () => {
      // bigSquarePath (0,0)-(10,10) 안에 bounds (2,2)-(6,6)
      const bounds = { min: { x: 2, y: 2 }, max: { x: 6, y: 6 } };
      expect(intersectsPathBounds(bigSquarePath, bounds)).toBe(true);
    });
  });

  describe('교차 miss', () => {
    test('bounds가 path와 완전히 떨어져 있으면 false를 반환한다', () => {
      const bounds = { min: { x: 20, y: 20 }, max: { x: 30, y: 30 } };
      expect(intersectsPathBounds(squarePath, bounds)).toBe(false);
    });

    test('inverted bounds(min > max)는 false를 반환한다', () => {
      const bounds = { min: { x: 10, y: 10 }, max: { x: 5, y: 5 } };
      expect(intersectsPathBounds(squarePath, bounds)).toBe(false);
    });

    test('open path 내부 가상 영역에 bounds가 있어도 edge 미접촉이면 false를 반환한다', () => {
      const bounds = { min: { x: 1, y: 1 }, max: { x: 3, y: 3 } };
      expect(intersectsPathBounds(squarePath, bounds)).toBe(false);
    });
  });

  describe('empty path', () => {
    test('empty path는 false를 반환한다', () => {
      const bounds = { min: { x: 0, y: 0 }, max: { x: 4, y: 4 } };
      expect(intersectsPathBounds([], bounds)).toBe(false);
    });
  });
});
