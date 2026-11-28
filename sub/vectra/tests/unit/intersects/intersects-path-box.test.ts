/**
 * path와 rect, bounds 사이의 boolean 교차 판정을 검증한다.
 */
import { describe, expect, expectTypeOf, test } from 'vitest';
import { intersectsPathBounds } from '../../../src/intersects/intersects-path-bounds';
import { intersectsPathRect } from '../../../src/intersects/intersects-path-rect';
import type { Bounds } from '../../../src/types/flat-shapes.internal';
import type { PathCommand, PathFlattenOptions } from '../../../src/types';
import { bigSquarePath, squareClosedPath, squarePath } from './_helpers/path-intersection-fixtures';

test('경로 교차의 bounds 입력과 flatten 옵션 필드를 고정한다', () => {
  expectTypeOf(intersectsPathBounds).parameter(1).toEqualTypeOf<Bounds>();
  expectTypeOf(intersectsPathBounds).parameter(2).toEqualTypeOf<PathFlattenOptions | undefined>();
});

test('flatten 오차에 따라 이차 경로의 bounds 교차 결과가 달라진다', () => {
  const path: PathCommand[] = [
    { kind: 'move', x: 0, y: 0 },
    { kind: 'quadratic', x1: 5, y1: 10, x: 10, y: 0 },
  ];
  const bounds = { minX: 4, minY: 4, maxX: 6, maxY: 6 };
  expect(intersectsPathBounds(path, bounds)).toBe(true);
  expect(intersectsPathBounds(path, bounds, { flatness: 0.25, maxRecursion: 8 })).toBe(true);
  expect(intersectsPathBounds(path, bounds, { flatness: 100, maxRecursion: 8 })).toBe(false);
});

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
      const bounds = { minX: 3, minY: 3, maxX: 7, maxY: 7 };
      expect(intersectsPathBounds(squarePath, bounds)).toBe(true);
    });
  });

  describe('path 점이 bounds 내부', () => {
    test('path vertex가 bounds 내부에 있으면 true를 반환한다', () => {
      // bounds가 path vertex (4,4)를 포함
      const bounds = { minX: 3, minY: 3, maxX: 5, maxY: 5 };
      expect(intersectsPathBounds(squarePath, bounds)).toBe(true);
    });
  });

  describe('bounds가 path 내부에 포함', () => {
    test('bounds 전체가 closed path 내부에 있으면 true를 반환한다', () => {
      // bigSquarePath (0,0)-(10,10) 안에 bounds (2,2)-(6,6)
      const bounds = { minX: 2, minY: 2, maxX: 6, maxY: 6 };
      expect(intersectsPathBounds(bigSquarePath, bounds)).toBe(true);
    });
  });

  describe('교차 miss', () => {
    test('bounds가 path와 완전히 떨어져 있으면 false를 반환한다', () => {
      const bounds = { minX: 20, minY: 20, maxX: 30, maxY: 30 };
      expect(intersectsPathBounds(squarePath, bounds)).toBe(false);
    });

    test('inverted bounds(min > max)는 false를 반환한다', () => {
      const bounds = { minX: 10, minY: 10, maxX: 5, maxY: 5 };
      expect(intersectsPathBounds(squarePath, bounds)).toBe(false);
    });

    test('open path 내부 가상 영역에 bounds가 있어도 edge 미접촉이면 false를 반환한다', () => {
      const bounds = { minX: 1, minY: 1, maxX: 3, maxY: 3 };
      expect(intersectsPathBounds(squarePath, bounds)).toBe(false);
    });
  });

  describe('empty path', () => {
    test('empty path는 false를 반환한다', () => {
      const bounds = { minX: 0, minY: 0, maxX: 4, maxY: 4 };
      expect(intersectsPathBounds([], bounds)).toBe(false);
    });
  });
});
